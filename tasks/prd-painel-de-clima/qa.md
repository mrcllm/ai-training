# Relatório de QA — Painel de clima

As evidências da ferramenta de navegador estão salvas em `tasks/prd-painel-de-clima/evidences/`: capturas em `qa/` e `screenshots/`, resultados brutos em `qa/qa-results.json` e medições de desempenho em `e2e-performance.json` e `real-performance.json`.

## Resumo
- Data: 2026-11-11
- Status: APROVADO
- Total de critérios de aceitação: 13
- Critérios de aceitação atendidos: 13
- Bugs encontrados: 6 (todos corrigidos com teste de regressão)

Ambiente isolado da worktree `task-4`:
- Validação manual com navegador: emulador da Open-Meteo em `127.0.0.1:3201`, backend em `127.0.0.1:3002` e frontend Vite em `127.0.0.1:5101`.
- Suíte Playwright: portas `3003`/`5102`/`3202`. A porta padrão `3001` estava ocupada pelo backend da worktree `task-2`, que não foi tocado.
- Ferramenta de navegador: Playwright 1.65 (Chromium).
- Todos os serviços iniciados foram encerrados com SIGTERM ao final, e as portas foram confirmadas como livres.

## Critérios de aceitação verificados
| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Cidade válida exibe as condições da primeira localidade | TU-01, TU-04, TU-06, TI-01, E2E-01 | PASSOU | `evidences/qa/ca01-ca02-ca03-ca13-success-1280.png` |
| CA-02 | Homônimos sem seleção intermediária; cidade, divisão e país do 1º resultado | TU-04, TU-06, TI-01, E2E-01 | PASSOU | `evidences/qa/ca01-ca02-ca03-ca13-success-1280.png` (“Paris, Île-de-France, França”; o 2º resultado “Texas” não aparece) |
| CA-03 | Temperatura, sensação, condição, umidade e vento em PT-BR e unidades métricas | TU-03, TU-05, TU-11, TI-01, E2E-01 | PASSOU (após BUG-05) | `evidences/qa/ca01-ca02-ca03-ca13-success-1280.png` (`18,4 °C`, `17,2 °C`, `61 %`, `12,3 km/h`) |
| CA-04 | Navegador consulta apenas o backend | TU-08, TI-05, E2E-02 | PASSOU | `evidences/qa/qa-results.json` (requisições: só `127.0.0.1:3002/weather`; nenhuma para `open-meteo.com`) |
| CA-05 | Entrada vazia/espaços/curta: orientação e nenhum resultado | TU-01, TU-02, TU-10, TI-02, TI-06, E2E-03, E2E-03b | PASSOU (após BUG-01) | `evidences/qa/ca05-validation-1280.png` |
| CA-06 | Cidade não encontrada informa e permite nova tentativa | TU-04, TU-08, TU-12, TI-03, TI-06, E2E-04 | PASSOU | `evidences/qa/ca06-not-found-1280.png` |
| CA-07 | Falha externa: mensagem temporária, sem resultado anterior, nova tentativa | TU-05, TU-07, TU-08, TU-09, TI-04, TI-06, E2E-04 | PASSOU | `evidences/qa/ca07-provider-unavailable-1280.png`, `evidences/qa/ca12-error-360.png` |
| CA-08 | Carregamento perceptível e sem envio duplicado | TU-09, TU-10, TU-12, TI-06, E2E-05 | PASSOU | `evidences/qa/ca08-loading-1280.png` (1 request apesar de `requestSubmit` + Enter durante o loading) |
| CA-09 | ≥ 95% das consultas em até 3 s | TU-07, E2E-08, smoke real | PASSOU | `evidences/e2e-performance.json` (emulador: 20/20, p95 292 ms); `evidences/real-performance.json` (Open-Meteo real: 10/10 com sucesso, p95 919 ms, 100% ≤ 3 s) |
| CA-10 | Uso exclusivo do teclado com ordem lógica e foco visível | TU-10, E2E-06, E2E-06b, E2E-06c | PASSOU (após BUG-02 e BUG-03) | `evidences/qa/ca10-input-focus-1280.png`, `evidences/qa/ca10-button-focus-1280.png`, `evidences/qa/ca10-link-focus-1280.png` |
| CA-11 | Estados anunciados à tecnologia assistiva sem depender de cor/ícone | TU-10, TU-11, TU-12, TI-06, E2E-05, E2E-06b | PASSOU (após BUG-04 e BUG-06) | `evidences/qa/qa-results.json` (região `role=status` persistente anuncia “Condições atuais carregadas para Paris, Île-de-France, França.”) |
| CA-12 | 360 px e 1280 px legíveis e sem rolagem horizontal | E2E-07 | PASSOU | `evidences/qa/ca12-success-360.png`, `evidences/qa/ca12-error-360.png`, `evidences/qa/ca12-success-1280.png`, `evidences/qa/ca12-error-1280.png` |
| CA-13 | Atribuição à Open-Meteo com link funcional | TU-11, TI-06, E2E-01, E2E-06 | PASSOU | `evidences/qa/ca10-link-focus-1280.png` (“Dados meteorológicos por Open-Meteo”, `href=https://open-meteo.com/`) |

