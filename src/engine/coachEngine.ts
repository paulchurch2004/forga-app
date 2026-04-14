// Coach Virtuel FORGA — Moteur de messages contextuels (FR/EN)
import { type MealSlot } from '../types/meal';
import type { ForgaScore } from '../types/score';
import { useSettingsStore } from '../store/settingsStore';

export type CoachMood = 'fire' | 'chill' | 'alert' | 'trophy';

export interface CoachMessage {
  text: string;
  subtext?: string;
  action?: { label: string; route: string };
  mood: CoachMood;
}

export interface CoachInput {
  firstName: string;
  hour: number;
  dayOfWeek: number; // 0=dimanche
  currentStreak: number;
  isTodayValidated: boolean;
  mealsValidatedCount: number;
  mealsExpected: number;
  currentSlot: MealSlot | null;
  score: ForgaScore;
  objective: string; // 'bulk' | 'cut' | 'maintain' | 'recomp'
  consumedProtein: number;
  targetProtein: number;
  consumedCalories: number;
  targetCalories: number;
  // Timing insights
  lastMealHour?: number; // hour of last validated meal (0-23)
  breakfastLogged?: boolean;
  hoursWithoutMeal?: number; // hours since last meal
}

// ──────────── HELPERS ────────────

function pick<T>(arr: T[]): T {
  // Deterministic but varied: based on current date + hour
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return arr[seed % arr.length];
}

function fill(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }
  return result;
}

// ──────────── SLOT LABELS (LOCALIZED) ────────────

const SLOT_LABELS: Record<string, Record<string, string>> = {
  fr: { breakfast: 'Petit-dejeuner', morning_snack: 'Collation matin', lunch: 'Dejeuner', afternoon_snack: 'Gouter', dinner: 'Diner', bedtime: 'Avant dodo' },
  en: { breakfast: 'Breakfast', morning_snack: 'Morning snack', lunch: 'Lunch', afternoon_snack: 'Afternoon snack', dinner: 'Dinner', bedtime: 'Bedtime snack' },
};

// ──────────── ACTION LABELS (LOCALIZED) ────────────

const ACTION_LABELS: Record<string, Record<string, string>> = {
  fr: { quickEntry: 'Saisie rapide', logMeal: 'Valider un repas', doCheckin: 'Faire le check-in', choose: 'Choisir' },
  en: { quickEntry: 'Quick entry', logMeal: 'Log a meal', doCheckin: 'Do check-in', choose: 'Choose' },
};

// ──────────── BANQUES DE MESSAGES (FR/EN) ────────────

type MsgBank = { text: string; subtext: string }[];
type LocalizedBank = Record<string, MsgBank>;

const STREAK_DANGER: LocalizedBank = {
  fr: [
    { text: 'Ta serie de {streak} jours est en jeu !', subtext: 'Valide au moins un repas avant minuit pour garder ta flamme.' },
    { text: '{prenom}, ta flamme va s\'eteindre...', subtext: 'Un repas libre suffit. 2 minutes et c\'est sauve.' },
    { text: '{streak} jours de suite, ca serait dommage de casser ca maintenant.', subtext: 'Valide un repas, meme rapide.' },
  ],
  en: [
    { text: 'Your {streak}-day streak is at stake!', subtext: 'Log at least one meal before midnight to keep your flame.' },
    { text: '{prenom}, your flame is about to die...', subtext: 'A simple meal will do. 2 minutes and it\'s saved.' },
    { text: '{streak} days in a row, it would be a shame to break it now.', subtext: 'Log a meal, even a quick one.' },
  ],
};

const NO_MEAL_AFTERNOON: LocalizedBank = {
  fr: [
    { text: 'Tu n\'as encore rien valide aujourd\'hui {prenom}.', subtext: 'C\'est pas grave, mais essaie de noter ce que tu manges pour garder ton suivi.' },
    { text: 'La journee avance et ton suivi est vide.', subtext: 'Meme un repas libre, ca compte. Ton corps te remerciera.' },
    { text: 'Hey {prenom}, oublie pas de tracker tes repas !', subtext: 'Pas besoin d\'etre parfait, juste regulier.' },
  ],
  en: [
    { text: 'You haven\'t logged anything today {prenom}.', subtext: 'No worries, but try to track what you eat to keep your progress.' },
    { text: 'The day is moving and your tracker is empty.', subtext: 'Even a simple meal counts. Your body will thank you.' },
    { text: 'Hey {prenom}, don\'t forget to track your meals!', subtext: 'You don\'t need to be perfect, just consistent.' },
  ],
};

