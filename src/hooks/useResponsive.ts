import { useWindowDimensions } from 'react-native';
import { DESKTOP_BREAKPOINT, MAX_CONTENT_WIDTH, DESKTOP_MAX_CONTENT_WIDTH } from '../theme';

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return {
    isDesktop,
    screenWidth: width,
    contentMaxWidth: isDesktop ? DESKTOP_MAX_CONTENT_WIDTH : MAX_CONTENT_WIDTH,
  };
}
