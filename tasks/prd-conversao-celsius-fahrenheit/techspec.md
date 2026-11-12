# Especificação técnica

## Resumo

A conversão entre °C e °F é implementada somente no frontend, como uma camada de apresentação sobre o `WeatherResponse` que o painel de clima já recebe. O backend continua entregando temperaturas em °C, e o serviço do frontend continua validando isso. Problema, objetivos, critérios de aceitação (CA-01 a CA-14) e escopo estão em [`prd.md`](./prd.md).

A solução tem quatro peças:

- funções puras de conversão e formatação em `lib/temperature.ts`;
- um hook `useTemperatureUnit` que guarda a unidade ativa em estado React, mantido no `WeatherView`;
- um botão `TemperatureUnitToggle` com rótulo de ação e anúncio de status;
- a extração de `TemperatureHighlight` a partir do `WeatherResult`.

O estado fica na view, e não no cartão, porque o cartão é desmontado durante cada nova busca e a escolha precisa sobreviver a ela (RF14). Não há armazenamento no navegador, então recarregar a página volta para °C (RF13 e RF15). A conversão sempre parte do valor original em °C, o que elimina erro acumulado ao alternar várias vezes (RF8).

A funcionalidade é implementada em `task-2`, sobre o painel de clima já existente nesta worktree (`frontend/src`: `WeatherView`, `WeatherResult`, `useWeatherSearch`, `types/weather-response.ts`). A infraestrutura de testes usada é Vitest, Testing Library, msw e Playwright; `msw` e `@testing-library/user-event` foram adicionados ao frontend junto com esta funcionalidade.

## Arquitetura do sistema

### Visão dos componentes

| Componente | Tipo | Situação | Responsabilidade |
| --- | --- | --- | --- |
| `types/temperature-unit.ts` | Tipo | Novo | Define `TemperatureUnit` (`'°C' \| '°F'`). |
| `lib/temperature.ts` | Funções puras | Novo | Converte °C → °F com arredondamento e normalização de `-0`, formata o texto exibido e calcula a próxima unidade. |
| `hooks/useTemperatureUnit.ts` | Hook | Novo | Guarda a unidade ativa (padrão °C) e expõe `toggleUnit`. |
| `components/TemperatureUnitToggle.tsx` | Componente | Novo | Botão "Mostrar em °F/°C" e região de status visualmente oculta que anuncia a unidade em uso. |
| `components/TemperatureHighlight.tsx` | Componente | Novo (extraído) | Destaque da temperatura atual (caixa amarela, ícone e rótulo "Temperatura atual") com o botão de alternância logo abaixo. |
| `components/WeatherResult.tsx` | Componente | Modificado | Recebe a unidade e o handler, delega o destaque ao `TemperatureHighlight` e formata a sensação térmica na unidade ativa. |
| `views/WeatherView.tsx` | View | Modificado | Chama `useTemperatureUnit` e repassa unidade e handler ao `WeatherResult`. |
| `e2e/temperature-unit.spec.ts` | Teste E2E | Novo | Fluxos completos de alternância, recarga, layout em 360 px, tempo de resposta e acessibilidade com axe. |
| `e2e/weather-panel-accessibility.spec.ts` | Teste E2E | Modificado | O E2E-06 do painel passa a incluir o botão na ordem de Tab entre o resultado e o link Open-Meteo. |

Relacionamentos e dependências (unidirecionais, sem ciclos):

```text
WeatherView ──► useWeatherSearch            (existente, inalterado)
     │
     ├────────► useTemperatureUnit ──► lib/temperature ──► types/temperature-unit
     │
     └────────► WeatherResult ──► TemperatureHighlight ──► TemperatureUnitToggle
                      │                    │
                      └────────────────────┴──► lib/temperature (formatTemperature)
```

Fluxo de dados:

1. `useWeatherSearch` produz `{ status: 'success', data: WeatherResponse }` com valores em °C, como já faz hoje.
2. `WeatherView` lê `unit` e `toggleUnit` de `useTemperatureUnit` e passa ao `WeatherResult` o `weather`, a `temperatureUnit` e o `onToggleTemperatureUnit`.
3. Na renderização, `WeatherResult` e `TemperatureHighlight` chamam `formatTemperature(valorEmCelsius, unit)`. O valor convertido é derivado e nunca é guardado em estado.
4. O clique ou o teclado no botão chama `toggleUnit`, que atualiza o estado da view. O React renderiza de novo de forma síncrona, sem requisição nem estado de carregamento (RF11 e CA-14).
5. Numa nova busca, o estado de busca passa por `loading` e o cartão é desmontado, mas `unit` continua no `WeatherView`. O novo resultado já nasce na unidade escolhida (RF14).

