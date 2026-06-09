// FORGA — Banque de photos curatées par catégorie culinaire.
//
// Pourquoi : les images générées par Pollinations (cf mealPhoto.ts) sont
// imprévisibles : qualité variable, latence parfois 3-8s, et le rendu
// d'un même plat peut tourner du "appétissant" au "non identifiable".
// Pour une app dont la promesse est "tu sais ce que tu manges en 1
// coup d'œil", ce n'est pas tenable.
//
// Stratégie : détecter la famille de plat à partir du nom (cf
// `categorizeMeal`), puis tirer une photo dans un pool de 3-4 URLs
// Unsplash curatées par catégorie. Les URLs sont stables, les images
// sont de qualité pro (photographes Unsplash), et expo-image cache
// tout sur disque après le 1er fetch.
//
// On dérive l'index de la photo via un hash de meal.id pour garantir
// (a) une distribution équilibrée entre les photos d'une même
// catégorie et (b) qu'un même plat affiche TOUJOURS la même image
// (déterministe, pas de flicker entre les rerenders).
//
// Le fallback Pollinations reste actif pour les plats hors catégorie
// (cf `getMealPhotoUrl` qui appelle ce module en priorité).

export type MealCategory =
  // Petit-déjeuner
  | 'eggs'
  | 'porridge_oats'
  | 'pancakes_waffles'
  | 'yogurt_bowl'
  | 'smoothie_bowl'
  | 'smoothie_drink'
  | 'avocado_toast'
  | 'french_toast'
  | 'breakfast_other'
  // Contenants génériques (priorité haute, cf RULES)
  | 'sandwich_tartine'
  | 'wrap_dish'
  // Salades & bowls
  | 'green_salad'
  | 'composed_salad'
  | 'poke_bowl'
  | 'buddha_bowl'
  | 'quinoa_bowl'
  // Viandes
  | 'chicken'
  | 'beef_steak'
  | 'pork'
  // Poissons
  | 'salmon'
  | 'tuna'
  | 'white_fish'
  | 'shrimp_seafood'
  // Bases féculents
  | 'pasta'
  | 'rice_dish'
  // Cuisines du monde
  | 'asian_stir_fry'
  | 'sushi'
  | 'ramen_noodles'
  | 'curry'
  | 'mexican_tacos'
  | 'mexican_burrito_wrap'
  | 'mediterranean'
  // Soupes / chaudrons
  | 'soup'
  // Snacks & desserts
  | 'protein_shake'
  | 'protein_bar'
  | 'fruit_snack'
  | 'nuts_seeds'
  | 'dark_chocolate'
  // Fallback
  | 'generic';

/** Pool de 3-4 photos Unsplash par catégorie. Toutes les URLs sont
 *  testées (chargent en <2s, format 800w optimisé, no redirect 403).
 *  Si on doit en remplacer une, garder le même ratio carré pour ne
 *  pas casser le layout des cards meals (1:1). */
const PHOTOS: Record<MealCategory, string[]> = {
  eggs: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80&auto=format&fit=crop',
  ],
  porridge_oats: [
    'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542691457-cbe4df041eb2?w=800&q=80&auto=format&fit=crop',
  ],
  pancakes_waffles: [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&auto=format&fit=crop',
  ],
  yogurt_bowl: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&q=80&auto=format&fit=crop',
  ],
  smoothie_bowl: [
    'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80&auto=format&fit=crop',
  ],
  smoothie_drink: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80&auto=format&fit=crop',
  ],
  avocado_toast: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&auto=format&fit=crop',
  ],
  french_toast: [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80&auto=format&fit=crop',
  ],
  breakfast_other: [
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop',
  ],
  sandwich_tartine: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=800&q=80&auto=format&fit=crop',
  ],
  wrap_dish: [
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80&auto=format&fit=crop',
  ],
  green_salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=80&auto=format&fit=crop',
  ],
  composed_salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop',
  ],
  poke_bowl: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=800&q=80&auto=format&fit=crop',
  ],
  buddha_bowl: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80&auto=format&fit=crop',
  ],
  quinoa_bowl: [
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
  ],
  chicken: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80&auto=format&fit=crop',
  ],
  beef_steak: [
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80&auto=format&fit=crop',
  ],
  pork: [
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80&auto=format&fit=crop',
  ],
  salmon: [
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop',
  ],
  tuna: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
  ],
  white_fish: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop',
  ],
  shrimp_seafood: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&auto=format&fit=crop',
  ],
  pasta: [
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80&auto=format&fit=crop',
  ],
  rice_dish: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
  ],
  asian_stir_fry: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&auto=format&fit=crop',
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80&auto=format&fit=crop',
  ],
  ramen_noodles: [
    'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80&auto=format&fit=crop',
  ],
  curry: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop',
  ],
  mexican_tacos: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80&auto=format&fit=crop',
  ],
  mexican_burrito_wrap: [
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80&auto=format&fit=crop',
  ],
  mediterranean: [
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
  ],
  soup: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604908554007-9a96345dcd4c?w=800&q=80&auto=format&fit=crop',
  ],
  protein_shake: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80&auto=format&fit=crop',
  ],
  protein_bar: [
    'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop',
  ],
  fruit_snack: [
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80&auto=format&fit=crop',
  ],
  nuts_seeds: [
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop',
  ],
  dark_chocolate: [
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80&auto=format&fit=crop',
  ],
  generic: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
  ],
};

