'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import { getMemberGroup } from '@/lib/types';
import type { Member, Attempt, BccClass, GroupId, Promotion } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'C1', class_2: 'C2', class_3a: 'C3A', class_3b: 'C3B',
  class_4: 'C4', class_5: 'C5', class_6: 'C6', class_7: 'C7',
};

const GROUP_LABELS: Record<GroupId, string> = {
  in_person:   '🏛️ In-Person',
  online_east: '💻 East Canada',
  online_west: '🌐 West Canada',
};

const GROUP_COLORS: Record<GroupId, string> = {
  in_person:   '#1e3a5f',
  online_east: '#16a34a',
  online_west: '#9333ea',
};

function GroupBadge({ member }: { member: Member }) {
  const g = getMemberGroup(member);
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: GROUP_COLORS[g] + '18', color: GROUP_COLORS[g], whiteSpace: 'nowrap' }}
    >
      {GROUP_LABELS[g]}
    </span>
  );
}

export default function GraduatesPage() {
  const [members,  setMembers]  = useState<Member[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [classes,  setClasses]  = useState<BccClass[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoFilter, setPromoFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/data').then(r => r.json()),
      fetch('/api/admin/promotions').then(r => r.json()),
    ]).then(([data, promoData]) => {
      setMembers(data.members); setAttempts(data.attempts); setClasses(data.classes);
      setPromotions(promoData.promotions ?? []);
    }).finally(() => setLoading(false));
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

  const visibleMembers = members.filter(m =>
    promoFilter === 'all'
      || (promoFilter === '__none__' ? !m.promotionId : m.promotionId === promoFilter)
  );

  const membersWithProgress = visibleMembers.map(m => ({
    member: m,
    classResults: classes.map(c => ({ classId: c.id, best: getBest(m.id, c.id), passed: hasPassed(m.id, c.id) })),
  })).filter(x => x.classResults.some(r => r.best));

  const graduates = membersWithProgress.filter(x => x.classResults.every(r => r.passed));
  const inProgress = membersWithProgress.filter(x => !x.classResults.every(r => r.passed));
  const notStarted = visibleMembers.filter(m => !membersWithProgress.find(x => x.member.id === m.id));

  const countGradByGroup = (g: GroupId) => graduates.filter(x => getMemberGroup(x.member) === g).length;
  const countProgByGroup = (g: GroupId) => inProgress.filter(x => getMemberGroup(x.member) === g).length;

  function exportCSV(rows: typeof membersWithProgress, filename: string) {
    const header = [
      'Name', 'Email', 'Phone', 'Group', 'Province', 'Country', 'Language',
      ...classes.map(c => CLASS_LABELS[c.id]),
    ].join(',');
    const lines = rows.map(({ member: m, classResults: cr }) => [
      `"${m.firstName} ${m.lastName}"`,
      m.email,
      m.phone ?? '',
      GROUP_LABELS[getMemberGroup(m)].replace(/[🏛️💻🌐]/gu, '').trim(),
      m.province ?? '',
      m.country,
      m.language?.toUpperCase() ?? '',
      ...cr.map(r => r.best ? `${r.best.score}/${r.best.maxScore}` : ''),
    ].join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  }

  if (loading) return (
    <div className="page-container">
      <AdminHeader title="Graduates" />
      <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
    </div>
  );

  const tableHead = (
    <tr>
      <th>Name</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Group</th>
      <th>Province</th>
      <th>Lang</th>
      {classes.map(c => <th key={c.id} className="text-center">{CLASS_LABELS[c.id]}</th>)}
    </tr>
  );

  function memberRow({ member: m, classResults: cr }: typeof membersWithProgress[number]) {
    return (
      <tr key={m.id}>
        <td style={{ whiteSpace: 'nowrap' }}>
          <Link href={`/admin/members/${m.id}`} className="font-medium underline" style={{ color: 'var(--bcc-navy)' }}>
            {m.firstName} {m.lastName}
          </Link>
        </td>
        <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>
          {m.phone ? (
            <a href={`tel:${m.phone}`} style={{ color: 'var(--bcc-navy)' }}>{m.phone}</a>
          ) : <span className="text-gray-300">—</span>}
        </td>
        <td className="text-sm text-gray-600" style={{ whiteSpace: 'nowrap' }}>{m.email}</td>
        <td><GroupBadge member={m} /></td>
        <td className="text-sm text-gray-600">{m.province ?? '—'}</td>
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
    );
  }

  return (
    <div className="page-container">
      <AdminHeader title="Graduates Report" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Promotion filter */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <label className="text-sm font-medium text-gray-600">Promotion:</label>
          <select
            className="input-field"
            value={promoFilter}
            onChange={e => setPromoFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 220 }}
          >
            <option value="all">All Promotions</option>
            {promotions.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.isActive ? ' (Active)' : ''} — {p.memberCount ?? 0} members
              </option>
            ))}
            <option value="__none__">Legacy (no promotion)</option>
          </select>
        </div>

        {/* Overall stats */}
        <div className="flex gap-3 flex-wrap mb-4">
          <div className="card flex-1 text-center py-3" style={{ minWidth: 120 }}>
            <div className="text-4xl font-bold" style={{ color: '#16a34a', fontFamily: 'Georgia, serif' }}>{graduates.length}</div>
            <div className="text-xs text-gray-500 mt-1">Graduates (all 8 passed)</div>
          </div>
          <div className="card flex-1 text-center py-3" style={{ minWidth: 120 }}>
            <div className="text-4xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>{inProgress.length}</div>
            <div className="text-xs text-gray-500 mt-1">In Progress</div>
          </div>
          <div className="card flex-1 text-center py-3" style={{ minWidth: 120 }}>
            <div className="text-4xl font-bold" style={{ color: 'var(--bcc-red)', fontFamily: 'Georgia, serif' }}>{notStarted.length}</div>
            <div className="text-xs text-gray-500 mt-1">Not Started</div>
          </div>
        </div>

        {/* Per-group breakdown */}
        <div className="flex gap-3 flex-wrap mb-6">
          {(Object.entries(GROUP_LABELS) as [GroupId, string][]).map(([g, label]) => (
            <div key={g} className="card flex-1 py-3 px-4" style={{ minWidth: 170, borderLeft: `4px solid ${GROUP_COLORS[g]}` }}>
              <div className="text-sm font-bold mb-2" style={{ color: GROUP_COLORS[g] }}>{label}</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-bold text-lg" style={{ color: '#16a34a' }}>{countGradByGroup(g)}</span>
                  <span className="text-gray-400 text-xs ml-1">passed</span>
                </div>
                <div>
                  <span className="font-bold text-lg" style={{ color: 'var(--bcc-navy)' }}>{countProgByGroup(g)}</span>
                  <span className="text-gray-400 text-xs ml-1">in progress</span>
                </div>
                <div>
                  <span className="font-bold text-lg" style={{ color: '#9ca3af' }}>{notStarted.filter(m => getMemberGroup(m) === g).length}</span>
                  <span className="text-gray-400 text-xs ml-1">not started</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Graduates table */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
            Graduates — {graduates.length} member{graduates.length !== 1 ? 's' : ''}
          </h2>
          <button onClick={() => exportCSV(graduates, 'bcc-graduates.csv')} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
            Export CSV
          </button>
        </div>

        <div className="card overflow-x-auto mb-8">
          <table>
            <thead>{tableHead}</thead>
            <tbody>
              {graduates.length === 0 ? (
                <tr><td colSpan={6 + classes.length} className="text-center text-gray-400 py-8">No graduates yet</td></tr>
              ) : graduates.map(row => memberRow(row))}
            </tbody>
          </table>
        </div>

        {/* In progress table */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
            In Progress — {inProgress.length} member{inProgress.length !== 1 ? 's' : ''}
          </h2>
          <button onClick={() => exportCSV(membersWithProgress, 'bcc-all-progress.csv')} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}>
            Export All
          </button>
        </div>
        <div className="card overflow-x-auto mb-8">
          <table>
            <thead>{tableHead}</thead>
            <tbody>
              {inProgress.length === 0 ? (
                <tr><td colSpan={6 + classes.length} className="text-center text-gray-400 py-8">No members in progress</td></tr>
              ) : inProgress.map(row => memberRow(row))}
            </tbody>
          </table>
        </div>

        {/* Not started table */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
            Not Started — {notStarted.length} member{notStarted.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="card overflow-x-auto mb-8">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Group</th>
                <th>Province</th>
                <th>Language</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {notStarted.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">All registered members have started at least one class</td></tr>
              ) : notStarted.map(m => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link href={`/admin/members/${m.id}`} className="font-medium underline" style={{ color: 'var(--bcc-navy)' }}>
                      {m.firstName} {m.lastName}
                    </Link>
                  </td>
                  <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>
                    {m.phone ? (
                      <a href={`tel:${m.phone}`} style={{ color: 'var(--bcc-navy)' }}>{m.phone}</a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-sm text-gray-600" style={{ whiteSpace: 'nowrap' }}>{m.email}</td>
                  <td><GroupBadge member={m} /></td>
                  <td className="text-sm text-gray-600">{m.province ?? '—'}</td>
                  <td>{m.language?.toUpperCase()}</td>
                  <td className="text-sm text-gray-500" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleDateString('en-CA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link href="/admin/dashboard" className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
            ← Back to Dashboard
          </Link>
          <Link href="/admin/promotions" className="underline text-sm" style={{ color: '#16a34a' }}>
            Manage Promotions →
          </Link>
        </div>
      </div>
    </div>
  );
}
