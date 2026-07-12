import { calculateCombatPower } from './calculateCombatPower';
import { calculateHp } from './calculateHp';
import { getAllKnownLevels } from './cpMultiplier';
import { BaseStats, IvCombination } from './types';

const MIN_INDIVIDUAL_VALUE = 0;
const MAX_INDIVIDUAL_VALUE = 15;

export interface IvSearchRange {
  minLevel: number;
  maxLevel: number;
}

/**
 * Brute-force search: CP and HP can't be reversed directly (they combine three hidden IVs
 * non-linearly), so every level/attack/defense/stamina combination in range is tried and matched
 * against what the trainer observed on screen. 16 x 16 x 16 combinations per level is a fixed,
 * tiny search space — see notes on why this doesn't need a smarter algorithm.
 */
export function findIndividualValueCombinations(
  baseStats: BaseStats,
  observedCp: number,
  observedHp: number,
  levelRange: IvSearchRange,
): IvCombination[] {
  const matches: IvCombination[] = [];
  const candidateLevels = getAllKnownLevels().filter(
    (level) => level >= levelRange.minLevel && level <= levelRange.maxLevel,
  );

  for (const level of candidateLevels) {
    for (let ivAttack = MIN_INDIVIDUAL_VALUE; ivAttack <= MAX_INDIVIDUAL_VALUE; ivAttack++) {
      for (let ivDefense = MIN_INDIVIDUAL_VALUE; ivDefense <= MAX_INDIVIDUAL_VALUE; ivDefense++) {
        for (let ivStamina = MIN_INDIVIDUAL_VALUE; ivStamina <= MAX_INDIVIDUAL_VALUE; ivStamina++) {
          const ivs = { ivAttack, ivDefense, ivStamina };
          const cp = calculateCombatPower(baseStats, ivs, level);
          if (cp !== observedCp) {
            continue;
          }

          const hp = calculateHp(baseStats.baseStamina, ivStamina, level);
          if (hp !== observedHp) {
            continue;
          }

          matches.push({ level, ...ivs });
        }
      }
    }
  }

  return matches;
}
