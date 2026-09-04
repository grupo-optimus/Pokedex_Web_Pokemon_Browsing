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
const botaoComparar  = document.getElementById('btn-comparar');
const superEficazEl  = document.getElementById('poke-super-eficaz');
const vantagensEl    = document.getElementById('poke-vantagens');
const fraquezasEl    = document.getElementById('poke-fraquezas');
const imunidadesEl   = document.getElementById('poke-imunidades');

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

  const encontrada = regras.find(regra => regra.padrao.test(nomeApi));
  return encontrada ? encontrada.rotulo : 'FORMA';
}

function criarElo(pokemon) {
  const elo = elemento('a');
  elo.className = 'evo';
  elo.href = 'detalhes.html?id=' + pokemon.id;

  if (pokemon.id === pokemonAtual.id) {
    elo.classList.add('evo-atual');
  }

  const formaEspecial = identificarFormaEspecial(pokemon);
  if (formaEspecial) {
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

  if (formaEspecial) {
    const badge = elemento('span', formaEspecial);
    badge.className = 'forma-especial-badge';
    badge.setAttribute('aria-label', 'Forma especial: ' + formaEspecial);
    elo.appendChild(badge);
  }

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

    // Mega/Gmax ocupam o mesmo andar da especie-base. Por isso uma linha com
    // apenas um estagio ainda e valida quando esse estagio possui mais de um item.
    const temMaisDeUmItem = linha.some(function (andar) {
      return andar.length > 1;
    });

    if (linha.length === 0 || (linha.length === 1 && !temMaisDeUmItem)) {
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

carregarDetalhes();
