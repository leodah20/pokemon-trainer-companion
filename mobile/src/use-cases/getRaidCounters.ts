import { PokemonSpecies } from '../domain/pokemon-species';
import { RaidBoss, RaidCounter } from '../domain/raids/types';
import { getCombinedMultiplier } from '../data/type-effectiveness/typeEffectivenessRepository';
import { WEATHER_BOOSTS } from '../data/type-effectiveness/weatherBoosts';

const STAB_MULTIPLIER = 1.2;
const AVERAGE_MOVE_CYCLE_SECONDS = 2.5;
const TOP_COUNTERS_LIMIT = 10;

/**
 * Estimated DPS, not a full battle simulation: ranks counters by
 * baseAttack * best-type-effectiveness * STAB, over an assumed average move cycle. Good enough
 * for "who should I bring" ordering, not a substitute for a real moveset sim (would need a
 * fast/charge move power+energy+duration database this app doesn't have). Mirrors
 * backend/src/use-cases/raids/raidsService.ts.
 */
export function getRaidCounters(
  boss: RaidBoss,
  allSpecies: readonly PokemonSpecies[],
  weather?: string,
): RaidCounter[] {
  const boostedTypes = weather
    ? (WEATHER_BOOSTS.find((w) => w.weather.toLowerCase() === weather.toLowerCase())?.boostedTypes ?? [])
    : [];

  const counters = allSpecies.map((species) => {
    const bestEffectiveness = Math.max(
      ...species.types.map((attackerType) => getCombinedMultiplier(attackerType, boss.types)),
    );
    const weatherBoosted = species.types.some((t) => boostedTypes.includes(t));
    const stab = bestEffectiveness > 1 ? STAB_MULTIPLIER : 1;
    const weatherMultiplier = weatherBoosted ? 1.2 : 1;
    const estimatedDps =
      Math.round(((species.baseAttack * bestEffectiveness * stab * weatherMultiplier) / AVERAGE_MOVE_CYCLE_SECONDS) * 10) / 10;

    return {
      speciesId: species.id,
      speciesName: species.name,
      types: species.types,
      estimatedDps,
      weatherBoosted,
    };
  });

  return counters
    .filter((c) => c.estimatedDps > 0)
    .sort((a, b) => b.estimatedDps - a.estimatedDps)
    .slice(0, TOP_COUNTERS_LIMIT);
}
