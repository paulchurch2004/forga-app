// FORGA — Deterministic coach fallback.
// Used when the LLM Edge Function is unreachable (offline, server error,
// quota exceeded with a sensible default). Generates a short canned reply
// keyed off keywords in the user's message + a few signal points from the
// context. Intentionally simple — the goal is "graceful degradation, not
// embarrassing", never to replace the LLM.

import type { CoachContext } from '../engine/coachChatEngine';

const KEYWORDS = {
  protein: /\b(prot[eé]ine|protein|prot|whey)\b/i,
  calories: /\b(calor|kcal|cal\b|calorie)\b/i,
  weight: /\b(poids|peser|p[èe]se|weight|kg)\b/i,
  workout: /\b(s[eé]ance|workout|muscu|sport|entra[iî]nement|training)\b/i,
  meal: /\b(repas|manger|d[ée]jeuner|d[îi]ner|petit-d[ée]j|meal|eat|food)\b/i,
  motivation: /\b(motiv|d[ée]courag|abandon|pas envie|tired|fatigu)\b/i,
  rest: /\b(repos|rest|recup|sommeil|dormir|sleep|fatigu)\b/i,
  goal: /\b(objectif|but|goal|target|prog[reè]s|progress)\b/i,
};

function pickReply(intent: keyof typeof KEYWORDS, ctx: CoachContext): string {
  const name = ctx.firstName || '';
  const namePrefix = name ? `${name}, ` : '';
  const proteinGap = Math.max(0, (ctx.targetProtein ?? 0) - (ctx.consumedProtein ?? 0));
  const caloriesGap = (ctx.targetCalories ?? 0) - (ctx.consumedCalories ?? 0);
  const score = ctx.score?.total ?? 0;

  switch (intent) {
    case 'protein':
      if (proteinGap > 30) {
        return `${namePrefix}il te reste ${proteinGap}g de proteines a couvrir aujourd'hui. Privilegie un repas avec viande maigre, oeufs ou un shake si tu manques de temps.`;
      }
      return `${namePrefix}tu es deja bien sur tes proteines (${ctx.consumedProtein ?? 0}/${ctx.targetProtein ?? 0}g). Maintiens le cap.`;
    case 'calories':
      if (caloriesGap < 0) {
        return `${namePrefix}tu as depasse ta cible calorique de ${Math.abs(caloriesGap)} kcal. Pas grave si c'est isole — ajuste demain en buvant beaucoup d'eau et en evitant les grignotages du soir.`;
      }
      return `${namePrefix}il te reste ${caloriesGap} kcal a consommer. Vise un dernier repas equilibre avec des proteines et des legumes.`;
    case 'weight':
      return `${namePrefix}le poids fluctue de 1-2 kg par jour selon l'hydratation et le sodium. Ce qui compte c'est la moyenne sur 7-10 jours, pas un jour isole.`;
    case 'workout':
      return `${namePrefix}une bonne seance c'est 80% de regularite et 20% d'intensite. Mieux vaut 3 seances par semaine constantes qu'une fois par mois a fond.`;
    case 'meal':
      return `${namePrefix}les meilleurs repas pour ton objectif (${ctx.objective}) sont dans ta liste personnalisee. Valide-en un et la suite vient naturellement.`;
    case 'motivation':
      return `${namePrefix}les jours sans motivation sont les plus importants. Fais juste 1 chose: un repas valide, ou 10 min de marche. Le momentum revient ensuite.`;
    case 'rest':
      return `${namePrefix}le repos est aussi important que l'entrainement. Vise 7-8h de sommeil et 1-2 jours off complets par semaine. C'est la que les muscles se reconstruisent.`;
    case 'goal':
      if (score < 50) return `${namePrefix}tu es a ${score}/100 sur ton score FORGA. Concentre-toi sur 1 chose ce soir: valider un repas ou faire 15 min de marche.`;
      return `${namePrefix}tu es a ${score}/100 sur ton score FORGA. Continue, tu es sur la bonne trajectoire.`;
  }
}

/** Generate a short fallback reply when the LLM is unavailable. */
export function coachFallbackReply(message: string, context: CoachContext): string {
  for (const intent of Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]) {
    if (KEYWORDS[intent].test(message)) {
      return pickReply(intent, context);
    }
  }
  // Generic fallback when no keyword matches
  const name = context.firstName ? `${context.firstName}, ` : '';
  return `${name}je ne peux pas joindre le coach en ligne pour l'instant. Reessaye dans quelques instants. En attendant: regarde ton score FORGA et valide ton prochain repas.`;
}
