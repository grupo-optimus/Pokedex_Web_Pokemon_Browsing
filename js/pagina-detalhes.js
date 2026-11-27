/* ==========================================================================
   Controlador da tela 2 (detalhes.html). RF003 (dados) + RF004 (favoritar).
   Qual Pokemon? O que estiver em detalhes.html?id=NUMERO.
   ========================================================================== */

const carregandoEl   = document.getElementById('estado-carregando');
const erroEl         = document.getElementById('estado-erro');
const mensagemErroEl = document.getElementById('mensagem-erro');
const conteudoEl     = document.getElementById('conteudo');
const botaoTentar    = document.getElementById('btn-tentar');

const imagemEl       = document.getElementById('poke-imagem');
const nomeEl         = document.getElementById('poke-nome');
const numeroEl       = document.getElementById('poke-numero');
const tiposEl        = document.getElementById('poke-tipos');
const habilidadesEl  = document.getElementById('poke-habilidades');
const pesoMedioEl    = document.getElementById('poke-peso-medio');
const alturaMediaEl  = document.getElementById('poke-altura-media');
const atributosEl    = document.getElementById('poke-atributos');
const botaoFavorito  = document.getElementById('btn-favorito');
const botaoShiny     = document.getElementById('btn-shiny');
const botaoComparar  = document.getElementById('btn-comparar');
const historiaEl     = document.getElementById('poke-historia');
const historiaCarregandoEl = document.getElementById('historia-carregando');
const historiaErroEl  = document.getElementById('historia-erro');
const buscaMovimentosEl = document.getElementById('busca-movimentos');
const listaMovimentosEl = document.getElementById('lista-movimentos');
const estadoMovimentosEl = document.getElementById('movimentos-estado');
const movimentosVazioEl = document.getElementById('movimentos-vazio');
const botaoTentarMovimentos = document.getElementById('btn-tentar-movimentos');
const modalMovimentoEl = document.getElementById('modal-movimento');
const botaoFecharMovimento = document.getElementById('btn-fechar-movimento');
const modalTituloMovimentoEl = document.getElementById('movimento-modal-titulo');
const modalCarregandoMovimentoEl = document.getElementById('movimento-modal-carregando');
const modalTipoMovimentoEl = document.getElementById('movimento-modal-tipo');
const modalPoderMovimentoEl = document.getElementById('movimento-modal-poder');
const modalPrecisaoMovimentoEl = document.getElementById('movimento-modal-precisao');
const modalPPMovimentoEl = document.getElementById('movimento-modal-pp');
const modalCategoriaMovimentoEl = document.getElementById('movimento-modal-categoria');
const modalAprendizagemMovimentoEl = document.getElementById('movimento-modal-aprendizagem');
const modalEfeitoMovimentoEl = document.getElementById('movimento-modal-efeito');
const modalDescricaoMovimentoEl = document.getElementById('movimento-modal-descricao');
const superEficazEl  = document.getElementById('poke-super-eficaz');
const vantagensEl    = document.getElementById('poke-vantagens');
const fraquezasEl    = document.getElementById('poke-fraquezas');
const imunidadesEl   = document.getElementById('poke-imunidades');

const secaoEvolucaoEl= document.getElementById('secao-evolucao');
const evolucaoEl     = document.getElementById('linha-evolucao');
const evoCarregandoEl= document.getElementById('evolucao-carregando');
const evoVaziaEl     = document.getElementById('evolucao-vazia');
const evoErroEl      = document.getElementById('evolucao-erro');
const blocoVariacoesEl = document.getElementById('bloco-variacoes');
const listaVariacoesEl = document.getElementById('lista-variacoes');

let pokemonAtual = null;
let movimentosPokemon = [];
let movimentosExibidos = [];
let focoAnteriorMovimento = null;
let tokenModalMovimento = 0;
const cacheTraducaoMovimento = new Map();

/* Ligado = mostra a cor rara (shiny) em todo sprite da tela. */
let modoShiny = false;

/* 255 e o maior atributo-base que existe. Serve de teto da barra. */
const ATRIBUTO_MAXIMO = 255;

