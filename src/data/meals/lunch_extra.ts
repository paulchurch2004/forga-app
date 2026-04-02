import type { Meal } from '../../types/meal';

export const LUNCHES_EXTRA: Meal[] = [
  // ══════════════════════════════════════
  // ── FRENCH CLASSIC ECO (8) ──
  // ══════════════════════════════════════

  // lunch_050: Boeuf bourguignon léger
  // ground_beef_5 160g => cal 219, P 33.6, C 0, F 8.8
  // carrot 60g => cal 25, P 0.6, C 5.7, F 0.1
  // potato 120g => cal 92, P 2.4, C 20.4, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // mushrooms 60g => cal 13, P 1.9, C 2, F 0.2
  // TOTAL => cal 365, P 38.9, C 31.8, F 9.2
  {
    id: 'lunch_050',
    name: 'Bœuf bourguignon léger',
    description: 'Le bourguignon version fit : bœuf haché 5%, carottes, champignons et pommes de terre. Tout le goût sans le gras.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf haché avec l\'oignon.',
      'Ajouter carottes, champignons et pommes de terre en morceaux.',
      'Couvrir d\'eau, assaisonner et laisser mijoter 25 min.',
      'Servir bien chaud.',
    ],
    baseMacros: { calories: 365, protein: 39, carbs: 32, fat: 9 },
    tags: ['français', 'classique', 'mijoté', 'comfort'],
  },

  // lunch_051: Gratin dauphinois poulet
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // potato 150g => cal 116, P 3, C 25.5, F 0.2
  // cream_15 30g => cal 44, P 0.8, C 1.1, F 4.5
  // emmental 20g => cal 76, P 5.6, C 0, F 6
  // TOTAL => cal 484, P 55.9, C 26.6, F 16.1
  {
    id: 'lunch_051',
    name: 'Gratin dauphinois poulet',
    description: 'Du poulet grillé avec un gratin dauphinois allégé. Le combo réconfort + protéines.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 30, unit: 'ml', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper les pommes de terre en rondelles fines.',
      'Disposer en couches dans un plat, napper de crème.',
      'Gratiner avec l\'emmental au four 25 min à 200°C.',
      'Griller le poulet à la poêle et servir à côté.',
    ],
    baseMacros: { calories: 484, protein: 56, carbs: 27, fat: 16 },
    tags: ['français', 'gratin', 'comfort', 'high_protein'],
  },

  // lunch_052: Blanquette de dinde légère
  // turkey_breast 170g => cal 230, P 51, C 0, F 1.7
  // carrot 60g => cal 25, P 0.6, C 5.7, F 0.1
  // mushrooms 60g => cal 13, P 1.9, C 2, F 0.2
  // cream_15 30g => cal 44, P 0.8, C 1.1, F 4.5
  // white_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // TOTAL => cal 468, P 57.5, C 42.4, F 6.9
  {
    id: 'lunch_052',
    name: 'Blanquette de dinde légère',
    description: 'La blanquette version fit avec de la dinde et une sauce crémée allégée. Le plat de mamie en mode muscu.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'turkey_breast', name: 'Escalope de dinde', baseQuantityG: 170, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 30, unit: 'ml', roundTo: 10 },
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 120, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Couper la dinde en morceaux, faire revenir à la poêle.',
      'Ajouter carottes et champignons, couvrir d\'eau et cuire 20 min.',
      'En fin de cuisson, ajouter la crème.',
      'Servir avec le riz blanc.',
    ],
    baseMacros: { calories: 468, protein: 58, carbs: 42, fat: 7 },
    tags: ['français', 'blanquette', 'mijoté', 'high_protein'],
  },

  // lunch_053: Quiche lorraine allégée
  // egg 120g => cal 186, P 15.6, C 1.3, F 13.2
  // ham_slice 40g => cal 44, P 7.2, C 0.8, F 1.4
  // cream_15 40g => cal 58, P 1.1, C 1.5, F 6
  // emmental 25g => cal 95, P 7, C 0, F 7.5
  // wrap_tortilla 40g => cal 125, P 3.4, C 20.8, F 3.2
  // TOTAL => cal 508, P 34.3, C 24.4, F 31.3
  {
    id: 'lunch_053',
    name: 'Quiche lorraine allégée',
    description: 'La quiche lorraine revisitée avec une base tortilla et crème légère. Tout le goût, moins de calories.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: [],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'egg', name: 'Œufs', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'ham_slice', name: 'Jambon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 40, unit: 'ml', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'wrap_tortilla', name: 'Tortilla (fond)', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Placer la tortilla dans un moule à tarte.',
      'Battre les œufs avec la crème, saler, poivrer.',
      'Disposer le jambon, verser l\'appareil, parsemer d\'emmental.',
      'Cuire 25 min au four à 180°C.',
    ],
    baseMacros: { calories: 508, protein: 34, carbs: 24, fat: 31 },
    tags: ['français', 'quiche', 'classique'],
  },

  // lunch_054: Croque-monsieur maison
  // bread_whole 60g => cal 148, P 7.8, C 24.6, F 2
  // ham_slice 40g => cal 44, P 7.2, C 0.8, F 1.4
  // emmental 30g => cal 114, P 8.4, C 0, F 9
  // mixed_salad 40g => cal 7, P 0.5, C 1.2, F 0.1
  // TOTAL => cal 313, P 23.9, C 26.6, F 12.5
  {
    id: 'lunch_054',
    name: 'Croque-monsieur maison',
    description: 'Le croque-monsieur au pain complet avec jambon et emmental. Simple, rapide et efficace.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: [],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'ham_slice', name: 'Jambon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Monter le croque : pain, jambon, emmental, pain.',
      'Griller à la poêle ou au four 5 min de chaque côté.',
      'Servir avec la salade verte.',
    ],
    baseMacros: { calories: 313, protein: 24, carbs: 27, fat: 13 },
    tags: ['français', 'croque', 'rapide', 'classique'],
  },

  // lunch_055: Hachis parmentier
  // ground_beef_5 150g => cal 206, P 31.5, C 0, F 8.3
  // potato 180g => cal 139, P 3.6, C 30.6, F 0.2
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // emmental 15g => cal 57, P 4.2, C 0, F 4.5
  // TOTAL => cal 418, P 39.7, C 34.3, F 13
  {
    id: 'lunch_055',
    name: 'Hachis parmentier',
    description: 'Le hachis parmentier classique avec bœuf haché 5% et purée maison. Comfort food à la française.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les pommes de terre et les écraser en purée.',
      'Faire revenir le bœuf avec l\'oignon.',
      'Disposer la viande dans un plat, couvrir de purée.',
      'Saupoudrer d\'emmental et gratiner 15 min au four.',
    ],
    baseMacros: { calories: 418, protein: 40, carbs: 34, fat: 13 },
    tags: ['français', 'gratin', 'comfort', 'classique'],
  },

  // lunch_056: Salade niçoise
  // canned_tuna 120g => cal 139, P 31.2, C 0, F 1.2
  // egg 60g => cal 93, P 7.8, C 0.7, F 6.6
  // green_beans 80g => cal 25, P 1.5, C 5.6, F 0.1
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 342, P 41.2, C 9.4, F 16.1
  {
    id: 'lunch_056',
    name: 'Salade niçoise',
    description: 'La vraie salade niçoise : thon, œuf dur, haricots verts et tomates. Fraîche et protéinée.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'canned_tuna', name: 'Thon en boîte', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf dur', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'green_beans', name: 'Haricots verts', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire l\'œuf dur et les haricots verts.',
      'Couper les tomates en quartiers.',
      'Assembler le tout avec le thon émietté.',
      'Assaisonner à l\'huile d\'olive, sel et poivre.',
    ],
    baseMacros: { calories: 342, protein: 41, carbs: 9, fat: 16 },
    tags: ['français', 'salade', 'frais', 'niçoise'],
  },

  // lunch_057: Steak-frites léger
  // beef_steak 150g => cal 226, P 39, C 0, F 7.5
  // sweet_potato 150g => cal 129, P 2.4, C 30, F 0.2
  // mixed_salad 40g => cal 7, P 0.5, C 1.2, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 406, P 41.9, C 31.2, F 12.8
  {
    id: 'lunch_057',
    name: 'Steak-frites léger',
    description: 'Un steak de bœuf avec des frites de patate douce au four. Le classique bistrot version fitness.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Steak de bœuf', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade verte', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper la patate douce en frites, enfourner 20 min à 200°C.',
      'Cuire le steak à la poêle 3 min par face.',
      'Laisser reposer 5 min.',
      'Servir avec la salade et les frites.',
    ],
    baseMacros: { calories: 406, protein: 42, carbs: 31, fat: 13 },
    tags: ['français', 'steak', 'bistrot', 'classique'],
  },

  // ══════════════════════════════════════
  // ── FRENCH PREMIUM (6) ──
  // ══════════════════════════════════════

  // lunch_058: Saumon en croûte d'herbes
  // salmon_fillet 160g => cal 333, P 32, C 0, F 20.8
  // bread_whole 20g => cal 49, P 2.6, C 8.2, F 0.7
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // lemon_juice 10g => cal 3, P 0.1, C 1, F 0
  // TOTAL => cal 399, P 36.4, C 11.4, F 21.7
  {
    id: 'lunch_058',
    name: 'Saumon en croûte d\'herbes',
    description: 'Pavé de saumon avec une croûte de pain aux herbes. Le combo oméga-3 et saveur.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Pavé de saumon', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_whole', name: 'Chapelure complète', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélanger la chapelure avec des herbes (persil, aneth).',
      'Badigeonner le saumon de moutarde et couvrir de chapelure.',
      'Cuire au four 15 min à 200°C.',
      'Servir sur un lit d\'épinards avec le jus de citron.',
    ],
    baseMacros: { calories: 399, protein: 36, carbs: 11, fat: 22 },
    tags: ['premium', 'saumon', 'omega3', 'raffiné'],
  },

  // lunch_059: Pavé de thon sésame
  // canned_tuna 160g => cal 186, P 41.6, C 0, F 1.6
  // sesame_oil 8g => cal 71, P 0, C 0, F 8
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // avocado 50g => cal 80, P 1, C 4.5, F 7.5
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // TOTAL => cal 498, P 46.6, C 38.7, F 17.5
  {
    id: 'lunch_059',
    name: 'Pavé de thon sésame',
    description: 'Du thon snacké au sésame avec riz et avocat. Un plat de resto à la maison.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'canned_tuna', name: 'Thon', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Saisir le thon à la poêle avec l\'huile de sésame, 1 min par face.',
      'Trancher l\'avocat.',
      'Dresser le riz, le thon tranché et l\'avocat. Napper de sauce soja.',
    ],
    baseMacros: { calories: 498, protein: 47, carbs: 39, fat: 18 },
    tags: ['premium', 'thon', 'sésame', 'japonais'],
  },

  // lunch_060: Magret de canard salade
  // duck_breast 120g => cal 404, P 22.8, C 0, F 33.6
  // mixed_salad 60g => cal 10, P 0.8, C 1.8, F 0.2
  // cherry_tomato 50g => cal 9, P 0.5, C 1.9, F 0.1
  // balsamic_vinegar 10g => cal 9, P 0.1, C 1.7, F 0
  // TOTAL => cal 432, P 24.2, C 5.4, F 33.9
  {
    id: 'lunch_060',
    name: 'Magret de canard salade',
    description: 'Magret de canard tranché sur un lit de salade et tomates cerises. Chic et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'duck_breast', name: 'Magret de canard', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade mélangée', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'balsamic_vinegar', name: 'Vinaigre balsamique', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Inciser le gras du magret en croisillons.',
      'Cuire côté gras d\'abord 5 min, retourner 3 min.',
      'Laisser reposer 5 min, trancher finement.',
      'Servir sur la salade avec tomates cerises et vinaigre balsamique.',
    ],
    baseMacros: { calories: 432, protein: 24, carbs: 5, fat: 34 },
    tags: ['premium', 'canard', 'salade', 'raffiné'],
  },

  // lunch_061: Risotto crevettes
  // shrimp 150g => cal 149, P 36, C 0.3, F 0.5
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // parmesan 15g => cal 59, P 5.9, C 0, F 3.9
  // butter 5g => cal 36, P 0, C 0, F 4.1
  // TOTAL => cal 412, P 45.4, C 36.7, F 8.9
  {
    id: 'lunch_061',
    name: 'Risotto crevettes',
    description: 'Un risotto crémeux aux crevettes et parmesan. Gourmand mais pas trop lourd.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'parmesan', name: 'Parmesan', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon dans le beurre.',
      'Ajouter le riz, mouiller au bouillon louche par louche.',
      'Cuire les crevettes à part à la poêle.',
      'En fin de cuisson, ajouter parmesan et crevettes.',
    ],
    baseMacros: { calories: 412, protein: 45, carbs: 37, fat: 9 },
    tags: ['premium', 'risotto', 'crevettes', 'italien'],
  },

  // lunch_062: Salade chèvre chaud
  // goat_cheese 50g => cal 182, P 11, C 0.1, F 15
  // bread_whole 30g => cal 74, P 3.9, C 12.3, F 1
  // mixed_salad 60g => cal 10, P 0.8, C 1.8, F 0.2
  // walnuts 15g => cal 98, P 2.3, C 2.1, F 9.8
  // honey 10g => cal 30, P 0, C 8.2, F 0
  // TOTAL => cal 394, P 18, C 24.5, F 26
  {
    id: 'lunch_062',
    name: 'Salade chèvre chaud noix',
    description: 'La salade chèvre chaud avec noix et miel. Un classique des brasseries version maison.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'goat_cheese', name: 'Chèvre', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade mélangée', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Poser le chèvre sur les toasts de pain complet.',
      'Gratiner au four 5 min.',
      'Disposer sur la salade avec les noix.',
      'Arroser de miel.',
    ],
    baseMacros: { calories: 394, protein: 18, carbs: 25, fat: 26 },
    tags: ['premium', 'salade', 'chèvre', 'noix'],
  },

  // lunch_063: Tartare de saumon
  // salmon_fillet 160g => cal 333, P 32, C 0, F 20.8
  // avocado 50g => cal 80, P 1, C 4.5, F 7.5
  // cucumber 40g => cal 6, P 0.3, C 1.5, F 0.1
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 466, P 33.3, C 7, F 33.4
  {
    id: 'lunch_063',
    name: 'Tartare de saumon avocat',
    description: 'Un tartare de saumon frais avec avocat et citron vert. Frais, léger et plein d\'oméga-3.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon frais', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le saumon en petits dés.',
      'Couper l\'avocat et le concombre en dés.',
      'Mélanger le tout avec le citron vert et l\'huile de sésame.',
      'Dresser à l\'aide d\'un emporte-pièce et servir frais.',
    ],
    baseMacros: { calories: 466, protein: 33, carbs: 7, fat: 33 },
    tags: ['premium', 'tartare', 'saumon', 'cru'],
  },

  // ══════════════════════════════════════
  // ── ASIAN (12) ──
  // ══════════════════════════════════════

  // lunch_064: Pad thai crevettes
  // shrimp 120g => cal 119, P 28.8, C 0.2, F 0.4
  // rice_noodles 100g => cal 109, P 0.9, C 25, F 0.2
  // bean_sprouts 50g => cal 15, P 1.5, C 2.5, F 0.1
  // peanuts 10g => cal 57, P 2.6, C 1.6, F 4.9
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // fish_sauce 5g => cal 3, P 0.5, C 0.2, F 0
  // TOTAL => cal 381, P 40.8, C 30.1, F 11.1
  {
    id: 'lunch_064',
    name: 'Pad thai crevettes',
    description: 'Le pad thai classique avec crevettes, nouilles de riz et cacahuètes. Street food thaï à la maison.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bean_sprouts', name: 'Pousses de soja', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'fish_sauce', name: 'Sauce poisson', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les nouilles de riz, égoutter.',
      'Faire sauter les crevettes, ajouter l\'œuf brouillé.',
      'Ajouter les nouilles, pousses de soja et sauce poisson.',
      'Servir avec les cacahuètes concassées.',
    ],
    baseMacros: { calories: 381, protein: 41, carbs: 30, fat: 11 },
    tags: ['thai', 'pad_thai', 'crevettes', 'street_food'],
  },

  // lunch_065: Bibimbap boeuf
  // ground_beef_5 120g => cal 164, P 25.2, C 0, F 6.6
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // spinach 50g => cal 12, P 1.5, C 1.8, F 0.2
  // carrot 40g => cal 16, P 0.4, C 3.8, F 0.1
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 470, P 36.8, C 39.8, F 17.8
  {
    id: 'lunch_065',
    name: 'Bibimbap bœuf',
    description: 'Le bibimbap coréen avec bœuf, riz, œuf et légumes sautés. Mélange tout et c\'est parti.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz. Faire sauter le bœuf avec sauce soja.',
      'Sauter séparément épinards et carottes.',
      'Frire l\'œuf au plat.',
      'Assembler dans un bol : riz, viande, légumes, œuf. Mélanger.',
    ],
    baseMacros: { calories: 470, protein: 37, carbs: 40, fat: 18 },
    tags: ['korean', 'bibimbap', 'bowl', 'complet'],
  },

  // lunch_066: Ramen poulet miso
  // chicken_breast 140g => cal 231, P 43.4, C 0, F 5
  // udon_noodles 120g => cal 119, P 3.1, C 26.4, F 0.2
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // spinach 40g => cal 9, P 1.2, C 1.4, F 0.2
  // miso_paste 15g => cal 30, P 1.8, C 3.9, F 0.9
  // TOTAL => cal 467, P 56, C 32.3, F 11.8
  {
    id: 'lunch_066',
    name: 'Ramen poulet miso',
    description: 'Un ramen au bouillon miso avec poulet grillé et œuf mollet. Réconfortant et hyperprotéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf mollet', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'miso_paste', name: 'Pâte miso', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Préparer le bouillon miso avec de l\'eau chaude.',
      'Cuire les nouilles udon.',
      'Griller le poulet et le trancher.',
      'Assembler : nouilles, bouillon, poulet, œuf mollet, épinards.',
    ],
    baseMacros: { calories: 467, protein: 56, carbs: 32, fat: 12 },
    tags: ['japanese', 'ramen', 'miso', 'high_protein'],
  },

  // lunch_067: Chirashi saumon
  // salmon_fillet 120g => cal 250, P 24, C 0, F 15.6
  // basmati_rice 130g => cal 169, P 3.5, C 36.4, F 0.4
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // nori 3g => cal 9, P 1.5, C 1.3, F 0.1
  // rice_vinegar 5g => cal 1, P 0, C 0.2, F 0
  // TOTAL => cal 498, P 30, C 42.6, F 22.1
  {
    id: 'lunch_067',
    name: 'Chirashi saumon',
    description: 'Du saumon frais sur un lit de riz vinaigré avec avocat et nori. Le Japon dans ton bol.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon frais', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz vinaigré', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'nori', name: 'Nori', baseQuantityG: 3, unit: 'g', roundTo: 1 },
      { ingredientId: 'rice_vinegar', name: 'Vinaigre de riz', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz, mélanger avec le vinaigre de riz.',
      'Couper le saumon en tranches fines.',
      'Disposer le riz dans un bol, poser le saumon par-dessus.',
      'Ajouter l\'avocat, le concombre et le nori émietté.',
    ],
    baseMacros: { calories: 498, protein: 30, carbs: 43, fat: 22 },
    tags: ['japanese', 'chirashi', 'saumon', 'cru'],
  },

  // lunch_068: Poke bowl thon
  // canned_tuna 130g => cal 151, P 33.8, C 0, F 1.3
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // edamame 40g => cal 50, P 4.4, C 3.4, F 2.2
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // soy_sauce 8g => cal 4, P 0.6, C 0.5, F 0
  // TOTAL => cal 404, P 42.5, C 36.6, F 9.8
  {
    id: 'lunch_068',
    name: 'Poke bowl thon',
    description: 'Un poke bowl avec thon, riz, avocat et edamame. Frais, protéiné et coloré.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'canned_tuna', name: 'Thon', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz et le laisser refroidir.',
      'Disposer dans un bol : riz, thon, avocat, edamame, concombre.',
      'Assaisonner à la sauce soja.',
      'Servir frais.',
    ],
    baseMacros: { calories: 404, protein: 43, carbs: 37, fat: 10 },
    tags: ['poke', 'bowl', 'thon', 'frais'],
  },

  // lunch_069: Curry vert thaï poulet
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // coconut_milk 60g => cal 115, P 0.9, C 1.8, F 12
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // bell_pepper 50g => cal 16, P 0.5, C 3, F 0.2
  // curry_paste 10g => cal 11, P 0.3, C 1.7, F 0.3
  // TOTAL => cal 520, P 50.9, C 34.5, F 18.2
  {
    id: 'lunch_069',
    name: 'Curry vert thaï poulet',
    description: 'Un curry vert thaï au lait de coco et poulet. Parfumé, crémeux et bien protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Pâte de curry vert', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir la pâte de curry dans une poêle.',
      'Ajouter le poulet en morceaux, cuire 5 min.',
      'Verser le lait de coco, ajouter le poivron, mijoter 10 min.',
      'Servir avec le riz basmati.',
    ],
    baseMacros: { calories: 520, protein: 51, carbs: 35, fat: 18 },
    tags: ['thai', 'curry', 'poulet', 'épicé'],
  },

  // lunch_070: Bo bun boeuf
  // ground_beef_5 120g => cal 164, P 25.2, C 0, F 6.6
  // rice_noodles 80g => cal 87, P 0.7, C 20, F 0.2
  // mixed_salad 40g => cal 7, P 0.5, C 1.2, F 0.1
  // carrot 30g => cal 12, P 0.3, C 2.9, F 0
  // peanuts 10g => cal 57, P 2.6, C 1.6, F 4.9
  // fish_sauce 5g => cal 3, P 0.5, C 0.2, F 0
  // TOTAL => cal 330, P 29.8, C 25.9, F 11.8
  {
    id: 'lunch_070',
    name: 'Bo bun bœuf',
    description: 'Le bo bun vietnamien : vermicelles, bœuf sauté, crudités et cacahuètes. Frais et complet.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Vermicelles de riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte râpée', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'fish_sauce', name: 'Nuoc mam', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les vermicelles, rincer à l\'eau froide.',
      'Faire sauter le bœuf avec de la citronnelle.',
      'Disposer salade, vermicelles, carottes et bœuf.',
      'Arroser de nuoc mam et parsemer de cacahuètes.',
    ],
    baseMacros: { calories: 330, protein: 30, carbs: 26, fat: 12 },
    tags: ['vietnamese', 'bo_bun', 'frais', 'complet'],
  },

  // lunch_071: Banh mi poulet
  // chicken_breast 120g => cal 198, P 37.2, C 0, F 4.3
  // bread_white 60g => cal 159, P 5.4, C 29.4, F 1.9
  // carrot 30g => cal 12, P 0.3, C 2.9, F 0
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // cilantro 5g => cal 1, P 0.1, C 0.2, F 0
  // sriracha 5g => cal 5, P 0.1, C 1.1, F 0
  // TOTAL => cal 380, P 43.3, C 34.7, F 6.2
  {
    id: 'lunch_071',
    name: 'Bánh mì poulet',
    description: 'Le sandwich vietnamien : poulet, crudités, coriandre et sriracha dans une baguette. Un voyage au Vietnam.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_white', name: 'Baguette', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte râpée', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cilantro', name: 'Coriandre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'sriracha', name: 'Sriracha', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Griller le poulet et le trancher.',
      'Ouvrir la baguette, garnir de carotte et concombre.',
      'Ajouter le poulet, la coriandre et la sriracha.',
      'Servir immédiatement.',
    ],
    baseMacros: { calories: 380, protein: 43, carbs: 35, fat: 6 },
    tags: ['vietnamese', 'sandwich', 'poulet', 'street_food'],
  },

  // lunch_072: Yakitori bowl
  // chicken_thigh 150g => cal 266, P 36, C 0, F 12.8
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // bell_pepper 50g => cal 16, P 0.5, C 3, F 0.2
  // teriyaki_sauce 15g => cal 18, P 0.5, C 3.9, F 0
  // TOTAL => cal 456, P 40.2, C 40.5, F 13.4
  {
    id: 'lunch_072',
    name: 'Yakitori bowl',
    description: 'Du poulet grillé façon yakitori sur du riz avec sauce teriyaki. Simple, japonais et délicieux.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'teriyaki_sauce', name: 'Sauce teriyaki', baseQuantityG: 15, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le poulet en cubes, enfiler sur des pics.',
      'Griller à la poêle en badigeonnant de sauce teriyaki.',
      'Cuire le riz et griller le poivron.',
      'Servir dans un bol.',
    ],
    baseMacros: { calories: 456, protein: 40, carbs: 41, fat: 13 },
    tags: ['japanese', 'yakitori', 'poulet', 'bowl'],
  },

  // lunch_073: Kung pao tofu
  // tofu_firm 150g => cal 216, P 25.5, C 4.5, F 12
  // peanuts 15g => cal 85, P 3.9, C 2.4, F 7.4
  // bell_pepper 60g => cal 19, P 0.6, C 3.6, F 0.2
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sriracha 5g => cal 5, P 0.1, C 1.1, F 0
  // TOTAL => cal 460, P 33.6, C 40.2, F 19.9
  {
    id: 'lunch_073',
    name: 'Kung pao tofu',
    description: 'Le classique chinois épicé avec du tofu et des cacahuètes. Piquant, croustillant et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sriracha', name: 'Sriracha', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le tofu en cubes, le faire dorer à la poêle.',
      'Ajouter le poivron et les cacahuètes.',
      'Assaisonner sauce soja et sriracha.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 460, protein: 34, carbs: 40, fat: 20 },
    tags: ['chinese', 'tofu', 'épicé', 'kung_pao'],
  },

  // lunch_074: Udon boeuf teriyaki
  // beef_steak 120g => cal 181, P 31.2, C 0, F 6
  // udon_noodles 130g => cal 129, P 3.4, C 28.6, F 0.3
  // broccoli 60g => cal 20, P 1.7, C 4.2, F 0.2
  // teriyaki_sauce 15g => cal 18, P 0.5, C 3.9, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 392, P 36.8, C 36.7, F 11.5
  {
    id: 'lunch_074',
    name: 'Udon bœuf teriyaki',
    description: 'Des nouilles udon sautées avec du bœuf teriyaki et du brocoli. Le wok qui claque.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Bœuf', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'teriyaki_sauce', name: 'Sauce teriyaki', baseQuantityG: 15, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les udon, égoutter.',
      'Faire sauter le bœuf en lamelles à feu vif.',
      'Ajouter le brocoli, les udon et la sauce teriyaki.',
      'Finir avec un filet d\'huile de sésame.',
    ],
    baseMacros: { calories: 392, protein: 37, carbs: 37, fat: 12 },
    tags: ['japanese', 'udon', 'teriyaki', 'wok'],
  },

  // lunch_075: Nasi goreng poulet
  // chicken_breast 130g => cal 215, P 40.3, C 0, F 4.7
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // cabbage 40g => cal 10, P 0.5, C 2.3, F 0
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // TOTAL => cal 464, P 51.3, C 37.1, F 10.6
  {
    id: 'lunch_075',
    name: 'Nasi goreng poulet',
    description: 'Le riz sauté indonésien avec poulet, œuf et chou. Street food d\'Asie du Sud-Est.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cabbage', name: 'Chou', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz à l\'avance (idéalement riz de la veille).',
      'Faire sauter le poulet en morceaux.',
      'Ajouter le riz, le chou et la sauce soja. Sauter à feu vif.',
      'Servir avec l\'œuf au plat par-dessus.',
    ],
    baseMacros: { calories: 464, protein: 51, carbs: 37, fat: 11 },
    tags: ['indonesian', 'nasi_goreng', 'riz_sauté', 'street_food'],
  },

  // ══════════════════════════════════════
  // ── MIDDLE EAST / MAGHREB (10) ──
  // ══════════════════════════════════════

  // lunch_076: Shawarma poulet
  // chicken_thigh 150g => cal 266, P 36, C 0, F 12.8
  // flatbread 50g => cal 138, P 4.5, C 27.5, F 0.6
  // tomato 50g => cal 9, P 0.5, C 2, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // hummus 30g => cal 50, P 2.4, C 4.5, F 2.7
  // TOTAL => cal 475, P 43.7, C 36.8, F 16.2
  {
    id: 'lunch_076',
    name: 'Shawarma poulet',
    description: 'Le shawarma maison avec poulet épicé, crudités et houmous dans un pain plat. Mieux que le kebab du coin.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mariner le poulet avec cumin, paprika, curcuma.',
      'Griller le poulet à la poêle et le trancher.',
      'Garnir le pain plat de houmous, poulet, tomate et oignon.',
      'Rouler et servir.',
    ],
    baseMacros: { calories: 475, protein: 44, carbs: 37, fat: 16 },
    tags: ['moyen_orient', 'shawarma', 'poulet', 'street_food'],
  },

  // lunch_077: Kefta boulettes
  // ground_beef_5 150g => cal 206, P 31.5, C 0, F 8.3
  // couscous 100g => cal 112, P 3.8, C 23, F 0.2
  // tomato_sauce 60g => cal 14, P 0.7, C 2.7, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // harissa 5g => cal 4, P 0.2, C 0.6, F 0.2
  // TOTAL => cal 348, P 36.5, C 29.1, F 8.8
  {
    id: 'lunch_077',
    name: 'Kefta boulettes couscous',
    description: 'Des boulettes de kefta épicées avec de la semoule et sauce tomate. Le Maghreb qui régale.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'couscous', name: 'Semoule', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'harissa', name: 'Harissa', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Former des boulettes avec le bœuf, oignon râpé et épices.',
      'Les cuire dans la sauce tomate avec la harissa 15 min.',
      'Préparer la semoule.',
      'Servir les boulettes sur la semoule.',
    ],
    baseMacros: { calories: 348, protein: 37, carbs: 29, fat: 9 },
    tags: ['maghreb', 'kefta', 'boulettes', 'couscous'],
  },

  // lunch_078: Couscous royal léger
  // chicken_breast 100g => cal 165, P 31, C 0, F 3.6
  // merguez 40g => cal 100, P 5.6, C 0.8, F 8.4
  // couscous 100g => cal 112, P 3.8, C 23, F 0.2
  // zucchini 60g => cal 10, P 0.7, C 1.9, F 0.2
  // carrot 40g => cal 16, P 0.4, C 3.8, F 0.1
  // chickpeas 40g => cal 66, P 3.6, C 10.8, F 1
  // TOTAL => cal 469, P 45.1, C 40.3, F 13.5
  {
    id: 'lunch_078',
    name: 'Couscous royal léger',
    description: 'Le couscous royal avec poulet et merguez, version allégée. Le dimanche en famille, mais fit.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'merguez', name: 'Merguez', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'couscous', name: 'Semoule', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le poulet et la merguez à la poêle.',
      'Faire cuire les légumes et pois chiches dans un bouillon.',
      'Préparer la semoule.',
      'Servir la viande sur la semoule avec le bouillon de légumes.',
    ],
    baseMacros: { calories: 469, protein: 45, carbs: 40, fat: 14 },
    tags: ['maghreb', 'couscous', 'royal', 'complet'],
  },

  // lunch_079: Tajine poulet citron
  // chicken_thigh 150g => cal 266, P 36, C 0, F 12.8
  // potato 100g => cal 77, P 2, C 17, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // lemon_juice 15g => cal 4, P 0.1, C 1.4, F 0
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 407, P 38.5, C 22.1, F 17.9
  {
    id: 'lunch_079',
    name: 'Tajine poulet citron',
    description: 'Un tajine de poulet au citron confit et olives. Les saveurs du Maroc dans ta cuisine.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'lemon_juice', name: 'Citron confit', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire dorer le poulet dans l\'huile d\'olive.',
      'Ajouter l\'oignon, les pommes de terre et le citron.',
      'Couvrir d\'eau, assaisonner et mijoter 30 min.',
      'Servir dans le plat de cuisson.',
    ],
    baseMacros: { calories: 407, protein: 39, carbs: 22, fat: 18 },
    tags: ['marocain', 'tajine', 'poulet', 'mijoté'],
  },

  // lunch_080: Falafel bowl
  // chickpeas 100g => cal 164, P 9, C 27, F 2.6
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // cucumber 40g => cal 6, P 0.3, C 1.5, F 0
  // tahini 15g => cal 90, P 2.6, C 3.2, F 8.1
  // TOTAL => cal 375, P 14.6, C 56.4, F 11
  {
    id: 'lunch_080',
    name: 'Falafel bowl',
    description: 'Des falafels de pois chiches avec riz, crudités et sauce tahini. Un bowl végétarien du Moyen-Orient.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'tahini', name: 'Tahini', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer les pois chiches avec oignon et persil, former des boulettes.',
      'Cuire au four 20 min à 200°C.',
      'Cuire le riz.',
      'Assembler le bowl : riz, falafels, crudités, sauce tahini.',
    ],
    baseMacros: { calories: 375, protein: 15, carbs: 56, fat: 11 },
    tags: ['moyen_orient', 'falafel', 'vegan', 'bowl'],
  },

  // lunch_081: Shakshuka lunch
  // egg 120g => cal 186, P 15.6, C 1.3, F 13.2
  // tomato_sauce 100g => cal 24, P 1.2, C 4.5, F 0.1
  // bell_pepper 60g => cal 19, P 0.6, C 3.6, F 0.2
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // flatbread 40g => cal 110, P 3.6, C 22, F 0.5
  // feta_cheese 20g => cal 53, P 2.8, C 0.8, F 4.2
  // TOTAL => cal 408, P 24.2, C 35.9, F 18.2
  {
    id: 'lunch_081',
    name: 'Shakshuka déjeuner',
    description: 'Des œufs pochés dans une sauce tomate épicée avec du pain plat. Le brunch du Moyen-Orient version déj.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Œufs', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir oignon et poivron.',
      'Ajouter la sauce tomate, assaisonner avec cumin et paprika.',
      'Creuser des puits, y casser les œufs, cuire à couvert 8 min.',
      'Émietter la feta et servir avec le pain plat.',
    ],
    baseMacros: { calories: 408, protein: 24, carbs: 36, fat: 18 },
    tags: ['moyen_orient', 'shakshuka', 'oeufs', 'végétarien'],
  },

  // lunch_082: Fattoush halloumi
  // halloumi 80g => cal 257, P 20, C 2.1, F 20
  // mixed_salad 60g => cal 10, P 0.8, C 1.8, F 0.2
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // cucumber 40g => cal 6, P 0.3, C 1.5, F 0
  // flatbread 30g => cal 83, P 2.7, C 16.5, F 0.4
  // sumac 3g => cal 8, P 0.1, C 2, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 419, P 24.4, C 26.2, F 25.8
  {
    id: 'lunch_082',
    name: 'Fattoush halloumi',
    description: 'La salade libanaise fattoush avec du halloumi grillé. Croquant, frais et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'halloumi', name: 'Halloumi', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat grillé', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'sumac', name: 'Sumac', baseQuantityG: 3, unit: 'g', roundTo: 1 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Griller le halloumi à la poêle.',
      'Griller des morceaux de pain plat.',
      'Assembler la salade avec tomate, concombre et pain grillé.',
      'Ajouter le halloumi, saupoudrer de sumac et arroser d\'huile.',
    ],
    baseMacros: { calories: 419, protein: 24, carbs: 26, fat: 26 },
    tags: ['libanais', 'fattoush', 'halloumi', 'salade'],
  },

  // lunch_083: Lahmacun poulet
  // ground_beef_5 100g => cal 137, P 21, C 0, F 5.5
  // flatbread 60g => cal 165, P 5.4, C 33, F 0.7
  // tomato 50g => cal 9, P 0.5, C 2, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // mixed_salad 30g => cal 5, P 0.4, C 0.9, F 0.1
  // TOTAL => cal 328, P 27.6, C 38.7, F 6.4
  {
    id: 'lunch_083',
    name: 'Lahmacun',
    description: 'La pizza turque fine avec viande hachée épicée. On roule avec la salade et c\'est parti.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat fin', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélanger le bœuf avec tomate et oignon râpés, épices.',
      'Étaler sur le pain plat.',
      'Cuire au four 10 min à 220°C.',
      'Ajouter la salade, rouler et manger.',
    ],
    baseMacros: { calories: 328, protein: 28, carbs: 39, fat: 6 },
    tags: ['turc', 'lahmacun', 'pizza', 'street_food'],
  },

  // lunch_084: Kibbeh bowl
  // ground_beef_5 130g => cal 178, P 27.3, C 0, F 7.2
  // bulgur 80g => cal 66, P 2.5, C 15.2, F 0.2
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // pine_nuts 10g => cal 67, P 1.4, C 1.3, F 6.8
  // mixed_salad 40g => cal 7, P 0.5, C 1.2, F 0.1
  // TOTAL => cal 330, P 32, C 20.5, F 14.3
  {
    id: 'lunch_084',
    name: 'Kibbeh bowl',
    description: 'Des boulettes de kibbeh (bœuf et boulgour) avec pignons. Le classique libanais en bowl.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'bulgur', name: 'Boulgour', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'pine_nuts', name: 'Pignons de pin', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le boulgour. Mélanger avec bœuf et oignon.',
      'Former des boulettes, les cuire au four 15 min.',
      'Faire griller les pignons à sec.',
      'Servir les kibbeh sur la salade avec les pignons.',
    ],
    baseMacros: { calories: 330, protein: 32, carbs: 21, fat: 14 },
    tags: ['libanais', 'kibbeh', 'boulettes', 'boulgour'],
  },

  // lunch_085: Mansaf léger
  // lamb_leg 130g => cal 211, P 26, C 0, F 11.7
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // labneh 30g => cal 77, P 1.5, C 1.5, F 7.5
  // almonds 10g => cal 58, P 2.1, C 2.2, F 5
  // TOTAL => cal 502, P 32.8, C 37.3, F 24.6
  {
    id: 'lunch_085',
    name: 'Mansaf léger',
    description: 'Le mansaf jordanien : agneau sur riz avec labneh et amandes. Un plat de fête version allégée.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 35,
    difficulty: 3,
    ingredients: [
      { ingredientId: 'lamb_leg', name: 'Agneau', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'labneh', name: 'Labneh', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire l\'agneau lentement dans de l\'eau épicée 30 min.',
      'Cuire le riz basmati.',
      'Disposer le riz, l\'agneau effiloché et napper de labneh.',
      'Parsemer d\'amandes grillées.',
    ],
    baseMacros: { calories: 502, protein: 33, carbs: 37, fat: 25 },
    tags: ['jordanien', 'mansaf', 'agneau', 'fête'],
  },

  // ══════════════════════════════════════
  // ── AFRICAN (8) ──
  // ══════════════════════════════════════

  // lunch_086: Thiéboudienne
  // tilapia 150g => cal 123, P 27, C 0, F 1.5
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // tomato_sauce 60g => cal 14, P 0.7, C 2.7, F 0.1
  // carrot 40g => cal 16, P 0.4, C 3.8, F 0.1
  // cabbage 40g => cal 10, P 0.5, C 2.3, F 0
  // TOTAL => cal 319, P 31.8, C 42.4, F 2.1
  {
    id: 'lunch_086',
    name: 'Thiéboudienne',
    description: 'Le plat national sénégalais : poisson, riz et légumes en sauce tomate. L\'Afrique de l\'Ouest dans ton assiette.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tilapia', name: 'Tilapia', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cabbage', name: 'Chou', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le poisson dans la sauce tomate.',
      'Ajouter les légumes et de l\'eau.',
      'Cuire le riz dans le bouillon de poisson.',
      'Servir le riz avec le poisson et les légumes.',
    ],
    baseMacros: { calories: 319, protein: 32, carbs: 42, fat: 2 },
    tags: ['sénégalais', 'poisson', 'riz', 'thiéboudienne'],
  },

  // lunch_087: Yassa poulet
  // chicken_thigh 150g => cal 266, P 36, C 0, F 12.8
  // onion 80g => cal 32, P 0.9, C 7.4, F 0.1
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // lemon_juice 15g => cal 4, P 0.1, C 1.4, F 0
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 476, P 39.7, C 36.8, F 18.2
  {
    id: 'lunch_087',
    name: 'Yassa poulet',
    description: 'Le yassa sénégalais : poulet mariné aux oignons et citron. Un classique d\'Afrique de l\'Ouest.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignons', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 15, unit: 'ml', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mariner le poulet avec citron et moutarde.',
      'Griller le poulet, puis le mijoter avec les oignons émincés.',
      'Cuire le riz.',
      'Servir le poulet nappé de sauce aux oignons sur le riz.',
    ],
    baseMacros: { calories: 476, protein: 40, carbs: 37, fat: 18 },
    tags: ['sénégalais', 'yassa', 'poulet', 'oignons'],
  },

  // lunch_088: Mafé boeuf
  // ground_beef_5 140g => cal 192, P 29.4, C 0, F 7.7
  // peanut_paste 25g => cal 147, P 6.3, C 5, F 12.5
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // tomato_sauce 40g => cal 10, P 0.5, C 1.8, F 0.1
  // carrot 30g => cal 12, P 0.3, C 2.9, F 0
  // TOTAL => cal 491, P 39.2, C 37.7, F 20.6
  {
    id: 'lunch_088',
    name: 'Mafé bœuf',
    description: 'Le mafé ouest-africain : bœuf en sauce arachide avec du riz. Crémeux et réconfortant.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_paste', name: 'Pâte d\'arachide', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 40, unit: 'ml', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf, ajouter la sauce tomate.',
      'Diluer la pâte d\'arachide dans de l\'eau, verser.',
      'Ajouter la carotte, mijoter 20 min.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 491, protein: 39, carbs: 38, fat: 21 },
    tags: ['africain', 'mafé', 'arachide', 'boeuf'],
  },

  // lunch_089: Alloco poisson
  // tilapia 130g => cal 107, P 23.4, C 0, F 1.3
  // plantain 150g => cal 183, P 2, C 48, F 0.6
  // tomato 50g => cal 9, P 0.5, C 2, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 382, P 26.2, C 52.8, F 10
  {
    id: 'lunch_089',
    name: 'Alloco poisson grillé',
    description: 'Du plantain frit avec du poisson grillé à l\'ivoirienne. Street food d\'Abidjan.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tilapia', name: 'Tilapia', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'plantain', name: 'Plantain', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le plantain en rondelles, frire dans un peu d\'huile.',
      'Griller le poisson à la poêle.',
      'Préparer une sauce tomate-oignon rapide.',
      'Servir le tout ensemble.',
    ],
    baseMacros: { calories: 382, protein: 26, carbs: 53, fat: 10 },
    tags: ['ivoirien', 'alloco', 'plantain', 'street_food'],
  },

  // lunch_090: Jollof rice poulet
  // chicken_breast 140g => cal 231, P 43.4, C 0, F 5
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // tomato_sauce 60g => cal 14, P 0.7, C 2.7, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // bell_pepper 30g => cal 9, P 0.3, C 1.8, F 0.1
  // TOTAL => cal 422, P 47.9, C 40.9, F 5.6
  {
    id: 'lunch_090',
    name: 'Jollof rice poulet',
    description: 'Le jollof rice nigérian : riz cuit dans la sauce tomate avec poulet. Le plat qui fait l\'unanimité.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir oignon et poivron.',
      'Ajouter la sauce tomate, le riz et de l\'eau.',
      'Cuire à couvert 20 min.',
      'Griller le poulet et servir sur le riz.',
    ],
    baseMacros: { calories: 422, protein: 48, carbs: 41, fat: 6 },
    tags: ['nigérian', 'jollof', 'riz', 'poulet'],
  },

  // lunch_091: Ndolé
  // ground_beef_5 120g => cal 164, P 25.2, C 0, F 6.6
  // spinach 100g => cal 23, P 2.9, C 3.6, F 0.4
  // peanut_paste 20g => cal 118, P 5, C 4, F 10
  // plantain 80g => cal 98, P 1, C 25.6, F 0.3
  // TOTAL => cal 403, P 34.1, C 33.2, F 17.3
  {
    id: 'lunch_091',
    name: 'Ndolé',
    description: 'Le ndolé camerounais : viande et épinards en sauce arachide avec du plantain. La fierté du Cameroun.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards (ndolé)', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_paste', name: 'Pâte d\'arachide', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'plantain', name: 'Plantain', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf.',
      'Ajouter les épinards et la pâte d\'arachide diluée.',
      'Mijoter 20 min.',
      'Servir avec le plantain frit.',
    ],
    baseMacros: { calories: 403, protein: 34, carbs: 33, fat: 17 },
    tags: ['camerounais', 'ndolé', 'arachide', 'épinards'],
  },

  // lunch_092: Attiéké poisson
  // tilapia 140g => cal 115, P 25.2, C 0, F 1.4
  // cassava 120g => cal 192, P 1.7, C 45.6, F 0.4
  // tomato 40g => cal 7, P 0.4, C 1.6, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // TOTAL => cal 326, P 27.6, C 50, F 1.9
  {
    id: 'lunch_092',
    name: 'Garba attiéké thon',
    description: 'Le garba ivoirien : attiéké (semoule de manioc) avec du poisson grillé. Le repas de rue d\'Abidjan.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tilapia', name: 'Tilapia', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'cassava', name: 'Attiéké (manioc)', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Griller le poisson à la poêle avec épices.',
      'Réchauffer l\'attiéké.',
      'Couper tomate et oignon en rondelles.',
      'Servir le poisson avec l\'attiéké et les crudités.',
    ],
    baseMacros: { calories: 326, protein: 28, carbs: 50, fat: 2 },
    tags: ['ivoirien', 'garba', 'attiéké', 'street_food'],
  },

  // lunch_093: Fufu léger
  // chicken_thigh 130g => cal 230, P 31.2, C 0, F 11.1
  // yam 120g => cal 142, P 1.8, C 33.6, F 0.2
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // tomato_sauce 40g => cal 10, P 0.5, C 1.8, F 0.1
  // TOTAL => cal 396, P 35.2, C 37.6, F 11.6
  {
    id: 'lunch_093',
    name: 'Fufu léger poulet',
    description: 'Du fufu (igname pilée) avec une sauce épinards-tomate et poulet. L\'Afrique de l\'Ouest en version fit.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'yam', name: 'Igname', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 40, unit: 'ml', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire l\'igname et la piler en fufu.',
      'Cuire le poulet dans la sauce tomate.',
      'Ajouter les épinards et mijoter.',
      'Servir le fufu avec la sauce.',
    ],
    baseMacros: { calories: 396, protein: 35, carbs: 38, fat: 12 },
    tags: ['africain', 'fufu', 'igname', 'traditionnel'],
  },

  // ══════════════════════════════════════
  // ── LATIN AMERICAN (8) ──
  // ══════════════════════════════════════

  // lunch_094: Burrito bowl poulet
  // chicken_breast 140g => cal 231, P 43.4, C 0, F 5
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // black_beans 50g => cal 66, P 4.5, C 12, F 0.3
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // corn 40g => cal 43, P 1.6, C 9.5, F 0.6
  // TOTAL => cal 508, P 52.5, C 47.5, F 12.1
  {
    id: 'lunch_094',
    name: 'Burrito bowl poulet',
    description: 'Le burrito bowl à la Chipotle : poulet, riz, haricots noirs, maïs et avocat. Complet et addictif.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Griller le poulet assaisonné cumin-paprika.',
      'Cuire le riz et réchauffer les haricots noirs.',
      'Assembler le bowl avec tout.',
      'Ajouter l\'avocat et déguster.',
    ],
    baseMacros: { calories: 508, protein: 53, carbs: 48, fat: 12 },
    tags: ['mexican', 'burrito', 'bowl', 'complet'],
  },

  // lunch_095: Tacos boeuf
  // ground_beef_5 130g => cal 178, P 27.3, C 0, F 7.2
  // corn_tortilla 60g => cal 131, P 3.4, C 26.4, F 1.7
  // tomato 50g => cal 9, P 0.5, C 2, F 0.1
  // avocado 30g => cal 48, P 0.6, C 2.7, F 4.5
  // onion 20g => cal 8, P 0.2, C 1.9, F 0
  // TOTAL => cal 374, P 32, C 33, F 13.5
  {
    id: 'lunch_095',
    name: 'Tacos bœuf',
    description: 'Des tacos mexicains au bœuf haché épicé. Simple, fun et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn_tortilla', name: 'Tortilla de maïs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le bœuf avec cumin, paprika et piment.',
      'Chauffer les tortillas à la poêle.',
      'Garnir de viande, tomate, oignon et avocat.',
      'Servir avec citron vert.',
    ],
    baseMacros: { calories: 374, protein: 32, carbs: 33, fat: 14 },
    tags: ['mexican', 'tacos', 'boeuf', 'street_food'],
  },

  // lunch_096: Ceviche crevettes
  // shrimp 140g => cal 139, P 33.6, C 0.3, F 0.4
  // lime_juice 25g => cal 7, P 0.1, C 2.2, F 0
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // tomato 50g => cal 9, P 0.5, C 2, F 0.1
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // cilantro 5g => cal 1, P 0.1, C 0.2, F 0
  // TOTAL => cal 225, P 35.3, C 9.4, F 6.5
  {
    id: 'lunch_096',
    name: 'Ceviche crevettes',
    description: 'Un ceviche péruvien aux crevettes marinées au citron vert. Ultra léger et frais.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 25, unit: 'ml', roundTo: 5 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cilantro', name: 'Coriandre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les crevettes rapidement, les refroidir.',
      'Mariner dans le jus de citron vert 10 min.',
      'Ajouter avocat, tomate et concombre en dés.',
      'Parsemer de coriandre et servir frais.',
    ],
    baseMacros: { calories: 225, protein: 35, carbs: 9, fat: 7 },
    tags: ['péruvien', 'ceviche', 'crevettes', 'frais'],
  },

  // lunch_097: Feijoada léger
  // ground_beef_5 100g => cal 137, P 21, C 0, F 5.5
  // black_beans 80g => cal 106, P 7.2, C 19.2, F 0.4
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // cabbage 40g => cal 10, P 0.5, C 2.3, F 0
  // TOTAL => cal 395, P 31.7, C 52.3, F 6.2
  {
    id: 'lunch_097',
    name: 'Feijoada léger',
    description: 'La feijoada brésilienne allégée : haricots noirs et bœuf avec riz. Le Brésil en version fit.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cabbage', name: 'Chou (couve)', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire les haricots noirs avec le bœuf et l\'oignon.',
      'Laisser mijoter 25 min.',
      'Cuire le riz et sauter le chou.',
      'Servir le tout ensemble.',
    ],
    baseMacros: { calories: 395, protein: 32, carbs: 52, fat: 6 },
    tags: ['brésilien', 'feijoada', 'haricots', 'comfort'],
  },

  // lunch_098: Enchiladas poulet
  // chicken_breast 130g => cal 215, P 40.3, C 0, F 4.7
  // corn_tortilla 60g => cal 131, P 3.4, C 26.4, F 1.7
  // tomato_sauce 60g => cal 14, P 0.7, C 2.7, F 0.1
  // mozzarella 25g => cal 70, P 7, C 0.8, F 4.3
  // onion 20g => cal 8, P 0.2, C 1.9, F 0
  // TOTAL => cal 438, P 51.6, C 31.8, F 10.8
  {
    id: 'lunch_098',
    name: 'Enchiladas poulet',
    description: 'Des enchiladas au poulet avec sauce tomate et fromage gratiné. Le Mexique en mode healthy.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn_tortilla', name: 'Tortillas de maïs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mozzarella', name: 'Mozzarella', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire et effilocher le poulet.',
      'Garnir les tortillas de poulet, rouler et placer dans un plat.',
      'Napper de sauce tomate, parsemer de mozzarella.',
      'Gratiner au four 15 min.',
    ],
    baseMacros: { calories: 438, protein: 52, carbs: 32, fat: 11 },
    tags: ['mexican', 'enchiladas', 'poulet', 'gratiné'],
  },

  // lunch_099: Chimichurri steak bowl
  // beef_steak 150g => cal 226, P 39, C 0, F 7.5
  // sweet_potato 100g => cal 86, P 1.6, C 20, F 0.1
  // mixed_salad 50g => cal 9, P 0.6, C 1.5, F 0.1
  // cilantro 5g => cal 1, P 0.1, C 0.2, F 0
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 393, P 41.3, C 21.7, F 15.7
  {
    id: 'lunch_099',
    name: 'Chimichurri steak bowl',
    description: 'Un steak argentin avec sauce chimichurri et patate douce. Grillé, frais et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Steak', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cilantro', name: 'Coriandre (chimichurri)', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire la patate douce en frites au four.',
      'Griller le steak 3 min par face.',
      'Préparer le chimichurri : coriandre, huile d\'olive, ail.',
      'Servir dans un bowl avec la salade.',
    ],
    baseMacros: { calories: 393, protein: 41, carbs: 22, fat: 16 },
    tags: ['argentin', 'chimichurri', 'steak', 'bowl'],
  },

  // lunch_100: Arroz con pollo
  // chicken_thigh 140g => cal 248, P 33.6, C 0, F 11.9
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // bell_pepper 40g => cal 12, P 0.4, C 2.4, F 0.1
  // peas 40g => cal 32, P 2.1, C 5.7, F 0.2
  // onion 20g => cal 8, P 0.2, C 1.9, F 0
  // TOTAL => cal 456, P 39.5, C 43.6, F 12.6
  {
    id: 'lunch_100',
    name: 'Arroz con pollo',
    description: 'Le riz au poulet latino : tout cuit ensemble avec des petits pois et poivron. Un one-pot qui régale.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'peas', name: 'Petits pois', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire dorer le poulet avec l\'oignon.',
      'Ajouter le riz, le poivron et les petits pois.',
      'Verser de l\'eau, cuire à couvert 20 min.',
      'Servir directement du plat.',
    ],
    baseMacros: { calories: 456, protein: 40, carbs: 44, fat: 13 },
    tags: ['latino', 'arroz', 'poulet', 'one_pot'],
  },

  // lunch_101: Poke brasileiro
  // salmon_fillet 100g => cal 208, P 20, C 0, F 13
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // mango 50g => cal 30, P 0.4, C 7.5, F 0.2
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 409, P 23.4, C 34.5, F 19.4
  {
    id: 'lunch_101',
    name: 'Poke brasileiro',
    description: 'Un poke bowl fusion brésilien avec saumon, mangue et avocat. Tropical et coloré.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Citron vert', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz et le laisser refroidir.',
      'Couper le saumon, la mangue et l\'avocat en dés.',
      'Assembler le bowl.',
      'Arroser de citron vert.',
    ],
    baseMacros: { calories: 409, protein: 23, carbs: 35, fat: 19 },
    tags: ['brésilien', 'poke', 'saumon', 'tropical'],
  },

  // ══════════════════════════════════════
  // ── VEGAN (12) ──
  // ══════════════════════════════════════

  // lunch_102: Buddha bowl quinoa
  // quinoa 100g => cal 120, P 4.4, C 21, F 1.9
  // chickpeas 60g => cal 98, P 5.4, C 16.2, F 1.6
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // sweet_potato 80g => cal 69, P 1.3, C 16, F 0.1
  // spinach 40g => cal 9, P 1.2, C 1.4, F 0.2
  // tahini 10g => cal 60, P 1.7, C 2.1, F 5.4
  // TOTAL => cal 420, P 14.8, C 60.3, F 15.2
  {
    id: 'lunch_102',
    name: 'Buddha bowl quinoa',
    description: 'Le buddha bowl ultime : quinoa, patate douce rôtie, pois chiches et avocat. Coloré et nourrissant.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'tahini', name: 'Tahini', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa. Rôtir la patate douce au four.',
      'Réchauffer les pois chiches avec cumin.',
      'Assembler : épinards, quinoa, patate douce, pois chiches, avocat.',
      'Arroser de sauce tahini.',
    ],
    baseMacros: { calories: 420, protein: 15, carbs: 60, fat: 15 },
    tags: ['vegan', 'buddha', 'bowl', 'complet'],
  },

  // lunch_103: Curry lentilles coco
  // red_lentils 100g => cal 116, P 9, C 20, F 0.4
  // coconut_milk 80g => cal 154, P 1.2, C 2.4, F 16
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // curry_paste 10g => cal 11, P 0.3, C 1.7, F 0.3
  // TOTAL => cal 427, P 13.6, C 55.8, F 17
  {
    id: 'lunch_103',
    name: 'Curry lentilles coco',
    description: 'Un dhal de lentilles corail au lait de coco et curry. Crémeux, doux et plein de protéines végétales.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'red_lentils', name: 'Lentilles corail', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Curry', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon et le curry.',
      'Ajouter les lentilles et de l\'eau, cuire 12 min.',
      'Ajouter le lait de coco, mijoter 5 min.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 427, protein: 14, carbs: 56, fat: 17 },
    tags: ['vegan', 'dhal', 'curry', 'lentilles'],
  },

  // lunch_104: Chili sin carne
  // kidney_beans 80g => cal 127, P 8.7, C 22.8, F 0.5
  // black_beans 60g => cal 79, P 5.4, C 14.4, F 0.3
  // tomato_sauce 80g => cal 19, P 1, C 3.6, F 0.1
  // corn 50g => cal 54, P 2, C 11.9, F 0.8
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // bell_pepper 40g => cal 12, P 0.4, C 2.4, F 0.1
  // TOTAL => cal 395, P 19.7, C 77.5, F 2
  {
    id: 'lunch_104',
    name: 'Chili sin carne',
    description: 'Le chili végétal avec haricots rouges, noirs, maïs et sauce tomate épicée. Copieux sans viande.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'kidney_beans', name: 'Haricots rouges', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le poivron.',
      'Ajouter haricots, maïs et sauce tomate.',
      'Assaisonner avec cumin, paprika, piment.',
      'Mijoter 20 min, servir avec le riz.',
    ],
    baseMacros: { calories: 395, protein: 20, carbs: 78, fat: 2 },
    tags: ['vegan', 'chili', 'mexican', 'haricots'],
  },

  // lunch_105: Pad thai tofu
  // tofu_firm 150g => cal 216, P 25.5, C 4.5, F 12
  // rice_noodles 80g => cal 87, P 0.7, C 20, F 0.2
  // bean_sprouts 40g => cal 12, P 1.2, C 2, F 0.1
  // peanuts 10g => cal 57, P 2.6, C 1.6, F 4.9
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 380, P 30.8, C 29.7, F 17.2
  {
    id: 'lunch_105',
    name: 'Pad thai tofu',
    description: 'Le pad thai vegan avec tofu croustillant et cacahuètes. Street food thaï sans produit animal.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bean_sprouts', name: 'Pousses de soja', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'lime_juice', name: 'Citron vert', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les nouilles de riz.',
      'Faire dorer le tofu en cubes à la poêle.',
      'Ajouter nouilles, pousses de soja et sauce soja.',
      'Servir avec cacahuètes et citron vert.',
    ],
    baseMacros: { calories: 380, protein: 31, carbs: 30, fat: 17 },
    tags: ['vegan', 'thai', 'pad_thai', 'tofu'],
  },

  // lunch_106: Poke bowl edamame
  // edamame 80g => cal 100, P 8.8, C 6.8, F 4.4
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // carrot 30g => cal 12, P 0.3, C 2.9, F 0
  // soy_sauce 8g => cal 4, P 0.6, C 0.5, F 0
  // TOTAL => cal 289, P 12.9, C 37.3, F 10.6
  {
    id: 'lunch_106',
    name: 'Poke bowl edamame',
    description: 'Un poke bowl 100% vegan avec edamame, avocat et légumes. Frais et protéiné sans poisson.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz et le refroidir.',
      'Assembler le bowl : riz, edamame, avocat, concombre, carotte.',
      'Assaisonner à la sauce soja.',
    ],
    baseMacros: { calories: 289, protein: 13, carbs: 37, fat: 11 },
    tags: ['vegan', 'poke', 'edamame', 'frais'],
  },

  // lunch_107: Falafel wrap vegan
  // chickpeas 80g => cal 131, P 7.2, C 21.6, F 2.1
  // wrap_tortilla 50g => cal 156, P 4.3, C 26, F 4
  // mixed_salad 30g => cal 5, P 0.4, C 0.9, F 0.1
  // tomato 40g => cal 7, P 0.4, C 1.6, F 0.1
  // tahini 10g => cal 60, P 1.7, C 2.1, F 5.4
  // TOTAL => cal 359, P 14, C 52.2, F 11.7
  {
    id: 'lunch_107',
    name: 'Falafel wrap vegan',
    description: 'Des falafels dans un wrap avec crudités et sauce tahini. Street food libanaise 100% végétale.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'wrap_tortilla', name: 'Wrap', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'tahini', name: 'Tahini', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer les pois chiches, former des boulettes.',
      'Cuire au four 15 min à 200°C.',
      'Garnir le wrap de salade, tomate et falafels.',
      'Arroser de tahini et rouler.',
    ],
    baseMacros: { calories: 359, protein: 14, carbs: 52, fat: 12 },
    tags: ['vegan', 'falafel', 'wrap', 'libanais'],
  },

  // lunch_108: Bowl mexicain haricots
  // pinto_beans 80g => cal 143, P 9, C 27, F 0.6
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // corn 50g => cal 54, P 2, C 11.9, F 0.8
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // tomato 40g => cal 7, P 0.4, C 1.6, F 0.1
  // TOTAL => cal 372, P 14.4, C 66.5, F 7.7
  {
    id: 'lunch_108',
    name: 'Bowl mexicain haricots',
    description: 'Un bowl tex-mex vegan avec pinto beans, maïs et guac. Copieux et savoureux sans viande.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pinto_beans', name: 'Pinto beans', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz. Réchauffer les pinto beans.',
      'Assembler le bowl avec tous les ingrédients.',
      'Assaisonner avec cumin et citron vert.',
    ],
    baseMacros: { calories: 372, protein: 14, carbs: 67, fat: 8 },
    tags: ['vegan', 'mexican', 'bowl', 'haricots'],
  },

  // lunch_109: Dhal lentilles corail
  // red_lentils 100g => cal 116, P 9, C 20, F 0.4
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // naan_bread 40g => cal 116, P 3.6, C 20, F 2
  // ginger_fresh 5g => cal 4, P 0.1, C 0.9, F 0
  // TOTAL => cal 263, P 13.6, C 46.9, F 2.5
  {
    id: 'lunch_109',
    name: 'Dhal lentilles corail',
    description: 'Le dhal indien aux lentilles corail avec un naan. Doux, épicé et ultra nourrissant.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'red_lentils', name: 'Lentilles corail', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'naan_bread', name: 'Naan', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir oignon et gingembre.',
      'Ajouter lentilles, tomate et eau.',
      'Cuire 15 min jusqu\'à consistance épaisse.',
      'Servir avec le naan.',
    ],
    baseMacros: { calories: 263, protein: 14, carbs: 47, fat: 3 },
    tags: ['vegan', 'indien', 'dhal', 'lentilles'],
  },

  // lunch_110: Stir-fry tempeh
  // tempeh 130g => cal 250, P 26, C 10.4, F 14.3
  // broccoli 60g => cal 20, P 1.7, C 4.2, F 0.2
  // bell_pepper 50g => cal 16, P 0.5, C 3, F 0.2
  // basmati_rice 80g => cal 104, P 2.2, C 22.4, F 0.2
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 439, P 31.2, C 40.6, F 19.9
  {
    id: 'lunch_110',
    name: 'Stir-fry tempeh',
    description: 'Un sauté de tempeh avec brocoli et poivron, sauce soja et sésame. Protéiné et 100% végétal.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tempeh', name: 'Tempeh', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le tempeh en tranches, le faire dorer.',
      'Ajouter les légumes, sauter à feu vif 5 min.',
      'Assaisonner sauce soja et sésame.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 439, protein: 31, carbs: 41, fat: 20 },
    tags: ['vegan', 'tempeh', 'wok', 'protéiné'],
  },

  // lunch_111: Risotto champignons vegan
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // mushrooms 100g => cal 22, P 3.1, C 3.3, F 0.3
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // nutritional_yeast 10g => cal 36, P 5, C 3.6, F 0.6
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 297, P 11.6, C 43.3, F 9.3
  {
    id: 'lunch_111',
    name: 'Risotto champignons vegan',
    description: 'Un risotto crémeux aux champignons avec de la levure nutritionnelle. Le goût fromagé sans fromage.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'nutritional_yeast', name: 'Levure nutritionnelle', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir oignon et champignons dans l\'huile.',
      'Ajouter le riz, mouiller au bouillon louche par louche.',
      'Remuer 20 min.',
      'Ajouter la levure nutritionnelle en fin de cuisson.',
    ],
    baseMacros: { calories: 297, protein: 12, carbs: 43, fat: 9 },
    tags: ['vegan', 'risotto', 'champignons', 'comfort'],
  },

  // lunch_112: Salade thaï vegan
  // tofu_firm 100g => cal 144, P 17, C 3, F 8
  // rice_noodles 60g => cal 65, P 0.5, C 15, F 0.1
  // cabbage 50g => cal 13, P 0.6, C 2.9, F 0
  // carrot 30g => cal 12, P 0.3, C 2.9, F 0
  // peanuts 10g => cal 57, P 2.6, C 1.6, F 4.9
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 294, P 21, C 26.4, F 13
  {
    id: 'lunch_112',
    name: 'Salade thaï vegan',
    description: 'Une salade croquante à la thaï avec tofu, cacahuètes et citron vert. Frais et léger.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Vermicelles de riz', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cabbage', name: 'Chou', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'lime_juice', name: 'Citron vert', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les vermicelles, refroidir.',
      'Faire griller le tofu en tranches.',
      'Mélanger chou et carotte râpés avec les vermicelles.',
      'Ajouter le tofu et les cacahuètes, arroser de citron vert.',
    ],
    baseMacros: { calories: 294, protein: 21, carbs: 26, fat: 13 },
    tags: ['vegan', 'thai', 'salade', 'frais'],
  },

  // lunch_113: Burger lentilles
  // green_lentils 80g => cal 93, P 7.2, C 16, F 0.3
  // bread_whole 50g => cal 124, P 6.5, C 20.5, F 1.7
  // tomato 40g => cal 7, P 0.4, C 1.6, F 0.1
  // mixed_salad 20g => cal 3, P 0.3, C 0.6, F 0
  // avocado 30g => cal 48, P 0.6, C 2.7, F 4.5
  // TOTAL => cal 275, P 15, C 41.4, F 6.6
  {
    id: 'lunch_113',
    name: 'Burger lentilles vegan',
    description: 'Un burger vegan avec un steak de lentilles vertes. Protéiné et bien assaisonné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'green_lentils', name: 'Lentilles vertes', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_whole', name: 'Pain complet (bun)', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire les lentilles, les écraser grossièrement.',
      'Former un steak, le cuire à la poêle 4 min par face.',
      'Monter le burger : pain, salade, steak, tomate, avocat.',
    ],
    baseMacros: { calories: 275, protein: 15, carbs: 41, fat: 7 },
    tags: ['vegan', 'burger', 'lentilles', 'comfort'],
  },

  // ══════════════════════════════════════
  // ── VEGETARIAN (6) ──
  // ══════════════════════════════════════

  // lunch_114: Omelette provençale
  // egg 150g => cal 233, P 19.5, C 1.7, F 16.5
  // zucchini 60g => cal 10, P 0.7, C 1.9, F 0.2
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // bell_pepper 40g => cal 12, P 0.4, C 2.4, F 0.1
  // goat_cheese 20g => cal 73, P 4.4, C 0, F 6
  // TOTAL => cal 339, P 25.5, C 8.3, F 22.9
  {
    id: 'lunch_114',
    name: 'Omelette provençale',
    description: 'Une omelette garnie de légumes du soleil et chèvre. Rapide, protéinée et méditerranéenne.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Œufs', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'goat_cheese', name: 'Chèvre', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire sauter les légumes à la poêle.',
      'Battre les œufs, verser sur les légumes.',
      'Ajouter le chèvre émietté.',
      'Cuire 5 min, replier et servir.',
    ],
    baseMacros: { calories: 339, protein: 26, carbs: 8, fat: 23 },
    tags: ['vegetarian', 'omelette', 'provençale', 'rapide'],
  },

  // lunch_115: Gratin courgettes ricotta
  // zucchini 150g => cal 26, P 1.8, C 4.7, F 0.5
  // ricotta 60g => cal 104, P 6.6, C 1.8, F 7.8
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // parmesan 15g => cal 59, P 5.9, C 0, F 3.9
  // tomato_sauce 40g => cal 10, P 0.5, C 1.8, F 0.1
  // TOTAL => cal 277, P 21.3, C 8.9, F 17.8
  {
    id: 'lunch_115',
    name: 'Gratin courgettes ricotta',
    description: 'Des courgettes gratinées à la ricotta et parmesan. Léger, fondant et protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'zucchini', name: 'Courgettes', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'ricotta', name: 'Ricotta', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'parmesan', name: 'Parmesan', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 40, unit: 'ml', roundTo: 10 },
    ],
    recipeSteps: [
      'Couper les courgettes en rondelles.',
      'Mélanger ricotta et œuf.',
      'Alterner couches de courgettes et mélange ricotta.',
      'Saupoudrer de parmesan, gratiner 20 min.',
    ],
    baseMacros: { calories: 277, protein: 21, carbs: 9, fat: 18 },
    tags: ['vegetarian', 'gratin', 'courgettes', 'léger'],
  },

  // lunch_116: Pasta pesto halloumi
  // pasta 100g => cal 131, P 5, C 25, F 1.1
  // halloumi 60g => cal 193, P 15, C 1.6, F 15
  // pesto 15g => cal 55, P 1.5, C 1.2, F 5.3
  // cherry_tomato 50g => cal 9, P 0.5, C 1.9, F 0.1
  // TOTAL => cal 388, P 22, C 29.7, F 21.5
  {
    id: 'lunch_116',
    name: 'Pasta pesto halloumi',
    description: 'Des pâtes au pesto avec du halloumi grillé et tomates cerises. Italien-chypriote fusion.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pasta', name: 'Pâtes', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'halloumi', name: 'Halloumi', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'pesto', name: 'Pesto', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire les pâtes al dente.',
      'Griller le halloumi en tranches à la poêle.',
      'Mélanger les pâtes avec le pesto.',
      'Ajouter le halloumi et les tomates cerises coupées.',
    ],
    baseMacros: { calories: 388, protein: 22, carbs: 30, fat: 22 },
    tags: ['vegetarian', 'pasta', 'halloumi', 'pesto'],
  },

  // lunch_117: Buddha bowl halloumi
  // halloumi 60g => cal 193, P 15, C 1.6, F 15
  // quinoa 80g => cal 96, P 3.5, C 16.8, F 1.5
  // sweet_potato 80g => cal 69, P 1.3, C 16, F 0.1
  // spinach 40g => cal 9, P 1.2, C 1.4, F 0.2
  // hummus 20g => cal 33, P 1.6, C 3, F 1.8
  // TOTAL => cal 400, P 22.6, C 38.8, F 18.6
  {
    id: 'lunch_117',
    name: 'Buddha bowl halloumi',
    description: 'Un buddha bowl avec halloumi grillé, quinoa et patate douce. Végétarien et ultra complet.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'halloumi', name: 'Halloumi', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le quinoa. Rôtir la patate douce au four.',
      'Griller le halloumi à la poêle.',
      'Assembler : épinards, quinoa, patate douce, halloumi.',
      'Ajouter le houmous.',
    ],
    baseMacros: { calories: 400, protein: 23, carbs: 39, fat: 19 },
    tags: ['vegetarian', 'buddha', 'halloumi', 'bowl'],
  },

  // lunch_118: Galette sarrasin chèvre
  // buckwheat_noodles 80g => cal 99, P 4, C 20, F 0.5
  // goat_cheese 40g => cal 146, P 8.8, C 0, F 12
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // spinach 40g => cal 9, P 1.2, C 1.4, F 0.2
  // TOTAL => cal 332, P 20.5, C 22, F 18.2
  {
    id: 'lunch_118',
    name: 'Galette sarrasin chèvre',
    description: 'Une galette bretonne au chèvre, œuf et épinards. Simple, rapide et nourrissant.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'buckwheat_noodles', name: 'Galette de sarrasin', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'goat_cheese', name: 'Chèvre', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Chauffer la galette à la poêle.',
      'Ajouter les épinards et le chèvre.',
      'Casser l\'œuf au centre.',
      'Replier et cuire jusqu\'à ce que l\'œuf soit pris.',
    ],
    baseMacros: { calories: 332, protein: 21, carbs: 22, fat: 18 },
    tags: ['vegetarian', 'breton', 'galette', 'chèvre'],
  },

  // lunch_119: Lasagne épinards ricotta
  // pasta 80g => cal 105, P 4, C 20, F 0.9
  // ricotta 60g => cal 104, P 6.6, C 1.8, F 7.8
  // spinach 80g => cal 18, P 2.3, C 2.9, F 0.3
  // tomato_sauce 60g => cal 14, P 0.7, C 2.7, F 0.1
  // mozzarella 30g => cal 84, P 8.4, C 0.9, F 5.1
  // TOTAL => cal 325, P 22, C 28.3, F 14.2
  {
    id: 'lunch_119',
    name: 'Lasagne épinards ricotta',
    description: 'Des lasagnes végé aux épinards et ricotta. Le classique italien sans viande mais avec le fondant.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'pasta', name: 'Feuilles de lasagne', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'ricotta', name: 'Ricotta', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mozzarella', name: 'Mozzarella', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Alterner couches de pâtes, épinards-ricotta et sauce tomate.',
      'Terminer par la mozzarella.',
      'Cuire au four 25 min à 180°C.',
      'Laisser reposer 5 min avant de servir.',
    ],
    baseMacros: { calories: 325, protein: 22, carbs: 28, fat: 14 },
    tags: ['vegetarian', 'lasagne', 'italien', 'comfort'],
  },

  // ══════════════════════════════════════
  // ── GLUTEN-FREE (6) ──
  // ══════════════════════════════════════

  // lunch_120: Poke bowl saumon GF
  // salmon_fillet 120g => cal 250, P 24, C 0, F 15.6
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // cucumber 30g => cal 5, P 0.2, C 1.1, F 0
  // soy_sauce 8g => cal 4, P 0.6, C 0.5, F 0
  // TOTAL => cal 453, P 28.3, C 33.2, F 21.9
  {
    id: 'lunch_120',
    name: 'Poke bowl saumon GF',
    description: 'Un poke bowl au saumon frais, riz et avocat. 100% sans gluten et plein d\'oméga-3.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja (GF)', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz et le refroidir.',
      'Couper le saumon en cubes.',
      'Assembler le bowl avec tous les ingrédients.',
      'Assaisonner de sauce soja.',
    ],
    baseMacros: { calories: 453, protein: 28, carbs: 33, fat: 22 },
    tags: ['gluten_free', 'poke', 'saumon', 'bowl'],
  },

  // lunch_121: Risotto poulet champignons
  // chicken_breast 140g => cal 231, P 43.4, C 0, F 5
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // mushrooms 80g => cal 18, P 2.5, C 2.6, F 0.3
  // parmesan 10g => cal 39, P 3.9, C 0, F 2.6
  // butter 5g => cal 36, P 0, C 0, F 4.1
  // TOTAL => cal 454, P 52.5, C 30.6, F 12.3
  {
    id: 'lunch_121',
    name: 'Risotto poulet champignons',
    description: 'Un risotto crémeux poulet-champignons. Sans gluten et ultra protéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'parmesan', name: 'Parmesan', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Griller le poulet, le trancher.',
      'Faire revenir champignons dans le beurre.',
      'Cuire le riz façon risotto avec du bouillon.',
      'Ajouter parmesan et poulet en fin de cuisson.',
    ],
    baseMacros: { calories: 454, protein: 53, carbs: 31, fat: 12 },
    tags: ['gluten_free', 'risotto', 'poulet', 'champignons'],
  },

  // lunch_122: Salade quinoa méditerranéenne
  // quinoa 80g => cal 96, P 3.5, C 16.8, F 1.5
  // feta_cheese 30g => cal 79, P 4.2, C 1.2, F 6.3
  // cucumber 40g => cal 6, P 0.3, C 1.5, F 0
  // cherry_tomato 50g => cal 9, P 0.5, C 1.9, F 0.1
  // sun_dried_tomato 15g => cal 38, P 2.1, C 7.5, F 0.6
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 299, P 10.6, C 28.9, F 16.5
  {
    id: 'lunch_122',
    name: 'Salade quinoa méditerranéenne',
    description: 'Une salade quinoa avec feta, tomates séchées et concombre. Fraîche et sans gluten.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'sun_dried_tomato', name: 'Tomates séchées', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa et le refroidir.',
      'Couper les légumes en dés.',
      'Mélanger le tout avec la feta émiettée.',
      'Assaisonner à l\'huile d\'olive.',
    ],
    baseMacros: { calories: 299, protein: 11, carbs: 29, fat: 17 },
    tags: ['gluten_free', 'salade', 'quinoa', 'méditerranéen'],
  },

  // lunch_123: Curry crevettes riz
  // shrimp 140g => cal 139, P 33.6, C 0.3, F 0.4
  // coconut_milk 60g => cal 115, P 0.9, C 1.8, F 12
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // bell_pepper 40g => cal 12, P 0.4, C 2.4, F 0.1
  // curry_paste 8g => cal 9, P 0.2, C 1.4, F 0.2
  // TOTAL => cal 405, P 37.8, C 33.9, F 13
  {
    id: 'lunch_123',
    name: 'Curry crevettes riz',
    description: 'Un curry de crevettes au lait de coco avec du riz. Sans gluten, sans lactose, 100% saveur.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Curry', baseQuantityG: 8, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire sauter les crevettes avec le curry.',
      'Ajouter le lait de coco et le poivron.',
      'Mijoter 8 min.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 405, protein: 38, carbs: 34, fat: 13 },
    tags: ['gluten_free', 'curry', 'crevettes', 'asian'],
  },

  // lunch_124: Steak haché patate douce
  // ground_beef_5 150g => cal 206, P 31.5, C 0, F 8.3
  // sweet_potato 150g => cal 129, P 2.4, C 30, F 0.2
  // green_beans 80g => cal 25, P 1.5, C 5.6, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 404, P 35.4, C 35.6, F 13.6
  {
    id: 'lunch_124',
    name: 'Steak haché patate douce',
    description: 'Un steak haché 5% avec frites de patate douce et haricots verts. Simple et clean.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'green_beans', name: 'Haricots verts', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper la patate douce en frites, enfourner 20 min.',
      'Cuire le steak à la poêle.',
      'Cuire les haricots verts à la vapeur.',
      'Servir le tout ensemble.',
    ],
    baseMacros: { calories: 404, protein: 35, carbs: 36, fat: 14 },
    tags: ['gluten_free', 'steak', 'patate_douce', 'clean'],
  },

  // lunch_125: Wok poulet légumes riz
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // broccoli 60g => cal 20, P 1.7, C 4.2, F 0.2
  // bell_pepper 40g => cal 12, P 0.4, C 2.4, F 0.1
  // soy_sauce 8g => cal 4, P 0.6, C 0.5, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 458, P 51.9, C 35.1, F 11
  {
    id: 'lunch_125',
    name: 'Wok poulet légumes riz',
    description: 'Un wok de poulet avec brocoli et poivron, servi sur du riz. Sans gluten, sans lactose, hyperprotéiné.',
    slot: 'lunch',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le poulet en lamelles, sauter à feu vif.',
      'Ajouter brocoli et poivron, cuire 5 min.',
      'Assaisonner sauce soja et sésame.',
      'Servir sur le riz.',
    ],
    baseMacros: { calories: 458, protein: 52, carbs: 35, fat: 11 },
    tags: ['gluten_free', 'wok', 'poulet', 'high_protein'],
  },
];
