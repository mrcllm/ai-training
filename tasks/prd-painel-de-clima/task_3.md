# Tarefa 3.0: Implementar contratos, normalização e parsers do domínio

## Visão geral

Definir os contratos internos e públicos do clima, normalizar a entrada de cidade, traduzir os códigos WMO e refinar as respostas desconhecidas da Open-Meteo. A entrega cria funções puras e testadas que sustentam o adaptador, o serviço e a rota das tarefas seguintes.

## Dependências

- Tarefa 1.0 — runner, cobertura e fixtures de teste.
- Tarefa 2.0 — tipos de erro e configuração base do backend.

<skills>
### Conformidade com skills

Nenhuma skill em `.agents/skills/` é específica para esta tarefa de domínio backend.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`. Cada tipo deve ficar em arquivo próprio, as fronteiras externas devem começar em `unknown` e ser refinadas sem `any`, e as funções devem ser puras, pequenas e imutáveis. Os testes unitários devem seguir FIRST, AAA ou Given/When/Then, controlar todas as entradas e validar um comportamento por caso. Não há desvios previstos.
</rules>

<requirements>

- RF2: rejeitar cidade ausente, branca, com menos de 2 ou mais de 100 caracteres úteis.
- RF3: representar somente o primeiro resultado da geocodificação.
- RF4: normalizar cidade, divisão administrativa e país, usando `null` quando opcionais estiverem ausentes.
- RF8: definir um contrato público apenas com localização, condições, unidades e fonte necessárias à UI.
- RF9–RF12: representar temperatura, sensação térmica, condição, umidade e vento com unidades métricas explícitas.
- Normalizar a cidade com NFC, trim e compactação dos espaços internos, preservando Unicode e diacríticos.
- Traduzir explicitamente todos os códigos WMO documentados na TechSpec e rejeitar códigos desconhecidos.
- Rejeitar campos ausentes, números não finitos, umidade fora de `0..100` e unidades inesperadas.
- Diferenciar lista de geocodificação válida e vazia de payload externo inválido.
</requirements>

## Subtarefas

- [x] 3.1 Criar os tipos de domínio, provedor, resposta HTTP, unidades, atribuição e erros.
- [x] 3.2 Implementar a normalização e a validação da entrada de cidade.
- [x] 3.3 Implementar o mapa completo de códigos WMO para português do Brasil.
- [x] 3.4 Implementar o parser da resposta de geocodificação a partir de `unknown`.
- [x] 3.5 Implementar o parser de condições atuais e unidades a partir de `unknown`.
- [x] 3.6 Criar fixtures válidas e inválidas representativas sem acessar rede real.
- [x] 3.7 Implementar os testes unitários TU-01 a TU-05.

## Detalhes de implementação

Seguir **Design de implementação — Modelos de dados**, **Mapeamento Open-Meteo -> contrato**, **Mapeamento WMO -> descrição em português do Brasil**, **Parâmetros fixos na origem** e as regras de falha descritas em **Pontos de integração** do `techspec.md`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — Normaliza uma cidade Unicode e espaços excedentes.
- [x] TU-02 — Rejeita cidade ausente, branca, curta ou excessiva.
- [x] TU-03 — Traduz todos os códigos WMO suportados.
- [x] TU-04 — Interpreta o primeiro resultado de geocodificação.
- [x] TU-05 — Interpreta condições e unidades válidas.

## Arquivos relevantes

- `tasks/prd-painel-de-clima/prd.md`
- `tasks/prd-painel-de-clima/techspec.md`
- `backend/src/services/normalize-city.ts`
- `backend/src/services/weather-condition.ts`
- `backend/src/data/parse-geocoding-response.ts`
- `backend/src/data/parse-forecast-response.ts`
- `backend/src/types/api-error.ts`
- `backend/src/types/coordinates.ts`
- `backend/src/types/current-conditions.ts`
- `backend/src/types/provider-conditions.ts`
- `backend/src/types/resolved-location.ts`
- `backend/src/types/source-attribution.ts`
- `backend/src/types/weather-location.ts`
- `backend/src/types/weather-provider.ts`
- `backend/src/types/weather-response.ts`
- `backend/src/types/weather-units.ts`
