import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { WeatherView } from './WeatherView';
import { portoWeatherResponse, weatherResponse } from '../test/weather-fixtures';
import { locationsHandler, readTemperatures, searchCity } from '../test/weather-view-helpers';
import type { WeatherResponse } from '../types/weather-response';

const WEATHER_URL = 'http://localhost:3001/weather';
const TOGGLE_NAME = /^Mostrar em °/;
const TOGGLE_REPETITIONS = 10;
const REPEATED_TOGGLES_WITHOUT_REQUEST = 3;
const server = setupServer(locationsHandler);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockWeatherResponses(responses: WeatherResponse[]): () => number {
  let calls = 0;
  server.use(http.get(WEATHER_URL, () => {
    const response = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return HttpResponse.json(response);
  }));
  return () => calls;
}

async function renderWithResult(): Promise<{ user: UserEvent; getCallCount: () => number }> {
  const getCallCount = mockWeatherResponses([weatherResponse, portoWeatherResponse]);
  const user = userEvent.setup();
  render(<WeatherView />);
  await searchCity(user, 'Lisboa');
  await screen.findByRole('heading', { name: 'Lisboa, Lisboa, Portugal' });
  return { user, getCallCount };
}

describe('WeatherView com alternância de unidade de temperatura', () => {
  it('TI-01 alternar após uma busca exibe as temperaturas em °F', async () => {
    const { user } = await renderWithResult();
    await user.click(screen.getByRole('button', { name: /^Mostrar em °F/ }));
    expect(readTemperatures()).toEqual(['65,1 °F', '64,2 °F']);
  });

  it('TI-02 alternar não faz nova requisição ao backend', async () => {
    const { user, getCallCount } = await renderWithResult();
    for (let toggle = 0; toggle < REPEATED_TOGGLES_WITHOUT_REQUEST; toggle += 1) await user.click(screen.getByRole('button', { name: TOGGLE_NAME }));
    expect(getCallCount()).toBe(1);
  });

  it('TI-03 alternar atualiza os valores sem estado de carregamento', async () => {
    const { user } = await renderWithResult();
    await user.click(screen.getByRole('button', { name: /^Mostrar em °F/ }));
    expect([readTemperatures()[0], screen.queryByText(/Consultando as condições atuais/)]).toEqual(['65,1 °F', null]);
  });

  it('TI-04 dez alternâncias restauram exatamente os valores originais', async () => {
    const { user } = await renderWithResult();
    for (let toggle = 0; toggle < TOGGLE_REPETITIONS; toggle += 1) await user.click(screen.getByRole('button', { name: TOGGLE_NAME }));
    expect(readTemperatures()).toEqual(['18,4 °C', '17,9 °C']);
  });

  it('TI-05 a unidade escolhida vale para a busca seguinte', async () => {
    const { user } = await renderWithResult();
    await user.click(screen.getByRole('button', { name: /^Mostrar em °F/ }));
    await searchCity(user, 'Porto');
    await screen.findByRole('heading', { name: 'Porto, Porto, Portugal' });
    expect([...readTemperatures(), screen.getByRole('button', { name: TOGGLE_NAME }).textContent]).toEqual(['50 °F', '46,4 °F', 'Mostrar em °C (Celsius)']);
  });

  it('TI-06 sem resultado não há botão de alternância', () => {
    render(<WeatherView />);
    expect(screen.queryByRole('button', { name: TOGGLE_NAME })).not.toBeInTheDocument();
  });

  it('TI-07 busca com erro não exibe o botão de alternância', async () => {
    server.use(http.get(WEATHER_URL, () => HttpResponse.json({ error: { code: 'LOCATION_NOT_FOUND' } }, { status: 404 })));
    const user = userEvent.setup();
    render(<WeatherView />);
    await searchCity(user, 'Atlantis');
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: TOGGLE_NAME })).not.toBeInTheDocument();
  });

  it.each([['Enter', '{Enter}'], ['Espaço', ' ']])('TI-08/TI-09 %s alterna a unidade e mantém o foco no botão', async (_keyName, key) => {
    const { user } = await renderWithResult();
    screen.getByRole('button', { name: /^Mostrar em °F/ }).focus();
    await user.keyboard(key);
    expect(readTemperatures()[0]).toBe('65,1 °F');
    expect(screen.getByRole('button', { name: /^Mostrar em °C/ })).toHaveFocus();
  });
});
