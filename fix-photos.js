/**
 * fix-photos.js — Assigns correct food photos to all meals
 * Uses Wikipedia API to get real food photos that match each dish
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'data', 'meals');
const FILES = [
  'breakfast.ts', 'lunch.ts', 'dinner.ts', 'morningSnack.ts', 'afternoonSnack.ts', 'bedtime.ts',
  'breakfast_extra.ts', 'lunch_extra.ts', 'dinner_extra.ts', 'morningSnack_extra.ts', 'afternoonSnack_extra.ts', 'bedtime_extra.ts',
];

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
  beef_bourguignon: ['Beef_bourguignon', 'en'],
  kefta: ['Kofta', 'en'],
  bo_bun: ['Bún', 'en'],
  picanha: ['Picanha', 'en'],

  // Fish
  salmon: ['Salmon_as_food', 'en'],
  salmon_teriyaki: ['Teriyaki', 'en'],
  tuna: ['Tuna', 'en'],
  cod: ['Atlantic_cod', 'en'],
  shrimp: ['Shrimp_and_prawn_as_food', 'en'],
  sardine: ['Sardine', 'en'],
  fish_papillote: ['En_papillote', 'en'],
  bar_fish: ['European_seabass', 'en'],
  fish_grilled: ['Fish_as_food', 'en'],
  brandade: ['Brandade', 'en'],

  // Poultry & Meat
  turkey: ['Turkey_meat', 'en'],
  lamb: ['Lamb_and_mutton', 'en'],
  duck: ['Magret', 'fr'],
  merguez: ['Merguez', 'en'],
  veal: ['Veal', 'en'],

  // Pasta
  pasta: ['Pasta', 'en'],
  bolognese: ['Bolognese_sauce', 'en'],
  carbonara: ['Carbonara', 'en'],
  lasagna: ['Lasagne', 'en'],
  pad_thai: ['Pad_thai', 'en'],
  pho: ['Pho', 'en'],

  // Asian
  ramen: ['Ramen', 'en'],
  udon: ['Udon', 'en'],
  sushi: ['Sushi', 'en'],
  congee: ['Congee', 'en'],
  onigiri: ['Onigiri', 'en'],
  nasi_goreng: ['Nasi_goreng', 'en'],
  tom_kha: ['Tom_kha_kai', 'en'],
  laksa: ['Laksa', 'en'],
  gyudon: ['Gyūdon', 'en'],
  donburi: ['Donburi', 'en'],
  banh_mi: ['Bánh_mì', 'en'],
  natto: ['Nattō', 'en'],
  tamago_sando: ['Egg_sandwich', 'en'],

  // Rice/Grains
  rice_bowl: ['Donburi', 'en'],
  fried_rice: ['Fried_rice', 'en'],
  risotto: ['Risotto', 'en'],
  couscous: ['Couscous', 'en'],
  quinoa: ['Quinoa', 'en'],
  polenta: ['Polenta', 'en'],
  rice_pudding: ['Rice_pudding', 'en'],

  // Eggs
  omelette: ['Omelette', 'en'],
  scrambled_eggs: ['Scrambled_eggs', 'en'],
  eggs_benedict: ['Eggs_Benedict', 'en'],
  shakshuka: ['Shakshouka', 'en'],
  frittata: ['Frittata', 'en'],
  egg_muffins: ['Egg_McMuffin', 'en'],

  // Breakfast
  pancakes: ['Pancake', 'en'],
  crepe: ['Crêpe', 'en'],
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
  croissant: ['Croissant', 'en'],
  brioche: ['Brioche', 'en'],
  galette_sarrasin: ['Galette_complète', 'fr'],
  proats: ['Overnight_oats', 'en'],
  tapioca: ['Tapioca', 'en'],

  // Bowls/Salads
  buddha_bowl: ['Buddha_bowl', 'en'],
  poke_bowl: ['Poke_(Hawaiian_dish)', 'en'],
  salad: ['Salad', 'en'],
  salade_nicoise: ['Salade_niçoise', 'en'],
  bibimbap: ['Bibimbap', 'en'],
  burrito_bowl: ['Burrito', 'en'],

  // Soups
  soup: ['Soup', 'en'],
  lentil_soup: ['Lentil_soup', 'en'],
  harira: ['Harira', 'en'],
  miso_soup: ['Miso_soup', 'en'],
  minestrone: ['Minestrone', 'en'],
  pot_au_feu: ['Pot-au-feu', 'en'],

  // Moroccan / Middle Eastern
  tajine: ['Tajine', 'en'],
  ful_medames: ['Ful_medames', 'en'],
  manakish: ['Manakish', 'en'],
  fatayer: ['Fatayer', 'en'],
  fattoush: ['Fattoush', 'en'],
  lahmacun: ['Lahmacun', 'en'],
  mansaf: ['Mansaf', 'en'],
  moussaka: ['Moussaka', 'en'],
  chermoula: ['Chermoula', 'en'],
  labneh: ['Labneh', 'en'],
  shawarma: ['Shawarma', 'en'],
  kebab: ['Doner_kebab', 'en'],
  kibbeh: ['Kibbeh', 'en'],
  maqluba: ['Maqluba', 'en'],

  // African
  akara: ['Akara', 'en'],
  plantain: ['Cooking_banana', 'en'],
  thieboudienne: ['Thiéboudienne', 'en'],
  yassa: ['Yassa_(food)', 'en'],
  mafe: ['Maafe', 'en'],
  alloco: ['Alloco', 'en'],
  ndole: ['Ndolé', 'en'],
  jollof: ['Jollof_rice', 'en'],
  fufu: ['Fufu', 'en'],
  doro_wat: ['Doro_wat', 'en'],
  kedjenou: ['Kedjenou', 'en'],
  garba: ['Attiéké', 'en'],

  // Latin American
  huevos_rancheros: ['Huevos_rancheros', 'en'],
  arepa: ['Arepa', 'en'],
  tacos: ['Taco', 'en'],
  feijoada: ['Feijoada', 'en'],
  arroz_con_pollo: ['Arroz_con_pollo', 'en'],
  pollo_brasa: ['Pollo_a_la_brasa', 'en'],
  ceviche: ['Ceviche', 'en'],
  enchiladas: ['Enchilada', 'en'],
  chimichurri: ['Chimichurri', 'en'],
  quesadilla: ['Quesadilla', 'en'],
  moqueca: ['Moqueca', 'en'],
  empanada: ['Empanada', 'en'],
  chilaquiles: ['Chilaquiles', 'en'],

  // French
  hachis_parmentier: ['Hachis_Parmentier', 'en'],
  blanquette: ['Blanquette_de_veau', 'en'],
  endives_jambon: ['Endive', 'en'],

  // Vegan
  tofu: ['Tofu', 'en'],
  tempeh: ['Tempeh', 'en'],
  curry_veg: ['Curry', 'en'],
  chili: ['Chili_con_carne', 'en'],
  ratatouille: ['Ratatouille', 'en'],
  falafel: ['Falafel', 'en'],
  dal: ['Dal', 'en'],

  // Other mains
  pizza: ['Pizza', 'en'],
  gratin: ['Gratin', 'en'],
  quiche: ['Quiche', 'en'],
  croque_monsieur: ['Croque-monsieur', 'en'],

  // Snacks
  energy_balls: ['Date_(fruit)', 'en'],
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
  bruschetta: ['Bruschetta', 'en'],
  mugcake: ['Mug_cake', 'en'],
  banana_bread: ['Banana_bread', 'en'],
  mochi: ['Mochi', 'en'],
  oat_bar: ['Flapjack_(oat_bar)', 'en'],

  // Drinks/Desserts
  hot_chocolate: ['Hot_chocolate', 'en'],
  warm_milk: ['Hot_chocolate', 'en'],
  protein_shake: ['Milkshake', 'en'],
  chocolate_mousse: ['Chocolate_mousse', 'en'],
  compote: ['Compote', 'en'],
  panna_cotta: ['Panna_cotta', 'en'],
  sweet_potato: ['Sweet_potato', 'en'],
  lassi: ['Lassi', 'en'],
  lait_choco: ['Chocolate_milk', 'en'],
  golden_milk: ['Turmeric#Golden_milk', 'en'],

  // Other
  egg_boiled: ['Boiled_egg', 'en'],
  english_breakfast: ['Full_breakfast', 'en'],
  menemen: ['Menemen_(food)', 'en'],
  acai: ['Açaí_na_tigela', 'en'],
};

// ──── Meal name → category mapping ────
function getCategory(name) {
  const n = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, ' ');

  // ─── Very specific dishes first ───
  if (n.includes('msemen')) return 'msemen';
  if (n.includes('shakshuka')) return 'shakshuka';
  if (n.includes('menemen')) return 'menemen';
  if (n.includes('harira')) return 'harira';
  if (n.includes('tajine')) return 'tajine';
  if (n.includes('couscous')) return 'couscous';
  if (n.includes('pho ') || n.includes('pho au') || n === 'pho') return 'pho';
  if (n.includes('pad thai')) return 'pad_thai';
  if (n.includes('pad see ew')) return 'chicken_wok';
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
  if (n.includes('chili sin carne') || n.includes('chili bean') || n.includes('chili')) return 'chili';
  if (n.includes('croque')) return 'croque_monsieur';
  if (n.includes('english breakfast')) return 'english_breakfast';
  if (n.includes('acai') || n.includes('acai')) return 'acai';
  if (n.includes('panna cotta')) return 'panna_cotta';

  // ─── African dishes ───
  if (n.includes('thieboudienne') || n.includes('thiof')) return 'thieboudienne';
  if (n.includes('yassa')) return 'yassa';
  if (n.includes('mafe')) return 'mafe';
  if (n.includes('alloco')) return 'alloco';
  if (n.includes('ndole')) return 'ndole';
  if (n.includes('jollof')) return 'jollof';
  if (n.includes('fufu')) return 'fufu';
  if (n.includes('doro wat')) return 'doro_wat';
  if (n.includes('kedjenou')) return 'kedjenou';
  if (n.includes('garba') || n.includes('attieke')) return 'garba';
  if (n.includes('akara')) return 'akara';
  if (n.includes('plantain')) return 'plantain';
  if (n.includes('poulet dg')) return 'grilled_chicken';
  if (n.includes('bouillie')) return 'porridge';
  if (n.includes('capitaine')) return 'fish_grilled';
  if (n.includes('sauce gombo')) return 'fish_grilled';

  // ─── Middle Eastern ───
  if (n.includes('ful medames')) return 'ful_medames';
  if (n.includes('manakish') || n.includes('manakiche')) return 'manakish';
  if (n.includes('fatayer')) return 'fatayer';
  if (n.includes('fattoush')) return 'fattoush';
  if (n.includes('lahmacun')) return 'lahmacun';
  if (n.includes('mansaf')) return 'mansaf';
  if (n.includes('moussaka')) return 'moussaka';
  if (n.includes('chermoula')) return 'chermoula';
  if (n.includes('maqluba')) return 'maqluba';
  if (n.includes('kibbeh')) return 'kibbeh';
  if (n.includes('fatteh')) return 'hummus';
  if (n.includes('labneh')) return 'labneh';

  // ─── Latin American ───
  if (n.includes('huevos rancheros')) return 'huevos_rancheros';
  if (n.includes('arepa')) return 'arepa';
  if (n.includes('chilaquiles')) return 'chilaquiles';
  if (n.includes('enchilada')) return 'enchiladas';
  if (n.includes('quesadilla')) return 'quesadilla';
  if (n.includes('ceviche')) return 'ceviche';
  if (n.includes('feijoada')) return 'feijoada';
  if (n.includes('arroz con pollo')) return 'arroz_con_pollo';
  if (n.includes('picanha')) return 'picanha';
  if (n.includes('pollo a la brasa') || n.includes('pollo brasa')) return 'pollo_brasa';
  if (n.includes('moqueca')) return 'moqueca';
  if (n.includes('empanada')) return 'empanada';
  if (n.includes('chimichurri')) return 'chimichurri';
  if (n.includes('tacos') || n.includes('taco bowl')) return 'tacos';
  if (n.includes('tapioca')) return 'tapioca';

  // ─── French dishes ───
  if (n.includes('bourguignon')) return 'beef_bourguignon';
  if (n.includes('pot-au-feu') || n.includes('pot au feu')) return 'pot_au_feu';
  if (n.includes('blanquette')) return 'blanquette';
  if (n.includes('hachis parmentier') || n.includes('parmentier')) return 'hachis_parmentier';
  if (n.includes('brandade')) return 'brandade';
  if (n.includes('endive') && n.includes('jambon')) return 'endives_jambon';
  if (n.includes('salade nicoise')) return 'salade_nicoise';
  if (n.includes('galette') && (n.includes('sarrasin') || n.includes('complete'))) return 'galette_sarrasin';

  // ─── Asian dishes ───
  if (n.includes('ramen')) return 'ramen';
  if (n.includes('udon')) return 'udon';
  if (n.includes('laksa')) return 'laksa';
  if (n.includes('tom kha')) return 'tom_kha';
  if (n.includes('gyudon')) return 'gyudon';
  if (n.includes('donburi')) return 'donburi';
  if (n.includes('nasi goreng')) return 'nasi_goreng';
  if (n.includes('congee')) return 'congee';
  if (n.includes('onigiri')) return 'onigiri';
  if (n.includes('tamago sando')) return 'tamago_sando';
  if (n.includes('natto')) return 'natto';
  if (n.includes('banh mi')) return 'banh_mi';
  if (n.includes('sushi') || n.includes('chirashi')) return 'sushi';
  if (n.includes('yakitori')) return 'chicken_brochette';
  if (n.includes('kung pao')) return 'chicken_wok';
  if (n.includes('shawarma')) return 'shawarma';
  if (n.includes('kebab')) return 'kebab';

  // ─── Eggs ───
  if (n.includes('benedicte') || n.includes('benedict')) return 'eggs_benedict';
  if (n.includes('omelette')) return 'omelette';
  if (n.includes('frittata')) return 'frittata';
  if (n.includes('brouille') || n.includes('tofu scramble')) return 'scrambled_eggs';
  if (n.includes('oeuf dur') || n.includes('oeufs durs')) return 'egg_boiled';
  if (n.includes('egg muffin')) return 'egg_muffins';

  // ─── Breakfast items ───
  if (n.includes('proats') || n.includes('protein oats')) return 'proats';
  if (n.includes('pancake')) return 'pancakes';
  if (n.includes('gaufre') || n.includes('waffle')) return 'waffle';
  if (n.includes('crepe')) return 'crepe';
  if (n.includes('pain perdu') || n.includes('french toast') || n.includes('protein french toast')) return 'french_toast';
  if (n.includes('overnight')) return 'overnight_oats';
  if (n.includes('porridge')) return 'porridge';
  if (n.includes('granola') && !n.includes('fromage blanc')) return 'granola';
  if (n.includes('muesli')) return 'muesli';
  if (n.includes('smoothie bowl')) return 'smoothie_bowl';
  if (n.includes('smoothie')) return 'smoothie';
  if (n.includes('croissant')) return 'croissant';
  if (n.includes('brioche')) return 'brioche';
  if (n.includes('mugcake') || n.includes('mug cake')) return 'mugcake';
  if (n.includes('banana bread')) return 'banana_bread';
  if (n.includes('mochi')) return 'mochi';
  if (n.includes('muffin')) return 'muffin';

  // ─── Snacks ───
  if (n.includes('energy ball') || n.includes('bouchees') && n.includes('dattes')) return 'energy_balls';
  if (n.includes('houmous') || n.includes('hummus') || n.includes('hoummous')) return 'hummus';
  if (n.includes('trail mix') || n.includes('mix noix') || n.includes('melange oleagineux') || n.includes('fruits secs et noix')) return 'trail_mix';
  if (n.includes('barre') && (n.includes('proteine') || n.includes('energe') || n.includes('maison') || n.includes('dattes') || n.includes('avoine'))) return 'protein_bar';
  if (n.includes('barres avoine')) return 'oat_bar';
  if (n.includes('bruschetta')) return 'bruschetta';
  if (n.includes('rice cake') || n.includes('galette de riz') || n.includes('galettes de riz')) return 'rice_cake';
  if (n.includes('edamame')) return 'edamame';

  // ─── Dairy snacks — must come before generic yogurt/fromage catches ───
  if (n.includes('lassi')) return 'lassi';
  if (n.includes('fromage blanc') || n.includes('cottage') || n.includes('skyr') || n.includes('caseine') || n.includes('casein')) return 'cottage_cheese';
  if (n.includes('yaourt') || n.includes('yogourt') || n.includes('yogurt')) return 'yogurt';
  if (n.includes('salade de fruits')) return 'fruit_salad';
  if (n.includes('chia')) return 'chia_pudding';
  if (n.includes('compote')) return 'compote';
  if (n.includes('mousse') && n.includes('choco')) return 'chocolate_mousse';
  if (n.includes('datte') || n.includes('dattes')) return 'dates';

  // ─── Drinks ───
  if (n.includes('chocolat chaud') || n.includes('choco') && n.includes('chaud')) return 'hot_chocolate';
  if (n.includes('lait choco') || n.includes('chocolate milk')) return 'lait_choco';
  if (n.includes('golden milk') || n.includes('lait dore') || n.includes('golden')) return 'golden_milk';
  if (n.includes('moon milk')) return 'golden_milk';
  if (n.includes('lait chaud') || n.includes('lait proteine') || n.includes('lait amande') || n.includes('tisane lait')) return 'warm_milk';
  if (n.includes('cacao')) return 'hot_chocolate';
  if (n.includes('latte')) return 'warm_milk';
  if (n.includes('shaker') || n.includes('shake') || n.includes('mass gainer') || n.includes('recovery shake')) return 'protein_shake';

  // ─── Tartines & toasts ───
  if (n.includes('tartine')) return 'tartine';
  if (n.includes('toast')) return 'toast';

  // ─── Meat (specific) ───
  if (n.includes('kefta') || n.includes('kofta') || n.includes('adana')) return 'kefta';
  if (n.includes('boulette')) return 'kefta';
  if (n.includes('merguez')) return 'merguez';
  if (n.includes('magret') || n.includes('canard')) return 'duck';
  if (n.includes('agneau') || n.includes('mechoui')) return 'lamb';
  if (n.includes('veau')) return 'veal';

  // ─── Fish ───
  if (n.includes('saumon') && n.includes('teriyaki')) return 'salmon_teriyaki';
  if (n.includes('saumon') || n.includes('salmon')) return 'salmon';
  if (n.includes('thon') || n.includes('tuna')) return 'tuna';
  if (n.includes('cabillaud') || n.includes('colin') || n.includes('morue')) return 'cod';
  if (n.includes('crevette')) return 'shrimp';
  if (n.includes('sardine')) return 'sardine';
  if (n.includes('papillote')) return 'fish_papillote';
  if (n.includes('bar ') || n.includes('bar grille') || n.includes('de bar')) return 'bar_fish';
  if (n.includes('poisson')) return 'fish_grilled';

  // ─── Poultry ───
  if (n.includes('dinde') || n.includes('turkey')) return 'turkey';
  if (n.includes('poulet') && n.includes('curry')) return 'chicken_curry';
  if (n.includes('poulet') && n.includes('tikka')) return 'chicken_curry';
  if (n.includes('poulet') && n.includes('teriyaki')) return 'chicken_teriyaki';
  if (n.includes('poulet') && n.includes('tandoori')) return 'chicken_curry';
  if (n.includes('poulet') && n.includes('roti')) return 'chicken_roast';
  if (n.includes('poulet') && n.includes('basquaise')) return 'chicken_basquaise';
  if (n.includes('poulet') && n.includes('wok')) return 'chicken_wok';
  if (n.includes('poulet') && n.includes('brochette')) return 'chicken_brochette';
  if (n.includes('brochette') && n.includes('poulet')) return 'chicken_brochette';
  if (n.includes('brochette') && n.includes('crevette')) return 'shrimp';
  if (n.includes('poulet') || n.includes('chicken')) return 'grilled_chicken';

  // ─── Veggie proteins ───
  if (n.includes('tofu soyeux')) return 'chocolate_mousse';
  if (n.includes('tofu')) return 'tofu';
  if (n.includes('tempeh')) return 'tempeh';
  if (n.includes('curry')) return 'curry_veg';
  if (n.includes('lentille') && (n.includes('steak') || n.includes('bolognaise'))) return 'dal';
  if (n.includes('dhal') || n.includes('dal ') || n.includes('dahl')) return 'dal';
  if (n.includes('lentille') && n.includes('corail')) return 'dal';

  // ─── Soups ───
  if (n.includes('soupe miso') || n.includes('miso')) return 'miso_soup';
  if (n.includes('minestrone')) return 'minestrone';
  if (n.includes('soupe') && n.includes('lentille')) return 'lentil_soup';
  if (n.includes('soupe') && n.includes('oignon')) return 'soup';
  if (n.includes('soupe') || n.includes('veloute')) return 'soup';

  // ─── Steak/burger ───
  if (n.includes('steak')) return 'steak';
  if (n.includes('burger')) return 'burger';
  if (n.includes('boeuf') && n.includes('brocoli')) return 'chicken_wok';

  // ─── Other mains ───
  if (n.includes('gratin')) return 'gratin';
  if (n.includes('quiche')) return 'quiche';
  if (n.includes('wrap')) return 'chicken_wrap';
  if (n.includes('wok')) return 'chicken_wok';
  if (n.includes('patate douce')) return 'sweet_potato';
  if (n.includes('galette') && n.includes('patate')) return 'sweet_potato';

  // ─── Riz au lait / Rice pudding ───
  if (n.includes('riz au lait') || n.includes('pudding riz')) return 'rice_pudding';

  // ─── Pasta catch-all ───
  if (n.includes('pate') || n.includes('spaghetti') || n.includes('nouille') || n.includes('pasta') || n.includes('pesto')) return 'pasta';

  // ─── Rice catch-all ───
  if (n.includes('riz') || n.includes('rice')) return 'rice_bowl';

  // ─── Bowl catch-all ───
  if (n.includes('bowl')) return 'buddha_bowl';

  // ─── Salad catch-all ───
  if (n.includes('salade') || n.includes('salad')) return 'salad';

  // ─── Fruit catch-all ───
  if (n.includes('pomme')) return 'apple';
  if (n.includes('banane') || n.includes('banana')) return 'banana';
  if (n.includes('orange')) return 'apple';
  if (n.includes('amande') || n.includes('tahini') || n.includes('beurre') && n.includes('amande')) return 'almonds';
  if (n.includes('noix') && !n.includes('coco')) return 'almonds';
  if (n.includes('fruits rouges') || n.includes('framboise') || n.includes('fraise')) return 'fruit_salad';
  if (n.includes('coco') && n.includes('pudding')) return 'chia_pudding';
  if (n.includes('beignet')) return 'crepe';
  if (n.includes('crudite')) return 'salad';
  if (n.includes('pita')) return 'hummus';

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

    // Respectful delay - 300ms between requests
    await delay(300);
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
  if (!photoMap['golden_milk'] && photoMap['warm_milk']) photoMap['golden_milk'] = photoMap['warm_milk'];
  if (!photoMap['proats'] && photoMap['overnight_oats']) photoMap['proats'] = photoMap['overnight_oats'];
  if (!photoMap['egg_muffins'] && photoMap['omelette']) photoMap['egg_muffins'] = photoMap['omelette'];

  // Process each meal file
  console.log('\n=== Updating meal files ===\n');

  let totalUpdated = 0;
  let totalMissing = 0;

  for (const file of FILES) {
    const filePath = path.join(BASE, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP ${file} (not found)`);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf-8');

    const mealRegex = /id:\s*['"]([^'"]+)['"],\s*\n\s*name:\s*['"]([^'"]+)['"],/g;
    // Match both non-empty and empty photoUrl
    const photoRegex = /photoUrl:\s*['"]([^'"]*)['"],?/g;

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
        content = content.replace(photo.full, `photoUrl: '${newUrl}',`);
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
