import { createContext } from 'react';
import type { LanguageContextValue } from '../types/language-context-value';
import { DEFAULT_LANGUAGE } from './language-options';
import { MESSAGES } from './messages';

const DEFAULT_LANGUAGE_CONTEXT: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  messages: MESSAGES[DEFAULT_LANGUAGE],
  setLanguage: () => undefined,
};

export const LanguageContext = createContext<LanguageContextValue>(DEFAULT_LANGUAGE_CONTEXT);
