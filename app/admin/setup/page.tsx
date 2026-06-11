export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    missing:  'Please fill in all fields.',
    short:    'Password must be at least 8 characters.',
    mismatch: 'Passwords do not match.',
    failed:   'Something went wrong. Please try again.',
  };
  const errorMsg = error ? (errorMessages[error] ?? 'An error occurred.') : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div className="text-center mb-8">
          <img
            src="/bcc-logo.png"
            alt="BCC"
            style={{ height: 72, width: 72, objectFit: 'contain', margin: '0 auto 16px' }}
          />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>
            Create Admin Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">This form is only available when no admins exist yet.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {errorMsg}
          </div>
        )}

        <form action="/api/admin/setup" method="POST">
          <label className="block font-bold mb-1" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="input-field mb-4"
            placeholder="Josias Ngenda"
            autoFocus
            required
          />

          <label className="block font-bold mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field mb-4"
            placeholder="admin@example.com"
            required
          />

          <label className="block font-bold mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input-field mb-4"
            placeholder="At least 8 characters"
            required
          />

          <label className="block font-bold mb-1" htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className="input-field mb-6"
            placeholder="Repeat your password"
            required
          />

          <button type="submit" className="btn-primary">Create Account & Go to Login →</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <a href="/admin" style={{ color: 'var(--bcc-navy)', textDecoration: 'underline' }}>Sign in →</a>
        </p>
      </div>
    </div>
  );
}
