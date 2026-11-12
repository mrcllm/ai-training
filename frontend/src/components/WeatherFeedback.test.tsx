import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { weatherResponse } from '../test/weather-fixtures';
import { WeatherFeedback } from './WeatherFeedback';

describe('WeatherFeedback', () => {
  it('anuncia a consulta em andamento na região de status', () => {
    render(<WeatherFeedback state={{ status: 'loading' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Consultando as condições atuais…');
  });

  it('anuncia o sucesso com a localidade resolvida na mesma região de status (BUG-04)', () => {
    render(<WeatherFeedback state={{ status: 'success', data: weatherResponse }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Condições atuais carregadas para Lisboa, Lisboa, Portugal.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mantém a região de status no DOM entre carregamento e sucesso para que a mudança seja anunciada (BUG-04)', () => {
    const { rerender } = render(<WeatherFeedback state={{ status: 'loading' }} />);
    const statusRegion = screen.getByRole('status');
    rerender(<WeatherFeedback state={{ status: 'success', data: weatherResponse }} />);
    expect(screen.getByRole('status')).toBe(statusRegion);
  });

  it('anuncia erros como alerta textual', () => {
    render(<WeatherFeedback state={{ status: 'error', error: { kind: 'not-found', message: 'Cidade não encontrada.' } }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Cidade não encontrada.');
  });

  it('não apresenta mensagem no estado inicial', () => {
    render(<WeatherFeedback state={{ status: 'idle' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
