import { calculateAdaptiveAdjustment } from '../adaptiveEngine';

describe('Adaptive Engine', () => {
  it('increases calories when bulk rate is too slow', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 3000,
      objective: 'bulk',
      weightTrendPerWeek: 0.05,
      energy: 3,
      hunger: 3,
      performance: 3,
      sleep: 3,
    });

    expect(result.calorieAdjustment).toBeGreaterThan(0);
    expect(result.newDailyCalories).toBeGreaterThan(3000);
  });

  it('decreases calories when cut is too slow', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 2200,
      objective: 'cut',
      weightTrendPerWeek: -0.1,
      energy: 3,
      hunger: 3,
      performance: 3,
      sleep: 3,
    });

    expect(result.calorieAdjustment).toBeLessThan(0);
  });

  it('makes no adjustment when on track', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 2800,
      objective: 'bulk',
      weightTrendPerWeek: 0.3,
      energy: 4,
      hunger: 2,
      performance: 3,
      sleep: 3,
    });

    expect(result.calorieAdjustment).toBe(0);
    expect(result.reason).toContain('bien calibré');
  });

  it('increases calories when energy and performance are low', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 2000,
      objective: 'cut',
      weightTrendPerWeek: -0.5,
      energy: 1,
      hunger: 5,
      performance: 1,
      sleep: 2,
    });

    expect(result.calorieAdjustment).toBeGreaterThan(0);
  });

  it('caps adjustment at 200 kcal', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 2000,
      objective: 'cut',
      weightTrendPerWeek: 0.5, // Wrong direction
      energy: 1,
      hunger: 5,
      performance: 1,
      sleep: 1,
    });

    expect(Math.abs(result.calorieAdjustment)).toBeLessThanOrEqual(200);
  });

  it('never goes below 1200 kcal', () => {
    const result = calculateAdaptiveAdjustment({
      currentCalories: 1250,
      objective: 'cut',
      weightTrendPerWeek: 0.1,
      energy: 4,
      hunger: 2,
      performance: 3,
      sleep: 3,
    });

    expect(result.newDailyCalories).toBeGreaterThanOrEqual(1200);
  });
});
