import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const SAMPLE_COUNT = 20;
const TARGET_MS = 3000;

test('E2E-08 comprova latência controlada em pelo menos 95% das buscas', async ({ page }) => {
  test.skip(process.env.RUN_REAL_SMOKE === '1', 'E2E-08 usa apenas o provedor local controlado.');
  const elapsedSamples: number[] = [];
  await page.goto('/');
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const city = page.getByRole('textbox', { name: 'Cidade' });
    await city.fill(`Cidade ${index}`);
    const startedAt = Date.now();
    await page.getByRole('button', { name: 'Consultar clima' }).click();
    await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
    elapsedSamples.push(Date.now() - startedAt);
    if (index < SAMPLE_COUNT - 1) await city.fill('');
  }
  const successRate = elapsedSamples.filter((elapsed) => elapsed <= TARGET_MS).length / SAMPLE_COUNT;
  const sorted = [...elapsedSamples].sort((first, second) => first - second);
  const p95 = sorted[Math.ceil(SAMPLE_COUNT * 0.95) - 1];
  expect(successRate).toBeGreaterThanOrEqual(0.95);
  await mkdir('../tasks/prd-painel-de-clima/evidences', { recursive: true });
  await writeFile('../tasks/prd-painel-de-clima/evidences/e2e-performance.json', JSON.stringify({
    date: new Date().toISOString(), environment: 'Playwright Chromium; mock Open-Meteo local com 35 ms por etapa',
    samples: SAMPLE_COUNT, p95Milliseconds: p95, withinThreeSecondsRate: successRate,
    elapsedMilliseconds: elapsedSamples,
  }, null, 2));
});

test('registra smoke externo de cidades fixas sem bloquear por latência do provedor', async ({ page }) => {
  test.skip(process.env.RUN_REAL_SMOKE !== '1', 'Smoke real é executado manualmente.');
  test.setTimeout(120000);
  const cities = ['Lisboa', 'Porto', 'Madrid', 'Paris', 'Roma', 'Londres', 'Tóquio', 'Sydney', 'Toronto', 'Recife'];
  const samples: number[] = [];
  let successes = 0;
  await page.goto('/');
  for (const cityName of cities) {
    await page.getByRole('textbox', { name: 'Cidade' }).fill(cityName);
    const startedAt = Date.now();
    await page.getByRole('button', { name: 'Consultar clima' }).click();
    const result = page.locator('#weather-result-title');
    const error = page.getByRole('alert');
    await expect(result.or(error)).toBeVisible({ timeout: 10000 });
    samples.push(Date.now() - startedAt);
    if (await result.isVisible()) successes += 1;
  }
  const sorted = [...samples].sort((first, second) => first - second);
  const p95 = sorted[Math.ceil(samples.length * 0.95) - 1];
  await mkdir('../tasks/prd-painel-de-clima/evidences', { recursive: true });
  await writeFile('../tasks/prd-painel-de-clima/evidences/real-performance.json', JSON.stringify({
    date: new Date().toISOString(), environment: 'Playwright Chromium; backend local e Open-Meteo real',
    samples: samples.length, successfulQueries: successes, p95Milliseconds: p95,
    withinThreeSecondsRate: samples.filter((elapsed) => elapsed <= TARGET_MS).length / samples.length,
    elapsedMilliseconds: samples,
  }, null, 2));
});
