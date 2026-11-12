import type { KeyboardEvent } from 'react';

export type ComboboxNavigationInput = {
  optionCount: number;
  onSelectIndex: (index: number) => void;
};

export type ComboboxNavigation = {
  activeIndex: number;
  isOpen: boolean;
  reset: () => void;
  close: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
