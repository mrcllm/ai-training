import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherFeedback } from './WeatherFeedback';

describe('WeatherFeedback', () => {
  it('announces a pending search', () => {
    render(<WeatherFeedback isLoading />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('announces an error', () => {
    render(<WeatherFeedback isLoading={false} error={{ kind: 'not-found', message: 'Cidade não encontrada.' }} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Cidade não encontrada.');
  });

  it('renders no message when idle', () => {
    const { container } = render(<WeatherFeedback isLoading={false} />);

    expect(container).toBeEmptyDOMElement();
  });
});
