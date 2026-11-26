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


/* --------------------------------------------------------------------------
   TRADUÇÃO DAS HISTÓRIAS DA POKÉDEX
   A história é buscada em inglês na PokéAPI. Esta função traduz o texto para
   português sem alterar o texto original recebido da API.

   O tradutor externo é usado somente para a tradução; os dados do Pokémon
   continuam vindo exclusivamente da PokéAPI.
   -------------------------------------------------------------------------- */
async function traduzirHistoria(textoIngles) {
  const texto = String(textoIngles || '').trim();

  if (!texto) {
    return '';
  }

  // A API de tradução trabalha melhor com trechos curtos. Mantemos cada
  // requisição abaixo de aproximadamente 450 caracteres.
  const trechos = dividirTextoParaTraducao(texto, 450);
  const traducoes = [];

  for (const trecho of trechos) {
    try {
      const url = 'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(trecho) + '&langpair=en|pt-BR';

      const resposta = await fetch(url);

      if (!resposta.ok) {
        throw new Error('Falha no serviço de tradução.');
      }

      const dados = await resposta.json();
      const traduzido = dados && dados.responseData
        ? dados.responseData.translatedText
        : '';

      if (!traduzido) {
        throw new Error('A tradução não retornou texto.');
      }

      traducoes.push(normalizarHistoriaTraduzida(traduzido));
    } catch (erro) {
      // Não esconde uma falha do tradutor: quem chama a função pode decidir
      // mostrar a história original ou uma mensagem de erro.
      throw new Error('Não foi possível traduzir a história para português.');
    }
  }

  return traducoes.join(' ');
}

function dividirTextoParaTraducao(texto, limite) {
  const palavras = texto.split(/(\s+)/);
  const partes = [];
  let atual = '';

  palavras.forEach(function (palavra) {
    if (atual.length + palavra.length <= limite) {
      atual += palavra;
      return;
    }

    if (atual.trim()) {
      partes.push(atual.trim());
    }

    atual = palavra.trimStart();
  });

  if (atual.trim()) {
    partes.push(atual.trim());
  }

  return partes;
}

