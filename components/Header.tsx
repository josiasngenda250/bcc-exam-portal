'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, type Lang } from '@/lib/i18n';
import { useLang } from '@/components/LangProvider';

interface HeaderProps {
  memberName?: string;
  showAdmin?: boolean;
}

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', rw: '🇷🇼' };
const LANGS: Lang[] = ['en', 'fr', 'rw'];

export function Header({ memberName, showAdmin }: HeaderProps) {
  const { lang: activeLang, setLang: handleLangChange } = useLang();

  return (
    <header style={{ background: 'var(--bcc-navy)' }} className="text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/bcc-logo.png"
            alt="BCC"
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <div className="font-bold text-lg leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Bible Communication Center
            </div>
            <div className="text-xs text-gray-300">Exam Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {memberName && (
            <span className="text-sm text-gray-300 hidden sm:block">
              {T.hello[activeLang]}, <strong className="text-white">{memberName}</strong>
            </span>
          )}

          {/* Language switcher — always shown */}
          <div className="flex items-center gap-0.5 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                title={l === 'en' ? 'English' : l === 'fr' ? 'Français' : 'Kinyarwanda'}
                style={{
                  background: activeLang === l ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: activeLang === l ? 1 : 0.55,
                  transition: 'all 0.15s',
                }}
              >
                {LANG_FLAGS[l]}
              </button>
            ))}
          </div>

          {showAdmin && (
            <Link
              href="/admin/dashboard"
              className="text-sm text-gray-300 hover:text-white underline"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function AdminHeader({ title }: { title: string }) {
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)bcc_admin_name=([^;]+)/);
    if (match) setAdminName(decodeURIComponent(match[1]));
  }, []);

  return (
    <header style={{ background: 'var(--bcc-navy)' }} className="text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/bcc-logo.png"
            alt="BCC"
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div className="font-bold text-base leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              BCC Admin Portal
            </div>
            <div className="text-xs text-gray-300">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {adminName && (
            <span className="text-sm text-gray-300 hidden sm:block">
              👤 <strong className="text-white">{adminName}</strong>
            </span>
          )}
          <Link
            href="/admin/admins"
            className="text-sm text-gray-300 hover:text-white hidden sm:block"
            style={{ textDecoration: 'underline' }}
          >
            Admins
          </Link>
          <form action="/api/admin/logout" method="POST" style={{ display: 'inline' }}>
            <button type="submit" className="text-sm text-gray-300 hover:text-white border border-gray-500 rounded px-3 py-1">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
