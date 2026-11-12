import { CloudSun, Droplets, MapPin, Thermometer, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WeatherResponse } from '../types/weather-response';
import { formatLocation, formatMeasurement } from '../services/weather-formatters';
import { SourceAttribution } from './SourceAttribution';

type WeatherResultProps = { weather: WeatherResponse };

export function WeatherResult({ weather }: WeatherResultProps) {
  const { current, units } = weather;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(22,63,75,0.1)] sm:p-7" aria-labelledby="weather-result-title">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1b6172]"><MapPin size={16} aria-hidden="true" /> Localidade selecionada</p>
        <h2 id="weather-result-title" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{formatLocation(weather.location)}</h2>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-[#fff5d8] px-4 py-3 text-[#694d00]">
        <CloudSun size={28} strokeWidth={1.7} aria-hidden="true" />
        <div><span className="block text-3xl font-bold leading-none tabular-nums">{formatMeasurement(current.temperature, units.temperature)}</span><span className="text-xs font-semibold uppercase tracking-[0.08em]">Temperatura atual</span></div>
      </div>
    </div>
    <p className="mt-5 text-lg font-semibold text-slate-800">{current.condition.label}</p>
    <dl className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-3">
      <WeatherMetric icon={<Thermometer size={20} aria-hidden="true" />} label="Sensação térmica" value={formatMeasurement(current.apparentTemperature, units.apparentTemperature)} />
      <WeatherMetric icon={<Droplets size={20} aria-hidden="true" />} label="Umidade relativa" value={formatMeasurement(current.humidity, units.humidity)} />
      <WeatherMetric icon={<Wind size={20} aria-hidden="true" />} label="Velocidade do vento" value={formatMeasurement(current.windSpeed, units.windSpeed)} />
    </dl>
    <div className="mt-6"><SourceAttribution label="Dados meteorológicos por" name={weather.source.name} url={weather.source.url} /></div>
  </section>;
}

type WeatherMetricProps = { icon: ReactNode; label: string; value: string };

function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return <div className="rounded-xl bg-[#f3f7f7] p-4"><dt className="flex items-center gap-2 text-sm font-medium text-slate-600">{icon}{label}</dt><dd className="mt-2 text-xl font-bold tabular-nums text-slate-950">{value}</dd></div>;
}
