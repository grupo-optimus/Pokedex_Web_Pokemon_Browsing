# OptimusDex — Pokédex Web

Uma Pokédex web completa, responsiva e modular, desenvolvida em **HTML5, CSS3 e JavaScript puro**, consumindo a **PokéAPI** como fonte principal de dados.

O projeto foi construído com foco em organização, separação de responsabilidades, reutilização de código, experiência de usuário e funcionamento direto no navegador, sem framework, bundler ou back-end próprio.

> **Projeto do Grupo Optimus**
>
> Integrantes: **Cauê Vergopolan Hanzen · Andre Luis Castelhano · Carlos Henrique da Silva Menger Neto · Pedro Pimentel Perdomo · Guilherme da Cunha Bonetto**

---

## 1. Visão geral

O OptimusDex permite pesquisar e explorar Pokémon, visualizar informações detalhadas, consultar evoluções, analisar vantagens e fraquezas por tipo, favoritar Pokémon e comparar até seis Pokémon ao mesmo tempo.

A aplicação foi dividida em páginas independentes, mas todas compartilham a mesma base de dados, estilo visual e módulos JavaScript.

### Páginas do projeto

| Página | Arquivo | Função |
|---|---|---|
| Pokédex | `index.html` | Lista, busca, filtros e navegação pelos Pokémon |
| Detalhes | `detalhes.html` | Ficha completa de um Pokémon |
| Favoritos | `favoritos.html` | Lista dos Pokémon salvos pelo usuário |
| Comparação | `comparar.html` | Comparação de 2 a 6 Pokémon |
| Sobre | `sobre-projeto.html` | Página institucional do projeto |

---

## 2. Tecnologias utilizadas

- **HTML5** para estrutura e semântica das páginas.
- **CSS3** para layout, responsividade, identidade visual, animações e componentes.
- **JavaScript puro (Vanilla JS)** para toda a lógica da aplicação.
- **Fetch API** para comunicação HTTP.
- **async/await** e `Promise.all()` para operações assíncronas.
- **PokéAPI** como fonte de dados dos Pokémon.
- **MyMemory Translation API** para auxiliar na tradução das descrições/histórias carregadas da PokéAPI.
- **localStorage** para persistência dos favoritos.
- **sessionStorage** para manter o estado temporário da comparação e o último estado da listagem.
- **Google Fonts** para as fontes usadas na identidade visual.

Não existe framework front-end, sistema de build ou dependência de Node necessária para executar a aplicação.

---

## 3. Como executar o projeto

O projeto é uma aplicação estática. Ele deve ser executado por um servidor HTTP local e não diretamente com `file://`.

### VS Code + Live Server

A forma recomendada durante o desenvolvimento é abrir o projeto no VS Code e iniciar o **Live Server**.

Depois, acessar o endereço fornecido pelo Live Server, normalmente algo como:

```text
http://127.0.0.1:5500/
```

### Python

Também é possível iniciar um servidor simples:

```bash
python3 -m http.server 8000
```

Depois:

```text
http://localhost:8000
```

### Node

Outra alternativa:

```bash
npx serve .
```

A aplicação depende de internet para consultar a PokéAPI e para os serviços externos utilizados na tradução e nas fontes. A página de favoritos consegue continuar exibindo os favoritos já salvos porque seus dados ficam armazenados localmente.

---

## 4. Estrutura do projeto

```text
.
├── index.html
├── detalhes.html
├── favoritos.html
├── comparar.html
├── sobre-projeto.html
│
├── css/
│   └── style.css
│
├── img/
│   ├── logo.svg
│   └── pokeicon.png
│
└── js/
    ├── api.js
    ├── comparacao.js
    ├── dados-filtro.js
    ├── favoritos.js
    ├── pagina-comparacao.js
    ├── pagina-detalhes.js
    ├── pagina-favoritos.js
    ├── pagina-lista.js
    ├── traducoes.js
    └── ui.js
```

### Responsabilidade de cada arquivo

#### HTML

- `index.html` — estrutura da Pokédex, busca, filtros, estados da lista, paginação e navegação.
- `detalhes.html` — estrutura da ficha completa do Pokémon.
- `favoritos.html` — estrutura da área de favoritos.
- `comparar.html` — estrutura da tabela de comparação.
- `sobre-projeto.html` — página Sobre o projeto.

