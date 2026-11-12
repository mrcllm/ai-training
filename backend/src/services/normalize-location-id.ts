import { AppError } from '../errors/app-error';

const MAX_LOCATION_ID = 2_147_483_647;
const INTEGER_PATTERN = /^\d+$/u;
const BAD_REQUEST_STATUS = 400;

function invalidLocationId(): AppError {
  return new AppError({
    statusCode: BAD_REQUEST_STATUS,
    code: 'INVALID_LOCATION_ID',
    publicMessage: 'Selecione uma localidade válida antes de consultar o clima.',
  });
}

export function normalizeLocationId(value: unknown): number {
  if (typeof value !== 'string' || !INTEGER_PATTERN.test(value)) throw invalidLocationId();
  const locationId = Number(value);
  if (!Number.isSafeInteger(locationId) || locationId <= 0 || locationId > MAX_LOCATION_ID) throw invalidLocationId();
  return locationId;
}
