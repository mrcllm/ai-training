# Documento de Requisitos do Produto (PRD)

## Visão geral

O painel de clima, definido em `tasks/prd-painel-de-clima/prd.md`, exibe as condições atuais de uma cidade com temperaturas sempre em graus Celsius (°C). Aquele PRD deixou a troca entre Celsius e Fahrenheit fora do escopo do MVP; este documento trata dessa evolução. Pessoas acostumadas à escala Fahrenheit (°F), como visitantes dos Estados Unidos ou quem acompanha previsões em fontes norte-americanas, precisam fazer a conversão de cabeça para entender se está frio ou calor. Esta funcionalidade adiciona ao cartão de resultado um botão único que alterna a exibição das temperaturas entre °C e °F, de forma imediata e sem nova consulta.

A conversão ocorre inteiramente na interface, a partir dos valores em °C já recebidos. O padrão do produto continua métrico: toda vez que a página é carregada, as temperaturas aparecem em °C. A escala °F é uma escolha da pessoa usuária, mantida apenas enquanto a página permanecer aberta. O valor entregue é ler a temperatura na escala familiar com um único clique, sem mudar o restante da experiência.

## Objetivos

- **Exatidão da conversão:** 100% das temperaturas exibidas em °F (temperatura atual e sensação térmica) correspondem à fórmula °F = °C × 9/5 + 32, arredondada para uma casa decimal, em todos os casos da tabela de referência dos critérios de aceitação.
- **Troca instantânea:** a nova unidade aparece em até 100 ms após o acionamento do botão, sem indicador de carregamento.
- **Zero custo de rede:** alternar a unidade gera 0 requisições ao backend.
- **Reversibilidade sem perda:** após qualquer número de alternâncias, a exibição em °C mostra exatamente os valores originais recebidos.
- **Acessibilidade:** o botão é 100% operável por teclado, a unidade em uso é comunicada a tecnologias assistivas e a verificação automatizada de acessibilidade da tela de resultado não registra violações críticas ou sérias.
- **Qualidade:** o código produzido atinge pelo menos 80% de cobertura por testes automatizados, conforme as regras do projeto, com prioridade para a regra de conversão.

## Histórias de usuário

- **US1:** Como pessoa acostumada à escala Fahrenheit, quero ver a temperatura atual e a sensação térmica em °F para entender o clima sem fazer contas.
- **US2:** Como pessoa usuária que trocou para °F, quero voltar para °C com um clique para comparar com a escala local.
- **US3:** Como pessoa usuária que escolheu °F, quero que as próximas cidades que eu buscar também apareçam em °F, sem precisar trocar de novo a cada busca.
- **US4:** Como pessoa que navega por teclado ou usa leitor de tela, quero acionar o botão e saber em qual unidade as temperaturas estão sendo exibidas.
- **US5 (caso de borda):** Como pessoa usuária que recarrega ou reabre a página, quero ver as temperaturas em °C, o padrão do painel, sem herdar uma escolha anterior.
- **US6 (caso de borda):** Como pessoa usuária que consulta cidades com temperaturas negativas ou extremas, quero que a conversão seja exibida corretamente, sem valores estranhos como "-0".

## Principais funcionalidades

### 1. Botão de alternância de unidade

**O que faz:** oferece um único controle no cartão de resultado para alternar entre °C e °F.
**Por que é importante:** coloca a escolha junto à informação que ela afeta, com o menor esforço possível.
**Como funciona:** o botão mostra a ação que será executada. Com °C ativo, o rótulo é "Mostrar em °F"; com °F ativo, o rótulo é "Mostrar em °C". Cada acionamento troca a unidade de todas as temperaturas do cartão.

- **RF1:** O cartão de resultado deve exibir um botão de alternância de unidade de temperatura sempre que um resultado de clima estiver visível.
- **RF2:** O botão deve existir somente quando o cartão de resultado estiver visível. Ele não aparece no estado inicial, sem busca, nem quando a tela exibe apenas uma mensagem de erro.
- **RF3:** O rótulo do botão deve descrever a ação: "Mostrar em °F" quando a unidade ativa for °C e "Mostrar em °C" quando a unidade ativa for °F.
- **RF4:** Cada acionamento do botão deve alternar a unidade de todas as temperaturas exibidas no cartão.
- **RF5:** A mudança de unidade deve ser comunicada a tecnologias assistivas, informando a unidade em uso após a troca.

### 2. Conversão das temperaturas

**O que faz:** recalcula e exibe a temperatura atual e a sensação térmica na unidade escolhida.
**Por que é importante:** garante que os números exibidos em °F sejam corretos e consistentes com os valores em °C.
**Como funciona:** a interface converte os valores em °C já recebidos e troca o símbolo de unidade exibido ao lado de cada temperatura.

