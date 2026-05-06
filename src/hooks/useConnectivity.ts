import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Web: use navigator.onLine + window events
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      const update = () => {
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
      };
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    // Native: NetInfo subscription. Imported dynamically so the hook still works
    // if the module is missing (e.g. during a fresh install before linking).
    let unsubscribe: (() => void) | null = null;
    (async () => {
      try {
        const NetInfo = (await import('@react-native-community/netinfo')).default;
        const state = await NetInfo.fetch();
        setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
        unsubscribe = NetInfo.addEventListener((s) => {
          setIsOnline(s.isConnected !== false && s.isInternetReachable !== false);
        });
      } catch {
        setIsOnline(true);
      }
    })();
    return () => {
      unsubscribe?.();
    };
  }, []);

  return { isOnline };
}
