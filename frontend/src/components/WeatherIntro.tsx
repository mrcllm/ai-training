import { CloudSun, Compass } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function WeatherIntro() {
  const { messages } = useLanguage();
  return <aside className="relative isolate overflow-hidden bg-[#163f4b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-16">
    <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#2c7180] opacity-50" aria-hidden="true" />
    <div className="absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full border-[32px] border-[#f4c95d]/20" aria-hidden="true" />
    <div className="flex h-full min-h-64 max-w-xl flex-col justify-between gap-16 lg:min-h-[calc(100vh-8rem)]">
      <div>
        <div className="mb-12 flex items-center gap-3 pr-28 text-[#f4c95d] lg:pr-0">
          <CloudSun size={30} strokeWidth={1.8} aria-hidden="true" />
          <span className="text-sm font-bold uppercase tracking-[0.14em]">{messages.intro.eyebrow}</span>
        </div>
        <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{messages.intro.title}</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-200">{messages.intro.description}</p>
      </div>
      <div className="flex items-start gap-3 border-t border-white/20 pt-5 text-sm leading-6 text-slate-200">
        <Compass size={20} className="mt-1 shrink-0 text-[#f4c95d]" aria-hidden="true" />
        <p>{messages.intro.resolutionNote}</p>
      </div>
    </div>
  </aside>;
}
