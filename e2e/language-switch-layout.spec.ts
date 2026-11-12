import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ENGLISH_OPTION, PORTUGUESE_OPTION, searchCity, selectLanguage } from './language-actions';

type Box = { x: number; y: number; width: number; height: number };

const VIEWPORT_WIDTHS = [360, 1280];
const VIEWPORT_HEIGHT = 900;
const MIN_TARGET_SIZE = 44;
const MAX_CORNER_DISTANCE = 48;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING_IMPACTS = ['critical', 'serious'];

function intersects(first: Box, second: Box): boolean {
  return first.x < second.x + second.width && second.x < first.x + first.width
    && first.y < second.y + second.height && second.y < first.y + first.height;
}

async function requireBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, `caixa de ${locator.toString()}`).not.toBeNull();
  return box ?? { x: 0, y: 0, width: 0, height: 0 };
}

async function expectSwitcherLayout(page: Page, eyebrow: string): Promise<void> {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const switcher = await requireBox(page.getByRole('group'));
  expect(viewportWidth - (switcher.x + switcher.width)).toBeLessThanOrEqual(MAX_CORNER_DISTANCE);
  expect(switcher.y + switcher.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
  expect(intersects(switcher, await requireBox(page.getByText(eyebrow, { exact: true })))).toBe(false);
  expect(intersects(switcher, await requireBox(page.getByRole('heading', { level: 2 })))).toBe(false);
  for (const option of await page.getByRole('group').getByRole('button').all()) {
    const optionBox = await requireBox(option);
    expect(Math.min(optionBox.width, optionBox.height)).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
}

async function findBlockingViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations
    .filter((violation) => BLOCKING_IMPACTS.includes(violation.impact ?? ''))
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
}

for (const width of VIEWPORT_WIDTHS) {
  test(`E2E-16 seletor fica no canto superior direito, sem rolagem nem sobreposição, em ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto('/');
    await expectSwitcherLayout(page, 'Painel de clima');
    await selectLanguage(page, ENGLISH_OPTION);
    await expectSwitcherLayout(page, 'Weather panel');
  });
}

test('E2E-15 seletor é operável por teclado e mantém o foco após a troca', async ({ page }) => {
  const portugueseOption = page.getByRole('button', { name: PORTUGUESE_OPTION });
  const englishOption = page.getByRole('button', { name: ENGLISH_OPTION });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(englishOption).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(englishOption).toHaveAttribute('aria-pressed', 'true');
  await expect(englishOption).toBeFocused();
  await expect(page.getByRole('group', { name: 'Language' })).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Space');
  await expect(portugueseOption).toHaveAttribute('aria-pressed', 'true');
  await expect(portugueseOption).toBeFocused();
});

test('E2E-17 verificação automatizada sem violações críticas ou sérias em PT e em EN no estado inicial', async ({ page }) => {
  await page.goto('/');
  expect(await findBlockingViolations(page)).toEqual([]);
  await selectLanguage(page, ENGLISH_OPTION);
  expect(await findBlockingViolations(page)).toEqual([]);
});

test('E2E-17 verificação automatizada sem violações críticas ou sérias em PT e em EN com resultado', async ({ page }) => {
  await page.goto('/');
  await searchCity(page, 'Curitiba');
  await expect(page.getByText('Predominantemente limpo')).toBeVisible();
  expect(await findBlockingViolations(page)).toEqual([]);
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByText('Mainly clear')).toBeVisible();
  expect(await findBlockingViolations(page)).toEqual([]);
});
