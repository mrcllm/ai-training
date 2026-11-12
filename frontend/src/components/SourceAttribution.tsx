import { useLanguage } from '../hooks/useLanguage';

type SourceAttributionProps = {
  name: string;
  url: string;
};

export function SourceAttribution({ name, url }: SourceAttributionProps) {
  const { messages } = useLanguage();
  return <p className="border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">{messages.source.dataBy}{' '}
    <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-[#14596a] underline decoration-[#f4c95d] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c95d]">{name}</a>.
  </p>;
}
