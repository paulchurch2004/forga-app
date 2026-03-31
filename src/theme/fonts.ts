// FORGA Design System — Typography
export const fonts = {
  display: 'Outfit',        // Titres, score, gros chiffres
  body: 'DMSans',           // Texte courant, boutons
  data: 'JetBrainsMono',    // Macros, grammages, chiffres
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  score: 64,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
};
