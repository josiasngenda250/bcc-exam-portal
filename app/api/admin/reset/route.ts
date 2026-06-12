import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

async function deleteCollection(name: string): Promise<number> {
  let deleted = 0;
  // Firestore batches are capped at 500 — loop until collection is empty
  while (true) {
    const snap = await adminDb.collection(name).limit(400).get();
    if (snap.empty) break;
    const batch = adminDb.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.docs.length;
  }
  return deleted;
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { confirmation } = await req.json();
  if (confirmation !== 'RESET DATABASE') {
    return NextResponse.json({ error: 'confirmation_required' }, { status: 400 });
  }

  const [members, attempts, promotions] = await Promise.all([
    deleteCollection('members'),
    deleteCollection('attempts'),
    deleteCollection('promotions'),
  ]);

  return NextResponse.json({ ok: true, deleted: { members, attempts, promotions } });
}