#### CSS

- `css/style.css` — tema visual completo, layout, componentes, estados, responsividade, cards, barras de atributos, formas especiais, evolução, comparação, footer e demais elementos da interface.

#### JavaScript

- `js/api.js` — única camada responsável pela comunicação com a PokéAPI e pela transformação dos dados recebidos.
- `js/comparacao.js` — controla a seleção dos Pokémon que serão comparados.
- `js/dados-filtro.js` — armazena tabelas fixas usadas pelo sistema de filtros.
- `js/favoritos.js` — controla o armazenamento dos favoritos.
- `js/pagina-lista.js` — controla a tela principal da Pokédex.
- `js/pagina-detalhes.js` — controla a ficha detalhada do Pokémon.
- `js/pagina-favoritos.js` — controla a tela de favoritos.
- `js/pagina-comparacao.js` — constrói a tabela de comparação.
- `js/traducoes.js` — mantém traduções, normalização e tratamento de textos.
- `js/ui.js` — concentra componentes e comportamentos visuais reutilizáveis.

---

## 5. Arquitetura do projeto

A regra arquitetural mais importante do OptimusDex é:

> **Nenhuma página conversa diretamente com a PokéAPI.**

Toda comunicação externa passa por `js/api.js`.

O fluxo principal é:

```text
HTML
  ↓
Controlador da página
  ↓
Módulos reutilizáveis
  ↓
js/api.js
  ↓
PokéAPI / APIs externas
  ↓
Normalização dos dados
  ↓
Interface
```

Isso evita que a estrutura complexa do JSON da PokéAPI fique espalhada pelos arquivos da interface.

### Por que essa separação foi escolhida?

A resposta original da PokéAPI possui objetos aninhados e muitos campos que a interface não precisa conhecer. Em vez de deixar a tela depender diretamente de estruturas como `types[0].type.name` ou `stats[0].base_stat`, o `api.js` transforma os dados em um modelo simples, usado pelo restante da aplicação.

Exemplo simplificado do modelo interno:

```js
{
  id: 25,
  nome: 'Pikachu',
  imagem: 'https://...',
  imagemShiny: 'https://...',
  tipos: ['Elétrico'],
  habilidades: ['Estática', 'Para-raios'],
  atributos: [
    { nome: 'HP', valor: 35 },
    { nome: 'Ataque', valor: 55 },
    { nome: 'Defesa', valor: 40 },
    { nome: 'Ataque Especial', valor: 50 },
    { nome: 'Defesa Especial', valor: 50 },
    { nome: 'Velocidade', valor: 90 }
  ]
}
```

Esse padrão funciona como uma camada de adaptação entre a API externa e a aplicação.

---

## 6. Integração com a PokéAPI

A base usada pelo projeto é:

```text
https://pokeapi.co/api/v2
```

### Endpoints utilizados

| Endpoint | Uso |
|---|---|
| `/pokemon?limit=20&offset=N` | Paginação da lista principal |
| `/pokemon/{id-ou-nome}` | Dados completos de um Pokémon |
| `/pokemon?limit=100000&offset=0` | Índice de nomes para busca parcial |
| `/pokemon-species/{id-ou-nome}` | Dados da espécie, variedades e evolução |
| `/evolution-chain/{id}` | Cadeia evolutiva completa |
| `/type/{nome}` | Relações entre tipos e filtros por tipo |
| `/generation/{n}` | Pokémon associados a cada região/geração |

A PokéAPI fornece os dados brutos. O projeto faz a adaptação necessária para transformar esses dados em uma experiência de Pokédex em português.

---

## 7. Busca de Pokémon

A busca foi feita para funcionar de forma amigável para o usuário.

### Busca por número

Quando o usuário informa apenas números, a aplicação interpreta o valor como número da Pokédex.

Exemplo:

```text
25 → Pikachu
```

### Busca por nome

Quando o usuário procura texto, o sistema usa o índice de Pokémon carregado pela API e realiza a filtragem no navegador.

Isso permite buscas parciais, por exemplo:

```text
char → Charmander, Charmeleon, Charizard...
```

A busca também normaliza maiúsculas e acentos, de modo que variações como `pokemon`, `Pokémon` e `POKEMON` possam ser tratadas de forma equivalente.

