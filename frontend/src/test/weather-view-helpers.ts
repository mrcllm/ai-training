import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { findSuggestions } from './location-fixtures';

export const locationsHandler = http.get('http://localhost:3001/locations', ({ request }) => (
  HttpResponse.json(findSuggestions(new URL(request.url).searchParams.get('query')))
));

export function readTemperatures(): Array<string | null | undefined> {
  return [screen.getByText('Temperatura atual').previousElementSibling?.textContent, screen.getByText('Sensação térmica').nextElementSibling?.textContent];
}

export async function searchCity(user: UserEvent, city: string): Promise<void> {
  const input = screen.getByRole('combobox', { name: 'Cidade' });
  await user.clear(input);
  await user.type(input, city);
  await user.click(await screen.findByRole('option', { name: new RegExp(`^${city}`) }));
  await user.click(screen.getByRole('button', { name: 'Consultar clima' }));
}
