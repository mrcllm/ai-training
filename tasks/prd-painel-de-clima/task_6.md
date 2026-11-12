# Tarefa 6.0: Implementar o frontend completo do painel de clima

## Visão geral

Substituir a tela de status pelo painel meteorológico completo, incluindo contratos, acesso ao backend, estado assíncrono, formulário, feedback, resultado e atribuição. A entrega deve ser acessível, responsiva desde 360 px e incapaz de apresentar dados obsoletos após uma nova busca ou falha.

## Dependências

- Tarefa 1.0 — infraestrutura de testes do frontend.
- Tarefa 5.0 — contrato HTTP estável de `GET /weather`.

<skills>
### Conformidade com skills

- `react` — obrigatória para tipos, service, hook, componentes, estado, efeitos, acessibilidade, Tailwind e testes do frontend. Antes da implementação, carregar integralmente a skill e somente as referências necessárias ao trabalho.
- `impeccable` — aplicável à construção da nova interface em modo **Operate**. Antes de editar a UI, seguir seu setup, carregar o playbook de nova superfície e o `craft-floor`, preservando os requisitos e a identidade visual existente quando aplicável.

`caveman` não se aplica porque não foi solicitado um modo de comunicação comprimido.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. O frontend deve seguir `view -> components/hooks -> services -> backend`; componentes não podem acessar HTTP diretamente. Componentes React devem ter responsabilidade única e até 30 linhas, props explícitas, estado discriminado e efeitos apenas para sincronização externa. A interface deve usar HTML semântico, nomes acessíveis, live regions adequadas, foco visível e Tailwind. Todos os comportamentos devem ter testes automatizados e o frontend deve concluir lint, typecheck, build, testes e cobertura. Não há desvios previstos.
</rules>

<requirements>

- RF1–RF4: permitir a busca, validar a entrada e exibir explicitamente a localidade resolvida.
- RF7: chamar exclusivamente o backend configurado em `VITE_API_BASE_URL`.
- RF9–RF12: apresentar temperatura, sensação, condição, umidade e vento em português do Brasil e unidades métricas.
- RF13: apresentar loading e bloquear submissões duplicadas.
- RF14–RF16: diferenciar validação, cidade não encontrada e indisponibilidade, permitir nova tentativa e remover resultado anterior.
- RF17: exibir atribuição visível e link funcional para a Open-Meteo junto ao resultado.
- Modelar `idle`, `loading`, `success` e `error` como variantes mutuamente exclusivas.
- Cancelar requisições obsoletas e ignorar respostas fora de ordem.
- Manter campo e ação operáveis por teclado, com rótulo persistente, associação de erro e anúncios adequados.
- Garantir legibilidade e operação sem overflow horizontal em 360 px e 1280 px.
- Definir documento como `pt-BR` e atualizar título e metadados da página.
- Remover o polling de `/health` da UI sem remover o endpoint do backend.
</requirements>

## Subtarefas

- [x] 6.1 Carregar as skills aplicáveis e estabelecer a direção da nova superfície `Operate` antes das edições visuais.
- [x] 6.2 Criar os tipos do contrato, erros e estado discriminado do frontend.
- [x] 6.3 Implementar `weather-service` com base configurável, validação mínima do envelope e erros de UI.
- [x] 6.4 Implementar `useWeatherSearch` com transições, cancelamento, bloqueio e proteção contra respostas obsoletas.
- [x] 6.5 Implementar formulário e feedback acessíveis para validação, loading e erros.
- [x] 6.6 Implementar resultado, localidade, unidades e atribuição sem depender apenas de cor ou ícones.
- [x] 6.7 Compor `WeatherView`, atualizar `App.tsx`, metadados e estilos responsivos.
- [x] 6.8 Implementar TU-08 a TU-12 e TI-06 com Testing Library, `user-event` e MSW na fronteira do backend.
- [x] 6.9 Executar lint, typecheck, build, testes e cobertura do frontend.

## Detalhes de implementação

Seguir **Arquitetura do sistema — componentes do frontend**, **Principais interfaces**, **WeatherSearchState**, **Abordagem de testes**, o risco de **Acessibilidade de atualizações assíncronas** e as decisões **Estado discriminado no frontend**, **Sem ícone meteorológico obrigatório** e **Health fora da UI** do `techspec.md`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-10
- CA-11
- CA-12
- CA-13

## Testes da tarefa

### Testes de unidade

- [x] TU-08 — Mapeia respostas do backend no weather service.
- [x] TU-09 — Controla transições e cancelamento no hook.
- [x] TU-10 — Valida e submete o formulário acessível.
- [x] TU-11 — Renderiza resultado, unidades e atribuição.
- [x] TU-12 — Renderiza feedback assíncrono.

### Testes de integração

- [x] TI-06 — Integra view, hook e service do frontend.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/prd.md`
- `tasks/prd-painel-de-clima/techspec.md`
- `.agents/skills/react/SKILL.md`
- `.agents/skills/impeccable/SKILL.md`
- `frontend/.env.example`
- `frontend/index.html`
- `frontend/src/App.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/`
- `frontend/src/index.css`
- `frontend/src/test/setup.ts`
- `frontend/src/test/weather-fixtures.ts`
