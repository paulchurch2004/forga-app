// Coach Virtuel FORGA — Moteur de messages contextuels
import { MEAL_SLOT_LABELS, type MealSlot } from '../types/meal';
import type { ForgaScore } from '../types/score';

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

// ──────────── BANQUES DE MESSAGES ────────────

const STREAK_DANGER = [
  { text: 'Ta serie de {streak} jours est en jeu !', subtext: 'Valide au moins un repas avant minuit pour garder ta flamme.' },
  { text: '{prenom}, ta flamme va s\'eteindre...', subtext: 'Un repas libre suffit. 2 minutes et c\'est sauve.' },
  { text: '{streak} jours de suite, ca serait dommage de casser ca maintenant.', subtext: 'Valide un repas, meme rapide.' },
];

const NO_MEAL_AFTERNOON = [
  { text: 'Tu n\'as encore rien valide aujourd\'hui {prenom}.', subtext: 'C\'est pas grave, mais essaie de noter ce que tu manges pour garder ton suivi.' },
  { text: 'La journee avance et ton suivi est vide.', subtext: 'Meme un repas libre, ca compte. Ton corps te remerciera.' },
  { text: 'Hey {prenom}, oublie pas de tracker tes repas !', subtext: 'Pas besoin d\'etre parfait, juste regulier.' },
];

const NEXT_MEAL = [
  { text: 'C\'est bientot l\'heure du {slot} !', subtext: 'Regarde ce que FORGA te propose ou entre ton repas.' },
  { text: '{slot} en approche.', subtext: 'T\'as deja une idee de ce que tu vas manger ?' },
  { text: 'C\'est l\'heure de passer a table, {prenom}.', subtext: 'Ton {slot} t\'attend. Choisis ou entre ton repas.' },
];

const CHECKIN_SUNDAY = [
  { text: 'C\'est dimanche {prenom} !', subtext: 'Prends 2 min pour ton check-in hebdo. Ca permet a FORGA d\'ajuster ton plan.' },
  { text: 'Fin de semaine ! Comment tu te sens ?', subtext: 'Ton check-in permet de suivre ta progression et d\'adapter tes macros.' },
];

const STREAK_GREAT = [
  { text: '{streak} jours d\'affilee, t\'es une machine {prenom} !', subtext: 'Pas beaucoup de gens tiennent ca. Respect.' },
  { text: 'Serie de {streak} jours. Impressionnant.', subtext: 'Ta regularite est ta meilleure arme.' },
  { text: '{prenom}, {streak} jours sans lacher. Tu forges du solide.', subtext: 'Continue comme ca, les resultats suivent toujours.' },
];

const STREAK_LEGENDARY = [
  { text: '{streak} jours. T\'es pas humain {prenom}.', subtext: 'A ce rythme la, rien ne peut t\'arreter.' },
  { text: 'Un mois de suite. {prenom}, t\'es dans une autre dimension.', subtext: 'C\'est ce genre de regularite qui change un physique.' },
];

const ALL_MEALS_DONE = [
  { text: 'Journee parfaite {prenom} !', subtext: 'Tous tes repas sont valides. Repose-toi bien ce soir.' },
  { text: 'T\'as tout donne aujourd\'hui.', subtext: 'Ton corps te remercie. Demain on recommence.' },
  { text: 'Tous les repas valides ! Clean.', subtext: 'C\'est cette constance qui fait la difference.' },
];

const SCORE_UP = [
  { text: 'Ton score FORGA monte, {prenom} !', subtext: 'Tes efforts payent. Continue sur cette lancee.' },
  { text: 'Belle progression cette semaine.', subtext: 'Ton score reflete ta discipline. Keep going.' },
];

const LOW_PROTEIN = [
  { text: 'T\'es a {consumedP}g de proteines sur {targetP}g.', subtext: 'Pense a ajouter une source de proteines a ton prochain repas.' },
  { text: 'Tes proteines sont un peu basses aujourd\'hui.', subtext: 'Un shaker, des oeufs ou du poulet pour rattraper le retard ?' },
];

const BULK_TIPS = [
  { text: 'En prise de masse, chaque repas compte.', subtext: 'Vise bien tes {targetCal} kcal pour construire du muscle.' },
  { text: 'N\'aie pas peur de manger {prenom}.', subtext: 'Pour prendre du muscle, faut donner du carburant. Tu suis bien tes macros.' },
  { text: 'Les muscles se construisent aussi a table.', subtext: 'Assure-toi d\'atteindre tes proteines aujourd\'hui.' },
];

const CUT_TIPS = [
  { text: 'Seche en cours, tiens bon {prenom}.', subtext: 'Respecte ton deficit et les resultats viendront.' },
  { text: 'Chaque jour en deficit te rapproche de ton objectif.', subtext: 'La patience est ta meilleure alliee en seche.' },
  { text: 'T\'as faim ? C\'est normal en seche.', subtext: 'Privilegie les proteines et les legumes pour la satiete.' },
];

