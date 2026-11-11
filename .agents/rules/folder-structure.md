# Estrutura de pastas

Este documento define a organização esperada para o frontend, o backend e os testes do projeto. Os diretórios de código ficam dentro de `src/`, salvo quando indicado de outra forma.

## Visão geral

```text
.
├── frontend/
├── backend/
└── e2e/
```

O frontend e o backend são aplicações independentes e mantêm seus próprios arquivos de configuração, dependências e scripts. A pasta `e2e/` fica na raiz do projeto e contém os testes de ponta a ponta.

## Backend

```text
backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── data/
│   ├── types/
│   └── index.ts
├── package.json
├── nodemon.json
└── tsconfig.json
```

- `routes/`: define as rotas HTTP, recebe as requisições, valida entradas básicas e monta as respostas. Não deve conter regras de negócio.
- `services/`: concentra as regras de negócio e o comportamento da aplicação. Os serviços devem ser independentes do protocolo HTTP sempre que possível.
- `data/`: concentra dados e integrações, como queries, repositórios, persistência e acesso a APIs externas.
- `types/`: contém os tipos usados pelo backend. Cada tipo deve ficar em um arquivo próprio, com nome correspondente ao conceito representado.
- `index.ts`: inicializa o servidor e registra as configurações e rotas da aplicação.
- `*.test.ts`: testes unitários e de integração devem ficar próximos ao código testado, dentro de `src/`, quando aplicável.

### Fluxo esperado

```text
requisição HTTP → routes → services → data → resposta HTTP
```

As `routes` podem usar `services`, e os `services` podem usar `data`. A camada `data` não deve depender de `routes`.

## Frontend

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── views/
│   ├── services/
│   ├── hooks/
│   ├── assets/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

- `components/`: componentes reutilizáveis de interface. Componentes específicos de uma tela podem permanecer organizados em subpastas próprias.
- `views/`: telas e páginas da aplicação, responsáveis por compor componentes e coordenar o estado da tela.
- `services/`: acesso ao backend, incluindo clientes HTTP, chamadas de endpoints e transformação de respostas da API.
- `hooks/`: hooks React reutilizáveis e lógica de estado ou comportamento compartilhado entre componentes e views.
- `assets/`: imagens, ícones, fontes e outros recursos importados pelo código da aplicação.
- `types/`: tipos usados pelo frontend. Cada tipo deve ficar em um arquivo próprio, com nome correspondente ao conceito representado.
- `public/`: arquivos estáticos servidos diretamente, sem processamento pelo bundler.
- `*.test.ts` e `*.test.tsx`: testes unitários e de componentes devem ficar próximos ao código testado, dentro de `src/`, quando aplicável.

### Fluxo esperado

```text
view → components/hooks → services → backend
```

Componentes e views não devem duplicar a lógica de acesso ao backend; esse acesso deve ser encapsulado em `services/`.

## Testes E2E

```text
e2e/
└── *.spec.ts
```

Os testes E2E usam Playwright e validam fluxos completos pela perspectiva do usuário. Devem ficar fora de `frontend/` e `backend/`. Testes unitários e de integração permanecem junto ao código da aplicação, em `frontend/src/` ou `backend/src/`.

## Convenções

- Crie uma pasta nova somente quando ela representar uma responsabilidade clara e recorrente.
- Evite colocar regras de negócio em `routes`, `components` ou `views`.
- Evite acessar o backend diretamente a partir de `components` ou `views`; use `services/`.
- Mantenha os arquivos de configuração na raiz do aplicativo ao qual pertencem.
