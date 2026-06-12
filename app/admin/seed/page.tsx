'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  async function handleSeed() {
    setStatus('running');
    setLog(['Starting seed…']);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setLog(data.log ?? ['Done']);
        setStatus('done');
      } else {
        setLog([data.error ?? 'Unknown error']);
        setStatus('error');
      }
    } catch (e: unknown) {
      setLog([String(e)]);
      setStatus('error');
    }
  }

  return (
    <div className="page-container">
      <AdminHeader title="Initialize Questions" />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
        <div className="card">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--bcc-navy)' }}>Initialize Exam Questions</h1>
          <p className="text-gray-600 mb-6">
            This will load all BCC exam questions (Classes 1–7, in English, French, and Kinyarwanda) into the database.
            It is safe to run multiple times — it will overwrite existing questions.
          </p>

          {status !== 'done' && (
            <button
              onClick={handleSeed}
              className="btn-primary mb-6"
              disabled={status === 'running'}
            >
              {status === 'running' ? 'Seeding… please wait' : 'Seed All Questions'}
            </button>
          )}

          {status === 'done' && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: '#dcfce7', color: '#166534' }}>
              ✓ Questions seeded successfully! <Link href="/admin/dashboard" className="underline font-bold ml-2">Go to Dashboard</Link>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Error seeding questions. Check the log below.
            </div>
          )}

          {log.length > 0 && (
            <div className="rounded-lg p-4 font-mono text-sm overflow-y-auto" style={{ background: '#1e293b', color: '#94a3b8', maxHeight: 400 }}>
              {log.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
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
