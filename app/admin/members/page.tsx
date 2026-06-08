'use client';
import { useEffect, useState } from 'react';
import { getAllMembers, getAllAttempts, getAllClasses } from '@/lib/firestore';
import { AdminHeader } from '@/components/Header';
import type { Member, Attempt, BccClass } from '@/lib/types';

export default function AllMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [classes, setClasses] = useState<BccClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getAllMembers(), getAllAttempts(), getAllClasses()])
      .then(([m, a, c]) => { setMembers(m); setAttempts(a); setClasses(c); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-container">
      <AdminHeader title="All Members" />
      <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
    </div>
  );

  return (
    <div className="page-container">
      <AdminHeader title="All Members" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
            All Members ({members.length})
          </h1>
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>

        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Country</th>
                <th>Language</th>
                <th>Classes Done</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const mAttempts = attempts.filter(a => a.memberId === m.id);
                const classIds = [...new Set(mAttempts.map(a => a.classId))];
                return (
                  <tr key={m.id}>
                    <td className="font-medium">{m.firstName} {m.lastName}</td>
                    <td className="text-sm text-gray-600">{m.email || m.phone}</td>
                    <td>{m.country}</td>
                    <td>{m.language?.toUpperCase()}</td>
                    <td>{classIds.length}/{classes.length}</td>
                    <td className="text-sm text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td>
                      <a href={`/admin/members/${m.id}`} className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
