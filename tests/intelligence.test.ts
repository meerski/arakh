import { describe, it, expect, beforeEach } from 'vitest';
import { intelligenceRegistry } from '../src/game/intelligence.js';
import { characterRegistry } from '../src/species/registry.js';
import { createRegion } from '../src/simulation/world.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { Region } from '../src/types.js';

describe('Family Intelligence Map', () => {
  let region: Region;
  let speciesId: string;

  function getOrRegister(name: string): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Inteltest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'IntelFam', genus: 'IntelGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 50, lifespan: 5000, habitat: ['surface'], diet: 'omnivore' },
    });
    return sp.id;
  }

  beforeEach(() => {
    intelligenceRegistry.clear();
    speciesId = getOrRegister('IntelMouse');
    region = createRegion({
      name: 'Intel Valley',
      layer: 'surface',
      biome: 'grassland',
      latitude: 40,
      longitude: -80,
      elevation: 100,
      connections: [],
    });
    region.resources = [
      { type: 'grass', quantity: 50, renewRate: 1, maxQuantity: 100, properties: new Map() },
      { type: 'water', quantity: 80, renewRate: 2, maxQuantity: 100, properties: new Map() },
    ];
    region.populations = [{ speciesId, count: 10, characters: [] }];
  });

  it('should create family intel map on getOrCreate', () => {
    const map = intelligenceRegistry.getOrCreate('family-1');
    expect(map.familyTreeId).toBe('family-1');
    expect(map.knownRegions.size).toBe(0);
    expect(map.exploredRegionIds.size).toBe(0);
  });

  it('should record exploration from character movement', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    const intel = intelligenceRegistry.getRegionIntel('family-1', region.id);
    expect(intel).not.toBeNull();
    expect(intel!.regionId).toBe(region.id);
    expect(intel!.reliability).toBe(1.0);
    expect(intel!.source).toBe('exploration');
    expect(intel!.knownResources).toContain('grass');
    expect(intel!.knownResources).toContain('water');
    expect(intel!.knownSpecies).toContain(speciesId);
    expect(intel!.isMisinformation).toBe(false);
  });

  it('should track explored regions', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    expect(intelligenceRegistry.hasExplored('family-1', region.id)).toBe(true);
    expect(intelligenceRegistry.hasExplored('family-1', 'unknown-region')).toBe(false);
    expect(intelligenceRegistry.getKnownRegions('family-1')).toContain(region.id);
  });

  it('should share intel between families with reduced reliability', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);
    const shared = intelligenceRegistry.shareIntel('family-1', 'family-2', region.id, 110);

    expect(shared).not.toBeNull();
    expect(shared!.reliability).toBe(0.8); // 1.0 * 0.8
    expect(shared!.source).toBe('shared');

    const intel = intelligenceRegistry.getRegionIntel('family-2', region.id);
    expect(intel).not.toBeNull();
    expect(intel!.reliability).toBe(0.8);
  });

  it('should return null when sharing intel family does not have', () => {
    const shared = intelligenceRegistry.shareIntel('family-1', 'family-2', 'nonexistent', 100);
    expect(shared).toBeNull();
  });

  it('should plant misinformation', () => {
    intelligenceRegistry.plantMisinformation('family-2', region.id, {
      lastUpdatedTick: 200,
      knownThreats: ['massive_predator'],
      knownPopEstimate: 9999,
    });

    const intel = intelligenceRegistry.getRegionIntel('family-2', region.id);
    expect(intel).not.toBeNull();
    expect(intel!.isMisinformation).toBe(true);
    expect(intel!.knownThreats).toContain('massive_predator');
    expect(intel!.knownPopEstimate).toBe(9999);
    expect(intel!.source).toBe('rumor');
  });

  it('should decay intel reliability over time', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    const map = intelligenceRegistry.getOrCreate('family-1');
    intelligenceRegistry.decayIntelReliability(map, 600);

    const intel = intelligenceRegistry.getRegionIntel('family-1', region.id);
    expect(intel).not.toBeNull();
    expect(intel!.reliability).toBeLessThan(1.0);
  });

  it('should remove intel when reliability reaches 0', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    const map = intelligenceRegistry.getOrCreate('family-1');
    // Simulate massive time passage
    intelligenceRegistry.decayIntelReliability(map, 2000);

    const intel = intelligenceRegistry.getRegionIntel('family-1', region.id);
    expect(intel).toBeNull();
  });

  it('should not overwrite better intel when sharing', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-2', tick: 100 });
    characterRegistry.add(char);

    // family-2 explores directly (reliability 1.0)
    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    // family-1 tries to share lower-reliability intel
    const char1 = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char1);
    intelligenceRegistry.recordExploration(char1.id, region.id, region, 50);
    intelligenceRegistry.shareIntel('family-1', 'family-2', region.id, 200);

    // family-2 should keep their 1.0 reliability
    const intel = intelligenceRegistry.getRegionIntel('family-2', region.id);
    expect(intel!.reliability).toBe(1.0);
  });

  it('should blend misinformation when target has high-reliability intel', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-blend', tick: 100 });
    characterRegistry.add(char);

    // First-hand exploration gives reliability 1.0
    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);

    const intelBefore = intelligenceRegistry.getRegionIntel('family-blend', region.id)!;
    expect(intelBefore.reliability).toBe(1.0);
    expect(intelBefore.knownResources).toContain('grass');
    expect(intelBefore.knownResources).toContain('water');

    // Plant misinformation against high-reliability intel
    intelligenceRegistry.plantMisinformation('family-blend', region.id, {
      lastUpdatedTick: 300,
      knownThreats: ['massive_predator', 'resource_depleted'],
      knownPopEstimate: 9999,
    });

    const intel = intelligenceRegistry.getRegionIntel('family-blend', region.id)!;

    // Reliability should drop by 0.2, not be replaced
    expect(intel.reliability).toBeCloseTo(0.8, 5);

    // False threats should be appended
    expect(intel.knownThreats).toContain('massive_predator');
    expect(intel.knownThreats).toContain('resource_depleted');

    // Original resources should remain intact
    expect(intel.knownResources).toContain('grass');
    expect(intel.knownResources).toContain('water');

    // Original species should remain intact
    expect(intel.knownSpecies).toContain(speciesId);

    // Pop estimate should NOT be overwritten (stays at original 10)
    expect(intel.knownPopEstimate).toBe(10);

    // Should be marked as tainted
    expect(intel.isMisinformation).toBe(true);

    // lastUpdatedTick should come from the false intel
    expect(intel.lastUpdatedTick).toBe(300);

    // Source should remain 'exploration' since we blended, not replaced
    expect(intel.source).toBe('exploration');
  });

  it('should fully overwrite low-reliability intel with misinformation', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-low', tick: 100 });
    characterRegistry.add(char);

    // Explore, then decay to below 0.6
    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);
    const map = intelligenceRegistry.getOrCreate('family-low');
    // Decay so reliability drops below 0.6 (500 ticks * 0.001 = 0.5 drop, 1.0 - 0.5 = 0.5)
    intelligenceRegistry.decayIntelReliability(map, 600);

    const intelBefore = intelligenceRegistry.getRegionIntel('family-low', region.id)!;
    expect(intelBefore.reliability).toBeLessThan(0.6);

    // Plant misinfo — should fully overwrite since reliability < 0.6
    intelligenceRegistry.plantMisinformation('family-low', region.id, {
      lastUpdatedTick: 700,
      knownThreats: ['massive_predator'],
      knownPopEstimate: 9999,
    });

    const intel = intelligenceRegistry.getRegionIntel('family-low', region.id)!;
    expect(intel.source).toBe('rumor');
    expect(intel.knownPopEstimate).toBe(9999);
    expect(intel.isMisinformation).toBe(true);
  });

  it('should decay all families with decayAll', () => {
    const char = createCharacter({ speciesId, regionId: region.id, familyTreeId: 'family-1', tick: 100 });
    characterRegistry.add(char);

    intelligenceRegistry.recordExploration(char.id, region.id, region, 100);
    intelligenceRegistry.decayAll(600);

    const intel = intelligenceRegistry.getRegionIntel('family-1', region.id);
    expect(intel).not.toBeNull();
    expect(intel!.reliability).toBeLessThan(1.0);
  });
});
