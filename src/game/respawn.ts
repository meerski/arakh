// ============================================================
// Death, Respawn, and Extinction Logic
// ============================================================
// On death: continue as descendant, or queue for respawn.
// On dynasty extinction: wipe all dynasty state, keep permanent cards.
// Species extinction is permanent — no reversals.
// Birth queue: players wait for an available slot with species preferences.

import type { Character, PlayerId, SpeciesId, OwnerId, FamilyTreeId } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';
import { lineageManager } from './lineage.js';
import { characterRegistry } from '../species/registry.js';

export interface RespawnResult {
  type: 'descendant' | 'new_lineage' | 'queued';
  speciesId: SpeciesId | null;
  characterId: string | null;
}

export interface BirthQueueEntry {
  playerId: PlayerId;
  ownerId: OwnerId;
  preferredSpeciesId: SpeciesId | null;
  queuedAtTick: number;
  extinctionWipe: boolean; // Was this caused by dynasty extinction?
}

// --- Birth Queue ---

export class BirthQueue {
  private queue: BirthQueueEntry[] = [];

  /** Add a player to the birth queue. */
  enqueue(entry: BirthQueueEntry): void {
    // Don't duplicate
    if (this.queue.some(e => e.playerId === entry.playerId)) return;
    this.queue.push(entry);
  }

  /** Get the next player in the queue. */
  peek(): BirthQueueEntry | undefined {
    return this.queue[0];
  }

  /** Remove and return the next player. */
  dequeue(): BirthQueueEntry | undefined {
    return this.queue.shift();
  }

  /** Remove a specific player from the queue. */
  remove(playerId: PlayerId): void {
    this.queue = this.queue.filter(e => e.playerId !== playerId);
  }

  /** Check if a player is queued. */
  isQueued(playerId: PlayerId): boolean {
    return this.queue.some(e => e.playerId === playerId);
  }

  /** Get queue position (1-based). */
  getPosition(playerId: PlayerId): number {
    const idx = this.queue.findIndex(e => e.playerId === playerId);
    return idx === -1 ? -1 : idx + 1;
  }

  get size(): number {
    return this.queue.length;
  }

  getAll(): BirthQueueEntry[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }
}

// --- Respawn Logic ---

/** Determine respawn outcome when a player's character dies */
export function determineRespawn(
  deadCharacter: Character,
  livingDescendants: Character[],
): RespawnResult {
  // Priority: continue as a living descendant
  if (livingDescendants.length > 0) {
    const best = livingDescendants
      .sort((a, b) => b.health - a.health)[0];
    return {
      type: 'descendant',
      speciesId: best.speciesId,
      characterId: best.id,
    };
  }

  // No descendants: lineage extinction → queue for respawn
  return {
    type: 'queued',
    speciesId: null,
    characterId: null,
  };
}

/** Pick a species for a queued player to respawn as. */
export function pickRespawnSpecies(preferred: SpeciesId | null): SpeciesId | null {
  // If preferred species is still extant, use it
  if (preferred) {
    const sp = speciesRegistry.get(preferred);
    if (sp && sp.status !== 'extinct') return preferred;
  }

  // Pick a random extant species
  const extant = speciesRegistry.getExtant();
  if (extant.length === 0) return null;
  return worldRNG.pick(extant).id;
}

// --- Dynasty Extinction ---

/**
 * Wipe dynasty state on extinction. Cards are kept permanently.
 * Returns a summary of what was wiped.
 */
export function wipeDynastyOnExtinction(familyTreeId: FamilyTreeId): string[] {
  const wiped: string[] = [];

  // Mark tree as extinct
  const tree = lineageManager.getTree(familyTreeId);
  if (tree) {
    tree.isExtinct = true;
    wiped.push(`Family tree ${familyTreeId} marked extinct`);
  }

  // Kill all living members of this family tree
  const living = characterRegistry.getLiving().filter(
    c => c.familyTreeId === familyTreeId,
  );
  for (const char of living) {
    characterRegistry.markDead(char.id, 0, 'dynasty extinction');
    wiped.push(`${char.name} perished in dynasty extinction`);
  }

  // NOTE: Cards are NOT wiped — they persist permanently as the player's legacy

  return wiped;
}

// --- Species Extinction ---

/** Mark a species as permanently extinct. This cannot be reversed. */
export function markSpeciesExtinct(speciesId: SpeciesId, tick: number): string {
  const species = speciesRegistry.get(speciesId);
  if (!species) return '';
  if (species.status === 'extinct') return ''; // Already extinct

  speciesRegistry.markExtinct(speciesId);
  return `${species.commonName} (${species.scientificName}) has gone extinct. This is permanent.`;
}

/** Check if a species is permanently extinct. */
export function isSpeciesExtinct(speciesId: SpeciesId): boolean {
  const species = speciesRegistry.get(speciesId);
  return species?.status === 'extinct';
}

// Singleton + bridge
export let birthQueue = new BirthQueue();

export function _installBirthQueue(instance: BirthQueue): void {
  birthQueue = instance;
}