function definirEstado(estado, mensagem) {
  mostrar(carregandoEl, estado === 'carregando');
  mostrar(erroEl,       estado === 'erro');
  mostrar(conteudoEl,   estado === 'pronto');
  if (mensagem) mensagemErroEl.textContent = mensagem;
}

/* Qual dos dois desenhos usar agora.
   Pokemon sem shiny cadastrado continua com o normal, sem quebrar a tela. */
function desenhoAtual(pokemon) {
  return (modoShiny && pokemon.imagemShiny) ? pokemon.imagemShiny : pokemon.imagem;
}

/* As duas fileiras da secao: a cadeia em cima e as variacoes embaixo.
   Quem troca sprite ou solta brilho precisa pegar as duas. */
function spritesDaEvolucao() {
  return Array.from(secaoEvolucaoEl.querySelectorAll('img'));
}

/* Repinta o visor grande E os sprites da linha evolutiva.
   Cada sprite da linha guarda os dois enderecos em data-normal / data-shiny. */
function trocarSprites() {
  if (pokemonAtual) imagemEl.src = desenhoAtual(pokemonAtual);

  spritesDaEvolucao().forEach(function (img) {
    const alvo = modoShiny ? img.dataset.shiny : img.dataset.normal;
    if (alvo) img.src = alvo;
  });
}

/* Barra de HP do jogo muda de cor conforme enche.
   Aqui e a mesma ideia: atributo forte fica verde, mediano amarelo, fraco vermelho. */
function nivelDoAtributo(valor) {
  if (valor >= 90) return 'alto';
  if (valor >= 55) return 'medio';
  return 'baixo';
}

/* Estrela cheia = ja e favorito. Estrela vazia = ainda nao. */
function atualizarBotaoFavorito() {
  const favorito = estaFavoritado(pokemonAtual.id);
  botaoFavorito.textContent = favorito
    ? '★ Remover dos favoritos'
    : '☆ Adicionar aos favoritos';
  botaoFavorito.setAttribute('aria-pressed', String(favorito));
}


function desenharTiposEficacia(caixa, tipos) {
  caixa.replaceChildren();
  tipos.forEach(function (tipo) {
    const item = elemento('li', tipo);
    item.className = 'tipo';
    item.dataset.tipo = tipo;
    caixa.appendChild(item);
  });
}

function desenharVantagensEFraquezas(efetividade) {
  pokemonAtual.superEficazContra = efetividade.superEficazContra;
  pokemonAtual.vantagens = efetividade.vantagens;
  pokemonAtual.fraquezas = efetividade.fraquezas;
  pokemonAtual.imunidades = efetividade.imunidades;

  desenharTiposEficacia(superEficazEl, pokemonAtual.superEficazContra);
  desenharTiposEficacia(vantagensEl, pokemonAtual.vantagens);
  desenharTiposEficacia(fraquezasEl, pokemonAtual.fraquezas);
  desenharTiposEficacia(imunidadesEl, pokemonAtual.imunidades);

  mostrar(superEficazEl.parentElement, pokemonAtual.superEficazContra.length > 0);
  mostrar(vantagensEl.parentElement, pokemonAtual.vantagens.length > 0);
  mostrar(fraquezasEl.parentElement, pokemonAtual.fraquezas.length > 0);
  mostrar(imunidadesEl.parentElement, pokemonAtual.imunidades.length > 0);
}

function atualizarBotaoComparar() {
  const selecionado = estaNaComparacao(pokemonAtual.id);
  botaoComparar.textContent = selecionado ? '✓ Remover da comparação' : '+ Comparar Pokémon';
  botaoComparar.setAttribute('aria-pressed', String(selecionado));
}



/* --------------------------------------------------------------------------
   HISTÓRIA
   Primeiro pega a entrada original em inglês na PokéAPI. Depois passa somente
   o texto para a função de tradução de traducoes.js.
   -------------------------------------------------------------------------- */
function estadoHistoria(estado) {
  mostrar(historiaCarregandoEl, estado === 'carregando');
  mostrar(historiaErroEl, estado === 'erro');
  mostrar(historiaEl, estado === 'pronto');
}

