import { expect, type Locator, type Page } from '@playwright/test';

export type ElementBox = { x: number; y: number; width: number; height: number };

export const RESULT_SELECTOR = '[aria-labelledby="weather-result-title"]';
const MOCK_RESOLVED_LOCATION_HEADING = 'Paris, Île-de-France, França';
const CURRENT_TEMPERATURE_LABEL = 'Temperatura atual';

export async function searchCity(page: Page, city: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Cidade' }).fill(city);
  const weatherResponse = page.waitForResponse((response) => response.url().includes('/weather?'));
  await page.getByRole('button', { name: 'Consultar clima' }).click();
  await weatherResponse;
  await expect(page.getByRole('heading', { name: MOCK_RESOLVED_LOCATION_HEADING })).toBeVisible();
}

export async function requireBox(locator: Locator): Promise<ElementBox> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Elemento sem área visível na página');
  return box;
}

export async function expectTemperatures(page: Page, temperatures: string[]): Promise<void> {
  for (const temperature of temperatures) {
    await expect(page.getByText(temperature, { exact: true })).toBeVisible();
  }
}

export async function measureToggleDuration(page: Page): Promise<number> {
  return page.locator(RESULT_SELECTOR).evaluate((section, label) => new Promise<number>((resolve, reject) => {
    const labelElement = Array.from(section.querySelectorAll('span')).find((element) => element.textContent === label);
    const valueElement = labelElement?.previousElementSibling;
    const toggle = section.querySelector('button');
    if (!valueElement || !toggle) {
      reject(new Error('Temperatura atual ou botão de alternância não encontrados'));
      return;
    }
    const start = performance.now();
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve(performance.now() - start);
    });
    observer.observe(valueElement, { characterData: true, childList: true, subtree: true });
    toggle.click();
  }), CURRENT_TEMPERATURE_LABEL);
}
