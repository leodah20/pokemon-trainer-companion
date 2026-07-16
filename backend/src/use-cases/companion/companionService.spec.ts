import { CompanionService } from './companionService';
import { GeminiNotConfiguredError } from '../../data/companion/geminiClient';
import { SpeciesService } from '../species/speciesService';
import { KnowledgeRepository } from '../../data/knowledge/knowledgeRepository';

describe('CompanionService', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it('throws GeminiNotConfiguredError when no API key is set (no real network call happens)', async () => {
    delete process.env.GEMINI_API_KEY;
    const fakeSpeciesService = {
      findById: () => ({
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
      }),
    } as unknown as SpeciesService;
    const fakeKnowledgeRepository = { findBySpeciesId: () => null } as unknown as KnowledgeRepository;

    const service = new CompanionService(fakeSpeciesService, fakeKnowledgeRepository);
    await expect(service.getSuggestion(1, 'raid')).rejects.toThrow(GeminiNotConfiguredError);
  });
});
