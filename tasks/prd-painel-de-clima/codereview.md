# Relatório de revisão de código — Painel de clima

## Resumo
- Data: 2026-11-11
- Branch: task-4 (worktree de `example_3`)
- Status: APROVADO COM RESSALVAS

Contexto da revisão: a branch `task-4` não continha `frontend/package.json`, `frontend/src/`, as configurações do Vite/Tailwind/TypeScript nem a pasta `tasks/`. O código do frontend foi copiado dos arquivos não versionados de `example_3/frontend/`, e o PRD, a TechSpec e as tarefas, de `example_1/tasks/prd-painel-de-clima/`. A revisão cobre esse conjunto montado.

## Conformidade com regras
| Regra | Status | Observações |
|------|--------|-------------|
| code-standards — sem comentários | OK | O código TS/TSX não tem comentários. O bloco `<!-- THESIS ... -->` em `frontend/index.html` é um artefato de design (skill impeccable), sem efeito em runtime. |
| code-standards — arquivos ≤ 100 linhas | OK | O maior arquivo de produção é `get-current-weather.ts`, com 84 linhas após a refatoração. |
| code-standards — funções ≤ 30 linhas | OK (corrigido) | `createWeatherRoute` (37 linhas) e `getCurrentWeather` (35) excediam o limite e foram divididas em `logCompletion`, `abortOnClientDisconnect`, `createDeadline`, `runStage`, `firstLocation` e `toWeatherResponse`. |
| code-standards — no máximo 3 parâmetros | OK (corrigido) | `logStep` (4 parâmetros) foi removida, e o construtor de `AppError` (4 parâmetros) passou a receber o objeto `AppErrorInput`. |
| code-standards — sem linhas em branco dentro de funções | OK (corrigido) | Linhas em branco removidas de `useWeatherSearch`. |
| code-standards — números e strings mágicos | OK (corrigido) | A mensagem pública de 503 estava duplicada em 5 arquivos e agora fica centralizada em `errors/provider-unavailable.ts`. Os status HTTP viraram constantes nomeadas. |
| code-standards — dados sensíveis fora do código | OK | Nenhum segredo. `.env.example` presente no backend e no frontend. |
| javascript-typescript — ternários não aninhados | OK (corrigido) | `error-handler.ts` tinha três ternários aninhados, substituídos por `toErrorResponse` com cláusulas de guarda. |
| javascript-typescript — `const`, `===`, sem `any`, `unknown` nas fronteiras | OK | Parsers e o service do frontend refinam `unknown` com type guards. |
| javascript-typescript — tipos de retorno | OK (corrigido) | `useWeatherSearch` agora declara `WeatherSearchController`. |
| node — async/await, event loop, dotenv, validação na inicialização | OK | `loadEnvironment` valida porta, URLs, origem e timeouts antes do `listen`. |
| node — graceful shutdown idempotente | OK | `createShutdownHandler` trata SIGINT/SIGTERM com promessa única e prazo. |
| node — logging centralizado | OK | `console.*` só aparece em `observability/logger.ts`. Chaves sensíveis são filtradas. |
| node — lock files e dependências sem ciclos | OK | Lock files separados. Após a mudança, `provider-unavailable` fica em `errors/`, usado por `data/` e `services/` sem ciclo. |
| folder-structure — backend `routes → services → data`, frontend `view → hooks → services` | OK | Nenhum componente acessa o backend diretamente. |
| folder-structure — cada tipo em arquivo próprio em `types/` | Ressalva | Tipos de dependência locais (`AppDependencies`, `WeatherRouteDependencies`, `ShutdownDependencies`, `Environment`, `LogContext`) continuam dentro dos módulos. Os tipos novos e compartilhados foram criados em `types/`. |
| tests — cobertura ≥ 80% com limiar que falha a execução | OK | Os limiares estão configurados no Vitest dos dois apps. |
| tests — FIRST, AAA, um conceito por teste | OK | Rede substituída por stubs. Relógio controlado com fake timers. |
| skill react — componentes ≤ 30 linhas, props explícitas, hook para backend, aria | OK | Ressalvas de acessibilidade do comportamento em runtime ficam para o QA. |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| `GET /weather` idempotente com `Cache-Control: no-store` | SIM | |
| Geocoding com `count=1`, `language=pt`, `format=json` | SIM | |
| Forecast com 5 variáveis `current` e unidades métricas explícitas | SIM | |
| Timeout único de 2,5 s compartilhado entre as duas chamadas, sem retry | SIM | `createDeadline` também propaga o cancelamento do cliente. |
| Parsers de `unknown`, opcionais normalizados para `null`, validação de unidades e WMO | SIM | |
| Envelope `ApiError` com `INVALID_CITY`/`CITY_NOT_FOUND`/`WEATHER_PROVIDER_UNAVAILABLE`/`INTERNAL_ERROR` | SIM | Há também `INVALID_REQUEST` para JSON malformado, uma extensão compatível. |
| Mensagem pública de 503 conforme a TechSpec | SIM (corrigido) | Era “O serviço de clima está temporariamente indisponível.”. Agora é “Não foi possível consultar o clima agora. Tente novamente em instantes.”. |
| `X-Request-Id` em todas as respostas e logs | SIM | |
| Níveis de log: `warn` para falha esperada do provedor e `error` para falha interna | SIM (corrigido) | O 503 era registrado como `error`. Agora só `INTERNAL_ERROR` usa `error`. |
| Evento `open_meteo_payload_invalid` com nível `error` | NÃO | Payload inválido é registrado como `open_meteo_request_failed` (`warn`). Desvio de observabilidade, sem impacto funcional. |
| `FRONTEND_ORIGIN` / `VITE_API_BASE_URL` configuráveis | SIM (corrigido) | O padrão de `FRONTEND_ORIGIN` era `http://localhost:3000`, o que bloqueava pelo CORS o frontend Vite em `:5173`. |
| Frontend: estado discriminado `idle/loading/success/error` sem resultado obsoleto | SIM | |
| Frontend: `frontend/vitest.config.ts` | SIM (variação) | A configuração de teste está em `vite.config.ts`, o que é equivalente. |
| Testes do frontend com `user-event` e MSW | PARCIAL | Os testes usam `fireEvent` e stubs de `fetch`. O TI-06 passou a integrar view, hook e service reais em `WeatherView.integration.test.tsx`. |
| Playwright com emulador local da Open-Meteo e medição de p95 | SIM | |

