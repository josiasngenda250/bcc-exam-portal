'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getLang, setLang as saveLang, type Lang } from '@/lib/i18n';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    setLangState(getLang());
  }, []);

  function setLang(l: Lang) {
    saveLang(l);
    setLangState(l);
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