const MORNING_MOTIVATION = [
  { text: 'Nouvelle journee, nouvelles opportunites {prenom}.', subtext: 'Attaque avec un bon petit-dej, le reste suivra.' },
  { text: 'Hey {prenom} ! Bien manger le matin, c\'est 50% de la journee de gagnee.', subtext: 'Ton corps a besoin de carburant apres la nuit.' },
  { text: 'Salut {prenom}, pret a forger ta journee ?', subtext: 'Un bon petit-dejeuner, et c\'est parti.' },
];

const EVENING_CHILL = [
  { text: 'La journee touche a sa fin {prenom}.', subtext: 'N\'oublie pas ton repas du soir, c\'est important pour la recuperation.' },
  { text: 'Bonsoir {prenom} ! Dernier repas de la journee.', subtext: 'Un diner equilibre pour bien dormir et bien recuperer.' },
];

const GENERAL_MOTIVATION = [
  { text: 'Chaque repas valide te rapproche de ton objectif.', subtext: 'C\'est pas la perfection qui compte, c\'est la regularite.' },
  { text: 'La nutrition c\'est 80% du resultat.', subtext: 'T\'es au bon endroit pour prendre ca en main.' },
  { text: 'Petit a petit, {prenom}, on forge du solide.', subtext: 'Fais confiance au processus.' },
  { text: 'Rome ne s\'est pas construite en un jour.', subtext: 'Mais ils posaient des briques chaque jour. Toi aussi.' },
  { text: 'Le plus dur c\'est de commencer. T\'es deja la.', subtext: 'Continue, les resultats arrivent.' },
];

// ──────────── MOTEUR PRINCIPAL ────────────

export function getCoachMessage(input: CoachInput): CoachMessage {
  const vars: Record<string, string | number> = {
    prenom: input.firstName,
    streak: input.currentStreak,
    slot: input.currentSlot ? MEAL_SLOT_LABELS[input.currentSlot] : '',
    targetP: input.targetProtein,
    consumedP: input.consumedProtein,
    targetCal: input.targetCalories,
  };

  // ─── P1: STREAK EN DANGER ───
  if (input.hour >= 20 && input.currentStreak > 0 && !input.isTodayValidated) {
    const msg = pick(STREAK_DANGER);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'alert',
      action: { label: 'Saisie rapide', route: '/meal/custom?slot=dinner' } };
  }

  // ─── P1: AUCUN REPAS APRES 14H ───
  if (input.hour >= 14 && input.mealsValidatedCount === 0) {
    const msg = pick(NO_MEAL_AFTERNOON);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'alert',
      action: { label: 'Valider un repas', route: '/(tabs)/meals' } };
  }

  // ─── P2: CHECK-IN DIMANCHE ───
  if (input.dayOfWeek === 0 && input.hour >= 10) {
    const msg = pick(CHECKIN_SUNDAY);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill',
      action: { label: 'Faire le check-in', route: '/checkin' } };
  }

  // ─── P3: TOUS LES REPAS VALIDES ───
  if (input.mealsValidatedCount >= input.mealsExpected && input.mealsExpected > 0) {
    const msg = pick(ALL_MEALS_DONE);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P3: STREAK LEGENDAIRE (30+) ───
  if (input.currentStreak >= 30) {
    const msg = pick(STREAK_LEGENDARY);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P3: STREAK IMPRESSIONNANT (7+) ───
  if (input.currentStreak >= 7) {
    const msg = pick(STREAK_GREAT);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P3: SCORE EN HAUSSE ───
  if (input.score.total >= 50 && input.score.consistency >= 20) {
    const msg = pick(SCORE_UP);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'trophy' };
  }

  // ─── P4: PROTEINES BASSES (apres midi) ───
  if (input.hour >= 14 && input.consumedProtein > 0 && input.consumedProtein < input.targetProtein * 0.4) {
    const msg = pick(LOW_PROTEIN);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill' };
  }

  // ─── P4: TIPS OBJECTIF ───
  if (input.objective === 'bulk' && input.hour >= 10 && input.hour < 20) {
    const msg = pick(BULK_TIPS);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }
  if (input.objective === 'cut' && input.hour >= 10 && input.hour < 20) {
    const msg = pick(CUT_TIPS);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P2: PROCHAIN REPAS ───
  if (input.currentSlot && input.mealsValidatedCount < input.mealsExpected) {
    const msg = pick(NEXT_MEAL);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill',
      action: { label: 'Choisir', route: '/(tabs)/meals' } };
  }

  // ─── P5: MATIN ───
  if (input.hour < 11) {
    const msg = pick(MORNING_MOTIVATION);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
  }

  // ─── P5: SOIR ───
  if (input.hour >= 19) {
    const msg = pick(EVENING_CHILL);
    return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'chill' };
  }

  // ─── P5: FALLBACK ───
  const msg = pick(GENERAL_MOTIVATION);
  return { text: fill(msg.text, vars), subtext: fill(msg.subtext, vars), mood: 'fire' };
}
