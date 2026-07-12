import { calculateCombatPower } from './calculateCombatPower';
import { BaseStats } from './types';

// Real base stats for Bulbasaur (pokemon_id 1, Normal form), from PoGo API.
const BULBASAUR_BASE_STATS: BaseStats = {
  baseAttack: 118,
  baseDefense: 111,
  baseStamina: 128,
};

describe('calculateCombatPower', () => {
  it('increases as individual values increase at a fixed level', () => {
    const lowIvCp = calculateCombatPower(
      BULBASAUR_BASE_STATS,
      { ivAttack: 0, ivDefense: 0, ivStamina: 0 },
      20,
    );
    const perfectIvCp = calculateCombatPower(
      BULBASAUR_BASE_STATS,
      { ivAttack: 15, ivDefense: 15, ivStamina: 15 },
      20,
    );

    expect(perfectIvCp).toBeGreaterThan(lowIvCp);
  });

  it('increases as level increases with fixed individual values', () => {
    const ivs = { ivAttack: 10, ivDefense: 10, ivStamina: 10 };

    const cpAtLevel10 = calculateCombatPower(BULBASAUR_BASE_STATS, ivs, 10);
    const cpAtLevel30 = calculateCombatPower(BULBASAUR_BASE_STATS, ivs, 30);

    expect(cpAtLevel30).toBeGreaterThan(cpAtLevel10);
  });

  it('never returns below the game-enforced CP floor of 10', () => {
    const veryWeakBaseStats: BaseStats = { baseAttack: 1, baseDefense: 1, baseStamina: 1 };

    const cp = calculateCombatPower(
      veryWeakBaseStats,
      { ivAttack: 0, ivDefense: 0, ivStamina: 0 },
      1,
    );

    expect(cp).toBe(10);
  });

  it('throws for a level with no known CP multiplier', () => {
    expect(() =>
      calculateCombatPower(BULBASAUR_BASE_STATS, { ivAttack: 0, ivDefense: 0, ivStamina: 0 }, 999),
    ).toThrow(RangeError);
  });
});
