# Tarefa 2.0: Estruturar a fundação do backend

## Visão geral

Separar a composição do aplicativo Express do bootstrap do processo e introduzir configuração validada, erros públicos, observabilidade, preservação do health check e desligamento gracioso. A entrega mantém o comportamento existente enquanto prepara uma base testável para o endpoint meteorológico.

## Dependências

- Tarefa 1.0 — base de testes e baseline técnico.

<skills>
### Conformidade com skills

Nenhuma skill em `.agents/skills/` é específica para esta tarefa exclusivamente backend.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. A implementação deve seguir o fluxo `configuração -> routes -> services -> data`, usar `async/await`, configuração por ambiente, logging centralizado e shutdown idempotente. `app.ts` não deve abrir porta; `index.ts` deve permanecer restrito ao bootstrap. O código não pode bloquear o event loop, expor dados sensíveis, usar `any` ou criar referências circulares. Arquivos e funções devem respeitar os limites de 100 e 30 linhas. Não há desvios previstos.
</rules>

<requirements>

- Preservar `GET /health` com o corpo atual e sem dependência da Open-Meteo.
- Separar a criação do app Express da abertura do servidor HTTP.
- Ler e validar `PORT`, `FRONTEND_ORIGIN`, URLs da Open-Meteo e timeout por variáveis de ambiente.
- Fornecer padrões HTTPS oficiais e `.env.example` sem credenciais reais.
- Configurar CORS, parsing JSON, request ID e middleware global de erros.
- Gerar ou propagar `X-Request-Id` e incluí-lo nas respostas e nos logs.
- Centralizar logs JSON sem registrar cidade bruta, coordenadas, payload externo ou dados sensíveis.
- Tratar `SIGINT` e `SIGTERM` de forma idempotente e encerrar o servidor dentro de prazo definido.
</requirements>

## Subtarefas

- [x] 2.1 Extrair a configuração e validação das variáveis de ambiente.
- [x] 2.2 Criar o modelo de erro da aplicação e o envelope público estável.
- [x] 2.3 Implementar o logger centralizado e o middleware de request ID.
- [x] 2.4 Extrair `GET /health` para sua própria rota, preservando o contrato atual.
- [x] 2.5 Criar `app.ts` com CORS, parsing, rotas e middleware de erro, sem abrir porta.
- [x] 2.6 Restringir `index.ts` ao bootstrap e conectar o shutdown gracioso.
- [x] 2.7 Cobrir configuração, health check, middleware, logger, erros e shutdown com testes determinísticos.

## Detalhes de implementação

Seguir **Arquitetura do sistema — Visão dos componentes**, **Endpoints da API — GET /health**, **Monitoramento e observabilidade**, **Dependências técnicas** e as decisões sobre health, configuração e erros em **Considerações técnicas** do `techspec.md`.

## Critérios de aceitação relacionados

- CA-04

## Testes da tarefa

### Testes de integração

- [x] TI-05 — Preserva health check e middleware global. Nesta tarefa, cobrir o health check e a infraestrutura global; a aplicação desses middlewares à rota meteorológica será concluída na tarefa 5.0.

### Testes técnicos complementares

- [x] Validar configurações válidas, ausentes e inválidas sem depender do ambiente real.
- [x] Validar geração e propagação de `X-Request-Id`.
- [x] Validar envelopes públicos e ausência de detalhes internos.
- [x] Validar shutdown idempotente sob `SIGINT` e `SIGTERM` com relógio controlado.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/techspec.md`
- `backend/.env.example`
- `backend/src/index.ts`
- `backend/src/app.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/health-route.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/middleware/request-id.ts`
- `backend/src/observability/logger.ts`
- `backend/src/runtime/shutdown.ts`
- `backend/src/types/api-error.ts`
