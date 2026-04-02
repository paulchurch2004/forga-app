import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

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
  }, []);

  return { isOnline };
}