function normalizarHistoriaTraduzida(texto) {
  return String(texto)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

/* --------------------------------------------------------------------------
   ITENS DE EVOLUCAO
   So os itens que fazem alguem evoluir. O resto do saco de itens da PokeAPI
   nao interessa aqui. O que faltar cai no arrumarTexto, igual habilidade.
   -------------------------------------------------------------------------- */
const ITENS_PT = {
  'fire-stone': 'a Pedra do Fogo',        'water-stone': 'a Pedra da Água',
  'thunder-stone': 'a Pedra do Trovão',   'leaf-stone': 'a Pedra da Folha',
  'moon-stone': 'a Pedra da Lua',         'sun-stone': 'a Pedra do Sol',
  'shiny-stone': 'a Pedra Brilhante',     'dusk-stone': 'a Pedra do Crepúsculo',
  'dawn-stone': 'a Pedra da Aurora',      'ice-stone': 'a Pedra do Gelo',
  'oval-stone': 'a Pedra Oval',           'kings-rock': 'a Coroa do Rei',
  'metal-coat': 'o Revestimento de Metal','dragon-scale': 'a Escama de Dragão',
  'up-grade': 'o Upgrade',                'dubious-disc': 'o Disco Duvidoso',
  'protector': 'o Protetor',              'electirizer': 'o Eletrizador',
  'magmarizer': 'o Magmatizador',         'reaper-cloth': 'o Manto do Ceifador',
  'razor-claw': 'a Garra Afiada',         'razor-fang': 'a Presa Afiada',
  'deep-sea-tooth': 'o Dente do Mar Profundo',
  'deep-sea-scale': 'a Escama do Mar Profundo',
  'prism-scale': 'a Escama Prismática',   'sachet': 'o Sachê',
  'whipped-dream': 'o Creme Chantili',    'tart-apple': 'a Maçã Azeda',
  'sweet-apple': 'a Maçã Doce',           'syrupy-apple': 'a Maçã Melada',
  'cracked-pot': 'o Bule Rachado',        'chipped-pot': 'o Bule Lascado',
  'galarica-cuff': 'o Bracelete de Galarica',
  'galarica-wreath': 'a Coroa de Galarica',
  'black-augurite': 'a Augurita Negra',   'peat-block': 'o Bloco de Turfa',
  'linking-cord': 'o Cordão de Ligação',  'metal-alloy': 'a Liga de Metal',
  'auspicious-armor': 'a Armadura Auspiciosa',
  'malicious-armor': 'a Armadura Maliciosa',
  'scroll-of-darkness': 'o Pergaminho das Trevas',
  'scroll-of-waters': 'o Pergaminho das Águas',
  'leaders-crest': 'o Brasão do Líder',   'gimmighoul-coin': 'a Moeda de Gimmighoul'
};

/* O empurrao que dispara a evolucao. E a lista fechada do /evolution-trigger. */
const GATILHOS_PT = {
  'level-up': 'Subir de nível',
  'trade': 'Trocar com outro treinador',
  'use-item': 'Usar um item',
  'shed': 'Subir de nível com uma vaga na equipe e uma Poké Ball sobrando',
  'spin': 'Girar com o item equipado',
  'tower-of-darkness': 'Treinar na Torre das Trevas',
  'tower-of-waters': 'Treinar na Torre das Águas',
  'three-critical-hits': 'Dar três golpes críticos na mesma batalha',
  'take-damage': 'Levar dano no ponto certo do mapa',
  'agile-style-move': 'Usar um golpe no estilo Ágil várias vezes',
  'strong-style-move': 'Usar um golpe no estilo Forte várias vezes',
  'recoil-damage': 'Acumular dano de recuo',
  'other': 'Método especial'
};

const MOMENTOS_PT = {
  day: 'de dia',
  night: 'à noite',
  dusk: 'ao entardecer'
};

function traduzirItem(nomeIngles) {
  return ITENS_PT[nomeIngles] || arrumarTexto(nomeIngles);
}

/* --------------------------------------------------------------------------
   O "COMO EVOLUIR" EM UMA FRASE.

   A PokeAPI descreve a evolucao como uma ficha de campos soltos: gatilho,
   nivel minimo, item, hora do dia, amizade, local... Quase todos vem nulos.
   Aqui os que sobraram viram uma frase so: uma acao principal (o gatilho)
   mais as condicoes penduradas nela.

   Eevee e o caso que mais aparece: Vaporeon sai de "use-item + water-stone",
   Umbreon de "level-up + min_happiness 160 + night".
   -------------------------------------------------------------------------- */
function descreverEvolucao(detalhe) {
  if (!detalhe) return '';

  const gatilho = (detalhe.trigger && detalhe.trigger.name) || '';
  const condicoes = [];

  // A acao principal. Quando o gatilho ja carrega o dado que interessa
  // (o item usado, o nivel exigido), ele entra logo na frase de abertura.
  let frase;
  if (gatilho === 'use-item' && detalhe.item) {
    frase = 'Usar ' + traduzirItem(detalhe.item.name);
  } else if (gatilho === 'level-up' && detalhe.min_level) {
    frase = 'Chegar ao nível ' + detalhe.min_level;
  } else if (gatilho === 'trade' && detalhe.trade_species) {
    frase = 'Trocar por ' + arrumarTexto(detalhe.trade_species.name);
  } else {
    frase = GATILHOS_PT[gatilho] || 'Método especial';
  }

  // As condicoes penduradas. Cada if so entra se a API mandou o campo.
  if (gatilho !== 'use-item' && detalhe.item) {
    condicoes.push('usando ' + traduzirItem(detalhe.item.name));
  }
  if (gatilho !== 'level-up' && detalhe.min_level) {
    condicoes.push('a partir do nível ' + detalhe.min_level);
  }
  if (detalhe.held_item) {
    condicoes.push('segurando ' + traduzirItem(detalhe.held_item.name));
  }
  if (detalhe.min_happiness) {
    condicoes.push('com amizade alta (' + detalhe.min_happiness + '+)');
  }
  if (detalhe.min_affection) {
    condicoes.push('com afeto ' + detalhe.min_affection + '+');
  }
  if (detalhe.min_beauty) {
    condicoes.push('com beleza ' + detalhe.min_beauty + '+');
  }
  if (detalhe.time_of_day && MOMENTOS_PT[detalhe.time_of_day]) {
    condicoes.push(MOMENTOS_PT[detalhe.time_of_day]);
  }
  if (detalhe.known_move) {
    condicoes.push('sabendo o golpe ' + arrumarTexto(detalhe.known_move.name));
  }
  if (detalhe.known_move_type) {
    condicoes.push('sabendo um golpe do tipo ' + traduzirTipo(detalhe.known_move_type.name));
  }
  if (detalhe.location) {
    condicoes.push('em ' + arrumarTexto(detalhe.location.name));
  }
  if (detalhe.near_special_rock) {
    condicoes.push('perto da pedra especial do local');
  }
  if (detalhe.gender === 1) condicoes.push('sendo fêmea');
  if (detalhe.gender === 2) condicoes.push('sendo macho');
  if (detalhe.needs_overworld_rain) {
    condicoes.push('com chuva caindo no mapa');
  }
  if (detalhe.party_species) {
    condicoes.push('com ' + arrumarTexto(detalhe.party_species.name) + ' na equipe');
  }
  if (detalhe.party_type) {
    condicoes.push('com um Pokémon do tipo ' + traduzirTipo(detalhe.party_type.name) + ' na equipe');
  }
  if (detalhe.relative_physical_stats === 1)  condicoes.push('com Ataque maior que Defesa');
  if (detalhe.relative_physical_stats === 0)  condicoes.push('com Ataque igual à Defesa');
  if (detalhe.relative_physical_stats === -1) condicoes.push('com Defesa maior que Ataque');
  if (detalhe.turn_upside_down) {
    condicoes.push('com o console de cabeça para baixo');
  }

  return condicoes.length > 0 ? frase + ' ' + condicoes.join(', ') : frase;
}
