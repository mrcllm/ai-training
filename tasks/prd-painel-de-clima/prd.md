# Documento de Requisitos do Produto (PRD)

## Visão geral

O painel de clima permitirá que qualquer usuário consulte as condições meteorológicas atuais de uma cidade em uma única tela. O usuário informará o nome da cidade, e o sistema resolverá a localização e apresentará temperatura, sensação térmica, condição do tempo, umidade e vento em português do Brasil e com unidades métricas.

A funcionalidade será incorporada ao frontend e ao backend existentes. O frontend se comunicará exclusivamente com o backend da aplicação; o backend será responsável por consultar as APIs de geocodificação e previsão da Open-Meteo. Quando houver mais de uma localidade com o mesmo nome, o sistema utilizará o primeiro resultado retornado e mostrará a localidade resolvida para dar contexto ao usuário.

## Objetivos

- Permitir que o usuário conclua uma consulta de clima atual informando apenas o nome de uma cidade.
- Apresentar, em 100% das consultas concluídas com sucesso, a localidade resolvida, a temperatura, a sensação térmica, a condição do tempo, a umidade e o vento.
- Concluir ao menos 95% das consultas válidas em até 3 segundos, medidos do envio da busca à exibição do resultado, sob conexão normal e com as dependências externas disponíveis.
- Exibir uma orientação clara em 100% dos cenários previstos de entrada inválida, cidade não encontrada e indisponibilidade externa.
- Garantir que 100% das consultas feitas pelo frontend sejam direcionadas ao backend da aplicação, sem chamadas diretas do navegador à Open-Meteo.
- Oferecer uma experiência utilizável em telas a partir de 360 px de largura, operável por teclado e compatível com tecnologias assistivas nos fluxos principais.

## Histórias de usuário

- US1: Como usuário, quero pesquisar uma cidade pelo nome para consultar rapidamente o clima atual dessa localidade.
- US2: Como usuário, quero ver o nome da cidade, a região e o país efetivamente selecionados para saber a qual localidade os dados apresentados pertencem.
- US3: Como usuário, quero visualizar temperatura, sensação térmica, condição do tempo, umidade e vento para compreender as condições atuais.
- US4: Como usuário, quero receber mensagens claras quando a busca estiver incompleta, a cidade não for encontrada ou o serviço estiver indisponível para saber como prosseguir.
- US5: Como usuário de teclado ou tecnologia assistiva, quero preencher, enviar e compreender a busca e seu resultado sem depender de mouse, cor ou elementos exclusivamente visuais.
- US6: Como usuário, quero identificar a fonte dos dados meteorológicos para compreender a procedência das informações exibidas.

## Principais funcionalidades

### Busca por cidade

O painel oferecerá um campo textual e uma ação de busca. A entrada deverá aceitar nomes de cidades em diferentes idiomas, ignorar espaços excedentes e exigir ao menos dois caracteres úteis.

- RF1: O sistema deve permitir o envio de uma busca por nome de cidade.
- RF2: O sistema deve rejeitar entradas vazias, compostas apenas por espaços ou com menos de dois caracteres úteis e orientar o usuário a corrigir a busca.
- RF3: O sistema deve usar o primeiro resultado retornado pela busca de localidades da Open-Meteo, sem apresentar uma etapa de seleção entre cidades homônimas.
- RF4: O sistema deve informar a cidade, a divisão administrativa disponível e o país da localidade resolvida.

### Consulta do clima pelo backend

O backend centralizará a integração externa e disponibilizará ao frontend uma operação HTTP para consultar o clima atual a partir do nome da cidade.

- RF5: O backend deve converter o nome informado em coordenadas por meio da Geocoding API da Open-Meteo.
- RF6: O backend deve usar as coordenadas do primeiro resultado para obter as condições atuais por meio da Weather Forecast API da Open-Meteo.
- RF7: O frontend deve obter todos os dados meteorológicos exclusivamente do backend da aplicação.
- RF8: O backend deve devolver ao frontend apenas os dados necessários para representar o resultado e seus respectivos metadados de unidade e localização.

