import { buildCompanionPrompt } from './buildCompanionPrompt';
import { SpeciesDetailDto } from '../../presentation/species/dto/speciesResponseDto';
import { KnowledgeEntry } from '../../domain/knowledge/types';

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

  it('grounds the prompt in knowledge base facts when present', () => {
    const knowledge: KnowledgeEntry = {
      speciesId: 1,
      genus: 'Seed Pokémon',
      habitat: 'grassland',
      captureRate: 45,
      growthRate: 'medium-slow',
      eggGroups: ['monster', 'plant'],
      isLegendary: false,
      isMythical: false,
      pokedexEntries: [{ game: 'red', text: 'A strange seed was planted on its back at birth.' }],
      source: 'pokeapi',
    };
    const prompt = buildCompanionPrompt(BASE_SPECIES, 'general', undefined, knowledge);
    expect(prompt).toContain('Seed Pokémon');
    expect(prompt).toContain('grassland habitats');
    expect(prompt).toContain('A strange seed was planted on its back at birth.');
  });

  it('omits knowledge base lines when no entry is available', () => {
    const prompt = buildCompanionPrompt(BASE_SPECIES, 'general', undefined, null);
    expect(prompt).not.toContain('Knowledge base');
    expect(prompt).not.toContain('Official Pokedex entry');
  });
});
