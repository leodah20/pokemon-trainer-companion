export const COLORS = {
  pokedexRed: '#DC0A2D',
  pokedexRedDark: '#A00820',
  screenGreen: '#9BBC0F',
  screenGreenDark: '#0F380F',
  navy: '#1B1F3B',
  navyLight: '#2C315C',
  cream: '#F4F1E8',
  gold: '#FFCB05',
  ink: '#0F0F0F',
  white: '#FFFFFF',
} as const;

/** Community-standard type color convention (not official Nintendo branding, widely used by fan tools). */
export const TYPE_COLORS: Record<string, string> = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC',
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? COLORS.navyLight;
}
