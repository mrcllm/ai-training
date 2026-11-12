import type { Coordinates } from './coordinates';

export type ResolvedLocation = Coordinates & {
  id: number;
  name: string;
  admin1: string | null;
  country: string | null;
  countryCode: string;
};
