import { CloudSun, Compass } from 'lucide-react';
import { WeatherFeedback } from '../components/WeatherFeedback';
import { WeatherResult } from '../components/WeatherResult';
import { WeatherSearchForm } from '../components/WeatherSearchForm';
import { useWeatherSearch } from '../hooks/useWeatherSearch';

export function WeatherView() {
  const { state, search, reset } = useWeatherSearch();
  const isLoading = state.status === 'loading';
  return <main className="min-h-screen bg-[#edf3f4] text-slate-950">
    <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
      <WeatherIntro />
      <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16" aria-label="Consulta meteorológica" aria-busy={isLoading}>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Qual é o clima agora?</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">Digite o nome de uma cidade, escolha uma das sugestões e consulte o tempo neste momento.</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.08)] sm:p-7">
            <WeatherSearchForm isLoading={isLoading} onSearch={search} onInvalid={reset} />
            <div className="mt-4 min-h-6"><WeatherFeedback state={state} /></div>
          </div>
          {state.status === 'success' && <div className="mt-6"><WeatherResult weather={state.data} /></div>}
        </div>
      </section>
    </div>
  </main>;
}

function WeatherIntro() {
  return <aside className="relative isolate overflow-hidden bg-[#163f4b] px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-16">
    <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#2c7180] opacity-50" aria-hidden="true" />
    <div className="absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full border-[32px] border-[#f4c95d]/20" aria-hidden="true" />
    <div className="flex h-full min-h-64 max-w-xl flex-col justify-between gap-16 lg:min-h-[calc(100vh-8rem)]">
      <div>
        <div className="mb-12 flex items-center gap-3 text-[#f4c95d]">
          <CloudSun size={30} strokeWidth={1.8} aria-hidden="true" />
          <span className="text-sm font-bold uppercase tracking-[0.14em]">Painel de clima</span>
        </div>
        <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">O tempo da sua cidade, sem rodeios.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-200">Consulte as condições atuais de cidades brasileiras e encontre temperatura, umidade e vento em uma leitura rápida.</p>
      </div>
      <div className="flex items-start gap-3 border-t border-white/20 pt-5 text-sm leading-6 text-slate-200">
        <Compass size={20} className="mt-1 shrink-0 text-[#f4c95d]" aria-hidden="true" />
        <p>Os dados correspondem exatamente à localidade que você escolher na lista de sugestões.</p>
      </div>
    </div>
  </aside>;
}
