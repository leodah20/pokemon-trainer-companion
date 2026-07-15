import { buildCompanionPrompt } from './buildCompanionPrompt';
import { SpeciesDetailDto } from '../../presentation/species/dto/speciesResponseDto';

const BASE_SPECIES: SpeciesDetailDto = {
  id: 1,
  name: 'Bulbasaur',
  generation: 1,
  types: ['Grass', 'Poison'],
  baseAttack: 118,
  baseDefense: 111,
  baseStamina: 128,
  evolutionFamily: null,
  counters: [],
  pvpRankings: [],
};

describe('buildCompanionPrompt', () => {
  it('includes species name, types, and stats', () => {
    const prompt = buildCompanionPrompt(BASE_SPECIES, 'general');
    expect(prompt).toContain('Bulbasaur');
    expect(prompt).toContain('Grass/Poison');
    expect(prompt).toContain('ATK 118');
  });

  it('frames the prompt differently per context', () => {
    const raidPrompt = buildCompanionPrompt(BASE_SPECIES, 'raid');
    const capturePrompt = buildCompanionPrompt(BASE_SPECIES, 'capture');
    expect(raidPrompt).toContain('raid');
    expect(capturePrompt).toContain('encountered this Pokemon in the wild');
  });

  it('includes evolution family when present', () => {
    const withEvolution: SpeciesDetailDto = {
      ...BASE_SPECIES,
      evolutionFamily: {
        speciesId: 1,
        speciesName: 'Bulbasaur',
        evolutions: [{ speciesId: 2, speciesName: 'Ivysaur', type: 'stage1', candyCost: 25 }],
      },
    };
    const prompt = buildCompanionPrompt(withEvolution, 'levelup');
    expect(prompt).toContain('Ivysaur (25 candy)');
  });

  it('includes counters and PvP rankings when present', () => {
    const withData: SpeciesDetailDto = {
      ...BASE_SPECIES,
      counters: [{ speciesId: 6, speciesName: 'Charizard', types: ['Fire', 'Flying'], effectiveness: 2 }],
      pvpRankings: [
        { league: 'great', rank: 1, rating: 90, speciesId: 1, speciesName: 'Bulbasaur', fastMove: 'Vine Whip', chargeMove: 'Sludge Bomb' },
      ],
    };
    const prompt = buildCompanionPrompt(withData, 'battle');
    expect(prompt).toContain('Charizard');
    expect(prompt).toContain('great (rating 90');
  });

  it('appends extra OCR context when given', () => {
    const prompt = buildCompanionPrompt(BASE_SPECIES, 'capture', 'CP 452, appraisal: great');
    expect(prompt).toContain('CP 452, appraisal: great');
  });
});
