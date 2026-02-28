// ============================================================
// Language Barriers
// ============================================================

import type { Character, SpeciesId } from '../types.js';
import { speciesRegistry } from '../species/species.js';

/** Check if two characters can communicate */
export function canCommunicate(a: Character, b: Character): {
  canTalk: boolean;
  clarity: number; // 0-1, how well they understand each other
} {
  // Same species: full communication
  if (a.speciesId === b.speciesId) {
    return { canTalk: true, clarity: 1.0 };
  }

  // Check if they share genus (related species may partially understand)
  const speciesA = speciesRegistry.get(a.speciesId);
  const speciesB = speciesRegistry.get(b.speciesId);

  if (speciesA && speciesB) {
    if (speciesA.taxonomy.genus === speciesB.taxonomy.genus) {
      return { canTalk: true, clarity: 0.5 };
    }
    if (speciesA.taxonomy.family === speciesB.taxonomy.family) {
      return { canTalk: true, clarity: 0.2 };
    }
  }

  // Check if either character has learned cross-species communication
  const aKnows = a.knowledge.some(k => k.topic === 'language' && k.detail === b.speciesId);
  const bKnows = b.knowledge.some(k => k.topic === 'language' && k.detail === a.speciesId);

  if (aKnows && bKnows) return { canTalk: true, clarity: 0.7 };
  if (aKnows || bKnows) return { canTalk: true, clarity: 0.3 };

  return { canTalk: false, clarity: 0 };
}
