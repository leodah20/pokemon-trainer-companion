import { PvpRankingsBySpecies } from '../../domain/pvp';
import pvpRankingsData from './pvp-rankings.json';

/**
 * Bundled snapshot of PvPoke's open community rankings (pvpoke.com, GitHub: pvpoke/pvpoke),
 * matched to our species by name. Chosen over scraping social media/forums for the same
 * "data-backed moveset suggestion" goal — see docs/legal-compliance.md.
 * Keyed by our own numeric species id (as a string, since JSON object keys are always strings).
 */
const RANKINGS_BY_SPECIES_ID = pvpRankingsData as Record<string, PvpRankingsBySpecies>;

export function getPvpRankingsForSpecies(speciesId: number): PvpRankingsBySpecies | undefined {
  return RANKINGS_BY_SPECIES_ID[String(speciesId)];
}
