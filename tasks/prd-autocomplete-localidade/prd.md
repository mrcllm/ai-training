# Documento de Requisitos do Produto (PRD)

## Visão geral

O campo de cidade do painel de clima passará a sugerir localidades de qualquer país enquanto a pessoa digita. A funcionalidade ajudará qualquer usuário a encontrar e selecionar a cidade correta, especialmente quando existirem municípios homônimos, reduzindo erros de digitação e evitando que o sistema escolha silenciosamente uma localidade diferente da pretendida.

As sugestões começarão a ser consultadas a partir de dois caracteres úteis e serão atualizadas conforme a entrada. A pessoa poderá escolher uma das até oito opções por teclado, mouse ou toque e, em seguida, manterá a ação explícita de consultar o clima. A funcionalidade evolui o fluxo atual, que utiliza automaticamente o primeiro resultado da geocodificação, e abrangerá localidades do mundo todo.

## Objetivos

- Exibir até oito sugestões relevantes, de qualquer país, sempre que a fonte de localidades retornar correspondências para a entrada válida.
- Apresentar as sugestões em até 1 segundo em pelo menos 95% das consultas, medido após a pausa de digitação prevista, sob conexão normal e com as dependências disponíveis.
- Identificar cidade, estado (ou divisão equivalente) e país em 100% das sugestões que contenham esses dados, permitindo distinguir localidades homônimas antes da consulta meteorológica.
- Garantir que 100% das consultas de clima iniciadas após o uso do autocomplete correspondam à localidade explicitamente selecionada.
- Cobrir com orientação clara 100% dos estados previstos: entrada insuficiente, carregamento, resultados disponíveis, nenhum resultado e indisponibilidade do serviço.
- Permitir que o fluxo completo de abrir, percorrer, selecionar e fechar sugestões seja operável por teclado e compreensível por tecnologias assistivas.
- Manter o campo e as sugestões legíveis e operáveis sem rolagem horizontal em telas a partir de 360 px de largura.

## Histórias de usuário

- US1: Como usuário, quero receber sugestões enquanto digito uma cidade para encontrá-la com menos esforço e evitar erros de escrita.
- US2: Como usuário que pesquisa uma cidade com nome repetido, quero ver o estado e o país de cada sugestão para selecionar a localidade correta.
- US3: Como usuário, quero que apenas a sugestão que selecionei seja usada na consulta para não receber o clima de outra cidade.
- US4: Como usuário de teclado ou tecnologia assistiva, quero navegar, selecionar e compreender as sugestões sem depender de mouse, toque, cor ou ícones.
- US5: Como usuário, quero receber retorno quando não houver sugestões ou quando a busca estiver indisponível para saber como corrigir a entrada ou tentar novamente.
- US6: Como usuário em uma conexão sujeita a respostas fora de ordem, quero ver somente sugestões referentes ao texto atual para não selecionar uma localidade incorreta.

## Principais funcionalidades

### Geração progressiva de sugestões

O sistema consultará localidades de qualquer país conforme a pessoa preencher o campo, sem exigir o envio do formulário a cada alteração.

- RF1: O sistema deve iniciar a busca de sugestões quando o campo contiver ao menos dois caracteres úteis, desconsiderando espaços no início e no fim.
- RF2: O sistema deve aguardar uma pausa de 300 milissegundos após a última alteração antes de iniciar a busca, evitando consultas desnecessárias durante a digitação contínua.
- RF3: O sistema deve exibir no máximo oito sugestões por busca, ordenadas pela relevância fornecida pela fonte de localidades.
- RF4: O sistema deve sugerir localidades de qualquer país, sem restrição geográfica.
- RF5: O sistema deve aceitar diferenças entre maiúsculas e minúsculas e entre caracteres com e sem acentos conforme a normalização oferecida pela fonte de localidades.
- RF6: O sistema deve considerar que entradas de dois caracteres somente terão resultados quando corresponderem exatamente a um nome e que a correspondência por prefixo estará disponível a partir de três caracteres.
- RF7: O sistema deve descartar respostas de buscas anteriores quando elas não corresponderem mais ao conteúdo atual do campo.

### Apresentação e seleção da localidade

As sugestões devem oferecer contexto suficiente para distinguir resultados e permitir uma escolha explícita antes da consulta meteorológica.

- RF8: Cada sugestão deve apresentar o nome da cidade, o estado (ou divisão equivalente) e o país quando essas informações estiverem disponíveis.
- RF9: O sistema deve permitir selecionar uma sugestão por mouse, toque ou teclado.
- RF10: Ao selecionar uma sugestão, o sistema deve preencher o campo com uma identificação legível da localidade e manter internamente a identidade inequívoca necessária para a consulta do clima.
- RF11: A lista deve ser fechada após uma seleção, ao pressionar Escape ou quando o foco deixar o conjunto do campo e das sugestões.
- RF12: Se a pessoa alterar o texto depois de selecionar uma localidade, a seleção anterior deve ser invalidada até que uma nova sugestão seja escolhida.
- RF13: O envio da consulta meteorológica deve exigir uma sugestão válida selecionada e deve orientar a pessoa quando houver texto sem uma seleção correspondente.
- RF14: Selecionar uma sugestão não deve iniciar automaticamente a consulta meteorológica; a ação existente de consultar o clima deve ser preservada.

