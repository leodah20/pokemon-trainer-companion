import { BACKEND_BASE_URL } from '../../config';

export type CompanionAiContext = 'raid' | 'battle' | 'capture' | 'levelup' | 'general';

export class CompanionApiError extends Error {}

/**
 * Calls the backend's Gemini-backed /api/companion/suggest. This is the only network call in
 * the whole mobile app (see docs/architecture.md) — everything else works fully offline. Any
 * failure (backend not running, no GEMINI_API_KEY configured, no network) surfaces as
 * CompanionApiError so callers can fall back to the free rule-based suggestions instead.
 */
export async function fetchCompanionSuggestion(
  speciesId: number,
  context: CompanionAiContext,
  extra?: string,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_BASE_URL}/companion/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speciesId, context, extra }),
    });
  } catch {
    throw new CompanionApiError("Couldn't reach the Companion AI backend. Is it running?");
  }

  if (!response.ok) {
    throw new CompanionApiError(`Companion AI request failed (${response.status})`);
  }

  const data = (await response.json()) as { suggestion?: unknown };
  if (typeof data.suggestion !== 'string') {
    throw new CompanionApiError('Companion AI returned an unexpected response');
  }

  return data.suggestion;
}
