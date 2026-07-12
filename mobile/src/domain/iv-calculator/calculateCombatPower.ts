import { getCpMultiplier } from './cpMultiplier';
import { BaseStats, IndividualValues } from './types';

/**
 * Community-documented Combat Power formula (not published by Niantic, derived by reverse
 * engineering — see docs/legal-compliance.md). CP grows with attack and the square root of
 * defense and stamina, scaled by the level's CP multiplier.
 */
export function calculateCombatPower(
  baseStats: BaseStats,
  ivs: IndividualValues,
  level: number,
): number {
  const attack = baseStats.baseAttack + ivs.ivAttack;
  const defense = baseStats.baseDefense + ivs.ivDefense;
  const stamina = baseStats.baseStamina + ivs.ivStamina;
  const cpMultiplier = getCpMultiplier(level);

  const rawCp =
    (attack * Math.sqrt(defense) * Math.sqrt(stamina) * cpMultiplier ** 2) / 10;

  // The game never shows a CP below 10, regardless of what the formula produces.
  return Math.max(10, Math.floor(rawCp));
}
