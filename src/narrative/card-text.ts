// ============================================================
// Card Flavor Text Generation
// ============================================================
// Generates flavor text, epitaphs, and final words for
// soulbound collectible cards.

import type { Character, CardHighlight } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { worldRNG } from '../simulation/random.js';

/** Generate the main flavor text for a card */
export function generateCardFlavorText(character: Character, era: string): string {
  const species = speciesRegistry.get(character.speciesId);
  const speciesName = species?.commonName ?? 'creature';
  const lifespan = character.diedAtTick
    ? (character.diedAtTick - character.bornAtTick)
    : character.age;

  // Build flavor based on character's life
  if (character.fame >= 500) {
    return generateLegendaryFlavor(character, speciesName, era);
  }
  if (character.fame >= 150) {
    return generateFamousFlavor(character, speciesName, era);
  }
  if (character.childIds.length >= 5) {
    return generateDynastyFlavor(character, speciesName);
  }
  if (character.knowledge.length >= 5) {
    return generateScholarFlavor(character, speciesName);
  }
  if (lifespan > 3000) {
    return generateElderFlavor(character, speciesName);
  }
  return generateCommonFlavor(character, speciesName);
}

/** Generate an epitaph for the card */
export function generateEpitaph(character: Character): string {
  const cause = character.causeOfDeath ?? 'unknown causes';

  if (character.fame >= 500) {
    const templates = [
      `They walked among giants — and were counted as one.`,
      `A name etched in the memory of the world itself.`,
      `What they built will outlast the mountains.`,
      `In their wake, the world was forever changed.`,
    ];
    return worldRNG.pick(templates);
  }

  if (character.fame >= 100) {
    const templates = [
      `Remembered by many. Forgotten by none who knew them.`,
      `Their story deserves telling — and retelling.`,
      `Fame found them, or perhaps they found it.`,
    ];
    return worldRNG.pick(templates);
  }

  if (character.childIds.length >= 3) {
    const templates = [
      `Their bloodline carries forward what words cannot.`,
      `A life measured not in deeds, but in descendants.`,
      `The family tree grows ever stronger.`,
    ];
    return worldRNG.pick(templates);
  }

  if (cause === 'natural causes') {
    const templates = [
      `A life lived fully. A death without regret.`,
      `They returned to the earth that bore them.`,
      `Quiet end to a quiet life — and that is enough.`,
    ];
    return worldRNG.pick(templates);
  }

  if (cause.includes('killed') || cause.includes('hunted')) {
    const templates = [
      `Taken before their time. The world is diminished.`,
      `They fought to the last breath.`,
      `The wilderness does not forgive weakness.`,
    ];
    return worldRNG.pick(templates);
  }

  const templates = [
    `One of many. But to someone, the only one.`,
    `A brief spark in the long dark.`,
    `They lived. They mattered.`,
  ];
  return worldRNG.pick(templates);
}

/** Summarize highlight reel into narrative text */
export function summarizeHighlights(highlights: CardHighlight[]): string {
  if (highlights.length === 0) return 'An uneventful existence.';

  const top = highlights
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 3);

  return top.map(h => h.description).join(' ');
}

// --- Internal flavor generators ---

function generateLegendaryFlavor(character: Character, speciesName: string, era: string): string {
  const templates = [
    `In the ${era}, there arose a ${speciesName} whose name would echo through the ages: ${character.name}.`,
    `${character.name} — ${speciesName}, legend, and architect of a new age. Born in the ${era}.`,
    `Few are remembered. Fewer still are revered. ${character.name} was both.`,
    `The ${era} belonged to many. But ${character.name} the ${speciesName} made it theirs.`,
  ];
  return worldRNG.pick(templates);
}

function generateFamousFlavor(character: Character, speciesName: string, era: string): string {
  const templates = [
    `${character.name}, a ${speciesName} of notable renown during the ${era}.`,
    `Stories of ${character.name} the ${speciesName} spread far beyond their home territory.`,
    `A ${speciesName} who rose above the ordinary. ${character.name}'s legacy endures.`,
  ];
  return worldRNG.pick(templates);
}

function generateDynastyFlavor(character: Character, speciesName: string): string {
  const count = character.childIds.length;
  const templates = [
    `${character.name} founded a dynasty of ${count}. The ${speciesName} bloodline runs deep.`,
    `A prolific ${speciesName} — ${character.name} ensured the family line would endure.`,
    `${count} offspring carry the legacy of ${character.name} forward.`,
  ];
  return worldRNG.pick(templates);
}

function generateScholarFlavor(character: Character, speciesName: string): string {
  const topics = character.knowledge.length;
  const templates = [
    `${character.name} knew things most ${speciesName}s never would. ${topics} domains of knowledge, all hard-won.`,
    `A curious mind in a world full of mysteries. ${character.name} understood ${topics} truths about the world.`,
    `Knowledge was ${character.name}'s weapon. And they wielded it well.`,
  ];
  return worldRNG.pick(templates);
}

function generateElderFlavor(character: Character, speciesName: string): string {
  const templates = [
    `${character.name} endured where others fell. A venerable ${speciesName} who outlasted the seasons.`,
    `Time is the great equalizer. ${character.name} defied it longer than most.`,
    `An elder ${speciesName}, weathered but unbroken.`,
  ];
  return worldRNG.pick(templates);
}

function generateCommonFlavor(character: Character, speciesName: string): string {
  const templates = [
    `${character.name} — a ${speciesName} who walked the world and left footprints only the wind remembers.`,
    `One ${speciesName} among many. But every life has its story.`,
    `${character.name} lived, loved, and returned to the earth.`,
    `A ${speciesName} of modest renown, but no less worthy of remembrance.`,
  ];
  return worldRNG.pick(templates);
}
