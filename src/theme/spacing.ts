// FORGA Design System — Spacing & Layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  // ── Profondeur (ombre noire), 4 niveaux croissants ──
  // depth1 = effleurement · depth2 = carte · depth3 = élément soulevé /
  // modal · depth4 = action flottante. Donne une hiérarchie perceptible.
  depth1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  depth2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  depth3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
    elevation: 14,
  },
  depth4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 24,
  },
  // ── Halo de marque (ombre ORANGE) — pour faire "rayonner" un élément ──
  glow: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowStrong: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 14,
  },
} as const;

/** Max content width for mobile layout */
export const MAX_CONTENT_WIDTH = 500;

/** Breakpoint width above which desktop layout is used */
export const DESKTOP_BREAKPOINT = 768;

/** Max content width on desktop */
export const DESKTOP_MAX_CONTENT_WIDTH = 900;

/** Sidebar width on desktop */
export const SIDEBAR_WIDTH = 240;
