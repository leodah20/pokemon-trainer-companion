import { recognizeTextFromImage } from '../data/ocr/ocrClient';
import { getAllSpecies } from '../data/pokedex/pokedexRepository';
import { getPvpRankingsForSpecies } from '../data/pvp/pvpRepository';
import { findIndividualValueCombinations, IvCombination } from '../domain/iv-calculator';
import { parseOcrText } from '../domain/ocr';
import { PokemonSpecies } from '../domain/pokemon-species';
import { PvpRankingsBySpecies } from '../domain/pvp';
import { EvolutionChainLink } from '../domain/evolution/types';
import { getEvolutionChain } from './getEvolutionChain';
import { generateSmartSuggestions } from './generateSmartSuggestions';
import { BulkRanking, rankBulkPercentile } from './rankBulkPercentile';

const DEFAULT_LEVEL_RANGE = { minLevel: 1, maxLevel: 40 };

export interface ScreenshotAnalysis {
  rawText: string;
  species: PokemonSpecies | null;
  cp: number | null;
  hp: number | null;
  ivMatches: IvCombination[] | null;
  pvpRankings: PvpRankingsBySpecies | undefined;
  bulkRanking: BulkRanking | null;
  evolutionChain: EvolutionChainLink[] | null;
  /** Rule-based "what should I do with this Pokemon" suggestions — see generateSmartSuggestions.ts. */
  suggestions: string[];
}

/**
 * The overlay's whole pipeline in one call: OCR the image, parse the text, look up the species,
 * and run every analysis screen this app already has (IV, PvP moveset, bulk) against it.
 */
export async function analyzeScreenshot(imageUri: string): Promise<ScreenshotAnalysis> {
  const allSpecies = getAllSpecies();
  const rawText = await recognizeTextFromImage(imageUri);
  const parsed = parseOcrText(
    rawText,
    allSpecies.map((species) => species.name),
  );

  const species = parsed.speciesName
    ? (allSpecies.find((candidate) => candidate.name === parsed.speciesName) ?? null)
    : null;

  const ivMatches =
    species && parsed.cp !== null && parsed.hp !== null
      ? findIndividualValueCombinations(species, parsed.cp, parsed.hp, DEFAULT_LEVEL_RANGE)
      : null;

  const pvpRankings = species ? getPvpRankingsForSpecies(species.id) : undefined;
  const bulkRanking = species ? rankBulkPercentile(allSpecies, species.id) : null;
  const evolutionChain = species ? getEvolutionChain(species.id, allSpecies) : null;

  return {
    rawText,
    species,
    cp: parsed.cp,
    hp: parsed.hp,
    ivMatches,
    pvpRankings,
    bulkRanking,
    evolutionChain,
    suggestions: species ? generateSmartSuggestions(species, pvpRankings, bulkRanking, evolutionChain) : [],
  };
}
