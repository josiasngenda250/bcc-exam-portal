'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyAdmin } from '@/lib/admin-auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(searchParams.get('error') === '1');
  const [setupMsg, setSetupMsg] = useState(searchParams.get('setup') === 'done');

  // Dismiss success banner after 4 s
  useEffect(() => {
    if (setupMsg) {
      const t = setTimeout(() => setSetupMsg(false), 4000);
      return () => clearTimeout(t);
    }
  }, [setupMsg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const admin = await verifyAdmin(email.trim(), password.trim());

      if (!admin) {
        setError(true);
        setLoading(false);
        return;
      }

      // Set session cookies from the browser — avoids all serverless issues
      const maxAge = 60 * 60 * 8; // 8 hours
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `bcc_admin=true; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
      document.cookie = `bcc_admin_name=${encodeURIComponent(admin.name)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

      router.push('/admin/dashboard');
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-8">
          <img
            src="/bcc-logo.png"
            alt="BCC"
            style={{ height: 80, width: 80, objectFit: 'contain', margin: '0 auto 16px' }}
          />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>
            Admin Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Bible Communication Center</p>
        </div>

        {setupMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#dcfce7', color: '#166534' }}>
            ✅ Admin account created! Sign in below.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#fee2e2', color: '#991b1b' }}>
            Incorrect email or password. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block font-bold mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field mb-4"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            required
          />
          <label className="block font-bold mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input-field mb-5"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          First time?{' '}
          <a href="/admin/setup" style={{ color: 'var(--bcc-navy)', textDecoration: 'underline' }}>
            Create your admin account →
          </a>
        </p>
      </div>
    </div>
  );
}

// useSearchParams needs Suspense
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-white">Loading…</p>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
