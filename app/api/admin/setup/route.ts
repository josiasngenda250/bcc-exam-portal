import { NextRequest, NextResponse } from 'next/server';
import { createAdmin, countAdmins } from '@/lib/admin-auth';

// Use Node.js runtime — bcryptjs requires it
export const runtime = 'nodejs';

function redirect(url: URL) {
  // 303 See Other: browser follows redirect as GET (correct PRG pattern for forms)
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;

  try {
    // Only allowed when no admins exist yet
    const count = await countAdmins();
    if (count > 0) {
      return redirect(new URL('/admin', origin));
    }

    const formData = await req.formData();
    const email    = (formData.get('email')    as string ?? '').trim();
    const name     = (formData.get('name')     as string ?? '').trim();
    const password = (formData.get('password') as string ?? '').trim();
    const confirm  = (formData.get('confirm')  as string ?? '').trim();

    if (!email || !name || !password) {
      return redirect(new URL('/admin/setup?error=missing', origin));
    }
    if (password.length < 8) {
      return redirect(new URL('/admin/setup?error=short', origin));
    }
    if (password !== confirm) {
      return redirect(new URL('/admin/setup?error=mismatch', origin));
    }

    await createAdmin(email, name, password);
    return redirect(new URL('/admin?setup=done', origin));
  } catch (err) {
    console.error('[admin/setup] error:', err);
    return redirect(new URL('/admin/setup?error=failed', origin));
  }
}
