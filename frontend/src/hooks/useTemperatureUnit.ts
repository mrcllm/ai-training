import { useState } from 'react';
import { DEFAULT_TEMPERATURE_UNIT, getNextTemperatureUnit } from '../lib/temperature';
import type { TemperatureUnit } from '../types/temperature-unit';
import type { UseTemperatureUnitResult } from '../types/use-temperature-unit-result';

export function useTemperatureUnit(): UseTemperatureUnitResult {
  const [unit, setUnit] = useState<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT);
  function toggleUnit(): void {
    setUnit(getNextTemperatureUnit);
  }
  return { unit, toggleUnit };
}
