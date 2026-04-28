import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricKind = 'face' | 'finger' | 'iris' | 'unknown' | 'none';

export interface BiometricCapabilities {
  /** Hardware available + at least one biometric enrolled. */
  available: boolean;
  /** Best biometric type detected on this device. */
  kind: BiometricKind;
  /** Display label for the user, e.g. "Face ID" / "Touch ID" / "Empreinte". */
  label: string;
}

export function useBiometricCapabilities(): BiometricCapabilities {
  const [caps, setCaps] = useState<BiometricCapabilities>({
    available: false,
    kind: 'none',
    label: '',
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          if (!cancelled) setCaps({ available: false, kind: 'none', label: '' });
          return;
        }
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        let kind: BiometricKind = 'unknown';
        let label = 'biométrie';
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          kind = 'face';
          label = Platform.OS === 'ios' ? 'Face ID' : 'reconnaissance faciale';
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          kind = 'finger';
          label = Platform.OS === 'ios' ? 'Touch ID' : 'empreinte digitale';
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          kind = 'iris';
          label = 'iris';
        }
        if (!cancelled) setCaps({ available: true, kind, label });
      } catch {
        if (!cancelled) setCaps({ available: false, kind: 'none', label: '' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return caps;
}

/**
 * Prompt the OS biometric dialog. Returns true on success, false on cancel/error.
 * Falls back to true on web (no biometrics available, treat as success to not lock dev).
 */
export function usePromptBiometric() {
  return useCallback(async (reason: string): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Utiliser le mot de passe',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
      });
      return res.success;
    } catch {
      return false;
    }
  }, []);
}
