# Especificação técnica

## Resumo

Esta especificação detalha a implementação do [PRD de autocomplete de localidade](./prd.md) sobre o painel de clima existente. O backend continuará como única fronteira com a Open-Meteo e passará a expor duas leituras idempotentes: `GET /locations?query=` para até oito sugestões brasileiras e `GET /weather?locationId=` para resolver a opção selecionada e obter as condições atuais. O identificador numérico da Open-Meteo será a identidade estável compartilhada entre os dois contratos; nomes ou coordenadas enviados pelo navegador não serão usados como autoridade.

No frontend, um combobox React próprio seguirá o padrão WAI-ARIA de autocomplete por lista com seleção manual. Um hook isolará debounce de 300 ms, cancelamento e proteção contra respostas obsoletas; outro isolará a navegação por teclado. A solução reutilizará `fetch`, `AbortController`, Vitest, Testing Library, MSW e Playwright já presentes, sem biblioteca nova de produção, persistência, cache ou retry. A busca de sugestões terá deadline de 600 ms no backend; a consulta meteorológica preservará o orçamento total existente de 2,5 segundos.

## Arquitetura do sistema

### Visão dos componentes

O fluxo de sugestões será:

~~~text
WeatherSearchForm
  -> LocationAutocomplete
    -> useLocationSuggestions(query)
      -> location-service
        -> GET /locations?query=...
          -> locations-route
            -> search-locations
              -> WeatherProvider.searchLocations
                -> Open-Meteo /v1/search
~~~

O fluxo da consulta meteorológica será:

~~~text
WeatherSearchForm(selectedLocation.id)
  -> useWeatherSearch
    -> weather-service
      -> GET /weather?locationId=...
        -> weather-route
          -> get-current-weather
            -> WeatherProvider.getLocation
              -> Open-Meteo /v1/get
            -> WeatherProvider.getCurrentConditions
              -> Open-Meteo /v1/forecast
~~~

Componentes novos:

- `backend/src/routes/locations-route.ts` — expõe `GET /locations`, aplica `Cache-Control: no-store`, vincula o fechamento da resposta ao cancelamento e registra o desfecho sem gravar a query.
- `backend/src/services/search-locations.ts` — orquestra busca, deadline de 600 ms, cancelamento, mapeamento para o contrato público e ausência de retry.
- `backend/src/services/normalize-location-query.ts` — normaliza NFC e espaços, valida de 2 a 100 caracteres e rejeita queries não escalares.
- `backend/src/services/normalize-location-id.ts` — aceita um único inteiro decimal positivo dentro do intervalo `Int32` da origem.
- `backend/src/data/parse-location-search-response.ts` — refina a resposta `unknown` de `/v1/search`, preserva a ordem e limita a oito localidades brasileiras.
- `backend/src/data/parse-location-response.ts` — refina o objeto `unknown` de `/v1/get` e diferencia localidade ausente de payload inválido.
- `backend/src/types/location-suggestion.ts` — contrato público de cada sugestão.
- `backend/src/types/location-suggestions-response.ts` — envelope de sugestões e atribuição.
- `frontend/src/services/location-service.ts` — chama somente o backend, valida o envelope e converte falhas em erro apresentável.
- `frontend/src/hooks/useLocationSuggestions.ts` — controla debounce, `AbortController`, sequência da requisição, cleanup e estado discriminado.
- `frontend/src/hooks/useComboboxNavigation.ts` — controla opção ativa, abertura e teclas de navegação sem mover o foco DOM para a lista.
- `frontend/src/components/LocationAutocomplete.tsx` — compõe campo, feedback, lista e atribuição com semântica de combobox.
- `frontend/src/components/LocationSuggestionsList.tsx` — renderiza `listbox` e `option` com IDs estáveis.
- `frontend/src/components/LocationSuggestionFeedback.tsx` — anuncia carregamento, quantidade, ausência e falha por live region.
- `frontend/src/types/location-suggestion.ts` — espelho tipado do item retornado pelo backend.
- `frontend/src/types/location-suggestions-response.ts` — espelho do envelope de sugestões.
- `frontend/src/types/location-search-state.ts` — estados mutuamente exclusivos da busca de sugestões.
- `frontend/src/types/ui-location-error.ts` — erro de integração pronto para apresentação.

Componentes modificados:

- `backend/src/types/weather-provider.ts` — substitui `findLocations` por `searchLocations` e acrescenta `getLocation`; `getCurrentConditions` permanece.
- `backend/src/types/resolved-location.ts` — acrescenta `id` e `countryCode` ao modelo interno.
- `backend/src/data/open-meteo-client.ts` — cria URLs separadas para busca, consulta por ID e previsão; mantém validação HTTP/JSON e cancelamento.
- `backend/src/services/get-current-weather.ts` — recebe `locationId`, resolve a localidade exata, confirma `countryCode=BR` e consulta suas coordenadas.
- `backend/src/routes/weather-route.ts` — troca a query `city` por `locationId` e preserva request ID, `no-store` e observabilidade.
- `backend/src/app.ts` — registra a nova rota e compõe os dois serviços com o mesmo provedor injetável.
- `backend/src/config/environment.ts` e `backend/.env.example` — acrescentam URL de consulta por ID e timeout das sugestões.
- `backend/src/types/api-error.ts`, `backend/src/errors/app-error.ts` e `backend/src/middleware/error-handler.ts` — incorporam os novos códigos sem alterar o envelope público.
- `backend/src/data/provider-error.ts` — diferencia indisponibilidade de localização e de clima mantendo detalhes somente nos logs.
- `frontend/src/components/WeatherSearchForm.tsx` — guarda a sugestão selecionada, invalida-a ao editar e impede envio sem seleção válida.
- `frontend/src/hooks/useWeatherSearch.ts` — passa `locationId` ao service e mantém o estado meteorológico independente das sugestões.
- `frontend/src/services/weather-service.ts` — usa `locationId` em vez de `city`.
- `frontend/src/views/WeatherView.tsx` — atualiza a cópia que hoje afirma escolher a localidade mais relevante e preserva o resultado durante buscas de sugestões.
- `frontend/src/components/SourceAttribution.tsx` — é reutilizado junto das sugestões, sem duplicar o contrato visual de atribuição.
- `frontend/src/types/api-error.ts` — passa a reconhecer os novos códigos públicos.
- Fixtures e testes próximos aos módulos acima — deixam de assumir envio livre por nome e primeiro resultado automático.
- `e2e/mock-open-meteo.mjs` — simula busca com IDs, lookup por ID, homônimos, vazio, erro, atraso e respostas fora de ordem.
- `e2e/playwright.config.ts` — injeta também a URL controlada de `/v1/get`.
- Specs em `e2e/` — selecionam uma sugestão antes de consultar o clima.

Não haverá banco de dados nem armazenamento em memória entre requisições. Texto digitado, seleção e coordenadas existirão apenas durante a interação ou a requisição ativa.

## Design de implementação

### Principais interfaces

O provedor continuará independente de Express:

~~~text
WeatherProvider
  searchLocations(query, signal) -> Promise<ResolvedLocation[]>
  getLocation(locationId, signal) -> Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>

searchLocations(query, dependencies) -> Promise<LocationSuggestionsResponse>
getCurrentWeather(locationId, dependencies) -> Promise<WeatherResponse>
~~~

O frontend separará infraestrutura, estado assíncrono e interação:

~~~text
fetchLocationSuggestions(query, signal) -> Promise<LocationSuggestionsResponse>
useLocationSuggestions(query) -> { state, retry }
useComboboxNavigation(input) -> { activeIndex, isOpen, handlers }
fetchWeather(locationId, signal) -> Promise<WeatherResponse>
useWeatherSearch() -> { state, search(locationId) }
~~~

`LocationAutocomplete` será controlado por props explícitas:

~~~text
LocationAutocomplete
  value: string
  selectedLocation: LocationSuggestion | null
  error: string | null
  disabled: boolean
  onValueChange(value)
  onSelect(suggestion)
~~~

O foco DOM permanecerá no `input`. A opção ativa será comunicada por `aria-activedescendant`, e a seleção somente ocorrerá por clique/toque ou Enter sobre uma opção ativa.

### Modelos de dados

#### `LocationSuggestion` — localidade brasileira pronta para seleção

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `number` inteiro positivo | sim | Identificador estável da Open-Meteo usado na consulta do clima. |
| `name` | `string` | sim | Nome localizado da cidade ou localidade. |
| `admin1` | `string \| null` | sim | Estado ou primeira divisão administrativa; `null` quando ausente. |
| `country` | `string \| null` | sim | País localizado; `null` quando ausente. |

~~~text
{
  "id": 3448439,
  "name": "São Paulo",
  "admin1": "São Paulo",
  "country": "Brasil"
}
~~~

> **Localidade parcial:** campos opcionais omitidos pela origem serão normalizados para `null`. O `id`, o nome, as coordenadas e `country_code` válidos continuam obrigatórios no modelo interno.

~~~text
{
  "id": 3390760,
  "name": "Recife",
  "admin1": null,
  "country": "Brasil"
}
~~~

#### `LocationSuggestionsResponse` — envelope de resultados do autocomplete

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `suggestions` | `LocationSuggestion[]` | sim | De zero a oito itens, na ordem devolvida pela origem. |
| `source` | `SourceAttribution` | sim | Atribuição para exibição próxima às sugestões. |

~~~text
{
  "suggestions": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "admin1": "São Paulo",
      "country": "Brasil"
    }
  ],
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

> **Sem correspondências:** lista vazia é sucesso de domínio, não erro nem indisponibilidade.