const NEXT_MEAL: LocalizedBank = {
  fr: [
    { text: 'C\'est bientot l\'heure du {slot} !', subtext: 'Regarde ce que FORGA te propose ou entre ton repas.' },
    { text: '{slot} en approche.', subtext: 'T\'as deja une idee de ce que tu vas manger ?' },
    { text: 'C\'est l\'heure de passer a table, {prenom}.', subtext: 'Ton {slot} t\'attend. Choisis ou entre ton repas.' },
  ],
  en: [
    { text: 'It\'s almost time for {slot}!', subtext: 'Check what FORGA suggests or enter your meal.' },
    { text: '{slot} coming up.', subtext: 'Already know what you\'re going to eat?' },
    { text: 'Time to eat, {prenom}.', subtext: 'Your {slot} is waiting. Choose or enter your meal.' },
  ],
};

const CHECKIN_SUNDAY: LocalizedBank = {
  fr: [
    { text: 'C\'est dimanche {prenom} !', subtext: 'Prends 2 min pour ton check-in hebdo. Ca permet a FORGA d\'ajuster ton plan.' },
    { text: 'Fin de semaine ! Comment tu te sens ?', subtext: 'Ton check-in permet de suivre ta progression et d\'adapter tes macros.' },
  ],
  en: [
    { text: 'It\'s Sunday {prenom}!', subtext: 'Take 2 min for your weekly check-in. It helps FORGA adjust your plan.' },
    { text: 'End of the week! How do you feel?', subtext: 'Your check-in helps track your progress and adjust your macros.' },
  ],
};

const STREAK_GREAT: LocalizedBank = {
  fr: [
    { text: '{streak} jours d\'affilee, t\'es une machine {prenom} !', subtext: 'Pas beaucoup de gens tiennent ca. Respect.' },
    { text: 'Serie de {streak} jours. Impressionnant.', subtext: 'Ta regularite est ta meilleure arme.' },
    { text: '{prenom}, {streak} jours sans lacher. Tu forges du solide.', subtext: 'Continue comme ca, les resultats suivent toujours.' },
  ],
  en: [
    { text: '{streak} days in a row, you\'re a machine {prenom}!', subtext: 'Not many people can keep this up. Respect.' },
    { text: '{streak}-day streak. Impressive.', subtext: 'Your consistency is your best weapon.' },
    { text: '{prenom}, {streak} days without giving up. You\'re building something solid.', subtext: 'Keep going, results always follow.' },
  ],
};

const STREAK_LEGENDARY: LocalizedBank = {
  fr: [
    { text: '{streak} jours. T\'es pas humain {prenom}.', subtext: 'A ce rythme la, rien ne peut t\'arreter.' },
    { text: 'Un mois de suite. {prenom}, t\'es dans une autre dimension.', subtext: 'C\'est ce genre de regularite qui change un physique.' },
  ],
  en: [
    { text: '{streak} days. You\'re not human {prenom}.', subtext: 'At this pace, nothing can stop you.' },
    { text: 'A whole month straight. {prenom}, you\'re on another level.', subtext: 'This kind of consistency changes a physique.' },
  ],
};

const ALL_MEALS_DONE: LocalizedBank = {
  fr: [
    { text: 'Journee parfaite {prenom} !', subtext: 'Tous tes repas sont valides. Repose-toi bien ce soir.' },
    { text: 'T\'as tout donne aujourd\'hui.', subtext: 'Ton corps te remercie. Demain on recommence.' },
    { text: 'Tous les repas valides ! Clean.', subtext: 'C\'est cette constance qui fait la difference.' },
  ],
  en: [
    { text: 'Perfect day {prenom}!', subtext: 'All your meals are logged. Rest well tonight.' },
    { text: 'You gave it your all today.', subtext: 'Your body thanks you. Tomorrow we go again.' },
    { text: 'All meals logged! Clean.', subtext: 'This consistency is what makes the difference.' },
  ],
};

const SCORE_UP: LocalizedBank = {
  fr: [
    { text: 'Ton score FORGA monte, {prenom} !', subtext: 'Tes efforts payent. Continue sur cette lancee.' },
    { text: 'Belle progression cette semaine.', subtext: 'Ton score reflete ta discipline. Keep going.' },
  ],
  en: [
    { text: 'Your FORGA score is climbing, {prenom}!', subtext: 'Your efforts are paying off. Keep this momentum.' },
    { text: 'Great progress this week.', subtext: 'Your score reflects your discipline. Keep going.' },
  ],
};

