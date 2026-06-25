import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fr, en, pt, type Translations } from '../i18n';

export type Language = 'fr' | 'en' | 'pt';

const TRANSLATIONS: Record<Language, Translations> = { fr, en, pt };
const LANG_KEY = '@flo_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: fr,
  locale: 'fr-FR',
});

const LOCALES: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  pt: 'pt-PT',
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(stored => {
      if (stored === 'fr' || stored === 'en' || stored === 'pt') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        locale: LOCALES[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
