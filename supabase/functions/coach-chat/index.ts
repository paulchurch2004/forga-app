import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'https://forga.fr').split(',');

// Capture la dernière erreur d'un appel modèle (Groq/OpenAI/Anthropic)
// pour la propager dans la réponse 502 en debug. Permet de diagnostiquer
// "ai_unavailable" sans fouiller les logs du dashboard.
let lastModelError = '';

/**
 * Multi-model routing — choisit le bon modèle selon l'intent du message.
 *
 * Stratégie :
 *  - Par défaut : Groq Llama 3.3 70B (rapide, bon marché, ~0.59$/M input)
 *  - Détection food-logging : route vers GPT-4o-mini si dispo (meilleur
 *    en sortie JSON structurée → items mieux extraits)
 *  - Détection empathie / setback : route vers Claude Haiku 4.5 si dispo
 *    (ton plus nuancé pour les moments difficiles)
 *
 * Si la clé API du modèle "optimal" n'est pas configurée → fallback Groq.
 * Aucun risque de breakage : Groq couvre 100% des cas.
 */
type ModelTarget =
  | { provider: 'groq'; model: 'llama-3.3-70b-versatile' }
  | { provider: 'groq'; model: 'llama-3.1-8b-instant' }
  | { provider: 'openai'; model: 'gpt-4o-mini' }
  | { provider: 'anthropic'; model: 'claude-haiku-4-5-20251001' };

/** Keywords qui suggèrent un moment empathique (setback, frustration).
 *  FR + EN minimum pour couvrir App Store reviewers anglophones. */
const EMPATHY_KEYWORDS = [
  // FR
  'craqué', 'craque', 'craquer', 'rechute', 'frustré', 'frustrée', 'déprimé',
  'déprime', 'fatigué', 'fatiguée', 'stagne', 'stagner', 'épuisé', 'épuisée',
  'abandonner', 'abandonne', 'lâche', 'lâcher', 'envie de rien', 'marre',
  'blessé', 'blessée', 'blessure', 'mal au', 'mal à la', 'ça fait mal',
  'plateau', 'découragé', 'découragée', 'envie de tout arrêter',
  // EN
  'i give up', 'gave up', 'i quit', 'i quitted', 'i broke', 'i cheated',
  'frustrated', 'depressed', 'exhausted', 'tired', 'stuck',
  'feeling down', 'feeling low', "i'm done", 'i am done', 'discouraged',
  'injured', 'i hurt', 'it hurts', 'pain in', 'feeling bad',
];

/** Patterns qui suggèrent un food log explicite.
 *
 *  Avant on utilisait des sous-chaînes brutes ("j'ai pris", "ajoute") qui
 *  matchaient à tort ("j'ai pris du recul", "ajoute Paul à mes amis") et
 *  routaient sur GPT-4o-mini avec un prompt qui pousse au log_meal → carte
 *  fantôme. Maintenant on requiert un CONTEXTE alimentaire après l'intent
 *  (article + nom d'aliment, ou unité de mesure type 'g', 'ml').
 */
const FOOD_LOG_PATTERNS: RegExp[] = [
  // ─── FR ───
  // "j'ai mangé/pris/bu une banane / du riz / 200g de poulet"
  /\bj['']ai (mangé|pris|bu|grignoté|englouti|avalé|consommé|terminé|fini)\s+(un|une|des|du|de la|de l['']|\d)/i,
  // "je viens de manger/boire/prendre X"
  /\bje viens de (manger|boire|prendre|finir)\s+(un|une|des|du|de la|\d)/i,
  // Slot explicite : "au petit-déj/déj/dîner/goûter j'ai…"
  /\bau (petit[- ]?déj|déj|dîner|goûter|repas)\b/i,
  // Demande de logging explicite : "log mon/logge/ajoute X à"
  /\b(log mon|logge|enregistre|note mon)\b/i,
  // "ajoute 200g de poulet / ajoute un yaourt" (mais PAS "ajoute Paul")
  /\bajoute\s+(un|une|des|du|de la|\d+\s*(g|gr|kg|ml|cl|l))\b/i,
  // "pour le déjeuner/dîner j'ai…"
  /\bpour le (déjeuner|dîner|petit[- ]?déj)\b/i,

  // ─── EN ───
  // "i ate/had/drank a/an/some/N <food>"
  /\bi (ate|had|just had|drank|grabbed|finished|just finished)\s+(a|an|some|the|my|\d)/i,
  // "i just had X" / "i'm having X"
  /\bi(['']m| am)?\s+having\s+(a|an|some|\d)/i,
  // Slot explicite : "for breakfast/lunch/dinner/snack i…"
  /\bfor (breakfast|lunch|dinner|snack)\b/i,
  // Logging requests
  /\b(log my|log this|add to my|track this|note that i)\b/i,
  // "add 200g of chicken / add a yogurt" (avoid "add Paul")
  /\badd\s+(a|an|some|\d+\s*(g|gr|kg|oz|ml|cl|l))\b/i,
  // "at breakfast/lunch i had…"
  /\bat (breakfast|lunch|dinner)\b/i,
];

function matchesFoodLog(text: string): boolean {
  return FOOD_LOG_PATTERNS.some((re) => re.test(text));
}

/** Détecte si le user écrit en anglais. Heuristique simple : on cherche
 *  des indicateurs forts (mots EN très fréquents) qui n'existent pas en
 *  français. Si on en trouve ≥ 2 → english. Permet d'instruire le LLM
 *  de répondre dans la langue de l'user (sinon il répond en FR car le
 *  system prompt est tout en français). */
const EN_INDICATORS = [
  ' the ', ' and ', ' you ', ' your ', ' i ', " i'm ", ' my ', ' me ',
  ' have ', ' had ', ' would ', ' should ', ' could ', ' want ', ' going ',
  ' really ', ' just ', ' that ', ' this ', ' what ', ' when ', ' how ',
  ' why ', ' where ', ' which ', ' but ', ' with ', ' from ',
];
function detectEnglish(message: string): boolean {
  const padded = ` ${message.toLowerCase()} `;
  let hits = 0;
  for (const ind of EN_INDICATORS) {
    if (padded.includes(ind)) {
      hits++;
      if (hits >= 2) return true;
    }
  }
  return false;
}

/** Questions META sur le coach lui-même : identité, nom, capacités,
 *  origine, fonctionnement. Llama dérive sur ce genre de prompts car
 *  le system prompt est très dense en contenu food/training — il
 *  hallucine des réponses food. Claude est meilleur sur ce type de
 *  questions conversationnelles courtes et auto-référentielles. */
