'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { T, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';
import { getMemberGroup, isClassOpenForGroup } from '@/lib/types';
import type { Member, BccClass, Attempt } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

function getBestAttempt(attempts: Attempt[], classId: string): Attempt | null {
  const cls = attempts.filter(a => a.classId === classId);
  if (!cls.length) return null;
  return cls.reduce((best, a) => (a.score > best.score ? a : best), cls[0]);
}

function getExamProgress(classId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(`bcc_exam_${classId}`);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    return Object.keys(saved.answers ?? {}).length > 0;
  } catch { return false; }
}

function ClassCard({
  cls, attempts, lang, isOpen, onTake,
}: {
  cls: BccClass; attempts: Attempt[]; lang: Lang; isOpen: boolean; onTake: () => void;
}) {
  const best = getBestAttempt(attempts, cls.id);
  const count = attempts.filter(a => a.classId === cls.id).length;
  const pct = best ? Math.round((best.score / best.maxScore) * 100) : 0;
  const passed = best ? pct >= 60 : false;
  const inProgress = isOpen && !best && getExamProgress(cls.id);

  if (!isOpen && !best) return null;

  const borderColor = isOpen
    ? (inProgress ? '#d97706' : 'var(--bcc-red)')
    : '#9ca3af';

  return (
    <div className="card mb-4" style={{ borderLeft: `5px solid ${borderColor}` }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
              {CLASS_LABELS[cls.id] ?? cls.title}
            </h2>
            {isOpen && !inProgress && <span className="badge-open">{T.open[lang]}</span>}
            {isOpen && inProgress && (
              <span style={{
                background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b',
                borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700,
              }}>
                ⏳ {T.inProgress[lang]}
              </span>
            )}
            {!isOpen && best && <span className="badge-closed">{T.closed[lang]}</span>}
          </div>
          {best && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">
                {T.bestScore[lang]} <strong className="text-lg">{best.score}/{best.maxScore}</strong>
                {' '}({pct}%) &nbsp;
                <span className={passed ? 'badge-pass' : 'badge-fail'}>
                  {passed ? T.passed[lang] : T.failed[lang]}
                </span>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {T.attempts[lang](count)} · {T.language[lang]}: {best.language.toUpperCase()}
              </p>
            </div>
          )}
          {!best && isOpen && !inProgress && (
            <p className="text-gray-500 text-sm mt-1">{T.notStarted[lang]}</p>
          )}
          {!best && isOpen && inProgress && (
            <p className="text-sm mt-1" style={{ color: '#d97706' }}>
              {T.inProgress[lang]} — {T.continueExam[lang].toLowerCase()}
            </p>
          )}
        </div>
        {isOpen && (
          <button onClick={onTake} className="btn-primary" style={{ width: 'auto', minWidth: 140 }}>
            {best ? T.retakeExam[lang] : inProgress ? T.continueExam[lang] : T.takeExam[lang]} →
          </button>
        )}
        {!isOpen && best && (
          <Link
            href={`/results/${best.id}`}
            className="btn-outline"
            style={{ width: 'auto', minWidth: 140, textAlign: 'center', textDecoration: 'none', display: 'inline-block' }}
          >
            {T.viewResults[lang]}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [classes, setClasses] = useState<BccClass[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    const memberId = localStorage.getItem('bcc_member_id');
    if (!memberId) { router.push('/'); return; }

    fetch(`/api/member/${memberId}/dashboard`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.member) { localStorage.removeItem('bcc_member_id'); router.push('/'); return; }
        setMember(data.member as Member);
        setClasses(data.classes as BccClass[]);
        setAttempts(data.attempts as Attempt[]);
      })
      .catch(() => { router.push('/'); })
      .finally(() => setLoading(false));
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem('bcc_member_id');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrap py-10 text-center text-gray-500 text-lg">
          {T.loadingDashboard[lang]}
        </div>
      </div>
    );
  }

  const memberGroup = getMemberGroup(member!);
  const visibleClasses = classes.filter(c =>
    isClassOpenForGroup(c, memberGroup) || attempts.some(a => a.classId === c.id)
  );
  const completedCount = classes.filter(c => {
    const best = getBestAttempt(attempts, c.id);
    return best && Math.round((best.score / best.maxScore) * 100) >= 60;
  }).length;

  return (
    <div className="page-container">
      <Header memberName={member?.firstName} />
      <div className="content-wrap">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 mt-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
              {T.hello[lang]}, {member?.firstName} {member?.lastName}!
            </h1>
            <p className="text-gray-500">
              {T.classesPassed[lang](completedCount, classes.length)}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-outline"
            style={{ width: 'auto', padding: '10px 20px', fontSize: 15 }}
          >
            {T.signOut[lang]}
          </button>
        </div>

        {visibleClasses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">📖</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--bcc-navy)' }}>
              {T.noExamsOpen[lang]}
            </h2>
            <p className="text-gray-500">
              {T.noExamsDesc[lang]}
            </p>
          </div>
        ) : (
          visibleClasses.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              attempts={attempts}
              lang={lang}
              isOpen={isClassOpenForGroup(cls, memberGroup)}
              onTake={() => router.push(`/exam/${cls.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
