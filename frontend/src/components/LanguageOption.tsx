import type { Language } from '../types/language';
import type { LanguageOption as LanguageOptionData } from '../types/language-option';

type LanguageOptionProps = {
  option: LanguageOptionData;
  isActive: boolean;
  onSelect: (language: Language) => void;
};

const OPTION_CLASSES = 'flex h-11 w-11 items-center justify-center rounded-lg text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4c95d]/60 focus-visible:ring-offset-2';
const ACTIVE_OPTION_CLASSES = 'bg-[#163f4b] font-bold text-white';
const INACTIVE_OPTION_CLASSES = 'font-semibold text-slate-700 hover:bg-slate-100';

export function LanguageOption({ option, isActive, onSelect }: LanguageOptionProps) {
  const stateClasses = isActive ? ACTIVE_OPTION_CLASSES : INACTIVE_OPTION_CLASSES;
  return <button type="button" lang={option.code} aria-pressed={isActive} onClick={() => onSelect(option.code)} className={`${OPTION_CLASSES} ${stateClasses}`}>
    {option.abbreviation}<span className="sr-only"> {option.nativeName}</span>
  </button>;
}
