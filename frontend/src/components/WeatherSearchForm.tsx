import { useLanguage } from '../hooks/useLanguage';
import { useLocationSelection } from '../hooks/useLocationSelection';
import { LocationAutocomplete } from './LocationAutocomplete';

type WeatherSearchFormProps = {
  isLoading: boolean;
  onSearch: (locationId: number) => void;
  onInvalid: () => void;
};

type SubmitButtonProps = {
  isLoading: boolean;
};

export function WeatherSearchForm({ isLoading, onSearch, onInvalid }: WeatherSearchFormProps) {
  const { messages } = useLanguage();
  const selection = useLocationSelection({ isLoading, onSearch, onInvalid });
  const error = selection.isSelectionMissing ? messages.search.selectionRequired : null;
  return <form onSubmit={selection.submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
    <LocationAutocomplete value={selection.value} selectedLocation={selection.selectedLocation} error={error}
      disabled={isLoading} onValueChange={selection.changeValue} onSelect={selection.select} />
    <SubmitButton isLoading={isLoading} />
  </form>;
}

function SubmitButton({ isLoading }: SubmitButtonProps) {
  const { messages } = useLanguage();
  return <button type="submit" aria-disabled={isLoading} className="h-12 shrink-0 rounded-xl bg-[#163f4b] px-6 font-semibold text-white transition-colors hover:bg-[#0f303a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6172] focus-visible:ring-offset-2 aria-disabled:cursor-wait aria-disabled:opacity-60 sm:mt-7">
    {isLoading ? messages.search.submitting : messages.search.submit}
  </button>;
}
