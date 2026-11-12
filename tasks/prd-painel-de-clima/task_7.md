# Tarefa 7.0: Implementar os testes E2E e consolidar a entrega

## Visão geral

Validar o painel completo pela perspectiva do usuário com um ambiente determinístico de ponta a ponta e consolidar todos os gates técnicos da entrega. A tarefa configura Playwright e um provedor local controlado, cobre os oito fluxos E2E da TechSpec, mede a meta de desempenho e registra um smoke externo não bloqueante antes da entrega.

## Dependências

- Tarefas 1.0 a 6.0 concluídas, com backend e frontend integrados e suas suítes locais disponíveis.

<skills>
### Conformidade com skills

- `react` — aplicável se a análise ou correção de uma falha E2E exigir alteração ou revisão de componentes, hooks ou interface React.
- `impeccable` — aplicável se a estabilização exigir auditoria ou correção visual, responsiva ou de acessibilidade na interface.

As skills devem ser carregadas antes de qualquer ajuste no frontend. A implementação dos testes em `e2e/` por si só não exige essas skills.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. Os testes E2E devem ficar em `e2e/`, usar Playwright, permanecer em quantidade reduzida e não substituir testes unitários ou de integração. O ambiente bloqueante deve ser determinístico, independente e repetível; nenhuma suíte de CI pode depender da API real. O smoke externo deve ser explicitamente não bloqueante. Lock file e dependências do E2E devem permanecer isolados. Correções eventualmente necessárias devem seguir as rules e skills da camada afetada. Não há desvios previstos.
</rules>

<requirements>

- Configurar Playwright em um aplicativo E2E independente com npm e lock file próprio.
- Inicializar frontend, backend e um servidor local que emule os dois endpoints da Open-Meteo.
- Cobrir sucesso ambíguo, isolamento de rede, entrada inválida, recuperação de erros, duplicidade, teclado e responsividade.
- Medir do envio do formulário à apresentação do resultado e comprovar pelo menos 95% das amostras em até 3 segundos no cenário controlado.
- Inspecionar requests do navegador e garantir ausência dos domínios Open-Meteo.
- Validar 360 px e 1280 px sem overflow horizontal e com controles operáveis.
- Executar lint, typecheck, builds, testes e cobertura de frontend e backend, além do E2E completo.
- Executar smoke com lista fixa de cidades contra a API real, registrando data, ambiente, amostra, p95 e taxa em até 3 segundos.
- Manter o smoke real fora dos gates bloqueantes por depender de disponibilidade e latência externas.
- Não registrar segredos, cidade bruta em logs operacionais ou payloads externos completos nas evidências.
</requirements>

## Subtarefas

- [x] 7.1 Criar o aplicativo `e2e/`, configurar Playwright e preservar seu lock file independente.
- [x] 7.2 Implementar o servidor local que emula geocodificação, previsão, falhas e latência controlada.
- [x] 7.3 Configurar a inicialização coordenada de frontend, backend e provedor controlado.
- [x] 7.4 Implementar E2E-01 a E2E-05 para sucesso, rede, validação, recuperação e loading.
- [x] 7.5 Implementar E2E-06 e E2E-07 para teclado, foco, acessibilidade e responsividade.
- [x] 7.6 Implementar E2E-08 com amostra controlada e cálculo da proporção em até 3 segundos.
- [x] 7.7 Executar todas as validações bloqueantes e corrigir apenas falhas dentro do escopo do painel.
- [x] 7.8 Executar o smoke externo não bloqueante e registrar amostra, ambiente, p95 e taxa de sucesso.
- [x] 7.9 Consolidar as evidências de cobertura, E2E e desempenho sem incluir dados sensíveis.

## Detalhes de implementação

Seguir **Abordagem de testes — Testes E2E**, **Sequenciamento do desenvolvimento**, **Monitoramento e observabilidade**, **Riscos conhecidos — Meta de 3 segundos** e os gates listados em **Conformidade com o AGENTS.md e as rules** do `techspec.md`.

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
- CA-13

## Testes da tarefa

### Testes E2E

- [x] E2E-01 — Consulta cidade ambígua pelo fluxo completo.
- [x] E2E-02 — Confirma isolamento de rede do navegador.
- [x] E2E-03 — Impede consulta inválida.
- [x] E2E-04 — Recupera de cidade não encontrada e falha externa.
- [x] E2E-05 — Impede submissão duplicada durante loading.
- [x] E2E-06 — Opera integralmente por teclado.
- [x] E2E-07 — Mantém layout em mobile e desktop.
- [x] E2E-08 — Mede o orçamento fim a fim.

### Validações finais

- [x] Frontend: lint, typecheck, build, testes e cobertura mínima de 80%.
- [x] Backend: build, testes e cobertura mínima de 80%.
- [x] E2E: todos os testes determinísticos aprovados.
- [x] Smoke externo: evidência registrada sem bloquear CI.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/prd.md`
- `tasks/prd-painel-de-clima/techspec.md`
- `e2e/package.json`
- `e2e/package-lock.json`
- `e2e/playwright.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/weather-panel-accessibility.spec.ts`
- `e2e/real-performance.spec.ts`
- `tasks/prd-painel-de-clima/evidences/`
