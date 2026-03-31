// FORGA — Sentry crash reporting service
// Wraps @sentry/react-native to catch production crashes

let Sentry: any = null;
let isInitialized = false;

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initialize Sentry for error tracking.
 * Call this once in the root layout.
 * Safe to call even if Sentry is not installed — will be a no-op.
 */
export async function initSentry() {
  if (isInitialized || !SENTRY_DSN) return;

  try {
    // @ts-ignore — dynamic import, package may not be installed yet
    Sentry = await import('@sentry/react-native');
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.2,
      enableAutoSessionTracking: true,
      attachStacktrace: true,
      environment: __DEV__ ? 'development' : 'production',
      enabled: !__DEV__, // Only report in production
    });
    isInitialized = true;
  } catch {
    // @sentry/react-native not installed — silent fallback
    console.log('[FORGA] Sentry non installe — crash reporting desactive');
  }
}

/**
 * Capture an exception manually.
 */
export function captureException(error: unknown, context?: Record<string, any>) {
  if (!isInitialized || !Sentry) return;
  try {
    if (context) {
      Sentry.withScope((scope: any) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Silently fail if Sentry is broken
  }
}

/**
 * Set user context for Sentry.
 */
export function setUser(user: { id: string; email?: string } | null) {
  if (!isInitialized || !Sentry) return;
  try {
    Sentry.setUser(user);
  } catch {
    // Silently fail
  }
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  if (!isInitialized || !Sentry) return;
  try {
    Sentry.addBreadcrumb({ category, message, level });
  } catch {
    // Silently fail
  }
}
