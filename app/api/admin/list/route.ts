import { NextRequest, NextResponse } from 'next/server';
import { getAllAdminsServer } from '@/lib/admin-auth-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (req.cookies.get('bcc_admin')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admins = await getAllAdminsServer();
  return NextResponse.json(admins);
}
