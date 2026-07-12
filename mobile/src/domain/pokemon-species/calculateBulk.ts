import { BaseStats } from '../iv-calculator';

/** Simple defense-oriented heuristic (DEF + STA) — not a substitute for a full gym-defender
 * moveset analysis, but enough to rank "how tanky is this species" without a new data source. */
export function calculateBulk(baseStats: Pick<BaseStats, 'baseDefense' | 'baseStamina'>): number {
  return baseStats.baseDefense + baseStats.baseStamina;
}
