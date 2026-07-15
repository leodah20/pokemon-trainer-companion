import { Injectable } from '@nestjs/common';
import { RaidsRepository } from '../../data/raids/raidsRepository';
import { ALL_SPECIES, TYPE_EFFECTIVENESS } from '../../data/species/speciesDatabase';
import { WEATHER_BOOSTS } from '../../data/type-effectiveness/weatherBoosts';
import { RaidBoss, RaidCounter } from '../../domain/raids/types';

export class UnknownRaidBossError extends Error {
  constructor(id: string) {
    super(`Unknown raid boss: ${id}`);
  }
}

const STAB_MULTIPLIER = 1.2;
const AVERAGE_MOVE_CYCLE_SECONDS = 2.5;
const TOP_COUNTERS_LIMIT = 10;

@Injectable()
export class RaidsService {
  constructor(private readonly raidsRepo: RaidsRepository) {}

  getCurrentRaids(): RaidBoss[] {
    return this.raidsRepo.findAll();
  }

  getBoss(id: string): RaidBoss {
    const boss = this.raidsRepo.findById(id);
    if (!boss) {
      throw new UnknownRaidBossError(id);
    }
    return boss;
  }

  // Estimated DPS, not a full battle simulation: it ranks counters by
  // baseAttack * best-type-effectiveness * STAB, over an assumed average move cycle.
  // Good enough for "who should I bring" ordering; not a substitute for a real moveset sim
  // (needs a fast/charge move power+energy+duration database, which this app doesn't have yet).
  getCounters(bossId: string, weather?: string): RaidCounter[] {
    const boss = this.getBoss(bossId);
    const boostedTypes = weather
      ? (WEATHER_BOOSTS.find((w) => w.weather.toLowerCase() === weather.toLowerCase())?.boostedTypes ?? [])
      : [];

    const counters = ALL_SPECIES.map((species) => {
      const bestEffectiveness = Math.max(
        ...species.types.map((attackerType) =>
          Math.max(...boss.types.map((defenderType) => TYPE_EFFECTIVENESS[attackerType]?.[defenderType] ?? 1)),
        ),
      );
      const weatherBoosted = species.types.some((t) => boostedTypes.includes(t));
      const stab = bestEffectiveness > 1 ? STAB_MULTIPLIER : 1;
      const weatherMultiplier = weatherBoosted ? 1.2 : 1;
      const estimatedDps = Math.round(
        ((species.baseAttack * bestEffectiveness * stab * weatherMultiplier) / AVERAGE_MOVE_CYCLE_SECONDS) * 10,
      ) / 10;

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
}
