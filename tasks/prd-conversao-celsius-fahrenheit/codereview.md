# Relatório de revisão de código — Conversão de temperatura entre Celsius e Fahrenheit

## Resumo
- Data: 12/11/2026
- Branch: `task-2` (worktree `spec-driven-development/task-2`, alterações ainda não commitadas)
- Status: APROVADO

**Escopo revisado:** os 18 arquivos da funcionalidade em `task-2` (tarefas 1.0 e 2.0, incluindo a correção do BUG-01 do QA), além das dependências de teste adicionadas:

- código: `types/temperature-unit.ts`, `types/use-temperature-unit-result.ts`, `services/temperature.ts`, `hooks/useTemperatureUnit.ts`, `components/TemperatureUnitToggle.tsx`, `components/TemperatureHighlight.tsx`, `components/WeatherResult.tsx` e `views/WeatherView.tsx`;
- testes de unidade e de integração, `test/weather-view-helpers.ts` e `test/weather-fixtures.ts`;
- `e2e/temperature-unit.spec.ts`, `e2e/temperature-unit-helpers.ts` e o ajuste no E2E-06 de `e2e/weather-panel-accessibility.spec.ts`;
- `frontend/package.json` e `e2e/package.json`, com os lock files.

**Contexto:** a funcionalidade foi implementada originalmente em `template/` e trazida para `task-2`, cujo painel de clima veio de `example_3`. Também foram descartadas de `task-2` alterações anteriores que fixavam o sistema inteiro em °F, inclusive no backend, contrariando o PRD. O backend de `task-2` voltou a pedir `temperature_unit=celsius`, e `weather-service.ts` voltou a validar `°C`.

