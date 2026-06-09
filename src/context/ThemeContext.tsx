import React, { createContext, useContext, useMemo } from 'react';
import { useSettingsStore, type ThemeMode } from '../store/settingsStore';
import { darkColors, type ThemeColors } from '../theme/themes';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  isDark: true,
  themeMode: 'dark',
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  // ⚠️ FORGA est DARK-ONLY (v1). L'app est conçue dark-first : ~100
  // composants utilisent des couleurs claires codées en dur (texte blanc,
  // rgba(255,255,255,...)) qui deviennent illisibles sur fond clair. Plutôt
  // que de risquer 100 fichiers juste avant le launch, on VERROUILLE en
  // sombre (comme Whoop, Gymshark Training, etc. — c'est aussi l'identité
  // visuelle de FORGA). Le mode clair pourra revenir en v1.1 après un vrai
  // pass design. On force donc isDark=true et colors=darkColors quel que
  // soit le réglage. L'option de thème est masquée côté UI (cf profile).
  const isDark = true;
  const colors = darkColors;
  const themeMode: ThemeMode = 'dark';

  const value = useMemo(
    () => ({ colors, isDark, themeMode, setThemeMode }),
    [colors, isDark, themeMode, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
