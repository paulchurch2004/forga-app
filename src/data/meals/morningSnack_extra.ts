import type { Meal } from '../../types/meal';

export const MORNING_SNACKS_EXTRA: Meal[] = [
  // ══════════════════════════════════════
  // ── SMOOTHIES / SHAKERS (8) ──
  // ══════════════════════════════════════

  // morning_snack_021: Smoothie mangue-coco
  // mango 120g: cal 72, P 1.2, C 18, F 0.48
  // coconut_milk 100ml: cal 185, P 2, C 3, F 19
  // whey_protein 25g: cal 100, P 20, C 2, F 1.25
  // => cal 357, P 23.2, C 23, F 20.73 => rounded: 357, 23, 23, 21
  {
    id: 'morning_snack_021',
    name: 'Smoothie mangue-coco',
    description: 'Smoothie tropical mangue et lait de coco avec une dose de whey. Un goût de vacances avec les prots qui vont bien.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 120, unit: 'g', roundTo: 25 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 100, unit: 'ml', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe la mangue en morceaux et place-la dans le blender.',
      'Ajoute le lait de coco et la whey.',
      'Mixe 30 secondes et sers bien frais.',
    ],
    baseMacros: { calories: 357, protein: 23, carbs: 23, fat: 21 },
    tags: ['smoothie', 'tropical', 'protéiné', 'rapide'],
  },

  // morning_snack_022: Shaker choco PB
  // milk_semi 250ml: cal 115, P 8, C 12, F 3.75
  // whey_protein 30g: cal 120, P 24, C 2.4, F 1.5
  // cocoa_powder 10g: cal 22.8, P 2, C 5.8, F 1.4
  // peanut_butter 15g: cal 88.2, P 3.75, C 3, F 7.5
  // => cal 346, P 37.75, C 23.2, F 14.15 => rounded: 346, 38, 23, 14
  {
    id: 'morning_snack_022',
    name: 'Shaker choco PB',
    description: 'Le combo whey chocolat et beurre de cacahuète. Un shaker gourmand qui fait le taf pour les prots.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le lait dans ton shaker.',
      'Ajoute la whey, le cacao et le beurre de cacahuète.',
      'Secoue fort pendant 20 secondes et bois direct.',
    ],
    baseMacros: { calories: 346, protein: 38, carbs: 23, fat: 14 },
    tags: ['shaker', 'chocolat', 'protéiné', 'rapide', 'gourmand'],
  },

  // morning_snack_023: Smoothie vert épinards
  // spinach 50g: cal 11.5, P 1.45, C 1.8, F 0.2
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // almond_milk 200ml: cal 30, P 1, C 0.6, F 2.2
  // whey_protein 25g: cal 100, P 20, C 2, F 1.25
  // => cal 230.5, P 23.55, C 27.4, F 3.95 => rounded: 231, 24, 27, 4
  {
    id: 'morning_snack_023',
    name: 'Smoothie vert épinards',
    description: 'Le green smoothie du vrai guerrier. Épinards, banane et whey, tu sens même pas les légumes.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'spinach', name: 'Épinards frais', baseQuantityG: 50, unit: 'g', roundTo: 25 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'almond_milk', name: 'Lait d\'amande', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mets les épinards et le lait d\'amande dans le blender.',
      'Ajoute la banane en morceaux et la whey.',
      'Mixe 30 secondes jusqu\'à obtenir une texture bien lisse.',
    ],
    baseMacros: { calories: 231, protein: 24, carbs: 27, fat: 4 },
    tags: ['smoothie', 'vert', 'protéiné', 'vitamines', 'rapide'],
  },

  // morning_snack_024: Green smoothie banane
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // kale 40g: cal 14, P 1.2, C 1.6, F 0.4
  // peanut_butter 15g: cal 88.2, P 3.75, C 3, F 7.5
  // oat_milk 200ml: cal 92, P 2, C 14, F 3
  // => cal 283.2, P 8.05, C 41.6, F 11.2 => rounded: 283, 8, 42, 11
  {
    id: 'morning_snack_024',
    name: 'Green smoothie banane',
    description: 'Smoothie vert au chou kale et banane. Bourré de vitamines, sucré naturellement par la banane.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'kale', name: 'Chou kale', baseQuantityG: 40, unit: 'g', roundTo: 25 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Place le kale et le lait d\'avoine dans le blender.',
      'Ajoute la banane coupée et le beurre de cacahuète.',
      'Mixe 45 secondes et sers dans un grand verre.',
    ],
    baseMacros: { calories: 283, protein: 8, carbs: 42, fat: 11 },
    tags: ['smoothie', 'vegan', 'vert', 'vitamines', 'rapide'],
  },

  // morning_snack_025: Shaker vanille banane
  // milk_semi 250ml: cal 115, P 8, C 12, F 3.75
  // whey_protein 30g: cal 120, P 24, C 2.4, F 1.5
  // banana 75g: cal 66.75, P 0.825, C 17.25, F 0.225
  // => cal 301.75, P 32.825, C 31.65, F 5.475 => rounded: 302, 33, 32, 5
  {
    id: 'morning_snack_025',
    name: 'Shaker vanille banane',
    description: 'Le classique vanille-banane en version shaker. Rapide, crémeux et bourré de prots.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le lait dans ton shaker.',
      'Ajoute la whey vanille et secoue 15 secondes.',
      'Mange la banane à côté ou mixe le tout au blender.',
    ],
    baseMacros: { calories: 302, protein: 33, carbs: 32, fat: 5 },
    tags: ['shaker', 'rapide', 'protéiné', 'classique'],
  },

  // morning_snack_026: Smoothie fraise
  // strawberry 150g: cal 48, P 1.5, C 12, F 0.45
  // greek_yogurt_0 100g: cal 59, P 10, C 3.6, F 0.4
  // whey_protein 20g: cal 80, P 16, C 1.6, F 1
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 217.4, P 27.53, C 25.4, F 1.85 => rounded: 217, 28, 25, 2
  {
    id: 'morning_snack_026',
    name: 'Smoothie fraise',
    description: 'Smoothie fraise-yaourt grec avec une dose de whey. Frais, léger et hyperprotéiné.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'strawberry', name: 'Fraises', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'whey_protein', name: 'Whey protéine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Lave les fraises et mets-les dans le blender.',
      'Ajoute le yaourt grec, la whey et le miel.',
      'Mixe 30 secondes et sers bien frais.',
    ],
    baseMacros: { calories: 217, protein: 28, carbs: 25, fat: 2 },
    tags: ['smoothie', 'frais', 'protéiné', 'léger', 'fruité'],
  },

  // morning_snack_027: Lassi mangue
  // mango 100g: cal 60, P 1, C 15, F 0.4
  // greek_yogurt_0 150g: cal 88.5, P 15, C 5.4, F 0.6
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 178.9, P 16.03, C 28.6, F 1 => rounded: 179, 16, 29, 1
  {
    id: 'morning_snack_027',
    name: 'Lassi mangue protéiné',
    description: 'Le lassi indien revisité version muscu. Mangue, yaourt grec et miel, c\'est crémeux et frais.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe la mangue en morceaux.',
      'Mixe-la avec le yaourt grec et le miel.',
      'Sers frais dans un grand verre.',
    ],
    baseMacros: { calories: 179, protein: 16, carbs: 29, fat: 1 },
    tags: ['smoothie', 'frais', 'protéiné', 'world', 'léger'],
  },

  // morning_snack_028: Smoothie tropical
  // pineapple 75g: cal 37.5, P 0.375, C 9.75, F 0.075
  // mango 75g: cal 45, P 0.75, C 11.25, F 0.3
  // banana 50g: cal 44.5, P 0.55, C 11.5, F 0.15
  // coconut_milk 75ml: cal 138.75, P 1.5, C 2.25, F 14.25
  // => cal 265.75, P 3.175, C 34.75, F 14.775 => rounded: 266, 3, 35, 15
  {
    id: 'morning_snack_028',
    name: 'Smoothie tropical',
    description: 'Ananas, mangue, banane et lait de coco. Un smoothie 100% tropical pour changer du shaker basique.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pineapple', name: 'Ananas', baseQuantityG: 75, unit: 'g', roundTo: 25 },
      { ingredientId: 'mango', name: 'Mangue', baseQuantityG: 75, unit: 'g', roundTo: 25 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 50, unit: 'g', roundTo: 25 },
      { ingredientId: 'coconut_milk', name: 'Lait de coco', baseQuantityG: 75, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Coupe les fruits en morceaux.',
      'Place le tout dans le blender avec le lait de coco.',
      'Mixe 30 secondes et sers bien glacé.',
    ],
    baseMacros: { calories: 266, protein: 3, carbs: 35, fat: 15 },
    tags: ['smoothie', 'vegan', 'tropical', 'frais', 'fruité'],
  },

  // ══════════════════════════════════════
  // ── TARTINES / TOAST (6) ──
  // ══════════════════════════════════════

  // morning_snack_029: Toast avocat
  // bread_whole 60g: cal 148.2, P 5.4, C 25.8, F 2.1
  // avocado 60g: cal 96, P 1.2, C 5.1, F 9
  // lemon_juice 5ml: cal 1.1, P 0.02, C 0.35, F 0.01
  // => cal 245.3, P 6.62, C 31.25, F 11.11 => rounded: 245, 7, 31, 11
  {
    id: 'morning_snack_029',
    name: 'Toast avocat',
    description: 'Le grand classique : pain complet grillé avec de l\'avocat écrasé et du citron. Simple, frais et nourrissant.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'lemon_juice', name: 'Jus de citron', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Écrase l\'avocat avec le jus de citron, sel et poivre.',
      'Tartine généreusement sur le pain grillé.',
    ],
    baseMacros: { calories: 245, protein: 7, carbs: 31, fat: 11 },
    tags: ['rapide', 'vegan', 'frais', 'classique'],
  },

  // morning_snack_030: Bruschetta tomate
  // bread_white 60g: cal 159, P 4.8, C 30.6, F 1.5
  // tomato 100g: cal 18, P 0.9, C 3.9, F 0.2
  // olive_oil 5ml: cal 44.2, P 0, C 0, F 5
  // => cal 221.2, P 5.7, C 34.5, F 6.7 => rounded: 221, 6, 35, 7
  {
    id: 'morning_snack_030',
    name: 'Bruschetta tomate',
    description: 'Pain grillé frotté à l\'ail avec tomate fraîche et huile d\'olive. L\'Italie dans ta collation.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_white', name: 'Pain blanc', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'tomato', name: 'Tomate', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain.',
      'Coupe la tomate en petits dés, assaisonne avec sel et poivre.',
      'Dispose la tomate sur le pain et arrose d\'huile d\'olive.',
    ],
    baseMacros: { calories: 221, protein: 6, carbs: 35, fat: 7 },
    tags: ['rapide', 'vegan', 'méditerranéen', 'léger'],
  },

  // morning_snack_031: Toast labneh za'atar
  // bread_whole 60g: cal 148.2, P 5.4, C 25.8, F 2.1
  // labneh 40g: cal 61.6, P 2.4, C 2, F 4.8
  // za_atar 5g: cal 13.8, P 0.45, C 2.05, F 0.4
  // olive_oil 5ml: cal 44.2, P 0, C 0, F 5
  // => cal 267.8, P 8.25, C 29.85, F 12.3 => rounded: 268, 8, 30, 12
  {
    id: 'morning_snack_031',
    name: 'Toast labneh za\'atar',
    description: 'Pain complet tartiné de labneh crémeux, za\'atar et huile d\'olive. Le snack moyen-oriental qui claque.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'labneh', name: 'Labneh', baseQuantityG: 40, unit: 'g', roundTo: 25 },
      { ingredientId: 'za_atar', name: 'Za\'atar', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Tartine le labneh sur le pain chaud.',
      'Saupoudre de za\'atar et arrose d\'un filet d\'huile d\'olive.',
    ],
    baseMacros: { calories: 268, protein: 8, carbs: 30, fat: 12 },
    tags: ['rapide', 'world', 'moyen-orient', 'crémeux'],
  },

  // morning_snack_032: Tartine PB banane
  // bread_whole 60g: cal 148.2, P 5.4, C 25.8, F 2.1
  // peanut_butter 20g: cal 117.6, P 5, C 4, F 10
  // banana 75g: cal 66.75, P 0.825, C 17.25, F 0.225
  // => cal 332.55, P 11.225, C 47.05, F 12.325 => rounded: 333, 11, 47, 12
  {
    id: 'morning_snack_032',
    name: 'Tartine PB banane',
    description: 'Pain complet avec beurre de cacahuète et rondelles de banane. Le combo prise de masse incontournable.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Grille le pain complet.',
      'Tartine le beurre de cacahuète sur le pain chaud.',
      'Dispose les rondelles de banane par-dessus et déguste.',
    ],
    baseMacros: { calories: 333, protein: 11, carbs: 47, fat: 12 },
    tags: ['rapide', 'vegan', 'prise-de-masse', 'classique'],
  },

  // morning_snack_033: Rice cakes PB
  // rice_cake 30g: cal 116.1, P 2.4, C 24.6, F 0.84
  // peanut_butter 25g: cal 147, P 6.25, C 5, F 12.5
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 293.5, P 8.68, C 37.8, F 13.34 => rounded: 294, 9, 38, 13
  {
    id: 'morning_snack_033',
    name: 'Rice cakes PB',
    description: 'Galettes de riz croustillantes avec beurre de cacahuète et miel. Sans gluten, rapide et transportable.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'rice_cake', name: 'Galettes de riz', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Tartine le beurre de cacahuète sur les galettes de riz.',
      'Ajoute un filet de miel par-dessus.',
      'Déguste immédiatement ou emballe pour plus tard.',
    ],
    baseMacros: { calories: 294, protein: 9, carbs: 38, fat: 13 },
    tags: ['rapide', 'sans-gluten', 'transportable', 'sucré'],
  },

  // morning_snack_034: Tartine ricotta miel
  // bread_whole 60g: cal 148.2, P 5.4, C 25.8, F 2.1
  // ricotta 60g: cal 104.4, P 6.6, C 1.8, F 7.8
  // honey 15g: cal 45.6, P 0.045, C 12.3, F 0
  // => cal 298.2, P 12.045, C 39.9, F 9.9 => rounded: 298, 12, 40, 10
  {
    id: 'morning_snack_034',
    name: 'Tartine ricotta miel',
    description: 'Pain complet avec ricotta crémeuse et miel. Un snack sucré-doux, riche en protéines.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'bread_whole', name: 'Pain complet', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'ricotta', name: 'Ricotta', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Grille les tranches de pain complet.',
      'Tartine la ricotta sur le pain chaud.',
      'Verse un filet de miel par-dessus et déguste.',
    ],
    baseMacros: { calories: 298, protein: 12, carbs: 40, fat: 10 },
    tags: ['rapide', 'sucré', 'crémeux', 'gourmand'],
  },

  // ══════════════════════════════════════
  // ── FRUITS + PROTÉINES (6) ──
  // ══════════════════════════════════════

  // morning_snack_035: Pomme + PB
  // apple 150g: cal 78, P 0.45, C 21, F 0.3
  // peanut_butter 25g: cal 147, P 6.25, C 5, F 12.5
  // => cal 225, P 6.7, C 26, F 12.8 => rounded: 225, 7, 26, 13
  {
    id: 'morning_snack_035',
    name: 'Pomme + beurre de cacahuète',
    description: 'Quartiers de pomme à tremper dans le beurre de cacahuète. Le snack sucré-salé parfait entre deux repas.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'apple', name: 'Pomme', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 25, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe la pomme en quartiers.',
      'Mets le beurre de cacahuète dans un petit bol.',
      'Trempe les quartiers de pomme dedans et régale-toi.',
    ],
    baseMacros: { calories: 225, protein: 7, carbs: 26, fat: 13 },
    tags: ['rapide', 'vegan', 'sans-gluten', 'transportable', 'sucré-salé'],
  },

  // morning_snack_036: Banane + amandes
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // almonds 25g: cal 144.5, P 5.25, C 5.5, F 12.25
  // => cal 233.5, P 6.35, C 28.5, F 12.55 => rounded: 234, 6, 29, 13
  {
    id: 'morning_snack_036',
    name: 'Banane + amandes',
    description: 'Une banane et une poignée d\'amandes. Le snack le plus simple du monde, mais efficace en énergie.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 1,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 25, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Pèle la banane.',
      'Mange-la avec les amandes à côté, c\'est aussi simple que ça.',
    ],
    baseMacros: { calories: 234, protein: 6, carbs: 29, fat: 13 },
    tags: ['rapide', 'vegan', 'sans-gluten', 'transportable', 'nature'],
  },

  // morning_snack_037: Fruits rouges fromage blanc
  // mixed_berries 100g: cal 45, P 0.8, C 10, F 0.3
  // fromage_blanc_0 150g: cal 72, P 12, C 5.7, F 0.15
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 147.4, P 12.83, C 23.9, F 0.45 => rounded: 147, 13, 24, 0
  {
    id: 'morning_snack_037',
    name: 'Fruits rouges fromage blanc',
    description: 'Fromage blanc 0% avec des fruits rouges et un peu de miel. Ultra-léger, parfait en sèche.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'mixed_berries', name: 'Fruits rouges', baseQuantityG: 100, unit: 'g', roundTo: 10 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Ajoute les fruits rouges par-dessus.',
      'Termine avec un filet de miel et déguste.',
    ],
    baseMacros: { calories: 147, protein: 13, carbs: 24, fat: 0 },
    tags: ['léger', 'sèche', 'frais', 'sans-gluten', 'protéiné'],
  },

  // morning_snack_038: Dattes fourrées amandes
  // dates 60g: cal 166.2, P 1.08, C 45, F 0.12
  // almonds 20g: cal 115.6, P 4.2, C 4.4, F 9.8
  // => cal 281.8, P 5.28, C 49.4, F 9.92 => rounded: 282, 5, 49, 10
  {
    id: 'morning_snack_038',
    name: 'Dattes fourrées amandes',
    description: 'Dattes dénoyautées garnies d\'une amande. Le snack naturel, sucré et bourré d\'énergie.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Ouvre chaque datte en deux et retire le noyau.',
      'Glisse une amande entière à l\'intérieur.',
      'Referme et déguste. Tu peux les préparer à l\'avance.',
    ],
    baseMacros: { calories: 282, protein: 5, carbs: 49, fat: 10 },
    tags: ['vegan', 'sans-gluten', 'transportable', 'énergie', 'nature'],
  },

  // morning_snack_039: Melon + jambon
  // We don't have melon - use cucumber as closest available. Actually let's rethink.
  // Use orange instead since we don't have melon. Let's do Orange + noix for slot 040.
  // For 039, let's rethink: ham_slice with apple (melon substitute)
  // apple 150g: cal 78, P 0.45, C 21, F 0.3
  // ham_slice 60g: cal 69, P 11.4, C 0.6, F 2.1
  // => cal 147, P 11.85, C 21.6, F 2.4 => rounded: 147, 12, 22, 2
  {
    id: 'morning_snack_039',
    name: 'Pomme + jambon blanc',
    description: 'Tranches de pomme avec du jambon blanc. Le sucré-salé express, riche en protéines et pauvre en gras.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'apple', name: 'Pomme', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'ham_slice', name: 'Jambon blanc', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Coupe la pomme en quartiers.',
      'Enroule les tranches de jambon autour des quartiers.',
      'Déguste immédiatement ou emballe pour emporter.',
    ],
    baseMacros: { calories: 147, protein: 12, carbs: 22, fat: 2 },
    tags: ['rapide', 'sans-gluten', 'sucré-salé', 'protéiné', 'léger'],
  },

  // morning_snack_040: Orange + noix
  // orange 150g: cal 70.5, P 1.5, C 18, F 0.15
  // walnuts 20g: cal 130.8, P 3, C 2.8, F 13
  // => cal 201.3, P 4.5, C 20.8, F 13.15 => rounded: 201, 5, 21, 13
  {
    id: 'morning_snack_040',
    name: 'Orange + noix',
    description: 'Une orange fraîche et une poignée de noix. Vitamine C plus bons lipides, combo anti-fatigue garanti.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'orange', name: 'Orange', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Pèle l\'orange et sépare les quartiers.',
      'Mange les noix en alternance avec les quartiers d\'orange.',
    ],
    baseMacros: { calories: 201, protein: 5, carbs: 21, fat: 13 },
    tags: ['rapide', 'vegan', 'sans-gluten', 'transportable', 'vitamines'],
  },

  // ══════════════════════════════════════
  // ── ENERGY BALLS / BARRES (6) ──
  // ══════════════════════════════════════

  // morning_snack_041: Energy balls dattes cacao
  // dates 50g: cal 138.5, P 0.9, C 37.5, F 0.1
  // oats 30g: cal 113.7, P 4.05, C 20.1, F 1.95
  // cocoa_powder 10g: cal 22.8, P 2, C 5.8, F 1.4
  // coconut_shredded 10g: cal 66, P 0.7, C 2.4, F 6.2
  // => cal 341, P 7.65, C 65.8, F 9.65 => rounded: 341, 8, 66, 10
  {
    id: 'morning_snack_041',
    name: 'Energy balls dattes cacao',
    description: 'Boules d\'énergie dattes et cacao roulées dans la coco. Le snack maison qui remplace les barres du commerce.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe les dattes et les flocons d\'avoine au robot.',
      'Ajoute le cacao et mélange jusqu\'à obtenir une pâte.',
      'Forme 4-5 boules et roule-les dans la coco râpée.',
      'Place au frigo 30 min avant de déguster.',
    ],
    baseMacros: { calories: 341, protein: 8, carbs: 66, fat: 10 },
    tags: ['meal-prep', 'vegan', 'chocolat', 'transportable', 'énergie'],
  },

  // morning_snack_042: Barres avoine miel
  // oats 40g: cal 151.6, P 5.4, C 26.8, F 2.6
  // honey 20g: cal 60.8, P 0.06, C 16.4, F 0
  // almonds 15g: cal 86.7, P 3.15, C 3.3, F 7.35
  // => cal 299.1, P 8.61, C 46.5, F 9.95 => rounded: 299, 9, 47, 10
  {
    id: 'morning_snack_042',
    name: 'Barres avoine miel',
    description: 'Barres maison aux flocons d\'avoine, miel et amandes. Énergie longue durée pour tes entraînements.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 15,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 40, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange les flocons d\'avoine et les amandes concassées.',
      'Fais chauffer le miel 20 secondes et verse-le sur le mélange.',
      'Tasse dans un moule rectangulaire et réfrigère 1h.',
      'Découpe en barres. Se conserve 5 jours au frais.',
    ],
    baseMacros: { calories: 299, protein: 9, carbs: 47, fat: 10 },
    tags: ['meal-prep', 'transportable', 'énergie', 'fait-maison'],
  },

  // morning_snack_043: Bouchées PB avoine
  // oats 30g: cal 113.7, P 4.05, C 20.1, F 1.95
  // peanut_butter 25g: cal 147, P 6.25, C 5, F 12.5
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 291.1, P 10.33, C 33.3, F 14.45 => rounded: 291, 10, 33, 14
  {
    id: 'morning_snack_043',
    name: 'Bouchées PB avoine',
    description: 'Bouchées à l\'avoine et beurre de cacahuète. Faciles à préparer, parfaites pour le meal-prep du dimanche.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange les flocons d\'avoine, le beurre de cacahuète et le miel.',
      'Forme des petites bouchées avec les mains.',
      'Place au frigo 30 min. Se conserve 5 jours.',
    ],
    baseMacros: { calories: 291, protein: 10, carbs: 33, fat: 14 },
    tags: ['meal-prep', 'transportable', 'énergie', 'fait-maison'],
  },

  // morning_snack_044: Energy balls coco
  // dates 50g: cal 138.5, P 0.9, C 37.5, F 0.1
  // coconut_shredded 20g: cal 132, P 1.4, C 4.8, F 12.4
  // cashews 20g: cal 110.6, P 3.6, C 6, F 8.8
  // => cal 381.1, P 5.9, C 48.3, F 21.3 => rounded: 381, 6, 48, 21
  // That's a bit high cal - let me reduce: dates 40g, coconut 15g, cashews 15g
  // dates 40g: cal 110.8, P 0.72, C 30, F 0.08
  // coconut_shredded 15g: cal 99, P 1.05, C 3.6, F 9.3
  // cashews 15g: cal 82.95, P 2.7, C 4.5, F 6.6
  // => cal 292.75, P 4.47, C 38.1, F 15.98 => rounded: 293, 4, 38, 16
  {
    id: 'morning_snack_044',
    name: 'Energy balls coco',
    description: 'Boules d\'énergie coco et noix de cajou. Vegan, sans gluten et fondantes en bouche.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'cashews', name: 'Noix de cajou', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe les dattes et les noix de cajou au robot.',
      'Ajoute la moitié de la coco râpée et mélange.',
      'Forme 3-4 boules et roule-les dans le reste de coco.',
      'Réfrigère 30 min avant de déguster.',
    ],
    baseMacros: { calories: 293, protein: 4, carbs: 38, fat: 16 },
    tags: ['vegan', 'sans-gluten', 'meal-prep', 'transportable', 'coco'],
  },

  // morning_snack_045: Granola clusters
  // granola 40g: cal 188.4, P 4, C 25.6, F 8
  // greek_yogurt_0 100g: cal 59, P 10, C 3.6, F 0.4
  // honey 10g: cal 30.4, P 0.03, C 8.2, F 0
  // => cal 277.8, P 14.03, C 37.4, F 8.4 => rounded: 278, 14, 37, 8
  {
    id: 'morning_snack_045',
    name: 'Granola clusters yaourt',
    description: 'Granola croquant sur yaourt grec. Le bol express qui cale entre deux séances sans te ruiner en macros.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Ajoute le granola par-dessus.',
      'Termine avec un filet de miel et déguste.',
    ],
    baseMacros: { calories: 278, protein: 14, carbs: 37, fat: 8 },
    tags: ['rapide', 'croquant', 'protéiné', 'sucré'],
  },

  // morning_snack_046: Bouchées dattes noix
  // dates 50g: cal 138.5, P 0.9, C 37.5, F 0.1
  // walnuts 20g: cal 130.8, P 3, C 2.8, F 13
  // dark_chocolate 10g: cal 54, P 0.8, C 3.4, F 4.1
  // => cal 323.3, P 4.7, C 43.7, F 17.2 => rounded: 323, 5, 44, 17
  {
    id: 'morning_snack_046',
    name: 'Bouchées dattes noix',
    description: 'Dattes fourrées aux noix avec un carré de chocolat noir. Le snack gourmand naturel qui cale bien.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'dates', name: 'Dattes', baseQuantityG: 50, unit: 'g', roundTo: 10 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'dark_chocolate', name: 'Chocolat noir 70%', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Ouvre les dattes et glisse des morceaux de noix à l\'intérieur.',
      'Fais fondre le chocolat noir au micro-ondes 30 secondes.',
      'Verse un filet de chocolat fondu sur les dattes fourrées.',
      'Laisse durcir 15 min au frigo avant de déguster.',
    ],
    baseMacros: { calories: 323, protein: 5, carbs: 44, fat: 17 },
    tags: ['vegan', 'sans-gluten', 'gourmand', 'chocolat', 'transportable'],
  },

  // ══════════════════════════════════════
  // ── WORLD SNACKS (6) ──
  // ══════════════════════════════════════

  // morning_snack_047: Onigiri thon
  // white_rice 120g: cal 156, P 3.24, C 33.6, F 0.36
  // canned_tuna 40g: cal 46.4, P 10.4, C 0, F 0.4
  // nori 2g: cal 0.7, P 0.12, C 0.1, F 0.006
  // soy_sauce 5ml: cal 2.65, P 0.25, C 0.25, F 0.005
  // => cal 205.75, P 14.01, C 33.95, F 0.771 => rounded: 206, 14, 34, 1
  {
    id: 'morning_snack_047',
    name: 'Onigiri thon',
    description: 'Boulette de riz garnie au thon et enveloppée de nori. Le snack japonais protéiné et transportable.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc (cuit)', baseQuantityG: 120, unit: 'g', roundTo: 25 },
      { ingredientId: 'canned_tuna', name: 'Thon en conserve', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'nori', name: 'Nori', baseQuantityG: 2, unit: 'g', roundTo: 1 },
      { ingredientId: 'soy_sauce', name: 'Sauce soja', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange le thon émietté avec un peu de sauce soja.',
      'Mouille tes mains et forme une boule de riz avec le thon au centre.',
      'Enveloppe la base avec une feuille de nori.',
      'Emballe dans du film alimentaire pour emporter.',
    ],
    baseMacros: { calories: 206, protein: 14, carbs: 34, fat: 1 },
    tags: ['world', 'japonais', 'meal-prep', 'transportable', 'protéiné'],
  },

  // morning_snack_048: Plantain chips + PB
  // plantain 100g: cal 122, P 1.3, C 32, F 0.4
  // peanut_butter 15g: cal 88.2, P 3.75, C 3, F 7.5
  // => cal 210.2, P 5.05, C 35, F 7.9 => rounded: 210, 5, 35, 8
  {
    id: 'morning_snack_048',
    name: 'Plantain + beurre de cacahuète',
    description: 'Rondelles de plantain cuites avec du beurre de cacahuète. Le snack africain qui déchire en énergie.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 10,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'plantain', name: 'Banane plantain', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Coupe la plantain en rondelles épaisses.',
      'Fais-les cuire à la poêle antiadhésive 3-4 min de chaque côté.',
      'Sers avec le beurre de cacahuète pour tremper.',
    ],
    baseMacros: { calories: 210, protein: 5, carbs: 35, fat: 8 },
    tags: ['world', 'africain', 'vegan', 'sans-gluten', 'énergie'],
  },

  // morning_snack_049: Labneh za'atar crudités
  // labneh 60g: cal 92.4, P 3.6, C 3, F 7.2
  // cucumber 80g: cal 12, P 0.56, C 2.88, F 0.08
  // za_atar 5g: cal 13.8, P 0.45, C 2.05, F 0.4
  // olive_oil 5ml: cal 44.2, P 0, C 0, F 5
  // => cal 162.4, P 4.61, C 7.93, F 12.68 => rounded: 162, 5, 8, 13
  {
    id: 'morning_snack_049',
    name: 'Labneh za\'atar & concombre',
    description: 'Labneh assaisonné au za\'atar avec des bâtonnets de concombre. Le snack libanais frais et crémeux.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'labneh', name: 'Labneh', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'za_atar', name: 'Za\'atar', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'olive_oil', name: 'Huile d\'olive', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le labneh dans un bol, saupoudre de za\'atar.',
      'Arrose d\'un filet d\'huile d\'olive.',
      'Coupe le concombre en bâtonnets et trempe dedans.',
    ],
    baseMacros: { calories: 162, protein: 5, carbs: 8, fat: 13 },
    tags: ['world', 'moyen-orient', 'frais', 'sans-gluten', 'léger'],
  },

  // morning_snack_050: Edamame salé
  // edamame 120g: cal 146.4, P 13.2, C 12, F 6
  // => cal 146.4, P 13.2, C 12, F 6 => rounded: 146, 13, 12, 6
  {
    id: 'morning_snack_050',
    name: 'Edamame salé',
    description: 'Edamame chaud avec une pincée de sel. Simple, protéiné et addictif. Le snack parfait.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 120, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Fais cuire les edamame 3-4 min à l\'eau bouillante ou au micro-ondes.',
      'Égoutte et assaisonne avec du sel.',
      'Mange-les en pressant les cosses pour extraire les fèves.',
    ],
    baseMacros: { calories: 146, protein: 13, carbs: 12, fat: 6 },
    tags: ['vegan', 'sans-gluten', 'protéiné', 'world', 'japonais'],
  },

  // morning_snack_051: Houmous crudités
  // hummus 60g: cal 99.6, P 4.8, C 8.4, F 6
  // carrot 80g: cal 32.8, P 0.8, C 8, F 0.16
  // cucumber 60g: cal 9, P 0.42, C 2.16, F 0.06
  // => cal 141.4, P 6.02, C 18.56, F 6.22 => rounded: 141, 6, 19, 6
  {
    id: 'morning_snack_051',
    name: 'Houmous crudités',
    description: 'Houmous avec bâtonnets de carotte et concombre. Le combo frais et rassasiant pour le matin.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 60, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 60, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Coupe la carotte et le concombre en bâtonnets.',
      'Verse le houmous dans un bol.',
      'Trempe les crudités dans le houmous et déguste.',
    ],
    baseMacros: { calories: 141, protein: 6, carbs: 19, fat: 6 },
    tags: ['vegan', 'sans-gluten', 'frais', 'world', 'léger'],
  },

  // morning_snack_052: Pita chips houmous
  // pita_bread 40g: cal 110, P 3.6, C 22.4, F 0.4
  // hummus 60g: cal 99.6, P 4.8, C 8.4, F 6
  // => cal 209.6, P 8.4, C 30.8, F 6.4 => rounded: 210, 8, 31, 6
  {
    id: 'morning_snack_052',
    name: 'Pita chips houmous',
    description: 'Pain pita grillé avec du houmous. Le duo classique du Moyen-Orient, pratique et plein de saveurs.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'pita_bread', name: 'Pain pita', baseQuantityG: 40, unit: 'unit', roundTo: 1 },
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 60, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Coupe le pain pita en triangles et grille-les au four 5 min à 200°C.',
      'Verse le houmous dans un bol.',
      'Trempe les chips de pita dans le houmous.',
    ],
    baseMacros: { calories: 210, protein: 8, carbs: 31, fat: 6 },
    tags: ['world', 'moyen-orient', 'vegan', 'transportable'],
  },

  // ══════════════════════════════════════
  // ── VEGAN (4) ──
  // ══════════════════════════════════════

  // morning_snack_053: Chia pudding coco
  // chia_seeds 25g: cal 121.5, P 4.25, C 10.5, F 7.75
  // coconut_milk 100ml: cal 185, P 2, C 3, F 19
  // maple_syrup 10ml: cal 26, P 0, C 6.7, F 0
  // => cal 332.5, P 6.25, C 20.2, F 26.75 => rounded: 333, 6, 20, 27
  // Too high fat/cal - reduce coconut_milk to 75ml
  // coconut_milk 75ml: cal 138.75, P 1.5, C 2.25, F 14.25
  // => cal 286.25, P 5.75, C 19.45, F 22 => still high. Use oat_milk instead.
  // oat_milk 150ml: cal 69, P 1.5, C 10.5, F 2.25
  // chia_seeds 25g: cal 121.5, P 4.25, C 10.5, F 7.75
  // coconut_shredded 10g: cal 66, P 0.7, C 2.4, F 6.2
  // maple_syrup 10ml: cal 26, P 0, C 6.7, F 0
  // => cal 282.5, P 6.45, C 30.1, F 16.2 => rounded: 283, 6, 30, 16
  {
    id: 'morning_snack_053',
    name: 'Chia pudding coco',
    description: 'Pudding de graines de chia au lait d\'avoine et coco râpée. Prépare-le la veille, mange le matin.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 150, unit: 'ml', roundTo: 25 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'maple_syrup', name: 'Sirop d\'érable', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange les graines de chia avec le lait d\'avoine et le sirop d\'érable.',
      'Place au frigo toute la nuit (minimum 4h).',
      'Le matin, remue et parsème de noix de coco râpée.',
    ],
    baseMacros: { calories: 283, protein: 6, carbs: 30, fat: 16 },
    tags: ['vegan', 'sans-gluten', 'meal-prep', 'frais', 'coco'],
  },

  // morning_snack_054: Smoothie vegan green
  // banana 100g: cal 89, P 1.1, C 23, F 0.3
  // spinach 40g: cal 9.2, P 1.16, C 1.44, F 0.16
  // pea_protein 20g: cal 74, P 16, C 1, F 0.6
  // almond_milk 200ml: cal 30, P 1, C 0.6, F 2.2
  // => cal 202.2, P 19.26, C 26.04, F 3.26 => rounded: 202, 19, 26, 3
  {
    id: 'morning_snack_054',
    name: 'Smoothie vegan green',
    description: 'Smoothie vert 100% végétal : banane, épinards et protéine de pois. Le combo vegan qui envoie.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'spinach', name: 'Épinards frais', baseQuantityG: 40, unit: 'g', roundTo: 25 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'almond_milk', name: 'Lait d\'amande', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
    ],
    recipeSteps: [
      'Place les épinards et le lait d\'amande dans le blender.',
      'Ajoute la banane et la protéine de pois.',
      'Mixe 30 secondes et sers dans un grand verre.',
    ],
    baseMacros: { calories: 202, protein: 19, carbs: 26, fat: 3 },
    tags: ['vegan', 'sans-gluten', 'smoothie', 'vert', 'protéiné'],
  },

  // morning_snack_055: Edamame + fruits secs
  // edamame 80g: cal 97.6, P 8.8, C 8, F 4
  // dried_fruits 30g: cal 107.7, P 0.9, C 24.9, F 0.3
  // => cal 205.3, P 9.7, C 32.9, F 4.3 => rounded: 205, 10, 33, 4
  {
    id: 'morning_snack_055',
    name: 'Edamame + fruits secs',
    description: 'Edamame protéinés avec un mélange de fruits secs. Le trail mix version vegan et sans gluten.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'edamame', name: 'Edamame', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'dried_fruits', name: 'Fruits secs', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Fais cuire les edamame 3 min à l\'eau bouillante, puis égoutte.',
      'Mélange avec les fruits secs dans un bol ou un sachet.',
      'Déguste tiède ou froid, c\'est bon dans les deux cas.',
    ],
    baseMacros: { calories: 205, protein: 10, carbs: 33, fat: 4 },
    tags: ['vegan', 'sans-gluten', 'transportable', 'protéiné', 'énergie'],
  },

  // morning_snack_056: Granola lait avoine
  // granola 40g: cal 188.4, P 4, C 25.6, F 8
  // oat_milk 200ml: cal 92, P 2, C 14, F 3
  // banana 50g: cal 44.5, P 0.55, C 11.5, F 0.15
  // => cal 324.9, P 6.55, C 51.1, F 11.15 => rounded: 325, 7, 51, 11
  {
    id: 'morning_snack_056',
    name: 'Granola lait d\'avoine',
    description: 'Bol de granola avec lait d\'avoine et banane. Le petit bol vegan express qui cale pour la matinée.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'oat_milk', name: 'Lait d\'avoine', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 50, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le granola dans un bol.',
      'Ajoute le lait d\'avoine.',
      'Coupe la banane en rondelles par-dessus et déguste.',
    ],
    baseMacros: { calories: 325, protein: 7, carbs: 51, fat: 11 },
    tags: ['vegan', 'rapide', 'sucré', 'énergie'],
  },

  // ══════════════════════════════════════
  // ── LOW-CALORIE / SÈCHE (4) ──
  // ══════════════════════════════════════

  // morning_snack_057: Yaourt 0% cannelle
  // greek_yogurt_0 200g: cal 118, P 20, C 7.2, F 0.8
  // cinnamon 2g: cal 4.94, P 0.08, C 1.62, F 0.02
  // honey 5g: cal 15.2, P 0.015, C 4.1, F 0
  // => cal 138.14, P 20.095, C 12.92, F 0.82 => rounded: 138, 20, 13, 1
  {
    id: 'morning_snack_057',
    name: 'Yaourt 0% cannelle',
    description: 'Yaourt grec 0% saupoudré de cannelle et un soupçon de miel. Ultra-léger, ultra-protéiné, parfait en sèche.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 1,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Saupoudre de cannelle et ajoute le miel.',
      'Mélange et déguste. C\'est tout.',
    ],
    baseMacros: { calories: 138, protein: 20, carbs: 13, fat: 1 },
    tags: ['sèche', 'léger', 'sans-gluten', 'protéiné', 'rapide'],
  },

  // morning_snack_058: Crudités houmous light
  // hummus 40g: cal 66.4, P 3.2, C 5.6, F 4
  // carrot 60g: cal 24.6, P 0.6, C 6, F 0.12
  // cucumber 80g: cal 12, P 0.56, C 2.88, F 0.08
  // bell_pepper 60g: cal 15.6, P 0.6, C 3.6, F 0.18
  // => cal 118.6, P 4.96, C 18.08, F 4.38 => rounded: 119, 5, 18, 4
  {
    id: 'morning_snack_058',
    name: 'Crudités houmous light',
    description: 'Assortiment de crudités avec une portion raisonnable de houmous. Peu calorique et ultra-frais.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'hummus', name: 'Houmous', baseQuantityG: 40, unit: 'g', roundTo: 10 },
      { ingredientId: 'carrot', name: 'Carotte', baseQuantityG: 60, unit: 'g', roundTo: 25 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'bell_pepper', name: 'Poivron', baseQuantityG: 60, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Coupe la carotte, le concombre et le poivron en bâtonnets.',
      'Verse le houmous dans un petit bol.',
      'Trempe les crudités et déguste tranquillement.',
    ],
    baseMacros: { calories: 119, protein: 5, carbs: 18, fat: 4 },
    tags: ['sèche', 'vegan', 'sans-gluten', 'frais', 'léger'],
  },

  // morning_snack_059: Cottage cheese concombre
  // cottage_cheese 150g: cal 147, P 16.5, C 5.1, F 6.45
  // cucumber 100g: cal 15, P 0.7, C 3.6, F 0.1
  // => cal 162, P 17.2, C 8.7, F 6.55 => rounded: 162, 17, 9, 7
  {
    id: 'morning_snack_059',
    name: 'Cottage cheese concombre',
    description: 'Cottage cheese avec du concombre croquant. Ultra-frais, faible en calories et riche en protéines.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'cucumber', name: 'Concombre', baseQuantityG: 100, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Coupe le concombre en rondelles ou en bâtonnets.',
      'Verse le cottage cheese dans un bol.',
      'Mange le concombre avec le cottage cheese, sel et poivre.',
    ],
    baseMacros: { calories: 162, protein: 17, carbs: 9, fat: 7 },
    tags: ['sèche', 'léger', 'sans-gluten', 'protéiné', 'frais'],
  },

  // morning_snack_060: Skyr nature fruits rouges
  // skyr 200g: cal 126, P 22, C 8, F 0.4
  // mixed_berries 80g: cal 36, P 0.64, C 8, F 0.24
  // => cal 162, P 22.64, C 16, F 0.64 => rounded: 162, 23, 16, 1
  {
    id: 'morning_snack_060',
    name: 'Skyr nature fruits rouges',
    description: 'Skyr nature avec des fruits rouges. Le snack sèche ultime : max protéines, min calories.',
    slot: 'morning_snack',
    photoUrl: '',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'mixed_berries', name: 'Fruits rouges', baseQuantityG: 80, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute les fruits rouges par-dessus.',
      'Déguste immédiatement, c\'est prêt.',
    ],
    baseMacros: { calories: 162, protein: 23, carbs: 16, fat: 1 },
    tags: ['sèche', 'léger', 'sans-gluten', 'hyperprotéiné', 'frais'],
  },
];
