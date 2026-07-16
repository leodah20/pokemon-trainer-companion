import { KnowledgeRepository } from './knowledgeRepository';

describe('KnowledgeRepository', () => {
  it('returns a knowledge entry for a known Gen 1 species', () => {
    const repository = new KnowledgeRepository();
    const entry = repository.findBySpeciesId(1);
    expect(entry).not.toBeNull();
    expect(entry?.speciesId).toBe(1);
    expect(entry?.source).toBe('pokeapi');
    expect(entry?.pokedexEntries.length).toBeGreaterThan(0);
  });

  it('returns null for a species outside the ingested range', () => {
    const repository = new KnowledgeRepository();
    expect(repository.findBySpeciesId(9999)).toBeNull();
  });
});
