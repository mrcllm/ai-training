import { describe, expect, it } from 'vitest';
import { getConditionLabel } from './condition-label';
import { enConditions } from './locales/en-conditions';
import { ptBrConditions } from './locales/pt-br-conditions';

describe('getConditionLabel', () => {
  it('TU-04 getConditionLabel retorna o rótulo do idioma ativo para código conhecido', () => {
    const condition = { code: 2, label: 'Parcialmente nublado' };

    expect(getConditionLabel(condition, enConditions)).toBe('Partly cloudy');
    expect(getConditionLabel(condition, ptBrConditions)).toBe('Parcialmente nublado');
  });

  it('TU-05 getConditionLabel usa o label do backend para código desconhecido', () => {
    const condition = { code: 42, label: 'Condição recebida do backend' };

    const label = getConditionLabel(condition, enConditions);

    expect(label).toBe('Condição recebida do backend');
  });
});
