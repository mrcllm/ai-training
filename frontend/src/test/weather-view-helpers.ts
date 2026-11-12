import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export function readTemperatures(): Array<string | null | undefined> {
  return [screen.getByText('Temperatura atual').previousElementSibling?.textContent, screen.getByText('Sensação térmica').nextElementSibling?.textContent];
}

export async function searchCity(user: UserEvent, city: string): Promise<void> {
  const input = screen.getByRole('textbox', { name: 'Cidade' });
  await user.clear(input);
  await user.type(input, city);
  await user.click(screen.getByRole('button', { name: 'Consultar clima' }));
}
