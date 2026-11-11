import type { Coordinates } from './coordinates';

export type ResolvedLocation = Coordinates & {
  name: string;
  admin1: string | null;
  country: string | null;
};
