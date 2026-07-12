import { PowerUpCost, PowerUpStep } from './types';

export function calculatePowerUpCost(
  steps: readonly PowerUpStep[],
  fromLevel: number,
  toLevel: number,
): PowerUpCost {
  const relevantSteps = steps.filter(
    (step) => step.currentLevel >= fromLevel && step.currentLevel < toLevel,
  );

  return relevantSteps.reduce<PowerUpCost>(
    (total, step) => ({
      candy: total.candy + step.candyToUpgrade,
      xlCandy: total.xlCandy + step.xlCandyToUpgrade,
      stardust: total.stardust + step.stardustToUpgrade,
    }),
    { candy: 0, xlCandy: 0, stardust: 0 },
  );
}
