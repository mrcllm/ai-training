import type { CurrentConditions } from './current-conditions';
import type { SourceAttribution } from './source-attribution';
import type { WeatherLocation } from './weather-location';
import type { WeatherUnits } from './weather-units';

export type WeatherResponse = {
  location: WeatherLocation;
  current: CurrentConditions;
  units: WeatherUnits;
  source: SourceAttribution;
};
