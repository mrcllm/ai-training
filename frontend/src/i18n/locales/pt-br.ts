import type { Messages } from '../../types/messages';
import { ptBrConditions } from './pt-br-conditions';

export const ptBrMessages: Messages = {
  document: { title: 'Clima agora — condições atuais por cidade' },
  languageSwitcher: { groupLabel: 'Idioma' },
  intro: {
    eyebrow: 'Painel de clima',
    title: 'O tempo da sua cidade, sem rodeios.',
    description: 'Consulte as condições atuais de qualquer cidade e encontre temperatura, umidade e vento em uma leitura rápida.',
    resolutionNote: 'Os dados são resolvidos pela localidade mais relevante encontrada para sua busca.',
  },
  search: {
    regionLabel: 'Consulta meteorológica',
    title: 'Qual é o clima agora?',
    description: 'Digite o nome de uma cidade para consultar o tempo neste momento.',
    cityLabel: 'Cidade',
    cityPlaceholder: 'Ex.: São Paulo',
    submit: 'Consultar clima',
    submitting: 'Consultando…',
  },
  validation: {
    'too-short': 'Informe uma cidade com pelo menos 2 caracteres.',
    'too-long': 'Use até 100 caracteres para o nome da cidade.',
  },
  feedback: { loading: 'Consultando as condições atuais…' },
  errors: {
    validation: 'Informe uma cidade com pelo menos 2 caracteres.',
    'not-found': 'Cidade não encontrada. Revise o nome e tente novamente.',
    unavailable: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
  },
  result: {
    locationEyebrow: 'Localidade encontrada',
    currentTemperature: 'Temperatura atual',
    apparentTemperature: 'Sensação térmica',
    humidity: 'Umidade relativa',
    windSpeed: 'Velocidade do vento',
  },
  source: { dataBy: 'Dados por' },
  conditions: ptBrConditions,
};