### Estados, falhas e recuperação

O autocomplete deve comunicar seu estado sem bloquear a edição do campo ou confundir uma resposta antiga com a entrada atual.

- RF15: O sistema deve indicar que está buscando sugestões quando a resposta não for imediata.
- RF16: Quando a busca válida não retornar correspondências, o sistema deve informar que nenhuma localidade foi encontrada e permitir a continuidade da edição.
- RF17: Quando a fonte de localidades estiver indisponível ou devolver uma resposta inválida, o sistema deve apresentar uma mensagem temporária e permitir uma nova tentativa por meio da edição do campo.
- RF18: Ao reduzir a entrada para menos de dois caracteres úteis, o sistema deve limpar as sugestões e os estados associados à busca anterior.
- RF19: O estado de busca de sugestões não deve apagar um resultado meteorológico já exibido; uma nova consulta de clima continuará seguindo as regras do painel existente.

### Acessibilidade do autocomplete

O controle deve comunicar programaticamente a relação entre o campo e a lista e oferecer o mesmo resultado funcional em diferentes formas de interação.

- RF20: O campo deve ser identificado como um controle de autocomplete e comunicar se a lista está aberta, qual lista controla e qual opção está ativa.
- RF21: As sugestões devem ser identificáveis como opções de uma lista, com indicação programática e visual da opção ativa.
- RF22: As teclas de seta devem percorrer as sugestões, Enter deve selecionar a opção ativa, Escape deve fechar a lista e Tab deve preservar a ordem natural de foco.
- RF23: A quantidade de sugestões, o estado sem resultados e as falhas devem ser anunciados de forma não intrusiva às tecnologias assistivas.
- RF24: O foco deve permanecer visível, e nenhuma informação ou ação pode depender exclusivamente de cor, ícone, mouse ou toque.

## Critérios de aceitação

- CA-01 (US1, RF1–RF3): Dado que o campo contém menos de dois caracteres úteis, quando a pessoa digitar, então nenhuma busca deve ser iniciada; ao completar dois caracteres e pausar por 300 milissegundos, a busca deve ocorrer e exibir no máximo oito resultados retornados.
- CA-02 (US1, RF5–RF6): Dada uma entrada com dois caracteres, quando ela não for um nome exato reconhecido pela fonte, então o sistema pode não apresentar resultados; dada uma entrada com três ou mais caracteres, quando houver localidades com esse prefixo independentemente de caixa ou acentuação, então as correspondências devem poder ser sugeridas.
- CA-03 (US2, RF4, RF8): Dadas localidades homônimas em estados ou países diferentes, quando forem retornadas, então cada opção deve identificar cidade, estado e país, e resultados de outros países além do Brasil também devem ser exibidos.
- CA-04 (US3, RF9–RF10, RF13–RF14): Dada uma sugestão visível, quando a pessoa a selecionar, então o campo deve refletir a localidade escolhida, a lista deve fechar e a consulta do clima somente deve começar após a ação explícita de consultar.
- CA-05 (US3, RF12–RF13): Dada uma localidade selecionada, quando a pessoa alterar o texto do campo e tentar consultar sem escolher outra sugestão, então o sistema deve impedir o envio e orientar que uma localidade válida seja selecionada.
- CA-06 (US6, RF7): Dadas duas buscas cujas respostas cheguem fora de ordem, quando o campo já contiver o texto da busca mais recente, então somente as sugestões correspondentes a esse texto devem ser apresentadas.
- CA-07 (US5, RF15): Dada uma busca ainda em andamento, quando a resposta não for imediata, então a pessoa deve perceber que as sugestões estão sendo carregadas sem que o campo fique indisponível para edição.
- CA-08 (US5, RF16): Dada uma entrada válida sem correspondências, quando a busca terminar, então o sistema deve informar que nenhuma localidade foi encontrada e manter o campo editável.
- CA-09 (US5, RF17): Dada uma falha da fonte de localidades, quando a busca terminar, então o sistema deve apresentar uma mensagem temporária, não deve exibir sugestões antigas como atuais e deve permitir nova tentativa.
- CA-10 (RF18): Dadas sugestões abertas, quando a entrada for reduzida a menos de dois caracteres úteis, então a lista e os estados da busca anterior devem desaparecer.
- CA-11 (US4, RF20–RF22): Dadas sugestões abertas e uso exclusivo do teclado, quando a pessoa usar as setas, Enter, Escape e Tab, então deve conseguir percorrer e selecionar opções, fechar a lista e seguir a ordem natural de foco com indicação visível da opção ativa.
- CA-12 (US4, RF20–RF24): Dado o uso de tecnologia assistiva, quando as sugestões e seus estados mudarem, então o campo, a abertura da lista, a opção ativa, a quantidade de resultados e as mensagens relevantes devem ser identificáveis sem depender de pistas visuais.
- CA-13 (Objetivo de desempenho): Dado um conjunto representativo de entradas, conexão normal e dependências disponíveis, quando a latência for medida após a pausa de digitação, então ao menos 95% das buscas devem apresentar sugestões em até 1 segundo.
- CA-14 (Objetivo de responsividade): Dadas larguras de tela de 360 px e 1280 px, quando a lista estiver aberta, então campo, sugestões e estados devem permanecer legíveis e operáveis sem rolagem horizontal causada pelo autocomplete.
- CA-15 (RF19): Dado um resultado meteorológico já exibido, quando a pessoa iniciar ou concluir apenas uma busca de sugestões, então o resultado existente não deve desaparecer nem ser associado à nova entrada antes de uma nova consulta explícita.