/** Regex de keywords → catégorie. **L'ORDRE est CRITIQUE** : on
 *  évalue dans l'ordre déclaré et on s'arrête au 1er match.
 *
 *  Principe : le **contenant** prime sur l'**ingrédient**. Un plat
 *  "Wrap poulet" est visuellement un wrap, pas un blanc de poulet.
 *  "Pâtes bolognaise" est visuellement des pâtes, pas du bœuf haché.
 *  "Tartine jambon" est une tartine, pas une tranche de jambon. Sans
 *  cette priorité, un user voyait des photos d'ingrédients bruts qui
 *  ne correspondaient pas du tout au plat (ex: la tartine jambon
 *  montrait une cuisse de porc rôtie). Maintenant c'est cohérent.
 *
 *  Ordre des passes :
 *  1) Plats SIGNATURE / cuisines distinctives (sushi, ramen, curry, tacos)
 *  2) FORMATS / contenants (tartine, wrap, salade, bowl, pâtes, riz, soupe, omelette)
 *  3) Spécialités petit-déj (pancakes, porridge, smoothie, yogurt)
 *  4) PROTÉINES seules — fallback si rien d'autre n'a matché
 *  5) Snacks / desserts atomiques (fruit, noix, chocolat)
 */
const RULES: Array<{ category: MealCategory; pattern: RegExp }> = [
  // ─── 1) Cuisines / plats SIGNATURE (apparence très distinctive) ───
  { category: 'sushi', pattern: /\b(sushi|maki|sashimi|temaki)\b/ },
  { category: 'ramen_noodles', pattern: /\b(ramen|pho|udon)\b/ },
  { category: 'curry', pattern: /\b(curry|tikka|massala|madras|korma)\b/ },
  { category: 'mexican_tacos', pattern: /\b(taco|tacos|quesadilla|nachos)\b/ },
  { category: 'mexican_burrito_wrap', pattern: /\b(burrito|fajita)\b/ },
  { category: 'mediterranean', pattern: /\b(mezze|houmous|hummus|tzatziki|moussaka|gyros)\b/ },

  // ─── 2) FORMATS / contenants (priorité sur ingrédients) ───
  // Wraps / tortillas / pita — apparence très spécifique
  { category: 'wrap_dish', pattern: /\b(wrap|tortilla|pita|kebab)\b/ },
  // Tartines / sandwich / pain — un "tartine X" est visuellement un toast
  { category: 'avocado_toast', pattern: /\b(avocat.toast|avocado.toast|toast.*avocat|tartine.*avocat)\b/ },
  { category: 'french_toast', pattern: /\b(pain.perdu|french.toast)\b/ },
  { category: 'sandwich_tartine', pattern: /\b(tartines?|sandwichs?|bruschetta|croque.monsieur|club.sandwich|bagel)\b/ },
  // Bowls (avant salades pour matcher "buddha bowl avant salade")
  { category: 'poke_bowl', pattern: /\b(poke|poké)\b/ },
  { category: 'buddha_bowl', pattern: /\bbuddha\b/ },
  { category: 'quinoa_bowl', pattern: /\bquinoa\b/ },
  // Salades : composée avant générique
  { category: 'composed_salad', pattern: /\b(salade.*(composée|chef|niçoise|césar|lyonn|grecque|landaise)|caesar.*salad)\b/ },
  { category: 'green_salad', pattern: /\b(salades?|salads?|crudités|crudites|taboulé|taboule)\b/ },
  // Pâtes / riz : leur visuel domine sur la viande/sauce associée
  { category: 'pasta', pattern: /\b(pâtes|pates|pasta|spaghetti|penne|fusilli|tagliatelle|lasagne|raviolis?|gnocchis?|nouilles?|noodles?|carbonara|bolognaise|bolognese)\b/ },
  { category: 'rice_dish', pattern: /\b(riz|rice|risotto|paella|riz.cantonais|riz.sauté|riz.saute)\b/ },
  // Soupes / veloutés
  { category: 'soup', pattern: /\b(soupes?|soup|velouté|veloute|bouillon|gaspacho|minestrone|chili)\b/ },
  // Plats œuf — l'œuf est un format de plat (omelette/shakshuka), pas un ingrédient secondaire
  { category: 'eggs', pattern: /\b(œufs?|oeufs?|eggs?|omelette|frittata|shakshuka|brouillés?|scrambled)\b/ },
  // Wok / stir-fry asiatique
  { category: 'asian_stir_fry', pattern: /\b(wok|stir.?fry|sauté.*asiat|teriyaki|yakisoba|chow.?mein)\b/ },

  // ─── 3) Spécialités petit-déjeuner / snacks sucrés ───
  { category: 'pancakes_waffles', pattern: /\b(pancakes?|gaufres?|waffles?|crêpes?|crepes?|mug.cake|cookie)\b/ },
  { category: 'porridge_oats', pattern: /\b(porridge|oats|avoine|flocons?.d.avoine|overnight.oats|granola|muesli)\b/ },
  { category: 'smoothie_bowl', pattern: /\b(smoothie.bowl|açaï.bowl|acai.bowl)\b/ },
  { category: 'smoothie_drink', pattern: /\b(smoothie|milkshake|jus.vert|green.juice)\b/ },
  { category: 'yogurt_bowl', pattern: /\b(yaourt|yogurt|skyr|fromage.blanc|cottage|fromage.frais|parfait)\b/ },

  // ─── 4) PROTÉINES seules (fallback : si pas de contenant identifié) ───
  // Poissons d'abord (un "saumon grillé" doit gagner sur un "poulet" hypothétique)
  { category: 'salmon', pattern: /\b(saumon|salmon)\b/ },
  { category: 'tuna', pattern: /\b(thon|tuna)\b/ },
  { category: 'shrimp_seafood', pattern: /\b(crevettes?|shrimps?|gambas|fruits.de.mer|seafood|moules|huîtres)\b/ },
  { category: 'white_fish', pattern: /\b(cabillaud|merlu|colin|dorade|sole|julienne|lieu|cod|haddock|white.fish|poisson.blanc|filet.de.poisson)\b/ },
  // Viandes
  { category: 'beef_steak', pattern: /\b(boeuf|bœuf|beef|steak|entrecôte|faux.filet|bavette|onglet|rumsteck|hamburger|burger)\b/ },
  { category: 'pork', pattern: /\b(porc|pork|jambon|ham|bacon|lardons?|saucisse)\b/ },
  { category: 'chicken', pattern: /\b(poulet|chicken|volaille|dinde|turkey|escalope)\b/ },

  // ─── 5) Snacks atomiques (rare au lunch/dinner, surtout snacks/bedtime) ───
  { category: 'protein_shake', pattern: /\b(shake.*prot|protein.shake|whey.shake)\b/ },
  { category: 'protein_bar', pattern: /\b(barre.*prot|protein.bar|energy.balls?|energy.bar)\b/ },
  { category: 'fruit_snack', pattern: /\b(pomme|banane|orange|kiwi|fruits.rouges?|baies|berries)\b/ },
  { category: 'nuts_seeds', pattern: /\b(amandes?|noix|noisettes?|graines?|seeds?|nuts?)\b/ },
  { category: 'dark_chocolate', pattern: /\b(chocolat.noir|dark.chocolate|cacao)\b/ },
];

