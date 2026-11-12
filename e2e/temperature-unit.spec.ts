import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { RESULT_SELECTOR, expectTemperatures, measureToggleDuration, requireBox, searchCity } from './temperature-unit-helpers';

const MAX_TOGGLE_DURATION_MS = 100;
const MIN_TOUCH_TARGET_PX = 44;
const ALIGNMENT_TOLERANCE_PX = 1;
const NARROW_VIEWPORT = { width: 360, height: 800 };
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING_IMPACTS = ['critical', 'serious'];
const CELSIUS_TEMPERATURES = ['18.4 °C', '17.2 °C'];
const FAHRENHEIT_TEMPERATURES = ['65.1 °F', '63 °F'];

test('E2E-01 alterna para °F e mantém a escolha na busca seguinte', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Paris');
  await expectTemperatures(page, CELSIUS_TEMPERATURES);
  await page.getByRole('button', { name: /^Mostrar em °F/ }).click();
  await expectTemperatures(page, FAHRENHEIT_TEMPERATURES);
  await searchCity(page, 'Paris');
  await expectTemperatures(page, FAHRENHEIT_TEMPERATURES);
  await expect(page.getByRole('button', { name: /^Mostrar em °C/ })).toBeVisible();
});

test('E2E-02 recarregar a página volta para Celsius', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Paris');
  await page.getByRole('button', { name: /^Mostrar em °F/ }).click();
  await expectTemperatures(page, FAHRENHEIT_TEMPERATURES);
  await page.reload();
  await searchCity(page, 'Paris');
  await expectTemperatures(page, CELSIUS_TEMPERATURES);
  await expect(page.getByRole('button', { name: /^Mostrar em °F/ })).toBeVisible();
});

test('E2E-03 mantém o botão utilizável em tela de 360 px', async ({ page }) => {
  await page.setViewportSize(NARROW_VIEWPORT);
  await page.goto('/');
  await searchCity(page, 'Paris');
  const toggle = page.getByRole('button', { name: /^Mostrar em °F/ });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toBeInViewport({ ratio: 1 });
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
  const box = await requireBox(toggle);
  expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
});

test('E2E-04 exibe a nova unidade em até 100 ms', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Paris');
  const duration = await measureToggleDuration(page);
  expect(duration).toBeLessThanOrEqual(MAX_TOGGLE_DURATION_MS);
  await expectTemperatures(page, FAHRENHEIT_TEMPERATURES);
});

test('E2E-05 resultado em °F sem violações críticas ou sérias de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Paris');
  await page.getByRole('button', { name: /^Mostrar em °F/ }).click();
  await expectTemperatures(page, FAHRENHEIT_TEMPERATURES);
  const results = await new AxeBuilder({ page }).include(RESULT_SELECTOR).withTags(WCAG_TAGS).analyze();
  const blockingViolations = results.violations.filter((violation) => BLOCKING_IMPACTS.includes(violation.impact ?? ''));
  expect(blockingViolations.map((violation) => violation.id)).toEqual([]);
});

test('E2E-06 mantém o botão alinhado à caixa da temperatura quando o título quebra de linha', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Paris');
  const toggleBox = await requireBox(page.getByRole('button', { name: /^Mostrar em °F/ }));
  const highlightBox = await requireBox(page.getByText('Temperatura atual').locator('xpath=../..'));
  expect(Math.abs(toggleBox.x - highlightBox.x)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
  expect(Math.abs(toggleBox.width - highlightBox.width)).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
});
