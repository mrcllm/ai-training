import { expect, test } from '@playwright/test';

test('E2E-01 apresenta a primeira localidade e todos os dados do clima', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('Paris');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
  await expect(page.getByText('Île-de-France, França')).toBeVisible();
  await expect(page.getByText('18.4 °C')).toBeVisible();
  await expect(page.getByText('17.2 °C')).toBeVisible();
  await expect(page.getByText('Predominantemente limpo')).toBeVisible();
  await expect(page.getByText('61 %')).toBeVisible();
  await expect(page.getByText('12.3 km/h')).toBeVisible();
  await expect(page.getByRole('link', { name: /Open-Meteo/ })).toHaveAttribute('href', 'https://open-meteo.com/');
});

test('E2E-02 mantém as chamadas externas no backend', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('Paris');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
  expect(requests.some((url) => url.includes('127.0.0.1:3001/weather'))).toBe(true);
  expect(requests.some((url) => url.includes('open-meteo.com'))).toBe(false);
});

test('E2E-03 orienta entrada inválida sem enviar busca', async ({ page }) => {
  const weatherRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/weather?')) weatherRequests.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('alert')).toContainText('pelo menos 2 caracteres');
  expect(weatherRequests).toHaveLength(0);
});

test('E2E-04 recupera de localidade ausente e falha externa', async ({ page }) => {
  const city = page.getByRole('textbox', { name: 'Cidade' });
  await page.goto('/');
  await city.fill('Paris');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
  await city.fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('alert')).toContainText('Cidade não encontrada');
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toHaveCount(0);
  await city.fill('Falha externa');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível consultar o clima');
  await city.fill('Paris');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
});

test('E2E-05 bloqueia novos envios durante carregamento', async ({ page }) => {
  let weatherRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/weather?')) weatherRequests += 1;
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Cidade' }).fill('Lento');
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  const submit = page.getByRole('button', { name: 'Consultando' });
  await expect(submit).toBeDisabled();
  await expect(page.getByRole('status')).toBeVisible();
  await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
  expect(weatherRequests).toBe(1);
});
