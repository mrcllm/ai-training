import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the weather panel and city search', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'O tempo da sua cidade, sem rodeios.' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled();
  });
});
