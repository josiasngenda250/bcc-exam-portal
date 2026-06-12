import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { classId } = await params;
    const memberId = req.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    const [memberDoc, classDoc, questionsSnap] = await Promise.all([
      adminDb.collection('members').doc(memberId).get(),
      adminDb.collection('classes').doc(classId).get(),
      adminDb.collection('questions').where('classId', '==', classId).get(),
    ]);

    if (!memberDoc.exists) {
      return NextResponse.json({ error: 'member_not_found' }, { status: 404 });
    }
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'class_not_found' }, { status: 404 });
    }

    const member = { id: memberDoc.id, ...memberDoc.data() };
    const cls    = { id: classDoc.id,  ...classDoc.data() };
    const questions = questionsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.index as number) ?? 0) - ((b.index as number) ?? 0)
      );

    return NextResponse.json({ member, cls, questions });
  } catch (err) {
    console.error('[exam/load]', err);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
