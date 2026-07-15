import { Injectable } from '@nestjs/common';
import { ALL_TYPES, TYPE_EFFECTIVENESS } from '../../data/species/speciesDatabase';
import { WEATHER_BOOSTS } from '../../data/type-effectiveness/weatherBoosts';
import { TypeChartEntry, TypeMatchup, WeatherBoost } from '../../domain/type-effectiveness/types';

export class UnknownTypeError extends Error {
  constructor(type: string) {
    super(`Unknown type: ${type}`);
  }
}

@Injectable()
export class TypeChartService {
  getFullChart(): Record<string, Record<string, number>> {
    const chart: Record<string, Record<string, number>> = {};
    for (const attacker of ALL_TYPES) {
      chart[attacker] = {};
      for (const defender of ALL_TYPES) {
        chart[attacker][defender] = TYPE_EFFECTIVENESS[attacker]?.[defender] ?? 1;
      }
    }
    return chart;
  }

  getTypeEntry(rawType: string): TypeChartEntry {
    const type = ALL_TYPES.find((candidate) => candidate.toLowerCase() === rawType.toLowerCase());
    if (!type) {
      throw new UnknownTypeError(rawType);
    }

    const weaknesses: TypeMatchup[] = [];
    const resistances: TypeMatchup[] = [];
    const immunities: TypeMatchup[] = [];

    for (const attacker of ALL_TYPES) {
      const multiplier = TYPE_EFFECTIVENESS[attacker]?.[type] ?? 1;
      if (multiplier > 1) {
        weaknesses.push({ type: attacker, multiplier });
      } else if (multiplier === 0) {
        immunities.push({ type: attacker, multiplier });
      } else if (multiplier < 1) {
        resistances.push({ type: attacker, multiplier });
      }
    }

    const strongAgainst: TypeMatchup[] = Object.entries(TYPE_EFFECTIVENESS[type] ?? {})
      .filter(([, multiplier]) => multiplier > 1)
      .map(([defender, multiplier]) => ({ type: defender, multiplier }));

    return { type, weaknesses, resistances, immunities, strongAgainst };
  }

  getWeatherBoosts(): WeatherBoost[] {
    return WEATHER_BOOSTS;
  }
}
