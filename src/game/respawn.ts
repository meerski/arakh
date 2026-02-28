// ============================================================
// Death and Respawn Logic
// ============================================================

import type { Character, PlayerId, SpeciesId } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';

export interface RespawnResult {
  type: 'descendant' | 'new_lineage';
  speciesId: SpeciesId;
  characterId: string | null; // Existing descendant to continue as, or null for new
}

/** Determine respawn outcome when a player's character dies */
export function determineRespawn(
  deadCharacter: Character,
  livingDescendants: Character[],
): RespawnResult {
  // Priority: continue as a living descendant
  if (livingDescendants.length > 0) {
    // Pick the healthiest descendant
    const best = livingDescendants
      .sort((a, b) => b.health - a.health)[0];
    return {
      type: 'descendant',
      speciesId: best.speciesId,
      characterId: best.id,
    };
  }

  // No descendants: lineage extinction → respawn as random species
  const extant = speciesRegistry.getExtant();
  if (extant.length === 0) {
    throw new Error('No extant species available for respawn');
  }

  const newSpecies = worldRNG.pick(extant);
  return {
    type: 'new_lineage',
    speciesId: newSpecies.id,
    characterId: null,
  };
}
