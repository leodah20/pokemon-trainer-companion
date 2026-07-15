import { calculateBulk, PokemonSpecies } from '../domain/pokemon-species';

export type ComparisonWinner = 'a' | 'b' | 'tie';

export interface StatComparison {
  label: string;
  valueA: number;
  valueB: number;
  winner: ComparisonWinner;
}

function winnerOf(valueA: number, valueB: number): ComparisonWinner {
  if (valueA > valueB) {
    return 'a';
  }
  if (valueB > valueA) {
    return 'b';
  }
  return 'tie';
}

export function compareSpecies(a: PokemonSpecies, b: PokemonSpecies): StatComparison[] {
  return [
    { label: 'ATK', valueA: a.baseAttack, valueB: b.baseAttack, winner: winnerOf(a.baseAttack, b.baseAttack) },
    { label: 'DEF', valueA: a.baseDefense, valueB: b.baseDefense, winner: winnerOf(a.baseDefense, b.baseDefense) },
    { label: 'STA', valueA: a.baseStamina, valueB: b.baseStamina, winner: winnerOf(a.baseStamina, b.baseStamina) },
    {
      label: 'Bulk (DEF+STA)',
      valueA: calculateBulk(a),
      valueB: calculateBulk(b),
      winner: winnerOf(calculateBulk(a), calculateBulk(b)),
    },
  ];
}
