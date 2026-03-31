/**
 * fix-photos.js — Assigns correct food photos to all meals
 * Uses Wikipedia API to get real food photos that match each dish
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'data', 'meals');
const FILES = ['breakfast.ts', 'lunch.ts', 'dinner.ts', 'morningSnack.ts', 'afternoonSnack.ts', 'bedtime.ts'];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ──── Wikipedia photo fetcher with retry ────
async function getWikiPhoto(article, lang = 'en', retries = 2) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (attempt < retries) { await delay(1000); continue; }
        return null;
      }
      const data = await res.json();
      if (data.thumbnail && data.thumbnail.source) {
        return data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
      }
      if (data.originalimage && data.originalimage.source) {
        return data.originalimage.source;
      }
      return null;
    } catch (e) {
      if (attempt < retries) { await delay(1000); continue; }
      return null;
    }
  }
  return null;
}

// ──── Category → Wikipedia article mapping ────
const CATEGORIES = {
  // Chicken
  grilled_chicken: ['Grilled_chicken', 'en'],
  chicken_curry: ['Chicken_tikka_masala', 'en'],
  chicken_rice: ['Hainanese_chicken_rice', 'en'],
  chicken_wrap: ['Wrap_(food)', 'en'],
  chicken_brochette: ['Yakitori', 'en'],
  chicken_roast: ['Roast_chicken', 'en'],
  chicken_basquaise: ['Chicken_stew', 'en'],
  chicken_fajita: ['Fajita', 'en'],
  chicken_wok: ['Stir_frying', 'en'],
  chicken_teriyaki: ['Teriyaki', 'en'],

  // Beef
  steak: ['Steak', 'en'],
  burger: ['Hamburger', 'en'],
  beef_stew: ['Beef_stew', 'en'],
  kefta: ['Kofta', 'en'],
  bo_bun: ['Bún', 'en'],

  // Fish
  salmon: ['Salmon_as_food', 'en'],
  salmon_teriyaki: ['Teriyaki', 'en'],
  tuna: ['Tuna', 'en'],
  cod: ['Atlantic_cod', 'en'],
  shrimp: ['Shrimp_and_prawn_as_food', 'en'],
  sardine: ['Sardine', 'en'],
  fish_papillote: ['En_papillote', 'en'],

  // Poultry
  turkey: ['Turkey_meat', 'en'],
  lamb: ['Lamb_and_mutton', 'en'],
  duck: ['Magret', 'fr'],
  merguez: ['Merguez', 'en'],

  // Pasta
  pasta: ['Pasta', 'en'],
  bolognese: ['Bolognese_sauce', 'en'],
  carbonara: ['Carbonara', 'en'],
  lasagna: ['Lasagne', 'en'],
  pad_thai: ['Pad_thai', 'en'],
  pho: ['Pho', 'en'],

  // Rice/Grains
  rice_bowl: ['Donburi', 'en'],
  risotto: ['Risotto', 'en'],
  couscous: ['Couscous', 'en'],
  quinoa: ['Quinoa', 'en'],
  polenta: ['Polenta', 'en'],

  // Eggs
  omelette: ['Omelette', 'en'],
  scrambled_eggs: ['Scrambled_eggs', 'en'],
  eggs_benedict: ['Eggs_Benedict', 'en'],
  shakshuka: ['Shakshouka', 'en'],

  // Breakfast
  pancakes: ['Pancake', 'en'],
  crepe: ['Blini', 'en'], // fallback since Crêpe encoding fails
  msemen: ['Msemen', 'en'],
  overnight_oats: ['Overnight_oats', 'en'],
  porridge: ['Porridge', 'en'],
  granola: ['Granola', 'en'],
  smoothie: ['Smoothie', 'en'],
  smoothie_bowl: ['Smoothie', 'en'],
  french_toast: ['French_toast', 'en'],
  tartine: ['Open_sandwich', 'en'],
  toast: ['Toast_(food)', 'en'],
  muesli: ['Muesli', 'en'],
  waffle: ['Waffle', 'en'],

  // Bowls/Salads
  buddha_bowl: ['Buddha_bowl', 'en'],
  poke_bowl: ['Poke_(Hawaiian_dish)', 'en'],
  salad: ['Salad', 'en'],
  bibimbap: ['Bibimbap', 'en'],
  burrito_bowl: ['Burrito', 'en'],

  // Soups
  soup: ['Soup', 'en'],
  lentil_soup: ['Lentil_soup', 'en'],
  harira: ['Harira', 'en'],

  // Moroccan
  tajine: ['Tajine', 'en'],

  // Vegan
  tofu: ['Tofu', 'en'],
  tempeh: ['Tempeh', 'en'],
  curry_veg: ['Curry', 'en'],
  chili: ['Chili_con_carne', 'en'],
  ratatouille: ['Ratatouille', 'en'],
  falafel: ['Falafel', 'en'],
  dal: ['Dal_(food)', 'en'],

  // Other mains
  pizza: ['Pizza', 'en'],
  gratin: ['Gratin', 'en'],
  quiche: ['Quiche', 'en'],

  // Snacks
  energy_balls: ['Date_(fruit)', 'en'], // energy balls look like dates
  hummus: ['Hummus', 'en'],
  trail_mix: ['Trail_mix', 'en'],
  protein_bar: ['Protein_bar', 'en'],
  cottage_cheese: ['Cottage_cheese', 'en'],
  yogurt: ['Yogurt', 'en'],
  fruit_salad: ['Fruit_salad', 'en'],
  apple: ['Apple', 'en'],
  banana: ['Banana', 'en'],
  almonds: ['Almond', 'en'],
  dates: ['Date_(fruit)', 'en'],
  chia_pudding: ['Chia_seed', 'en'],
  rice_cake: ['Rice_cake', 'en'],
  edamame: ['Edamame', 'en'],
  muffin: ['Muffin', 'en'],

  // Drinks/Desserts
  hot_chocolate: ['Hot_chocolate', 'en'],
  warm_milk: ['Hot_chocolate', 'en'],
  protein_shake: ['Milkshake', 'en'],
  chocolate_mousse: ['Chocolate_mousse', 'en'],
  compote: ['Compote', 'en'],
  panna_cotta: ['Panna_cotta', 'en'],
  sweet_potato: ['Sweet_potato', 'en'],

  // Other
  egg_boiled: ['Boiled_egg', 'en'],
  croque_monsieur: ['Croque-monsieur', 'en'],
  english_breakfast: ['Full_breakfast', 'en'],
  menemen: ['Menemen_(food)', 'en'],
  acai: ['Açaí_na_tigela', 'en'],
};

// ──── Meal name → category mapping ────
function getCategory(name) {
  const n = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, ' ');

  // Very specific dishes first
  if (n.includes('msemen')) return 'msemen';
  if (n.includes('shakshuka')) return 'shakshuka';
  if (n.includes('menemen')) return 'menemen';
  if (n.includes('harira')) return 'harira';
  if (n.includes('tajine')) return 'tajine';
  if (n.includes('couscous')) return 'couscous';
  if (n.includes('pho ') || n.includes('pho au')) return 'pho';
  if (n.includes('pad thai')) return 'pad_thai';
  if (n.includes('bibimbap')) return 'bibimbap';
  if (n.includes('bo bun') || n.includes('bobun')) return 'bo_bun';
  if (n.includes('fajita')) return 'chicken_fajita';
  if (n.includes('risotto')) return 'risotto';
  if (n.includes('pizza')) return 'pizza';
  if (n.includes('lasagne') || n.includes('lasagna')) return 'lasagna';
  if (n.includes('carbonara')) return 'carbonara';
  if (n.includes('bolognaise') || n.includes('bolognese')) return 'bolognese';
  if (n.includes('ratatouille')) return 'ratatouille';
  if (n.includes('falafel')) return 'falafel';
  if (n.includes('poke bowl') || n.includes('poke')) return 'poke_bowl';
  if (n.includes('buddha bowl')) return 'buddha_bowl';
  if (n.includes('burrito')) return 'burrito_bowl';
  if (n.includes('chili sin carne') || n.includes('chili')) return 'chili';
  if (n.includes('croque')) return 'croque_monsieur';
  if (n.includes('english breakfast')) return 'english_breakfast';
  if (n.includes('acai') || n.includes('acai')) return 'acai';
  if (n.includes('panna cotta')) return 'panna_cotta';

  // Eggs
  if (n.includes('benedicte') || n.includes('benedict')) return 'eggs_benedict';
  if (n.includes('omelette')) return 'omelette';
  if (n.includes('brouille')) return 'scrambled_eggs';
  if (n.includes('oeuf dur') || n.includes('oeufs durs')) return 'egg_boiled';

  // Breakfast items
  if (n.includes('pancake')) return 'pancakes';
  if (n.includes('gaufre') || n.includes('waffle')) return 'waffle';
  if (n.includes('crepe')) return 'crepe';
  if (n.includes('pain perdu') || n.includes('french toast')) return 'french_toast';
  if (n.includes('overnight')) return 'overnight_oats';
  if (n.includes('porridge')) return 'porridge';
  if (n.includes('granola') && !n.includes('fromage blanc')) return 'granola';
  if (n.includes('muesli')) return 'muesli';
  if (n.includes('smoothie bowl')) return 'smoothie_bowl';
  if (n.includes('smoothie')) return 'smoothie';
  if (n.includes('muffin')) return 'muffin';

  // Snacks
  if (n.includes('energy ball')) return 'energy_balls';
  if (n.includes('houmous') || n.includes('hummus') || n.includes('hoummous')) return 'hummus';
  if (n.includes('mix noix') || n.includes('melange') || n.includes('fruits secs et noix')) return 'trail_mix';
  if (n.includes('barre') && (n.includes('proteine') || n.includes('energe') || n.includes('maison'))) return 'protein_bar';
  if (n.includes('fromage blanc') || n.includes('cottage') || n.includes('skyr')) return 'cottage_cheese';
  if (n.includes('yaourt') || n.includes('yogourt') || n.includes('yogurt')) return 'yogurt';
  if (n.includes('salade de fruits')) return 'fruit_salad';
  if (n.includes('chia') || n.includes('pudding chia')) return 'chia_pudding';
  if (n.includes('galette de riz') || n.includes('galettes de riz')) return 'rice_cake';
  if (n.includes('edamame')) return 'edamame';
  if (n.includes('compote')) return 'compote';
  if (n.includes('mousse') && n.includes('chocolat')) return 'chocolate_mousse';
  if (n.includes('amande') || n.includes('noix') && !n.includes('coco')) return 'almonds';
  if (n.includes('datte')) return 'dates';

  // Drinks
  if (n.includes('chocolat chaud') || n.includes('cacao')) return 'hot_chocolate';
  if (n.includes('lait chaud') || n.includes('lait dore') || n.includes('golden') || n.includes('lait proteine')) return 'warm_milk';
  if (n.includes('shaker') || n.includes('shake')) return 'protein_shake';

  // Tartines & toasts
  if (n.includes('tartine')) return 'tartine';
  if (n.includes('toast')) return 'toast';

  // Meat (specific)
  if (n.includes('kefta') || n.includes('boulette')) return 'kefta';
  if (n.includes('merguez')) return 'merguez';
  if (n.includes('magret') || n.includes('canard')) return 'duck';
  if (n.includes('agneau')) return 'lamb';

  // Fish
  if (n.includes('saumon') && n.includes('teriyaki')) return 'salmon_teriyaki';
  if (n.includes('saumon') || n.includes('salmon')) return 'salmon';
  if (n.includes('thon') || n.includes('tuna')) return 'tuna';
  if (n.includes('cabillaud') || n.includes('colin')) return 'cod';
  if (n.includes('crevette')) return 'shrimp';
  if (n.includes('sardine')) return 'sardine';
  if (n.includes('papillote')) return 'fish_papillote';

  // Poultry
  if (n.includes('dinde') || n.includes('turkey')) return 'turkey';
  if (n.includes('poulet') && n.includes('curry')) return 'chicken_curry';
  if (n.includes('poulet') && n.includes('tikka')) return 'chicken_curry';
  if (n.includes('poulet') && n.includes('teriyaki')) return 'chicken_teriyaki';
  if (n.includes('poulet') && n.includes('roti')) return 'chicken_roast';
  if (n.includes('poulet') && n.includes('basquaise')) return 'chicken_basquaise';
  if (n.includes('poulet') && n.includes('wok')) return 'chicken_wok';
  if (n.includes('poulet') && n.includes('brochette')) return 'chicken_brochette';
  if (n.includes('brochette') && n.includes('poulet')) return 'chicken_brochette';
  if (n.includes('brochette') && n.includes('crevette')) return 'shrimp';
  if (n.includes('poulet') || n.includes('chicken')) return 'grilled_chicken';

  // Veggie proteins
  if (n.includes('tofu')) return 'tofu';
  if (n.includes('tempeh')) return 'tempeh';
  if (n.includes('curry')) return 'curry_veg';
  if (n.includes('lentille') && (n.includes('steak') || n.includes('bolognaise'))) return 'dal';
  if (n.includes('dahl') || n.includes('dal ')) return 'dal';

  // Soups
  if (n.includes('soupe') && n.includes('lentille')) return 'lentil_soup';
  if (n.includes('soupe') || n.includes('veloute')) return 'soup';

  // Steak/burger
  if (n.includes('steak')) return 'steak';
  if (n.includes('burger')) return 'burger';

  // Other mains
  if (n.includes('gratin')) return 'gratin';
  if (n.includes('quiche')) return 'quiche';
  if (n.includes('wrap')) return 'chicken_wrap';
  if (n.includes('wok') || n.includes('saute')) return 'chicken_wok';
  if (n.includes('patate douce')) return 'sweet_potato';

  // Pasta catch-all
  if (n.includes('pate') || n.includes('spaghetti') || n.includes('nouille')) return 'pasta';

  // Rice catch-all
  if (n.includes('riz') || n.includes('rice')) return 'rice_bowl';

  // Bowl catch-all
  if (n.includes('bowl')) return 'buddha_bowl';

  // Salad catch-all
  if (n.includes('salade') || n.includes('salad')) return 'salad';

  // Fruit catch-all
  if (n.includes('pomme')) return 'apple';
  if (n.includes('banane')) return 'banana';

  // Ultimate fallback
  return 'salad';
}

// ──── Main ────
async function main() {
  console.log('=== Fetching Wikipedia photos for categories ===\n');

  const photoMap = {};
  const entries = Object.entries(CATEGORIES);

  for (let i = 0; i < entries.length; i++) {
    const [cat, [article, lang]] = entries[i];
    const photo = await getWikiPhoto(article, lang);
    if (photo) {
      photoMap[cat] = photo;
      process.stdout.write('.');
    } else {
      process.stdout.write('x');
    }

    // Respectful delay - 400ms between requests
    await delay(400);
  }

  console.log(`\n\nFetched ${Object.keys(photoMap).length}/${entries.length} category photos\n`);

  // List missing categories
  const missing = entries.filter(([cat]) => !photoMap[cat]).map(([cat]) => cat);
  if (missing.length > 0) {
    console.log('Missing categories:', missing.join(', '));
  }

  // Fallbacks
  if (!photoMap['warm_milk'] && photoMap['hot_chocolate']) photoMap['warm_milk'] = photoMap['hot_chocolate'];
  if (!photoMap['smoothie_bowl'] && photoMap['smoothie']) photoMap['smoothie_bowl'] = photoMap['smoothie'];

  // Process each meal file
  console.log('\n=== Updating meal files ===\n');

  let totalUpdated = 0;
  let totalMissing = 0;

  for (const file of FILES) {
    const filePath = path.join(BASE, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    const mealRegex = /id:\s*['"]([^'"]+)['"],\s*\n\s*name:\s*['"]([^'"]+)['"],/g;
    const photoRegex = /photoUrl:\s*['"]([^'"]+)['"]/g;

    const meals = [...content.matchAll(mealRegex)].map(m => ({ id: m[1], name: m[2] }));
    const photos = [...content.matchAll(photoRegex)].map(m => ({ full: m[0], url: m[1] }));

    let updated = 0;
    let fileMissing = 0;

    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      const photo = photos[i];
      if (!meal || !photo) continue;

      const category = getCategory(meal.name);
      const newUrl = photoMap[category];

      if (!newUrl) {
        console.log(`  ? [${file}] ${meal.name} → ${category} (NO PHOTO)`);
        fileMissing++;
        continue;
      }

      if (photo.url !== newUrl) {
        content = content.replace(photo.full, `photoUrl: '${newUrl}'`);
        updated++;
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ${file}: ${updated} updated, ${fileMissing} missing`);
    totalUpdated += updated;
    totalMissing += fileMissing;
  }

  console.log(`\n=== Done! ${totalUpdated} photos updated, ${totalMissing} still missing ===`);
}

main().catch(console.error);
