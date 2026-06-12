import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const all = await adminDb.collection('promotions').get();
  const batch = adminDb.batch();

  for (const doc of all.docs) {
    batch.update(doc.ref, { isActive: false });
  }
  batch.update(adminDb.collection('promotions').doc(id), { isActive: true });

  await batch.commit();
  return NextResponse.json({ ok: true });
}
