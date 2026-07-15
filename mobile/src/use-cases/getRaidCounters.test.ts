import { getRaidCounters } from './getRaidCounters';
import { PokemonSpecies } from '../domain/pokemon-species';
import { RaidBoss } from '../domain/raids/types';

// High, unused ids so these fixtures never collide with real species in the bundled Pokedex data.
const SPECIES: PokemonSpecies[] = [
  { id: 9101, name: 'RockCounter', generation: 1, baseAttack: 200, baseDefense: 100, baseStamina: 100, types: ['Water'] },
  { id: 9102, name: 'Neutral', generation: 1, baseAttack: 150, baseDefense: 100, baseStamina: 100, types: ['Normal'] },
  { id: 9103, name: 'WeakChoice', generation: 1, baseAttack: 250, baseDefense: 100, baseStamina: 100, types: ['Fire'] },
];

const ROCK_BOSS: RaidBoss = { id: 'boss-test', speciesId: 9999, speciesName: 'TestRock', tier: 3, types: ['Rock'] };

describe('getRaidCounters', () => {
  it('ranks the super-effective counter above neutral and resisted attackers', () => {
    const counters = getRaidCounters(ROCK_BOSS, SPECIES);
    expect(counters[0].speciesName).toBe('RockCounter');
    expect(counters[0].estimatedDps).toBeGreaterThan(counters[1].estimatedDps);
  });

  it('excludes species whose types are ineffective (0 DPS) against the boss', () => {
    const noEffectBoss: RaidBoss = { id: 'boss-ghost', speciesId: 9998, speciesName: 'TestGhost', tier: 5, types: ['Ghost'] };
    const normalOnly = [SPECIES[1]]; // Normal is immune-attacking (0x) into Ghost
    const counters = getRaidCounters(noEffectBoss, normalOnly);
    expect(counters).toHaveLength(0);
  });

  it('marks weather-boosted counters and only when a matching weather is given', () => {
    const withoutWeather = getRaidCounters(ROCK_BOSS, SPECIES);
    const withRain = getRaidCounters(ROCK_BOSS, SPECIES, 'Rain');
    expect(withoutWeather.every((c) => !c.weatherBoosted)).toBe(true);
    expect(withRain.find((c) => c.speciesName === 'RockCounter')?.weatherBoosted).toBe(true);
  });

  it('caps results at the top 10', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: 9200 + i,
      name: `Species${i}`,
      generation: 1,
      baseAttack: 100 + i,
      baseDefense: 100,
      baseStamina: 100,
      types: ['Water'],
    }));
    expect(getRaidCounters(ROCK_BOSS, many)).toHaveLength(10);
  });
});
