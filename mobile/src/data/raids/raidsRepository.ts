import { RaidBoss, RaidTier } from '../../domain/raids/types';
import { getSpeciesById } from '../pokedex/pokedexRepository';

/**
 * No live raid-rotation data source is wired up yet — Niantic doesn't publish one, and this app
 * doesn't have a scheduled sync job (see docs roadmap Fase 2.6). This is a small curated rotation
 * of well-known Gen 1 bosses per tier, mirroring backend/src/data/raids/raidsRepository.ts, kept
 * as a separate offline copy since the mobile app doesn't call the backend.
 */
const CURRENT_ROTATION: ReadonlyArray<{ speciesId: number; tier: RaidTier }> = [
  { speciesId: 129, tier: 1 }, // Magikarp
  { speciesId: 88, tier: 1 }, // Grimer
  { speciesId: 66, tier: 1 }, // Machop
  { speciesId: 68, tier: 3 }, // Machamp
  { speciesId: 65, tier: 3 }, // Alakazam
  { speciesId: 94, tier: 3 }, // Gengar
  { speciesId: 125, tier: 3 }, // Electabuzz
  { speciesId: 150, tier: 5 }, // Mewtwo
  { speciesId: 144, tier: 5 }, // Articuno
  { speciesId: 145, tier: 5 }, // Zapdos
  { speciesId: 146, tier: 5 }, // Moltres
];

export function getCurrentRaidBosses(): readonly RaidBoss[] {
  return CURRENT_ROTATION.map(({ speciesId, tier }) => {
    const species = getSpeciesById(speciesId);
    return {
      id: `boss-${speciesId}`,
      speciesId,
      speciesName: species?.name ?? 'Unknown',
      tier,
      types: species?.types ?? [],
    };
  });
}

export function getRaidBossById(id: string): RaidBoss | undefined {
  return getCurrentRaidBosses().find((boss) => boss.id === id);
}
