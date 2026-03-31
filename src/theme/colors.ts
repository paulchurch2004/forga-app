// FORGA Design System — Palette
export const colors = {
  // Backgrounds
  background: '#0B0B14',
  surface: '#13132B',
  surfaceHover: '#1E1E3A',

  // Primary
  primary: '#FF6B35',
  primaryLight: '#FF8A5C',
  primaryDark: '#E55A28',

  // Text
  text: '#FFFFFF',
  textSecondary: '#7B7B9E',
  textMuted: '#4A4A6A',

  // Macros
  protein: '#FF6B35',
  carbs: '#00D4AA',
  fat: '#FFD93D',
  calories: '#FF4757',

  // Score levels
  scoreHigh: '#00D4AA',
  scoreMid: '#FFD93D',
  scoreLow: '#FF4757',

  // Status
  success: '#00D4AA',
  warning: '#FFD93D',
  error: '#FF4757',

  // Misc
  border: '#1E1E3A',
  overlay: 'rgba(0,0,0,0.6)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorName = keyof typeof colors;

export function getScoreColor(score: number): string {
  if (score >= 86) return '#FFD700'; // doré (Légende)
  if (score >= 71) return colors.scoreHigh;
  if (score >= 51) return colors.scoreMid;
  if (score >= 31) return colors.primary;
  return colors.scoreLow;
}

export function getScoreLabel(score: number): string {
  if (score >= 96) return 'Légende FORGA';
  if (score >= 86) return 'Maître Forgeron';
  if (score >= 71) return 'Forgeron';
  if (score >= 51) return 'Sur la bonne voie';
  if (score >= 31) return 'En progression';
  return 'Début de forge';
}
