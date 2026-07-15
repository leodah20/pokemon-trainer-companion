import { calculateIvPercentage } from '../domain/iv-calculator';
import { ScreenshotAnalysis } from './analyzeScreenshot';

/**
 * Formats what was actually read off the trainer's screen (CP/HP/IV) into a short string for the
 * Companion AI prompt. This is what grounds the AI's answer in the real scan instead of generic,
 * disconnected advice — see buildCompanionPrompt.ts on the backend for how it's used.
 */
export function buildCompanionExtraContext(analysis: ScreenshotAnalysis): string | undefined {
  const parts: string[] = [];
  if (analysis.cp !== null) {
    parts.push(`CP ${analysis.cp}`);
  }
  if (analysis.hp !== null) {
    parts.push(`HP ${analysis.hp}`);
  }
  if (analysis.ivMatches && analysis.ivMatches.length > 0) {
    const iv = analysis.ivMatches[0];
    parts.push(`IVs ${iv.ivAttack}/${iv.ivDefense}/${iv.ivStamina} (${calculateIvPercentage(iv)}%) at level ${iv.level}`);
  }
  return parts.length > 0 ? parts.join(', ') : undefined;
}
