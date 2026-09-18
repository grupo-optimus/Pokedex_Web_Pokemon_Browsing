/* ==========================================================================
   A Pokedex. As telas pedem Pokemon aqui e recebem Pokemon pronto.
   Os dados moram em dados-pokemon.js; nada sai do navegador.

   As funcoes continuam async de proposito: a tela nao precisa saber de onde
   o dado vem. Se um dia a fonte mudar, so este arquivo muda.
   ========================================================================== */

/* Quantos Pokemon por pagina (RF001 pede lista em blocos). */
const TAMANHO_PAGINA = 20;

/* A ordem em que os seis atributos-base aparecem na tela (RF003). */
const NOMES_ATRIBUTOS = [
  ['hp', 'HP'],
  ['ataque', 'Ataque'],
  ['defesa', 'Defesa'],
  ['ataqueEspecial', 'Ataque Especial'],
  ['defesaEspecial', 'Defesa Especial'],
  ['velocidade', 'Velocidade']
];

/* --------------------------------------------------------------------------
   O registro de dados-pokemon.js vira o Pokemon que as telas usam.
   Sprite e numero andam juntos: img/pokemon/25.png e o Pikachu.
   -------------------------------------------------------------------------- */
function paraModelo(registro) {
  return {
    id: registro.id,
    chave: registro.chave,
    nome: registro.nome,

    imagem: 'img/pokemon/' + registro.id + '.png',
    imagemShiny: 'img/pokemon/shiny/' + registro.id + '.png',

    // As chaves em ingles ficam para a conta de efetividade e para o filtro;
    // a tela recebe a versao em portugues no campo tipos.
    tiposIngles: registro.tipos.slice(),
    tipos: registro.tipos.map(traduzirTipo),

    habilidades: registro.habilidades.slice(),

    atributos: NOMES_ATRIBUTOS.map(([campo, nome]) => ({
      nome: nome,
      valor: registro.atributos[campo]
    })),

    // Calculados somente na tela de detalhes.
    vantagens: [],
    fraquezas: [],
    imunidades: [],
    superEficazContra: []
  };
}

/* Montado uma vez so, ja em ordem de numero. */
const TODOS_OS_POKEMONS = POKEMONS
  .slice()
  .sort((a, b) => a.id - b.id)
  .map(paraModelo);

function registroDe(pokemon) {
  return POKEMONS.find(registro => registro.id === pokemon.id);
}

/* --------------------------------------------------------------------------
   Pega UM Pokemon pelo numero ou pelo nome.
   "004" (como aparece na Pokedex) e "4" dao no mesmo Pokemon.
   -------------------------------------------------------------------------- */
async function obterPokemon(idOuNome) {
  const chave = normalizarTexto(idOuNome);

  const pokemon = /^\d+$/.test(chave)
    ? TODOS_OS_POKEMONS.find(p => p.id === Number(chave))
    : TODOS_OS_POKEMONS.find(p => p.chave === chave || normalizarTexto(p.nome) === chave);

  if (!pokemon) {
    throw new Error('Pokémon não encontrado.');
  }

  return pokemon;
}

/* Uma PAGINA da Pokedex (RF001). */
async function listarPagina(pagina) {
  const inicio = (pagina - 1) * TAMANHO_PAGINA;
  const total = TODOS_OS_POKEMONS.length;

  return {
    itens: TODOS_OS_POKEMONS.slice(inicio, inicio + TAMANHO_PAGINA),
    total: total,
    totalPaginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA))
  };
}

/* --------------------------------------------------------------------------
   A busca do RF002. Aceita numero ou pedaco do nome ("char" acha
   Charmander), ignorando maiuscula e acento.
   -------------------------------------------------------------------------- */
async function buscarPokemons(termo) {
  const alvo = normalizarTexto(termo);

  if (alvo === '') {
    return [];
  }

  // So numero? entao e busca pelo numero da Pokedex. Um resultado.
  if (/^\d+$/.test(alvo)) {
    return [await obterPokemon(alvo)];
  }

  return TODOS_OS_POKEMONS
    .filter(p => normalizarTexto(p.nome).includes(alvo))
    .slice(0, TAMANHO_PAGINA);
}

async function obterVariosPokemons(numeros) {
  return Promise.all(numeros.map(id => obterPokemon(id)));
}

/* --------------------------------------------------------------------------
   HISTORIA / ENTRADA DA POKEDEX. Ja vem escrita em portugues.
   -------------------------------------------------------------------------- */
async function obterHistoriaPokemon(idOuNome) {
  const pokemon = await obterPokemon(idOuNome);
  return registroDe(pokemon).historia || '';
}

/* --------------------------------------------------------------------------
   EFETIVIDADE DE TIPOS
   Para cada tipo que poderia atacar o Pokemon, multiplica a efetividade
   contra todos os tipos dele. Ex.: Grama/Venenoso leva 2x de Fogo, porque
   Fogo e 2x contra Grama e 1x contra Venenoso.
   2x = fraqueza, 0.5x = resistencia, 0x = imunidade.
   -------------------------------------------------------------------------- */
