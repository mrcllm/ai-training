import { useCallback, useState, type KeyboardEvent } from 'react';
import type { ComboboxNavigation, ComboboxNavigationInput } from '../types/combobox-navigation';

const NO_OPTION = -1;

type KeyActions = {
  activeIndex: number;
  isOpen: boolean;
  move: (step: number) => void;
  select: (index: number) => void;
  close: () => void;
};

function nextIndex(current: number, step: number, count: number): number {
  if (current === NO_OPTION) return step > 0 ? 0 : count - 1;
  return (current + step + count) % count;
}

function handleComboboxKey(event: KeyboardEvent<HTMLInputElement>, actions: KeyActions): void {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    actions.move(event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter' && actions.activeIndex !== NO_OPTION) {
    event.preventDefault();
    actions.select(actions.activeIndex);
  } else if (event.key === 'Escape' && actions.isOpen) {
    event.preventDefault();
    actions.close();
  } else if (event.key === 'Tab') actions.close();
}

export function useComboboxNavigation({ optionCount, onSelectIndex }: ComboboxNavigationInput): ComboboxNavigation {
  const [rawIndex, setActiveIndex] = useState(NO_OPTION);
  const [isDismissed, setIsDismissed] = useState(false);
  const isOpen = optionCount > 0 && !isDismissed;
  const activeIndex = isOpen && rawIndex < optionCount ? rawIndex : NO_OPTION;
  const reset = useCallback((): void => {
    setActiveIndex(NO_OPTION);
    setIsDismissed(false);
  }, []);
  const close = useCallback((): void => {
    setActiveIndex(NO_OPTION);
    setIsDismissed(true);
  }, []);
  const move = (step: number): void => {
    setIsDismissed(false);
    setActiveIndex(isOpen ? nextIndex(activeIndex, step, optionCount) : NO_OPTION);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (optionCount > 0) handleComboboxKey(event, { activeIndex, isOpen, move, select: onSelectIndex, close });
  };
  return { activeIndex, isOpen, reset, close, handleKeyDown };
}
