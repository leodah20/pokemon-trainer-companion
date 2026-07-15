import { WeatherBoost } from '../../domain/type-effectiveness/types';

// Standard Pokemon GO weather boost table — static, changes only if Niantic changes the game.
export const WEATHER_BOOSTS: WeatherBoost[] = [
  { weather: 'Clear', boostedTypes: ['Fire', 'Grass', 'Ground'] },
  { weather: 'Sunny', boostedTypes: ['Fire', 'Grass', 'Ground'] },
  { weather: 'Rain', boostedTypes: ['Water', 'Electric', 'Bug'] },
  { weather: 'PartlyCloudy', boostedTypes: ['Normal', 'Rock'] },
  { weather: 'Cloudy', boostedTypes: ['Fairy', 'Fighting', 'Poison'] },
  { weather: 'Windy', boostedTypes: ['Dragon', 'Flying', 'Psychic'] },
  { weather: 'Snow', boostedTypes: ['Ice', 'Steel'] },
  { weather: 'Fog', boostedTypes: ['Dark', 'Ghost'] },
];