## Conformidade com regras
| Regra | Status | Observações |
|------|--------|-------------|
| `AGENTS.md`: separação frontend/backend e validações obrigatórias | OK | Só `frontend/` e `e2e/` mudam. Lint, typecheck, build, test e coverage executados no frontend; build e test no backend; suíte E2E executada. |
| `AGENTS.md`: skill `react` carregada antes de revisar o frontend | OK | Carregada nesta revisão. |
| `code-standards.md`: sem comentários | OK | Nenhum comentário nos arquivos revisados. |
| `code-standards.md`: arquivos ≤ 100 linhas, funções e componentes ≤ 30 | OK | Maior arquivo: `WeatherView.temperature-unit.test.tsx`, com 94 linhas. Maior função: `measureToggleDuration`, com 17 linhas. Componentes entre 5 e 20 linhas de JSX. |
| `code-standards.md`: ≤ 3 parâmetros, cláusulas de guarda, sem linhas em branco em funções | OK | `formatTemperature` tem 2 parâmetros; guarda em `requireBox` e `measureToggleDuration`. |
| `code-standards.md`: números e strings mágicos extraídos | OK | `FAHRENHEIT_SCALE_FACTOR`, `FAHRENHEIT_OFFSET`, `ONE_DECIMAL_FACTOR`, `MAX_TOGGLE_DURATION_MS`, `MIN_TOUCH_TARGET_PX`, `NARROW_VIEWPORT` e `TEMPERATURE_UNIT_NAMES`. |
| `javascript-typescript.md`: `const`, `===`, sem `any`, retornos tipados | OK | Verificado por busca: sem `var`, `==`, `!=` ou `any`. Retornos tipados, inclusive `Promise<T>` nos helpers E2E. |
| `javascript-typescript.md`: sem ternários aninhados; `Record` para mapas | OK | `NEXT_TEMPERATURE_UNIT` e `TEMPERATURE_UNIT_NAMES` usam `Record<TemperatureUnit, …>`. Só há um ternário simples em `formatTemperature`. |
| `javascript-typescript.md`: imutabilidade | OK | O estado é atualizado com atualizador funcional; nenhuma coleção é mutada. |
| `node.md`: dependências com npm e lock files versionados | OK | `msw` e `@testing-library/user-event` (frontend) e `@axe-core/playwright` (e2e) instalados com `npm install --save-dev`; `package-lock.json` de cada app atualizado. |
| `node.md`: sem referências circulares | OK | `WeatherView → useTemperatureUnit → services/temperature → types`; `WeatherResult → TemperatureHighlight → TemperatureUnitToggle → services/temperature`. Sem ciclos. |
| `folder-structure.md`: um tipo por arquivo, hooks, components, views, testes ao lado do código, E2E em `e2e/` | OK | Estrutura respeitada. |
| `folder-structure.md`: pastas do frontend | OK | As funções de conversão ficam em `services/`, pasta prevista para transformação de respostas da API. A pasta `lib/`, que não consta na rule, foi eliminada (P-01). |
| `tests.md`: Vitest, Playwright, FIRST, AAA, cobertura ≥ 80% | OK | Cobertura de 94,44% em statements, 90,52% em branches, 97,14% em funções e 100% em linhas. Sem relógio nem dados aleatórios; msw reiniciado após cada teste. |
| `tests.md`: um conceito por teste | OK | O caso `TI-08/TI-09` tem duas asserções (valor convertido e foco), mas as duas formam o mesmo critério (CA-11). |
| Skill `react`: componentes pequenos, props explícitas, sem `useEffect`/`useMemo` desnecessários | OK | Sem spread de props; o valor convertido é derivado na renderização; estado único no `WeatherView`. |
| Skill `react`: acessibilidade | OK | `button` nativo, nome acessível que contém o rótulo visível, `role="status"` sr-only e `focus-visible`. O desvio de não usar `aria-pressed` está justificado na TechSpec. |
| Skill `react`: estilização Tailwind | OK | Classes utilitárias com estados `hover` e `focus-visible`; alvo mínimo de 44 px (`min-h-11 min-w-11`). |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Conversão somente no frontend, a partir do valor original em °C | SIM | O backend pede `temperature_unit=celsius`; `isWeatherResponse` rejeita respostas que não estejam em `°C`. |
| `services/temperature.ts` com `DEFAULT_TEMPERATURE_UNIT`, `convertCelsiusToFahrenheit`, `formatTemperature` e `getNextTemperatureUnit` | SIM | Assinaturas idênticas às da TechSpec. |
| Arredondamento `Math.round(valor × 10) / 10` e normalização de `-0` | SIM | `roundToOneDecimal` e `normalizeNegativeZero`. |
| `formatTemperature` no padrão `` `${valor} ${unit}` ``, com °C sem arredondar | SIM | Coberto por TU-03 a TU-05. |
| `useTemperatureUnit` com `useState`, atualizador funcional e sem persistência | SIM | `setUnit(getNextTemperatureUnit)`; sem `useEffect` nem storage. |
| Estado da unidade no `WeatherView` | SIM | A escolha sobrevive à desmontagem do cartão durante a nova busca (TI-05 e E2E-01). |
| `TemperatureUnitToggle`: rótulo de ação, sufixo sr-only, `role="status"` e estilo secundário | SIM | Nome acessível "Mostrar em °F (Fahrenheit)"; status "Temperaturas exibidas em …". |
| `TemperatureHighlight` extraído, com `min-w-[7ch]` e botão em `flex-col` com a largura da caixa | SIM | Inclui a correção do BUG-01 do QA. |
| `WeatherResult` com `temperatureUnit` e `onToggleTemperatureUnit`; umidade e vento inalterados | SIM | Contrato `WeatherResultProps` idêntico ao da TechSpec. |
| Botão nativo em vez do `Button` do shadcn | SIM | Em `task-2` não há `components/ui/button.tsx`, então a decisão se mantém naturalmente. |
| Funções de conversão em `services/` | SIM | Decisão revista nesta revisão (P-01): `services/temperature.ts` ao lado de `weather-service.ts`, sem pasta nova. TechSpec e tarefa 1.0 atualizadas. |
| Endpoints/API | NÃO APLICÁVEL | Nenhum endpoint criado ou alterado. |
| Modelos de dados `TemperatureUnit` e `UseTemperatureUnitResult` | SIM | Um tipo por arquivo em `types/`. |
| Testes E2E com `@axe-core/playwright` `^4.14.0` | SIM | Instalada a versão 4.14.0. |

## Tarefas verificadas
| Tarefa | Status | Observações |
|------|--------|-------------|
| 1.0 Alternância °C/°F no cartão de resultado | COMPLETA | Subtarefas 1.1 a 1.8 implementadas em `task-2`. TU-01 a TU-20 e TI-01 a TI-09 presentes e passando; ajuste do E2E-06 do painel presente. CA-01 a CA-14 rastreados nos testes. Nota: a subtarefa 1.1 cita o `template` como pré-requisito; em `task-2`, o painel e a infraestrutura de testes existem, com `msw` e `user-event` adicionados agora. |
| 2.0 Testes E2E e auditoria de acessibilidade | COMPLETA | E2E-01 a E2E-06 presentes e passando; `@axe-core/playwright` instalado com o lock file atualizado. |

## Testes
- Total de testes: 174 (frontend 54, backend 104, E2E 16)
- Passando: 173 (frontend 54/54, backend 104/104, E2E 15/16)
- Falhando: 0; 1 pulado de propósito (`real-performance` smoke, que só roda com `RUN_REAL_SMOKE=1`)
- Cobertura: frontend 94,44% statements, 90,52% branches, 97,14% funções e 100% linhas (meta de 80% atingida)

