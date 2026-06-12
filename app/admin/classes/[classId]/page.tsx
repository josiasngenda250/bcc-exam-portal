'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import type { Attempt, Member } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

export default function ClassRosterPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'en' | 'fr' | 'rw'>('all');

  useEffect(() => {
    fetch(`/api/admin/classes/${classId}`)
      .then(r => r.json())
      .then(({ attempts: att, members: mem }) => { setAttempts(att); setMembers(mem); })
      .finally(() => setLoading(false));
  }, [classId]);

  const memberMap = new Map(members.map(m => [m.id, m]));

  // Best attempt per member
  const bestPerMember = new Map<string, Attempt>();
  for (const att of attempts) {
    const existing = bestPerMember.get(att.memberId);
    if (!existing || att.score > existing.score) bestPerMember.set(att.memberId, att);
  }

  const rows = Array.from(bestPerMember.values()).filter(a => filter === 'all' || a.language === filter);
  const passed = rows.filter(a => Math.round((a.score / a.maxScore) * 100) >= 60).length;

  function exportCSV() {
    const lines = ['Name,Email,Phone,Country,Language,Best Score,Max Score,%,Passed,Attempts,Last Submitted'];
    for (const a of rows) {
      const m = memberMap.get(a.memberId);
      const attCount = attempts.filter(x => x.memberId === a.memberId).length;
      const pct = Math.round((a.score / a.maxScore) * 100);
      lines.push([
        a.memberName, m?.email ?? '', m?.phone ?? '', a.memberCountry,
        a.language.toUpperCase(), a.score, a.maxScore, `${pct}%`,
        pct >= 60 ? 'Yes' : 'No', attCount,
        new Date(a.submittedAt).toLocaleDateString('en-CA'),
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${classId}-roster.csv`; a.click();
  }

  if (loading) {
    return (
      <div className="page-container">
        <AdminHeader title="Class Roster" />
        <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <AdminHeader title={CLASS_LABELS[classId] ?? classId} />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
              {CLASS_LABELS[classId] ?? classId} — Roster
            </h1>
            <p className="text-gray-500">
              {rows.length} participants · {passed} passed ({rows.length ? Math.round((passed / rows.length) * 100) : 0}%)
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'en', 'fr', 'rw'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-lg text-sm font-bold border-2"
                style={{
                  borderColor: filter === f ? 'var(--bcc-navy)' : '#d1d5db',
                  background: filter === f ? 'var(--bcc-navy)' : 'white',
                  color: filter === f ? 'white' : 'var(--bcc-navy)',
                }}
              >
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
            <button onClick={exportCSV} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Language</th>
                <th>Best Score</th>
                <th>%</th>
                <th>Result</th>
                <th>Attempts</th>
                <th>Last Submitted</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-8">No submissions yet</td></tr>
              ) : rows.map(a => {
                const attCount = attempts.filter(x => x.memberId === a.memberId).length;
                const pct = Math.round((a.score / a.maxScore) * 100);
                return (
                  <tr key={a.memberId}>
                    <td className="font-medium">{a.memberName}</td>
                    <td>{a.memberCountry}</td>
                    <td>{a.language.toUpperCase()}</td>
                    <td className="font-bold">{a.score}/{a.maxScore}</td>
                    <td>{pct}%</td>
                    <td><span className={pct >= 60 ? 'badge-pass' : 'badge-fail'}>{pct >= 60 ? 'Passed' : 'Failed'}</span></td>
                    <td>{attCount}</td>
                    <td className="text-sm text-gray-500">{new Date(a.submittedAt).toLocaleDateString('en-CA')}</td>
                    <td>
                      <Link href={`/admin/members/${a.memberId}`} className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
