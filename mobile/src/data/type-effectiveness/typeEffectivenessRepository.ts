import { bucketFor, TypeEffectivenessChart, TypeMatchup } from '../../domain/type-effectiveness/types';

/**
 * Attacker-type -> defender-type -> damage multiplier. Missing entries default to 1 (neutral).
 * Mirrors `backend/src/data/species/speciesDatabase.ts`'s TYPE_EFFECTIVENESS — kept as a separate
 * copy since the mobile app is offline-first and doesn't call the backend (see domain/README.md).
 */
const TYPE_EFFECTIVENESS: TypeEffectivenessChart = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5, Grass: 2, Ice: 2, Bug: 2, Steel: 2 },
  Water: { Water: 0.5, Fire: 2, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Electric: 0.5, Ground: 0, Flying: 2, Water: 2, Grass: 0.5, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Ice: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Ghost: 0, Fairy: 0.5 },
  Poison: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug: { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Fairy: 0, Steel: 0.5 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Fairy: 2, Steel: 0.5, Poison: 0 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

/** Canonical order for chart rows/columns — matches the order types were introduced across generations. */
export const ALL_TYPE_NAMES: readonly string[] = Object.keys(TYPE_EFFECTIVENESS);

export function getMultiplier(attackerType: string, defenderType: string): number {
  return TYPE_EFFECTIVENESS[attackerType]?.[defenderType] ?? 1;
}

/** Combined multiplier of one attacking type against a (possibly dual-type) defender. */
export function getCombinedMultiplier(attackerType: string, defenderTypes: readonly string[]): number {
  return defenderTypes.reduce((total, defenderType) => total * getMultiplier(attackerType, defenderType), 1);
}

/** All 18 matchups for a given attacking type, in canonical type order. */
export function getMatchupsForAttacker(attackerType: string): TypeMatchup[] {
  return ALL_TYPE_NAMES.map((defenderType) => {
    const multiplier = getMultiplier(attackerType, defenderType);
    return { type: defenderType, multiplier, bucket: bucketFor(multiplier) };
  });
}
