import { PowerUpStep } from '../../domain/power-up';
import powerUpRequirementsData from './powerup-requirements.json';

interface RawPowerUpStep {
  current_level: number;
  level_after_powering: number;
  candy_to_upgrade: number;
  xl_candy_to_upgrade: number;
  stardust_to_upgrade: number;
}

/** Bundled snapshot of pogoapi.net's pokemon_powerup_requirements.json (levels 1-50). */
const POWER_UP_STEPS: readonly PowerUpStep[] = Object.values(
  powerUpRequirementsData as Record<string, RawPowerUpStep>,
)
  .map((raw) => ({
    currentLevel: raw.current_level,
    levelAfterPowering: raw.level_after_powering,
    candyToUpgrade: raw.candy_to_upgrade,
    xlCandyToUpgrade: raw.xl_candy_to_upgrade,
    stardustToUpgrade: raw.stardust_to_upgrade,
  }))
  .sort((a, b) => a.currentLevel - b.currentLevel);

export function getPowerUpSteps(): readonly PowerUpStep[] {
  return POWER_UP_STEPS;
}

export function getAllLevels(): readonly number[] {
  const levels = new Set<number>();
  for (const step of POWER_UP_STEPS) {
    levels.add(step.currentLevel);
    levels.add(step.levelAfterPowering);
  }
  return Array.from(levels).sort((a, b) => a - b);
}
