import { rankBulkPercentile } from './rankBulkPercentile';
import { PokemonSpecies } from '../domain/pokemon-species';

const SPECIES: PokemonSpecies[] = [
  { id: 1, name: 'Fragile', generation: 1, baseAttack: 100, baseDefense: 10, baseStamina: 10, types: ['Normal'] },
  { id: 2, name: 'Average', generation: 1, baseAttack: 100, baseDefense: 50, baseStamina: 50, types: ['Normal'] },
  { id: 3, name: 'Tanky', generation: 1, baseAttack: 100, baseDefense: 100, baseStamina: 100, types: ['Normal'] },
];

describe('rankBulkPercentile', () => {
  it('returns null for an unknown species id', () => {
    expect(rankBulkPercentile(SPECIES, 999)).toBeNull();
  });

  it('ranks the tankiest species at the 100th percentile', () => {
    const result = rankBulkPercentile(SPECIES, 3);
    expect(result?.percentile).toBe(100);
    expect(result?.tier).toBe('elite');
  });

  it('ranks the frailest species at the lowest percentile', () => {
    const result = rankBulkPercentile(SPECIES, 1);
    expect(result?.percentile).toBeLessThan(50);
    expect(result?.tier).toBe('belowAverage');
  });
});