Comandos executados:

- `frontend/`: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test` e `npm run test:coverage`. Todos passaram.
- `backend/`: `npm run build` e `npm run test`. Passaram.
- `e2e/`: `E2E_BACKEND_PORT=3050 npm test`, depois da correção de P-02.

Ambiente da suíte E2E:

- A porta 3001, usada pela config padrão, estava ocupada por um backend de `task-2` que não foi iniciado por esta revisão, provavelmente o `npm run dev` da pessoa usuária. Ele não foi encerrado.
- Na primeira execução, com uma cópia temporária da config apontando o backend para a porta 3050, o E2E-02 de `weather-panel.spec.ts` falhou porque tinha a URL `127.0.0.1:3001/weather` fixa no código (P-02).
- Depois da correção de P-02, a suíte completa rodou com `E2E_BACKEND_PORT=3050` (mock na 3200 e frontend na 5100): 15 passed e 1 skipped, com o backend da pessoa usuária ainda ativo na 3001.
- Ao final, a config temporária foi removida e as portas 3050, 3200 e 5100 foram liberadas.

## Problemas encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Baixa — CORRIGIDO | `frontend/src/services/temperature.ts` | 1 | P-01: as funções de conversão ficavam em `frontend/src/lib/`, pasta que não consta em `.agents/rules/folder-structure.md`. | Corrigido por decisão da pessoa usuária: `temperature.ts` e `temperature.test.ts` foram movidos para `services/`, que a rule prevê para transformação de respostas da API; os 4 imports foram ajustados e a pasta `lib/` deixou de existir. TechSpec, tarefa 1.0 e QA atualizados. Lint, typecheck, build, testes e E2E revalidados. |
| Baixa — CORRIGIDO | `e2e/weather-panel.spec.ts` | 25 | P-02: a porta do backend estava fixa no teste (`127.0.0.1:3001/weather`), o que impedia rodar a suíte em outra porta quando a 3001 estava ocupada. Problema anterior a esta funcionalidade. | Corrigido: as portas passaram para `e2e/test-ports.ts`, configuráveis por `E2E_MOCK_PORT`, `E2E_BACKEND_PORT` e `E2E_FRONTEND_PORT` (padrões 3200, 3001 e 5100). A `playwright.config.ts` e o E2E-02 usam esse módulo, e o mock recebe `MOCK_METEO_PORT`. Validado com `E2E_BACKEND_PORT=3050 npm test`. |
| Baixa — CORRIGIDO | `tasks/prd-conversao-celsius-fahrenheit/techspec.md` e `task_1.md` | — | P-03: os documentos ainda citam o `template` como local da implementação ("O painel de clima ainda não está implementado no `template`", "Novos (no `template`…)"). Em `task-2` o painel existe e a funcionalidade foi implementada aqui. | Corrigido: as referências apontam para `task-2`, para `frontend/vite.config.ts` (onde está a config do Vitest) e para as dependências `msw` e `user-event` adicionadas. A decisão sobre `lib/` agora aponta para P-01. |

Nenhum problema bloqueador foi encontrado. P-01, P-02 e P-03 foram corrigidos e revalidados.

## Pontos positivos
- A regra de conversão está isolada em funções puras, com constantes nomeadas e testes cobrindo toda a tabela de referência, inclusive o `-0`.
- O valor convertido nunca é guardado em estado: °C sempre mostra o valor original, sem erro acumulado (TI-04).
- O estado fica na view, o que mantém a escolha entre buscas sem Context nem storage.
- Acessibilidade bem resolvida: botão nativo, nome acessível que contém o rótulo visível (WCAG 2.5.3), status anunciado sem mover o foco e alvo de 44 px.
- Os E2E cobrem o que só o navegador comprova: recarga, 360 px, tempo de troca medido dentro da página e auditoria axe restrita ao resultado.
- O backend e o contrato `WeatherResponse` ficaram intactos, como o PRD exige.

## Recomendações
- Validar manualmente com VoiceOver ou NVDA o anúncio do status dentro da seção `aria-live` (risco de regiões live aninhadas já listado na TechSpec).
- Fazer o commit das alterações na branch `task-2`, incluindo `tasks/prd-conversao-celsius-fahrenheit/`.

## Conclusão
A implementação em `task-2` atende à TechSpec e às duas tarefas, segue as rules do projeto e a skill `react`, e tem cobertura acima da meta. Frontend, backend e a suíte E2E passaram em todas as validações. Os três pontos de baixa severidade (P-01, P-02 e P-03) foram corrigidos e revalidados. Veredito: **APROVADO**.