const LOW_PROTEIN: LocalizedBank = {
  fr: [
    { text: 'T\'es a {consumedP}g de proteines sur {targetP}g.', subtext: 'Pense a ajouter une source de proteines a ton prochain repas.' },
    { text: 'Tes proteines sont un peu basses aujourd\'hui.', subtext: 'Un shaker, des oeufs ou du poulet pour rattraper le retard ?' },
  ],
  en: [
    { text: 'You\'re at {consumedP}g of protein out of {targetP}g.', subtext: 'Try adding a protein source to your next meal.' },
    { text: 'Your protein is a bit low today.', subtext: 'A shake, some eggs or chicken to catch up?' },
  ],
};

const BULK_TIPS: LocalizedBank = {
  fr: [
    { text: 'En prise de masse, chaque repas compte.', subtext: 'Vise bien tes {targetCal} kcal pour construire du muscle.' },
    { text: 'N\'aie pas peur de manger {prenom}.', subtext: 'Pour prendre du muscle, faut donner du carburant. Tu suis bien tes macros.' },
    { text: 'Les muscles se construisent aussi a table.', subtext: 'Assure-toi d\'atteindre tes proteines aujourd\'hui.' },
  ],
  en: [
    { text: 'When bulking, every meal counts.', subtext: 'Aim for your {targetCal} kcal to build muscle.' },
    { text: 'Don\'t be afraid to eat {prenom}.', subtext: 'To build muscle, you need fuel. You\'re tracking your macros well.' },
    { text: 'Muscles are built at the table too.', subtext: 'Make sure you hit your protein today.' },
  ],
};

const CUT_TIPS: LocalizedBank = {
  fr: [
    { text: 'Seche en cours, tiens bon {prenom}.', subtext: 'Respecte ton deficit et les resultats viendront.' },
    { text: 'Chaque jour en deficit te rapproche de ton objectif.', subtext: 'La patience est ta meilleure alliee en seche.' },
    { text: 'T\'as faim ? C\'est normal en seche.', subtext: 'Privilegie les proteines et les legumes pour la satiete.' },
  ],
  en: [
    { text: 'Cut in progress, stay strong {prenom}.', subtext: 'Stick to your deficit and results will come.' },
    { text: 'Every day in deficit brings you closer to your goal.', subtext: 'Patience is your best ally during a cut.' },
    { text: 'Feeling hungry? That\'s normal during a cut.', subtext: 'Prioritize protein and veggies for satiety.' },
  ],
};

const MORNING_MOTIVATION: LocalizedBank = {
  fr: [
    { text: 'Nouvelle journee, nouvelles opportunites {prenom}.', subtext: 'Attaque avec un bon petit-dej, le reste suivra.' },
    { text: 'Hey {prenom} ! Bien manger le matin, c\'est 50% de la journee de gagnee.', subtext: 'Ton corps a besoin de carburant apres la nuit.' },
    { text: 'Salut {prenom}, pret a forger ta journee ?', subtext: 'Un bon petit-dejeuner, et c\'est parti.' },
  ],
  en: [
    { text: 'New day, new opportunities {prenom}.', subtext: 'Start with a good breakfast, the rest will follow.' },
    { text: 'Hey {prenom}! Eating well in the morning is 50% of the battle.', subtext: 'Your body needs fuel after the night.' },
    { text: 'Hey {prenom}, ready to forge your day?', subtext: 'A good breakfast, and let\'s go.' },
  ],
};

const EVENING_CHILL: LocalizedBank = {
  fr: [
    { text: 'La journee touche a sa fin {prenom}.', subtext: 'N\'oublie pas ton repas du soir, c\'est important pour la recuperation.' },
    { text: 'Bonsoir {prenom} ! Dernier repas de la journee.', subtext: 'Un diner equilibre pour bien dormir et bien recuperer.' },
  ],
  en: [
    { text: 'The day is winding down {prenom}.', subtext: 'Don\'t forget your evening meal, it\'s important for recovery.' },
    { text: 'Good evening {prenom}! Last meal of the day.', subtext: 'A balanced dinner for good sleep and recovery.' },
  ],
};