## Tarefas verificadas
| Tarefa | Status | Observações |
|------|--------|-------------|
| 1.0 Base de testes e baseline técnico | COMPLETA | O build do backend passa. Vitest e cobertura estão configurados nos dois apps. |
| 2.0 Fundação do backend | COMPLETA | `app.ts`, config, logger, erros, health, shutdown. |
| 3.0 Contratos, normalização e parsers | COMPLETA | TU-01 a TU-05 presentes. |
| 4.0 Integração Open-Meteo e orquestração | COMPLETA | TU-06 e TU-07 presentes. |
| 5.0 Endpoint `GET /weather` | COMPLETA | TI-01 a TI-05 presentes. Foi adicionado o teste de CORS da origem padrão do Vite. |
| 6.0 Frontend completo | COMPLETA com ressalva | O código não estava versionado na branch (ver Problemas). O TI-06 foi completado com integração real entre view, hook e service. |
| 7.0 E2E e consolidação | COMPLETA | E2E-01 a E2E-08 presentes. O smoke real é manual (`npm run test:real-smoke`). |

## Testes
- Total de testes: 145 (backend 111, frontend 24, E2E 10)
- Passando: 144
- Falhando: 0
- Pulados: 1 (smoke contra a Open-Meteo real, executado manualmente por design)
- Cobertura: backend 98,73% stmts / 94,32% branches / 100% funções / 100% linhas; frontend 93,25% / 90,1% / 96,15% / 100%. A meta é 80% e foi atendida.

Comandos executados: frontend `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:coverage`; backend `npm run build`, `npm run test:coverage`; e2e `npx playwright test` (portas 3001/5100/3200, liberadas ao final).

