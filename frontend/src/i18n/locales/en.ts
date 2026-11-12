import type { Messages } from '../../types/messages';
import { enConditions } from './en-conditions';

export const enMessages: Messages = {
  document: { title: 'Weather now — current conditions by city' },
  languageSwitcher: { groupLabel: 'Language' },
  intro: {
    eyebrow: 'Weather panel',
    title: "Your city's weather, straight to the point.",
    description: 'Check current conditions for any city and see temperature, humidity and wind at a glance.',
    resolutionNote: 'Data is based on the most relevant location found for your search.',
  },
  search: {
    regionLabel: 'Weather lookup',
    title: "What's the weather right now?",
    description: 'Enter a city name to check the current weather.',
    cityLabel: 'City',
    cityPlaceholder: 'E.g., São Paulo',
    submit: 'Check weather',
    submitting: 'Checking…',
  },
  validation: {
    'too-short': 'Enter a city with at least 2 characters.',
    'too-long': 'Use up to 100 characters for the city name.',
  },
  feedback: { loading: 'Checking current conditions…' },
  errors: {
    validation: 'Enter a city with at least 2 characters.',
    'not-found': 'City not found. Check the name and try again.',
    unavailable: "We couldn't check the weather right now. Please try again in a moment.",
  },
  result: {
    locationEyebrow: 'Location found',
    currentTemperature: 'Current temperature',
    apparentTemperature: 'Feels like',
    humidity: 'Relative humidity',
    windSpeed: 'Wind speed',
  },
  temperatureUnit: { showIn: 'Show in', displayedIn: 'Temperatures shown in' },
  source: { dataBy: 'Data by' },
  conditions: enConditions,
};
