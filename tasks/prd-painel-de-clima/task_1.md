# Tarefa 1.0: Configurar a base de testes e corrigir o baseline técnico

## Visão geral

Estabelecer uma linha de base verificável para frontend e backend antes da implementação funcional. A entrega configura os runners, a cobertura mínima e os scripts de teste, preserva os lock files independentes e corrige o erro TypeScript preexistente do backend sem alterar o contrato de `/health`.

## Dependências

Nenhuma. Esta é a tarefa inicial e fornece a infraestrutura de validação para todas as demais.

<skills>
### Conformidade com skills

Nenhuma skill em `.agents/skills/` é específica para esta tarefa de infraestrutura. As skills `react` e `impeccable` não se aplicam enquanto nenhum componente, hook ou interface for alterado.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. Esta tarefa deve preservar a separação entre os aplicativos, usar npm e seus lock files, configurar Vitest e cobertura V8 mínima de 80% para linhas, branches, funções e statements, manter testes rápidos e determinísticos e executar os comandos dentro de `frontend/` e `backend/`. Alterações TypeScript devem respeitar a proibição de `any`, os limites de arquivo e função e a validação exigida pelo projeto. Não há desvios previstos.
</rules>

<requirements>

- Configurar Vitest separadamente no frontend e no backend.
- Configurar cobertura V8 global mínima de 80% para linhas, branches, funções e statements.
- Adicionar scripts reprodutíveis para testes e cobertura nos dois aplicativos.
- Instalar dependências com npm e atualizar cada `package-lock.json` junto ao respectivo `package.json`.
- Explicitar uma versão de Node.js compatível com `fetch`, `AbortController` e `crypto.randomUUID`.
- Corrigir o build TypeScript preexistente do backend sem mudar o comportamento público de `GET /health`.
- Disponibilizar setup e factories compartilhadas somente quando reduzirem duplicação real nos testes posteriores.
</requirements>

## Subtarefas

- [x] 1.1 Registrar a versão suportada do Node.js e validar a compatibilidade das dependências atuais.
- [x] 1.2 Instalar e configurar Vitest e cobertura V8 no backend, com scripts de teste e cobertura.
- [x] 1.3 Instalar e configurar Vitest, jsdom e o setup inicial no frontend, com scripts de teste e cobertura.
- [x] 1.4 Configurar os limiares globais de cobertura de 80% nos dois aplicativos.
- [x] 1.5 Avaliar factories/fixtures; adiar fixtures meteorológicas até haver contratos ou duplicação real nos testes.
- [x] 1.6 Corrigir o erro de `noUnusedParameters` existente no backend sem alterar o contrato de `/health`.
- [x] 1.7 Executar lint, typecheck, builds e runners de teste para registrar o baseline verde.

## Detalhes de implementação

Seguir as seções **Abordagem de testes**, **Sequenciamento do desenvolvimento — Ordem de construção**, **Dependências técnicas** e **Riscos conhecidos — Baseline quebrada no backend** do `techspec.md`. Esta tarefa fornece infraestrutura; não deve antecipar o domínio meteorológico nem criar testes artificiais apenas para elevar cobertura.

## Critérios de aceitação relacionados

Esta tarefa não implementa diretamente um critério de aceitação do PRD; ela é dependência técnica para a cobertura automatizada de CA-01 a CA-13.

## Testes da tarefa

Não há caso funcional numerado na TechSpec para a configuração dos runners. A tarefa deve validar a própria infraestrutura com os seguintes checks:

### Validações técnicas

- [x] Executar a suíte Vitest vazia ou inicial do frontend sem erro de configuração.
- [x] Executar a suíte Vitest vazia ou inicial do backend sem erro de configuração.
- [x] Configurar os comandos de cobertura com quatro limiares globais de 80%.
- [x] Executar `npm run lint`, `npm run typecheck` e `npm run build` no frontend.
- [x] Executar `npm run build` no backend e confirmar a correção do baseline TypeScript.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/techspec.md`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vitest.config.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/test/weather-fixtures.ts`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/vitest.config.ts`
- `backend/src/index.ts`
