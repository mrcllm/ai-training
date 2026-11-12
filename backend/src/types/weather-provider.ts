import type { Coordinates } from './coordinates';
import type { ProviderConditions } from './provider-conditions';
import type { ResolvedLocation } from './resolved-location';

export type WeatherProvider = {
  searchLocations(query: string, signal: AbortSignal): Promise<ResolvedLocation[]>;
  getLocation(locationId: number, signal: AbortSignal): Promise<ResolvedLocation | null>;
  getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions>;
};
