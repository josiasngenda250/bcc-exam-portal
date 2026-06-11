'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { countAdmins, createAdmin } from '@/lib/admin-auth';

export default function AdminSetupPage() {
  const router = useRouter();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [blocked,   setBlocked]   = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    countAdmins().then(n => {
      if (n > 0) setBlocked(true);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.'); return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      await createAdmin(email.trim(), name.trim(), password);
      router.push('/admin?setup=done');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-white text-lg">Checking…</p>
      </div>
    );
  }

  if (blocked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bcc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <p className="text-xl font-bold mb-3" style={{ color: 'var(--bcc-navy)' }}>Setup already complete</p>
          <p className="text-gray-500 mb-6">Admin accounts already exist. Please sign in normally.</p>
          <a href="/admin" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-500 text-sm mt-1">First-time setup — only works when no admins exist yet.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block font-bold mb-1" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="input-field mb-4"
            placeholder="Josias Ngenda"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />

          <label className="block font-bold mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field mb-4"
            placeholder="admin@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="block font-bold mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field mb-4"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <label className="block font-bold mb-1" htmlFor="confirmPw">Confirm Password</label>
          <input
            id="confirmPw"
            type="password"
            className="input-field mb-6"
            placeholder="Repeat your password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account & Go to Login →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <a href="/admin" style={{ color: 'var(--bcc-navy)', textDecoration: 'underline' }}>Sign in →</a>
        </p>
      </div>
    </div>
  );
}
