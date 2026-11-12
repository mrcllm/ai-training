import { expect, test } from '@playwright/test';
import { ENGLISH_OPTION, PORTUGUESE_OPTION, holdWeatherResponses, isWeatherRequest, measureSwitchToEnglish, searchCity, selectLanguage } from './language-actions';

const PORTUGUESE_TITLE = 'Clima agora — condições atuais por cidade';
const ENGLISH_TITLE = 'Weather now — current conditions by city';
const ENGLISH_HEADING = "Your city's weather, straight to the point.";
const PORTUGUESE_TEXTS = ['O tempo da sua cidade, sem rodeios.', 'Qual é o clima agora?', 'Painel de clima', 'Cidade', 'Consultar clima'];
const PARIS_VALUES = ['18.4 °C', '17.2 °C', '61 %', '12.3 km/h'];
const PORTUGUESE_LOADING = 'Consultando as condições atuais…';
const ENGLISH_LOADING = 'Checking current conditions…';
const ENGLISH_CONDITION = 'Mainly clear';
const MAX_SWITCH_MS = 100;

test('E2E-09 painel abre em PT-BR com PT ativo, lang pt-BR e título em português', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle(PORTUGUESE_TITLE);
  await expect(page.getByRole('button', { name: PORTUGUESE_OPTION })).toHaveAttribute('aria-pressed', 'true');
});

test('E2E-10 trocar para EN no estado inicial traduz a interface em até 100 ms e voltar para PT restaura os textos', async ({ page }) => {
  await page.goto('/');
  const portugueseText = await page.locator('main').innerText();
  expect(await measureSwitchToEnglish(page, ENGLISH_HEADING)).toBeLessThanOrEqual(MAX_SWITCH_MS);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(ENGLISH_TITLE);
  for (const text of PORTUGUESE_TEXTS) await expect(page.locator('main')).not.toContainText(text);
  await selectLanguage(page, PORTUGUESE_OPTION);
  await expect(page).toHaveTitle(PORTUGUESE_TITLE);
  expect(await page.locator('main').innerText()).toBe(portugueseText);
});

test('E2E-11 trocar o idioma com o resultado de Paris traduz a condição e não chama o backend', async ({ page }) => {
  const weatherRequests: string[] = [];
  await page.goto('/');
  await searchCity(page, 'Paris');
  await expect(page.getByText('Predominantemente limpo')).toBeVisible();
  page.on('request', (request) => {
    if (isWeatherRequest(new URL(request.url()))) weatherRequests.push(request.url());
  });
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByText(ENGLISH_CONDITION)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
  for (const value of PARIS_VALUES) await expect(page.getByText(value)).toBeVisible();
  expect(weatherRequests).toHaveLength(0);
});

test('E2E-12 trocar para EN durante a consulta em andamento conclui a busca em inglês', async ({ page }) => {
  const releaseWeatherResponse = await holdWeatherResponses(page);
  await page.goto('/');
  await searchCity(page, 'Paris');
  await expect(page.getByRole('status')).toHaveText(PORTUGUESE_LOADING);
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByRole('status')).toHaveText(ENGLISH_LOADING);
  releaseWeatherResponse();
  await expect(page.getByText(ENGLISH_CONDITION)).toBeVisible();
});

test('E2E-13 mensagem de validação é reescrita em inglês', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'a');
  await expect(page.getByRole('alert')).toHaveText('Informe uma cidade com pelo menos 2 caracteres.');
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByRole('alert')).toHaveText('Enter a city with at least 2 characters.');
});

test('E2E-13 mensagem de cidade não encontrada é reescrita em inglês', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Cidade inexistente');
  await expect(page.getByRole('alert')).toHaveText('Cidade não encontrada. Revise o nome e tente novamente.');
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByRole('alert')).toHaveText('City not found. Check the name and try again.');
});

test('E2E-14 recarregar a página com EN ativo volta para PT-BR', async ({ page }) => {
  await page.goto('/');
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { name: 'O tempo da sua cidade, sem rodeios.' })).toBeVisible();
  await expect(page.getByRole('button', { name: PORTUGUESE_OPTION })).toHaveAttribute('aria-pressed', 'true');
});