## Design de implementação

### Principais interfaces

```ts
export type TemperatureUnit = '°C' | '°F';

export const DEFAULT_TEMPERATURE_UNIT: TemperatureUnit;
export function convertCelsiusToFahrenheit(celsius: number): number;
export function formatTemperature(celsius: number, unit: TemperatureUnit): string;
export function getNextTemperatureUnit(unit: TemperatureUnit): TemperatureUnit;
```

Regras de `lib/temperature.ts`:

- `convertCelsiusToFahrenheit` aplica `celsius × 9/5 + 32`, arredonda para uma casa decimal (`Math.round(valor × 10) / 10`) e normaliza `-0` para `0` (RF6 e RF7).
- As constantes têm nomes próprios: `FAHRENHEIT_SCALE_FACTOR = 9 / 5`, `FAHRENHEIT_OFFSET = 32` e `ONE_DECIMAL_FACTOR = 10`.
- `formatTemperature` devolve `` `${valor} ${unit}` ``, o mesmo padrão que o painel usa hoje (RF12).
  - Para °C, o valor é o original, sem arredondar (RF8).
  - Para °F, o valor é o resultado de `convertCelsiusToFahrenheit`.
- `getNextTemperatureUnit` usa um mapa `Record<TemperatureUnit, TemperatureUnit>`, sem ternários aninhados.

```ts
export type UseTemperatureUnitResult = {
  unit: TemperatureUnit;
  toggleUnit: () => void;
};

export function useTemperatureUnit(): UseTemperatureUnitResult;
```

- O estado é `useState<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT)`.
- `toggleUnit` usa o atualizador funcional `setUnit(getNextTemperatureUnit)`, assim duas chamadas no mesmo evento produzem duas alternâncias.
- Não há `useEffect`, persistência nem `useMemo`. O cálculo é trivial.

```tsx
type TemperatureUnitToggleProps = { unit: TemperatureUnit; onToggle: () => void };
export function TemperatureUnitToggle({ unit, onToggle }: TemperatureUnitToggleProps): React.JSX.Element;

type TemperatureHighlightProps = { celsius: number; unit: TemperatureUnit; onToggleUnit: () => void };
export function TemperatureHighlight({ celsius, unit, onToggleUnit }: TemperatureHighlightProps): React.JSX.Element;

type WeatherResultProps = {
  weather: WeatherResponse;
  temperatureUnit: TemperatureUnit;
  onToggleTemperatureUnit: () => void;
};
export function WeatherResult({ weather, temperatureUnit, onToggleTemperatureUnit }: WeatherResultProps): React.JSX.Element;
```

Regras de apresentação e acessibilidade do `TemperatureUnitToggle`:

- **Elemento:** `<button type="button">` nativo. Enter e Espaço funcionam sem código extra (CA-11).
- **Rótulo visível:** "Mostrar em °F" quando a unidade ativa é °C, e "Mostrar em °C" quando é °F (RF3).
- **Nome acessível:** o rótulo visível é seguido de um sufixo `sr-only`, " (Fahrenheit)" ou " (Celsius)". O nome fica "Mostrar em °F (Fahrenheit)". Não usa `aria-label`, para manter o texto visível dentro do nome acessível (WCAG 2.5.3).
- **Status:** `<span role="status" className="sr-only">` irmão do botão, com "Temperaturas exibidas em Celsius" ou "Temperaturas exibidas em Fahrenheit". O texto é derivado da prop, e a mudança é anunciada sem mover o foco (RF5 e CA-12).
- **Foco:** o botão não muda de posição nem de `key` entre renderizações. Por isso o foco permanece nele após o acionamento (CA-11).
- **Estilo** (Tailwind, peso secundário, mesma linguagem visual dos controles do painel):
  - `min-h-11 min-w-11` (44 px, CA-13), `rounded-xl`, borda `#1b6172` e fundo branco;
  - texto `#1b6172` em `text-sm font-semibold`, hover `bg-[#f3f7f7]`;
  - `focus-visible:ring-4 ring-[#f4c95d] ring-offset-2`.
  - O botão ocupa a largura da caixa da temperatura, então a largura dele não muda entre os rótulos.

Regras do `TemperatureHighlight`:

