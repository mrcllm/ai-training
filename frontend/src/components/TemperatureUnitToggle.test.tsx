import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TemperatureUnitToggle } from './TemperatureUnitToggle';

describe('TemperatureUnitToggle', () => {
  it('TU-10 em Celsius oferece a troca para Fahrenheit', () => {
    render(<TemperatureUnitToggle unit="°C" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /^Mostrar em °F/ })).toBeInTheDocument();
  });

  it('TU-11 em Fahrenheit oferece a troca para Celsius', () => {
    render(<TemperatureUnitToggle unit="°F" onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /^Mostrar em °C/ })).toBeInTheDocument();
  });

  it('TU-12 chama onToggle uma vez por clique', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TemperatureUnitToggle unit="°C" onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: /^Mostrar em °F/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('TU-13 informa por status a unidade em uso', () => {
    render(<TemperatureUnitToggle unit="°F" onToggle={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Temperaturas exibidas em Fahrenheit');
  });

  it('TU-14 tem nome acessível que começa pelo rótulo visível', () => {
    render(<TemperatureUnitToggle unit="°C" onToggle={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Mostrar em °F (Fahrenheit)');
  });
});