async function carregarHistoria(id) {
  estadoHistoria('carregando');
  historiaEl.textContent = '';

  try {
    const historiaIngles = await obterHistoriaPokemon(id);
    const historiaPortugues = await traduzirHistoria(historiaIngles);

    if (!historiaPortugues) {
      throw new Error('História vazia.');
    }

    historiaEl.textContent = historiaPortugues;
    estadoHistoria('pronto');
  } catch (erro) {
    estadoHistoria('erro');
  }
}

/* --------------------------------------------------------------------------
   MOVIMENTOS
   A lista fica logo abaixo da história. Cada item abre uma janela central.
   -------------------------------------------------------------------------- */
function textoAprendizagemMovimento(movimento) {
  if (Number.isFinite(movimento.nivelAprendizagem)) {
    return 'Nível ' + movimento.nivelAprendizagem;
  }
  return movimento.metodoAprendizagemTexto || 'Não informado';
}

function desenharListaMovimentos(lista) {
  movimentosExibidos = lista;
  listaMovimentosEl.replaceChildren();

  lista.forEach(function (movimento, indice) {
    const item = elemento('li');
    const botao = elemento('button');
    botao.type = 'button';
    botao.className = 'movimento-linha';
    botao.dataset.indice = String(indice);
    botao.setAttribute('aria-label', movimento.nome + ', tipo ' + movimento.tipo +
      ', poder ' + (movimento.poder === null ? 'não definido' : movimento.poder) +
      ', aprendizagem: ' + textoAprendizagemMovimento(movimento) + '. Ver detalhes.');

    const nome = elemento('span', movimento.nome);
    nome.className = 'movimento-nome';

    const metadados = elemento('span');
    metadados.className = 'movimento-metadados';

    const tipo = elemento('span', movimento.tipo || 'Desconhecido');
    tipo.className = 'tipo movimento-tipo';
    tipo.dataset.tipo = movimento.tipo || 'Desconhecido';

    const poder = elemento('span', 'Poder ' + (movimento.poder === null ? '—' : movimento.poder));
    poder.className = 'movimento-poder';

    const nivel = elemento('span', textoAprendizagemMovimento(movimento));
    nivel.className = 'movimento-nivel';

    metadados.append(tipo, poder, nivel);
    botao.append(nome, metadados);
    item.appendChild(botao);
    listaMovimentosEl.appendChild(item);
  });

  mostrar(listaMovimentosEl, lista.length > 0);
  mostrar(movimentosVazioEl, lista.length === 0);
}

function filtrarMovimentos() {
  const termo = normalizarTexto(buscaMovimentosEl.value);
  const filtrados = movimentosPokemon.filter(function (movimento) {
    return normalizarTexto(movimento.nome).includes(termo) ||
      normalizarTexto(movimento.tipo).includes(termo);
  });

  const detalhesIndisponiveis = movimentosPokemon.filter(item => item.indisponivel).length;
  const avisoDetalhes = detalhesIndisponiveis > 0
    ? ' ' + detalhesIndisponiveis + ' movimento(s) sem detalhes completos.'
    : '';

  estadoMovimentosEl.textContent = (termo
    ? filtrados.length + ' de ' + movimentosPokemon.length + ' movimentos encontrados.'
    : movimentosPokemon.length + ' movimentos encontrados. Selecione um para ver os detalhes.') + avisoDetalhes;

  movimentosVazioEl.textContent = termo
    ? 'Nenhum movimento corresponde à busca.'
    : 'Este Pokémon não possui movimentos listados na PokéAPI.';

  desenharListaMovimentos(filtrados);
}

