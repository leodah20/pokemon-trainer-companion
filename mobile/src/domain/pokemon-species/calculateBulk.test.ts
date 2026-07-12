import { calculateBulk } from './calculateBulk';

describe('calculateBulk', () => {
  it('adds base defense and base stamina', () => {
    expect(calculateBulk({ baseDefense: 121, baseStamina: 127 })).toBe(248);
  });
});
