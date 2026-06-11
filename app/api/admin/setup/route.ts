import { NextRequest, NextResponse } from 'next/server';
import { createAdminServer, countAdminsServer } from '@/lib/admin-auth-server';

export const runtime = 'nodejs';

function r(url: URL) {
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const form   = await req.formData();
  const email    = (form.get('email')    as string ?? '').trim();
  const name     = (form.get('name')     as string ?? '').trim();
  const password = (form.get('password') as string ?? '').trim();
  const confirm  = (form.get('confirm')  as string ?? '').trim();

  if (!email || !name || !password)    return r(new URL('/admin/setup?error=missing',  origin));
  if (password.length < 8)             return r(new URL('/admin/setup?error=short',    origin));
  if (password !== confirm)            return r(new URL('/admin/setup?error=mismatch', origin));

  try {
    const count = await countAdminsServer();
    if (count > 0) return r(new URL('/admin', origin));   // already set up

    await createAdminServer(email, name, password);
    return r(new URL('/admin?setup=done', origin));
  } catch (err) {
    console.error('[setup]', err);
    return r(new URL('/admin/setup?error=failed', origin));
  }
}
