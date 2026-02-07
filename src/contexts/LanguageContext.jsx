import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../locales/en.json';
import ps from '../locales/ps.json';
import fa from '../locales/fa.json';

const translations = {
  en,
  ps,
  fa
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ps');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Set document direction based on language
    const direction = language === 'ps' || language === 'fa' ? 'rtl' : 'ltr';
    document.dir = direction;
    document.documentElement.lang = language;
    setIsRTL(direction === 'rtl');
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);