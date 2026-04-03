import type { Meal } from '../../types/meal';

export const BEDTIME_SNACKS_EXTRA: Meal[] = [
  // ══════════════════════════════════════════════════
  // ── CASEIN-BASED (bedtime_021 – bedtime_030) ──
  // ══════════════════════════════════════════════════

  // bedtime_021 – Fromage blanc cannelle
  // fromage_blanc_0 250g: cal=120, p=20, c=9.5, f=0.25
  // cinnamon 3g: cal=7.41, p=0.12, c=2.43, f=0.03
  // Total: cal=127, p=20, c=12, f=0
  {
    id: 'bedtime_021',
    name: 'Fromage blanc cannelle',
    description: 'Un classique du coucher : fromage blanc 0% saupoudré de cannelle. Caséine naturelle, zéro prise de tête.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 1,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 250, unit: 'g', roundTo: 25 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 3, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Saupoudre de cannelle et mélange.',
      'Déguste tranquillement avant d\'aller dormir.',
    ],
    baseMacros: { calories: 127, protein: 20, carbs: 12, fat: 0 },
    tags: ['caséine', 'ultra-rapide', 'sèche', 'minimaliste'],
  },

  // bedtime_022 – Cottage cheese miel noix
  // cottage_cheese 200g: cal=196, p=22, c=6.8, f=8.6
  // honey 10g: cal=30.4, p=0.03, c=8.2, f=0
  // walnuts 15g: cal=98.1, p=2.25, c=2.1, f=9.75
  // Total: cal=325, p=24, c=17, f=18 → too high, reduce walnuts to 10g
  // walnuts 10g: cal=65.4, p=1.5, c=1.4, f=6.5
  // Total: cal=292, p=24, c=16, f=15
  {
    id: 'bedtime_022',
    name: 'Cottage cheese miel noix',
    description: 'Cottage cheese avec un filet de miel et des noix concassées. Le trio parfait pour nourrir tes muscles toute la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le cottage cheese dans un bol.',
      'Ajoute le filet de miel et les noix concassées.',
      'Mélange légèrement et régale-toi.',
    ],
    baseMacros: { calories: 292, protein: 24, carbs: 16, fat: 15 },
    tags: ['caséine', 'gourmand', 'récupération', 'oméga-3'],
  },

  // bedtime_023 – Fromage blanc PB choco
  // fromage_blanc_0 200g: cal=96, p=16, c=7.6, f=0.2
  // peanut_butter 15g: cal=88.2, p=3.75, c=3, f=7.5
  // cocoa_powder 5g: cal=11.4, p=1, c=2.9, f=0.7
  // Total: cal=196, p=21, c=14, f=8
  {
    id: 'bedtime_023',
    name: 'Fromage blanc PB choco',
    description: 'Fromage blanc 0% mélangé avec du beurre de cacahuète et du cacao. Un dessert protéiné qui claque avant dodo.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Ajoute le beurre de cacahuète et le cacao en poudre.',
      'Mélange bien jusqu\'à obtenir une texture homogène.',
      'Déguste comme un dessert protéiné.',
    ],
    baseMacros: { calories: 196, protein: 21, carbs: 14, fat: 8 },
    tags: ['caséine', 'gourmand', 'chocolat', 'protéiné'],
  },

  // bedtime_024 – Caséine bowl fruits rouges
  // casein_protein 30g: cal=111, p=22.5, c=1.5, f=1.2
  // fromage_blanc_0 150g: cal=72, p=12, c=5.7, f=0.15
  // mixed_berries 50g: cal=22.5, p=0.4, c=5, f=0.15
  // Total: cal=206, p=35, c=12, f=2
  {
    id: 'bedtime_024',
    name: 'Caséine bowl fruits rouges',
    description: 'Bowl de fromage blanc enrichi à la caséine avec des fruits rouges. Double dose de protéines lentes pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'mixed_berries', name: 'Fruits rouges (mélange)', baseQuantityG: 50, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélange la caséine dans le fromage blanc jusqu\'à consistance lisse.',
      'Ajoute les fruits rouges par-dessus.',
      'Déguste à la cuillère, tranquille.',
    ],
    baseMacros: { calories: 206, protein: 35, carbs: 12, fat: 2 },
    tags: ['caséine', 'protéiné', 'fruits', 'récupération'],
  },

  // bedtime_025 – Fromage blanc granola
  // fromage_blanc_0 200g: cal=96, p=16, c=7.6, f=0.2
  // granola 20g: cal=94.2, p=2, c=12.8, f=4
  // Total: cal=190, p=18, c=20, f=4
  {
    id: 'bedtime_025',
    name: 'Fromage blanc granola',
    description: 'Fromage blanc 0% avec une touche de granola croustillant. Le croquant qui rend le bedtime snack plus fun.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Parsème le granola par-dessus.',
      'Mange direct, sans attendre que le granola ramollisse.',
    ],
    baseMacros: { calories: 190, protein: 18, carbs: 20, fat: 4 },
    tags: ['caséine', 'croustillant', 'gourmand', 'rapide'],
  },

  // bedtime_026 – Cottage cheese banane
  // cottage_cheese 200g: cal=196, p=22, c=6.8, f=8.6
  // banana 75g: cal=66.75, p=0.825, c=17.25, f=0.225
  // Total: cal=263, p=23, c=24, f=9
  {
    id: 'bedtime_026',
    name: 'Cottage cheese banane',
    description: 'Cottage cheese avec de la banane écrasée. Simple, efficace, et les glucides de la banane boostent le sommeil.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le cottage cheese dans un bol.',
      'Coupe la banane en rondelles et ajoute-les.',
      'Mélange ou laisse en morceaux selon ta préférence.',
    ],
    baseMacros: { calories: 263, protein: 23, carbs: 24, fat: 9 },
    tags: ['caséine', 'glucides-lents', 'sommeil', 'rapide'],
  },

  // bedtime_027 – Skyr miel amandes
  // skyr 200g: cal=126, p=22, c=8, f=0.4
  // honey 10g: cal=30.4, p=0.03, c=8.2, f=0
  // almonds 10g: cal=57.8, p=2.1, c=2.2, f=4.9
  // Total: cal=214, p=24, c=18, f=5
  {
    id: 'bedtime_027',
    name: 'Skyr miel amandes',
    description: 'Skyr onctueux avec un filet de miel et des amandes effilées. Protéines lentes et bons lipides pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute le miel et les amandes effilées.',
      'Mélange et déguste.',
    ],
    baseMacros: { calories: 214, protein: 24, carbs: 18, fat: 5 },
    tags: ['caséine', 'gourmand', 'oméga-3', 'rapide'],
  },

  // bedtime_028 – Fromage blanc dattes
  // fromage_blanc_0 200g: cal=96, p=16, c=7.6, f=0.2
  // dates 20g: cal=55.4, p=0.36, c=15, f=0.04
  // Total: cal=151, p=16, c=23, f=0
  {
    id: 'bedtime_028',
    name: 'Fromage blanc dattes',
    description: 'Fromage blanc 0% avec des morceaux de dattes. Le sucre naturel des dattes booste la sérotonine pour mieux dormir.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'dates', name: 'Dattes (dénoyautées)', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Coupe les dattes en petits morceaux et mélange-les dedans.',
      'Déguste lentement pour profiter du goût sucré.',
    ],
    baseMacros: { calories: 151, protein: 16, carbs: 23, fat: 0 },
    tags: ['caséine', 'sucré', 'sommeil', 'sèche'],
  },

  // bedtime_029 – Caséine pudding
  // casein_protein 30g: cal=111, p=22.5, c=1.5, f=1.2
  // milk_semi 150ml: cal=69, p=4.8, c=7.2, f=2.25
  // cocoa_powder 5g: cal=11.4, p=1, c=2.9, f=0.7
  // Total: cal=191, p=28, c=12, f=4
  {
    id: 'bedtime_029',
    name: 'Caséine pudding',
    description: 'Mélange caséine + lait + cacao et laisse épaissir au frigo. Un pudding protéiné qui se mange comme un dessert.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange la caséine, le lait et le cacao dans un bol.',
      'Fouette bien pour éviter les grumeaux.',
      'Place au frigo 10-15 min pour que ça épaississe.',
      'Déguste à la cuillère comme un vrai pudding.',
    ],
    baseMacros: { calories: 191, protein: 28, carbs: 12, fat: 4 },
    tags: ['caséine', 'pudding', 'chocolat', 'protéiné'],
  },

  // bedtime_030 – Cottage cheese pomme cannelle
  // cottage_cheese 200g: cal=196, p=22, c=6.8, f=8.6
  // apple 100g: cal=52, p=0.3, c=14, f=0.2
  // cinnamon 2g: cal=4.94, p=0.08, c=1.62, f=0.02
  // Total: cal=253, p=22, c=22, f=9
  {
    id: 'bedtime_030',
    name: 'Cottage cheese pomme cannelle',
    description: 'Cottage cheese avec des dés de pomme et un nuage de cannelle. L\'ambiance tarte aux pommes version muscu.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'apple', name: 'Pomme', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Coupe la pomme en petits dés.',
      'Verse le cottage cheese dans un bol et ajoute les dés de pomme.',
      'Saupoudre de cannelle et mélange.',
    ],
    baseMacros: { calories: 253, protein: 22, carbs: 22, fat: 9 },
    tags: ['caséine', 'fruité', 'gourmand', 'rapide'],
  },

  // ══════════════════════════════════════════════════
  // ── SKYR / YOGURT VARIATIONS (bedtime_031 – bedtime_038) ──
  // ══════════════════════════════════════════════════

  // bedtime_031 – Skyr fruits secs
  // skyr 200g: cal=126, p=22, c=8, f=0.4
  // dried_fruits 20g: cal=71.8, p=0.6, c=16.6, f=0.2
  // Total: cal=198, p=23, c=25, f=1
  {
    id: 'bedtime_031',
    name: 'Skyr fruits secs',
    description: 'Skyr nature avec un mélange de fruits secs. Les sucres lents des fruits secs accompagnent tes protéines toute la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'dried_fruits', name: 'Fruits secs (mélange)', baseQuantityG: 20, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute les fruits secs par-dessus.',
      'Mélange et déguste.',
    ],
    baseMacros: { calories: 198, protein: 23, carbs: 25, fat: 1 },
    tags: ['caséine', 'fruits-secs', 'rapide', 'récupération'],
  },

  // bedtime_032 – Yaourt grec granola
  // greek_yogurt_0 200g: cal=118, p=20, c=7.2, f=0.8
  // granola 25g: cal=117.75, p=2.5, c=16, f=5
  // Total: cal=236, p=23, c=23, f=6
  {
    id: 'bedtime_032',
    name: 'Yaourt grec granola',
    description: 'Yaourt grec 0% avec une poignée de granola croustillant. Le crunch qui fait la différence avant dodo.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/800px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 25, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Parsème le granola par-dessus.',
      'Déguste de suite pour garder le croustillant.',
    ],
    baseMacros: { calories: 236, protein: 23, carbs: 23, fat: 6 },
    tags: ['caséine', 'croustillant', 'gourmand', 'rapide'],
  },

  // bedtime_033 – Skyr PB banane
  // skyr 200g: cal=126, p=22, c=8, f=0.4
  // peanut_butter 10g: cal=58.8, p=2.5, c=2, f=5
  // banana 50g: cal=44.5, p=0.55, c=11.5, f=0.15
  // Total: cal=229, p=25, c=22, f=6
  {
    id: 'bedtime_033',
    name: 'Skyr PB banane',
    description: 'Skyr avec beurre de cacahuète et rondelles de banane. Le combo sucré-salé parfait pour la récup nocturne.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'peanut_butter', name: 'Beurre de cacahuète', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 50, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute le beurre de cacahuète et mélange.',
      'Coupe la banane en rondelles et dispose-les sur le dessus.',
    ],
    baseMacros: { calories: 229, protein: 25, carbs: 22, fat: 6 },
    tags: ['caséine', 'gourmand', 'protéiné', 'prise-de-masse'],
  },

  // bedtime_034 – Yaourt grec miel noix
  // greek_yogurt_0 200g: cal=118, p=20, c=7.2, f=0.8
  // honey 10g: cal=30.4, p=0.03, c=8.2, f=0
  // walnuts 10g: cal=65.4, p=1.5, c=1.4, f=6.5
  // Total: cal=214, p=22, c=17, f=7
  {
    id: 'bedtime_034',
    name: 'Yaourt grec miel noix',
    description: 'Yaourt grec 0% avec miel et noix. Un classique méditerranéen version nuit pour tes muscles.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/800px-Joghurt.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'walnuts', name: 'Noix', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Arrose de miel et ajoute les noix concassées.',
      'Déguste lentement.',
    ],
    baseMacros: { calories: 214, protein: 22, carbs: 17, fat: 7 },
    tags: ['caséine', 'méditerranéen', 'gourmand', 'oméga-3'],
  },

  // bedtime_035 – Skyr chocolat
  // skyr 200g: cal=126, p=22, c=8, f=0.4
  // cocoa_powder 8g: cal=18.24, p=1.6, c=4.64, f=1.12
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=159, p=24, c=17, f=2
  {
    id: 'bedtime_035',
    name: 'Skyr chocolat',
    description: 'Skyr mélangé avec du cacao pur et une touche de miel. Gourmandise chocolatée sans culpabiliser.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute le cacao en poudre et le miel.',
      'Mélange bien jusqu\'à obtenir une couleur uniforme.',
    ],
    baseMacros: { calories: 159, protein: 24, carbs: 17, fat: 2 },
    tags: ['caséine', 'chocolat', 'sèche', 'rapide'],
  },

  // bedtime_036 – Yaourt grec coco
  // greek_yogurt_0 200g: cal=118, p=20, c=7.2, f=0.8
  // coconut_shredded 10g: cal=66, p=0.7, c=2.4, f=6.2
  // Total: cal=184, p=21, c=10, f=7
  {
    id: 'bedtime_036',
    name: 'Yaourt grec coco',
    description: 'Yaourt grec 0% saupoudré de noix de coco râpée. Un petit air tropical pour s\'endormir serein.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/800px-Joghurt.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'coconut_shredded', name: 'Noix de coco râpée', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Parsème de noix de coco râpée.',
      'Mélange et déguste.',
    ],
    baseMacros: { calories: 184, protein: 21, carbs: 10, fat: 7 },
    tags: ['caséine', 'exotique', 'rapide', 'léger'],
  },

  // bedtime_037 – Skyr framboise
  // skyr 200g: cal=126, p=22, c=8, f=0.4
  // raspberry 75g: cal=39, p=0.75, c=9, f=0.525
  // Total: cal=165, p=23, c=17, f=1
  {
    id: 'bedtime_037',
    name: 'Skyr framboise',
    description: 'Skyr nature avec des framboises fraîches. Léger, frais et bourré de protéines pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'skyr', name: 'Skyr nature', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'raspberry', name: 'Framboises', baseQuantityG: 75, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le skyr dans un bol.',
      'Ajoute les framboises sur le dessus.',
      'Écrase quelques framboises pour un effet coulis.',
    ],
    baseMacros: { calories: 165, protein: 23, carbs: 17, fat: 1 },
    tags: ['caséine', 'fruité', 'sèche', 'antioxydants'],
  },

  // bedtime_038 – Yaourt grec pistache (using cashews as closest available)
  // greek_yogurt_0 200g: cal=118, p=20, c=7.2, f=0.8
  // cashews 15g: cal=82.95, p=2.7, c=4.5, f=6.6
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=216, p=23, c=16, f=7
  {
    id: 'bedtime_038',
    name: 'Yaourt grec noix de cajou',
    description: 'Yaourt grec 0% garni de noix de cajou concassées et d\'un trait de miel. Craquant et protéiné.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/800px-Joghurt.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cashews', name: 'Noix de cajou', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Concasse les noix de cajou et parsème-les dessus.',
      'Ajoute le filet de miel et déguste.',
    ],
    baseMacros: { calories: 216, protein: 23, carbs: 16, fat: 7 },
    tags: ['caséine', 'croustillant', 'gourmand', 'rapide'],
  },

  // ══════════════════════════════════════════════════
  // ── WARM BEVERAGES (bedtime_039 – bedtime_044) ──
  // ══════════════════════════════════════════════════

  // bedtime_039 – Golden milk protéiné
  // milk_semi 250ml: cal=115, p=8, c=12, f=3.75
  // casein_protein 25g: cal=92.5, p=18.75, c=1.25, f=1
  // ginger_fresh 5g: cal=4, p=0.1, c=0.9, f=0.04
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=227, p=27, c=18, f=5
  {
    id: 'bedtime_039',
    name: 'Golden milk protéiné',
    description: 'Lait chaud doré au gingembre et miel, enrichi en caséine. Le rituel du soir anti-inflammatoire et protéiné.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Turmeric_inflorescence.jpg/800px-Turmeric_inflorescence.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'ginger_fresh', name: 'Gingembre frais', baseQuantityG: 5, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le lait avec le gingembre râpé à feu doux.',
      'Retire du feu, laisse tiédir 2 min.',
      'Ajoute la caséine et le miel, mélange bien.',
      'Bois chaud, 20 min avant de te coucher.',
    ],
    baseMacros: { calories: 227, protein: 27, carbs: 18, fat: 5 },
    tags: ['caséine', 'chaud', 'anti-inflammatoire', 'récupération'],
  },

  // bedtime_040 – Chocolat chaud caséine
  // milk_semi 250ml: cal=115, p=8, c=12, f=3.75
  // casein_protein 25g: cal=92.5, p=18.75, c=1.25, f=1
  // cocoa_powder 8g: cal=18.24, p=1.6, c=4.64, f=1.12
  // Total: cal=226, p=28, c=18, f=6
  {
    id: 'bedtime_040',
    name: 'Chocolat chaud caséine',
    description: 'Un vrai chocolat chaud enrichi en caséine. Le réconfort ultime avant de te glisser sous la couette.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le lait dans une casserole à feu doux.',
      'Retire du feu et laisse tiédir 2 min.',
      'Ajoute la caséine et le cacao, fouette bien.',
      'Bois chaud avant le coucher.',
    ],
    baseMacros: { calories: 226, protein: 28, carbs: 18, fat: 6 },
    tags: ['caséine', 'chaud', 'chocolat', 'réconfort'],
  },

  // bedtime_041 – Lait chaud miel caséine
  // milk_semi 250ml: cal=115, p=8, c=12, f=3.75
  // casein_protein 25g: cal=92.5, p=18.75, c=1.25, f=1
  // honey 10g: cal=30.4, p=0.03, c=8.2, f=0
  // Total: cal=238, p=27, c=21, f=5
  {
    id: 'bedtime_041',
    name: 'Lait chaud miel caséine',
    description: 'Le classique lait chaud miel, boosté à la caséine. Douceur + protéines lentes = la combo du dodo parfait.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le lait à feu doux.',
      'Retire du feu, laisse tiédir.',
      'Ajoute la caséine et le miel, mélange bien.',
      'Bois lentement avant de dormir.',
    ],
    baseMacros: { calories: 238, protein: 27, carbs: 21, fat: 5 },
    tags: ['caséine', 'chaud', 'classique', 'sommeil'],
  },

  // bedtime_042 – Matcha latte protéiné (using milk + casein, matcha flavor via description)
  // milk_semi 250ml: cal=115, p=8, c=12, f=3.75
  // casein_protein 25g: cal=92.5, p=18.75, c=1.25, f=1
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=223, p=27, c=17, f=5
  {
    id: 'bedtime_042',
    name: 'Latte protéiné douceur',
    description: 'Lait chaud doux et onctueux avec de la caséine et un soupçon de miel. Simplicité et efficacité pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg/800px-After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le lait à feu doux sans le faire bouillir.',
      'Retire du feu, ajoute la caséine et le miel.',
      'Fouette bien pour une texture onctueuse.',
    ],
    baseMacros: { calories: 223, protein: 27, carbs: 17, fat: 5 },
    tags: ['caséine', 'chaud', 'onctueux', 'rapide'],
  },

  // bedtime_043 – Tisane lait protéiné
  // milk_semi 200ml: cal=92, p=6.4, c=9.6, f=3
  // casein_protein 25g: cal=92.5, p=18.75, c=1.25, f=1
  // cinnamon 2g: cal=4.94, p=0.08, c=1.62, f=0.02
  // Total: cal=189, p=25, c=12, f=4
  {
    id: 'bedtime_043',
    name: 'Tisane lait protéiné',
    description: 'Lait chaud à la cannelle avec de la caséine. Comme une tisane, mais avec des protéines en plus.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg/800px-After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 4,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Fais chauffer le lait avec la cannelle à feu doux.',
      'Retire du feu, laisse tiédir 2 min.',
      'Ajoute la caséine et mélange au fouet.',
      'Bois bien chaud.',
    ],
    baseMacros: { calories: 189, protein: 25, carbs: 12, fat: 4 },
    tags: ['caséine', 'chaud', 'cannelle', 'sommeil'],
  },

  // bedtime_044 – Moon milk protéiné
  // milk_semi 250ml: cal=115, p=8, c=12, f=3.75
  // casein_protein 20g: cal=74, p=15, c=1, f=0.8
  // honey 10g: cal=30.4, p=0.03, c=8.2, f=0
  // cinnamon 2g: cal=4.94, p=0.08, c=1.62, f=0.02
  // Total: cal=224, p=23, c=23, f=5
  {
    id: 'bedtime_044',
    name: 'Moon milk protéiné',
    description: 'Le fameux moon milk version muscu : lait chaud, miel, cannelle et caséine. Ton rituel de nuit ultime.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Turmeric_inflorescence.jpg/800px-Turmeric_inflorescence.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Fais chauffer le lait avec la cannelle à feu doux.',
      'Retire du feu et laisse tiédir.',
      'Ajoute la caséine et le miel, fouette bien.',
      'Bois tranquille en mode relaxation.',
    ],
    baseMacros: { calories: 224, protein: 23, carbs: 23, fat: 5 },
    tags: ['caséine', 'chaud', 'moon-milk', 'rituels'],
  },

  // ══════════════════════════════════════════════════
  // ── LIGHT BOWLS (bedtime_045 – bedtime_050) ──
  // ══════════════════════════════════════════════════

  // bedtime_045 – Chia pudding nuit
  // chia_seeds 20g: cal=97.2, p=3.4, c=8.4, f=6.2
  // milk_semi 150ml: cal=69, p=4.8, c=7.2, f=2.25
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=181, p=8, c=20, f=8
  // → need more protein, add casein 15g: cal=55.5, p=11.25, c=0.75, f=0.6
  // Total: cal=237, p=19, c=20, f=9
  {
    id: 'bedtime_045',
    name: 'Chia pudding nuit',
    description: 'Graines de chia dans du lait avec un peu de caséine. Prépare-le le matin, mange-le le soir. Easy.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Seed_of_chia_%28Salvia_hispanica%29Salvia_hispanica_group.jpg/800px-Seed_of_chia_%28Salvia_hispanica%29Salvia_hispanica_group.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 150, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange les graines de chia, le lait, la caséine et le miel.',
      'Place au frigo pendant au moins 4 heures (ou toute la journée).',
      'Remue et déguste le soir venu.',
    ],
    baseMacros: { calories: 237, protein: 19, carbs: 20, fat: 9 },
    tags: ['chia', 'pudding', 'prép-avance', 'oméga-3'],
  },

  // bedtime_046 – Porridge froid caséine
  // oats 30g: cal=113.7, p=4.05, c=20.1, f=1.95
  // milk_semi 100ml: cal=46, p=3.2, c=4.8, f=1.5
  // casein_protein 20g: cal=74, p=15, c=1, f=0.8
  // Total: cal=234, p=22, c=26, f=4
  {
    id: 'bedtime_046',
    name: 'Porridge froid caséine',
    description: 'Flocons d\'avoine trempés dans du lait froid avec de la caséine. Prêt en avance, parfait pour le soir.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Oatmeal_%281%29.jpg/800px-Oatmeal_%281%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 100, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange les flocons, le lait et la caséine dans un bol.',
      'Place au frigo pendant au moins 2 heures.',
      'Sors et déguste froid le soir.',
    ],
    baseMacros: { calories: 234, protein: 22, carbs: 26, fat: 4 },
    tags: ['avoine', 'prép-avance', 'caséine', 'glucides-lents'],
  },

  // bedtime_047 – Overnight oats caséine
  // oats 30g: cal=113.7, p=4.05, c=20.1, f=1.95
  // greek_yogurt_0 100g: cal=59, p=10, c=3.6, f=0.4
  // casein_protein 15g: cal=55.5, p=11.25, c=0.75, f=0.6
  // blueberries 30g: cal=17.1, p=0.21, c=4.2, f=0.09
  // Total: cal=245, p=26, c=29, f=3
  {
    id: 'bedtime_047',
    name: 'Overnight oats caséine',
    description: 'Overnight oats au yaourt grec et caséine avec des myrtilles. Tu prépares le matin, tu manges le soir.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Dorset_Cereals_muesli.jpg/800px-Dorset_Cereals_muesli.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'oats', name: 'Flocons d\'avoine', baseQuantityG: 30, unit: 'g', roundTo: 5 },
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 100, unit: 'g', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'blueberries', name: 'Myrtilles', baseQuantityG: 30, unit: 'g', roundTo: 10 },
    ],
    recipeSteps: [
      'Mélange les flocons, le yaourt grec et la caséine dans un pot.',
      'Place au frigo toute la journée.',
      'Le soir, ajoute les myrtilles et déguste.',
    ],
    baseMacros: { calories: 245, protein: 26, carbs: 29, fat: 3 },
    tags: ['overnight', 'prép-avance', 'caséine', 'myrtilles'],
  },

  // bedtime_048 – Bowl avocat cottage
  // cottage_cheese 150g: cal=147, p=16.5, c=5.1, f=6.45
  // avocado 50g: cal=80, p=1, c=4.25, f=7.5
  // Total: cal=227, protein=18, c=9, f=14
  {
    id: 'bedtime_048',
    name: 'Bowl avocat cottage',
    description: 'Cottage cheese avec de l\'avocat écrasé. Un combo salé et crémeux, blindé en bons lipides pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cottagecheese200px.jpg/800px-Cottagecheese200px.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'avocado', name: 'Avocat', baseQuantityG: 50, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le cottage cheese dans un bol.',
      'Écrase l\'avocat et dispose-le à côté.',
      'Mélange ou mange séparément, comme tu veux.',
    ],
    baseMacros: { calories: 227, protein: 18, carbs: 9, fat: 14 },
    tags: ['caséine', 'salé', 'bons-lipides', 'keto-friendly'],
  },

  // bedtime_049 – Mini granola bowl
  // greek_yogurt_0 150g: cal=88.5, p=15, c=5.4, f=0.6
  // granola 20g: cal=94.2, p=2, c=12.8, f=4
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=198, p=17, c=22, f=5
  {
    id: 'bedtime_049',
    name: 'Mini granola bowl',
    description: 'Un petit bowl de yaourt grec avec du granola et du miel. Juste ce qu\'il faut pour finir la journée.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/800px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg',
    budget: 'eco',
    restrictions: ['vegetarian', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 20, unit: 'g', roundTo: 10 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un petit bol.',
      'Ajoute le granola et le filet de miel.',
      'Déguste immédiatement.',
    ],
    baseMacros: { calories: 198, protein: 17, carbs: 22, fat: 5 },
    tags: ['yaourt', 'granola', 'rapide', 'léger'],
  },

  // bedtime_050 – Pudding riz protéiné
  // white_rice 80g (cuit): cal=104, p=2.16, c=22.4, f=0.24
  // milk_semi 100ml: cal=46, p=3.2, c=4.8, f=1.5
  // casein_protein 20g: cal=74, p=15, c=1, f=0.8
  // cinnamon 2g: cal=4.94, p=0.08, c=1.62, f=0.02
  // Total: cal=229, p=20, c=30, f=3
  {
    id: 'bedtime_050',
    name: 'Pudding riz protéiné',
    description: 'Riz au lait version muscu avec de la caséine et de la cannelle. Réconfortant et protéiné pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kheer_with_condensed_milk..JPG/800px-Kheer_with_condensed_milk..JPG',
    budget: 'eco',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 2,
    ingredients: [
      { ingredientId: 'white_rice', name: 'Riz blanc (cuit)', baseQuantityG: 80, unit: 'g', roundTo: 25 },
      { ingredientId: 'milk_semi', name: 'Lait demi-écrémé', baseQuantityG: 100, unit: 'ml', roundTo: 25 },
      { ingredientId: 'casein_protein', name: 'Caséine', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'cinnamon', name: 'Cannelle', baseQuantityG: 2, unit: 'g', roundTo: 1 },
    ],
    recipeSteps: [
      'Fais chauffer le riz cuit dans le lait à feu doux.',
      'Retire du feu, laisse tiédir.',
      'Incorpore la caséine et la cannelle, mélange bien.',
      'Déguste tiède ou froid.',
    ],
    baseMacros: { calories: 229, protein: 20, carbs: 30, fat: 3 },
    tags: ['riz-au-lait', 'réconfortant', 'caséine', 'glucides-lents'],
  },

  // ══════════════════════════════════════════════════
  // ── NUT / SEED FOCUSED (bedtime_051 – bedtime_054) ──
  // ══════════════════════════════════════════════════

  // bedtime_051 – Mélange oléagineux chocolat
  // almonds 15g: cal=86.7, p=3.15, c=3.3, f=7.35
  // cashews 10g: cal=55.3, p=1.8, c=3, f=4.4
  // dark_chocolate 10g: cal=54, p=0.8, c=3.4, f=4.1
  // Total: cal=196, p=6, c=10, f=16 → need more protein, add cottage
  // cottage_cheese 100g: cal=98, p=11, c=3.4, f=4.3
  // Total: cal=294, p=17, c=13, f=20
  {
    id: 'bedtime_051',
    name: 'Mélange oléagineux chocolat',
    description: 'Un mélange d\'amandes, noix de cajou et chocolat noir avec du cottage cheese. Les bons lipides avant dodo.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg/800px-2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'cashews', name: 'Noix de cajou', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'dark_chocolate', name: 'Chocolat noir 70%', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'cottage_cheese', name: 'Cottage cheese', baseQuantityG: 100, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Concasse grossièrement les amandes et les noix de cajou.',
      'Casse le chocolat noir en petits morceaux.',
      'Verse le cottage cheese dans un bol et parsème le tout dessus.',
    ],
    baseMacros: { calories: 294, protein: 17, carbs: 13, fat: 20 },
    tags: ['oléagineux', 'chocolat', 'bons-lipides', 'gourmand'],
  },

  // bedtime_052 – Tahini bowl
  // greek_yogurt_0 200g: cal=118, p=20, c=7.2, f=0.8
  // tahini 10g: cal=59.5, p=1.7, c=2.2, f=5.4
  // honey 5g: cal=15.2, p=0.015, c=4.1, f=0
  // Total: cal=193, p=22, c=14, f=6
  {
    id: 'bedtime_052',
    name: 'Tahini bowl',
    description: 'Yaourt grec 0% avec du tahini et un filet de miel. Le goût du sésame qui change tout.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/BuddhaBowlLot.jpg/800px-BuddhaBowlLot.jpg',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'greek_yogurt_0', name: 'Yaourt grec 0%', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'tahini', name: 'Tahini', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'honey', name: 'Miel', baseQuantityG: 5, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Verse le yaourt grec dans un bol.',
      'Ajoute le tahini en filet et le miel.',
      'Mélange pour un effet marbré et déguste.',
    ],
    baseMacros: { calories: 193, protein: 22, carbs: 14, fat: 6 },
    tags: ['tahini', 'sésame', 'caséine', 'original'],
  },

  // bedtime_053 – Trail mix protéiné
  // almonds 10g: cal=57.8, p=2.1, c=2.2, f=4.9
  // pumpkin_seeds 10g: cal=55.9, p=3, c=1.1, f=4.9
  // dark_chocolate 10g: cal=54, p=0.8, c=3.4, f=4.1
  // fromage_blanc_0 150g: cal=72, p=12, c=5.7, f=0.15
  // Total: cal=240, p=18, c=12, f=14
  {
    id: 'bedtime_053',
    name: 'Trail mix protéiné',
    description: 'Un trail mix amandes, graines de courge et chocolat noir avec du fromage blanc. Ton snack randonneur du soir.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg/800px-2021-05-15_04_45_03_A_sample_of_Kirkland_Trail_Mix_in_the_Dulles_section_of_Sterling%2C_Loudoun_County%2C_Virginia.jpg',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almonds', name: 'Amandes', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'pumpkin_seeds', name: 'Graines de courge', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'dark_chocolate', name: 'Chocolat noir 70%', baseQuantityG: 10, unit: 'g', roundTo: 5 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Concasse les amandes et les graines de courge.',
      'Casse le chocolat et parsème le tout sur le fromage blanc.',
    ],
    baseMacros: { calories: 240, protein: 18, carbs: 12, fat: 14 },
    tags: ['trail-mix', 'oléagineux', 'chocolat', 'gourmand'],
  },

  // bedtime_054 – Beurre amande dattes
  // almond_butter 15g: cal=92.1, p=3.15, c=1.8, f=8.4
  // dates 25g: cal=69.25, p=0.45, c=18.75, f=0.05
  // fromage_blanc_0 150g: cal=72, p=12, c=5.7, f=0.15
  // Total: cal=233, p=16, c=26, f=9
  {
    id: 'bedtime_054',
    name: 'Beurre amande dattes',
    description: 'Fromage blanc avec purée d\'amande et dattes. Le sucré-gras parfait pour une nuit de récupération.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/800px-Dates005.jpg',
    budget: 'premium',
    restrictions: ['vegetarian', 'gluten_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almond_butter', name: 'Purée d\'amande', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'dates', name: 'Dattes (dénoyautées)', baseQuantityG: 25, unit: 'g', roundTo: 10 },
      { ingredientId: 'fromage_blanc_0', name: 'Fromage blanc 0%', baseQuantityG: 150, unit: 'g', roundTo: 25 },
    ],
    recipeSteps: [
      'Verse le fromage blanc dans un bol.',
      'Ajoute la purée d\'amande et mélange.',
      'Coupe les dattes en morceaux et parsème-les dessus.',
    ],
    baseMacros: { calories: 233, protein: 16, carbs: 26, fat: 9 },
    tags: ['purée-amande', 'dattes', 'gourmand', 'récupération'],
  },

  // ══════════════════════════════════════════════════
  // ── VEGAN (bedtime_055 – bedtime_060) ──
  // ══════════════════════════════════════════════════

  // bedtime_055 – Yaourt soja chia
  // soy_yogurt 200g: cal=100, p=8, c=4, f=5
  // chia_seeds 15g: cal=72.9, p=2.55, c=6.3, f=4.65
  // maple_syrup 5ml: cal=13, p=0, c=3.35, f=0
  // Total: cal=186, p=11, c=14, f=10
  {
    id: 'bedtime_055',
    name: 'Yaourt soja chia',
    description: 'Yaourt de soja avec graines de chia et sirop d\'érable. 100% végétal, riche en oméga-3 pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/800px-Joghurt.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'soy_yogurt', name: 'Yaourt soja', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 15, unit: 'g', roundTo: 5 },
      { ingredientId: 'maple_syrup', name: 'Sirop d\'érable', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange le yaourt soja avec les graines de chia.',
      'Ajoute le sirop d\'érable et mélange.',
      'Laisse reposer 10 min au frigo et déguste.',
    ],
    baseMacros: { calories: 186, protein: 11, carbs: 14, fat: 10 },
    tags: ['vegan', 'chia', 'oméga-3', 'léger'],
  },

  // bedtime_056 – Lait amande chaud cacao
  // almond_milk 250ml: cal=37.5, p=1.25, c=0.75, f=2.75
  // cocoa_powder 8g: cal=18.24, p=1.6, c=4.64, f=1.12
  // pea_protein 25g: cal=92.5, p=20, c=1.25, f=0.75
  // agave_syrup 5ml: cal=15.5, p=0, c=3.8, f=0
  // Total: cal=164, p=23, c=10, f=5
  {
    id: 'bedtime_056',
    name: 'Lait amande chaud cacao',
    description: 'Chocolat chaud vegan au lait d\'amande et protéine de pois. Doux et protéiné, sans lactose.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg/800px-After_The_St._Patrick%27s_Parade_Late_Lunch_%40_Lemon%2C_Dawson_Street%2C_Dublin%2C_Rep._Of_Ireland_A_Fine_Tradition%21_%286992614913%29.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almond_milk', name: 'Lait d\'amande', baseQuantityG: 250, unit: 'ml', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 25, unit: 'g', roundTo: 5 },
      { ingredientId: 'agave_syrup', name: 'Sirop d\'agave', baseQuantityG: 5, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Fais chauffer le lait d\'amande à feu doux.',
      'Retire du feu, laisse tiédir 2 min.',
      'Ajoute la protéine de pois, le cacao et le sirop d\'agave.',
      'Fouette bien et bois chaud.',
    ],
    baseMacros: { calories: 164, protein: 23, carbs: 10, fat: 5 },
    tags: ['vegan', 'chocolat', 'chaud', 'protéiné'],
  },

  // bedtime_057 – Pudding coco chia
  // coconut_milk 100ml: cal=185, p=2, c=3, f=19 → too fatty, use coconut cream 30ml + almond_milk 120ml
  // almond_milk 120ml: cal=18, p=0.6, c=0.36, f=1.32
  // coconut_cream 30ml: cal=69, p=0.6, c=1.2, f=7.2
  // chia_seeds 20g: cal=97.2, p=3.4, c=8.4, f=6.2
  // Total: cal=184, p=5, c=10, f=15 → need more protein, add pea_protein 15g: cal=55.5, p=12, c=0.75, f=0.45
  // Total: cal=240, p=17, c=11, f=15
  {
    id: 'bedtime_057',
    name: 'Pudding coco chia',
    description: 'Pudding de chia au lait d\'amande et crème de coco. Texture onctueuse, 100% végétal, prêt le soir.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Seed_of_chia_%28Salvia_hispanica%29Salvia_hispanica_group.jpg/800px-Seed_of_chia_%28Salvia_hispanica%29Salvia_hispanica_group.jpg',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'almond_milk', name: 'Lait d\'amande', baseQuantityG: 120, unit: 'ml', roundTo: 25 },
      { ingredientId: 'coconut_cream', name: 'Crème de coco', baseQuantityG: 30, unit: 'ml', roundTo: 10 },
      { ingredientId: 'chia_seeds', name: 'Graines de chia', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange le lait d\'amande, la crème de coco, les graines de chia et la protéine de pois.',
      'Fouette bien pour éviter les grumeaux.',
      'Place au frigo au moins 4 heures.',
      'Déguste froid le soir venu.',
    ],
    baseMacros: { calories: 240, protein: 17, carbs: 11, fat: 15 },
    tags: ['vegan', 'coco', 'chia', 'prép-avance'],
  },

  // bedtime_058 – Yaourt coco granola
  // coconut_yogurt 200g: cal=220, p=2, c=20, f=14
  // granola 20g: cal=94.2, p=2, c=12.8, f=4
  // pea_protein 15g: cal=55.5, p=12, c=0.75, f=0.45
  // Total: cal=370 → too high, reduce coconut_yogurt to 150g
  // coconut_yogurt 150g: cal=165, p=1.5, c=15, f=10.5
  // Total: cal=315 → still high, reduce granola to 15g
  // granola 15g: cal=70.65, p=1.5, c=9.6, f=3
  // Total: cal=291, p=15, c=25, f=14
  {
    id: 'bedtime_058',
    name: 'Yaourt coco granola',
    description: 'Yaourt de coco avec du granola et de la protéine de pois. Un bowl vegan gourmand pour la nuit.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/800px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg',
    budget: 'premium',
    restrictions: ['vegan', 'vegetarian', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 2,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'coconut_yogurt', name: 'Yaourt coco', baseQuantityG: 150, unit: 'g', roundTo: 25 },
      { ingredientId: 'granola', name: 'Granola', baseQuantityG: 15, unit: 'g', roundTo: 10 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 15, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mélange le yaourt coco avec la protéine de pois.',
      'Parsème le granola par-dessus.',
      'Déguste immédiatement pour garder le croustillant.',
    ],
    baseMacros: { calories: 291, protein: 15, carbs: 25, fat: 14 },
    tags: ['vegan', 'coco', 'granola', 'gourmand'],
  },

  // bedtime_059 – Tofu soyeux chocolat
  // tofu_silken 200g: cal=110, p=10, c=5, f=5.4
  // cocoa_powder 8g: cal=18.24, p=1.6, c=4.64, f=1.12
  // maple_syrup 10ml: cal=26, p=0, c=6.7, f=0
  // Total: cal=154, p=12, c=16, f=7
  {
    id: 'bedtime_059',
    name: 'Tofu soyeux chocolat',
    description: 'Mousse au chocolat vegan express avec du tofu soyeux. Crémeux, protéiné et sans lactose.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Chocolate_coffee_mousse.jpg/800px-Chocolate_coffee_mousse.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 5,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'tofu_silken', name: 'Tofu soyeux', baseQuantityG: 200, unit: 'g', roundTo: 25 },
      { ingredientId: 'cocoa_powder', name: 'Cacao en poudre', baseQuantityG: 8, unit: 'g', roundTo: 5 },
      { ingredientId: 'maple_syrup', name: 'Sirop d\'érable', baseQuantityG: 10, unit: 'ml', roundTo: 5 },
    ],
    recipeSteps: [
      'Mixe le tofu soyeux, le cacao et le sirop d\'érable au blender.',
      'Verse dans un bol ou un ramequin.',
      'Place au frigo 15 min pour que ça raffermisse.',
      'Déguste à la cuillère comme une mousse.',
    ],
    baseMacros: { calories: 154, protein: 12, carbs: 16, fat: 7 },
    tags: ['vegan', 'mousse', 'chocolat', 'protéiné'],
  },

  // bedtime_060 – Smoothie nuit vegan
  // soy_milk 200ml: cal=66, p=6, c=2, f=4
  // pea_protein 20g: cal=74, p=16, c=1, f=0.6
  // banana 75g: cal=66.75, p=0.825, c=17.25, f=0.225
  // almond_butter 10g: cal=61.4, p=2.1, c=1.2, f=5.6
  // Total: cal=268, p=25, c=21, f=10
  {
    id: 'bedtime_060',
    name: 'Smoothie nuit vegan',
    description: 'Smoothie au lait de soja, banane, purée d\'amande et protéine de pois. Le shaker du soir 100% végétal.',
    slot: 'bedtime',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kiwi_Smoothie.jpg/800px-Kiwi_Smoothie.jpg',
    budget: 'eco',
    restrictions: ['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'halal', 'pork_free'],
    prepTimeMin: 3,
    difficulty: 1,
    ingredients: [
      { ingredientId: 'soy_milk', name: 'Lait de soja', baseQuantityG: 200, unit: 'ml', roundTo: 25 },
      { ingredientId: 'pea_protein', name: 'Protéine de pois', baseQuantityG: 20, unit: 'g', roundTo: 5 },
      { ingredientId: 'banana', name: 'Banane', baseQuantityG: 75, unit: 'g', roundTo: 25 },
      { ingredientId: 'almond_butter', name: 'Purée d\'amande', baseQuantityG: 10, unit: 'g', roundTo: 5 },
    ],
    recipeSteps: [
      'Mets le lait de soja, la protéine de pois, la banane et la purée d\'amande dans un blender.',
      'Mixe 30 secondes jusqu\'à obtenir un smoothie lisse.',
      'Verse dans un grand verre et bois tranquillement.',
    ],
    baseMacros: { calories: 268, protein: 25, carbs: 21, fat: 10 },
    tags: ['vegan', 'smoothie', 'protéiné', 'rapide'],
  },
];
