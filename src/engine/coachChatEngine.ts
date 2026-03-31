// Coach Chat FORGA — Moteur de reponses contextuelles par message
import { MEAL_SLOT_LABELS, type MealSlot } from '../types/meal';
import type { ForgaScore } from '../types/score';
import { getScoreLabel } from '../theme/colors';

// ──────────── TYPES ────────────

export type QuestionType =
  | 'greeting'
  | 'what_to_eat'
  | 'my_macros'
  | 'my_score'
  | 'motivation'
  | 'nutrition_tips'
  | 'how_to_improve';

export interface ChatResponse {
  messages: string[];
  quickReplies: QuickReply[];
}

export interface QuickReply {
  label: string;
  type: QuestionType;
}

export interface CoachContext {
  firstName: string;
  hour: number;
  currentStreak: number;
  isTodayValidated: boolean;
  mealsValidatedCount: number;
  mealsExpected: number;
  currentSlot: MealSlot | null;
  score: ForgaScore;
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

// ──────────── HELPERS ────────────

function pick<T>(arr: T[]): T {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours();
  return arr[seed % arr.length];
}

function pct(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.round((consumed / target) * 100);
}

// ──────────── QUICK REPLIES ────────────

const DEFAULT_REPLIES: QuickReply[] = [
  { label: 'Quoi manger ?', type: 'what_to_eat' },
  { label: 'Mes macros', type: 'my_macros' },
  { label: 'Mon score', type: 'my_score' },
  { label: 'Motivation', type: 'motivation' },
  { label: 'Conseils', type: 'nutrition_tips' },
  { label: 'Comment progresser ?', type: 'how_to_improve' },
];

function getRepliesExcept(...exclude: QuestionType[]): QuickReply[] {
  const filtered = DEFAULT_REPLIES.filter((r) => !exclude.includes(r.type));
  // Return 4 suggestions max
  return filtered.slice(0, 4);
}

// ──────────── GREETING ────────────

function getGreeting(ctx: CoachContext): ChatResponse {
  const { firstName, hour, currentStreak, isTodayValidated, mealsValidatedCount, mealsExpected } = ctx;

  let intro: string;
  if (hour < 12) {
    intro = `Salut ${firstName} ! Bien dormi ?`;
  } else if (hour < 18) {
    intro = `Hey ${firstName} ! Comment se passe ta journee ?`;
  } else {
    intro = `Bonsoir ${firstName} ! Comment tu te sens ?`;
  }

  const messages: string[] = [intro];

  if (currentStreak >= 7) {
    messages.push(`${currentStreak} jours de suite, t'es en feu ! Comment je peux t'aider ?`);
  } else if (isTodayValidated) {
    messages.push(`T'as deja valide ${mealsValidatedCount} repas sur ${mealsExpected} aujourd'hui. Continue comme ca !`);
  } else if (hour >= 14) {
    messages.push(`T'as pas encore valide de repas aujourd'hui. Faut qu'on rattrape ca ! Pose-moi tes questions.`);
  } else {
    messages.push(`Je suis la pour t'aider a atteindre tes objectifs. Qu'est-ce que tu veux savoir ?`);
  }

  return { messages, quickReplies: DEFAULT_REPLIES.slice(0, 4) };
}

// ──────────── WHAT TO EAT ────────────

function getWhatToEat(ctx: CoachContext): ChatResponse {
  const { currentSlot, objective, targetProtein, consumedProtein, targetCalories, consumedCalories, firstName } = ctx;

  const slotName = currentSlot ? MEAL_SLOT_LABELS[currentSlot] : null;
  const calLeft = targetCalories - consumedCalories;
  const protLeft = targetProtein - consumedProtein;
  const messages: string[] = [];

  if (slotName) {
    messages.push(pick([
      `Pour ton ${slotName}, je te recommande un truc bien cale.`,
      `C'est l'heure du ${slotName} ${firstName} !`,
      `Ton ${slotName} t'attend. Voyons ce qu'on peut te proposer.`,
    ]));
  } else {
    messages.push(pick([
      `Tu veux manger quoi ${firstName} ?`,
      `Ok, voyons ce qu'on peut te trouver.`,
    ]));
  }

  if (protLeft > 30) {
    if (objective === 'bulk') {
      messages.push(`T'as encore ${protLeft}g de proteines a atteindre. Vise un plat riche en prot : poulet, boeuf, oeufs, ou un bon shaker.`);
    } else if (objective === 'cut') {
      messages.push(`Il te reste ${protLeft}g de proteines. En seche, c'est crucial pour garder ton muscle. Privilegie les proteines maigres.`);
    } else {
      messages.push(`Il te reste ${protLeft}g de proteines a atteindre. Un repas avec une bonne source de prot serait ideal.`);
    }
  } else if (calLeft > 200) {
    messages.push(`Il te reste environ ${calLeft} kcal. Va dans l'onglet Repas pour voir les suggestions adaptees a tes macros.`);
  } else {
    messages.push(`T'es presque a tes objectifs du jour ! Un repas leger suffira. Check l'onglet Repas.`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept('what_to_eat'),
  };
}

// ──────────── MY MACROS ────────────

function getMyMacros(ctx: CoachContext): ChatResponse {
  const { consumedCalories, targetCalories, consumedProtein, targetProtein, consumedCarbs, targetCarbs, consumedFat, targetFat, firstName } = ctx;

  const calPct = pct(consumedCalories, targetCalories);
  const protPct = pct(consumedProtein, targetProtein);
  const messages: string[] = [];

  messages.push(`Voila tes macros du jour ${firstName} :`);

  const summary = [
    `Calories : ${consumedCalories} / ${targetCalories} kcal (${calPct}%)`,
    `Proteines : ${consumedProtein}g / ${targetProtein}g (${protPct}%)`,
    `Glucides : ${consumedCarbs}g / ${targetCarbs}g`,
    `Lipides : ${consumedFat}g / ${targetFat}g`,
  ].join('\n');
  messages.push(summary);

  // Contextual advice
  if (calPct < 30 && ctx.hour >= 14) {
    messages.push(`T'es un peu en retard la... Faut accelerer si tu veux atteindre tes objectifs aujourd'hui.`);
  } else if (protPct < 50 && ctx.hour >= 16) {
    messages.push(`Tes proteines sont basses. Pense a ajouter une source de prot a tes prochains repas.`);
  } else if (calPct >= 90) {
    messages.push(`T'es quasi a tes objectifs du jour, nice ! Reste raisonnable pour le dernier repas.`);
  } else {
    messages.push(`T'es sur la bonne voie. Continue comme ca !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept('my_macros'),
  };
}

// ──────────── MY SCORE ────────────

function getMyScore(ctx: CoachContext): ChatResponse {
  const { score, firstName } = ctx;
  const messages: string[] = [];
  const label = getScoreLabel(score.total);

  messages.push(`Ton score FORGA est a ${score.total}/100. Tu es "${label}".`);

  const breakdown = [
    `Nutrition : ${score.nutrition}/40`,
    `Constance : ${score.consistency}/30`,
    `Progression : ${score.progression}/20`,
    `Discipline : ${score.discipline}/10`,
  ].join('\n');
  messages.push(breakdown);

  // Find weakest pillar
  const pillars = [
    { name: 'Nutrition', score: score.nutrition, max: 40, pct: score.nutrition / 40 },
    { name: 'Constance', score: score.consistency, max: 30, pct: score.consistency / 30 },
    { name: 'Progression', score: score.progression, max: 20, pct: score.progression / 20 },
    { name: 'Discipline', score: score.discipline, max: 10, pct: score.discipline / 10 },
  ];
  const weakest = pillars.reduce((a, b) => (a.pct < b.pct ? a : b));

  if (weakest.pct < 0.5) {
    messages.push(`Ton point faible c'est "${weakest.name}" (${weakest.score}/${weakest.max}). Concentre-toi la-dessus pour faire monter ton score ${firstName}.`);
  } else {
    messages.push(`Tes piliers sont assez equilibres. Continue a valider tes repas et a etre regulier pour progresser !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept('my_score'),
  };
}

// ──────────── MOTIVATION ────────────

function getMotivation(ctx: CoachContext): ChatResponse {
  const { firstName, currentStreak, objective } = ctx;
  const messages: string[] = [];

  const motivationPacks = [
    [
      `${firstName}, rappelle-toi pourquoi t'as commence.`,
      `Chaque repas valide, c'est une brique de plus dans ta construction. Les resultats viennent avec la regularite, pas la perfection.`,
    ],
    [
      `La discipline bat la motivation ${firstName}.`,
      `T'as pas besoin d'etre motive tous les jours. T'as juste besoin de rester constant. Et t'es la, c'est deja enorme.`,
    ],
    [
      `Rome ne s'est pas construite en un jour.`,
      `Mais ils posaient des briques chaque jour. Toi aussi ${firstName}. Continue.`,
    ],
    [
      `Le plus dur c'est de commencer. Et t'es deja la ${firstName}.`,
      `Ton futur toi te remerciera pour chaque effort que tu fais aujourd'hui.`,
    ],
    [
      `T'es plus fort que tu le penses ${firstName}.`,
      `Les jours ou c'est dur, c'est la que tu construis le plus. Lache rien.`,
    ],
  ];

  const pack = pick(motivationPacks);
  messages.push(...pack);

  if (currentStreak >= 3) {
    messages.push(`Et t'as deja ${currentStreak} jours de streak. Preuve que t'es capable.`);
  }

  if (objective === 'cut') {
    messages.push(`La seche c'est un marathon, pas un sprint. Chaque jour compte.`);
  } else if (objective === 'bulk') {
    messages.push(`La prise de masse, ca demande de la patience. Les muscles se construisent jour apres jour.`);
  }

  return {
    messages: messages.slice(0, 3),
    quickReplies: getRepliesExcept('motivation'),
  };
}

// ──────────── NUTRITION TIPS ────────────

function getNutritionTips(ctx: CoachContext): ChatResponse {
  const { objective, firstName } = ctx;
  const messages: string[] = [];

  if (objective === 'bulk') {
    const tips = [
      [
        `En prise de masse, l'objectif c'est un leger surplus calorique ${firstName}.`,
        `Vise +200 a +400 kcal au-dessus de ton maintien. Et surtout, assure tes proteines : 1.6 a 2.2g par kg de poids de corps.`,
        `Astuce : si t'as du mal a manger assez, rajoute des sources denses comme les oléagineux, l'huile d'olive ou un shaker calorique.`,
      ],
      [
        `Pour construire du muscle, il faut du carburant.`,
        `Repartis bien tes proteines sur la journee (30-40g par repas). Ca optimise la synthese proteique.`,
        `Et n'oublie pas les glucides ! C'est ton energie pour les trainings.`,
      ],
    ];
    messages.push(...pick(tips));
  } else if (objective === 'cut') {
    const tips = [
      [
        `En seche, la cle c'est le deficit calorique sans sacrifier les proteines ${firstName}.`,
        `Garde tes proteines hautes (2g/kg minimum) pour preserver ton muscle. C'est non-negociable.`,
        `Astuce : remplis ton assiette de legumes et proteines maigres. Ca cale sans exploser les calories.`,
      ],
      [
        `La seche, c'est 80% nutrition ${firstName}.`,
        `Evite les calories liquides (jus, sodas, sauces). Bois beaucoup d'eau. Et sois patient.`,
        `Si t'as une grosse faim, prends un snack riche en proteines : fromage blanc, oeufs durs, blanc de poulet.`,
      ],
    ];
    messages.push(...pick(tips));
  } else if (objective === 'recomp') {
    messages.push(
      `La recomp c'est le plus dur mais le plus gratifiant ${firstName}.`,
      `Mange a ton maintien calorique, vise 2g/kg de proteines, et entraine-toi dur.`,
      `Les changements sont lents mais tu perds du gras et gagnes du muscle en meme temps. Patience !`,
    );
  } else {
    messages.push(
      `En maintien, l'objectif c'est d'etre regulier ${firstName}.`,
      `Pas besoin de tout peser au gramme. Juste valide tes repas, garde de bonnes habitudes, et profite.`,
      `L'equilibre, c'est la cle sur le long terme.`,
    );
  }

  return {
    messages: messages.slice(0, 3),
    quickReplies: getRepliesExcept('nutrition_tips'),
  };
}

// ──────────── HOW TO IMPROVE ────────────

function getHowToImprove(ctx: CoachContext): ChatResponse {
  const { score, currentStreak, mealsValidatedCount, mealsExpected, firstName } = ctx;
  const messages: string[] = [];

  messages.push(`Ok ${firstName}, voyons comment tu peux progresser.`);

  // Find weakest pillar
  const pillars = [
    { name: 'Nutrition', score: score.nutrition, max: 40, pct: score.nutrition / 40, advice: 'Valide plus de repas et respecte tes macros. Chaque repas valide rapporte des points.' },
    { name: 'Constance', score: score.consistency, max: 30, pct: score.consistency / 30, advice: 'Augmente ta serie de jours. Valide au moins 1 repas par jour pour garder ta flamme.' },
    { name: 'Progression', score: score.progression, max: 20, pct: score.progression / 20, advice: 'Fais tes check-ins hebdo et suis ta courbe de poids. Ca montre a FORGA que tu progresses.' },
    { name: 'Discipline', score: score.discipline, max: 10, pct: score.discipline / 10, advice: 'Sois actif au moins 5 jours par semaine et fais ton check-in du dimanche.' },
  ];

  const sorted = [...pillars].sort((a, b) => a.pct - b.pct);
  const weakest = sorted[0];
  const secondWeakest = sorted[1];

  messages.push(`Ton point le plus faible c'est "${weakest.name}" (${weakest.score}/${weakest.max}). ${weakest.advice}`);

  if (secondWeakest.pct < 0.5) {
    messages.push(`Apres ca, concentre-toi sur "${secondWeakest.name}" (${secondWeakest.score}/${secondWeakest.max}). ${secondWeakest.advice}`);
  } else if (currentStreak < 3) {
    messages.push(`Et surtout, essaie de tenir une serie de 7 jours. C'est la que tout decolle.`);
  } else if (mealsValidatedCount < mealsExpected) {
    messages.push(`Aujourd'hui il te reste ${mealsExpected - mealsValidatedCount} repas a valider. Chaque repas compte !`);
  } else {
    messages.push(`Tu geres bien. Continue d'etre regulier et les resultats suivront !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept('how_to_improve'),
  };
}

// ──────────── MOTEUR PRINCIPAL ────────────

export function getCoachResponse(type: QuestionType, ctx: CoachContext): ChatResponse {
  switch (type) {
    case 'greeting':
      return getGreeting(ctx);
    case 'what_to_eat':
      return getWhatToEat(ctx);
    case 'my_macros':
      return getMyMacros(ctx);
    case 'my_score':
      return getMyScore(ctx);
    case 'motivation':
      return getMotivation(ctx);
    case 'nutrition_tips':
      return getNutritionTips(ctx);
    case 'how_to_improve':
      return getHowToImprove(ctx);
    default:
      return getGreeting(ctx);
  }
}

export const QUESTION_LABELS: Record<QuestionType, string> = {
  greeting: 'Salut !',
  what_to_eat: 'Quoi manger ?',
  my_macros: 'Mes macros',
  my_score: 'Mon score',
  motivation: 'Motivation',
  nutrition_tips: 'Conseils',
  how_to_improve: 'Comment progresser ?',
};
