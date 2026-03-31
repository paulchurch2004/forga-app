import { calculateMacros, calculateSlotMacros } from '../macros';

describe('Macros Engine', () => {
  describe('calculateMacros', () => {
    it('calculates bulk macros correctly', () => {
      const result = calculateMacros({
        tdee: 2800,
        weightKg: 80,
        objective: 'bulk',
      });

      // Calories: 2800 + 300 = 3100
      // Protein: 2.0 × 80 = 160g (640 kcal)
      // Fat: 3100 × 0.25 = 775 kcal → 86g
      // Carbs: (3100 - 640 - 775) / 4 = 421g
      expect(result.protein).toBe(160);
      expect(result.fat).toBe(86);
      expect(result.carbs).toBeGreaterThan(400);
      expect(result.calories).toBeGreaterThan(2900);
    });

    it('calculates cut macros with higher protein', () => {
      const result = calculateMacros({
        tdee: 2800,
        weightKg: 80,
        objective: 'cut',
      });

      // Calories: 2800 - 400 = 2400
      // Protein: 2.4 × 80 = 192g
      expect(result.protein).toBe(192);
      expect(result.calories).toBeLessThan(2500);
    });

    it('respects minimum calorie safety', () => {
      const result = calculateMacros({
        tdee: 1400,
        weightKg: 55,
        objective: 'cut',
      });

      // 1400 - 400 = 1000, clamped to 1200, recalculated from rounded macros
      // allows small rounding variance (~3 kcal)
      expect(result.calories).toBeGreaterThanOrEqual(1190);
    });

    it('maintains positive carbs', () => {
      const result = calculateMacros({
        tdee: 2000,
        weightKg: 100,
        objective: 'cut',
      });

      expect(result.carbs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateSlotMacros', () => {
    it('distributes macros proportionally to a slot', () => {
      const daily = { calories: 3000, protein: 200, carbs: 350, fat: 90 };
      const slot = calculateSlotMacros(daily, 0.25); // 25% for breakfast

      expect(slot.calories).toBe(750);
      expect(slot.protein).toBe(50);
      expect(slot.carbs).toBe(88);
      expect(slot.fat).toBe(23);
    });
  });
});
