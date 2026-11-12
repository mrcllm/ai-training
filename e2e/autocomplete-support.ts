import { expect, type Locator, type Page } from '@playwright/test';

export const BOM_JESUS_RS = 'Bom Jesus, Rio Grande do Sul, Brasil';
export const BOM_JESUS_PI = 'Bom Jesus, Piauí, Brasil';
export const RECIFE = 'Recife, Pernambuco, Brasil';
export const PARIS = 'Paris, Île-de-France, França';

export function cityInput(page: Page): Locator {
  return page.getByRole('combobox', { name: 'Cidade' });
}

export function suggestions(page: Page): Locator {
  return page.getByRole('listbox', { name: 'Sugestões de localidade' });
}

export async function chooseLocation(page: Page, query: string, option: RegExp): Promise<void> {
  await cityInput(page).fill(query);
  await suggestions(page).getByRole('option', { name: option }).click();
}

export async function searchWeather(page: Page, query: string, option: RegExp, heading: string): Promise<void> {
  await chooseLocation(page, query, option);
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}

export function trackRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  return requests;
}
