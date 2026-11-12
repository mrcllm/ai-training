import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LanguageContext } from '../i18n/language-context';
import { MESSAGES } from '../i18n/messages';
import type { Language } from '../types/language';

export function renderWithLanguage(ui: ReactElement, language: Language): RenderResult {
  const value = { language, messages: MESSAGES[language], setLanguage: () => undefined };
  return render(<LanguageContext value={value}>{ui}</LanguageContext>);
}
