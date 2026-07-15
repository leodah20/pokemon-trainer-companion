import { Injectable } from '@nestjs/common';
import { RaidBoss, RaidTier } from '../../domain/raids/types';
import { ALL_SPECIES } from '../species/speciesDatabase';

// No live raid-rotation data source is wired up yet (Niantic doesn't publish one; real apps
// scrape event calendars). This is a small curated rotation of well-known Gen 1 bosses per tier
// so the raid counters feature has real data to work with — replace with a synced feed later.
const CURRENT_ROTATION: Array<{ speciesId: number; tier: RaidTier }> = [
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

@Injectable()
export class RaidsRepository {
  private readonly bosses: RaidBoss[] = this.buildBosses();

  private buildBosses(): RaidBoss[] {
    const speciesById = new Map(ALL_SPECIES.map((s) => [s.id, s]));
    return CURRENT_ROTATION.map(({ speciesId, tier }) => {
      const species = speciesById.get(speciesId);
      return {
        id: `boss-${speciesId}`,
        speciesId,
        speciesName: species?.name ?? 'Unknown',
        tier,
        types: species?.types ?? [],
      };
    });
  }

  findAll(): RaidBoss[] {
    return this.bosses;
  }

  findById(id: string): RaidBoss | undefined {
    return this.bosses.find((boss) => boss.id === id);
  }
}
