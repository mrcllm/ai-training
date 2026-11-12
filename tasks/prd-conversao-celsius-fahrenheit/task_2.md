# Tarefa 2.0: Testes E2E e auditoria de acessibilidade da alternância °C/°F

## Visão geral

Esta tarefa verifica, no navegador real, os comportamentos que só o fluxo completo comprova:

- a escolha de unidade vale para a próxima busca;
- recarregar a página volta para °C;
- o botão funciona em tela de 360 px;
- a troca aparece em até 100 ms;
- o resultado em °F não tem violações críticas ou sérias de acessibilidade.

Os testes rodam com o frontend e o backend reais e com o mock local da Open-Meteo, reaproveitando o `e2e/playwright.config.ts` do painel. A tarefa adiciona `@axe-core/playwright` em `e2e/` e cria `e2e/temperature-unit.spec.ts`.

**Depende de:** tarefa 1.0 concluída, com a funcionalidade implementada e o E2E-06 do painel já ajustado.

<skills>
### Conformidade com skills

- **`react`:** não há código React nesta tarefa. Os seletores dos testes devem usar papéis e nomes acessíveis definidos na skill e na TechSpec, como o botão `/^Mostrar em °/`, o `role="status"` e o título `weather-result-title`, sem depender de classes de estilo.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` e todas as rules em `.agents/rules/`: `code-standards.md`, `javascript-typescript.md`, `node.md`, `tests.md` e `folder-structure.md`. Regras relevantes:

- **`tests.md`:**
  - Playwright para E2E, com os testes em `e2e/`, fora de `frontend/` e `backend/`.
  - Poucos testes E2E, só para fluxos completos.
  - Cada teste independente, com o próprio `page.goto` e a própria busca.
  - Sem relógio real nem dados aleatórios. Os valores vêm do mock fixo da Open-Meteo.
  - Um conceito por teste.
- **`node.md`:**
  - Instalar com `npm install --save-dev @axe-core/playwright` dentro de `e2e/`, sem misturar gerenciadores.
  - Versionar `e2e/package-lock.json` junto com o `package.json`.
- **`code-standards.md` e `javascript-typescript.md`:**
  - Sem comentários.
  - Arquivos com no máximo 100 linhas e funções com no máximo 30. Extrair helpers, como `searchCity(page, city)`, se a spec crescer.
  - Constantes nomeadas para o limite de 100 ms, a área mínima de 44 px e a viewport de 360 px.
  - `===` e nenhum `any`.
- **`folder-structure.md`:** os E2E ficam em `e2e/*.spec.ts`.
- **`AGENTS.md`:** ao concluir, executar a suíte E2E completa e confirmar que as validações do frontend continuam verdes.
</rules>

<requirements>
- Verificar no navegador real RF4, RF6, RF9 e RF14: alternar para °F mostra os valores convertidos, e a escolha vale para a busca seguinte.
- Verificar RF13 e RF15: depois de recarregar a página, as temperaturas voltam para °C.
- Verificar RF1 e a acessibilidade do botão em 360 px:
  - sem rolagem horizontal;
  - botão inteiro na viewport;
  - área de pelo menos 44 × 44 px.
- Verificar o objetivo de desempenho do PRD: a troca aparece em até 100 ms, medidos dentro da página.
- Verificar o objetivo de acessibilidade do PRD: o axe, restrito à seção do resultado, não acusa violações com `impact` `critical` ou `serious` (tags `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa`).
- Adicionar `@axe-core/playwright` `^4.14.0` como dependência de desenvolvimento de `e2e/`, com o lock file atualizado.
</requirements>

## Subtarefas

- [x] 2.1 Instalar `@axe-core/playwright` `^4.14.0` em `e2e/` com `npm install --save-dev` e confirmar a atualização de `e2e/package.json` e `e2e/package-lock.json`.
- [x] 2.2 Criar `e2e/temperature-unit.spec.ts` com um helper de busca e os casos E2E-01 (alternância e nova busca) e E2E-02 (recarga volta para °C).
- [x] 2.3 Implementar o E2E-03, com viewport de 360 × 800, verificação de rolagem horizontal, `boundingBox` do botão e visibilidade completa.
- [x] 2.4 Implementar o E2E-04, com a medição dentro da página via `performance.now()` e um `MutationObserver` entre o `click()` e a mudança do texto da temperatura atual.
- [x] 2.5 Implementar o E2E-05: buscar, alternar para °F e rodar o `AxeBuilder` restrito a `[aria-labelledby="weather-result-title"]`, filtrando as violações por `impact`.
- [x] 2.6 Executar a suíte E2E completa (`npm test` em `e2e/`), incluindo os specs do painel, e confirmar que tudo passa. Registrar a saída como evidência para o QA.

## Detalhes de implementação

Consulte em [`techspec.md`](./techspec.md):

- "Testes E2E": a tabela dos casos E2E-01 a E2E-05 e o ambiente.
  - Portas: mock 3200, backend 3001 e frontend 5100.
  - O forecast do mock devolve 18.4 °C e 17.2 °C, que em °F viram 65.1 °F e 63 °F.
- "Riscos conhecidos": medição de 100 ms instável em CI e axe acusando problemas já existentes no painel (mitigado pela análise restrita à seção do resultado).
- "Dependências técnicas": versão e origem do `@axe-core/playwright`.

## Critérios de aceitação relacionados

- CA-01
- CA-08
- CA-09
- CA-11
- CA-12
- CA-13
- CA-14

## Testes da tarefa

### Testes de unidade (se aplicável)

Não aplicável. Os testes de unidade estão na tarefa 1.0.

### Testes de integração (se aplicável)

Não aplicável. Os testes de integração estão na tarefa 1.0.

### Testes E2E (se aplicável)

- [x] E2E-01 — A pessoa alterna para °F e a escolha vale para a próxima busca
- [x] E2E-02 — Recarregar a página volta para Celsius
- [x] E2E-03 — O botão é utilizável em tela de 360 px
- [x] E2E-04 — A troca de unidade aparece em até 100 ms
- [x] E2E-05 — O resultado em °F não tem violações críticas ou sérias de acessibilidade
- [x] E2E-06 — O botão continua alinhado à caixa da temperatura quando o título quebra de linha (acrescentado no QA como regressão do BUG-01; ver `qa.md`)

## Arquivos relevantes

Novos:

- `e2e/temperature-unit.spec.ts`
- `e2e/temperature-unit-helpers.ts`: helpers `searchCity`, `expectTemperatures` e `measureToggleDuration`. Ficaram separados para respeitar os limites de tamanho de arquivo e de função.

Modificados:

- `e2e/package.json` e `e2e/package-lock.json` (`@axe-core/playwright`)

Referência, sem alteração:

- `e2e/playwright.config.ts`: `webServer` com o mock, o backend e o frontend, e `baseURL` `http://127.0.0.1:5100`.
- `e2e/mock-open-meteo.mjs`: forecast fixo de 18.4 °C e 17.2 °C.
- `e2e/weather-panel.spec.ts` e `e2e/weather-panel-accessibility.spec.ts`: suíte do painel, que precisa continuar verde.
- `frontend/src/components/TemperatureUnitToggle.tsx`, `frontend/src/components/TemperatureHighlight.tsx` e `frontend/src/components/WeatherResult.tsx`: seletores acessíveis usados nos testes.
