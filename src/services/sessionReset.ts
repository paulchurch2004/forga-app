// Reset de TOUS les stores user-scoped.
//
// Appelé à la déconnexion — y compris INVOLONTAIRE (refresh token révoqué,
// session expirée, suppression serveur) via le handler SIGNED_OUT de
// app/_layout.tsx. Sans ça, sur un appareil partagé (salle, famille) ou
// quand une session est invalidée hors du bouton "Se déconnecter", les
// données de l'utilisateur A (repas, poids, mesures, programme, etc.)
// restaient en mémoire/AsyncStorage et pouvaient fuiter vers l'utilisateur B.
// (audit sécurité — contamination cross-user)
//
// Idempotent : tout est encapsulé en try/catch, ré-appelable sans risque.

export async function wipeUserStores(): Promise<void> {
  const safe = async (fn: () => Promise<void> | void) => {
    try { await fn(); } catch { /* store absent / pas de reset — on ignore */ }
  };

  await safe(async () => (await import('../store/userStore')).useUserStore.getState().reset());
  await safe(async () => (await import('../store/mealStore')).useMealStore.getState().reset());
  await safe(async () => (await import('../store/scoreStore')).useScoreStore.getState().reset());
  await safe(async () => (await import('../store/authStore')).useAuthStore.getState().reset());
  await safe(async () => (await import('../store/waterStore')).useWaterStore.getState().reset());
  await safe(async () => (await import('../store/chatStore')).useChatStore.getState().resetOnLogout());
  await safe(async () => (await import('../store/trainingStore')).useTrainingStore.getState().reset?.());
  await safe(async () => (await import('../store/programStore')).useProgramStore.getState().reset?.());
  await safe(async () => (await import('../store/weeklyPlanStore')).useWeeklyPlanStore.getState().reset?.());
  await safe(async () => (await import('../store/shoppingListStore')).useShoppingListStore.getState().reset());
  await safe(async () => (await import('../store/metalHistoryStore')).useMetalHistoryStore.getState().reset());

  // Settings USER-scoped uniquement (on garde thème + locale = device-level).
  await safe(async () => (await import('../store/settingsStore')).useSettingsStore.setState({
    appleHealthEnabled: false,
    lastHealthSyncAt: null,
    stepsEnabled: false,
    biometricLockEnabled: false,
    firstActiveDate: null,
    reviewPromptShownAt: null,
    referralPromptShownAt: null,
  }));
}
