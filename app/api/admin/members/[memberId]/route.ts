import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { memberId } = await params;

  const [memberDoc, classDocs, attemptDocs] = await Promise.all([
    adminDb.collection('members').doc(memberId).get(),
    adminDb.collection('classes').get(),
    adminDb.collection('attempts').where('memberId', '==', memberId).orderBy('submittedAt', 'desc').get(),
  ]);

  if (!memberDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const classes = classDocs.docs
    .map(d => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }))
    .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));

  return NextResponse.json({
    member:   { id: memberDoc.id, ...memberDoc.data() },
    classes,
    attempts: attemptDocs.docs.map(d => ({ id: d.id, ...d.data() })),
  });
}
