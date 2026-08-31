/* ==========================================================================
   Controlador da tela 1 (index.html).
   Lista (RF001) + busca (RF002) + filtros.

   Tres modos, um de cada vez:
     1. Pokedex normal  -> pagina por pagina, direto da API
     2. Busca por nome  -> RF002
     3. Filtro          -> a API devolve os NUMEROS que servem; a tela pagina
                           em cima dessa lista, 20 por vez

   O estado mora na URL (?q=, ?tipo=, ?regiao=, ?categoria=, ?pagina=).
   E por isso que o botao VOLTAR da tela de detalhes consegue trazer a pessoa
   de volta pra pesquisa que ela tinha feito, e nao pro comeco da lista.
   ========================================================================== */

const listaEl        = document.getElementById('lista-pokemons');
const carregandoEl   = document.getElementById('estado-carregando');
const erroEl         = document.getElementById('estado-erro');
const mensagemErroEl = document.getElementById('mensagem-erro');
const vazioEl        = document.getElementById('sem-resultado');
const paginacaoEl    = document.getElementById('paginacao');
const infoPaginaEl   = document.getElementById('info-pagina');
const botaoAnterior  = document.getElementById('btn-anterior');
const botaoProxima   = document.getElementById('btn-proxima');
const formBusca      = document.getElementById('form-busca');
const campoBusca     = document.getElementById('busca');
const botaoTentar    = document.getElementById('btn-tentar');

const botaoFiltros   = document.getElementById('btn-filtros');
const painelFiltros  = document.getElementById('painel-filtros');
const caixaTipos     = document.getElementById('filtro-tipos');
const caixaRegioes   = document.getElementById('filtro-regioes');
const caixaCategorias= document.getElementById('filtro-categorias');
const avisoFiltroEl  = document.getElementById('aviso-filtro');
const botaoAplicar   = document.getElementById('btn-aplicar-filtros');
const botaoLimpar    = document.getElementById('btn-limpar-filtros');

let paginaAtual = 1;
let termoAtual = '';
let filtros = { tipos: [], regiao: null, categoria: null };
let idsFiltrados = null;  // Null = sem filtro, mostra a Pokedex inteira
let ultimaAcao = null;    // O que falhou, pro botao "tentar de novo" (RF007)

/* Liga e desliga os estados da tela. Um de cada vez. */
function definirEstado(estado, mensagem) {
  mostrar(carregandoEl, estado === 'carregando');
  mostrar(erroEl,       estado === 'erro');
  mostrar(vazioEl,      estado === 'vazio');
  mostrar(listaEl,      estado === 'pronto');
  mostrar(paginacaoEl,  estado === 'pronto' && termoAtual === '');
  if (mensagem) mensagemErroEl.textContent = mensagem;
}

function desenharLista(pokemons) {
  listaEl.replaceChildren(); // Limpa antes de encher
  // Cada card ja vem com a estrela de favoritar (RF004).
  pokemons.forEach(p => listaEl.appendChild(criarCardPokemon(p, { comBotaoFavorito: true })));
}

function temFiltro() {
  return filtros.tipos.length > 0 || filtros.regiao !== null || filtros.categoria !== null;
}

/* ==========================================================================
   O ESTADO NA URL
   ========================================================================== */

/* ReplaceState troca o endereco SEM recarregar e SEM criar entrada
   nova no historico. Assim clicar 5 paginas nao obriga a apertar voltar 5x. */
function sincronizarURL() {
  const partes = new URLSearchParams();

  if (termoAtual)          partes.set('q', termoAtual);
  if (filtros.tipos.length) partes.set('tipo', filtros.tipos.join(','));
  if (filtros.regiao)      partes.set('regiao', filtros.regiao);
  if (filtros.categoria)   partes.set('categoria', filtros.categoria);
  if (paginaAtual > 1)     partes.set('pagina', paginaAtual);

  const consulta = partes.toString();
  window.history.replaceState(null, '', consulta ? '?' + consulta : window.location.pathname);

  // Anota onde a lista parou. E daqui que o botao Voltar da tela de detalhes
  // tira o endereco pra onde ele deve trazer a pessoa de volta.
  guardarUltimaLista(window.location.href);
}

