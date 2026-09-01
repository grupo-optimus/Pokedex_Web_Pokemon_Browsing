/* ==========================================================================
   A PokeAPI responde em ingles. A tela fala portugues.
   Este arquivo e o tradutor. RNF005 manda traduzir tipo e habilidade.
   ========================================================================== */

/* Os 18 tipos de Pokemon. chave = ingles da API, valor = nosso idioma. */
const TIPOS_PT = {
  normal: 'Normal',      fighting: 'Lutador',  flying: 'Voador',
  poison: 'Venenoso',    ground: 'Terrestre',  rock: 'Pedra',
  bug: 'Inseto',         ghost: 'Fantasma',    steel: 'Aço',
  fire: 'Fogo',          water: 'Água',        grass: 'Grama',
  electric: 'Elétrico',  psychic: 'Psíquico',  ice: 'Gelo',
  dragon: 'Dragão',      dark: 'Sombrio',      fairy: 'Fada',
  stellar: 'Estelar',    unknown: 'Desconhecido'
};

/* Os seis atributos-base pedidos no RF003. */
const ATRIBUTOS_PT = {
  'hp': 'HP',
  'attack': 'Ataque',
  'defense': 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  'speed': 'Velocidade'
};

/* Habilidade e muita (mais de 300). traduz as comuns.
   O que nao tiver aqui vira texto arrumado, sem traco e com maiuscula. */
const HABILIDADES_PT = {
  'overgrow': 'Supercrescimento',   'blaze': 'Chama Viva',
  'torrent': 'Torrente',            'shield-dust': 'Pó de Escudo',
  'chlorophyll': 'Clorofila',       'solar-power': 'Poder Solar',
  'rain-dish': 'Prato de Chuva',    'swarm': 'Enxame',
  'keen-eye': 'Olho Aguçado',       'run-away': 'Fuga',
  'static': 'Estática',             'lightning-rod': 'Para-raios',
  'sand-veil': 'Véu de Areia',      'intimidate': 'Intimidar',
  'poison-point': 'Ponto Venenoso', 'rivalry': 'Rivalidade',
  'cute-charm': 'Charme Fofo',      'flash-fire': 'Fogo Súbito',
  'inner-focus': 'Foco Interior',   'synchronize': 'Sincronizar',
  'guts': 'Coragem',                'levitate': 'Levitação',
  'water-absorb': 'Absorver Água',  'damp': 'Umidade',
  'thick-fat': 'Gordura Grossa',    'immunity': 'Imunidade',
  'pressure': 'Pressão',            'sturdy': 'Robustez',
  'rock-head': 'Cabeça Dura',       'huge-power': 'Poder Imenso',
  'technician': 'Técnico',          'adaptability': 'Adaptabilidade'
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

function traduzirAtributo(nomeIngles) {
  return ATRIBUTOS_PT[nomeIngles] || arrumarTexto(nomeIngles);
}

function traduzirHabilidade(nomeIngles) {
  return HABILIDADES_PT[nomeIngles] || arrumarTexto(nomeIngles);
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
