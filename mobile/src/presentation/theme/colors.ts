export const COLORS = {
  // Brand — bold and saturated on purpose, not a washed-out corporate palette
  brandRed: '#EE1C25',
  brandRedDark: '#B3121A',
  brandBlue: '#2A75BB',
  brandGold: '#FFCB05',

  // Cartoon-ink outline, used deliberately on cards/buttons/badges for a game-drawn feel
  outline: '#1A1A1A',

  // Neutrals
  background: '#E9F5FF',
  surface: '#FFFFFF',
  border: '#D8E6F2',
  textPrimary: '#1A1A2E',
  textSecondary: '#556070',
  textMuted: '#8A93A3',

  // Semantic
  success: '#22C55E',
  danger: '#DC2626',
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
  return TYPE_COLORS[type] ?? COLORS.textSecondary;
}

function parseHex(hexColor: string): [number, number, number] {
  const hex = hexColor.replace('#', '');
  return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

/** Mixes a hex color toward white by `whiteRatio` (0 = untouched, 1 = pure white). Lower ratios
 * keep the color bold — this app leans colorful on purpose, so most call sites use a modest ratio. */
export function tintTowardWhite(hexColor: string, whiteRatio: number): string {
  const [r, g, b] = parseHex(hexColor);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * whiteRatio);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Mixes a hex color toward black — used for the deep end of the type-color gradients. */
export function shadeTowardBlack(hexColor: string, blackRatio: number): string {
  const [r, g, b] = parseHex(hexColor);
  const mix = (channel: number) => Math.round(channel * (1 - blackRatio));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** The two stops of a vivid full-screen gradient for a given type color. */
export function getTypeGradient(typeColor: string): [string, string] {
  return [tintTowardWhite(typeColor, 0.15), shadeTowardBlack(typeColor, 0.35)];
}
