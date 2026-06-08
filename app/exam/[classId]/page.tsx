'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMember, getClass, getQuestions, getMemberClassAttempts, saveAttempt, scoreAttempt } from '@/lib/firestore';
import { Header } from '@/components/Header';
import { T, getLang, type Lang } from '@/lib/i18n';
import type { Question, BccClass, Language } from '@/lib/types';

const CLASS_LABELS: Record<string, string> = {
  class_1: 'Class 1', class_2: 'Class 2', class_3a: 'Class 3A',
  class_3b: 'Class 3B', class_4: 'Class 4', class_5: 'Class 5',
  class_6: 'Class 6', class_7: 'Class 7',
};

const LANG_LABELS: Record<Language, string> = { en: 'English', fr: 'Français', rw: 'Kinyarwanda' };
const YES_LABELS: Record<Language, string> = { en: 'Yes', fr: 'Oui', rw: 'Yego' };
const NO_LABELS: Record<Language, string> = { en: 'No', fr: 'Non', rw: 'Oya' };

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [memberId, setMemberId] = useState('');
  const [cls, setCls] = useState<BccClass | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [uiLang, setUiLang] = useState<Lang>('en');

  useEffect(() => {
    setUiLang(getLang());
    const id = localStorage.getItem('bcc_member_id');
    if (!id) { router.push('/'); return; }
    setMemberId(id);

    Promise.all([getMember(id), getClass(classId), getQuestions(classId)]).then(([m, c, qs]) => {
      if (!m) { router.push('/'); return; }
      if (!c || !c.isOpen) { router.push('/dashboard'); return; }
      setCls(c);
      setQuestions(qs);
      setLanguage(m.language ?? 'en');
    }).finally(() => setLoading(false));
  }, [classId, router]);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  function selectOption(optionIndex: number) {
    setAnswers(prev => ({ ...prev, [String(currentIndex)]: optionIndex }));
  }

  function getYesNoOptions(q: Question): string[] {
    const opts = q.options[language];
    if (opts && opts.length > 0) return opts;
    return [YES_LABELS[language], NO_LABELS[language]];
  }

  async function handleSubmit() {
    if (!cls || !memberId) return;
    setSubmitting(true);
    try {
      const score = scoreAttempt(questions, answers, language);
      const maxScore = cls.maxScore[language] ?? questions.length;
      const prevAttempts = await getMemberClassAttempts(memberId, classId);
      const attemptNumber = prevAttempts.length + 1;
      const memberSnap = await getMember(memberId);

      const attemptId = await saveAttempt({
        memberId,
        memberName: `${memberSnap?.firstName} ${memberSnap?.lastName}`,
        memberEmail: memberSnap?.email ?? '',
        memberPhone: memberSnap?.phone ?? '',
        memberCountry: memberSnap?.country ?? '',
        classId,
        language,
        answers,
        score,
        maxScore,
        submittedAt: new Date().toISOString(),
        attemptNumber,
      });
      router.push(`/results/${attemptId}`);
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrap py-10 text-center text-gray-500 text-lg">{T.examLoading[uiLang]}</div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrap py-10 text-center">
          <p className="text-red-600">This exam has no questions yet.</p>
          <a href="/dashboard" className="underline mt-4 block">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const selectedOption = answers[String(currentIndex)];
  const isLast = currentIndex === totalQ - 1;
  const allAnswered = answeredCount === totalQ;

  return (
    <div className="page-container">
      <Header />
      <div className="content-wrap">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>
              {CLASS_LABELS[classId] ?? classId} — Exam
            </h1>
            <p className="text-gray-500 text-sm">
              {T.questionOf[uiLang](currentIndex + 1, totalQ)} &nbsp;·&nbsp; {T.answered[uiLang](answeredCount, totalQ)}
            </p>
          </div>
          {/* Language selector */}
          <div className="flex gap-2">
            {(Object.entries(LANG_LABELS) as [Language, string][]).map(([lang, label]) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="px-3 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                style={{
                  borderColor: language === lang ? 'var(--bcc-navy)' : '#d1d5db',
                  background: language === lang ? 'var(--bcc-navy)' : 'white',
                  color: language === lang ? 'white' : 'var(--bcc-navy)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / totalQ) * 100}%`, background: 'var(--bcc-red)' }}
          />
        </div>

        {/* Question card */}
        <div className="card mb-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--bcc-red)' }}>
            Question {currentIndex + 1}
          </p>
          <p className="text-xl font-medium mb-6" style={{ color: 'var(--bcc-navy)', lineHeight: 1.5 }}>
            {currentQ.text[language] || currentQ.text.en}
          </p>

          {currentQ.type === 'yesno' ? (
            <div className="flex gap-4">
              {getYesNoOptions(currentQ).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className="flex-1 py-5 rounded-xl text-xl font-bold border-3 transition-all"
                  style={{
                    borderWidth: 3,
                    borderColor: selectedOption === i ? 'var(--bcc-navy)' : '#d1d5db',
                    background: selectedOption === i ? 'var(--bcc-navy)' : 'white',
                    color: selectedOption === i ? 'white' : 'var(--bcc-navy)',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(currentQ.options[language] ?? currentQ.options.en ?? []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className="w-full text-left px-5 py-4 rounded-xl text-base transition-all"
                  style={{
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: selectedOption === i ? 'var(--bcc-navy)' : '#d1d5db',
                    background: selectedOption === i ? '#f0f4f8' : 'white',
                    color: 'var(--bcc-navy)',
                    fontWeight: selectedOption === i ? 'bold' : 'normal',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-outline flex-1"
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
          >
            {T.prev[uiLang]}
          </button>
          {!isLast && (
            <button
              onClick={() => setCurrentIndex(i => Math.min(totalQ - 1, i + 1))}
              className="btn-primary flex-1"
            >
              {T.next[uiLang]}
            </button>
          )}
          {isLast && (
            <button
              onClick={() => setConfirmSubmit(true)}
              className="btn-red flex-1"
              disabled={submitting}
            >
              {T.submitExam[uiLang]}
            </button>
          )}
        </div>

        {/* Quick nav dots */}
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="w-9 h-9 rounded-full text-sm font-bold border-2 transition-all"
              style={{
                borderColor: i === currentIndex ? 'var(--bcc-navy)' : (answers[String(i)] !== undefined ? 'var(--bcc-red)' : '#d1d5db'),
                background: i === currentIndex ? 'var(--bcc-navy)' : (answers[String(i)] !== undefined ? '#fee2e2' : 'white'),
                color: i === currentIndex ? 'white' : 'var(--bcc-navy)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {!allAnswered && (
          <p className="text-center text-amber-600 text-sm py-2">
            ⚠️ {totalQ - answeredCount} question{totalQ - answeredCount !== 1 ? 's' : ''} not yet answered
          </p>
        )}

        {error && <p className="text-center text-red-600 mt-2">{error}</p>}

        {/* Submit floating button when all answered */}
        {allAnswered && !isLast && (
          <div className="text-center mt-4">
            <button
              onClick={() => setConfirmSubmit(true)}
              className="btn-red"
              style={{ maxWidth: 300, margin: '0 auto' }}
              disabled={submitting}
            >
              {T.submitExam[uiLang]} ✓
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
          <div className="card" style={{ maxWidth: 420, width: '100%' }}>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--bcc-navy)' }}>{T.confirmTitle[uiLang]}</h2>
            <p className="text-gray-600 mb-4">
              {T.confirmDesc[uiLang](answeredCount, totalQ)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSubmit(false)} className="btn-outline flex-1" disabled={submitting}>
                {T.cancelBtn[uiLang]}
              </button>
              <button onClick={handleSubmit} className="btn-red flex-1" disabled={submitting}>
                {submitting ? T.submitting[uiLang] : T.confirmBtn[uiLang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
