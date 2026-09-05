/* ==========================================================================
   Este arquivo fala com a PokeAPI. Nenhum outro fala.
   Tela nao sabe o que e HTTP; tela so pede Pokemon e recebe Pokemon pronto.
   RNF004: PokeAPI e a unica fonte de dado.
   ========================================================================== */

/* Endereco base da PokeAPI. Tudo comeca aqui. */
const BASE_URL = 'https://pokeapi.co/api/v2';

/* Quantos Pokemon por pagina (RF001 pede lista em blocos). */
const TAMANHO_PAGINA = 20;

/* Memoria curta. Pokemon ja pedido nao pede de novo.
   Isso ajuda o RNF003 (resposta rapida) e nao sobrecarrega a API de pedidos. */
const cacheDetalhes = new Map();
const cacheEvolucao = new Map(); // Linha evolutiva ja montada, por especie
<<<<<<< HEAD
=======
const cacheHistoria = new Map(); // História em inglês da espécie
>>>>>>> gui
const cacheFormasEspeciais = new Map(); // Mega/Gigantamax por especie-base
const cacheRelacoesTipo = new Map(); // Relacoes ofensivas/defensivas por tipo
let cacheIndice = null; // Lista com o nome de TODOS os Pokemon

/* --------------------------------------------------------------------------
   A requisicao. Sai daqui, busca o JSON, volta.
   fetch = pedido HTTP. await = espera a resposta chegar.
   Se der ruim, lanca um erro em portugues (o RF007 mostra essa mensagem).
   -------------------------------------------------------------------------- */
async function pedirJSON(url) {
  let resposta;

  try {
    resposta = await fetch(url);
  } catch (erro) {
    // Nem chegou a sair. Sem internet ou servidor mudo (RNF006).
    throw new Error('Não foi possível falar com a PokéAPI. Verifique sua conexão com a internet.');
  }

  // Chegou resposta, mas pode ser resposta ruim. Olha o numero.
  if (resposta.status === 404) {
    throw new Error('Pokémon não encontrado.');
  }
  if (!resposta.ok) {
    throw new Error('A PokéAPI respondeu com erro ' + resposta.status + '. Tente novamente.');
  }

  // Texto JSON vira objeto JavaScript aqui.
  return resposta.json();
}

/* --------------------------------------------------------------------------
   Qual desenho do Pokemon a tela mostra.
   O tema do site e FireRed/LeafGreen, entao o sprite DAQUELES jogos vem primeiro.
   Pokemon de geracao nova nao existia la: cai no sprite comum e, no pior caso,
   no desenho grande moderno. Quer o desenho grande de volta em todo mundo?
   Inverta a ordem do return: desenhoGrande primeiro.
   -------------------------------------------------------------------------- */
function escolherImagem(sprites, shiny) {
  const versoes  = sprites.versions || {};
  const geracao3 = versoes['generation-iii'] || {};
  const frlg     = geracao3['firered-leafgreen'] || {};
  const arte     = (sprites.other && sprites.other['official-artwork']) || {};

  // Shiny e o Pokemon de cor trocada. Mesma ordem, outra prateleira.
  if (shiny) {
    return frlg.front_shiny || sprites.front_shiny || arte.front_shiny || '';
  }

  return frlg.front_default || sprites.front_default || arte.front_default || '';
}

/* --------------------------------------------------------------------------
   A API manda MUITA coisa. Tela so precisa de um pouco.
   Aqui o dado bruto vira um Pokemon simples e ja traduzido.
   -------------------------------------------------------------------------- */
