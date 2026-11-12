import { LanguageProvider } from './i18n/LanguageProvider';
import { WeatherView } from './views/WeatherView';

export default function App() {
  return <LanguageProvider>
    <WeatherView />
  </LanguageProvider>;
}
