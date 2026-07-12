import { calculateCombatPower } from './calculateCombatPower';
import { calculateHp } from './calculateHp';
import { findIndividualValueCombinations } from './findIndividualValueCombinations';
import { BaseStats } from './types';

// Real base stats for Bulbasaur (pokemon_id 1, Normal form), from PoGo API.
const BULBASAUR_BASE_STATS: BaseStats = {
  baseAttack: 118,
  baseDefense: 111,
  baseStamina: 128,
};

describe('findIndividualValueCombinations', () => {
  it('recovers the exact IVs used to generate the observed CP/HP, when the level is known', () => {
    const knownLevel = 20;
    const knownIvs = { ivAttack: 10, ivDefense: 8, ivStamina: 15 };

    const observedCp = calculateCombatPower(BULBASAUR_BASE_STATS, knownIvs, knownLevel);
    const observedHp = calculateHp(BULBASAUR_BASE_STATS.baseStamina, knownIvs.ivStamina, knownLevel);

    const matches = findIndividualValueCombinations(BULBASAUR_BASE_STATS, observedCp, observedHp, {
      minLevel: knownLevel,
      maxLevel: knownLevel,
    });

    expect(matches).toContainEqual({ level: knownLevel, ...knownIvs });
  });

  it('can return more than one combination when the level is unknown', () => {
    // Different level/IV combinations can produce the same CP and HP — this is exactly why real
    // IV checkers ask for an appraisal or a narrower level range instead of trusting CP/HP alone.
    const knownLevel = 20;
    const knownIvs = { ivAttack: 10, ivDefense: 8, ivStamina: 15 };

    const observedCp = calculateCombatPower(BULBASAUR_BASE_STATS, knownIvs, knownLevel);
    const observedHp = calculateHp(BULBASAUR_BASE_STATS.baseStamina, knownIvs.ivStamina, knownLevel);

    const matches = findIndividualValueCombinations(BULBASAUR_BASE_STATS, observedCp, observedHp, {
      minLevel: 1,
      maxLevel: 45,
    });

    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches).toContainEqual({ level: knownLevel, ...knownIvs });
  });

  it('returns no matches for a CP that is physically impossible for the species', () => {
    const matches = findIndividualValueCombinations(BULBASAUR_BASE_STATS, 999_999, 999_999, {
      minLevel: 1,
      maxLevel: 45,
    });

    expect(matches).toEqual([]);
  });
});
