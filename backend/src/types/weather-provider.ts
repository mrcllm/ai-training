import type { Coordinates } from './coordinates';
import type { ProviderConditions } from './provider-conditions';
import type { ResolvedLocation } from './resolved-location';

export type WeatherProvider = {
  findLocations(city: string, signal: AbortSignal): Promise<ResolvedLocation[]>;
  getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions>;
};