## Experiência do usuário

O público principal é qualquer pessoa que consulte o clima de uma cidade, em qualquer país. O fluxo deve favorecer quem não sabe a grafia completa da cidade, precisa diferenciar municípios homônimos ou utiliza teclado, leitor de tela, ampliação ou dispositivo de toque.

Ao focalizar o campo, a pessoa encontrará o mesmo rótulo persistente de cidade. Depois de informar ao menos dois caracteres úteis e pausar brevemente, perceberá o carregamento e, havendo resultados, verá uma lista com até oito opções abaixo do campo. Cada opção mostrará cidade, estado e país. A partir de três caracteres, o comportamento esperado será encontrar nomes por prefixo; com dois caracteres, a fonte só poderá retornar nomes exatos.

A pessoa poderá continuar digitando, tocar ou clicar em uma opção ou percorrer a lista com as setas e confirmar com Enter. Após a seleção, o campo refletirá a localidade escolhida, mas a consulta do clima continuará dependendo do botão existente. Caso o texto seja editado, será necessário selecionar novamente uma sugestão, evitando que uma identidade antiga permaneça associada a um nome novo.

A lista deve acompanhar a largura disponível do campo, limitar sua altura quando necessário e permitir a leitura das opções sem cobrir controles essenciais. O fluxo deverá preservar contraste em nível AA, foco visível, alvos de toque adequados, ordem lógica de navegação e mensagens em português do Brasil. Carregamento, quantidade de resultados, ausência de correspondências e falhas deverão ser comunicados visual e programaticamente, sem mudanças de foco inesperadas.

## Restrições técnicas de alto nível

- A funcionalidade deve preservar a separação existente entre o frontend React e o backend Node.js/Express; o frontend deve consultar somente o backend da aplicação.
- A fonte de localidades deve permanecer a [Geocoding API da Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), já adotada pelo painel, usando seus recursos de busca parcial, filtro de país, idioma e limite de resultados.
- A integração não deve restringir resultados por país; deve solicitar textos em português quando disponíveis e limitar cada resposta a oito localidades.
- A fonte externa somente oferece correspondência exata para dois caracteres e correspondência normalizada por prefixo para três ou mais; a experiência não pode prometer busca parcial fora dessas regras.
- A busca de sugestões deve respeitar os limites de uso vigentes do provedor. O plano gratuito pressupõe uso não comercial, não oferece garantia de disponibilidade e está sujeito aos limites publicados pela Open-Meteo; outro perfil de uso exigirá reavaliação do plano.
- Os dados de localização são fornecidos com base no GeoNames e estão sujeitos à atribuição aplicável. A atribuição já apresentada no painel deve continuar visível e cumprir a [licença da Open-Meteo](https://open-meteo.com/en/licence).
- O nome digitado e a localidade selecionada não devem exigir autenticação nem ser persistidos como histórico do produto.
- A entrada de localidade é um dado público, mas deve ser enviada somente pelo tempo necessário à busca e à consulta meteorológica, seguindo as práticas existentes de privacidade e logging.
- A meta de desempenho do autocomplete é apresentar sugestões em até 1 segundo em pelo menos 95% das buscas válidas, sob conexão normal e com as dependências disponíveis.
- Esta entrega altera a regra anterior que selecionava automaticamente o primeiro resultado da geocodificação: após a implementação deste PRD, a localidade usada na consulta deve ser a opção escolhida pelo usuário.

## Fora do escopo

- Filtro ou seleção manual de país.
- Autocomplete de endereço, rua, bairro, estabelecimento, ponto de interesse ou código postal.
- Geolocalização do navegador, detecção automática da cidade atual, mapas ou seleção por coordenadas.
- Busca tolerante a erros de digitação, correspondência no meio de palavras ou regras próprias de ranqueamento além das oferecidas pela fonte de localidades.
- Paginação, rolagem infinita ou exibição de mais de oito sugestões por busca.
- Criação de uma base própria de municípios, operação offline ou provedor alternativo automático.
- Histórico de buscas, cidades recentes, favoritos, personalização persistente ou contas de usuário.
- Início automático da consulta meteorológica ao selecionar uma sugestão.
- Alterações nos dados meteorológicos exibidos, previsões futuras, alertas, mapas ou demais funcionalidades do painel de clima.
- Contratação, migração ou configuração de um plano comercial da Open-Meteo.
