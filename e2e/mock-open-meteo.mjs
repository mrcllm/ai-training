import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_METEO_PORT ?? 3200);
const FAST_MS = 35;
const SLOW_SEARCH_MS = 450;
const SLOW_FORECAST_MS = 700;
const COUNTS = { search: 0, lookup: 0, forecast: 0 };
const ARMED_FAILURES = new Set();

const LOCATIONS = {
  3405940: { id: 3405940, name: 'Bom Jesus', admin1: 'Piauí', country: 'Brasil', country_code: 'BR', latitude: -9.07, longitude: -44.36 },
  3469136: { id: 3469136, name: 'Bom Jesus', admin1: 'Rio Grande do Sul', country: 'Brasil', country_code: 'BR', latitude: -28.67, longitude: -50.43 },
  3390760: { id: 3390760, name: 'Recife', admin1: 'Pernambuco', country: 'Brasil', country_code: 'BR', latitude: -8.05, longitude: -34.88 },
  3458902: { id: 3458902, name: 'Lençóis Paulista', admin1: 'São Paulo', country: 'Brasil', country_code: 'BR', latitude: -22.6, longitude: -48.8 },
  3448439: { id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', country_code: 'BR', latitude: -23.55, longitude: -46.64 },
  6322752: { id: 6322752, name: 'Curitiba', admin1: 'Paraná', country: 'Brasil', country_code: 'BR', latitude: -25.43, longitude: -49.27 },
  2988507: { id: 2988507, name: 'Paris', admin1: 'Île-de-France', country: 'França', country_code: 'FR', latitude: 48.85, longitude: 2.35 },
};

const TEMPERATURES = { '-25.43': 18.4, '-9.07': 31.2, '-28.67': 14.6, '-8.05': 28.4, '-22.6': 24.8, '-23.55': 21.3, '48.85': 12.7 };

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function searchResults(name) {
  const query = name.toLocaleLowerCase('pt-BR');
  if (query.startsWith('bom')) return [LOCATIONS[3405940], LOCATIONS[3469136]];
  if (query.startsWith('par')) return [LOCATIONS[2988507]];
  if (query.startsWith('rec')) return [LOCATIONS[3390760]];
  if (query.startsWith('cur')) return [LOCATIONS[6322752]];
  if (query.startsWith('len')) return [LOCATIONS[3458902]];
  if (query.startsWith('instá') || query.startsWith('sã')) return [LOCATIONS[3448439]];
  return undefined;
}

function shouldFail(query) {
  if (query.startsWith('falha')) return true;
  return ARMED_FAILURES.delete(query);
}

async function handleSearch(url, response) {
  COUNTS.search += 1;
  const name = url.searchParams.get('name') ?? '';
  const query = name.toLocaleLowerCase('pt-BR');
  if (shouldFail(query)) return sendJson(response, 502, { error: true, reason: 'simulated provider failure' });
  await wait(query.startsWith('len') ? SLOW_SEARCH_MS : FAST_MS);
  const results = searchResults(name);
  sendJson(response, 200, results === undefined ? { generationtime_ms: 0.1 } : { results });
}

async function handleLookup(url, response) {
  COUNTS.lookup += 1;
  await wait(FAST_MS);
  const location = LOCATIONS[url.searchParams.get('id') ?? ''];
  if (location === undefined) return sendJson(response, 400, { error: true, reason: 'Location ID not found.' });
  sendJson(response, 200, location);
}

async function handleForecast(url, response) {
  COUNTS.forecast += 1;
  const latitude = url.searchParams.get('latitude') ?? '';
  await wait(latitude === '-22.6' ? SLOW_FORECAST_MS : FAST_MS);
  sendJson(response, 200, {
    current: { temperature_2m: TEMPERATURES[latitude] ?? 20, apparent_temperature: 17.2, relative_humidity_2m: 61, weather_code: 1, wind_speed_10m: 12.3 },
    current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
  });
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/__metrics') return sendJson(response, 200, COUNTS);
  if (url.pathname === '/__fail-next-search') {
    ARMED_FAILURES.add((url.searchParams.get('name') ?? '').toLocaleLowerCase('pt-BR'));
    return sendJson(response, 200, { armed: true });
  }
  if (url.pathname === '/v1/search') return void handleSearch(url, response);
  if (url.pathname === '/v1/get') return void handleLookup(url, response);
  if (url.pathname === '/v1/forecast') return void handleForecast(url, response);
  sendJson(response, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
