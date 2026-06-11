import { NextRequest, NextResponse } from 'next/server';
import { createAdminServer } from '@/lib/admin-auth-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (req.cookies.get('bcc_admin')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { email, name, password } = await req.json() as {
    email: string; name: string; password: string;
  };
  if (!email?.trim() || !name?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  try {
    const id = await createAdminServer(email, name, password);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'Failed to create admin.' }, { status: 500 });
  }
}
