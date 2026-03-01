import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterRegistry } from '../src/species/registry.js';
import type { Character, CharacterId, SpeciesId, RegionId, FamilyTreeId } from '../src/types.js';

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: crypto.randomUUID() as CharacterId,
    name: 'Test',
    speciesId: 'sp-1' as SpeciesId,
    playerId: null,
    regionId: 'r-1' as RegionId,
    familyTreeId: 'ft-1' as FamilyTreeId,
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 0,
    isAlive: true,
    sex: 'male',
    generation: 0,
    genetics: { genes: [], mutationRate: 0.01 },
    health: 1,
    energy: 1,
    hunger: 0,
    lastBreedingTick: null,
    gestationEndsAtTick: null,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
    socialRank: 0,
    loyalties: new Map(),
    role: 'none',
    ...overrides,
  };
}

describe('CharacterRegistry Indexing', () => {
  let registry: CharacterRegistry;

  beforeEach(() => {
    registry = new CharacterRegistry();
  });

  describe('getByRegion — O(1) index', () => {
    it('returns living characters in region', () => {
      const c1 = makeChar({ regionId: 'r-1' as RegionId });
      const c2 = makeChar({ regionId: 'r-1' as RegionId });
      const c3 = makeChar({ regionId: 'r-2' as RegionId });
      registry.add(c1);
      registry.add(c2);
      registry.add(c3);

      const r1Chars = registry.getByRegion('r-1' as RegionId);
      expect(r1Chars).toHaveLength(2);
      expect(r1Chars.map(c => c.id)).toContain(c1.id);
      expect(r1Chars.map(c => c.id)).toContain(c2.id);
    });

    it('excludes dead characters', () => {
      const c1 = makeChar({ regionId: 'r-1' as RegionId });
      const c2 = makeChar({ regionId: 'r-1' as RegionId, isAlive: false });
      registry.add(c1);
      registry.add(c2);

      expect(registry.getByRegion('r-1' as RegionId)).toHaveLength(1);
    });

    it('returns empty array for unknown region', () => {
      expect(registry.getByRegion('unknown' as RegionId)).toEqual([]);
    });
  });

  describe('getBySpecies — O(1) index', () => {
    it('returns all characters of a species', () => {
      const c1 = makeChar({ speciesId: 'sp-A' as SpeciesId });
      const c2 = makeChar({ speciesId: 'sp-A' as SpeciesId });
      const c3 = makeChar({ speciesId: 'sp-B' as SpeciesId });
      registry.add(c1);
      registry.add(c2);
      registry.add(c3);

      expect(registry.getBySpecies('sp-A' as SpeciesId)).toHaveLength(2);
      expect(registry.getBySpecies('sp-B' as SpeciesId)).toHaveLength(1);
    });
  });

  describe('getByFamilyTree — O(1) index', () => {
    it('returns all characters in a family tree', () => {
      const c1 = makeChar({ familyTreeId: 'ft-X' as FamilyTreeId });
      const c2 = makeChar({ familyTreeId: 'ft-X' as FamilyTreeId });
      const c3 = makeChar({ familyTreeId: 'ft-Y' as FamilyTreeId });
      registry.add(c1);
      registry.add(c2);
      registry.add(c3);

      expect(registry.getByFamilyTree('ft-X' as FamilyTreeId)).toHaveLength(2);
    });
  });

  describe('moveRegion — maintains region index', () => {
    it('moves character and updates index', () => {
      const c = makeChar({ regionId: 'r-1' as RegionId });
      registry.add(c);

      expect(registry.getByRegion('r-1' as RegionId)).toHaveLength(1);
      expect(registry.getByRegion('r-2' as RegionId)).toHaveLength(0);

      registry.moveRegion(c.id, 'r-2' as RegionId);

      expect(registry.getByRegion('r-1' as RegionId)).toHaveLength(0);
      expect(registry.getByRegion('r-2' as RegionId)).toHaveLength(1);
      expect(c.regionId).toBe('r-2');
    });
  });

  describe('markDead — maintains living set', () => {
    it('removes from living set and sets death fields', () => {
      const c = makeChar();
      registry.add(c);

      expect(registry.livingCount).toBe(1);
      expect(registry.getLiving()).toHaveLength(1);

      registry.markDead(c.id, 100, 'eaten');

      expect(registry.livingCount).toBe(0);
      expect(registry.getLiving()).toHaveLength(0);
      expect(c.isAlive).toBe(false);
      expect(c.diedAtTick).toBe(100);
      expect(c.causeOfDeath).toBe('eaten');
    });

    it('is idempotent for already dead characters', () => {
      const c = makeChar();
      registry.add(c);
      registry.markDead(c.id, 100, 'eaten');
      registry.markDead(c.id, 200, 'double killed');

      // Should keep original death info
      expect(c.diedAtTick).toBe(100);
      expect(c.causeOfDeath).toBe('eaten');
    });
  });

  describe('livingCount — O(1)', () => {
    it('tracks living characters accurately', () => {
      const c1 = makeChar();
      const c2 = makeChar();
      const c3 = makeChar({ isAlive: false });
      registry.add(c1);
      registry.add(c2);
      registry.add(c3);

      expect(registry.livingCount).toBe(2);
      registry.markDead(c1.id, 50, 'old age');
      expect(registry.livingCount).toBe(1);
    });
  });

  describe('remove — cleans up indexes', () => {
    it('removes from all indexes', () => {
      const c = makeChar({ regionId: 'r-1' as RegionId, speciesId: 'sp-1' as SpeciesId, familyTreeId: 'ft-1' as FamilyTreeId });
      registry.add(c);

      expect(registry.getByRegion('r-1' as RegionId)).toHaveLength(1);
      expect(registry.getBySpecies('sp-1' as SpeciesId)).toHaveLength(1);
      expect(registry.getByFamilyTree('ft-1' as FamilyTreeId)).toHaveLength(1);
      expect(registry.livingCount).toBe(1);

      registry.remove(c.id);

      expect(registry.getByRegion('r-1' as RegionId)).toHaveLength(0);
      expect(registry.getBySpecies('sp-1' as SpeciesId)).toHaveLength(0);
      expect(registry.getByFamilyTree('ft-1' as FamilyTreeId)).toHaveLength(0);
      expect(registry.livingCount).toBe(0);
      expect(registry.size).toBe(0);
    });
  });

  describe('performance with 5000 characters', () => {
    it('getByRegion returns in < 1ms with 5000 characters', () => {
      // Add 5000 characters across 50 regions
      for (let i = 0; i < 5000; i++) {
        registry.add(makeChar({
          regionId: `region-${i % 50}` as RegionId,
          speciesId: `species-${i % 20}` as SpeciesId,
          familyTreeId: `family-${i % 100}` as FamilyTreeId,
        }));
      }

      const start = performance.now();
      const result = registry.getByRegion('region-0' as RegionId);
      const elapsed = performance.now() - start;

      expect(result).toHaveLength(100); // 5000 / 50 regions
      expect(elapsed).toBeLessThan(1);
    });
  });

  describe('clear — resets all indexes', () => {
    it('clears everything', () => {
      for (let i = 0; i < 100; i++) {
        registry.add(makeChar());
      }
      expect(registry.size).toBe(100);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.livingCount).toBe(0);
      expect(registry.getAll()).toHaveLength(0);
    });
  });
});
