import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useComboboxNavigation } from './useComboboxNavigation';

function keyEvent(key: string): KeyboardEvent<HTMLInputElement> & { preventDefault: ReturnType<typeof vi.fn> } {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement> & { preventDefault: ReturnType<typeof vi.fn> };
}

function renderNavigation(optionCount = 3) {
  const onSelectIndex = vi.fn();
  const hook = renderHook(({ count }) => useComboboxNavigation({ optionCount: count, onSelectIndex }), { initialProps: { count: optionCount } });
  const press = (key: string) => {
    const event = keyEvent(key);
    act(() => hook.result.current.handleKeyDown(event));
    return event;
  };
  return { ...hook, onSelectIndex, press };
}

describe('useComboboxNavigation (TU-11)', () => {
  it('abre sem opção ativa quando existem opções', () => {
    const { result } = renderNavigation();
    expect(result.current).toMatchObject({ isOpen: true, activeIndex: -1 });
  });

  it('percorre as opções com setas, com retorno circular', () => {
    const { result, press } = renderNavigation();
    press('ArrowDown');
    expect(result.current.activeIndex).toBe(0);
    press('ArrowUp');
    expect(result.current.activeIndex).toBe(2);
    press('ArrowDown');
    expect(result.current.activeIndex).toBe(0);
  });

  it('ArrowUp sem opção ativa vai para a última', () => {
    const { result, press } = renderNavigation();
    expect(press('ArrowUp').preventDefault).toHaveBeenCalled();
    expect(result.current.activeIndex).toBe(2);
  });

  it('Enter seleciona a opção ativa e impede o submit', () => {
    const { onSelectIndex, press } = renderNavigation();
    press('ArrowDown');
    press('ArrowDown');
    expect(press('Enter').preventDefault).toHaveBeenCalled();
    expect(onSelectIndex).toHaveBeenCalledWith(1);
  });

  it('Enter sem opção ativa não seleciona e deixa o formulário agir', () => {
    const { onSelectIndex, press } = renderNavigation();
    expect(press('Enter').preventDefault).not.toHaveBeenCalled();
    expect(onSelectIndex).not.toHaveBeenCalled();
  });

  it('Escape fecha a lista e a seta reabre', () => {
    const { result, press } = renderNavigation();
    press('ArrowDown');
    expect(press('Escape').preventDefault).toHaveBeenCalled();
    expect(result.current).toMatchObject({ isOpen: false, activeIndex: -1 });
    press('ArrowDown');
    expect(result.current.isOpen).toBe(true);
  });

  it('Tab fecha sem selecionar e sem bloquear o foco seguinte', () => {
    const { result, onSelectIndex, press } = renderNavigation();
    press('ArrowDown');
    expect(press('Tab').preventDefault).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
    expect(onSelectIndex).not.toHaveBeenCalled();
  });

  it('reset reabre a lista após edição', () => {
    const { result, press } = renderNavigation();
    press('Escape');
    act(() => result.current.reset());
    expect(result.current.isOpen).toBe(true);
  });

  it('ignora teclas e permanece fechada sem opções', () => {
    const { result, press } = renderNavigation(0);
    expect(press('ArrowDown').preventDefault).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ isOpen: false, activeIndex: -1 });
  });

  it('descarta índice ativo que deixou de existir', () => {
    const { result, press, rerender } = renderNavigation(3);
    press('ArrowUp');
    rerender({ count: 2 });
    expect(result.current.activeIndex).toBe(-1);
  });
});
