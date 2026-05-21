import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper local pour pousser à Supabase. Import dynamique (lazy) pour
// éviter le cycle store ↔ services ↔ store. Best-effort : si pas
// authentifié ou si la migration n'est pas appliquée, ça no-op.
async function pushToSupabase(list: ShoppingList | null, isArchived: boolean) {
  if (!list) return;
  try {
    const { useAuthStore } = await import('./authStore');
    const uid = useAuthStore.getState().session?.user?.id;
    if (!uid) return;
    const { syncShoppingList } = await import('../services/userSync');
    syncShoppingList(list, isArchived, uid);
  } catch {
    // silent — l'app continue à marcher en local
  }
}

export interface ShoppingItem {
  id: string;
  label: string;
  /** Free text, e.g. "500 g" / "1 paquet" / "2 unités". */
  quantity?: string;
  category?: string; // produits frais, féculents, etc.
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  items: ShoppingItem[];
}

interface ShoppingListState {
  current: ShoppingList | null;
  archived: ShoppingList[];

  setCurrent: (list: ShoppingList) => void;
  toggleItem: (itemId: string) => void;
  archiveCurrent: () => void;
  reset: () => void;
}

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      current: null,
      archived: [],

      setCurrent: (list) => {
        set({ current: list });
        // Sync à la création — best-effort. Le coachActions sync aussi
        // au moment de la génération, ici on couvre les autres sources.
        void pushToSupabase(list, false);
      },

      toggleItem: (itemId) => {
        set((state) => {
          if (!state.current) return {};
          return {
            current: {
              ...state.current,
              items: state.current.items.map((it) =>
                it.id === itemId ? { ...it, checked: !it.checked } : it
              ),
            },
          };
        });
        // Sync l'état (items checked) — important pour cross-device.
        void pushToSupabase(get().current, false);
      },

      archiveCurrent: () => {
        const cur = get().current;
        if (!cur) return;
        set((state) => ({
          archived: [cur, ...state.archived].slice(0, 10),
          current: null,
        }));
        // Mark la list comme archivée côté serveur. Le record précédent
        // (is_archived=false) est upserté → is_archived=true.
        void pushToSupabase(cur, true);
      },

      reset: () => set({ current: null, archived: [] }),
    }),
    {
      name: 'forga-shopping-list-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
