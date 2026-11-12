import { useContext } from 'react';
import { LanguageContext } from '../i18n/language-context';
import type { LanguageContextValue } from '../types/language-context-value';

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
