import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function phoneVariants(raw: string): string[] {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  const noSpaces = trimmed.replace(/[\s\-().]/g, '');
  const variants = new Set<string>();
  if (digits) variants.add(digits);
  if (noSpaces) variants.add(noSpaces);
  if (digits.length === 10) {
    variants.add('+1' + digits);
    variants.add('1' + digits);
  }
  if (digits.length === 11 && digits[0] === '1') {
    const local = digits.slice(1);
    variants.add(local);
    variants.add('+' + digits);
    variants.add('+1' + local);
  }
  return [...variants].filter(v => v.length >= 7);
}

export async function POST(req: NextRequest) {
  try {
    const { contact } = await req.json();
    const val = (contact ?? '').trim();
    if (!val) return NextResponse.json(null);

    if (val.includes('@')) {
      const snap = await adminDb.collection('members')
        .where('email', '==', val.toLowerCase())
        .limit(1)
        .get();
      if (!snap.empty) {
        const d = snap.docs[0];
        return NextResponse.json({ id: d.id, ...d.data() });
      }
      return NextResponse.json(null);
    }

    // Phone — try all normalised forms
    for (const v of phoneVariants(val)) {
      const snap = await adminDb.collection('members')
        .where('phone', '==', v)
        .limit(1)
        .get();
      if (!snap.empty) {
        const d = snap.docs[0];
        return NextResponse.json({ id: d.id, ...d.data() });
      }
    }
    return NextResponse.json(null);
  } catch (err) {
    console.error('[member/lookup]', err);
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }
}