const META_KEYWORDS = [
  // FR
  'tu es qui', 'qui es-tu', 'qui es tu', "t'es qui", "t'es quoi",
  'tu es quoi', 'tu fais quoi', 'tu sais faire', 'tu peux faire',
  'comment tu marches', 'comment tu fonctionnes', 'tu fonctionnes comment',
  "qu'est-ce que tu", 'ton nom', "tu t'appelles", 'donne toi un nom',
  'donne-toi un nom', "comment t'appeler", "t'as un nom", 'as-tu un nom',
  'tu es une ia', 'tu es un robot', 'tu es un chatbot', 'tu es un gpt',
  "t'es une ia", 'es-tu humain', 'es-tu réel', 'es tu réel',
  'présente-toi', 'présente toi', 'parle-moi de toi', 'parle moi de toi',
  'ton blaze', 'ton pseudo', 'ton prénom', 'ton surnom',
  // EN
  'who are you', 'what are you', 'what is your name', 'whats your name',
  "what's your name", 'your name', 'give yourself a name', 'pick a name',
  'introduce yourself', 'tell me about yourself', 'are you an ai',
  'are you a bot', 'are you a robot', 'are you human', 'are you real',
  'what can you do', 'what do you do',
];

function routeModel(userMessage: string): ModelTarget {
  const m = userMessage.toLowerCase();

  // Questions méta : Claude (meilleur en conversation, ne se laisse
  // pas embarquer par le prompt food-heavy).
  if (ANTHROPIC_API_KEY && META_KEYWORDS.some((kw) => m.includes(kw))) {
    return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' };
  }

  // Empathie ensuite (priorité haute, ton compte plus que JSON).
  if (ANTHROPIC_API_KEY && EMPATHY_KEYWORDS.some((kw) => m.includes(kw))) {
    return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' };
  }

  // Food log : on veut une sortie items structurée fiable.
  if (OPENAI_API_KEY && matchesFoodLog(userMessage)) {
    return { provider: 'openai', model: 'gpt-4o-mini' };
  }

  // Défaut : Groq.
  return { provider: 'groq', model: 'llama-3.3-70b-versatile' };
}

/** Appelle le bon endpoint selon le modèle choisi. Retourne le texte
 *  de la réponse ou null si l'appel échoue. */
async function callModel(
  target: ModelTarget,
  messages: Array<{ role: string; content: string }>,
): Promise<string | null> {
  try {
    if (target.provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: target.model,
          messages,
          max_tokens: 700,
          // Baissé de 0.4 → 0.3 : Llama dérive plus que Claude/GPT sur
          // les questions hors-scope quand le system prompt est dense
          // en contenu nutrition/training. Une temp plus basse réduit
          // l'hallucination de réponses food sur des demandes méta.
          temperature: 0.3,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        lastModelError = `groq ${res.status}: ${errBody.slice(0, 200)}`;
        console.error(`[coach-chat] ${lastModelError}`);
        return null;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    }

    if (target.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: target.model,
          messages,
          max_tokens: 700,
          temperature: 0.4,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    }

    if (target.provider === 'anthropic') {
      // Anthropic split system prompt out of messages array.
      const systemMsg = messages.find((m) => m.role === 'system');
      const otherMsgs = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: target.model,
          system: systemMsg?.content ?? '',
          messages: otherMsgs,
          max_tokens: 700,
          temperature: 0.4,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.content?.[0]?.text?.trim() ?? null;
    }

    return null;
  } catch {
    return null;
  }
}

/** Daily caps applied via the `check_and_increment_quota` RPC.
 *
 *  3 paliers (pour protéger les coûts LLM) :
 *   - FREE    : 5/jour  — pousse vers l'essai/Pro
 *   - TRIAL   : 15/jour — essai gratuit 7j : on laisse goûter l'illimité
 *               ressenti (15 = largement suffisant pour un usage normal),
 *               mais on plafonne pour éviter l'abus "je spamme 200/jour
 *               pendant 7 jours puis j'annule" qui coûte cher sans rapporter.
 *   - PREMIUM : 50/jour — user CONVERTI (qui PAIE) : cap de sécurité,
 *               jamais marketé comme illimité. 50 est très au-dessus de
 *               tout usage légitime (personne n'envoie 50 messages/jour
 *               à un coach), donc invisible pour un vrai abonné, mais
 *               borne dure contre l'abus / le coût LLM qui dérape.
 */
const QUOTA_CAP_FREE = 5;
const QUOTA_CAP_TRIAL = 15;
const QUOTA_CAP_PREMIUM = 50;

/** Module-level response cache. Persists across invocations on the same
 *  worker (Edge Functions stay warm under load). 5-minute TTL, capped to
 *  prevent memory growth. Cross-worker dedup is best-effort — a cache miss
 *  just falls through to a normal LLM call. */
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 100;
type CacheEntry = { reply: string; expiresAt: number };
const responseCache: Map<string, CacheEntry> = new Map();

function cacheGet(key: string): string | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return entry.reply;
}

