import { fireEvent, screen } from '@testing-library/react';
import { stubBackend } from './backend-stub';
import { findSuggestions } from './location-fixtures';

const SUBMIT_BUTTON_NAME = /^(Consultar clima|Check weather)$/;

export function stubLocationSearch(): void {
  stubBackend((url) => ({ ok: true, body: findSuggestions(url.searchParams.get('query')) }));
}

export async function searchCity(city: string): Promise<void> {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: city } });
  fireEvent.click(await screen.findByRole('option', { name: new RegExp(`^${city}`) }));
  fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON_NAME }));
}

export function selectLanguage(name: 'PT Português (Brasil)' | 'EN English'): void {
  fireEvent.click(screen.getByRole('button', { name }));
}
