import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 8, // 8 hours
  path: '/',
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email    = (formData.get('email')    as string ?? '').trim();
  const password = (formData.get('password') as string ?? '').trim();
  const origin   = req.nextUrl.origin;

  if (!email || !password) {
    return NextResponse.redirect(new URL('/admin?error=1', origin));
  }

  const admin = await verifyAdmin(email, password);
  if (!admin) {
    return NextResponse.redirect(new URL('/admin?error=1', origin));
  }

  const res = NextResponse.redirect(new URL('/admin/dashboard', origin));
  // bcc_admin (httpOnly) — used by middleware for auth check
  res.cookies.set('bcc_admin', 'true', COOKIE_OPTS);
  // bcc_admin_name (readable by JS) — used for display only
  res.cookies.set('bcc_admin_name', admin.name, { ...COOKIE_OPTS, httpOnly: false });
  return res;
}
