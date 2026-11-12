import type { Language } from '../types/language';
import type { LanguageOption } from '../types/language-option';

export const DEFAULT_LANGUAGE: Language = 'pt-BR';

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'pt-BR', abbreviation: 'PT', nativeName: 'Português (Brasil)' },
  { code: 'en', abbreviation: 'EN', nativeName: 'English' },
];
