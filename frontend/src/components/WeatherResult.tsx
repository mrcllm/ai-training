import { Droplets, MapPin, Thermometer, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getConditionLabel } from '../i18n/condition-label';
import { formatTemperature } from '../services/temperature';
import type { TemperatureUnit } from '../types/temperature-unit';
import type { WeatherResponse } from '../types/weather-response';
import { SourceAttribution } from './SourceAttribution';
import { TemperatureHighlight } from './TemperatureHighlight';

type WeatherResultProps = { weather: WeatherResponse; temperatureUnit: TemperatureUnit; onToggleTemperatureUnit: () => void };

function formatLocation(weather: WeatherResponse): string {
  return [weather.location.name, weather.location.admin1, weather.location.country].filter(Boolean).join(', ');
}

export function WeatherResult({ weather, temperatureUnit, onToggleTemperatureUnit }: WeatherResultProps) {
  const { messages } = useLanguage();
  const { current, units } = weather;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.1)] sm:p-7" aria-labelledby="weather-result-title" aria-live="polite">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1b6172]"><MapPin size={16} aria-hidden="true" /> {messages.result.locationEyebrow}</p>
        <h2 id="weather-result-title" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{formatLocation(weather)}</h2>
      </div>
      <TemperatureHighlight celsius={current.temperature} unit={temperatureUnit} onToggleUnit={onToggleTemperatureUnit} />
    </div>
    <p className="mt-5 text-lg font-semibold text-slate-800">{getConditionLabel(current.condition, messages.conditions)}</p>
    <dl className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-3">
      <WeatherMetric icon={<Thermometer size={20} aria-hidden="true" />} label={messages.result.apparentTemperature} value={formatTemperature(current.apparentTemperature, temperatureUnit)} />
      <WeatherMetric icon={<Droplets size={20} aria-hidden="true" />} label={messages.result.humidity} value={`${current.humidity} ${units.humidity}`} />
      <WeatherMetric icon={<Wind size={20} aria-hidden="true" />} label={messages.result.windSpeed} value={`${current.windSpeed} ${units.windSpeed}`} />
    </dl>
    <div className="mt-6"><SourceAttribution name={weather.source.name} url={weather.source.url} /></div>
  </section>;
}

type WeatherMetricProps = { icon: ReactNode; label: string; value: string };

function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return <div className="rounded-xl bg-[#f3f7f7] p-4"><dt className="flex items-center gap-2 text-sm font-medium text-slate-600">{icon}{label}</dt><dd className="mt-2 text-xl font-bold tabular-nums text-slate-950">{value}</dd></div>;
}
