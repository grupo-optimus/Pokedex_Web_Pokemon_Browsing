/* ==========================================================================
   CAVERNA: cerebro da tela 1 (index.html). Lista (RF001) + busca (RF002).
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

let paginaAtual = 1;
let termoAtual = '';
let ultimaAcao = null; // CAVERNA: guarda o que falhou, pro botao "tentar de novo" (RF007)

/* CAVERNA: liga e desliga os estados da tela. Um de cada vez. */
function definirEstado(estado, mensagem) {
  mostrar(carregandoEl, estado === 'carregando');
  mostrar(erroEl,       estado === 'erro');
  mostrar(vazioEl,      estado === 'vazio');
  mostrar(listaEl,      estado === 'pronto');
  mostrar(paginacaoEl,  estado === 'pronto' && termoAtual === '');
  if (mensagem) mensagemErroEl.textContent = mensagem;
}

function desenharLista(pokemons) {
  listaEl.replaceChildren(); // CAVERNA: limpa antes de encher
  pokemons.forEach(p => listaEl.appendChild(criarCardPokemon(p)));
}

/* --------------------------------------------------------------------------
   CAVERNA: carrega uma pagina da Pokedex.
   -------------------------------------------------------------------------- */
async function carregarPagina(pagina) {
  ultimaAcao = () => carregarPagina(pagina);
  termoAtual = '';
  definirEstado('carregando');

  try {
    const resultado = await listarPagina(pagina);
    paginaAtual = pagina;

    desenharLista(resultado.itens);
    infoPaginaEl.textContent = 'Página ' + pagina + ' de ' + resultado.totalPaginas;
    botaoAnterior.disabled = pagina <= 1;
    botaoProxima.disabled  = pagina >= resultado.totalPaginas;

    definirEstado('pronto');
  } catch (erro) {
    // CAVERNA: RF007 — mostra o grito que veio da api.js e oferece nova tentativa.
    definirEstado('erro', erro.message);
  }
}

/* --------------------------------------------------------------------------
   CAVERNA: a caçada (RF002).
   -------------------------------------------------------------------------- */
async function fazerBusca(termo) {
  ultimaAcao = () => fazerBusca(termo);
  termoAtual = termo;
  definirEstado('carregando');

  try {
    const achados = await buscarPokemons(termo);

    if (achados.length === 0) {
      definirEstado('vazio');
      return;
    }

    desenharLista(achados);
    definirEstado('pronto');
  } catch (erro) {
    // CAVERNA: numero que nao existe cai como "nao encontrado", nao como erro de rede.
    if (erro.message === 'Pokémon não encontrado.') {
      definirEstado('vazio');
      return;
    }
    definirEstado('erro', erro.message);
  }
}

/* ================= OUVINDO OS BOTOES ================= */

formBusca.addEventListener('submit', function (evento) {
  evento.preventDefault(); // CAVERNA: nao recarrega pagina; quem busca e o JS
  const termo = campoBusca.value.trim();
  if (termo === '') {
    carregarPagina(1);
  } else {
    fazerBusca(termo);
  }
});

botaoAnterior.addEventListener('click', () => carregarPagina(paginaAtual - 1));
botaoProxima.addEventListener('click', () => carregarPagina(paginaAtual + 1));
botaoTentar.addEventListener('click', () => { if (ultimaAcao) ultimaAcao(); });

/* CAVERNA: abriu a pagina, ja mostra o primeiro bloco de bicho. */
carregarPagina(1);