function paraModelo(dadosBrutos) {
  return {
    id: dadosBrutos.id,
    nomeApi: dadosBrutos.name,
    nomeEspecie: dadosBrutos.species && dadosBrutos.species.name ? dadosBrutos.species.name : '',
    nome: arrumarTexto(dadosBrutos.name),

    imagem: escolherImagem(dadosBrutos.sprites, false),
    imagemShiny: escolherImagem(dadosBrutos.sprites, true),

    // Guarda os nomes da API em ingles para calculos de efetividade; a tela
    // recebe a versao em portugues no campo tipos.
    tiposIngles: dadosBrutos.types.map(t => t.type.name),
    tipos: dadosBrutos.types.map(t => traduzirTipo(t.type.name)),

    habilidades: dadosBrutos.abilities.map(h => traduzirHabilidade(h.ability.name)),

    // Os seis atributos-base do RF003, ja com nome em portugues.
    atributos: dadosBrutos.stats.map(a => ({
      nome: traduzirAtributo(a.stat.name),
      valor: a.base_stat
    })),

    // Calculados somente na tela de detalhes, para nao adicionar
    // requisicoes extras a cada card da listagem.
    vantagens: [],
    fraquezas: [],
    imunidades: [],
    superEficazContra: []
  };
}

/* --------------------------------------------------------------------------
   EFETIVIDADE DE TIPOS
   Para cada tipo que poderia atacar o Pokemon, multiplica a relacao contra
   todos os tipos defensivos dele. Ex.: Agua/Fogo leva 2x de Eletrico?
   A conta final vem da multiplicacao das duas tabelas.
   2x = fraqueza, 0.5x = vantagem/resistencia, 0x = imunidade.
   -------------------------------------------------------------------------- */
async function obterRelacoesTipo(tipoIngles) {
  if (cacheRelacoesTipo.has(tipoIngles)) {
    return cacheRelacoesTipo.get(tipoIngles);
  }

  const dados = await pedirJSON(BASE_URL + '/type/' + tipoIngles);
  const relacoes = {
    fraco: new Set(dados.damage_relations.double_damage_from.map(item => item.name)),
    resistente: new Set(dados.damage_relations.half_damage_from.map(item => item.name)),
    imune: new Set(dados.damage_relations.no_damage_from.map(item => item.name)),
    superEficazContra: new Set(dados.damage_relations.double_damage_to.map(item => item.name))
  };

  cacheRelacoesTipo.set(tipoIngles, relacoes);
  return relacoes;
}

async function calcularVantagensEFraquezas(tiposIngles) {
  const todosOsTipos = Object.keys(TIPOS_PT)
    .filter(tipo => tipo !== 'unknown' && tipo !== 'stellar');

  const relacoesDefensivas = await Promise.all(
    tiposIngles.map(tipo => obterRelacoesTipo(tipo))
  );

  const multiplicadores = todosOsTipos.map(tipoAtacante => {
    let multiplicador = 1;

    relacoesDefensivas.forEach(relacao => {
      if (relacao.imune.has(tipoAtacante)) multiplicador *= 0;
      else if (relacao.fraco.has(tipoAtacante)) multiplicador *= 2;
      else if (relacao.resistente.has(tipoAtacante)) multiplicador *= 0.5;
    });

    return { tipo: tipoAtacante, multiplicador };
  });

  const tiposSuperEficazes = new Set();

  relacoesDefensivas.forEach(relacao => {
    relacao.superEficazContra.forEach(tipoAlvo => {
      if (todosOsTipos.includes(tipoAlvo)) {
        tiposSuperEficazes.add(tipoAlvo);
      }
    });
  });

  return {
    vantagens: multiplicadores
      .filter(item => item.multiplicador > 0 && item.multiplicador < 1)
      .map(item => traduzirTipo(item.tipo)),
    fraquezas: multiplicadores
      .filter(item => item.multiplicador > 1)
      .map(item => traduzirTipo(item.tipo)),
    imunidades: multiplicadores
      .filter(item => item.multiplicador === 0)
      .map(item => traduzirTipo(item.tipo)),
    superEficazContra: todosOsTipos
      .filter(tipo => tiposSuperEficazes.has(tipo))
      .map(tipo => traduzirTipo(tipo))
  };
}

async function obterVantagensEFraquezas(pokemon) {
  return calcularVantagensEFraquezas(pokemon.tiposIngles);
}

/* --------------------------------------------------------------------------
   Pega UM Pokemon pelo numero ou pelo nome.
   Endpoint: GET /pokemon/{id-ou-nome}
   -------------------------------------------------------------------------- */
