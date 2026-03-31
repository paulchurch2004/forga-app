import { useMemo } from 'react';
import { useEngine } from './useEngine';
import { useMealStore } from '../store/mealStore';
import type { MealSlot, MealSlotStatus } from '../types/meal';
import { MEAL_SLOT_TIMES } from '../types/meal';

interface SlotInfo {
  slot: MealSlot;
  status: MealSlotStatus;
  time: string;
  isValidated: boolean;
}

export function useMealSlot() {
  const engine = useEngine();
  const todayMeals = useMealStore((s) => s.todayMeals);

  const slots = useMemo((): SlotInfo[] => {
    if (!engine) return [];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return engine.mealPlan.slots.map((slot) => {
      const time = MEAL_SLOT_TIMES[slot];
      const [h, m] = time.split(':').map(Number);
      const slotMinutes = h * 60 + m;

      const isValidated = todayMeals.some((meal) => meal.slot === slot);

      let status: MealSlotStatus;
      if (isValidated) {
        status = 'done';
      } else {
        // Find the current slot (closest upcoming or ongoing)
        const nextSlotIndex = engine.mealPlan.slots.findIndex((s) => {
          const t = MEAL_SLOT_TIMES[s];
          const [sh, sm] = t.split(':').map(Number);
          return sh * 60 + sm > currentMinutes;
        });

        // Current slot is the one just before the next upcoming
        const currentSlotIndex = nextSlotIndex > 0 ? nextSlotIndex - 1 : engine.mealPlan.slots.length - 1;

        if (engine.mealPlan.slots[currentSlotIndex] === slot) {
          status = 'current';
        } else if (slotMinutes > currentMinutes) {
          status = 'upcoming';
        } else {
          status = 'current'; // Past but not validated
        }
      }

      return { slot, status, time, isValidated };
    });
  }, [engine, todayMeals]);

  const currentSlot = useMemo(() => {
    return slots.find((s) => s.status === 'current') ?? slots[0];
  }, [slots]);

  return { slots, currentSlot };
}
