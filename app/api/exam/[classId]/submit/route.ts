import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { scoreAttempt } from '@/lib/scoring';
import type { Question, Language } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params;
    const { memberId, language, answers } = await req.json();

    if (!memberId || !language || !answers) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const [memberDoc, classDoc, questionsSnap, prevAttemptsSnap] = await Promise.all([
      adminDb.collection('members').doc(memberId).get(),
      adminDb.collection('classes').doc(classId).get(),
      adminDb.collection('questions').where('classId', '==', classId).get(),
      adminDb.collection('attempts')
        .where('memberId', '==', memberId)
        .where('classId', '==', classId)
        .get(),
    ]);

    if (!memberDoc.exists || !classDoc.exists) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const member  = memberDoc.data()!;
    const cls     = classDoc.data()!;
    const questions = questionsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.index as number) ?? 0) - ((b.index as number) ?? 0)
      ) as unknown as Question[];

    const score       = scoreAttempt(questions, answers, language as Language);
    const maxScore    = (cls.maxScore as Record<string, number>)[language] ?? questions.length;
    const attemptNumber = prevAttemptsSnap.size + 1;

    const attempt = {
      memberId,
      memberName:    `${member.firstName} ${member.lastName}`,
      memberEmail:   member.email ?? '',
      memberPhone:   member.phone ?? '',
      memberCountry: member.country ?? '',
      classId,
      language,
      answers,
      score,
      maxScore,
      submittedAt: new Date().toISOString(),
      attemptNumber,
    };

    const ref = await adminDb.collection('attempts').add(attempt);
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('[exam/submit]', err);
    return NextResponse.json({ error: 'submit_failed' }, { status: 500 });
  }
}
