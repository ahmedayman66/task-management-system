import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ar } from './ar';
import { en } from './en';

const translations = { ar, en };

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  // Default to Arabic ('ar') as required by specification, or restore from localStorage
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('taskflow_lang');
    return saved === 'en' || saved === 'ar' ? saved : 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Synchronize document lang and dir attributes dynamically without refresh
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', direction);
  }, [language, direction]);

  const changeLanguage = useCallback((newLang) => {
    if (newLang === 'ar' || newLang === 'en') {
      setLanguageState(newLang);
      localStorage.setItem('taskflow_lang', newLang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, changeLanguage]);

  // Translation helper function supporting nested paths e.g. "auth.loginTitle" and interpolation {name}
  const t = useCallback(
    (keyPath, params = {}) => {
      const keys = keyPath.split('.');
      let current = translations[language];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          // Fallback to English if key missing in current language
          let fallback = translations.en;
          for (const fbKey of keys) {
            if (fallback && typeof fallback === 'object' && fbKey in fallback) {
              fallback = fallback[fbKey];
            } else {
              fallback = keyPath;
              break;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== 'string') {
        return keyPath;
      }

      // Replace variables like {name} or {count}
      let result = current;
      for (const [paramKey, paramVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }

      return result;
    },
    [language]
  );

  const value = {
    language,
    direction,
    isRTL: direction === 'rtl',
    changeLanguage,
    toggleLanguage,
    t
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;
