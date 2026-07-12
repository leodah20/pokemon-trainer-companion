import { IndividualValues } from './types';

const MAX_TOTAL_INDIVIDUAL_VALUE = 45; // 15 + 15 + 15, the best possible roll

export function calculateIvPercentage(ivs: IndividualValues): number {
  const total = ivs.ivAttack + ivs.ivDefense + ivs.ivStamina;
  return Math.round((total / MAX_TOTAL_INDIVIDUAL_VALUE) * 100);
}
