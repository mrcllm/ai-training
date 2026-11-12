import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { BOM_JESUS_RS, cityInput, searchWeather, suggestions } from './autocomplete-support';

const SCREENSHOTS = '../tasks/prd-autocomplete-localidade/evidences/screenshots';

test('captura estados visuais do autocomplete em mobile e desktop', async ({ page }) => {
  await mkdir(SCREENSHOTS, { recursive: true });
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await cityInput(page).fill('Bom Jesus');
    await expect(suggestions(page)).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOTS}/suggestions-${width}.png`, fullPage: true });
    await cityInput(page).fill('');
    await searchWeather(page, 'Bom Jesus', /Rio Grande do Sul/, BOM_JESUS_RS);
    await page.screenshot({ path: `${SCREENSHOTS}/success-${width}.png`, fullPage: true });
    await cityInput(page).fill('Falha externa');
    await expect(page.getByRole('alert')).toContainText('Não foi possível buscar localidades');
    await page.screenshot({ path: `${SCREENSHOTS}/error-${width}.png`, fullPage: true });
  }
});
