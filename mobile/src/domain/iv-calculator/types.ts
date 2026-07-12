export interface BaseStats {
  baseAttack: number;
  baseDefense: number;
  baseStamina: number;
}

export interface IndividualValues {
  ivAttack: number;
  ivDefense: number;
  ivStamina: number;
}

export interface IvCombination extends IndividualValues {
  level: number;
}
