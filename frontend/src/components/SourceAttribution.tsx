import { useLanguage } from '../hooks/useLanguage';

type SourceAttributionProps = {
  label: string;
  name: string;
  url: string;
};

export function SourceAttribution({ label, name, url }: SourceAttributionProps) {
  const { messages } = useLanguage();
  return <p className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">{label}{' '}
    <a href={url} target="_blank" rel="noreferrer" className="rounded-sm font-semibold text-[#14596a] underline decoration-[#f4c95d] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6172] focus-visible:ring-offset-2">
      {name}<span className="sr-only"> {messages.source.opensInNewTab}</span>
    </a>.
  </p>;
}
