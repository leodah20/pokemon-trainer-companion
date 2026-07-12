import { LoreEntry } from '../../domain/lore';

/**
 * Original, hand-written trivia — deliberately not copied from any game's Pokedex flavor text
 * (see docs/legal-compliance.md section 2). Only a handful of species are seeded so far; this is
 * the pattern to extend, not a finished dataset.
 */
const LORE_ENTRIES: readonly LoreEntry[] = [
  {
    speciesId: 1,
    trivia: [
      'A Grass/Poison starter recognizable by the bulb on its back, said to hold a seed that grows alongside the Pokemon itself.',
      "One of the three original starter Pokemon offered at the very beginning of a trainer's journey in the classic games.",
      'Its dual typing gives it resistances that most single-type Grass Pokemon lack.',
    ],
  },
  {
    speciesId: 4,
    trivia: [
      "A Fire-type starter whose tail flame is often described as a sign of its health and mood.",
      'Evolves into Charmeleon and eventually Charizard, one of the most recognizable Pokemon in the franchise.',
      'Despite its Fire typing, its final evolution gains a secondary Flying type.',
    ],
  },
  {
    speciesId: 7,
    trivia: [
      'A Water-type starter known for retreating into its shell for defense.',
      'Completes the classic starter trio alongside Bulbasaur and Charmander.',
      'Its evolution line trades early speed for increasingly heavy defensive stats.',
    ],
  },
  {
    speciesId: 25,
    trivia: [
      "The franchise's most iconic mascot, an Electric-type mouse Pokemon.",
      'Uses the electric sacs in its cheeks to store and release electricity.',
      'Evolves into Raichu, though many trainers keep it unevolved out of sentiment.',
    ],
  },
  {
    speciesId: 133,
    trivia: [
      'Famous for having one of the largest numbers of possible evolutions of any Pokemon.',
      'Which "Eeveelution" it becomes traditionally depends on factors like held items, friendship, or location.',
      'Its Normal typing before evolving makes it flexible but rarely a top pick on its own.',
    ],
  },
  {
    speciesId: 150,
    trivia: [
      'A Psychic-type legendary said to have been created through genetic manipulation of Mew.',
      'Consistently ranks among the strongest Pokemon in both the main series and Pokemon GO.',
      'Its origin story is central to the plot of the first Pokemon movie.',
    ],
  },
];

const LORE_BY_SPECIES_ID = new Map(LORE_ENTRIES.map((entry) => [entry.speciesId, entry]));

export function getLoreForSpecies(speciesId: number): LoreEntry | undefined {
  return LORE_BY_SPECIES_ID.get(speciesId);
}
