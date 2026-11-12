import { CloudSun } from 'lucide-react';
import { formatTemperature } from '../services/temperature';
import type { TemperatureUnit } from '../types/temperature-unit';
import { TemperatureUnitToggle } from './TemperatureUnitToggle';

type TemperatureHighlightProps = { celsius: number; unit: TemperatureUnit; onToggleUnit: () => void };

export function TemperatureHighlight({ celsius, unit, onToggleUnit }: TemperatureHighlightProps) {
  return <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3 rounded-xl bg-[#fff5d8] px-4 py-3 text-[#694d00]">
      <CloudSun size={28} strokeWidth={1.7} aria-hidden="true" />
      <div><span className="block min-w-[7ch] text-3xl font-bold leading-none tabular-nums">{formatTemperature(celsius, unit)}</span><span className="text-xs font-semibold uppercase tracking-[0.08em]">Temperatura atual</span></div>
    </div>
    <TemperatureUnitToggle unit={unit} onToggle={onToggleUnit} />
  </div>;
}