function lerURL() {
  const partes = new URLSearchParams(window.location.search);

  termoAtual        = partes.get('q') || '';
  filtros.tipos     = (partes.get('tipo') || '').split(',').filter(Boolean);
  filtros.regiao    = partes.get('regiao') ? Number(partes.get('regiao')) : null;
  filtros.categoria = partes.get('categoria') || null;
  paginaAtual       = Math.max(1, Number(partes.get('pagina')) || 1);
}

/* ==========================================================================
   CARREGAR UMA PAGINA (serve pros dois modos: Pokedex inteira e filtrada)
   ========================================================================== */
async function carregarPagina(pagina) {
  ultimaAcao = () => carregarPagina(pagina);
  definirEstado('carregando');

  try {
    let itens;
    let totalPaginas;

    if (idsFiltrados) {
      // A lista de numeros ja esta aqui. Fatia 20 e busca so esses.
      totalPaginas = Math.max(1, Math.ceil(idsFiltrados.length / TAMANHO_PAGINA));
      const inicio = (pagina - 1) * TAMANHO_PAGINA;
      itens = await obterVariosPokemons(idsFiltrados.slice(inicio, inicio + TAMANHO_PAGINA));
    } else {
      const resultado = await listarPagina(pagina);
      itens = resultado.itens;
      totalPaginas = resultado.totalPaginas;
    }

    paginaAtual = pagina;
    desenharLista(itens);

    infoPaginaEl.textContent = 'Página ' + pagina + ' de ' + totalPaginas;
    botaoAnterior.disabled = pagina <= 1;
    botaoProxima.disabled  = pagina >= totalPaginas;

    sincronizarURL();
    definirEstado('pronto');
  } catch (erro) {
    // RF007 — mostra a mensagem que veio da api.js e oferece nova tentativa.
    definirEstado('erro', erro.message);
  }
}

/* ==========================================================================
   A BUSCA (RF002)
   ========================================================================== */
async function fazerBusca(termo) {
  ultimaAcao = () => fazerBusca(termo);

  // Buscar e filtrar sao modos diferentes. Buscar limpa o filtro,
  // Senao a tela mostraria um resultado que nao bate com os chips marcados.
  termoAtual = termo;
  idsFiltrados = null;
  filtros = { tipos: [], regiao: null, categoria: null };
  paginaAtual = 1;
  pintarChips();

  definirEstado('carregando');

  try {
    const achados = await buscarPokemons(termo);
    sincronizarURL();

    if (achados.length === 0) {
      definirEstado('vazio');
      return;
    }

    desenharLista(achados);
    definirEstado('pronto');
  } catch (erro) {
    // Numero que nao existe cai como "nao encontrado", nao como erro de rede.
    if (erro.message === 'Pokémon não encontrado.') {
      definirEstado('vazio');
      return;
    }
    definirEstado('erro', erro.message);
  }
}

/* ==========================================================================
   OS FILTROS
   ========================================================================== */

/* Os chips nascem dos dicionarios. Se alguem adicionar um tipo em
   traducoes.js, ele aparece aqui sozinho. */
function criarChip(grupo, valor, rotulo) {
  const chip = elemento('button', rotulo);
  chip.type = 'button';
  chip.className = 'chip';
  chip.dataset.grupo = grupo;
  chip.dataset.valor = String(valor);

  // O chip de tipo leva o mesmo data-tipo das plaquinhas do card: e por ele
  // Que o CSS pinta cada tipo com a sua cor, sem repetir a tabela aqui.
  if (grupo === 'tipo') chip.dataset.tipo = rotulo;
  chip.setAttribute('aria-pressed', 'false');
  chip.addEventListener('click', () => alternarChip(grupo, valor));
  return chip;
}

function montarChips() {
  // 'unknown' e 'stellar' existem no cadastro mas nao tem Pokemon util.
  Object.keys(TIPOS_PT)
    .filter(chave => chave !== 'unknown' && chave !== 'stellar')
    .forEach(chave => caixaTipos.appendChild(criarChip('tipo', chave, TIPOS_PT[chave])));

  REGIOES.forEach(r => caixaRegioes.appendChild(criarChip('regiao', r.geracao, r.nome)));

  CATEGORIAS.forEach(c => caixaCategorias.appendChild(criarChip('categoria', c.chave, c.nome)));
}

function ehFormaAlternativa(categoria) {
  return categoria === 'mega' || categoria === 'gmax';
}

