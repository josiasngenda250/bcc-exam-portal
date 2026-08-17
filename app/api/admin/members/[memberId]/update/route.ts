import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { memberId } = await params;
  const body = await req.json();

  // Only allow updating safe group-related fields
  const allowed = ['promotionType', 'region', 'province', 'language'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key] ?? null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 });
  }

  await adminDb.collection('members').doc(memberId).update(update);
  return NextResponse.json({ ok: true });
}
