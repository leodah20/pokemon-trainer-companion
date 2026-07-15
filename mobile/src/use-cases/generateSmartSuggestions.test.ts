import { generateSmartSuggestions } from './generateSmartSuggestions';
import { PokemonSpecies } from '../domain/pokemon-species';
import { EvolutionChainLink } from '../domain/evolution/types';

const BASIC_STAGE: PokemonSpecies = {
  id: 9401,
  name: 'BasicMon',
  generation: 1,
  baseAttack: 100,
  baseDefense: 200,
  baseStamina: 200,
  types: ['Water'],
};

const CHAIN: EvolutionChainLink[] = [
  {
    speciesId: 9401,
    speciesName: 'BasicMon',
    types: ['Water'],
    baseAttack: 100,
    baseDefense: 200,
    baseStamina: 200,
    stage: 'basic',
    candyCost: null,
  },
  {
    speciesId: 9402,
    speciesName: 'FinalMon',
    types: ['Water'],
    baseAttack: 180,
    baseDefense: 250,
    baseStamina: 250,
    stage: 'stage1',
    candyCost: 25,
  },
];

describe('generateSmartSuggestions', () => {
  it('suggests evolving when the species is not the final stage', () => {
    const suggestions = generateSmartSuggestions(BASIC_STAGE, undefined, null, CHAIN);
    expect(suggestions.some((s) => s.includes('Evolve to FinalMon') && s.includes('25 candy') && s.includes('+80 ATK'))).toBe(true);
  });

  it('says final stage when there is no next evolution', () => {
    const finalStageSpecies = { ...BASIC_STAGE, id: 9402, name: 'FinalMon' };
    const suggestions = generateSmartSuggestions(finalStageSpecies, undefined, null, CHAIN);
    expect(suggestions).toContain('Already at its final evolution stage.');
  });

  it('flags unranked PvP with a raid/gym redirect', () => {
    const suggestions = generateSmartSuggestions(BASIC_STAGE, undefined, null, null);
    expect(suggestions.some((s) => s.includes('Not competitively ranked in PvP'))).toBe(true);
  });

  it('picks the highest-scoring league when ranked in multiple', () => {
    const suggestions = generateSmartSuggestions(
      BASIC_STAGE,
      {
        great: { fastMove: 'X', chargedMoves: ['Y'], score: 60 },
        ultra: { fastMove: 'X', chargedMoves: ['Y'], score: 95 },
      },
      null,
      null,
    );
    expect(suggestions.some((s) => s.includes('Ultra League') && s.includes('Top Meta Pick'))).toBe(true);
  });

  it('suggests raid attacking against types the species is strong against', () => {
    const suggestions = generateSmartSuggestions(BASIC_STAGE, undefined, null, null);
    expect(suggestions.some((s) => s.startsWith('Good raid attacker against'))).toBe(true);
  });

  it('mentions gym defending only for above-average bulk or better', () => {
    const withGoodBulk = generateSmartSuggestions(BASIC_STAGE, undefined, { percentile: 80, tier: 'great' }, null);
    expect(withGoodBulk.some((s) => s.includes('gym defender'))).toBe(true);

    const withPoorBulk = generateSmartSuggestions(BASIC_STAGE, undefined, { percentile: 10, tier: 'fragile' }, null);
    expect(withPoorBulk.some((s) => s.includes('gym defender'))).toBe(false);
  });
});
