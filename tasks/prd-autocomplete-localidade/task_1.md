# Tarefa 1.0: Implementar contratos, integração e endpoints do backend

## Visão geral

Implementar toda a fundação server-side do autocomplete: contratos de localidades, validações, parsers, integração Search/Get/Forecast da Open-Meteo, serviço de sugestões, consulta meteorológica por `locationId` e os endpoints HTTP correspondentes. A entrega deve deixar o backend funcional e testado de forma isolada, pronto para o frontend consumir.

<skills>
### Conformidade com skills

- `executar-task` — obrigatória para conduzir a implementação incremental, atualizar esta tarefa e marcar subtarefas concluídas.
- Nenhuma skill de frontend é aplicável; esta tarefa fica restrita ao backend Node.js/Express.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as rules em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Preservar o fluxo `routes -> services -> data` e impedir dependências circulares.
- Manter arquivos TypeScript com até 100 linhas, funções com até 30 linhas e no máximo três parâmetros ou um objeto de entrada.
- Usar `const`, comparações estritas, imutabilidade, tipos explícitos, `unknown` nas fronteiras e nunca `any`.
- Usar `async/await` e APIs não bloqueantes; propagar erros até a camada com contexto para traduzi-los.
- Ler URLs e timeouts do ambiente validado, atualizar `.env.example` sem credenciais e preservar os lock files npm.
- Usar somente o logger centralizado, sem registrar query, ID, nome, coordenadas ou payload externo.
- Implementar testes FIRST com Vitest, mocks apenas na fronteira externa e cobertura global mínima de 80% para linhas, branches, funções e statements.
- Executar `npm run build`, `npm test` e `npm run test:coverage` dentro de `backend/`.
- Não há desvios planejados. O conflito preexistente de portas descrito no `AGENTS.md` não altera os scripts e configurações executáveis atuais.
</rules>

<requirements>

- RF1: aceitar buscas de sugestões somente a partir de dois caracteres úteis.
- RF3–RF7: limitar a oito resultados, aceitar localidades de qualquer país, preservar a normalização da origem e impedir resultados incompatíveis com a consulta atual.
- RF8 e RF10: fornecer cidade, estado quando disponível e uma identidade inequívoca para cada sugestão.
- RF13: aceitar consulta meteorológica somente por uma localidade selecionada válida.
- RF16–RF18: diferenciar lista vazia, indisponibilidade e entrada abaixo do limite.
- O frontend não pode chamar a Open-Meteo; Search, Get e Forecast devem permanecer no backend.
- `GET /locations` deve ser idempotente, `no-store`, sem cache/retry e com deadline de 600 ms.
- `GET /weather` deve substituir `city` por `locationId` e preservar o orçamento total de 2,5 segundos.
- Nenhum dado de busca ou seleção deve ser persistido.

</requirements>

## Subtarefas

- [x] 1.1 Criar os tipos de localidade, atualizar `ResolvedLocation`, `WeatherProvider` e os códigos públicos de erro.
- [x] 1.2 Implementar e testar a normalização de query e de `locationId`, incluindo limites Unicode e `Int32`.
- [x] 1.3 Separar e testar os parsers de busca e lookup, com fixtures válidas, vazias, parciais, de outros países e inválidas.
- [x] 1.4 Estender `open-meteo-client` para Search, Get e Forecast com parâmetros fixos, cancelamento e respostas not-found.
- [x] 1.5 Atualizar configuração e `.env.example` com a URL de lookup e o timeout dedicado das sugestões.
- [x] 1.6 Implementar `search-locations` e migrar `get-current-weather` para resolver exatamente o ID selecionado, de qualquer país.
- [x] 1.7 Criar `GET /locations`, migrar `GET /weather`, registrar as rotas em `app.ts` e adicionar logs/cancelamento HTTP.
- [x] 1.8 Implementar os testes unitários TU-01 a TU-07 e os testes de integração TI-01 a TI-06.
- [x] 1.9 Executar build, testes e cobertura do backend, corrigindo regressões até atingir os limiares definidos.

## Detalhes de implementação

Seguir as seções [Arquitetura do sistema](./techspec.md#arquitetura-do-sistema), [Principais interfaces](./techspec.md#principais-interfaces), [Modelos de dados](./techspec.md#modelos-de-dados), [Endpoints da API](./techspec.md#endpoints-da-api), [Pontos de integração](./techspec.md#pontos-de-integração) e [Monitoramento e observabilidade](./techspec.md#monitoramento-e-observabilidade).

Usar a [Abordagem de testes](./techspec.md#abordagem-de-testes) como fonte de verdade para nomes, cenários e rastreabilidade. Não reintroduzir busca meteorológica por nome nem adicionar cache, retry, persistência, SDK ou biblioteca de schema.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-07
- CA-08
- CA-09
- CA-10

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — Normaliza query Unicode e aplica limites
- [x] TU-02 — Valida o identificador selecionado
- [x] TU-03 — Interpreta até oito sugestões
- [x] TU-04 — Rejeita payloads de geocodificação inválidos
- [x] TU-05 — Monta URLs corretas da Open-Meteo
- [x] TU-06 — Busca sugestões com deadline e sem retry
- [x] TU-07 — Consulta o clima pelo ID escolhido

### Testes de integração

- [x] TI-01 — Entrega sugestões e lista vazia em `GET /locations`
- [x] TI-02 — Rejeita query inválida sem consultar a origem
- [x] TI-03 — Isola falha externa da busca
- [x] TI-04 — Consulta exatamente a localidade selecionada
- [x] TI-05 — Diferencia ID inválido, ausente e estrangeiro válido
- [x] TI-06 — Preserva middleware e cancelamento HTTP

### Testes E2E

Não aplicável nesta tarefa; os fluxos completos dependem do frontend e pertencem à tarefa 2.0.

## Arquivos relevantes

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-autocomplete-localidade/techspec.md`
- `backend/.env.example`
- `backend/src/app.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/locations-route.ts`
- `backend/src/routes/weather-route.ts`
- `backend/src/services/search-locations.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/services/normalize-location-query.ts`
- `backend/src/services/normalize-location-id.ts`
- `backend/src/data/open-meteo-client.ts`
- `backend/src/data/parse-location-search-response.ts`
- `backend/src/data/parse-location-response.ts`
- `backend/src/data/provider-error.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/observability/logger.ts`
- `backend/src/types/api-error.ts`
- `backend/src/types/location-suggestion.ts`
- `backend/src/types/location-suggestions-response.ts`
- `backend/src/types/resolved-location.ts`
- `backend/src/types/weather-provider.ts`
- Testes e fixtures correspondentes em `backend/src/`
- `backend/vitest.config.ts`
- `backend/package.json` e `backend/package-lock.json`
