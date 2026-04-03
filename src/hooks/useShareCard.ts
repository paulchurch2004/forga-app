import { useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import type { View } from 'react-native';

type ShareType = 'score' | 'streak' | 'badge';

const SHARE_META: Record<ShareType, { filename: string; title: string; textFn: (v?: number) => string }> = {
  streak: {
    filename: 'forga-streak.png',
    title: 'Mon streak FORGA',
    textFn: () => 'Regarde mon streak sur FORGA ! Forge ton corps.',
  },
  score: {
    filename: 'forga-score.png',
    title: 'Mon score FORGA',
    textFn: () => 'Mon score FORGA — Forge ton corps, pas de blabla.',
  },
  badge: {
    filename: 'forga-badge.png',
    title: 'Badge FORGA débloqué',
    textFn: () => "J'ai débloqué un badge sur FORGA !",
  },
};

export function useShareCard(type: ShareType = 'streak') {
  const cardRef = useRef<View>(null);
  const meta = SHARE_META[type];

  const share = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await shareWeb(cardRef.current as unknown as HTMLElement, meta);
      } else {
        await shareMobile(cardRef, meta);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      if (Platform.OS === 'web') {
        window.alert(`Partage impossible : ${message}`);
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Partage impossible', message);
      }
    }
  }, [meta]);

  return { cardRef, share };
}

async function shareWeb(
  element: HTMLElement | null,
  meta: (typeof SHARE_META)[ShareType],
) {
  if (!element) return;

  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, { useCORS: true, scale: 3 });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas vide'))), 'image/png');
  });

  const file = new File([blob], meta.filename, { type: 'image/png' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: meta.title,
      text: meta.textFn(),
      files: [file],
    });
  } else {
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = meta.filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

async function shareMobile(
  cardRef: React.RefObject<View>,
  meta: (typeof SHARE_META)[ShareType],
) {
  const { captureRef } = await import('react-native-view-shot');
  const { shareAsync } = await import('expo-sharing');

  const uri = await captureRef(cardRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  await shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: meta.title,
  });
}
