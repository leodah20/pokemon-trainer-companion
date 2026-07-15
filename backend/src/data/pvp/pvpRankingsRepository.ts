import { Injectable } from '@nestjs/common';
import { PvpRanking } from '../../domain/species/types';
import { ALL_SPECIES } from '../species/speciesDatabase';

export const PVP_LEAGUES = ['great', 'ultra', 'master'] as const;
export type PvpLeague = (typeof PVP_LEAGUES)[number];

@Injectable()
export class PvpRankingsRepository {
  private readonly rankings: PvpRanking[] = this.generateMockRankings();

  private generateMockRankings(): PvpRanking[] {
    // No live PvPoke data source wired up yet — this is a curated mock ranking so the PvP
    // endpoints/screens have real, distinct species to show. Replace with a synced PvPoke
    // dataset once the sync job (Fase 2.6) exists.
    const speciesForLeague: Record<PvpLeague, number[]> = {
      great: [3, 6, 9, 12, 15, 18, 20, 24, 26, 28, 31, 34, 36, 38, 40, 45, 47, 49, 55, 57],
      ultra: [59, 62, 65, 68, 71, 73, 76, 80, 82, 89, 91, 94, 99, 103, 105, 110, 112, 121, 130, 131],
      master: [142, 143, 144, 145, 146, 149, 150, 151, 248, 249, 250, 214, 212, 181, 229, 230, 242, 243, 244, 245],
    };
    const speciesById = new Map(ALL_SPECIES.map((s) => [s.id, s]));

    const rankings: PvpRanking[] = [];
    for (const league of PVP_LEAGUES) {
      const ids = speciesForLeague[league];
      for (let i = 0; i < ids.length; i++) {
        const species = speciesById.get(ids[i]);
        rankings.push({
          league,
          rank: i + 1,
          rating: Math.round(100 - (i * 100) / ids.length),
          speciesId: ids[i],
          speciesName: species?.name ?? 'Unknown',
          fastMove: i % 2 === 0 ? 'Counter' : 'Shadow Claw',
          chargeMove: i % 3 === 0 ? 'Frenzy Plant' : i % 3 === 1 ? 'Hydro Cannon' : 'Blast Burn',
        });
      }
    }
    return rankings;
  }

  findBySpeciesId(speciesId: number): PvpRanking[] {
    return this.rankings.filter((r) => r.speciesId === speciesId);
  }

  findByLeague(league: string, limit = 20): PvpRanking[] {
    return this.rankings
      .filter((r) => r.league === league)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }

  getLeagues(): PvpLeague[] {
    return [...PVP_LEAGUES];
  }
}
