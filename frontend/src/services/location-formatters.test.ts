import { describe, expect, it } from 'vitest';
import { formatSuggestionLabel, isSearchableQuery, normalizeLocationQuery, suggestionOptionId } from './location-formatters';
import { bomJesusPiaui, recife } from '../test/location-fixtures';

describe('location-formatters', () => {
  it('rotula a sugestão com cidade e estado', () => {
    expect(formatSuggestionLabel(bomJesusPiaui)).toBe('Bom Jesus, Piauí');
  });

  it('omite o estado ausente no rótulo', () => {
    expect(formatSuggestionLabel(recife)).toBe('Recife');
  });

  it('normaliza Unicode e espaços da query', () => {
    expect(normalizeLocationQuery('  São   Paulo ')).toBe('São Paulo');
  });

  it.each([['', false], ['a', false], [' a ', false], ['ab', true], ['a'.repeat(100), true], ['a'.repeat(101), false]])(
    'considera "%s" pesquisável = %s',
    (query, expected) => expect(isSearchableQuery(query)).toBe(expected),
  );

  it('gera ID de opção estável a partir do ID da localidade', () => {
    expect(suggestionOptionId('lista', recife)).toBe('lista-option-3390760');
  });
});
