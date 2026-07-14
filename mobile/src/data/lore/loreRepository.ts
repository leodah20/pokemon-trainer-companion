import { PokemonSpecies } from '../../domain/pokemon-species';
import { LoreEntry, LoreEntryWithFallback } from '../../domain/lore';
import rawLoreData from './lore-data.json';

<<<<<<< HEAD
const LORE_BY_SPECIES_ID = new Map(
  (rawLoreData as LoreEntry[]).map((entry) => [entry.speciesId, entry]),
);
=======
/**
 * Original, hand-written lore — deliberately not copied from any game's Pokedex flavor text (see
 * docs/legal-compliance.md section 2). Only a handful of species are seeded so far; this is the
 * pattern to extend, not a finished dataset. Each entry leads with a one-line summary (shown
 * first) before the timeline/curiosities a trainer can dig into.
 */
const LORE_ENTRIES: readonly LoreEntry[] = [
  {
    speciesId: 1,
    summary:
      'The Grass/Poison seed Pokemon and one of the three classic starters offered to brand-new trainers.',
    timeline: [
      { label: 'Generation I (1996)', note: 'Debuted as one of the three starter Pokemon in the original Red and Green games.' },
      { label: 'Anime debut (1997)', note: "Appeared in the animated series' earliest episodes, among the starters Ash considered before Pikachu." },
      { label: 'Pokemon GO (2016)', note: 'Available as a common starter reward, later returning as a Community Day featured species.' },
    ],
    curiosities: [
      'The bulb on its back is said to hold a seed that grows alongside the Pokemon itself.',
      'Its dual typing gives it resistances that most single-type Grass Pokemon lack.',
      'Completes the classic starter trio alongside Charmander and Squirtle.',
    ],
  },
  {
    speciesId: 4,
    summary: 'A Fire-type starter whose tail flame is often described as a sign of its health and mood.',
    timeline: [
      { label: 'Generation I (1996)', note: 'One of the three starter Pokemon in Red and Green.' },
      { label: 'Anime arc', note: "A memorable early storyline involved a trainer abandoning his Charmander, one of the series' first emotional arcs." },
      { label: 'Evolution legacy', note: 'Its final evolution, Charizard, became one of the most recognizable Pokemon in the franchise.' },
    ],
    curiosities: [
      'Despite being Fire-type, its final evolution gains a secondary Flying type.',
      "Fans have long debated whether the tail flame ever truly goes out.",
      'One of the most consistently popular starters across generations of players.',
    ],
  },
  {
    speciesId: 7,
    summary: 'A Water-type starter known for retreating into its shell for defense.',
    timeline: [
      { label: 'Generation I (1996)', note: 'Completes the original starter trio alongside Bulbasaur and Charmander.' },
      { label: 'Anime arc', note: 'A group of rebellious wild Squirtle wearing sunglasses became a memorable recurring gag in the animated series.' },
      { label: 'Pokemon GO', note: 'A consistently popular catch thanks to its wide availability and shiny variant.' },
    ],
    curiosities: [
      'Its evolution line trades early speed for increasingly heavy defensive stats.',
      'One of the most commonly chosen starters for new trainers who prioritize survivability.',
      'Its final evolution, Blastoise, is known for the water cannons housed in its shell.',
    ],
  },
  {
    speciesId: 25,
    summary: "The franchise's most iconic mascot, an Electric-type mouse Pokemon.",
    timeline: [
      { label: 'Generation I (1996)', note: 'Introduced as a catchable Pokemon, not one of the original three starters.' },
      { label: 'Anime debut (1997)', note: "Chosen as Ash Ketchum's very first partner, cementing its role as the franchise's face." },
      { label: 'Global branding', note: "Became the anchor of the franchise's marketing and merchandising worldwide." },
    ],
    curiosities: [
      'Uses the electric sacs in its cheeks to store and release electricity.',
      'Evolves into Raichu, though many trainers keep it unevolved out of sentiment.',
      "Its silhouette is one of the most widely recognized in entertainment media.",
    ],
  },
  {
    speciesId: 133,
    summary: 'Famous for having one of the largest numbers of possible evolutions of any Pokemon.',
    timeline: [
      { label: 'Generation I (1996)', note: 'Introduced alongside its first three "Eeveelutions": Vaporeon, Jolteon, and Flareon.' },
      { label: 'Later generations', note: 'Gained additional evolutions (Espeon, Umbreon, Leafeon, Glaceon, Sylveon) across later game generations.' },
      { label: 'Community folklore', note: 'Trainers discovered that giving Eevee specific nicknames before evolving could guarantee a chosen Eeveelution — a trick that spread widely among players.' },
    ],
    curiosities: [
      'Which Eeveelution it becomes traditionally depends on factors like held items, friendship, or location.',
      'Its Normal typing before evolving makes it flexible but rarely a top pick on its own.',
      'One of the few Pokemon whose unevolved form is nearly as beloved as any of its evolutions.',
    ],
  },
  {
    speciesId: 150,
    summary: 'A Psychic-type legendary said to have been created through genetic manipulation of Mew.',
    timeline: [
      { label: 'Generation I (1996)', note: 'Introduced as one of the series’ first "legendary" Pokemon.' },
      { label: 'Movie debut (1998)', note: 'Starred in the first Pokemon feature film, an origin story about creation and identity.' },
      { label: 'Pokemon GO', note: 'Consistently ranks among the strongest raid bosses and PvP picks across formats.' },
    ],
    curiosities: [
      'Its origin story is central to the plot of the first Pokemon movie.',
      'Frequently featured in competitive tier lists across multiple Pokemon games.',
      'Has received several "Armored" and Mega Evolution variants in later media.',
    ],
  },
];

