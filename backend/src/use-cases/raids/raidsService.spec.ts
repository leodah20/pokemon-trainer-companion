import { RaidsService, UnknownRaidBossError } from './raidsService';
import { RaidsRepository } from '../../data/raids/raidsRepository';

describe('RaidsService', () => {
  const service = new RaidsService(new RaidsRepository());

  it('lists the current raid boss rotation across tiers', () => {
    const bosses = service.getCurrentRaids();
    expect(bosses.length).toBeGreaterThan(0);
    expect(new Set(bosses.map((b) => b.tier))).toEqual(new Set([1, 3, 5]));
  });

  it('ranks Mewtwo counters with a Bug/Dark/Ghost type on top (super effective vs. Psychic)', () => {
    const counters = service.getCounters('boss-150');
    expect(counters).toHaveLength(10);
    expect(counters[0].estimatedDps).toBeGreaterThanOrEqual(counters[9].estimatedDps);
    const topTypes = counters[0].types;
    expect(topTypes.some((t) => ['Bug', 'Dark', 'Ghost'].includes(t))).toBe(true);
  });

  it('boosts weather-matching counters when a weather is given', () => {
    const noWeather = service.getCounters('boss-150');
    const rain = service.getCounters('boss-150', 'Rain');
    expect(rain.some((c) => c.weatherBoosted)).toBe(true);
    expect(noWeather.every((c) => !c.weatherBoosted)).toBe(true);
  });

  it('throws UnknownRaidBossError for an invalid boss id', () => {
    expect(() => service.getCounters('boss-9999')).toThrow(UnknownRaidBossError);
  });
});
