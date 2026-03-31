import { smartRound, roundingError, isAcceptableRounding } from '../roundingEngine';

describe('Rounding Engine', () => {
  describe('smartRound', () => {
    it('rounds units to nearest integer', () => {
      expect(smartRound(2.3, 1, 'unit')).toBe(2);
      expect(smartRound(2.7, 1, 'unit')).toBe(3);
    });

    it('never returns 0 for units', () => {
      expect(smartRound(0.1, 1, 'unit')).toBe(1);
    });

    it('uses ingredient roundTo when specified', () => {
      expect(smartRound(137, 25, 'g')).toBe(125);
      expect(smartRound(142, 25, 'g')).toBe(150);
      expect(smartRound(23, 10, 'g')).toBe(20);
    });

    it('auto-rounds small quantities to 1g', () => {
      expect(smartRound(3, 0, 'g')).toBe(3);
      expect(smartRound(7, 0, 'g')).toBe(7);
    });

    it('auto-rounds 10-50g to nearest 5g', () => {
      expect(smartRound(23, 0, 'g')).toBe(25);
      expect(smartRound(37, 0, 'g')).toBe(35);
    });

    it('auto-rounds 50-200g to nearest 10g', () => {
      expect(smartRound(83, 0, 'g')).toBe(80);
      expect(smartRound(157, 0, 'g')).toBe(160);
    });

    it('auto-rounds >200g to nearest 25g', () => {
      expect(smartRound(213, 0, 'g')).toBe(225);
      expect(smartRound(287, 0, 'g')).toBe(275);
    });

    it('guarantees minimum values', () => {
      expect(smartRound(1, 10, 'g')).toBe(10);
      expect(smartRound(2, 25, 'g')).toBe(25);
    });
  });

  describe('roundingError', () => {
    it('calculates error correctly', () => {
      expect(roundingError(100, 110)).toBeCloseTo(10);
      expect(roundingError(100, 100)).toBe(0);
    });

    it('handles zero original', () => {
      expect(roundingError(0, 5)).toBe(0);
    });
  });

  describe('isAcceptableRounding', () => {
    it('accepts small errors', () => {
      expect(isAcceptableRounding(100, 110)).toBe(true);
    });

    it('rejects large errors', () => {
      expect(isAcceptableRounding(100, 120)).toBe(false);
    });
  });
});