- Encapsula a caixa amarela já existente: ícone `CloudSun`, o valor `formatTemperature(celsius, unit)` em `tabular-nums` e o rótulo "Temperatura atual".
- O valor tem largura mínima reservada (`min-w-[7ch]`) para evitar deslocamento de layout na troca.
- O botão fica logo abaixo da caixa, num contêiner `flex flex-col gap-2` com o alinhamento padrão (`stretch`), e ocupa a mesma largura da caixa. Assim continua alinhado a ela em qualquer largura de tela, inclusive quando um título longo empurra o destaque para a linha de baixo.
  - Esta regra foi revista no QA (BUG-01 em `qa.md`). A versão anterior alinhava o botão ao fim a partir de `sm`, o que o deslocava da caixa quando o título quebrava de linha.
- Componentes e funções ficam com no máximo 30 linhas, e arquivos com no máximo 100.

Mudanças no `WeatherResult`:

- O bloco do destaque passa a ser `<TemperatureHighlight celsius={current.temperature} unit={temperatureUnit} onToggleUnit={onToggleTemperatureUnit} />`.
- A sensação térmica passa a usar `formatTemperature(current.apparentTemperature, temperatureUnit)`.
- Umidade e vento continuam usando `units.humidity` e `units.windSpeed` (RF10).
- Localidade, condição e `SourceAttribution` não mudam (RF11).

Mudanças no `WeatherView`:

- Adiciona `const { unit, toggleUnit } = useTemperatureUnit();`.
- Passa `temperatureUnit={unit}` e `onToggleTemperatureUnit={toggleUnit}` ao `WeatherResult`. Nada mais muda.

### Modelos de dados

Não há entidades persistidas nem contratos JSON novos. Os modelos abaixo são contratos internos do frontend.

#### `TemperatureUnit` — unidade de exibição das temperaturas

| Valor  | Significado |
| ------ | ----------- |
| `'°C'` | Exibe os valores originais recebidos do backend. É o padrão ao carregar a página. |
| `'°F'` | Exibe os valores convertidos e arredondados para uma casa decimal. |

```ts
const unit: TemperatureUnit = '°F';
```

#### `UseTemperatureUnitResult` — retorno de `useTemperatureUnit`

| Campo        | Tipo              | Obrigatório | Descrição |
| ------------ | ----------------- | ----------- | --------- |
| `unit`       | `TemperatureUnit` | sim | Unidade ativa. Começa em `'°C'` e não é persistida. |
| `toggleUnit` | `() => void`      | sim | Alterna para a outra unidade com atualizador funcional. |

```ts
{ unit: '°C', toggleUnit: [Function] }
```

#### `TemperatureUnitToggleProps` — props do botão de alternância

| Campo      | Tipo              | Obrigatório | Descrição |
| ---------- | ----------------- | ----------- | --------- |
| `unit`     | `TemperatureUnit` | sim | Unidade ativa. Define o rótulo da ação, que indica a outra unidade, e o texto de status. |
| `onToggle` | `() => void`      | sim | Chamado uma vez por acionamento (clique, Enter ou Espaço). |

```tsx
<TemperatureUnitToggle unit="°C" onToggle={toggleUnit} />
```

#### `TemperatureHighlightProps` — props do destaque da temperatura atual

| Campo          | Tipo              | Obrigatório | Descrição |
| -------------- | ----------------- | ----------- | --------- |
| `celsius`      | `number`          | sim | `current.temperature` original, em °C. |
| `unit`         | `TemperatureUnit` | sim | Unidade ativa. |
| `onToggleUnit` | `() => void`      | sim | Repassado ao `TemperatureUnitToggle`. |

```tsx
<TemperatureHighlight celsius={18.4} unit="°F" onToggleUnit={toggleUnit} />
```

#### `WeatherResultProps` — props do cartão de resultado (modificado)

| Campo                     | Tipo              | Obrigatório | Descrição |
| ------------------------- | ----------------- | ----------- | --------- |
| `weather`                 | `WeatherResponse` | sim | Contrato atual do backend, inalterado e sempre em °C. |
| `temperatureUnit`         | `TemperatureUnit` | sim | Novo. Unidade das temperaturas exibidas. |
| `onToggleTemperatureUnit` | `() => void`      | sim | Novo. Handler do botão de alternância. |

```tsx
<WeatherResult weather={state.data} temperatureUnit={unit} onToggleTemperatureUnit={toggleUnit} />
```

#### Mapeamento `WeatherResponse` → exibição

| Origem (`WeatherResponse`)   | Destino (texto exibido) | Com `'°C'` | Com `'°F'` |
| ---------------------------- | ----------------------- | ---------- | ---------- |
| `current.temperature`        | Temperatura atual       | `18.4 °C`  | `65.1 °F`  |
| `current.apparentTemperature`| Sensação térmica        | `17.9 °C`  | `64.2 °F`  |
| `current.humidity` + `units.humidity`   | Umidade relativa | `72 %` | `72 %` |
| `current.windSpeed` + `units.windSpeed` | Velocidade do vento | `14.2 km/h` | `14.2 km/h` |
| `units.temperature`, `units.apparentTemperature` | Não usados na exibição | — | — |

