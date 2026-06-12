'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/Header';

export default function ResetPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<{ members: number; attempts: number; promotions: number } | null>(null);
  const [error, setError] = useState('');

  const confirmed = input === 'RESET DATABASE';

  async function handleReset() {
    if (!confirmed) return;
    setResetting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'RESET DATABASE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reset failed');
      setResult(data.deleted);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setResetting(false);
    }
  }

  if (result) {
    return (
      <div className="page-container">
        <AdminHeader title="Reset Complete" />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
          <div className="card text-center" style={{ borderLeft: '5px solid #16a34a' }}>
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#16a34a' }}>Database Cleared</h2>
            <p className="text-gray-500 mb-6">The following records have been permanently deleted:</p>
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              {[
                { label: 'Members',    value: result.members    },
                { label: 'Attempts',   value: result.attempts   },
                { label: 'Promotions', value: result.promotions },
              ].map(s => (
                <div key={s.label} className="text-center px-6 py-3 rounded-xl" style={{ background: '#f8fafc' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Classes, questions, and admin accounts were not affected.
            </p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="btn-primary"
              style={{ width: 'auto' }}
            >
              Back to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <AdminHeader title="Reset Database" />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>

        {/* Warning card */}
        <div className="card mb-6" style={{ borderLeft: '5px solid #dc2626', background: '#fff5f5' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#dc2626' }}>⚠️ Danger Zone</h2>
          <p className="text-gray-700 mb-3">
            This will permanently delete <strong>all member accounts, exam submissions, and promotions</strong>.
            This action <strong>cannot be undone</strong>.
          </p>
          <div className="text-sm text-gray-600">
            <p className="font-bold mb-1">Will be deleted:</p>
            <ul className="list-disc list-inside mb-3 space-y-0.5">
              <li>All registered members</li>
              <li>All exam attempts and scores</li>
              <li>All promotions</li>
            </ul>
            <p className="font-bold mb-1">Will NOT be deleted:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Admin accounts</li>
              <li>Class definitions</li>
              <li>Exam questions</li>
            </ul>
          </div>
        </div>

        {/* Confirmation form */}
        <div className="card">
          <p className="font-bold mb-3">
            Type <span
              className="px-2 py-0.5 rounded font-mono text-sm"
              style={{ background: '#fee2e2', color: '#dc2626' }}
            >RESET DATABASE</span> to confirm:
          </p>
          <input
            type="text"
            className="input-field mb-4"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="RESET DATABASE"
            autoComplete="off"
            spellCheck={false}
          />

          {error && (
            <p className="text-red-600 text-sm mb-3">{error}</p>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/dashboard"
              className="btn-outline flex-1"
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              onClick={handleReset}
              disabled={!confirmed || resetting}
              className="flex-1 py-3 rounded-xl font-bold text-white border-2 transition-all"
              style={{
                background:  confirmed ? '#dc2626' : '#fca5a5',
                borderColor: confirmed ? '#dc2626' : '#fca5a5',
                cursor: confirmed ? 'pointer' : 'not-allowed',
              }}
            >
              {resetting ? 'Resetting…' : 'Reset All Data'}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <Link href="/admin/dashboard" className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
