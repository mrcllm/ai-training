import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestedUrls, stubBackend, type BackendReply } from '../test/backend-stub';
import { bomJesusPiaui, bomJesusRioGrande, suggestionsResponse } from '../test/location-fixtures';
import { weatherResponse } from '../test/weather-fixtures';
import { WeatherView } from './WeatherView';

type WeatherReply = (locationId: string | null) => BackendReply;

const RESULT_HEADING = { name: 'Lisboa, Lisboa, Portugal' };

function stubPanelBackend(weather: WeatherReply, locations: BackendReply = { ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }) {
  return stubBackend((url) => (url.pathname === '/weather' ? weather(url.searchParams.get('locationId')) : locations));
}

function cityInput(): HTMLElement {
  return screen.getByRole('combobox', { name: 'Cidade' });
}

async function chooseAndSubmit(option: RegExp): Promise<void> {
  fireEvent.change(cityInput(), { target: { value: 'Bom Jesus' } });
  fireEvent.click(await screen.findByRole('option', { name: option }));
  fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));
}

afterEach(() => vi.unstubAllGlobals());

describe('WeatherView integrada a hooks e services (TI-07)', () => {
  it('percorre debounce, sugestões, seleção e consulta do clima pelo ID escolhido', async () => {
    const fetchMock = stubPanelBackend(() => ({ ok: true, body: weatherResponse }));
    render(<WeatherView />);
    await chooseAndSubmit(/Rio Grande do Sul/);
    expect(await screen.findByRole('heading', RESULT_HEADING)).toBeVisible();
    expect(requestedUrls(fetchMock)).toEqual([
      'http://localhost:3001/locations?query=Bom+Jesus',
      `http://localhost:3001/weather?locationId=${bomJesusRioGrande.id}`,
    ]);
  });

  it('não consulta o clima com texto livre sem seleção', async () => {
    const fetchMock = stubPanelBackend(() => ({ ok: true, body: weatherResponse }));
    render(<WeatherView />);
    fireEvent.change(cityInput(), { target: { value: 'Bom Jesus' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione uma localidade');
    expect(requestedUrls(fetchMock).some((url) => url.includes('/weather'))).toBe(false);
  });

  it('comunica lista vazia e falha de sugestões mantendo o campo editável', async () => {
    stubPanelBackend(() => ({ ok: true, body: weatherResponse }), { ok: true, body: suggestionsResponse([]) });
    render(<WeatherView />);
    fireEvent.change(cityInput(), { target: { value: 'zzzz' } });
    expect(await screen.findByText(/Nenhuma localidade encontrada/)).toBeVisible();
    stubPanelBackend(() => ({ ok: true, body: weatherResponse }), { ok: false, body: { error: { code: 'LOCATION_PROVIDER_UNAVAILABLE' } } });
    fireEvent.change(cityInput(), { target: { value: 'yyyy' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível buscar localidades');
    expect(cityInput()).not.toHaveAttribute('readonly');
  });

  it('pede nova seleção quando a localidade escolhida deixou de existir', async () => {
    stubPanelBackend(() => ({ ok: false, body: { error: { code: 'LOCATION_NOT_FOUND' } } }));
    render(<WeatherView />);
    await chooseAndSubmit(/Piauí/);
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecione-a novamente');
  });
});

describe('WeatherView preserva o resultado durante sugestões (TU-16)', () => {
  it('mantém o card de clima enquanto o usuário busca outra localidade', async () => {
    stubPanelBackend(() => ({ ok: true, body: weatherResponse }));
    render(<WeatherView />);
    await chooseAndSubmit(/Piauí/);
    await screen.findByRole('heading', RESULT_HEADING);
    fireEvent.change(cityInput(), { target: { value: 'Bom Jes' } });
    expect(await screen.findByRole('listbox')).toBeVisible();
    expect(screen.getByRole('heading', RESULT_HEADING)).toBeVisible();
  });

  it('remove o resultado anterior somente quando um envio sem seleção é recusado', async () => {
    stubPanelBackend(() => ({ ok: true, body: weatherResponse }));
    render(<WeatherView />);
    await chooseAndSubmit(/Piauí/);
    await screen.findByRole('heading', RESULT_HEADING);
    fireEvent.change(cityInput(), { target: { value: 'Outra' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));
    expect(screen.queryByRole('heading', RESULT_HEADING)).not.toBeInTheDocument();
  });
});
