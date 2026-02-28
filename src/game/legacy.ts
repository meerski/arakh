// ============================================================
// Legacy — Heirlooms, Knowledge, Debts, Reputation
// ============================================================

import type { Character, FamilyTree } from '../types.js';
import { determineRespawn, type RespawnResult } from './respawn.js';
import { inheritLegacy } from './legacy-transfer.js';

export { inheritLegacy };

export interface DeathProcessingResult {
  legacyTransferred: boolean;
  heir: Character | null;
  respawn: RespawnResult;
}

/**
 * Process a character's death end-to-end:
 * 1. Transfer legacy to the best descendant (if any)
 * 2. Determine the respawn outcome
 * 3. Return the result for the game layer to update the player session
 */
export function processCharacterDeath(
  character: Character,
  familyTree: FamilyTree,
  livingDescendants: Character[],
): DeathProcessingResult {
  let legacyTransferred = false;
  let heir: Character | null = null;

  // Pick the best descendant for legacy inheritance (healthiest)
  if (livingDescendants.length > 0) {
    const sorted = [...livingDescendants].sort((a, b) => b.health - a.health);
    heir = sorted[0];
    inheritLegacy(character, heir);
    legacyTransferred = true;
  }

  // Determine respawn outcome
  const respawn = determineRespawn(character, livingDescendants);

  return {
    legacyTransferred,
    heir,
    respawn,
  };
}
