import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { cityInput, suggestions } from './autocomplete-support';

const SAMPLE_COUNT = 20;
const TARGET_MS = 1000;
const EVIDENCE_DIRECTORY = '../tasks/prd-autocomplete-localidade/evidences';
const QUERIES = ['Bom Jesus', 'Recife', 'São Paulo', 'Bom'];

function summarize(samples: number[]) {
  const sorted = [...samples].sort((first, second) => first - second);
  return {
    samples: samples.length,
    p95Milliseconds: sorted[Math.ceil(samples.length * 0.95) - 1],
    withinOneSecondRate: samples.filter((elapsed) => elapsed <= TARGET_MS).length / samples.length,
    elapsedMilliseconds: samples,
  };
}

async function measureSuggestions(page: import('@playwright/test').Page, query: string, timeout: number): Promise<number> {
  await cityInput(page).fill('');
  const startedAt = Date.now();
  await cityInput(page).fill(query);
  await expect(suggestions(page).getByRole('option').first()).toBeVisible({ timeout });
  return Date.now() - startedAt;
}

test('E2E-07 exibe sugestões em até 1 s em pelo menos 95% das amostras controladas', async ({ page }) => {
  test.skip(process.env.RUN_REAL_SMOKE === '1', 'E2E-07 usa apenas o provedor local controlado.');
  const samples: number[] = [];
  await page.goto('/');
  for (let index = 0; index < SAMPLE_COUNT; index += 1) samples.push(await measureSuggestions(page, QUERIES[index % QUERIES.length], 5000));
  const summary = summarize(samples);
  expect(summary.withinOneSecondRate).toBeGreaterThanOrEqual(0.95);
  await mkdir(EVIDENCE_DIRECTORY, { recursive: true });
  await writeFile(`${EVIDENCE_DIRECTORY}/e2e-performance.json`, JSON.stringify({
    date: new Date().toISOString(), environment: 'Playwright Chromium; mock Open-Meteo local com 35 ms por etapa; debounce 300 ms',
    ...summary,
  }, null, 2));
});

test('registra smoke externo de sugestões sem bloquear por latência do provedor', async ({ page }) => {
  test.skip(process.env.RUN_REAL_SMOKE !== '1', 'Smoke real é executado manualmente.');
  test.setTimeout(120000);
  const samples: number[] = [];
  await page.goto('/');
  for (let index = 0; index < SAMPLE_COUNT; index += 1) samples.push(await measureSuggestions(page, QUERIES[index % QUERIES.length], 10000));
  await mkdir(EVIDENCE_DIRECTORY, { recursive: true });
  await writeFile(`${EVIDENCE_DIRECTORY}/real-performance.json`, JSON.stringify({
    date: new Date().toISOString(), environment: 'Playwright Chromium; backend local e Open-Meteo real', ...summarize(samples),
  }, null, 2));
});
