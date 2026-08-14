/* Flowering month and flower colour for the plant list.

   NOT from the project documents — none of them record flowering. These are
   horticultural figures for a cool-temperate Canberra garden, southern
   hemisphere, and they are the one part of this app that is judgement rather
   than survey. Correct anything you disagree with: it is read only by the bloom
   calendar on the printed set.

   Keyed by plant name, because that is what the app stores on a placed plant
   and because the ids in the plant list are not unique — 52 is both Eucalyptus
   rossii and the dwarf corymbia, and several entries have no id at all.

     [fromMonth, toMonth, flowerColour, colourName]   months 1–12, may wrap
     null                                             no flower worth charting

   A wrapped range (11 to 2) means November through February. */
window.BLOOM = {

  /* grasses and strappy things — flowerheads more than flowers */
  'Tussock grass - Poa labillardierei':          [10, 1,  '#c9bb92', 'straw'],
  'Poa sieberiana':                              [10, 12, '#c9bb92', 'straw'],
  '‘Tanika’ grass Lomandra longfolia':           [9,  11, '#e0d283', 'cream-yellow'],
  'Lomandra Lime Tuff':                          [9,  11, '#e0d283', 'cream-yellow'],
  'Club rush - ficinia nodosa':                  [10, 1,  '#9b8d68', 'khaki'],
  'Nafray grass':                                [1,  4,  '#987d93', 'purple-brown'],
  'Kangaroo grass - themeda australis':          [11, 3,  '#a4573e', 'red-brown'],
  'Dianella caerula ‘Little Jess’':              [9,  12, '#6a7ec4', 'blue'],
  'https://gardeningwithangus.com.au/anigozanth':[10, 2,  '#d2542d', 'red and yellow'],

  /* groundcovers */
  'grevillia laurifola x willisii ‘poorinda roy':[8,  1,  '#ad392c', 'deep red'],
  'banksia integrifoliaa':                       [2,  6,  '#e3cf72', 'pale yellow'],
  'Grevillia carpet queen - juniperina':         [5,  11, '#d1522a', 'orange-red'],
  'Cherry cluster grevillia groundcover':        [4,  11, '#bb3729', 'cherry red'],
  'Hardenbergia ‘meema’':                        [7,  10, '#68479a', 'purple'],
  'Creeping Boobialla - Myoporum parvifolium pu':[10, 2,  '#f3efe4', 'white'],
  'Grevillia australis prostrate':               [10, 2,  '#ebe1c9', 'cream'],
  'Pigface ‘cairo’':                             [9,  12, '#d1448a', 'magenta'],
  'Chrysocephalum apiculatum ‘Desert Flame’ – Y':[9,  4,  '#eeb025', 'yellow'],
  'Dichondra repens - kidney weed':              null,
  'cushion bush/lime lava - Scleranthus bifloru': null,

  /* the collected and the tender */
  'Boab tree':                                   [11, 1,  '#efe8db', 'white'],
  'Burawang':                                    null,
  'Tree fern':                                   null,
  'Protea':                                      [5,  10, '#d86f92', 'pink'],
  'Dragon tree':                                 [11, 12, '#ece5d3', 'cream-white'],
  'Gymea lily':                                  [9,  12, '#bb3729', 'crimson'],
  'acacia cognata':                              [9,  10, '#e8d675', 'pale yellow'],
  'Conebush (leukydendron) - safari sunset':     [5,  11, '#a4362b', 'red bracts'],
  'Grass tree':                                  [9,  12, '#e7dab2', 'cream spike'],
  'Waratah':                                     [9,  11, '#c30f2c', 'crimson'],
  'Stag horn':                                   null,
  'NZ flax':                                     [11, 1,  '#9f4638', 'dull red'],
  'Elk horn':                                    null,
  'Bromeliads':                                  [11, 2,  '#d44f76', 'pink-red'],
  'Autumn Joy':                                  [2,  5,  '#c46c85', 'pink to rust'],

  /* shrubs */
  'Banksia marginata':                           [2,  7,  '#e1be45', 'yellow'],
  'Calistemon Kings Park special':               [10, 12, '#bb3729', 'red'],
  'Bursaria spinosa subspecies spinosa':         [12, 2,  '#f1ecdf', 'white'],
  'eucalyptus morrisbyi':                        [9,  11, '#eee9db', 'white'],
  'hakeagrammatophylla ‘ninbella brilliance':    [6,  10, '#c7465a', 'pink-red'],
  'Correa glabra':                               [4,  9,  '#a3b265', 'green-yellow'],
  'Hakea decurrens':                             [6,  9,  '#ecdade', 'white-pink'],
  'grevillia iaspicula':                         [5,  10, '#de9eab', 'pink and cream'],
  'acacia buxifola':                             [8,  10, '#ebbf14', 'golden'],
  'podocarpus lawrencei':                        null,
  'Callistemon vimenalis ‘better john’':         [10, 12, '#cc4456', 'pink-red'],
  'Aussie flat bush/saltbush rhagodia spinescen': null,
  'Grevillia diminuta':                          [8,  12, '#a35333', 'rusty red'],
  'Hakea microcarpa':                            [10, 12, '#eee9dd', 'white'],
  'calytrix tetragona':                          [10, 12, '#eeddda', 'white-pink'],
  'callistemon pityoides':                       [11, 2,  '#e3d889', 'yellow-cream'],
  'daviesia mimosoides':                         [9,  11, '#e39b1b', 'yellow-orange'],
  'grevillia laniger':                           [4,  10, '#c75768', 'pink-red'],
  'kunzea parviflora':                           [11, 1,  '#eae1e1', 'white-pink'],
  'acacia lanigera':                             [7,  10, '#ebbf14', 'golden'],
  '• Acacia ulicifolia':                         [6,  9,  '#e7d485', 'cream-yellow'],
  'correa pulchella ‘orange glow’':              [3,  9,  '#db7634', 'orange'],

  /* trees — the eucalypts, the wattles and the orchard */
  'Eucalyptus rossii':                           [11, 2,  '#ebe7d7', 'cream-white'],
  'Eucalyptus cinera':                           [10, 12, '#ebe7d7', 'cream-white'],
  'Fig - white adriatic':                        null,
  'Macadamia tree':                              [8,  10, '#e7dfc3', 'cream'],
  'Pistachio':                                   [9,  10, '#bec383', 'green, inconspicuous'],
  'acacia implexa':                              [1,  3,  '#e7dbb3', 'cream'],
  'Quince':                                      [9,  10, '#eddadb', 'pale pink'],
  'Avocado':                                     [9,  11, '#b4bf65', 'green-yellow'],
  'Cherry':                                      [9,  10, '#f1e1e3', 'white-pink'],
  'Plum tree':                                   [8,  9,  '#f1ede5', 'white'],
  'acacia rubida':                               [8,  10, '#ebbf14', 'golden'],
  'Lisbon lemon':                                [9,  11, '#f0ede3', 'white'],
  'Bay leaf':                                    [9,  10, '#e7e6d3', 'yellow-white'],
  'Pomegranate':                                 [11, 1,  '#db4625', 'orange-red'],
  'Blood orange':                                [9,  10, '#f0ede3', 'white'],
  'Eureka lemon':                                [9,  11, '#f0ede3', 'white'],
  'Orange':                                      [9,  10, '#f0ede3', 'white'],
  'Corymbia dwarf orange eucalyptus':            [1,  4,  '#e37025', 'orange'],
  '‘Little Spotty’ Dwarf Eucalyptus mannifera -':[1,  3,  '#ebe7d7', 'cream-white'],
  'Scarlet Blaze Acacia leprosa':                [8,  10, '#bb3729', 'scarlet'],
  'Dwarf Mulberry':                              null,
  'Kafir lime':                                  [9,  11, '#f0ede3', 'white'],
  'Curry leaf':                                  [11, 1,  '#eee9dd', 'white'],
  'Nagami cumquat':                              [11, 1,  '#f0ede3', 'white'],

  'Asparagus':                                   null
};
