export const COLORS = {
  // Brand
  brandRed: '#E63950',
  brandRedDark: '#B91C3C',
  brandGold: '#FFCB05',

  // Neutrals (modern light theme)
  background: '#F5F6FB',
  surface: '#FFFFFF',
  border: '#E7E8F2',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Semantic
  success: '#22C55E',
  danger: '#DC2626',

  // Retro accent, used sparingly (lore panel, tiny badges) to nod at the Game Boy heritage
  retroScreenGreen: '#9BBC0F',
  retroScreenGreenDark: '#0F380F',
  retroInk: '#0F0F0F',
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

/** Mixes a hex color toward white — used to turn a vivid type color into a pastel background
 * tint that still reads as "that type's color" without fighting with dark text on top of it. */
export function tintTowardWhite(hexColor: string, whiteRatio: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const mix = (channel: number) => Math.round(channel + (255 - channel) * whiteRatio);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
