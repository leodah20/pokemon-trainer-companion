import { getCpMultiplier } from './cpMultiplier';

export function calculateHp(baseStamina: number, ivStamina: number, level: number): number {
  const stamina = baseStamina + ivStamina;
  const cpMultiplier = getCpMultiplier(level);

  return Math.max(10, Math.floor(stamina * cpMultiplier));
}
