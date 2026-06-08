import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import questionsData from '@/data/questions.json';

const CLASS_ORDER: Record<string, number> = {
  'CLASS 1': 1, 'CLASS 2': 2, 'CLASS 3A': 3, 'CLASS 3B': 4,
  'CLASS 4': 5, 'CLASS 5': 6, 'CLASS 6': 7, 'CLASS 7': 8,
};
const CLASS_ID: Record<string, string> = {
  'CLASS 1': 'class_1', 'CLASS 2': 'class_2', 'CLASS 3A': 'class_3a', 'CLASS 3B': 'class_3b',
  'CLASS 4': 'class_4', 'CLASS 5': 'class_5', 'CLASS 6': 'class_6', 'CLASS 7': 'class_7',
};

export async function POST() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('bcc_admin');
  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const log: string[] = [];
  const data = questionsData as Record<string, { max_score: Record<string, number>; questions: Record<string, { index: number; type: string; text: Record<string, string>; options: Record<string, string[]>; correct: Record<string, string> }> }>;

  try {
    for (const [className, classData] of Object.entries(data)) {
      const classId = CLASS_ID[className];
      if (!classId) { log.push(`Skipping unknown class: ${className}`); continue; }

      // Upsert class document
      await setDoc(doc(db, 'classes', classId), {
        id: classId,
        order: CLASS_ORDER[className],
        title: className.replace('CLASS ', 'Class '),
        isOpen: false,
        openedAt: null,
        closedAt: null,
        maxScore: {
          en: classData.max_score?.en ?? 0,
          fr: classData.max_score?.fr ?? 0,
          rw: classData.max_score?.rw ?? 0,
        },
      }, { merge: true });
      log.push(`✓ Class: ${className}`);

      // Upsert questions
      for (const [, q] of Object.entries(classData.questions)) {
        const qId = `${classId}_q${q.index}`;
        await setDoc(doc(db, 'questions', qId), {
          classId,
          index: q.index,
          type: q.type,
          text: q.text,
          options: q.options,
          correct: q.correct,
        }, { merge: true });
      }
      log.push(`  → ${Object.keys(classData.questions).length} questions seeded`);
    }

    log.push('');
    log.push('All done! Questions are ready.');
    return NextResponse.json({ ok: true, log });
  } catch (e: unknown) {
    log.push(`Error: ${String(e)}`);
    return NextResponse.json({ ok: false, error: String(e), log }, { status: 500 });
  }
}