function efetividadeContra(tipoAtacante, tipoDefensor) {
  const linha = EFETIVIDADE[tipoAtacante] || {};
  return tipoDefensor in linha ? linha[tipoDefensor] : 1;
}

async function obterVantagensEFraquezas(pokemon) {
  // Na mesma ordem dos chips de filtro (TIPOS_PT).
  const todosOsTipos = Object.keys(TIPOS_PT).filter(tipo => tipo in EFETIVIDADE);
  const tiposDoPokemon = pokemon.tiposIngles;

  const multiplicadores = todosOsTipos.map(tipoAtacante => ({
    tipo: tipoAtacante,
    multiplicador: tiposDoPokemon.reduce(
      (total, tipoDefensor) => total * efetividadeContra(tipoAtacante, tipoDefensor), 1
    )
  }));

  const nomesDosTipos = lista => lista.map(item => traduzirTipo(item.tipo));

  return {
    vantagens: nomesDosTipos(multiplicadores.filter(m => m.multiplicador > 0 && m.multiplicador < 1)),
    fraquezas: nomesDosTipos(multiplicadores.filter(m => m.multiplicador > 1)),
    imunidades: nomesDosTipos(multiplicadores.filter(m => m.multiplicador === 0)),
    superEficazContra: todosOsTipos
      .filter(alvo => tiposDoPokemon.some(tipo => efetividadeContra(tipo, alvo) === 2))
      .map(traduzirTipo)
  };
}

/* --------------------------------------------------------------------------
   A linha evolutiva:

     estagios   os Pokemon da mesma familia, agrupados por estagio.
     variacoes  Mega, Gigantamax, regionais e afins. Nenhuma cadastrada.
     requisitos o que fazer para chegar em cada Pokemon, pela chave dele.

   So entra quem esta em dados-pokemon.js.
   -------------------------------------------------------------------------- */
async function obterLinhaEvolutiva(idOuNome) {
  const pokemon = await obterPokemon(idOuNome);
  const familia = registroDe(pokemon).familia;

  const membros = POKEMONS
    .filter(registro => registro.familia === familia)
    .sort((a, b) => a.estagio - b.estagio || a.id - b.id);

  const estagios = [];
  const requisitos = {};
  let estagioAnterior = null;

  membros.forEach(function (registro) {
    const modelo = TODOS_OS_POKEMONS.find(p => p.id === registro.id);

    if (registro.estagio === estagioAnterior) {
      estagios[estagios.length - 1].push(modelo);
    } else {
      estagios.push([modelo]);
      estagioAnterior = registro.estagio;
    }

    if (registro.requisito) requisitos[registro.chave] = registro.requisito;
  });

  return { estagios, variacoes: [], requisitos };
}

/* ==========================================================================
   FILTROS
   Cada filtro devolve um CONJUNTO DE NUMEROS (Set de id). Numero e a
   moeda comum: dai da pra cruzar filtro com filtro so vendo quem esta nos dois.
   ========================================================================== */

function idsOnde(condicao) {
  return new Set(TODOS_OS_POKEMONS.filter(condicao).map(p => p.id));
}

/* Regiao = faixa de numeros da Pokedex Nacional (dados-filtro.js). */
function idsPorRegiao(geracao) {
  const regiao = REGIOES.find(r => r.geracao === geracao);
  if (!regiao) return new Set();
  return idsOnde(p => p.id >= regiao.primeiro && p.id <= regiao.ultimo);
}

/* --------------------------------------------------------------------------
   Junta tudo. Filtro escolhido vira conjunto; conjuntos se cruzam.
   Escolher "Fogo" + "Voador" devolve so quem e as duas coisas.
   Devolve a lista de numero JA ORDENADA — a tela pagina em cima dela.
   Sem nenhum filtro marcado, devolve null (= mostra a Pokedex normal).
   -------------------------------------------------------------------------- */
async function filtrarPokemons(filtros) {
  const conjuntos = [];

  (filtros.tipos || []).forEach(tipo => conjuntos.push(idsOnde(p => p.tiposIngles.includes(tipo))));

  if (filtros.regiao) conjuntos.push(idsPorRegiao(filtros.regiao));

  if (filtros.categoria === 'lendario') conjuntos.push(new Set(IDS_LENDARIOS));
  if (filtros.categoria === 'mitico')   conjuntos.push(new Set(IDS_MITICOS));
  if (filtros.categoria === 'mega')     conjuntos.push(idsOnde(p => p.chave.includes('-mega')));
  if (filtros.categoria === 'gmax')     conjuntos.push(idsOnde(p => p.chave.includes('-gmax')));

  if (conjuntos.length === 0) {
    return null;
  }

  let numeros = Array.from(conjuntos[0]);
  for (let i = 1; i < conjuntos.length; i++) {
    numeros = numeros.filter(id => conjuntos[i].has(id));
  }

  // Lendarios e miticos vem de uma lista de numeros; so fica quem existe aqui.
  return numeros
    .filter(id => TODOS_OS_POKEMONS.some(p => p.id === id))
    .sort((a, b) => a - b);
}
