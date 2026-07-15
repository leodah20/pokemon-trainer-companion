export type EvolutionStage = 'basic' | 'stage1' | 'stage2';

export interface EvolutionChainLink {
  speciesId: number;
  speciesName: string;
  types: readonly string[];
  baseAttack: number;
  baseDefense: number;
  baseStamina: number;
  stage: EvolutionStage;
  /** Candy cost to evolve INTO this stage from the previous one; null for the basic stage. */
  candyCost: number | null;
}
