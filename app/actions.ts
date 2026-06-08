'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function adminLogin(formData: FormData) {
  const code = formData.get('code') as string;
  if (code === process.env.ADMIN_CODE) {
    const cookieStore = await cookies();
    cookieStore.set('bcc_admin', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    redirect('/admin/dashboard');
  }
  redirect('/admin?error=1');
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('bcc_admin');
  redirect('/admin');
}
