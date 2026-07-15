export interface WeatherBoost {
  weather: string;
  boostedTypes: readonly string[];
}

/** Standard Pokemon GO weather boost table — mirrors backend/src/data/type-effectiveness/weatherBoosts.ts. */
export const WEATHER_BOOSTS: readonly WeatherBoost[] = [
  { weather: 'Clear', boostedTypes: ['Fire', 'Grass', 'Ground'] },
  { weather: 'Sunny', boostedTypes: ['Fire', 'Grass', 'Ground'] },
  { weather: 'Rain', boostedTypes: ['Water', 'Electric', 'Bug'] },
  { weather: 'PartlyCloudy', boostedTypes: ['Normal', 'Rock'] },
  { weather: 'Cloudy', boostedTypes: ['Fairy', 'Fighting', 'Poison'] },
  { weather: 'Windy', boostedTypes: ['Dragon', 'Flying', 'Psychic'] },
  { weather: 'Snow', boostedTypes: ['Ice', 'Steel'] },
  { weather: 'Fog', boostedTypes: ['Dark', 'Ghost'] },
];
