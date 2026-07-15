export type TypeEffectivenessChart = Readonly<Record<string, Readonly<Record<string, number>>>>;

export type EffectivenessBucket = 'superEffective' | 'notVeryEffective' | 'noEffect' | 'neutral';

export interface TypeMatchup {
  type: string;
  multiplier: number;
  bucket: EffectivenessBucket;
}

export function bucketFor(multiplier: number): EffectivenessBucket {
  if (multiplier === 0) {
    return 'noEffect';
  }
  if (multiplier > 1) {
    return 'superEffective';
  }
  if (multiplier < 1) {
    return 'notVeryEffective';
  }
  return 'neutral';
}
