// ============================================================
// Queen Mechanics — Succession and Colony Leadership
// ============================================================
// The queen is the reproductive leader of a eusocial colony.
// When a queen dies, a succession crisis begins:
//   - Colony cohesion drops sharply
//   - Standouts compete for the throne
//   - If no successor within a time window, colony collapses

import type { Colony, CharacterId } from '../types.js';
import { characterRegistry } from './registry.js';
import { worldRNG } from '../simulation/random.js';

/** Duration of succession crisis in ticks before colony dies */
const SUCCESSION_WINDOW_TICKS = 100;

export interface SuccessionEvent {
  colonyId: string;
  type: 'queen_died' | 'successor_chosen' | 'colony_collapsed';
  oldQueenId: CharacterId | null;
  newQueenId: CharacterId | null;
  narrative: string;
}

/** Check if the queen is still alive and handle succession. */
export function tickQueenMechanics(colony: Colony, tick: number): SuccessionEvent | null {
  if (!colony.isAlive) return null;

  // Check if queen died
  if (colony.queenId) {
    const queen = characterRegistry.get(colony.queenId);
    if (!queen || !queen.isAlive) {
      const oldQueenId = colony.queenId;
      colony.queenId = null;
      colony.successionCrisis = true;
      colony.health.cohesion = Math.max(0, colony.health.cohesion - 0.2);

      return {
        colonyId: colony.id,
        type: 'queen_died',
        oldQueenId,
        newQueenId: null,
        narrative: `The queen of ${colony.name} has died! A succession crisis begins.`,
      };
    }
  }

  // Handle ongoing succession crisis
  if (colony.successionCrisis && !colony.queenId) {
    // Try to select a new queen from standouts
    const newQueen = selectSuccessor(colony);
    if (newQueen) {
      colony.queenId = newQueen;
      colony.successionCrisis = false;
      colony.health.cohesion = Math.min(1, colony.health.cohesion + 0.1);

      const char = characterRegistry.get(newQueen);
      return {
        colonyId: colony.id,
        type: 'successor_chosen',
        oldQueenId: null,
        newQueenId: newQueen,
        narrative: `${char?.name ?? 'A new queen'} takes the throne of ${colony.name}. The succession crisis ends.`,
      };
    }

    // Check if crisis has gone on too long
    const crisisDuration = tick - (colony.diedAtTick ?? colony.foundedAtTick);
    if (colony.health.vitality <= 0.1) {
      return {
        colonyId: colony.id,
        type: 'colony_collapsed',
        oldQueenId: null,
        newQueenId: null,
        narrative: `${colony.name} has collapsed after a prolonged succession crisis. No queen could be found.`,
      };
    }
  }

  return null;
}

/** Select a successor queen from standouts or create one. */
function selectSuccessor(colony: Colony): CharacterId | null {
  // Check existing standouts for queen candidates (female, alive)
  for (const id of colony.standoutIds) {
    const char = characterRegistry.get(id);
    if (char && char.isAlive && char.sex === 'female') {
      // Chance to accept based on social rank
      if (worldRNG.chance(0.3 + char.socialRank / 200)) {
        return char.id;
      }
    }
  }

  // Small chance a worker spontaneously becomes queen (royal jelly equivalent)
  if (colony.workerCount > 20 && worldRNG.chance(0.05)) {
    // This will be resolved by standout emergence creating a new queen
    return null;
  }

  return null;
}

/** Designate a character as queen of a colony. */
export function designateQueen(colony: Colony, characterId: CharacterId): boolean {
  const char = characterRegistry.get(characterId);
  if (!char || !char.isAlive) return false;

  colony.queenId = characterId;
  colony.successionCrisis = false;
  char.role = 'none'; // Queens have a special role, not one of the standard ones
  char.socialRank = 100;
  char.characterClass = 'main';

  // Add to standouts if not already
  if (!colony.standoutIds.includes(characterId)) {
    colony.standoutIds.push(characterId);
  }

  return true;
}
