import { calculatePowerUpCost } from './calculatePowerUpCost';
import { PowerUpStep } from './types';

const STEPS: PowerUpStep[] = [
  { currentLevel: 1, levelAfterPowering: 1.5, candyToUpgrade: 1, xlCandyToUpgrade: 0, stardustToUpgrade: 200 },
  { currentLevel: 1.5, levelAfterPowering: 2, candyToUpgrade: 1, xlCandyToUpgrade: 0, stardustToUpgrade: 200 },
  { currentLevel: 2, levelAfterPowering: 2.5, candyToUpgrade: 1, xlCandyToUpgrade: 0, stardustToUpgrade: 400 },
];

describe('calculatePowerUpCost', () => {
  it('sums every step in the given level range', () => {
    const cost = calculatePowerUpCost(STEPS, 1, 2.5);
    expect(cost).toEqual({ candy: 3, xlCandy: 0, stardust: 800 });
  });

  it('excludes steps before fromLevel and at/after toLevel', () => {
    const cost = calculatePowerUpCost(STEPS, 1.5, 2);
    expect(cost).toEqual({ candy: 1, xlCandy: 0, stardust: 200 });
  });

  it('returns zero cost when the range contains no steps', () => {
    const cost = calculatePowerUpCost(STEPS, 2.5, 2.5);
    expect(cost).toEqual({ candy: 0, xlCandy: 0, stardust: 0 });
  });
});
