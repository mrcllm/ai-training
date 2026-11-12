import { fireEvent, screen } from '@testing-library/react';

const SUBMIT_BUTTON_NAME = /^(Consultar clima|Check weather)$/;

export function searchCity(city: string): void {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: city } });
  fireEvent.click(screen.getByRole('button', { name: SUBMIT_BUTTON_NAME }));
}

export function selectLanguage(name: 'PT Português (Brasil)' | 'EN English'): void {
  fireEvent.click(screen.getByRole('button', { name }));
}