> **Garantia de origem em °C:** `isWeatherResponse`, em `services/weather-service.ts`, já rejeita respostas cujas unidades de temperatura não sejam `'°C'`. Por isso `formatTemperature` pode tratar o valor recebido como Celsius sem ler `units.temperature`.

#### Tabela de referência da conversão (CA-03)

| °C recebido | `convertCelsiusToFahrenheit` | Texto em °F |
| ----------- | ---------------------------- | ----------- |
| `0`         | `32`                         | `32 °F`     |
| `100`       | `212`                        | `212 °F`    |
| `-40`       | `-40`                        | `-40 °F`    |
| `22.5`      | `72.5`                       | `72.5 °F`   |
| `-3.2`      | `26.2`                       | `26.2 °F`   |
| `37`        | `98.6`                       | `98.6 °F`   |
| `-17.8`     | `0` (nunca `-0`)             | `0 °F`      |
| `25`        | `77`                         | `77 °F`     |
| `27`        | `80.6`                       | `80.6 °F`   |

### Endpoints da API (se aplicável)

Não aplicável. A funcionalidade não cria nem altera endpoints. O frontend continua consumindo `GET /weather?city=` com o contrato `WeatherResponse` atual, e alternar a unidade não gera requisições (RF11 e CA-07).

## Pontos de integração

Não há integrações externas novas. A Open-Meteo continua acessada apenas pelo backend, que continua pedindo `temperature_unit=celsius`. A conversão não depende de rede, então não há timeouts, novas tentativas nem modos de falha novos.

## Abordagem de testes

A camada de maior risco é a regra de conversão e arredondamento, coberta primeiro com testes de unidade. Os testes de integração verificam a colaboração entre `WeatherView`, `useWeatherSearch` e o backend simulado com msw, reaproveitando `test/weather-fixtures.ts` (18.4 °C e 17.9 °C). Os testes E2E cobrem o que só o navegador real comprova: recarga da página, layout em 360 px, tempo de resposta e auditoria com axe.

Os testes usam a estrutura AAA com um conceito por caso, dados preparados no próprio teste, nenhuma dependência de relógio ou valores aleatórios, e mocks restaurados após cada teste. A meta de cobertura é a das rules do projeto: mínimo de 80% em linhas, branches, funções e statements, aplicado pela configuração do Vitest em `frontend/vite.config.ts`.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TU-01 | `convertCelsiusToFahrenheit` converte os valores da tabela de referência | CA-03 | `it.each` sobre 0, 100, -40, 22.5, -3.2 e 37 retorna exatamente 32, 212, -40, 72.5, 26.2 e 98.6. |
| TU-02 | `convertCelsiusToFahrenheit` normaliza zero negativo | CA-03 | `-17.8` retorna `0`, e `Object.is(resultado, -0)` é `false`. |
| TU-03 | `formatTemperature` em °F formata o valor convertido com o símbolo | CA-01 | `formatTemperature(25, '°F')` retorna `'77 °F'`, e `formatTemperature(27, '°F')` retorna `'80.6 °F'`. |
| TU-04 | `formatTemperature` em °C preserva o valor original | CA-02 | `formatTemperature(22.5, '°C')` retorna `'22.5 °C'`, sem arredondar nem converter. |
| TU-05 | `formatTemperature` em °F nunca exibe "-0" | CA-03 | `formatTemperature(-17.8, '°F')` retorna `'0 °F'`. |
| TU-06 | `getNextTemperatureUnit` alterna entre as duas unidades | CA-05 | `'°C'` vira `'°F'`, e `'°F'` vira `'°C'`. |
| TU-07 | `useTemperatureUnit` começa em Celsius | CA-09 | `renderHook` retorna `unit === '°C'`. |
| TU-08 | `useTemperatureUnit` alterna para Fahrenheit e volta | CA-05 | Após um `toggleUnit`, `unit` é `'°F'`; após o segundo, é `'°C'`. |
| TU-09 | `useTemperatureUnit` aplica duas alternâncias no mesmo `act` | CA-04 | Duas chamadas de `toggleUnit` no mesmo `act` resultam em `'°C'`, o que valida o atualizador funcional. |
| TU-10 | `TemperatureUnitToggle` em °C oferece a troca para °F | CA-05 | Existe um botão com nome `/^Mostrar em °F/`. |
| TU-11 | `TemperatureUnitToggle` em °F oferece a troca para °C | CA-05 | Existe um botão com nome `/^Mostrar em °C/`. |
| TU-12 | `TemperatureUnitToggle` chama `onToggle` uma vez por clique | CA-01 | Após `user.click`, o spy de `onToggle` foi chamado uma vez. |
| TU-13 | `TemperatureUnitToggle` informa a unidade em uso por status | CA-12 | Com `unit="°F"`, `getByRole('status')` tem o texto "Temperaturas exibidas em Fahrenheit". |
| TU-14 | `TemperatureUnitToggle` tem nome acessível que contém o rótulo visível | CA-12 | O nome acessível é "Mostrar em °F (Fahrenheit)". |
| TU-15 | `WeatherResult` em °F exibe a temperatura atual convertida | CA-01 | O valor associado a "Temperatura atual" é `65.1 °F`. |
| TU-16 | `WeatherResult` em °F exibe a sensação térmica convertida | CA-01 | O valor associado a "Sensação térmica" é `64.2 °F`. |
| TU-17 | `WeatherResult` em °F mantém umidade e vento | CA-06 | Umidade `72 %` e vento `14.2 km/h`. |
| TU-18 | `WeatherResult` em °F mantém localidade, condição e atribuição | CA-07 | O título "Lisboa, Lisboa, Portugal", "Parcialmente nublado" e o link Open-Meteo continuam presentes. |
| TU-19 | `WeatherResult` em °C exibe os valores originais | CA-02 | `18.4 °C` e `17.9 °C`. Este é o teste existente adaptado às novas props. |
| TU-20 | `WeatherResult` encaminha o acionamento do botão | CA-01 | Clicar em "Mostrar em °F" chama `onToggleTemperatureUnit` uma vez. |

