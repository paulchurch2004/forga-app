// FORGA — Social authentication (Apple, Google) wired to Supabase.
//
// All providers return the same SocialAuthResult so callers can branch on
// `isNewUser` to decide whether to push the user into onboarding.

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

const GOOGLE_WEB_CLIENT_ID =
  '1058423112158-5q29btj31k9i0cfr8q6o9lat3tv6phat.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID =
  '1058423112158-v2s3fvrcifdu58nvfpao0emtomodv31b.apps.googleusercontent.com';

let googleConfigured = false;
function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
  googleConfigured = true;
}

export interface SocialAuthResult {
  session: Session;
  isNewUser: boolean;
  /** Best-effort display name from the provider (used to pre-fill onboarding). */
  displayName?: string;
}

export class SocialAuthError extends Error {
  code: 'cancelled' | 'unsupported' | 'provider' | 'supabase' | 'unknown';
  constructor(code: SocialAuthError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

export function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return Promise.resolve(false);
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== 'ios') {
    throw new SocialAuthError('unsupported', 'Apple Sign In is iOS only.');
  }

  // Apple requires a SHA-256 hashed nonce. We pass the raw nonce to Apple,
  // and the same raw nonce to Supabase, which hashes it again to verify.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') {
      throw new SocialAuthError('cancelled', 'User cancelled Apple Sign In.');
    }
    throw new SocialAuthError('provider', e?.message || 'Apple Sign In failed.');
  }

  if (!credential.identityToken) {
    throw new SocialAuthError('provider', 'No identity token returned by Apple.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error || !data.session) {
    throw new SocialAuthError('supabase', error?.message || 'Supabase rejected Apple token.');
  }

  // Apple only returns fullName + email on the FIRST sign-in. After that,
  // we have to rely on what we stored in Supabase user_metadata.
  const fullName = credential.fullName;
  const displayName = fullName?.givenName
    ? `${fullName.givenName}${fullName.familyName ? ' ' + fullName.familyName : ''}`.trim()
    : (data.session.user.user_metadata?.full_name as string | undefined);

  // Supabase tells us if the user was just created via the `created_at`
  // matching the session creation time — but the cleanest signal is to compare
  // user creation to "now". A delta < 5s means freshly created.
  const createdAt = data.session.user.created_at
    ? new Date(data.session.user.created_at).getTime()
    : 0;
  const isNewUser = Date.now() - createdAt < 5000;

  // Persist the display name on the user metadata for future reference,
  // since Apple won't give it again.
  if (isNewUser && displayName) {
    await supabase.auth.updateUser({ data: { full_name: displayName } });
  }

  return { session: data.session, isNewUser, displayName };
}

export async function signInWithGoogle(): Promise<SocialAuthResult> {
  ensureGoogleConfigured();

  // Make sure Google Play Services is installed (Android only — no-op on iOS).
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch (e: any) {
    throw new SocialAuthError('unsupported', 'Google Play Services unavailable.');
  }

  let signInResult;
  try {
    signInResult = await GoogleSignin.signIn();
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new SocialAuthError('cancelled', 'User cancelled Google Sign In.');
    }
    if (e?.code === statusCodes.IN_PROGRESS) {
      throw new SocialAuthError('provider', 'Google Sign In already in progress.');
    }
    throw new SocialAuthError('provider', e?.message || 'Google Sign In failed.');
  }

  if (!isSuccessResponse(signInResult)) {
    throw new SocialAuthError('cancelled', 'User cancelled Google Sign In.');
  }

  const idToken = signInResult.data.idToken;
  if (!idToken) {
    throw new SocialAuthError('provider', 'No ID token returned by Google.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error || !data.session) {
    throw new SocialAuthError('supabase', error?.message || 'Supabase rejected Google token.');
  }

  const profile = signInResult.data.user;
  const displayName =
    profile.name?.trim() ||
    `${profile.givenName ?? ''} ${profile.familyName ?? ''}`.trim() ||
    undefined;

  const createdAt = data.session.user.created_at
    ? new Date(data.session.user.created_at).getTime()
    : 0;
  const isNewUser = Date.now() - createdAt < 5000;

  if (isNewUser && displayName) {
    await supabase.auth.updateUser({ data: { full_name: displayName } });
  }

  return { session: data.session, isNewUser, displayName };
}
