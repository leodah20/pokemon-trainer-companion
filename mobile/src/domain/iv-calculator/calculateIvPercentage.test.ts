import { calculateIvPercentage } from './calculateIvPercentage';

describe('calculateIvPercentage', () => {
  it('returns 100 for perfect individual values', () => {
    expect(calculateIvPercentage({ ivAttack: 15, ivDefense: 15, ivStamina: 15 })).toBe(100);
  });

  it('returns 0 for the worst possible individual values', () => {
    expect(calculateIvPercentage({ ivAttack: 0, ivDefense: 0, ivStamina: 0 })).toBe(0);
  });

  it('rounds to the nearest whole percentage', () => {
    expect(calculateIvPercentage({ ivAttack: 10, ivDefense: 8, ivStamina: 15 })).toBe(73);
  });
});
