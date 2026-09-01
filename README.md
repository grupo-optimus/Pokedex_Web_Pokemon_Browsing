# PokéLista — Projeto 01

Front-end em HTML + JavaScript puro (sem framework, sem build, sem dependência) que consome a
[PokéAPI](https://pokeapi.co/) para listar, buscar, detalhar e favoritar Pokémons.

**Integrantes:** Cauê Vergopolan Hanzen · Andre Luis Castelhano · Carlos Henrique da Silva Menger Neto · Pedro Pimentel Perdomo · Guilherme da Cunha Bonetto

---

## 1. Como rodar

O projeto é estático, mas **não abra pelo `file://`** — o navegador bloqueia requisições de rede
vindas de arquivo local. Suba um servidor simples na pasta do projeto:

```bash
# Python (já vem instalado na maioria das máquinas)
python3 -m http.server 8000

# ou Node
npx serve .
```

Depois abra `http://localhost:8000`.

Requer internet (RNF006), exceto a tela de favoritos, que funciona offline.

---

## 2. Estrutura dos arquivos

```
.
├── index.html              Tela 1 — lista + busca
├── detalhes.html           Tela 2 — detalhes de um Pokémon
├── favoritos.html          Tela 3 — favoritos salvos
├── css/
│   └── style.css           Tema visual (FireRed/LeafGreen em modo escuro)
└── js/
    ├── traducoes.js        Dicionários PT-BR + normalização de texto
    ├── dados-filtro.js     Tabelas fixas do filtro (regiões, categorias, lendários)
    ├── api.js              ÚNICA camada que fala com a PokéAPI
    ├── favoritos.js        Persistência local (localStorage)
    ├── ui.js               Pedaços de tela reutilizados (card, formatação)
    ├── pagina-lista.js     Controlador da tela 1
    ├── pagina-detalhes.js  Controlador da tela 2
    └── pagina-favoritos.js Controlador da tela 3
```

A regra de organização é simples: **nenhuma tela chama a rede diretamente.** Toda comunicação
externa passa por [js/api.js](js/api.js). Se a PokéAPI mudar de endereço ou de formato amanhã,
só esse arquivo precisa mudar.

---

## 3. O que é uma API?

**API** = *Application Programming Interface* (Interface de Programação de Aplicações).

É um **contrato**: um jeito combinado de um programa pedir dados ou ações para outro programa,
sem precisar saber como o outro funciona por dentro.

Analogia: um restaurante. Você (o front-end) não entra na cozinha. Você fala com o garçom pelo
cardápio (a API), pede "prato 27", e recebe o prato pronto. Como a cozinha preparou, com qual
fogão, com qual banco de dados — não é problema seu. O cardápio é o contrato.

### API Web / REST

A PokéAPI é uma **API REST sobre HTTP**. Isso significa que:

- Cada informação tem um **endereço (URL)**, chamado de *endpoint*.
  Ex.: `https://pokeapi.co/api/v2/pokemon/25` é o "endereço do Pikachu".
- Você faz um **pedido (request)** com um **método HTTP**:
  - `GET` — buscar dados (é o único que usamos aqui)
  - `POST` — criar, `PUT`/`PATCH` — atualizar, `DELETE` — apagar
- O servidor devolve uma **resposta (response)** com:
  - um **status code** (número que diz o que aconteceu)
  - um **corpo (body)**, quase sempre em **JSON**

### Status codes que importam para nós

| Faixa | Significado | Exemplo |
|---|---|---|
| `2xx` | Deu certo | `200 OK` |
| `4xx` | Erro **de quem pediu** | `404 Not Found` — Pokémon não existe |
| `5xx` | Erro **do servidor** | `500`, `503` — PokéAPI fora do ar |

### O que é JSON

**JSON** (*JavaScript Object Notation*) é o formato de texto em que os dados trafegam.
A resposta de `GET /pokemon/25` chega mais ou menos assim (bem resumida):

```json
{
  "id": 25,
  "name": "pikachu",
  "types": [ { "type": { "name": "electric" } } ],
  "abilities": [ { "ability": { "name": "static" } } ],
  "stats": [ { "base_stat": 35, "stat": { "name": "hp" } } ],
  "sprites": { "other": { "official-artwork": { "front_default": "https://..." } } }
}
```

É **texto**. O `response.json()` converte esse texto em objeto JavaScript de verdade,
que aí sim pode ser lido com `dados.name`, `dados.stats[0].base_stat` etc.

---

## 4. Como funciona a integração no navegador

### `fetch` + `async/await`

Pedido de rede é **lento** (dezenas ou centenas de milissegundos). Se o JavaScript ficasse
parado esperando, a página congelaria. Por isso a chamada é **assíncrona**: ela devolve na hora
uma *Promise* ("promessa de que o valor chega depois"), e a página continua funcionando.

O `async/await` é o açúcar sintático que deixa código assíncrono com cara de código normal:

```js
async function pedirJSON(url) {
  const resposta = await fetch(url);   // espera aqui, sem travar a página
  return resposta.json();              // converte o texto JSON em objeto
}
```

- `async` marca a função como assíncrona (ela sempre devolve uma Promise).
- `await` pausa **só aquela função** até a Promise resolver.

### Tratamento de erro — os dois tipos

Ponto que costuma confundir: **`fetch` só rejeita se o pedido nem saiu** (sem internet, DNS
quebrado, servidor mudo). Se o servidor responde `404` ou `500`, o `fetch` considera **sucesso** —
ele conseguiu falar com o servidor, a resposta é que foi ruim. Por isso são duas verificações:

```js
let resposta;
try {
  resposta = await fetch(url);
} catch (erro) {
  // 1) nem chegou a sair: falha de rede
  throw new Error('Não foi possível falar com a PokéAPI. Verifique sua conexão.');
}

// 2) saiu e voltou, mas voltou ruim
if (resposta.status === 404) throw new Error('Pokémon não encontrado.');
if (!resposta.ok) throw new Error('A PokéAPI respondeu com erro ' + resposta.status);
```

Esse erro sobe até o controlador da tela, que mostra a mensagem e o botão "Tentar novamente"
(**RF007**).

### CORS

Por segurança, o navegador só deixa uma página buscar dados de outro domínio se o servidor
autorizar, via cabeçalho `Access-Control-Allow-Origin`. A PokéAPI é pública e libera para todo
mundo, então funciona direto. É por isso, também, que abrir com `file://` não funciona: a origem
`null` não é aceita.

### Chave de API

A PokéAPI **não exige chave nem cadastro** — por isso não há segredo nenhum neste projeto.
Vale registrar a regra geral: **chave de API nunca vai em front-end**, porque todo o código-fonte
é visível para o usuário. Quando uma API exige chave, o pedido tem que sair de um back-end seu.

### Uso justo (fair use)

A PokéAPI pede que os dados sejam cacheados e que não se faça carga desnecessária. Nosso cache
(seção 6) atende a isso.

---

## 5. Os endpoints usados

Base: `https://pokeapi.co/api/v2`

| # | Endpoint | Para quê | Requisito |
|---|---|---|---|
| 1 | `GET /pokemon?limit=20&offset=N` | Uma página da lista | RF001 |
| 2 | `GET /pokemon/{id-ou-nome}` | Dados completos de um Pokémon | RF001, RF002, RF003 |
| 3 | `GET /pokemon?limit=100000&offset=0` | Índice com todos os nomes, para busca parcial | RF002 |
| 4 | `GET /pokemon-species/{id-ou-nome}` | Em qual cadeia de evolução o Pokémon está | Linha evolutiva |
| 5 | `GET /evolution-chain/{id}` | A cadeia inteira (o endereço vem do endpoint 4) | Linha evolutiva |
| 6 | `GET /type/{nome}` | Todo mundo de um tipo | Filtro |
| 7 | `GET /generation/{n}` | Todo mundo de uma região | Filtro |

### O detalhe importante: a lista vem "magra"

O endpoint 1 devolve **apenas nome e URL** de cada Pokémon:

```json
{ "count": 1302, "results": [ { "name": "bulbasaur", "url": "https://.../pokemon/1/" } ] }
```

Não vem imagem nem tipo — e o RF001 exige os dois no card. Então, para montar uma página,
são necessários **1 pedido da lista + 20 pedidos de detalhe**. Isso se chama **problema N+1**.

A solução aqui é disparar os 20 **em paralelo**, não um esperando o outro:

```js
const itens = await Promise.all(
  lista.results.map(entrada => obterPokemon(entrada.name))
);
```

`Promise.all` dispara todos de uma vez e só resolve quando o último chega. Em série, 20 pedidos
de ~100 ms levariam ~2 s; em paralelo, levam pouco mais que o mais lento deles. É o que sustenta
o **RNF003** (resultado em até 2 s).

---

## 6. Cache — pedir o mínimo possível

Dois caches em [js/api.js](js/api.js):

| Cache | O que guarda | Por quê |
|---|---|---|
| `cacheDetalhes` (`Map`) | Cada Pokémon já buscado, indexado por nome **e** por número | Voltar da tela de detalhes para a lista não refaz 20 pedidos |
| `cacheIndice` | A lista completa de nomes | É uma resposta grande; buscar duas vezes seria desperdício |

```js
async function obterPokemon(idOuNome) {
  const chave = normalizarTexto(idOuNome);
  if (cacheDetalhes.has(chave)) return cacheDetalhes.get(chave);   // já tenho, não peço
  const dados = await pedirJSON(BASE_URL + '/pokemon/' + chave);
  const pokemon = paraModelo(dados);
  cacheDetalhes.set(chave, pokemon);
  cacheDetalhes.set(String(pokemon.id), pokemon);
  return pokemon;
}
```

O cache vive na memória da aba: recarregar a página o zera. Os **favoritos**, esses sim, são
persistentes (seção 8).

---

## 7. Normalização — traduzindo a API para a nossa aplicação

A resposta da PokéAPI é enorme e aninhada (`stats[0].stat.name`, `types[1].type.name`...).
Deixar isso vazar para dentro das telas é ruim: qualquer mudança na API quebraria tudo.

Por isso existe `paraModelo()`, que converte o dado bruto num objeto simples **e já traduzido**:

```js
{
  id: 25,
  nome: 'Pikachu',
  imagem: 'https://...png',
  tipos: ['Elétrico'],
  habilidades: ['Estática', 'Para-raios'],
  atributos: [ { nome: 'HP', valor: 35 }, ... ]
}
```

Esse é o **único formato** que as telas conhecem. Esse padrão tem nome: *Adapter* / *Anti-Corruption Layer*.

### Tradução (RNF005)

A PokéAPI tem nomes traduzidos em vários idiomas, mas **não em português**. Por isso a tradução
é feita por dicionário local em [js/traducoes.js](js/traducoes.js):

- os **18 tipos** e os **6 atributos** estão todos mapeados;
- as **habilidades** são centenas — as mais comuns estão mapeadas, e o que não estiver cai num
  *fallback* que ao menos formata o nome (`solar-power` → `Solar Power`).

### Busca sem acento e sem maiúscula (RF002)

```js
function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')                  // separa a letra do acento: "é" -> "e" + "´"
    .replace(/[\u0300-\u036f]/g, '')   // joga os acentos fora
    .trim();
}
```

Assim `"Pokémon"`, `"pokemon"` e `"POKÉMON"` viram todos `"pokemon"` e casam entre si.

### Como a busca decide o que fazer

```js
if (/^\d+$/.test(alvo)) {
  return [ await obterPokemon(alvo) ];        // só dígitos -> busca pelo número da Pokédex
}
const indice = await obterIndice();           // senão -> filtra o índice de nomes localmente
const achados = indice.filter(i => i.nomeNormalizado.includes(alvo)).slice(0, 20);
```

O filtro por nome é feito **no navegador**, sobre o índice já baixado. Vantagem: aceita busca
parcial (`"char"` acha Charmander, Charmeleon, Charizard), coisa que a API não oferece.
O `.slice(0, 20)` é um freio: sem ele, buscar `"a"` dispararia centenas de pedidos.

---

## 8. Persistência dos favoritos (RF005 / RNF001)

Favoritos ficam no **`localStorage`** do navegador — armazenamento local, por domínio, sem
tamanho fixo garantido (~5 MB na prática), que **sobrevive a fechar o navegador**. Não há login
nem back-end.

`localStorage` só guarda **texto**, então:

```js
localStorage.setItem(CHAVE, JSON.stringify(lista));   // objeto -> texto
JSON.parse(localStorage.getItem(CHAVE));              // texto  -> objeto
```

Guardamos o **objeto inteiro** (imagem, tipos, atributos), não só o id — é o que a **HU03** pede.
Consequência prática: a tela de favoritos **não faz nenhuma chamada de rede** e funciona offline.

Toda leitura está dentro de `try/catch`, porque o `localStorage` pode falhar (modo privado,
navegador bloqueando armazenamento, JSON corrompido). Na dúvida, devolve lista vazia — melhor
uma lista vazia do que uma tela quebrada.

### O outro armazenamento: `sessionStorage` e o botão Voltar

O estado da lista (busca, filtros, página) vive na **URL** — `index.html?q=charizard`,
`index.html?categoria=mitico&pagina=2`. A cada mudança, `sincronizarURL()` reescreve o endereço
com `history.replaceState` e anota esse endereço no **`sessionStorage`**.

O botão **Voltar** da tela de detalhes lê essa anotação e vai direto para lá. Não usamos apenas
`history.back()` porque `back()` depende de quem está atrás no histórico: se a pessoa pulou de um
Pokémon para outro pela linha evolutiva, o "atrás" é outro Pokémon, e não a lista. Quando a lista
*é* mesmo a tela anterior, aí sim usamos `back()`, que devolve a posição da rolagem de graça.

Diferença dos favoritos: `sessionStorage` morre ao fechar a aba, que é exatamente o tempo de vida
que essa informação precisa ter.

---

## 9. Estados de tela

Cada tela tem estados mutuamente exclusivos, controlados pelo atributo `hidden`:

| Estado | Quando |
|---|---|
| `carregando` | Pedido em andamento |
| `pronto` | Dados na tela |
| `vazio` | Deu certo, mas não veio nada (busca sem resultado / nenhum favorito) |
| `erro` | Falha de rede ou status ruim — mostra mensagem + "Tentar novamente" (RF007) |

O botão "Tentar novamente" guarda a **última ação** que falhou e a repete:

```js
let ultimaAcao = null;
async function carregarPagina(pagina) {
  ultimaAcao = () => carregarPagina(pagina);   // guarda como refazer
  ...
}
botaoTentar.addEventListener('click', () => { if (ultimaAcao) ultimaAcao(); });
```

Detalhe de UX: um número que não existe (`999999`) volta `404`. Isso é "não encontrado", não é
falha da API — então cai no estado `vazio`, não no `erro`.

---

## 10. Rastreabilidade dos requisitos

| ID | Onde está implementado |
|---|---|
| RF001 | `listarPagina()` em [js/api.js](js/api.js) + paginação em [js/pagina-lista.js](js/pagina-lista.js) |
| RF002 | `buscarPokemons()` + `normalizarTexto()` |
| RF003 | `paraModelo()` + tabela de atributos em [js/pagina-detalhes.js](js/pagina-detalhes.js) |
| RF004 | `alternarFavorito()` — botão em detalhes, estrelinha no canto do card e botão remover nos favoritos |
| RF005 | `localStorage` em [js/favoritos.js](js/favoritos.js) |
| RF006 | `#estado-vazio` em [favoritos.html](favoritos.html) |
| RF007 | `pedirJSON()` + estado `erro` + botão "Tentar novamente" |
| RNF001 | `localStorage`, sem login |
| RNF002 | `meta viewport`, HTML fluido, sem largura fixa |
| RNF003 | `Promise.all` + cache em memória |
| RNF004 | PokéAPI como fonte única, isolada em [js/api.js](js/api.js) |
| RNF005 | Dicionários em [js/traducoes.js](js/traducoes.js) |
| RNF006 | Mensagem de erro de conexão em `pedirJSON()` |

---

## 11. Limitações conhecidas

- **Sprite de geração nova destoa.** O tema usa o sprite dos próprios jogos FireRed/LeafGreen,
  que só existe até o #386. Do #387 em diante cai no sprite padrão da PokéAPI (a ordem de escolha
  está em `escolherImagem()`, em [js/api.js](js/api.js)).
