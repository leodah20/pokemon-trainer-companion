import { PvpService, UnknownLeagueError } from './pvpService';
import { PvpRankingsRepository } from '../../data/pvp/pvpRankingsRepository';

describe('PvpService', () => {
  const service = new PvpService(new PvpRankingsRepository());

  it('lists the available leagues', () => {
    expect(service.getLeagues()).toEqual(['great', 'ultra', 'master']);
  });

  it('returns real species names for the top of a league, sorted by rank', () => {
    const top = service.getTopByLeague('great', 5);
    expect(top).toHaveLength(5);
    expect(top[0].rank).toBe(1);
    expect(top.every((r) => r.speciesName !== '' && r.speciesName !== 'Unknown')).toBe(true);
  });

  it('respects the limit parameter', () => {
    expect(service.getTopByLeague('ultra', 3)).toHaveLength(3);
  });

  it('throws UnknownLeagueError for an invalid league', () => {
    expect(() => service.getTopByLeague('doubles', 20)).toThrow(UnknownLeagueError);
  });
});
