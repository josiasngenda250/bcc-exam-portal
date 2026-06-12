'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import type { Member, Attempt, BccClass } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'C1', class_2: 'C2', class_3a: 'C3A', class_3b: 'C3B',
  class_4: 'C4', class_5: 'C5', class_6: 'C6', class_7: 'C7',
};

export default function GraduatesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [classes, setClasses] = useState<BccClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data')
      .then(r => r.json())
      .then(({ members: m, attempts: a, classes: c }) => { setMembers(m); setAttempts(a); setClasses(c); })
      .finally(() => setLoading(false));
  }, []);

  function getBest(memberId: string, classId: string): Attempt | null {
    const all = attempts.filter(a => a.memberId === memberId && a.classId === classId);
    if (!all.length) return null;
    return all.reduce((b, a) => (a.score > b.score ? a : b), all[0]);
  }

  function hasPassed(memberId: string, classId: string): boolean {
    const b = getBest(memberId, classId);
    return !!b && Math.round((b.score / b.maxScore) * 100) >= 60;
  }

  const membersWithProgress = members.map(m => ({
    member: m,
    classResults: classes.map(c => ({ classId: c.id, best: getBest(m.id, c.id), passed: hasPassed(m.id, c.id) })),
  })).filter(x => x.classResults.some(r => r.best));

  const graduates = membersWithProgress.filter(x => x.classResults.every(r => r.passed));
  const inProgress = membersWithProgress.filter(x => !x.classResults.every(r => r.passed));

  function exportCSV(rows: typeof membersWithProgress) {
    const header = ['Name', 'Email', 'Phone', 'Country', 'Language', ...classes.map(c => CLASS_LABELS[c.id])].join(',');
    const lines = rows.map(({ member: m, classResults: cr }) =>
      [m.firstName + ' ' + m.lastName, m.email, m.phone, m.country, m.language?.toUpperCase(),
        ...cr.map(r => r.best ? `${r.best.score}/${r.best.maxScore}` : '—')].join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bcc-graduates.csv'; a.click();
  }

  if (loading) return (
    <div className="page-container">
      <AdminHeader title="Graduates" />
      <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
    </div>
  );

  return (
    <div className="page-container">
      <AdminHeader title="Graduates Report" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>

        <div className="flex gap-4 flex-wrap mb-6">
          <div className="card flex-1 text-center" style={{ minWidth: 160 }}>
            <div className="text-4xl font-bold" style={{ color: '#16a34a', fontFamily: 'Georgia, serif' }}>{graduates.length}</div>
            <div className="text-sm text-gray-500 mt-1">Graduates (all 8 passed)</div>
          </div>
          <div className="card flex-1 text-center" style={{ minWidth: 160 }}>
            <div className="text-4xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>{inProgress.length}</div>
            <div className="text-sm text-gray-500 mt-1">In Progress</div>
          </div>
          <div className="card flex-1 text-center" style={{ minWidth: 160 }}>
            <div className="text-4xl font-bold" style={{ color: 'var(--bcc-red)', fontFamily: 'Georgia, serif' }}>{members.length - membersWithProgress.length}</div>
            <div className="text-sm text-gray-500 mt-1">Not Started</div>
          </div>
        </div>

        {/* Graduates table */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
            Graduates — {graduates.length} member{graduates.length !== 1 ? 's' : ''}
          </h2>
          <button onClick={() => exportCSV(graduates)} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
            Export CSV
          </button>
        </div>

        <div className="card overflow-x-auto mb-8">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Lang</th>
                {classes.map(c => <th key={c.id}>{CLASS_LABELS[c.id]}</th>)}
              </tr>
            </thead>
            <tbody>
              {graduates.length === 0 ? (
                <tr><td colSpan={3 + classes.length} className="text-center text-gray-400 py-8">No graduates yet</td></tr>
              ) : graduates.map(({ member: m, classResults: cr }) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/admin/members/${m.id}`} className="font-medium underline" style={{ color: 'var(--bcc-navy)' }}>
                      {m.firstName} {m.lastName}
                    </Link>
                  </td>
                  <td>{m.country}</td>
                  <td>{m.language?.toUpperCase()}</td>
                  {cr.map(r => (
                    <td key={r.classId} className="text-center">
                      {r.best ? (
                        <span style={{ color: r.passed ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                          {r.best.score}/{r.best.maxScore}
                        </span>
                      ) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* In progress table */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>In Progress</h2>
          <button onClick={() => exportCSV(membersWithProgress)} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
            Export All
          </button>
        </div>
        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Lang</th>
                {classes.map(c => <th key={c.id}>{CLASS_LABELS[c.id]}</th>)}
              </tr>
            </thead>
            <tbody>
              {inProgress.map(({ member: m, classResults: cr }) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/admin/members/${m.id}`} className="font-medium underline" style={{ color: 'var(--bcc-navy)' }}>
                      {m.firstName} {m.lastName}
                    </Link>
                  </td>
                  <td>{m.country}</td>
                  <td>{m.language?.toUpperCase()}</td>
                  {cr.map(r => (
                    <td key={r.classId} className="text-center text-sm">
                      {r.best ? (
                        <span style={{ color: r.passed ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                          {r.best.score}/{r.best.maxScore}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Link href="/admin/dashboard" className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