async function carregarMovimentos(id) {
  buscaMovimentosEl.disabled = true;
  buscaMovimentosEl.value = '';
  mostrar(listaMovimentosEl, false);
  mostrar(movimentosVazioEl, false);
  mostrar(botaoTentarMovimentos, false);
  estadoMovimentosEl.textContent = 'Carregando movimentos e consultando os detalhes na PokéAPI…';

  try {
    movimentosPokemon = await obterMovimentosPokemon(id);

    if (movimentosPokemon.length === 0) {
      estadoMovimentosEl.textContent = 'Nenhum movimento foi listado para este Pokémon.';
      movimentosVazioEl.textContent = 'A PokéAPI não retornou movimentos para este Pokémon.';
      mostrar(movimentosVazioEl, true);
      return;
    }

    buscaMovimentosEl.disabled = false;
    filtrarMovimentos();
  } catch (erro) {
    estadoMovimentosEl.textContent = 'Não foi possível carregar os movimentos deste Pokémon.';
    mostrar(botaoTentarMovimentos, true);
  }
}

function valorModalMovimento(elementoAlvo, valor) {
  elementoAlvo.textContent = valor === null || valor === undefined || valor === '' ? '—' : String(valor);
}

async function traduzirTextoMovimento(texto, idioma) {
  const original = String(texto || '').trim();
  if (!original) return '';
  if (idioma === 'pt' || idioma === 'pt-BR' || idioma === 'pt-br') return original;
  if (idioma !== 'en') return original + ' (idioma: ' + idioma + ')';

  const chave = idioma + ':' + original;
  if (cacheTraducaoMovimento.has(chave)) return cacheTraducaoMovimento.get(chave);

  try {
    const traduzido = await traduzirHistoria(original);
    cacheTraducaoMovimento.set(chave, traduzido);
    return traduzido;
  } catch (erro) {
    const originalIdentificado = original + ' (texto original em inglês; tradução indisponível)';
    cacheTraducaoMovimento.set(chave, originalIdentificado);
    return originalIdentificado;
  }
}

async function carregarTextosModalMovimento(movimento, token) {
  const efeito = movimento.efeito || movimento.efeitoCurto || '';
  const descricao = movimento.descricao || '';

  modalCarregandoMovimentoEl.hidden = false;
  modalEfeitoMovimentoEl.textContent = efeito ? 'Traduzindo descrição…' : 'A PokéAPI não disponibiliza um efeito textual para este movimento.';
  modalDescricaoMovimentoEl.textContent = descricao ? 'Traduzindo descrição…' :
    'A PokéAPI não disponibiliza uma descrição narrativa específica da execução deste movimento.';

  const [efeitoPt, descricaoPt] = await Promise.all([
    efeito ? traduzirTextoMovimento(efeito, movimento.efeitoIdioma) : Promise.resolve(''),
    descricao ? traduzirTextoMovimento(descricao, movimento.descricaoIdioma) : Promise.resolve('')
  ]);

  // Se outra janela foi aberta durante a tradução, nao sobrescreve a selecao atual.
  if (token !== tokenModalMovimento || modalMovimentoEl.hidden) return;

  modalEfeitoMovimentoEl.textContent = efeitoPt ||
    'A PokéAPI não disponibiliza um efeito textual para este movimento.';
  modalDescricaoMovimentoEl.textContent = descricaoPt ||
    'A PokéAPI não disponibiliza uma descrição narrativa específica da execução deste movimento.';
  modalCarregandoMovimentoEl.hidden = true;
}

function abrirModalMovimento(movimento, botaoOrigem) {
  focoAnteriorMovimento = botaoOrigem || document.activeElement;
  tokenModalMovimento += 1;
  const token = tokenModalMovimento;

  modalTituloMovimentoEl.textContent = movimento.nome;
  valorModalMovimento(modalTipoMovimentoEl, movimento.tipo);
  modalTipoMovimentoEl.dataset.tipo = movimento.tipo || '';
  valorModalMovimento(modalPoderMovimentoEl,
    movimento.poder === null ? '—' : movimento.poder);
  valorModalMovimento(modalPrecisaoMovimentoEl,
    movimento.precisao === null ? '—' : movimento.precisao + '%');
  valorModalMovimento(modalPPMovimentoEl, movimento.pp);
  valorModalMovimento(modalCategoriaMovimentoEl, movimento.categoria);
  valorModalMovimento(modalAprendizagemMovimentoEl, textoAprendizagemMovimento(movimento));

  modalCarregandoMovimentoEl.hidden = false;
  modalEfeitoMovimentoEl.textContent = 'Carregando…';
  modalDescricaoMovimentoEl.textContent = 'Carregando…';
  modalMovimentoEl.classList.remove('animando');
  modalMovimentoEl.hidden = false;
  modalMovimentoEl.setAttribute('aria-hidden', 'false');
  // Reinicia as animações a cada abertura, inclusive quando outro ataque é selecionado.
  void modalMovimentoEl.offsetWidth;
  modalMovimentoEl.classList.add('animando');
  document.body.classList.add('modal-movimento-aberto');
  botaoFecharMovimento.focus();

  carregarTextosModalMovimento(movimento, token);
}

