# Tarefa 2.0: Implementar autocomplete no frontend e validação E2E

## Visão geral

Consumir os contratos da tarefa 1.0 e entregar o fluxo completo de autocomplete no painel de clima. A tarefa inclui services e hooks, combobox acessível, seleção explícita por ID, integração com formulário e view, estados recuperáveis, preservação do resultado meteorológico, infraestrutura Playwright e validações funcionais, responsivas e de desempenho.

<skills>
### Conformidade com skills

- `executar-task` — obrigatória para conduzir a implementação incremental, atualizar esta tarefa e marcar subtarefas concluídas.
- `react` — obrigatória para componentes, hooks, integração com backend, acessibilidade, Tailwind CSS e testes do frontend. A skill e suas referências devem ser carregadas antes de editar código React.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as rules em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Preservar o fluxo `view -> components/hooks -> services -> backend`; componentes não devem chamar HTTP diretamente.
- Manter arquivos TypeScript com até 100 linhas, funções com até 30 linhas e componentes React com até 30 linhas.
- Usar props explícitas, estado sem redundância, identidade estável por ID, imutabilidade e uma única fonte de verdade para a seleção.
- Usar `useEffect` somente para timer/fetch e sempre limpar timer, request e recursos externos; respostas obsoletas não podem atualizar estado.
- Manter semântica HTML, foco visível, live regions, atributos ARIA e operação por teclado, mouse e toque.
- Usar Tailwind CSS no JSX e preservar responsividade sem depender exclusivamente de cor ou ícone.
- Implementar testes FIRST com Vitest/Testing Library/MSW e Playwright, cobertura global mínima de 80% e rede externa controlada.
- Executar no frontend `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:coverage` e `npm run build`; executar `npm test` em `e2e/`.
- Não há desvios planejados. Os scripts/configurações atuais prevalecem sobre as observações desatualizadas de portas e testes no `AGENTS.md`.
</rules>

<requirements>

- RF1–RF7: iniciar após dois caracteres, aplicar debounce de 300 ms, exibir até oito sugestões brasileiras e descartar respostas obsoletas.
- RF8–RF14: mostrar cidade/estado, permitir seleção por ponteiro e teclado, manter identidade por ID, invalidar edição e exigir seleção antes do submit explícito.
- RF15–RF19: comunicar loading, vazio e falha, limpar estados abaixo do limite e preservar o resultado meteorológico durante sugestões.
- RF20–RF24: implementar semântica de combobox/listbox/option, opção ativa, navegação por teclas, anúncios e foco visível.
- O frontend deve chamar somente `GET /locations` e `GET /weather?locationId=` no backend.
- A lista deve manter a ordem recebida, exibir atribuição e não selecionar implicitamente ao pressionar Tab.
- A experiência deve permanecer operável em 360 px e 1280 px e cumprir p95 de até 1 segundo em pelo menos 95% das amostras controladas.
- Não adicionar biblioteca de combobox, cache, persistência ou chamada direta à Open-Meteo.

</requirements>

## Subtarefas

- [x] 2.1 Criar tipos do frontend e implementar `location-service` com validação estrita do contrato e erros apresentáveis.
- [x] 2.2 Migrar `weather-service` e `useWeatherSearch` para `locationId`, preservando cancelamento e tratamento de erro.
- [x] 2.3 Implementar `useLocationSuggestions` com debounce, abort, sequência/query ativa, cleanup e estados discriminados.
- [x] 2.4 Implementar `useComboboxNavigation` e os componentes `LocationAutocomplete`, `LocationSuggestionsList` e `LocationSuggestionFeedback`.
- [x] 2.5 Integrar seleção/invalidação em `WeatherSearchForm`, reutilizar atribuição e atualizar `WeatherView` sem acoplar sugestões ao resultado.
- [x] 2.6 Implementar TU-08 a TU-16 e TI-07 com Testing Library, fake timers e MSW.
- [x] 2.7 Evoluir o mock Open-Meteo e a configuração Playwright para Search, Get, homônimos, vazio, erro, atraso e corrida.
- [x] 2.8 Implementar E2E-01 a E2E-05 e E2E-08 para fluxos funcionais, acessibilidade e isolamento de rede.
- [x] 2.9 Implementar E2E-06 e E2E-07 para responsividade, preservação de resultado e desempenho controlado.
- [x] 2.10 Executar validações completas de frontend, backend e E2E, corrigindo regressões e confirmando cobertura mínima de 80%.

