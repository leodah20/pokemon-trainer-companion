import { Platform } from 'react-native';

/** Friendly rounded display font, used for titles and brand moments only — body text stays on
 * the system font for readability at small sizes. */
export const DISPLAY_FONT = 'Fredoka-Regular';

/** Small pixel font kept as a deliberate retro accent (dex numbers, tiny badges), not for body text. */
export const RETRO_FONT = 'PressStart2P-Regular';

/** System monospace, for code blocks and raw-data readouts (chat code fences, OCR debug text). */
export const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 20,
  xl: 26,
  xxl: 32,
} as const;
