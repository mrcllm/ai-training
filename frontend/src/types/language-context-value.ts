import type { Language } from './language';
import type { Messages } from './messages';

export type LanguageContextValue = {
  language: Language;
  messages: Messages;
  setLanguage: (language: Language) => void;
};
