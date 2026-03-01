// ============================================================
// Character Registry — Central store for all characters
// ============================================================
// O(1) indexed lookups by region, species, and family tree.
// Maintains a living set for fast alive/dead partitioning.

import type { Character, CharacterId, SpeciesId, RegionId, FamilyTreeId } from '../types.js';

export class CharacterRegistry {
  private characters: Map<CharacterId, Character> = new Map();

  // --- Indexes ---
  private byRegion: Map<RegionId, Set<CharacterId>> = new Map();
  private bySpecies: Map<SpeciesId, Set<CharacterId>> = new Map();
  private byFamilyTree: Map<FamilyTreeId, Set<CharacterId>> = new Map();
  private livingSet: Set<CharacterId> = new Set();

  // --- Index maintenance helpers ---

  private addToIndex<K>(index: Map<K, Set<CharacterId>>, key: K, id: CharacterId): void {
    let set = index.get(key);
    if (!set) {
      set = new Set();
      index.set(key, set);
    }
    set.add(id);
  }

  private removeFromIndex<K>(index: Map<K, Set<CharacterId>>, key: K, id: CharacterId): void {
    const set = index.get(key);
    if (set) {
      set.delete(id);
      if (set.size === 0) index.delete(key);
    }
  }

  private indexCharacter(character: Character): void {
    this.addToIndex(this.byRegion, character.regionId, character.id);
    this.addToIndex(this.bySpecies, character.speciesId, character.id);
    this.addToIndex(this.byFamilyTree, character.familyTreeId, character.id);
    if (character.isAlive) this.livingSet.add(character.id);
  }

  private unindexCharacter(character: Character): void {
    this.removeFromIndex(this.byRegion, character.regionId, character.id);
    this.removeFromIndex(this.bySpecies, character.speciesId, character.id);
    this.removeFromIndex(this.byFamilyTree, character.familyTreeId, character.id);
    this.livingSet.delete(character.id);
  }

  // --- Resolve a set of IDs to Character[] ---

  private resolve(ids: Set<CharacterId> | undefined): Character[] {
    if (!ids) return [];
    const result: Character[] = [];
    for (const id of ids) {
      const c = this.characters.get(id);
      if (c) result.push(c);
    }
    return result;
  }

  // --- Public API ---

  /** Register a character */
  add(character: Character): void {
    this.characters.set(character.id, character);
    this.indexCharacter(character);
  }

  /** Get a character by ID */
  get(id: CharacterId): Character | undefined {
    return this.characters.get(id);
  }

  /** Remove a character from the registry (does not mark as dead) */
  remove(id: CharacterId): boolean {
    const character = this.characters.get(id);
    if (character) {
      this.unindexCharacter(character);
      this.characters.delete(id);
      return true;
    }
    return false;
  }

  /** Get all characters */
  getAll(): Character[] {
    return Array.from(this.characters.values());
  }

  /** Get all living characters — O(living count) */
  getLiving(): Character[] {
    return this.resolve(this.livingSet);
  }

  /** Get all dead characters */
  getDead(): Character[] {
    const result: Character[] = [];
    for (const c of this.characters.values()) {
      if (!c.isAlive) result.push(c);
    }
    return result;
  }

  /** Get all characters by species — O(1) index lookup */
  getBySpecies(speciesId: SpeciesId): Character[] {
    return this.resolve(this.bySpecies.get(speciesId));
  }

  /** Get living characters by species — O(species count) */
  getLivingBySpecies(speciesId: SpeciesId): Character[] {
    const ids = this.bySpecies.get(speciesId);
    if (!ids) return [];
    const result: Character[] = [];
    for (const id of ids) {
      const c = this.characters.get(id);
      if (c?.isAlive) result.push(c);
    }
    return result;
  }

  /** Get living characters in a region — O(1) index lookup + filter */
  getByRegion(regionId: RegionId): Character[] {
    const ids = this.byRegion.get(regionId);
    if (!ids) return [];
    const result: Character[] = [];
    for (const id of ids) {
      const c = this.characters.get(id);
      if (c?.isAlive) result.push(c);
    }
    return result;
  }

  /** Get all characters in a family tree — O(1) index lookup */
  getByFamilyTree(treeId: FamilyTreeId): Character[] {
    return this.resolve(this.byFamilyTree.get(treeId));
  }

  /** Move a character to a new region, maintaining indexes */
  moveRegion(characterId: CharacterId, newRegionId: RegionId): void {
    const character = this.characters.get(characterId);
    if (!character) return;
    this.removeFromIndex(this.byRegion, character.regionId, characterId);
    character.regionId = newRegionId;
    this.addToIndex(this.byRegion, newRegionId, characterId);
  }

  /** Mark a character as dead, maintaining indexes */
  markDead(characterId: CharacterId, tick: number, cause: string): void {
    const character = this.characters.get(characterId);
    if (!character || !character.isAlive) return;
    character.isAlive = false;
    character.diedAtTick = tick;
    character.causeOfDeath = cause;
    this.livingSet.delete(characterId);
  }

  /** Get living descendants of a character */
  getLivingDescendants(characterId: CharacterId): Character[] {
    const result: Character[] = [];
    const visited = new Set<CharacterId>();

    const walk = (id: CharacterId) => {
      if (visited.has(id)) return;
      visited.add(id);

      const char = this.characters.get(id);
      if (!char) return;

      for (const childId of char.childIds) {
        const child = this.characters.get(childId);
        if (child) {
          if (child.isAlive) result.push(child);
          walk(childId);
        }
      }
    };

    walk(characterId);
    return result;
  }

  /** Total count */
  get size(): number {
    return this.characters.size;
  }

  /** Living count — O(1) */
  get livingCount(): number {
    return this.livingSet.size;
  }

  /** Clear all characters and indexes */
  clear(): void {
    this.characters.clear();
    this.byRegion.clear();
    this.bySpecies.clear();
    this.byFamilyTree.clear();
    this.livingSet.clear();
  }
}

/** Singleton character registry — will be replaced by WorldContext */
export let characterRegistry = new CharacterRegistry();

/** @internal Bridge: install a WorldContext-owned instance */
export function _installCharacterRegistry(instance: CharacterRegistry): void { characterRegistry = instance; }
