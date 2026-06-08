'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createMember } from '@/lib/firestore';
import { Header } from '@/components/Header';
import { T, getLang, type Lang } from '@/lib/i18n';
import type { Language, PromotionType, CanadaRegion } from '@/lib/types';

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda / Kirundi',
};

const EAST_PROVINCES = [
  'Ontario', 'Quebec', 'New Brunswick', 'Nova Scotia',
  'Prince Edward Island', 'Newfoundland and Labrador',
];
const WEST_PROVINCES = [
  'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba',
];
const TERRITORIES = ['Yukon', 'Northwest Territories', 'Nunavut'];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get('contact') ?? '';

  const [lang, setLangState] = useState<Lang>('en');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState('');
  const [promotionType, setPromotionType] = useState<PromotionType>('online');
  const [region, setRegion] = useState<CanadaRegion | ''>('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCanada = country.trim().toLowerCase().includes('canada');

  const provinceOptions = region === 'east'
    ? [...EAST_PROVINCES, ...TERRITORIES]
    : region === 'west'
    ? [...WEST_PROVINCES, ...TERRITORIES]
    : [...EAST_PROVINCES, ...WEST_PROVINCES, ...TERRITORIES];

  useEffect(() => {
    const uiLang = getLang();
    setLangState(uiLang);
    setLanguage(uiLang as Language);
    if (prefill.includes('@')) setEmail(prefill);
    else setPhone(prefill);
  }, [prefill]);

  useEffect(() => { setProvince(''); }, [region]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError(T.errorNameRequired[lang]); return;
    }
    if (!email.trim() && !phone.trim()) {
      setError(T.errorContactRequired[lang]); return;
    }
    if (isCanada && !region) {
      setError(
        lang === 'fr' ? 'Veuillez choisir votre région (Est ou Ouest).' :
        lang === 'rw' ? 'Hitamo akarere kawe (Iburasirazuba cyangwa Iburengerazuba).' :
        'Please select your Canada region (East or West).'
      );
      return;
    }
    if (isCanada && !province) {
      setError(
        lang === 'fr' ? 'Veuillez choisir votre province.' :
        lang === 'rw' ? 'Hitamo intara yawe.' :
        'Please select your province.'
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      const id = await createMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        language,
        country: country.trim(),
        promotionType,
        region: isCanada && region ? region : undefined,
        province: isCanada && province ? province : undefined,
      });
      localStorage.setItem('bcc_member_id', id);
      router.push('/dashboard');
    } catch {
      setError(T.errorRegister[lang]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content-wrap py-10">
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-2">{T.newParticipant[lang]}</h1>
          <p className="text-gray-600 mb-8 text-lg">{T.registerSubtitle[lang]}</p>

          <div className="card">
            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block font-bold mb-1" htmlFor="firstName">{T.firstName[lang]}</label>
                  <input id="firstName" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" autoFocus />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-1" htmlFor="lastName">{T.lastName[lang]}</label>
                  <input id="lastName" className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mutoni" />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block font-bold mb-1" htmlFor="email">{T.emailAddress[lang]}</label>
                <input id="email" type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean.mutoni@email.com" />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block font-bold mb-1" htmlFor="phone">{T.phoneNumber[lang]}</label>
                <input id="phone" type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 613 555 0000" />
              </div>

              {/* Country */}
              <div className="mb-4">
                <label className="block font-bold mb-1" htmlFor="country">{T.country[lang]}</label>
                <input
                  id="country"
                  className="input-field"
                  value={country}
                  onChange={e => { setCountry(e.target.value); setRegion(''); setProvince(''); }}
                  placeholder="Canada"
                />
              </div>

              {/* Canada region + province */}
              {isCanada && (
                <>
                  <div className="mb-4">
                    <label className="block font-bold mb-2">{T.canadaRegion[lang]}</label>
                    <div className="flex gap-3">
                      {(['east', 'west'] as CanadaRegion[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegion(r)}
                          className="flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all"
                          style={{
                            borderColor: region === r ? 'var(--bcc-navy)' : '#d1d5db',
                            background: region === r ? 'var(--bcc-navy)' : 'white',
                            color: region === r ? 'white' : 'var(--bcc-navy)',
                          }}
                        >
                          {r === 'east' ? T.eastCanada[lang] : T.westCanada[lang]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-bold mb-1" htmlFor="province">{T.province[lang]}</label>
                    <select
                      id="province"
                      className="input-field"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">{T.selectProvince[lang]}</option>
                      {provinceOptions.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Promotion type */}
              <div className="mb-6">
                <label className="block font-bold mb-2">{T.promotionSection[lang]}</label>
                <div className="flex flex-col gap-3">
                  {([
                    { value: 'online' as PromotionType,    label: T.onlinePromotion[lang],    desc: T.onlinePromotionDesc[lang],    icon: '💻' },
                    { value: 'in_person' as PromotionType, label: T.inPersonPromotion[lang],  desc: T.inPersonPromotionDesc[lang],  icon: '🏛️' },
                  ]).map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer"
                      style={{
                        borderColor: promotionType === opt.value ? 'var(--bcc-navy)' : '#d1d5db',
                        background: promotionType === opt.value ? '#f0f4f8' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        name="promotionType"
                        value={opt.value}
                        checked={promotionType === opt.value}
                        onChange={() => setPromotionType(opt.value)}
                        className="mt-1 w-5 h-5"
                      />
                      <div>
                        <div className="font-bold text-base">{opt.icon} {opt.label}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exam language */}
              <div className="mb-6">
                <label className="block font-bold mb-2">{T.examLanguage[lang]}</label>
                <div className="flex flex-col gap-2">
                  {(Object.entries(LANG_LABELS) as [Language, string][]).map(([val, label]) => (
                    <label
                      key={val}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer"
                      style={{
                        borderColor: language === val ? 'var(--bcc-navy)' : '#d1d5db',
                        background: language === val ? '#f0f4f8' : 'white',
                      }}
                    >
                      <input type="radio" name="language" value={val} checked={language === val} onChange={() => setLanguage(val)} className="w-5 h-5" />
                      <span className="font-medium text-lg">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 mb-4">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? T.registering[lang] : T.startLearning[lang]}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {T.alreadyRegisteredQ[lang]}{' '}
            <a href="/" className="underline" style={{ color: 'var(--bcc-navy)' }}>
              {T.goBackContact[lang]}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <Header />
        <div className="content-wrap py-10 text-center text-gray-500">Loading…</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
