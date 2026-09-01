/* ==========================================================================
   Comparacao de Pokemon. A selecao vive no sessionStorage para atravessar
   paginas sem transformar a URL em uma lista enorme de parametros.
   Limite: 6 Pokemon.
   ========================================================================== */

const CHAVE_COMPARACAO = 'optimusdex:comparacao';
const MAX_POKEMONS_COMPARACAO = 6;

function lerComparacao() {
  try {
    const texto = sessionStorage.getItem(CHAVE_COMPARACAO);
    const ids = texto ? JSON.parse(texto) : [];
    return Array.isArray(ids)
      ? ids.map(Number).filter(id => Number.isInteger(id) && id > 0).slice(0, MAX_POKEMONS_COMPARACAO)
      : [];
  } catch (erro) {
    return [];
  }
}

function salvarComparacao(ids) {
  try {
    sessionStorage.setItem(CHAVE_COMPARACAO, JSON.stringify(ids));
    return true;
  } catch (erro) {
    return false;
  }
}

function estaNaComparacao(id) {
  return lerComparacao().includes(Number(id));
}

function adicionarComparacao(pokemon) {
  const ids = lerComparacao();
  const id = Number(pokemon.id);

  if (ids.includes(id)) return { sucesso: true, adicionou: false, cheia: false };
  if (ids.length >= MAX_POKEMONS_COMPARACAO) return { sucesso: false, adicionou: false, cheia: true };

  ids.push(id);
  return { sucesso: salvarComparacao(ids), adicionou: true, cheia: false };
}

function removerComparacao(id) {
  const ids = lerComparacao().filter(item => item !== Number(id));
  return salvarComparacao(ids);
}

function alternarComparacao(pokemon) {
  if (estaNaComparacao(pokemon.id)) {
    removerComparacao(pokemon.id);
    return { selecionado: false, cheia: false };
  }

  const resultado = adicionarComparacao(pokemon);
  return {
    selecionado: resultado.sucesso && resultado.adicionou,
    cheia: resultado.cheia
  };
}

function limparComparacao() {
  return salvarComparacao([]);
}