Para impedir que uma busca ampla tente carregar centenas de Pokémon de uma vez, a lista de resultados é limitada antes da obtenção dos detalhes.

---

## 8. Paginação

A tela principal trabalha com **20 Pokémon por página**.

A paginação é controlada pelo `pagina-lista.js` e os dados são fornecidos pelo `api.js`.

A aplicação apresenta:

- página atual;
- quantidade total de páginas;
- botão anterior;
- botão próxima;
- estado desabilitado quando não há página anterior ou seguinte.

A URL também preserva o estado da listagem. Assim, filtros, página atual e outros parâmetros relevantes podem continuar representados no endereço.

---

## 9. Sistema de filtros

A Pokédex possui filtros combináveis.

### Filtro por tipo

Os 18 tipos de Pokémon são disponibilizados na interface em português.

É possível combinar vários tipos. Quando mais de um tipo é selecionado, o sistema cruza os conjuntos para encontrar Pokémon que correspondam às condições selecionadas.

### Filtro por região

As gerações principais são apresentadas pelas regiões correspondentes:

| Geração | Região |
|---|---|
| 1 | Kanto |
| 2 | Johto |
| 3 | Hoenn |
| 4 | Sinnoh |
| 5 | Unova |
| 6 | Kalos |
| 7 | Alola |
| 8 | Galar |
| 9 | Paldea |

### Filtro por categoria

Também existem categorias especiais:

- Lendários
- Míticos
- Mega
- Gigantamax

### Combinação dos filtros

Cada filtro é transformado em um conjunto de IDs. Depois, os conjuntos são cruzados para obter apenas os Pokémon que atendem simultaneamente aos filtros escolhidos.

Exemplo:

```text
Fogo + Voador
        ↓
Pokémon que pertencem aos dois tipos
```

### Regra para Mega e Gigantamax

Mega Evoluções e Gigantamax são formas alternativas cadastradas separadamente na PokéAPI e não pertencem diretamente a uma região como uma entrada comum da Pokédex.

Por isso, quando Mega ou Gigantamax é selecionado, o filtro de região é removido automaticamente para evitar uma combinação incompatível.

---

## 10. Cards de Pokémon

Os cards são construídos dinamicamente pelo JavaScript através das funções reutilizáveis de `ui.js`.

Cada card apresenta, de forma compacta:

- número da Pokédex;
- nome do Pokémon;
- imagem;
- tipos;
- identificação visual dos tipos;
- botão de favorito;
- botão de comparação.

O card funciona como porta de entrada para a tela de detalhes.

### Interações visuais

Os cards possuem estados de hover, destaque de tipos, controles de favorito e comparação e transições visuais integradas ao tema da aplicação. A identidade visual prioriza a estética de uma Pokédex clássica sem depender de um framework de componentes.

---

## 11. Favoritos

O usuário pode favoritar Pokémon tanto nos cards quanto na tela de detalhes.

### Como funciona

Os favoritos são salvos no:

```js
localStorage
```

A aplicação serializa os dados com `JSON.stringify()` e recupera os dados com `JSON.parse()`.

### Características

- favoritos sobrevivem ao fechamento do navegador;
- não exigem login;
- não dependem de banco de dados;
- a tela de favoritos pode exibir os dados salvos sem nova requisição para cada Pokémon;
- o usuário pode remover Pokémon dos favoritos;
- existe busca dentro dos favoritos por nome ou número.

O estado vazio também é tratado com uma mensagem específica quando nenhum favorito foi salvo.

---

## 12. Sistema de comparação

O OptimusDex possui uma área dedicada para comparar Pokémon.

### Limite

É possível selecionar de **2 a 6 Pokémon**.

### Onde adicionar

O Pokémon pode ser adicionado à comparação através dos cards e da tela de detalhes.

O cabeçalho mantém a contagem atual, por exemplo:

```text
Comparar (3/6)
```

### Persistência da seleção

A seleção usa `sessionStorage` para atravessar as páginas durante a sessão atual.

Isso evita colocar uma quantidade grande de IDs diretamente na URL e permite que a seleção continue disponível ao navegar entre a lista, detalhes e comparação.

### O que é comparado

A comparação utiliza os seis atributos-base:

