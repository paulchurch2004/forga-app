// NutrEngine™ — Calcul TDEE (Mifflin-St Jeor)
import { ACTIVITY_MULTIPLIERS } from './constants';
import type { TDEEInput, TDEEResult } from '../types/engine';

/**
 * Calcule le BMR avec la formule Mifflin-St Jeor
 * Homme : (10 × poids kg) + (6.25 × taille cm) - (5 × âge) + 5
 * Femme : (10 × poids kg) + (6.25 × taille cm) - (5 × âge) - 161
 */
export function calculateBMR(sex: 'male' | 'female', weightKg: number, heightCm: number, age: number): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calcule le TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × multiplicateur d'activité
 */
export function calculateTDEE(input: TDEEInput): TDEEResult {
  const bmr = calculateBMR(input.sex, input.weightKg, input.heightCm, input.age);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel];
  const tdee = Math.round(bmr * activityMultiplier);

  return {
    bmr: Math.round(bmr),
    tdee,
    activityMultiplier,
  };
}
