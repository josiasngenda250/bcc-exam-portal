import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const code = formData.get('code') as string;

  const origin = req.nextUrl.origin;

  if (code === process.env.ADMIN_CODE) {
    const res = NextResponse.redirect(new URL('/admin/dashboard', origin));
    res.cookies.set('bcc_admin', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    return res;
  }

  return NextResponse.redirect(new URL('/admin?error=1', origin));
}
