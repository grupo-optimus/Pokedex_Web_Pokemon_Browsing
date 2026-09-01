/* ==========================================================================
   Guarda-Pokemon. Usa localStorage do navegador.
   RF005 + RNF001: dado fica salvo, sem login, e sobrevive a fechar navegador.
   HU03: guarda o Pokemon INTEIRO (imagem, tipo, atributos), nao so o numero.
   ========================================================================== */

const CHAVE_FAVORITOS = 'pokelista:favoritos';

/* Le o que esta salvo. O localStorage so guarda texto, entao JSON.parse
   transforma texto de volta em lista de objeto. */
function listarFavoritos() {
  try {
    const texto = localStorage.getItem(CHAVE_FAVORITOS);
    return texto ? JSON.parse(texto) : [];
  } catch (erro) {
    // Dado corrompido ou navegador bloqueando. Melhor lista vazia que tela quebrada.
    return [];
  }
}

/* Escreve no localStorage. JSON.stringify vira texto. */
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
    lista.sort((a, b) => a.id - b.id); // Em ordem de numero, fica bonito
    salvarFavoritos(lista);
  }
}

function removerFavorito(id) {
  salvarFavoritos(listarFavoritos().filter(item => item.id !== id));
}

/* Mesmo botao poe e tira (RF004). Devolve true se ficou favorito. */
function alternarFavorito(pokemon) {
  if (estaFavoritado(pokemon.id)) {
    removerFavorito(pokemon.id);
    return false;
  }
  adicionarFavorito(pokemon);
  return true;
}
