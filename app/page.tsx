'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { T, setLang, type Lang } from '@/lib/i18n';

type Step = 'lang' | 'choose' | 'returning';

const LANGUAGES: { code: Lang; native: string; flag: string }[] = [
  { code: 'en', native: 'English',     flag: '🇬🇧' },
  { code: 'fr', native: 'Français',    flag: '🇫🇷' },
  { code: 'rw', native: 'Kinyarwanda', flag: '🇷🇼' },
];

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('lang');
  const [lang, setActiveLang] = useState<Lang>('en');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function chooseLang(code: Lang) {
    setLang(code);
    setActiveLang(code);
    setStep('choose');
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const val = contact.trim();
    if (!val) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/member/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: val }),
      });
      if (!res.ok) throw new Error('lookup_failed');
      const member = await res.json();
      if (member?.id) {
        localStorage.setItem('bcc_member_id', member.id);
        router.push('/dashboard');
      } else {
        router.push(`/register?contact=${encodeURIComponent(val)}`);
      }
    } catch {
      setError(T.errorGeneral[lang]);
    } finally {
      setLoading(false);
    }
  }

  // ── Language picker ───────────────────────────────────────────────────────────
  if (step === 'lang') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bcc-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        {/* Logo */}
        <img
          src="/bcc-logo.png"
          alt="BCC"
          style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 16 }}
        />

        {/* Name */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            fontSize: 20,
            color: 'var(--bcc-navy)',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Bible Communication Center
        </div>

        {/* Prompt in all 3 languages */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--bcc-navy)', margin: '0 0 4px' }}>
            {T.pickLang.en}
          </p>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--bcc-navy)', margin: '0 0 4px' }}>
            {T.pickLang.fr}
          </p>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--bcc-navy)', margin: 0 }}>
            {T.pickLang.rw}
          </p>
        </div>

        {/* Language buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 380 }}>
          {LANGUAGES.map(({ code, native, flag }) => (
            <button
              key={code}
              onClick={() => chooseLang(code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 24px',
                background: 'white',
                border: '2px solid #d1d5db',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'var(--bcc-navy)',
                transition: 'all 0.15s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--bcc-red)';
                e.currentTarget.style.background = '#fff5f5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = 'white';
              }}
            >
              <span style={{ fontSize: 32 }}>{flag}</span>
              <span>{native}</span>
              <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 22 }}>→</span>
            </button>
          ))}
        </div>

        <p style={{ marginTop: 36, color: '#9ca3af', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
          {T.verse.en}
        </p>
      </div>
    );
  }

  // ── Main landing (after language chosen) ──────────────────────────────────────
  return (
    <div className="page-container">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div style={{ maxWidth: 560, width: '100%' }}>

          {/* Logo / Title */}
          <div className="text-center mb-8">
            <img
              src="/bcc-logo.png"
              alt="BCC"
              style={{ width: 96, height: 96, objectFit: 'contain', margin: '0 auto 16px' }}
            />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>
              {T.welcome[lang]}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Bible Communication Center
            </p>
          </div>

          {step === 'choose' && (
            <>
              <div className="card mb-6" style={{ background: '#f0f4f8', border: '1px solid #c7d7e8' }}>
                <p className="text-gray-700 text-base leading-relaxed">
                  {T.portalDesc[lang]}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* First time */}
                <button
                  onClick={() => router.push('/register')}
                  className="card text-left"
                  style={{
                    cursor: 'pointer',
                    border: '2px solid var(--bcc-red)',
                    padding: '24px',
                    background: 'white',
                    borderRadius: 12,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: 36 }}>👋</span>
                    <div>
                      <div className="font-bold text-xl" style={{ color: 'var(--bcc-red)' }}>
                        {T.firstTime[lang]}
                      </div>
                      <div className="text-gray-600 text-base mt-1">
                        {T.firstTimeDesc[lang]}
                      </div>
                    </div>
                    <span className="ml-auto text-2xl text-gray-300">→</span>
                  </div>
                </button>

                {/* Returning */}
                <button
                  onClick={() => setStep('returning')}
                  className="card text-left"
                  style={{
                    cursor: 'pointer',
                    border: '2px solid var(--bcc-navy)',
                    padding: '24px',
                    background: 'white',
                    borderRadius: 12,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f4f8')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: 36 }}>📋</span>
                    <div>
                      <div className="font-bold text-xl" style={{ color: 'var(--bcc-navy)' }}>
                        {T.alreadyRegistered[lang]}
                      </div>
                      <div className="text-gray-600 text-base mt-1">
                        {T.alreadyRegisteredDesc[lang]}
                      </div>
                    </div>
                    <span className="ml-auto text-2xl text-gray-300">→</span>
                  </div>
                </button>
              </div>

              {/* Change language */}
              <div className="text-center mt-6">
                <button
                  onClick={() => setStep('lang')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: 14,
                    textDecoration: 'underline',
                  }}
                >
                  🌐 {T.pickLang[lang]}
                </button>
              </div>
            </>
          )}

          {step === 'returning' && (
            <div className="card">
              <button
                onClick={() => { setStep('choose'); setError(''); setContact(''); }}
                className="text-sm text-gray-500 mb-4 flex items-center gap-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {T.back[lang]}
              </button>

              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--bcc-navy)' }}>
                {T.welcomeBack[lang]}
              </h2>
              <p className="text-gray-500 mb-6">
                {T.enterContact[lang]}
              </p>

              <form onSubmit={handleLookup}>
                <label className="block font-bold mb-2 text-lg" htmlFor="contact">
                  {T.emailOrPhone[lang]}
                </label>
                <input
                  id="contact"
                  type="text"
                  className="input-field mb-2"
                  placeholder={T.emailOrPhonePlaceholder[lang]}
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                <p className="text-gray-400 text-sm mb-4">
                  {T.contactHint[lang]}
                </p>

                {error && (
                  <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !contact.trim()}
                >
                  {loading ? T.searching[lang] : T.findAccount[lang]}
                </button>
              </form>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <p className="text-gray-500 text-sm">
                  {T.cantFind[lang]}{' '}
                  <button
                    onClick={() => router.push(`/register?contact=${encodeURIComponent(contact)}`)}
                    className="underline font-medium"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bcc-navy)', padding: 0 }}
                  >
                    {T.registerNew[lang]}
                  </button>
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm italic mt-8">
            {T.verse[lang]}
          </p>
        </div>
      </div>
    </div>
  );
}
