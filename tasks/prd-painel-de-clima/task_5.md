# Tarefa 5.0: Expor e validar o endpoint `GET /weather`

## Visão geral

Conectar a fundação do backend, o domínio e o adaptador externo em uma operação HTTP idempotente. A entrega valida a query, traduz resultados e erros para o contrato público e comprova a integração com Supertest sem abrir uma porta real.

## Dependências

- Tarefa 2.0 — app Express, configuração e middlewares globais.
- Tarefa 3.0 — contratos e validações do domínio.
- Tarefa 4.0 — adaptador Open-Meteo e serviço de orquestração.

<skills>
### Conformidade com skills

Nenhuma skill em `.agents/skills/` é específica para esta tarefa exclusivamente backend.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. A rota deve receber e validar a entrada, delegar regras de negócio ao serviço e montar a resposta HTTP, sem acessar diretamente a Open-Meteo. O serviço deve permanecer independente de Express. Os testes de integração devem usar Supertest contra `app.ts` e um `WeatherProvider` injetado, cobrindo status, payload, headers, erros e ausência de chamadas indevidas. Não há desvios previstos.
</rules>

<requirements>

- RF1: disponibilizar uma busca HTTP por nome de cidade.
- RF2: responder `400 INVALID_CITY` para entrada ausente ou fora dos limites sem chamar o provedor.
- RF3–RF4: retornar a primeira localidade com divisão administrativa e país normalizados.
- RF5–RF6: acionar geocodificação e previsão por meio do serviço de domínio.
- RF7: oferecer ao frontend um único endpoint próprio, sem expor chamadas externas ao navegador.
- RF8: devolver somente o contrato meteorológico normalizado.
- RF14–RF16: diferenciar `400`, `404`, `503` e `500` com mensagens públicas estáveis e sem resultado incorreto.
- Responder sucesso com `200`, `Cache-Control: no-store` e `X-Request-Id`.
- Preservar `/health` independente da Open-Meteo.
- Aplicar CORS, request ID, logging e middleware de erro à nova rota.
</requirements>

## Subtarefas

- [x] 5.1 Implementar a rota idempotente `GET /weather` e validar a query `city`.
- [x] 5.2 Injetar `getCurrentWeather` e o `WeatherProvider` pela composição do app.
- [x] 5.3 Mapear sucesso e erros de domínio para os status e envelopes especificados.
- [x] 5.4 Aplicar `Cache-Control: no-store`, `X-Request-Id`, CORS e logging à operação.
- [x] 5.5 Preservar `/health` sem consulta ao provedor meteorológico.
- [x] 5.6 Implementar os testes de integração TI-01 a TI-05 com Supertest.
- [x] 5.7 Executar build, testes e cobertura do backend.

## Detalhes de implementação

Seguir **Endpoints da API — GET /weather**, **Endpoints da API — GET /health**, **ApiError**, **Pontos de integração — Falhas** e **Abordagem de testes — Testes de integração** do `techspec.md`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07

## Testes da tarefa

### Testes de integração

- [x] TI-01 — Entrega o contrato HTTP de sucesso.
- [x] TI-02 — Rejeita query inválida na rota.
- [x] TI-03 — Diferencia cidade não encontrada.
- [x] TI-04 — Isola falhas e respostas inválidas da origem.
- [x] TI-05 — Preserva health check e middleware global.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/prd.md`
- `tasks/prd-painel-de-clima/techspec.md`
- `backend/src/app.ts`
- `backend/src/routes/weather-route.ts`
- `backend/src/routes/health-route.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/middleware/request-id.ts`
- `backend/src/weather-route.test.ts`
