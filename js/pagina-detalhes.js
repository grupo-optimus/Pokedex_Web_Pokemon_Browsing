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
const atributosEl    = document.getElementById('poke-atributos');
const botaoFavorito  = document.getElementById('btn-favorito');
const botaoShiny     = document.getElementById('btn-shiny');

const evolucaoEl     = document.getElementById('linha-evolucao');
const evoCarregandoEl= document.getElementById('evolucao-carregando');
const evoVaziaEl     = document.getElementById('evolucao-vazia');
const evoErroEl      = document.getElementById('evolucao-erro');

let pokemonAtual = null;

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

/* Repinta o visor grande E os sprites da linha evolutiva.
   Cada sprite da linha guarda os dois enderecos em data-normal / data-shiny. */
function trocarSprites() {
  if (pokemonAtual) imagemEl.src = desenhoAtual(pokemonAtual);

  evolucaoEl.querySelectorAll('img').forEach(function (img) {
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

  atualizarBotaoFavorito();
}

/* --------------------------------------------------------------------------
   LINHA EVOLUTIVA. Um elo = um Pokemon da cadeia, clicavel.
   O elo do Pokemon que esta aberto agora fica marcado.
   -------------------------------------------------------------------------- */
function criarElo(pokemon) {
  const elo = elemento('a');
  elo.className = 'evo';
  elo.href = 'detalhes.html?id=' + pokemon.id;
  if (pokemon.id === pokemonAtual.id) elo.classList.add('evo-atual');

  const img = elemento('img');
  img.src = desenhoAtual(pokemon);
  img.alt = pokemon.nome;
  img.width = 128;
  img.height = 128;
  img.loading = 'lazy';

  // Guarda os dois desenhos aqui pro botao de shiny trocar depois.
  img.dataset.normal = pokemon.imagem;
  if (pokemon.imagemShiny) img.dataset.shiny = pokemon.imagemShiny;

  const numero = elemento('span', numeroFormatado(pokemon.id));
  numero.className = 'dex-numero';

  const nome = elemento('span', pokemon.nome);
  nome.className = 'dex-nome';

  elo.appendChild(img);
  elo.appendChild(numero);
  elo.appendChild(nome);
  return elo;
}

/* Liga um estado de cada vez, igual as outras telas fazem. */
function estadoEvolucao(estado) {
  mostrar(evoCarregandoEl, estado === 'carregando');
  mostrar(evoVaziaEl,      estado === 'vazia');
  mostrar(evoErroEl,       estado === 'erro');
  mostrar(evolucaoEl,      estado === 'pronto');
}

function desenharEvolucao(linha) {
  evolucaoEl.replaceChildren();

  linha.forEach(function (andar) {
    const estagio = elemento('li');
    estagio.className = 'estagio';

    // Um andar pode ter varios Pokemon (Eevee tem 8). Empilha todos.
    const formas = elemento('div');
    formas.className = 'formas';
    andar.forEach(pokemon => formas.appendChild(criarElo(pokemon)));

    estagio.appendChild(formas);
    evolucaoEl.appendChild(estagio);
  });
}

/* A cadeia vem DEPOIS do Pokemon, em pedido separado.
   Se falhar, so essa secao avisa: o resto da ficha continua na tela. */
async function carregarEvolucao(id) {
  estadoEvolucao('carregando');

  try {
    const linha = await obterLinhaEvolutiva(id);

    // Um andar so = Pokemon que nao evolui nem veio de ninguem.
    if (linha.length <= 1) {
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
  const sprites = [imagemEl].concat(
    Array.from(evolucaoEl.querySelectorAll('img'))
  );
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
botaoShiny.addEventListener('click', function () {
  modoShiny = !modoShiny;
  botaoShiny.textContent = modoShiny ? 'Ver normal' : 'Ver shiny';
  botaoShiny.setAttribute('aria-pressed', String(modoShiny));

  trocarSprites();
  brilharTudo();

  if (modoShiny) soltarFaiscas();
});

botaoTentar.addEventListener('click', carregarDetalhes);

carregarDetalhes();
