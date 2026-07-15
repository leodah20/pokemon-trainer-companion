export interface TypeMatchup {
  type: string;
  multiplier: number;
}

export interface TypeChartEntry {
  type: string;
  weaknesses: TypeMatchup[];
  resistances: TypeMatchup[];
  immunities: TypeMatchup[];
  strongAgainst: TypeMatchup[];
}

export interface WeatherBoost {
  weather: string;
  boostedTypes: string[];
}