- **RF6:** A conversão para Fahrenheit deve seguir a fórmula °F = °C × 9/5 + 32.
- **RF7:** Os valores convertidos devem ser arredondados para uma casa decimal. Um resultado que arredonde para zero deve ser exibido como "0", nunca como "-0".
- **RF8:** A conversão deve partir sempre do valor original em °C recebido do backend, de modo que alternâncias repetidas não acumulem erro de arredondamento.
- **RF9:** O símbolo exibido junto a cada temperatura deve corresponder à unidade ativa ("°C" ou "°F"). A tela nunca deve mostrar unidades diferentes para a temperatura atual e para a sensação térmica ao mesmo tempo.
- **RF10:** A umidade relativa (%) e a velocidade do vento (km/h) devem permanecer inalteradas, em qualquer unidade de temperatura.
- **RF11:** Alternar a unidade não deve disparar nova consulta ao backend nem alterar a localidade, a condição, as demais medições, o horário de referência ou a atribuição da fonte.
- **RF12:** Os valores convertidos devem seguir o mesmo padrão de formatação numérica que o painel usa para as temperaturas em °C.

### 3. Manutenção da escolha durante a sessão

**O que faz:** mantém a unidade escolhida enquanto a página estiver aberta.
**Por que é importante:** evita trocar a unidade a cada nova busca, sem criar uma preferência permanente.
**Como funciona:** a unidade ativa vale para todas as buscas feitas na mesma página aberta. Recarregar ou reabrir a página restaura o padrão °C.

- **RF13:** A unidade padrão ao carregar a página deve ser °C.
- **RF14:** Depois que a pessoa usuária escolhe uma unidade, novos resultados de busca na mesma página aberta devem ser exibidos nessa unidade.
- **RF15:** A escolha de unidade não deve ser mantida após recarregar, fechar ou reabrir a página.

## Critérios de aceitação

- **CA-01 (US1, RF4, RF6, RF9):** Dado um resultado com temperatura atual de 25 °C e sensação térmica de 27 °C, quando a pessoa aciona "Mostrar em °F", então o cartão exibe temperatura atual "77 °F" e sensação térmica "80.6 °F".
- **CA-02 (US2, RF4, RF8):** Dado o cartão exibindo 77 °F e 80.6 °F, convertidos de 25 °C e 27 °C, quando a pessoa aciona "Mostrar em °C", então o cartão volta a exibir exatamente "25 °C" e "27 °C".
- **CA-03 (US6, RF6, RF7):** Dados os valores em °C da tabela abaixo, quando a unidade ativa for °F, então os valores exibidos correspondem exatamente à coluna "°F exibido":

  | °C recebido | °F exibido |
  | ----------- | ---------- |
  | 0           | 32         |
  | 100         | 212        |
  | -40         | -40        |
  | 22.5        | 72.5       |
  | -3.2        | 26.2       |
  | 37          | 98.6       |
  | -17.8       | 0          |

- **CA-04 (RF8):** Dado um resultado com temperatura de 22.5 °C, quando a pessoa aciona o botão dez vezes seguidas, então o cartão exibe exatamente "22.5 °C".
- **CA-05 (RF3):** Dado um resultado exibido em °C, então o botão tem o rótulo "Mostrar em °F". Quando a pessoa o aciona, o rótulo passa a ser "Mostrar em °C".
- **CA-06 (RF10):** Dado um resultado com umidade de 60 % e vento de 12 km/h, quando a pessoa alterna para °F, então a umidade continua "60 %" e o vento continua "12 km/h".
- **CA-07 (RF11):** Dado um resultado exibido, quando a pessoa alterna a unidade, então nenhuma requisição é feita ao backend e a localidade, a condição, o horário de referência e a atribuição permanecem idênticos.
- **CA-08 (US3, RF14):** Dado que a pessoa alternou para °F, quando ela busca outra cidade e o novo resultado aparece, então as temperaturas do novo resultado estão em °F e o botão mostra "Mostrar em °C".
- **CA-09 (US5, RF13, RF15):** Dado que a pessoa alternou para °F, quando ela recarrega a página e faz uma nova busca, então as temperaturas aparecem em °C.
- **CA-10 (RF2):** Dado o estado inicial, sem busca, ou uma busca que resultou apenas em mensagem de erro, então o botão de alternância de unidade não está visível.
- **CA-11 (US4):** Dado um resultado exibido, quando a pessoa navega pela página apenas com o teclado, então consegue alcançar o botão com Tab, acioná-lo com Enter ou Espaço, vê um indicador de foco visível e mantém o foco no botão após o acionamento.
- **CA-12 (US4, RF5):** Dado um leitor de tela ativo, quando a pessoa aciona o botão, então a tecnologia assistiva anuncia a unidade de temperatura em uso após a troca.
- **CA-13 (RF1):** Dada uma tela com 360 px de largura, quando um resultado é exibido, então o botão aparece por inteiro, sem rolagem horizontal, e tem área de toque de pelo menos 44 × 44 px.
- **CA-14 (Objetivos):** Dado um resultado exibido, quando a pessoa aciona o botão, então os novos valores aparecem em até 100 ms, sem indicador de carregamento.