function fecharModalMovimento() {
  if (modalMovimentoEl.hidden) return;
  modalMovimentoEl.classList.remove('animando');
  modalMovimentoEl.hidden = true;
  modalMovimentoEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-movimento-aberto');
  tokenModalMovimento += 1;

  if (focoAnteriorMovimento && typeof focoAnteriorMovimento.focus === 'function') {
    focoAnteriorMovimento.focus();
  }
  focoAnteriorMovimento = null;
}

function desenharPokemon(pokemon) {
  document.title = pokemon.nome + ' — Detalhes';

  imagemEl.src = desenhoAtual(pokemon);
  imagemEl.alt = pokemon.nome;
  nomeEl.textContent = pokemon.nome;
  numeroEl.textContent = numeroFormatado(pokemon.id);

  // Tipos. O data-tipo diz ao CSS qual cor a plaquinha usa.
  tiposEl.replaceChildren();
  pokemon.tipos.forEach(function (tipo) {
    const item = elemento('li', tipo);
    item.className = 'tipo';
    item.dataset.tipo = tipo;
    tiposEl.appendChild(item);
  });

  // Habilidades.
  habilidadesEl.replaceChildren();
  pokemon.habilidades.forEach(h => habilidadesEl.appendChild(elemento('li', h)));

  // Peso médio: o modelo já normaliza o valor da PokéAPI para quilogramas.
  if (pesoMedioEl) {
    pesoMedioEl.textContent = Number.isFinite(pokemon.pesoKg)
      ? new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(pokemon.pesoKg) + ' kg'
      : 'Não informado';
  }

  // Altura média: o modelo já normaliza o valor da PokéAPI para metros.
  if (alturaMediaEl) {
    alturaMediaEl.textContent = Number.isFinite(pokemon.alturaMetros)
      ? new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(pokemon.alturaMetros) + ' m'
      : 'Não informado';
  }

  // Os seis atributos, cada um com numero e barra.
  atributosEl.replaceChildren();
  pokemon.atributos.forEach(function (atributo) {
    const linha = elemento('tr');
    linha.appendChild(elemento('th', atributo.nome));
    linha.appendChild(elemento('td', String(atributo.valor)));

    const celulaBarra = elemento('td');
    const barra = elemento('progress');
    barra.value = atributo.valor;
    barra.max = ATRIBUTO_MAXIMO;
    barra.dataset.nivel = nivelDoAtributo(atributo.valor); // Pinta igual barra de HP
    celulaBarra.appendChild(barra);
    linha.appendChild(celulaBarra);

    atributosEl.appendChild(linha);
  });

  const totalAtributos = pokemon.atributos.reduce(function (total, atributo) {
    return total + Number(atributo.valor);
  }, 0);

  const totalAtributosEl = document.getElementById('poke-total-atributos');
  if (totalAtributosEl) {
    totalAtributosEl.textContent = String(totalAtributos);
  }

  atualizarBotaoFavorito();
  atualizarBotaoComparar();
  atualizarLinksComparacao();
  desenharTiposEficacia(superEficazEl, pokemon.superEficazContra || []);
  desenharTiposEficacia(vantagensEl, pokemon.vantagens);
  desenharTiposEficacia(fraquezasEl, pokemon.fraquezas);
  desenharTiposEficacia(imunidadesEl, pokemon.imunidades);
}

