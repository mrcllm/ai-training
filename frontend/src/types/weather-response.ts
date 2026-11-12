import type { SourceAttribution } from './source-attribution';

export type WeatherResponse = {
  location: {
    name: string;
    admin1: string | null;
    country: string | null;
  };
  current: {
    temperature: number;
    apparentTemperature: number;
    condition: { code: number; label: string };
    humidity: number;
    windSpeed: number;
  };
  units: {
    temperature: '°C';
    apparentTemperature: '°C';
    humidity: '%';
    windSpeed: 'km/h';
  };
  source: SourceAttribution;
};
