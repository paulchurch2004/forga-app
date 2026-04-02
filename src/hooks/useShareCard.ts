import { useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import type { View } from 'react-native';

export function useShareCard() {
  const cardRef = useRef<View>(null);

  const share = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await shareWeb(cardRef.current as unknown as HTMLElement);
      } else {
        await shareMobile(cardRef);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Partage impossible', message);
    }
  }, []);

  return { cardRef, share };
}

async function shareWeb(element: HTMLElement | null) {
  if (!element) return;

  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, { useCORS: true, scale: 2 });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas vide'))), 'image/png');
  });

  const file = new File([blob], 'forga-streak.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'Mon streak FORGA',
      text: 'Regarde mon streak sur FORGA !',
      files: [file],
    });
  } else {
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forga-streak.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}

async function shareMobile(cardRef: React.RefObject<View>) {
  const { captureRef } = await import('react-native-view-shot');
  const { shareAsync } = await import('expo-sharing');

  const uri = await captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  await shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Partager mon streak FORGA',
  });
}
