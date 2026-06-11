export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#fee2e2', color: '#991b1b' }}>
            Incorrect password. Please try again.
          </div>
        )}

        <form action="/api/admin/login" method="POST">
          <label className="block font-bold mb-2" htmlFor="code">Admin Password</label>
          <input
            id="code"
            name="code"
            type="password"
            className="input-field mb-4"
            placeholder="Enter admin password"
            autoFocus
            required
          />
          <button type="submit" className="btn-primary">Sign In →</button>
        </form>
      </div>
    </div>
  );
}
