const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const MAX_OUTPUT_TOKENS = 300;

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not set — the Companion AI endpoint is disabled. Get a free key at https://aistudio.google.com/apikey');
  }
}

export class GeminiRequestError extends Error {}

/**
 * Thin wrapper over Gemini's REST API (no SDK — one endpoint, keeps the dependency footprint
 * lean). Defaults to the Flash-Lite model, which sits inside Gemini's free tier (1,500
 * requests/day, no credit card) for normal personal use — see README's Post-beta scope for the
 * cost reasoning. Model name is overridable via GEMINI_MODEL since Google renames/retires these.
 */
export async function generateCompanionSuggestion(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.6 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new GeminiRequestError(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || text.trim() === '') {
    throw new GeminiRequestError('Gemini API returned no text (likely blocked by safety filters)');
  }

  return text.trim();
}
