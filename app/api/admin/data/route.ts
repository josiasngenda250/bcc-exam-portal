import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [classDocs, attemptDocs, memberDocs] = await Promise.all([
    adminDb.collection('classes').get(),
    adminDb.collection('attempts').orderBy('submittedAt', 'desc').get(),
    adminDb.collection('members').orderBy('createdAt', 'desc').get(),
  ]);

  const classes = classDocs.docs
    .map(d => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }))
    .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0));

  return NextResponse.json({
    classes,
    attempts: attemptDocs.docs.map(d => ({ id: d.id, ...d.data() })),
    members:  memberDocs.docs.map(d => ({ id: d.id, ...d.data() })),
  });
}