### Exibição das condições atuais

O resultado deverá priorizar leitura rápida e utilizar linguagem em português do Brasil e unidades métricas.

- RF9: O painel deve exibir temperatura e sensação térmica em graus Celsius.
- RF10: O painel deve exibir a condição meteorológica atual em descrição compreensível em português do Brasil.
- RF11: O painel deve exibir umidade relativa em porcentagem.
- RF12: O painel deve exibir velocidade do vento em quilômetros por hora.

### Estados e recuperação de falhas

O painel deixará explícito quando uma consulta estiver em andamento, não tiver resultado ou não puder ser concluída.

- RF13: O sistema deve apresentar um estado de carregamento durante a consulta e impedir envios duplicados acidentais enquanto ela estiver em andamento.
- RF14: O sistema deve diferenciar entrada inválida, cidade não encontrada e indisponibilidade temporária do serviço por meio de mensagens claras.
- RF15: Após uma falha, o sistema deve preservar a possibilidade de editar a cidade e repetir a consulta.
- RF16: Um resultado anterior não deve ser apresentado como se correspondesse a uma nova busca que terminou com erro.

### Transparência da fonte

A origem dos dados deve permanecer visível junto ao painel.

- RF17: O painel deve exibir atribuição visível à Open-Meteo, com link para a fonte, próxima aos dados meteorológicos.

## Critérios de aceitação

- CA-01 (US1, RF1, RF5, RF6): Dada uma cidade válida com resultado na Open-Meteo, quando o usuário enviar a busca, então o sistema deve exibir as condições atuais da primeira localidade retornada.
- CA-02 (US2, RF3, RF4): Dado um nome associado a múltiplas localidades, quando a consulta for concluída, então nenhuma seleção intermediária deve ser solicitada e a cidade, a divisão administrativa disponível e o país do primeiro resultado devem ser identificados no painel.
- CA-03 (US3, RF9–RF12): Dada uma consulta concluída com sucesso, quando o painel apresentar o resultado, então deve exibir temperatura, sensação térmica, condição, umidade e vento com rótulos em português do Brasil e unidades métricas.
- CA-04 (US1, RF7): Dada qualquer busca iniciada no frontend, quando as requisições de rede forem inspecionadas, então o navegador deve consultar apenas o backend da aplicação e não deve chamar os domínios da Open-Meteo diretamente.
- CA-05 (US4, RF2): Dada uma entrada vazia, composta apenas por espaços ou com menos de dois caracteres úteis, quando o usuário tentar pesquisar, então deve receber uma orientação de validação e nenhum resultado meteorológico deve ser apresentado.
- CA-06 (US4, RF14): Dada uma busca sem localidades correspondentes, quando ela for concluída, então o painel deve informar que a cidade não foi encontrada e permitir uma nova tentativa.
- CA-07 (US4, RF14–RF16): Dada uma indisponibilidade ou resposta inválida de uma dependência externa, quando a consulta falhar, então o painel deve apresentar uma mensagem temporária de erro, não deve associar um resultado anterior à nova busca e deve permitir tentar novamente.
- CA-08 (US4, RF13): Dada uma consulta em andamento, quando o usuário aguardar a resposta, então deve perceber um estado de carregamento e a ação de envio não deve gerar consultas duplicadas acidentais.
- CA-09 (Objetivo de desempenho): Dado um conjunto representativo de consultas válidas e as dependências externas disponíveis, quando o tempo fim a fim for medido sob conexão normal, então ao menos 95% das consultas devem exibir o resultado em até 3 segundos.
- CA-10 (US5): Dado o uso exclusivo do teclado, quando o usuário navegar pelo painel, preencher a cidade, iniciar a busca e acessar o resultado ou uma mensagem de erro, então todas essas ações e informações devem estar disponíveis em ordem de foco lógica e com indicador de foco visível.
- CA-11 (US5): Dado o uso de tecnologia assistiva, quando os estados de carregamento, sucesso, validação ou erro mudarem, então os rótulos e as mensagens relevantes devem ser identificáveis e anunciados sem depender exclusivamente de cor ou ícones.
- CA-12 (US5): Dadas larguras de tela de 360 px e 1280 px, quando o painel for exibido, então seu conteúdo deve permanecer legível e operável, sem rolagem horizontal causada pela funcionalidade.
- CA-13 (US6, RF17): Dado um resultado meteorológico visível, quando o usuário consultar o painel, então deve encontrar uma atribuição à Open-Meteo com link funcional junto aos dados.

