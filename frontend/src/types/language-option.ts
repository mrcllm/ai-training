import type { Language } from './language';

export type LanguageOption = Readonly<{
  code: Language;
  abbreviation: string;
  nativeName: string;
}>;