/** Normalise une chaîne pour le matching : lowercase + sans accents. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip diacritics
}

/** Détecte la catégorie d'un plat à partir de son nom (+ slot pour
 *  désambiguïser : "yaourt" tout seul → yogurt_bowl, mais un slot
 *  breakfast renforce la confiance). Retourne 'generic' si aucune
 *  règle ne matche. */
export function categorizeMeal(name: string, slot?: string): MealCategory {
  const normalized = normalize(name);
  for (const rule of RULES) {
    if (rule.pattern.test(normalized)) return rule.category;
  }
  // Fallback breakfast-aware : si on est sur un slot petit-déj et que
  // rien n'a matché, on lui donne au moins un visuel breakfast-cohérent
  // (toast/yaourt) plutôt qu'une assiette de poulet random.
  if (slot === 'breakfast' || slot === 'morning_snack' || slot === 'bedtime') {
    return 'breakfast_other';
  }
  return 'generic';
}

/** Cheap deterministic hash — même implem que mealPhoto.ts pour
 *  cohérence. Utilisé pour répartir équitablement les meals entre
 *  les 3-4 photos d'une même catégorie. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Retourne une URL Unsplash curatée pour le plat, ou `null` si la
 *  catégorie n'a pas de photo (= rare, on a un fallback generic).
 *  Caller : `getMealPhotoUrl` qui orchestre Unsplash → Pollinations.
 *  Déterministe : même meal.id → même URL. */
export function getCuratedPhotoUrl(meal: { id: string; name: string; slot?: string }): string | null {
  const category = categorizeMeal(meal.name, meal.slot);
  const pool = PHOTOS[category];
  if (!pool || pool.length === 0) return null;
  const idx = hashString(meal.id) % pool.length;
  return pool[idx];
}
