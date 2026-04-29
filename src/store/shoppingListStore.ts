import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      setCurrent: (list) => set({ current: list }),

      toggleItem: (itemId) =>
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
        }),

      archiveCurrent: () => {
        const cur = get().current;
        if (!cur) return;
        set((state) => ({
          archived: [cur, ...state.archived].slice(0, 10),
          current: null,
        }));
      },

      reset: () => set({ current: null, archived: [] }),
    }),
    {
      name: 'forga-shopping-list-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
