import type { Language } from '../types/language';
import type { Messages } from '../types/messages';
import { enMessages } from './locales/en';
import { ptBrMessages } from './locales/pt-br';

export const MESSAGES: Readonly<Record<Language, Messages>> = {
  'pt-BR': ptBrMessages,
  en: enMessages,
};
