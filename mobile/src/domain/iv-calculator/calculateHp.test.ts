import { calculateHp } from './calculateHp';

describe('calculateHp', () => {
  it('increases as level increases with a fixed stamina IV', () => {
    const hpAtLevel10 = calculateHp(128, 15, 10);
    const hpAtLevel30 = calculateHp(128, 15, 30);

    expect(hpAtLevel30).toBeGreaterThan(hpAtLevel10);
  });

  it('increases as the stamina IV increases at a fixed level', () => {
    const hpWithLowIv = calculateHp(128, 0, 20);
    const hpWithMaxIv = calculateHp(128, 15, 20);

    expect(hpWithMaxIv).toBeGreaterThan(hpWithLowIv);
  });

  it('never returns below the game-enforced HP floor of 10', () => {
    expect(calculateHp(1, 0, 1)).toBe(10);
  });
});
