import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

// Use Node.js runtime — bcryptjs requires it
export const runtime = 'nodejs';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 8, // 8 hours
  path: '/',
};

function redirect(url: URL, status = 303) {
  return NextResponse.redirect(url, { status });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email    = (formData.get('email')    as string ?? '').trim();
  const password = (formData.get('password') as string ?? '').trim();
  const origin   = req.nextUrl.origin;

  if (!email || !password) {
    return redirect(new URL('/admin?error=1', origin));
  }

  try {
    const admin = await verifyAdmin(email, password);
    if (!admin) {
      return redirect(new URL('/admin?error=1', origin));
    }

    const res = redirect(new URL('/admin/dashboard', origin));
    // bcc_admin (httpOnly) — used by middleware for auth check
    res.cookies.set('bcc_admin', 'true', COOKIE_OPTS);
    // bcc_admin_name (readable by JS) — display only
    res.cookies.set('bcc_admin_name', admin.name, { ...COOKIE_OPTS, httpOnly: false });
    return res;
  } catch (err) {
    console.error('[admin/login] error:', err);
    return redirect(new URL('/admin?error=1', origin));
  }
}
