import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  res.cookies.set('bcc_admin',      '', { maxAge: 0, path: '/' });
  res.cookies.set('bcc_admin_name', '', { maxAge: 0, path: '/' });
  return res;
}
