// NutrEngine™ — Système adaptatif avec feedback (check-in hebdomadaire)
import { ADAPTIVE_LIMITS } from './constants';
import type { AdaptiveInput, AdaptiveResult } from '../types/engine';

/**
 * Calcule l'ajustement calorique basé sur le check-in hebdomadaire.
 *
 * Logique :
 * 1. Vérifier la tendance de poids vs l'objectif
 * 2. Prendre en compte l'énergie, la faim, les performances et le sommeil
 * 3. Proposer un ajustement entre -200 et +200 kcal
 */
export function calculateAdaptiveAdjustment(input: AdaptiveInput): AdaptiveResult {
  const { currentCalories, objective, weightTrendPerWeek, energy, hunger, performance, sleep } = input;

  let adjustment = 0;
  const reasons: string[] = [];

  // --- Étape 1 : Ajustement basé sur la tendance de poids ---
  adjustment += getWeightTrendAdjustment(objective, weightTrendPerWeek, reasons);

  // --- Étape 2 : Ajustement basé sur le feedback subjectif ---
  adjustment += getSubjectiveAdjustment(objective, energy, hunger, performance, sleep, reasons);

  // --- Étape 3 : Clamping ---
  const { maxAdjustmentPerWeek, minAdjustmentThreshold } = ADAPTIVE_LIMITS;

  // Ignorer les petits ajustements
  if (Math.abs(adjustment) < minAdjustmentThreshold) {
    return {
      calorieAdjustment: 0,
      reason: 'Ton plan est bien calibré. On continue comme ça.',
      newDailyCalories: currentCalories,
    };
  }

  // Limiter l'ajustement
  adjustment = Math.max(-maxAdjustmentPerWeek, Math.min(maxAdjustmentPerWeek, adjustment));

  // Arrondir à 25 kcal
  adjustment = Math.round(adjustment / 25) * 25;

  const newCalories = currentCalories + adjustment;

  return {
    calorieAdjustment: adjustment,
    reason: reasons.join(' '),
    newDailyCalories: Math.max(1200, newCalories),
  };
}

function getWeightTrendAdjustment(
  objective: string,
  trend: number,
  reasons: string[],
): number {
  let adj = 0;

  if (objective === 'bulk') {
    if (trend < 0.1) {
      adj = +100;
      reasons.push('Tu ne prends pas assez de poids.');
    } else if (trend > 0.7) {
      adj = -100;
      reasons.push('Tu prends trop vite, on réduit légèrement.');
    }
  }

  if (objective === 'cut') {
    if (trend > -0.2) {
      adj = -100;
      reasons.push('La perte est trop lente, on ajuste.');
    } else if (trend < -1.0) {
      adj = +100;
      reasons.push('Tu perds trop vite, on ralentit pour préserver le muscle.');
    }
  }

  if (objective === 'maintain') {
    if (Math.abs(trend) > 0.3) {
      adj = trend > 0 ? -75 : +75;
      reasons.push('Ton poids dérive, on corrige.');
    }
  }

  if (objective === 'recomp') {
    if (trend > 0.3) {
      adj = -75;
      reasons.push('Légère prise excessive, on ajuste.');
    } else if (trend < -0.5) {
      adj = +75;
      reasons.push('Tu perds trop, on remonte les calories.');
    }
  }

  return adj;
}

function getSubjectiveAdjustment(
  objective: string,
  energy: number,
  hunger: number,
  performance: number,
  sleep: number,
  reasons: string[],
): number {
  let adj = 0;

  // Énergie basse (1-2/5) → probablement sous-alimenté
  if (energy <= 2) {
    adj += 50;
    reasons.push('Ton énergie est basse.');
  }

  // Faim excessive (4-5/5) en cut → augmenter un peu
  if (hunger >= 4 && (objective === 'cut' || objective === 'recomp')) {
    adj += 50;
    reasons.push('Tu as trop faim.');
  }

  // Performances en baisse (1-2/4)
  if (performance <= 2) {
    adj += 50;
    reasons.push('Tes perfs en salle baissent.');
  }

  // Mauvais sommeil (1-2/4) → le stress peut être lié au déficit
  if (sleep <= 2 && objective === 'cut') {
    adj += 25;
    reasons.push('Ton sommeil est impacté.');
  }

  return adj;
}