## Experiência do usuário

### Perfis e necessidades

- **Principal:** pessoas acostumadas à escala Fahrenheit, como visitantes estrangeiros ou quem compara o clima com fontes dos Estados Unidos. Precisam ler a temperatura na escala familiar.
- **Secundário:** pessoas que usam °C normalmente, mas querem conferir o valor em °F pontualmente. Precisam voltar ao padrão com facilidade.
- **Transversal:** pessoas que navegam por teclado ou com leitor de tela. Precisam operar o botão e saber qual unidade está ativa sem depender de pistas visuais.

### Fluxo principal

1. A pessoa busca uma cidade e vê o resultado com as temperaturas em °C, o padrão.
2. No cartão de resultado, próximo ao destaque da temperatura atual, ela encontra o botão "Mostrar em °F".
3. Ao acionar o botão, a temperatura atual e a sensação térmica passam a ser exibidas em °F, e o botão passa a mostrar "Mostrar em °C".
4. Ela busca outra cidade; o novo resultado já aparece em °F.
5. Ao acionar "Mostrar em °C", as temperaturas voltam aos valores originais.
6. Ao recarregar a página, o painel volta ao padrão °C.

### Requisitos de UI/UX

- O botão fica no cartão de resultado, próximo ao destaque da temperatura atual, e segue a mesma identidade visual dos demais controles do painel de clima: tipografia, cores, cantos arredondados e estilo de foco.
- O botão tem peso visual secundário e não compete com a ação primária de busca.
- Os textos estão em português do Brasil e usam os símbolos "°C" e "°F".
- As temperaturas mantêm numerais tabulares, e a troca de unidade não deve provocar deslocamento perceptível do layout do cartão.
- A unidade ativa é comunicada por texto, pelo símbolo junto aos valores e pelo rótulo do botão, e não apenas por cor.

### Acessibilidade

- O botão atende ao WCAG 2.1 nível AA: contraste mínimo de 4,5:1 para o texto, foco visível e área de toque de pelo menos 44 × 44 px.
- O botão é operável por teclado com Enter e Espaço, e o foco permanece nele após o acionamento.
- A troca de unidade é anunciada a tecnologias assistivas sem mover o foco.
- O nome acessível do botão descreve claramente a ação, por exemplo "Mostrar temperaturas em Fahrenheit".

## Restrições técnicas de alto nível

- **Somente frontend:** a funcionalidade deve ser implementada apenas no frontend. O backend e o contrato da API de clima permanecem inalterados e continuam entregando temperaturas em °C.
- **Dependência:** a funcionalidade depende do painel de clima definido em `tasks/prd-painel-de-clima/prd.md`, incluindo o cartão de resultado e a busca por cidade. Ela só pode ser entregue depois do painel e não pode alterar os demais comportamentos dele.
- **Sem dependências externas:** a conversão não pode depender de rede, de serviços de terceiros ou de nova consulta à Open-Meteo.
- **Sem persistência:** a escolha de unidade não deve sobreviver a um recarregamento da página nem ser registrada em qualquer armazenamento do navegador ou do servidor.
- **Desempenho:** a atualização visual após o acionamento deve ocorrer em até 100 ms.
- **Privacidade:** nenhum dado pessoal é coletado ou armazenado por esta funcionalidade.
- **Padrões do projeto:** a funcionalidade deve seguir as regras de código, testes, com cobertura mínima de 80%, e acessibilidade definidas em `.agents/rules/` e na skill `react`.

## Fora do escopo

- Conversão de outras medições para unidades imperiais, como vento em mph ou umidade em outro formato.
- Escala Kelvin ou qualquer unidade além de °C e °F.
- Persistência da preferência entre recarregamentos, sessões, dispositivos ou contas de usuário.
- Detecção automática da unidade pelo idioma, pela região do navegador ou pela localidade buscada.
- Alterações no backend ou na API, incluindo solicitar à Open-Meteo dados já em °F.
- Controle de unidade fora do cartão de resultado, como no formulário de busca ou em um cabeçalho global.
- Mudança do formato numérico usado pelo painel, como adotar vírgula decimal, e internacionalização da interface.
