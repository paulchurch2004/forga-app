import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { ScreenTopBar } from '../src/components/ui/ScreenTopBar';
import { PrimaryGradientButton } from '../src/components/ui/PrimaryGradientButton';
import { fonts } from '../src/theme/fonts';
import { useNotifications } from '../src/hooks/useNotifications';
import { useStreak } from '../src/hooks/useStreak';

interface PreviewCard {
  time: string;
  title: string;
  body: string;
  icon: 'morning' | 'meal' | 'workout';
}

const PREVIEWS: PreviewCard[] = [
  {
    time: '07:30',
    title: 'Bonjour Paul. Comment tu te sens ?',
    body: 'Touche un métal pour calibrer ton plan du jour.',
    icon: 'morning',
  },
  {
    time: '12:30',
    title: 'Déjeuner dans 15 min',
    body: 'Bowl poulet quinoa · 520 kcal — prêt à valider.',
    icon: 'meal',
  },
  {
    time: '18:00',
    title: 'Séance Push prévue',
    body: 'Pecs & épaules · 60 min. On y va ?',
    icon: 'workout',
  },
];

export default function NotificationsSetupScreen() {
  const insets = useSafeAreaInsets();
  const { isEnabled, toggle } = useNotifications();
  const { currentStreak } = useStreak();
  const [busy, setBusy] = useState(false);

  const handleEnable = async () => {
    setBusy(true);
    try {
      await toggle(currentStreak);
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Activation impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScreenTopBar title="Notifications" onBack={() => router.back()} transparent />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIconWrap}>
          <View style={styles.heroIconRing}>
            <BellIcon />
          </View>
        </View>

        <Text style={styles.title}>Le coach te parle{'\n'}au bon moment.</Text>
        <Text style={styles.subtitle}>
          3 rappels essentiels par jour. Pas de spam, jamais le soir.
        </Text>

        <View style={styles.previewList}>
          {PREVIEWS.map((p, i) => (
            <PreviewItem key={i} item={p} />
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Tu peux désactiver chaque type de notif depuis ton profil à tout moment.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient
          colors={['transparent', '#07070D']}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {isEnabled ? (
          <View style={styles.enabledRow}>
            <View style={styles.enabledDot} />
            <Text style={styles.enabledText}>Notifications activées</Text>
          </View>
        ) : (
          <PrimaryGradientButton
            label="Activer les notifications"
            onPress={handleEnable}
            loading={busy}
            size="lg"
          />
        )}
      </View>
    </View>
  );
}

function PreviewItem({ item }: { item: PreviewCard }) {
  return (
    <View style={styles.preview}>
      <View style={styles.previewIconWrap}>
        <PreviewIcon name={item.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.previewHeaderRow}>
          <Text style={styles.previewApp}>FORGA</Text>
          <Text style={styles.previewTime}>{item.time}</Text>
        </View>
        <Text style={styles.previewTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.previewBody} numberOfLines={2}>{item.body}</Text>
      </View>
    </View>
  );
}

function BellIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21 a2 2 0 0 1-3.4 0"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PreviewIcon({ name }: { name: PreviewCard['icon'] }) {
  if (name === 'morning')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4v2 M12 18v2 M4 12h2 M18 12h2 M5.6 5.6l1.5 1.5 M16.9 16.9l1.5 1.5 M5.6 18.4l1.5-1.5 M16.9 7.1l1.5-1.5 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="#FF6B35"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  if (name === 'meal')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M3 2v8a4 4 0 0 0 4 4v8 M11 2v20 M16 2v8h3a2 2 0 0 1 0 4h-3v8" stroke="#FF6B35" strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 6.5h11 M6 12h12 M17.5 6.5v11 M6.5 6.5v11 M4 9v6 M20 9v6" stroke="#FF6B35" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070D',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 200,
  },
  heroIconWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  heroIconRing: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  previewList: {
    gap: 8,
    marginTop: 28,
  },
  preview: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  previewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  previewApp: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.6,
  },
  previewTime: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
  },
  previewTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
    lineHeight: 16,
  },
  disclaimer: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
  },
  disclaimerText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  enabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  enabledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4AA',
  },
  enabledText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#00D4AA',
  },
});