/* --------------------------------------------------------------------------
   LINHA EVOLUTIVA. Um elo = um Pokemon da cadeia, clicavel.
   O elo do Pokemon que esta aberto agora fica marcado.
   -------------------------------------------------------------------------- */
function identificarFormaEspecial(pokemon) {
  const nomeApi = String(pokemon.nomeApi || '').toLowerCase();

  const regras = [
    { padrao: /-mega-x$/, rotulo: 'MEGA X' },
    { padrao: /-mega-y$/, rotulo: 'MEGA Y' },
    { padrao: /-mega$/, rotulo: 'MEGA' },
    { padrao: /-gmax$/, rotulo: 'GIGANTAMAX' },
    { padrao: /-primal$/, rotulo: 'PRIMAL' },
    { padrao: /-ash$/, rotulo: 'ASH' },
    { padrao: /-(alola|galar|hisui|paldea)$/, rotulo: 'REGIONAL' },
    { padrao: /-origin$/, rotulo: 'ORIGIN' },
    { padrao: /-(attack|defense|speed)$/, rotulo: 'FORMA' },
    { padrao: /-(altered|sky|school|solo|complete|zen|crowned|eternamax|hero|resolute|ordinary|therian|incarnate)$/, rotulo: 'FORMA' },
    { padrao: /-(white|black|sunny|rainy|snowy|dusk|dawn|midnight|midday|low-key|amped|full-belly|hangry)$/, rotulo: 'FORMA' },
    { padrao: /-(10|50|100)-percent$/, rotulo: 'FORMA' },
    { padrao: /-(rock-star|belle|pop-star|phd|libre|cosplay|original-cap|hoenn-cap|sinnoh-cap|unova-cap|kalos-cap|alola-cap|partner-cap|world-cap)$/, rotulo: 'FORMA' }
  ];

  // Sem regra batendo, quem chamou decide o que fazer. Antes esta linha
  // devolvia 'FORMA' e carimbava a etiqueta vermelha ate no Bulbasaur.
  const encontrada = regras.find(regra => regra.padrao.test(nomeApi));
  return encontrada ? encontrada.rotulo : null;
}

/* opcoes.variacao  = card da fileira de baixo (Mega, Gmax, regional...).
   opcoes.requisito = o que fazer para evoluir ATE este Pokemon. */
function criarElo(pokemon, opcoes) {
  const config = opcoes || {};

  const elo = elemento('a');
  elo.className = 'evo';
  elo.href = 'detalhes.html?id=' + pokemon.id;

  if (pokemon.id === pokemonAtual.id) {
    elo.classList.add('evo-atual');
  }

  if (config.variacao) {
    elo.classList.add('evo-forma-especial');
  }

  const img = elemento('img');
  img.src = desenhoAtual(pokemon);
  img.alt = pokemon.nome;
  img.width = 128;
  img.height = 128;
  img.loading = 'lazy';
  img.dataset.normal = pokemon.imagem;
  if (pokemon.imagemShiny) img.dataset.shiny = pokemon.imagemShiny;

  const numero = elemento('span', numeroFormatado(pokemon.id));
  numero.className = 'dex-numero';

  const nome = elemento('span', pokemon.nome);
  nome.className = 'dex-nome';

  elo.appendChild(img);
  elo.appendChild(numero);
  elo.appendChild(nome);

  // A etiqueta diz QUAL forma e. Quando a regra nao reconhece o sufixo, a
  // palavra generica ainda serve: o card ja esta na fileira das variacoes.
  if (config.variacao) {
    const rotulo = identificarFormaEspecial(pokemon) || 'FORMA';
    const badge = elemento('span', rotulo);
    badge.className = 'forma-especial-badge';
    badge.setAttribute('aria-label', 'Forma especial: ' + rotulo);
    elo.appendChild(badge);
  }

  if (config.requisito) {
    const comoEvoluir = elemento('span', config.requisito);
    comoEvoluir.className = 'evo-requisito';
    elo.appendChild(comoEvoluir);
  }

  return elo;
}

/* Liga um estado de cada vez, igual as outras telas fazem.
   A fileira das variacoes e quem desenha que decide: pode nao existir. */
