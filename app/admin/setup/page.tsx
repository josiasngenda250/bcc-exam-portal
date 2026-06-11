'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { countAdmins, createAdmin } from '@/lib/admin-auth';

export default function AdminSetupPage() {
  const router = useRouter();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

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
      // Check if admins already exist at submit time (not at page load)
      const count = await countAdmins();
      if (count > 0) {
        setError('Admin accounts already exist. Please sign in instead.');
        setLoading(false);
        return;
      }
      await createAdmin(email.trim(), name.trim(), password);
      router.push('/admin?setup=done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('permission') || msg.includes('PERMISSION')) {
        setError(
          'Firestore permission denied. Go to Firebase Console → Firestore → Rules and make sure the admins collection is allowed. See instructions below.'
        );
      } else {
        setError('Something went wrong. Please try again. (' + msg + ')');
      }
      setLoading(false);
    }
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
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block font-bold mb-1" htmlFor="name">Full Name</label>
          <input
            id="name" type="text" className="input-field mb-4"
            placeholder="Josias Ngenda"
            value={name} onChange={e => setName(e.target.value)}
            autoFocus required
          />

          <label className="block font-bold mb-1" htmlFor="email">Email</label>
          <input
            id="email" type="email" className="input-field mb-4"
            placeholder="admin@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="block font-bold mb-1" htmlFor="password">Password</label>
          <input
            id="password" type="password" className="input-field mb-4"
            placeholder="At least 8 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            required
          />

          <label className="block font-bold mb-1" htmlFor="confirmPw">Confirm Password</label>
          <input
            id="confirmPw" type="password" className="input-field mb-6"
            placeholder="Repeat your password"
            value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
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