## Problemas encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Alta | `backend/src/config/environment.ts`, `backend/.env.example` | 12 / 2 | `FRONTEND_ORIGIN` padrão era `http://localhost:3000`. No fluxo documentado (`npm run dev` nos dois apps, Vite em `:5173`), toda busca era bloqueada pelo CORS. O E2E não detectava o problema porque define a origem explicitamente. | **Corrigido**: o padrão passou a ser `http://localhost:5173`. Teste de regressão de CORS para `localhost:5173` e `127.0.0.1:5173` e teste de origem não autorizada adicionados. |
| Alta | repositório (`example_3` / branch `task-4`) | — | `frontend/package.json`, `package-lock.json`, `src/`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js` e `postcss.config.js` nunca foram commitados. A branch sozinha não compila o frontend. Por outro lado, `frontend/coverage/` foi versionado. | **Pendente (decisão do usuário)**: commitar os arquivos do frontend e a pasta `tasks/`, e remover `coverage/` do versionamento (adicionar ao `.gitignore`). |
| Média | `backend/src/middleware/error-handler.ts` | 18–20 | Ternários aninhados, o que viola `javascript-typescript.md`. | **Corrigido** com `toErrorResponse` e cláusulas de guarda. |
| Média | `backend/src/routes/weather-route.ts`, `backend/src/services/get-current-weather.ts` | — | Funções com mais de 30 linhas e `logStep` com 4 parâmetros. | **Corrigido** com a extração de funções e objetos de parâmetro. |
| Média | `frontend/src/views/WeatherView.test.tsx` | 7 | O TI-06 mockava o módulo do service, então não integrava view, hook e service como a TechSpec exige. | **Corrigido**: novo `WeatherView.integration.test.tsx` com o service real e `fetch` substituído. |
| Baixa | `backend/src/errors/app-error.ts` | 4 | Construtor com 4 parâmetros. | **Corrigido** com `AppErrorInput`. |
| Baixa | vários parsers/serviços | — | Mensagem pública de 503 duplicada e divergente da TechSpec. | **Corrigido** com `errors/provider-unavailable.ts`. |
| Baixa | `backend/src/middleware/error-handler.ts` | 21 | 503 de provedor registrado como `error`. | **Corrigido**: agora é `warn`, com teste. |
| Baixa | `frontend/src/hooks/useWeatherSearch.ts` | 11 | Linhas em branco dentro da função e retorno sem tipo. | **Corrigido**. |
| Baixa | `backend/src/services/get-current-weather.ts` | — | Falta o evento `open_meteo_payload_invalid` (nível `error`) previsto na TechSpec. | Ressalva: distinguir payload inválido de falha HTTP em `providerUnavailable` (por exemplo, com um campo `reason`). |
| Baixa | `AGENTS.md` | — | Documentação desatualizada: diz que o backend usa a porta 3000 por padrão (o código usa 3001), que o frontend consulta `/health` periodicamente, que não há testes no frontend e que o build do backend falha. | Ressalva: atualizar o `AGENTS.md`. Não foi alterado nesta revisão por ser instrução do projeto. |

## Pontos positivos
- O backend funciona como camada anticorrupção: a UI não conhece campos, erros nem unidades da Open-Meteo.
- O prazo único compartilhado entre as duas chamadas, com cancelamento do cliente propagado até o `fetch`, está bem testado com fake timers.
- O estado discriminado no frontend impede, por tipo, exibir o resultado antigo junto com um erro novo.
- O logger filtra chaves sensíveis (`city`, `coordinates`, `payload`...) e não registra a cidade pesquisada.
- Os testes são abrangentes, com todos os 29 códigos WMO e fixtures válidas e inválidas, e há E2E com emulador local e medição de p95.

## Recomendações
- Versionar o frontend e a pasta `tasks/` na branch e tirar `frontend/coverage/` e `backend/coverage/` do git.
- Atualizar o `AGENTS.md` com as portas reais (backend 3001, frontend 5173), os comandos de teste do frontend e o E2E (`cd e2e && npx playwright test`).
- Implementar o evento `open_meteo_payload_invalid`.
- Migrar os testes de componente de `fireEvent` para `@testing-library/user-event`, como a TechSpec prevê.
- Adicionar `"type": "module"` ou renomear `backend/vitest.config.ts` para `.mts`, eliminando o aviso de config CJS do Vite.

## Conclusão
A implementação atende à arquitetura, aos contratos e aos casos de teste da TechSpec. Todos os testes e validações passam, com cobertura acima de 80% nos dois aplicativos. A revisão encontrou e corrigiu um defeito de configuração de alta severidade (CORS padrão incompatível com o servidor Vite) e as violações de regras de código (ternários aninhados, funções longas, excesso de parâmetros, duplicação). Ficam como ressalvas, sem bloquear o código, a falta de versionamento dos arquivos do frontend na branch, a documentação desatualizada no `AGENTS.md` e um evento de observabilidade ausente. **Veredito: APROVADO COM RESSALVAS.**
