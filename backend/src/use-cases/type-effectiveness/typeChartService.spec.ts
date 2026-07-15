import { TypeChartService, UnknownTypeError } from './typeChartService';

describe('TypeChartService', () => {
  const service = new TypeChartService();

  it('fills the full chart with a default multiplier of 1 for unlisted matchups', () => {
    const chart = service.getFullChart();
    expect(chart.Normal.Fire).toBe(1);
    expect(chart.Fire.Grass).toBe(2);
    expect(chart.Normal.Ghost).toBe(0);
  });

  it('classifies Fire as weak to Water and resistant to Grass', () => {
    const entry = service.getTypeEntry('Fire');
    expect(entry.weaknesses.map((m) => m.type)).toContain('Water');
    expect(entry.resistances.map((m) => m.type)).toContain('Grass');
    expect(entry.strongAgainst.map((m) => m.type)).toContain('Grass');
  });

  it('matches type names case-insensitively', () => {
    expect(service.getTypeEntry('fire').type).toBe('Fire');
  });

  it('throws UnknownTypeError for an invalid type', () => {
    expect(() => service.getTypeEntry('Cosmic')).toThrow(UnknownTypeError);
  });

  it('reports which types each weather condition boosts', () => {
    const boosts = service.getWeatherBoosts();
    const rain = boosts.find((b) => b.weather === 'Rain');
    expect(rain?.boostedTypes).toContain('Water');
  });
});
