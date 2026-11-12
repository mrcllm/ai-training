import type { WeatherResponse } from '../types/weather-response';

const DISPLAY_LOCALE = 'pt-BR';
const MAX_FRACTION_DIGITS = 1;
const measurementFormatter = new Intl.NumberFormat(DISPLAY_LOCALE, { maximumFractionDigits: MAX_FRACTION_DIGITS });

export function formatLocation(location: WeatherResponse['location']): string {
  return [location.name, location.admin1, location.country]
    .filter((part): part is string => typeof part === 'string' && part !== '')
    .join(', ');
}

export function formatMeasurement(value: number, unit: string): string {
  return `${measurementFormatter.format(value)} ${unit}`;
}
