import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [promotionDocs, memberDocs] = await Promise.all([
    adminDb.collection('promotions').get(),
    adminDb.collection('members').get(),
  ]);

  const memberCountByPromotion: Record<string, number> = {};
  for (const d of memberDocs.docs) {
    const pid = (d.data() as { promotionId?: string }).promotionId ?? '__none__';
    memberCountByPromotion[pid] = (memberCountByPromotion[pid] ?? 0) + 1;
  }

  const promotions = promotionDocs.docs
    .map(d => ({
      ...(d.data() as Record<string, unknown>),
      id: d.id,
      memberCount: memberCountByPromotion[d.id] ?? 0,
    } as Record<string, unknown> & { id: string }))
    .sort((a, b) => {
      const av = (a.createdAt as string) ?? '';
      const bv = (b.createdAt as string) ?? '';
      return bv < av ? -1 : bv > av ? 1 : 0;
    });

  return NextResponse.json({
    promotions,
    legacyCount: memberCountByPromotion['__none__'] ?? 0,
  });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, year, number, setActive } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'name_required' }, { status: 400 });

  const batch = adminDb.batch();

  if (setActive) {
    const existing = await adminDb.collection('promotions').get();
    for (const doc of existing.docs) {
      if ((doc.data() as { isActive?: boolean }).isActive) {
        batch.update(doc.ref, { isActive: false });
      }
    }
  }

  const newRef = adminDb.collection('promotions').doc();
  batch.set(newRef, {
    name: name.trim(),
    year:     year     ?? new Date().getFullYear(),
    number:   number   ?? 1,
    isActive: setActive ?? false,
    createdAt: new Date().toISOString(),
  });

  await batch.commit();
  return NextResponse.json({ id: newRef.id });
}
