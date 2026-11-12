import { expect, test } from '@playwright/test';
import { PARIS, cityInput, searchWeather, suggestions, trackRequests } from './autocomplete-support';

test('E2E-01b sugere e consulta uma cidade fora do Brasil', async ({ page }) => {
  const requests = trackRequests(page);
  await page.goto('/');
  await cityInput(page).fill('Paris');
  await expect(suggestions(page).getByRole('option')).toHaveText(['ParisÎle-de-France, França']);
  await searchWeather(page, 'Paris', /Paris/, PARIS);
  await expect(page.getByText('12,7 °C')).toBeVisible();
  expect(requests.filter((url) => url.includes('/weather?'))).toEqual([expect.stringContaining('locationId=2988507')]);
});
