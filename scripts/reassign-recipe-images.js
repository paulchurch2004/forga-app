#!/usr/bin/env node
/**
 * Réassigne les photoUrl des recettes via l'API Pexels.
 *
 * Usage:
 *   node scripts/reassign-recipe-images.js <file.ts> [<file2.ts> ...] [--dry]
 *
 * - Lit PEXELS_API_KEY depuis .env (jamais committée).
 * - 1 appel API par REQUÊTE UNIQUE (per_page=80), puis distribue des photos
 *   DISTINCTES aux recettes qui partagent une requête → variété, zéro doublon
 *   global (les URLs déjà utilisées — y compris d'un run précédent via
 *   recipe-image-results.json — ne sont jamais réassignées).
 * - Rate-limit ADAPTATIF : lit X-Ratelimit-Remaining/Reset, fait une pause
 *   auto quand le quota horaire approche, back-off sur 429.
 * - Réécrit le photoUrl par id (zéro décalage de recettes).
 * - --dry : fetch + rapport, n'écrit pas les fichiers .ts.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const QUERIES_PATH = path.join(ROOT, 'scripts', 'recipe-image-queries.json');
const RESULTS_PATH = path.join(ROOT, 'scripts', 'recipe-image-results.json');

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('Usage: node scripts/reassign-recipe-images.js <file.ts> [...] [--dry]');
  process.exit(1);
}

function readEnvKey() {
  const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  const m = env.match(/^PEXELS_API_KEY=(.+)$/m);
  return m ? m[1].trim() : null;
}
const KEY = readEnvKey();
if (!KEY) { console.error('❌ PEXELS_API_KEY introuvable dans .env'); process.exit(1); }

const queries = JSON.parse(fs.readFileSync(QUERIES_PATH, 'utf8'));
const results = fs.existsSync(RESULTS_PATH) ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8')) : {};
const usedUrls = new Set(Object.values(results).map((r) => r && r.url).filter(Boolean));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// État rate-limit (mis à jour depuis les en-têtes de réponse).
let rateRemaining = Infinity;
let rateResetMs = 0;

async function throttle() {
  // Si on a épuisé le quota horaire, on attend la fenêtre de reset.
  if (rateRemaining <= 1 && rateResetMs > Date.now()) {
    const wait = rateResetMs - Date.now() + 2000;
    console.log(`  ⏳ Quota Pexels atteint — pause ${Math.ceil(wait / 1000)}s jusqu'au reset...`);
    await sleep(wait);
  } else {
    await sleep(250); // politesse
  }
}

async function fetchSearch(query, attempt = 0) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&orientation=landscape`;
  let res;
  try {
    res = await fetch(url, { headers: { Authorization: KEY } });
  } catch (e) {
    if (attempt < 3) { await sleep(3000); return fetchSearch(query, attempt + 1); }
    throw e;
  }
  if (res.status === 429) {
    const reset = parseInt(res.headers.get('x-ratelimit-reset') || '0', 10);
    const wait = reset ? reset * 1000 - Date.now() + 2000 : 60000;
    console.log(`  ⏳ 429 reçu — back-off ${Math.ceil(Math.max(wait, 5000) / 1000)}s...`);
    await sleep(Math.max(wait, 5000));
    return fetchSearch(query, attempt);
  }
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const rem = res.headers.get('x-ratelimit-remaining');
  const reset = res.headers.get('x-ratelimit-reset');
  if (rem != null) rateRemaining = parseInt(rem, 10);
  if (reset != null) rateResetMs = parseInt(reset, 10) * 1000;
  const json = await res.json();
  return json.photos || [];
}

function findIdsInFile(src) {
  const ids = [];
  const re = /id:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) ids.push(m[1]);
  return ids;
}

function replacePhotoUrlById(src, id, newUrl) {
  const idIdx = src.indexOf(`id: '${id}'`);
  if (idIdx === -1) return null;
  const pIdx = src.indexOf('photoUrl:', idIdx);
  if (pIdx === -1) return null;
  const q1 = src.indexOf("'", pIdx);
  const q2 = src.indexOf("'", q1 + 1);
  if (q1 === -1 || q2 === -1) return null;
  return src.slice(0, q1 + 1) + newUrl + src.slice(q2);
}

(async () => {
  const queryCache = new Map(); // query -> photos[]
  let ok = 0, skipped = 0, apiCalls = 0;

  for (const file of files) {
    const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
    let src = fs.readFileSync(abs, 'utf8');
    const idsInFile = findIdsInFile(src);
    const todo = idsInFile.filter((id) => queries[id]);
    console.log(`\n=== ${path.basename(file)} — ${todo.length}/${idsInFile.length} recettes ===`);

    for (const id of todo) {
      const query = queries[id];
      try {
        let photos = queryCache.get(query);
        if (!photos) {
          await throttle();
          photos = await fetchSearch(query);
          queryCache.set(query, photos);
          apiCalls++;
        }
        const pick = photos.find((p) => !usedUrls.has(p.src.large)) || photos[0];
        if (!pick) { console.log(`  ⚠️  ${id} [${query}] 0 résultat`); skipped++; continue; }
        usedUrls.add(pick.src.large);
        results[id] = { url: pick.src.large, alt: pick.alt || '', query };
        if (!DRY) {
          const next = replacePhotoUrlById(src, id, pick.src.large);
          if (next) src = next; else console.log(`  ⚠️ réécriture impossible: ${id}`);
        }
        ok++;
        if (ok % 25 === 0) console.log(`  … ${ok} traitées (${apiCalls} appels API, ${rateRemaining} restantes ce cycle)`);
      } catch (e) {
        console.log(`  ❌ ${id} [${query}] → ${e.message}`);
        skipped++;
      }
    }

    if (!DRY) { fs.writeFileSync(abs, src, 'utf8'); console.log(`  💾 ${path.basename(file)} réécrit.`); }
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf8');
  }

  console.log(`\n${DRY ? '[DRY] ' : ''}Terminé : ${ok} OK, ${skipped} ignorées, ${apiCalls} appels API (${queryCache.size} requêtes uniques).`);
})();
