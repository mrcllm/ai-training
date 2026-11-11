import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_METEO_PORT ?? 3200);
const DELAY_MS = 500;
const COUNTS = { geocoding: 0, forecast: 0 };

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function handleGeocoding(url, response) {
  COUNTS.geocoding += 1;
  const city = url.searchParams.get('name') ?? '';
  if (city.toLowerCase() === 'falha externa') {
    sendJson(response, 502, { error: 'simulated provider failure' });
    return;
  }
  await wait(city.toLowerCase() === 'lento' ? DELAY_MS : 35);
  if (city.toLowerCase() === 'cidade inexistente') {
    sendJson(response, 200, { results: [] });
    return;
  }
  sendJson(response, 200, {
    results: [
      { name: 'Paris', admin1: 'Île-de-France', country: 'França', latitude: 48.8566, longitude: 2.3522 },
      { name: 'Paris', admin1: 'Texas', country: 'Estados Unidos', latitude: 33.6609, longitude: -95.5555 },
    ],
  });
}

async function handleForecast(response) {
  COUNTS.forecast += 1;
  await wait(35);
  sendJson(response, 200, {
    current: { temperature_2m: 18.4, apparent_temperature: 17.2, relative_humidity_2m: 61, weather_code: 1, wind_speed_10m: 12.3 },
    current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
  });
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/__metrics') return sendJson(response, 200, COUNTS);
  if (url.pathname === '/v1/search') return void handleGeocoding(url, response);
  if (url.pathname === '/v1/forecast') return void handleForecast(response);
  sendJson(response, 404, { error: 'not found' });
});

server.listen(PORT, '127.0.0.1');
process.on('SIGTERM', () => server.close(() => process.exit(0)));
