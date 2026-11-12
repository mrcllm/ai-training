# Tarefa 1.0: Alternância °C/°F no cartão de resultado

## Visão geral

Esta tarefa entrega a funcionalidade completa no frontend. Ao final, o cartão de resultado tem um botão que alterna a temperatura atual e a sensação térmica entre °C e °F. A escolha vale para as próximas buscas da mesma página aberta e volta para °C ao recarregar.

Estão incluídos:

- o tipo `TemperatureUnit`;
- as funções puras de conversão e formatação;
- o hook `useTemperatureUnit`;
- os componentes `TemperatureUnitToggle` e `TemperatureHighlight`;
- as mudanças em `WeatherResult` e `WeatherView`;
- os testes de unidade e integração.

O botão entra na ordem de Tab entre o resultado e o link Open-Meteo. Por isso esta tarefa também ajusta o E2E-06 do painel, para manter a suíte E2E verde.

**Pré-requisito:** o painel de clima precisa estar implementado em `task-2` (entregue na task 1), com a infraestrutura de testes: Vitest, jsdom, Testing Library, limites de cobertura de 80% e Playwright em `e2e/`. `@testing-library/user-event` e `msw` são adicionados ao frontend com `npm install --save-dev`. Se o painel ainda não existir, pare e sinalize antes de começar.

<skills>
### Conformidade com skills

- **`react`** (`.agents/skills/react/SKILL.md`): obrigatória antes de qualquer código no frontend. Pontos aplicáveis:
  - componentes com no máximo 30 linhas;
  - props explícitas, sem spread;
  - hook com prefixo `use`, sem `useEffect` nem `useMemo`;
  - valor convertido derivado na renderização, nunca guardado em estado;
  - estado único no `WeatherView`;
  - atualizador funcional no toggle;
  - botão não remontado, para manter o foco;
  - `button` semântico, `role="status"` e Tailwind com `hover` e `focus-visible`.
