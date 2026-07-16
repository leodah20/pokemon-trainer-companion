// One-off batch translation: reads the hand-written Portuguese lore-data.json (151 Gen 1 species,
// 7 fields each) and produces English and Spanish equivalents via Gemini (free tier, already used
// by the backend's Companion AI), matching the plan documented in README's Post-beta scope
// ("a good candidate for batch-translating via the Gemini integration already in place, rather
// than hand-translating ~150 species x 7 fields"). Not called at app runtime — writes committed
// lore-data.en.json / lore-data.es.json files the mobile app bundles like any other static data.
//
// Usage: GEMINI_API_KEY=... node scripts/translateLoreData.mjs
// (or it will read backend/.env if GEMINI_API_KEY isn't already in the environment)

import fs from 'node:fs/promises';
import path from 'node:path';

const SCRIPT_DIR = import.meta.dirname;
const SOURCE_PATH = path.join(SCRIPT_DIR, '..', 'src', 'data', 'lore', 'lore-data.json');
const OUT_EN_PATH = path.join(SCRIPT_DIR, '..', 'src', 'data', 'lore', 'lore-data.en.json');
const OUT_ES_PATH = path.join(SCRIPT_DIR, '..', 'src', 'data', 'lore', 'lore-data.es.json');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest';
const DELAY_MS = 1200;
const MAX_RETRIES = 4;

const FIELDS = ['origin', 'goRelevance', 'battleTip', 'easterEgg', 'goDifference', 'evolutionCost', 'shinyRate'];

async function loadApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  const envPath = path.join(SCRIPT_DIR, '..', '..', 'backend', '.env');
  const contents = await fs.readFile(envPath, 'utf-8');
  const match = contents.match(/^GEMINI_API_KEY=(.+)$/m);
  if (!match) {
    throw new Error('GEMINI_API_KEY not found in environment or backend/.env');
  }
  return match[1].trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt(entry) {
  const fieldsJson = JSON.stringify(Object.fromEntries(FIELDS.map((f) => [f, entry[f]])), null, 2);
  return [
    'Translate the following Pokemon GO trivia/lore fields from Brazilian Portuguese into natural,',
    'trainer-friendly English and Spanish. Preserve all factual content (numbers, candy costs, move',
    'names, game version names) exactly — do not invent or drop facts. Keep roughly the same length',
    'and tone (concise, informative, written for a Pokemon GO player).',
    '',
    'Source fields (Portuguese):',
    fieldsJson,
    '',
    'Respond with ONLY a JSON object of this exact shape, no markdown fences, no extra text:',
    '{"en": {"origin": "...", "goRelevance": "...", "battleTip": "...", "easterEgg": "...", "goDifference": "...", "evolutionCost": "...", "shinyRate": "..."},',
    ' "es": {"origin": "...", "goRelevance": "...", "battleTip": "...", "easterEgg": "...", "goDifference": "...", "evolutionCost": "...", "shinyRate": "..."}}',
  ].join('\n');
}

// Scans for the first balanced {...} object rather than first-brace-to-last-brace: the model
// sometimes echoes a second JSON object (or trailing commentary) after the real one, which broke
// naive slicing with "unexpected non-whitespace character after JSON" parse errors.
function extractJson(text) {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const start = stripped.indexOf('{');
  if (start === -1) {
    throw new Error('no JSON object found in response');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const char = stripped[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return JSON.parse(stripped.slice(start, i + 1));
      }
    }
  }
  throw new Error('unbalanced JSON object in response');
}

async function translateEntry(apiKey, entry) {
  const prompt = buildPrompt(entry);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(`${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.3, responseMimeType: 'application/json' },
      }),
    });

    if (response.status === 429 || response.status >= 500) {
      const backoff = DELAY_MS * attempt * 2;
      console.warn(`  species ${entry.speciesId}: HTTP ${response.status}, retrying in ${backoff}ms (attempt ${attempt}/${MAX_RETRIES})`);
      await sleep(backoff);
      continue;
    }
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API error ${response.status} for species ${entry.speciesId}: ${body}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || text.trim() === '') {
      throw new Error(`Gemini returned no text for species ${entry.speciesId} (likely safety filter)`);
    }

    try {
      const parsed = extractJson(text);
      for (const lang of ['en', 'es']) {
        for (const field of FIELDS) {
          if (typeof parsed[lang]?.[field] !== 'string' || parsed[lang][field].trim() === '') {
            throw new Error(`missing/empty field "${lang}.${field}"`);
          }
        }
      }
      return parsed;
    } catch (parseError) {
      console.warn(`  species ${entry.speciesId}: JSON parse failed (${parseError.message}), retrying (attempt ${attempt}/${MAX_RETRIES})`);
      await sleep(DELAY_MS);
    }
  }

  throw new Error(`Failed to translate species ${entry.speciesId} after ${MAX_RETRIES} attempts`);
}

async function main() {
  const apiKey = await loadApiKey();
  const source = JSON.parse(await fs.readFile(SOURCE_PATH, 'utf-8'));

  let existingEn = [];
  let existingEs = [];
  try {
    existingEn = JSON.parse(await fs.readFile(OUT_EN_PATH, 'utf-8'));
    existingEs = JSON.parse(await fs.readFile(OUT_ES_PATH, 'utf-8'));
    console.log(`Resuming: found ${existingEn.length} already-translated entries.`);
  } catch {
    // no existing output yet — starting fresh
  }
  const doneIds = new Set(existingEn.map((e) => e.speciesId));
  const enEntries = [...existingEn];
  const esEntries = [...existingEs];

  const failed = [];
  for (const entry of source) {
    if (doneIds.has(entry.speciesId)) continue;

    process.stdout.write(`Translating species ${entry.speciesId}/${source.length}...\r`);
    try {
      const { en, es } = await translateEntry(apiKey, entry);
      enEntries.push({ speciesId: entry.speciesId, ...en });
      esEntries.push({ speciesId: entry.speciesId, ...es });

      enEntries.sort((a, b) => a.speciesId - b.speciesId);
      esEntries.sort((a, b) => a.speciesId - b.speciesId);
      await fs.writeFile(OUT_EN_PATH, JSON.stringify(enEntries, null, 2) + '\n', 'utf-8');
      await fs.writeFile(OUT_ES_PATH, JSON.stringify(esEntries, null, 2) + '\n', 'utf-8');
    } catch (error) {
      console.warn(`\nSkipping species ${entry.speciesId} after repeated failures: ${error.message}`);
      failed.push(entry.speciesId);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Wrote ${enEntries.length} English and ${esEntries.length} Spanish lore entries.`);
  if (failed.length > 0) {
    console.log(`Failed species (re-run this script to retry — it resumes automatically): ${failed.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
