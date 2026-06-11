import { NextRequest, NextResponse } from 'next/server';
import { createAdmin, countAdmins } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;

  // Only allowed when no admins exist yet
  const count = await countAdmins();
  if (count > 0) {
    return NextResponse.redirect(new URL('/admin', origin));
  }

  const formData = await req.formData();
  const email    = (formData.get('email')    as string ?? '').trim();
  const name     = (formData.get('name')     as string ?? '').trim();
  const password = (formData.get('password') as string ?? '').trim();
  const confirm  = (formData.get('confirm')  as string ?? '').trim();

  if (!email || !name || !password) {
    return NextResponse.redirect(new URL('/admin/setup?error=missing', origin));
  }
  if (password.length < 8) {
    return NextResponse.redirect(new URL('/admin/setup?error=short', origin));
  }
  if (password !== confirm) {
    return NextResponse.redirect(new URL('/admin/setup?error=mismatch', origin));
  }

  try {
    await createAdmin(email, name, password);
    return NextResponse.redirect(new URL('/admin?setup=done', origin));
  } catch {
    return NextResponse.redirect(new URL('/admin/setup?error=failed', origin));
  }
}
