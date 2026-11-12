import type { Messages } from '../../types/messages';
import { ptBrConditions } from './pt-br-conditions';

export const ptBrMessages: Messages = {
  document: { title: 'Clima agora — condições atuais por cidade' },
  languageSwitcher: { groupLabel: 'Idioma' },
  intro: {
    eyebrow: 'Painel de clima',
    title: 'O tempo da sua cidade, sem rodeios.',
    description: 'Consulte as condições atuais de cidades do mundo todo e encontre temperatura, umidade e vento em uma leitura rápida.',
    resolutionNote: 'Os dados correspondem exatamente à localidade que você escolher na lista de sugestões.',
  },
  search: {
    regionLabel: 'Consulta meteorológica',
    title: 'Qual é o clima agora?',
    description: 'Digite o nome de uma cidade, escolha uma das sugestões e consulte o tempo neste momento.',
    cityLabel: 'Cidade',
    cityPlaceholder: 'Ex.: São Paulo',
    submit: 'Consultar clima',
    submitting: 'Consultando…',
    selectionRequired: 'Selecione uma localidade na lista de sugestões antes de consultar o clima.',
  },
  locationSearch: {
    listLabel: 'Sugestões de localidade',
    loading: 'Buscando localidades…',
    empty: 'Nenhuma localidade encontrada. Revise o texto digitado.',
    foundOne: '1 localidade encontrada. Use as setas para escolher e Enter para selecionar.',
    foundMany: '{count} localidades encontradas. Use as setas para escolher e Enter para selecionar.',
    retry: 'Tentar novamente',
  },
  locationErrors: {
    validation: 'Digite de 2 a 100 caracteres para buscar uma localidade.',
    unavailable: 'Não foi possível buscar localidades agora. Tente novamente.',
  },
  feedback: {
    loading: 'Consultando as condições atuais…',
    success: 'Condições atuais carregadas para {location}.',
  },
  errors: {
    validation: 'Selecione uma localidade da lista antes de consultar o clima.',
    'not-found': 'A localidade selecionada não está mais disponível. Selecione-a novamente.',
    unavailable: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
  },
  result: {
    locationEyebrow: 'Localidade selecionada',
    currentTemperature: 'Temperatura atual',
    apparentTemperature: 'Sensação térmica',
    humidity: 'Umidade relativa',
    windSpeed: 'Velocidade do vento',
  },
  temperatureUnit: { showIn: 'Mostrar em', displayedIn: 'Temperaturas exibidas em' },
  source: { weatherDataBy: 'Dados meteorológicos por', locationsBy: 'Localidades por', opensInNewTab: '(abre em nova aba)' },
  conditions: ptBrConditions,
};