const LORE_BY_SPECIES_ID = new Map(LORE_ENTRIES.map((entry) => [entry.speciesId, entry]));
>>>>>>> 18b789e050f190694e288b5d56b3774ac32cb891

export function getLoreForSpecies(speciesId: number): LoreEntry | undefined {
  const writtenLore = LORE_BY_SPECIES_ID.get(speciesId);
  if (writtenLore) {
    return writtenLore;
  }
  return undefined;
}

export function getLoreWithFallback(
  species: PokemonSpecies | undefined,
): LoreEntryWithFallback {
  if (!species) {
    return {
      speciesId: 0,
      origin: 'Species data not found.',
      goRelevance: '',
      battleTip: '',
      easterEgg: '',
      goDifference: '',
      evolutionCost: '',
      shinyRate: '',
      isAutoGenerated: true,
    };
  }

  const writtenLore = LORE_BY_SPECIES_ID.get(species.id);
  if (writtenLore) {
    return { ...writtenLore, isAutoGenerated: false };
  }

  const maxStat = Math.max(species.baseAttack, species.baseDefense, species.baseStamina);
  let battleRole = 'versatil';
  if (maxStat === species.baseAttack) battleRole = 'ofensivo (ATK)';
  else if (maxStat === species.baseDefense) battleRole = 'defensivo (DEF)';
  else battleRole = 'tanque (STA)';

  const candyEstimate = species.id <= 151 ? 50 : 125;

  return {
    speciesId: species.id,
    origin: `Um Pokemon do tipo ${species.types.join('/')} da Geracao ${species.generation}. Seu nome e ${species.name}.`,
    goRelevance: `Tem ATK base ${species.baseAttack}, DEF ${species.baseDefense} e STA ${species.baseStamina}. E mais ${battleRole}.`,
    battleTip: `Seu melhor atributo e ${maxStat} (${battleRole}). Use moves que aproveitem seu typing ${species.types.join('/')}.`,
    easterEgg: `Foi introduzido na Geracao ${species.generation}. Complete a Pokedex para mais informacoes.`,
    goDifference: 'Consulte fontes da comunidade como PvPoke e PoGo API para analises detalhadas de moveset e ranking.',
    evolutionCost: `Aproximadamente ${candyEstimate} candy para evolucoes. Buddy 3km/candy.`,
    shinyRate: 'Shiny rate padrao (~1/500). Consulte eventos ativos para chances aumentadas.',
    isAutoGenerated: true,
  };
}
