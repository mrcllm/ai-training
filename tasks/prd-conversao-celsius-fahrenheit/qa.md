# Relatório de QA — Conversão de temperatura entre Celsius e Fahrenheit

As evidências da ferramenta de navegador estão em `tasks/prd-conversao-celsius-fahrenheit/evidences/`.

## Resumo
- Data: 11/11/2026
- Status: APROVADO
- Total de critérios de aceitação: 14
- Critérios de aceitação atendidos: 14
- Bugs encontrados: 1 (BUG-01, severidade baixa, corrigido com teste de regressão)

**Ambiente de QA** (isolado e encerrado ao final):

| Serviço | Endereço | Observação |
| --- | --- | --- |
| Mock da Open-Meteo | `http://127.0.0.1:3211` | `e2e/mock-open-meteo.mjs`. Devolve Paris com 18.4 °C e sensação de 17.2 °C. |
| Backend | `http://127.0.0.1:3011` | `FRONTEND_ORIGIN=http://127.0.0.1:5111`, apontando para o mock |
| Frontend | `http://127.0.0.1:5111` | Vite, com `VITE_API_BASE_URL=http://127.0.0.1:3011` |

- **Navegador:** Chromium 1254 (headless), dirigido pela biblioteca Playwright 1.65.0 por meio dos scripts em `evidences/qa-scripts/`. Não havia MCP de navegador disponível na sessão.
- **Suíte E2E automatizada:** sobe os próprios servidores, com o mock na porta 3200, o backend na 3001 e o frontend na 5100.

## Critérios de aceitação verificados

Os itens `QA-*` são verificações feitas no navegador real e estão registrados em `evidences/qa-navegador-resultados.json`.

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Alternar para °F exibe as temperaturas convertidas | TU-03, TU-12, TU-15, TU-16, TU-20, TI-01, E2E-01, QA-CA01 | PASSOU | `screenshots/sucesso-fahrenheit-1280.png` (65.1 °F / 63 °F). Os exemplos 25 → 77 °F e 27 → 80.6 °F foram confirmados em QA-CA03. |
| CA-02 | Voltar para °C mostra exatamente os valores originais | TU-04, TU-19, TI-04, QA-CA02 | PASSOU | `screenshots/sucesso-celsius-1280.png`. O JSON registra QA-CA02: 18.4 °C e 17.2 °C. |
| CA-03 | Tabela de referência, sem "-0" | TU-01, TU-02, TU-05, QA-CA03 | PASSOU | `screenshots/limite-menos-17-8-exibe-0-fahrenheit-1280.png`. Valores injetados no navegador: 0→32, -17.8→0, 100→212, 37→98.6, -40→-40, 22.5→72.5, -3.2→26.2, 25→77 e 27→80.6. Nenhum "-0" na página. |
| CA-04 | Dez alternâncias restauram exatamente o valor | TU-09, TI-04, QA-CA04 | PASSOU | O JSON registra QA-CA04: 18.4 °C e 17.2 °C após 10 cliques. |
| CA-05 | O rótulo alterna entre "Mostrar em °F" e "Mostrar em °C" | TU-06, TU-08, TU-10, TU-11, QA-CA05 | PASSOU | `screenshots/sucesso-celsius-1280.png` e `screenshots/sucesso-fahrenheit-1280.png` |
| CA-06 | Umidade e vento não mudam | TU-17, QA-CA06 | PASSOU | `screenshots/sucesso-fahrenheit-1280.png` (61 % e 12.3 km/h nas duas unidades) |
| CA-07 | Sem nova requisição; localidade, condição e atribuição inalteradas | TU-18, TI-02, QA-CA07 | PASSOU | O JSON registra QA-CA07: uma requisição `/weather` antes e depois de 3 alternâncias, com a localidade, a condição e o link da fonte iguais. |
| CA-08 | A unidade escolhida vale para a busca seguinte | TI-05, E2E-01, QA-CA08 | PASSOU | `screenshots/nova-busca-mantem-fahrenheit-1280.png` |
| CA-09 | Recarregar a página volta para °C | TU-07, E2E-02, QA-CA09 | PASSOU | `screenshots/apos-recarregar-celsius-1280.png` |
| CA-10 | Sem botão no estado inicial, durante o carregamento e com erro | TI-06, TI-07, QA-CA10 (inicial, carregando, não encontrada, indisponível) | PASSOU | `screenshots/inicial-1280.png`, `screenshots/erro-nao-encontrada-1280.png`, `screenshots/erro-indisponivel-1280.png` e `screenshots/erro-nao-encontrada-360.png` |
| CA-11 | Teclado: Tab alcança o botão, Enter e Espaço acionam, foco visível e mantido | TI-08, TI-09, E2E-05, E2E-06 do painel (ajustado), QA-CA11 | PASSOU | `screenshots/foco-teclado-botao-1280.png` (anel amarelo de 4 px) |
| CA-12 | A tecnologia assistiva anuncia a unidade em uso | TU-13, TU-14, E2E-05, QA-CA12 | PASSOU | `aria-snapshot-resultado-fahrenheit.txt`: `status: Temperaturas exibidas em Fahrenheit` e o botão "Mostrar em °C (Celsius)". Verificado na árvore de acessibilidade, não com leitor de tela real (ver Conclusão). |
| CA-13 | Em 360 px: botão inteiro, sem rolagem horizontal, área de pelo menos 44 × 44 px | E2E-03, E2E-05, E2E-06, QA-CA13 | PASSOU | `screenshots/sucesso-fahrenheit-360.png`, `-768.png` e `-1024.png`. O botão mede 222 × 44 px nos três tamanhos. |
| CA-14 | A troca aparece em até 100 ms, sem carregamento | TI-03, E2E-04, QA-CA14 | PASSOU | O JSON registra QA-CA14: 3,5 a 3,6 ms em 5 medições. |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Alternar para °F e manter a escolha na busca seguinte | PASSOU | `e2e/temperature-unit.spec.ts` |
| E2E-02 | Recarregar a página volta para Celsius | PASSOU | |
| E2E-03 | Botão utilizável em 360 px | PASSOU | |
| E2E-04 | A troca aparece em até 100 ms | PASSOU | Medida dentro da página com `MutationObserver` |
| E2E-05 | Resultado em °F sem violações críticas ou sérias no axe | PASSOU | Axe restrito ao cartão. Um seletor inexistente faz o axe lançar erro, então o teste não passa à toa. |
| E2E-06 | Botão alinhado à caixa da temperatura quando o título quebra de linha | PASSOU | Criado no QA como regressão do BUG-01. Falhava antes da correção, com 89 px de desvio. |
| E2E-01 a E2E-08 do painel | Regressão do painel de clima | PASSOU | O E2E-06 do painel foi ajustado na tarefa 1.0 para a nova ordem de Tab. O smoke com a Open-Meteo real é pulado por definição (`RUN_REAL_SMOKE`). |

