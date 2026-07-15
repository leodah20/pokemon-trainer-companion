import { generateQuiz } from './generateQuiz';
import { PokemonSpecies } from '../domain/pokemon-species';

const SPECIES: PokemonSpecies[] = [
  { id: 1, name: 'Bulbasaur', generation: 1, baseAttack: 118, baseDefense: 111, baseStamina: 128, types: ['Grass', 'Poison'] },
  { id: 4, name: 'Charmander', generation: 1, baseAttack: 116, baseDefense: 93, baseStamina: 118, types: ['Fire'] },
  { id: 7, name: 'Squirtle', generation: 1, baseAttack: 94, baseDefense: 121, baseStamina: 127, types: ['Water'] },
  { id: 25, name: 'Pikachu', generation: 1, baseAttack: 112, baseDefense: 96, baseStamina: 111, types: ['Electric'] },
  { id: 152, name: 'Chikorita', generation: 2, baseAttack: 92, baseDefense: 122, baseStamina: 128, types: ['Grass'] },
  { id: 258, name: 'Mudkip', generation: 3, baseAttack: 130, baseDefense: 104, baseStamina: 128, types: ['Water'] },
];

// Deterministic sequence generator so tests don't depend on Math.random.
function makeSeededRng(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

describe('generateQuiz', () => {
  it('generates the requested number of questions when data allows it', () => {
    const questions = generateQuiz(SPECIES, 5, makeSeededRng(1));
    expect(questions).toHaveLength(5);
  });

  it('every question has exactly 4 options with one valid correct index', () => {
    const questions = generateQuiz(SPECIES, 10, makeSeededRng(42));
    for (const question of questions) {
      expect(question.options).toHaveLength(4);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(4);
      // Options must be unique (no duplicate distractor equal to the correct answer or each other).
      expect(new Set(question.options).size).toBe(4);
    }
  });

  it('returns fewer questions than requested when the pool cannot support more', () => {
    const tinyPool: PokemonSpecies[] = [SPECIES[0]];
    const questions = generateQuiz(tinyPool, 5, makeSeededRng(7));
    expect(questions.length).toBeLessThanOrEqual(5);
  });
});