function alternarChip(grupo, valor) {
  if (grupo === 'tipo') {
    // Tipo aceita mais de um. Marcar Fogo + Voador acha o Charizard.
    const i = filtros.tipos.indexOf(valor);
    if (i >= 0) filtros.tipos.splice(i, 1);
    else filtros.tipos.push(valor);
  }

  if (grupo === 'regiao') {
    filtros.regiao = (filtros.regiao === valor) ? null : valor;
    // Mega/gmax sao formas com numero acima de 10000; nenhuma delas
    // Esta na lista de uma regiao. Marcar os dois daria lista vazia sempre.
    if (filtros.regiao !== null && ehFormaAlternativa(filtros.categoria)) {
      filtros.categoria = null;
    }
  }

  if (grupo === 'categoria') {
    filtros.categoria = (filtros.categoria === valor) ? null : valor;
    if (ehFormaAlternativa(filtros.categoria)) {
      filtros.regiao = null;
    }
  }

  pintarChips();
}

/* Repinta os chips a partir do estado, nunca o contrario. */
function pintarChips() {
  painelFiltros.querySelectorAll('.chip').forEach(function (chip) {
    const valor = chip.dataset.valor;
    let ativo = false;

    if (chip.dataset.grupo === 'tipo')      ativo = filtros.tipos.indexOf(valor) >= 0;
    if (chip.dataset.grupo === 'regiao')    ativo = String(filtros.regiao) === valor;
    if (chip.dataset.grupo === 'categoria') ativo = filtros.categoria === valor;

    chip.setAttribute('aria-pressed', String(ativo));
  });

  mostrar(avisoFiltroEl, ehFormaAlternativa(filtros.categoria));
}

async function aplicarFiltros(pagina) {
  ultimaAcao = () => aplicarFiltros(pagina);

  // Filtrar limpa a busca, pelo mesmo motivo que buscar limpa o filtro.
  termoAtual = '';
  campoBusca.value = '';
  definirEstado('carregando');

  try {
    idsFiltrados = await filtrarPokemons(filtros);

    if (idsFiltrados && idsFiltrados.length === 0) {
      paginaAtual = 1;
      sincronizarURL();
      definirEstado('vazio');
      return;
    }

    await carregarPagina(pagina || 1);
  } catch (erro) {
    definirEstado('erro', erro.message);
  }
}

function limparFiltros() {
  filtros = { tipos: [], regiao: null, categoria: null };
  idsFiltrados = null;
  pintarChips();
  carregarPagina(1);
}

/* ================= OUVINDO OS BOTOES ================= */

formBusca.addEventListener('submit', function (evento) {
  evento.preventDefault(); // Nao recarrega pagina; quem busca e o JS
  const termo = campoBusca.value.trim();

  if (termo !== '') {
    fazerBusca(termo);
    return;
  }

  // Campo vazio volta pro que estiver valendo — filtro, se houver.
  termoAtual = '';
  if (temFiltro()) aplicarFiltros(1);
  else { idsFiltrados = null; carregarPagina(1); }
});

botaoFiltros.addEventListener('click', function () {
  const vaiAbrir = painelFiltros.hidden;
  painelFiltros.hidden = !vaiAbrir;
  botaoFiltros.setAttribute('aria-expanded', String(vaiAbrir));
});

botaoAplicar.addEventListener('click', () => aplicarFiltros(1));
botaoLimpar.addEventListener('click', limparFiltros);

botaoAnterior.addEventListener('click', () => carregarPagina(paginaAtual - 1));
botaoProxima.addEventListener('click', () => carregarPagina(paginaAtual + 1));
botaoTentar.addEventListener('click', () => { if (ultimaAcao) ultimaAcao(); });

/* ==========================================================================
   ABRIU A TELA: obedece o que estiver na URL.
   Sem nada na URL, e a Pokedex normal na pagina 1.
   ========================================================================== */
lerURL();
montarChips();
pintarChips();
campoBusca.value = termoAtual;

if (termoAtual) {
  fazerBusca(termoAtual);
} else if (temFiltro()) {
  painelFiltros.hidden = false;            // Ja abre mostrando o que esta valendo
  botaoFiltros.setAttribute('aria-expanded', 'true');
  aplicarFiltros(paginaAtual);
} else {
  carregarPagina(paginaAtual);
}
