import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const EVIDENCE_DIRECTORY = '../tasks/prd-painel-de-clima/evidences';

test('captura estados visuais principais em mobile e desktop', async ({ page }) => {
  await mkdir(`${EVIDENCE_DIRECTORY}/screenshots`, { recursive: true });
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Cidade' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeEnabled();
    await page.screenshot({ path: `${EVIDENCE_DIRECTORY}/screenshots/idle-${width}.png`, fullPage: true });
    await page.getByRole('textbox', { name: 'Cidade' }).fill('Paris');
    await page.getByRole('button', { name: 'Consultar clima' }).click();
    await expect(page.getByRole('heading', { name: 'Paris, Île-de-France, França' })).toBeVisible();
    await page.screenshot({ path: `${EVIDENCE_DIRECTORY}/screenshots/success-${width}.png`, fullPage: true });
    await page.getByRole('textbox', { name: 'Cidade' }).fill('Falha externa');
    await page.getByRole('button', { name: 'Consultar clima' }).click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível consultar o clima');
    await page.screenshot({ path: `${EVIDENCE_DIRECTORY}/screenshots/error-${width}.png`, fullPage: true });
  }
});
