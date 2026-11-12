import type { UiWeatherError } from './api-error';
import type { UiLocationError } from './ui-location-error';
import type { WeatherConditionCode } from './weather-condition-code';

export type Messages = Readonly<{
  document: Readonly<{ title: string }>;
  languageSwitcher: Readonly<{ groupLabel: string }>;
  intro: Readonly<{
    eyebrow: string;
    title: string;
    description: string;
    resolutionNote: string;
  }>;
  search: Readonly<{
    regionLabel: string;
    title: string;
    description: string;
    cityLabel: string;
    cityPlaceholder: string;
    submit: string;
    submitting: string;
    selectionRequired: string;
  }>;
  locationSearch: Readonly<{
    listLabel: string;
    loading: string;
    empty: string;
    foundOne: string;
    foundMany: string;
    retry: string;
  }>;
  locationErrors: Readonly<Record<UiLocationError['kind'], string>>;
  feedback: Readonly<{ loading: string; success: string }>;
  errors: Readonly<Record<UiWeatherError['kind'], string>>;
  result: Readonly<{
    locationEyebrow: string;
    currentTemperature: string;
    apparentTemperature: string;
    humidity: string;
    windSpeed: string;
  }>;
  temperatureUnit: Readonly<{ showIn: string; displayedIn: string }>;
  source: Readonly<{ weatherDataBy: string; locationsBy: string; opensInNewTab: string }>;
  conditions: Readonly<Record<WeatherConditionCode, string>>;
}>;
