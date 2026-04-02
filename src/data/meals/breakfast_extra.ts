import type { Meal } from '../../types/meal';

export const BREAKFASTS_EXTRA: Meal[] = [

  // ══════════════════════════════════════
  // ── FRENCH CLASSIC ECO (6) ──
  // ══════════════════════════════════════

  // breakfast_038: Tartine complète oeuf
  // bread_whole 60g: cal 148, P 7.8, C 24.6, F 2.0
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // butter 8g: cal 57, P 0.1, C 0, F 6.5
  // tomato 50g: cal 9, P 0.4, C 1.9, F 0.1
  // TOTAL: cal 369, P 21, C 28, F 20
  {
    id: 'breakfast_038',
    name: 'Tartine complète oeuf',
    description: 'Une bonne tartine de pain complet avec des oeufs brouillés et une tranche de tomate. Simple, efficace, ça cale bien pour la matinée.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 8, unit: 'g', roundTo: 2 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire griller les tranches de pain complet.',
      'Brouiller les oeufs dans une poêle avec le beurre à feu doux.',
      'Couper la tomate en rondelles et disposer sur la tartine avec les oeufs brouillés.',
    ],
    baseMacros: { calories: 369, protein: 21, carbs: 28, fat: 20 },
    tags: ['rapide', 'classique', 'oeufs'],
  },

  // breakfast_039: Pain perdu protéiné
  // bread_white 80g: cal 212, P 7.2, C 39.2, F 2.6
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // milk_semi 80ml: cal 37, P 2.6, C 3.8, F 1.2
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // TOTAL: cal 357, P 16, C 52, F 9
  {
    id: 'breakfast_039',
    name: 'Pain perdu protéiné',
    description: 'Le pain perdu de mamie mais version muscu. On trempe bien le pain dans le mélange oeuf-lait et hop, un filet de miel par-dessus.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_white', name: 'Pain blanc', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Battre l\'oeuf avec le lait dans une assiette creuse.',
      'Tremper les tranches de pain des deux côtés dans le mélange.',
      'Cuire dans une poêle antiadhésive à feu moyen 2-3 min par côté.',
      'Servir avec un filet de miel.',
    ],
    baseMacros: { calories: 357, protein: 16, carbs: 52, fat: 9 },
    tags: ['classique', 'sucré', 'comfort'],
  },

  // breakfast_040: Croissant + fromage blanc
  // wrap_tortilla 60g (substitut croissant): cal 200, P 5.4, C 32, F 5.4
  // fromage_blanc_0 150g: cal 74, P 12, C 5.3, F 0.2
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // TOTAL: cal 304, P 17, C 45, F 6
  {
    id: 'breakfast_040',
    name: 'Croissant + fromage blanc',
    description: 'Un croissant avec un bol de fromage blanc 0% et un trait de miel. Le combo gourmand-healthy du matin.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'wrap_tortilla', name: 'Croissant', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Servir le fromage blanc dans un bol.',
      'Ajouter le miel sur le fromage blanc.',
      'Accompagner du croissant à côté.',
    ],
    baseMacros: { calories: 304, protein: 17, carbs: 45, fat: 6 },
    tags: ['rapide', 'sucré', 'simple'],
  },

  // breakfast_041: Brioche + confiture + skyr
  // bread_white 60g (brioche): cal 159, P 5.4, C 29.4, F 1.9
  // honey 15g (confiture sub): cal 46, P 0, C 12.3, F 0
  // skyr 150g: cal 95, P 16.5, C 6, F 0.3
  // TOTAL: cal 300, P 22, C 48, F 2
  {
    id: 'breakfast_041',
    name: 'Brioche + confiture + skyr',
    description: 'Brioche grillée avec un peu de confiture et un gros bol de skyr. Le combo sucré-protéiné parfait pour attaquer la journée.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_white', name: 'Brioche', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Confiture', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'skyr', name: 'Skyr', baseQuantityG: 150, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire griller les tranches de brioche.',
      'Tartiner avec la confiture.',
      'Servir le skyr dans un bol à côté.',
    ],
    baseMacros: { calories: 300, protein: 22, carbs: 48, fat: 2 },
    tags: ['rapide', 'sucré', 'protéiné'],
  },

  // breakfast_042: Tartine beurre cacahuète banane
  // bread_whole 60g: cal 148, P 7.8, C 24.6, F 2.0
  // peanut_butter 20g: cal 118, P 5, C 4, F 10
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // TOTAL: cal 355, P 14, C 52, F 12
  {
    id: 'breakfast_042',
    name: 'Tartine beurre de cacahuète banane',
    description: 'Le classique PB banana toast. Pain complet, beurre de cacahuète et rondelles de banane. Un petit-déj de champion.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Faire griller le pain complet.',
      'Tartiner généreusement de beurre de cacahuète.',
      'Couper la banane en rondelles et disposer sur la tartine.',
    ],
    baseMacros: { calories: 355, protein: 14, carbs: 52, fat: 12 },
    tags: ['rapide', 'vegan', 'énergie'],
  },

  // breakfast_043: Galette sarrasin oeuf jambon
  // corn_flour 50g (sarrasin sub): cal 180, P 3.5, C 38, F 1.5
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // ham_slice 40g: cal 44, P 8, C 0.8, F 1.2
  // emmental 20g: cal 76, P 5.4, C 0, F 5.8
  // TOTAL: cal 378, P 23, C 39, F 14
  {
    id: 'breakfast_043',
    name: 'Galette sarrasin oeuf jambon',
    description: 'La vraie galette bretonne du matin : sarrasin, oeuf et jambon avec un peu de fromage râpé. Salé et rassasiant.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: [],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'corn_flour', name: 'Farine de sarrasin', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'ham_slice', name: 'Jambon', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental râpé', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélanger la farine de sarrasin avec un peu d\'eau pour faire la pâte à galette.',
      'Cuire la galette dans une poêle bien chaude.',
      'Casser l\'oeuf au centre, ajouter le jambon et le fromage râpé.',
      'Replier les bords et laisser cuire jusqu\'à ce que l\'oeuf soit pris.',
    ],
    baseMacros: { calories: 378, protein: 23, carbs: 39, fat: 14 },
    tags: ['salé', 'breton', 'complet'],
  },

  // ══════════════════════════════════════
  // ── FRENCH PREMIUM (4) ──
  // ══════════════════════════════════════

  // breakfast_044: Eggs benedict saumon fumé
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // smoked_salmon 50g: cal 59, P 9, C 0, F 2.2
  // bread_white 50g: cal 133, P 4.5, C 24.5, F 1.6
  // cream_cheese 20g: cal 68, P 1.2, C 0.8, F 6.8
  // TOTAL: cal 415, P 28, C 26, F 22
  {
    id: 'breakfast_044',
    name: 'Eggs benedict saumon fumé',
    description: 'L\'eggs benny du brunch chic : oeufs pochés, saumon fumé et cream cheese sur un muffin toasté. Tu vas te régaler.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['pork_free', 'halal'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'smoked_salmon', name: 'Saumon fumé', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_white', name: 'Muffin anglais', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_cheese', name: 'Cream cheese', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire pocher les oeufs dans de l\'eau frémissante avec un filet de vinaigre.',
      'Toaster le muffin anglais et tartiner de cream cheese.',
      'Déposer le saumon fumé sur le muffin puis l\'oeuf poché par-dessus.',
      'Assaisonner de poivre et servir immédiatement.',
    ],
    baseMacros: { calories: 415, protein: 28, carbs: 26, fat: 22 },
    tags: ['brunch', 'premium', 'saumon'],
  },

  // breakfast_045: Açaí bowl granola premium
  // mixed_berries 120g: cal 60, P 1, C 14.4, F 0.4
  // banana 80g: cal 71, P 0.9, C 18.4, F 0.2
  // granola 40g: cal 196, P 4, C 25.6, F 9.6
  // coconut_shredded 10g: cal 65, P 0.7, C 6.3, F 6.2 (approx)
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // TOTAL: cal 422, P 7, C 73, F 16
  {
    id: 'breakfast_045',
    name: 'Açaí bowl granola premium',
    description: 'Le bowl insta-worthy : purée de fruits rouges glacée, banane, granola crunchy et coco râpée. Frais et gourmand.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'mixed_berries', name: 'Fruits rouges surgelés', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer les fruits rouges surgelés avec la moitié de la banane pour obtenir une texture épaisse.',
      'Verser dans un bol et lisser la surface.',
      'Disposer le granola, les rondelles de banane restantes et la coco râpée par-dessus.',
      'Terminer avec un filet de miel.',
    ],
    baseMacros: { calories: 422, protein: 7, carbs: 73, fat: 16 },
    tags: ['bowl', 'fruits', 'premium', 'sucré'],
  },

  // breakfast_046: Tartine avocat saumon fumé ricotta
  // bread_whole 60g: cal 148, P 7.8, C 24.6, F 2.0
  // avocado 50g: cal 80, P 1, C 4.5, F 7.5
  // smoked_salmon 40g: cal 47, P 7.2, C 0, F 1.7
  // ricotta 30g: cal 52, P 3.4, C 1.2, F 3.9 (approx)
  // lemon_juice 5g: cal 1, P 0, C 0.3, F 0
  // TOTAL: cal 328, P 19, C 31, F 15
  {
    id: 'breakfast_046',
    name: 'Tartine avocat saumon fumé ricotta',
    description: 'La tartine premium : avo écrasé, saumon fumé et une cuillère de ricotta sur pain complet. Un filet de citron et c\'est parfait.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'smoked_salmon', name: 'Saumon fumé', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'ricotta', name: 'Ricotta', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Toaster le pain complet.',
      'Écraser l\'avocat à la fourchette avec le jus de citron.',
      'Tartiner l\'avocat sur le pain, ajouter le saumon fumé et la ricotta.',
    ],
    baseMacros: { calories: 328, protein: 19, carbs: 31, fat: 15 },
    tags: ['premium', 'saumon', 'avocat', 'tartine'],
  },

  // breakfast_047: Brunch bowl complet
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // avocado 50g: cal 80, P 1, C 4.5, F 7.5
  // smoked_salmon 30g: cal 35, P 5.4, C 0, F 1.3
  // spinach 40g: cal 9, P 1.2, C 1.5, F 0.2
  // bread_whole 40g: cal 99, P 5.2, C 16.4, F 1.4
  // TOTAL: cal 378, P 26, C 24, F 21
  {
    id: 'breakfast_047',
    name: 'Brunch bowl complet',
    description: 'Le bowl du brunch qui a tout : oeufs brouillés, avo, saumon fumé, pousses d\'épinards et pain grillé. Le repas de roi du dimanche matin.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 12,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'smoked_salmon', name: 'Saumon fumé', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards frais', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Brouiller les oeufs à feu doux dans une poêle.',
      'Couper l\'avocat en tranches et toaster le pain.',
      'Disposer tous les éléments dans un bol : oeufs, avocat, saumon, épinards frais.',
      'Accompagner du pain grillé coupé en mouillettes.',
    ],
    baseMacros: { calories: 378, protein: 26, carbs: 24, fat: 21 },
    tags: ['brunch', 'premium', 'bowl', 'complet'],
  },

  // ══════════════════════════════════════
  // ── ASIAN (6) ──
  // ══════════════════════════════════════

  // breakfast_048: Congee (rice porridge) poulet
  // white_rice 60g: cal 78, P 1.4, C 17.4, F 0.2 (cuit ~130kcal/100g sec, but 60g dry)
  // Actually: white_rice 60g dry: cal 218, P 4.3, C 48, F 0.4 (rice ~363/100g dry)
  // chicken_breast 60g: cal 99, P 18.6, C 0, F 2.2 (165/100g)
  // ginger_fresh 5g: cal 4, P 0.1, C 0.9, F 0
  // soy_sauce 5g: cal 3, P 0.5, C 0.4, F 0
  // TOTAL: cal 324, P 24, C 49, F 3
  {
    id: 'breakfast_048',
    name: 'Congee poulet',
    description: 'Le porridge de riz à l\'asiatique avec du poulet effiloché et du gingembre frais. Réconfortant et digeste, parfait pour les matins frais.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz dans beaucoup d\'eau (ratio 1:6) à feu doux pendant 15-20 min jusqu\'à consistance crémeuse.',
      'Pendant ce temps, cuire le poulet et l\'effilocher.',
      'Ajouter le poulet effiloché et le gingembre râpé dans le congee.',
      'Assaisonner avec la sauce soja et servir chaud.',
    ],
    baseMacros: { calories: 324, protein: 24, carbs: 49, fat: 3 },
    tags: ['asiatique', 'réconfortant', 'poulet'],
  },

  // breakfast_049: Onigiri thon
  // white_rice 80g dry: cal 290, P 5.7, C 64, F 0.5 (rice ~363/100g)
  // canned_tuna 40g: cal 44, P 10, C 0, F 0.4 (110cal/100g)
  // rice_vinegar 5g: cal 1, P 0, C 0.2, F 0
  // nori 3g: cal 9, P 1.5, C 1.3, F 0.1
  // TOTAL: cal 344, P 17, C 66, F 1
  {
    id: 'breakfast_049',
    name: 'Onigiri thon',
    description: 'Les boulettes de riz japonaises fourrées au thon. Pratique à emporter et super bon. Le petit-déj des samouraïs modernes.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'canned_tuna', name: 'Thon en conserve', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'rice_vinegar', name: 'Vinaigre de riz', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'nori', name: 'Feuille de nori', baseQuantityG: 3, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire le riz et l\'assaisonner avec le vinaigre de riz une fois tiède.',
      'Émietter le thon et le mélanger avec un peu de sauce soja.',
      'Former des triangles de riz en plaçant le thon au centre.',
      'Enrouler la base de chaque onigiri avec une bande de nori.',
    ],
    baseMacros: { calories: 344, protein: 17, carbs: 66, fat: 1 },
    tags: ['japonais', 'emporter', 'thon'],
  },

  // breakfast_050: Tamago sando (egg sandwich japanese)
  // bread_white 60g: cal 159, P 5.4, C 29.4, F 1.9
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // cream_cheese 15g: cal 51, P 0.9, C 0.6, F 5.1
  // TOTAL: cal 365, P 19, C 31, F 18
  {
    id: 'breakfast_050',
    name: 'Tamago sando',
    description: 'Le sandwich aux oeufs japonais : pain de mie moelleux, oeufs à la mayo (cream cheese ici) et c\'est tout. La simplicité à la japonaise.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_white', name: 'Pain de mie', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_cheese', name: 'Cream cheese', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire cuire les oeufs durs 10 min, les refroidir et les écaler.',
      'Écraser les oeufs à la fourchette et mélanger avec le cream cheese.',
      'Garnir les tranches de pain de mie et refermer en sandwich.',
      'Couper en diagonale et servir.',
    ],
    baseMacros: { calories: 365, protein: 19, carbs: 31, fat: 18 },
    tags: ['japonais', 'sandwich', 'oeufs'],
  },

  // breakfast_051: Miso soup + rice + egg
  // miso_paste 15g: cal 30, P 2, C 4, F 1 (approx 199cal/100g)
  // white_rice 60g dry: cal 218, P 4.3, C 48, F 0.4
  // egg 50g: cal 78, P 6.5, C 0.6, F 5.5
  // nori 2g: cal 6, P 1, C 0.9, F 0.1
  // TOTAL: cal 332, P 14, C 54, F 7
  {
    id: 'breakfast_051',
    name: 'Soupe miso riz et oeuf',
    description: 'Le petit-déj japonais traditionnel : soupe miso, bol de riz et un oeuf mollet. Umami dès le matin, ça change tout.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'miso_paste', name: 'Pâte miso', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'nori', name: 'Nori', baseQuantityG: 2, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Cuire le riz pendant que l\'eau chauffe pour la soupe.',
      'Diluer la pâte miso dans l\'eau chaude (pas bouillante) et ajouter le nori émietté.',
      'Faire cuire l\'oeuf mollet (6 min dans l\'eau bouillante).',
      'Servir le riz avec la soupe miso et l\'oeuf coupé en deux.',
    ],
    baseMacros: { calories: 332, protein: 14, carbs: 54, fat: 7 },
    tags: ['japonais', 'miso', 'traditionnel'],
  },

  // breakfast_052: Dim sum style (scrambled egg + rice + soy)
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // white_rice 60g dry: cal 218, P 4.3, C 48, F 0.4
  // soy_sauce 8g: cal 5, P 0.8, C 0.6, F 0
  // sesame_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 422, P 18, C 50, F 16
  {
    id: 'breakfast_052',
    name: 'Riz sauté aux oeufs',
    description: 'Le riz sauté aux oeufs express du matin façon cantine cantonaise. Huile de sésame et sauce soja, c\'est simple mais tellement bon.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'white_rice', name: 'Riz blanc (reste de la veille)', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Chauffer l\'huile de sésame dans un wok ou une poêle.',
      'Faire sauter le riz froid à feu vif pendant 2 min.',
      'Pousser le riz sur le côté, brouiller les oeufs et mélanger le tout.',
      'Assaisonner avec la sauce soja et servir.',
    ],
    baseMacros: { calories: 422, protein: 18, carbs: 50, fat: 16 },
    tags: ['asiatique', 'riz', 'oeufs', 'rapide'],
  },

  // breakfast_053: Natto rice bowl
  // white_rice 70g dry: cal 254, P 5, C 56, F 0.5
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // soy_sauce 5g: cal 3, P 0.5, C 0.4, F 0
  // edamame 40g: cal 48, P 4.6, C 3.4, F 2.2 (121cal/100g)
  // TOTAL: cal 383, P 17, C 60, F 8
  {
    id: 'breakfast_053',
    name: 'Natto rice bowl',
    description: 'Bol de riz avec des edamame, un oeuf cru battu et sauce soja. L\'énergie japonaise du matin en version accessible.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 70, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire le riz et les edamame.',
      'Placer le riz dans un bol et disposer les edamame par-dessus.',
      'Casser l\'oeuf cru sur le riz chaud et mélanger.',
      'Assaisonner avec la sauce soja.',
    ],
    baseMacros: { calories: 383, protein: 17, carbs: 60, fat: 8 },
    tags: ['japonais', 'bowl', 'riz'],
  },

  // ══════════════════════════════════════
  // ── MIDDLE EAST / MAGHREB (6) ──
  // ══════════════════════════════════════

  // breakfast_054: Shakshuka
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // tomato_sauce 100g: cal 29, P 1.3, C 5.5, F 0.3 (approx)
  // bell_pepper 50g: cal 13, P 0.5, C 3, F 0.1
  // onion 30g: cal 12, P 0.3, C 2.8, F 0
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 253, P 15, C 12, F 16
  {
    id: 'breakfast_054',
    name: 'Shakshuka',
    description: 'Des oeufs pochés dans une sauce tomate épicée aux poivrons. Le classique du Maghreb qui réchauffe le coeur et l\'estomac.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir l\'oignon et le poivron coupés en dés dans l\'huile d\'olive.',
      'Ajouter la sauce tomate et laisser mijoter 5 min.',
      'Creuser 2 puits dans la sauce et y casser les oeufs.',
      'Couvrir et cuire 5-6 min jusqu\'à ce que les blancs soient pris.',
    ],
    baseMacros: { calories: 253, protein: 15, carbs: 12, fat: 16 },
    tags: ['maghreb', 'oeufs', 'épicé', 'tomate'],
  },

  // breakfast_055: Ful medames (fèves)
  // white_beans 80g (fèves sub): cal 88, P 5.6, C 15.7, F 0.4 (110cal/100g)
  // olive_oil 8g: cal 71, P 0, C 0, F 8
  // lemon_juice 10g: cal 2, P 0, C 0.7, F 0
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // flatbread 40g: cal 110, P 3.6, C 22, F 0.5
  // TOTAL: cal 349, P 16, C 39, F 14
  {
    id: 'breakfast_055',
    name: 'Ful medames',
    description: 'Le petit-déj égyptien : purée de fèves à l\'huile d\'olive et citron, avec un oeuf dur et du pain. Un classique qui tient au corps.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'white_beans', name: 'Fèves (haricots blancs)', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'egg', name: 'Oeuf dur', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Réchauffer les fèves et les écraser grossièrement à la fourchette.',
      'Assaisonner avec l\'huile d\'olive, le jus de citron, sel et cumin.',
      'Faire cuire l\'oeuf dur et le couper en quartiers.',
      'Servir le ful avec l\'oeuf et le pain plat.',
    ],
    baseMacros: { calories: 349, protein: 16, carbs: 39, fat: 14 },
    tags: ['égyptien', 'fèves', 'protéiné'],
  },

  // breakfast_056: Labneh za'atar toast
  // labneh 60g: cal 153, P 3, C 3, F 15
  // flatbread 50g: cal 138, P 4.5, C 27.5, F 0.6
  // za_atar 5g: cal 14, P 0.4, C 2.4, F 0.4
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // cherry_tomato 40g: cal 7, P 0.3, C 1.6, F 0.1
  // TOTAL: cal 356, P 8, C 35, F 21
  {
    id: 'breakfast_056',
    name: 'Labneh za\'atar toast',
    description: 'Du labneh crémeux sur du pain plat grillé avec du za\'atar et un filet d\'huile d\'olive. Le petit-déj libanais par excellence.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'labneh', name: 'Labneh', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'za_atar', name: 'Za\'atar', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Griller le pain plat au four ou à la poêle.',
      'Tartiner généreusement de labneh.',
      'Saupoudrer de za\'atar et arroser d\'huile d\'olive.',
      'Accompagner de tomates cerises coupées en deux.',
    ],
    baseMacros: { calories: 356, protein: 8, carbs: 35, fat: 21 },
    tags: ['libanais', 'za_atar', 'simple'],
  },

  // breakfast_057: Manakish
  // flatbread 70g: cal 193, P 6.3, C 38.5, F 0.8
  // za_atar 8g: cal 22, P 0.6, C 3.8, F 0.6
  // olive_oil 8g: cal 71, P 0, C 0, F 8
  // feta_cheese 25g: cal 66, P 3.5, C 1, F 5.3
  // TOTAL: cal 352, P 10, C 43, F 15
  {
    id: 'breakfast_057',
    name: 'Manakish',
    description: 'La pizza libanaise du matin au za\'atar et huile d\'olive avec un peu de feta émiettée. C\'est bon, c\'est simple, c\'est le Levant.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'flatbread', name: 'Pain plat', baseQuantityG: 70, unit: 'g', roundTo: 10 },
      { ingredientId: 'za_atar', name: 'Za\'atar', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 25, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélanger le za\'atar avec l\'huile d\'olive pour faire une pâte.',
      'Étaler le mélange sur le pain plat.',
      'Passer au four 5-7 min à 200°C.',
      'Servir avec la feta émiettée par-dessus.',
    ],
    baseMacros: { calories: 352, protein: 10, carbs: 43, fat: 15 },
    tags: ['libanais', 'za_atar', 'pain'],
  },

  // breakfast_058: Msemen + miel + fromage blanc
  // flatbread 60g (msemen sub): cal 165, P 5.4, C 33, F 0.7
  // honey 15g: cal 46, P 0, C 12.3, F 0
  // fromage_blanc_0 120g: cal 59, P 9.6, C 4.2, F 0.1
  // butter 5g: cal 36, P 0, C 0, F 4.1
  // TOTAL: cal 306, P 15, C 50, F 5
  {
    id: 'breakfast_058',
    name: 'Msemen miel et fromage blanc',
    description: 'Le msemen feuilleté marocain avec du miel et du fromage blanc. Le goûter-déj du bled qui fait voyager dès le matin.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'flatbread', name: 'Msemen (pain feuilleté)', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'butter', name: 'Beurre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Réchauffer le msemen à la poêle avec une noisette de beurre.',
      'Servir le fromage blanc dans un bol.',
      'Arroser le msemen et le fromage blanc de miel.',
    ],
    baseMacros: { calories: 306, protein: 15, carbs: 50, fat: 5 },
    tags: ['marocain', 'miel', 'sucré'],
  },

  // breakfast_059: Fatayer épinards
  // flatbread 70g: cal 193, P 6.3, C 38.5, F 0.8
  // spinach 80g: cal 18, P 2.3, C 2.9, F 0.3
  // feta_cheese 25g: cal 66, P 3.5, C 1, F 5.3
  // onion 20g: cal 8, P 0.2, C 1.9, F 0
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 329, P 12, C 44, F 11
  {
    id: 'breakfast_059',
    name: 'Fatayer épinards',
    description: 'Les chaussons aux épinards et feta du Moyen-Orient. Un petit-déj salé et végétarien qui change de l\'ordinaire.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 18,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'flatbread', name: 'Pâte à pain plat', baseQuantityG: 70, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Faire revenir les épinards et l\'oignon émincé dans l\'huile d\'olive.',
      'Émietter la feta et mélanger avec les épinards refroidis.',
      'Former des chaussons avec la pâte et farcir du mélange épinards-feta.',
      'Cuire au four 10-12 min à 200°C jusqu\'à dorure.',
    ],
    baseMacros: { calories: 329, protein: 12, carbs: 44, fat: 11 },
    tags: ['levant', 'épinards', 'végétarien'],
  },

  // ══════════════════════════════════════
  // ── AFRICAN (4) ──
  // ══════════════════════════════════════

  // breakfast_060: Bouillie de mil
  // millet 60g: cal 228, P 6.6, C 43.4, F 2.5 (380cal/100g)
  // milk_semi 150ml: cal 69, P 4.8, C 7.2, F 2.3
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // peanut_paste 10g: cal 59, P 2.5, C 2, F 5
  // TOTAL: cal 386, P 14, C 61, F 10
  {
    id: 'breakfast_060',
    name: 'Bouillie de mil',
    description: 'La bouillie de mil onctueuse comme en Afrique de l\'Ouest. Avec un peu de pâte d\'arachide et du miel, c\'est le réconfort total.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'millet', name: 'Mil', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_paste', name: 'Pâte d\'arachide', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Porter le lait à ébullition et ajouter le mil en pluie en remuant.',
      'Cuire à feu doux 10-12 min en remuant régulièrement.',
      'Incorporer la pâte d\'arachide et mélanger.',
      'Servir tiède avec un filet de miel.',
    ],
    baseMacros: { calories: 386, protein: 14, carbs: 61, fat: 10 },
    tags: ['africain', 'bouillie', 'réconfortant'],
  },

  // breakfast_061: Akara (bean fritters) + oeuf
  // black_beans 70g: cal 91, P 6, C 16.1, F 0.3 (130cal/100g)
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // onion 20g: cal 8, P 0.2, C 1.9, F 0
  // olive_oil 8g: cal 71, P 0, C 0, F 8
  // TOTAL: cal 248, P 13, C 19, F 14
  {
    id: 'breakfast_061',
    name: 'Akara et oeuf',
    description: 'Les beignets de haricots noirs nigérians avec un oeuf au plat. Croustillant dehors, moelleux dedans, protéiné partout.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 18,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 70, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile pour friture', baseQuantityG: 8, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer les haricots noirs avec l\'oignon pour obtenir une pâte épaisse.',
      'Former des petites boulettes et les frire dans l\'huile chaude.',
      'Faire cuire l\'oeuf au plat dans la même poêle.',
      'Servir les akara avec l\'oeuf et assaisonner.',
    ],
    baseMacros: { calories: 248, protein: 13, carbs: 19, fat: 14 },
    tags: ['nigérian', 'beignets', 'protéiné'],
  },

  // breakfast_062: Plantain frit + oeuf
  // plantain 120g: cal 146, P 1.6, C 38.4, F 0.5
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 345, P 15, C 40, F 17
  {
    id: 'breakfast_062',
    name: 'Plantain frit et oeuf',
    description: 'Tranches de plantain mûr dorées à la poêle avec des oeufs brouillés. Le combo africain du matin, sucré-salé au top.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'plantain', name: 'Plantain mûr', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper le plantain en rondelles épaisses.',
      'Faire dorer les rondelles de plantain dans l\'huile à feu moyen.',
      'Brouiller les oeufs dans la même poêle.',
      'Servir ensemble dans une assiette.',
    ],
    baseMacros: { calories: 345, protein: 15, carbs: 40, fat: 17 },
    tags: ['africain', 'plantain', 'oeufs'],
  },

  // breakfast_063: Beignets + yaourt protéiné
  // corn_flour 50g: cal 180, P 3.5, C 38, F 1.5
  // greek_yogurt_0 150g: cal 89, P 15, C 5.4, F 0.6
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 343, P 19, C 52, F 7
  {
    id: 'breakfast_063',
    name: 'Beignets et yaourt protéiné',
    description: 'Des petits beignets maison dorés avec un bol de yaourt grec 0% au miel. Le combo street food + healthy qui marche.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'corn_flour', name: 'Farine', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile pour friture', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélanger la farine avec un peu d\'eau et une pincée de sel pour former une pâte.',
      'Former des petites boules et les frire dans l\'huile chaude.',
      'Préparer le yaourt grec avec le miel dans un bol.',
      'Servir les beignets chauds avec le yaourt au miel.',
    ],
    baseMacros: { calories: 343, protein: 19, carbs: 52, fat: 7 },
    tags: ['beignets', 'yaourt', 'sucré'],
  },

  // ══════════════════════════════════════
  // ── LATIN AMERICAN (4) ──
  // ══════════════════════════════════════

  // breakfast_064: Huevos rancheros
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // corn_tortilla 50g: cal 105, P 2.8, C 22, F 1.3 (210cal/100g)
  // tomato_sauce 80g: cal 23, P 1, C 4.4, F 0.2
  // black_beans 50g: cal 65, P 4.3, C 11.5, F 0.2
  // TOTAL: cal 348, P 21, C 39, F 13
  {
    id: 'breakfast_064',
    name: 'Huevos rancheros',
    description: 'Le classique mexicain du matin : oeufs au plat sur tortilla avec sauce tomate et haricots noirs. Olé pour les protéines !',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'corn_tortilla', name: 'Tortilla de maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'black_beans', name: 'Haricots noirs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Chauffer la sauce tomate dans une poêle et réchauffer les haricots noirs.',
      'Faire frire les oeufs au plat dans une autre poêle.',
      'Chauffer les tortillas de maïs à sec.',
      'Assembler : tortilla, sauce, haricots et oeufs par-dessus.',
    ],
    baseMacros: { calories: 348, protein: 21, carbs: 39, fat: 13 },
    tags: ['mexicain', 'oeufs', 'haricots'],
  },

  // breakfast_065: Arepa + oeuf + avocat
  // corn_flour 50g: cal 180, P 3.5, C 38, F 1.5
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // avocado 50g: cal 80, P 1, C 4.5, F 7.5
  // TOTAL: cal 338, P 11, C 43, F 15
  {
    id: 'breakfast_065',
    name: 'Arepa oeuf avocat',
    description: 'L\'arepa vénézuélienne farcie oeuf brouillé et avocat. Croustillante dehors, fondante dedans. Le petit-déj latino par excellence.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'corn_flour', name: 'Farine de maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélanger la farine de maïs avec de l\'eau et une pincée de sel, former des galettes.',
      'Cuire les arepas à la poêle 4-5 min de chaque côté.',
      'Brouiller l\'oeuf et écraser l\'avocat.',
      'Ouvrir les arepas et farcir avec l\'oeuf et l\'avocat.',
    ],
    baseMacros: { calories: 338, protein: 11, carbs: 43, fat: 15 },
    tags: ['vénézuélien', 'arepa', 'sans_gluten'],
  },

  // breakfast_066: Tapioca crêpe brésilienne
  // cassava 60g (tapioca sub): cal 96, P 0.8, C 22.8, F 0.2 (160cal/100g)
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // coconut_shredded 10g: cal 65, P 0.7, C 6.3, F 6.2
  // banana 80g: cal 71, P 0.9, C 18.4, F 0.2
  // TOTAL: cal 310, P 9, C 48, F 12
  {
    id: 'breakfast_066',
    name: 'Tapioca crêpe brésilienne',
    description: 'La crêpe de tapioca brésilienne avec coco, banane et oeuf. Sans gluten et exotique, le Brésil dans ton assiette.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cassava', name: 'Tapioca (fécule de manioc)', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Saupoudrer la fécule de manioc dans une poêle chaude pour former une crêpe.',
      'Laisser cuire jusqu\'à ce qu\'elle se solidifie et retourner.',
      'Ajouter la coco râpée et l\'oeuf brouillé sur la crêpe.',
      'Garnir de rondelles de banane et replier.',
    ],
    baseMacros: { calories: 310, protein: 9, carbs: 48, fat: 12 },
    tags: ['brésilien', 'tapioca', 'sans_gluten'],
  },

  // breakfast_067: Chilaquiles poulet
  // corn_tortilla 50g: cal 105, P 2.8, C 22, F 1.3
  // chicken_breast 60g: cal 99, P 18.6, C 0, F 2.2
  // tomato_sauce 80g: cal 23, P 1, C 4.4, F 0.2
  // cream_cheese 15g: cal 51, P 0.9, C 0.6, F 5.1
  // TOTAL: cal 278, P 23, C 27, F 9
  {
    id: 'breakfast_067',
    name: 'Chilaquiles poulet',
    description: 'Des chips de tortilla nappées de sauce tomate avec du poulet effiloché et un peu de crème. Le petit-déj mexicain qui envoie du lourd.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'corn_tortilla', name: 'Tortillas de maïs', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato_sauce', name: 'Sauce tomate', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_cheese', name: 'Crème', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper les tortillas en triangles et les griller au four 5 min.',
      'Réchauffer le poulet effiloché dans la sauce tomate.',
      'Verser la sauce et le poulet sur les chips de tortilla.',
      'Terminer avec une cuillère de crème et servir.',
    ],
    baseMacros: { calories: 278, protein: 23, carbs: 27, fat: 9 },
    tags: ['mexicain', 'poulet', 'tortilla'],
  },

  // ══════════════════════════════════════
  // ── VEGAN (8) ──
  // ══════════════════════════════════════

  // breakfast_068: Smoothie bowl açaí vegan
  // mixed_berries 120g: cal 60, P 1, C 14.4, F 0.4
  // banana 80g: cal 71, P 0.9, C 18.4, F 0.2
  // granola 30g: cal 147, P 3, C 19.2, F 7.2
  // chia_seeds 10g: cal 49, P 1.7, C 4.2, F 3.1
  // oat_milk 50ml: cal 22, P 0.5, C 3.5, F 0.8
  // TOTAL: cal 349, P 7, C 60, F 12
  {
    id: 'breakfast_068',
    name: 'Smoothie bowl açaí vegan',
    description: 'Un smoothie bowl bien épais aux fruits rouges et banane, topé de granola et graines de chia. 100% végétal, 100% délicieux.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'mixed_berries', name: 'Fruits rouges surgelés', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 50, unit: 'ml', roundTo: 10 },
    ],
    recipeSteps: [
      'Mixer les fruits rouges surgelés avec la banane et le lait d\'avoine.',
      'Verser dans un bol en gardant une texture épaisse.',
      'Garnir de granola et graines de chia.',
    ],
    baseMacros: { calories: 349, protein: 7, carbs: 60, fat: 12 },
    tags: ['vegan', 'smoothie', 'bowl', 'fruits'],
  },

  // breakfast_069: Porridge vegan coco-mangue
  // oats 50g: cal 195, P 8.5, C 33, F 3.5
  // coconut_milk 80ml: cal 150, P 1.2, C 2.4, F 15.2 (187cal/100g)
  // mango 80g: cal 48, P 0.6, C 12, F 0.3
  // coconut_shredded 5g: cal 33, P 0.3, C 3.2, F 3.1
  // TOTAL: cal 426, P 11, C 51, F 22
  {
    id: 'breakfast_069',
    name: 'Porridge vegan coco-mangue',
    description: 'Un porridge onctueux au lait de coco avec des morceaux de mangue fraîche. Ambiance tropicale dès le réveil, sans lait animal.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire les flocons d\'avoine dans le lait de coco et un peu d\'eau pendant 5 min.',
      'Couper la mangue en dés.',
      'Verser le porridge dans un bol et garnir de mangue et coco râpée.',
    ],
    baseMacros: { calories: 426, protein: 11, carbs: 51, fat: 22 },
    tags: ['vegan', 'porridge', 'tropical'],
  },

  // breakfast_070: Tartine houmous avocat
  // bread_whole 60g: cal 148, P 7.8, C 24.6, F 2.0
  // hummus 40g: cal 66, P 3.1, C 5.6, F 3.9 (166cal/100g)
  // avocado 50g: cal 80, P 1, C 4.5, F 7.5
  // cherry_tomato 40g: cal 7, P 0.3, C 1.6, F 0.1
  // TOTAL: cal 301, P 12, C 36, F 14
  {
    id: 'breakfast_070',
    name: 'Tartine houmous avocat',
    description: 'Pain complet avec houmous, avocat écrasé et tomates cerises. Le toast vegan qui a tout compris côté saveurs.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Toaster le pain complet.',
      'Tartiner de houmous et ajouter l\'avocat écrasé.',
      'Couper les tomates cerises en deux et disposer sur la tartine.',
    ],
    baseMacros: { calories: 301, protein: 12, carbs: 36, fat: 14 },
    tags: ['vegan', 'tartine', 'avocat', 'rapide'],
  },

  // breakfast_071: Pancakes vegan banane
  // oats 50g: cal 195, P 8.5, C 33, F 3.5
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // oat_milk 50ml: cal 22, P 0.5, C 3.5, F 0.8
  // maple_syrup 10g: cal 26, P 0, C 6.7, F 0
  // TOTAL: cal 332, P 10, C 66, F 5
  {
    id: 'breakfast_071',
    name: 'Pancakes vegan banane',
    description: 'Des pancakes moelleux sans oeuf ni lait, juste avoine et banane écrasée. Avec un filet de sirop d\'érable, c\'est le bonheur.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 50, unit: 'ml', roundTo: 10 },
      { ingredientId: 'maple_syrup', name: 'Sirop d\'érable', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer les flocons d\'avoine en farine, écraser la banane et mélanger avec le lait d\'avoine.',
      'Verser des petites louches de pâte dans une poêle antiadhésive.',
      'Cuire 2 min de chaque côté jusqu\'à dorure.',
      'Servir avec le sirop d\'érable.',
    ],
    baseMacros: { calories: 332, protein: 10, carbs: 66, fat: 5 },
    tags: ['vegan', 'pancakes', 'banane'],
  },

  // breakfast_072: Granola bowl lait d'avoine
  // granola 50g: cal 245, P 5, C 32, F 12
  // oat_milk 150ml: cal 65, P 1.5, C 10.5, F 2.3
  // banana 60g: cal 53, P 0.7, C 13.8, F 0.2
  // blueberries 40g: cal 23, P 0.3, C 5.6, F 0.1
  // TOTAL: cal 386, P 8, C 62, F 15
  {
    id: 'breakfast_072',
    name: 'Granola bowl lait d\'avoine',
    description: 'Un bol de granola crunchy avec du lait d\'avoine, de la banane et des myrtilles. Le classique vegan rapide et efficace.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 150, unit: 'ml', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'blueberries', name: 'Myrtilles', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verser le granola dans un bol.',
      'Ajouter le lait d\'avoine.',
      'Garnir de rondelles de banane et de myrtilles.',
    ],
    baseMacros: { calories: 386, protein: 8, carbs: 62, fat: 15 },
    tags: ['vegan', 'granola', 'rapide'],
  },

  // breakfast_073: Chia pudding fruits tropicaux
  // chia_seeds 25g: cal 122, P 4.3, C 10.5, F 7.8
  // coconut_milk 100ml: cal 187, P 1.5, C 3, F 19
  // mango 60g: cal 36, P 0.5, C 9, F 0.2
  // pineapple 40g: cal 20, P 0.2, C 5.2, F 0
  // TOTAL: cal 365, P 7, C 28, F 27
  {
    id: 'breakfast_073',
    name: 'Chia pudding fruits tropicaux',
    description: 'Pudding de chia au lait de coco avec mangue et ananas. Tu prépares ça la veille et le matin c\'est prêt. Malin et tropical.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'pineapple', name: 'Ananas', baseQuantityG: 40, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélanger les graines de chia avec le lait de coco la veille au soir.',
      'Laisser gonfler au frigo toute la nuit.',
      'Le matin, ajouter les morceaux de mangue et d\'ananas par-dessus.',
    ],
    baseMacros: { calories: 365, protein: 7, carbs: 28, fat: 27 },
    tags: ['vegan', 'chia', 'meal_prep', 'tropical'],
  },

  // breakfast_074: Tofu scramble
  // tofu_firm 120g: cal 91, P 10.6, C 1.8, F 5.3 (76cal/100g)
  // bell_pepper 50g: cal 13, P 0.5, C 3, F 0.1
  // spinach 40g: cal 9, P 1.2, C 1.5, F 0.2
  // onion 30g: cal 12, P 0.3, C 2.8, F 0
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 169, P 13, C 9, F 11
  // -> adding bread_whole for more substance
  // bread_whole 50g: cal 124, P 6.5, C 20.5, F 1.7
  // ADJUSTED TOTAL: cal 293, P 19, C 30, F 13
  {
    id: 'breakfast_074',
    name: 'Tofu scramble',
    description: 'Le brouillé de tofu aux légumes, l\'alternative vegan aux oeufs brouillés. Avec du curcuma pour la couleur, ça passe crème.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'gluten_free', 'lactose_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tofu_firm', name: 'Tofu ferme', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Émietter le tofu à la fourchette.',
      'Faire revenir l\'oignon et le poivron coupés en dés dans l\'huile d\'olive.',
      'Ajouter le tofu émietté et les épinards, assaisonner avec curcuma, sel et poivre.',
      'Cuire 5 min en remuant et servir chaud.',
    ],
    baseMacros: { calories: 169, protein: 13, carbs: 9, fat: 11 },
    tags: ['vegan', 'tofu', 'protéiné', 'légumes'],
  },

  // breakfast_075: Crêpes sarrasin vegan
  // corn_flour 50g (sarrasin sub): cal 180, P 3.5, C 38, F 1.5
  // oat_milk 80ml: cal 34, P 0.8, C 5.6, F 1.2
  // banana 80g: cal 71, P 0.9, C 18.4, F 0.2
  // maple_syrup 10g: cal 26, P 0, C 6.7, F 0
  // TOTAL: cal 311, P 5, C 69, F 3
  {
    id: 'breakfast_075',
    name: 'Crêpes sarrasin vegan',
    description: 'Des crêpes de sarrasin sans oeuf ni lait avec de la banane et du sirop d\'érable. Simples, vegan et gourmandes.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 12,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'corn_flour', name: 'Farine de sarrasin', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 80, unit: 'ml', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'maple_syrup', name: 'Sirop d\'érable', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélanger la farine de sarrasin avec le lait d\'avoine et un peu d\'eau pour faire la pâte.',
      'Cuire les crêpes dans une poêle antiadhésive à feu moyen.',
      'Garnir de rondelles de banane et arroser de sirop d\'érable.',
    ],
    baseMacros: { calories: 311, protein: 5, carbs: 69, fat: 3 },
    tags: ['vegan', 'crêpes', 'sarrasin'],
  },

  // ══════════════════════════════════════
  // ── GLUTEN-FREE (5) ──
  // ══════════════════════════════════════

  // breakfast_076: Bowl quinoa fruits
  // quinoa 50g: cal 180, P 7, C 32.3, F 2.9 (360cal/100g)
  // banana 60g: cal 53, P 0.7, C 13.8, F 0.2
  // blueberries 50g: cal 29, P 0.4, C 7, F 0.2
  // honey 10g: cal 30, P 0, C 8.2, F 0
  // almonds 10g: cal 58, P 2.1, C 2.2, F 5 (579cal/100g)
  // TOTAL: cal 350, P 10, C 64, F 8
  {
    id: 'breakfast_076',
    name: 'Bowl quinoa fruits',
    description: 'Du quinoa cuit comme un porridge avec des fruits frais, des amandes et du miel. Sans gluten et super nutritif.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'vegetarian', 'lactose_free'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'quinoa', name: 'Quinoa', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'blueberries', name: 'Myrtilles', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le quinoa dans de l\'eau pendant 12-15 min.',
      'Égoutter et laisser tiédir.',
      'Disposer dans un bol avec les rondelles de banane, les myrtilles et les amandes.',
      'Arroser de miel et servir.',
    ],
    baseMacros: { calories: 350, protein: 10, carbs: 64, fat: 8 },
    tags: ['sans_gluten', 'quinoa', 'fruits', 'bowl'],
  },

  // breakfast_077: Omelette patate douce
  // egg 100g (2 oeufs): cal 155, P 13, C 1.1, F 11
  // sweet_potato 100g: cal 86, P 1.6, C 20, F 0.1
  // spinach 30g: cal 7, P 0.9, C 1.1, F 0.1
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // TOTAL: cal 292, P 16, C 22, F 16
  {
    id: 'breakfast_077',
    name: 'Omelette patate douce',
    description: 'Une omelette moelleuse avec des dés de patate douce rôtis et des épinards. Sans gluten, ça cale bien et c\'est coloré.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Couper la patate douce en petits dés et les faire revenir à la poêle 8-10 min.',
      'Ajouter les épinards et laisser tomber.',
      'Verser les oeufs battus par-dessus et cuire à feu doux.',
      'Replier l\'omelette et servir.',
    ],
    baseMacros: { calories: 292, protein: 16, carbs: 22, fat: 16 },
    tags: ['sans_gluten', 'omelette', 'patate_douce'],
  },

  // breakfast_078: Smoothie bowl protéiné GF
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // pea_protein 20g: cal 80, P 16, C 1.6, F 1 (400/80/8/5 per 100g approx)
  // almond_milk 100ml: cal 17, P 0.4, C 2.5, F 0.6
  // mixed_berries 60g: cal 30, P 0.5, C 7.2, F 0.2
  // pumpkin_seeds 10g: cal 56, P 3, C 1.3, F 4.9 (559cal/100g)
  // TOTAL: cal 272, P 21, C 36, F 7
  {
    id: 'breakfast_078',
    name: 'Smoothie bowl protéiné GF',
    description: 'Un smoothie bowl sans gluten boosté à la protéine de pois. Banane, fruits rouges et graines de courge pour le crunchy.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'vegan', 'vegetarian', 'lactose_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'almond_milk', name: 'Lait d\'amande', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mixed_berries', name: 'Fruits rouges', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'pumpkin_seeds', name: 'Graines de courge', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixer la banane, la protéine de pois et le lait d\'amande jusqu\'à obtenir un mélange épais.',
      'Verser dans un bol.',
      'Garnir de fruits rouges et graines de courge.',
    ],
    baseMacros: { calories: 272, protein: 21, carbs: 36, fat: 7 },
    tags: ['sans_gluten', 'protéiné', 'smoothie', 'vegan'],
  },

  // breakfast_079: Riz au lait protéiné
  // white_rice 50g dry: cal 182, P 3.6, C 40, F 0.3
  // milk_semi 150ml: cal 69, P 4.8, C 7.2, F 2.3
  // whey_protein 15g: cal 60, P 12, C 1.2, F 0.8
  // cinnamon 2g: cal 5, P 0.1, C 1.6, F 0
  // honey 8g: cal 24, P 0, C 6.6, F 0
  // TOTAL: cal 340, P 21, C 57, F 3
  {
    id: 'breakfast_079',
    name: 'Riz au lait protéiné',
    description: 'Un riz au lait réconfortant boosté à la whey. Cannelle et miel pour le goût, protéines pour les muscles. Le comfort food healthy.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 18,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 10 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 8, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Cuire le riz dans le lait à feu doux pendant 15 min en remuant régulièrement.',
      'Laisser tiédir légèrement puis incorporer la whey protéine.',
      'Saupoudrer de cannelle et ajouter le miel.',
      'Servir tiède ou froid.',
    ],
    baseMacros: { calories: 340, protein: 21, carbs: 57, fat: 3 },
    tags: ['sans_gluten', 'riz_au_lait', 'protéiné', 'comfort'],
  },

  // breakfast_080: Galette patate douce oeuf
  // sweet_potato 120g: cal 103, P 1.9, C 24, F 0.1
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // olive_oil 5g: cal 44, P 0, C 0, F 5
  // spinach 30g: cal 7, P 0.9, C 1.1, F 0.1
  // TOTAL: cal 232, P 9, C 26, F 11
  // -> add a second egg for more protein
  // egg 100g: cal 155, P 13, C 1.1, F 11
  // ADJUSTED: cal 309, P 16, C 25, F 16
  {
    id: 'breakfast_080',
    name: 'Galette patate douce oeuf',
    description: 'Des galettes de patate douce râpée croustillantes avec un oeuf au plat. Sans gluten, naturellement sucré-salé.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free', 'lactose_free', 'vegetarian'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'sweet_potato', name: 'Patate douce', baseQuantityG: 120, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Râper la patate douce et presser pour enlever l\'excès d\'eau.',
      'Former des galettes et les cuire dans l\'huile d\'olive 3-4 min par côté.',
      'Faire cuire un oeuf au plat dans la même poêle.',
      'Servir les galettes avec l\'oeuf et les épinards frais.',
    ],
    baseMacros: { calories: 309, protein: 16, carbs: 25, fat: 16 },
    tags: ['sans_gluten', 'patate_douce', 'galettes'],
  },

  // ══════════════════════════════════════
  // ── GENERAL / FITNESS (5) ──
  // ══════════════════════════════════════

  // breakfast_081: Proats (protein oats)
  // oats 50g: cal 195, P 8.5, C 33, F 3.5
  // whey_protein 25g: cal 100, P 20, C 2, F 1.3
  // banana 60g: cal 53, P 0.7, C 13.8, F 0.2
  // peanut_butter 10g: cal 59, P 2.5, C 2, F 5
  // milk_semi 100ml: cal 46, P 3.2, C 4.8, F 1.5
  // TOTAL: cal 453, P 35, C 56, F 12
  {
    id: 'breakfast_081',
    name: 'Proats (protein oats)',
    description: 'Le petit-déj des fiteux : flocons d\'avoine + whey + banane + PB. Ça envoie du prot et c\'est trop bon. Le classique de la muscu.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 100, unit: 'ml', roundTo: 10 },
    ],
    recipeSteps: [
      'Cuire les flocons d\'avoine dans le lait 3-4 min au micro-ondes ou à la casserole.',
      'Laisser tiédir et incorporer la whey protéine en mélangeant bien.',
      'Ajouter les rondelles de banane et le beurre de cacahuète.',
    ],
    baseMacros: { calories: 453, protein: 35, carbs: 56, fat: 12 },
    tags: ['fitness', 'protéiné', 'porridge', 'muscu'],
  },

  // breakfast_082: Egg muffins meal prep
  // egg 150g (3 oeufs): cal 233, P 19.5, C 1.7, F 16.5
  // bell_pepper 40g: cal 10, P 0.4, C 2.4, F 0.1
  // spinach 30g: cal 7, P 0.9, C 1.1, F 0.1
  // emmental 15g: cal 57, P 4.1, C 0, F 4.4 (380cal/100g approx)
  // TOTAL: cal 307, P 25, C 5, F 21
  {
    id: 'breakfast_082',
    name: 'Egg muffins meal prep',
    description: 'Des muffins aux oeufs avec légumes et fromage. Tu prépares le dimanche, tu réchauffes le matin. Le meal prep du pro.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'gluten_free'],
    prepTimeMin: 20,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeufs', baseQuantityG: 150, unit: 'g', roundTo: 10 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'emmental', name: 'Emmental râpé', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Battre les oeufs et couper les légumes en petits dés.',
      'Mélanger les oeufs avec les légumes et le fromage râpé.',
      'Répartir dans des moules à muffins et cuire 18-20 min à 180°C.',
      'Laisser refroidir et conserver au frigo pour la semaine.',
    ],
    baseMacros: { calories: 307, protein: 25, carbs: 5, fat: 21 },
    tags: ['meal_prep', 'oeufs', 'fitness', 'low_carb'],
  },

  // breakfast_083: Overnight oats PB
  // oats 50g: cal 195, P 8.5, C 33, F 3.5
  // milk_semi 120ml: cal 55, P 3.8, C 5.8, F 1.8
  // peanut_butter 15g: cal 88, P 3.8, C 3, F 7.5
  // chia_seeds 8g: cal 39, P 1.4, C 3.4, F 2.5
  // banana 50g: cal 45, P 0.6, C 11.5, F 0.2
  // TOTAL: cal 422, P 18, C 57, F 16
  {
    id: 'breakfast_083',
    name: 'Overnight oats PB',
    description: 'Des overnight oats au beurre de cacahuète préparés la veille. Le matin tu sors du frigo et tu manges. Zéro effort, max de goût.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 120, unit: 'ml', roundTo: 10 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélanger les flocons d\'avoine, le lait, les graines de chia et le beurre de cacahuète dans un bocal.',
      'Fermer et laisser au frigo toute la nuit.',
      'Le matin, ajouter les rondelles de banane et déguster froid ou réchauffé.',
    ],
    baseMacros: { calories: 422, protein: 18, carbs: 57, fat: 16 },
    tags: ['meal_prep', 'overnight', 'cacahuète', 'fitness'],
  },

  // breakfast_084: Cottage cheese bowl fruits
  // cottage_cheese 200g: cal 144, P 24, C 5.4, F 2
  // strawberry 80g: cal 26, P 0.6, C 6.4, F 0.2
  // granola 25g: cal 122, P 2.5, C 16, F 6
  // honey 8g: cal 24, P 0, C 6.6, F 0
  // TOTAL: cal 316, P 27, C 34, F 8
  {
    id: 'breakfast_084',
    name: 'Cottage cheese bowl fruits',
    description: 'Un gros bol de cottage cheese avec des fraises, du granola et du miel. Plein de protéines, frais et crunchy. Le nouveau classique.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free', 'vegetarian'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 200, unit: 'g', roundTo: 10 },
      { ingredientId: 'strawberry', name: 'Fraises', baseQuantityG: 80, unit: 'g', roundTo: 10 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 8, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verser le cottage cheese dans un bol.',
      'Couper les fraises et les disposer par-dessus.',
      'Ajouter le granola et un filet de miel.',
    ],
    baseMacros: { calories: 316, protein: 27, carbs: 34, fat: 8 },
    tags: ['fitness', 'protéiné', 'bowl', 'rapide'],
  },

  // breakfast_085: Protein french toast
  // bread_whole 60g: cal 148, P 7.8, C 24.6, F 2.0
  // egg 50g (1 oeuf): cal 78, P 6.5, C 0.6, F 5.5
  // whey_protein 20g: cal 80, P 16, C 1.6, F 1
  // milk_semi 50ml: cal 23, P 1.6, C 2.4, F 0.8
  // mixed_berries 50g: cal 25, P 0.4, C 6, F 0.2
  // TOTAL: cal 354, P 32, C 35, F 10
  {
    id: 'breakfast_085',
    name: 'Protein french toast',
    description: 'Le pain perdu version muscu : trempé dans un mélange oeuf-whey-lait et grillé. Avec des fruits rouges, c\'est le petit-déj parfait post-training.',
    slot: 'breakfast',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'egg', name: 'Oeuf', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 50, unit: 'ml', roundTo: 10 },
      { ingredientId: 'mixed_berries', name: 'Fruits rouges', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Battre l\'oeuf avec le lait et la whey protéine.',
      'Tremper les tranches de pain complet dans le mélange.',
      'Cuire dans une poêle antiadhésive 2-3 min de chaque côté.',
      'Servir avec les fruits rouges par-dessus.',
    ],
    baseMacros: { calories: 354, protein: 32, carbs: 35, fat: 10 },
    tags: ['fitness', 'protéiné', 'pain_perdu', 'post_training'],
  },
];
