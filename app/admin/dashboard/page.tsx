'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import { GROUPS, getMemberGroup, isClassOpenForGroup } from '@/lib/types';
import type { BccClass, Attempt, Member, GroupId } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

const GROUP_COLORS: Record<GroupId, { bg: string; border: string; badge: string }> = {
  in_person:   { bg: '#f0f4f8', border: 'var(--bcc-navy)', badge: '#1e3a5f' },
  online_east: { bg: '#f0fdf4', border: '#16a34a',          badge: '#166534' },
  online_west: { bg: '#fdf4ff', border: '#9333ea',          badge: '#6b21a8' },
};

export default function AdminDashboardPage() {
  const [classes,  setClasses]  = useState<BccClass[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null); // "classId:groupId"

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/data');
    const { classes: cls, attempts: att, members: mem } = await res.json();
    setClasses(cls);
    setAttempts(att);
    setMembers(mem);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleMigrate() {
    setMigrating(true);
    await fetch('/api/admin/migrate', { method: 'POST' });
    await load();
    setMigrating(false);
  }

  async function handleToggle(classId: string, group: GroupId, currentOpen: boolean) {
    const key = `${classId}:${group}`;
    setToggling(key);
    await fetch(`/api/admin/classes/${classId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, open: !currentOpen }),
    });
    setClasses(prev => prev.map(c => {
      if (c.id !== classId) return c;
      return {
        ...c,
        isOpenFor: { ...c.isOpenFor, [group]: !currentOpen },
      };
    }));
    setToggling(null);
  }

  // Per-group stats
  const membersByGroup = (group: GroupId) =>
    members.filter(m => getMemberGroup(m) === group);

  const attemptsByGroup = (group: GroupId) =>
    attempts.filter(a => {
      const m = members.find(mem => mem.id === a.memberId);
      return m ? getMemberGroup(m) === group : false;
    });

  const needsMigration = classes.some(c => !c.isOpenFor);

  if (loading) {
    return (
      <div className="page-container">
        <AdminHeader title="Dashboard" />
        <div className="content-wrap py-10 text-center text-gray-500 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <AdminHeader title="Dashboard" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>

        {/* Migration banner */}
        {needsMigration && (
          <div className="card mb-6" style={{ background: '#fffbeb', border: '2px solid #d97706' }}>
            <p className="font-bold text-amber-800 mb-2">⚠️ One-time setup required</p>
            <p className="text-amber-700 text-sm mb-3">
              Class documents need to be updated to support per-group access control.
              Click the button below once — this takes less than a second.
            </p>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="btn-primary"
              style={{ width: 'auto', background: '#d97706', borderColor: '#d97706' }}
            >
              {migrating ? 'Updating…' : 'Initialize Group Access Control →'}
            </button>
          </div>
        )}

        {/* Overall stats */}
        <div className="flex gap-4 flex-wrap mb-8">
          {[
            { label: 'Total Members',      value: members.length,  color: 'var(--bcc-navy)' },
            { label: 'Total Submissions',  value: attempts.length, color: 'var(--bcc-red)'  },
            { label: 'In-Person',          value: membersByGroup('in_person').length,   color: '#1e3a5f' },
            { label: 'Online East',        value: membersByGroup('online_east').length,  color: '#16a34a' },
            { label: 'Online West',        value: membersByGroup('online_west').length,  color: '#9333ea' },
          ].map(s => (
            <div key={s.label} className="card flex-1 text-center" style={{ minWidth: 130 }}>
              <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: 'Georgia, serif' }}>
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 3 Group sections */}
        {GROUPS.map(group => {
          const groupMembers  = membersByGroup(group.id);
          const groupAttempts = attemptsByGroup(group.id);
          const colors = GROUP_COLORS[group.id];

          return (
            <div
              key={group.id}
              className="card mb-6"
              style={{ borderLeft: `5px solid ${colors.border}`, background: colors.bg }}
            >
              {/* Section header */}
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: colors.badge }}>
                    {group.icon} {group.label}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{group.subtitle}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="font-bold" style={{ color: colors.badge }}>
                    {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{groupAttempts.length} submission{groupAttempts.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Class grid */}
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {classes.map(cls => {
                  const isOpen = isClassOpenForGroup(cls, group.id);
                  const key = `${cls.id}:${group.id}`;
                  const isToggling = toggling === key;
                  const clsAttempts = groupAttempts.filter(a => a.classId === cls.id);
                  const uniqueMembers = new Set(clsAttempts.map(a => a.memberId)).size;

                  return (
                    <div
                      key={cls.id}
                      className="rounded-xl p-4"
                      style={{
                        background: 'white',
                        border: `2px solid ${isOpen ? colors.border : '#e5e7eb'}`,
                        opacity: needsMigration ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm" style={{ color: 'var(--bcc-navy)' }}>
                          {CLASS_LABELS[cls.id] ?? cls.id}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: isOpen ? colors.border : '#e5e7eb',
                            color: isOpen ? 'white' : '#6b7280',
                          }}
                        >
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {uniqueMembers} member{uniqueMembers !== 1 ? 's' : ''} · {clsAttempts.length} attempt{clsAttempts.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(cls.id, group.id, isOpen)}
                          disabled={isToggling || needsMigration}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
                          style={{
                            background:   isOpen ? '#fee2e2' : '#dcfce7',
                            borderColor:  isOpen ? '#dc2626' : '#16a34a',
                            color:        isOpen ? '#dc2626' : '#16a34a',
                            cursor: (isToggling || needsMigration) ? 'not-allowed' : 'pointer',
                            opacity: isToggling ? 0.6 : 1,
                          }}
                        >
                          {isToggling ? '…' : isOpen ? 'Lock' : 'Unlock'}
                        </button>
                        <Link
                          href={`/admin/classes/${cls.id}?group=${group.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 no-underline"
                          style={{ borderColor: colors.border, color: colors.badge, background: 'white', textDecoration: 'none' }}
                        >
                          Roster
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick links */}
        <div className="flex gap-4 flex-wrap mt-2">
          <Link href="/admin/graduates" className="btn-primary"
            style={{ flex: 1, minWidth: 160, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Graduates Report →
          </Link>
          <Link href="/admin/members" className="btn-outline"
            style={{ flex: 1, minWidth: 160, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            All Members →
          </Link>
          <Link href="/admin/admins" className="btn-outline"
            style={{ flex: 1, minWidth: 160, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Manage Admins →
          </Link>
          <Link href="/admin/seed" className="btn-outline"
            style={{ flex: 1, minWidth: 160, textAlign: 'center', textDecoration: 'none', display: 'block', borderColor: '#9ca3af', color: '#6b7280' }}>
            Reload Questions →
          </Link>
        </div>
      </div>
    </div>
  );
}
