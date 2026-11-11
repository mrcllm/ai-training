export type Environment = {
  port: number;
  frontendOrigin: string;
  geocodingUrl: string;
  forecastUrl: string;
  weatherTimeoutMs: number;
  shutdownTimeoutMs: number;
};

const DEFAULTS = {
  port: 3001,
  frontendOrigin: 'http://localhost:3000',
  geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastUrl: 'https://api.open-meteo.com/v1/forecast',
  weatherTimeoutMs: 2500,
  shutdownTimeoutMs: 10000,
};

function parseInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${name} deve ser um inteiro positivo`);
  return parsed;
}

function parseUrl(value: string | undefined, fallback: string, name: string): string {
  const candidate = value ?? fallback;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`${name} deve ser uma URL válida`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`${name} deve usar HTTP ou HTTPS`);
  return url.toString().replace(/\/$/, '');
}

function parseOrigin(value: string | undefined): string {
  const origin = parseUrl(value, DEFAULTS.frontendOrigin, 'FRONTEND_ORIGIN');
  const url = new URL(origin);
  if (url.pathname !== '/' || url.search !== '' || url.hash !== '' || url.username !== '' || url.password !== '') {
    throw new Error('FRONTEND_ORIGIN deve conter somente uma origem');
  }
  return url.origin;
}

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  const port = parseInteger(source.PORT, DEFAULTS.port, 'PORT');
  if (port > 65535) throw new Error('PORT deve ser menor ou igual a 65535');
  const weatherTimeoutMs = parseInteger(source.OPEN_METEO_TIMEOUT_MS, DEFAULTS.weatherTimeoutMs, 'OPEN_METEO_TIMEOUT_MS');
  const shutdownTimeoutMs = parseInteger(source.SHUTDOWN_TIMEOUT_MS, DEFAULTS.shutdownTimeoutMs, 'SHUTDOWN_TIMEOUT_MS');
  return {
    port,
    frontendOrigin: parseOrigin(source.FRONTEND_ORIGIN),
    geocodingUrl: parseUrl(source.OPEN_METEO_GEOCODING_URL, DEFAULTS.geocodingUrl, 'OPEN_METEO_GEOCODING_URL'),
    forecastUrl: parseUrl(source.OPEN_METEO_FORECAST_URL, DEFAULTS.forecastUrl, 'OPEN_METEO_FORECAST_URL'),
    weatherTimeoutMs,
    shutdownTimeoutMs,
  };
}
