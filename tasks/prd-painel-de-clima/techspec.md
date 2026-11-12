# Especificação técnica

## Resumo

Esta especificação detalha a implementação do [PRD do painel de clima](./prd.md) sobre as aplicações React e Express existentes. A solução adicionará uma operação idempotente `GET /weather` no backend, responsável por validar a cidade, consultar sequencialmente a Geocoding API e a Weather Forecast API da Open-Meteo, normalizar a resposta externa e expor ao frontend um contrato pequeno e estável. Não haverá banco de dados, cache, retry nem chamada do navegador à Open-Meteo no MVP.

No frontend, a tela atual de status será substituída por uma view de consulta meteorológica composta por formulário, feedback assíncrono, resultado e atribuição. O estado da busca e a integração HTTP ficarão isolados, respectivamente, em um hook e em um service. O endpoint `GET /health` continuará disponível para infraestrutura, mas não será consultado periodicamente pela interface. O orçamento total das duas chamadas externas será de 2,5 segundos, deixando margem para processamento e renderização dentro da meta fim a fim de 3 segundos.

## Arquitetura do sistema

### Visão dos componentes

O fluxo principal será:

```text
WeatherView
  -> useWeatherSearch
    -> weather-service
      -> GET /weather?city=...
        -> weather-route
          -> get-current-weather
            -> open-meteo-client
              -> Geocoding API -> Forecast API
```

Componentes novos ou modificados:

- `frontend/src/App.tsx` — deixa de consultar `/health` e passa a montar `WeatherView`.
- `frontend/src/views/WeatherView.tsx` — compõe formulário, feedback e resultado; é a única proprietária do estado compartilhado da tela.
- `frontend/src/components/WeatherSearchForm.tsx` — controla a entrada, valida antes do envio e bloqueia submissões durante o carregamento.
- `frontend/src/components/WeatherFeedback.tsx` — anuncia validação, carregamento e erros por texto e sem depender de cor.
- `frontend/src/components/WeatherResult.tsx` — apresenta localidade e condições atuais do contrato normalizado.
- `frontend/src/components/SourceAttribution.tsx` — exibe o link de atribuição junto ao resultado.
- `frontend/src/hooks/useWeatherSearch.ts` — modela `idle`, `loading`, `success` e `error`, cancela requisições obsoletas e remove resultado anterior no início ou na falha de uma nova busca.
- `frontend/src/services/weather-service.ts` — chama exclusivamente o backend, valida minimamente o envelope recebido e converte erros HTTP em erros de domínio da UI.
- `frontend/src/types/*` — mantém cada contrato do frontend em arquivo próprio.
- `frontend/src/index.css` — mantém tokens globais e estilos-base; a composição da funcionalidade usará classes Tailwind nos componentes.
- `frontend/index.html` — define o documento como `pt-BR` e atualiza título e metadados da página.
- `backend/src/index.ts` — fica restrito a carregar configuração, iniciar o servidor e registrar o desligamento gracioso.
- `backend/src/app.ts` — configura Express, CORS, parsing JSON, request ID, rotas e middleware de erro, sem abrir porta.
- `backend/src/config/environment.ts` — lê e valida porta, origem do frontend, URLs do provedor e timeout.
- `backend/src/routes/health-route.ts` — preserva `GET /health` fora do arquivo de bootstrap.
- `backend/src/routes/weather-route.ts` — valida a query, chama o serviço e traduz o resultado para HTTP.
- `backend/src/services/normalize-city.ts` — normaliza Unicode e espaços e aplica limites da entrada.
- `backend/src/services/get-current-weather.ts` — orquestra geocodificação, seleção do primeiro resultado e consulta das condições.
- `backend/src/services/weather-condition.ts` — traduz todos os códigos WMO suportados para português do Brasil.
- `backend/src/data/open-meteo-client.ts` — implementa o adaptador do provedor com `fetch`, `URLSearchParams` e cancelamento por timeout.
- `backend/src/data/parse-geocoding-response.ts` e `parse-forecast-response.ts` — refinam respostas `unknown` antes de construir tipos internos.
- `backend/src/errors/app-error.ts` e `middleware/error-handler.ts` — centralizam códigos, status e envelopes públicos sem vazar detalhes internos.
- `backend/src/middleware/request-id.ts` e `observability/logger.ts` — correlacionam e registram duração e desfecho das requisições.
- `backend/src/runtime/shutdown.ts` — trata `SIGINT` e `SIGTERM` de forma idempotente.
- `backend/src/types/*` — separa contratos HTTP e conceitos de domínio em arquivos próprios.
- `frontend/vitest.config.ts`, `backend/vitest.config.ts` e `e2e/playwright.config.ts` — configuram testes, cobertura e E2E.
- `frontend/package.json`, `backend/package.json` e `e2e/package.json` — adicionam scripts e dependências de teste, preservando lock files independentes.