Estratégia:

- Os componentes são testados isoladamente com Testing Library e `@testing-library/user-event`, por papel e nome acessível.
- As asserções sobre valores usam o rótulo vizinho ("Temperatura atual", "Sensação térmica"), como os testes atuais. Se `TemperatureHighlight` mudar a estrutura, as consultas devem seguir o rótulo e não a posição exata no DOM.
- Não há mocks em `lib/temperature.ts` nem no hook, porque são puros. Os componentes recebem spies (`vi.fn()`) apenas para os handlers.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| TI-01 | Alternar após uma busca exibe as temperaturas em °F | CA-01 | Depois de buscar "Lisboa" e clicar em "Mostrar em °F", aparecem `65.1 °F` e `64.2 °F`. |
| TI-02 | Alternar não faz nova requisição ao backend | CA-07 | O contador de chamadas do handler msw de `GET /weather` continua `1` após várias alternâncias. |
| TI-03 | Alternar não exibe estado de carregamento | CA-14 | Logo após o clique, e sem `await` de `findBy*`, os valores em °F já estão no DOM e "Consultando as condições atuais…" não aparece. |
| TI-04 | Dez alternâncias restauram exatamente os valores originais | CA-02, CA-04 | Após dez cliques, aparecem `18.4 °C` e `17.9 °C`. |
| TI-05 | A unidade escolhida vale para a busca seguinte | CA-08 | Com °F ativo, uma nova busca exibe o novo resultado em °F e o botão "Mostrar em °C". |
| TI-06 | Sem resultado não há botão de alternância | CA-10 | No estado inicial, nenhum botão com nome `/^Mostrar em °/` está presente. |
| TI-07 | Busca com erro não exibe o botão de alternância | CA-10 | Com msw respondendo `404 CITY_NOT_FOUND`, o alerta aparece e não há botão de alternância. |
| TI-08 | Enter alterna a unidade e mantém o foco | CA-11 | Com foco no botão, `user.keyboard('{Enter}')` exibe `65.1 °F`, e o botão "Mostrar em °C" continua com foco. |
| TI-09 | Espaço alterna a unidade e mantém o foco | CA-11 | Com foco no botão, `user.keyboard(' ')` alterna a unidade, e o foco permanece no botão. |

Dados e ambiente:

