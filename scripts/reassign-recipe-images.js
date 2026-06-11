#!/usr/bin/env node
/**
 * Réassigne les photoUrl des recettes via l'API Pexels — v2 (sélection
 * guidée par le texte `alt` de chaque photo, pas "la première venue").
 *
 * Usage:
 *   node scripts/reassign-recipe-images.js <file.ts> [...] [--dry]
 *
 * - Lit PEXELS_API_KEY depuis .env.
 * - Pour chaque REQUÊTE UNIQUE : 1 appel API (per_page=80) → on met TOUS les
 *   candidats (url+alt) en cache dans scripts/recipe-image-candidates.json
 *   (→ re-sélection ultérieure instantanée, sans re-fetch).
 * - SÉLECTION : pour chaque recette, on choisit le candidat NON UTILISÉ dont
 *   le `alt` matche le mieux les mots-clés du plat (overlap), à rang égal le
 *   mieux classé. → photo réellement pertinente + variété (zéro doublon).
 * - Réécrit le photoUrl par id (remplacement ligne entière : gère 'string',
 *   "string" et PHOTO.xxx).
 * - --dry : n'écrit pas les .ts.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const QUERIES_PATH = path.join(ROOT, 'scripts', 'recipe-image-queries.json');
const RESULTS_PATH = path.join(ROOT, 'scripts', 'recipe-image-results.json');
const CAND_PATH = path.join(ROOT, 'scripts', 'recipe-image-candidates.json');

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) { console.error('Usage: node scripts/reassign-recipe-images.js <file.ts> [...] [--dry]'); process.exit(1); }

const KEY = (() => {
  const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  const m = env.match(/^PEXELS_API_KEY=(.+)$/m);
  return m ? m[1].trim() : null;
})();
if (!KEY) { console.error('❌ PEXELS_API_KEY introuvable dans .env'); process.exit(1); }

const queries = JSON.parse(fs.readFileSync(QUERIES_PATH, 'utf8'));
const candCache = fs.existsSync(CAND_PATH) ? JSON.parse(fs.readFileSync(CAND_PATH, 'utf8')) : {};
const results = {}; // on repart frais pour une sélection optimale globale
const usedUrls = new Set();

const STOP = new Set(['with','and','the','of','a','in','on','plate','bowl','glass','cup','dish','fresh','healthy','delicious','homemade','served','top','close','up','view','perfect','for','style','food','meal','breakfast','lunch','dinner','snack']);
const tokenize = (q) => q.toLowerCase().split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCandidates(query, attempt = 0) {
  if (candCache[query]) return candCache[query];
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&orientation=landscape`;
  let res;
  try { res = await fetch(url, { headers: { Authorization: KEY } }); }
  catch (e) { if (attempt < 8) { await sleep(2500 * (attempt + 1)); return fetchCandidates(query, attempt + 1); } throw e; }
  if (res.status === 429) {
    if (attempt > 12) throw new Error('429 persistant');
    await sleep(8000); // burst limit → back-off court
    return fetchCandidates(query, attempt + 1);
  }
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const json = await res.json();
  const cands = (json.photos || []).map((p) => ({ url: p.src.large, alt: p.alt || '' }));
  candCache[query] = cands;
  await sleep(1300); // délai régulier pour éviter les bursts 429
  return cands;
}

function pickBest(cands, qTokens) {
  let best = null, bestScore = -1;
  for (const c of cands) {
    if (usedUrls.has(c.url)) continue;
    const a = c.alt.toLowerCase();
    const score = qTokens.filter((t) => a.includes(t)).length;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  if (!best) best = cands.find((c) => !usedUrls.has(c.url)) || cands[0] || null;
  return best ? { ...best, score: best.alt ? qTokens.filter((t) => best.alt.toLowerCase().includes(t)).length : 0 } : null;
}

function findIds(src) { return [...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]); }

function replaceLine(src, id, url) {
  const idIdx = src.indexOf(`id: '${id}'`);
  if (idIdx === -1) return null;
  const pIdx = src.indexOf('photoUrl:', idIdx);
  if (pIdx === -1) return null;
  const lineEnd = src.indexOf('\n', pIdx);
  const line = src.slice(pIdx, lineEnd);
  const hasComma = line.trimEnd().endsWith(',');
  return src.slice(0, pIdx) + `photoUrl: '${url}'${hasComma ? ',' : ''}` + src.slice(lineEnd);
}

(async () => {
  let ok = 0, apiCalls = 0, zeroScore = 0;
  const before = Object.keys(candCache).length;

  for (const file of files) {
    const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
    let src = fs.readFileSync(abs, 'utf8');
    const todo = findIds(src).filter((id) => queries[id]);
    console.log(`\n=== ${path.basename(file)} — ${todo.length} recettes ===`);

    for (const id of todo) {
      const query = queries[id];
      try {
        const wasCached = !!candCache[query];
        const cands = await fetchCandidates(query);
        if (!wasCached && candCache[query]) apiCalls++;
        const pick = pickBest(cands, tokenize(query));
        if (!pick) { console.log(`  ⚠️  ${id} [${query}] 0 candidat`); continue; }
        if (pick.score === 0) zeroScore++;
        usedUrls.add(pick.url);
        results[id] = { url: pick.url, alt: pick.alt, query, score: pick.score };
        if (!DRY) { const next = replaceLine(src, id, pick.url); if (next) src = next; }
        ok++;
        if (ok % 50 === 0) console.log(`  … ${ok} traitées (${apiCalls} appels API ce run)`);
      } catch (e) { console.log(`  ❌ ${id} [${query}] → ${e.message}`); }
    }
    if (!DRY) fs.writeFileSync(abs, src, 'utf8');
    fs.writeFileSync(CAND_PATH, JSON.stringify(candCache));
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
    if (!DRY) console.log(`  💾 ${path.basename(file)} réécrit.`);
  }

  console.log(`\n${DRY ? '[DRY] ' : ''}Terminé : ${ok} OK · ${apiCalls} nouveaux appels API (cache: ${before}→${Object.keys(candCache).length} requêtes) · ${zeroScore} sans mot-clé en commun.`);
})();
