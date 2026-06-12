import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { classId } = await params;

  const [attemptDocs, memberDocs] = await Promise.all([
    adminDb.collection('attempts').where('classId', '==', classId).get(),
    adminDb.collection('members').get(),
  ]);

  const attempts = attemptDocs.docs
    .map(d => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }))
    .sort((a, b) => ((b.submittedAt as string) ?? '') < ((a.submittedAt as string) ?? '') ? -1 : 1);

  return NextResponse.json({
    attempts,
    members: memberDocs.docs.map(d => ({ id: d.id, ...d.data() })),
  });
}