const GENERAL_MOTIVATION: LocalizedBank = {
  fr: [
    { text: 'Chaque repas valide te rapproche de ton objectif.', subtext: 'C\'est pas la perfection qui compte, c\'est la regularite.' },
    { text: 'La nutrition c\'est 80% du resultat.', subtext: 'T\'es au bon endroit pour prendre ca en main.' },
    { text: 'Petit a petit, {prenom}, on forge du solide.', subtext: 'Fais confiance au processus.' },
    { text: 'Rome ne s\'est pas construite en un jour.', subtext: 'Mais ils posaient des briques chaque jour. Toi aussi.' },
    { text: 'Le plus dur c\'est de commencer. T\'es deja la.', subtext: 'Continue, les resultats arrivent.' },
  ],
  en: [
    { text: 'Every logged meal brings you closer to your goal.', subtext: 'It\'s not about perfection, it\'s about consistency.' },
    { text: 'Nutrition is 80% of the result.', subtext: 'You\'re in the right place to take control.' },
    { text: 'Step by step, {prenom}, you\'re building something solid.', subtext: 'Trust the process.' },
    { text: 'Rome wasn\'t built in a day.', subtext: 'But they laid bricks every day. So do you.' },
    { text: 'The hardest part is starting. You\'re already here.', subtext: 'Keep going, results are coming.' },
  ],
};

const SKIP_BREAKFAST: LocalizedBank = {
  fr: [
    { text: 'T\'as pas pris de petit-dej aujourd\'hui {prenom}.', subtext: 'Le petit-dejeuner lance ton metabolisme. Essaie de manger dans les 2h apres le reveil.' },
    { text: 'Petit-dej saute !', subtext: 'En {objective}, c\'est important de bien repartir tes repas. Commence par un shaker ou un yaourt si t\'as pas faim le matin.' },
  ],
  en: [
    { text: 'You skipped breakfast today {prenom}.', subtext: 'Breakfast kickstarts your metabolism. Try eating within 2h of waking up.' },
    { text: 'Breakfast skipped!', subtext: 'When {objective}, spreading meals matters. Start with a shake or yogurt if you\'re not hungry.' },
  ],
};

const MEAL_GAP_LONG: LocalizedBank = {
  fr: [
    { text: 'Ca fait {gap}h que t\'as pas mange {prenom}.', subtext: 'Essaie de manger toutes les 3-4h pour maintenir ton energie et ta synthese proteique.' },
    { text: '{gap} heures sans manger, c\'est long.', subtext: 'Meme un snack proteine suffit pour relancer ta machine.' },
  ],
  en: [
    { text: 'It\'s been {gap}h since your last meal {prenom}.', subtext: 'Try eating every 3-4h to maintain energy and protein synthesis.' },
    { text: '{gap} hours without food, that\'s a while.', subtext: 'Even a protein snack is enough to keep your engine running.' },
  ],
};

const LATE_DINNER: LocalizedBank = {
  fr: [
    { text: 'Dernier repas a {lastMealH}h, c\'est un peu tard.', subtext: 'Essaie de diner avant 21h pour une meilleure digestion et un meilleur sommeil.' },
    { text: 'Tu manges tard {prenom}.', subtext: 'Un diner tardif peut perturber ton sommeil et ta recuperation. Anticipe si possible.' },
  ],
  en: [
    { text: 'Last meal at {lastMealH}h, that\'s a bit late.', subtext: 'Try eating dinner before 9pm for better digestion and sleep.' },
    { text: 'You\'re eating late {prenom}.', subtext: 'Late dinners can disrupt sleep and recovery. Plan ahead if you can.' },
  ],
};

// ──────────── MOTEUR PRINCIPAL ────────────

