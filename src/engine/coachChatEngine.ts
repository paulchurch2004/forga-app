// Coach Chat FORGA — Moteur de reponses contextuelles par message (FR/EN)
import { type MealSlot } from '../types/meal';
import type { ForgaScore } from '../types/score';
import { getScoreLabel } from '../theme/colors';
import { useSettingsStore } from '../store/settingsStore';

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

// ──────────── SLOT LABELS (LOCALIZED) ────────────

const SLOT_LABELS: Record<string, Record<string, string>> = {
  fr: { breakfast: 'Petit-dejeuner', morning_snack: 'Collation matin', lunch: 'Dejeuner', afternoon_snack: 'Gouter', dinner: 'Diner', bedtime: 'Avant dodo' },
  en: { breakfast: 'Breakfast', morning_snack: 'Morning snack', lunch: 'Lunch', afternoon_snack: 'Afternoon snack', dinner: 'Dinner', bedtime: 'Bedtime snack' },
};

// ──────────── QUICK REPLIES ────────────

const DEFAULT_REPLIES: Record<string, QuickReply[]> = {
  fr: [
    { label: 'Quoi manger ?', type: 'what_to_eat' },
    { label: 'Mes macros', type: 'my_macros' },
    { label: 'Mon score', type: 'my_score' },
    { label: 'Motivation', type: 'motivation' },
    { label: 'Conseils', type: 'nutrition_tips' },
    { label: 'Comment progresser ?', type: 'how_to_improve' },
  ],
  en: [
    { label: 'What to eat?', type: 'what_to_eat' },
    { label: 'My macros', type: 'my_macros' },
    { label: 'My score', type: 'my_score' },
    { label: 'Motivation', type: 'motivation' },
    { label: 'Tips', type: 'nutrition_tips' },
    { label: 'How to improve?', type: 'how_to_improve' },
  ],
};

function getRepliesExcept(locale: string, ...exclude: QuestionType[]): QuickReply[] {
  const replies = DEFAULT_REPLIES[locale] ?? DEFAULT_REPLIES.fr;
  const filtered = replies.filter((r) => !exclude.includes(r.type));
  // Return 4 suggestions max
  return filtered.slice(0, 4);
}

// ──────────── GREETING ────────────

function getGreeting(ctx: CoachContext, locale: string): ChatResponse {
  const { firstName, hour, currentStreak, isTodayValidated, mealsValidatedCount, mealsExpected } = ctx;

  let intro: string;
  if (locale === 'en') {
    if (hour < 12) {
      intro = `Hey ${firstName}! Slept well?`;
    } else if (hour < 18) {
      intro = `Hey ${firstName}! How's your day going?`;
    } else {
      intro = `Good evening ${firstName}! How are you feeling?`;
    }
  } else {
    if (hour < 12) {
      intro = `Salut ${firstName} ! Bien dormi ?`;
    } else if (hour < 18) {
      intro = `Hey ${firstName} ! Comment se passe ta journee ?`;
    } else {
      intro = `Bonsoir ${firstName} ! Comment tu te sens ?`;
    }
  }

  const messages: string[] = [intro];

  if (currentStreak >= 7) {
    messages.push(locale === 'en'
      ? `${currentStreak} days straight, you're on fire! How can I help?`
      : `${currentStreak} jours de suite, t'es en feu ! Comment je peux t'aider ?`);
  } else if (isTodayValidated) {
    messages.push(locale === 'en'
      ? `You've already logged ${mealsValidatedCount} meals out of ${mealsExpected} today. Keep it up!`
      : `T'as deja valide ${mealsValidatedCount} repas sur ${mealsExpected} aujourd'hui. Continue comme ca !`);
  } else if (hour >= 14) {
    messages.push(locale === 'en'
      ? `You haven't logged any meals today. Let's fix that! Ask me anything.`
      : `T'as pas encore valide de repas aujourd'hui. Faut qu'on rattrape ca ! Pose-moi tes questions.`);
  } else {
    messages.push(locale === 'en'
      ? `I'm here to help you reach your goals. What do you want to know?`
      : `Je suis la pour t'aider a atteindre tes objectifs. Qu'est-ce que tu veux savoir ?`);
  }

  const replies = DEFAULT_REPLIES[locale] ?? DEFAULT_REPLIES.fr;
  return { messages, quickReplies: replies.slice(0, 4) };
}

// ──────────── WHAT TO EAT ────────────

