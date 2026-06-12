import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET() {
  const docs = await adminDb.collection('promotions').get();
  const active = docs.docs
    .map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) } as Record<string, unknown> & { id: string }))
    .find(p => p.isActive === true);

  if (!active) return NextResponse.json({ promotion: null });
  return NextResponse.json({ promotion: { id: active.id, name: active.name as string } });
}
