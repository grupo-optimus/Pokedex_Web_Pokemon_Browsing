/* ==========================================================================
   Controlador da tela 3 (favoritos.html). RF006 + RF004.
   Esta tela NAO fala com a PokeAPI: tudo ja esta salvo no localStorage.
   Por isso funciona ate sem internet.
   ========================================================================== */

const listaEl    = document.getElementById('lista-favoritos');
const vazioEl    = document.getElementById('estado-vazio');
const semBuscaEl = document.getElementById('sem-resultado');
const contadorEl = document.getElementById('contador');
const campoBusca = document.getElementById('buscaFav');
const formBusca  = document.getElementById('form-busca-fav');

function desenhar() {
  const termo = normalizarTexto(campoBusca.value);
  const todos = listarFavoritos();

  // Filtra por nome ou por numero, ignorando maiuscula e acento.
  const visiveis = termo === ''
    ? todos
    : todos.filter(p =>
        normalizarTexto(p.nome).includes(termo) || String(p.id).includes(termo)
      );

  contadorEl.textContent = todos.length + ' favorito(s)';

  listaEl.replaceChildren();
  visiveis.forEach(function (pokemon) {
    listaEl.appendChild(criarCardPokemon(pokemon, {
      comBotaoRemover: true,
      aoRemover: desenhar // Tirou um? redesenha tudo na hora
    }));
  });

  mostrar(vazioEl,    todos.length === 0);
  mostrar(semBuscaEl, todos.length > 0 && visiveis.length === 0);
  mostrar(listaEl,    visiveis.length > 0);
}

formBusca.addEventListener('submit', e => { e.preventDefault(); desenhar(); });
campoBusca.addEventListener('input', desenhar); // Filtra enquanto digita

desenhar();