- **Desvio justificado:** não usar `aria-pressed`. A justificativa está em `techspec.md`, seção "Conformidade com skills".
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` e todas as rules em `.agents/rules/`: `code-standards.md`, `javascript-typescript.md`, `node.md`, `tests.md` e `folder-structure.md`. Regras relevantes:

- **`AGENTS.md`:**
  - Só o frontend e o `e2e/` mudam, e o backend fica inalterado.
  - Ao concluir, executar `npm run lint`, `npm run typecheck`, `npm run build` e `npm run test` em `frontend/`, e `npm run build` e `npm run test` em `backend/`.
- **`code-standards.md`:**
  - Sem comentários no código.
  - Arquivos com no máximo 100 linhas, e funções e componentes com no máximo 30.
  - No máximo 3 parâmetros por função.
  - Sem linhas em branco dentro de funções.
  - Constantes nomeadas para `9 / 5`, `32` e `10`.
- **`javascript-typescript.md`:**
  - `const`, `===`, nenhum `any` e retornos tipados.
  - `Record<TemperatureUnit, …>` em vez de ternários aninhados.
  - Arrow functions apenas em callbacks.
- **`folder-structure.md`:**
  - `types/temperature-unit.ts` num arquivo próprio.
  - Hook em `hooks/`, componentes em `components/` e composição em `views/`.
  - Funções puras de conversão em `services/`, pasta prevista para transformação de respostas da API. A justificativa está em `techspec.md`, seção "Principais decisões".
  - Testes ao lado do código.
- **`tests.md`:**
  - Vitest e Testing Library.
  - Estrutura AAA com um conceito por teste.
  - FIRST sem relógio nem dados aleatórios, e mocks restaurados após cada teste.
  - Cobertura mínima de 80%.
  - A regra de conversão é testada primeiro.
- **`node.md`:** o backend não muda. `msw` e `@testing-library/user-event` são instalados no frontend com `npm install --save-dev`, e o `package-lock.json` é versionado.
</rules>

<requirements>
- RF1 e RF2: o botão de alternância existe somente quando o cartão de resultado está visível.
- RF3: o rótulo é "Mostrar em °F" quando a unidade ativa é °C, e "Mostrar em °C" quando é °F.
- RF4: cada acionamento alterna todas as temperaturas do cartão.
- RF5: a mudança de unidade é anunciada a tecnologias assistivas sem mover o foco.
- RF6 e RF7: a conversão é °F = °C × 9/5 + 32, com uma casa decimal e sem "-0".
- RF8: a conversão parte sempre do valor original em °C, sem erro acumulado.
- RF9: o símbolo junto a cada temperatura corresponde à unidade ativa, e as unidades nunca aparecem misturadas.
- RF10: umidade e vento ficam inalterados.
- RF11: alternar não faz requisição ao backend nem altera localidade, condição, horário ou atribuição.
- RF12: os valores seguem o mesmo padrão numérico usado hoje para °C.
- RF13 a RF15: a unidade padrão é °C, a escolha vale para as buscas seguintes na mesma página e não é persistida.
- Acessibilidade:
  - botão nativo, com o nome acessível contendo o texto visível;
  - área de toque de pelo menos 44 × 44 px;
  - foco visível que permanece no botão após o acionamento.
- Cobertura mínima de 80% no frontend.
</requirements>

## Subtarefas

- [x] 1.1 Confirmar o pré-requisito: o painel de clima e a infraestrutura de testes existem em `task-2`. Carregar a skill `react`.
- [x] 1.2 Criar `types/temperature-unit.ts` e `services/temperature.ts` com `DEFAULT_TEMPERATURE_UNIT`, `convertCelsiusToFahrenheit`, `formatTemperature` e `getNextTemperatureUnit`, e escrever TU-01 a TU-06.
- [x] 1.3 Criar `hooks/useTemperatureUnit.ts`, que começa em °C, alterna com atualizador funcional e não persiste nada, e escrever TU-07 a TU-09.
- [x] 1.4 Criar `components/TemperatureUnitToggle.tsx`. Ele tem o rótulo de ação, um sufixo `sr-only` no nome acessível, um `role="status"` visualmente oculto e o estilo secundário com pelo menos 44 px. Escrever TU-10 a TU-14.
- [x] 1.5 Extrair `components/TemperatureHighlight.tsx` do `WeatherResult`, com largura mínima reservada para o valor e o botão abaixo da caixa. Fazer o `WeatherResult` aceitar `temperatureUnit` e `onToggleTemperatureUnit` e formatar a sensação térmica. Adaptar `WeatherResult.test.tsx` e escrever TU-15 a TU-20.
- [x] 1.6 Ligar `useTemperatureUnit` ao `views/WeatherView.tsx` e repassar unidade e handler ao `WeatherResult`. Escrever TI-01 a TI-09 em `WeatherView.test.tsx`.
- [x] 1.7 Ajustar o E2E-06 de `e2e/weather-panel-accessibility.spec.ts`: depois do resultado, o foco vai primeiro para o botão "Mostrar em °F" e só então para o link Open-Meteo.
- [x] 1.8 Validar:
  - em `frontend/`: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test` e `npm run test:coverage`, com no mínimo 80%;
  - em `backend/`: `npm run build` e `npm run test`;
  - em `e2e/`: `npm test`, com a suíte existente verde.

## Detalhes de implementação

Consulte em [`techspec.md`](./techspec.md):

