/* ==========================================================================
   CAVERNA: esta pedra fala com a PokeAPI. Ninguem mais fala.
   Tela nao sabe o que e HTTP; tela so pede bicho e recebe bicho pronto.
   RNF004: PokeAPI e a unica fonte de dado.
   ========================================================================== */

/* CAVERNA: endereco da tribo vizinha. Tudo comeca aqui. */
const BASE_URL = 'https://pokeapi.co/api/v2';

/* CAVERNA: quantos bicho por pagina (RF001 pede lista em blocos). */
const TAMANHO_PAGINA = 20;

/* CAVERNA: memoria curta. Bicho ja pedido nao pede de novo.
   Isso ajuda o RNF003 (resposta rapida) e nao enche a API de pedido. */
const cacheDetalhes = new Map();
let cacheIndice = null; // lista com o nome de TODOS os bichos

/* --------------------------------------------------------------------------
   CAVERNA: o mensageiro. Sai da caverna, busca JSON, volta.
   fetch = pedido HTTP. await = espera o mensageiro voltar.
   Se der ruim, grita erro em portugues (RF007 usa esse grito).
   -------------------------------------------------------------------------- */
async function pedirJSON(url) {
  let resposta;

  try {
    resposta = await fetch(url);
  } catch (erro) {
    // CAVERNA: nem chegou a sair. Sem internet ou servidor mudo (RNF006).
    throw new Error('Não foi possível falar com a PokéAPI. Verifique sua conexão com a internet.');
  }

  // CAVERNA: chegou resposta, mas pode ser resposta ruim. Olha o numero.
  if (resposta.status === 404) {
    throw new Error('Pokémon não encontrado.');
  }
  if (!resposta.ok) {
    throw new Error('A PokéAPI respondeu com erro ' + resposta.status + '. Tente novamente.');
  }

  // CAVERNA: texto JSON vira objeto JavaScript aqui.
  return resposta.json();
}

/* --------------------------------------------------------------------------
   CAVERNA: a API manda MUITA coisa. Tela so precisa de um pouco.
   Aqui o monte de dado bruto vira um bicho simples e ja traduzido.
   -------------------------------------------------------------------------- */
function paraModelo(dadosBrutos) {
  return {
    id: dadosBrutos.id,
    nome: arrumarTexto(dadosBrutos.name),

    // CAVERNA: desenho bonito primeiro; se nao tiver, usa o sprite pequeno.
    imagem:
      (dadosBrutos.sprites.other &&
       dadosBrutos.sprites.other['official-artwork'] &&
       dadosBrutos.sprites.other['official-artwork'].front_default) ||
      dadosBrutos.sprites.front_default ||
      '',

    tipos: dadosBrutos.types.map(t => traduzirTipo(t.type.name)),

    habilidades: dadosBrutos.abilities.map(h => traduzirHabilidade(h.ability.name)),

    // CAVERNA: os seis atributos-base do RF003, ja com nome em portugues.
    atributos: dadosBrutos.stats.map(a => ({
      nome: traduzirAtributo(a.stat.name),
      valor: a.base_stat
    }))
  };
}

/* --------------------------------------------------------------------------
   CAVERNA: pega UM bicho pelo numero ou pelo nome.
   Endpoint: GET /pokemon/{id-ou-nome}
   -------------------------------------------------------------------------- */
async function obterPokemon(idOuNome) {
  const chave = normalizarTexto(idOuNome);

  // CAVERNA: ja tem na memoria? entrega na hora, sem sair da caverna.
  if (cacheDetalhes.has(chave)) {
    return cacheDetalhes.get(chave);
  }

  const dados = await pedirJSON(BASE_URL + '/pokemon/' + chave);
  const pokemon = paraModelo(dados);

  cacheDetalhes.set(chave, pokemon);
  cacheDetalhes.set(String(pokemon.id), pokemon); // guarda tambem pelo numero
  return pokemon;
}

/* --------------------------------------------------------------------------
   CAVERNA: pega uma PAGINA de bicho (RF001).
   Endpoint: GET /pokemon?limit=20&offset=0
   Essa lista so traz nome + link. Tipo e imagem nao vem junto.
   Entao precisa pedir o detalhe de cada um: 1 pedido da lista + 20 detalhes.
   Promise.all faz os 20 ao mesmo tempo, nao um atras do outro.
   -------------------------------------------------------------------------- */
async function listarPagina(pagina) {
  const deslocamento = (pagina - 1) * TAMANHO_PAGINA;

  const lista = await pedirJSON(
    BASE_URL + '/pokemon?limit=' + TAMANHO_PAGINA + '&offset=' + deslocamento
  );

  const itens = await Promise.all(
    lista.results.map(entrada => obterPokemon(entrada.name))
  );

  return {
    itens: itens,
    total: lista.count,
    totalPaginas: Math.ceil(lista.count / TAMANHO_PAGINA)
  };
}

/* --------------------------------------------------------------------------
   CAVERNA: lista com o nome de todo mundo, de uma vez so.
   Serve para buscar por pedaco do nome ("char" acha Charmander).
   Pede UMA vez e guarda; e lista grande, nao pede toda hora.
   -------------------------------------------------------------------------- */
async function obterIndice() {
  if (cacheIndice) {
    return cacheIndice;
  }

  const lista = await pedirJSON(BASE_URL + '/pokemon?limit=100000&offset=0');

  cacheIndice = lista.results.map(entrada => ({
    nome: entrada.name,
    nomeNormalizado: normalizarTexto(entrada.name)
  }));

  return cacheIndice;
}

/* --------------------------------------------------------------------------
   CAVERNA: a caçada do RF002. Aceita numero ou nome, ignora maiuscula e acento.
   -------------------------------------------------------------------------- */
async function buscarPokemons(termo) {
  const alvo = normalizarTexto(termo);

  if (alvo === '') {
    return [];
  }

  // CAVERNA: so numero? entao e busca pelo numero da Pokedex. Um resultado.
  if (/^\d+$/.test(alvo)) {
    const pokemon = await obterPokemon(alvo);
    return [pokemon];
  }

  // CAVERNA: nome (ou pedaco de nome). Filtra no indice, aqui mesmo, sem rede.
  const indice = await obterIndice();
  const achados = indice
    .filter(item => item.nomeNormalizado.includes(alvo))
    .slice(0, TAMANHO_PAGINA); // CAVERNA: no maximo 20, senao vira 500 pedidos

  if (achados.length === 0) {
    return [];
  }

  return Promise.all(achados.map(item => obterPokemon(item.nome)));
}
