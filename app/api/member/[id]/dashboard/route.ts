import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [memberDoc, classesSnap, attemptsSnap] = await Promise.all([
      adminDb.collection('members').doc(id).get(),
      adminDb.collection('classes').get(),
      adminDb.collection('attempts').where('memberId', '==', id).get(),
    ]);

    if (!memberDoc.exists) {
      return NextResponse.json(null, { status: 404 });
    }

    const member = { id: memberDoc.id, ...memberDoc.data() };
    const classes = classesSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.order as number) ?? 0) - ((b.order as number) ?? 0)
      );
    const attempts = attemptsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((b.submittedAt as string) ?? '') > ((a.submittedAt as string) ?? '') ? 1 : -1
      );

    return NextResponse.json({ member, classes, attempts });
  } catch (err) {
    console.error('[member/dashboard]', err);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
