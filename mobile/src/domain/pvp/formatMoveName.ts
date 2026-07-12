/** PvPoke move IDs are SCREAMING_SNAKE_CASE (e.g. "VINE_WHIP") — this makes them display-ready. */
export function formatMoveName(moveId: string): string {
  return moveId
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
