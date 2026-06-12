import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

function byField(field: string, dir: 'asc' | 'desc' = 'asc') {
  return (a: Record<string, unknown>, b: Record<string, unknown>) => {
    const av = (a[field] ?? '') as string | number;
    const bv = (b[field] ?? '') as string | number;
    return dir === 'asc'
      ? av < bv ? -1 : av > bv ? 1 : 0
      : bv < av ? -1 : bv > av ? 1 : 0;
  };
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [classDocs, attemptDocs, memberDocs] = await Promise.all([
    adminDb.collection('classes').get(),
    adminDb.collection('attempts').get(),
    adminDb.collection('members').get(),
  ]);

  const classes  = classDocs.docs.map(d => ({ id: d.id, ...d.data() })).sort(byField('order', 'asc'));
  const attempts = attemptDocs.docs.map(d => ({ id: d.id, ...d.data() })).sort(byField('submittedAt', 'desc'));
  const members  = memberDocs.docs.map(d => ({ id: d.id, ...d.data() })).sort(byField('createdAt', 'desc'));

  return NextResponse.json({ classes, attempts, members });
}
