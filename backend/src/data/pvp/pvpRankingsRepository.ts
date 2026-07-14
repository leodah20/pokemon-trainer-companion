import { Injectable } from '@nestjs/common';
import { PvpRanking } from '../../domain/species/types';

@Injectable()
export class PvpRankingsRepository {
  private readonly rankings: PvpRanking[] = [];

  constructor() {
    this.rankings = this.generateMockRankings();
  }

  private generateMockRankings(): PvpRanking[] {
    const leagues = ['great', 'ultra', 'master'];
    const speciesForLeague: Record<string, number[]> = {
      great: [3, 6, 9, 12, 15, 18, 20, 24, 26, 28, 31, 34, 36, 38, 40, 45, 47, 49, 55, 57],
      ultra: [59, 62, 65, 68, 71, 73, 76, 80, 82, 89, 91, 94, 99, 103, 105, 110, 112, 121, 130, 131],
      master: [142, 143, 144, 145, 146, 149, 150, 151, 248, 249, 250, 214, 212, 181, 229, 230, 242, 243, 244, 245],
    };

    const rankings: PvpRanking[] = [];
    for (const league of leagues) {
      const ids = speciesForLeague[league];
      for (let i = 0; i < ids.length; i++) {
        rankings.push({
          league,
          rank: i + 1,
          rating: Math.round(100 - (i * 100) / ids.length),
          speciesName: '',
          fastMove: i % 2 === 0 ? 'Counter' : 'Shadow Claw',
          chargeMove: i % 3 === 0 ? 'Frenzy Plant' : i % 3 === 1 ? 'Hydro Cannon' : 'Blast Burn',
        });
      }
    }
    return rankings;
  }

  findBySpeciesId(speciesId: number): PvpRanking[] {
    return this.rankings.filter((r) => r.league === 'great' || r.league === 'ultra' || r.league === 'master');
  }

  findByLeague(league: string): PvpRanking[] {
    return this.rankings
      .filter((r) => r.league === league)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 20);
  }
}