<<<<<<< HEAD
async function obterPokemon(idOuNome) {
    let chave = normalizarTexto(idOuNome);

=======

/* --------------------------------------------------------------------------
   HISTÓRIA / ENTRADA DA POKÉDEX
   Busca a espécie separadamente porque /pokemon/{id} não traz as entradas de
   texto da Pokédex. A primeira entrada em inglês é guardada em cache.
   -------------------------------------------------------------------------- */
async function obterHistoriaPokemon(idOuNome) {
  let chave = normalizarTexto(idOuNome);

  if (/^\d+$/.test(chave)) {
    chave = String(Number(chave));
  }

  if (cacheHistoria.has(chave)) {
    return cacheHistoria.get(chave);
  }

  const pokemon = await obterPokemon(chave);
  const nomeEspecie = pokemon.nomeEspecie || chave;
  const dados = await pedirJSON(BASE_URL + '/pokemon-species/' + nomeEspecie);

  const entradasIngles = (dados.flavor_text_entries || []).filter(function (entrada) {
    return entrada.language && entrada.language.name === 'en';
  });

  if (entradasIngles.length === 0) {
    throw new Error('Este Pokémon não possui história em inglês na PokéAPI.');
  }

  // A mesma entrada pode aparecer em várias versões. Escolhe a mais recente.
  const entrada = entradasIngles[entradasIngles.length - 1];
  const historia = String(entrada.flavor_text || '')
    .replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  cacheHistoria.set(chave, historia);
  cacheHistoria.set(nomeEspecie, historia);
  cacheHistoria.set(String(pokemon.id), historia);

  return historia;
}

async function obterPokemon(idOuNome) {
    let chave = normalizarTexto(idOuNome);

>>>>>>> gui
  // A PokeAPI nao aceita zero a esquerda no numero (/pokemon/001 da 404).
  // "004" (como aparece na Pokedex) precisa virar "4" antes de montar a URL.
  if (/^\d+$/.test(chave)) {
    chave = String(Number(chave));
  }
  
  // Ja esta em memoria? entrega na hora, sem ir na rede.
  if (cacheDetalhes.has(chave)) {
    return cacheDetalhes.get(chave);
  }

  const dados = await pedirJSON(BASE_URL + '/pokemon/' + chave);
  const pokemon = paraModelo(dados);

  cacheDetalhes.set(chave, pokemon);
  cacheDetalhes.set(String(pokemon.id), pokemon); // Guarda tambem pelo numero
  return pokemon;
}

/* --------------------------------------------------------------------------
   Pega uma PAGINA de Pokemon (RF001).
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
   Lista com o nome de todo mundo, de uma vez so.
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
    nomeNormalizado: normalizarTexto(entrada.name),
    id: numeroDaURL(entrada.url)   // O filtro trabalha com numero
  }));

  return cacheIndice;
}

/* --------------------------------------------------------------------------
   A busca do RF002. Aceita numero ou nome, ignora maiuscula e acento.
   -------------------------------------------------------------------------- */
async function buscarPokemons(termo) {
  const alvo = normalizarTexto(termo);

  if (alvo === '') {
    return [];
  }

  // So numero? entao e busca pelo numero da Pokedex. Um resultado.
  if (/^\d+$/.test(alvo)) {
    const pokemon = await obterPokemon(alvo);
    return [pokemon];
  }

  // Nome (ou pedaco de nome). Filtra no indice, aqui mesmo, sem rede.
  const indice = await obterIndice();
  const achados = indice
    .filter(item => item.nomeNormalizado.includes(alvo))
    .slice(0, TAMANHO_PAGINA); // No maximo 20, senao vira 500 pedidos

  if (achados.length === 0) {
    return [];
  }

  return Promise.all(achados.map(item => obterPokemon(item.nome)));
}

/* --------------------------------------------------------------------------
   O nome da especie quase sempre serve de nome do Pokemon.
   Quando nao serve (a especie "wormadam" so existe como "wormadam-plant"),
   pergunta a propria especie qual e a forma padrao dela.
   Se nem assim achar, devolve null e o andar da evolucao segue sem esse.
   -------------------------------------------------------------------------- */
async function pokemonDaEspecie(nomeEspecie) {
  try {
    return await obterPokemon(nomeEspecie);
  } catch (erro) {
    // Nome de especie que nao vira Pokemon. Vai pro plano B.
  }

  try {
    const especie = await pedirJSON(BASE_URL + '/pokemon-species/' + nomeEspecie);
    const variedades = Array.isArray(especie.varieties) ? especie.varieties : [];
    const padrao = variedades.find(forma => forma.is_default);
    return padrao ? await obterPokemon(padrao.pokemon.name) : null;
  } catch (erro) {
    return null;
  }
}

/* --------------------------------------------------------------------------
   FORMAS ALTERNATIVAS DA ESPECIE

   A PokéAPI guarda as formas na lista "varieties" da espécie. Isso inclui
   muito mais do que Mega e Gigantamax: formas Primal, Ash-Greninja, regionais
   (Alola/Galar/Hisui/Paldea), formas de batalha, de origem, especiais etc.

   A regra aqui é simples: a variedade padrão representa o Pokemon-base; toda
   outra variedade da mesma espécie entra no mesmo estágio da evolução.
   -------------------------------------------------------------------------- */
async function obterFormasEspeciais(pokemon) {
  const base = pokemon.nomeEspecie || '';

  if (!base) return [];

  if (cacheFormasEspeciais.has(base)) {
    return cacheFormasEspeciais.get(base);
  }

  try {
    const especie = await pedirJSON(BASE_URL + '/pokemon-species/' + base);
    const variedades = Array.isArray(especie.varieties) ? especie.varieties : [];

    const nomesFormas = variedades
      .filter(variedade => !variedade.is_default)
      .map(variedade => variedade.pokemon && variedade.pokemon.name)
      .filter(Boolean);

    const formas = await Promise.all(nomesFormas.map(nome => obterPokemon(nome)));
    const unicas = [];
    const ids = new Set([pokemon.id]);

    formas.filter(Boolean).forEach(function (forma) {
      if (!ids.has(forma.id)) {
        ids.add(forma.id);
        unicas.push(forma);
      }
    });

    cacheFormasEspeciais.set(base, unicas);
    return unicas;
  } catch (erro) {
    console.error('Erro ao carregar formas alternativas de ' + base, erro);
    cacheFormasEspeciais.set(base, []);
    return [];
  }
}

/* --------------------------------------------------------------------------
   A linha evolutiva. A cadeia normal continua sendo montada por especie.
   Mega/Gmax entram como formas alternativas no mesmo estagio da especie-base.
   -------------------------------------------------------------------------- */
async function obterLinhaEvolutiva(idOuNome) {
  let chave = normalizarTexto(idOuNome);

  // Descobrimos a especie real a partir do registro do Pokemon. Isso funciona
  // para qualquer forma cadastrada pela PokéAPI, sem depender de regex no nome.
  try {
    const pokemonInformado = await obterPokemon(chave);
    if (pokemonInformado.nomeEspecie) {
      chave = pokemonInformado.nomeEspecie;
    }
  } catch (erro) {
    // Se o valor recebido já for o nome de uma especie valida, o pedido abaixo
    // continua funcionando normalmente.
  }

  if (cacheEvolucao.has(chave)) {
    return cacheEvolucao.get(chave);
  }

  const especie = await pedirJSON(BASE_URL + '/pokemon-species/' + chave);

  if (!especie.evolution_chain || !especie.evolution_chain.url) {
    const base = await pokemonDaEspecie(chave);
    const formasEspeciais = base ? await obterFormasEspeciais(base) : [];
    const linha = base ? [[base, ...formasEspeciais.filter(forma => forma.id !== base.id)]] : [];
    cacheEvolucao.set(chave, linha);
    return linha;
  }

  const cadeia = await pedirJSON(especie.evolution_chain.url);

  const andares = [];
  let atual = [cadeia.chain];

  while (atual.length > 0) {
    andares.push(atual.map(no => no.species.name));
    atual = atual.flatMap(no => no.evolves_to);
  }

  const linha = [];

  for (const nomes of andares) {
    const resultados = await Promise.all(nomes.map(pokemonDaEspecie));
    const achados = resultados.filter(item => item !== null);
    if (achados.length === 0) continue;

    const andar = [];

    for (const pokemon of achados) {
      if (!andar.some(item => item.id === pokemon.id)) {
        andar.push(pokemon);
      }

      const formasEspeciais = await obterFormasEspeciais(pokemon);
      formasEspeciais.forEach(function (forma) {
        if (!andar.some(item => item.id === forma.id)) {
          andar.push(forma);
        }
      });
    }

    if (andar.length > 0) linha.push(andar);
  }

  cacheEvolucao.set(chave, linha);
  return linha;
}

/* ==========================================================================
   FILTROS
   cada filtro devolve um CONJUNTO DE NUMEROS (Set de id). Numero e a
   moeda comum: dai da pra cruzar filtro com filtro so vendo quem esta nos dois.
   ========================================================================== */

/* A API devolve link, nao numero. ".../pokemon/25/" vira 25. */
function numeroDaURL(url) {
  const pedacos = String(url).split('/').filter(Boolean);
  return Number(pedacos[pedacos.length - 1]);
}

/* Todo mundo de um tipo. Endpoint: GET /type/{nome-em-ingles} */
async function idsPorTipo(tipoIngles) {
  const dados = await pedirJSON(BASE_URL + '/type/' + tipoIngles);
  return new Set(dados.pokemon.map(item => numeroDaURL(item.pokemon.url)));
}

/* Todo mundo de uma regiao. Endpoint: GET /generation/{numero} */
async function idsPorRegiao(geracao) {
  const dados = await pedirJSON(BASE_URL + '/generation/' + geracao);
  return new Set(dados.pokemon_species.map(item => numeroDaURL(item.url)));
}

/* Mega e gmax sao Pokemon separado no cadastro, com sufixo no nome.
   Nao precisa de pedido novo: o indice ja esta na memoria. */
async function idsPorForma(sufixo) {
  const indice = await obterIndice();
  return new Set(
    indice.filter(item => item.nome.includes(sufixo)).map(item => item.id)
  );
}

/* --------------------------------------------------------------------------
   Junta tudo. Filtro escolhido vira conjunto; conjuntos se cruzam.
   Escolher "Fogo" + "Voador" devolve so quem e as duas coisas (Charizard).
   Devolve a lista de numero JA ORDENADA — a tela pagina em cima dela.
   Sem nenhum filtro marcado, devolve null (= mostra a Pokedex normal).
   -------------------------------------------------------------------------- */
async function filtrarPokemons(filtros) {
  const pedidos = [];

  (filtros.tipos || []).forEach(tipo => pedidos.push(idsPorTipo(tipo)));

  if (filtros.regiao) {
    pedidos.push(idsPorRegiao(filtros.regiao));
  }

  if (filtros.categoria === 'lendario') pedidos.push(Promise.resolve(new Set(IDS_LENDARIOS)));
  if (filtros.categoria === 'mitico')   pedidos.push(Promise.resolve(new Set(IDS_MITICOS)));
  if (filtros.categoria === 'mega')     pedidos.push(idsPorForma('-mega'));
  if (filtros.categoria === 'gmax')     pedidos.push(idsPorForma('-gmax'));

  if (pedidos.length === 0) {
    return null;
  }

  // Todos os pedidos saem juntos, nao um esperando o outro.
  const conjuntos = await Promise.all(pedidos);

  let numeros = Array.from(conjuntos[0]);
  for (let i = 1; i < conjuntos.length; i++) {
    numeros = numeros.filter(id => conjuntos[i].has(id));
  }

  return numeros.sort((a, b) => a - b);
}

/* Pega um pedaco da lista filtrada e traz o Pokemon inteiro de cada um. */
async function obterVariosPokemons(numeros) {
  return Promise.all(numeros.map(id => obterPokemon(id)));
}
