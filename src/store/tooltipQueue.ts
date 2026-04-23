import { create } from 'zustand';

interface TooltipQueueState {
  /** id of the tooltip currently allowed to be visible. */
  activeId: string | null;
  /** id requests sit in the queue in arrival order. */
  queue: string[];
  /** Called by a tooltip on mount once it's hydrated and would-be visible. */
  request: (id: string) => void;
  /** Called by a tooltip when it is dismissed (or never shown). */
  release: (id: string) => void;
}

export const useTooltipQueue = create<TooltipQueueState>((set, get) => ({
  activeId: null,
  queue: [],
  request: (id) => {
    const { activeId, queue } = get();
    if (activeId === id || queue.includes(id)) return;
    if (!activeId) {
      set({ activeId: id });
    } else {
      set({ queue: [...queue, id] });
    }
  },
  release: (id) => {
    const { activeId, queue } = get();
    if (activeId === id) {
      const [next, ...rest] = queue;
      set({ activeId: next ?? null, queue: rest });
    } else if (queue.includes(id)) {
      set({ queue: queue.filter((q) => q !== id) });
    }
  },
}));
