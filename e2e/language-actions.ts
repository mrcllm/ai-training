import type { Page } from '@playwright/test';

export const PORTUGUESE_OPTION = 'PT Português (Brasil)';
export const ENGLISH_OPTION = 'EN English';
const SUBMIT_BUTTON_NAME = /^(Consultar clima|Check weather)$/;
const WEATHER_PATH = '/weather';
const SWITCH_WAIT_LIMIT_MS = 1000;

export function isWeatherRequest(url: URL): boolean {
  return url.pathname === WEATHER_PATH;
}

export async function searchCity(page: Page, city: string): Promise<void> {
  await page.getByRole('textbox').fill(city);
  await page.getByRole('button', { name: SUBMIT_BUTTON_NAME }).click();
}

export async function selectLanguage(page: Page, option: string): Promise<void> {
  await page.getByRole('button', { name: option }).click();
}

export async function holdWeatherResponses(page: Page): Promise<() => void> {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => { release = resolve; });
  await page.route(isWeatherRequest, async (route) => {
    await released;
    await route.continue();
  });
  return () => release();
}

export async function measureSwitchToEnglish(page: Page, expectedHeading: string): Promise<number> {
  return page.evaluate(async ({ heading, waitLimit }) => {
    const title = document.querySelector('h1');
    const startedAt = performance.now();
    document.querySelector<HTMLButtonElement>('button[lang="en"]')?.click();
    await new Promise<void>((resolve) => {
      const waitForEnglish = (): void => {
        if (title?.textContent === heading || performance.now() - startedAt > waitLimit) resolve();
        else requestAnimationFrame(waitForEnglish);
      };
      waitForEnglish();
    });
    return performance.now() - startedAt;
  }, { heading: expectedHeading, waitLimit: SWITCH_WAIT_LIMIT_MS });
}
