import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  res.cookies.delete('bcc_admin');
  return res;
}
