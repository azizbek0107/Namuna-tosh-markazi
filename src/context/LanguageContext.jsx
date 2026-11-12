import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES, translations, latinToCyrillic } from '../utils/translations';

export const LanguageContext = createContext({
  language: 'uz',
  setLanguage: () => {},
  currentLanguage: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
  t: (key, fallback) => fallback || key,
  toCyrillic: (str) => str,
});

const STORAGE_KEY = 'namuna_lang';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
          return saved;
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return 'uz';
  });

  const setLanguage = useCallback((code) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === code)) return;
    setLanguageState(code);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, code);
      }
    } catch {
      // Ignore storage access errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code === 'oz' ? 'uz-Cyrl' : code;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'oz' ? 'uz-Cyrl' : language;
    }
  }, [language]);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback((key, fallback = '') => {
    const dict = translations[language] || translations.uz;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    const defaultDict = translations.uz;
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    return fallback || key;
  }, [language]);

  const toCyrillic = useCallback((text) => {
    return latinToCyrillic(text);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    t,
    toCyrillic,
  }), [language, setLanguage, currentLanguage, t, toCyrillic]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;

