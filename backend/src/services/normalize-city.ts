import { AppError } from '../errors/app-error';

const MIN_CITY_LENGTH = 2;
const MAX_CITY_LENGTH = 100;
const SPACES = /\s+/gu;

function invalidCity(): AppError {
  return new AppError(400, 'INVALID_CITY', 'Informe uma cidade com 2 a 100 caracteres.');
}

export function normalizeCity(value: unknown): string {
  if (typeof value !== 'string') throw invalidCity();
  const normalized = value.normalize('NFC').trim().replace(SPACES, ' ');
  const usefulLength = [...normalized].length;
  if (usefulLength < MIN_CITY_LENGTH || usefulLength > MAX_CITY_LENGTH) throw invalidCity();
  return normalized;
}