- O `WeatherView` real é renderizado com `useWeatherSearch` e `weather-service` reais.
- O msw `setupServer` intercepta `http://localhost:3001/weather` e devolve `weatherResponse` de `test/weather-fixtures.ts`, seguindo o padrão do `WeatherView.test.tsx`.
- Os handlers são reiniciados após cada teste, e o contador de chamadas é local a cada caso.

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
|----|-----------------------|------------------------|--------------------|
| E2E-01 | A pessoa alterna para °F e a escolha vale para a próxima busca | CA-01, CA-08 | Ao buscar "Paris", aparecem `18.4 °C` e `17.2 °C`. Após "Mostrar em °F", aparecem `65.1 °F` e `63 °F`. Uma nova busca exibe `65.1 °F`, e o botão diz "Mostrar em °C". |
| E2E-02 | Recarregar a página volta para Celsius | CA-09 | Após alternar para °F, `page.reload()` e uma nova busca exibem `18.4 °C` e o botão "Mostrar em °F". |
| E2E-03 | O botão é utilizável em tela de 360 px | CA-13 | Com viewport de 360 × 800 e um resultado exibido, não há rolagem horizontal, o botão está inteiro na viewport e o `boundingBox` mede pelo menos 44 × 44 px. |
| E2E-04 | A troca de unidade aparece em até 100 ms | CA-14 | Um `MutationObserver` registrado via `page.evaluate` mede o intervalo entre o `click()` e a mudança do texto da temperatura atual. O intervalo é ≤ 100 ms. |
| E2E-05 | O resultado em °F não tem violações críticas ou sérias de acessibilidade | CA-11, CA-12, CA-13 | `AxeBuilder`, com as tags `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa` e `.include('[aria-labelledby="weather-result-title"]')`, não retorna violações com `impact` `critical` ou `serious`. |
| E2E-06 | O botão continua alinhado à caixa da temperatura quando o título quebra de linha | CA-13 | Com "Paris, Île-de-France, França" a 1280 px, a borda esquerda e a largura do botão coincidem com as da caixa amarela, com tolerância de 1 px. É o teste de regressão do BUG-01 do QA. |

Ambiente E2E:

- **Infraestrutura:** reutiliza o `e2e/playwright.config.ts` do painel: mock local da Open-Meteo em `mock-open-meteo.mjs`, backend real na porta 3001 e frontend na porta 5100.
- **Valores do mock:** o forecast devolve `18.4` e `17.2`, que em °F viram `65.1` e `63`.
- **Nova dependência:** `@axe-core/playwright` `^4.14.0`, instalada com `npm install --save-dev` em `e2e/`, atualizando também `e2e/package-lock.json`. A versão 4.14.0 foi publicada em 15/10/2026.
- **Ajuste em teste existente:** o E2E-06 de `weather-panel-accessibility.spec.ts` passa a esperar o foco no botão "Mostrar em °F" após o resultado, e só no Tab seguinte no link Open-Meteo.
- **Leitor de tela:** a validação com VoiceOver ou NVDA do anúncio de CA-12 fica para o QA manual (`/executar-qa`). O TU-13 e o E2E-05 cobrem a parte automatizável.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Pré-requisito:** o painel de clima implementado em `task-2`, com Vitest, jsdom, Testing Library, limites de cobertura de 80% em `frontend/vite.config.ts` e Playwright em `e2e/`. Adicionar `msw` e `@testing-library/user-event` ao frontend com `npm install --save-dev`.
2. **`types/temperature-unit.ts` e `lib/temperature.ts`, com TU-01 a TU-06.** A regra de conversão é o maior risco e não depende de nada mais.
3. **`hooks/useTemperatureUnit.ts`, com TU-07 a TU-09.** Depende do passo 2.
4. **`components/TemperatureUnitToggle.tsx`, com TU-10 a TU-14.** Depende do tipo.
5. **`components/TemperatureHighlight.tsx` (extração) e mudanças no `WeatherResult`, com TU-15 a TU-20.** Inclui adaptar o `WeatherResult.test.tsx` existente às novas props.
6. **Integração no `views/WeatherView.tsx`, com TI-01 a TI-09.**
7. **E2E:** instalar `@axe-core/playwright`, criar `e2e/temperature-unit.spec.ts` (E2E-01 a E2E-05) e ajustar o E2E-06 existente.
8. **Validação final:** em `frontend/`, executar `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test` e `npm run test:coverage`. Em `e2e/`, executar `npm test`. O backend não muda, mas `npm run build` e `npm run test` devem continuar passando.

### Dependências técnicas

- Painel de clima implementado em `task-2` (entregue na task 1, commit `4fe41e1`). Bloqueia a funcionalidade.
- Infraestrutura de testes do frontend e do E2E criada junto com o painel, mais `msw` `^3.0.4` e `@testing-library/user-event` `^14.6.9` como dependências de desenvolvimento do frontend.
- `@axe-core/playwright ^4.14.0` em `e2e/`.
- Node.js 22 ou superior, conforme os `engines` da implementação de referência.
- Nenhuma variável de ambiente, nenhum serviço externo novo e nenhuma mudança no backend.

## Monitoramento e observabilidade

Não aplicável. A funcionalidade é puramente de apresentação no navegador, não faz requisições nem trata erros novos, e o frontend não tem infraestrutura de telemetria. Nenhum log é emitido. O health check e os logs do backend continuam inalterados.

