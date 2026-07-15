import { compareSpecies } from './comparePokemon';
import { PokemonSpecies } from '../domain/pokemon-species';

const HIGH_ATTACK: PokemonSpecies = {
  id: 1,
  name: 'Glass Cannon',
  generation: 1,
  baseAttack: 300,
  baseDefense: 50,
  baseStamina: 50,
  types: ['Normal'],
};

const TANK: PokemonSpecies = {
  id: 2,
  name: 'Wall',
  generation: 1,
  baseAttack: 50,
  baseDefense: 200,
  baseStamina: 200,
  types: ['Normal'],
};

describe('compareSpecies', () => {
  it('returns one comparison per stat, in ATK/DEF/STA/Bulk order', () => {
    const result = compareSpecies(HIGH_ATTACK, TANK);
    expect(result.map((c) => c.label)).toEqual(['ATK', 'DEF', 'STA', 'Bulk (DEF+STA)']);
  });

  it('picks the correct winner for each stat', () => {
    const result = compareSpecies(HIGH_ATTACK, TANK);
    expect(result.find((c) => c.label === 'ATK')?.winner).toBe('a');
    expect(result.find((c) => c.label === 'DEF')?.winner).toBe('b');
    expect(result.find((c) => c.label === 'STA')?.winner).toBe('b');
    expect(result.find((c) => c.label === 'Bulk (DEF+STA)')?.winner).toBe('b');
  });

  it('calls a tie when both species have the same value', () => {
    const result = compareSpecies(HIGH_ATTACK, { ...TANK, baseDefense: 50, baseStamina: 50 });
    expect(result.find((c) => c.label === 'DEF')?.winner).toBe('tie');
  });
});