A suíte completa terminou com 15 testes passando e 1 pulado (`evidences/e2e-suite.txt`). Os IDs E2E-01 a E2E-05 deste spec coincidem com os do `weather-panel.spec.ts`. Os arquivos são diferentes, e a saída do Playwright mostra o nome do arquivo.

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade | TU-01 a TU-06 (`services/temperature`) | PASSOU | `npm run test` em `frontend/` | O TU-01 roda os 6 valores da tabela. TU-02 e TU-09 foram validados com mutação: falham quando a regra quebra. |
| Unidade | TU-07 a TU-09 (`useTemperatureUnit`) | PASSOU | `npm run test` | |
| Unidade | TU-10 a TU-14 (`TemperatureUnitToggle`) | PASSOU | `npm run test` | |
| Unidade | TU-15 a TU-20 (`WeatherResult`) | PASSOU | `npm run test` | O teste original do cartão continua passando. |
| Integração | TI-01 a TI-09 (`WeatherView` + msw) | PASSOU | `npm run test` | `WeatherView.temperature-unit.test.tsx` |
| Unidade/Integração | Testes preexistentes do painel (14) | PASSOU | `npm run test` | Regressão do painel |
| Unidade/Integração | Backend (104) | PASSOU | `npm run build` e `npm run test` em `backend/` | O backend não foi alterado. |
| Validação | Lint, typecheck e build do frontend | PASSOU | `npm run lint`, `npm run typecheck` e `npm run build` | Lint: 0 erros e 1 aviso preexistente em `components/ui/button.tsx` (shadcn, `react-refresh/only-export-components`). |

- Cobertura do frontend: statements 95,61%, branches 88,42%, funções 97,22% e linhas 100%. A meta das rules é 80%, aplicada pelos limites do `vitest.config.ts`. Os arquivos novos têm 100% (`evidences/frontend-testes-cobertura.txt`).
- Lista dos 48 casos: `evidences/frontend-casos-verbose.txt`.

## Acessibilidade

Telas verificadas: inicial, sucesso em °C, sucesso em °F, carregando, cidade não encontrada e provedor indisponível, em 360, 768, 1024 e 1280 px.

