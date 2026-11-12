import { useState, type ReactNode } from 'react';
import { useDocumentLanguage } from '../hooks/useDocumentLanguage';
import type { Language } from '../types/language';
import { DEFAULT_LANGUAGE } from './language-options';
import { LanguageContext } from './language-context';
import { MESSAGES } from './messages';

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const messages = MESSAGES[language];
  useDocumentLanguage(language, messages.document.title);
  return <LanguageContext value={{ language, messages, setLanguage }}>{children}</LanguageContext>;
}
