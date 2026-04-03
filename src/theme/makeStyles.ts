import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from './themes';

/**
 * Creates a reactive stylesheet factory that rebuilds when theme changes.
 *
 * Usage:
 *   const useStyles = makeStyles((colors) => ({
 *     container: { backgroundColor: colors.background },
 *   }));
 *
 *   function MyComponent() {
 *     const styles = useStyles();
 *     return <View style={styles.container} />;
 *   }
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T
) {
  return () => {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
