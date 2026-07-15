import { PokemonSpecies } from '../domain/pokemon-species';
import { QuizQuestion } from '../domain/quiz';
import { ALL_TYPE_NAMES, getMatchupsForAttacker } from '../data/type-effectiveness/typeEffectivenessRepository';

type Rng = () => number;

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function pickRandom<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

function toQuestion(prompt: string, correctAnswer: string, distractorPool: readonly string[], rng: Rng): QuizQuestion | null {
  if (distractorPool.length < 3) {
    return null;
  }
  const distractors = shuffle(distractorPool, rng).slice(0, 3);
  const options = shuffle([correctAnswer, ...distractors], rng);
  return { prompt, options, correctIndex: options.indexOf(correctAnswer) };
}

function buildTypeQuestion(allSpecies: readonly PokemonSpecies[], rng: Rng): QuizQuestion | null {
  const species = pickRandom(allSpecies, rng);
  const correctAnswer = species.types.join(' / ');
  const distractorPool = Array.from(
    new Set(allSpecies.map((s) => s.types.join(' / ')).filter((label) => label !== correctAnswer)),
  );
  return toQuestion(`What type is ${species.name}?`, correctAnswer, distractorPool, rng);
}

function buildSuperEffectiveQuestion(_allSpecies: readonly PokemonSpecies[], rng: Rng): QuizQuestion | null {
  const attackerType = pickRandom(ALL_TYPE_NAMES, rng);
  const matchups = getMatchupsForAttacker(attackerType);
  const strong = matchups.filter((m) => m.bucket === 'superEffective').map((m) => m.type);
  const notStrong = matchups.filter((m) => m.multiplier <= 1).map((m) => m.type);
  if (strong.length === 0) {
    return null;
  }
  const correctAnswer = pickRandom(strong, rng);
  return toQuestion(
    `${attackerType}-type moves are super effective against which type?`,
    correctAnswer,
    notStrong,
    rng,
  );
}

function buildGenerationQuestion(allSpecies: readonly PokemonSpecies[], rng: Rng): QuizQuestion | null {
  const species = pickRandom(allSpecies, rng);
  const correctAnswer = `Generation ${species.generation}`;
  const distractorPool = Array.from(new Set(allSpecies.map((s) => s.generation)))
    .filter((gen) => gen !== species.generation)
    .map((gen) => `Generation ${gen}`);
  return toQuestion(`What generation is ${species.name} from?`, correctAnswer, distractorPool, rng);
}

const QUESTION_BUILDERS = [buildTypeQuestion, buildSuperEffectiveQuestion, buildGenerationQuestion] as const;
const MAX_ATTEMPTS_PER_QUESTION = 10;

export function generateQuiz(
  allSpecies: readonly PokemonSpecies[],
  count: number,
  rng: Rng = Math.random,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let slot = 0; slot < count; slot++) {
    let question: QuizQuestion | null = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_QUESTION && question === null; attempt++) {
      const builder = pickRandom(QUESTION_BUILDERS, rng);
      question = builder(allSpecies, rng);
    }
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}
