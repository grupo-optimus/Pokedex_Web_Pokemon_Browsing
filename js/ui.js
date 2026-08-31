/* ==========================================================================
   Pedacos de tela que as tres paginas usam igual.
   Monta elemento no braco (createElement + textContent) em vez de innerHTML:
   assim texto vindo de fora nunca vira codigo dentro da pagina.
   ========================================================================== */

function elemento(tag, texto) {
  const el = document.createElement(tag);
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function mostrar(el, visivel) {
  if (el) el.hidden = !visivel;
}

/* #1 vira #001. So enfeite de Pokedex. */
function numeroFormatado(id) {
  return '#' + String(id).padStart(3, '0');
}

/* --------------------------------------------------------------------------
   As plaquinhas de tipo (Fogo, Água, ...).
   O nome do tipo vai tambem no data-tipo: e por ele que o CSS escolhe a cor.
   -------------------------------------------------------------------------- */
function criarPlacasDeTipo(tipos) {
  const caixa = elemento('p');
  caixa.className = 'tipos';

  tipos.forEach(function (tipo) {
    const placa = elemento('span', tipo);
    placa.className = 'tipo';
    placa.dataset.tipo = tipo;
    caixa.appendChild(placa);
  });

  return caixa;
}

/* --------------------------------------------------------------------------
   A estrelinha de favoritar, no canto do card (RF004).
   Assim da pra guardar o Pokemon sem precisar abrir a tela dele.
   Guarda o Pokemon INTEIRO, igual o botao da tela de detalhes (HU03).
   So a estrela aparece; o texto vive no title e no aria-label, pra quem
   usa leitor de tela nao ficar so com um simbolo solto.
   -------------------------------------------------------------------------- */
function criarBotaoFavorito(pokemon) {
  const botao = elemento('button');
  botao.type = 'button';
  botao.className = 'estrela-favorito';

  function pintar() {
    const favorito = estaFavoritado(pokemon.id);
    const texto = favorito
      ? 'Remover ' + pokemon.nome + ' dos favoritos'
      : 'Adicionar ' + pokemon.nome + ' aos favoritos';

    botao.textContent = favorito ? '★' : '☆';
    botao.setAttribute('aria-pressed', String(favorito));
    botao.setAttribute('aria-label', texto);
    botao.title = texto;
  }

  botao.addEventListener('click', function (evento) {
    // A estrela fica em cima do card, que e um link. Sem isso o
    // Clique na estrela abriria a tela do Pokemon tambem.
    evento.preventDefault();
    evento.stopPropagation();
    alternarFavorito(pokemon);
    pintar();
  });

  pintar();
  return botao;
}

/* --------------------------------------------------------------------------
   O card de Pokemon. Usado na lista e nos favoritos.
   "comBotaoFavorito" poe a estrela de guardar (usado na lista).
   "comBotaoRemover" poe o botao de remover (usado nos favoritos).
   -------------------------------------------------------------------------- */
function criarCardPokemon(pokemon, opcoes) {
  opcoes = opcoes || {};

  const item = elemento('li');
  const card = elemento('article');

  const link = elemento('a');
  link.href = 'detalhes.html?id=' + pokemon.id;

  const img = elemento('img');
  img.src = pokemon.imagem;
  img.alt = pokemon.nome;
  img.width = 146;
  img.height = 146;
  img.loading = 'lazy'; // So carrega imagem quando chega perto do olho

  // Numero e nome em pedacos separados, pra cada um ter sua cor no tema.
  const titulo = elemento('h3');
  const numero = elemento('span', numeroFormatado(pokemon.id));
  numero.className = 'dex-numero';
  const nome = elemento('span', pokemon.nome);
  nome.className = 'dex-nome';
  titulo.appendChild(numero);
  titulo.appendChild(nome);

  link.appendChild(img);
  link.appendChild(titulo);
  card.appendChild(link);

  // Tipo(s) do Pokemon, ja em portugues, cada um na sua plaquinha colorida.
  card.appendChild(criarPlacasDeTipo(pokemon.tipos));

  if (opcoes.comBotaoFavorito) {
    card.appendChild(criarBotaoFavorito(pokemon));
  }

  if (opcoes.comBotaoRemover) {
    const botao = elemento('button', '✖ Remover dos favoritos');
    botao.type = 'button';
    botao.addEventListener('click', function () {
      removerFavorito(pokemon.id);
      if (opcoes.aoRemover) opcoes.aoRemover();
    });
    card.appendChild(botao);
  }

  item.appendChild(card);
  return item;
}

/* Le ?id=25 do endereco da pagina. */
function parametroDaURL(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

/* ==========================================================================
   O BOTAO VOLTAR
   Ele volta pro ESTADO em que a lista estava: pagina 2, a busca por
   "charizard", o filtro de lendarios. Nao pro comeco da Pokedex.

   Como: a tela da lista anota o proprio endereco no sessionStorage a cada
   mudanca. O Voltar le essa anotacao e vai direto pra la.

   Por que nao so history.back(): back() depende de QUEM esta atras no
   historico. Se a pessoa pulou de um Pokemon pro outro pela linha evolutiva,
   o "atras" e outro Pokemon, e nao a lista. A anotacao nao tem essa duvida.
   ========================================================================== */
const CHAVE_ULTIMA_LISTA = 'optimusdex:ultima-lista';

/* A tela da lista chama isso a cada vez que muda de pagina, busca ou filtro. */
function guardarUltimaLista(endereco) {
  try {
    window.sessionStorage.setItem(CHAVE_ULTIMA_LISTA, endereco);
  } catch (erro) {
    // Navegador bloqueando armazenamento. O Voltar cai no href do HTML.
  }
}

function lerUltimaLista() {
  try {
    return window.sessionStorage.getItem(CHAVE_ULTIMA_LISTA) || '';
  } catch (erro) {
    return '';
  }
}

function ligarBotaoVoltar() {
  const botao = document.getElementById('btn-voltar');
  if (!botao) return;

  const destino = lerUltimaLista();

  // Sem anotacao (abriu o link direto, ou aba nova), o href="index.html" do
  // HTML resolve. Por isso ele continua la e nao foi trocado por um onclick.
  if (!destino) return;

  // Deixa o endereco certo ja no href: quem abre em nova aba ou passa o mouse
  // pra ver o destino tambem ve o lugar certo.
  botao.href = destino;

  botao.addEventListener('click', function (evento) {
    evento.preventDefault();

    // Se a lista e mesmo a tela anterior, back() e melhor que ir no endereco:
    // devolve a posicao da rolagem e nao empilha entrada nova no historico.
    if (document.referrer === destino) {
      window.history.back();
    } else {
      window.location.href = destino;
    }
  });
}

ligarBotaoVoltar();