Não haverá persistência. Cada requisição usa apenas memória durante seu processamento e não grava cidade, coordenadas ou resposta meteorológica.

## Design de implementação

### Principais interfaces

O serviço de domínio não dependerá de Express e receberá o provedor por interface, permitindo testes determinísticos:

```text
WeatherProvider
  findLocations(city, signal) -> Promise<ResolvedLocation[]>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>

getCurrentWeather(input, dependencies) -> Promise<WeatherResponse>
normalizeCity(city) -> NormalizedCity
describeWeatherCode(code) -> string
```

O frontend terá uma única operação de infraestrutura e um hook de estado:

```text
fetchWeather(city, signal) -> Promise<WeatherResponse>

useWeatherSearch()
  -> { state, search(city) }

WeatherSearchState
  -> idle | loading | success(data) | error(error)
```

### Modelos de dados

#### `WeatherResponse` — payload de sucesso pronto para exibição

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | sim | Localidade correspondente ao primeiro resultado da geocodificação. |
| `current` | `CurrentConditions` | sim | Condições atuais já normalizadas. |
| `units` | `WeatherUnits` | sim | Unidades explícitas dos valores numéricos. |
| `source` | `SourceAttribution` | sim | Dados necessários para a atribuição visível. |

```text
{
  "location": { "name": "Lisboa", "admin1": "Lisboa", "country": "Portugal" },
  "current": {
    "temperature": 18.4,
    "apparentTemperature": 17.9,
    "condition": { "code": 2, "label": "Parcialmente nublado" },
    "humidity": 72,
    "windSpeed": 14.2
  },
  "units": { "temperature": "°C", "apparentTemperature": "°C", "humidity": "%", "windSpeed": "km/h" },
  "source": { "name": "Open-Meteo", "url": "https://open-meteo.com/" }
}
```

#### `WeatherLocation` — identificação da localidade resolvida

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | sim | Nome localizado retornado pelo primeiro resultado. |
| `admin1` | `string \| null` | sim | Primeira divisão administrativa; `null` quando ausente. |
| `country` | `string \| null` | sim | País localizado; `null` quando ausente. |

```text
{
  "name": "São Paulo",
  "admin1": "São Paulo",
  "country": "Brasil"
}
```

> **Localidade parcial:** a Open-Meteo omite campos vazios. `admin1` e `country` serão normalizados para `null`, nunca para string vazia ou propriedade ausente.

```text
{
  "name": "Localidade remota",
  "admin1": null,
  "country": null
}
```

#### `CurrentConditions` — condições atuais normalizadas

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | `number` | sim | Temperatura a 2 m em Celsius. |
| `apparentTemperature` | `number` | sim | Sensação térmica em Celsius. |
| `condition` | `WeatherCondition` | sim | Código WMO e descrição em português do Brasil. |
| `humidity` | `number` | sim | Umidade relativa entre 0 e 100. |
| `windSpeed` | `number` | sim | Velocidade do vento a 10 m em km/h. |

```text
{
  "temperature": 18.4,
  "apparentTemperature": 17.9,
  "condition": { "code": 2, "label": "Parcialmente nublado" },
  "humidity": 72,
  "windSpeed": 14.2
}
```

Respostas sem todos esses campos, com valores não finitos, umidade fora de `0..100` ou código WMO não suportado serão consideradas inválidas e convertidas em indisponibilidade do provedor.

#### `WeatherUnits` — metadados de unidade

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | literal `°C` | sim | Unidade de `temperature`. |
| `apparentTemperature` | literal `°C` | sim | Unidade de `apparentTemperature`. |
| `humidity` | literal `%` | sim | Unidade de `humidity`. |
| `windSpeed` | literal `km/h` | sim | Unidade de `windSpeed`. |

```text
{
  "temperature": "°C",
  "apparentTemperature": "°C",
  "humidity": "%",
  "windSpeed": "km/h"
}
```

O backend verificará `current_units` da origem antes de emitir esses literais; não fará conversão silenciosa de unidade inesperada.

