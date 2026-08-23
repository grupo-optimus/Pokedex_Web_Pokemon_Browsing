/* ==========================================================================
   CAVERNA: caverna de guardar bicho. Usa localStorage do navegador.
   RF005 + RNF001: dado fica salvo, sem login, e sobrevive a fechar navegador.
   HU03: guarda o bicho INTEIRO (imagem, tipo, atributos), nao so o numero.
   ========================================================================== */

const CHAVE_FAVORITOS = 'pokelista:favoritos';

/* CAVERNA: le a pedra. localStorage so guarda texto, entao JSON.parse
   transforma texto de volta em lista de objeto. */
function listarFavoritos() {
  try {
    const texto = localStorage.getItem(CHAVE_FAVORITOS);
    return texto ? JSON.parse(texto) : [];
  } catch (erro) {
    // CAVERNA: pedra rabiscada ou navegador bloqueando. Melhor lista vazia que tela quebrada.
    return [];
  }
}

/* CAVERNA: escreve na pedra. JSON.stringify vira texto. */
function salvarFavoritos(lista) {
  try {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
    return true;
  } catch (erro) {
    return false;
  }
}

function estaFavoritado(id) {
  return listarFavoritos().some(item => item.id === id);
}

function adicionarFavorito(pokemon) {
  const lista = listarFavoritos();
  if (!lista.some(item => item.id === pokemon.id)) {
    lista.push(pokemon);
    lista.sort((a, b) => a.id - b.id); // CAVERNA: em ordem de numero, fica bonito
    salvarFavoritos(lista);
  }
}

function removerFavorito(id) {
  salvarFavoritos(listarFavoritos().filter(item => item.id !== id));
}

/* CAVERNA: mesmo botao poe e tira (RF004). Devolve true se ficou favorito. */
function alternarFavorito(pokemon) {
  if (estaFavoritado(pokemon.id)) {
    removerFavorito(pokemon.id);
    return false;
  }
  adicionarFavorito(pokemon);
  return true;
}
