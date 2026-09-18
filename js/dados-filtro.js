/* ==========================================================================
   Tabelas fixas que o filtro usa. Aqui NAO tem pedido de rede:
   e so lista de coisa que nao muda.
   ========================================================================== */

/* Regiao do jogo = geracao. Cada geracao ocupa uma faixa continua de
   numeros da Pokedex Nacional: Kanto vai do #1 ao #151. */
const REGIOES = [
  { geracao: 1, nome: 'Kanto',  primeiro: 1,   ultimo: 151  },
  { geracao: 2, nome: 'Johto',  primeiro: 152, ultimo: 251  },
  { geracao: 3, nome: 'Hoenn',  primeiro: 252, ultimo: 386  },
  { geracao: 4, nome: 'Sinnoh', primeiro: 387, ultimo: 493  },
  { geracao: 5, nome: 'Unova',  primeiro: 494, ultimo: 649  },
  { geracao: 6, nome: 'Kalos',  primeiro: 650, ultimo: 721  },
  { geracao: 7, nome: 'Alola',  primeiro: 722, ultimo: 809  },
  { geracao: 8, nome: 'Galar',  primeiro: 810, ultimo: 905  },
  { geracao: 9, nome: 'Paldea', primeiro: 906, ultimo: 1025 }
];

/* As categorias especiais.
   'lendario' e 'mitico' saem das listas de numero aqui de baixo.
   'mega' e 'gmax' saem da CHAVE do Pokemon: formas assim sao cadastradas
   como Pokemon separado, tipo "charizard-mega-x" e "venusaur-gmax". */
const CATEGORIAS = [
  { chave: 'lendario', nome: 'Lendários'   },
  { chave: 'mitico',   nome: 'Míticos'     },
  { chave: 'mega',     nome: 'Mega'        },
  { chave: 'gmax',     nome: 'Gigantamax'  }
];

/* --------------------------------------------------------------------------
   Os NUMEROS de todos os lendarios e miticos da Pokedex Nacional.
   O filtro so mostra os que estiverem cadastrados em dados-pokemon.js.
   -------------------------------------------------------------------------- */
const IDS_LENDARIOS = [
  144, 145, 146, 150,                                    // Kanto
  243, 244, 245, 249, 250,                               // Johto
  377, 378, 379, 380, 381, 382, 383, 384,                // Hoenn
  480, 481, 482, 483, 484, 485, 486, 487, 488,           // Sinnoh
  638, 639, 640, 641, 642, 643, 644, 645, 646,           // Unova
  716, 717, 718,                                         // Kalos
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792,      // Alola
  793, 794, 795, 796, 797, 798, 799, 800, 803, 804, 805, 806,
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905, // Galar
  1001, 1002, 1003, 1004, 1007, 1008,                    // Paldea
  1014, 1015, 1016, 1017, 1024
];

const IDS_MITICOS = [
  151,                     // Mew
  251,                     // Celebi
  385, 386,                // Jirachi, Deoxys
  489, 490, 491, 492, 493, // Phione ... Arceus
  494,                     // Victini
  647, 648, 649,           // Keldeo, Meloetta, Genesect
  719, 720, 721,           // Diancie, Hoopa, Volcanion
  801, 802,                // Magearna, Marshadow
  807, 808, 809,           // Zeraora, Meltan, Melmetal
  893,                     // Zarude
  1025                     // Pecharunt
];
