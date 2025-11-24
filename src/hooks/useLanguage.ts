import { useState, useEffect } from 'react';
import { Language, getLanguage, setLanguage as setLang } from '../utils/i18n';

export const useLanguage = () => {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = () => {
      setLanguageState(getLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (lang: Language) => {
    setLang(lang);
    setLanguageState(lang);
  };

  return { language, changeLanguage };
};