#### `SourceAttribution` — atribuição exibida pela UI

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | literal `Open-Meteo` | sim | Nome público da fonte. |
| `url` | URL HTTPS | sim | Link oficial usado na atribuição. |

```text
{
  "name": "Open-Meteo",
  "url": "https://open-meteo.com/"
}
```

#### `ApiError` — envelope de erro

| Código | HTTP | Significado |
| --- | --- | --- |
| `INVALID_CITY` | `400` | Parâmetro ausente, não textual, menor que 2 ou maior que 100 caracteres úteis. |
| `CITY_NOT_FOUND` | `404` | A geocodificação retornou zero localidades. |
| `WEATHER_PROVIDER_UNAVAILABLE` | `503` | Timeout, limite, erro HTTP, rede ou payload inválido em qualquer chamada externa. |
| `INTERNAL_ERROR` | `500` | Falha interna não classificada; detalhes ficam apenas nos logs. |

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "Cidade não encontrada. Revise o nome e tente novamente."
  }
}
```

Todos os erros conterão `X-Request-Id` no cabeçalho da resposta. O texto público será estável, acionável e em português do Brasil; mensagens ou stacks da Open-Meteo não serão repassadas.

#### `WeatherSearchState` — estado discriminado do frontend

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `status` | `idle \| loading \| success \| error` | sim | Discriminante do estado atual. |
| `data` | `WeatherResponse` | somente em `success` | Resultado correspondente à busca concluída. |
| `error` | `UiWeatherError` | somente em `error` | Erro pronto para apresentação. |

```text
{
  "status": "success",
  "data": { "location": "WeatherLocation", "current": "CurrentConditions" }
}
```

As variantes serão mutuamente exclusivas. Ao enviar uma nova busca, o hook transita imediatamente para `loading` sem `data`; ao falhar, transita para `error` sem preservar o resultado anterior.

#### Mapeamento Open-Meteo → contrato

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `results[0].name` | `location.name` |
| `results[0].admin1` ausente ou vazio | `location.admin1 = null` |
| `results[0].country` ausente ou vazio | `location.country = null` |
| `results[0].latitude`, `longitude` | uso interno em `Coordinates`; não retornados à UI |
| `current.temperature_2m` | `current.temperature` |
| `current.apparent_temperature` | `current.apparentTemperature` |
| `current.weather_code` | `current.condition.code` e tradução em `label` |
| `current.relative_humidity_2m` | `current.humidity` |
| `current.wind_speed_10m` | `current.windSpeed` |
| `current_units.*` | validação e `units.*` |

#### Mapeamento WMO → descrição em português do Brasil

| Códigos | Descrição |
| --- | --- |
| `0` | Céu limpo |
| `1` | Predominantemente limpo |
| `2` | Parcialmente nublado |
| `3` | Encoberto |
| `45`, `48` | Nevoeiro; nevoeiro com geada, respectivamente |
| `51`, `53`, `55` | Garoa leve, moderada ou intensa |
| `56`, `57` | Garoa congelante leve ou intensa |
| `61`, `63`, `65` | Chuva leve, moderada ou forte |
| `66`, `67` | Chuva congelante leve ou forte |
| `71`, `73`, `75` | Neve leve, moderada ou forte |
| `77` | Grãos de neve |
| `80`, `81`, `82` | Pancadas de chuva leves, moderadas ou violentas |
| `85`, `86` | Pancadas de neve leves ou fortes |
| `95` | Trovoada |
| `96`, `99` | Trovoada com granizo leve ou forte |
| `97` | Trovoada forte |

Cada código terá uma entrada explícita no mapa, mesmo quando compartilha categoria. Código desconhecido invalida a resposta externa para evitar apresentar uma condição incorreta.

#### Parâmetros fixos na origem

| API | Parâmetros principais |
| --- | --- |
| **Geocoding API** | `name=<cidade normalizada>`, `count=1`, `language=pt`, `format=json` |
| **Weather Forecast API** | `latitude`, `longitude`, `current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto` |

As URLs-base serão lidas de variáveis de ambiente com padrões oficiais HTTPS, permitindo substituir o provedor por servidor controlado nos testes sem alterar código.

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Health check existente, preservado para infraestrutura. |
| `GET` | `/weather` | Resolve uma cidade e devolve suas condições atuais. |

---

#### `GET /weather`

Recebe uma cidade, seleciona o primeiro resultado da geocodificação e responde com um contrato agregado pronto para exibição.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `city` | `string` | — | Obrigatório; normalização NFC, remoção de espaços externos e compactação de espaços internos; 2 a 100 caracteres Unicode não brancos. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherResponse` | Geocodificação e condições válidas. |
| `400` | `ApiError(INVALID_CITY)` | Query ausente ou fora dos limites. |
| `404` | `ApiError(CITY_NOT_FOUND)` | Geocodificação sem resultados. |
| `503` | `ApiError(WEATHER_PROVIDER_UNAVAILABLE)` | Timeout, rede, limite, erro ou resposta inválida da origem. |
| `500` | `ApiError(INTERNAL_ERROR)` | Falha interna inesperada. |

