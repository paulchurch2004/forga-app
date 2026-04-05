import { Platform } from 'react-native';

// RevenueCat is not supported on web — all functions are no-ops on web
const isWeb = Platform.OS === 'web';

let Purchases: any = null;

async function getPurchases() {
  if (isWeb || Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default;
  } catch {
    if (__DEV__) console.warn('[RevenueCat] Failed to load react-native-purchases');
  }
  return Purchases;
}

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS ?? '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID ?? '';

export async function initRevenueCat(userId?: string): Promise<void> {
  if (isWeb) return;
  const sdk = await getPurchases();
  if (!sdk) return;

  const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;
  if (!apiKey) {
    if (__DEV__) console.warn('[RevenueCat] No API key configured');
    return;
  }

  sdk.configure({ apiKey, appUserID: userId });
}

export async function getOfferings(): Promise<any[]> {
  if (isWeb) return [];
  const sdk = await getPurchases();
  if (!sdk) return [];

  try {
    const offerings = await sdk.getOfferings();
    if (offerings.current?.availablePackages) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    if (__DEV__) console.error('[RevenueCat] getOfferings error:', error);
    return [];
  }
}

export async function purchasePackage(pkg: any): Promise<any | null> {
  if (isWeb) return null;
  const sdk = await getPurchases();
  if (!sdk) return null;

  try {
    const { customerInfo } = await sdk.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      return null;
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<any> {
  if (isWeb) throw new Error('Non disponible sur web');
  const sdk = await getPurchases();
  if (!sdk) throw new Error('RevenueCat non disponible');
  return sdk.restorePurchases();
}

export async function getCustomerInfo(): Promise<any> {
  if (isWeb) throw new Error('Non disponible sur web');
  const sdk = await getPurchases();
  if (!sdk) throw new Error('RevenueCat non disponible');
  return sdk.getCustomerInfo();
}

export function isPremium(customerInfo: any): boolean {
  return customerInfo?.entitlements?.active?.['premium'] !== undefined;
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const info = await getCustomerInfo();
    return isPremium(info);
  } catch {
    return false;
  }
}