## Considerações técnicas

### Principais decisões

- **Conversão no frontend, a partir do valor original em °C.**
  - O PRD restringe a funcionalidade ao frontend, e converter o valor original evita erro acumulado (RF8).
  - Pedir `temperature_unit=fahrenheit` à Open-Meteo foi descartado: exigiria mudar o backend e o contrato, e geraria uma requisição por troca.
- **Estado da unidade no `WeatherView`, via `useTemperatureUnit`.**
  - O `WeatherResult` é desmontado durante `loading`, então um estado local nele se perderia a cada busca (RF14).
  - Context API foi descartado: há um único consumidor, e passar por props mantém uma única fonte de verdade explícita.
- **Sem persistência.** Atende RF15 diretamente e evita lidar com storage indisponível. `localStorage` foi descartado por decisão de produto.
- **Valor convertido derivado na renderização, nunca em estado.** Segue as regras da skill `react` sobre estado redundante e `useEffect` desnecessário. Também garante que °C mostra sempre o valor original.
- **Arredondamento com `Math.round(valor × 10) / 10` e normalização de `-0`.**
  - A Open-Meteo entrega temperaturas com uma casa decimal. Para esses valores, `°C × 1,8` sempre tem dígito de centésimos par, então não há empate de arredondamento e o resultado é determinístico.
  - `toFixed(1)` foi descartado porque produziria "32.0", divergindo do padrão numérico atual (RF12).
- **Botão nativo com rótulo de ação, sem `aria-pressed`.**
  - O PRD define rótulos de ação que mudam ("Mostrar em °F/°C"). Combinar `aria-pressed` com rótulo variável confunde leitores de tela.
  - O anúncio fica numa região `role="status"` dedicada, e o nome acessível contém o texto visível (WCAG 2.5.3).
- **Botão nativo em vez do `Button` do shadcn (`components/ui/button.tsx`).** Os controles do painel de referência usam botões nativos com a paleta do painel. O `Button` do shadcn usa tokens zinc e repassa props com spread, o que contraria a regra de props explícitas da skill `react`.
- **Extração do `TemperatureHighlight`.** O `WeatherResult` já tem cerca de 25 linhas de JSX. Incluir o botão ultrapassaria o limite de 30 linhas por componente.
- **Funções puras em `lib/`.** `services/` é reservada ao acesso ao backend pela rule de estrutura de pastas, então as funções de conversão ficam em `frontend/src/lib/`. Em `task-2` essa pasta é nova e ainda não consta em `folder-structure.md`; a decisão sobre registrá-la na rule está pendente (P-01 em `codereview.md`).

### Riscos conhecidos

- **Mudanças futuras na estrutura do painel:** os pontos de inserção mudam. Mitigação: os contratos (`TemperatureUnit`, `formatTemperature`, `useTemperatureUnit`, `TemperatureUnitToggle`) são independentes da estrutura do painel. Basta ligar o hook na view que contém o estado da busca.
- **Regiões live aninhadas:** o `<section>` do resultado já tem `aria-live="polite"`. Na troca, o leitor de tela pode anunciar também os novos valores, além do status. Mitigação: o texto de status é curto, e o comportamento deve ser verificado com VoiceOver no QA. Remover o `aria-live` do cartão está fora do escopo, porque mudaria o comportamento do painel.
- **Mudança na ordem de Tab:** o botão entra entre o título do resultado e o link Open-Meteo, o que quebra o E2E-06 do painel. Mitigação: o ajuste já está previsto no passo 7.
- **Testes atuais acoplados à estrutura do DOM:** o `WeatherResult.test.tsx` usa `previousElementSibling` e `nextElementSibling`. Mitigação: na extração, manter o valor imediatamente antes do rótulo "Temperatura atual", ou ajustar a consulta para continuar baseada no rótulo.
- **Medição de 100 ms instável em CI:** mitigação: medir dentro da página com `performance.now()` e `MutationObserver`, sem incluir a latência do Playwright. A atualização é síncrona, o que dá ampla margem.
- **axe acusando problemas que já existem no painel:** mitigação: a análise fica restrita à seção do resultado, que é o escopo do PRD.

### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` e todas as rules em `.agents/rules/`: `code-standards.md`, `javascript-typescript.md`, `node.md`, `tests.md` e `folder-structure.md`.
- **`AGENTS.md`:**
  - Frontend e backend continuam separados, e só o frontend e o `e2e/` mudam.
  - Ao concluir, executar `lint`, `typecheck`, `build` e `test` no frontend, e `build` e `test` no backend.
  - Carregar a skill `react` antes de implementar.
