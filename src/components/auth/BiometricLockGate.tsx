import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, AppState, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import { useSettingsStore } from '../../store/settingsStore';
import {
  useBiometricCapabilities,
  usePromptBiometric,
} from '../../hooks/useBiometricAuth';

interface Props {
  children: React.ReactNode;
}

/**
 * Gates the entire app behind a biometric prompt when biometricLockEnabled is on.
 * - Prompts at first mount.
 * - Re-locks when the app comes back from background (after 30s in background).
 * - User can retry from the lock screen if Face ID was cancelled.
 */
export function BiometricLockGate({ children }: Props) {
  const enabled = useSettingsStore((s) => s.biometricLockEnabled);
  const caps = useBiometricCapabilities();
  const promptBiometric = usePromptBiometric();
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const backgroundedAtRef = useRef<number | null>(null);

  const tryUnlock = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await promptBiometric('Déverrouille FORGA');
    setBusy(false);
    if (ok) setUnlocked(true);
  };

  // Auto-prompt at mount when lock is on.
  useEffect(() => {
    if (!enabled) {
      setUnlocked(true);
      return;
    }
    if (!caps.available) {
      // Setting is on but device has no biometrics anymore — don't lock the user out.
      setUnlocked(true);
      return;
    }
    void tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, caps.available]);

  // Re-lock after backgrounding for 30s+.
  useEffect(() => {
    if (!enabled || !caps.available) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        backgroundedAtRef.current = Date.now();
      } else if (next === 'active') {
        const since = backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (since && Date.now() - since > 30_000) {
          setUnlocked(false);
          setTimeout(() => void tryUnlock(), 100);
        }
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, caps.available]);

  if (!enabled || !caps.available || unlocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07070D', '#1A0E08', '#07070D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <View style={styles.icon}>
          {caps.kind === 'face' ? <FaceIdIcon /> : <FingerIcon />}
        </View>
        <Text style={styles.title}>FORGA est verrouillé</Text>
        <Text style={styles.subtitle}>
          Authentifie-toi avec {caps.label} pour accéder à ton espace.
        </Text>

        <Pressable
          onPress={tryUnlock}
          disabled={busy}
          style={({ pressed }) => [styles.btnWrap, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={['#FF8C40', '#FF5A1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {busy ? 'Authentification…' : `Utiliser ${caps.label}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function FaceIdIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8 V6 a2 2 0 0 1 2-2 H8 M16 4 H18 a2 2 0 0 1 2 2 V8 M20 16 V18 a2 2 0 0 1-2 2 H16 M8 20 H6 a2 2 0 0 1-2-2 V16"
        stroke="#FF6B35"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M9 10 V11 M15 10 V11 M9 15 q3 2 6 0"
        stroke="#FF6B35"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function FingerIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 a7 7 0 0 1 7 7 v3 M5 10 a7 7 0 0 1 7-7 M9 21 c-1-3-1-6-1-9 a4 4 0 0 1 8 0 v3 a8 8 0 0 0 1 4"
        stroke="#FF6B35"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07070D' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  btnWrap: {
    marginTop: 32,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  btnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
