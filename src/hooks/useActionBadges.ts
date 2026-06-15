// Source de vérité UNIQUE des badges "à faire" (façon Instagram).
//
// Utilisée à la fois par la tab bar (src/components/layout/CustomTabBar)
// ET par les écrans de destination (ex: app/(tabs)/profile), pour que le
// point rouge "suive" l'utilisateur jusqu'à l'élément exact à actionner
// (fil d'Ariane) au lieu de s'arrêter sur l'onglet.
//
// Calcul volontairement LÉGER (sélecteurs Zustand + arithmétique de dates),
// pas de recalcul du moteur nutrition.

import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { todayLocalIso } from '../utils/date';

export interface ActionBadges {
  /** Nombre de créneaux de repas du jour pas encore loggés (0 = rien à faire). */
  mealsRemaining: number;
  /** Aucun check-in hebdo enregistré cette semaine (dimanche → samedi). */
  checkinDue: boolean;
  /** Essai / premium qui expire dans ≤ 2 jours. */
  trialEndingSoon: boolean;
}

export function useActionBadges(): ActionBadges {
  const mealsPerDay = useUserStore((s) => s.profile?.mealsPerDay) ?? 0;
  const premiumUntil = useUserStore((s) => s.profile?.premiumUntil);
  const checkIns = useUserStore((s) => s.checkIns);
  const todayMeals = useMealStore((s) => s.todayMeals);
  const lastMealDate = useMealStore((s) => s.lastMealDate);

  // Repas restants à logger aujourd'hui.
  const loggedSlots =
    lastMealDate === todayLocalIso() ? new Set(todayMeals.map((m) => m.slot)).size : 0;
  const mealsRemaining = Math.max(0, mealsPerDay - loggedSlots);

  // Check-in hebdo pas encore fait cette semaine.
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const checkinDue = !checkIns.some((c) => new Date(c.createdAt) >= weekStart);

  // Essai / premium qui expire bientôt.
  let trialEndingSoon = false;
  if (premiumUntil) {
    const days = (new Date(premiumUntil).getTime() - Date.now()) / 86400000;
    trialEndingSoon = days > 0 && days <= 2;
  }

  return { mealsRemaining, checkinDue, trialEndingSoon };
}
