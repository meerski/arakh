// ============================================================
// Species Discovery System
// ============================================================
// Agents discover new species through observation and interaction.
// Species knowledge is per-character — you only know what you've seen.

import type { Character, SpeciesId, WorldEvent, RegionId } from '../types.js';
import { speciesRegistry } from './species.js';
import { worldRNG } from '../simulation/random.js';
import { getGeneValue } from './character.js';

/** A record of a character's knowledge about a species */
export interface SpeciesObservation {
  speciesId: SpeciesId;
  firstSeenTick: number;
  observationCount: number;
  knowledgeLevel: number;  // 0-1, increases with repeated observations
  traits: string[];        // Discovered trait descriptions (narrative, not stats)
}

/** Per-character species knowledge store */
const speciesKnowledge: Map<string, Map<SpeciesId, SpeciesObservation>> = new Map();

function getCharacterKnowledge(characterId: string): Map<SpeciesId, SpeciesObservation> {
  let knowledge = speciesKnowledge.get(characterId);
  if (!knowledge) {
    knowledge = new Map();
    speciesKnowledge.set(characterId, knowledge);
  }
  return knowledge;
}

/**
 * Process a species encounter — character observes a species.
 * Returns a narrative description and whether this is a first discovery.
 */
export function observeSpecies(
  character: Character,
  speciesId: SpeciesId,
  tick: number,
): { isFirstSighting: boolean; narrative: string; observation: SpeciesObservation } {
  const species = speciesRegistry.get(speciesId);
  if (!species) {
    return {
      isFirstSighting: false,
      narrative: 'You notice an unfamiliar creature, but it vanishes before you can study it.',
      observation: { speciesId, firstSeenTick: tick, observationCount: 0, knowledgeLevel: 0, traits: [] },
    };
  }

  const knowledge = getCharacterKnowledge(character.id);
  const existing = knowledge.get(speciesId);

  if (existing) {
    // Repeated observation — deepen knowledge
    existing.observationCount++;
    const perceptionBonus = getGeneValue(character, 'curiosity') / 200;
    existing.knowledgeLevel = Math.min(1, existing.knowledgeLevel + 0.05 + perceptionBonus);

    // Maybe discover a new trait
    const newTrait = maybeDiscoverTrait(species, existing, character);
    if (newTrait) existing.traits.push(newTrait);

    return {
      isFirstSighting: false,
      narrative: `You observe the ${species.commonName} more carefully. ${newTrait ? `You notice: ${newTrait}` : 'Nothing new reveals itself.'}`,
      observation: existing,
    };
  }

  // First sighting
  const observation: SpeciesObservation = {
    speciesId,
    firstSeenTick: tick,
    observationCount: 1,
    knowledgeLevel: 0.1,
    traits: [describeFirstImpression(species)],
  };
  knowledge.set(speciesId, observation);

  return {
    isFirstSighting: true,
    narrative: `You encounter a creature you have never seen before: the ${species.commonName}. ${observation.traits[0]}`,
    observation,
  };
}

/** Generate a first-impression description based on species traits */
function describeFirstImpression(species: ReturnType<typeof speciesRegistry.get> & {}): string {
  const { traits } = species;
  const parts: string[] = [];

  if (traits.size > 80) parts.push('It is enormous');
  else if (traits.size > 40) parts.push('It is a sizeable creature');
  else if (traits.size < 10) parts.push('It is tiny');
  else parts.push('It is a modest-sized creature');

  if (traits.canFly) parts.push('with wings');
  if (traits.aquatic) parts.push('that seems at home in water');
  if (traits.nocturnal) parts.push('with eyes adapted to darkness');

  return parts.join(' ') + '.';
}

/** Probabilistically discover a trait through observation */
function maybeDiscoverTrait(
  species: ReturnType<typeof speciesRegistry.get> & {},
  observation: SpeciesObservation,
  character: Character,
): string | null {
  const curiosity = getGeneValue(character, 'curiosity') / 100;
  const intelligence = getGeneValue(character, 'intelligence') / 100;

  // Chance improves with curiosity, intelligence, and observation count
  const chance = 0.1 * curiosity + 0.05 * intelligence + 0.02 * observation.observationCount;
  if (!worldRNG.chance(Math.min(0.4, chance))) return null;

  const { traits } = species;
  const possibleTraits: string[] = [];

  // Only include traits not yet discovered
  const known = new Set(observation.traits);

  if (!known.has('diet') && traits.diet) {
    possibleTraits.push(`It seems to be a ${traits.diet}`);
  }
  if (!known.has('social') && traits.socialStructure !== 'solitary') {
    possibleTraits.push(`It lives in a ${traits.socialStructure}`);
  }
  if (!known.has('speed') && traits.speed > 60) {
    possibleTraits.push('It can move with impressive speed');
  }
  if (!known.has('strength') && traits.strength > 60) {
    possibleTraits.push('It appears physically powerful');
  }
  if (!known.has('intelligence') && traits.intelligence > 50) {
    possibleTraits.push('It shows signs of notable intelligence');
  }

  if (possibleTraits.length === 0) return null;
  return worldRNG.pick(possibleTraits);
}

/**
 * Create a world event for a first species discovery.
 */
export function createSpeciesDiscoveryEvent(
  character: Character,
  speciesId: SpeciesId,
  regionId: RegionId,
  tick: number,
): WorldEvent {
  const species = speciesRegistry.get(speciesId);
  const name = species?.commonName ?? 'an unknown creature';

  return {
    id: crypto.randomUUID(),
    type: 'discovery',
    level: 'personal',
    regionIds: [regionId],
    description: `${character.name} has made first contact with the ${name}!`,
    tick,
    effects: [{
      type: 'species_discovery',
      speciesId,
      magnitude: 0.3,
    }],
    resolved: true,
  };
}

/** Get all species a character knows about */
export function getKnownSpecies(characterId: string): SpeciesObservation[] {
  const knowledge = speciesKnowledge.get(characterId);
  if (!knowledge) return [];
  return Array.from(knowledge.values());
}

/** Reset all species knowledge (for testing) */
export function resetSpeciesKnowledge(): void {
  speciesKnowledge.clear();
}
