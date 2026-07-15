export interface ParsedOcrStats {
  speciesName: string | null;
  cp: number | null;
  hp: number | null;
}

function firstMatch(text: string, patterns: readonly RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

// CP: "CP 900" / "CP: 900" (English), or "PC3975" — Pokemon GO's Portuguese label for Combat
// Power ("Poder de Combate"), rendered with no space before the number.
const CP_PATTERNS: readonly RegExp[] = [/(?:CP|PC)\s*[:\s]?\s*(\d+)/i];

// HP: real Pokemon GO status screens put the label AFTER a "current/max" pair — "175 / 175 HP"
// (English) or "175 / 175 PS" (Portuguese, "Pontos de Saude") — not "HP: 175" as originally
// assumed. Both forms are matched; the label-after one is tried first since it's what the game
// actually renders.
const HP_PATTERNS: readonly RegExp[] = [/(\d+)\s*\/\s*\d+\s*(?:HP|PS)/i, /HP\s*[:\s]?\s*(\d+)/i];

/**
 * Turns raw OCR text (as returned by ML Kit for a status-screen-style image) into the three
 * fields the rest of the app cares about. Pure and framework-free — the OCR call itself lives in
 * the data layer, this only interprets its output.
 */
export function parseOcrText(rawText: string, knownSpeciesNames: readonly string[]): ParsedOcrStats {
  const normalizedText = rawText.toLowerCase();

  const speciesName =
    knownSpeciesNames
      .filter((name) => normalizedText.includes(name.toLowerCase()))
      // Prefer the longest match so "Charizard" wins over an accidental substring like "Char".
      .sort((a, b) => b.length - a.length)[0] ?? null;

  return {
    speciesName,
    cp: firstMatch(rawText, CP_PATTERNS),
    hp: firstMatch(rawText, HP_PATTERNS),
  };
}
