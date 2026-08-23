/* ==========================================================================
   CAVERNA: pedacos de tela que as tres paginas usam igual.
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

/* CAVERNA: #1 vira #001. So enfeite de Pokedex. */
function numeroFormatado(id) {
  return '#' + String(id).padStart(3, '0');
}

/* --------------------------------------------------------------------------
   CAVERNA: o card de bicho. Usado na lista e nos favoritos.
   Se "comBotaoRemover" for true, ganha botao de tirar da caverna (RF004).
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
  img.width = 120;
  img.height = 120;
  img.loading = 'lazy'; // CAVERNA: so carrega imagem quando chega perto do olho

  const titulo = elemento('h3', numeroFormatado(pokemon.id) + ' ' + pokemon.nome);

  link.appendChild(img);
  link.appendChild(titulo);
  card.appendChild(link);

  // CAVERNA: tipo(s) do bicho, ja em portugues.
  card.appendChild(elemento('p', pokemon.tipos.join(', ')));

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

/* CAVERNA: le ?id=25 do endereco da pagina. */
function parametroDaURL(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}