## Testes E2E executados
| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Cidade ambígua pelo fluxo completo | PASSOU | Assertivas atualizadas para os valores em pt-BR (`18,4 °C`). |
| E2E-02 | Isolamento de rede do navegador | PASSOU | A assertiva deixou de depender da porta fixa 3001. |
| E2E-03 | Impede consulta inválida | PASSOU | |
| E2E-03b | Inválida após sucesso remove o resultado anterior | PASSOU | Regressão do BUG-01. |
| E2E-04 | Recupera de cidade não encontrada e falha externa | PASSOU | |
| E2E-05 | Impede submissão duplicada durante loading | PASSOU | `toBeDisabled` reconhece `aria-disabled`. |
| E2E-06 | Opera por teclado até o link da fonte | PASSOU | |
| E2E-06b | Foco permanece no controle acionado e o sucesso é anunciado | PASSOU | Regressão dos BUG-02 e BUG-04. |
| E2E-06c | Indicador de foco ≥ 3:1 no campo, no botão e no link | PASSOU | Regressão do BUG-03. |
| E2E-07 | Sem overflow em 360/1280 px | PASSOU | |
| E2E-08 | Orçamento fim a fim (emulador) | PASSOU | 20 amostras, p95 292 ms. |
| Visual | Captura de estados idle/sucesso/erro em 360/1280 | PASSOU | `evidences/screenshots/*.png` |
| Smoke real | 10 cidades contra a Open-Meteo real | PASSOU | Execução manual (`npm run test:real-smoke`); p95 919 ms. |

Comando: `cd e2e && E2E_BACKEND_PORT=3003 E2E_FRONTEND_PORT=5102 E2E_MOCK_PORT=3202 npx playwright test`. Resultado: 12 passaram e 1 foi pulado (o smoke real, executado à parte).

## Testes automatizados e cobertura
| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade | TU-01, TU-02 | PASSOU | `backend: npm run test:coverage` | `normalize-city.test.ts` |
| Unidade | TU-03 | PASSOU | idem | 29 códigos WMO e código desconhecido |
| Unidade | TU-04, TU-05 | PASSOU | idem | parsers com fixtures válidas/inválidas e unidades |
| Unidade | TU-06, TU-07 | PASSOU | idem | ordem das chamadas, prazo único, cancelamento, sem retry |
| Unidade | TU-08 | PASSOU | `frontend: npm run test:coverage` | `weather-service.test.ts` |
| Unidade | TU-09 | PASSOU | idem | `useWeatherSearch.test.ts` (inclui `reset`) |
| Unidade | TU-10 | PASSOU | idem | `WeatherSearchForm.test.tsx` (validação, `aria-describedby`, `aria-disabled`, `readonly`) |
| Unidade | TU-11 | PASSOU | idem | `WeatherResult.test.tsx`, `weather-formatters.test.ts` |
| Unidade | TU-12 | PASSOU | idem | `WeatherFeedback.test.tsx` (região de status persistente) |
| Integração | TI-01 a TI-05 | PASSOU | `backend: npm run test:coverage` | Supertest contra `createApp`; inclui CORS da origem padrão do Vite |
| Integração | TI-06 | PASSOU | `frontend: npm run test:coverage` | `WeatherView.integration.test.tsx` com view, hook e service reais |

- Backend: 111 testes passando; build `tsc` ok.
- Frontend: 40 testes passando; `npm run lint`, `npm run typecheck` e `npm run build` ok.
- Cobertura (meta de 80%, com limiar que falha a execução no Vitest):
  - backend: 98,73% statements, 94,32% branches, 100% funções, 100% linhas.
  - frontend: 95,09% statements, 91,75% branches, 96,96% funções, 100% linhas.

## Acessibilidade
- [x] Navegação por teclado (Tab, Enter): ordem campo → botão → link da fonte. O foco permanece no controle acionado durante e após a busca (BUG-02 corrigido).
- [x] Elementos interativos com rótulos descritivos: campo “Cidade” com `<label>`; botão “Consultar clima”/“Consultando…”; link “Open-Meteo (abre em nova aba)”.
- [x] Imagens com texto alternativo: não há `<img>`. Os ícones SVG decorativos usam `aria-hidden="true"` (0 SVGs expostos).
- [x] Contraste de cores: textos entre 4,76:1 (placeholder) e 9,22:1. Indicadores de foco em `#1b6172` com 7,0:1 sobre branco e 6,2:1 sobre o fundo (BUG-03 corrigido; antes eram 1,31:1, 1,57:1 e 1,26:1).
- [x] Formulário com rótulo associado: `label for="city"`; erro ligado por `aria-describedby="city-error"` e `aria-invalid="true"`.
- [x] Mensagens de erro claras e acessíveis: `role="alert"` com texto acionável em PT-BR, sem depender de cor ou ícone.
- [x] Fontes com tamanho apropriado: nenhum texto abaixo de 12 px; corpo com 14–16 px.
- [x] Mudanças assíncronas: região `role="status"` persistente para carregamento e sucesso, e `role="alert"` para validação e erro (BUG-04 corrigido). `aria-busy` fica na seção da consulta durante o carregamento.
- [x] Documento em `lang="pt-BR"`, com título descritivo.