## Experiência do usuário

O público principal é qualquer pessoa que queira consultar rapidamente o clima atual de uma cidade. Pessoas que utilizam teclado, leitores de tela ou ampliação também fazem parte do público e devem concluir o mesmo fluxo principal.

Ao acessar o painel, o usuário encontrará um título que explique a finalidade da área, um campo com rótulo persistente para o nome da cidade e uma ação clara de busca. Após o envio, o painel indicará o carregamento e então substituirá esse estado pelo resultado ou por uma mensagem acionável. O campo permanecerá disponível para que outra cidade seja consultada.

O resultado destacará a temperatura e a condição atual, seguido dos demais dados, sem depender somente de ícones ou cores. A localidade resolvida será apresentada de forma explícita porque buscas ambíguas utilizarão automaticamente o primeiro resultado. A interface usará português do Brasil, graus Celsius, porcentagem e quilômetros por hora.

A experiência deverá ser responsiva desde 360 px, preservar contraste de texto e controles em nível AA, manter foco visível e ordem de navegação lógica, associar rótulos programáticos aos controles e comunicar mudanças assíncronas às tecnologias assistivas. Mensagens de validação e erro deverão explicar o problema e a ação possível, sem termos internos do sistema.

## Restrições técnicas de alto nível

- A funcionalidade deve respeitar a separação existente entre o frontend React e o backend Node.js/Express.
- O frontend não pode consultar serviços meteorológicos externos diretamente; toda integração deve passar pelo backend.
- A resolução de cidades deve usar a [Geocoding API da Open-Meteo](https://geocoding-api.open-meteo.com/v1/search), e as condições atuais devem usar a [Weather Forecast API da Open-Meteo](https://api.open-meteo.com/v1/forecast), ambas via HTTPS.
- A operação deve utilizar a cidade como entrada pública e retornar um contrato consistente para sucesso, validação, ausência de resultado e falha externa.
- A meta de desempenho é de até 3 segundos para pelo menos 95% das consultas válidas, medida fim a fim sob conexão normal e com a Open-Meteo disponível.
- O MVP pressupõe uso não comercial da API gratuita. Devem ser respeitados os limites vigentes do provedor; uso comercial ou volume acima do permitido exigirá reavaliação do plano de serviço.
- A exibição dos dados deve manter a atribuição exigida à Open-Meteo junto ao painel.
- A busca não deve exigir conta, API key do usuário nem armazenamento de dados pessoais. O nome pesquisado não deve ser persistido como histórico de produto.
- A disponibilidade e a precisão dos dados dependem da Open-Meteo; o produto deve comunicar falhas sem prometer continuidade ou exatidão absoluta do serviço externo.

## Fora do escopo

- Geolocalização do navegador, obtenção automática de coordenadas e sugestão automática de cidade no MVP; essa melhoria opcional poderá ser avaliada em uma iteração futura.
- Seleção manual entre cidades homônimas; o MVP sempre utilizará o primeiro resultado da geocodificação.
- Previsões futuras horárias ou diárias, histórico meteorológico e comparação entre localidades.
- Alertas de clima severo, notificações, mapas meteorológicos ou radares.
- Favoritos, histórico de buscas, contas de usuário, sincronização ou personalização persistente.
- Troca entre unidades métricas e imperiais ou suporte a outros idiomas além de português do Brasil.
- Operação offline, garantia própria de disponibilidade dos dados ou substituição automática da Open-Meteo por outro provedor.
- Contratação ou configuração de um plano comercial da Open-Meteo para o MVP.
