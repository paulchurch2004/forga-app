// FORGA Design System — Palette
// For theme-aware components, use: import { useTheme } from '../context/ThemeContext'
// This file provides backward-compatible dark theme colors for unmigrated files.
import { darkColors } from './themes';
import type { Locale } from '../store/settingsStore';

export const colors = darkColors;

export type ColorName = keyof typeof colors;

export function getScoreColor(score: number): string {
  if (score >= 86) return '#FFD700';
  if (score >= 71) return '#00D4AA';
  if (score >= 51) return '#FFD93D';
  if (score >= 31) return '#FF6B35';
  return '#FF4757';
}

export function getScoreLabel(score: number, locale: Locale = 'fr'): string {
  const labels = {
    fr: [
      'Debut de forge',
      'En progression',
      'Sur la bonne voie',
      'Forgeron',
      'Maitre Forgeron',
      'Legende FORGA',
    ],
    en: [
      'Just starting',
      'Progressing',
      'On track',
      'Forger',
      'Master Forger',
      'FORGA Legend',
    ],
  };
  const l = labels[locale];
  if (score >= 96) return l[5];
  if (score >= 86) return l[4];
  if (score >= 71) return l[3];
  if (score >= 51) return l[2];
  if (score >= 31) return l[1];
  return l[0];
}
