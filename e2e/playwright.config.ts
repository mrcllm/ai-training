import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 3200);
const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 3001);
const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT ?? 5100);
const USE_REAL_PROVIDER = process.env.RUN_REAL_SMOKE === '1';
const mockServer = {
  command: `MOCK_METEO_PORT=${MOCK_PORT} node mock-open-meteo.mjs`, cwd: ROOT + '/e2e',
  url: `http://127.0.0.1:${MOCK_PORT}/__metrics`, reuseExistingServer: false,
};
const backendEnvironment = USE_REAL_PROVIDER
  ? `PORT=${BACKEND_PORT} FRONTEND_ORIGIN=http://127.0.0.1:${FRONTEND_PORT}`
  : `PORT=${BACKEND_PORT} FRONTEND_ORIGIN=http://127.0.0.1:${FRONTEND_PORT} OPEN_METEO_GEOCODING_URL=http://127.0.0.1:${MOCK_PORT}/v1/search OPEN_METEO_GEOCODING_LOOKUP_URL=http://127.0.0.1:${MOCK_PORT}/v1/get OPEN_METEO_FORECAST_URL=http://127.0.0.1:${MOCK_PORT}/v1/forecast`;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${FRONTEND_PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    ...(USE_REAL_PROVIDER ? [] : [mockServer]),
    { command: `${backendEnvironment} npm run dev`, cwd: ROOT + '/backend', url: `http://127.0.0.1:${BACKEND_PORT}/health`, reuseExistingServer: false },
    { command: `VITE_API_BASE_URL=http://127.0.0.1:${BACKEND_PORT} npm run dev -- --host 127.0.0.1 --port ${FRONTEND_PORT}`, cwd: ROOT + '/frontend', url: `http://127.0.0.1:${FRONTEND_PORT}`, reuseExistingServer: false },
  ],
});