**Exemplo — sucesso**

```http
GET /weather?city=Lisboa
```

O corpo é o `WeatherResponse` documentado em **Modelos de dados**.

**Exemplo — nenhuma correspondência**

```http
GET /weather?city=zzzzzz
```

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "Cidade não encontrada. Revise o nome e tente novamente."
  }
}
```

> A ausência de resultados é um estado de domínio, não indisponibilidade do provedor. O frontend mantém o campo editável, remove qualquer resultado anterior e anuncia a mensagem.

**Exemplo — entrada inválida**

```http
GET /weather?city=A
```

```text
{
  "error": {
    "code": "INVALID_CITY",
    "message": "Informe uma cidade com pelo menos 2 caracteres."
  }
}
```

**Exemplo — provedor indisponível**

```http
GET /weather?city=Lisboa
```

```text
{
  "error": {
    "code": "WEATHER_PROVIDER_UNAVAILABLE",
    "message": "Não foi possível consultar o clima agora. Tente novamente em instantes."
  }
}
```

> A operação é idempotente. O backend não fará retry para evitar amplificar limites do provedor e ultrapassar a meta de latência. A resposta usará `Cache-Control: no-store`, e o frontend nunca chamará domínios Open-Meteo.

---

#### `GET /health`

Mantém o health check existente para infraestrutura, sem consultar a Open-Meteo. O formato atual `{ "status": "healthy", "timestamp": "..." }` será preservado para evitar quebra de consumidores.

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | status e timestamp ISO 8601 | Processo HTTP está respondendo. |

---

## Pontos de integração

- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`. A [documentação oficial de geocodificação](https://open-meteo.com/en/docs/geocoding-api) informa que consultas com dois caracteres exigem correspondência exata e que campos vazios podem ser omitidos; por isso o backend solicita somente um resultado e normaliza opcionais para `null`.
- **Weather Forecast API:** `https://api.open-meteo.com/v1/forecast`. Serão requisitadas somente as cinco variáveis `current` exigidas pelo PRD, conforme a [documentação oficial da Forecast API](https://open-meteo.com/en/docs), com unidades métricas explícitas.
- **Autenticação:** o endpoint gratuito não requer chave para o uso não comercial do MVP. URLs e eventual chave comercial não farão parte do contrato público; uma migração futura para plano comercial deverá ser feita por configuração no backend.
- **Timeout:** um único `AbortSignal` com prazo total de 2,5 segundos será compartilhado pelas duas chamadas sequenciais. Assim, a segunda chamada recebe apenas o orçamento restante. Cancelamento do cliente ou encerramento do servidor também deve abortar o trabalho em andamento quando suportado.
- **Falhas:** HTTP não `2xx`, timeout, erro de rede, limite do provedor, JSON inválido, campos obrigatórios ausentes e unidades inesperadas convergem para `WEATHER_PROVIDER_UNAVAILABLE`. Somente uma lista de geocodificação válida e vazia gera `CITY_NOT_FOUND`.
- **Idempotência e carga:** não haverá retry, cache ou chamadas paralelas. Uma busca bem-sucedida consome duas chamadas externas. Em 10 de novembro de 2026, os [termos do plano gratuito](https://open-meteo.com/en/terms) registram 600 chamadas/minuto, 5.000/hora, 10.000/dia e 300.000/mês, aplicadas por IP e aplicação; esses limites devem ser confirmados novamente antes da publicação.
- **Atribuição:** a UI exibirá “Dados meteorológicos por Open-Meteo” com link HTTPS sempre que houver resultado. A implementação deve preservar a atribuição CC BY 4.0 e reavaliar os [termos e planos oficiais](https://open-meteo.com/en/pricing) antes de uso comercial.

## Abordagem de testes

Vitest será configurado separadamente em frontend e backend, com cobertura V8 mínima global de 80% para linhas, branches, funções e statements. Todo comportamento novo terá teste automatizado; rede real será substituída por stubs ou servidor local controlado nas suítes determinísticas. React Testing Library e `user-event` validarão a interface pelo comportamento acessível. Supertest exercitará o app Express sem abrir uma porta. Playwright cobrirá poucos fluxos completos em `e2e/`.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | Normaliza uma cidade Unicode e espaços excedentes | CA-01, CA-05 | Preserva caracteres e diacríticos, aplica NFC e produz entrada entre os limites. |
| TU-02 | Rejeita cidade ausente, branca, curta ou excessiva | CA-05 | Retorna `INVALID_CITY` sem chamar o provedor. |
| TU-03 | Traduz todos os códigos WMO suportados | CA-03 | Cada código produz a descrição PT-BR especificada; código desconhecido falha. |
| TU-04 | Interpreta o primeiro resultado de geocodificação | CA-01, CA-02, CA-06 | Usa `results[0]`, normaliza opcionais e diferencia lista vazia de payload inválido. |
| TU-05 | Interpreta condições e unidades válidas | CA-03, CA-07 | Constrói `CurrentConditions`; recusa ausências, faixas e unidades inválidas. |
| TU-06 | Orquestra geocodificação e previsão | CA-01, CA-02 | Consulta previsão apenas para as coordenadas do primeiro resultado. |
| TU-07 | Converte falhas do provedor sem retry | CA-07, CA-09 | Timeout ou falha em qualquer etapa interrompe o fluxo e gera erro temporário estável. |
| TU-08 | Mapeia respostas do backend no weather service | CA-04, CA-06, CA-07 | Chama apenas a base configurada do backend e preserva códigos públicos. |
| TU-09 | Controla transições e cancelamento no hook | CA-07, CA-08 | Remove dado anterior, bloqueia duplicidade e ignora resposta obsoleta. |
| TU-10 | Valida e submete o formulário acessível | CA-05, CA-08, CA-10, CA-11 | Enter e botão enviam uma vez; erro é associado ao campo e anunciado. |
| TU-11 | Renderiza resultado, unidades e atribuição | CA-03, CA-11, CA-13 | Todos os rótulos, valores e o link funcional aparecem semanticamente. |
| TU-12 | Renderiza feedback assíncrono | CA-06, CA-07, CA-08, CA-11 | Loading usa status; erros usam alerta e não dependem de ícone ou cor. |

Mocks serão usados somente nas fronteiras externas: `WeatherProvider`, `fetch`, relógio/timeout e `matchMedia` quando necessário. Parsers, serviço, hook e componentes reais serão testados sem mockar suas próprias colaborações internas.

### Testes de integração

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | Entrega o contrato HTTP de sucesso | CA-01, CA-02, CA-03 | `GET /weather` retorna 200, primeira localidade, valores, unidades e fonte. |
| TI-02 | Rejeita query inválida na rota | CA-05 | Retorna 400 e não executa nenhuma chamada externa. |
| TI-03 | Diferencia cidade não encontrada | CA-06 | Resposta externa válida e vazia retorna 404 e envelope estável. |
| TI-04 | Isola falhas e respostas inválidas da origem | CA-07 | Erro HTTP, timeout, JSON inválido ou unidade inesperada retornam 503 sem detalhes internos. |
| TI-05 | Preserva health check e middleware global | CA-04 | `/health` permanece independente; weather recebe CORS, request ID e tratamento de erro. |
| TI-06 | Integra view, hook e service do frontend | CA-05, CA-06, CA-07, CA-08, CA-11, CA-13 | A tela percorre validação, loading, sucesso e erro com backend simulado. |

Os testes do backend usarão Supertest contra `app.ts` e um `WeatherProvider` injetado. Os testes do frontend usarão Mock Service Worker na fronteira do backend; não simularão a Open-Meteo no navegador.

### Testes E2E

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Consulta cidade ambígua pelo fluxo completo | CA-01, CA-02, CA-03, CA-13 | Mostra o primeiro resultado, todos os dados métricos e a atribuição. |
| E2E-02 | Confirma isolamento de rede do navegador | CA-04 | A inspeção de requests contém apenas frontend e backend, nunca Open-Meteo. |
| E2E-03 | Impede consulta inválida | CA-05 | Exibe orientação e não envia request de weather. |
| E2E-04 | Recupera de cidade não encontrada e falha externa | CA-06, CA-07 | Remove resultado anterior, anuncia erro, mantém campo editável e permite nova tentativa. |
| E2E-05 | Impede submissão duplicada durante loading | CA-08, CA-11 | Botão fica desabilitado, status é anunciado e apenas uma request é registrada. |
| E2E-06 | Opera integralmente por teclado | CA-10, CA-11 | Ordem e foco são lógicos; campo, botão, feedback, resultado e link são acessíveis. |
| E2E-07 | Mantém layout em mobile e desktop | CA-12 | Em 360 px e 1280 px não há overflow horizontal e todo controle permanece operável. |
| E2E-08 | Mede o orçamento fim a fim | CA-09 | Em amostra controlada representativa, pelo menos 95% das buscas concluem em até 3 s. |

O E2E determinístico iniciará frontend, backend e um servidor local que emula os dois endpoints da Open-Meteo. Para `E2E-08`, o emulador aplicará latência controlada dentro da disponibilidade definida pelo PRD, e o Playwright medirá do submit à apresentação do resultado. Como evidência de QA, será executado também um smoke de desempenho com uma lista fixa de cidades contra a API real; ele não bloqueará CI porque latência e disponibilidade externas não são controláveis, mas deve registrar amostra, data, ambiente, p95 e taxa dentro de 3 segundos antes da entrega.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Configurar Vitest, cobertura e factories de teste nos dois aplicativos, corrigindo primeiro o build TypeScript preexistente para estabelecer uma linha de base verificável.
2. Extrair `app.ts`, configuração, logger, erros, health route e shutdown do backend, preservando o contrato atual antes de adicionar comportamento.
3. Definir tipos, normalização, tradução WMO e parsers externos com testes unitários; esses contratos sustentam todas as camadas seguintes.
4. Implementar o adaptador Open-Meteo e o serviço de orquestração com timeout total e testes de falha.
5. Expor `GET /weather` e validar o contrato com testes de integração Supertest.
6. Definir tipos do frontend e implementar `weather-service` e `useWeatherSearch`, incluindo cancelamento e transições sem dado obsoleto.
7. Construir componentes pequenos e `WeatherView`, aplicando semântica, live regions, foco visível, Tailwind e responsividade.
8. Configurar Playwright e o servidor controlado da Open-Meteo; implementar os fluxos E2E e a medição de desempenho.
9. Executar lint, typecheck, builds, testes, cobertura, E2E e smoke externo; registrar evidências sem incluir dados sensíveis.

### Dependências técnicas

- Node.js com `fetch`, `AbortController` e `crypto.randomUUID` disponíveis; a versão suportada deverá ser explicitada no `package.json` e alinhada aos tipos Node instalados.
- Acesso HTTPS de saída do backend aos domínios oficiais da Open-Meteo.
- Variáveis: `PORT`, `FRONTEND_ORIGIN`, `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL` e `OPEN_METEO_TIMEOUT_MS`; no frontend, `VITE_API_BASE_URL`.
- Dependências de desenvolvimento: Vitest e cobertura V8 nos dois apps; Testing Library, `user-event`, jsdom e opcionalmente MSW no frontend; Supertest no backend; Playwright em `e2e/`.
- Disponibilidade do endpoint gratuito para smoke real. A CI e a cobertura não dependerão dele.
- Uso do plano gratuito limitado ao contexto não comercial do PRD; publicação comercial é bloqueador para reavaliar licença, endpoint e autenticação.

## Monitoramento e observabilidade

- Preservar `GET /health` como liveness do processo, sem acoplá-lo à Open-Meteo para evitar tornar a aplicação indisponível por falha externa.
- Gerar ou propagar `X-Request-Id` em toda requisição e incluí-lo na resposta e nos logs.
- Registrar JSON pelo logger centralizado com evento, request ID, rota, status, duração em milissegundos, etapa (`geocoding` ou `forecast`) e categoria do desfecho. Não registrar o texto bruto da cidade, coordenadas, corpo completo da origem nem stack no payload público.
- Níveis: `info` para início/fim e sucesso; `warn` para entrada inválida, cidade não encontrada, timeout, limite e erro esperado da origem; `error` para payload incompatível e falha interna inesperada.
- Eventos mínimos: `weather_request_completed`, `open_meteo_request_failed`, `open_meteo_payload_invalid` e `server_shutdown`.
- Derivar dos logs a contagem de buscas, taxa por resultado, latência fim a fim e p50/p95. Alertas e plataforma de métricas ficam fora do MVP porque não há infraestrutura existente, mas o formato dos logs permitirá sua adoção posterior.
- Não expor endpoint de métricas neste MVP. O relatório de QA registrará p95 e a proporção de consultas abaixo de 3 segundos.

## Considerações técnicas

### Principais decisões

- **Backend como anti-corruption layer:** a UI recebe um contrato próprio e não conhece nomes, opcionais, erros ou unidades da Open-Meteo. Isso atende ao isolamento do PRD e permite trocar detalhes do provedor sem alterar componentes.
- **Um endpoint agregado:** `GET /weather` representa uma leitura idempotente e evita duas chamadas e lógica de composição no navegador. A rota sem prefixo segue o padrão existente de `/health`; introduzir `/api/v1` apenas para esta funcionalidade aumentaria inconsistência sem necessidade atual.
- **Primeiro resultado na origem:** `count=1` expressa diretamente a regra do PRD, reduz payload e impede que a interface implemente seleção de homônimos.
- **`fetch` nativo e validação manual:** as integrações são pequenas; não será adicionada biblioteca HTTP nem de schema em produção. Type guards específicos mantêm a superfície menor, desde que cubertos por testes.
- **Timeout único de 2,5 s:** o orçamento compartilhado impede que duas etapas consumam 2,5 s cada. Não haverá retry, pois uma nova tentativa aumentaria latência e uso de cota; o usuário pode repetir conscientemente.
- **Sem cache:** simplifica consistência, evita persistir buscas e mantém o MVP aderente ao PRD. Cache em memória poderá ser avaliado apenas com política de validade, capacidade e privacidade explícitas.
- **Erro externo unificado em 503:** a UI oferece a mesma ação para timeout, limite, falha HTTP e payload inválido. A causa detalhada permanece em logs e não vira acoplamento público.
- **Estado discriminado no frontend:** torna impossível renderizar simultaneamente resultado antigo e erro novo. Cancelamento/identidade da requisição protege contra respostas fora de ordem.
- **Sem ícone meteorológico obrigatório:** texto PT-BR é a representação primária da condição. Ícones podem ser adicionados futuramente apenas como reforço visual.
- **Health fora da UI:** o polling atual é removido da experiência, mas o endpoint permanece estável para operação e testes.

Alternativas descartadas:

- Chamadas diretas do frontend à Open-Meteo, por violarem RF7/CA-04 e espalharem o contrato externo.
- `POST /weather`, pois a operação não cria recurso e a cidade não é classificada como dado pessoal no PRD; `GET` oferece semântica e observabilidade mais simples.
- SDK de terceiros, por não ser necessário para duas APIs HTTP GET simples.
- Retry automático e fallback de provedor, pois elevam latência, consumo de cota e escopo; o PRD exclui provedor alternativo.
- Banco de dados, histórico, favoritos e cache persistente, todos fora do escopo.

### Riscos conhecidos

- **Latência e disponibilidade sem garantia:** a API gratuita não oferece SLA. Mitigação: timeout total, feedback recuperável, sem retry, medição de p95 e futura migração de plano se necessário.
- **Cota compartilhada:** cada sucesso consome duas chamadas e limites são aplicados por IP/aplicação. Mitigação: `count=1`, somente variáveis necessárias, sem polling/retry e logs por etapa; reavaliar plano antes de escalar.
- **Mudança ou payload parcial da origem:** campos podem ser omitidos e a integração pode evoluir. Mitigação: parsers de `unknown`, normalização explícita de opcionais, validação de unidades e testes com fixtures inválidas.
- **Códigos meteorológicos novos:** um código não mapeado geraria 503 até atualização. Essa degradação é preferível a exibir tradução incorreta; logs devem identificar a categoria sem retornar o payload bruto.
- **Meta de 3 segundos:** duas chamadas sequenciais tornam a geocodificação parte crítica. Mitigação: orçamento compartilhado de 2,5 s, payload mínimo e teste controlado de p95; o smoke real evidencia, mas não elimina, a variabilidade externa.
- **Acessibilidade de atualizações assíncronas:** live regions excessivas podem duplicar anúncios. Mitigação: uma região de status para loading/sucesso, `role=alert` somente para validação/erro e testes por nome/papel.
- **Configuração CORS e URL fixa atuais:** ambiente diferente de localhost pode quebrar integração. Mitigação: extrair `FRONTEND_ORIGIN` e `VITE_API_BASE_URL`, validar configuração e cobrir CORS.
- **Baseline quebrada no backend:** o build atual falha por parâmetros não usados e não há suíte configurada. A extração inicial precisa corrigir isso sem alterar o contrato de `/health` antes da funcionalidade.

### Conformidade com o AGENTS.md e as rules

Foram lidos `example_1/AGENTS.md` e todos os arquivos em `example_1/.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- A arquitetura respeita `routes -> services -> data` no backend e `view -> components/hooks -> services -> backend` no frontend.
- Arquivos TypeScript serão mantidos abaixo de 100 linhas, funções abaixo de 30 linhas, componentes React abaixo de 30 linhas e com no máximo três parâmetros ou um objeto de entrada.
- Serão usados módulos ES onde suportados pelo projeto, `const`, comparações estritas, imutabilidade, retornos assíncronos tipados e `unknown` nas fronteiras; `any` é proibido.
- A configuração sairá do código para `.env`/`.env.example`, sem segredos; URLs de teste serão injetáveis.
- O backend não bloqueará o event loop, usará `async/await`, logger centralizado, dependências em direção única e shutdown idempotente para `SIGINT`/`SIGTERM`.
- Não serão inseridos comentários rotineiros no código; nomes e módulos expressarão a intenção.
- Vitest e Playwright seguirão FIRST e a pirâmide de testes. Todo comportamento produzido será testado e os limiares globais mínimos serão 80% para linhas, branches, funções e statements.
- Lock files npm serão preservados e atualizados junto aos respectivos `package.json`; scripts rodarão dentro de cada aplicativo.
- Antes da entrega: frontend `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e cobertura; backend `npm run build`, `npm test` e cobertura; E2E Playwright.

### Conformidade com skills

- `react` — aplicável e lida integralmente, incluindo referências de componentes, hooks/efeitos, backend, acessibilidade, estilização e boas práticas. A especificação adota componentes pequenos, props explícitas, hook para integração, estado sem redundância, limpeza/cancelamento de requisições, semântica HTML, live regions, foco visível e Tailwind. Não há desvios planejados.

### Arquivos relevantes e dependentes

- `example_1/tasks/prd-painel-de-clima/prd.md`
- `example_1/AGENTS.md`
- `example_1/.agents/rules/*.md`
- `example_1/.agents/skills/react/SKILL.md` e referências
- `example_1/backend/src/index.ts`
- `example_1/backend/src/app.ts`
- `example_1/backend/src/config/environment.ts`
- `example_1/backend/src/routes/health-route.ts`
- `example_1/backend/src/routes/weather-route.ts`
- `example_1/backend/src/services/normalize-city.ts`
- `example_1/backend/src/services/get-current-weather.ts`
- `example_1/backend/src/services/weather-condition.ts`
- `example_1/backend/src/data/open-meteo-client.ts`
- `example_1/backend/src/data/parse-geocoding-response.ts`
- `example_1/backend/src/data/parse-forecast-response.ts`
- `example_1/backend/src/errors/app-error.ts`
- `example_1/backend/src/middleware/error-handler.ts`
- `example_1/backend/src/middleware/request-id.ts`
- `example_1/backend/src/observability/logger.ts`
- `example_1/backend/src/runtime/shutdown.ts`
- `example_1/backend/src/types/*.ts`
- `example_1/backend/package.json`, `package-lock.json`, `tsconfig.json` e `vitest.config.ts`
- `example_1/frontend/src/App.tsx`
- `example_1/frontend/src/views/WeatherView.tsx`
- `example_1/frontend/src/components/WeatherSearchForm.tsx`
- `example_1/frontend/src/components/WeatherFeedback.tsx`
- `example_1/frontend/src/components/WeatherResult.tsx`
- `example_1/frontend/src/components/SourceAttribution.tsx`
- `example_1/frontend/src/hooks/useWeatherSearch.ts`
- `example_1/frontend/src/services/weather-service.ts`
- `example_1/frontend/src/types/*.ts`
- `example_1/frontend/src/index.css`, `src/main.tsx` e `index.html`
- `example_1/frontend/package.json`, `package-lock.json`, `vite.config.ts` e `vitest.config.ts`
- `example_1/e2e/package.json`, `package-lock.json`, `playwright.config.ts`, servidor simulado e specs do painel
