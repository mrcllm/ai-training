import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithLanguage } from '../test/render-with-language';
import { WeatherFeedback } from './WeatherFeedback';

describe('WeatherFeedback', () => {
  it('announces a pending search', () => {
    render(<WeatherFeedback isLoading />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('announces an error', () => {
    render(<WeatherFeedback isLoading={false} error={{ kind: 'not-found' }} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Cidade não encontrada. Revise o nome e tente novamente.');
  });

  it('renders no message when idle', () => {
    const { container } = render(<WeatherFeedback isLoading={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('TU-14 WeatherFeedback exibe a mensagem de erro pelo kind no idioma ativo', () => {
    renderWithLanguage(<WeatherFeedback isLoading={false} error={{ kind: 'not-found' }} />, 'en');

    expect(screen.getByRole('alert')).toHaveTextContent('City not found. Check the name and try again.');
  });

  it('TU-15 WeatherFeedback exibe a mensagem de carregamento em inglês', () => {
    renderWithLanguage(<WeatherFeedback isLoading />, 'en');

    expect(screen.getByRole('status')).toHaveTextContent('Checking current conditions…');
  });
});
