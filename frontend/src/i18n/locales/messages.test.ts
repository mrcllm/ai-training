import { describe, expect, it } from 'vitest';
import { enMessages } from './en';
import { ptBrMessages } from './pt-br';

type MessageEntry = [path: string, text: unknown];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function flattenMessages(node: Record<string, unknown>, prefix = ''): MessageEntry[] {
  return Object.entries(node).flatMap(([key, value]): MessageEntry[] => {
    const path = `${prefix}${key}`;
    if (isRecord(value)) return flattenMessages(value, `${path}.`);
    return [[path, value]];
  });
}

describe('dicionários de mensagens', () => {
  it('TU-01 dicionário en preenche todas as chaves de Messages com texto não vazio', () => {
    const portugueseEntries = flattenMessages(ptBrMessages);
    const englishEntries = flattenMessages(enMessages);

    expect(englishEntries.map(([path]) => path)).toEqual(portugueseEntries.map(([path]) => path));
    expect(englishEntries.filter(([, text]) => typeof text !== 'string' || text.trim() === '')).toEqual([]);
  });

  it('TU-02 nenhum texto do dicionário en é igual ao texto correspondente em pt-BR', () => {
    const portugueseTexts = new Map(flattenMessages(ptBrMessages));

    const untranslated = flattenMessages(enMessages).filter(([path, text]) => portugueseTexts.get(path) === text);

    expect(untranslated).toEqual([]);
  });
});
