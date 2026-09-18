/* ==========================================================================
   Os tipos ficam guardados pela chave em ingles (fire, water...), que e
   o nome oficial deles. A tela fala portugues. Este arquivo e o tradutor.
   RNF005 manda mostrar o tipo traduzido.
   ========================================================================== */

/* Os 18 tipos de Pokemon. chave = nome oficial em ingles, valor = nosso idioma. */
const TIPOS_PT = {
  normal: 'Normal',      fighting: 'Lutador',  flying: 'Voador',
  poison: 'Venenoso',    ground: 'Terrestre',  rock: 'Pedra',
  bug: 'Inseto',         ghost: 'Fantasma',    steel: 'Aço',
  fire: 'Fogo',          water: 'Água',        grass: 'Grama',
  electric: 'Elétrico',  psychic: 'Psíquico',  ice: 'Gelo',
  dragon: 'Dragão',      dark: 'Sombrio',      fairy: 'Fada',
  stellar: 'Estelar',    unknown: 'Desconhecido'
};

/* Tira traco, poe maiuscula. "solar-power" vira "Solar Power". */
function arrumarTexto(texto) {
  return texto
    .split('-')
    .map(pedaco => pedaco.charAt(0).toUpperCase() + pedaco.slice(1))
    .join(' ');
}

function traduzirTipo(nomeIngles) {
  return TIPOS_PT[nomeIngles] || arrumarTexto(nomeIngles);
}

/* RF002 manda ignorar maiuscula e acento na busca.
   normalize('NFD') separa a letra do acento; o regex joga acento fora.
   "Pokémon" vira "pokemon". Assim busca acha do mesmo jeito. */
function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
