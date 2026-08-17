'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import { getMemberGroup } from '@/lib/types';
import type { Member, Attempt, BccClass, GroupId, PromotionType, CanadaRegion, Promotion } from '@/lib/types';

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

const FILTER_TABS: { id: GroupFilter; label: string }[] = [
  { id: 'all',          label: 'All' },
  { id: 'in_person',   label: '🏛️ In-Person' },
  { id: 'online_east', label: '💻 East Canada' },
  { id: 'online_west', label: '🌐 West Canada' },
];

// Derive GroupId from the two editable fields
function groupFromFields(type: PromotionType, region: CanadaRegion | ''): GroupId {
  if (type === 'in_person') return 'in_person';
  if (region === 'west')    return 'online_west';
  return 'online_east';
}

// Inline group picker shown inside the table cell
function GroupPicker({
  memberId,
  current,
  onSave,
  onCancel,
}: {
  memberId: string;
  current:  GroupId;
  onSave:   (memberId: string, type: PromotionType, region: CanadaRegion | '') => Promise<void>;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<GroupId>(current);
  const [saving,   setSaving]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onCancel]);

  async function save() {
    if (selected === current) { onCancel(); return; }
    setSaving(true);
    const type: PromotionType    = selected === 'in_person' ? 'in_person' : 'online';
    const region: CanadaRegion | '' = selected === 'online_west' ? 'west' : selected === 'online_east' ? 'east' : '';
    await onSave(memberId, type, region);
    setSaving(false);
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        zIndex: 50,
        top: '100%',
        left: 0,
        background: 'white',
        border: '2px solid var(--bcc-navy)',
        borderRadius: 12,
        padding: '10px 12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        minWidth: 230,
        marginTop: 4,
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--bcc-navy)' }}>
        Change Group
      </p>
      <div className="flex flex-col gap-1.5 mb-3">
        {(Object.entries(GROUP_LABELS) as [GroupId, string][]).map(([g, label]) => (
          <button
            key={g}
            onClick={() => setSelected(g)}
            className="w-full text-left px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
            style={{
              borderColor: selected === g ? GROUP_COLORS[g] : '#e5e7eb',
              background:  selected === g ? GROUP_COLORS[g] + '18' : 'white',
              color:       selected === g ? GROUP_COLORS[g] : '#374151',
              fontWeight:  selected === g ? 'bold' : 'normal',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold border-2"
          style={{ borderColor: '#e5e7eb', color: '#6b7280', background: 'white' }}
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 text-white"
          style={{ borderColor: 'var(--bcc-navy)', background: 'var(--bcc-navy)' }}
        >
          {saving ? 'Saving…' : selected === current ? 'No change' : 'Save →'}
        </button>
      </div>
    </div>
  );
}

export default function AllMembersPage() {
  const [members,    setMembers]    = useState<Member[]>([]);
  const [attempts,   setAttempts]   = useState<Attempt[]>([]);
  const [classes,    setClasses]    = useState<BccClass[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [groupFilter,setGroupFilter]= useState<GroupFilter>('all');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoFilter,setPromoFilter]= useState<string>('all');
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [savedId,    setSavedId]    = useState<string | null>(null); // flashes green ✓

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/data').then(r => r.json()),
      fetch('/api/admin/promotions').then(r => r.json()),
    ]).then(([data, promoData]) => {
      setMembers(data.members);
      setAttempts(data.attempts);
      setClasses(data.classes);
      setPromotions(promoData.promotions ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleGroupSave = useCallback(async (
    memberId: string,
    type: PromotionType,
    region: CanadaRegion | '',
  ) => {
    const res = await fetch(`/api/admin/members/${memberId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promotionType: type,
        region: type === 'online' ? (region || null) : null,
      }),
    });
    if (res.ok) {
      // Update local state immediately — no reload needed
      setMembers(prev => prev.map(m => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          promotionType: type,
          region: (type === 'online' && region) ? region as CanadaRegion : undefined,
        };
      }));
      setSavedId(memberId);
      setTimeout(() => setSavedId(null), 2000);
    }
    setEditingId(null);
  }, []);

  const filtered = members.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName} ${m.email} ${m.phone ?? ''} ${m.province ?? ''}`
      .toLowerCase().includes(search.toLowerCase());
    const matchesGroup  = groupFilter === 'all' || getMemberGroup(m) === groupFilter;
    const matchesPromo  = promoFilter === 'all'
      || (promoFilter === '__none__' ? !m.promotionId : m.promotionId === promoFilter);
    return matchesSearch && matchesGroup && matchesPromo;
  });

  function exportCSV() {
    const header = ['Name', 'Email', 'Phone', 'Group', 'Province', 'Country', 'Language', 'Classes Done', 'Registered'].join(',');
    const lines = filtered.map(m => {
      const mAttempts = attempts.filter(a => a.memberId === m.id);
      const classIds  = [...new Set(mAttempts.map(a => a.classId))];
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
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'bcc-members.csv'; a.click();
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
            { label: 'Total',       value: members.length,              color: 'var(--bcc-navy)' },
            { label: 'In-Person',   value: countByGroup('in_person'),   color: '#1e3a5f'         },
            { label: 'East Canada', value: countByGroup('online_east'), color: '#16a34a'         },
            { label: 'West Canada', value: countByGroup('online_west'), color: '#9333ea'         },
          ].map(s => (
            <div key={s.label} className="card flex-1 text-center py-3" style={{ minWidth: 110 }}>
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: 'Georgia, serif' }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Promotion filter */}
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

        {/* Group tabs + search */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
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

        <p className="text-sm text-gray-500 mb-1">
          Showing {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          💡 Click any group badge to change a member&apos;s group instantly.
        </p>

        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Group <span className="font-normal text-gray-400">(click to edit)</span></th>
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
                const g         = getMemberGroup(m);
                const color     = GROUP_COLORS[g];
                const mAttempts = attempts.filter(a => a.memberId === m.id);
                const classIds  = [...new Set(mAttempts.map(a => a.classId))];
                const isEditing = editingId === m.id;
                const justSaved = savedId   === m.id;

                return (
                  <tr key={m.id}>
                    <td className="font-medium" style={{ whiteSpace: 'nowrap' }}>
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>
                      {m.phone
                        ? <a href={`tel:${m.phone}`} style={{ color: 'var(--bcc-navy)' }}>{m.phone}</a>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-sm text-gray-600" style={{ whiteSpace: 'nowrap' }}>{m.email}</td>

                    {/* ── Inline editable group cell ── */}
                    <td style={{ position: 'relative', whiteSpace: 'nowrap' }}>
                      {justSaved ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#dcfce7', color: '#166534' }}>
                          ✓ Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => setEditingId(isEditing ? null : m.id)}
                          title="Click to change group"
                          className="text-xs font-bold px-2 py-0.5 rounded-full border transition-all"
                          style={{
                            background:  color + '18',
                            color,
                            borderColor: isEditing ? color : 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          {GROUP_LABELS[g]} ✎
                        </button>
                      )}
                      {isEditing && (
                        <GroupPicker
                          memberId={m.id}
                          current={groupFromFields(m.promotionType ?? 'online', m.region ?? '')}
                          onSave={handleGroupSave}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </td>

                    <td className="text-sm text-gray-600">{m.province ?? '—'}</td>
                    <td>{m.language?.toUpperCase()}</td>
                    <td>{classIds.length}/{classes.length}</td>
                    <td className="text-sm text-gray-500" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td>
                      <Link href={`/admin/members/${m.id}`} className="underline text-sm"
                        style={{ color: 'var(--bcc-navy)' }}>
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
