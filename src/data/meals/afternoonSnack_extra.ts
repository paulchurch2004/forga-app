import type { Meal } from '../../types/meal';

export const AFTERNOON_SNACKS_EXTRA: Meal[] = [
  // ── POST-TRAINING SHAKERS (8) ── afternoon_snack_021 - 028

  {
    id: 'afternoon_snack_021',
    name: 'Shaker whey tropical',
    description: 'Shaker post-training mangue-ananas. Les glucides des fruits + la whey pour relancer la machine après la séance.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'pineapple', name: 'Ananas', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender.',
      'Ajoute la whey, la mangue et l\'ananas.',
      'Mixe 20 secondes et bois direct après ta séance.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) mango: 80/100*(60,1,15,0.4)=(48,0.8,12,0.32)
    // pineapple: 60/100*(50,0.5,13,0.1)=(30,0.3,7.8,0.06) milk: 200/100*(46,3.2,4.8,1.5)=(92,6.4,9.6,3)
    // total: (290, 31.5, 31.8, 4.88) => (290, 32, 32, 5)
    baseMacros: { calories: 290, protein: 32, carbs: 32, fat: 5 },
    tags: ['post-training', 'shaker', 'tropical', 'récupération'],
  },
  {
    id: 'afternoon_snack_022',
    name: 'Shaker double choco',
    description: 'Double dose de chocolat : whey + cacao. Le shaker gourmand qui tape dans les macros sans culpabilité.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 35, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender ou shaker.',
      'Ajoute la whey, le cacao et la banane.',
      'Mixe 20 secondes et régale-toi.',
    ],
    // whey: 35/100*(400,80,8,5)=(140,28,2.8,1.75) cocoa: 10/100*(228,20,58,14)=(22.8,2,5.8,1.4)
    // milk: 250/100*(46,3.2,4.8,1.5)=(115,8,12,3.75) banana: 75/100*(89,1.1,23,0.3)=(66.75,0.825,17.25,0.225)
    // total: (344.55, 38.825, 37.85, 7.125) => (345, 39, 38, 7)
    baseMacros: { calories: 345, protein: 39, carbs: 38, fat: 7 },
    tags: ['post-training', 'shaker', 'chocolat', 'gourmand'],
  },
  {
    id: 'afternoon_snack_023',
    name: 'Shaker PB banane',
    description: 'Whey + beurre de cacahuète + banane. Le shaker prise de masse par excellence, crémeux et riche.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender.',
      'Ajoute la whey, le beurre de cacahuète et la banane.',
      'Mixe 30 secondes pour bien incorporer le PB.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) PB: 15/100*(588,25,20,50)=(88.2,3.75,3,7.5)
    // banana: 100/100*(89,1.1,23,0.3)=(89,1.1,23,0.3) milk: 200/100*(46,3.2,4.8,1.5)=(92,6.4,9.6,3)
    // total: (389.2, 35.25, 38, 12.3) => (389, 35, 38, 12)
    baseMacros: { calories: 389, protein: 35, carbs: 38, fat: 12 },
    tags: ['post-training', 'shaker', 'prise-de-masse', 'crémeux'],
  },
  {
    id: 'afternoon_snack_024',
    name: 'Shaker fraise',
    description: 'Shaker frais fraises + whey. Léger, rapide, parfait après une séance d\'été.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'strawberry', name: 'Fraises', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender.',
      'Ajoute la whey et les fraises.',
      'Mixe 20 secondes et déguste bien frais.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) strawberry: 100/100*(32,1,8,0.3)=(32,1,8,0.3)
    // milk: 250/100*(46,3.2,4.8,1.5)=(115,8,12,3.75)
    // total: (267, 33, 22.4, 5.55) => (267, 33, 22, 6)
    baseMacros: { calories: 267, protein: 33, carbs: 22, fat: 6 },
    tags: ['post-training', 'shaker', 'frais', 'léger'],
  },
  {
    id: 'afternoon_snack_025',
    name: 'Shaker vanille avoine',
    description: 'Whey vanille + flocons d\'avoine. Le shaker qui cale bien avec des glucides lents pour une récup optimale.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 40, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender.',
      'Ajoute la whey et les flocons d\'avoine.',
      'Mixe 30 secondes pour obtenir une texture lisse.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) oats: 40/100*(379,13.5,67,6.5)=(151.6,5.4,26.8,2.6)
    // milk: 250/100*(46,3.2,4.8,1.5)=(115,8,12,3.75)
    // total: (386.6, 37.4, 41.2, 7.85) => (387, 37, 41, 8)
    baseMacros: { calories: 387, protein: 37, carbs: 41, fat: 8 },
    tags: ['post-training', 'shaker', 'glucides-lents', 'rassasiant'],
  },
  {
    id: 'afternoon_snack_026',
    name: 'Shaker mango lassi',
    description: 'Version muscu du lassi indien. Whey + mangue + yaourt grec, un régal crémeux et protéiné.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Salt_lassi.jpg/800px-Salt_lassi.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait et le yaourt grec dans le blender.',
      'Ajoute la whey et la mangue.',
      'Mixe 20 secondes et sers bien frais.',
    ],
    // whey: 25/100*(400,80,8,5)=(100,20,2,1.25) mango: 100/100*(60,1,15,0.4)=(60,1,15,0.4)
    // yogurt: 100/100*(59,10,3.6,0.4)=(59,10,3.6,0.4) milk: 150/100*(46,3.2,4.8,1.5)=(69,4.8,7.2,2.25)
    // total: (288, 35.8, 27.8, 4.3) => (288, 36, 28, 4)
    baseMacros: { calories: 288, protein: 36, carbs: 28, fat: 4 },
    tags: ['post-training', 'shaker', 'crémeux', 'indien'],
  },
  {
    id: 'afternoon_snack_027',
    name: 'Recovery shake fruits rouges',
    description: 'Shaker récupération avec whey, fruits rouges et flocons. Antioxydants + protéines pour réparer les fibres.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'mixed_berries', name: 'Fruits rouges (mélange)', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans le blender avec les fruits rouges.',
      'Ajoute la whey et les flocons d\'avoine.',
      'Mixe 30 secondes et bois dans les 30 min après ta séance.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) berries: 100/100*(45,0.8,10,0.3)=(45,0.8,10,0.3)
    // oats: 25/100*(379,13.5,67,6.5)=(94.75,3.375,16.75,1.625) milk: 200/100*(46,3.2,4.8,1.5)=(92,6.4,9.6,3)
    // total: (351.75, 34.575, 38.75, 6.425) => (352, 35, 39, 6)
    baseMacros: { calories: 352, protein: 35, carbs: 39, fat: 6 },
    tags: ['post-training', 'shaker', 'antioxydants', 'récupération'],
  },
  {
    id: 'afternoon_snack_028',
    name: 'Mass gainer maison',
    description: 'Le mass gainer fait maison : whey, avoine, PB, banane. Plus clean et moins cher que les poudres industrielles.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/800px-Strawberry_milk_shake_%28cropped%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 40, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Mets la banane, les flocons, le PB et la whey dans le blender.',
      'Ajoute 200ml d\'eau.',
      'Mixe 30 secondes et bois ton mass gainer maison.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) oats: 40/100*(379,13.5,67,6.5)=(151.6,5.4,26.8,2.6)
    // PB: 15/100*(588,25,20,50)=(88.2,3.75,3,7.5) banana: 100/100*(89,1.1,23,0.3)=(89,1.1,23,0.3)
    // total: (448.8, 34.25, 55.2, 11.9) => (449, 34, 55, 12)
    // NOTE: slightly above 400 kcal but it's a mass gainer by design
    baseMacros: { calories: 449, protein: 34, carbs: 55, fat: 12 },
    tags: ['post-training', 'shaker', 'prise-de-masse', 'mass-gainer'],
  },

  // ── TARTINES / RICE CAKES (6) ── afternoon_snack_029 - 034

  {
    id: 'afternoon_snack_029',
    name: 'Tartine almond butter miel',
    description: 'Pain complet + purée d\'amande + miel. Simple, gourmand, plein de bons lipides pour l\'après-midi.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Norwegian.open.sandwich-01.jpg/800px-Norwegian.open.sandwich-01.jpg',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'almond_butter', name: 'Purée d\'amande', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Tartine la purée d\'amande généreusement.',
      'Ajoute un filet de miel et déguste.',
    ],
    // bread: 60/100*(247,9,43,3.5)=(148.2,5.4,25.8,2.1) AB: 20/100*(614,21,12,56)=(122.8,4.2,2.4,11.2)
    // honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (301.4, 9.63, 36.4, 13.3) => (301, 10, 36, 13)
    baseMacros: { calories: 301, protein: 10, carbs: 36, fat: 13 },
    tags: ['sucré', 'rapide', 'bons-lipides', 'tartine'],
  },
  {
    id: 'afternoon_snack_030',
    name: 'Rice cakes choco PB',
    description: 'Galettes de riz avec beurre de cacahuète et carrés de chocolat noir. Le combo sucré-salé addictif.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pink_seolgitteok_cake.jpg/800px-Pink_seolgitteok_cake.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'rice_cake', name: 'Galettes de riz', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'dark_chocolate', name: 'Chocolat noir 70%', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Tartine le beurre de cacahuète sur les galettes de riz.',
      'Fais fondre le chocolat noir 15 secondes au micro-ondes.',
      'Verse un filet de chocolat fondu par-dessus et laisse durcir 2 min.',
    ],
    // rice: 30/100*(387,8,82,2.8)=(116.1,2.4,24.6,0.84) PB: 20/100*(588,25,20,50)=(117.6,5,4,10)
    // choco: 10/100*(540,8,34,41)=(54,0.8,3.4,4.1)
    // total: (287.7, 8.2, 32, 14.94) => (288, 8, 32, 15)
    baseMacros: { calories: 288, protein: 8, carbs: 32, fat: 15 },
    tags: ['sucré-salé', 'sans-gluten', 'transportable', 'gourmand'],
  },
  {
    id: 'afternoon_snack_031',
    name: 'Toast ricotta fraise',
    description: 'Pain grillé avec ricotta onctueuse et fraises fraîches. Le toast sucré protéiné façon brunch.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Toast-3.jpg/800px-Toast-3.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'ricotta', name: 'Ricotta', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'strawberry', name: 'Fraises', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Tartine la ricotta sur chaque tranche.',
      'Dispose les fraises coupées en lamelles et ajoute un filet de miel.',
    ],
    // bread: 60/100*(247,9,43,3.5)=(148.2,5.4,25.8,2.1) ricotta: 60/100*(174,11,3,13)=(104.4,6.6,1.8,7.8)
    // strawberry: 80/100*(32,1,8,0.3)=(25.6,0.8,6.4,0.24) honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (308.6, 12.83, 42.2, 10.14) => (309, 13, 42, 10)
    baseMacros: { calories: 309, protein: 13, carbs: 42, fat: 10 },
    tags: ['sucré', 'brunch', 'frais', 'tartine'],
  },
  {
    id: 'afternoon_snack_032',
    name: 'Tartine banane cannelle',
    description: 'Pain complet + banane écrasée + cannelle. Le goûter réconfortant et tout simple.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Norwegian.open.sandwich-01.jpg/800px-Norwegian.open.sandwich-01.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Écrase la banane à la fourchette et tartine-la sur le pain.',
      'Saupoudre de cannelle et ajoute un filet de miel.',
    ],
    // bread: 60/100*(247,9,43,3.5)=(148.2,5.4,25.8,2.1) banana: 100/100*(89,1.1,23,0.3)=(89,1.1,23,0.3)
    // honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (267.6, 6.53, 57, 2.4) => (268, 7, 57, 2)
    baseMacros: { calories: 268, protein: 7, carbs: 57, fat: 2 },
    tags: ['sucré', 'rapide', 'réconfortant', 'tartine'],
  },
  {
    id: 'afternoon_snack_033',
    name: 'Rice cakes avocat',
    description: 'Galettes de riz avec avocat écrasé et graines de tournesol. Le snack salé sans gluten et rassasiant.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pink_seolgitteok_cake.jpg/800px-Pink_seolgitteok_cake.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'rice_cake', name: 'Galettes de riz', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 75, unit: 'g', roundTo: 25 },
      { ingredientId: 'sunflower_seeds', name: 'Graines de tournesol', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Écrase l\'avocat à la fourchette avec du sel et du poivre.',
      'Tartine sur les galettes de riz.',
      'Parsème de graines de tournesol et déguste.',
    ],
    // rice: 25/100*(387,8,82,2.8)=(96.75,2,20.5,0.7) avocado: 75/100*(160,2,8.5,15)=(120,1.5,6.375,11.25)
    // sunflower: 10/100*(584,21,20,51)=(58.4,2.1,2,5.1)
    // total: (275.15, 5.6, 28.875, 17.05) => (275, 6, 29, 17)
    baseMacros: { calories: 275, protein: 6, carbs: 29, fat: 17 },
    tags: ['salé', 'sans-gluten', 'bons-lipides', 'transportable'],
  },
  {
    id: 'afternoon_snack_034',
    name: 'Toast miel noix',
    description: 'Pain complet grillé avec miel et noix concassées. Craquant, sucré, plein d\'oméga-3.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Toast-3.jpg/800px-Toast-3.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Verse le miel sur le pain chaud.',
      'Concasse les noix et parsème-les par-dessus.',
    ],
    // bread: 60/100*(247,9,43,3.5)=(148.2,5.4,25.8,2.1) walnuts: 20/100*(654,15,14,65)=(130.8,3,2.8,13)
    // honey: 15/100*(304,0.3,82,0)=(45.6,0.045,12.3,0)
    // total: (324.6, 8.445, 40.9, 15.1) => (325, 8, 41, 15)
    baseMacros: { calories: 325, protein: 8, carbs: 41, fat: 15 },
    tags: ['sucré', 'oméga-3', 'craquant', 'tartine'],
  },

  // ── SWEET TREATS (6) ── afternoon_snack_035 - 040

  {
    id: 'afternoon_snack_035',
    name: 'Mugcake protéiné',
    description: 'Gâteau minute au micro-ondes avec whey et oeuf. Prêt en 3 min, moelleux et bourré de protéines.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Cupcakes%2C_chocolate_and_strawberry_flavour.jpg/800px-Cupcakes%2C_chocolate_and_strawberry_flavour.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'egg', name: 'Oeuf entier', baseQuantityG: 60, unit: 'unit', roundTo: 1 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange la whey, l\'oeuf, les flocons d\'avoine et le cacao dans un mug.',
      'Ajoute 2 cuillères à soupe d\'eau et mélange bien.',
      'Micro-ondes 90 secondes à pleine puissance.',
      'Laisse tiédir 1 min et déguste direct dans le mug.',
    ],
    // whey: 25/100*(400,80,8,5)=(100,20,2,1.25) egg: 60/100*(155,13,1.1,11)=(93,7.8,0.66,6.6)
    // oats: 20/100*(379,13.5,67,6.5)=(75.8,2.7,13.4,1.3) cocoa: 5/100*(228,20,58,14)=(11.4,1,2.9,0.7)
    // total: (280.2, 31.5, 18.96, 9.85) => (280, 32, 19, 10)
    baseMacros: { calories: 280, protein: 32, carbs: 19, fat: 10 },
    tags: ['mugcake', 'rapide', 'protéiné', 'chocolat', 'chaud'],
  },
  {
    id: 'afternoon_snack_036',
    name: 'Pancake express banane',
    description: 'Pancake express 2 ingrédients : oeuf + banane. Zéro farine, zéro galère, 100% protéiné.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Foodiesfeed.com_pouring-honey-on-pancakes-with-walnuts.jpg/800px-Foodiesfeed.com_pouring-honey-on-pancakes-with-walnuts.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeuf entier', baseQuantityG: 120, unit: 'unit', roundTo: 1 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Écrase la banane et mélange-la avec les oeufs battus.',
      'Fais chauffer une poêle antiadhésive à feu moyen.',
      'Verse des petites portions et cuis 2 min de chaque côté.',
      'Sers avec un filet de miel.',
    ],
    // egg: 120/100*(155,13,1.1,11)=(186,15.6,1.32,13.2) banana: 100/100*(89,1.1,23,0.3)=(89,1.1,23,0.3)
    // honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (305.4, 16.73, 32.52, 13.5) => (305, 17, 33, 14)
    baseMacros: { calories: 305, protein: 17, carbs: 33, fat: 14 },
    tags: ['sans-gluten', 'rapide', 'pancake', 'sucré', 'chaud'],
  },
  {
    id: 'afternoon_snack_037',
    name: 'Banana bread mug',
    description: 'Banana bread express au micro-ondes. Moelleux, chaud, avec de la whey planquée dedans.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Banana_bread_slices.jpg/800px-Banana_bread_slices.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'egg', name: 'Oeuf entier', baseQuantityG: 60, unit: 'unit', roundTo: 1 },
    ],
    recipeSteps: [
      'Écrase la banane dans un mug.',
      'Ajoute l\'oeuf, la whey et les flocons d\'avoine, mélange bien.',
      'Micro-ondes 2 minutes à pleine puissance.',
      'Laisse tiédir et déguste chaud.',
    ],
    // banana: 75/100*(89,1.1,23,0.3)=(66.75,0.825,17.25,0.225) whey: 20/100*(400,80,8,5)=(80,16,1.6,1)
    // oats: 25/100*(379,13.5,67,6.5)=(94.75,3.375,16.75,1.625) egg: 60/100*(155,13,1.1,11)=(93,7.8,0.66,6.6)
    // total: (334.5, 28, 36.26, 9.45) => (335, 28, 36, 9)
    baseMacros: { calories: 335, protein: 28, carbs: 36, fat: 9 },
    tags: ['mugcake', 'banana-bread', 'chaud', 'protéiné', 'moelleux'],
  },
  {
    id: 'afternoon_snack_038',
    name: 'Crêpe whey express',
    description: 'Crêpe protéinée avec whey et oeuf. Rapide à faire, parfaite pour le goûter ou en post-training.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Crepes_dsc07085.jpg/800px-Crepes_dsc07085.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'egg', name: 'Oeuf entier', baseQuantityG: 60, unit: 'unit', roundTo: 1 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 100, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Mixe l\'oeuf, la whey, les flocons d\'avoine et le lait pour obtenir une pâte lisse.',
      'Fais chauffer une poêle antiadhésive à feu moyen.',
      'Verse la pâte et étale-la finement.',
      'Cuis 1-2 min de chaque côté et garnis selon tes envies.',
    ],
    // whey: 25/100*(400,80,8,5)=(100,20,2,1.25) egg: 60/100*(155,13,1.1,11)=(93,7.8,0.66,6.6)
    // oats: 25/100*(379,13.5,67,6.5)=(94.75,3.375,16.75,1.625) milk: 100/100*(46,3.2,4.8,1.5)=(46,3.2,4.8,1.5)
    // total: (333.75, 34.375, 24.21, 10.975) => (334, 34, 24, 11)
    baseMacros: { calories: 334, protein: 34, carbs: 24, fat: 11 },
    tags: ['crêpe', 'protéiné', 'chaud', 'polyvalent'],
  },
  {
    id: 'afternoon_snack_039',
    name: 'Bowl chocolat yaourt',
    description: 'Yaourt grec + cacao + granola. Un bowl gourmand façon dessert mais bourré de protéines.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/800px-Joghurt.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Mélange le cacao en poudre dans le yaourt.',
      'Parsème de granola et ajoute le miel.',
    ],
    // yogurt: 200/100*(59,10,3.6,0.4)=(118,20,7.2,0.8) cocoa: 8/100*(228,20,58,14)=(18.24,1.6,4.64,1.12)
    // granola: 20/100*(471,10,64,20)=(94.2,2,12.8,4) honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (260.84, 23.63, 32.84, 5.92) => (261, 24, 33, 6)
    baseMacros: { calories: 261, protein: 24, carbs: 33, fat: 6 },
    tags: ['bowl', 'chocolat', 'gourmand', 'protéiné', 'rapide'],
  },
  {
    id: 'afternoon_snack_040',
    name: 'Mousse choco protéinée',
    description: 'Mousse chocolatée au fromage blanc et cacao. Texture onctueuse, protéines au top, zéro culpabilité.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Chocolate_coffee_mousse.jpg/800px-Chocolate_coffee_mousse.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange le fromage blanc, la whey et le cacao dans un bol.',
      'Ajoute le miel et fouette vigoureusement pour obtenir une mousse lisse.',
      'Réfrigère 15 min pour une texture plus ferme.',
      'Déguste bien frais.',
    ],
    // FB: 200/100*(48,8,3.8,0.1)=(96,16,7.6,0.2) cocoa: 10/100*(228,20,58,14)=(22.8,2,5.8,1.4)
    // whey: 15/100*(400,80,8,5)=(60,12,1.2,0.75) honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (209.2, 30.03, 22.8, 2.35) => (209, 30, 23, 2)
    baseMacros: { calories: 209, protein: 30, carbs: 23, fat: 2 },
    tags: ['mousse', 'chocolat', 'sans-gluten', 'protéiné', 'frais'],
  },

  // ── SAVORY SNACKS (6) ── afternoon_snack_041 - 046

  {
    id: 'afternoon_snack_041',
    name: 'Mini wrap poulet',
    description: 'Wrap garni de blanc de poulet et cream cheese. Le snack salé, protéiné et transportable.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Chickens_in_market.jpg/800px-Chickens_in_market.jpg',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'wrap_tortilla', name: 'Tortilla wrap', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_cheese', name: 'Cream cheese', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'mixed_salad', name: 'Salade mélangée', baseQuantityG: 25, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Tartine le cream cheese sur la tortilla.',
      'Dispose le poulet cuit émincé et la salade.',
      'Roule le wrap bien serré.',
      'Coupe en deux et déguste.',
    ],
    // wrap: 40/100*(312,8.5,52,8)=(124.8,3.4,20.8,3.2) chicken: 60/100*(165,31,0,3.6)=(99,18.6,0,2.16)
    // cream: 20/100*(215,6,4,20)=(43,1.2,0.8,4) salad: 25/100*(17,1.3,3.3,0.2)=(4.25,0.325,0.825,0.05)
    // total: (271.05, 23.525, 22.425, 9.41) => (271, 24, 22, 9)
    baseMacros: { calories: 271, protein: 24, carbs: 22, fat: 9 },
    tags: ['salé', 'wrap', 'protéiné', 'transportable'],
  },
  {
    id: 'afternoon_snack_042',
    name: 'Oeufs durs houmous',
    description: 'Oeufs durs avec du houmous pour tremper. Le combo protéiné old school mais redoutablement efficace.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Soft-boiled-egg.jpg/800px-Soft-boiled-egg.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'egg', name: 'Oeuf entier', baseQuantityG: 120, unit: 'unit', roundTo: 1 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Prépare tes oeufs durs à l\'avance (10 min à l\'eau bouillante).',
      'Coupe-les en deux et sers avec le houmous à côté.',
      'Trempe et déguste.',
    ],
    // egg: 120/100*(155,13,1.1,11)=(186,15.6,1.32,13.2) hummus: 50/100*(166,8,14,10)=(83,4,7,5)
    // total: (269, 19.6, 8.32, 18.2) => (269, 20, 8, 18)
    baseMacros: { calories: 269, protein: 20, carbs: 8, fat: 18 },
    tags: ['salé', 'protéiné', 'sans-gluten', 'meal-prep'],
  },
  {
    id: 'afternoon_snack_043',
    name: 'Tartine thon',
    description: 'Pain complet avec thon et cream cheese. Le classique du snack salé, protéiné et économique.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Norwegian.open.sandwich-01.jpg/800px-Norwegian.open.sandwich-01.jpg',
    budget: 'eco',
    restrictions: ['halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'canned_tuna', name: 'Thon en conserve', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'cream_cheese', name: 'Cream cheese', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Égoutte le thon et émiette-le dans un bol.',
      'Mélange avec le cream cheese.',
      'Tartine sur le pain complet grillé et déguste.',
    ],
    // bread: 60/100*(247,9,43,3.5)=(148.2,5.4,25.8,2.1) tuna: 60/100*(116,26,0,1)=(69.6,15.6,0,0.6)
    // cream: 15/100*(215,6,4,20)=(32.25,0.9,0.6,3)
    // total: (250.05, 21.9, 26.4, 5.7) => (250, 22, 26, 6)
    baseMacros: { calories: 250, protein: 22, carbs: 26, fat: 6 },
    tags: ['salé', 'protéiné', 'tartine', 'économique'],
  },
  {
    id: 'afternoon_snack_044',
    name: 'Cottage cheese tomate',
    description: 'Cottage cheese avec tomates cerises et un trait d\'huile d\'olive. Frais, léger, parfait en sèche.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'cherry_tomato', name: 'Tomates cerises', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le cottage cheese dans un bol.',
      'Coupe les tomates cerises en deux et dispose-les dessus.',
      'Ajoute un filet d\'huile d\'olive, du sel et du poivre.',
    ],
    // cottage: 150/100*(98,11,3.4,4.3)=(147,16.5,5.1,6.45) tomato: 100/100*(18,1,4,0.2)=(18,1,4,0.2)
    // oil: 5/100*(884,0,0,100)=(44.2,0,0,5)
    // total: (209.2, 17.5, 9.1, 11.65) => (209, 18, 9, 12)
    baseMacros: { calories: 209, protein: 18, carbs: 9, fat: 12 },
    tags: ['salé', 'frais', 'sèche', 'sans-gluten', 'léger'],
  },
  {
    id: 'afternoon_snack_045',
    name: 'Edamame épicés',
    description: 'Edamame poêlés avec un filet de sauce soja et sriracha. Le snack salé protéiné venu d\'Asie.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Edamame_by_Zesmerelda_in_Chicago.jpg/800px-Edamame_by_Zesmerelda_in_Chicago.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
      { ingredientId: 'sesame_oil', name: 'Huile de sésame', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais cuire les edamame 3-4 min à l\'eau bouillante, puis égoutte.',
      'Fais-les sauter 1 min à la poêle avec l\'huile de sésame.',
      'Ajoute la sauce soja et mélange. Déguste chaud.',
    ],
    // edamame: 150/100*(122,11,10,5)=(183,16.5,15,7.5) soy: 10/100*(53,5,5,0.1)=(5.3,0.5,0.5,0.01)
    // sesame: 5/100*(884,0,0,100)=(44.2,0,0,5)
    // total: (232.5, 17, 15.5, 12.51) => (233, 17, 16, 13)
    baseMacros: { calories: 233, protein: 17, carbs: 16, fat: 13 },
    tags: ['salé', 'épicé', 'vegan', 'protéines-végétales', 'asiatique'],
  },
  {
    id: 'afternoon_snack_046',
    name: 'Bouchées poulet',
    description: 'Dés de poulet froids avec moutarde. Le snack 100% protéiné, zéro prise de tête, idéal en meal prep.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Chickens_in_market.jpg/800px-Chickens_in_market.jpg',
    budget: 'eco',
    restrictions: ['gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chicken_breast', name: 'Blanc de poulet', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'mustard', name: 'Moutarde', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe le poulet cuit en dés.',
      'Sers avec la moutarde à côté pour tremper.',
      'Déguste froid ou réchauffé.',
    ],
    // chicken: 100/100*(165,31,0,3.6)=(165,31,0,3.6) mustard: 10/100*(66,4,6,4)=(6.6,0.4,0.6,0.4)
    // total: (171.6, 31.4, 0.6, 4) => (172, 31, 1, 4)
    baseMacros: { calories: 172, protein: 31, carbs: 1, fat: 4 },
    tags: ['salé', 'hyper-protéiné', 'meal-prep', 'sans-gluten', 'sèche'],
  },

  // ── WORLD SNACKS (6) ── afternoon_snack_047 - 052

  {
    id: 'afternoon_snack_047',
    name: 'Mochi protéiné',
    description: 'Riz gluant roulé avec whey et beurre de cacahuète. Version muscu du mochi japonais.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Mochi_002.jpg/800px-Mochi_002.jpg',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc (cuit)', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Écrase le riz cuit pour obtenir une pâte collante.',
      'Mélange la whey dans la pâte de riz.',
      'Forme des petites boules, aplatis-les et garnis de PB au centre.',
      'Referme les boules et déguste.',
    ],
    // rice: 100/100*(130,2.7,28,0.3)=(130,2.7,28,0.3) whey: 20/100*(400,80,8,5)=(80,16,1.6,1)
    // PB: 15/100*(588,25,20,50)=(88.2,3.75,3,7.5)
    // total: (298.2, 22.45, 32.6, 8.8) => (298, 22, 33, 9)
    baseMacros: { calories: 298, protein: 22, carbs: 33, fat: 9 },
    tags: ['japonais', 'protéiné', 'créatif', 'sans-gluten'],
  },
  {
    id: 'afternoon_snack_048',
    name: 'Plantain poêlé',
    description: 'Banane plantain poêlée à l\'huile d\'olive. Le snack africain réconfortant, riche en glucides pour recharger.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Mega_racimos_de_guineos.jpg/800px-Mega_racimos_de_guineos.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'plantain', name: 'Banane plantain (cuite)', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe la banane plantain en rondelles épaisses.',
      'Fais chauffer l\'huile d\'olive dans une poêle.',
      'Fais dorer les rondelles 3-4 min de chaque côté. Sale légèrement.',
    ],
    // plantain: 150/100*(122,1.3,32,0.4)=(183,1.95,48,0.6) oil: 10/100*(884,0,0,100)=(88.4,0,0,10)
    // total: (271.4, 1.95, 48, 10.6) => (271, 2, 48, 11)
    baseMacros: { calories: 271, protein: 2, carbs: 48, fat: 11 },
    tags: ['africain', 'chaud', 'glucides', 'vegan', 'réconfortant'],
  },
  {
    id: 'afternoon_snack_049',
    name: 'Fatayer fromage',
    description: 'Pita garnie de feta et épinards. Inspiré des fatayers libanais, version rapide et protéinée.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Fatayer.jpg/800px-Fatayer.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pita_bread', name: 'Pain pita', baseQuantityG: 50, unit: 'unit', roundTo: 1 },
      { ingredientId: 'feta_cheese', name: 'Feta', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'spinach', name: 'Épinards frais', baseQuantityG: 50, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Ouvre le pain pita en deux.',
      'Garnis avec les épinards et la feta émiettée.',
      'Passe au four ou au grille-pain 3-4 min et déguste chaud.',
    ],
    // pita: 50/100*(275,9,56,1)=(137.5,4.5,28,0.5) feta: 30/100*(264,14,4,21)=(79.2,4.2,1.2,6.3)
    // spinach: 50/100*(23,2.9,3.6,0.4)=(11.5,1.45,1.8,0.2)
    // total: (228.2, 10.15, 31, 7) => (228, 10, 31, 7)
    baseMacros: { calories: 228, protein: 10, carbs: 31, fat: 7 },
    tags: ['libanais', 'salé', 'chaud', 'fromage', 'rapide'],
  },
  {
    id: 'afternoon_snack_050',
    name: 'Onigiri saumon',
    description: 'Boulette de riz garnie de saumon fumé et nori. Le snack japonais transportable et protéiné.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%E5%B0%8F%E6%96%99%E7%90%86%E3%83%90%E3%83%AB%E3%81%95%E3%81%8F%E3%82%89_%E7%89%B9%E8%A3%BD%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A.jpg/800px-%E5%B0%8F%E6%96%99%E7%90%86%E3%83%90%E3%83%AB%E3%81%95%E3%81%8F%E3%82%89_%E7%89%B9%E8%A3%BD%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A.jpg',
    budget: 'premium',
    restrictions: ['gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 8,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc (cuit)', baseQuantityG: 120, unit: 'g', roundTo: 25 },
      { ingredientId: 'smoked_salmon', name: 'Saumon fumé', baseQuantityG: 30, unit: 'g', roundTo: 10 },
      { ingredientId: 'nori', name: 'Nori (algue)', baseQuantityG: 3, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Mouille tes mains et prends une portion de riz.',
      'Place le saumon fumé au centre.',
      'Forme un triangle en pressant bien le riz.',
      'Enveloppe la base avec une feuille de nori.',
    ],
    // rice: 120/100*(130,2.7,28,0.3)=(156,3.24,33.6,0.36) salmon: 30/100*(195,22,0,11)=(58.5,6.6,0,3.3)
    // nori: 3/100*(35,6,5,0.3)=(1.05,0.18,0.15,0.009)
    // total: (215.55, 10.02, 33.75, 3.669) => (216, 10, 34, 4)
    baseMacros: { calories: 216, protein: 10, carbs: 34, fat: 4 },
    tags: ['japonais', 'transportable', 'sans-gluten', 'saumon'],
  },
  {
    id: 'afternoon_snack_051',
    name: 'Houmous pita',
    description: 'Pain pita chaud trempé dans du houmous. Le goûter du Moyen-Orient, végétal et rassasiant.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Lebanese_style_hummus.jpg/800px-Lebanese_style_hummus.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pita_bread', name: 'Pain pita', baseQuantityG: 60, unit: 'unit', roundTo: 1 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Réchauffe le pain pita au grille-pain ou à la poêle sèche.',
      'Coupe-le en triangles.',
      'Trempe dans le houmous et déguste.',
    ],
    // pita: 60/100*(275,9,56,1)=(165,5.4,33.6,0.6) hummus: 60/100*(166,8,14,10)=(99.6,4.8,8.4,6)
    // total: (264.6, 10.2, 42, 6.6) => (265, 10, 42, 7)
    baseMacros: { calories: 265, protein: 10, carbs: 42, fat: 7 },
    tags: ['moyen-orient', 'vegan', 'salé', 'chaud', 'rassasiant'],
  },
  {
    id: 'afternoon_snack_052',
    name: 'Bouchées falafel',
    description: 'Mini falafels maison aux pois chiches et épices. Protéines végétales, saveurs du Moyen-Orient.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Falafels_2.jpg/800px-Falafels_2.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'chickpeas', name: 'Pois chiches (cuits)', baseQuantityG: 120, unit: 'g', roundTo: 25 },
      { ingredientId: 'onion', name: 'Oignon', baseQuantityG: 30, unit: 'g', roundTo: 25 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe les pois chiches avec l\'oignon et des épices (cumin, coriandre, sel).',
      'Forme des petites boulettes avec les mains mouillées.',
      'Fais-les dorer à la poêle avec l\'huile d\'olive, 3-4 min de chaque côté.',
      'Déguste chaud avec du houmous si tu veux.',
    ],
    // chickpeas: 120/100*(164,9,27,2.6)=(196.8,10.8,32.4,3.12) onion: 30/100*(40,1.1,9,0.1)=(12,0.33,2.7,0.03)
    // oil: 10/100*(884,0,0,100)=(88.4,0,0,10)
    // total: (297.2, 11.13, 35.1, 13.15) => (297, 11, 35, 13)
    baseMacros: { calories: 297, protein: 11, carbs: 35, fat: 13 },
    tags: ['moyen-orient', 'vegan', 'falafel', 'fait-maison', 'épicé'],
  },

  // ── VEGAN (4) ── afternoon_snack_053 - 056

  {
    id: 'afternoon_snack_053',
    name: 'Smoothie vegan mass',
    description: 'Smoothie prise de masse 100% végétal. Protéine de pois, avoine, banane et PB. Le mass gainer vegan.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kiwi_Smoothie.jpg/800px-Kiwi_Smoothie.jpg',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'soy_milk', name: 'Lait de soja', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait de soja dans le blender.',
      'Ajoute la protéine de pois, la banane et les flocons d\'avoine.',
      'Mixe 30 secondes et bois immédiatement.',
    ],
    // pea: 25/100*(370,80,5,3)=(92.5,20,1.25,0.75) banana: 100/100*(89,1.1,23,0.3)=(89,1.1,23,0.3)
    // oats: 30/100*(379,13.5,67,6.5)=(113.7,4.05,20.1,1.95) soy: 200/100*(33,3,1,2)=(66,6,2,4)
    // total: (361.2, 31.15, 46.35, 7) => (361, 31, 46, 7)
    baseMacros: { calories: 361, protein: 31, carbs: 46, fat: 7 },
    tags: ['vegan', 'shaker', 'prise-de-masse', 'protéines-végétales'],
  },
  {
    id: 'afternoon_snack_054',
    name: 'Energy balls vegan',
    description: 'Boules d\'énergie dattes, noix de cajou et coco. Sans cuisson, vegan, parfaites pour le meal prep.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/800px-Dates005.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes (dénoyautées)', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'cashews', name: 'Noix de cajou', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe les dattes et les noix de cajou au robot.',
      'Forme des petites boules avec les mains mouillées.',
      'Roule-les dans la coco râpée.',
      'Réfrigère 30 min et déguste.',
    ],
    // dates: 50/100*(277,1.8,75,0.2)=(138.5,0.9,37.5,0.1) cashews: 25/100*(553,18,30,44)=(138.25,4.5,7.5,11)
    // coco: 10/100*(660,7,24,62)=(66,0.7,2.4,6.2)
    // total: (342.75, 6.1, 47.4, 17.3) => (343, 6, 47, 17)
    baseMacros: { calories: 343, protein: 6, carbs: 47, fat: 17 },
    tags: ['vegan', 'sans-gluten', 'sans-cuisson', 'meal-prep', 'énergie'],
  },
  {
    id: 'afternoon_snack_055',
    name: 'Trail mix maison',
    description: 'Mélange maison amandes, graines de courge et abricots secs. Le snack transportable et bourré de nutriments.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg/800px-2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'pumpkin_seeds', name: 'Graines de courge', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'dried_apricots', name: 'Abricots secs', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélange les amandes, les graines de courge et les abricots secs dans un sachet.',
      'Emporte partout avec toi et grignote quand tu veux.',
    ],
    // almonds: 20/100*(578,21,22,49)=(115.6,4.2,4.4,9.8) pumpkin: 15/100*(559,30,11,49)=(83.85,4.5,1.65,7.35)
    // apricots: 20/100*(241,3,63,0.5)=(48.2,0.6,12.6,0.1)
    // total: (247.65, 9.3, 18.65, 17.25) => (248, 9, 19, 17)
    baseMacros: { calories: 248, protein: 9, carbs: 19, fat: 17 },
    tags: ['vegan', 'sans-gluten', 'transportable', 'trail-mix', 'sans-cuisson'],
  },
  {
    id: 'afternoon_snack_056',
    name: 'Barre dattes vegan',
    description: 'Barre maison dattes, avoine et beurre de cacahuète. Énergie dense, vegan et parfaite pour le meal prep.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Three_protein_bars.jpg/800px-Three_protein_bars.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes (dénoyautées)', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe les dattes au robot pour obtenir une pâte collante.',
      'Ajoute les flocons d\'avoine et le beurre de cacahuète, mélange bien.',
      'Tasse le mélange dans un petit moule et réfrigère 1h.',
      'Découpe en barres et conserve au frais jusqu\'à 5 jours.',
    ],
    // dates: 50/100*(277,1.8,75,0.2)=(138.5,0.9,37.5,0.1) oats: 30/100*(379,13.5,67,6.5)=(113.7,4.05,20.1,1.95)
    // PB: 15/100*(588,25,20,50)=(88.2,3.75,3,7.5)
    // total: (340.4, 8.7, 60.6, 9.55) => (340, 9, 61, 10)
    baseMacros: { calories: 340, protein: 9, carbs: 61, fat: 10 },
    tags: ['vegan', 'meal-prep', 'énergie', 'transportable', 'barre'],
  },

  // ── RECOVERY FOCUSED (4) ── afternoon_snack_057 - 060

  {
    id: 'afternoon_snack_057',
    name: 'Banane whey express',
    description: 'Une banane + un shaker de whey. La combinaison la plus simple et efficace pour la récupération.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bananavarieties.jpg/800px-Bananavarieties.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 120, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Prépare ton shaker de whey avec 200ml d\'eau.',
      'Mange la banane en même temps.',
      'Simple, rapide, efficace. La base.',
    ],
    // whey: 30/100*(400,80,8,5)=(120,24,2.4,1.5) banana: 120/100*(89,1.1,23,0.3)=(106.8,1.32,27.6,0.36)
    // total: (226.8, 25.32, 30, 1.86) => (227, 25, 30, 2)
    baseMacros: { calories: 227, protein: 25, carbs: 30, fat: 2 },
    tags: ['récupération', 'rapide', 'simple', 'sans-gluten', 'post-training'],
  },
  {
    id: 'afternoon_snack_058',
    name: 'Dattes PB',
    description: 'Dattes farcies au beurre de cacahuète. Le snack naturel, sucré-salé, qui recharge les glycogènes vite fait.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/800px-Dates005.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes (dénoyautées)', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Ouvre les dattes en deux dans la longueur.',
      'Garnis chaque datte avec une cuillère de beurre de cacahuète.',
      'Déguste comme des petits bonbons protéinés.',
    ],
    // dates: 50/100*(277,1.8,75,0.2)=(138.5,0.9,37.5,0.1) PB: 20/100*(588,25,20,50)=(117.6,5,4,10)
    // total: (256.1, 5.9, 41.5, 10.1) => (256, 6, 42, 10)
    baseMacros: { calories: 256, protein: 6, carbs: 42, fat: 10 },
    tags: ['récupération', 'sucré-salé', 'vegan', 'sans-gluten', 'naturel'],
  },
  {
    id: 'afternoon_snack_059',
    name: 'Lait choco protéiné',
    description: 'Lait + whey + cacao. Le lait chocolaté version muscu, parfait après l\'effort.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Chocolate_milk.JPG/800px-Chocolate_milk.JPG',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 300, unit: 'ml', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le lait dans un shaker.',
      'Ajoute la whey et le cacao en poudre.',
      'Secoue bien 20 secondes et bois frais.',
    ],
    // milk: 300/100*(46,3.2,4.8,1.5)=(138,9.6,14.4,4.5) whey: 25/100*(400,80,8,5)=(100,20,2,1.25)
    // cocoa: 8/100*(228,20,58,14)=(18.24,1.6,4.64,1.12)
    // total: (256.24, 31.2, 21.04, 6.87) => (256, 31, 21, 7)
    baseMacros: { calories: 256, protein: 31, carbs: 21, fat: 7 },
    tags: ['récupération', 'chocolat', 'rapide', 'sans-gluten', 'post-training'],
  },
  {
    id: 'afternoon_snack_060',
    name: 'Riz au lait express',
    description: 'Riz au lait minute avec de la caséine. Réconfortant, plein de glucides lents et de protéines pour la récupération nocturne.',
    slot: 'afternoon_snack',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kheer_with_condensed_milk..JPG/800px-Kheer_with_condensed_milk..JPG',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc (cuit)', baseQuantityG: 120, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le riz cuit avec le lait à feu doux 5 min en remuant.',
      'Retire du feu et laisse tiédir 2 min.',
      'Incorpore la caséine et le miel, mélange bien.',
      'Déguste tiède ou froid selon tes envies.',
    ],
    // rice: 120/100*(130,2.7,28,0.3)=(156,3.24,33.6,0.36) milk: 150/100*(46,3.2,4.8,1.5)=(69,4.8,7.2,2.25)
    // casein: 20/100*(370,75,5,4)=(74,15,1,0.8) honey: 10/100*(304,0.3,82,0)=(30.4,0.03,8.2,0)
    // total: (329.4, 23.07, 50, 3.41) => (329, 23, 50, 3)
    baseMacros: { calories: 329, protein: 23, carbs: 50, fat: 3 },
    tags: ['récupération', 'réconfortant', 'glucides-lents', 'sans-gluten', 'caséine'],
  },
];
