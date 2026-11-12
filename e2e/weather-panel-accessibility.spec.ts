import { expect, test, type Locator } from '@playwright/test';
import { BOM_JESUS_PI, BOM_JESUS_RS, cityInput, searchWeather, suggestions } from './autocomplete-support';

const FOCUS_RING_COLOR = 'rgb(27, 97, 114)';

async function focusRingOf(control: Locator): Promise<string> {
  return control.evaluate((element) => getComputedStyle(element).boxShadow);
}

test('E2E-02 conclui o fluxo completo por teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const input = cityInput(page);
  await expect(input).toBeFocused();
  await page.keyboard.type('Bom Jesus');
  await expect(page.getByRole('status').filter({ hasText: '2 localidades encontradas' })).toBeAttached();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const active = suggestions(page).getByRole('option', { name: /Rio Grande do Sul/ });
  await expect(active).toHaveAttribute('aria-selected', 'true');
  await expect(input).toHaveAttribute('aria-activedescendant', await active.getAttribute('id') ?? '');
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(suggestions(page)).toHaveCount(0);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Bom Jesus, Piauí');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: BOM_JESUS_PI })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Open-Meteo (abre em nova aba)' })).toBeFocused();
});

test('E2E-02b Tab fecha as sugestões sem selecionar e avança o foco', async ({ page }) => {
  await page.goto('/');
  await cityInput(page).fill('Bom Jesus');
  await expect(suggestions(page)).toBeVisible();
  await cityInput(page).press('ArrowDown');
  await cityInput(page).press('Tab');
  await expect(suggestions(page)).toHaveCount(0);
  await expect(cityInput(page)).toHaveValue('Bom Jesus');
  await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeFocused();
});

test('E2E-06 mantém layout sem overflow e preserva o resultado durante novas sugestões', async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await searchWeather(page, 'Bom Jesus', /Rio Grande do Sul/, BOM_JESUS_RS);
    await cityInput(page).fill('Bom Jes');
    await expect(suggestions(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: BOM_JESUS_RS })).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
  }
});

test('mantém o foco no botão durante e após a consulta (BUG-02)', async ({ page }) => {
  await page.goto('/');
  await cityInput(page).fill('Lençóis');
  await suggestions(page).getByRole('option', { name: /Lençóis Paulista/ }).click();
  await page.getByRole('button', { name: 'Consultar clima' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Consultando…' })).toBeFocused();
  await expect(page.getByText('Consultando as condições atuais…')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lençóis Paulista, São Paulo, Brasil' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Consultar clima' })).toBeFocused();
});

test('exibe indicador de foco visível no combobox, no botão e no link (BUG-03)', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  expect(await focusRingOf(cityInput(page))).toContain(FOCUS_RING_COLOR);
  await page.keyboard.type('Bom Jesus');
  await expect(suggestions(page)).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  expect(await focusRingOf(page.getByRole('button', { name: 'Consultar clima' }))).toContain(FOCUS_RING_COLOR);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: BOM_JESUS_PI })).toBeVisible();
  await page.keyboard.press('Tab');
  const link = page.getByRole('link', { name: 'Open-Meteo (abre em nova aba)' });
  await expect(link).toBeFocused();
  expect(await focusRingOf(link)).toContain(FOCUS_RING_COLOR);
});
