---
name: Clima agora
description: Consulta rápida às condições atuais de uma cidade.
colors:
  deep-teal: "#163f4b"
  teal: "#1b6172"
  teal-hover: "#0f303a"
  page-mist: "#edf3f4"
  pale-teal: "#f3f7f7"
  sun-yellow: "#f4c95d"
  pale-yellow: "#fff5d8"
  ink: "#0f2930"
  slate-text: "#475569"
  slate-border: "#cbd5e1"
  paper: "#ffffff"
  error-red: "#991b1b"
typography:
  display:
    fontFamily: "Readex Pro, Avenir Next, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Readex Pro, Avenir Next, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Readex Pro, Avenir Next, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Readex Pro, Avenir Next, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  control: "12px"
  card: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.deep-teal}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.teal-hover}"
  input-city:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
---

# Design System: Clima agora

## Overview

**Creative North Star: “Clima sem rodeios”**

A interface divide o contexto da consulta: um painel azul-petróleo apresenta o serviço, enquanto uma área clara concentra a busca e a leitura do resultado. O amarelo suave marca ícones e a temperatura para dar destaque ao clima sem dominar a tela.

Readex Pro dá unidade a títulos, instruções e dados. Em telas largas, contexto e consulta ficam lado a lado; em telas estreitas, o contexto aparece acima do formulário. O resultado mantém a localidade resolvida visível e organiza as medições em cartões claros.

**Key Characteristics:**
- Painel de contexto azul-petróleo e área de consulta em cinza azulado muito claro.
- Amarelo suave reservado para ícones e destaques meteorológicos.
- Cartões brancos para formulário e dados, com bordas suaves e sombras difusas.
- Tipografia Readex Pro e estados comunicados por texto, foco ou cor semântica.

## Colors

### Primary
- **Azul-petróleo profundo** (`#163f4b`): painel de contexto e ação primária.
- **Azul-petróleo** (`#1b6172`): estados de consulta e detalhes interativos.
- **Azul-petróleo hover** (`#0f303a`): ação primária sob o ponteiro.

### Accent
- **Amarelo-sol** (`#f4c95d`): ícones, anéis de foco e pequenos detalhes de destaque.
- **Amarelo-pálido** (`#fff5d8`): superfície discreta para a temperatura atual.

### Neutral and semantic
- **Névoa** (`#edf3f4`): fundo da área de consulta.
- **Papel** (`#ffffff`): cartões e campos.
- **Teal pálido** (`#f3f7f7`): cartões de medições.
- **Tinta** (`#0f2930`) e ardósia (`#475569`): títulos, valores e texto auxiliar.
- **Borda ardósia** (`#cbd5e1`): contornos e divisórias.
- **Vermelho** (`#991b1b`): erros e validação.

O painel escuro mantém texto branco de alto contraste. Amarelo é um acento; não substitui a superfície azul-petróleo como identidade principal.

## Typography

**Display and body font:** Readex Pro, com Avenir Next e sans-serif como alternativas.

Títulos usam pesos fortes e escala contida. Instruções e valores usam 16px com line-height confortável. Rótulos e ações usam 14px sem competir com a leitura das condições.

Medições numéricas usam numerais tabulares. A temperatura atual recebe destaque maior; sensação térmica, umidade e vento ficam em cartões menores.

## Layout

O conteúdo ocupa uma coluna central com largura máxima de 1280px. A partir do breakpoint `lg` (1024px), a página usa duas colunas: painel de contexto mais estreito à esquerda e consulta à direita. Em telas menores, os blocos empilham nessa ordem.

O formulário empilha input e ação em telas estreitas. A partir de `sm` (640px), ficam lado a lado e alinhados pela base do input. A área de consulta usa margens de 20px em telas estreitas, que aumentam em viewports maiores.

## Elevation and Shapes

Cartões brancos usam bordas finas e sombras suaves e difusas. O formulário e o resultado têm cantos de 16px; campos, botão e cartões de medidas têm cantos de 12px. O painel de contexto permanece retangular.

## Components

### Buttons and fields
- A ação primária tem 48px de altura, fundo azul-petróleo, texto branco, raio de 12px e padding horizontal de 24px.
- O hover escurece o botão; foco visível usa anel amarelo de 4px com afastamento.
- O campo tem 48px de altura, fundo branco, contorno cinza-azulado e raio de 12px.
- Em desktop, a ação fica alinhada pela base do input; em celular, ocupa a linha abaixo do campo.

### Weather result
O resultado exibe a cidade, divisão administrativa e país resolvidos. A temperatura e a condição recebem destaque; sensação térmica, umidade e vento aparecem em cartões com ícones e rótulos. A atribuição à Open-Meteo fica abaixo das medições.

### Feedback
Carregamento aparece abaixo do formulário em azul-petróleo. Erros usam texto explícito em vermelho. Validação, carregamento e falhas não dependem somente de cor para comunicar o estado.

## Do's and Don'ts

### Do
- Manter o painel de contexto azul-petróleo e o amarelo apenas como acento.
- Preservar o alinhamento do botão com a base do input em telas largas.
- Identificar a localidade resolvida e exibir todas as medidas requeridas pelo PRD.
- Manter foco visível, mensagens textuais e layout responsivo.

### Don't
- Trocar a identidade azul-petróleo por uma superfície predominantemente amarela.
- Alinhar o botão pelo topo do formulário quando o rótulo fica acima do input.
- Remover a localidade, as condições, as unidades ou a atribuição da fonte.