- HP
- Ataque
- Defesa
- Ataque Especial
- Defesa Especial
- Velocidade

Para cada atributo:

- maior valor recebe destaque de melhor;
- menor valor recebe destaque de menor;
- valores iguais são tratados como empate.

### Melhor Pokémon geral

Além da comparação atributo por atributo, a tela calcula o **total dos seis atributos-base** de cada Pokémon.

O Pokémon ou Pokémon com maior soma recebem destaque geral de **MELHOR**.

A tabela também possui uma linha específica para o total.

---

## 13. Tela de detalhes

A página `detalhes.html` é a ficha completa do Pokémon.

Nela são apresentados diversos blocos de informação.

### Identidade

- nome;
- número da Pokédex;
- imagem oficial;
- botão de shiny;
- favorito;
- comparação.

### Shiny

O botão **Ver shiny** troca a imagem normal pela imagem shiny quando a PokéAPI possui essa informação.

O sistema também lida com Pokémon que não possuem um sprite shiny disponível, mantendo a imagem normal em vez de quebrar o visor.

Além do visor principal, a alternância de shiny também é aplicada aos sprites mostrados na linha evolutiva.

### História

A aplicação busca a descrição da espécie na PokéAPI e apresenta uma versão traduzida para português.

O fluxo é:

```text
Pokémon
  ↓
Pokémon Species
  ↓
Flavor Text em inglês
  ↓
serviço de tradução
  ↓
texto normalizado em português
  ↓
interface
```

Como a PokéAPI não fornece diretamente todas as descrições necessárias em português, o projeto utiliza um serviço externo de tradução para essa etapa.

### Tipos

Mostra os tipos do Pokémon em português, com identificação visual por tipo.

### Habilidades

Apresenta as habilidades conhecidas, utilizando o dicionário local de tradução e um fallback para nomes ainda não mapeados.

---

## 14. Vantagens, resistências, fraquezas e imunidades

A tela de detalhes calcula as relações defensivas do Pokémon a partir de seus tipos.

São apresentados quatro grupos:

- **Super efetivo contra** — tipos que os ataques dos tipos do Pokémon podem atingir com vantagem;
- **Resistências** — tipos de ataques que causam menos dano;
- **Fraquezas** — tipos de ataques que causam mais dano;
- **Imunidades** — tipos de ataques que não causam dano.

### Como o cálculo funciona

Para cada tipo defensivo do Pokémon, o sistema consulta as relações da PokéAPI.

Depois, multiplica os modificadores quando o Pokémon possui dois tipos.

Exemplo conceitual:

```text
multiplicador inicial = 1x
        ↓
primeiro tipo defensivo
        ↓
segundo tipo defensivo
        ↓
resultado final
```

As relações são armazenadas em cache para evitar pedidos repetidos.

---

## 15. Linha evolutiva

A linha evolutiva é um dos recursos mais importantes da tela de detalhes.

O projeto consulta a espécie do Pokémon, localiza sua cadeia de evolução e organiza os estágios de evolução na interface.

### Organização

A linha apresenta os Pokémon-base em seus estágios correspondentes.

Dentro de cada estágio, as formas alternativas relacionadas àquela espécie podem aparecer juntamente com o Pokémon-base.

Essa decisão resolve o problema de Pokémon que possuem muitas formas sem destruir a estrutura da linha evolutiva.

### Formas especiais

A aplicação trabalha com a informação de `varieties` da espécie na PokéAPI. Assim, a implementação não fica limitada apenas a Mega e Gigantamax.

Ela consegue lidar com variedades adicionais cadastradas pela API, incluindo, por exemplo:

- Mega Evoluções;
- Gigantamax;
- formas regionais;
- formas alternativas;
- formas especiais de batalha/origem;
- outras variedades cadastradas para a espécie.

### Identificação visual

Mega e Gigantamax recebem identificação específica quando a forma pode ser reconhecida pelo registro da PokéAPI.

Exemplos de rótulos usados na interface:

```text
MEGA
MEGA X
MEGA Y
GIGANTAMAX
```

O layout foi pensado para comportar espécies com grande quantidade de variedades, evitando que uma espécie como Eevee faça a ficha quebrar ou fique visualmente desorganizada.

---

## 16. Atributos-base

