'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { T, getLang, setLang, type Lang } from '@/lib/i18n';
import type { Attempt, Question } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [uiLang, setUiLang] = useState<Lang>('en');

  useEffect(() => {
    setUiLang(getLang());
    fetch(`/api/results/${attemptId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.attempt) { router.push('/dashboard'); return; }
        setAttempt(data.attempt as Attempt);
        setQuestions(data.questions as Question[]);
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  if (loading) {
    return (
      <div className="page-container">
        <Header lang={uiLang} onLangChange={l => { setLang(l); setUiLang(l); }} />
        <div className="content-wrap py-10 text-center text-gray-500 text-lg">
          {T.loadingResults[uiLang]}
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  const pct = Math.round((attempt.score / attempt.maxScore) * 100);
  const passed = pct >= 60;
  const examLang = attempt.language;

  return (
    <div className="page-container">
      <Header lang={uiLang} onLangChange={l => { setLang(l); setUiLang(l); }} />
      <div className="content-wrap">
        {/* Score card */}
        <div className="card text-center mb-6 mt-4" style={{ borderTop: `6px solid ${passed ? '#16a34a' : 'var(--bcc-red)'}` }}>
          <p className="text-gray-500 font-medium mb-1">{CLASS_LABELS[attempt.classId] ?? attempt.classId}</p>
          <div className="text-6xl font-bold mb-2" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>
            {attempt.score}<span className="text-3xl text-gray-400">/{attempt.maxScore}</span>
          </div>
          <p className="text-2xl font-bold mb-3" style={{ color: passed ? '#16a34a' : 'var(--bcc-red)' }}>
            {pct}%
          </p>
          <span className={passed ? 'badge-pass' : 'badge-fail'} style={{ fontSize: 17 }}>
            {passed ? T.resultPassed[uiLang] : T.resultFailed[uiLang]}
          </span>
          <p className="text-gray-400 text-sm mt-3">
            {T.attemptLabel[uiLang](attempt.attemptNumber, examLang)} ·{' '}
            {new Date(attempt.submittedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Question breakdown */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--bcc-navy)' }}>
              {T.questionBreakdown[uiLang]}
            </h2>
            {questions.map((q, i) => {
              const selectedIdx = attempt.answers[String(i)];
              const opts = q.options[examLang] ?? q.options.en ?? [];
              const selectedText = selectedIdx !== undefined ? opts[selectedIdx] : null;
              const correctText = q.correct[examLang] ?? q.correct.en;
              const isCorrect = selectedText === correctText;
              const wasAnswered = selectedIdx !== undefined;

              return (
                <div
                  key={q.id}
                  className="card mb-3"
                  style={{ borderLeft: `4px solid ${isCorrect ? '#16a34a' : '#dc2626'}` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{isCorrect ? '✓' : '✗'}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">
                        Q{i + 1}: {(q.text[examLang] ?? q.text.en ?? '').slice(0, 120)}
                        {(q.text[examLang] ?? '').length > 120 ? '…' : ''}
                      </p>
                      {wasAnswered && !isCorrect && (
                        <p className="text-sm text-red-600 mb-1">
                          {T.yourAnswer[uiLang]} <em>{selectedText}</em>
                        </p>
                      )}
                      {!wasAnswered && (
                        <p className="text-sm text-gray-400 mb-1 italic">{T.notAnswered[uiLang]}</p>
                      )}
                      {!isCorrect && (
                        <p className="text-sm text-green-700">
                          {T.correctAnswer[uiLang]} <strong>{correctText}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <Link
            href="/dashboard"
            className="btn-primary flex-1 text-center no-underline"
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
          >
            {T.backToDashboard[uiLang]}
          </Link>
          {attempt && (
            <Link
              href={`/exam/${attempt.classId}`}
              className="btn-outline flex-1 text-center no-underline"
              style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
            >
              {T.retakeExam[uiLang]}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
