import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      return NextResponse.json({ error: 'missing_name' }, { status: 400 });
    }

    const rawPhone = (data.phone ?? '').trim().replace(/\D/g, '');
    const payload: Record<string, unknown> = {
      firstName: data.firstName.trim(),
      lastName:  data.lastName.trim(),
      email:     (data.email ?? '').trim().toLowerCase(),
      phone:     rawPhone,
      language:  data.language,
      country:   (data.country ?? '').trim(),
      promotionType: data.promotionType ?? 'online',
      createdAt: new Date().toISOString(),
    };
    if (data.region)      payload.region      = data.region;
    if (data.province)    payload.province    = data.province;
    if (data.promotionId) payload.promotionId = data.promotionId;

    const ref = await adminDb.collection('members').add(payload);
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error('[member/register]', err);
    return NextResponse.json({ error: 'register_failed' }, { status: 500 });
  }
}