- **As duas fontes vêm do Google Fonts.** Sem internet, o navegador troca pelas fontes de sistema
  e o layout continua funcionando, só perde o desenho pixelado.
- **A lista de lendários e míticos está fixa no código.** A PokéAPI só informa
  `is_legendary` dentro de `/pokemon-species/{id}`, um pedido POR Pokémon — montar a lista
  inteira custaria mais de mil requisições a cada clique no filtro. Então os **números** ficam
  em [js/dados-filtro.js](js/dados-filtro.js) e o dado de cada Pokémon (nome, sprite, tipo)
  continua vindo todo da API. Se sair uma geração nova, é lá que se acrescenta.
- **Mega e Gigantamax não combinam com região.** São formas alternativas, cadastradas com
  número acima de 10000, e nenhuma delas aparece na lista de uma geração. A tela desmarca a
  região sozinha quando você escolhe uma dessas categorias, e avisa o porquê.
- **A linha evolutiva custa pedidos extras.** São duas requisições (espécie + cadeia) mais uma
  por Pokémon da cadeia. Tudo cacheado em `cacheEvolucao`, mas a seção aparece alguns instantes
  depois do resto da ficha.
- **Nem todo Pokémon tem sprite shiny cadastrado.** Quando falta, o botão "Ver shiny" mantém o
  desenho normal em vez de deixar o visor vazio.
- **Tradução de habilidades é parcial** — a PokéAPI não fornece PT-BR, então o dicionário cobre as
  mais comuns e o resto cai no *fallback*.
- **Busca depende de baixar o índice completo** na primeira vez (uma resposta grande, cacheada
  depois).
- O cache é por aba: recarregar a página refaz os pedidos.