- **`code-standards.md`:**
  - Sem comentários no código.
  - Arquivos com no máximo 100 linhas, e funções e componentes com no máximo 30 (motivo da extração do `TemperatureHighlight`).
  - No máximo 3 parâmetros por função.
  - Sem linhas em branco dentro de funções.
  - Constantes nomeadas para `9 / 5`, `32` e `10`.
  - Cláusulas de guarda onde houver condição.
- **`javascript-typescript.md`:**
  - `const` por padrão, `===`, nenhum `any` e retornos tipados.
  - Mapa `Record<TemperatureUnit, …>` para rótulos e próxima unidade, em vez de ternários aninhados.
  - Arrow functions apenas em callbacks.
  - Imports ES sem símbolos exportados desnecessariamente.
- **`node.md`:**
  - O backend não muda.
  - A nova dependência de E2E é instalada com `npm install --save-dev`, e o `package-lock.json` de `e2e/` é versionado.
  - Os imports não formam ciclos (diagrama na seção de arquitetura).
- **`tests.md`:**
  - Vitest para unidade e integração, e Playwright em `e2e/`.
  - Cobertura mínima de 80% aplicada pelo Vitest.
  - FIRST sem relógio nem dados aleatórios, estrutura AAA e um conceito por teste.
  - Pirâmide com 20 TU, 9 TI e 6 E2E. O E2E-06 foi acrescentado no QA.
  - A regra crítica de conversão é testada primeiro.
- **`folder-structure.md`:**
  - Um tipo por arquivo em `types/`.
  - O hook fica em `hooks/`, os componentes em `components/` e a composição em `views/`.
  - Nenhum acesso ao backend fora de `services/`.
  - Testes ficam ao lado do código (`*.test.ts` e `*.test.tsx`), e os E2E em `e2e/`.

### Conformidade com skills

- **`react` (aplicável):**
  - Componentes pequenos e com uma responsabilidade.
  - Props explícitas, sem spread.
  - Hook com prefixo `use`, sem `useEffect` e sem `useMemo`, porque o cálculo é trivial.
  - Estado mínimo, com o valor convertido derivado na renderização.
  - Uma única fonte de verdade no ancestral comum (`WeatherView`) e atualizador funcional no toggle.
  - Preservação de estado: o botão não é remontado, então o foco se mantém.
  - Elemento semântico `button`, anúncio por `role="status"` e estilização Tailwind com estados de hover e `focus-visible`.
  - **Desvio justificado:** a skill sugere `aria-pressed` quando aplicável, mas ele não é usado. O PRD define um rótulo de ação que muda, e combinar os dois gera anúncios contraditórios. A unidade em uso é comunicada pelo status e pelo símbolo junto aos valores.

### Arquivos relevantes e dependentes

Novos (em `task-2`):

- `frontend/src/types/temperature-unit.ts`
- `frontend/src/types/use-temperature-unit-result.ts`: um tipo por arquivo, conforme `folder-structure.md`.
- `frontend/src/lib/temperature.ts` e `frontend/src/lib/temperature.test.ts`
- `frontend/src/hooks/useTemperatureUnit.ts` e `frontend/src/hooks/useTemperatureUnit.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx` e `frontend/src/components/TemperatureUnitToggle.test.tsx`
- `frontend/src/components/TemperatureHighlight.tsx`
- `frontend/src/views/WeatherView.temperature-unit.test.tsx` (TI-01 a TI-09): fica num arquivo próprio para respeitar o limite de 100 linhas.
- `frontend/src/test/weather-view-helpers.ts`: helpers dos testes de integração.
- `e2e/temperature-unit.spec.ts` e `e2e/temperature-unit-helpers.ts`

Modificados:

- `frontend/src/components/WeatherResult.tsx` e `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/test/weather-fixtures.ts` (fixture `portoWeatherResponse`)
- `e2e/weather-panel-accessibility.spec.ts` (E2E-06 do painel)
- `e2e/package.json` e `e2e/package-lock.json` (`@axe-core/playwright`)

Referência e dependências, sem alteração:

- `frontend/src/hooks/useWeatherSearch.ts`: estado da busca, inalterado.
- `frontend/src/services/weather-service.ts`: `isWeatherResponse` garante unidades em °C.
- `frontend/src/types/weather-response.ts` e `types/weather-search-state.ts`
- `frontend/src/test/setup.ts` e `frontend/vite.config.ts` (configuração do Vitest e limites de cobertura)
- `e2e/playwright.config.ts`, `e2e/test-ports.ts` e `e2e/mock-open-meteo.mjs`
- `tasks/prd-conversao-celsius-fahrenheit/prd.md`
