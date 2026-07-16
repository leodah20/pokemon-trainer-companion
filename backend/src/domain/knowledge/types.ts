export interface PokedexEntry {
  game: string;
  text: string;
}

export interface KnowledgeEntry {
  speciesId: number;
  genus: string | null;
  habitat: string | null;
  captureRate: number;
  growthRate: string;
  eggGroups: string[];
  isLegendary: boolean;
  isMythical: boolean;
  pokedexEntries: PokedexEntry[];
  source: 'pokeapi';
}