export function getCoachMessage(input: CoachInput): CoachMessage {
  const locale = useSettingsStore.getState().locale;
  const slotLabels = SLOT_LABELS[locale] ?? SLOT_LABELS.fr;
  const actionLabels = ACTION_LABELS[locale] ?? ACTION_LABELS.fr;

  const vars: Record<string, string | number> = {
    prenom: input.firstName,
    streak: input.currentStreak,
    slot: input.currentSlot ? slotLabels[input.currentSlot] : '',
    targetP: input.targetProtein,
    consumedP: input.consumedProtein,
    targetCal: input.targetCalories,
  };

  // ─── P1: STREAK EN DANGER ───
  if (input.hour >= 20 && input.currentStreak > 0 && !input.isTodayValidated) {
    const msg = pick(STREAK_DANGER[locale] ?? STREAK_DANGER.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'alert',
      action: { label: actionLabels.quickEntry, route: '/meal/custom?slot=dinner' } };
  }

  // ─── P1: AUCUN REPAS APRES 14H ───
  if (input.hour >= 14 && input.mealsValidatedCount === 0) {
    const msg = pick(NO_MEAL_AFTERNOON[locale] ?? NO_MEAL_AFTERNOON.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'alert',
      action: { label: actionLabels.logMeal, route: '/(tabs)/meals' } };
  }

  // ─── P2: CHECK-IN DIMANCHE / SUNDAY (dayOfWeek 0 = Sunday in JS) ───
  if (input.dayOfWeek === 0 && input.hour >= 10) {
    const msg = pick(CHECKIN_SUNDAY[locale] ?? CHECKIN_SUNDAY.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill',
      action: { label: actionLabels.doCheckin, route: '/checkin' } };
  }

  // ─── P3: TOUS LES REPAS VALIDES ───
  if (input.mealsValidatedCount >= input.mealsExpected && input.mealsExpected > 0) {
    const msg = pick(ALL_MEALS_DONE[locale] ?? ALL_MEALS_DONE.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P3: STREAK LEGENDAIRE (30+) ───
  if (input.currentStreak >= 30) {
    const msg = pick(STREAK_LEGENDARY[locale] ?? STREAK_LEGENDARY.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P3: STREAK IMPRESSIONNANT (7+) ───
  if (input.currentStreak >= 7) {
    const msg = pick(STREAK_GREAT[locale] ?? STREAK_GREAT.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P3: SCORE EN HAUSSE ───
  if (input.score.total >= 50 && input.score.consistency >= 20) {
    const msg = pick(SCORE_UP[locale] ?? SCORE_UP.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P3.5: PETIT-DEJ SAUTE (apres 11h) ───
  if (input.hour >= 11 && input.breakfastLogged === false && input.mealsValidatedCount > 0) {
    const objLabel = locale === 'en'
      ? (input.objective === 'bulk' ? 'bulking' : input.objective === 'cut' ? 'cutting' : 'maintaining')
      : (input.objective === 'bulk' ? 'prise de masse' : input.objective === 'cut' ? 'seche' : 'maintien');
    const msg = pick(SKIP_BREAKFAST[locale] ?? SKIP_BREAKFAST.fr);
    return { text: fill(msg.text, { ...vars, objective: objLabel }), subtext: fill(msg.subtext, { ...vars, objective: objLabel }), mood: 'chill' as CoachMood };
  }

  // ─── P3.5: TROP LONGTEMPS SANS MANGER (5h+) ───
  if (input.hoursWithoutMeal && input.hoursWithoutMeal >= 5 && input.mealsValidatedCount > 0 && input.mealsValidatedCount < input.mealsExpected) {
    const msg = pick(MEAL_GAP_LONG[locale] ?? MEAL_GAP_LONG.fr);
    return { text: fill(msg.text, { ...vars, gap: input.hoursWithoutMeal }), subtext: fill(msg.subtext, { ...vars, gap: input.hoursWithoutMeal }), mood: 'chill' as CoachMood,
      action: { label: actionLabels.logMeal, route: '/(tabs)/meals' } };
  }

  // ─── P3.5: DINER TARDIF (apres 21h30) ───
  if (input.lastMealHour && input.lastMealHour >= 22 && input.hour >= 7 && input.hour < 12) {
    const msg = pick(LATE_DINNER[locale] ?? LATE_DINNER.fr);
    return { text: fill(msg.text, { ...vars, lastMealH: input.lastMealHour }), subtext: fill(msg.subtext, { ...vars, lastMealH: input.lastMealHour }), mood: 'chill' as CoachMood };
  }

  // ─── P4: PROTEINES BASSES (apres midi) ───
  if (input.hour >= 14 && input.consumedProtein > 0 && input.consumedProtein < input.targetProtein * 0.4) {
    const msg = pick(LOW_PROTEIN[locale] ?? LOW_PROTEIN.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill' };
  }

  // ─── P4: TIPS OBJECTIF ───
  if (input.objective === 'bulk' && input.hour >= 10 && input.hour < 20) {
    const msg = pick(BULK_TIPS[locale] ?? BULK_TIPS.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }
  if (input.objective === 'cut' && input.hour >= 10 && input.hour < 20) {
    const msg = pick(CUT_TIPS[locale] ?? CUT_TIPS.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P2: PROCHAIN REPAS ───
  if (input.currentSlot && input.mealsValidatedCount < input.mealsExpected) {
    const msg = pick(NEXT_MEAL[locale] ?? NEXT_MEAL.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill',
      action: { label: actionLabels.choose, route: '/(tabs)/meals' } };
  }

  // ─── P5: MATIN ───
  if (input.hour < 11) {
    const msg = pick(MORNING_MOTIVATION[locale] ?? MORNING_MOTIVATION.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P5: SOIR ───
  if (input.hour >= 19) {
    const msg = pick(EVENING_CHILL[locale] ?? EVENING_CHILL.fr);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill' };
  }

  // ─── P5: FALLBACK ───
  const msg = pick(GENERAL_MOTIVATION[locale] ?? GENERAL_MOTIVATION.fr);
  return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
}
