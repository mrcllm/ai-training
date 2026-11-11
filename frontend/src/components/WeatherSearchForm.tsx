import { useState, type FormEvent } from 'react';

const MIN_CITY_CHARACTERS = 2;
const MAX_CITY_CHARACTERS = 100;

type WeatherSearchFormProps = {
  isLoading: boolean;
  onSearch: (city: string) => void;
};

function validateCity(city: string): string | null {
  const usefulCharacters = Array.from(city.replace(/\s/g, ''));
  if (usefulCharacters.length < MIN_CITY_CHARACTERS) return 'Informe uma cidade com pelo menos 2 caracteres.';
  if (Array.from(city).length > MAX_CITY_CHARACTERS) return 'Use até 100 caracteres para o nome da cidade.';
  return null;
}

export function WeatherSearchForm({ isLoading, onSearch }: WeatherSearchFormProps) {
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateCity(city.trim());
    setValidationError(error);
    if (!error) onSearch(city.trim());
  };
  return <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
    <div className="min-w-0 flex-1">
      <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-800">Cidade</label>
      <input id="city" name="city" value={city} onChange={(event) => { setCity(event.target.value); setValidationError(null); }}
        aria-invalid={validationError !== null} aria-describedby={validationError ? 'city-error' : undefined}
        autoComplete="address-level2" placeholder="Ex.: São Paulo" disabled={isLoading}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1b6172]/15 focus-visible:border-[#1b6172] disabled:bg-slate-100" />
      {validationError && <p id="city-error" role="alert" className="mt-2 text-sm font-medium text-red-800">{validationError}</p>}
    </div>
    <button type="submit" disabled={isLoading} className="h-12 shrink-0 rounded-xl bg-[#163f4b] px-6 font-semibold text-white transition-colors hover:bg-[#0f303a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4c95d]/60 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
      {isLoading ? 'Consultando…' : 'Consultar clima'}
    </button>
  </form>;
}
