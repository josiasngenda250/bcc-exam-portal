import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await adminDb.collection('classes').get();
  const batch = adminDb.batch();
  let count = 0;
  snap.docs.forEach(d => {
    const data = d.data();
    if (!data.isOpenFor) {
      batch.update(d.ref, {
        isOpenFor: {
          in_person:   data.isOpen ?? false,
          online_east: data.isOpen ?? false,
          online_west: data.isOpen ?? false,
        },
      });
      count++;
    }
  });
  if (count > 0) await batch.commit();

  return NextResponse.json({ ok: true, migrated: count });
}
