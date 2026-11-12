import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTemperatureUnit } from './useTemperatureUnit';

describe('useTemperatureUnit', () => {
  it('TU-07 começa em Celsius', () => {
    const { result } = renderHook(() => useTemperatureUnit());
    expect(result.current.unit).toBe('°C');
  });

  it('TU-08 alterna para Fahrenheit e volta para Celsius', () => {
    const { result } = renderHook(() => useTemperatureUnit());
    act(() => result.current.toggleUnit());
    const afterFirstToggle = result.current.unit;
    act(() => result.current.toggleUnit());
    expect([afterFirstToggle, result.current.unit]).toEqual(['°F', '°C']);
  });

  it('TU-09 aplica duas alternâncias disparadas no mesmo evento', () => {
    const { result } = renderHook(() => useTemperatureUnit());
    act(() => {
      result.current.toggleUnit();
      result.current.toggleUnit();
    });
    expect(result.current.unit).toBe('°C');
  });
});
