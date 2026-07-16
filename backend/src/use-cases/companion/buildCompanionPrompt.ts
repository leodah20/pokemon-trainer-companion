import { CompanionContext } from '../../domain/companion/types';
import { KnowledgeEntry } from '../../domain/knowledge/types';
import { SpeciesDetailDto } from '../../presentation/species/dto/speciesResponseDto';

const CONTEXT_FRAMING: Record<CompanionContext, string> = {
  raid: 'The trainer is about to fight this Pokemon in a raid, or wants to use it as a raid attacker.',
  battle: 'The trainer is deciding whether to use this Pokemon in a gym battle or PvP match.',
  capture: 'The trainer just encountered this Pokemon in the wild and is deciding whether to catch it.',
  levelup: 'The trainer is deciding whether to power up or evolve this Pokemon.',
  general: 'The trainer is just looking at this Pokemon and wants general advice.',
};

/**
 * Builds the prompt sent to Gemini. `knowledge`, when present, comes from the PokeAPI-sourced
 * knowledge base (see docs/architecture.md's "Flagship feature") so the model answers grounded in
 * real Pokedex facts instead of only its own general training. Keeping this a pure function makes
 * it unit-testable without a real API call.
 */
export function buildCompanionPrompt(
  species: SpeciesDetailDto,
  context: CompanionContext,
  extra?: string,
  knowledge?: KnowledgeEntry | null,
): string {
  const lines: string[] = [
    'You are a concise, knowledgeable Pokemon GO companion giving a trainer quick, actionable advice.',
    'Keep the reply to 2-3 short sentences, no markdown, no bullet points, friendly but efficient tone.',
    '',
    `Pokemon: ${species.name} (types: ${species.types.join('/')})`,
    `Base stats: ATK ${species.baseAttack}, DEF ${species.baseDefense}, STA ${species.baseStamina}`,
  ];

  if (species.evolutionFamily && species.evolutionFamily.evolutions.length > 0) {
    const nextStages = species.evolutionFamily.evolutions.map((e) => `${e.speciesName} (${e.candyCost} candy)`);
    lines.push(`Evolution family: ${species.evolutionFamily.speciesName} -> ${nextStages.join(' -> ')}`);
  }

  if (species.counters.length > 0) {
    const topCounters = species.counters.slice(0, 5).map((c) => c.speciesName);
    lines.push(`Type counters against it: ${topCounters.join(', ')}`);
  }

  if (species.pvpRankings.length > 0) {
    const byLeague = species.pvpRankings
      .map((r) => `${r.league} (rating ${r.rating}, ${r.fastMove}+${r.chargeMove})`)
      .join('; ');
    lines.push(`PvP rankings: ${byLeague}`);
  }

  if (knowledge) {
    lines.push(...summarizeKnowledge(knowledge));
  }

  lines.push('', CONTEXT_FRAMING[context]);
  if (extra) {
    lines.push(`Extra context from the trainer's screen: ${extra}`);
  }

  return lines.join('\n');
}

function summarizeKnowledge(knowledge: KnowledgeEntry): string[] {
  const lines: string[] = [];
  const facts: string[] = [];

  if (knowledge.genus) {
    facts.push(`known as the "${knowledge.genus}"`);
  }
  if (knowledge.habitat) {
    facts.push(`typically found in ${knowledge.habitat} habitats`);
  }
  if (knowledge.isLegendary) {
    facts.push('a Legendary Pokemon');
  }
  if (knowledge.isMythical) {
    facts.push('a Mythical Pokemon');
  }
  if (facts.length > 0) {
    lines.push(`Knowledge base: this Pokemon is ${facts.join(', ')}.`);
  }

  if (knowledge.pokedexEntries.length > 0) {
    const entry = knowledge.pokedexEntries[0];
    lines.push(`Official Pokedex entry (${entry.game}): "${entry.text}"`);
  }

  return lines;
}
