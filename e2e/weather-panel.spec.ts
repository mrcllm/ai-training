import { expect, test } from '@playwright/test';
import { BOM_JESUS_PI, BOM_JESUS_RS, RECIFE, chooseLocation, cityInput, searchWeather, suggestions, trackRequests } from './autocomplete-support';

test('E2E-01 seleciona por ponteiro uma localidade homônima e consulta exatamente ela', async ({ page }) => {
  const requests = trackRequests(page);
  await page.goto('/');
  await cityInput(page).fill('Bom Jesus');
  const options = suggestions(page).getByRole('option');
  await expect(options).toHaveText(['Bom JesusPiauí, Brasil', 'Bom JesusRio Grande do Sul, Brasil']);
  await options.nth(1).click();
  await expect(cityInput(page)).toHaveValue('Bom Jesus, Rio Grande do Sul');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: BOM_JESUS_RS })).toBeVisible();
  await expect(page.getByText('14,6 °C')).toBeVisible();
  expect(requests.filter((url) => url.includes('/weather?'))).toEqual([expect.stringContaining('locationId=3469136')]);
});

test('E2E-03 comunica carregamento, vazio, falha e recuperação', async ({ page, request }) => {
  const mockPort = process.env.E2E_MOCK_PORT ?? '3200';
  await request.post(`http://127.0.0.1:${mockPort}/__fail-next-search?name=${encodeURIComponent('Instável')}`);
  let releaseSearch: () => void = () => undefined;
  const searchReleased = new Promise<void>((resolve) => { releaseSearch = resolve; });
  await page.route('**/locations?query=Len*', async (route) => {
    await searchReleased;
    await route.continue();
  });
  await page.goto('/');
  await cityInput(page).fill('Lençóis');
  await expect(page.getByText('Buscando localidades…')).toBeVisible();
  releaseSearch();
  await expect(suggestions(page)).toBeVisible();
  await cityInput(page).fill('Sem correspondência');
  await expect(page.getByText('Nenhuma localidade encontrada. Revise o texto digitado.')).toBeVisible();
  await expect(suggestions(page)).toHaveCount(0);
  await cityInput(page).fill('Instável');
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar localidades agora');
  await expect(cityInput(page)).toBeEditable();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(suggestions(page).getByRole('option', { name: /São Paulo/ })).toBeVisible();
});

test('E2E-04 impede que a resposta lenta da query anterior substitua a atual', async ({ page }) => {
  await page.goto('/');
  const slowSearch = page.waitForRequest((request) => request.url().includes('/locations?query=Len'));
  await cityInput(page).fill('Lençóis');
  await slowSearch;
  await cityInput(page).fill('Recife');
  await expect(suggestions(page).getByRole('option', { name: /Recife/ })).toBeVisible();
  await page.waitForTimeout(700);
  await expect(suggestions(page).getByRole('option')).toHaveText(['RecifePernambuco, Brasil']);
});

test('E2E-05 invalida a seleção editada e bloqueia a consulta até nova escolha', async ({ page }) => {
  const requests = trackRequests(page);
  await page.goto('/');
  await chooseLocation(page, 'Bom Jesus', /Piauí/);
  await cityInput(page).press('Backspace');
  await cityInput(page).press('Escape');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('alert')).toContainText('Selecione uma localidade na lista de sugestões');
  expect(requests.some((url) => url.includes('/weather?'))).toBe(false);
  await chooseLocation(page, 'Bom Jesus', /Piauí/);
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: BOM_JESUS_PI })).toBeVisible();
});

test('E2E-08 mantém a Open-Meteo fora do navegador', async ({ page, request }) => {
  const requests = trackRequests(page);
  const mockPort = process.env.E2E_MOCK_PORT ?? '3200';
  const before = await (await request.get(`http://127.0.0.1:${mockPort}/__metrics`)).json() as Record<string, number>;
  await page.goto('/');
  await searchWeather(page, 'Recife', /Recife/, RECIFE);
  const after = await (await request.get(`http://127.0.0.1:${mockPort}/__metrics`)).json() as Record<string, number>;
  const hosts = new Set(requests.map((url) => new URL(url).port));
  expect([...hosts].every((port) => [process.env.E2E_FRONTEND_PORT ?? '5100', process.env.E2E_BACKEND_PORT ?? '3001'].includes(port))).toBe(true);
  expect(requests.some((url) => url.includes('open-meteo') || url.includes(`:${mockPort}`))).toBe(false);
  expect(after.search - before.search).toBeGreaterThan(0);
  expect(after.lookup - before.lookup).toBeGreaterThanOrEqual(1);
  expect(after.forecast - before.forecast).toBeGreaterThanOrEqual(1);
});

test('bloqueia novos envios enquanto o clima carrega', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => { if (request.url().includes('/weather?')) weatherRequests += 1; });
  await page.goto('/');
  await chooseLocation(page, 'Lençóis', /Lençóis Paulista/);
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('button', { name: 'Consultando…' })).toHaveAttribute('aria-disabled', 'true');
  await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.getByRole('heading', { name: 'Lençóis Paulista, São Paulo, Brasil' })).toBeVisible();
  expect(weatherRequests).toBe(1);
});
