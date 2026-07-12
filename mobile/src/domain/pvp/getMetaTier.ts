export type MetaTier = 'top' | 'viable' | 'niche';

export const META_TIER_LABELS: Record<MetaTier, string> = {
  top: 'Top Meta Pick',
  viable: 'Viable',
  niche: 'Niche',
};

/** Thresholds are a judgment call, not an official PvPoke cutoff — tune freely. */
export function getMetaTier(score: number): MetaTier {
  if (score >= 90) {
    return 'top';
  }
  if (score >= 70) {
    return 'viable';
  }
  return 'niche';
}
