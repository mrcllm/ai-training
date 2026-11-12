import { useLanguage } from '../hooks/useLanguage';
import { LANGUAGE_OPTIONS } from '../i18n/language-options';
import { LanguageOption } from './LanguageOption';

export function LanguageSwitcher() {
  const { language, messages, setLanguage } = useLanguage();
  return <div role="group" aria-label={messages.languageSwitcher.groupLabel} className="flex gap-1 rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
    {LANGUAGE_OPTIONS.map((option) => <LanguageOption key={option.code} option={option} isActive={option.code === language} onSelect={setLanguage} />)}
  </div>;
}
