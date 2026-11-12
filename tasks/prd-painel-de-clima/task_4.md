# Tarefa 4.0: Integrar a Open-Meteo e orquestrar a consulta

## Visão geral

Implementar o adaptador da Open-Meteo e o serviço de domínio que executa geocodificação e previsão em sequência. A entrega usa um único orçamento de timeout, não faz retry ou cache e converte todas as falhas externas previstas em erros estáveis da aplicação.

## Dependências

- Tarefa 2.0 — configuração, erros e observabilidade do backend.
- Tarefa 3.0 — contratos, normalização, tradução WMO e parsers externos.

<skills>
### Conformidade com skills

Nenhuma skill em `.agents/skills/` é específica para esta tarefa de integração backend.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. O adaptador deve ficar em `data/`, a orquestração em `services/` e os contratos compartilhados em `types/`, sem dependências reversas. A implementação deve usar `async/await`, APIs assíncronas, `fetch` nativo, `AbortSignal`, configuração por ambiente e tratamento de erros com contexto sem vazar payloads. Testes não podem depender de rede real, relógio real ou ordem de execução. Não há desvios previstos.
</rules>

<requirements>

- RF5: resolver o nome informado pela Geocoding API da Open-Meteo.
- RF6: consultar as condições atuais usando as coordenadas do primeiro resultado.
- RF8: construir o contrato normalizado definido na TechSpec.
- Solicitar `count=1`, `language=pt` e `format=json` na geocodificação.
- Solicitar somente as cinco variáveis atuais exigidas e unidades métricas explícitas na previsão.
- Compartilhar um único orçamento de 2,5 segundos entre as duas chamadas sequenciais.
- Não executar retry, cache, persistência ou chamadas paralelas.
- Converter timeout, rede, limite, HTTP não `2xx`, JSON inválido e payload incompatível em `WEATHER_PROVIDER_UNAVAILABLE`.
- Converter apenas uma lista de geocodificação válida e vazia em `CITY_NOT_FOUND`.
- Não registrar cidade bruta, coordenadas ou corpos externos nos logs.
</requirements>

## Subtarefas

- [x] 4.1 Implementar o cliente Open-Meteo injetável usando as URLs configuradas.
- [x] 4.2 Montar os parâmetros mínimos e explícitos para geocodificação e previsão.
- [x] 4.3 Implementar o timeout compartilhado e a propagação de cancelamento.
- [x] 4.4 Implementar `getCurrentWeather` sobre a interface `WeatherProvider`.
- [x] 4.5 Selecionar exclusivamente o primeiro resultado e consultar suas coordenadas.
- [x] 4.6 Mapear falhas externas e cancelar o fluxo sem retry.
- [x] 4.7 Registrar eventos de sucesso e falha por etapa sem dados sensíveis.
- [x] 4.8 Implementar TU-06 e TU-07 com provider, fetch e relógio controlados.

## Detalhes de implementação

Seguir **Design de implementação — Principais interfaces**, **Parâmetros fixos na origem**, **Pontos de integração**, **Monitoramento e observabilidade** e as decisões sobre `fetch`, timeout, retry e cache em **Considerações técnicas** do `techspec.md`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-07
- CA-09

## Testes da tarefa

### Testes de unidade

- [x] TU-06 — Orquestra geocodificação e previsão.
- [x] TU-07 — Converte falhas do provedor sem retry.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/techspec.md`
- `backend/src/config/environment.ts`
- `backend/src/data/open-meteo-client.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/types/weather-provider.ts`
- `backend/src/types/weather-response.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/observability/logger.ts`
