import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, TranslationKeys } from './types';
import { en } from './translations/en';
import { ptBR } from './translations/pt-BR';
import { es } from './translations/es';
import { loadStoredLanguage, saveStoredLanguage } from '../data/storage/appStorage';

const DICTIONARIES: Record<SupportedLanguage, TranslationKeys> = {
  en,
  'pt-BR': ptBR,
  es,
};

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  /** Looks up `key` and replaces any `{{param}}` tokens with `params[param]`. */
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * No device-locale auto-detection (e.g. react-native-localize) on purpose — that's a new native
 * dependency for a "nice to have" default, and this app already deliberately avoids adding
 * native deps unless the feature needs one. Defaults to English on first launch; once the trainer
 * picks a language in More, it's persisted via AsyncStorage and restored on the next app start.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let cancelled = false;
    loadStoredLanguage().then((stored) => {
      if (!cancelled && stored && isSupportedLanguage(stored)) {
        setLanguageState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function setLanguage(next: SupportedLanguage): void {
    setLanguageState(next);
    saveStoredLanguage(next);
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => {
        const template = DICTIONARIES[language][key];
        if (!params) {
          return template;
        }
        return Object.entries(params).reduce(
          (result, [paramKey, paramValue]) => result.replaceAll(`{{${paramKey}}}`, String(paramValue)),
          template,
        );
      },
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
