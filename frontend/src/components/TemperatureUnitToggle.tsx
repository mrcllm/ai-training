import { getNextTemperatureUnit } from '../services/temperature';
import type { TemperatureUnit } from '../types/temperature-unit';

type TemperatureUnitToggleProps = { unit: TemperatureUnit; onToggle: () => void };

const TEMPERATURE_UNIT_NAMES: Record<TemperatureUnit, string> = { '°C': 'Celsius', '°F': 'Fahrenheit' };

export function TemperatureUnitToggle({ unit, onToggle }: TemperatureUnitToggleProps) {
  const nextUnit = getNextTemperatureUnit(unit);
  return <>
    <button type="button" onClick={onToggle} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#1b6172] bg-white px-4 text-sm font-semibold text-[#1b6172] transition-colors hover:bg-[#f3f7f7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4c95d] focus-visible:ring-offset-2">
      Mostrar em {nextUnit}{' '}<span className="sr-only">({TEMPERATURE_UNIT_NAMES[nextUnit]})</span>
    </button>
    <span role="status" className="sr-only">Temperaturas exibidas em {TEMPERATURE_UNIT_NAMES[unit]}</span>
  </>;
}
