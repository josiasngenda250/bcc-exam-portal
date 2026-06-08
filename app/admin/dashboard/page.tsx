'use client';
import { useEffect, useState } from 'react';
import { getAllClasses, getAllAttempts, getAllMembers, setClassOpen } from '@/lib/firestore';
import { AdminHeader } from '@/components/Header';
import type { BccClass, Attempt, Member } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

export default function AdminDashboardPage() {
  const [classes, setClasses] = useState<BccClass[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function load() {
    const [cls, att, mem] = await Promise.all([getAllClasses(), getAllAttempts(), getAllMembers()]);
    setClasses(cls);
    setAttempts(att);
    setMembers(mem);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(classId: string, currentOpen: boolean) {
    setToggling(classId);
    await setClassOpen(classId, !currentOpen);
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, isOpen: !currentOpen } : c));
    setToggling(null);
  }

  const openCount = classes.filter(c => c.isOpen).length;
  const uniqueSubmitters = new Set(attempts.map(a => a.memberId)).size;
  const graduatesCount = members.filter(m =>
    classes.every(c => attempts.some(a => a.memberId === m.id && a.classId === c.id))
  ).length;

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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap mb-8">
          {[
            { label: 'Registered Members', value: members.length, color: 'var(--bcc-navy)' },
            { label: 'Total Submissions', value: attempts.length, color: 'var(--bcc-red)' },
            { label: 'Active Participants', value: uniqueSubmitters, color: '#0369a1' },
            { label: 'Classes Open', value: openCount, color: '#16a34a' },
          ].map(s => (
            <div key={s.label} className="card flex-1" style={{ minWidth: 160, textAlign: 'center' }}>
              <div className="text-4xl font-bold" style={{ color: s.color, fontFamily: 'Georgia, serif' }}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Class control */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>Class Control Panel</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Submissions</th>
                  <th>Unique Members</th>
                  <th>Opened</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => {
                  const classAttempts = attempts.filter(a => a.classId === cls.id);
                  const uniqueMembers = new Set(classAttempts.map(a => a.memberId)).size;
                  return (
                    <tr key={cls.id}>
                      <td className="font-bold">{CLASS_LABELS[cls.id] ?? cls.id}</td>
                      <td>
                        <span className={cls.isOpen ? 'badge-open' : 'badge-closed'}>
                          {cls.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td>{classAttempts.length}</td>
                      <td>{uniqueMembers}</td>
                      <td className="text-sm text-gray-500">
                        {cls.openedAt ? new Date(cls.openedAt).toLocaleDateString('en-CA') : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleToggle(cls.id, cls.isOpen)}
                            disabled={toggling === cls.id}
                            className="px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all"
                            style={{
                              background: cls.isOpen ? '#fee2e2' : '#dcfce7',
                              borderColor: cls.isOpen ? '#dc2626' : '#16a34a',
                              color: cls.isOpen ? '#dc2626' : '#16a34a',
                              cursor: toggling === cls.id ? 'not-allowed' : 'pointer',
                              opacity: toggling === cls.id ? 0.6 : 1,
                            }}
                          >
                            {toggling === cls.id ? '…' : (cls.isOpen ? 'Lock' : 'Unlock')}
                          </button>
                          <a
                            href={`/admin/classes/${cls.id}`}
                            className="px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all no-underline"
                            style={{ borderColor: 'var(--bcc-navy)', color: 'var(--bcc-navy)', background: 'white', textDecoration: 'none' }}
                          >
                            View Roster
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-4 flex-wrap">
          <a href="/admin/graduates" className="btn-primary" style={{ flex: 1, minWidth: 200, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            View Graduates Report →
          </a>
          <a href="/admin/members" className="btn-outline" style={{ flex: 1, minWidth: 200, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            All Members →
          </a>
          <a href="/admin/seed" className="btn-outline" style={{ flex: 1, minWidth: 200, textAlign: 'center', textDecoration: 'none', display: 'block', borderColor: '#9ca3af', color: '#6b7280' }}>
            Initialize Questions →
          </a>
        </div>
      </div>
    </div>
  );
}