function estadoEvolucao(estado) {
  mostrar(evoCarregandoEl, estado === 'carregando');
  mostrar(evoVaziaEl,      estado === 'vazia');
  mostrar(evoErroEl,       estado === 'erro');
  mostrar(evolucaoEl,      estado === 'pronto');
  if (estado !== 'pronto') mostrar(blocoVariacoesEl, false);
}

function desenharEvolucao(linha) {
  // Fileira de cima: um estagio atras do outro, na ordem em que evolui.
  evolucaoEl.replaceChildren();

  linha.estagios.forEach(function (pokemons, indice) {
    const estagio = elemento('li');
    estagio.className = 'estagio';

    // Um estagio pode ter varios Pokemon quando a cadeia abre em leque:
    // Eevee vira oito. Ai eles dividem o mesmo degrau, lado a lado.
    const formas = elemento('div');
    formas.className = 'formas';

    pokemons.forEach(function (pokemon) {
      // O primeiro estagio e o ponto de partida: ninguem evolui para ele.
      const requisito = indice === 0 ? '' : (linha.requisitos[pokemon.nomeEspecie] || '');
      formas.appendChild(criarElo(pokemon, { requisito: requisito }));
    });

    estagio.appendChild(formas);
    evolucaoEl.appendChild(estagio);
  });

  // Fileira de baixo: as formas alternativas de toda a cadeia.
  listaVariacoesEl.replaceChildren();

  linha.variacoes.forEach(function (pokemon) {
    const item = elemento('li');
    item.appendChild(criarElo(pokemon, { variacao: true }));
    listaVariacoesEl.appendChild(item);
  });

  mostrar(blocoVariacoesEl, linha.variacoes.length > 0);
}

/* A cadeia vem DEPOIS do Pokemon, em pedido separado.
   Se falhar, so essa secao avisa: o resto da ficha continua na tela. */
async function carregarEvolucao(id) {
  estadoEvolucao('carregando');

  try {
    const linha = await obterLinhaEvolutiva(id);

    // Um estagio so quer dizer que nao evolui. Mas se tiver Mega ou Gmax a
    // secao continua valendo: e a fileira de baixo que tem o que mostrar.
    if (linha.estagios.length <= 1 && linha.variacoes.length === 0) {
      estadoEvolucao('vazia');
      return;
    }

    desenharEvolucao(linha);
    estadoEvolucao('pronto');
  } catch (erro) {
    estadoEvolucao('erro');
  }
}

async function carregarDetalhes() {
  const id = parametroDaURL('id') || '1'; // Sem id? mostra o Bulbasaur
  definirEstado('carregando');

  try {
    pokemonAtual = await obterPokemon(id);
    desenharPokemon(pokemonAtual);
    definirEstado('pronto');

    // A história é independente da ficha principal. Ela carrega e traduz
    // depois, sem impedir que o restante da página apareça.
    carregarHistoria(pokemonAtual.id);
    carregarMovimentos(pokemonAtual.id);

    // Vantagens/fraquezas sao carregadas depois da ficha principal para
    // nao bloquear o conteudo essencial do Pokemon.
    try {
      const efetividade = await obterVantagensEFraquezas(pokemonAtual);
      desenharVantagensEFraquezas(efetividade);
    } catch (erro) {
      // Se a tabela de tipos falhar, a ficha principal continua utilizavel.
      mostrar(superEficazEl.parentElement, false);
      mostrar(vantagensEl.parentElement, false);
      mostrar(fraquezasEl.parentElement, false);
      mostrar(imunidadesEl.parentElement, false);
    }

    // A linha evolutiva chega depois, sem segurar o resto da tela.
    carregarEvolucao(pokemonAtual.id);
  } catch (erro) {
    definirEstado('erro', erro.message); // RF007
  }
}

/* Aperta botao -> guarda ou remove o Pokemon INTEIRO do localStorage (HU03). */
botaoFavorito.addEventListener('click', function () {
  if (!pokemonAtual) return;
  alternarFavorito(pokemonAtual);
  atualizarBotaoFavorito();
});

