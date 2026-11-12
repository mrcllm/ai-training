import { useLanguage } from '../hooks/useLanguage';

export function LanguageProbe() {
  const { language, setLanguage } = useLanguage();
  const nextLanguage = language === 'en' ? 'pt-BR' : 'en';
  return <button type="button" onClick={() => setLanguage(nextLanguage)}>Alternar idioma</button>;
}
