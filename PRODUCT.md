# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite e Tailwind CSS no frontend; Node.js e Express no backend, conforme a implementação existente.

## Users

Inferência provisória baseada no PRD: qualquer pessoa que queira consultar rapidamente o clima atual de uma cidade.

## Product Purpose

O painel permite buscar uma cidade pelo nome e ver suas condições meteorológicas atuais em uma tela. Sucesso significa identificar a localidade resolvida e compreender temperatura, sensação térmica, condição, umidade e vento.

## Positioning

Inferência provisória baseada no PRD: a busca por nome é resolvida em uma única etapa pelo backend, que seleciona a primeira localidade encontrada e apresenta seu contexto junto ao clima.

## Operating Context

Inferência provisória baseada no PRD: uso rápido em navegador, em telas móveis e desktop, com ou sem mouse e com apoio de tecnologia assistiva.

## Capabilities and Constraints

- A busca aceita o nome de uma cidade e usa o primeiro resultado de geocodificação.
- Os dados são fornecidos pelo backend; o navegador não consulta diretamente a Open-Meteo.
- A interface usa português do Brasil e unidades métricas.
- A localidade resolvida, a condição e os metadados de unidade devem ser exibidos.
- Buscas inválidas, cidades não encontradas e indisponibilidade precisam de mensagens recuperáveis.
- A interface deve funcionar a partir de 360 px, ser operável por teclado e comunicar seus estados a tecnologias assistivas.
- Atribuição visível à Open-Meteo é necessária junto ao resultado.

## Evidence on Hand

O PRD e a TechSpec em `tasks/prd-painel-de-clima/` são a fonte dos requisitos. Não foram encontrados ativos de marca ou identidade visual confirmados.

## Product Principles

- Priorizar consulta rápida e leitura clara.
- Mostrar qual localidade foi resolvida.
- Manter a integração meteorológica no backend.
- Comunicar estados e falhas de forma acessível e recuperável.

## Accessibility & Inclusion

O fluxo principal deve ser operável por teclado, manter foco visível, usar rótulos persistentes e anunciar carregamento, sucesso e erro a tecnologias assistivas.
