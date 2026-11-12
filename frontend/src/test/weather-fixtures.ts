import type { WeatherResponse } from '../types/weather-response';

export const weatherResponse: WeatherResponse = {
  location: { name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal' },
  current: {
    temperature: 18.4,
    apparentTemperature: 17.9,
    condition: { code: 2, label: 'Parcialmente nublado' },
    humidity: 72,
    windSpeed: 14.2,
  },
  units: { temperature: '°C', apparentTemperature: '°C', humidity: '%', windSpeed: 'km/h' },
  source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' },
};

export const portoWeatherResponse: WeatherResponse = {
  ...weatherResponse,
  location: { name: 'Porto', admin1: 'Porto', country: 'Portugal' },
  current: { ...weatherResponse.current, temperature: 10, apparentTemperature: 8 },
};
