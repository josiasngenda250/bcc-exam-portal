import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('bcc_admin');
  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