~~~text
{
  "suggestions": [],
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

#### `ResolvedLocation` — modelo interno validado da Open-Meteo

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `number` inteiro positivo | sim | Identidade retornada pela geocodificação. |
| `name` | `string` | sim | Nome normalizado em NFC. |
| `admin1` | `string \| null` | sim | Primeira divisão administrativa normalizada. |
| `country` | `string \| null` | sim | País normalizado. |
| `countryCode` | `string` | sim | Código ISO de duas letras; deve ser `BR` no fluxo público. |
| `latitude` | `number` | sim | Coordenada finita entre -90 e 90. |
| `longitude` | `number` | sim | Coordenada finita entre -180 e 180. |

~~~text
{
  "id": 3448439,
  "name": "São Paulo",
  "admin1": "São Paulo",
  "country": "Brasil",
  "countryCode": "BR",
  "latitude": -23.5475,
  "longitude": -46.63611
}
~~~

Esse tipo não atravessa a fronteira HTTP por conter coordenadas desnecessárias à UI.

#### `WeatherResponse` — condições da localidade selecionada

O contrato existente será preservado; muda apenas a forma de determinar `location`.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | sim | Localidade resolvida pelo `locationId` selecionado. |
| `current` | `CurrentConditions` | sim | Condições atuais normalizadas. |
| `units` | `WeatherUnits` | sim | Unidades métricas explícitas. |
| `source` | `SourceAttribution` | sim | Atribuição visível da Open-Meteo. |

~~~text
{
  "location": {
    "name": "São Paulo",
    "admin1": "São Paulo",
    "country": "Brasil"
  },
  "current": {
    "temperature": 24.1,
    "apparentTemperature": 25.0,
    "condition": { "code": 2, "label": "Parcialmente nublado" },
    "humidity": 68,
    "windSpeed": 11.4
  },
  "units": {
    "temperature": "°C",
    "apparentTemperature": "°C",
    "humidity": "%",
    "windSpeed": "km/h"
  },
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

#### `LocationSearchState` — estado discriminado do autocomplete

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `status` | `idle \| loading \| success \| empty \| error` | sim | Discriminante da fase atual. |
| `query` | `string` | exceto em `idle` | Query à qual o estado pertence. |
| `data` | `LocationSuggestion[]` | em `success` | Sugestões válidas e não vazias. |
| `source` | `SourceAttribution` | em `success` ou `empty` | Atribuição recebida do backend. |
| `error` | `UiLocationError` | em `error` | Erro pronto para apresentação. |

~~~text
{
  "status": "success",
  "query": "Sao",
  "data": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "admin1": "São Paulo",
      "country": "Brasil"
    }
  ],
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

O estado volta a `idle` imediatamente quando a entrada tem menos de dois caracteres úteis. Uma resposta só poderá produzir `success`, `empty` ou `error` se seu `AbortController` e sua sequência ainda forem os ativos e sua query corresponder ao texto atual.

#### `ApiError` — envelope de erro

| Código | HTTP | Significado |
| --- | --- | --- |
| `INVALID_LOCATION_QUERY` | `400` | Query ausente, repetida, não textual, curta ou acima de 100 caracteres. |
| `INVALID_LOCATION_ID` | `400` | ID ausente, repetido, não decimal, não positivo ou fora de `Int32`. |
| `LOCATION_NOT_FOUND` | `404` | ID não existe mais ou resolve uma localidade fora do Brasil. |
| `LOCATION_PROVIDER_UNAVAILABLE` | `503` | Timeout, rede, HTTP ou payload inválido durante a busca de sugestões. |
| `WEATHER_PROVIDER_UNAVAILABLE` | `503` | Falha no lookup selecionado ou na previsão, exceto ausência reconhecida. |
| `INVALID_REQUEST` | `400` | JSON inválido em rotas que aceitem corpo; preservado no middleware global. |
| `INTERNAL_ERROR` | `500` | Falha interna não classificada. |

~~~text
{
  "error": {
    "code": "LOCATION_PROVIDER_UNAVAILABLE",
    "message": "Não foi possível buscar localidades agora. Tente novamente."
  }
}
~~~

O payload nunca conterá URL externa, stack, query digitada, coordenadas ou mensagem bruta do provedor.

#### Mapeamento Open-Meteo → contratos

| Origem (Open-Meteo) | Destino |
| --- | --- |
| `results[].id` | `LocationSuggestion.id` e `ResolvedLocation.id` |
| `results[].name` | `LocationSuggestion.name` e `ResolvedLocation.name` |
| `results[].admin1` ausente ou vazio | `admin1 = null` |
| `results[].country` ausente ou vazio | `country = null` |
| `results[].country_code` | filtro `BR` e `ResolvedLocation.countryCode` |
| `results[].latitude`, `longitude` | uso interno em `ResolvedLocation` |
| objeto `/v1/get` | `ResolvedLocation` usado pela consulta meteorológica |
| `current.*` e `current_units.*` | `WeatherResponse.current` e `WeatherResponse.units`, conforme contrato existente |

`/v1/search` será truncado em oito entradas antes do mapeamento. Entradas não brasileiras serão removidas como defesa adicional sem reordenar as restantes. Um item brasileiro estruturalmente inválido tornará o payload inválido e gerará `503`, evitando oferecer uma seleção sem identidade confiável.

#### Parâmetros fixos na origem

| API | Parâmetros principais |
| --- | --- |
| **Geocoding Search** | `name=<query normalizada>`, `count=8`, `language=pt`, `countryCode=BR`, `format=json` |
| **Geocoding Get** | `id=<locationId>`, `language=pt` |
| **Weather Forecast** | `latitude`, `longitude`, `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto` |

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/locations` | Retorna até oito sugestões brasileiras para a query. |
| `GET` | `/weather` | Retorna o clima da localidade selecionada por ID. |

`GET /health` permanece inalterado e independente da Open-Meteo.

---

#### `GET /locations`

Busca localidades brasileiras e devolve um contrato pronto para o combobox.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `query` | `string` | — | Obrigatório e único; NFC, trim e compactação de espaços; ao menos 2 caracteres não brancos e no máximo 100 pontos de código. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `LocationSuggestionsResponse` | Busca válida com zero a oito sugestões. |
| `400` | `ApiError(INVALID_LOCATION_QUERY)` | Query inválida. |
| `503` | `ApiError(LOCATION_PROVIDER_UNAVAILABLE)` | Deadline, rede, HTTP ou payload externo inválido. |
| `500` | `ApiError(INTERNAL_ERROR)` | Falha interna inesperada. |

**Exemplo — sucesso**

~~~http
GET /locations?query=Sao
~~~

~~~text
{
  "suggestions": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "admin1": "São Paulo",
      "country": "Brasil"
    },
    {
      "id": 3388368,
      "name": "São Luís",
      "admin1": "Maranhão",
      "country": "Brasil"
    }
  ],
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

**Exemplo — nenhuma correspondência**

~~~http
GET /locations?query=zzzzzz
~~~

~~~text
{
  "suggestions": [],
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/"
  }
}
~~~

> O frontend transforma a lista vazia em estado `empty`, anuncia “Nenhuma localidade encontrada” e mantém o campo editável.

**Exemplo — entrada inválida**

~~~http
GET /locations?query=A
~~~

~~~text
{
  "error": {
    "code": "INVALID_LOCATION_QUERY",
    "message": "Digite de 2 a 100 caracteres para buscar uma localidade."
  }
}
~~~

**Exemplo — origem indisponível**

~~~http
GET /locations?query=Recife
~~~

~~~text
{
  "error": {
    "code": "LOCATION_PROVIDER_UNAVAILABLE",
    "message": "Não foi possível buscar localidades agora. Tente novamente."
  }
}
~~~

> A operação é idempotente, usa `Cache-Control: no-store`, não faz retry nem cache e possui deadline total de 600 ms. O cancelamento do navegador fecha a requisição e aborta o `fetch` ativo à origem.

---

#### `GET /weather`

Resolve o ID selecionado na Open-Meteo, confirma que pertence ao Brasil e consulta as condições atuais de suas coordenadas.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `locationId` | `string decimal` | — | Obrigatório e único; inteiro entre 1 e 2.147.483.647. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherResponse` | ID brasileiro resolvido e previsão válida. |
| `400` | `ApiError(INVALID_LOCATION_ID)` | ID ausente ou inválido. |
| `404` | `ApiError(LOCATION_NOT_FOUND)` | ID não encontrado ou fora do Brasil. |
| `503` | `ApiError(WEATHER_PROVIDER_UNAVAILABLE)` | Lookup ou previsão indisponível ou inválido. |
| `500` | `ApiError(INTERNAL_ERROR)` | Falha interna inesperada. |

**Exemplo — sucesso**

~~~http
GET /weather?locationId=3448439
~~~

O corpo é o `WeatherResponse` documentado em **Modelos de dados**.

**Exemplo — seleção inexistente**

~~~http
GET /weather?locationId=1
~~~

~~~text
{
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "A localidade selecionada não está mais disponível. Selecione-a novamente."
  }
}
~~~

