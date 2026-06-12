import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function requireAdmin(req: NextRequest) {
  return req.cookies.get('bcc_admin')?.value === 'true';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { classId } = await params;
  const { group, open } = await req.json();

  await adminDb.collection('classes').doc(classId).update({
    [`isOpenFor.${group}`]: open,
  });

  return NextResponse.json({ ok: true });
}
