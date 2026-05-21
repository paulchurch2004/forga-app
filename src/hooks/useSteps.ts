import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { readDailySteps } from '../services/appleHealth';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import type { ActivityLevel } from '../types/user';

/**
 * Cibles de pas quotidiennes en fonction du niveau d'activité déclaré
 * à l'onboarding. Référence : OMS + études fitness mainstream.
 * Les paliers sont espacés de ~2000 pas pour rester atteignables et
 * cohérents avec la perception "10k steps" du grand public.
 */
const STEP_TARGETS: Record<ActivityLevel, number> = {
  sedentary: 6000,
  light: 8000,
  moderate: 10000,
  active: 12000,
  very_active: 14000,
};

/** Coût énergétique moyen d'un pas. ~0,045 kcal/pas est la moyenne
 *  adulte 70kg à vitesse modérée — assez précis pour un ajustement
 *  de macros, pas une mesure scientifique. */
const KCAL_PER_STEP = 0.045;

/** Plafond de sécurité pour la compensation kcal — évite qu'un user
 *  qui marche 30k pas en randonnée double ses calories du jour. */
const MAX_BONUS_KCAL = 400;

interface UseStepsResult {
  /** Pas comptés aujourd'hui (depuis Apple Health). 0 si HealthKit
   *  indisponible ou non autorisé. */
  todaySteps: number;
  /** Cible journalière dérivée de l'activityLevel de l'user. */
  targetSteps: number;
  /** Progression 0–1 (clipée à 1 pour éviter de casser les rings). */
  progress: number;
  /** Bonus calorique recommandé si l'user a dépassé sa cible.
   *  Calculé via (pas_extras × KCAL_PER_STEP), plafonné. Ajusté à
   *  50% pour les objectifs cut afin de ne pas casser le déficit. */
  bonusKcal: number;
  /** True si Apple Health a été configuré et autorisé. */
  isAvailable: boolean;
  /** Force un refresh manuel (à appeler après autorisation, etc). */
  refresh: () => Promise<void>;
}

/**
 * Hook central pour le compteur de pas. Lit Apple Health à chaque
 * foreground de l'app pour rester à jour sans hammer la batterie.
 *
 * Sur Android, retourne toujours 0 — pas de Google Fit en v1.
 * Sur iOS sans permission HealthKit, retourne 0 et `isAvailable=false`.
 */
export function useSteps(): UseStepsResult {
  const profile = useUserStore((s) => s.profile);
  const stepsEnabled = useSettingsStore((s) => s.stepsEnabled);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const targetSteps = profile
    ? STEP_TARGETS[profile.activityLevel] ?? 10000
    : 10000;

  const progress = targetSteps > 0
    ? Math.min(1, todaySteps / targetSteps)
    : 0;

  // Bonus kcal : pas par-dessus la cible × kcal/pas, plafonné, et
  // réduit à 50% en sèche pour préserver le déficit calorique.
  const bonusKcal = (() => {
    if (!profile || todaySteps <= targetSteps) return 0;
    const extra = todaySteps - targetSteps;
    let bonus = Math.round(extra * KCAL_PER_STEP);
    if (profile.objective === 'cut') bonus = Math.round(bonus * 0.5);
    return Math.min(MAX_BONUS_KCAL, bonus);
  })();

  const refresh = useCallback(async () => {
    if (!stepsEnabled) {
      setTodaySteps(0);
      setIsAvailable(false);
      return;
    }
    try {
      const steps = await readDailySteps(new Date());
      setTodaySteps(Math.round(steps));
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
    }
  }, [stepsEnabled]);

  // Initial fetch + refresh quand l'app revient au foreground.
  // Pas de polling : Apple Health n'a pas de push, et un refresh
  // à chaque foreground couvre 99% des cas concrets.
  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    todaySteps,
    targetSteps,
    progress,
    bonusKcal,
    isAvailable,
    refresh,
  };
}
