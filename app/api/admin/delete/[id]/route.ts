import { NextRequest, NextResponse } from 'next/server';
import { deleteAdmin, countAdmins } from '@/lib/admin-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (req.cookies.get('bcc_admin')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const count = await countAdmins();
  if (count <= 1) {
    return NextResponse.json(
      { error: 'Cannot remove the last admin account.' },
      { status: 400 },
    );
  }

  await deleteAdmin(id);
  return NextResponse.json({ ok: true });
}
