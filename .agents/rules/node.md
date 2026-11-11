# Regras para Node.js

Estas regras se aplicam ao backend Node.js deste projeto e a qualquer código executado no servidor.

## Preferir async/await

Use `async/await` para operações assíncronas. Evite callbacks aninhados, pois eles dificultam a leitura, o tratamento de erros e a composição de operações.

Evite:

```ts
fs.readFile(filePath, 'utf8', (error, content) => {
  if (error) {
    logger.error('Falha ao ler arquivo', error);
    return;
  }

  processContent(content);
});
```

Prefira:

```ts
import { readFile } from 'node:fs/promises';

async function loadFile(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8');
}

async function processFile(filePath: string): Promise<void> {
  try {
    const content = await loadFile(filePath);
    processContent(content);
  } catch (error) {
    logger.error('Falha ao processar arquivo', error);
  }
}
```

Propague erros com `throw` quando a camada atual não tiver contexto suficiente para tratá-los. A camada responsável pela resposta HTTP deve converter o erro em status e payload adequados.

## Não bloquear o event loop

Não execute operações síncronas ou cálculos pesados no fluxo da requisição. Isso impede que o processo atenda outras requisições enquanto a operação estiver em execução.

Evite chamadas como `readFileSync`, `writeFileSync`, `execSync` e loops longos no handler HTTP. Prefira APIs assíncronas para I/O:

```ts
import { readFile } from 'node:fs/promises';

const content = await readFile(filePath, 'utf8');
```

Para cálculos intensivos de CPU, como criptografia, compressão, processamento de imagens ou grandes agregações, use `worker_threads`, um processo separado ou uma fila de trabalho. A operação deve deixar o event loop livre para continuar atendendo requisições.

Exemplo com `worker_threads`:

```ts
import { Worker } from 'node:worker_threads';

export function runHeavyCalculation(input: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./heavy-calculation-worker.js', import.meta.url), {
      workerData: input,
    });

    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker finalizado com código ${code}`));
    });
  });
}
```

Defina limites de tamanho, tempo e concorrência para operações pesadas. Quando a tarefa puder demorar, prefira processá-la de forma assíncrona e retornar um identificador para acompanhamento.

## Variáveis de ambiente com dotenv

Coloque configurações variáveis por ambiente em arquivos `.env` e carregue-as com `dotenv`. Não deixe portas, credenciais, tokens ou URLs específicas de ambiente fixos no código.

```ts
import 'dotenv/config';

const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada');
}
```

Não versione `.env` quando ele contiver segredos. Mantenha um `.env.example` com as chaves necessárias e valores fictícios:

```dotenv
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/app
```

Valide as variáveis obrigatórias na inicialização, antes de abrir o servidor HTTP. Isso faz o processo falhar rapidamente quando estiver mal configurado.

## Graceful shutdown

Todo servidor HTTP deve tratar `SIGTERM` e `SIGINT`. No desligamento, pare de aceitar novas conexões, aguarde as requisições em andamento dentro de um prazo e feche recursos como banco de dados, filas e consumidores.

```ts
const server = app.listen(port, () => {
  logger.info(`Servidor iniciado na porta ${port}`);
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Sinal ${signal} recebido; iniciando desligamento`);

  const forceExit = setTimeout(() => {
    logger.error('Prazo de desligamento excedido');
    process.exit(1);
  }, 10_000);

  server.close(async (error) => {
    if (error) {
      logger.error('Falha ao fechar servidor HTTP', error);
      process.exitCode = 1;
    }

    await closeDatabase();
    clearTimeout(forceExit);
    process.exit();
  });
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
```

O desligamento deve ser idempotente: sinais repetidos não podem iniciar várias rotinas de encerramento. Em produção, o prazo deve ser compatível com o ambiente de execução.

## Logging centralizado

Use `console.log` e `console.error` somente dentro de um adaptador centralizado. O restante da aplicação deve depender desse adaptador, permitindo padronizar formato, contexto e futura integração com uma ferramenta de observabilidade.

```ts
type LogContext = Record<string, unknown>;

function formatMessage(message: string, context?: LogContext): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...context,
  });
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(formatMessage(message, context));
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    const details = error instanceof Error ? { error: error.message, stack: error.stack } : { error };
    console.error(formatMessage(message, { ...details, ...context }));
  },
};
```

Não registre senhas, tokens, chaves privadas ou dados pessoais desnecessários. Inclua contexto útil, como identificador da requisição, rota e duração, sem expor informações sensíveis.

## Lock files

Prefira o uso do `npm` para instalar e gerenciar bibliotecas neste projeto. Use `npm install <pacote>` para adicionar uma dependência de produção e `npm install --save-dev <pacote>` para adicionar uma dependência de desenvolvimento:

```bash
npm install dotenv
npm install --save-dev vitest
```

Não misture gerenciadores de pacotes no mesmo aplicativo. Evite executar `yarn add` ou `pnpm add` em aplicações que utilizam npm, pois isso pode criar lock files concorrentes e instalações inconsistentes.

Versione o lock file correspondente a cada aplicativo (`package-lock.json`, `yarn.lock` ou `pnpm-lock.yaml`). Como frontend e backend são aplicações independentes, cada pasta deve manter seu próprio lock file.

Use o `package-lock.json` gerado pelo npm. Em CI, prefira a instalação reprodutível com `npm ci` e atualize o lock file junto com alterações nas dependências.

Não ignore ou remova lock files para resolver conflitos de instalação. Revise as alterações geradas e confirme que `package.json` e o lock file permanecem consistentes.

## Evitar referências circulares

Organize os módulos para que as dependências apontem em uma direção previsível. Por exemplo, as rotas podem depender de serviços, e os serviços podem depender de módulos de dados; módulos de dados não devem importar rotas.

Fluxo recomendado:

```text
configuração → rotas → serviços → dados
                      ↓
                    tipos
```

Evite a relação em que `routes/users.ts` importa `services/users.ts` e, ao mesmo tempo, `services/users.ts` importa `routes/users.ts`.

Extraia contratos compartilhados para `types/`, mova funções comuns para módulos independentes ou introduza uma camada de composição na inicialização. Cada módulo deve ter uma responsabilidade clara e não depender do módulo que o instancia.

Antes de concluir uma alteração, verifique se a nova importação não cria um ciclo indireto. Referências circulares podem produzir objetos parcialmente inicializados, comportamento dependente da ordem de importação e erros difíceis de diagnosticar.