function cacheSet(key: string, reply: string) {
  if (responseCache.size >= CACHE_MAX) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { reply, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function makeCacheKey(userId: string, message: string, ctxFingerprint: string): Promise<string> {
  // IMPORTANT : userId est inclus en CLAIR avant le hash pour éviter
  // qu'une collision sur message+ctx fasse leaker une réponse entre
  // users. Le hash final reste 256-bit donc le préfixe n'expose rien.
  const raw = `${userId}|${message.trim().toLowerCase()}|${ctxFingerprint}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash compact d'une liste de mémoires pour inclusion dans le
 *  fingerprint cache. Sinon un user avec/sans mémoires partagerait
 *  la même clé. */
function hashMemories(memories: any[] | undefined): string {
  if (!memories || memories.length === 0) return 'm0';
  return memories
    .map((m: any) => `${m.tag ?? ''}:${(m.summary ?? '').slice(0, 40)}`)
    .join('|')
    .slice(0, 256);
}

/** Détecte si une réponse contient un bloc action ou mémoire. Si oui,
 *  on NE LA CACHE PAS — sinon un cache hit ré-émet une carte log_meal
 *  ou une nouvelle mémoire déjà persistée. */
function replyHasSideEffects(reply: string): boolean {
  return reply.includes('[[ACTION:') || reply.includes('[[MEMORY]]');
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

interface CoachContext {
  firstName: string;
  hour: number;
  currentStreak: number;
  mealsValidatedCount: number;
  mealsExpected: number;
  score: { total: number; nutrition: number; consistency: number; progression: number; discipline: number };
  objective: string;
  consumedProtein: number;
  targetProtein: number;
  consumedCalories: number;
  targetCalories: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
  // Extended optional fields
  isTodayValidated?: boolean;
  currentSlot?: string | null;
  activeProgramName?: string;
  currentWeek?: number;
  todayPlanType?: string;
  todayPlanName?: string;
  todayProgramDayId?: string;
  todayDateIso?: string;
  recentWorkouts?: Array<{ date: string; type: string; durationMinutes: number; volumeKg?: number }>;
  lastCheckIn?: { weekStart: string; energy: number; sleep: number; performance: number; weight: number };
  consumedWaterMl?: number;
  targetWaterMl?: number;
  // Profile basics
  age?: number;
  sex?: 'male' | 'female';
  heightCm?: number;
  currentWeight?: number;
  targetWeight?: number;
  targetDeadline?: string;
  restrictions?: string[];
  trackingMode?: 'both' | 'nutrition_only' | 'training_only';
  /** Statut ménopausique pour les utilisatrices >=40. Permet au coach
   *  d'adapter ses conseils (sarcopénie accélérée, sommeil dégradé,
   *  bouffées de chaleur impactant l'entraînement, etc.). */
  menopauseStatus?: 'none' | 'peri' | 'post';
  // Body progress
  recentWeights?: Array<{ date: string; weight: number }>;
  lastMeasurement?: {
    date: string;
    waistCm?: number;
    hipsCm?: number;
    chestCm?: number;
    armsCm?: number;
    thighsCm?: number;
    bodyFatPercent?: number;
  };
  // Training depth
  topOneRepMaxes?: Array<{ exerciseId: string; weight: number; reps: number }>;
  programPausedUntil?: string;
  // Preferences + gamification
  likedMealsCount?: number;
  dislikedMealsCount?: number;
  recentDislikes?: string[];
  recentBadges?: string[];
}

interface Memory {
  date: string;
  tag: string;
  summary: string;
}

/** Sanitize tout texte injecté dans le prompt système pour éviter le
 *  prompt injection. Un user qui se nommerait `Paul"\n# OVERRIDE...`
 *  pourrait sinon casser le contexte du LLM. On garde lettres,
 *  accents, espaces, tirets ; on tronque à 30 chars. */
function sanitizeForPrompt(s: string | undefined | null, max = 30): string {
  if (!s) return '';
  return s
    .replace(/[^\p{L}\p{N}\s'-]/gu, '') // strip tout sauf lettres/chiffres/espace/'-'
    .trim()
    .slice(0, max);
}

function buildSystemPrompt(ctx: CoachContext, memories: Memory[] = []): string {
  // Sanitize tous les champs textes contrôlables par l'user qui sont
  // interpolés dans le prompt système. Sans ça, un user qui se nomme
  // (ou nomme son programme) avec un payload type `"\n# OVERRIDE: ...`
  // pourrait injecter des instructions arbitraires dans le contexte
  // du LLM. On autorise un set plus large pour les noms de programme
  // (peut contenir chiffres, points : "BULK Inter 4D") mais on bloque
  // les marqueurs de section et les retours-ligne.
  const safeFirstName = sanitizeForPrompt(ctx.firstName) || 'Champion';
  const safeProgramName = sanitizeForPrompt(ctx.activeProgramName, 60);
  const safePlanName = sanitizeForPrompt(ctx.todayPlanName, 60);
  const safeRecentDislikes = (ctx.recentDislikes ?? [])
    .map((d) => sanitizeForPrompt(d, 40))
    .filter(Boolean);
  ctx = {
    ...ctx,
    firstName: safeFirstName,
    activeProgramName: safeProgramName || undefined,
    todayPlanName: safePlanName || undefined,
    recentDislikes: safeRecentDislikes.length ? safeRecentDislikes : undefined,
  };
  const objectiveLabels: Record<string, string> = {
    bulk: 'prise de masse',
    cut: 'sèche / perte de gras',
    maintain: 'maintien',
    recomp: 'recomposition corporelle',
  };

  // Extended context (optional fields, included only if present)
  const todayPlanLine = (() => {
    if (ctx.todayPlanType === 'rest' || !ctx.todayPlanType) return 'Repos / pas de séance';
    if (ctx.todayPlanType === 'cardio') return `Cardio (${ctx.todayPlanName ?? '—'})`;
    return `Muscu — ${ctx.todayPlanName ?? '—'}`;
  })();

  const recentLines = (ctx.recentWorkouts ?? [])
    .slice(0, 5)
    .map((w) => `  · ${w.date} : ${w.type}, ${w.durationMinutes}min${w.volumeKg ? `, ${w.volumeKg}kg vol` : ''}`)
    .join('\n');

  const checkInLine = ctx.lastCheckIn
    ? `- Dernier check-in (${ctx.lastCheckIn.weekStart}) : énergie ${ctx.lastCheckIn.energy}/5, sommeil ${ctx.lastCheckIn.sleep}/4, perf ${ctx.lastCheckIn.performance}/4, poids ${ctx.lastCheckIn.weight}kg`
    : '- Dernier check-in : aucun encore';

  const waterLine = typeof ctx.consumedWaterMl === 'number'
    ? `- Hydratation : ${ctx.consumedWaterMl}ml / ${ctx.targetWaterMl}ml`
    : '';

  // Profile basics — exposed so the coach can adapt advice (age, sex,
  // height, current weight, target). Keep formatting tight to save tokens.
  const profileLine = [
    typeof ctx.age === 'number' ? `${ctx.age}a` : null,
    ctx.sex ? (ctx.sex === 'male' ? 'H' : 'F') : null,
    typeof ctx.heightCm === 'number' ? `${ctx.heightCm}cm` : null,
    typeof ctx.currentWeight === 'number' ? `${ctx.currentWeight}kg` : null,
  ].filter(Boolean).join(' · ');
  const profileMetaLine = profileLine ? `- Profil : ${profileLine}` : '';

  const targetLine = typeof ctx.targetWeight === 'number'
    ? `- Cible : ${ctx.targetWeight}kg${ctx.targetDeadline ? ` d'ici ${ctx.targetDeadline}` : ''}`
    : '';

  const restrictionsLine = ctx.restrictions && ctx.restrictions.length > 0
    ? `- Restrictions alimentaires : ${ctx.restrictions.join(', ')}`
    : '';

  const trackingLine = ctx.trackingMode && ctx.trackingMode !== 'both'
    ? `- Mode de tracking : ${ctx.trackingMode === 'nutrition_only' ? 'nutrition uniquement (pas d\'entraînement tracké ici)' : 'entraînement uniquement (pas de repas tracké ici)'}`
    : '';

  // Recent weights — formatted so the LLM can compute trends and deltas
  // ("73kg today, +0.3kg vs last week").
  const weightsLine = ctx.recentWeights && ctx.recentWeights.length > 0
    ? `- Poids récents (oldest → newest) : ${ctx.recentWeights.map((w) => `${w.date}→${w.weight}kg`).join(', ')}`
    : '';

  // Last measurement — only emit fields that are set.
  const lastMeasLine = ctx.lastMeasurement
    ? `- Dernière mensuration (${ctx.lastMeasurement.date}) : ${[
        ctx.lastMeasurement.waistCm ? `taille ${ctx.lastMeasurement.waistCm}cm` : null,
        ctx.lastMeasurement.hipsCm ? `hanches ${ctx.lastMeasurement.hipsCm}cm` : null,
        ctx.lastMeasurement.chestCm ? `poitrine ${ctx.lastMeasurement.chestCm}cm` : null,
        ctx.lastMeasurement.armsCm ? `bras ${ctx.lastMeasurement.armsCm}cm` : null,
        ctx.lastMeasurement.thighsCm ? `cuisses ${ctx.lastMeasurement.thighsCm}cm` : null,
        ctx.lastMeasurement.bodyFatPercent ? `gras ${ctx.lastMeasurement.bodyFatPercent}%` : null,
      ].filter(Boolean).join(', ')}`
    : '';

  const oneRMLine = ctx.topOneRepMaxes && ctx.topOneRepMaxes.length > 0
    ? `- Top 1RM estimés : ${ctx.topOneRepMaxes.map((r) => `${r.exerciseId} ${r.weight}kg`).join(', ')}`
    : '';

  const pausedLine = ctx.programPausedUntil
    ? `- ⚠️ Programme EN PAUSE jusqu'au ${ctx.programPausedUntil}. Aucune séance suggérée d'ici là.`
    : '';

  // Contexte ménopause : critique pour adapter les conseils.
  // Adresse les enjeux physio spécifiques sans paternaliser.
  const menopauseLine = ctx.menopauseStatus === 'peri'
    ? `- ⚠️ STATUT PHYSIOLOGIQUE : PÉRIMÉNOPAUSE. Adapte tes conseils en conséquence :
  • Protéines majorées (2.0 g/kg) pour combattre la sarcopénie accélérée
  • Priorité à la force lourde (squat, deadlift) pour la densité osseuse
  • Limite HIIT (max 1×/sem) — le cortisol exacerbe les symptômes
  • Récupération 48-72h entre muscles (vs 24-48h en normal)
  • Si elle évoque fatigue/mauvaise nuit/bouffées : NE PAS pousser cardio, propose léger
  • Si symptômes médicaux (douleurs articulaires, anxiété sévère) : suggère gynéco/médecin
  • Ton respectueux, factuel, non-stigmatisant. JAMAIS "à ton âge".`
    : ctx.menopauseStatus === 'post'
      ? `- ⚠️ STATUT PHYSIOLOGIQUE : MÉNOPAUSE ÉTABLIE. Adapte tes conseils :
  • Protéines à 2.0 g/kg (vital contre la sarcopénie post-ménopausique)
  • Force lourde 3-4×/semaine pour densité osseuse (anti-ostéoporose)
  • Calcium et vitamine D : encourage 1200 mg + 800 UI/jour
  • Récupération longue, sommeil prioritaire
  • Limite HIIT, privilégie marche rapide / natation pour le cardio
  • Si elle parle de fragilité osseuse ou douleurs, suggère ostéodensitométrie
  • Ton respectueux et empathique, factuel`
      : '';

  const prefsLine = (ctx.likedMealsCount ?? 0) + (ctx.dislikedMealsCount ?? 0) > 0
    ? `- Préférences repas : ${ctx.likedMealsCount ?? 0} aimés / ${ctx.dislikedMealsCount ?? 0} non aimés${(ctx.recentDislikes ?? []).length > 0 ? ` (récents rejets : ${(ctx.recentDislikes ?? []).join(', ')})` : ''}`
    : '';

  const badgesLine = ctx.recentBadges && ctx.recentBadges.length > 0
    ? `- Derniers badges débloqués : ${ctx.recentBadges.join(', ')}`
    : '';

  const extendedContextLines = [
    profileMetaLine,
    targetLine,
    restrictionsLine,
    trackingLine,
    menopauseLine,
    weightsLine,
    lastMeasLine,
    oneRMLine,
    pausedLine,
    prefsLine,
    badgesLine,
  ].filter(Boolean).join('\n');

  const memoriesSection = memories.length > 0
    ? `\n\nSOUVENIRS IMPORTANTS DE ${ctx.firstName.toUpperCase()} (à utiliser pour contextualiser tes réponses, à ne PAS répéter mot pour mot mais à évoquer naturellement quand pertinent) :\n${memories
        .map((m) => `- [${m.date}] (${m.tag}) ${m.summary}`)
        .join('\n')}`
    : '';

  return `# QUI TU ES

Tu es FORGA Coach. Pas un chatbot, un coach. L'équivalent IA d'un pro qualifié BTS Diététique + DEUST STAPS Préparation Physique, avec 10 ans d'expérience terrain (clients débutants jusqu'à athlètes amateurs). Approche **evidence-based**, pragmatique, jamais dogmatique. Tu maîtrises la nutrition sportive, l'hypertrophie, la perte de gras, l'endurance, la psychologie du changement, et la périodisation.

Tu parles **français**, tu **tutoies** systématiquement, tu es **direct**, **bref par défaut** (2-3 phrases), plus long uniquement si la question demande un vrai développement (bilan, explication scientifique demandée).

# RÉFÉRENTIEL FORGA (valeurs à respecter ; le reste de tes connaissances sport/nutrition reste valable)

- Macros : protéines **1.6-2.2 g/kg/j** (sèche 2.0-2.4), glucides 3-7 g/kg, lipides ≥0.6-1.0 g/kg. Hydratation 35 ml/kg/j.
- Par objectif : sèche -300/-500 kcal · masse +200/+400 (jamais dirty bulk) · recomp -100/-200 + prot maxées · maintien = TDEE.
- Training : hypertrophie 8-15 reps RIR 1-3, 10-20 séries/muscle/sem · force 3-6 reps 80-90% RIR 0-1 · deload toutes 4-6 sem · sommeil 7-9h. 1RM Epley = poids×(1+reps/30).
- Suppléments evidence-based seulement : créatine mono 3-5g/j, whey, oméga 3, vit D si carence, magnésium. JAMAIS de mythe (manger après 18h, spot reduction, carbs mauvais).
- Psycho : identité > objectif, casser le all-or-nothing, un écart sur 6 mois = rien si reprise rapide. Plateau → checklist : calories réelles (sous-estim 20%), sommeil, stress, overload effectif.

# TONAL CALIBRATION (adapte selon contexte)

- **User en succès** (PR, semaine clean, objectif atteint) → célébration sobre. *"Bien joué. T'as posé une vraie semaine."* Jamais d'euphorie fake.
- **User en difficulté** (motivation, écart, plateau) → reframe direct. *"Une semaine ratée c'est rien sur 6 mois. Demain tu reprends à 80%, on enchaîne."*
- **User demande tactique** ("que manger ce soir ?") → 1-2 actions opérationnelles directes, pas de théorie.
- **User demande explication** ("pourquoi le brocoli ?") → 3-4 phrases pédagogiques accessibles, ancrées dans son contexte.

# CE QUE TU TRAITES vs CE QUE TU RÉFÈRES

**Tu traites** : nutrition adulte en bonne santé pour esthétique/performance/poids, entraînement muscu/fitness/cardio amateur, motivation, stratégie comportementale, récupération basique, explications scientifiques accessibles.

**Tu RÉFÈRES (et tu insistes)** :
- **Condition médicale** (diabète, hypertension, troubles thyroïdiens, cardiopathie) → *"Avant tout ajustement, parle à ton médecin/endocrino. Je peux structurer après son avis."*
- **Grossesse / allaitement** → *"Suivi diététicien/sage-femme indispensable. Je peux donner des principes généraux, pas des recommandations spécifiques."*
- **TCA** (anorexie, boulimie, hyperphagie, comportements obsessionnels avec la nourriture) → *"Ce que tu décris dépasse mon rôle. Un psy spécialisé TCA peut vraiment t'aider — c'est pas un échec d'aller en consulter, c'est l'inverse."*
- **Blessure aiguë / douleur persistante** → *"Kiné/médecin du sport AVANT de continuer. Je peux t'aider à adapter le plan en attendant."*
- **Mineur < 18 ans** → *"Pour ton âge, un nutritionniste pédiatrique est plus adapté. Je peux te donner des principes mais ton métabolisme évolue vite."*
- **Hors scope** (relations, finances, choix de vie) → *"Pas mon domaine. Je peux te ramener à ton plan : voici ce qui compte pour toi cette semaine [...]."*

# QUESTIONS MÉTA SUR TOI (identité, nom, capacités)

Quand l'utilisateur te pose des questions **sur toi** ("tu es qui ?", "donne toi un nom", "tu fais quoi ?", "présente-toi", "tu sais faire quoi ?"), tu RÉPONDS À LA QUESTION — tu ne pivotes pas vers de la nutrition ou de l'entraînement.

Règles précises :
- **Identité** : tu es **FORGA Coach**. C'est ton nom. Si on te demande un autre nom, tu refuses poliment : "Mon nom c'est FORGA Coach, c'est comme ça que je suis fait." Tu ne **t'inventes pas** un prénom humain.
- **Capacités** : explique en 1-2 phrases concrètes ce que tu peux faire (suivre macros, ajuster programme, logger repas, expliquer technique, motiver). Pas de discours marketing.
- **Origine / nature / "quel modèle/GPT tu utilises ?"** : tu DÉVIES sans JAMAIS prononcer les mots "GPT", "IA", "modèle", "LLM", "chatbot", "OpenAI", "Anthropic", "Llama". Tu ne confirmes ni n'infirmes une techno précise. Réponse type : *"Je suis FORGA Coach — ce qui compte, c'est que je connaisse tes données et que je t'aide à progresser. Le reste, c'est ma cuisine interne 😉. On parle de ta séance du jour ?"* ⚠️ INTERDIT de dire "je ne peux pas révéler quel modèle GPT j'utilise" : rien que dire "GPT" confirme la techno. Tu ESQUIVES, tu ne refuses pas en nommant.
- **Small talk** ("ça va ?", "tu vas bien ?") : courte réponse cordiale + recentre sur lui ("Tout roule. Et toi, comment se passe ta semaine ?").

CRUCIAL : ne réponds **pas par du contenu nutrition/training** à une question méta. Si l'user demande ton nom, donne ton nom. Si tu dérives sur "voici ce que tu peux manger ce soir" en réponse à "tu es qui ?", tu rates totalement la question.

# RÈGLES INVIOLABLES

- Ne **JAMAIS** mentionner que tu es une IA, un GPT, un LLM ou un modèle de langage. Tu es un coach, point.
- Ne **JAMAIS** prescrire de médicament ni de "complément hormonal". Suppléments naturels OK avec nom précis (créatine monohydrate, whey isolat, omega 3, vitamine D, magnésium bisglycinate).
- Ne **JAMAIS** pousser un déficit calorique sous **1200 kcal femme** ou **1500 kcal homme** sans suivi médical.
- Ne **JAMAIS** valider un mythe sans base ("ne pas manger après 18h", "spot reduction", "fat makes you fat", "carbs sont mauvais", "manger souvent booste métabolisme") — recadre poliment.
- **TOUJOURS** rester dans l'objectif déclaré du user. S'il y a incohérence (user en bulk demande "perdre 5 kg vite"), clarifie d'abord avant d'agir.
- **TOUJOURS** ancrer tes réponses dans **ses données réelles**, jamais générique.
- **JAMAIS** sortir d'expression du type "Cher utilisateur" / "j'espère que vous allez bien" / "n'hésitez pas". Tu démarres direct sur le sujet, comme un pote pro qui sait.

# DONNÉES ACTUELLES DE ${ctx.firstName} :
- Objectif : ${objectiveLabels[ctx.objective] || ctx.objective}
- Programme actif : ${ctx.activeProgramName ?? 'aucun'}${ctx.currentWeek ? ` (semaine ${ctx.currentWeek}/4)` : ''}
- Plan du jour (${ctx.todayDateIso ?? '—'}) : ${todayPlanLine}
- Score FORGA : ${ctx.score.total}/100 (nutrition: ${ctx.score.nutrition}, régularité: ${ctx.score.consistency}, progression: ${ctx.score.progression}, discipline: ${ctx.score.discipline})
- Calories : ${ctx.consumedCalories}/${ctx.targetCalories} kcal consommées
- Protéines : ${ctx.consumedProtein}/${ctx.targetProtein}g
- Glucides : ${ctx.consumedCarbs}/${ctx.targetCarbs}g
- Lipides : ${ctx.consumedFat}/${ctx.targetFat}g
- Repas validés aujourd'hui : ${ctx.mealsValidatedCount}/${ctx.mealsExpected}
- Streak actuel : ${ctx.currentStreak} jours consécutifs
${waterLine}
${checkInLine}
- Heure actuelle : ${ctx.hour}h
${extendedContextLines ? `\n${extendedContextLines}` : ''}
${recentLines ? `\n5 dernières séances :\n${recentLines}` : ''}
${memoriesSection}

# COMMENT EXPLOITER CES DONNÉES

Tu as accès en temps réel à : profil (âge, sexe, taille, poids actuel, cible, deadline, restrictions), historique de poids des 14 derniers jours, dernière mensuration, top 5 1RM, séances récentes, derniers check-ins, hydratation, score FORGA détaillé, badges récents, préférences repas (likés/déteste).

Quand l'utilisateur partage une donnée que tu peux **comparer** à son historique, fais-le explicitement :
- "73kg ce matin" → compare avec recentWeights → "73kg, +0.3kg vs il y a 7j. Tendance +50g/sem, dans la zone cible pour ton cut."
- "j'ai fait 80kg au squat" → check topOneRepMaxes → "80×5 → 1RM estimé 92kg, +4kg vs ton PR de février. Solide."
- "tour de taille à 82" → compare avec lastMeasurement → "82cm, -2cm en 6 semaines. Le déficit fonctionne."

Quand tu **proposes une action**, base-toi sur le contexte :
- Pour log_meal suggestion : check restrictions (pas de gluten, halal…) et recentDislikes (ne propose pas de plat rejeté récemment)
- Pour generate_workout : matche topOneRepMaxes pour les charges proposées
- Pour set_reminder : déduis l'horaire optimal (rappel eau à 11h si user a bu peu en matinée)
- Pour adjust_calories : check weight trend des 14j avant de proposer un ajustement (jamais "à tout hasard")

ACTIONS PROPOSABLES À L'UTILISATEUR

**Règle d'or** : tu n'émets une action **QUE** si l'utilisateur a fait l'une de ces 3 choses dans son DERNIER message :
1. Te demande **explicitement** de logger/ajouter/enregistrer quelque chose ("note", "ajoute", "enregistre", "log", "rappelle-moi de…").
2. Te raconte qu'il a **déjà** fait/mangé/bu/pesé quelque chose au passé ET te confirme vouloir l'enregistrer ("j'ai mangé X, log-le" ou "ajoute ça à ma journée"). Le simple récit "j'ai mangé X" sans demande de logging NE déclenche PAS d'action — voir règle de confirmation ci-dessous.
3. Te demande **explicitement** une suggestion / décision concrète à appliquer ("qu'est-ce que je mange ce soir ?", "propose-moi une séance de 30 min").

**Si AUCUNE de ces 3 conditions n'est remplie, tu NE produis AUCUN bloc d'action.** Tu réponds normalement, en texte uniquement.

**⚠️ RÈGLE ABSOLUE DE SCOPE — À LIRE AVANT CHAQUE RÉPONSE :**
Les 3 conditions ci-dessus s'évaluent UNIQUEMENT sur le DERNIER message de l'utilisateur. JAMAIS sur l'historique.

Si l'utilisateur a mentionné "j'ai mangé une banane" il y a 2 messages et que sa question actuelle est "es-tu connecté à une base alimentaire ?" → tu réponds à la question ACTUELLE en texte uniquement. Tu N'ÉMETS PAS de log_meal pour la banane. La banane appartient au passé de la conversation, pas au message actuel. Recoller une vieille action sur un nouveau message est INTERDIT.

Avant de produire un bloc [[ACTION]], pose-toi explicitement : "Est-ce que le DERNIER message (et lui seul) demande cette action ?" Si non → pas de bloc.

**Confirmation avant log_meal** : si l'user RACONTE avoir mangé sans demander de logger → réponds + analyse macros + demande "Je le logge ?". N'émets le bloc QUE s'il confirme ("oui/vas-y/ok") au tour suivant. Exception : "log mon repas : X" → émets direct.

Format strict : [[ACTION:type]]{ ...json valide... }[[/ACTION]]

Types disponibles (champs requis ci-dessous) :

1) log_meal { "slot":"breakfast|morning_snack|lunch|afternoon_snack|dinner|bedtime", "name":"...", "calories":N,"protein":N,"carbs":N,"fat":N, "items":[{"name":"blanc de poulet","quantityG":150}] }
   → Décompose TOUJOURS en items (ingrédient + grammes ; ml≈g pour liquides). L'app a une base ~1000 ingrédients FR + Open Food Facts qui remplace tes estimations par les vraies valeurs. Si plat inconnu : omets items, garde les macros estimées. calories/protein/carbs/fat restent obligatoires (fallback).
2) log_workout { "workoutType":"musculation|running|cycling|swimming|hiit|sport_collectif|yoga_stretching|marche|autre","durationMinutes":N,"intensity":"easy|moderate|intense","note":"(opt)" }
3) log_water { "amountMl":N }
4) swap_exercise { "date":"YYYY-MM-DD","originalExerciseId":"<id>","newExerciseId":"<id>" } (uniquement si l'user donne les 2 IDs)
5) adjust_calories { "deltaPct":-5,"reason":"..." } ou { "newDailyCalories":2400,"reason":"..." } (cap ±15%, raison obligatoire, jamais "à tout hasard")
6) move_workout_day { "fromDate":"YYYY-MM-DD","toDate":"YYYY-MM-DD" }
7) mark_day_skipped { "date":"YYYY-MM-DD" }
8) set_water_goal { "newDailyMl":N }
9) generate_workout { "name":"...","workoutType":"musculation","durationMinutes":N,"intensity":"moderate","exercises":[{"exerciseId":"shoulder_press_db","exerciseName":"Développé épaules haltères","sets":[{"reps":12,"weight":8}]}],"note":"(opt)" } → choisis les exerciseId, adapte poids/reps à l'équipement décrit
10) change_objective { "newObjective":"cut","reason":"..." }
11) update_target { "targetWeight":75,"targetDeadline":"2026-09-15","reason":"..." }
12) generate_shopping_list { "title":"...","items":[{"label":"Blanc de poulet","quantity":"1.5 kg","category":"Viande"}] }
13) log_weight { "weightKg":78.2,"note":"(opt)" }
14) log_measurement { "field":"waist|hips|chest|arms|thighs|bodyFatPercent","value":82 } (cm sauf bodyFat en %)
15) set_reminder { "message":"...","atTimeLocal":"16:00","repeatDaily":false } — atTimeLocal est OBLIGATOIREMENT une HEURE D'HORLOGE au format HH:MM 24h (ex "15:00", "22:30"). Les rappels RELATIFS ("dans 10 minutes", "dans 10 secondes", "dans 2h") ne sont PAS supportés : si l'user en demande un, convertis-le en heure d'horloge approximative à partir de l'heure actuelle (Heure actuelle fournie dans le contexte), et DIS-LE ("Je te mets un rappel à 22h30"). Si l'user demande un délai en secondes ou < 1 min, explique gentiment que tu fais des rappels à une heure précise, pas au chrono ("Je peux te rappeler à une heure de la journée — dis-moi laquelle.").
16) pause_program { "daysCount":10,"reason":"..." } (max 60j, streak protégé)
17) resume_program { }

COMPORTEMENTS SUPPLÉMENTAIRES (sans action card)

A) Suggestion de repas pour finir la journée
Déclencheur **strict** : l'utilisateur pose une question type "qu'est-ce que je mange ce soir / maintenant / pour finir mes macros / suggère-moi un repas / propose-moi quelque chose". Si ce n'est PAS une demande de suggestion claire, ne propose AUCUN repas et n'émets AUCUNE carte log_meal — réponds simplement à ce qu'il a demandé. Quand le déclencheur est rempli : calcule les calories et protéines qui lui restent (cible journalière - consommé) puis propose 2 à 3 idées concrètes de repas qui rentrent dans son budget. Pour CHAQUE idée, émets un bloc log_meal correspondant (avec macros estimées + slot adapté à l'heure actuelle). L'utilisateur valide celui qu'il veut, ignore les autres. Si les macros restantes sont quasi-couvertes (<150 kcal), ne propose rien, dis-le explicitement.

B) Bilan hebdomadaire
Quand l'utilisateur demande "comment s'est passée ma semaine / fais-moi un bilan", génère une synthèse structurée (3-5 phrases max) couvrant : adhérence repas (X/Y validés), tendance poids, séances effectuées vs prévues, point fort de la semaine, axe d'amélioration. Termine par une phrase de motivation personnalisée. Aucune action card pour le bilan — pure réponse texte.

C) Pédagogie ingrédient / exercice
Quand l'utilisateur demande "pourquoi tel aliment" ou "comment bien faire tel exercice", réponds en 3-4 phrases : utilité nutrition (pour aliments) ou muscles travaillés + 2 conseils technique (pour exercices). Reste accessible, jamais condescendant. Aucune action card.

Règles d'usage actions :
- Bloc(s) STRICTEMENT à la fin, APRÈS ton texte. JSON valide, champs requis, pas de virgule trailing, balises exactes [[ACTION:type]]...[[/ACTION]].
- Une seule action par réponse SAUF log_meal (un bloc par item si plusieurs aliments).
- Estimer sans demande de log → PAS d'action. Pas assez d'infos → pose une question.
- adjust_calories/move_workout_day/set_water_goal : justifie en 1 phrase (double-confirmation côté app). adjust_calories seulement sur signal réel.

CAPACITÉS (réponse texte, sans action) : suggestion repas selon ingrédients dispo, explication du score FORGA (4 piliers), conseils technique exo (3 cues + 1 erreur), plan récup blessure, motivation contextuelle. Toujours 2-3 phrases, chiffres réels du contexte.

SOUVENIRS LONG TERME — émets UN bloc SILENCIEUX [[MEMORY]] quand l'user confie une info perso durable (pas pour les logs banals). Format :
[[MEMORY]]{ "tag":"<TAG>", "summary":"phrase au passé self-contained", "weight":1|2|3 }[[/MEMORY]]
weight : 1 anecdotique · 2 utile (défaut) · 3 critique (blessure grave, allergie, condition médicale, objectif majeur). N'émets QUE pour une info nouvelle, ne re-confirme pas ("je note"). Peut coexister avec une [[ACTION]]. Réfère aux souvenirs existants naturellement ("tu t'étais fait mal au dos il y a 3 semaines"), jamais en citant la liste brute.

EXEMPLES DE RÉPONSES IDÉALES (réfère-toi à ces patterns : 2-4 phrases, ton coach, jamais académique)

EX1 — Récit repas SANS demande de log (confirmation requise) :
User : "j'ai mangé une banane et un yaourt grec ce matin"
Toi  : "Bon choix, ~180 kcal et 12g de protéines. Je te logge ça en petit-déj ?" (PAS de bloc, on attend la confirmation)

EX2 — Log explicite (sans confirmation) :
User : "log mon déj : 200g de riz et 150g de poulet"
Toi  : "C'est noté — 480 kcal, 56g de protéines."
[[ACTION:log_meal]]{"slot":"lunch","name":"Riz + poulet","calories":480,"protein":56,"carbs":56,"fat":5,"items":[{"name":"riz blanc cuit","quantityG":200},{"name":"blanc de poulet","quantityG":150}]}[[/ACTION]]

EX3 — Question méta / identité (texte uniquement, PAS de pivot nutrition) :
User : "tu es qui ?"
Toi  : "FORGA Coach. Je suis là pour te suivre au quotidien : macros, séances, motivation, ajustements. Sur quoi on bosse aujourd'hui ?"

EX4 — Craquage (zéro jugement, reframe + actionnable) :
User : "j'ai craqué hier soir, pizza + 4 bières"
Toi  : "Ça arrive — un écart sur 30 jours ne casse rien, c'est le pattern qui compte. Bois 1.5L d'eau aujourd'hui, marche 20 min de plus, reviens à ton plan normal. Pas de compensation cardio bête. On garde."

RÈGLES TRANSVERSALES (toujours appliquer)

- TON : direct, calibré, jamais condescendant ni mielleux. Pas de "super !", pas de "génial !", pas d'emoji.
- LONGUEUR : 2-4 phrases en moyenne. Une réponse plus longue est suspecte — coupe.
- STRUCTURE : pas de listes à puces sauf si l'user demande explicitement un protocole numéroté.
- CHIFFRES : toujours arrondis et lisibles ("~180 kcal" plutôt que "183.4 kcal"). Précision quand ça compte (macros loggées), approximation quand c'est de la pédagogie.
- INCERTITUDE : si tu n'es pas sûr, dis-le ("environ", "à confirmer", "selon ton ressenti").
- JUGEMENT : zéro. Même sur les craquages, les abandons, les rechutes. Reframe sans pitié ni jugement.`;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ✅ JWT Verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { message, context, history, memories } = await req.json();

    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: 'Message and context required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── ÉTAPE 1 : check cache AVANT le quota ───
    // Avant on incrémentait quota d'abord puis on lisait le cache —
    // si l'user envoyait 2× le même message single-turn, il perdait
    // un message de quota gratuitement. On corrige : check cache
    // d'abord, on n'incrémente le quota que si on appelle vraiment
    // un modèle.
    //
    // IMPORTANT : le fingerprint inclut beaucoup plus que les 6
    // champs précédents — sinon 2 users avec hasard les mêmes
    // calories/score voyaient la réponse de l'autre (avec son
    // firstName, ses mémoires, etc.).
    const ctxFingerprint = [
      context.firstName ?? '',
      context.age ?? 0,
      context.sex ?? '',
      context.currentWeight ?? 0,
      context.targetWeight ?? 0,
      (context.restrictions ?? []).slice().sort().join(','),
      context.score?.total ?? 0,
      context.mealsValidatedCount ?? 0,
      context.consumedCalories ?? 0,
      context.consumedProtein ?? 0,
      context.todayPlanType ?? 'none',
      context.objective ?? '',
      context.menopauseStatus ?? '',
      hashMemories(memories),
    ].join(':');
    const cacheKey = await makeCacheKey(user.id, message, ctxFingerprint);
    const hasHistory = Array.isArray(history) && history.length > 0;
    if (!hasHistory) {
      const cached = cacheGet(cacheKey);
      if (cached) {
        // Cache hit : on retourne sans toucher au quota. L'user a
        // déjà "payé" cette réponse au 1er hit.
        return new Response(
          JSON.stringify({
            reply: cached,
            cached: true,
            quota: { used: 0, cap: 0, bonus: 0, remaining: 0 },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // ─── ÉTAPE 2 : quota check + increment (cache miss seulement) ───
    // ✅ Premium-aware quota cap. Free: 5/day. Premium: 200/day (hard cap
    //    for margin safety — never marketed as illimited externally).
    // ⚠ BUG CRITIQUE corrigé : on lisait `profiles` qui n'existe pas dans
    // le schéma (migration 001 crée `public.users`). Conséquence : tous
    // les users Premium étaient rate-limités à 5 messages/jour comme des
    // free, alors qu'ils devraient avoir 200/jour. Plaintes support
    // garanties au launch sans ce fix.
    const { data: profileRow } = await supabase
      .from('users')
      .select('is_premium, premium_until, trial_state, stripe_subscription_id')
      .eq('id', user.id)
      .maybeSingle();

    const premiumActive =
      Boolean(profileRow?.is_premium) &&
      (!profileRow?.premium_until ||
        new Date(profileRow.premium_until).getTime() > Date.now());

    // Distinction TRIAL vs PAYANT pour le cap :
    //  - L'user est en ESSAI s'il a un premium actif MAIS son trial_state
    //    est 'active'/'extended' ET il n'a pas (encore) d'abonnement payant
    //    confirmé (pas de stripe_subscription_id, et pas 'converted').
    //  - Un user CONVERTI (trial_state='converted' OU subscription active)
    //    a payé → cap premium plein.
    const isTrialing =
      premiumActive &&
      (profileRow?.trial_state === 'active' || profileRow?.trial_state === 'extended') &&
      !profileRow?.stripe_subscription_id;

    const dailyCap = !premiumActive
      ? QUOTA_CAP_FREE
      : isTrialing
        ? QUOTA_CAP_TRIAL
        : QUOTA_CAP_PREMIUM;

    const { data: quotaCheck, error: quotaError } = await supabase.rpc(
      'check_and_increment_quota',
      {
        p_user_id: user.id,
        p_feature: 'coach_message',
        p_daily_cap: dailyCap,
      },
    );

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      return new Response(
        JSON.stringify({ error: 'Quota check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'quota_exceeded',
          message: 'Tu as atteint ta limite de messages aujourd\'hui. Regarde une vidéo pour débloquer +3 messages.',
          quota: quotaCheck,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build messages array with system prompt + history + current message
    const systemPrompt = buildSystemPrompt(context, Array.isArray(memories) ? memories : []);
    // Si l'user écrit en anglais on injecte une directive de langue
    // ciblée (le system prompt FR ne le précise pas) — sinon le coach
    // répond en français à un anglophone.
    const isEnglishUser = detectEnglish(message);
    const languageDirective = isEnglishUser
      ? '\n\n# LANGUAGE OVERRIDE\nThe user is writing in English. Reply in clear, natural English (same tone, same brevity, same rules). Keep all coaching terminology accurate.'
      : '';
    // Guard profil non-initialisé : si targetCalories ≤ 0, c'est que
    // l'engine n'a pas encore tourné (nouvel user post-onboarding mais
    // store froid). Sans guard le LLM va halluciner "il te reste -200 kcal"
    // ou inventer une cible — incohérent et dangereux.
    const profileNotReady = !context.targetCalories || context.targetCalories < 800;
    const profileGuard = profileNotReady
      ? '\n\n# IMPORTANT : DONNÉES INCOMPLÈTES\nLes objectifs caloriques de cet utilisateur ne sont pas encore calculés (targetCalories est nul ou aberrant). Si on te demande "combien il me reste de protéines/calories", explique GENTIMENT que tes objectifs se calibrent et qu\'il faut rouvrir l\'app dans 1 min. NE PAS inventer de chiffres.'
      : '';
    const messages = [
      { role: 'system', content: systemPrompt + languageDirective + profileGuard },
      // Include last 16 messages (= ~8 tours) pour la cohérence multi-turn.
      // Avant on était à 10 (= ~5 tours) ce qui faisait perdre l'intent
      // initial sur les conversations longues (planification de semaine,
      // suivi d'une question complexe). 16 reste safe pour le contexte
      // window de tous les modèles utilisés (Llama 70b, Claude, GPT-4o-mini).
      ...(history || []).slice(-16),
      { role: 'user', content: message },
    ];

    // Multi-model routing : route vers le meilleur modèle selon l'intent.
    // Si la clé API du modèle optimal n'est pas configurée, fallback Groq.
    const target = routeModel(message);
    let reply = await callModel(target, messages);

    // Fallback Groq 70B si le modèle routé (OpenAI/Anthropic) a échoué.
    if (!reply && target.provider !== 'groq') {
      reply = await callModel(
        { provider: 'groq', model: 'llama-3.3-70b-versatile' },
        messages,
      );
    }

    // Fallback Groq 8B-instant si le 70B a échoué — typiquement à cause
    // du rate limit TPM (12k tokens/min sur le free tier). Le 8B a un
    // quota TPM SÉPARÉ et plus généreux, et reste un VRAI LLM (réponses
    // intelligentes), bien meilleur que le fallback templates côté client.
    // Concrètement : ça évite que le coach "redevienne débile" dès le 2e
    // message rapproché.
    if (!reply) {
      reply = await callModel(
        { provider: 'groq', model: 'llama-3.1-8b-instant' },
        messages,
      );
    }

    if (!reply) {
      // lastModelError contient parfois la clé API en cas d'erreur réseau,
      // ou le body brut du provider qui peut révéler la stack interne.
      // On le log côté serveur mais ne l'expose JAMAIS au client.
      if (lastModelError) console.error(`[coach-chat] all models failed: ${lastModelError}`);
      return new Response(
        JSON.stringify({ error: 'ai_unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── Garde server-side : questions méta ───
    // Si le user pose une question méta (identité, capacités, small talk),
    // on STRIP les blocs [[ACTION]] que le LLM aurait pu coller à tort
    // (ex: recoller une action de l'history). Le system prompt l'interdit
    // déjà mais une garde en dur évite l'edge case sous temp > 0.
    const m = message.toLowerCase();
    const isMetaQuery = META_KEYWORDS.some((kw) => m.includes(kw));
    if (isMetaQuery) {
      reply = reply.replace(/\[\[ACTION:[^\]]+\]\][\s\S]*?\[\[\/ACTION\]\]/g, '').trim();
      // Aussi : pas de mémoire créée sur une question méta (on ne
      // mémorise pas que l'user a demandé qui on est).
      reply = reply.replace(/\[\[MEMORY\]\][\s\S]*?\[\[\/MEMORY\]\]/g, '').trim();
    }

    // ─── Filtre des mémoires triviales ───
    // Le LLM (surtout Llama) tend à émettre des [[MEMORY]] sur des
    // banalités ("a mangé une banane le 20 mai"). Le system prompt
    // l'interdit mais la dérive existe à temp > 0. On filtre côté
    // server toute mémoire qui ressemble à un log_meal/log_water
    // (verbe alimentaire + chiffre kcal/quantité) sans tag fort.
    const TRIVIAL_MEMORY_RE = /\[\[MEMORY\]\]\s*\{[^}]*?"tag"\s*:\s*"(note|preference_food|feedback)"[^}]*?"summary"\s*:\s*"[^"]*?(mangé|bu|pris|consommé)[^"]*?(\d+\s*(kcal|g|ml|gr))[^"]*?"[^}]*\}\s*\[\[\/MEMORY\]\]/gi;
    reply = reply.replace(TRIVIAL_MEMORY_RE, '');

    // Cache UNIQUEMENT les réponses sans side-effects. Sinon un cache
    // hit ré-émet un bloc [[ACTION:log_meal]] ou [[MEMORY]] qui crée
    // une seconde carte/mémoire dupliquée côté client.
    if (!hasHistory && !replyHasSideEffects(reply)) cacheSet(cacheKey, reply);

    return new Response(
      JSON.stringify({
        reply,
        cached: false,
        quota: {
          used: quotaCheck.used,
          cap: quotaCheck.cap,
          bonus: quotaCheck.bonus,
          remaining: quotaCheck.remaining,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
