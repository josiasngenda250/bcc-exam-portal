'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import { getMemberGroup, isClassOpenForGroup } from '@/lib/types';
import type { Member, BccClass, Attempt, GroupId, PromotionType, CanadaRegion } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

const GROUP_LABELS: Record<GroupId, string> = {
  in_person:   '🏛️ In-Person',
  online_east: '💻 Online — East Canada',
  online_west: '🌐 Online — West Canada',
};

const GROUP_COLORS: Record<GroupId, string> = {
  in_person:   '#1e3a5f',
  online_east: '#16a34a',
  online_west: '#9333ea',
};

const EAST_PROVINCES = ['Ontario', 'Quebec', 'New Brunswick', 'Nova Scotia', 'Prince Edward Island', 'Newfoundland and Labrador'];
const WEST_PROVINCES = ['British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba'];
const TERRITORIES   = ['Yukon', 'Northwest Territories', 'Nunavut'];

export default function MemberDetailPage() {
  const params   = useParams();
  const memberId = params.memberId as string;

  const [member,   setMember]   = useState<Member | null>(null);
  const [classes,  setClasses]  = useState<BccClass[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Group-edit state
  const [editing,       setEditing]       = useState(false);
  const [editType,      setEditType]      = useState<PromotionType>('online');
  const [editRegion,    setEditRegion]    = useState<CanadaRegion | ''>('');
  const [editProvince,  setEditProvince]  = useState('');
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');

  async function load() {
    const res = await fetch(`/api/admin/members/${memberId}`);
    const { member: m, classes: cls, attempts: att } = await res.json();
    setMember(m);
    setClasses(cls);
    setAttempts(att);
    // Seed edit form from current values
    setEditType(m.promotionType ?? 'online');
    setEditRegion(m.region ?? '');
    setEditProvince(m.province ?? '');
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [memberId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="page-container">
      <AdminHeader title="Member Detail" />
      <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
    </div>
  );

  if (!member) return (
    <div className="page-container">
      <AdminHeader title="Member Not Found" />
      <div className="content-wrap py-10 text-center text-red-600">Member not found.</div>
    </div>
  );

  const group      = getMemberGroup(member);
  const groupColor = GROUP_COLORS[group];

  const classAttempts = (classId: string) => attempts.filter(a => a.classId === classId);
  const bestAttempt   = (classId: string): Attempt | null => {
    const all = classAttempts(classId);
    if (!all.length) return null;
    return all.reduce((b, a) => (a.score > b.score ? a : b), all[0]);
  };

  const completedCount = classes.filter(c => {
    const b = bestAttempt(c.id);
    return b && Math.round((b.score / b.maxScore) * 100) >= 60;
  }).length;

  async function handleSaveGroup() {
    setSaving(true);
    setSaveMsg('');
    const res = await fetch(`/api/admin/members/${memberId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promotionType: editType,
        region:   editType === 'online' ? (editRegion || null) : null,
        province: editProvince || null,
      }),
    });
    if (res.ok) {
      setSaveMsg('✅ Group updated successfully.');
      setEditing(false);
      await load();
    } else {
      setSaveMsg('❌ Failed to update. Try again.');
    }
    setSaving(false);
  }

  const provinceOptions = editRegion === 'east'
    ? [...EAST_PROVINCES, ...TERRITORIES]
    : editRegion === 'west'
    ? [...WEST_PROVINCES, ...TERRITORIES]
    : [...EAST_PROVINCES, ...WEST_PROVINCES, ...TERRITORIES];

  return (
    <div className="page-container">
      <AdminHeader title={`${member.firstName} ${member.lastName}`} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Member info ── */}
        <div className="card mb-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                {member.email}{member.phone && ` · ${member.phone}`}
              </p>
              <p className="text-gray-500 text-sm mt-0.5">
                {member.country}
                {member.province && ` · ${member.province}`}
                {' · '}{member.language?.toUpperCase()}
                {' · '}Joined {new Date(member.createdAt).toLocaleDateString('en-CA')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
                {completedCount}/{classes.length}
              </div>
              <div className="text-sm text-gray-500">Classes Passed</div>
            </div>
          </div>
        </div>

        {/* ── Group diagnostic ── */}
        <div className="card mb-5" style={{ borderLeft: `5px solid ${groupColor}` }}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: groupColor }}>
                Effective Group
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-lg font-bold px-3 py-1 rounded-lg"
                  style={{ background: groupColor + '18', color: groupColor }}
                >
                  {GROUP_LABELS[group]}
                </span>
                <span className="text-xs text-gray-400">
                  (promotionType: <strong>{member.promotionType ?? 'not set'}</strong>
                  {member.region && `, region: ${member.region}`})
                </span>
              </div>
            </div>
            <button
              onClick={() => { setEditing(e => !e); setSaveMsg(''); }}
              className="px-3 py-1.5 rounded-lg text-sm font-bold border-2"
              style={{ borderColor: 'var(--bcc-navy)', color: 'var(--bcc-navy)', background: 'white' }}
            >
              {editing ? 'Cancel' : 'Fix Group →'}
            </button>
          </div>

          {/* Class access grid */}
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Class Access for this member
          </p>
          <div className="flex flex-wrap gap-2">
            {classes.map(cls => {
              const open = isClassOpenForGroup(cls, group);
              const attempted = classAttempts(cls.id).length > 0;
              return (
                <span
                  key={cls.id}
                  className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{
                    background: open ? '#dcfce7' : attempted ? '#fef9c3' : '#fee2e2',
                    color:      open ? '#166534' : attempted ? '#854d0e' : '#991b1b',
                    border:     `1px solid ${open ? '#86efac' : attempted ? '#fcd34d' : '#fca5a5'}`,
                  }}
                >
                  {open ? '🔓' : attempted ? '📝' : '🔒'} {CLASS_LABELS[cls.id] ?? cls.id}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            🔓 Open for this group &nbsp;·&nbsp; 🔒 Closed for this group &nbsp;·&nbsp; 📝 Closed but has attempts
          </p>

          {/* Edit group form */}
          {editing && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <p className="font-bold text-sm mb-3" style={{ color: 'var(--bcc-navy)' }}>Correct Member Group</p>
              <div className="flex gap-3 flex-wrap mb-3">
                {([
                  { value: 'online',    label: '💻 Online' },
                  { value: 'in_person', label: '🏛️ In-Person' },
                ] as { value: PromotionType; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setEditType(opt.value); if (opt.value === 'in_person') setEditRegion(''); }}
                    className="px-4 py-2 rounded-lg font-bold text-sm border-2"
                    style={{
                      borderColor: editType === opt.value ? 'var(--bcc-navy)' : '#d1d5db',
                      background:  editType === opt.value ? 'var(--bcc-navy)' : 'white',
                      color:       editType === opt.value ? 'white' : 'var(--bcc-navy)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editType === 'online' && (
                <div className="flex gap-3 flex-wrap mb-3">
                  {([
                    { value: 'east', label: '💻 East Canada (Ottawa, Toronto, Montréal…)' },
                    { value: 'west', label: '🌐 West Canada (Edmonton, Vancouver, Calgary…)' },
                  ] as { value: CanadaRegion; label: string }[]).map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setEditRegion(r.value)}
                      className="px-3 py-2 rounded-lg text-sm border-2"
                      style={{
                        borderColor: editRegion === r.value ? '#16a34a' : '#d1d5db',
                        background:  editRegion === r.value ? '#dcfce7' : 'white',
                        color:       editRegion === r.value ? '#166534' : '#374151',
                        fontWeight:  editRegion === r.value ? 'bold' : 'normal',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="mb-3" style={{ maxWidth: 280 }}>
                <label className="block text-sm font-bold mb-1">Province (optional)</label>
                <select
                  className="input-field"
                  value={editProvince}
                  onChange={e => setEditProvince(e.target.value)}
                >
                  <option value="">— not set —</option>
                  {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {saveMsg && (
                <p className={`text-sm mb-3 ${saveMsg.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
                  {saveMsg}
                </p>
              )}
              <button
                onClick={handleSaveGroup}
                disabled={saving || (editType === 'online' && !editRegion)}
                className="btn-primary"
                style={{ width: 'auto' }}
              >
                {saving ? 'Saving…' : 'Save Group Change →'}
              </button>
            </div>
          )}
          {saveMsg && !editing && (
            <p className="text-sm text-green-700 mt-3">{saveMsg}</p>
          )}
        </div>

        {/* ── Per-class progress ── */}
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>Class Progress</h2>
        <div className="flex flex-col gap-4 mb-8">
          {classes.map(cls => {
            const best    = bestAttempt(cls.id);
            const allAtt  = classAttempts(cls.id);
            const pct     = best ? Math.round((best.score / best.maxScore) * 100) : null;
            const passed  = pct !== null && pct >= 60;
            const openForMember = isClassOpenForGroup(cls, group);
            const borderColor = !best
              ? (openForMember ? '#86efac' : '#e5e7eb')
              : passed ? '#16a34a' : '#dc2626';

            return (
              <div key={cls.id} className="card" style={{ borderLeft: `4px solid ${borderColor}` }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{CLASS_LABELS[cls.id]}</h3>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: openForMember ? '#dcfce7' : '#fee2e2',
                          color:      openForMember ? '#166534' : '#991b1b',
                        }}
                      >
                        {openForMember ? '🔓 Open for this group' : '🔒 Closed for this group'}
                      </span>
                    </div>
                    {best ? (
                      <p className="text-gray-600 text-sm mt-1">
                        Best: {best.score}/{best.maxScore} ({pct}%) · {allAtt.length} attempt{allAtt.length !== 1 ? 's' : ''} · {best.language.toUpperCase()}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm mt-1">Not attempted</p>
                    )}
                  </div>
                  {best && <span className={passed ? 'badge-pass' : 'badge-fail'}>{passed ? 'Passed' : 'Failed'}</span>}
                </div>
                {allAtt.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">All Attempts</p>
                    <div className="flex flex-wrap gap-2">
                      {allAtt.map(a => {
                        const p = Math.round((a.score / a.maxScore) * 100);
                        return (
                          <Link
                            key={a.id}
                            href={`/results/${a.id}`}
                            className="px-3 py-1 rounded-full text-sm font-medium no-underline"
                            style={{
                              background: p >= 60 ? '#dcfce7' : '#fee2e2',
                              color:      p >= 60 ? '#166534' : '#991b1b',
                              textDecoration: 'none',
                            }}
                          >
                            #{a.attemptNumber} — {a.score}/{a.maxScore} ({p}%) {a.language.toUpperCase()}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link href="/admin/members" className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
            ← Back to All Members
          </Link>
          <Link href="/admin/dashboard" className="underline text-sm" style={{ color: '#6b7280' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
