import { expect, test } from '@playwright/test';
import { ENGLISH_OPTION, selectLanguage } from './language-actions';

const ACTIVE_OPTION_COLORS = { background: 'rgb(22, 63, 75)', text: 'rgb(255, 255, 255)' };

test('BUG-01 opção ativa assume as cores finais de alto contraste no quadro seguinte à troca', async ({ page }) => {
  await page.goto('/');
  await selectLanguage(page, ENGLISH_OPTION);
  await expect(page.getByRole('button', { name: ENGLISH_OPTION })).toHaveAttribute('aria-pressed', 'true');
  const colors = await page.evaluate(async () => {
    const option = document.querySelector<HTMLButtonElement>('button[lang="pt-BR"]');
    option?.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const style = option ? getComputedStyle(option) : undefined;
    return { background: style?.backgroundColor, text: style?.color };
  });
  expect(colors).toEqual(ACTIVE_OPTION_COLORS);
});
