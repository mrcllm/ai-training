import { AppError } from '../errors/app-error';

const MIN_USEFUL_CHARACTERS = 2;
const MAX_CHARACTERS = 100;
const SPACES = /\s+/gu;
const UNPAIRED_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const BAD_REQUEST_STATUS = 400;

function invalidQuery(): AppError {
  return new AppError({
    statusCode: BAD_REQUEST_STATUS,
    code: 'INVALID_LOCATION_QUERY',
    publicMessage: 'Digite de 2 a 100 caracteres para buscar uma localidade.',
  });
}

export function normalizeLocationQuery(value: unknown): string {
  if (typeof value !== 'string' || UNPAIRED_SURROGATE.test(value)) throw invalidQuery();
  const normalized = value.normalize('NFC').trim().replace(SPACES, ' ');
  const usefulLength = [...normalized.replace(SPACES, '')].length;
  if (usefulLength < MIN_USEFUL_CHARACTERS || [...normalized].length > MAX_CHARACTERS) throw invalidQuery();
  return normalized;
}
