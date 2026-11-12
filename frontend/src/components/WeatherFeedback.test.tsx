import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithLanguage } from '../test/render-with-language';
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
    render(<WeatherFeedback state={{ status: 'error', error: { kind: 'not-found' } }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('A localidade selecionada não está mais disponível. Selecione-a novamente.');
  });

  it('não apresenta mensagem no estado inicial', () => {
    render(<WeatherFeedback state={{ status: 'idle' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('TU-14 WeatherFeedback exibe a mensagem de erro pelo kind no idioma ativo', () => {
    renderWithLanguage(<WeatherFeedback state={{ status: 'error', error: { kind: 'not-found' } }} />, 'en');

    expect(screen.getByRole('alert')).toHaveTextContent('The selected location is no longer available. Please select it again.');
  });

  it('TU-15 WeatherFeedback exibe a mensagem de carregamento em inglês', () => {
    renderWithLanguage(<WeatherFeedback state={{ status: 'loading' }} />, 'en');

    expect(screen.getByRole('status')).toHaveTextContent('Checking current conditions…');
  });

  it('anuncia o sucesso em inglês', () => {
    renderWithLanguage(<WeatherFeedback state={{ status: 'success', data: weatherResponse }} />, 'en');

    expect(screen.getByRole('status')).toHaveTextContent('Current conditions loaded for Lisboa, Lisboa, Portugal.');
  });
});
