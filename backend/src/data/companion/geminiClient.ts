const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const SUGGESTION_MAX_OUTPUT_TOKENS = 300;
const CHAT_MAX_OUTPUT_TOKENS = 500;

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not set — the Companion AI endpoint is disabled. Get a free key at https://aistudio.google.com/apikey');
  }
}

export class GeminiRequestError extends Error {}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface GeminiContent {
  role?: 'user' | 'model';
  parts: Array<{ text: string }>;
}

async function callGemini(
  contents: GeminiContent[],
  options: { systemInstruction?: string; maxOutputTokens: number; temperature: number },
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(options.systemInstruction
        ? { systemInstruction: { parts: [{ text: options.systemInstruction }] } }
        : {}),
      contents,
      generationConfig: { maxOutputTokens: options.maxOutputTokens, temperature: options.temperature },
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

/**
 * Thin wrapper over Gemini's REST API (no SDK — one endpoint, keeps the dependency footprint
 * lean). Defaults to the Flash-Lite model, which sits inside Gemini's free tier (1,500
 * requests/day, no credit card) for normal personal use — see README's Post-beta scope for the
 * cost reasoning. Model name is overridable via GEMINI_MODEL since Google renames/retires these.
 */
export async function generateCompanionSuggestion(prompt: string): Promise<string> {
  return callGemini([{ parts: [{ text: prompt }] }], {
    maxOutputTokens: SUGGESTION_MAX_OUTPUT_TOKENS,
    temperature: 0.6,
  });
}

/**
 * Open-ended, multi-turn chat — the trainer can ask anything, not just get a suggestion tied to
 * one species. `history` is the full conversation so far (oldest first, ending with the newest
 * user message); Gemini's `contents` array natively supports this as alternating user/model
 * turns, so no manual prompt-stuffing is needed for context.
 */
export async function generateChatReply(history: ChatTurn[], systemInstruction: string): Promise<string> {
  const contents: GeminiContent[] = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
  return callGemini(contents, { systemInstruction, maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS, temperature: 0.7 });
}