> A resposta reconhecida de “ID não encontrado” da origem gera `404`. Outros erros HTTP ou formatos inesperados de `/v1/get` geram `503`.

**Exemplo — ID inválido**

~~~http
GET /weather?locationId=abc
~~~

~~~text
{
  "error": {
    "code": "INVALID_LOCATION_ID",
    "message": "Selecione uma localidade válida antes de consultar o clima."
  }
}
~~~

**Exemplo — provedor indisponível**

~~~http
GET /weather?locationId=3448439
~~~

~~~text
{
  "error": {
    "code": "WEATHER_PROVIDER_UNAVAILABLE",
    "message": "O serviço de clima está temporariamente indisponível."
  }
}
~~~

> `GET /weather?city=` deixa de ser aceito. A quebra é controlada porque o frontend deste repositório é o único consumidor conhecido; testes e mocks serão migrados na mesma entrega.

---

## Pontos de integração

- **Geocoding Search:** `https://geocoding-api.open-meteo.com/v1/search`. A [documentação oficial](https://open-meteo.com/en/docs/geocoding-api) define `count`, `language`, `countryCode`, busca exata com dois caracteres, prefixo normalizado a partir de três e IDs resolvíveis por `/v1/get`.
- **Geocoding Get:** `https://geocoding-api.open-meteo.com/v1/get`. O backend envia somente o ID selecionado e `language=pt`; o retorno é validado novamente e precisa ter `country_code=BR`.
- **Weather Forecast:** `https://api.open-meteo.com/v1/forecast`. A integração existente permanece, usando somente variáveis atuais e unidades métricas necessárias.
- **Autenticação:** o uso não comercial atual não exige chave. Uma futura migração comercial deverá trocar endpoints/credenciais somente por configuração do backend, nunca expor segredo ao frontend.
- **Atribuição:** o envelope de sugestões e o de clima carregam `SourceAttribution`. A UI mostra o link próximo aos dados conforme a [licença da Open-Meteo](https://open-meteo.com/en/licence).
- **Deadline e cancelamento das sugestões:** um `AbortController` interno combina deadline de 600 ms com o `AbortSignal` da rota. A troca da query ou o unmount aborta a chamada do frontend; o fechamento HTTP aborta o trabalho do backend.
- **Deadline do clima:** um único orçamento de 2,5 segundos continua compartilhado entre lookup por ID e previsão. A segunda etapa recebe apenas o tempo restante.
- **Falhas:** não haverá retry automático. Lista válida vazia vira `200`; ID reconhecidamente ausente vira `404`; timeout, erro de rede, limite, HTTP inesperado, JSON inválido ou campo obrigatório inválido viram `503`.
- **Idempotência e privacidade:** as duas rotas são `GET`, `no-store` e sem efeitos persistentes. Logs não conterão a query, nome escolhido, ID, coordenadas ou corpos externos.

## Abordagem de testes

Vitest continuará separado em frontend e backend, com cobertura V8 mínima global de 80% para linhas, branches, funções e statements. Os testes seguirão FIRST e a pirâmide: regras, parsers, hooks e componentes em unidade; contratos HTTP e colaboração real em integração; poucos fluxos críticos no Playwright. Rede externa será substituída por mocks ou servidor local determinístico; um smoke real opcional não bloqueará CI.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | Normaliza query Unicode e aplica limites | CA-01, CA-02, CA-10 | NFC e espaços são normalizados; entradas com menos de 2 ou mais de 100 caracteres são recusadas. |
| TU-02 | Valida o identificador selecionado | CA-04, CA-05 | Aceita um único inteiro `Int32` positivo e rejeita ausente, array, decimal, zero, negativo e excesso. |
| TU-03 | Interpreta até oito sugestões brasileiras | CA-01, CA-03, CA-08 | Preserva IDs e ordem, normaliza opcionais, limita oito e não entrega país diferente. |
| TU-04 | Rejeita payloads de geocodificação inválidos | CA-09 | Ausência de ID, nome, país ou coordenada obrigatória gera indisponibilidade estável. |
| TU-05 | Monta URLs corretas da Open-Meteo | CA-01, CA-02, CA-03, CA-04 | Search envia `count=8`, `language=pt` e `countryCode=BR`; lookup envia o ID; forecast usa as coordenadas resolvidas. |
| TU-06 | Busca sugestões com deadline e sem retry | CA-07, CA-08, CA-09 | Sucesso, vazio, cancelamento, timeout e falha são mapeados uma vez e o timer é limpo. |
| TU-07 | Consulta o clima pelo ID escolhido | CA-04, CA-05 | Resolve exatamente o ID, recusa localidade ausente/não brasileira e consulta apenas suas coordenadas. |
| TU-08 | Valida o contrato de `location-service` | CA-03, CA-08, CA-09 | Sucesso e vazio são aceitos; envelope inválido ou erro HTTP vira `UiLocationError`. |
| TU-09 | Aplica debounce e limite mínimo no hook | CA-01, CA-02, CA-10 | Não chama antes de 300 ms nem abaixo de dois caracteres e limpa estado ao reduzir a entrada. |
| TU-10 | Aborta e ignora respostas obsoletas | CA-06 | Somente a sequência e query ativas podem atualizar o estado. |
| TU-11 | Navega no combobox por teclado | CA-11 | Setas percorrem, Enter seleciona, Escape fecha e Tab fecha sem selecionar nem impedir foco seguinte. |
| TU-12 | Expõe semântica e feedback acessíveis | CA-07, CA-08, CA-09, CA-12 | Combobox, listbox, option, opção ativa e live region refletem cada estado. |
| TU-13 | Seleciona por mouse/toque sem perder o evento | CA-04 | A interação com opção ocorre antes do blur, fecha a lista e mantém a opção escolhida. |
| TU-14 | Invalida seleção após edição | CA-05 | Alterar qualquer caractere remove a identidade selecionada; submit exibe erro e não chama weather. |
| TU-15 | Consulta weather pelo `locationId` | CA-04, CA-05 | Service e hook enviam somente o ID, preservam cancelamento e mapeiam os novos erros. |
| TU-16 | Preserva resultado durante sugestões | CA-15 | Alterar query ou estados do autocomplete não modifica `WeatherSearchState` nem remove o card existente. |

Mocks serão usados somente nas fronteiras: `WeatherProvider`, `fetch`, relógio/timers e servidor HTTP simulado. Parsers, serviços de domínio, hooks e componentes serão exercitados diretamente com AAA ou Given/When/Then.

### Testes de integração

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | Entrega sugestões e lista vazia em `GET /locations` | CA-01, CA-03, CA-08 | Retorna 200, até oito itens ordenados, campos opcionais normalizados, fonte e vazio válido. |
| TI-02 | Rejeita query inválida sem consultar a origem | CA-01, CA-10 | Retorna 400 e `WeatherProvider.searchLocations` não é chamado. |
| TI-03 | Isola falha externa da busca | CA-07, CA-09 | Timeout, erro ou payload inválido retorna 503 sem detalhes e permite nova requisição independente. |
| TI-04 | Consulta exatamente a localidade selecionada | CA-04, CA-05 | `GET /weather?locationId=` resolve o ID e usa somente suas coordenadas na previsão. |
| TI-05 | Diferencia ID inválido, ausente e não brasileiro | CA-05, CA-09 | Retorna, respectivamente, 400 ou 404, sem consultar previsão quando não há localidade válida. |
| TI-06 | Preserva middleware e cancelamento HTTP | CA-07, CA-09 | Rotas emitem request ID, CORS, `no-store` e abortam a origem quando o cliente fecha. |
| TI-07 | Integra view, hooks e services do frontend | CA-04–CA-10, CA-15 | Com MSW, a tela percorre debounce, loading, sucesso, vazio, falha, seleção, submit e preservação do resultado. |

Os testes do backend usarão Supertest com `createApp` e provedor injetado. Os testes do frontend usarão MSW na fronteira do backend e Testing Library por papel/nome acessível, sem testar classes Tailwind ou estado interno.

### Testes E2E

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Seleciona por ponteiro uma localidade homônima | CA-03, CA-04 | Mostra cidade/estado, envia o ID escolhido e exibe o clima correspondente, não o primeiro nome coincidente. |
| E2E-02 | Conclui o fluxo completo por teclado | CA-11, CA-12 | Setas, Enter, Escape e Tab funcionam; foco e anúncios são coerentes e o clima pode ser consultado. |
| E2E-03 | Comunica carregamento, vazio, falha e recuperação | CA-07, CA-08, CA-09 | Cada estado é visível/anunciado, o campo continua editável e uma tentativa posterior funciona. |
| E2E-04 | Impede resposta antiga de substituir a atual | CA-06 | Resposta lenta da query anterior nunca aparece após a query mais recente. |
| E2E-05 | Invalida seleção editada e bloqueia submit | CA-05 | Nenhuma chamada weather ocorre até uma nova sugestão ser escolhida. |
| E2E-06 | Mantém layout e resultado existente | CA-14, CA-15 | Em 360 px e 1280 px não há overflow horizontal; buscar sugestões não remove o clima anterior. |
| E2E-07 | Cumpre o orçamento de sugestões | CA-01, CA-02, CA-13 | Em 20 amostras controladas, pelo menos 95% exibem até oito sugestões em até 1 s desde o último caractere. |
| E2E-08 | Mantém a Open-Meteo fora do navegador | CA-04 | A inspeção de rede mostra apenas frontend/backend; search, lookup e forecast partem do servidor. |

O servidor local em `e2e/mock-open-meteo.mjs` terá IDs brasileiros determinísticos, duas cidades homônimas em estados distintos, lookup por ID e controles por query para atraso, vazio e erro. Um smoke opcional com a API real poderá registrar data, ambiente, amostras, p95 e taxa abaixo de 1 segundo, mas não será critério de CI devido à variabilidade externa.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Atualizar tipos internos/públicos, fixtures e validadores de query/ID com testes unitários; isso fixa os contratos antes de alterar rotas.
2. Separar parsers de search e lookup, estender `WeatherProvider` e o cliente Open-Meteo; cobrir parâmetros, payloads, not-found e cancelamento.
3. Implementar `search-locations`, adaptar `get-current-weather` e adicionar os deadlines por operação.
4. Expor `GET /locations`, migrar `GET /weather` para `locationId` e compor ambos em `app.ts` com testes Supertest.
5. Criar tipos e `location-service` no frontend, depois `useLocationSuggestions` e `useComboboxNavigation` com fake timers e proteção de corrida.
6. Construir componentes pequenos de autocomplete, integrar ao formulário e migrar weather service/hook para ID.
7. Atualizar a cópia da view, reutilizar atribuição e verificar que sugestões não compartilham estado com o resultado meteorológico.
8. Evoluir o mock da Open-Meteo e os testes E2E, incluindo acessibilidade, corrida, responsividade, isolamento de rede e desempenho.
9. Executar lint, typecheck, builds, testes, cobertura e E2E nos diretórios corretos; registrar evidências de desempenho sem dados digitados.

### Dependências técnicas

- Node.js 22 ou superior, com `fetch` e `AbortController` nativos.
- Acesso HTTPS do backend aos endpoints Search, Get e Forecast da Open-Meteo.
- Variáveis existentes `PORT`, `FRONTEND_ORIGIN`, `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL`, `OPEN_METEO_TIMEOUT_MS` e `SHUTDOWN_TIMEOUT_MS`.
- Novas variáveis `OPEN_METEO_GEOCODING_LOOKUP_URL`, padrão `https://geocoding-api.open-meteo.com/v1/get`, e `OPEN_METEO_LOCATION_SEARCH_TIMEOUT_MS`, padrão `600`.
- `VITE_API_BASE_URL` no frontend, sem URL da Open-Meteo.
- Vitest/V8, Testing Library, MSW, Supertest e Playwright já instalados; nenhuma dependência de produção nova.
- Disponibilidade do plano não comercial da Open-Meteo e respeito aos limites vigentes. Uso comercial exige reavaliação de endpoint, chave e licença.
- Não há bloqueador de banco de dados, migração ou infraestrutura persistente.

## Monitoramento e observabilidade

- Preservar `GET /health` como liveness do processo, sem consultar a Open-Meteo.
- Propagar ou gerar `X-Request-Id` nas duas rotas e incluí-lo nos logs estruturados e nas respostas.
- Registrar `locations_request_completed` e `weather_request_completed` com rota, status, duração e outcome; não registrar query, ID ou nome.
- Registrar `open_meteo_request_completed` e `open_meteo_request_failed` com `stage=location_search|location_lookup|forecast`, duração e categoria da falha.
- Usar `info` para sucessos; `warn` para validação, vazio, not-found, timeout, limite e falha externa esperada; `error` para payload incompatível e falha interna inesperada.
- Incluir `resultCount` agregado no sucesso de sugestões, limitado a 0–8, sem conteúdo dos resultados.
- Derivar dos logs p50/p95 da rota `/locations`, taxa de vazio, taxa de `503` e volume por outcome. Não será criado endpoint de métricas nesta entrega.
- O E2E de desempenho produzirá evidência com 20 amostras, p95 e proporção abaixo de 1 segundo. O arquivo não conterá queries reais de usuários.

## Considerações técnicas

### Principais decisões

- **ID da Open-Meteo como identidade:** Search devolve o ID e Weather o resolve por `/v1/get`. Isso garante que a previsão corresponde à escolha sem confiar em rótulos ou coordenadas do navegador.
- **Duas rotas de leitura:** `/locations` mantém a busca incremental separada de `/weather`. Cada rota tem contrato, deadline e erro coerentes com sua ação.
- **Quebra controlada de `city`:** `/weather` aceitará somente `locationId`. Manter os dois modos preservaria o comportamento ambíguo que o PRD substitui e duplicaria testes.
- **Combobox próprio e limitado:** nenhuma biblioteca compatível já existe no projeto. O comportamento necessário é coberto por dois hooks e componentes pequenos, seguindo o [padrão oficial de combobox do WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- **Seleção manual:** a primeira sugestão não é selecionada automaticamente. Setas ativam opções; Enter confirma; Tab fecha e avança sem alterar o valor.
- **Foco no input:** opções não entram na sequência Tab. `aria-activedescendant` comunica a opção ativa, preservando edição nativa do texto.
- **Efeito somente para integração externa:** debounce, timer, abort e fetch ficam em `useEffect` com cleanup. Valores derivados e validação visual são calculados durante renderização ou eventos, conforme a [orientação oficial do React](https://react.dev/reference/react/useEffect).
- **Proteção dupla contra corrida:** aborto reduz trabalho, e o par sequência/query impede atualização tardia mesmo se uma resposta não puder ser cancelada.
- **Timeout de 600 ms sem retry:** somado ao debounce de 300 ms, reserva margem de renderização dentro da meta de 1 segundo desde o último caractere. Retry aumentaria latência e cota.
- **Lista vazia como 200:** ausência de correspondência é resultado válido; falhas operacionais permanecem distinguíveis por `503`.
- **Sem cache ou persistência:** evita dados obsoletos e histórico implícito. Cada digitação válida pode gerar uma chamada após debounce; os limites devem ser observados.
- **Validação manual de `unknown`:** os contratos são pequenos e o projeto já usa type guards. Adicionar SDK ou biblioteca de schema ampliaria bundle/dependências sem benefício proporcional.
- **Atribuição junto aos dados:** sugestões e clima carregam a mesma fonte, e `SourceAttribution` é reutilizado na UI.

Alternativas descartadas:

- Enviar coordenadas e rótulos do frontend para `/weather`, porque o backend passaria a confiar em dados manipuláveis.
- Repetir a busca por nome no submit, porque poderia selecionar outro homônimo ou mudar de resultado entre as duas chamadas.
- Manter o primeiro resultado como fallback, porque viola a seleção explícita exigida.
- Adicionar Downshift, React Aria ou Headless UI, porque nenhuma está instalada e a superfície exigida é pequena; a implementação própria será protegida por testes de teclado e acessibilidade.
- Retry automático, cache em memória, banco de dados e provedor alternativo, todos fora do escopo ou prejudiciais ao orçamento/cota atual.

### Riscos conhecidos

- **ID removido ou alterado:** uma sugestão pode deixar de resolver antes do submit. Mitigação: `404 LOCATION_NOT_FOUND`, mensagem para selecionar novamente e nenhum forecast.
- **Latência/SLA externo:** o plano gratuito não garante resposta abaixo de 600 ms. Mitigação: estado recuperável, cancelamento, medição p95 e futura revisão do plano; a meta pressupõe dependência disponível.
- **Cota multiplicada pela digitação:** autocomplete aumenta chamadas externas. Mitigação: mínimo de dois caracteres, debounce, aborto, limite de oito, sem retry e métricas de volume.
- **Dois caracteres pouco produtivos:** a origem só faz correspondência exata com dois caracteres. Mitigação: documentação/critério explícito e prefixo normal a partir de três.
- **Payload parcial ou não brasileiro:** a origem pode omitir campos ou desrespeitar filtro. Mitigação: opcionais normalizados, `country_code` validado/filtrado e type guards de `unknown`.
- **Interação blur versus ponteiro:** clicar em uma opção pode desfocar o input antes da seleção. Mitigação: tratar pointer/mouse down de forma controlada e cobrir em teste.
- **Anúncios excessivos:** cada tecla pode gerar live region ruidosa. Mitigação: anunciar apenas início efetivo, quantidade final, vazio e falha; não anunciar fase de debounce.
- **Quebra do contrato antigo:** testes ou consumidores externos desconhecidos podem usar `?city=`. Mitigação: busca no repositório confirma somente o frontend/E2E; migrar todos na mesma entrega e registrar a mudança.
- **AGENTS.md desatualizado:** o arquivo menciona ausência de testes frontend e portas antigas, enquanto o código possui Vitest e usa frontend 3000/backend 3001. A implementação seguirá scripts/configuração reais sem ampliar o escopo para revisar a documentação geral.
- **Worktree já alterado:** há mudanças preexistentes fora deste documento. A implementação futura deve preservar alterações do usuário e revisar sobreposições antes de editar.

### Conformidade com o AGENTS.md e as rules

Foram lidos integralmente `AGENTS.md` e todos os arquivos atuais em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- O backend preserva a direção `routes -> services -> data`; o frontend preserva `view -> components/hooks -> services -> backend`.
- Arquivos TypeScript ficarão com até 100 linhas, funções com até 30 linhas e componentes React com até 30 linhas. Responsabilidades serão separadas nos módulos enumerados.
- Serão usados `const`, comparações estritas, imutabilidade, módulos ES, retornos assíncronos tipados e `unknown` refinado; `any` é proibido.
- Funções terão no máximo três parâmetros ou um objeto de entrada, cláusulas de guarda e constantes para limites, timeouts, códigos e mensagens.
- O backend usará `async/await`, não bloqueará o event loop, manterá direção de dependências, logging centralizado e cancelamento/cleanup.
- URLs e timeouts ficarão em ambiente validado; nenhum segredo será adicionado. `.env.example` será atualizado sem credenciais.
- Não serão adicionados comentários rotineiros no código; nomes e módulos expressarão a intenção.
- Todo código produzido terá testes. Vitest aplicará mínimo global de 80% a linhas, branches, funções e statements; Playwright cobrirá poucos fluxos completos.
- Os testes seguirão FIRST, serão determinísticos e não dependerão da Open-Meteo real para aprovação.
- Lock files npm serão preservados; não há dependência nova prevista.
- Validação final do frontend: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:coverage` e `npm run build` dentro de `frontend/`.
- Validação final do backend: `npm run build`, `npm test` e `npm run test:coverage` dentro de `backend/`.
- Validação E2E: `npm test` dentro de `e2e/`.

O conflito documental de portas e testes no `AGENTS.md` é preexistente. Para esta especificação, os scripts e configurações executáveis do repositório são a fonte operacional: frontend 3000, backend 3001 e Vitest já configurado.

### Conformidade com skills

- `react` — aplicável e lida integralmente, incluindo referências de componentes, hooks/efeitos, acesso ao backend, acessibilidade, estilização e boas práticas. A solução usa componentes pequenos, props explícitas, estado sem redundância, uma fonte de verdade para seleção, efeitos apenas para timer/fetch, cleanup, chaves estáveis por ID, semântica WAI-ARIA, Tailwind e testes por comportamento. Não há desvio planejado.

### Arquivos relevantes e dependentes

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-painel-de-clima/techspec.md` e `tasks/prd-painel-de-clima/prd.md`
- `AGENTS.md`
- `.agents/rules/code-standards.md`
- `.agents/rules/folder-structure.md`
- `.agents/rules/javascript-typescript.md`
- `.agents/rules/node.md`
- `.agents/rules/tests.md`
- `.agents/skills/react/SKILL.md` e `.agents/skills/react/references/`
- `PRODUCT.md` e `DESIGN.md`
- `backend/src/app.ts`
- `backend/src/config/environment.ts` e `backend/.env.example`
- `backend/src/routes/weather-route.ts`
- `backend/src/routes/locations-route.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/services/search-locations.ts`
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
- Testes, fixtures e configuração Vitest correspondentes em `backend/src/` e `backend/vitest.config.ts`
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
- `backend/package.json`, `backend/package-lock.json`, `frontend/package.json`, `frontend/package-lock.json`, `e2e/package.json` e `e2e/package-lock.json`