Os seis atributos-base são exibidos em uma tabela com:

- nome do atributo;
- valor numérico;
- barra visual proporcional ao valor.

Os seis atributos são:

```text
HP
Ataque
Defesa
Ataque Especial
Defesa Especial
Velocidade
```

### Total dos atributos

Além da tabela, a tela soma os seis valores e apresenta:

```text
Total dos atributos: XXXXX
```

Esse total também é utilizado no sistema de comparação para determinar o melhor valor geral entre os Pokémon selecionados.

---

## 17. Tradução e localização

O arquivo `js/traducoes.js` concentra a lógica de tradução e normalização de termos.

### Tipos

Os 18 tipos possuem tradução para português.

### Atributos

Os seis atributos também são mapeados para português.

### Habilidades

As habilidades mais comuns possuem tradução definida localmente. Quando uma habilidade ainda não está no dicionário, o sistema utiliza um fallback para transformar o nome técnico da API em um texto mais legível.

### Normalização

A busca utiliza normalização de texto para eliminar diferenças de:

- maiúsculas/minúsculas;
- acentuação;
- espaços desnecessários.

---

## 18. Cache e desempenho

A aplicação utiliza cache em memória para reduzir chamadas repetidas à rede.

### Caches principais

`js/api.js` mantém estruturas para guardar informações já carregadas, incluindo:

- detalhes dos Pokémon;
- linhas evolutivas;
- histórias;
- formas alternativas;
- relações de tipos;
- índice completo usado pela busca.

### Cache de detalhes

O detalhe de um Pokémon é armazenado por nome e também por número.

Assim, consultas repetidas ao mesmo Pokémon podem ser atendidas diretamente pela memória.

### Cache da evolução

Uma linha evolutiva já montada não precisa ser reconstruída toda vez que o usuário abre novamente aquele Pokémon.

### Cache das formas

As variedades da mesma espécie também ficam armazenadas para reduzir pedidos repetidos.

### Cache das relações de tipos

As informações retornadas pelo endpoint `/type/{nome}` são reutilizadas nos cálculos defensivos.

### Requisições paralelas

Sempre que vários recursos independentes precisam ser carregados, a aplicação usa `Promise.all()`.

Isso é utilizado, por exemplo, para carregar vários Pokémon da mesma página simultaneamente e para buscar várias formas de uma espécie em paralelo.

---

## 19. Estados de interface

As páginas foram estruturadas para tratar estados diferentes em vez de assumir que os dados sempre chegarão corretamente.

### Estados utilizados

| Estado | Função |
|---|---|
| Carregando | Indica que uma operação de rede está acontecendo |
| Pronto | Mostra os dados carregados |
| Vazio | Mostra que a operação funcionou, mas não encontrou conteúdo |
| Erro | Mostra falha de rede ou resposta inválida |

### Tentar novamente

Quando uma operação da PokéAPI falha, a tela grava a última ação que precisava ser executada.

O botão **Tentar novamente** executa essa mesma ação novamente sem exigir que o usuário refaça manualmente a operação.

Um Pokémon inexistente (`404`) é tratado como conteúdo não encontrado, não como pane geral da aplicação.

---

## 20. Voltar para a lista mantendo o estado

Um problema importante em aplicações de Pokédex é o retorno da tela de detalhes para a lista.

O usuário pode estar, por exemplo, em:

```text
Página 3
Filtro: Fogo
Busca: char
```

Ao entrar nos detalhes de um Pokémon, o retorno deve preservar esse contexto.

Por isso, a aplicação registra o último estado da lista no `sessionStorage` e também representa o estado relevante na URL.

Exemplo conceitual:

```text
index.html?tipo=fogo&pagina=3
```

Assim, a navegação consegue retornar ao contexto correto em vez de simplesmente reiniciar a Pokédex na página inicial.

---

## 21. Identidade visual

O projeto utiliza uma identidade visual inspirada na estética dos jogos clássicos de Pokémon, especialmente na linguagem visual de **FireRed / LeafGreen**, adaptada para um tema escuro moderno.

### Características visuais

- fundo escuro;
- painéis com bordas pixeladas;
- fontes com aparência de jogos antigos;
- placas coloridas para tipos;
- botões com leitura clara;
- bordas e sombras inspiradas em interfaces de GBA;
- animações e efeitos leves;
- destaque visual para estados importantes;
- layout responsivo.

