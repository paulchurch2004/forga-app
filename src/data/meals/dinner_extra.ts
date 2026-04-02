import type { Meal } from '../../types/meal';

export const DINNERS_EXTRA: Meal[] = [

  // ══════════════════════════════════════
  // ── FRENCH CLASSIC ECO (8) ──
  // ══════════════════════════════════════

  // dinner_047: Pot-au-feu léger
  // ground_beef_5 200g => cal 274, P 42, C 0, F 11
  // potato 200g => cal 154, P 4, C 34, F 0.2
  // carrot 100g => cal 41, P 0.9, C 10, F 0.2
  // onion 80g => cal 32, P 0.9, C 7.4, F 0.1
  // cabbage 80g => cal 20, P 1, C 4.7, F 0.1
  // TOTAL => cal 521, P 48.8, C 56.1, F 11.6
  {
    id: 'dinner_047',
    name: 'Pot-au-feu léger',
    description: 'Un classique réconfortant version allégée. Le bouillon avec la viande maigre et les légumes, ça réchauffe après une bonne séance.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'cabbage', name: 'Chou', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf haché dans une cocotte avec l\'oignon émincé.',
      'Ajouter les pommes de terre, carottes et chou coupés en morceaux.',
      'Couvrir d\'eau, assaisonner et laisser mijoter 25 min.',
      'Servir bien chaud avec du poivre.',
    ],
    baseMacros: { calories: 521, protein: 49, carbs: 56, fat: 12 },
    tags: ['french', 'comfort', 'high_protein'],
  },

  // dinner_048: Gratin courgettes poulet
  // chicken_breast 180g => cal 297, P 55.8, C 0, F 6.5
  // zucchini 200g => cal 34, P 2.4, C 6.2, F 0.6
  // emmental 30g => cal 114, P 8.1, C 0.3, F 9
  // cream_15 30g => cal 44, P 0.7, C 1.1, F 4.5
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // TOTAL => cal 509, P 67.6, C 12.3, F 20.7
  {
    id: 'dinner_048',
    name: 'Gratin courgettes poulet',
    description: 'Gratin léger mais costaud en protéines. Les courgettes fondantes avec le poulet gratiné, c\'est top le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental râpé', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Couper le poulet en dés et les courgettes en rondelles.',
      'Faire revenir le poulet et l\'oignon à la poêle.',
      'Disposer dans un plat, ajouter la crème et le fromage.',
      'Gratiner au four 15 min à 200°C.',
    ],
    baseMacros: { calories: 509, protein: 68, carbs: 12, fat: 21 },
    tags: ['french', 'gratin', 'high_protein'],
  },

  // dinner_049: Soupe à l'oignon + tartine
  // onion 200g => cal 80, P 2.2, C 18.6, F 0.2
  // bread_whole 60g => cal 153, P 7.2, C 28.2, F 1.8
  // emmental 30g => cal 114, P 8.1, C 0.3, F 9
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 469, P 24, C 47.7, F 21.5
  {
    id: 'dinner_049',
    name: 'Soupe à l\'oignon + tartine',
    description: 'La soupe à l\'oignon gratinée version fit. Avec un œuf poché dedans pour les prots, c\'est parfait le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Émincer les oignons et les faire caraméliser dans l\'huile d\'olive.',
      'Ajouter de l\'eau ou du bouillon, laisser mijoter 15 min.',
      'Pocher l\'œuf dans la soupe, toaster le pain avec l\'emmental.',
      'Servir la soupe avec la tartine gratinée.',
    ],
    baseMacros: { calories: 469, protein: 24, carbs: 48, fat: 22 },
    tags: ['french', 'soup', 'comfort'],
  },

  // dinner_050: Ratatouille poulet grillé
  // chicken_breast 180g => cal 297, P 55.8, C 0, F 6.5
  // zucchini 100g => cal 17, P 1.2, C 3.1, F 0.3
  // eggplant 100g => cal 25, P 1, C 6, F 0.2
  // bell_pepper 80g => cal 20, P 0.7, C 4.6, F 0.2
  // tomato 100g => cal 18, P 0.9, C 3.9, F 0.2
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 421, P 59.6, C 17.6, F 12.4
  {
    id: 'dinner_050',
    name: 'Ratatouille poulet grillé',
    description: 'La ratatouille du sud avec un beau blanc de poulet grillé. Léger, coloré et plein de saveurs.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'eggplant', name: 'Aubergine', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Couper tous les légumes en dés.',
      'Faire revenir à l\'huile d\'olive dans une poêle, assaisonner.',
      'Griller le poulet à part avec sel, poivre et herbes de Provence.',
      'Servir le poulet tranché sur la ratatouille.',
    ],
    baseMacros: { calories: 421, protein: 60, carbs: 18, fat: 12 },
    tags: ['french', 'mediterranean', 'high_protein', 'light'],
  },

  // dinner_051: Endives au jambon (dinde)
  // turkey_breast 150g => cal 203, P 45, C 0, F 1.5
  // ham_slice 60g => cal 66, P 10.8, C 1.2, F 2.4
  // emmental 30g => cal 114, P 8.1, C 0.3, F 9
  // cream_15 40g => cal 59, P 0.9, C 1.5, F 6
  // TOTAL => cal 442, P 64.8, C 3, F 18.9
  {
    id: 'dinner_051',
    name: 'Endives au jambon (dinde)',
    description: 'Le grand classique revisité avec de la dinde. Gratiné au four, c\'est simple et ça envoie en protéines.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['gluten_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'turkey_breast', name: 'Blanc de dinde', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'ham_slice', name: 'Tranche de jambon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire la dinde et l\'enrouler dans les tranches de jambon.',
      'Disposer dans un plat à gratin.',
      'Napper de crème et parsemer d\'emmental.',
      'Gratiner 15 min au four à 200°C.',
    ],
    baseMacros: { calories: 442, protein: 65, carbs: 3, fat: 19 },
    tags: ['french', 'gratin', 'high_protein', 'low_carb'],
  },

  // dinner_052: Brandade de morue
  // cod 180g => cal 148, P 32.4, C 0, F 1.8
  // potato 200g => cal 154, P 4, C 34, F 0.2
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // milk_semi 50g => cal 23, P 1.7, C 2.4, F 0.8
  // TOTAL => cal 413, P 38.1, C 36.4, F 12.8
  {
    id: 'dinner_052',
    name: 'Brandade de morue',
    description: 'La brandade maison, onctueuse et pas trop grasse. Avec de la morue et de la purée, c\'est un délice simple.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'cod', name: 'Cabillaud', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 50, unit: 'ml', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire les pommes de terre et les écraser en purée avec le lait.',
      'Pocher le cabillaud 8 min puis l\'émietter.',
      'Mélanger poisson et purée, ajouter l\'huile d\'olive.',
      'Gratiner légèrement au four 10 min.',
    ],
    baseMacros: { calories: 413, protein: 38, carbs: 36, fat: 13 },
    tags: ['french', 'fish', 'comfort'],
  },

  // dinner_053: Parmentier de canard
  // duck_breast 120g => cal 404, P 22.8, C 0, F 33.6
  // potato 200g => cal 154, P 4, C 34, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // emmental 20g => cal 76, P 5.4, C 0.2, F 6
  // TOTAL => cal 654, P 32.8, C 38.9, F 39.9
  {
    id: 'dinner_053',
    name: 'Parmentier de canard',
    description: 'Un parmentier gourmand au canard. C\'est riche mais tellement bon après un gros training.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'duck_breast', name: 'Magret de canard', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le magret côté peau, puis l\'émincer finement.',
      'Préparer une purée avec les pommes de terre.',
      'Faire revenir l\'oignon, mélanger avec le canard.',
      'Alterner couches de viande et purée, gratiner avec l\'emmental 15 min.',
    ],
    baseMacros: { calories: 654, protein: 33, carbs: 39, fat: 40 },
    tags: ['french', 'gratin', 'comfort'],
  },

  // dinner_054: Poireaux vinaigrette + poulet
  // chicken_breast 180g => cal 297, P 55.8, C 0, F 6.5
  // green_beans 150g => cal 47, P 2.7, C 9.8, F 0.3
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // mustard 10g => cal 66, P 4, C 5, F 4
  // lemon_juice 10g => cal 2, P 0, C 0.7, F 0
  // TOTAL => cal 500, P 62.5, C 15.5, F 20.8
  {
    id: 'dinner_054',
    name: 'Poireaux vinaigrette + poulet',
    description: 'Entrée-plat classique française. Les légumes tièdes en vinaigrette avec du poulet grillé, frais et léger.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'green_beans', name: 'Haricots verts', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
      { ingredientId: 'mustard', name: 'Moutarde', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les haricots verts à la vapeur 10 min.',
      'Griller le poulet assaisonné à la poêle.',
      'Préparer la vinaigrette : huile, moutarde, citron.',
      'Servir les légumes tièdes nappés de vinaigrette avec le poulet.',
    ],
    baseMacros: { calories: 500, protein: 63, carbs: 16, fat: 21 },
    tags: ['french', 'light', 'high_protein'],
  },

  // ══════════════════════════════════════
  // ── FRENCH PREMIUM (5) ──
  // ══════════════════════════════════════

  // dinner_055: Pavé de saumon beurre blanc light
  // salmon_fillet 180g => cal 374, P 36, C 0, F 23.4
  // spinach 100g => cal 23, P 2.9, C 3.6, F 0.4
  // butter 10g => cal 72, P 0.1, C 0, F 8.1
  // lemon_juice 15g => cal 3, P 0.1, C 1.1, F 0
  // TOTAL => cal 472, P 39.1, C 4.7, F 31.9
  {
    id: 'dinner_055',
    name: 'Pavé de saumon beurre blanc light',
    description: 'Un pavé de saumon avec un beurre blanc allégé et des épinards. Classe et plein de bons oméga-3.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Pavé de saumon', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards frais', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le saumon à la poêle côté peau 4 min puis retourner 3 min.',
      'Faire tomber les épinards dans une poêle avec un peu d\'eau.',
      'Préparer le beurre blanc : faire fondre le beurre, ajouter le citron.',
      'Dresser le saumon sur les épinards, napper de sauce.',
    ],
    baseMacros: { calories: 472, protein: 39, carbs: 5, fat: 32 },
    tags: ['french', 'premium', 'omega3', 'low_carb'],
  },

  // dinner_056: Filet de bar grillé
  // white_fish 200g => cal 164, P 36, C 0, F 2
  // asparagus 120g => cal 24, P 2.6, C 4.4, F 0.1
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // cherry_tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // TOTAL => cal 290, P 39.3, C 7.5, F 12.3
  {
    id: 'dinner_056',
    name: 'Filet de bar grillé',
    description: 'Du bar bien grillé avec des asperges et des tomates cerises. Léger, chic et parfait pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_fish', name: 'Filet de bar', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'asparagus', name: 'Asperges', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Griller le filet de bar à la poêle avec un filet d\'huile d\'olive.',
      'Cuire les asperges à la vapeur 8 min.',
      'Faire sauter les tomates cerises à la poêle.',
      'Dresser le tout, arroser d\'un filet d\'huile d\'olive.',
    ],
    baseMacros: { calories: 290, protein: 39, carbs: 8, fat: 12 },
    tags: ['french', 'premium', 'light', 'low_carb'],
  },

  // dinner_057: Côte de veau aux girolles
  // chicken_thigh 180g => cal 319, P 43.2, C 0, F 15.3
  // mushrooms 120g => cal 26, P 3.7, C 3.9, F 0.4
  // cream_15 30g => cal 44, P 0.7, C 1.1, F 4.5
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // TOTAL => cal 409, P 48.2, C 9.7, F 20.3
  {
    id: 'dinner_057',
    name: 'Côte de veau aux girolles',
    description: 'Une belle pièce de viande avec des champignons crémeux. Repas premium pour une soirée tranquille.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Saisir la viande à feu vif des deux côtés.',
      'Réserver et faire sauter les champignons avec l\'oignon.',
      'Déglacer avec la crème, laisser réduire 3 min.',
      'Servir la viande nappée de sauce aux champignons.',
    ],
    baseMacros: { calories: 409, protein: 48, carbs: 10, fat: 20 },
    tags: ['french', 'premium', 'mushroom'],
  },

  // dinner_058: Magret de canard miel
  // duck_breast 150g => cal 506, P 28.5, C 0, F 42
  // honey 15g => cal 46, P 0, C 12.3, F 0
  // sweet_potato 150g => cal 129, P 2.4, C 30, F 0.2
  // spinach 80g => cal 18, P 2.3, C 2.9, F 0.3
  // TOTAL => cal 699, P 33.2, C 45.2, F 42.5
  {
    id: 'dinner_058',
    name: 'Magret de canard miel',
    description: 'Magret laqué au miel avec de la patate douce. C\'est riche mais pour un cheat day contrôlé, c\'est royal.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 3,
    ingredients: [
      { ingredientId: 'duck_breast', name: 'Magret de canard', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Inciser le gras du magret en croisillons.',
      'Cuire côté peau 8 min puis retourner 4 min, badigeonner de miel.',
      'Cuire la patate douce en rondelles au four 20 min.',
      'Servir le magret tranché avec les patates douces et épinards.',
    ],
    baseMacros: { calories: 699, protein: 33, carbs: 45, fat: 43 },
    tags: ['french', 'premium', 'duck'],
  },

  // dinner_059: Tartare de thon avocat
  // canned_tuna 150g => cal 174, P 39, C 0, F 1.5
  // avocado 80g => cal 128, P 1.6, C 7.2, F 12
  // cucumber 80g => cal 12, P 0.5, C 2.9, F 0.1
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 363, P 41.9, C 10.7, F 18.6
  {
    id: 'dinner_059',
    name: 'Tartare de thon avocat',
    description: 'Un tartare frais thon-avocat façon japonaise. Parfait quand il fait chaud et que tu veux manger léger.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'canned_tuna', name: 'Thon', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Couper le thon et l\'avocat en petits dés.',
      'Émincer le concombre finement.',
      'Mélanger avec la sauce soja et l\'huile de sésame.',
      'Dresser à l\'aide d\'un emporte-pièce, servir frais.',
    ],
    baseMacros: { calories: 363, protein: 42, carbs: 11, fat: 19 },
    tags: ['french', 'premium', 'raw', 'light'],
  },

  // ══════════════════════════════════════
  // ── ASIAN (12) ──
  // ══════════════════════════════════════

  // dinner_060: Sushi bowl maison
  // salmon_fillet 120g => cal 250, P 24, C 0, F 15.6
  // basmati_rice 150g => cal 195, P 4.1, C 42, F 0.5
  // avocado 50g => cal 80, P 1, C 4.5, F 7.5
  // cucumber 60g => cal 9, P 0.4, C 2.2, F 0.1
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // TOTAL => cal 539, P 30.3, C 49.3, F 23.7
  {
    id: 'dinner_060',
    name: 'Sushi bowl maison',
    description: 'Un poké bowl maison avec du saumon frais, du riz et de l\'avocat. Comme au resto mais en mieux.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon frais', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz et laisser refroidir légèrement.',
      'Couper le saumon et l\'avocat en tranches.',
      'Émincer le concombre en rondelles fines.',
      'Assembler le bowl, arroser de sauce soja.',
    ],
    baseMacros: { calories: 539, protein: 30, carbs: 49, fat: 24 },
    tags: ['asian', 'japanese', 'bowl'],
  },

  // dinner_061: Curry massaman poulet
  // chicken_breast 160g => cal 264, P 49.6, C 0, F 5.8
  // potato 120g => cal 92, P 2.4, C 20.4, F 0.1
  // coconut_milk 80g => cal 154, P 1.2, C 2.4, F 16
  // curry_paste 15g => cal 17, P 0.5, C 2.5, F 0.5
  // peanuts 15g => cal 84, P 3.8, C 2.4, F 7.3
  // TOTAL => cal 611, P 57.5, C 27.7, F 29.7
  {
    id: 'dinner_061',
    name: 'Curry massaman poulet',
    description: 'Le curry thaï doux et crémeux avec des cacahuètes. Réconfortant et bien protéiné.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Pâte de curry', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir le poulet coupé en morceaux.',
      'Ajouter la pâte de curry et le lait de coco.',
      'Ajouter les pommes de terre en dés, mijoter 20 min.',
      'Servir avec les cacahuètes concassées.',
    ],
    baseMacros: { calories: 611, protein: 58, carbs: 28, fat: 30 },
    tags: ['asian', 'thai', 'curry', 'high_protein'],
  },

  // dinner_062: Pho boeuf
  // ground_beef_5 150g => cal 206, P 31.5, C 0, F 8.3
  // rice_noodles 100g => cal 109, P 0.9, C 25, F 0.2
  // bean_sprouts 60g => cal 18, P 1.8, C 3, F 0.1
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // ginger_fresh 10g => cal 8, P 0.2, C 1.8, F 0.1
  // TOTAL => cal 361, P 35, C 34.5, F 8.8
  {
    id: 'dinner_062',
    name: 'Pho bœuf',
    description: 'La soupe vietnamienne au bœuf avec des nouilles de riz. Le bouillon parfumé, c\'est magique le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bean_sprouts', name: 'Pousses de soja', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Préparer le bouillon avec oignon et gingembre 10 min.',
      'Cuire les nouilles de riz selon les instructions.',
      'Former des boulettes de bœuf et les pocher dans le bouillon.',
      'Servir avec les pousses de soja et des herbes fraîches.',
    ],
    baseMacros: { calories: 361, protein: 35, carbs: 35, fat: 9 },
    tags: ['asian', 'vietnamese', 'soup', 'light'],
  },

  // dinner_063: Ramen tonkotsu light
  // chicken_breast 140g => cal 231, P 43.4, C 0, F 5
  // udon_noodles 120g => cal 119, P 3.1, C 26.4, F 0.2
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // miso_paste 10g => cal 20, P 1.2, C 2.6, F 0.6
  // TOTAL => cal 462, P 55.9, C 31.8, F 11.5
  {
    id: 'dinner_063',
    name: 'Ramen tonkotsu light',
    description: 'Des ramen maison version light avec du poulet. Le bouillon miso avec l\'œuf mollet, c\'est le kif.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'miso_paste', name: 'Pâte miso', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Préparer le bouillon en diluant la pâte miso dans de l\'eau chaude.',
      'Cuire les nouilles udon et le poulet émincé séparément.',
      'Cuire l\'œuf mollet 6 min, le couper en deux.',
      'Assembler le ramen : nouilles, poulet, épinards, œuf, bouillon.',
    ],
    baseMacros: { calories: 462, protein: 56, carbs: 32, fat: 12 },
    tags: ['asian', 'japanese', 'ramen', 'high_protein'],
  },

  // dinner_064: Bibimbap saumon
  // salmon_fillet 130g => cal 270, P 26, C 0, F 16.9
  // basmati_rice 130g => cal 169, P 3.5, C 36.4, F 0.4
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // carrot 60g => cal 25, P 0.5, C 6, F 0.1
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 600, P 38.2, C 45.2, F 28.1
  {
    id: 'dinner_064',
    name: 'Bibimbap saumon',
    description: 'Le bibimbap coréen avec du saumon grillé. Du riz, des légumes, un œuf au plat, on mélange et c\'est parti.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Saumon', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire le riz et griller le saumon à la poêle.',
      'Faire sauter les épinards et les carottes râpées séparément.',
      'Cuire un œuf au plat.',
      'Assembler le bowl : riz, saumon émietté, légumes, œuf, huile de sésame.',
    ],
    baseMacros: { calories: 600, protein: 38, carbs: 45, fat: 28 },
    tags: ['asian', 'korean', 'bowl'],
  },

  // dinner_065: Wok crevettes udon
  // shrimp 160g => cal 158, P 38.4, C 0.3, F 0.5
  // udon_noodles 130g => cal 129, P 3.4, C 28.6, F 0.3
  // bell_pepper 80g => cal 20, P 0.7, C 4.6, F 0.2
  // carrot 60g => cal 25, P 0.5, C 6, F 0.1
  // soy_sauce 15g => cal 8, P 1.2, C 0.9, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 384, P 44.2, C 40.4, F 6.1
  {
    id: 'dinner_065',
    name: 'Wok crevettes udon',
    description: 'Des udon sautées au wok avec des crevettes et des légumes croquants. Rapide et savoureux.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire les udon selon les instructions, égoutter.',
      'Faire sauter les crevettes à feu vif dans l\'huile de sésame.',
      'Ajouter les légumes émincés, sauter 3 min.',
      'Incorporer les nouilles et la sauce soja, mélanger 2 min.',
    ],
    baseMacros: { calories: 384, protein: 44, carbs: 40, fat: 6 },
    tags: ['asian', 'wok', 'high_protein', 'light'],
  },

  // dinner_066: Soupe miso tofu
  // tofu_firm 150g => cal 216, P 25.5, C 4.5, F 12
  // udon_noodles 100g => cal 99, P 2.6, C 22, F 0.2
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // miso_paste 15g => cal 30, P 1.8, C 3.9, F 0.9
  // nori 3g => cal 9, P 1.5, C 1.2, F 0.1
  // TOTAL => cal 368, P 33.1, C 33.8, F 13.4
  {
    id: 'dinner_066',
    name: 'Soupe miso tofu',
    description: 'La soupe miso japonaise avec du tofu et des nouilles. Légère et réconfortante pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'miso_paste', name: 'Pâte miso', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'nori', name: 'Nori', baseQuantityG: 3, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Faire chauffer de l\'eau et y diluer la pâte miso.',
      'Cuire les nouilles udon, égoutter.',
      'Couper le tofu en dés et l\'ajouter au bouillon.',
      'Ajouter les épinards et le nori, servir chaud.',
    ],
    baseMacros: { calories: 368, protein: 33, carbs: 34, fat: 13 },
    tags: ['asian', 'japanese', 'soup', 'vegan'],
  },

  // dinner_067: Donburi poulet teriyaki
  // chicken_thigh 160g => cal 283, P 38.4, C 0, F 13.6
  // basmati_rice 140g => cal 182, P 3.8, C 39.2, F 0.4
  // teriyaki_sauce 20g => cal 16, P 0.6, C 3.2, F 0
  // broccoli 80g => cal 27, P 2.2, C 5.6, F 0.3
  // TOTAL => cal 508, P 45, C 48, F 14.3
  {
    id: 'dinner_067',
    name: 'Donburi poulet teriyaki',
    description: 'Un bol de riz japonais avec du poulet teriyaki caramélisé. Simple, efficace et super bon.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'teriyaki_sauce', name: 'Sauce teriyaki', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Griller le poulet à la poêle, ajouter la sauce teriyaki et laisser caraméliser.',
      'Cuire le brocoli à la vapeur 5 min.',
      'Disposer le riz dans un bol, ajouter le poulet et le brocoli.',
    ],
    baseMacros: { calories: 508, protein: 45, carbs: 48, fat: 14 },
    tags: ['asian', 'japanese', 'bowl', 'high_protein'],
  },

  // dinner_068: Laksa crevettes
  // shrimp 150g => cal 149, P 36, C 0.3, F 0.5
  // rice_noodles 100g => cal 109, P 0.9, C 25, F 0.2
  // coconut_milk 80g => cal 154, P 1.2, C 2.4, F 16
  // curry_paste 15g => cal 17, P 0.5, C 2.5, F 0.5
  // bean_sprouts 50g => cal 15, P 1.5, C 2.5, F 0.1
  // TOTAL => cal 444, P 40.1, C 32.7, F 17.3
  {
    id: 'dinner_068',
    name: 'Laksa crevettes',
    description: 'Une soupe laksa aux crevettes et lait de coco. C\'est crémeux, épicé et les nouilles baignent dedans.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Pâte de curry', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'bean_sprouts', name: 'Pousses de soja', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire chauffer le lait de coco avec la pâte de curry.',
      'Ajouter de l\'eau pour allonger le bouillon.',
      'Cuire les nouilles de riz, ajouter les crevettes et cuire 3 min.',
      'Servir avec les pousses de soja fraîches.',
    ],
    baseMacros: { calories: 444, protein: 40, carbs: 33, fat: 17 },
    tags: ['asian', 'malaysian', 'soup', 'spicy'],
  },

  // dinner_069: Pad see ew poulet
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // rice_noodles 120g => cal 131, P 1.1, C 30, F 0.2
  // broccoli 80g => cal 27, P 2.2, C 5.6, F 0.3
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // soy_sauce 15g => cal 8, P 1.2, C 0.9, F 0
  // TOTAL => cal 492, P 57.5, C 37.1, F 11.4
  {
    id: 'dinner_069',
    name: 'Pad see ew poulet',
    description: 'Des nouilles de riz sautées façon thaï avec du poulet et du brocoli. Street food à la maison.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les nouilles de riz et égoutter.',
      'Faire sauter le poulet émincé à feu vif.',
      'Ajouter le brocoli et l\'œuf battu, remuer.',
      'Incorporer les nouilles et la sauce soja, sauter 2 min.',
    ],
    baseMacros: { calories: 492, protein: 58, carbs: 37, fat: 11 },
    tags: ['asian', 'thai', 'wok', 'high_protein'],
  },

  // dinner_070: Gyudon (bol boeuf riz)
  // ground_beef_5 160g => cal 219, P 33.6, C 0, F 8.8
  // basmati_rice 140g => cal 182, P 3.8, C 39.2, F 0.4
  // onion 80g => cal 32, P 0.9, C 7.4, F 0.1
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // TOTAL => cal 516, P 45.6, C 47.8, F 14.8
  {
    id: 'dinner_070',
    name: 'Gyudon (bol bœuf riz)',
    description: 'Le fast-food japonais healthy. Du bœuf mijoté avec des oignons sur du riz, surmonté d\'un œuf.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf haché avec les oignons émincés.',
      'Ajouter la sauce soja et un peu d\'eau, mijoter 10 min.',
      'Cuire le riz basmati.',
      'Servir le bœuf sur le riz, ajouter un œuf poché ou au plat.',
    ],
    baseMacros: { calories: 516, protein: 46, carbs: 48, fat: 15 },
    tags: ['asian', 'japanese', 'bowl', 'comfort'],
  },

  // dinner_071: Tom kha gai
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // coconut_milk 100g => cal 193, P 1.5, C 3, F 20
  // mushrooms 80g => cal 18, P 2.5, C 2.6, F 0.3
  // ginger_fresh 10g => cal 8, P 0.2, C 1.8, F 0.1
  // lemongrass 5g => cal 5, P 0.1, C 1.2, F 0
  // lemon_juice 10g => cal 2, P 0, C 0.7, F 0
  // TOTAL => cal 474, P 50.8, C 9.3, F 25.8
  {
    id: 'dinner_071',
    name: 'Tom kha gai',
    description: 'La soupe thaï au poulet et lait de coco. Crémeuse avec une touche de citron vert, un vrai régal.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'lemongrass', name: 'Citronnelle', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire chauffer le lait de coco avec le gingembre et la citronnelle.',
      'Ajouter le poulet émincé et les champignons.',
      'Laisser mijoter 15 min à feu doux.',
      'Ajouter le jus de citron avant de servir.',
    ],
    baseMacros: { calories: 474, protein: 51, carbs: 9, fat: 26 },
    tags: ['asian', 'thai', 'soup', 'low_carb'],
  },

  // ══════════════════════════════════════
  // ── MIDDLE EAST / MAGHREB (10) ──
  // ══════════════════════════════════════

  // dinner_072: Kebab maison poulet
  // chicken_breast 180g => cal 297, P 55.8, C 0, F 6.5
  // wrap_tortilla 60g => cal 177, P 4.8, C 30, F 4.2
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // mixed_salad 30g => cal 5, P 0.4, C 0.9, F 0.1
  // TOTAL => cal 506, P 61.9, C 36.9, F 10.9
  {
    id: 'dinner_072',
    name: 'Kebab maison poulet',
    description: 'Le kebab fait maison avec du vrai poulet grillé. Tellement meilleur et plus sain que celui du coin.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'wrap_tortilla', name: 'Wrap tortilla', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Émincer le poulet et le griller avec des épices kebab.',
      'Couper la tomate et l\'oignon en rondelles.',
      'Chauffer le wrap à la poêle.',
      'Garnir le wrap de poulet, salade, tomate et oignon, rouler.',
    ],
    baseMacros: { calories: 506, protein: 62, carbs: 37, fat: 11 },
    tags: ['middle_east', 'wrap', 'high_protein'],
  },

  // dinner_073: Adana kefta
  // ground_beef_5 200g => cal 274, P 42, C 0, F 11
  // bulgur 100g => cal 83, P 3.1, C 19, F 0.2
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // TOTAL => cal 410, P 47, C 31.2, F 11.7
  {
    id: 'dinner_073',
    name: 'Adana kefta',
    description: 'Des kefta turques épicées avec du boulgour. Grillées à la poêle avec des légumes, c\'est costaud.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Boeuf haché 5%', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'bulgur', name: 'Boulgour', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélanger le bœuf haché avec l\'oignon râpé et les épices, former des kefta.',
      'Cuire le boulgour 10 min dans de l\'eau.',
      'Griller les kefta à la poêle 4 min de chaque côté.',
      'Servir avec le boulgour, la tomate et le poivron coupés.',
    ],
    baseMacros: { calories: 410, protein: 47, carbs: 31, fat: 12 },
    tags: ['middle_east', 'turkish', 'grill', 'high_protein'],
  },

  // dinner_074: Couscous poulet légumes
  // chicken_breast 160g => cal 264, P 49.6, C 0, F 5.8
  // couscous 120g => cal 134, P 4.6, C 27.6, F 0.2
  // zucchini 80g => cal 14, P 1, C 2.5, F 0.2
  // carrot 80g => cal 33, P 0.7, C 8, F 0.2
  // chickpeas 60g => cal 98, P 5.4, C 16.2, F 1.6
  // TOTAL => cal 543, P 61.3, C 54.3, F 8
  {
    id: 'dinner_074',
    name: 'Couscous poulet légumes',
    description: 'Le couscous du vendredi avec du poulet et plein de légumes. Convivial et nourrissant sans être trop lourd.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'couscous', name: 'Couscous', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir le poulet coupé en morceaux.',
      'Ajouter les légumes en morceaux et les pois chiches, couvrir d\'eau.',
      'Laisser mijoter 20 min avec des épices à couscous.',
      'Préparer la semoule et servir avec le bouillon de légumes.',
    ],
    baseMacros: { calories: 543, protein: 61, carbs: 54, fat: 8 },
    tags: ['maghreb', 'couscous', 'high_protein'],
  },

  // dinner_075: Tajine agneau pruneaux
  // lamb_leg 150g => cal 243, P 30, C 0, F 13.5
  // sweet_potato 120g => cal 103, P 1.9, C 24, F 0.1
  // dates 30g => cal 83, P 0.6, C 21.9, F 0.1
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 497, P 33.2, C 51.5, F 18.8
  {
    id: 'dinner_075',
    name: 'Tajine agneau pruneaux',
    description: 'Le tajine sucré-salé marocain avec de l\'agneau fondant et des dattes. Un classique qui envoie du lourd.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 40,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'lamb_leg', name: 'Gigot d\'agneau', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'dates', name: 'Dattes', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Faire revenir l\'agneau coupé en morceaux avec l\'oignon.',
      'Ajouter la patate douce en cubes et couvrir d\'eau.',
      'Laisser mijoter 30 min à couvert.',
      'Ajouter les dattes en fin de cuisson, mijoter encore 5 min.',
    ],
    baseMacros: { calories: 497, protein: 33, carbs: 52, fat: 19 },
    tags: ['maghreb', 'moroccan', 'tajine', 'comfort'],
  },

  // dinner_076: Moussaka libanaise
  // ground_beef_5 150g => cal 206, P 31.5, C 0, F 8.3
  // eggplant 150g => cal 38, P 1.5, C 9, F 0.3
  // tomato_sauce 80g => cal 29, P 1.3, C 5.8, F 0.2
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // TOTAL => cal 385, P 35, C 20.4, F 18.9
  {
    id: 'dinner_076',
    name: 'Moussaka libanaise',
    description: 'La moussaka du Liban, sans béchamel. De l\'aubergine grillée avec du bœuf à la tomate, léger et savoureux.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'eggplant', name: 'Aubergine', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Trancher et griller les aubergines au four avec un peu d\'huile.',
      'Faire revenir le bœuf avec l\'oignon et la sauce tomate.',
      'Alterner couches d\'aubergines et de viande dans un plat.',
      'Enfourner 15 min à 180°C.',
    ],
    baseMacros: { calories: 385, protein: 35, carbs: 20, fat: 19 },
    tags: ['middle_east', 'lebanese', 'gratin'],
  },

  // dinner_077: Fatteh poulet
  // chicken_breast 160g => cal 264, P 49.6, C 0, F 5.8
  // flatbread 40g => cal 110, P 3.6, C 22, F 0.5
  // chickpeas 60g => cal 98, P 5.4, C 16.2, F 1.6
  // greek_yogurt_0 60g => cal 34, P 6, C 2.4, F 0
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 550, P 64.6, C 40.6, F 12.9
  {
    id: 'dinner_077',
    name: 'Fatteh poulet',
    description: 'Un plat libanais avec du poulet, des pois chiches et du pain croustillant. Nappé de yaourt, c\'est un délice.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Griller le poulet et le couper en morceaux.',
      'Toaster le pain plat coupé en morceaux au four.',
      'Réchauffer les pois chiches.',
      'Assembler : pain, pois chiches, poulet, napper de yaourt et d\'huile d\'olive.',
    ],
    baseMacros: { calories: 550, protein: 65, carbs: 41, fat: 13 },
    tags: ['middle_east', 'lebanese', 'high_protein'],
  },

  // dinner_078: Kofta daoud basha
  // ground_beef_5 180g => cal 247, P 37.8, C 0, F 9.9
  // tomato_sauce 100g => cal 36, P 1.6, C 7.3, F 0.3
  // potato 120g => cal 92, P 2.4, C 20.4, F 0.1
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 439, P 42.4, C 32.4, F 15.4
  {
    id: 'dinner_078',
    name: 'Kofta daoud basha',
    description: 'Des boulettes de viande à la libanaise mijotées dans la sauce tomate. Fondantes et pleines de goût.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Former des boulettes avec le bœuf haché et l\'oignon râpé.',
      'Faire dorer les boulettes à la poêle.',
      'Ajouter la sauce tomate et les pommes de terre en cubes.',
      'Mijoter à couvert 20 min.',
    ],
    baseMacros: { calories: 439, protein: 42, carbs: 32, fat: 15 },
    tags: ['middle_east', 'lebanese', 'meatball', 'comfort'],
  },

  // dinner_079: Mechoui agneau
  // lamb_leg 180g => cal 292, P 36, C 0, F 16.2
  // couscous 120g => cal 134, P 4.6, C 27.6, F 0.2
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // carrot 80g => cal 33, P 0.7, C 8, F 0.2
  // TOTAL => cal 483, P 42, C 41.2, F 16.7
  {
    id: 'dinner_079',
    name: 'Mechoui agneau',
    description: 'De l\'agneau rôti façon mechoui avec de la semoule. Parfumé aux épices, c\'est la fête dans l\'assiette.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 40,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'lamb_leg', name: 'Gigot d\'agneau', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'couscous', name: 'Semoule de couscous', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Assaisonner l\'agneau avec cumin, paprika, ail et laisser mariner.',
      'Rôtir au four 30 min à 200°C avec les oignons et carottes.',
      'Préparer la semoule.',
      'Servir l\'agneau tranché sur la semoule avec les légumes rôtis.',
    ],
    baseMacros: { calories: 483, protein: 42, carbs: 41, fat: 17 },
    tags: ['maghreb', 'lamb', 'roast'],
  },

  // dinner_080: Chermoula poisson
  // white_fish 200g => cal 164, P 36, C 0, F 2
  // potato 150g => cal 116, P 3, C 25.5, F 0.2
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // lemon_juice 10g => cal 2, P 0, C 0.7, F 0
  // cilantro 5g => cal 1, P 0.1, C 0.2, F 0
  // TOTAL => cal 385, P 39.8, C 29.5, F 12.4
  {
    id: 'dinner_080',
    name: 'Chermoula poisson',
    description: 'Du poisson blanc mariné à la chermoula marocaine. Citron, coriandre, cumin : c\'est frais et parfumé.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_fish', name: 'Poisson blanc', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'cilantro', name: 'Coriandre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Préparer la chermoula : huile d\'olive, citron, coriandre, cumin, paprika.',
      'Mariner le poisson 15 min.',
      'Cuire les pommes de terre en rondelles au four.',
      'Cuire le poisson au four sur les pommes de terre avec la tomate 15 min.',
    ],
    baseMacros: { calories: 385, protein: 40, carbs: 30, fat: 12 },
    tags: ['maghreb', 'moroccan', 'fish'],
  },

  // dinner_081: Maqluba poulet
  // chicken_thigh 160g => cal 283, P 38.4, C 0, F 13.6
  // basmati_rice 130g => cal 169, P 3.5, C 36.4, F 0.4
  // eggplant 100g => cal 25, P 1, C 6, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 541, P 43.5, C 47.1, F 19.3
  {
    id: 'dinner_081',
    name: 'Maqluba poulet',
    description: 'Le plat palestinien renversé : riz, poulet et aubergines. On retourne la cocotte et c\'est spectaculaire.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 3,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'eggplant', name: 'Aubergine', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Faire frire les tranches d\'aubergine légèrement dans l\'huile.',
      'Faire dorer le poulet avec l\'oignon dans une cocotte.',
      'Ajouter le riz lavé par-dessus, couvrir d\'eau assaisonnée.',
      'Cuire à couvert 20 min, retourner sur un plat pour servir.',
    ],
    baseMacros: { calories: 541, protein: 44, carbs: 47, fat: 19 },
    tags: ['middle_east', 'palestinian', 'rice'],
  },

  // ══════════════════════════════════════
  // ── AFRICAN (8) ──
  // ══════════════════════════════════════

  // dinner_082: Poulet DG camerounais
  // chicken_thigh 160g => cal 283, P 38.4, C 0, F 13.6
  // plantain 120g => cal 146, P 1.6, C 38.4, F 0.5
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // TOTAL => cal 478, P 41.8, C 49.7, F 14.6
  {
    id: 'dinner_082',
    name: 'Poulet DG camerounais',
    description: 'Le fameux poulet DG du Cameroun avec de la banane plantain. Un plat de fête plein de saveurs.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'plantain', name: 'Banane plantain', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire dorer le poulet coupé en morceaux à la poêle.',
      'Faire frire la banane plantain en rondelles.',
      'Faire revenir les légumes : tomate, poivron, oignon.',
      'Mélanger le tout et mijoter 10 min.',
    ],
    baseMacros: { calories: 478, protein: 42, carbs: 50, fat: 15 },
    tags: ['african', 'cameroon', 'plantain'],
  },

  // dinner_083: Thiof grillé riz
  // tilapia 200g => cal 164, P 36, C 0, F 2
  // basmati_rice 140g => cal 182, P 3.8, C 39.2, F 0.4
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // TOTAL => cal 472, P 41.2, C 47.9, F 12.7
  {
    id: 'dinner_083',
    name: 'Thiof grillé riz',
    description: 'Du poisson grillé façon sénégalaise avec du riz. Simple, frais et protéiné, le plat du pêcheur.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tilapia', name: 'Tilapia', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Mariner le poisson avec citron et épices.',
      'Griller le poisson à la poêle dans l\'huile d\'olive.',
      'Faire une sauce avec tomate et oignon, servir sur le riz.',
    ],
    baseMacros: { calories: 472, protein: 41, carbs: 48, fat: 13 },
    tags: ['african', 'senegalese', 'fish'],
  },

  // dinner_084: Kedjenou poulet
  // chicken_thigh 180g => cal 319, P 43.2, C 0, F 15.3
  // tomato 100g => cal 18, P 0.9, C 3.9, F 0.2
  // bell_pepper 80g => cal 20, P 0.7, C 4.6, F 0.2
  // onion 60g => cal 24, P 0.7, C 5.6, F 0.1
  // eggplant 80g => cal 20, P 0.8, C 4.8, F 0.2
  // TOTAL => cal 401, P 46.3, C 18.9, F 16
  {
    id: 'dinner_084',
    name: 'Kedjenou poulet',
    description: 'Le ragoût ivoirien mijoté en cocotte fermée. Le poulet est ultra fondant avec les légumes.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'eggplant', name: 'Aubergine', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mettre le poulet et tous les légumes coupés dans une cocotte.',
      'Assaisonner avec sel, poivre, piment et gingembre.',
      'Fermer hermétiquement et cuire à feu doux 30 min sans ouvrir.',
      'Secouer la cocotte de temps en temps, servir tel quel.',
    ],
    baseMacros: { calories: 401, protein: 46, carbs: 19, fat: 16 },
    tags: ['african', 'ivorian', 'stew', 'low_carb'],
  },

  // dinner_085: Capitaine braisé
  // tilapia 200g => cal 164, P 36, C 0, F 2
  // plantain 130g => cal 159, P 1.7, C 41.6, F 0.5
  // tomato_sauce 60g => cal 22, P 1, C 4.4, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // olive_oil 10g => cal 88, P 0, C 0, F 10
  // TOTAL => cal 453, P 39.3, C 50.7, F 12.8
  {
    id: 'dinner_085',
    name: 'Capitaine braisé',
    description: 'Du poisson braisé à l\'africaine avec de la plantain. La sauce tomate épicée, ça relève tout.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tilapia', name: 'Tilapia (capitaine)', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'plantain', name: 'Banane plantain', baseQuantityG: 130, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Faire braiser le poisson à la poêle dans l\'huile.',
      'Préparer la sauce : oignon, sauce tomate, piment.',
      'Faire frire les rondelles de plantain.',
      'Servir le poisson nappé de sauce avec la plantain.',
    ],
    baseMacros: { calories: 453, protein: 39, carbs: 51, fat: 13 },
    tags: ['african', 'fish', 'plantain'],
  },

  // dinner_086: Riz jollof crevettes
  // shrimp 150g => cal 149, P 36, C 0.3, F 0.5
  // basmati_rice 140g => cal 182, P 3.8, C 39.2, F 0.4
  // tomato_sauce 80g => cal 29, P 1.3, C 5.8, F 0.2
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // TOTAL => cal 395, P 42.2, C 53.5, F 1.4
  {
    id: 'dinner_086',
    name: 'Riz jollof crevettes',
    description: 'Le riz jollof ouest-africain aux crevettes. Le riz cuit dans la sauce tomate, c\'est une tuerie.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'shrimp', name: 'Crevettes', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 140, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon et le poivron, ajouter la sauce tomate.',
      'Ajouter le riz et couvrir d\'eau, cuire 15 min.',
      'Faire sauter les crevettes à part.',
      'Ajouter les crevettes au riz en fin de cuisson.',
    ],
    baseMacros: { calories: 395, protein: 42, carbs: 54, fat: 1 },
    tags: ['african', 'nigerian', 'rice', 'low_fat'],
  },

  // dinner_087: Sauce gombo poisson
  // white_fish 180g => cal 148, P 32.4, C 0, F 1.8
  // okra 100g => cal 33, P 1.9, C 7, F 0.2
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // TOTAL => cal 371, P 38.8, C 48.4, F 2.7
  {
    id: 'dinner_087',
    name: 'Sauce gombo poisson',
    description: 'La sauce gombo avec du poisson blanc et du riz. Un classique d\'Afrique de l\'Ouest super léger.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_fish', name: 'Poisson blanc', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'okra', name: 'Gombo', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Couper le gombo et le faire revenir avec l\'oignon et la tomate.',
      'Ajouter de l\'eau et le poisson en morceaux.',
      'Mijoter 15 min, servir la sauce sur le riz.',
    ],
    baseMacros: { calories: 371, protein: 39, carbs: 48, fat: 3 },
    tags: ['african', 'west_african', 'fish', 'low_fat'],
  },

  // dinner_088: Garba attiéké thon
  // canned_tuna 150g => cal 174, P 39, C 0, F 1.5
  // cassava 150g => cal 240, P 2.1, C 57, F 0.5
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 485, P 42, C 63, F 7.1
  {
    id: 'dinner_088',
    name: 'Garba attiéké thon',
    description: 'Le garba ivoirien : attiéké avec du thon frit. Le street food d\'Abidjan à la maison.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'canned_tuna', name: 'Thon', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'cassava', name: 'Attiéké (manioc)', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Émietter le thon et le faire revenir à la poêle dans l\'huile.',
      'Réchauffer l\'attiéké à la vapeur ou au micro-ondes.',
      'Couper la tomate et l\'oignon en rondelles.',
      'Servir l\'attiéké avec le thon et les crudités.',
    ],
    baseMacros: { calories: 485, protein: 42, carbs: 63, fat: 7 },
    tags: ['african', 'ivorian', 'street_food'],
  },

  // dinner_089: Doro wat poulet
  // chicken_thigh 170g => cal 301, P 40.8, C 0, F 14.5
  // egg 50g => cal 78, P 6.5, C 0.6, F 5.5
  // onion 100g => cal 40, P 1.1, C 9.3, F 0.1
  // tomato_sauce 60g => cal 22, P 1, C 4.4, F 0.2
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // TOTAL => cal 571, P 52.1, C 42.3, F 20.6
  {
    id: 'dinner_089',
    name: 'Doro wat poulet',
    description: 'Le ragoût éthiopien épicé au poulet avec un œuf dur. Parfumé au berbéré, c\'est intense et bon.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 170, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf dur', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 100, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire caraméliser les oignons émincés 15 min sans matière grasse.',
      'Ajouter la sauce tomate et les épices berbéré, cuire 5 min.',
      'Ajouter le poulet, couvrir et mijoter 20 min.',
      'Cuire l\'œuf dur et le riz, servir le tout ensemble.',
    ],
    baseMacros: { calories: 571, protein: 52, carbs: 42, fat: 21 },
    tags: ['african', 'ethiopian', 'spicy', 'comfort'],
  },

  // ══════════════════════════════════════
  // ── LATIN AMERICAN (7) ──
  // ══════════════════════════════════════

  // dinner_090: Taco bowl boeuf
  // ground_beef_5 180g => cal 247, P 37.8, C 0, F 9.9
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // black_beans 60g => cal 79, P 5.4, C 14.4, F 0.3
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // TOTAL => cal 508, P 47.4, C 53.8, F 10.9
  {
    id: 'dinner_090',
    name: 'Taco bowl bœuf',
    description: 'Un taco bowl tex-mex avec du bœuf épicé, riz et haricots noirs. Tout dans un bol, zéro galère.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Faire revenir le bœuf avec les épices tex-mex.',
      'Réchauffer les haricots noirs.',
      'Assembler le bowl : riz, bœuf, haricots, tomate et poivron coupés.',
    ],
    baseMacros: { calories: 508, protein: 47, carbs: 54, fat: 11 },
    tags: ['latin', 'mexican', 'bowl', 'high_protein'],
  },

  // dinner_091: Quesadilla poulet
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // wrap_tortilla 60g => cal 177, P 4.8, C 30, F 4.2
  // mozzarella 30g => cal 84, P 8.4, C 0.9, F 5.1
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // TOTAL => cal 540, P 60.6, C 38.1, F 14.9
  {
    id: 'dinner_091',
    name: 'Quesadilla poulet',
    description: 'Des quesadillas croustillantes au poulet et fromage. Rapide à faire et ça fond en bouche.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'wrap_tortilla', name: 'Tortilla', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'mozzarella', name: 'Mozzarella', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Émincer le poulet et le griller avec le poivron et l\'oignon.',
      'Garnir la tortilla de poulet, légumes et mozzarella.',
      'Plier en deux et cuire à la poêle 3 min de chaque côté.',
      'Couper en triangles et servir.',
    ],
    baseMacros: { calories: 540, protein: 61, carbs: 38, fat: 15 },
    tags: ['latin', 'mexican', 'wrap', 'high_protein'],
  },

  // dinner_092: Moqueca poisson
  // white_fish 180g => cal 148, P 32.4, C 0, F 1.8
  // coconut_milk 80g => cal 154, P 1.2, C 2.4, F 16
  // bell_pepper 80g => cal 20, P 0.7, C 4.6, F 0.2
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // TOTAL => cal 466, P 37.7, C 38.1, F 18.5
  {
    id: 'dinner_092',
    name: 'Moqueca poisson',
    description: 'Le ragoût de poisson brésilien au lait de coco. Coloré, parfumé et léger, un voyage au Brésil.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_fish', name: 'Poisson blanc', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 100, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Faire revenir le poivron et la tomate en morceaux.',
      'Ajouter le lait de coco et le poisson en morceaux.',
      'Mijoter 15 min à feu doux, servir sur le riz.',
    ],
    baseMacros: { calories: 466, protein: 38, carbs: 38, fat: 19 },
    tags: ['latin', 'brazilian', 'fish', 'coconut'],
  },

  // dinner_093: Picanha grillée
  // beef_steak 180g => cal 271, P 46.8, C 0, F 9
  // sweet_potato 150g => cal 129, P 2.4, C 30, F 0.2
  // mixed_salad 60g => cal 10, P 0.8, C 1.8, F 0.2
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 454, P 50, C 31.8, F 14.4
  {
    id: 'dinner_093',
    name: 'Picanha grillée',
    description: 'Un beau steak grillé façon churrasco brésilien avec de la patate douce. La viande fondante, un régal.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Steak de bœuf', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade verte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire la patate douce en frites au four 20 min.',
      'Griller le steak à la poêle bien chaude 3 min par côté.',
      'Laisser reposer la viande 5 min.',
      'Servir avec les frites de patate douce et la salade.',
    ],
    baseMacros: { calories: 454, protein: 50, carbs: 32, fat: 14 },
    tags: ['latin', 'brazilian', 'grill', 'high_protein'],
  },

  // dinner_094: Pollo a la brasa
  // chicken_thigh 180g => cal 319, P 43.2, C 0, F 15.3
  // potato 150g => cal 116, P 3, C 25.5, F 0.2
  // corn 80g => cal 86, P 3.2, C 19, F 1.2
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 524, P 49.4, C 45.5, F 16.7
  {
    id: 'dinner_094',
    name: 'Pollo a la brasa',
    description: 'Le poulet rôti péruvien mariné au citron vert et épices. Avec des pommes de terre, c\'est un classique.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 35,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_thigh', name: 'Haut de cuisse de poulet', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mariner le poulet avec citron vert, paprika, cumin et ail.',
      'Rôtir le poulet au four 25 min à 200°C.',
      'Cuire les pommes de terre et le maïs.',
      'Servir le poulet avec les accompagnements.',
    ],
    baseMacros: { calories: 524, protein: 49, carbs: 46, fat: 17 },
    tags: ['latin', 'peruvian', 'roast'],
  },

  // dinner_095: Empanada bowl
  // ground_beef_5 160g => cal 219, P 33.6, C 0, F 8.8
  // potato 100g => cal 77, P 2, C 17, F 0.1
  // corn 60g => cal 65, P 2.4, C 14.3, F 0.9
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // bell_pepper 60g => cal 15, P 0.5, C 3.5, F 0.2
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 440, P 39.1, C 39.5, F 15.1
  {
    id: 'dinner_095',
    name: 'Empanada bowl',
    description: 'La garniture d\'empanada dans un bowl, sans la pâte. Tout le goût sans les calories en trop.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'ground_beef_5', name: 'Bœuf haché 5%', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'potato', name: 'Pomme de terre', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Faire revenir le bœuf avec l\'oignon et le poivron.',
      'Ajouter les pommes de terre en dés et cuire 10 min.',
      'Ajouter le maïs, assaisonner avec cumin et paprika.',
      'Servir dans un bowl bien chaud.',
    ],
    baseMacros: { calories: 440, protein: 39, carbs: 40, fat: 15 },
    tags: ['latin', 'argentinian', 'bowl', 'comfort'],
  },

  // dinner_096: Açaí bowl salé quinoa
  // quinoa 120g => cal 144, P 5.3, C 25.2, F 2.3
  // avocado 60g => cal 96, P 1.2, C 5.4, F 9
  // black_beans 60g => cal 79, P 5.4, C 14.4, F 0.3
  // cherry_tomato 60g => cal 11, P 0.5, C 2.3, F 0.2
  // corn 50g => cal 54, P 2, C 11.9, F 0.8
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 387, P 14.4, C 60.2, F 12.6
  {
    id: 'dinner_096',
    name: 'Bowl salé quinoa avocat',
    description: 'Un bowl protéiné latino avec quinoa, haricots noirs et avocat. Frais et nourrissant pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa dans de l\'eau salée 15 min.',
      'Réchauffer les haricots noirs.',
      'Couper l\'avocat et les tomates cerises.',
      'Assembler le bowl, arroser de jus de citron vert.',
    ],
    baseMacros: { calories: 387, protein: 14, carbs: 60, fat: 13 },
    tags: ['latin', 'bowl', 'vegan', 'fresh'],
  },

  // ══════════════════════════════════════
  // ── VEGAN (10) ──
  // ══════════════════════════════════════

  // dinner_097: Curry butternut lentilles
  // butternut_squash 150g => cal 68, P 1.5, C 16.5, F 0.2
  // red_lentils 80g => cal 93, P 7.2, C 16, F 0.3
  // coconut_milk 80g => cal 154, P 1.2, C 2.4, F 16
  // onion 50g => cal 20, P 0.6, C 4.7, F 0.1
  // curry_paste 10g => cal 11, P 0.3, C 1.7, F 0.3
  // TOTAL => cal 346, P 10.8, C 41.3, F 16.9
  {
    id: 'dinner_097',
    name: 'Curry butternut lentilles',
    description: 'Un curry doux au butternut et lentilles corail. Crémeux, réconfortant et 100% végétal.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'butternut_squash', name: 'Butternut', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'red_lentils', name: 'Lentilles corail', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Pâte de curry', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon, ajouter la pâte de curry.',
      'Ajouter le butternut en cubes et les lentilles.',
      'Verser le lait de coco et de l\'eau, mijoter 20 min.',
      'Servir quand les lentilles et le butternut sont fondants.',
    ],
    baseMacros: { calories: 346, protein: 11, carbs: 41, fat: 17 },
    tags: ['vegan', 'curry', 'comfort', 'gluten_free'],
  },

  // dinner_098: Ramen vegan miso
  // tofu_firm 150g => cal 216, P 25.5, C 4.5, F 12
  // udon_noodles 120g => cal 119, P 3.1, C 26.4, F 0.2
  // mushrooms 80g => cal 18, P 2.5, C 2.6, F 0.3
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // miso_paste 15g => cal 30, P 1.8, C 3.9, F 0.9
  // TOTAL => cal 397, P 34.6, C 39.6, F 13.6
  {
    id: 'dinner_098',
    name: 'Ramen vegan miso',
    description: 'Un ramen 100% vegan au miso avec du tofu grillé. Le bouillon est profond et les nouilles glissent.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'udon_noodles', name: 'Nouilles udon', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'mushrooms', name: 'Champignons', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'miso_paste', name: 'Pâte miso', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le tofu en tranches et le griller à la poêle.',
      'Préparer le bouillon miso avec de l\'eau chaude.',
      'Cuire les nouilles udon, égoutter.',
      'Assembler : nouilles, bouillon, tofu, champignons et épinards.',
    ],
    baseMacros: { calories: 397, protein: 35, carbs: 40, fat: 14 },
    tags: ['vegan', 'japanese', 'ramen', 'soup'],
  },

  // dinner_099: Tacos jackfruit (using textured_soy as proxy)
  // textured_soy 80g => cal 272, P 40, C 24, F 1.6
  // corn_tortilla 60g => cal 131, P 3.4, C 27.2, F 1.7
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // avocado 40g => cal 64, P 0.8, C 3.6, F 6
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // TOTAL => cal 494, P 45.1, C 60.8, F 9.4
  {
    id: 'dinner_099',
    name: 'Tacos protéines soja texturées',
    description: 'Des tacos vegan avec des protéines de soja assaisonnées façon carnitas. Tu ne vois pas la différence.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'textured_soy', name: 'Protéines de soja texturées', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn_tortilla', name: 'Tortilla de maïs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Réhydrater les protéines de soja dans de l\'eau chaude 10 min.',
      'Les faire revenir avec oignon, paprika fumé et cumin.',
      'Chauffer les tortillas à la poêle.',
      'Garnir de soja texturé, tomate coupée et avocat.',
    ],
    baseMacros: { calories: 494, protein: 45, carbs: 61, fat: 9 },
    tags: ['vegan', 'mexican', 'tacos', 'high_protein'],
  },

  // dinner_100: Bowl buddha avocat
  // quinoa 100g => cal 120, P 4.4, C 21, F 1.9
  // avocado 60g => cal 96, P 1.2, C 5.4, F 9
  // chickpeas 60g => cal 98, P 5.4, C 16.2, F 1.6
  // sweet_potato 100g => cal 86, P 1.6, C 20, F 0.1
  // spinach 50g => cal 12, P 1.5, C 1.8, F 0.2
  // tahini 10g => cal 60, P 1.7, C 2.1, F 5.4
  // TOTAL => cal 472, P 15.8, C 66.5, F 18.2
  {
    id: 'dinner_100',
    name: 'Bowl buddha avocat',
    description: 'Le buddha bowl complet avec quinoa, patate douce rôtie et avocat. Coloré et plein de bons nutriments.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tahini', name: 'Tahini', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa et rôtir la patate douce en cubes au four.',
      'Réchauffer les pois chiches à la poêle avec des épices.',
      'Disposer les épinards dans un bol.',
      'Assembler : quinoa, patate douce, pois chiches, avocat, sauce tahini.',
    ],
    baseMacros: { calories: 472, protein: 16, carbs: 67, fat: 18 },
    tags: ['vegan', 'bowl', 'buddha', 'colorful'],
  },

  // dinner_101: Pad thai tofu vegan
  // tofu_firm 150g => cal 216, P 25.5, C 4.5, F 12
  // rice_noodles 100g => cal 109, P 0.9, C 25, F 0.2
  // bean_sprouts 60g => cal 18, P 1.8, C 3, F 0.1
  // peanuts 15g => cal 84, P 3.8, C 2.4, F 7.3
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // lime_juice 10g => cal 3, P 0, C 1, F 0
  // TOTAL => cal 435, P 32.8, C 36.5, F 19.6
  {
    id: 'dinner_101',
    name: 'Pad thai tofu vegan',
    description: 'Le pad thai classique version vegan avec du tofu et des cacahuètes. Street food thaï à la maison.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_noodles', name: 'Nouilles de riz', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bean_sprouts', name: 'Pousses de soja', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanuts', name: 'Cacahuètes', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les nouilles de riz, égoutter.',
      'Faire sauter le tofu en dés à la poêle jusqu\'à doré.',
      'Ajouter les nouilles, la sauce soja et les pousses de soja.',
      'Servir avec les cacahuètes concassées et le jus de citron vert.',
    ],
    baseMacros: { calories: 435, protein: 33, carbs: 37, fat: 20 },
    tags: ['vegan', 'thai', 'pad_thai', 'wok'],
  },

  // dinner_102: Couscous légumes pois chiches vegan
  // couscous 120g => cal 134, P 4.6, C 27.6, F 0.2
  // chickpeas 80g => cal 131, P 7.2, C 21.6, F 2.1
  // zucchini 80g => cal 14, P 1, C 2.5, F 0.3
  // carrot 60g => cal 25, P 0.6, C 5.7, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 391, P 13.8, C 61.1, F 10.7
  {
    id: 'dinner_102',
    name: 'Couscous légumes pois chiches',
    description: 'Un couscous 100% végétal avec des légumes et pois chiches bien épicés. Le comfort food du Maghreb sans viande.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'couscous', name: 'Couscous', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'chickpeas', name: 'Pois chiches', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir oignon, carotte et courgette dans l\'huile d\'olive.',
      'Ajouter les pois chiches, du cumin, de la harissa légère et de l\'eau.',
      'Laisser mijoter 15 min.',
      'Préparer la semoule, servir avec les légumes par-dessus.',
    ],
    baseMacros: { calories: 391, protein: 14, carbs: 61, fat: 11 },
    tags: ['vegan', 'maghreb', 'couscous', 'comfort'],
  },

  // dinner_103: Soupe lentilles corail vegan
  // red_lentils 100g => cal 116, P 9, C 20, F 0.4
  // coconut_milk 60g => cal 115, P 0.9, C 1.8, F 12
  // tomato 80g => cal 14, P 0.7, C 3.1, F 0.2
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // ginger_fresh 5g => cal 4, P 0.1, C 0.9, F 0
  // TOTAL => cal 265, P 11.1, C 29.5, F 12.6
  {
    id: 'dinner_103',
    name: 'Soupe lentilles corail coco',
    description: 'Une soupe veloutée aux lentilles corail et lait de coco. Douce, épicée et réconfortante pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'red_lentils', name: 'Lentilles corail', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 60, unit: 'ml', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon et le gingembre râpé.',
      'Ajouter les lentilles, la tomate coupée et de l\'eau.',
      'Cuire 15 min, ajouter le lait de coco.',
      'Mixer le tout et servir bien chaud.',
    ],
    baseMacros: { calories: 265, protein: 11, carbs: 30, fat: 13 },
    tags: ['vegan', 'soupe', 'lentilles', 'comfort'],
  },

  // dinner_104: Wok tempeh légumes
  // tempeh 120g => cal 230, P 24, C 9.6, F 13.2
  // broccoli 80g => cal 27, P 2.2, C 5.6, F 0.3
  // bell_pepper 60g => cal 19, P 0.6, C 3.6, F 0.2
  // carrot 50g => cal 21, P 0.5, C 4.8, F 0.1
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 346, P 28.1, C 24.2, F 18.8
  {
    id: 'dinner_104',
    name: 'Wok tempeh légumes',
    description: 'Un wok de tempeh sauté avec des légumes croquants et sauce soja. Rapide, protéiné et 100% végétal.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tempeh', name: 'Tempeh', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le tempeh en tranches et le faire dorer à la poêle.',
      'Ajouter les légumes coupés, sauter 5 min à feu vif.',
      'Assaisonner avec sauce soja et huile de sésame.',
      'Servir bien chaud.',
    ],
    baseMacros: { calories: 346, protein: 28, carbs: 24, fat: 19 },
    tags: ['vegan', 'wok', 'tempeh', 'rapide'],
  },

  // dinner_105: Chili bean vegan
  // kidney_beans 80g => cal 127, P 8.7, C 22.8, F 0.5
  // black_beans 80g => cal 106, P 7.2, C 19.2, F 0.4
  // tomato_sauce 100g => cal 24, P 1.2, C 4.5, F 0.1
  // corn 60g => cal 65, P 2.4, C 14.3, F 0.9
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // bell_pepper 50g => cal 16, P 0.5, C 3, F 0.2
  // TOTAL => cal 354, P 20.4, C 67.5, F 2.1
  {
    id: 'dinner_105',
    name: 'Chili bean vegan',
    description: 'Un chili con carne sans la carne. Deux types de haricots, maïs, et une sauce tomate bien relevée.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'kidney_beans', name: 'Haricots rouges', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
      { ingredientId: 'corn', name: 'Maïs', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon et le poivron.',
      'Ajouter les haricots, le maïs et la sauce tomate.',
      'Assaisonner avec cumin, paprika et piment.',
      'Laisser mijoter 20 min à feu doux.',
    ],
    baseMacros: { calories: 354, protein: 20, carbs: 68, fat: 2 },
    tags: ['vegan', 'mexican', 'chili', 'high_fiber'],
  },

  // dinner_106: Risotto courge vegan
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // butternut_squash 120g => cal 54, P 1.2, C 13.2, F 0.1
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // nutritional_yeast 10g => cal 36, P 5, C 3.6, F 0.6
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // TOTAL => cal 333, P 9.8, C 54.1, F 9.1
  {
    id: 'dinner_106',
    name: 'Risotto courge vegan',
    description: 'Un risotto crémeux à la courge butternut avec de la levure nutritionnelle pour le côté fromagé. Douceur automnale.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'butternut_squash', name: 'Butternut', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'nutritional_yeast', name: 'Levure nutritionnelle', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon dans l\'huile, ajouter le riz.',
      'Ajouter le butternut en petits dés.',
      'Verser du bouillon louche par louche en remuant 20 min.',
      'En fin de cuisson, ajouter la levure nutritionnelle et mélanger.',
    ],
    baseMacros: { calories: 333, protein: 10, carbs: 54, fat: 9 },
    tags: ['vegan', 'risotto', 'courge', 'comfort'],
  },

  // ══════════════════════════════════════
  // ── VEGETARIAN (6) ──
  // ══════════════════════════════════════

  // dinner_107: Gratin aubergines mozzarella
  // eggplant 200g => cal 50, P 2, C 11.4, F 0.4
  // mozzarella 60g => cal 168, P 16.8, C 1.9, F 10.2
  // tomato_sauce 80g => cal 19, P 1, C 3.6, F 0.1
  // parmesan 15g => cal 59, P 5.9, C 0, F 3.9
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 340, P 25.7, C 16.9, F 19.6
  {
    id: 'dinner_107',
    name: 'Gratin aubergines mozzarella',
    description: 'Des aubergines gratinées à la mozzarella et parmesan. Le côté fondant-gratiné, c\'est irrésistible.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'eggplant', name: 'Aubergine', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'mozzarella', name: 'Mozzarella', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'parmesan', name: 'Parmesan', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper les aubergines en tranches, les badigeonner d\'huile et griller au four.',
      'Disposer en couches : aubergine, sauce tomate, mozzarella.',
      'Saupoudrer de parmesan.',
      'Gratiner au four 15 min à 200°C.',
    ],
    baseMacros: { calories: 340, protein: 26, carbs: 17, fat: 20 },
    tags: ['vegetarian', 'gratin', 'italien', 'comfort'],
  },

  // dinner_108: Frittata légumes
  // egg 180g (3 oeufs) => cal 279, P 23.4, C 2, F 19.8
  // zucchini 80g => cal 14, P 1, C 2.5, F 0.3
  // bell_pepper 60g => cal 19, P 0.6, C 3.6, F 0.2
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // feta_cheese 30g => cal 79, P 4.2, C 1.2, F 6.3
  // TOTAL => cal 407, P 29.6, C 13, F 26.6
  {
    id: 'dinner_108',
    name: 'Frittata légumes feta',
    description: 'Une frittata aux légumes du soleil et feta émiettée. L\'omelette italienne qui envoie.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Œufs', baseQuantityG: 180, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire revenir les légumes à la poêle 5 min.',
      'Battre les œufs, verser sur les légumes.',
      'Émietter la feta par-dessus.',
      'Cuire à couvert 10 min à feu doux, puis gratiner 2 min au four.',
    ],
    baseMacros: { calories: 407, protein: 30, carbs: 13, fat: 27 },
    tags: ['vegetarian', 'frittata', 'oeufs', 'rapide'],
  },

  // dinner_109: Risotto épinards chèvre
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // spinach 80g => cal 18, P 2.3, C 2.9, F 0.3
  // goat_cheese 30g => cal 109, P 6.6, C 0, F 9
  // onion 40g => cal 16, P 0.4, C 3.7, F 0
  // butter 5g => cal 36, P 0, C 0, F 4.1
  // TOTAL => cal 335, P 12.5, C 40.2, F 13.8
  {
    id: 'dinner_109',
    name: 'Risotto épinards chèvre',
    description: 'Un risotto crémeux aux épinards avec un chèvre frais qui fond dedans. Simple et gourmand.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian', 'gluten_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'goat_cheese', name: 'Fromage de chèvre', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon dans le beurre.',
      'Ajouter le riz, mouiller au bouillon louche par louche.',
      'En fin de cuisson, ajouter les épinards et le chèvre.',
      'Mélanger jusqu\'à ce que le chèvre fonde. Servir immédiatement.',
    ],
    baseMacros: { calories: 335, protein: 13, carbs: 40, fat: 14 },
    tags: ['vegetarian', 'risotto', 'chèvre', 'épinards'],
  },

  // dinner_110: Quiche courgettes feta
  // egg 120g (2 oeufs) => cal 186, P 15.6, C 1.3, F 13.2
  // zucchini 120g => cal 20, P 1.4, C 3.8, F 0.4
  // feta_cheese 40g => cal 106, P 5.6, C 1.6, F 8.4
  // cream_15 40g => cal 58, P 1.1, C 1.5, F 6
  // wrap_tortilla 40g => cal 125, P 3.4, C 20.8, F 3.2
  // TOTAL => cal 495, P 27.1, C 29, F 31.2
  {
    id: 'dinner_110',
    name: 'Quiche courgettes feta',
    description: 'Une quiche légère aux courgettes et feta. La base c\'est une tortilla pour alléger les calories.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 30,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'egg', name: 'Œufs', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_15', name: 'Crème 15%', baseQuantityG: 40, unit: 'ml', roundTo: 10 },
      { ingredientId: 'wrap_tortilla', name: 'Tortilla (fond de tarte)', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Placer la tortilla dans un moule à tarte comme fond.',
      'Disposer les courgettes en rondelles.',
      'Battre les œufs avec la crème, verser.',
      'Émietter la feta par-dessus. Cuire au four 25 min à 180°C.',
    ],
    baseMacros: { calories: 495, protein: 27, carbs: 29, fat: 31 },
    tags: ['vegetarian', 'quiche', 'courgettes', 'feta'],
  },

  // dinner_111: Soupe minestrone pesto
  // white_beans 80g => cal 95, P 5.8, C 16.8, F 0.6
  // pasta 50g => cal 66, P 2.5, C 12.5, F 0.6
  // zucchini 60g => cal 10, P 0.7, C 1.9, F 0.2
  // carrot 50g => cal 21, P 0.5, C 4.8, F 0.1
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // pesto 15g => cal 55, P 1.5, C 1.2, F 5.3
  // TOTAL => cal 258, P 11.5, C 39.5, F 6.9
  {
    id: 'dinner_111',
    name: 'Soupe minestrone pesto',
    description: 'La soupe italienne aux légumes, pâtes et haricots blancs avec un filet de pesto. Parfait pour un dîner léger.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 25,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'white_beans', name: 'Haricots blancs', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'pasta', name: 'Pâtes', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'zucchini', name: 'Courgette', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'pesto', name: 'Pesto', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir carotte et courgette en dés.',
      'Ajouter la tomate, les haricots et de l\'eau.',
      'Cuire 15 min, ajouter les pâtes et cuire encore 8 min.',
      'Servir avec un filet de pesto.',
    ],
    baseMacros: { calories: 258, protein: 12, carbs: 40, fat: 7 },
    tags: ['vegetarian', 'soupe', 'italien', 'léger'],
  },

  // dinner_112: Galette complète oeuf
  // buckwheat_noodles 80g (using as proxy for buckwheat flour) => cal 99, P 4, C 20, F 0.5
  // egg 60g (1 oeuf) => cal 93, P 7.8, C 0.7, F 6.6
  // emmental 30g => cal 114, P 8.4, C 0, F 9
  // ham_slice 30g => cal 33, P 5.4, C 0.6, F 1.1
  // TOTAL => cal 339, P 25.6, C 21.3, F 17.2
  {
    id: 'dinner_112',
    name: 'Galette complète',
    description: 'La galette bretonne complète : œuf, jambon, fromage. Un classique indémodable pour un dîner rapide.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: [],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'buckwheat_noodles', name: 'Galette de sarrasin', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Œuf', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'ham_slice', name: 'Tranche de jambon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Chauffer la galette à la poêle.',
      'Disposer le jambon et l\'emmental.',
      'Casser l\'œuf au centre.',
      'Replier les bords et cuire jusqu\'à ce que l\'œuf soit pris.',
    ],
    baseMacros: { calories: 339, protein: 26, carbs: 21, fat: 17 },
    tags: ['breton', 'galette', 'rapide', 'classique'],
  },

  // ══════════════════════════════════════
  // ── GLUTEN-FREE / LACTOSE-FREE (8) ──
  // ══════════════════════════════════════

  // dinner_113: Poulet grillé quinoa légumes
  // chicken_breast 160g => cal 264, P 49.6, C 0, F 5.8
  // quinoa 100g => cal 120, P 4.4, C 21, F 1.9
  // broccoli 80g => cal 27, P 2.2, C 5.6, F 0.3
  // carrot 50g => cal 21, P 0.5, C 4.8, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 476, P 56.7, C 31.4, F 13.1
  {
    id: 'dinner_113',
    name: 'Poulet grillé quinoa légumes',
    description: 'Du poulet grillé avec quinoa et légumes vapeur. Clean, sans gluten, sans lactose, 100% efficace.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa selon les instructions.',
      'Griller le poulet à la poêle 6 min par face.',
      'Cuire brocoli et carotte à la vapeur.',
      'Dresser dans une assiette avec un filet d\'huile d\'olive.',
    ],
    baseMacros: { calories: 476, protein: 57, carbs: 31, fat: 13 },
    tags: ['gluten_free', 'lactose_free', 'high_protein', 'clean'],
  },

  // dinner_114: Saumon teriyaki riz
  // salmon_fillet 150g => cal 312, P 30, C 0, F 19.5
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // green_beans 80g => cal 25, P 1.5, C 5.6, F 0.1
  // teriyaki_sauce 15g => cal 18, P 0.5, C 3.9, F 0
  // TOTAL => cal 511, P 35.2, C 43.1, F 20
  {
    id: 'dinner_114',
    name: 'Saumon teriyaki riz',
    description: 'Un pavé de saumon laqué teriyaki avec du riz basmati. Les oméga-3 avec le goût japonais.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'salmon_fillet', name: 'Pavé de saumon', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'green_beans', name: 'Haricots verts', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'teriyaki_sauce', name: 'Sauce teriyaki', baseQuantityG: 15, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz basmati.',
      'Laquer le saumon de sauce teriyaki, cuire à la poêle 4 min par face.',
      'Cuire les haricots verts à la vapeur.',
      'Servir le saumon sur le riz avec les haricots.',
    ],
    baseMacros: { calories: 511, protein: 35, carbs: 43, fat: 20 },
    tags: ['japanese', 'saumon', 'teriyaki', 'omega3'],
  },

  // dinner_115: Wok boeuf brocoli
  // beef_steak 150g => cal 226, P 39, C 0, F 7.5
  // broccoli 120g => cal 41, P 3.4, C 8.4, F 0.5
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // ginger_fresh 5g => cal 4, P 0.1, C 0.9, F 0
  // TOTAL => cal 450, P 46, C 37.9, F 13.3
  {
    id: 'dinner_115',
    name: 'Wok bœuf brocoli',
    description: 'Un classique du wok : bœuf sauté avec brocoli, sauce soja et gingembre. Rapide et ultra protéiné.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Steak de bœuf', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'broccoli', name: 'Brocoli', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le bœuf en lamelles fines.',
      'Faire sauter à feu vif dans l\'huile de sésame 2 min.',
      'Ajouter le brocoli et le gingembre, cuire 4 min.',
      'Assaisonner à la sauce soja, servir sur le riz.',
    ],
    baseMacros: { calories: 450, protein: 46, carbs: 38, fat: 13 },
    tags: ['wok', 'asian', 'high_protein', 'rapide'],
  },

  // dinner_116: Ceviche bar
  // white_fish 160g => cal 131, P 28.8, C 0, F 1.6
  // lime_juice 30g => cal 8, P 0.1, C 2.5, F 0
  // avocado 50g => cal 80, P 1, C 4.5, F 7.5
  // tomato 60g => cal 11, P 0.5, C 2.3, F 0.1
  // onion 30g => cal 12, P 0.3, C 2.8, F 0
  // cilantro 5g => cal 1, P 0.1, C 0.2, F 0
  // TOTAL => cal 243, P 30.8, C 12.3, F 9.2
  {
    id: 'dinner_116',
    name: 'Ceviche de bar',
    description: 'Du bar frais mariné au citron vert avec avocat et coriandre. Ultra frais et léger pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_fish', name: 'Filet de bar', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'lime_juice', name: 'Jus de citron vert', baseQuantityG: 30, unit: 'ml', roundTo: 5 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon rouge', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'cilantro', name: 'Coriandre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le poisson en petits dés.',
      'Mariner dans le jus de citron vert 15-20 min.',
      'Ajouter l\'avocat, la tomate et l\'oignon en dés.',
      'Parsemer de coriandre et servir frais.',
    ],
    baseMacros: { calories: 243, protein: 31, carbs: 12, fat: 9 },
    tags: ['ceviche', 'poisson', 'frais', 'léger'],
  },

  // dinner_117: Poulet tandoori riz
  // chicken_breast 160g => cal 264, P 49.6, C 0, F 5.8
  // basmati_rice 120g => cal 156, P 3.2, C 33.6, F 0.4
  // cucumber 60g => cal 9, P 0.4, C 2.2, F 0.1
  // soy_yogurt 40g => cal 22, P 1.6, C 1, F 1
  // curry_paste 10g => cal 11, P 0.3, C 1.7, F 0.3
  // TOTAL => cal 462, P 55.1, C 38.5, F 7.6
  {
    id: 'dinner_117',
    name: 'Poulet tandoori riz',
    description: 'Du poulet mariné façon tandoori avec du riz basmati et raïta au concombre. L\'Inde dans ton assiette.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_yogurt', name: 'Yaourt soja (raïta)', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'curry_paste', name: 'Pâte tandoori', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mariner le poulet dans la pâte tandoori 10 min.',
      'Griller le poulet au four ou à la poêle 15 min.',
      'Cuire le riz basmati.',
      'Mélanger le yaourt avec le concombre râpé pour la raïta. Servir.',
    ],
    baseMacros: { calories: 462, protein: 55, carbs: 39, fat: 8 },
    tags: ['indian', 'tandoori', 'high_protein', 'gluten_free'],
  },

  // dinner_118: Poisson vapeur gingembre
  // cod 160g => cal 131, P 28.8, C 0, F 1.6
  // basmati_rice 100g => cal 130, P 2.7, C 28, F 0.3
  // ginger_fresh 8g => cal 6, P 0.1, C 1.4, F 0.1
  // soy_sauce 10g => cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g => cal 44, P 0, C 0, F 5
  // spinach 60g => cal 14, P 1.7, C 2.2, F 0.2
  // TOTAL => cal 330, P 34.1, C 32.2, F 7.2
  {
    id: 'dinner_118',
    name: 'Poisson vapeur gingembre',
    description: 'Du cabillaud cuit vapeur avec gingembre et sauce soja. Ultra léger et plein de protéines pour le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cod', name: 'Cabillaud', baseQuantityG: 160, unit: 'g', roundTo: 10 },
      { ingredientId: 'basmati_rice', name: 'Riz basmati', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le cabillaud à la vapeur 10 min avec le gingembre émincé.',
      'Cuire le riz et les épinards.',
      'Arroser le poisson de sauce soja et huile de sésame.',
      'Servir sur le lit de riz et épinards.',
    ],
    baseMacros: { calories: 330, protein: 34, carbs: 32, fat: 7 },
    tags: ['poisson', 'vapeur', 'léger', 'asian'],
  },

  // dinner_119: Salade tiède poulet avocat
  // chicken_breast 150g => cal 248, P 46.5, C 0, F 5.4
  // avocado 60g => cal 96, P 1.2, C 5.4, F 9
  // mixed_salad 60g => cal 10, P 0.8, C 1.8, F 0.2
  // cherry_tomato 60g => cal 11, P 0.5, C 2.3, F 0.2
  // olive_oil 8g => cal 71, P 0, C 0, F 8
  // lemon_juice 10g => cal 3, P 0.1, C 1, F 0
  // TOTAL => cal 439, P 49.1, C 10.5, F 22.8
  {
    id: 'dinner_119',
    name: 'Salade tiède poulet avocat',
    description: 'Une salade avec du poulet grillé tiède et de l\'avocat. Fraîche, protéinée et parfaite le soir.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade mélangée', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Griller le poulet à la poêle et le trancher.',
      'Disposer la salade, les tomates cerises et l\'avocat.',
      'Ajouter le poulet encore tiède.',
      'Assaisonner avec huile d\'olive et jus de citron.',
    ],
    baseMacros: { calories: 439, protein: 49, carbs: 11, fat: 23 },
    tags: ['salade', 'poulet', 'léger', 'frais'],
  },

  // dinner_120: Steak boeuf patate douce
  // beef_steak 150g => cal 226, P 39, C 0, F 7.5
  // sweet_potato 150g => cal 129, P 2.4, C 30, F 0.2
  // asparagus 80g => cal 16, P 1.8, C 2.5, F 0.1
  // olive_oil 5g => cal 44, P 0, C 0, F 5
  // TOTAL => cal 415, P 43.2, C 32.5, F 12.8
  {
    id: 'dinner_120',
    name: 'Steak bœuf patate douce',
    description: 'Un bon steak de bœuf avec des frites de patate douce au four et des asperges. Simple, propre, efficace.',
    slot: 'dinner',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 25,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'beef_steak', name: 'Steak de bœuf', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'asparagus', name: 'Asperges', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper la patate douce en frites, enfourner 20 min à 200°C.',
      'Griller le steak à la poêle 3 min par face.',
      'Cuire les asperges à la vapeur ou à la poêle.',
      'Laisser reposer la viande 5 min et servir.',
    ],
    baseMacros: { calories: 415, protein: 43, carbs: 33, fat: 13 },
    tags: ['steak', 'patate_douce', 'high_protein', 'clean'],
  },
];
