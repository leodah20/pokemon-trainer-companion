import { buildCompanionExtraContext } from './buildCompanionExtraContext';
import { ScreenshotAnalysis } from './analyzeScreenshot';

const BASE_ANALYSIS: ScreenshotAnalysis = {
  rawText: '',
  species: null,
  cp: null,
  hp: null,
  ivMatches: null,
  pvpRankings: undefined,
  bulkRanking: null,
  evolutionChain: null,
  suggestions: [],
};

describe('buildCompanionExtraContext', () => {
  it('returns undefined when nothing was extracted', () => {
    expect(buildCompanionExtraContext(BASE_ANALYSIS)).toBeUndefined();
  });

  it('includes CP and HP when present', () => {
    const result = buildCompanionExtraContext({ ...BASE_ANALYSIS, cp: 1256, hp: 111 });
    expect(result).toBe('CP 1256, HP 111');
  });

  it('includes the best IV match with percentage and level', () => {
    const result = buildCompanionExtraContext({
      ...BASE_ANALYSIS,
      cp: 1256,
      ivMatches: [{ level: 20, ivAttack: 15, ivDefense: 14, ivStamina: 15 }],
    });
    expect(result).toContain('CP 1256');
    expect(result).toContain('IVs 15/14/15');
    expect(result).toContain('at level 20');
  });
});
