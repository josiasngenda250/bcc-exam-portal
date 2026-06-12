import Link from 'next/link';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; setup?: string }>;
}) {
  const { error, setup } = await searchParams;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-8">
          <img src="/bcc-logo.png" alt="BCC" style={{ height: 80, width: 80, objectFit: 'contain', margin: '0 auto 16px' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>
            Admin Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1">Bible Communication Center</p>
        </div>

        {setup === 'done' && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#dcfce7', color: '#166534' }}>
            ✅ Account created! Sign in below.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#fee2e2', color: '#991b1b' }}>
            Incorrect email or password. Please try again.
          </div>
        )}

        <form action="/api/admin/login" method="POST">
          <label className="block font-bold mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input-field mb-4"
            placeholder="you@example.com" autoFocus required />

          <label className="block font-bold mb-1" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input-field mb-5"
            placeholder="Your password" required />

          <button type="submit" className="btn-primary">Sign In →</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          First time?{' '}
          <Link href="/admin/setup" style={{ color: 'var(--bcc-navy)', textDecoration: 'underline' }}>
            Create your admin account →
          </Link>
        </p>
      </div>
    </div>
  );
}
