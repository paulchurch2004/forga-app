import { calculateBMR, calculateTDEE } from '../tdee';

describe('TDEE Engine', () => {
  describe('calculateBMR', () => {
    it('calculates BMR for male correctly', () => {
      // Homme, 80kg, 180cm, 25 ans
      // (10 × 80) + (6.25 × 180) - (5 × 25) + 5 = 800 + 1125 - 125 + 5 = 1805
      const bmr = calculateBMR('male', 80, 180, 25);
      expect(bmr).toBe(1805);
    });

    it('calculates BMR for female correctly', () => {
      // Femme, 65kg, 165cm, 28 ans
      // (10 × 65) + (6.25 × 165) - (5 × 28) - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
      const bmr = calculateBMR('female', 65, 165, 28);
      expect(bmr).toBeCloseTo(1380.25, 0);
    });
  });

  describe('calculateTDEE', () => {
    it('calculates TDEE with moderate activity', () => {
      const result = calculateTDEE({
        sex: 'male',
        age: 25,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
      });

      expect(result.bmr).toBe(1805);
      expect(result.activityMultiplier).toBe(1.55);
      expect(result.tdee).toBe(Math.round(1805 * 1.55)); // 2798
    });

    it('calculates TDEE with sedentary activity', () => {
      const result = calculateTDEE({
        sex: 'male',
        age: 30,
        heightCm: 175,
        weightKg: 85,
        activityLevel: 'sedentary',
      });

      expect(result.activityMultiplier).toBe(1.2);
      expect(result.tdee).toBe(Math.round(result.bmr * 1.2));
    });
  });
});
