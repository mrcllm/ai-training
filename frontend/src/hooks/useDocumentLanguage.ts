import { useEffect } from 'react';
import type { Language } from '../types/language';

export function useDocumentLanguage(language: Language, title: string): void {
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = title;
  }, [language, title]);
}
