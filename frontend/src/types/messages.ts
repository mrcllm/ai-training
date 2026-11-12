import type { UiWeatherError } from './api-error';
import type { CityValidationError } from './city-validation-error';
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
  }>;
  validation: Readonly<Record<CityValidationError, string>>;
  feedback: Readonly<{ loading: string }>;
  errors: Readonly<Record<UiWeatherError['kind'], string>>;
  result: Readonly<{
    locationEyebrow: string;
    currentTemperature: string;
    apparentTemperature: string;
    humidity: string;
    windSpeed: string;
  }>;
  temperatureUnit: Readonly<{ showIn: string; displayedIn: string }>;
  source: Readonly<{ dataBy: string }>;
  conditions: Readonly<Record<WeatherConditionCode, string>>;
}>;