- [x] **Navegação por teclado (Tab, Enter, Esc):**
  - A ordem é campo "Cidade" → "Consultar clima" → "Mostrar em °F" → link "Open-Meteo".
  - Enter e Espaço alternam a unidade, e o foco permanece no botão.
  - Esc não tem efeito, porque não há diálogos nem menus.
- [x] **Elementos interativos com rótulos descritivos:** o nome acessível é "Mostrar em °F (Fahrenheit)" ou "Mostrar em °C (Celsius)" e contém o texto visível (WCAG 2.5.3). A regra `button-name` do axe passa.
- [x] **Imagens com texto alternativo:** não há `<img>` sem `alt`, e todos os SVGs de ícones têm `aria-hidden="true"`.
- [x] **Contraste de cores:** a regra `color-contrast` do axe passa no cartão e no botão em todos os estados. Na varredura da página inteira, houve 1 item "incompleto" fora do escopo: o parágrafo de rodapé do painel lateral (`.border-white/20 > p`), sobreposto por um círculo decorativo, para o qual o axe não consegue determinar o fundo.
- [x] **Formulários com rótulos associados:** o campo "Cidade" tem rótulo associado (painel, inalterado).
- [x] **Mensagens de erro claras e acessíveis:** os erros usam `role="alert"`: "Cidade não encontrada. Revise o nome e tente novamente." e "Não foi possível consultar o clima agora. Tente novamente em instantes."
- [x] **Fontes com tamanho apropriado:** o botão usa 14 px. O menor texto do cartão tem 12 px (rótulo "Temperatura atual", estilo herdado do painel).
- [x] **Anúncio da troca:**
  - Há uma região `role="status"` visualmente oculta, com o texto "Temperaturas exibidas em Fahrenheit/Celsius", dentro do cartão, que já tem `aria-live="polite"`.
  - O axe com WCAG 2.1 AA não encontrou nenhuma violação na página inteira em 5 estados.
  - O console do navegador não teve erros de página. Os únicos erros registrados são o 404 e o 503 provocados de propósito nos cenários de erro.

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | Com nomes longos de localidade (ex.: "Paris, Île-de-France, França"), a partir de 640 px o destaque da temperatura quebra para a linha de baixo, alinhado à esquerda, mas o botão "Mostrar em °C/°F" continuava alinhado à direita, deslocado 88 px da caixa. A causa era a regra de layout da TechSpec, que alinhava por breakpoint (`sm:items-end`) sem considerar a quebra de linha. | Baixa | Corrigido | No `TemperatureHighlight.tsx`, o contêiner passou de `flex flex-col items-start gap-2 sm:items-end` para `flex flex-col gap-2`. O botão ocupa a largura da caixa e fica sempre sob ela, com ou sem quebra. A TechSpec foi atualizada após decisão explícita tomada durante o QA. Efeito colateral: a largura do botão deixou de variar cerca de 1 px entre os rótulos. | E2E-06 em `e2e/temperature-unit.spec.ts`. Falhou antes da correção (desvio de 89,2 px) e passa depois. | `screenshots/bug-01-antes-botao-desalinhado-1280.png` e `screenshots/bug-01-depois-botao-alinhado-1280.png` |

## Conclusão

**APROVADO.** Os 14 critérios de aceitação do PRD foram verificados no navegador real e pelas suítes automatizadas, e todos passaram:

- frontend: 48 testes, cobertura de 95,6%;
- backend: 104 testes;
- E2E: 15 testes passando e 1 pulado por definição.

O único defeito encontrado, o BUG-01, foi corrigido na causa e está coberto pelo E2E-06. A correção mudou uma regra de layout da TechSpec, com aprovação explícita antes da mudança.

Observações e limitações:

1. **Leitor de tela real não executado.** O anúncio (CA-12) foi verificado pela árvore de acessibilidade do Chromium e pelo axe, não com VoiceOver ou NVDA. Recomenda-se uma verificação manual rápida com VoiceOver. O cartão já é uma região `aria-live="polite"` do painel, então o leitor pode anunciar também os novos valores além do status, o que pode soar verboso. Esse risco já estava registrado na TechSpec e não viola o PRD.
2. **Provedor simulado.** O QA usou o mock da Open-Meteo para ter valores determinísticos. Os valores-limite do CA-03 foram injetados interceptando a resposta do backend no navegador. A conversão não depende do provedor, e o backend não foi alterado.
3. **Item fora do escopo:** o axe marcou como "incompleto" o contraste de um parágrafo do painel lateral, sobreposto por um elemento decorativo. Não envolve esta funcionalidade, mas vale avaliar numa revisão do painel.
