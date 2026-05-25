import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, createContext } from 'react';
import { translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

export const LangContext = createContext<{
  lang: Lang;
  t: Record<string, any>;
  setLang: (l: Lang) => void;
}>({
  lang: 'ar',
  t: translations.ar,
  setLang: () => {},
});

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedLang = (localStorage.getItem('lang') as Lang) || 'ar';
    const savedTheme = localStorage.getItem('theme') || 'light';
    setLangState(savedLang);
    setTheme(savedTheme);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.className = savedTheme;
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LangContext.Provider value={{ lang, t: translations[lang].translation, setLang }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      </LangContext.Provider>
    </QueryClientProvider>
  );
}