/* --------------------------------------------------------------------------
   O BRILHO DA TROCA.
   O clarao bate em todo sprite da tela, um pouquinho depois do outro, entao a
   luz "corre" pela linha evolutiva. As faiscas so acontecem no visor grande,
   e SO na ida pro shiny; voltar pro normal nao precisa disso.
   -------------------------------------------------------------------------- */
const QUANTAS_FAISCAS = 7;

function darClarao(sprite, atraso) {
  sprite.classList.remove('cintilando');

  // Encerrar a animacao antiga explicitamente. So tirar e por a classe de volta
  // As vezes nao reinicia — o navegador junta as duas mudancas e nao ve
  // Diferenca nenhuma. Cancelar nao deixa duvida.
  sprite.getAnimations().forEach(animacao => animacao.cancel());

  sprite.style.setProperty('--atraso-brilho', atraso + 'ms');
  void sprite.offsetWidth;
  sprite.classList.add('cintilando');
}

function brilharTudo() {
  const sprites = [imagemEl].concat(spritesDaEvolucao());
  sprites.forEach((sprite, i) => darClarao(sprite, i * 70));
}

/* As faiscas que estouram em volta do Pokemon. Nascem, brilham e sao
   apagadas do HTML: nao fica lixo na tela. */
function soltarFaiscas() {
  const visor = imagemEl.parentElement; // A <figure>
  limparBrilho(visor);

  for (let i = 0; i < QUANTAS_FAISCAS; i++) {
    const faisca = elemento('div');
    faisca.className = 'faisca';

    // Espalha pela area onde o sprite fica, nao em cima do nome.
    faisca.style.left = (10 + Math.random() * 72) + '%';
    faisca.style.top  = (6 + Math.random() * 58) + '%';
    faisca.style.setProperty('--atraso-faisca', (i * 55) + 'ms');

    visor.appendChild(faisca);
  }

  window.setTimeout(() => limparBrilho(visor), 1200);
}

function limparBrilho(visor) {
  visor.querySelectorAll('.faisca').forEach(el => el.remove());
}

/* Liga e desliga a cor rara. Troca o visor e a linha evolutiva juntos. */
botaoComparar.addEventListener('click', function () {
  if (!pokemonAtual) return;
  const resultado = alternarComparacao(pokemonAtual);
  if (resultado.cheia) {
    window.alert('A comparação já possui 6 Pokémon. Remova um para adicionar outro.');
    return;
  }
  atualizarBotaoComparar();
  atualizarLinksComparacao();
});

botaoShiny.addEventListener('click', function () {
  modoShiny = !modoShiny;
  botaoShiny.textContent = modoShiny ? 'Ver normal' : 'Ver shiny';
  botaoShiny.setAttribute('aria-pressed', String(modoShiny));

  trocarSprites();
  brilharTudo();

  if (modoShiny) soltarFaiscas();
});

botaoTentar.addEventListener('click', carregarDetalhes);
buscaMovimentosEl.addEventListener('input', filtrarMovimentos);
botaoTentarMovimentos.addEventListener('click', function () {
  if (pokemonAtual) carregarMovimentos(pokemonAtual.id);
});

listaMovimentosEl.addEventListener('click', function (evento) {
  const botao = evento.target.closest('button[data-indice]');
  if (!botao) return;

  const indice = Number(botao.dataset.indice);
  const movimento = movimentosExibidos[indice];
  if (movimento) abrirModalMovimento(movimento, botao);
});

botaoFecharMovimento.addEventListener('click', fecharModalMovimento);
modalMovimentoEl.addEventListener('click', function (evento) {
  if (evento.target === modalMovimentoEl) fecharModalMovimento();
});

document.addEventListener('keydown', function (evento) {
  if (modalMovimentoEl.hidden) return;

  if (evento.key === 'Escape') {
    fecharModalMovimento();
    return;
  }

  // Ha apenas um controle focavel na janela; mantem o foco dentro dela.
  if (evento.key === 'Tab') {
    evento.preventDefault();
    botaoFecharMovimento.focus();
  }
});

carregarDetalhes();
