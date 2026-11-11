import { expect, test } from '@playwright/test';

test('E2E-06 permite concluir a busca e acessar a fonte pelo teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Cidade' })).toBeFocused();
  await page.keyboard.type('Paris');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeFocused();
  await page.keyboard.press('Enter');
  const result = page.getByRole('heading', { name: 'Paris, Île-de-France, França' });
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute('id', 'weather-result-title');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Open-Meteo/ })).toBeFocused();
  await expect(page.getByRole('link', { name: /Open-Meteo/ })).toHaveAttribute('href', 'https://open-meteo.com/');
});

test('E2E-07 mantém controles utilizáveis sem rolagem horizontal', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
    await expect(page.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeEnabled();
  }
});
