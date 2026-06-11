import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminServer, countAdminsServer } from '@/lib/admin-auth-server';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (req.cookies.get('bcc_admin')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const count = await countAdminsServer();
  if (count <= 1) {
    return NextResponse.json({ error: 'Cannot remove the last admin.' }, { status: 400 });
  }
  await deleteAdminServer(id);
  return NextResponse.json({ ok: true });
}
