import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (req.cookies.get('bcc_admin')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admins = await getAllAdmins();
  return NextResponse.json(admins);
}
