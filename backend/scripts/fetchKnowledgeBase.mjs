// One-off ingestion script: pulls structured Pokedex facts from PokeAPI (free, public, no auth)
// and writes the result to src/data/knowledge/knowledge-data.json. Not run at app runtime — the
// backend stays offline-safe and lightweight; re-run this manually to refresh or extend range.
// END_ID tracks the backend's own species database range (speciesDatabase.ts currently goes up to
// 251, Gen 1+2) rather than the mobile app's Gen-1-only hand-written lore scope — the knowledge
// base only needs a species to exist in the backend's species data to be useful, since
// CompanionService looks up the species there before grounding the AI prompt.
//
// Usage: node scripts/fetchKnowledgeBase.mjs

const START_ID = 1;
const END_ID = 251;
const DELAY_MS = 120; // be a polite citizen of a free public API
const MAX_POKEDEX_ENTRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function englishOnly(entries, languageField = 'language') {
  return entries.filter((e) => e[languageField].name === 'en');
}

function pickPokedexEntries(flavorTextEntries) {
  const seen = new Set();
  const picked = [];
  for (const entry of englishOnly(flavorTextEntries)) {
    const text = entry.flavor_text.replace(/[\n\f]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (seen.has(text)) continue;
    seen.add(text);
    picked.push({ game: entry.version.name, text });
    if (picked.length >= MAX_POKEDEX_ENTRIES) break;
  }
  return picked;
}

async function fetchSpeciesKnowledge(id) {
  const MAX_RETRIES = 3;
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      if (!res.ok) {
        throw new Error(`PokeAPI request failed for species ${id}: HTTP ${res.status}`);
      }
      return await parseSpeciesResponse(id, await res.json());
    } catch (error) {
      lastError = error;
      await sleep(DELAY_MS * attempt * 2);
    }
  }
  throw lastError;
}

async function parseSpeciesResponse(id, data) {
  const genusEntry = englishOnly(data.genera).find((g) => g.genus);

  return {
    speciesId: id,
    genus: genusEntry ? genusEntry.genus : null,
    habitat: data.habitat ? data.habitat.name : null,
    captureRate: data.capture_rate,
    growthRate: data.growth_rate.name,
    eggGroups: data.egg_groups.map((g) => g.name),
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
    pokedexEntries: pickPokedexEntries(data.flavor_text_entries),
    source: 'pokeapi',
  };
}

async function main() {
  const entries = [];
  for (let id = START_ID; id <= END_ID; id++) {
    process.stdout.write(`Fetching species ${id}/${END_ID}...\r`);
    const entry = await fetchSpeciesKnowledge(id);
    entries.push(entry);
    await sleep(DELAY_MS);
  }
  console.log(`\nFetched ${entries.length} knowledge entries.`);

  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const outDir = path.join(import.meta.dirname, '..', 'src', 'data', 'knowledge');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'knowledge-data.ts');
  const contents =
    `import { KnowledgeEntry } from '../../domain/knowledge/types';\n\n` +
    `export const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = ${JSON.stringify(entries)};\n`;
  await fs.writeFile(outPath, contents, 'utf-8');
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
