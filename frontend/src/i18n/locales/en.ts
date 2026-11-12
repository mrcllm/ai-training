import type { Messages } from '../../types/messages';
import { enConditions } from './en-conditions';

export const enMessages: Messages = {
  document: { title: 'Weather now — current conditions by city' },
  languageSwitcher: { groupLabel: 'Language' },
  intro: {
    eyebrow: 'Weather panel',
    title: "Your city's weather, straight to the point.",
    description: 'Check current conditions for cities around the world and see temperature, humidity and wind at a glance.',
    resolutionNote: 'Data matches exactly the location you choose from the suggestion list.',
  },
  search: {
    regionLabel: 'Weather lookup',
    title: "What's the weather right now?",
    description: 'Type a city name, pick one of the suggestions and check the current weather.',
    cityLabel: 'City',
    cityPlaceholder: 'E.g., São Paulo',
    submit: 'Check weather',
    submitting: 'Checking…',
    selectionRequired: 'Select a location from the suggestion list before checking the weather.',
  },
  locationSearch: {
    listLabel: 'Location suggestions',
    loading: 'Searching locations…',
    empty: 'No locations found. Check what you typed.',
    foundOne: '1 location found. Use the arrow keys to choose and Enter to select.',
    foundMany: '{count} locations found. Use the arrow keys to choose and Enter to select.',
    retry: 'Try again',
  },
  locationErrors: {
    validation: 'Type 2 to 100 characters to search for a location.',
    unavailable: "We couldn't search for locations right now. Please try again.",
  },
  feedback: {
    loading: 'Checking current conditions…',
    success: 'Current conditions loaded for {location}.',
  },
  errors: {
    validation: 'Select a location from the list before checking the weather.',
    'not-found': 'The selected location is no longer available. Please select it again.',
    unavailable: "We couldn't check the weather right now. Please try again in a moment.",
  },
  result: {
    locationEyebrow: 'Selected location',
    currentTemperature: 'Current temperature',
    apparentTemperature: 'Feels like',
    humidity: 'Relative humidity',
    windSpeed: 'Wind speed',
  },
  temperatureUnit: { showIn: 'Show in', displayedIn: 'Temperatures shown in' },
  source: { weatherDataBy: 'Weather data by', locationsBy: 'Locations by', opensInNewTab: '(opens in a new tab)' },
  conditions: enConditions,
};
