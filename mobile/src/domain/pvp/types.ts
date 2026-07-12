export type PvpLeague = 'great' | 'ultra' | 'master';

export interface PvpMoveset {
  fastMove: string;
  chargedMoves: readonly string[];
  score: number;
}

export type PvpRankingsBySpecies = Partial<Record<PvpLeague, PvpMoveset>>;

export const PVP_LEAGUE_LABELS: Record<PvpLeague, string> = {
  great: 'Great League',
  ultra: 'Ultra League',
  master: 'Master League',
};
