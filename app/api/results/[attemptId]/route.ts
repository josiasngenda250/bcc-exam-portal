import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> },
) {
  try {
    const { attemptId } = await params;

    const attemptDoc = await adminDb.collection('attempts').doc(attemptId).get();
    if (!attemptDoc.exists) {
      return NextResponse.json(null, { status: 404 });
    }

    const attempt  = { id: attemptDoc.id, ...attemptDoc.data() };
    const classId  = (attempt as Record<string, unknown>).classId as string;

    const questionsSnap = await adminDb.collection('questions')
      .where('classId', '==', classId)
      .get();

    const questions = questionsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.index as number) ?? 0) - ((b.index as number) ?? 0)
      );

    return NextResponse.json({ attempt, questions });
  } catch (err) {
    console.error('[results]', err);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
