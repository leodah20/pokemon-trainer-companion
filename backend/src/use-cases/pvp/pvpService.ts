import { Injectable } from '@nestjs/common';
import { PvpRankingsRepository, PvpLeague, PVP_LEAGUES } from '../../data/pvp/pvpRankingsRepository';
import { PvpRanking } from '../../domain/species/types';

export class UnknownLeagueError extends Error {
  constructor(league: string) {
    super(`Unknown league: ${league}. Expected one of ${PVP_LEAGUES.join(', ')}`);
  }
}

@Injectable()
export class PvpService {
  constructor(private readonly pvpRepo: PvpRankingsRepository) {}

  getLeagues(): PvpLeague[] {
    return this.pvpRepo.getLeagues();
  }

  getTopByLeague(league: string, limit: number): PvpRanking[] {
    if (!PVP_LEAGUES.includes(league as PvpLeague)) {
      throw new UnknownLeagueError(league);
    }
    return this.pvpRepo.findByLeague(league, limit);
  }
}
