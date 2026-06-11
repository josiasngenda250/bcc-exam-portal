import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // First-admin setup is always accessible — the API self-guards by checking admin count
  if (request.nextUrl.pathname === '/admin/setup') {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get('bcc_admin')?.value === 'true';
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+'],
};