function getWhatToEat(ctx: CoachContext, locale: string): ChatResponse {
  const { currentSlot, objective, targetProtein, consumedProtein, targetCalories, consumedCalories, firstName } = ctx;

  const slotLabels = SLOT_LABELS[locale] ?? SLOT_LABELS.fr;
  const slotName = currentSlot ? slotLabels[currentSlot] : null;
  const calLeft = targetCalories - consumedCalories;
  const protLeft = targetProtein - consumedProtein;
  const messages: string[] = [];

  if (slotName) {
    if (locale === 'en') {
      messages.push(pick([
        `For your ${slotName}, I recommend something filling.`,
        `It's time for ${slotName} ${firstName}!`,
        `Your ${slotName} is waiting. Let's see what we can suggest.`,
      ]));
    } else {
      messages.push(pick([
        `Pour ton ${slotName}, je te recommande un truc bien cale.`,
        `C'est l'heure du ${slotName} ${firstName} !`,
        `Ton ${slotName} t'attend. Voyons ce qu'on peut te proposer.`,
      ]));
    }
  } else {
    if (locale === 'en') {
      messages.push(pick([
        `What do you feel like eating ${firstName}?`,
        `Ok, let's see what we can find.`,
      ]));
    } else {
      messages.push(pick([
        `Tu veux manger quoi ${firstName} ?`,
        `Ok, voyons ce qu'on peut te trouver.`,
      ]));
    }
  }

  if (protLeft > 30) {
    if (objective === 'bulk') {
      messages.push(locale === 'en'
        ? `You still have ${protLeft}g of protein to hit. Go for a protein-rich meal: chicken, beef, eggs, or a good shake.`
        : `T'as encore ${protLeft}g de proteines a atteindre. Vise un plat riche en prot : poulet, boeuf, oeufs, ou un bon shaker.`);
    } else if (objective === 'cut') {
      messages.push(locale === 'en'
        ? `You have ${protLeft}g of protein left. During a cut, it's crucial to keep your muscle. Go for lean protein.`
        : `Il te reste ${protLeft}g de proteines. En seche, c'est crucial pour garder ton muscle. Privilegie les proteines maigres.`);
    } else {
      messages.push(locale === 'en'
        ? `You have ${protLeft}g of protein left to hit. A meal with a good protein source would be ideal.`
        : `Il te reste ${protLeft}g de proteines a atteindre. Un repas avec une bonne source de prot serait ideal.`);
    }
  } else if (calLeft > 200) {
    messages.push(locale === 'en'
      ? `You have about ${calLeft} kcal left. Check the Meals tab for suggestions adapted to your macros.`
      : `Il te reste environ ${calLeft} kcal. Va dans l'onglet Repas pour voir les suggestions adaptees a tes macros.`);
  } else {
    messages.push(locale === 'en'
      ? `You're almost at your daily goals! A light meal will do. Check the Meals tab.`
      : `T'es presque a tes objectifs du jour ! Un repas leger suffira. Check l'onglet Repas.`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept(locale, 'what_to_eat'),
  };
}

// ──────────── MY MACROS ────────────

function getMyMacros(ctx: CoachContext, locale: string): ChatResponse {
  const { consumedCalories, targetCalories, consumedProtein, targetProtein, consumedCarbs, targetCarbs, consumedFat, targetFat, firstName } = ctx;

  const calPct = pct(consumedCalories, targetCalories);
  const protPct = pct(consumedProtein, targetProtein);
  const messages: string[] = [];

  messages.push(locale === 'en'
    ? `Here are your macros for today ${firstName}:`
    : `Voila tes macros du jour ${firstName} :`);

  const summary = locale === 'en'
    ? [
        `Calories: ${consumedCalories} / ${targetCalories} kcal (${calPct}%)`,
        `Protein: ${consumedProtein}g / ${targetProtein}g (${protPct}%)`,
        `Carbs: ${consumedCarbs}g / ${targetCarbs}g`,
        `Fat: ${consumedFat}g / ${targetFat}g`,
      ].join('\n')
    : [
        `Calories : ${consumedCalories} / ${targetCalories} kcal (${calPct}%)`,
        `Proteines : ${consumedProtein}g / ${targetProtein}g (${protPct}%)`,
        `Glucides : ${consumedCarbs}g / ${targetCarbs}g`,
        `Lipides : ${consumedFat}g / ${targetFat}g`,
      ].join('\n');
  messages.push(summary);

  // Contextual advice
  if (calPct < 30 && ctx.hour >= 14) {
    messages.push(locale === 'en'
      ? `You're a bit behind... Time to catch up if you want to hit your goals today.`
      : `T'es un peu en retard la... Faut accelerer si tu veux atteindre tes objectifs aujourd'hui.`);
  } else if (protPct < 50 && ctx.hour >= 16) {
    messages.push(locale === 'en'
      ? `Your protein is low. Add a protein source to your next meals.`
      : `Tes proteines sont basses. Pense a ajouter une source de prot a tes prochains repas.`);
  } else if (calPct >= 90) {
    messages.push(locale === 'en'
      ? `You're almost at your daily goals, nice! Keep the last meal reasonable.`
      : `T'es quasi a tes objectifs du jour, nice ! Reste raisonnable pour le dernier repas.`);
  } else {
    messages.push(locale === 'en'
      ? `You're on the right track. Keep it up!`
      : `T'es sur la bonne voie. Continue comme ca !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept(locale, 'my_macros'),
  };
}

// ──────────── MY SCORE ────────────

function getMyScore(ctx: CoachContext, locale: string): ChatResponse {
  const { score, firstName } = ctx;
  const messages: string[] = [];
  const label = getScoreLabel(score.total, locale as 'fr' | 'en');

  messages.push(locale === 'en'
    ? `Your FORGA score is ${score.total}/100. You are "${label}".`
    : `Ton score FORGA est a ${score.total}/100. Tu es "${label}".`);

  const pillarNames = locale === 'en'
    ? { nutrition: 'Nutrition', consistency: 'Consistency', progression: 'Progression', discipline: 'Discipline' }
    : { nutrition: 'Nutrition', consistency: 'Constance', progression: 'Progression', discipline: 'Discipline' };

  const breakdown = [
    `${pillarNames.nutrition} : ${score.nutrition}/40`,
    `${pillarNames.consistency} : ${score.consistency}/30`,
    `${pillarNames.progression} : ${score.progression}/20`,
    `${pillarNames.discipline} : ${score.discipline}/10`,
  ].join('\n');
  messages.push(breakdown);

  // Find weakest pillar
  const pillars = [
    { name: pillarNames.nutrition, score: score.nutrition, max: 40, pct: score.nutrition / 40 },
    { name: pillarNames.consistency, score: score.consistency, max: 30, pct: score.consistency / 30 },
    { name: pillarNames.progression, score: score.progression, max: 20, pct: score.progression / 20 },
    { name: pillarNames.discipline, score: score.discipline, max: 10, pct: score.discipline / 10 },
  ];
  const weakest = pillars.reduce((a, b) => (a.pct < b.pct ? a : b));

  if (weakest.pct < 0.5) {
    messages.push(locale === 'en'
      ? `Your weak point is "${weakest.name}" (${weakest.score}/${weakest.max}). Focus there to boost your score ${firstName}.`
      : `Ton point faible c'est "${weakest.name}" (${weakest.score}/${weakest.max}). Concentre-toi la-dessus pour faire monter ton score ${firstName}.`);
  } else {
    messages.push(locale === 'en'
      ? `Your pillars are well balanced. Keep logging meals and stay consistent to progress!`
      : `Tes piliers sont assez equilibres. Continue a valider tes repas et a etre regulier pour progresser !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept(locale, 'my_score'),
  };
}

// ──────────── MOTIVATION ────────────

function getMotivation(ctx: CoachContext, locale: string): ChatResponse {
  const { firstName, currentStreak, objective } = ctx;
  const messages: string[] = [];

  const motivationPacks = locale === 'en'
    ? [
        [
          `${firstName}, remember why you started.`,
          `Every logged meal is another brick in your foundation. Results come with consistency, not perfection.`,
        ],
        [
          `Discipline beats motivation ${firstName}.`,
          `You don't need to be motivated every day. Just stay consistent. And you're here, that's already huge.`,
        ],
        [
          `Rome wasn't built in a day.`,
          `But they laid bricks every day. So do you ${firstName}. Keep going.`,
        ],
        [
          `The hardest part is starting. And you're already here ${firstName}.`,
          `Your future self will thank you for every effort you make today.`,
        ],
        [
          `You're stronger than you think ${firstName}.`,
          `The tough days are when you build the most. Don't give up.`,
        ],
      ]
    : [
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
    messages.push(locale === 'en'
      ? `And you already have a ${currentStreak}-day streak. Proof you can do this.`
      : `Et t'as deja ${currentStreak} jours de streak. Preuve que t'es capable.`);
  }

  if (objective === 'cut') {
    messages.push(locale === 'en'
      ? `A cut is a marathon, not a sprint. Every day counts.`
      : `La seche c'est un marathon, pas un sprint. Chaque jour compte.`);
  } else if (objective === 'bulk') {
    messages.push(locale === 'en'
      ? `Bulking takes patience. Muscles are built day after day.`
      : `La prise de masse, ca demande de la patience. Les muscles se construisent jour apres jour.`);
  }

  return {
    messages: messages.slice(0, 3),
    quickReplies: getRepliesExcept(locale, 'motivation'),
  };
}

// ──────────── NUTRITION TIPS ────────────

function getNutritionTips(ctx: CoachContext, locale: string): ChatResponse {
  const { objective, firstName } = ctx;
  const messages: string[] = [];

  if (objective === 'bulk') {
    if (locale === 'en') {
      const tips = [
        [
          `When bulking, the goal is a slight caloric surplus ${firstName}.`,
          `Aim for +200 to +400 kcal above maintenance. And above all, hit your protein: 1.6 to 2.2g per kg of body weight.`,
          `Tip: if you struggle to eat enough, add dense sources like nuts, olive oil or a calorie shake.`,
        ],
        [
          `To build muscle, you need fuel.`,
          `Spread your protein throughout the day (30-40g per meal). It optimizes protein synthesis.`,
          `And don't forget carbs! They're your energy for training.`,
        ],
      ];
      messages.push(...pick(tips));
    } else {
      const tips = [
        [
          `En prise de masse, l'objectif c'est un leger surplus calorique ${firstName}.`,
          `Vise +200 a +400 kcal au-dessus de ton maintien. Et surtout, assure tes proteines : 1.6 a 2.2g par kg de poids de corps.`,
          `Astuce : si t'as du mal a manger assez, rajoute des sources denses comme les oleagineux, l'huile d'olive ou un shaker calorique.`,
        ],
        [
          `Pour construire du muscle, il faut du carburant.`,
          `Repartis bien tes proteines sur la journee (30-40g par repas). Ca optimise la synthese proteique.`,
          `Et n'oublie pas les glucides ! C'est ton energie pour les trainings.`,
        ],
      ];
      messages.push(...pick(tips));
    }
  } else if (objective === 'cut') {
    if (locale === 'en') {
      const tips = [
        [
          `When cutting, the key is caloric deficit without sacrificing protein ${firstName}.`,
          `Keep protein high (2g/kg minimum) to preserve muscle. Non-negotiable.`,
          `Tip: fill your plate with veggies and lean protein. It fills you up without blowing your calories.`,
        ],
        [
          `A cut is 80% nutrition ${firstName}.`,
          `Avoid liquid calories (juice, sodas, sauces). Drink lots of water. And be patient.`,
          `If you're really hungry, grab a high-protein snack: Greek yogurt, boiled eggs, chicken breast.`,
        ],
      ];
      messages.push(...pick(tips));
    } else {
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
    }
  } else if (objective === 'recomp') {
    if (locale === 'en') {
      messages.push(
        `Recomp is the hardest but most rewarding ${firstName}.`,
        `Eat at maintenance, aim for 2g/kg protein, and train hard.`,
        `Changes are slow but you're losing fat and building muscle at the same time. Patience!`,
      );
    } else {
      messages.push(
        `La recomp c'est le plus dur mais le plus gratifiant ${firstName}.`,
        `Mange a ton maintien calorique, vise 2g/kg de proteines, et entraine-toi dur.`,
        `Les changements sont lents mais tu perds du gras et gagnes du muscle en meme temps. Patience !`,
      );
    }
  } else {
    if (locale === 'en') {
      messages.push(
        `When maintaining, the goal is consistency ${firstName}.`,
        `No need to weigh everything to the gram. Just log your meals, keep good habits, and enjoy.`,
        `Balance is the key for the long term.`,
      );
    } else {
      messages.push(
        `En maintien, l'objectif c'est d'etre regulier ${firstName}.`,
        `Pas besoin de tout peser au gramme. Juste valide tes repas, garde de bonnes habitudes, et profite.`,
        `L'equilibre, c'est la cle sur le long terme.`,
      );
    }
  }

  return {
    messages: messages.slice(0, 3),
    quickReplies: getRepliesExcept(locale, 'nutrition_tips'),
  };
}

// ──────────── HOW TO IMPROVE ────────────

function getHowToImprove(ctx: CoachContext, locale: string): ChatResponse {
  const { score, currentStreak, mealsValidatedCount, mealsExpected, firstName } = ctx;
  const messages: string[] = [];

  messages.push(locale === 'en'
    ? `Ok ${firstName}, let's see how you can improve.`
    : `Ok ${firstName}, voyons comment tu peux progresser.`);

  // Find weakest pillar
  const pillars = locale === 'en'
    ? [
        { name: 'Nutrition', score: score.nutrition, max: 40, pct: score.nutrition / 40, advice: 'Log more meals and hit your macros. Every logged meal earns you points.' },
        { name: 'Consistency', score: score.consistency, max: 30, pct: score.consistency / 30, advice: 'Extend your streak. Log at least 1 meal per day to keep your flame.' },
        { name: 'Progression', score: score.progression, max: 20, pct: score.progression / 20, advice: 'Do your weekly check-ins and track your weight. It shows FORGA you\'re progressing.' },
        { name: 'Discipline', score: score.discipline, max: 10, pct: score.discipline / 10, advice: 'Be active at least 5 days a week and do your Sunday check-in.' },
      ]
    : [
        { name: 'Nutrition', score: score.nutrition, max: 40, pct: score.nutrition / 40, advice: 'Valide plus de repas et respecte tes macros. Chaque repas valide rapporte des points.' },
        { name: 'Constance', score: score.consistency, max: 30, pct: score.consistency / 30, advice: 'Augmente ta serie de jours. Valide au moins 1 repas par jour pour garder ta flamme.' },
        { name: 'Progression', score: score.progression, max: 20, pct: score.progression / 20, advice: 'Fais tes check-ins hebdo et suis ta courbe de poids. Ca montre a FORGA que tu progresses.' },
        { name: 'Discipline', score: score.discipline, max: 10, pct: score.discipline / 10, advice: 'Sois actif au moins 5 jours par semaine et fais ton check-in du dimanche.' },
      ];

  const sorted = [...pillars].sort((a, b) => a.pct - b.pct);
  const weakest = sorted[0];
  const secondWeakest = sorted[1];

  messages.push(locale === 'en'
    ? `Your weakest area is "${weakest.name}" (${weakest.score}/${weakest.max}). ${weakest.advice}`
    : `Ton point le plus faible c'est "${weakest.name}" (${weakest.score}/${weakest.max}). ${weakest.advice}`);

  if (secondWeakest.pct < 0.5) {
    messages.push(locale === 'en'
      ? `After that, focus on "${secondWeakest.name}" (${secondWeakest.score}/${secondWeakest.max}). ${secondWeakest.advice}`
      : `Apres ca, concentre-toi sur "${secondWeakest.name}" (${secondWeakest.score}/${secondWeakest.max}). ${secondWeakest.advice}`);
  } else if (currentStreak < 3) {
    messages.push(locale === 'en'
      ? `And most importantly, try to keep a 7-day streak. That's when everything takes off.`
      : `Et surtout, essaie de tenir une serie de 7 jours. C'est la que tout decolle.`);
  } else if (mealsValidatedCount < mealsExpected) {
    const remaining = mealsExpected - mealsValidatedCount;
    messages.push(locale === 'en'
      ? `Today you still have ${remaining} meals to log. Every meal counts!`
      : `Aujourd'hui il te reste ${remaining} repas a valider. Chaque repas compte !`);
  } else {
    messages.push(locale === 'en'
      ? `You're doing well. Stay consistent and results will follow!`
      : `Tu geres bien. Continue d'etre regulier et les resultats suivront !`);
  }

  return {
    messages,
    quickReplies: getRepliesExcept(locale, 'how_to_improve'),
  };
}

// ──────────── MOTEUR PRINCIPAL ────────────

export function getCoachResponse(type: QuestionType, ctx: CoachContext): ChatResponse {
  const locale = useSettingsStore.getState().locale;

  switch (type) {
    case 'greeting':
      return getGreeting(ctx, locale);
    case 'what_to_eat':
      return getWhatToEat(ctx, locale);
    case 'my_macros':
      return getMyMacros(ctx, locale);
    case 'my_score':
      return getMyScore(ctx, locale);
    case 'motivation':
      return getMotivation(ctx, locale);
    case 'nutrition_tips':
      return getNutritionTips(ctx, locale);
    case 'how_to_improve':
      return getHowToImprove(ctx, locale);
    default:
      return getGreeting(ctx, locale);
  }
}

export const QUESTION_LABELS: Record<string, Record<QuestionType, string>> = {
  fr: {
    greeting: 'Salut !',
    what_to_eat: 'Quoi manger ?',
    my_macros: 'Mes macros',
    my_score: 'Mon score',
    motivation: 'Motivation',
    nutrition_tips: 'Conseils',
    how_to_improve: 'Comment progresser ?',
  },
  en: {
    greeting: 'Hey!',
    what_to_eat: 'What to eat?',
    my_macros: 'My macros',
    my_score: 'My score',
    motivation: 'Motivation',
    nutrition_tips: 'Tips',
    how_to_improve: 'How to improve?',
  },
};