- "Visão dos componentes" e o diagrama de dependências: arquivos novos e modificados e a direção dos imports, sem ciclos.
- "Principais interfaces": assinaturas, constantes, regras de arredondamento e normalização de `-0`, rótulos, nome acessível, status, foco e classes Tailwind do botão e do destaque.
- "Modelos de dados": os contratos `TemperatureUnit`, `UseTemperatureUnitResult`, `TemperatureUnitToggleProps`, `TemperatureHighlightProps` e `WeatherResultProps`, o mapeamento `WeatherResponse` → exibição e a tabela de referência da conversão.
- "Principais decisões": estado no `WeatherView`, sem persistência, botão nativo em vez do `Button` do shadcn, extração do `TemperatureHighlight` e funções de conversão em `services/`.
- "Riscos conhecidos":
  - regiões live aninhadas;
  - testes acoplados a `previousElementSibling` e `nextElementSibling`;
  - mudança na ordem de Tab.

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
- CA-13 (dimensionamento do botão implementado aqui e verificado no E2E-03 da tarefa 2.0)
- CA-14

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-01 — `convertCelsiusToFahrenheit` converte os valores da tabela de referência
- [x] TU-02 — `convertCelsiusToFahrenheit` normaliza zero negativo
- [x] TU-03 — `formatTemperature` em °F formata o valor convertido com o símbolo
- [x] TU-04 — `formatTemperature` em °C preserva o valor original
- [x] TU-05 — `formatTemperature` em °F nunca exibe "-0"
- [x] TU-06 — `getNextTemperatureUnit` alterna entre as duas unidades
- [x] TU-07 — `useTemperatureUnit` começa em Celsius
- [x] TU-08 — `useTemperatureUnit` alterna para Fahrenheit e volta
- [x] TU-09 — `useTemperatureUnit` aplica duas alternâncias no mesmo `act`
- [x] TU-10 — `TemperatureUnitToggle` em °C oferece a troca para °F
- [x] TU-11 — `TemperatureUnitToggle` em °F oferece a troca para °C
- [x] TU-12 — `TemperatureUnitToggle` chama `onToggle` uma vez por clique
- [x] TU-13 — `TemperatureUnitToggle` informa a unidade em uso por status
- [x] TU-14 — `TemperatureUnitToggle` tem nome acessível que contém o rótulo visível
- [x] TU-15 — `WeatherResult` em °F exibe a temperatura atual convertida
- [x] TU-16 — `WeatherResult` em °F exibe a sensação térmica convertida
- [x] TU-17 — `WeatherResult` em °F mantém umidade e vento
- [x] TU-18 — `WeatherResult` em °F mantém localidade, condição e atribuição
- [x] TU-19 — `WeatherResult` em °C exibe os valores originais
- [x] TU-20 — `WeatherResult` encaminha o acionamento do botão

### Testes de integração (se aplicável)

- [x] TI-01 — Alternar após uma busca exibe as temperaturas em °F
- [x] TI-02 — Alternar não faz nova requisição ao backend
- [x] TI-03 — Alternar não exibe estado de carregamento
- [x] TI-04 — Dez alternâncias restauram exatamente os valores originais
- [x] TI-05 — A unidade escolhida vale para a busca seguinte
- [x] TI-06 — Sem resultado não há botão de alternância
- [x] TI-07 — Busca com erro não exibe o botão de alternância
- [x] TI-08 — Enter alterna a unidade e mantém o foco
- [x] TI-09 — Espaço alterna a unidade e mantém o foco

### Testes E2E (se aplicável)

- [x] E2E-06 (existente, do painel de clima) — ajustar a ordem de Tab para incluir o botão "Mostrar em °F" entre o resultado e o link Open-Meteo

## Arquivos relevantes

Novos:

- `frontend/src/types/temperature-unit.ts`
- `frontend/src/types/use-temperature-unit-result.ts`: um tipo por arquivo, conforme `folder-structure.md`.
- `frontend/src/services/temperature.ts` e `frontend/src/services/temperature.test.ts`
- `frontend/src/hooks/useTemperatureUnit.ts` e `frontend/src/hooks/useTemperatureUnit.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx` e `frontend/src/components/TemperatureUnitToggle.test.tsx`
- `frontend/src/components/TemperatureHighlight.tsx`
- `frontend/src/views/WeatherView.temperature-unit.test.tsx`: TI-01 a TI-09. Ficou num arquivo próprio para respeitar o limite de 100 linhas.
- `frontend/src/test/weather-view-helpers.ts`: helpers `searchCity` e `readTemperatures` dos testes de integração.

Modificados:

- `frontend/src/components/WeatherResult.tsx` e `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/test/weather-fixtures.ts`: nova fixture `portoWeatherResponse`, com 10 °C e 8 °C.
- `e2e/weather-panel-accessibility.spec.ts`

Referência, sem alteração:

- `frontend/src/services/weather-service.ts`: `isWeatherResponse` garante °C na origem.
- `frontend/src/types/weather-response.ts`
- `frontend/vite.config.ts`: configuração do Vitest e limites de cobertura.
