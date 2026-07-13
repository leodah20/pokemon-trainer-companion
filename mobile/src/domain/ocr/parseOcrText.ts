export interface ParsedOcrStats {
  speciesName: string | null;
  cp: number | null;
  hp: number | null;
}

function extractNumberAfterLabel(text: string, label: RegExp): number | null {
  const match = text.match(label);
  if (!match) {
    return null;
  }
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

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
    cp: extractNumberAfterLabel(rawText, /CP\s*[:\s]?\s*(\d+)/i),
    hp: extractNumberAfterLabel(rawText, /HP\s*[:\s]?\s*(\d+)/i),
  };
}
