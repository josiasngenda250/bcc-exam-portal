'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import type { Member, BccClass, Attempt } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [member, setMember] = useState<Member | null>(null);
  const [classes, setClasses] = useState<BccClass[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/members/${memberId}`)
      .then(r => r.json())
      .then(({ member: m, classes: cls, attempts: att }) => { setMember(m); setClasses(cls); setAttempts(att); })
      .finally(() => setLoading(false));
  }, [memberId]);

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

  const classAttempts = (classId: string) => attempts.filter(a => a.classId === classId);
  const bestAttempt = (classId: string): Attempt | null => {
    const all = classAttempts(classId);
    if (!all.length) return null;
    return all.reduce((b, a) => (a.score > b.score ? a : b), all[0]);
  };

  const completedCount = classes.filter(c => {
    const b = bestAttempt(c.id);
    return b && Math.round((b.score / b.maxScore) * 100) >= 60;
  }).length;

  return (
    <div className="page-container">
      <AdminHeader title={`${member.firstName} ${member.lastName}`} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Member info */}
        <div className="card mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{member.email} {member.phone && `· ${member.phone}`}</p>
              <p className="text-gray-500">
                {member.country}
                {member.region && ` · ${member.region === 'east' ? 'East Canada' : 'West Canada'}`}
                {member.province && ` · ${member.province}`}
                {' · '}{member.language?.toUpperCase()}
                {member.promotionType && ` · ${member.promotionType === 'online' ? '💻 Online' : '🏛️ In-Person'}`}
                {' · '}Joined {new Date(member.createdAt).toLocaleDateString('en-CA')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: 'var(--bcc-navy)' }}>{completedCount}/{classes.length}</div>
              <div className="text-sm text-gray-500">Classes Passed</div>
            </div>
          </div>
        </div>

        {/* Per-class summary */}
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>Class Progress</h2>
        <div className="flex flex-col gap-4 mb-8">
          {classes.map(cls => {
            const best = bestAttempt(cls.id);
            const allAtt = classAttempts(cls.id);
            const pct = best ? Math.round((best.score / best.maxScore) * 100) : null;
            const passed = pct !== null && pct >= 60;
            return (
              <div key={cls.id} className="card" style={{ borderLeft: `4px solid ${!best ? '#d1d5db' : passed ? '#16a34a' : '#dc2626'}` }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{CLASS_LABELS[cls.id]}</h3>
                    {best ? (
                      <p className="text-gray-600 text-sm">
                        Best: {best.score}/{best.maxScore} ({pct}%) · {allAtt.length} attempt{allAtt.length !== 1 ? 's' : ''} · {best.language.toUpperCase()}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Not attempted</p>
                    )}
                  </div>
                  {best && <span className={passed ? 'badge-pass' : 'badge-fail'}>{passed ? 'Passed' : 'Failed'}</span>}
                </div>
                {/* All attempts for this class */}
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
                              color: p >= 60 ? '#166534' : '#991b1b',
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
