import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WeatherSearchForm } from './WeatherSearchForm';

describe('WeatherSearchForm', () => {
  it('submits a trimmed city name', () => {
    const onSearch = vi.fn();
    render(<WeatherSearchForm isLoading={false} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: '  Lisboa  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });

  it('shows validation feedback and does not submit a too short name', () => {
    const onSearch = vi.fn();
    render(<WeatherSearchForm isLoading={false} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 2 caracteres');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('disables controls while a search is loading', () => {
    render(<WeatherSearchForm isLoading onSearch={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Consultando…' })).toBeDisabled();
  });
});
