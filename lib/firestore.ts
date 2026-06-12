import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, writeBatch,
  query, where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Member, BccClass, Question, Attempt, Language, GroupId } from './types';

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), ms)
    ),
  ]);
}

function sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key] as unknown as string | number;
    const bv = b[key] as unknown as string | number;
    return dir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });
}

// ── Members ────────────────────────────────────────────────────────────────

/**
 * Returns all plausible normalized forms of a phone number so we can match
 * regardless of whether the user typed spaces, dashes, +1, 1, or nothing.
 * Examples: "+1 613 555 0000", "613-555-0000", "6135550000" all match each other.
 */
function phoneVariants(raw: string): string[] {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, ''); // strip everything non-digit
  const noSpaces = trimmed.replace(/[\s\-().]/g, ''); // strip spaces/dashes/parens, keep +

  const variants = new Set<string>();
  if (digits) variants.add(digits);
  if (noSpaces) variants.add(noSpaces);

  // North-American 10-digit number (no country code)
  if (digits.length === 10) {
    variants.add('+1' + digits);
    variants.add('1' + digits);
  }
  // 11-digit starting with 1 (has country code but no +)
  if (digits.length === 11 && digits[0] === '1') {
    const local = digits.slice(1);
    variants.add(local);
    variants.add('+' + digits);
    variants.add('+1' + local);
  }

  return [...variants].filter(v => v.length >= 7);
}

export async function findMemberByContact(contact: string): Promise<Member | null> {
  const val = contact.trim();
  const isEmail = val.includes('@');

  if (isEmail) {
    const snap = await withTimeout(
      getDocs(query(collection(db, 'members'), where('email', '==', val.toLowerCase())))
    );
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() } as Member;
    return null;
  }

  // Phone: try all normalizations in parallel
  const variants = phoneVariants(val);
  const snaps = await withTimeout(
    Promise.all(variants.map(v => getDocs(query(collection(db, 'members'), where('phone', '==', v)))))
  );
  for (const snap of snaps) {
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() } as Member;
  }
  return null;
}

export async function createMember(data: Omit<Member, 'id' | 'createdAt'>): Promise<string> {
  const rawPhone = (data.phone ?? '').trim().replace(/\D/g, '');
  const payload: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: (data.email ?? '').trim().toLowerCase(),
    phone: rawPhone,
    language: data.language,
    country: data.country,
    promotionType: data.promotionType ?? 'online',
    createdAt: new Date().toISOString(),
  };
  if (data.region)   payload.region   = data.region;
  if (data.province) payload.province = data.province;
  const ref = await withTimeout(addDoc(collection(db, 'members'), payload), 15000);
  return ref.id;
}

export async function getMember(memberId: string): Promise<Member | null> {
  const snap = await getDoc(doc(db, 'members', memberId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Member;
}

export async function getAllMembers(): Promise<Member[]> {
  const snap = await getDocs(collection(db, 'members'));
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Member)), 'createdAt', 'desc');
}

// ── Classes ────────────────────────────────────────────────────────────────

export async function getAllClasses(): Promise<BccClass[]> {
  const snap = await getDocs(collection(db, 'classes'));
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as BccClass)), 'order', 'asc');
}

export async function getClass(classId: string): Promise<BccClass | null> {
  const snap = await getDoc(doc(db, 'classes', classId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BccClass;
}

/** Toggle a class open/closed for one specific group. */
export async function setClassOpenForGroup(
  classId: string,
  group: GroupId,
  open: boolean,
): Promise<void> {
  await withTimeout(updateDoc(doc(db, 'classes', classId), {
    [`isOpenFor.${group}`]: open,
  }), 15000);
}

/**
 * One-time migration: converts all class documents from the legacy
 * isOpen:boolean schema to isOpenFor:{in_person,online_east,online_west}.
 * Safe to call multiple times (skips classes already migrated).
 */
export async function migrateClassSchema(): Promise<void> {
  const snap = await getDocs(collection(db, 'classes'));
  const batch = writeBatch(db);
  let count = 0;
  snap.docs.forEach(d => {
    const data = d.data();
    if (!data.isOpenFor) {
      batch.update(doc(db, 'classes', d.id), {
        isOpenFor: {
          in_person:   data.isOpen ?? false,
          online_east: data.isOpen ?? false,
          online_west: data.isOpen ?? false,
        },
      });
      count++;
    }
  });
  if (count > 0) await batch.commit();
}

// ── Questions ──────────────────────────────────────────────────────────────

export async function getQuestions(classId: string): Promise<Question[]> {
  const q = query(collection(db, 'questions'), where('classId', '==', classId));
  const snap = await getDocs(q);
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)), 'index', 'asc');
}

// ── Attempts ───────────────────────────────────────────────────────────────

export async function getMemberAttempts(memberId: string): Promise<Attempt[]> {
  const q = query(collection(db, 'attempts'), where('memberId', '==', memberId));
  const snap = await getDocs(q);
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attempt)), 'submittedAt', 'desc');
}

export async function getMemberClassAttempts(memberId: string, classId: string): Promise<Attempt[]> {
  const q = query(
    collection(db, 'attempts'),
    where('memberId', '==', memberId),
    where('classId', '==', classId),
  );
  const snap = await getDocs(q);
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attempt)), 'submittedAt', 'desc');
}

export async function getClassAttempts(classId: string): Promise<Attempt[]> {
  const q = query(collection(db, 'attempts'), where('classId', '==', classId));
  const snap = await getDocs(q);
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attempt)), 'submittedAt', 'desc');
}

export async function getAllAttempts(): Promise<Attempt[]> {
  const snap = await getDocs(collection(db, 'attempts'));
  return sortBy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Attempt)), 'submittedAt', 'desc');
}

export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  const snap = await getDoc(doc(db, 'attempts', attemptId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Attempt;
}

export async function saveAttempt(attempt: Omit<Attempt, 'id'>): Promise<string> {
  const ref = await withTimeout(addDoc(collection(db, 'attempts'), attempt), 15000);
  return ref.id;
}

export function scoreAttempt(
  questions: Question[],
  answers: Record<string, number>,
  language: Language,
): number {
  let score = 0;
  for (const question of questions) {
    const optionIndex = answers[String(question.index)];
    if (optionIndex === undefined || optionIndex === null) continue;
    const opts = question.options[language];
    if (!opts || optionIndex >= opts.length) continue;
    const selected = opts[optionIndex];
    if (selected === question.correct[language]) score++;
  }
  return score;
}