O CSS foi organizado por seções para facilitar manutenção sem alterar as regras visuais já existentes.

---

## 22. Responsividade

A aplicação foi construída para funcionar em diferentes larguras de tela.

A estrutura da ficha de detalhes usa duas áreas principais no desktop e se reorganiza em telas menores.

Elementos como:

- cards;
- linha evolutiva;
- tabela de comparação;
- filtros;
- navegação;
- footer;

possuem regras específicas para evitar overflow e preservar a legibilidade.

A tabela de comparação também possui uma área de rolagem horizontal para permitir comparar vários Pokémon sem deformar toda a página.

---

## 23. Rodapé e navegação

O footer é compartilhado visualmente pelo projeto e organiza os principais caminhos da aplicação.

Na área de projeto, a navegação inclui:

1. Sobre o projeto
2. Pokédex
3. Favoritos
4. Comparar

Também existem links externos para:

- repositório oficial no GitHub;
- portfólio / outros projetos do Grupo Optimus.

---

## 24. Página “Sobre o projeto”

O projeto possui uma página dedicada em:

```text
sobre-projeto.html
```

Ela faz parte da navegação global e serve como espaço reservado para apresentação institucional e documentação do projeto.

---

## 25. Persistência de dados

O sistema utiliza duas formas principais de armazenamento do navegador.

### `localStorage`

Usado para informações que devem sobreviver ao fechamento do navegador.

Principal exemplo:

```text
Favoritos
```

### `sessionStorage`

Usado para informações temporárias durante a sessão atual.

Principais exemplos:

```text
Estado da comparação
Último estado da lista
```

Essa separação foi escolhida de propósito: favoritos são persistentes, enquanto o contexto de navegação e a seleção de comparação têm duração de sessão.

---

## 26. Segurança e cuidados com dados externos

O projeto utiliza informações vindas de APIs públicas, então os dados externos não são inseridos diretamente como HTML bruto quando isso poderia representar risco.

Os elementos da interface são criados pelo JavaScript usando APIs do DOM, como `document.createElement()` e `textContent`.

Também não existe chave secreta no código, porque a PokéAPI não exige autenticação.

A regra adotada é simples:

> **Credenciais secretas nunca devem ser colocadas em código JavaScript enviado ao navegador.**

---

## 27. Tratamento de erros HTTP

A camada `api.js` distingue problemas diferentes.

### Falha de rede

Quando o `fetch()` não consegue completar a comunicação, a aplicação informa que não foi possível falar com o serviço.

### `404`

Quando o servidor responde que o Pokémon não existe, a aplicação trata como resultado não encontrado.

### Outros erros HTTP

Respostas fora da faixa esperada geram erro para que a tela possa apresentar o estado de falha e oferecer uma nova tentativa.

Esse cuidado impede que uma resposta inesperada da API quebre silenciosamente a interface.

---

## 28. Fluxo completo de uma consulta

Um exemplo típico do funcionamento interno é:

```text
Usuário pesquisa "pikachu"
        ↓
index.html captura o formulário
        ↓
pagina-lista.js interpreta a ação
        ↓
api.js recebe a solicitação
        ↓
normalização do termo
        ↓
consulta /pokemon/{nome}
        ↓
PokéAPI responde em JSON
        ↓
paraModelo() simplifica e traduz os dados
        ↓
cacheDetalhes guarda o resultado
        ↓
pagina-lista.js recebe o modelo
        ↓
ui.js monta o card
        ↓
HTML é atualizado
```

---

## 29. Fluxo completo da tela de detalhes

```text
detalhes.html?id=25
        ↓
pagina-detalhes.js lê o ID
        ↓
api.js obtém o Pokémon
        ↓
modelo normalizado
        ↓
------------------------------------
| imagem / nome / número            |
| shiny                             |
| favorito                          |
| comparação                        |
| história                          |
| tipos                             |
| habilidades                      |
| eficácia de tipos                 |
| evolução                          |
| formas especiais                  |
| atributos                         |
| total dos atributos               |
------------------------------------
        ↓
interface final
```

A linha evolutiva e a história podem ser carregadas depois do conteúdo principal para que a ficha não fique bloqueada aguardando todas as consultas extras.