## Bugs encontrados e corrigidos
| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | Após um resultado, uma nova tentativa inválida (só espaços) mostrava a orientação de validação, mas mantinha o resultado anterior na tela (viola CA-05). | Média | Corrigido | `WeatherSearchForm` chama `onInvalid`; `useWeatherSearch` ganhou `reset()`, que volta para `idle` quando não há busca ativa. | `WeatherSearchForm.test.tsx` (“notifica a validação inválida…”), `useWeatherSearch.test.ts` (“volta ao estado inicial…”), `WeatherView.integration.test.tsx` (BUG-01), E2E-03b | `evidences/qa/ca05-validation-1280.png` |
| BUG-02 | O campo e o botão recebiam `disabled` enquanto estavam focados. Após a busca, `document.activeElement` virava `<body>`, e o usuário de teclado ou leitor de tela perdia a posição (CA-10). | Média | Corrigido | Botão com `aria-disabled` e campo com `readOnly` durante o carregamento; `handleSubmit` ignora envios em andamento. | `WeatherSearchForm.test.tsx` (BUG-02, “ignora novos envios…”), E2E-06b | `evidences/qa/qa-results.json` (`focusAfterLoading: button "Consultar clima"`) |
| BUG-03 | Indicadores de foco com contraste abaixo de 3:1: botão com anel `#f4c95d/60` (1,31:1), link com `#f4c95d` (1,57:1) e campo com anel `#1b6172/15` (1,26:1) (CA-10, WCAG 1.4.11). | Média | Corrigido | Anel sólido `ring-2` em `#1b6172` (7,0:1), com `ring-offset-2` no botão e no link. | E2E-06c | `evidences/qa/ca10-input-focus-1280.png`, `evidences/qa/ca10-button-focus-1280.png`, `evidences/qa/ca10-link-focus-1280.png` |
| BUG-04 | O sucesso não era anunciado de forma confiável: a região `role=status` era removida do DOM ao concluir, e o `aria-live` ficava no `<section>` do resultado, inserido já com conteúdo, o que leitores de tela normalmente ignoram ou leem por completo (CA-11). | Média | Corrigido | `WeatherFeedback` recebe o estado, mantém uma região `role=status` persistente (“Consultando…” e “Condições atuais carregadas para …”) e mostra `role=alert` só para erros. `aria-live` foi removido do resultado. | `WeatherFeedback.test.tsx` (BUG-04 ×2), `WeatherResult.test.tsx` (sem `aria-live`), `WeatherView.integration.test.tsx`, E2E-06b | `evidences/qa/qa-results.json` (`liveRegionsOnSuccess`) |
| BUG-05 | Valores numéricos exibidos com ponto decimal (`18.4 °C`, `12.3 km/h`) numa interface pt-BR (CA-03). | Baixa | Corrigido | `services/weather-formatters.ts` com `Intl.NumberFormat('pt-BR')`; `formatLocation` foi extraída e reaproveitada. | `weather-formatters.test.ts`, `WeatherResult.test.tsx`, E2E-01 | `evidences/qa/ca01-ca02-ca03-ca13-success-1280.png` |
| BUG-06 | O link de atribuição abria em nova aba sem avisar, e o texto “Dados por” divergia do previsto na TechSpec (“Dados meteorológicos por Open-Meteo”) (CA-11/CA-13). | Baixa | Corrigido | Texto alinhado à TechSpec e aviso “(abre em nova aba)” para leitores de tela. | `WeatherResult.test.tsx` (BUG-06), E2E-06c | `evidences/qa/ca10-link-focus-1280.png` |

Ajuste de infraestrutura de teste: `e2e/playwright.config.ts` aceita `E2E_BACKEND_PORT`, `E2E_FRONTEND_PORT` e `E2E_MOCK_PORT`, com os padrões anteriores 3001/5100/3200. Isso permite rodar o E2E isolado quando outra worktree ocupa as portas padrão.

## Conclusão
Os 13 critérios de aceitação do PRD foram verificados no navegador e pelas suítes automatizadas, e todos estão atendidos. Os seis defeitos encontrados (quatro de acessibilidade, um de localização e um de estado da interface) foram corrigidos na causa raiz, cada um com teste de regressão unitário, de integração e/ou E2E. Lint, typecheck, builds, testes unitários e de integração (151), E2E (12 mais o smoke real) e cobertura acima de 80% passam. A meta de desempenho foi comprovada com o emulador (p95 292 ms) e com a Open-Meteo real (p95 919 ms, 100% em até 3 s). **Veredito: APROVADO.**
