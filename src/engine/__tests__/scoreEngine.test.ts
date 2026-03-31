import { calculateForgaScore } from '../scoreEngine';
import type { ScoreInput } from '../../types/score';

describe('Score FORGA Engine', () => {
  const baseInput: ScoreInput = {
    mealsValidated: 35,    // 5 meals/day × 7 days
    mealsExpected: 35,
    proteinTargetDays: 7,
    uniqueMealsChosen: 15,
    currentStreak: 14,
    checkInsCompleted: 4,
    weightTrendPerWeek: 0.3,
    objective: 'bulk',
    goalProgressPercent: 50,
    activeDaysLast7: 7,
    thisWeekCheckIn: true,
  };

  it('calculates a perfect-ish score for an ideal user', () => {
    const score = calculateForgaScore(baseInput);

    expect(score.total).toBeGreaterThan(80);
    expect(score.nutrition).toBeLessThanOrEqual(40);
    expect(score.consistency).toBeLessThanOrEqual(30);
    expect(score.progression).toBeLessThanOrEqual(20);
    expect(score.discipline).toBeLessThanOrEqual(10);
  });

  it('gives lower score for missed meals', () => {
    const score = calculateForgaScore({
      ...baseInput,
      mealsValidated: 10,
      mealsExpected: 35,
    });

    expect(score.nutrition).toBeLessThan(30);
    expect(score.total).toBeLessThan(80);
  });

  it('gives 0 score for a brand new user', () => {
    const score = calculateForgaScore({
      mealsValidated: 0,
      mealsExpected: 5,
      proteinTargetDays: 0,
      uniqueMealsChosen: 0,
      currentStreak: 0,
      checkInsCompleted: 0,
      weightTrendPerWeek: 0,
      objective: 'bulk',
      goalProgressPercent: 0,
      activeDaysLast7: 0,
      thisWeekCheckIn: false,
    });

    expect(score.total).toBeLessThan(10);
  });

  it('rewards streak of 30+ days', () => {
    const with30 = calculateForgaScore({ ...baseInput, currentStreak: 30 });
    const with7 = calculateForgaScore({ ...baseInput, currentStreak: 7 });

    expect(with30.consistency).toBeGreaterThan(with7.consistency);
  });

  it('gives max progression for ideal cut rate', () => {
    const score = calculateForgaScore({
      ...baseInput,
      objective: 'cut',
      weightTrendPerWeek: -0.5, // Ideal cut rate
      goalProgressPercent: 80,
    });

    expect(score.progression).toBeGreaterThan(15);
  });

  it('total never exceeds 100', () => {
    const score = calculateForgaScore(baseInput);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it('individual pillars respect their max', () => {
    const score = calculateForgaScore(baseInput);
    expect(score.nutrition).toBeLessThanOrEqual(40);
    expect(score.consistency).toBeLessThanOrEqual(30);
    expect(score.progression).toBeLessThanOrEqual(20);
    expect(score.discipline).toBeLessThanOrEqual(10);
  });
});
