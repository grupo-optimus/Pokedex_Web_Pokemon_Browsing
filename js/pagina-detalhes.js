/* ==========================================================================
   CAVERNA: cerebro da tela 2 (detalhes.html). RF003 (dados) + RF004 (favoritar).
   Qual bicho? O que estiver em detalhes.html?id=NUMERO.
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
const atributosEl    = document.getElementById('poke-atributos');
const botaoFavorito  = document.getElementById('btn-favorito');

let pokemonAtual = null;

/* CAVERNA: 255 e o maior atributo-base que existe. Serve de teto da barra. */
const ATRIBUTO_MAXIMO = 255;

function definirEstado(estado, mensagem) {
  mostrar(carregandoEl, estado === 'carregando');
  mostrar(erroEl,       estado === 'erro');
  mostrar(conteudoEl,   estado === 'pronto');
  if (mensagem) mensagemErroEl.textContent = mensagem;
}

/* CAVERNA: estrela cheia = ja e favorito. Estrela vazia = ainda nao. */
function atualizarBotaoFavorito() {
  const favorito = estaFavoritado(pokemonAtual.id);
  botaoFavorito.textContent = favorito
    ? '★ Remover dos favoritos'
    : '☆ Adicionar aos favoritos';
  botaoFavorito.setAttribute('aria-pressed', String(favorito));
}

function desenharPokemon(pokemon) {
  document.title = pokemon.nome + ' — Detalhes';

  imagemEl.src = pokemon.imagem;
  imagemEl.alt = pokemon.nome;
  nomeEl.textContent = pokemon.nome;
  numeroEl.textContent = numeroFormatado(pokemon.id);

  // CAVERNA: tipos.
  tiposEl.replaceChildren();
  pokemon.tipos.forEach(tipo => tiposEl.appendChild(elemento('li', tipo)));

  // CAVERNA: habilidades.
  habilidadesEl.replaceChildren();
  pokemon.habilidades.forEach(h => habilidadesEl.appendChild(elemento('li', h)));

  // CAVERNA: os seis atributos, cada um com numero e barra.
  atributosEl.replaceChildren();
  pokemon.atributos.forEach(function (atributo) {
    const linha = elemento('tr');
    linha.appendChild(elemento('th', atributo.nome));
    linha.appendChild(elemento('td', String(atributo.valor)));

    const celulaBarra = elemento('td');
    const barra = elemento('progress');
    barra.value = atributo.valor;
    barra.max = ATRIBUTO_MAXIMO;
    celulaBarra.appendChild(barra);
    linha.appendChild(celulaBarra);

    atributosEl.appendChild(linha);
  });

  atualizarBotaoFavorito();
}

async function carregarDetalhes() {
  const id = parametroDaURL('id') || '1'; // CAVERNA: sem id? mostra o Bulbasaur
  definirEstado('carregando');

  try {
    pokemonAtual = await obterPokemon(id);
    desenharPokemon(pokemonAtual);
    definirEstado('pronto');
  } catch (erro) {
    definirEstado('erro', erro.message); // RF007
  }
}

/* CAVERNA: aperta botao -> guarda ou tira o bicho INTEIRO da pedra (HU03). */
botaoFavorito.addEventListener('click', function () {
  if (!pokemonAtual) return;
  alternarFavorito(pokemonAtual);
  atualizarBotaoFavorito();
});

botaoTentar.addEventListener('click', carregarDetalhes);

carregarDetalhes();
