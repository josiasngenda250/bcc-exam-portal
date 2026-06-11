import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminServer } from '@/lib/admin-auth-server';

export const runtime = 'nodejs';

const COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 8,
  path: '/',
};

function r(url: URL) {
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const form   = await req.formData();
  const email  = (form.get('email')    as string ?? '').trim();
  const pass   = (form.get('password') as string ?? '').trim();

  if (!email || !pass) return r(new URL('/admin?error=1', origin));

  try {
    const admin = await verifyAdminServer(email, pass);
    if (!admin) return r(new URL('/admin?error=1', origin));

    const res = r(new URL('/admin/dashboard', origin));
    res.cookies.set('bcc_admin',      'true',       COOKIE);
    res.cookies.set('bcc_admin_name', admin.name, { ...COOKIE, httpOnly: false });
    return res;
  } catch (err) {
    console.error('[login]', err);
    return r(new URL('/admin?error=1', origin));
  }
}
