import type { Language } from '../types/language';
import type { TemperatureUnit } from '../types/temperature-unit';
import { formatMeasurement } from './weather-formatters';

const FAHRENHEIT_SCALE_FACTOR = 9 / 5;
const FAHRENHEIT_OFFSET = 32;
const ONE_DECIMAL_FACTOR = 10;
const NEXT_TEMPERATURE_UNIT: Record<TemperatureUnit, TemperatureUnit> = { '°C': '°F', '°F': '°C' };

export const DEFAULT_TEMPERATURE_UNIT: TemperatureUnit = '°C';

function normalizeNegativeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

function roundToOneDecimal(value: number): number {
  return normalizeNegativeZero(Math.round(value * ONE_DECIMAL_FACTOR) / ONE_DECIMAL_FACTOR);
}

export function convertCelsiusToFahrenheit(celsius: number): number {
  return roundToOneDecimal(celsius * FAHRENHEIT_SCALE_FACTOR + FAHRENHEIT_OFFSET);
}

export function formatTemperature(celsius: number, unit: TemperatureUnit, language: Language): string {
  const value = unit === '°F' ? convertCelsiusToFahrenheit(celsius) : celsius;
  return formatMeasurement(value, unit, language);
}

export function getNextTemperatureUnit(unit: TemperatureUnit): TemperatureUnit {
  return NEXT_TEMPERATURE_UNIT[unit];
}
