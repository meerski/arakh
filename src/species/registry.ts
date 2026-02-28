// ============================================================
// Character Registry — Central store for all characters
// ============================================================

import type { Character, CharacterId, SpeciesId, RegionId, FamilyTreeId } from '../types.js';

export class CharacterRegistry {
  private characters: Map<CharacterId, Character> = new Map();

  /** Register a character */
  add(character: Character): void {
    this.characters.set(character.id, character);
  }

  /** Get a character by ID */
  get(id: CharacterId): Character | undefined {
    return this.characters.get(id);
  }

  /** Remove a character from the registry (does not mark as dead) */
  remove(id: CharacterId): boolean {
    return this.characters.delete(id);
  }

  /** Get all characters */
  getAll(): Character[] {
    return Array.from(this.characters.values());
  }

  /** Get all living characters */
  getLiving(): Character[] {
    return this.getAll().filter(c => c.isAlive);
  }

  /** Get all dead characters */
  getDead(): Character[] {
    return this.getAll().filter(c => !c.isAlive);
  }

  /** Get characters by species */
  getBySpecies(speciesId: SpeciesId): Character[] {
    return this.getAll().filter(c => c.speciesId === speciesId);
  }

  /** Get living characters by species */
  getLivingBySpecies(speciesId: SpeciesId): Character[] {
    return this.getAll().filter(c => c.isAlive && c.speciesId === speciesId);
  }

  /** Get characters in a region */
  getByRegion(regionId: RegionId): Character[] {
    return this.getAll().filter(c => c.isAlive && c.regionId === regionId);
  }

  /** Get characters in a family tree */
  getByFamilyTree(treeId: FamilyTreeId): Character[] {
    return this.getAll().filter(c => c.familyTreeId === treeId);
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

  /** Living count */
  get livingCount(): number {
    let count = 0;
    for (const c of this.characters.values()) {
      if (c.isAlive) count++;
    }
    return count;
  }

  /** Clear all characters */
  clear(): void {
    this.characters.clear();
  }
}

/** Singleton character registry */
export const characterRegistry = new CharacterRegistry();
