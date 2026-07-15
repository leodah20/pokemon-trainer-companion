import React, { createContext, useContext, useMemo, useState } from 'react';
import { SupportedLanguage, TranslationKeys } from './types';
import { en } from './translations/en';
import { ptBR } from './translations/pt-BR';
import { es } from './translations/es';

const DICTIONARIES: Record<SupportedLanguage, TranslationKeys> = {
  en,
  'pt-BR': ptBR,
  es,
};

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * No device-locale auto-detection (e.g. react-native-localize) on purpose — that's a new native
 * dependency for a "nice to have" default, and this app already deliberately avoids adding
 * native deps unless the feature needs one. Defaults to English; the trainer picks a language
 * once in More and it's remembered for the session (not persisted across app restarts yet —
 * same tradeoff as the rest of the app's in-memory-only state, see README's Post-beta scope).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => DICTIONARIES[language][key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
