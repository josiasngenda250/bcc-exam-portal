'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import { getMemberGroup } from '@/lib/types';
import type { Member, Attempt, BccClass, GroupId, Promotion } from '@/lib/types';

type GroupFilter = 'all' | GroupId;

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

function getGroupLabel(m: Member): string {
  return GROUP_LABELS[getMemberGroup(m)];
}

function getGroupColor(m: Member): string {
  return GROUP_COLORS[getMemberGroup(m)];
}

const FILTER_TABS: { id: GroupFilter; label: string }[] = [
  { id: 'all',          label: 'All' },
  { id: 'in_person',   label: '🏛️ In-Person' },
  { id: 'online_east', label: '💻 East Canada' },
  { id: 'online_west', label: '🌐 West Canada' },
];

export default function AllMembersPage() {
  const [members,  setMembers]  = useState<Member[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [classes,  setClasses]  = useState<BccClass[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
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

  const filtered = members.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName} ${m.email} ${m.phone ?? ''} ${m.province ?? ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesGroup  = groupFilter === 'all' || getMemberGroup(m) === groupFilter;
    const matchesPromo  = promoFilter === 'all'
      || (promoFilter === '__none__' ? !m.promotionId : m.promotionId === promoFilter);
    return matchesSearch && matchesGroup && matchesPromo;
  });

  function exportCSV() {
    const header = ['Name', 'Email', 'Phone', 'Group', 'Province', 'Country', 'Language', 'Classes Done', 'Registered'].join(',');
    const lines = filtered.map(m => {
      const mAttempts = attempts.filter(a => a.memberId === m.id);
      const classIds = [...new Set(mAttempts.map(a => a.classId))];
      return [
        `"${m.firstName} ${m.lastName}"`,
        m.email,
        m.phone ?? '',
        GROUP_LABELS[getMemberGroup(m)].replace(/[🏛️💻🌐]/gu, '').trim(),
        m.province ?? '',
        m.country,
        m.language?.toUpperCase() ?? '',
        `${classIds.length}/${classes.length}`,
        new Date(m.createdAt).toLocaleDateString('en-CA'),
      ].join(',');
    });
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bcc-members.csv'; a.click();
  }

  if (loading) return (
    <div className="page-container">
      <AdminHeader title="All Members" />
      <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
    </div>
  );

  const countByGroup = (g: GroupId) => members.filter(m => getMemberGroup(m) === g).length;

  return (
    <div className="page-container">
      <AdminHeader title="All Members" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Summary stats */}
        <div className="flex gap-3 flex-wrap mb-5">
          {[
            { label: 'Total',        value: members.length,              color: 'var(--bcc-navy)' },
            { label: 'In-Person',    value: countByGroup('in_person'),   color: '#1e3a5f'         },
            { label: 'East Canada',  value: countByGroup('online_east'), color: '#16a34a'         },
            { label: 'West Canada',  value: countByGroup('online_west'), color: '#9333ea'         },
          ].map(s => (
            <div key={s.label} className="card flex-1 text-center py-3" style={{ minWidth: 110 }}>
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: 'Georgia, serif' }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="text-sm font-medium text-gray-600">Promotion:</label>
          <select
            className="input-field"
            value={promoFilter}
            onChange={e => setPromoFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 200 }}
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

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          {/* Group tabs */}
          <div className="flex gap-1 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setGroupFilter(tab.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
                style={{
                  borderColor: groupFilter === tab.id ? 'var(--bcc-navy)' : '#e5e7eb',
                  background:  groupFilter === tab.id ? 'var(--bcc-navy)' : 'white',
                  color:       groupFilter === tab.id ? 'white' : '#374151',
                }}
              >
                {tab.label}
                {tab.id !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">
                    ({members.filter(m => getMemberGroup(m) === tab.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            <button
              onClick={exportCSV}
              className="btn-outline"
              style={{ width: 'auto', padding: '8px 16px', fontSize: 14, whiteSpace: 'nowrap' }}
            >
              Export CSV
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
        </p>

        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Group</th>
                <th>Province</th>
                <th>Language</th>
                <th>Classes Done</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-8">No members found</td></tr>
              ) : filtered.map(m => {
                const mAttempts = attempts.filter(a => a.memberId === m.id);
                const classIds = [...new Set(mAttempts.map(a => a.classId))];
                return (
                  <tr key={m.id}>
                    <td className="font-medium" style={{ whiteSpace: 'nowrap' }}>
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} style={{ color: 'var(--bcc-navy)' }}>{m.phone}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-sm text-gray-600" style={{ whiteSpace: 'nowrap' }}>{m.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: getGroupColor(m) + '18', color: getGroupColor(m) }}
                      >
                        {getGroupLabel(m)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{m.province ?? '—'}</td>
                    <td>{m.language?.toUpperCase()}</td>
                    <td>{classIds.length}/{classes.length}</td>
                    <td className="text-sm text-gray-500" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td>
                      <Link href={`/admin/members/${m.id}`} className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 flex-wrap mt-4">
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
