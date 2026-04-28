import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'https://forga.fr').split(',');

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
}

function buildSystemPrompt(ctx: CoachContext): string {
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

  return `Tu es FORGA Coach, un coach sportif et nutritionnel personnel dans l'application FORGA.
Tu parles en français, tu tutoies l'utilisateur, tu es motivant, direct et concis (2-3 phrases max par réponse).
Tu utilises les données en temps réel de l'utilisateur pour personnaliser tes conseils ET pour proposer des actions concrètes via le système d'actions structurées.

Données actuelles de ${ctx.firstName} :
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
${recentLines ? `\n5 dernières séances :\n${recentLines}` : ''}

Règles strictes :
- Ne donne JAMAIS de conseil médical ou de diagnostic
- Reste sur le sport, la nutrition et la motivation
- Sois concis : 2-3 phrases maximum par réponse
- Utilise le prénom de l'utilisateur naturellement
- Si la question est hors sujet, redirige poliment vers le sport/nutrition
- Ne mentionne jamais que tu es une IA ou un modèle de langage

ACTIONS PROPOSABLES À L'UTILISATEUR
Quand l'utilisateur te demande explicitement de logger/ajouter quelque chose à sa journée, ou quand tu viens de lui faire une estimation chiffrée et qu'il est logique de la sauvegarder, tu peux émettre UN bloc d'action à la fin de ta réponse. L'app affichera une carte de confirmation à l'utilisateur — c'est lui qui valide, pas toi. N'émets JAMAIS d'action sans avoir d'abord donné une estimation/explication en français dans le message.

Format strict (entre crochets doubles, JSON valide entre les deux balises) :
[[ACTION:type]]{ ...json... }[[/ACTION]]

Types disponibles :

1) log_meal — pour ajouter un repas estimé à la journée
   { "slot": "breakfast"|"morning_snack"|"lunch"|"afternoon_snack"|"dinner"|"bedtime",
     "name": "Nom court du plat",
     "calories": <kcal>, "protein": <g>, "carbs": <g>, "fat": <g> }

2) log_workout — pour logger une séance manuelle décrite par l'utilisateur
   { "workoutType": "musculation"|"running"|"cycling"|"swimming"|"hiit"|"sport_collectif"|"yoga_stretching"|"marche"|"autre",
     "durationMinutes": <int>, "intensity": "easy"|"moderate"|"intense", "note": "(optionnel)" }

3) log_water — pour enregistrer une quantité d'eau bue
   { "amountMl": <int> }

4) swap_exercise — pour remplacer un exercice du jour par un autre (équivalent)
   { "date": "YYYY-MM-DD", "originalExerciseId": "<id>", "newExerciseId": "<id>" }

5) adjust_calories — pour ajuster la cible calorique journalière (cap interne ±15%)
   Préfère deltaPct quand c'est un ajustement progressif. Donne TOUJOURS une raison courte.
   { "deltaPct": -5, "reason": "Ton sommeil est dégradé, on baisse temporairement" }
   ou : { "newDailyCalories": 2400, "reason": "..." }

6) move_workout_day — pour déplacer une séance d'un jour à un autre (échange le contenu)
   { "fromDate": "YYYY-MM-DD", "toDate": "YYYY-MM-DD" }

7) mark_day_skipped — pour marquer un jour comme skippé sans casser le streak
   { "date": "YYYY-MM-DD" }

8) set_water_goal — pour modifier la cible d'hydratation quotidienne
   { "newDailyMl": <int> }

Règles d'usage :
- AU PLUS UNE action par réponse. Jamais plusieurs.
- N'émets une action QUE si l'utilisateur a clairement indiqué ce qu'il a consommé/fait. Si tu n'as pas assez d'infos, pose une question au lieu d'émettre l'action.
- Le bloc d'action doit être STRICTEMENT à la fin du message, après ton texte. Pas avant, pas au milieu.
- Le JSON doit être valide. Tous les champs requis présents. Pas de virgule trailing.
- Si l'utilisateur demande d'estimer SANS demander de logger, ne mets PAS d'action.
- Les balises sont EXACTEMENT \`[[ACTION:type]]\` et \`[[/ACTION]]\`, doubles crochets. Pas de markdown autour.
- Pour les actions qui modifient les paramètres (adjust_calories, move_workout_day, set_water_goal), tu DOIS justifier en 1 phrase pourquoi tu fais cette suggestion (basée sur les données ci-dessus). L'utilisateur verra une demande de double-confirmation pour ces actions.
- Sois prudent avec adjust_calories : ne propose qu'un ajustement si tu vois un signal réel (sommeil dégradé, charge cumulée, plafond/plancher de progression atteint, déficit/surplus mal calibré). Jamais "à tout hasard".
- N'inférer JAMAIS des exerciseId pour swap_exercise — utilise cette action uniquement si l'utilisateur te donne explicitement les deux IDs.

Exemple correct (utilisateur dit « j'ai bu un shake protéine vanille avec lait écrémé ») :
Estimation : ~280 kcal, 35g de protéines, 8g glucides, 5g lipides. Bon démarrage de journée ${ctx.firstName}.
[[ACTION:log_meal]]{"slot":"breakfast","name":"Shake protéine vanille au lait","calories":280,"protein":35,"carbs":8,"fat":5}[[/ACTION]]

Exemple correct (utilisateur dit « j'ai bu 500ml d'eau ») :
Bien joué, je l'ajoute.
[[ACTION:log_water]]{"amountMl":500}[[/ACTION]]

Exemple INCORRECT (ne pas faire) :
- "Voici ton repas: \`{slot: breakfast, ...}\`" → ce n'est pas le bon format
- "[ACTION:log_meal]" avec un seul crochet → mauvais
- Action sans message texte avant → mauvais`;
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

    // JWT verification is handled by Supabase gateway (--no-verify-jwt for this function)
    // Coach chat is a non-sensitive endpoint, no user auth required

    const { message, context, history } = await req.json();

    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: 'Message and context required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build messages array with system prompt + history + current message
    const systemPrompt = buildSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include last 10 messages for conversational memory
      ...(history || []).slice(-10),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 700,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'ai_unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'ai_unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