---

## 30. Decisões importantes de projeto

### Sem framework

A aplicação foi construída em JavaScript puro para manter o projeto didático, transparente e fácil de acompanhar em um contexto acadêmico.

### API isolada

Somente `api.js` conhece a estrutura HTTP da PokéAPI.

### Modelo de dados próprio

A interface trabalha com um modelo menor e previsível em vez do JSON inteiro da API.

### Reutilização

Cards, placas de tipo, botões de favorito, comparação, links e elementos recorrentes são concentrados em módulos compartilhados.

### Cache

Chamadas repetidas são evitadas sempre que o dado já está disponível na memória.

### Estados explícitos

Carregando, vazio, erro e pronto são tratados separadamente para melhorar a experiência do usuário.

### Persistência adequada

`localStorage` fica responsável pelos favoritos e `sessionStorage` pelos estados temporários.

### URL representando o estado da lista

Busca, filtros e paginação podem ser refletidos na URL, melhorando a navegação e o retorno para o contexto anterior.

---

## 31. Requisitos funcionais atendidos

| Requisito | Implementação |
|---|---|
| Listar Pokémon | Paginação na tela inicial |
| Buscar Pokémon | Busca por número, nome e trecho do nome |
| Visualizar detalhes | Tela dedicada por Pokémon |
| Favoritar | Cards + detalhes + localStorage |
| Visualizar favoritos | Página de favoritos |
| Comparar | Até 6 Pokémon |
| Filtrar | Tipo, região, lendários, míticos, Mega e Gigantamax |
| Evolução | Consulta da cadeia evolutiva |
| Formas especiais | Variedades da espécie exibidas junto ao estágio correspondente |
| Shiny | Alternância do sprite |
| História | Descrição traduzida |
| Eficácia de tipos | Super efetivo, resistência, fraqueza e imunidade |
| Atributos | 6 atributos-base + barras |
| Total de atributos | Soma dos 6 atributos |
| Tentar novamente | Reexecução da última ação que falhou |

---

## 32. Requisitos não funcionais e decisões de qualidade

O projeto também foi estruturado para atender preocupações de qualidade além das funcionalidades.

### Desempenho

- carregamento paralelo com `Promise.all()`;
- cache em memória;
- limite de resultados de busca;
- reaproveitamento de dados já obtidos.

### Manutenibilidade

- responsabilidades separadas por arquivo;
- API isolada;
- funções reutilizáveis;
- dados de filtro separados da lógica de tela;
- traduções centralizadas.

### Responsividade

- layout fluido;
- adaptação para telas menores;
- tabela de comparação com rolagem horizontal;
- linha evolutiva preparada para múltiplas formas.

### Experiência do usuário

- estados de carregamento;
- estados vazios;
- mensagens de erro;
- botão de tentativa novamente;
- retorno preservando contexto;
- favoritos persistentes;
- limite visual claro de comparação.

---

## 33. Limitações conhecidas

Algumas características dependem de limitações ou da própria estrutura da PokéAPI e de serviços externos.

### Sprites

O tema prioriza determinados sprites de jogos clássicos quando disponíveis. Para Pokémon de gerações mais novas, o sistema utiliza sprites disponíveis na própria PokéAPI.

### Tradução das habilidades

A PokéAPI não oferece um catálogo completo de habilidades em português. Por isso, o projeto possui um dicionário local para as habilidades conhecidas e um fallback para as restantes.

### História traduzida

A tradução das descrições depende de um serviço externo. Caso esse serviço esteja indisponível, a seção pode apresentar erro sem impedir o restante da ficha de funcionar.

### Cache

O cache principal de API vive na memória da aba. Ao recarregar a página, ele é perdido e novas requisições podem ser feitas.

### Índice de busca

A busca parcial usa um índice completo dos Pokémon. A primeira consulta é mais pesada porque precisa carregar esse índice, que depois fica em cache durante a sessão da página.

### Categorias lendário/mítico

As categorias usam listas fixas de IDs no arquivo `dados-filtro.js` para evitar fazer mais de mil consultas individuais à `pokemon-species` a cada uso do filtro.

---

## 34. Organização da evolução e das formas

Uma das partes mais trabalhosas do projeto foi tratar corretamente a diferença entre:

```text
Espécie / estágio evolutivo
        ↓
Pokémon-base
        ↓
Formas alternativas daquela espécie
```

Em vez de colocar cada Mega, Gigantamax ou outra variedade como uma nova etapa de evolução, a aplicação mantém a linha evolutiva baseada na espécie e coloca as formas alternativas no mesmo estágio.

Essa estratégia permite que uma espécie com muitas variedades continue visualmente compreensível e evita que a linha evolutiva seja inflada artificialmente.

---

## 35. Caso especial: Pokémon com muitas formas

A arquitetura foi preparada para lidar com espécies que possuem várias variedades.

Isso foi especialmente importante ao trabalhar com Pokémon como **Eevee (#133)**, cuja quantidade de possibilidades relacionadas à família evolutiva e variedades pode tornar uma apresentação simples muito extensa.

A solução adotada foi:

1. manter a evolução organizada por estágios;
2. identificar a espécie-base;
3. buscar suas variedades pela PokéAPI;
4. adicionar as formas alternativas ao mesmo estágio;
5. usar um layout flexível no CSS;
6. identificar visualmente as formas especiais quando aplicável.

---

## 36. O que não faz parte da versão atual

A versão atual do projeto **não utiliza o sistema de seleção de gerações/jogos que foi estudado durante o desenvolvimento e posteriormente descartado**.

O filtro de região existente utiliza as gerações da PokéAPI como referência de região, e as categorias Mega/Gigantamax permanecem separadas como formas alternativas.

Isso evita misturar na interface uma implementação que não faz parte da versão final adotada pelo projeto.

---

## 37. Evolução do projeto

O OptimusDex foi desenvolvido de forma incremental.

A construção passou por etapas como:

```text
Projeto inicial
   ↓
Integração com PokéAPI
   ↓
Listagem e busca
   ↓
Filtros e paginação
   ↓
Tela de detalhes
   ↓
Favoritos
   ↓
Comparação
   ↓
Linha evolutiva
   ↓
Formas especiais
   ↓
Shiny e história
   ↓
Eficácia de tipos
   ↓
Atributos e total
   ↓
Aprimoramentos visuais
   ↓
Responsividade e navegação
   ↓
Organização final
```

Durante esse processo, funcionalidades que não atendiam ao resultado desejado foram descartadas e a arquitetura foi mantida modular para permitir novas mudanças sem transformar um arquivo em dependência de toda a aplicação.

---

## 38. Manutenção futura

Por seguir uma arquitetura modular, novas funcionalidades podem ser adicionadas sem concentrar tudo em um único arquivo.

Exemplos de áreas de expansão:

- mais traduções;
- novos filtros;
- novas informações da espécie;
- novos recursos de comparação;
- melhorias de acessibilidade;
- melhorias de cache;
- novas animações e interações visuais.

A recomendação é manter a regra central do projeto: **dados externos em `api.js`, regras de negócio nos módulos apropriados e manipulação visual nas páginas/UI.**

---

## 39. Créditos e referências

### PokéAPI

Fonte dos dados de Pokémon:

https://pokeapi.co/

### Grupo Optimus

Portfólio e outros projetos:

https://grupo-optimus.github.io/

### Repositório

Código-fonte do projeto:

https://github.com/grupo-optimus/Pokedex_Web_Pokemon_Browsing

---

## 40. Resumo técnico

O OptimusDex é uma SPA-like aplicação web estática, dividida em páginas, construída sem framework e organizada em módulos JavaScript.

O núcleo da arquitetura é:

```text
HTML + CSS + JavaScript
          ↓
      Módulos da UI
          ↓
     Controladores
          ↓
        api.js
          ↓
      PokéAPI / APIs externas
```

E o núcleo da experiência é:

```text
Explorar
   +
Pesquisar
   +
Filtrar
   +
Ver detalhes
   +
Descobrir evolução e formas
   +
Analisar tipos e atributos
   +
Favoritar
   +
Comparar até 6 Pokémon
```

O resultado é uma Pokédex completa, modular, responsiva e voltada tanto para a experiência de usuário quanto para a aplicação prática de conceitos de desenvolvimento front-end, consumo de APIs, armazenamento no navegador, tratamento de estados, organização de código e arquitetura de software.