## Desvios registrados

- MSW não está instalado neste repositório. Para não adicionar dependência, os testes de frontend substituem `fetch` na fronteira do backend com `src/test/backend-stub.ts`, o mesmo padrão já usado pelos testes existentes.
- No E2E-03, o estado de carregamento é observado retendo a requisição `/locations` no navegador até a asserção, porque a resposta lenta do mock (450 ms, abaixo do deadline de 600 ms) é curta demais para uma asserção estável sob execução paralela.

## Detalhes de implementação

Seguir as seções [Arquitetura do sistema](./techspec.md#arquitetura-do-sistema), [Principais interfaces](./techspec.md#principais-interfaces), [Modelos de dados](./techspec.md#modelos-de-dados), [Pontos de integração](./techspec.md#pontos-de-integração), [Principais decisões](./techspec.md#principais-decisões) e [Riscos conhecidos](./techspec.md#riscos-conhecidos).

Aplicar integralmente a [Abordagem de testes](./techspec.md#abordagem-de-testes). O foco DOM deve permanecer no input; `aria-activedescendant` representa a opção ativa; Enter seleciona; Escape fecha; Tab avança sem seleção implícita. Não repetir no código detalhes de contrato que pertencem aos services e tipos.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13
- CA-14
- CA-15

## Testes da tarefa

### Testes de unidade

- [x] TU-08 — Valida o contrato de `location-service`
- [x] TU-09 — Aplica debounce e limite mínimo no hook
- [x] TU-10 — Aborta e ignora respostas obsoletas
- [x] TU-11 — Navega no combobox por teclado
- [x] TU-12 — Expõe semântica e feedback acessíveis
- [x] TU-13 — Seleciona por mouse/toque sem perder o evento
- [x] TU-14 — Invalida seleção após edição
- [x] TU-15 — Consulta weather pelo `locationId`
- [x] TU-16 — Preserva resultado durante sugestões

### Testes de integração

- [x] TI-07 — Integra view, hooks e services do frontend

### Testes E2E

- [x] E2E-01 — Seleciona por ponteiro uma localidade homônima
- [x] E2E-02 — Conclui o fluxo completo por teclado
- [x] E2E-03 — Comunica carregamento, vazio, falha e recuperação
- [x] E2E-04 — Impede resposta antiga de substituir a atual
- [x] E2E-05 — Invalida seleção editada e bloqueia submit
- [x] E2E-06 — Mantém layout e resultado existente
- [x] E2E-07 — Cumpre o orçamento de sugestões
- [x] E2E-08 — Mantém a Open-Meteo fora do navegador

## Arquivos relevantes

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-autocomplete-localidade/techspec.md`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/LocationAutocomplete.tsx`
- `frontend/src/components/LocationSuggestionsList.tsx`
- `frontend/src/components/LocationSuggestionFeedback.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useLocationSuggestions.ts`
- `frontend/src/hooks/useComboboxNavigation.ts`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/location-service.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/location-suggestion.ts`
- `frontend/src/types/location-suggestions-response.ts`
- `frontend/src/types/location-search-state.ts`
- `frontend/src/types/ui-location-error.ts`
- `frontend/src/types/api-error.ts`
- Testes, fixtures e configuração Vitest correspondentes em `frontend/src/` e `frontend/vitest.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/playwright.config.ts`
- `e2e/weather-panel.spec.ts`
- `e2e/weather-panel-accessibility.spec.ts`
- `e2e/real-performance.spec.ts`
- `frontend/package.json`, `frontend/package-lock.json`, `e2e/package.json` e `e2e/package-lock.json`
