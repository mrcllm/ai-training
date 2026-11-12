import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { WeatherFeedback } from '../components/WeatherFeedback';
import { WeatherIntro } from '../components/WeatherIntro';
import { WeatherResult } from '../components/WeatherResult';
import { WeatherSearchForm } from '../components/WeatherSearchForm';
import { useLanguage } from '../hooks/useLanguage';
import { useTemperatureUnit } from '../hooks/useTemperatureUnit';
import { useWeatherSearch } from '../hooks/useWeatherSearch';

export function WeatherView() {
  const { state, search, reset } = useWeatherSearch();
  const { unit, toggleUnit } = useTemperatureUnit();
  const { messages } = useLanguage();
  const isLoading = state.status === 'loading';
  return <main className="min-h-screen bg-[#edf3f4] text-slate-950">
    <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
      <div className="absolute right-4 top-4 z-10 sm:right-6 lg:right-10"><LanguageSwitcher /></div>
      <WeatherIntro />
      <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-16 lg:pb-16 lg:pt-20" aria-label={messages.search.regionLabel} aria-busy={isLoading}>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{messages.search.title}</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">{messages.search.description}</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.08)] sm:p-7">
            <WeatherSearchForm isLoading={isLoading} onSearch={search} onInvalid={reset} />
            <div className="mt-4 min-h-6"><WeatherFeedback state={state} /></div>
          </div>
          {state.status === 'success' && <div className="mt-6"><WeatherResult weather={state.data} temperatureUnit={unit} onToggleTemperatureUnit={toggleUnit} /></div>}
        </div>
      </section>
    </div>
  </main>;
}
