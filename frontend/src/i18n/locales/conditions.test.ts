import { describe, expect, it } from 'vitest';
import type { WeatherConditionCode } from '../../types/weather-condition-code';
import { enConditions } from './en-conditions';
import { ptBrConditions } from './pt-br-conditions';

const BACKEND_AND_OPEN_METEO_LABELS: ReadonlyArray<[WeatherConditionCode, string, string]> = [
  [0, 'Céu limpo', 'Clear sky'],
  [1, 'Predominantemente limpo', 'Mainly clear'],
  [2, 'Parcialmente nublado', 'Partly cloudy'],
  [3, 'Encoberto', 'Overcast'],
  [45, 'Nevoeiro', 'Fog'],
  [48, 'Nevoeiro com geada', 'Depositing rime fog'],
  [51, 'Garoa leve', 'Light drizzle'],
  [53, 'Garoa moderada', 'Moderate drizzle'],
  [55, 'Garoa intensa', 'Dense drizzle'],
  [56, 'Garoa congelante leve', 'Light freezing drizzle'],
  [57, 'Garoa congelante intensa', 'Dense freezing drizzle'],
  [61, 'Chuva leve', 'Slight rain'],
  [63, 'Chuva moderada', 'Moderate rain'],
  [65, 'Chuva forte', 'Heavy rain'],
  [66, 'Chuva congelante leve', 'Light freezing rain'],
  [67, 'Chuva congelante forte', 'Heavy freezing rain'],
  [71, 'Neve leve', 'Slight snowfall'],
  [73, 'Neve moderada', 'Moderate snowfall'],
  [75, 'Neve forte', 'Heavy snowfall'],
  [77, 'Grãos de neve', 'Snow grains'],
  [80, 'Pancadas de chuva leves', 'Slight rain showers'],
  [81, 'Pancadas de chuva moderadas', 'Moderate rain showers'],
  [82, 'Pancadas de chuva violentas', 'Violent rain showers'],
  [85, 'Pancadas de neve leves', 'Slight snow showers'],
  [86, 'Pancadas de neve fortes', 'Heavy snow showers'],
  [95, 'Trovoada', 'Thunderstorm'],
  [96, 'Trovoada com granizo leve', 'Thunderstorm with slight hail'],
  [97, 'Trovoada forte', 'Heavy thunderstorm'],
  [99, 'Trovoada com granizo forte', 'Thunderstorm with heavy hail'],
];

describe('rótulos das condições do tempo', () => {
  it('TU-03 cobre exatamente os 29 códigos suportados pelo backend nos dois idiomas', () => {
    const supportedCodes = BACKEND_AND_OPEN_METEO_LABELS.map(([code]) => String(code));

    expect(Object.keys(ptBrConditions)).toEqual(supportedCodes);
    expect(Object.keys(enConditions)).toEqual(supportedCodes);
  });

  it.each(BACKEND_AND_OPEN_METEO_LABELS)('TU-03 código %i usa o rótulo PT do backend e o rótulo EN da Open-Meteo', (code, portuguese, english) => {
    expect(ptBrConditions[code]).toBe(portuguese);
    expect(enConditions[code]).toBe(english);
  });
});
