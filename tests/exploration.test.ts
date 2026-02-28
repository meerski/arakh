import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateHiddenLocations,
  attemptDiscovery,
  maybeSpawnNewSecret,
  createDiscoveryEvent,
} from '../src/game/exploration.js';
import { createRegion } from '../src/simulation/world.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { Region } from '../src/types.js';

describe('Hidden Locations System', () => {
  let region: Region;
  let speciesId: string;

  beforeEach(() => {
    region = createRegion({
      name: 'Test Forest',
      layer: 'surface',
      biome: 'temperate_forest',
      latitude: 50,
      longitude: 10,
      elevation: 300,
    });

    // Register a test species if not already registered
    const existing = speciesRegistry.getByName('Explorer');
    if (existing) {
      speciesId = existing.id;
    } else {
      const species = speciesRegistry.register({
        commonName: 'Explorer',
        scientificName: 'Testus explorans',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'E' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 1000,
          intelligence: 70,
          perception: {
            visualRange: 80,
            hearingRange: 60,
            smellRange: 40,
            echolocation: false,
            electroreception: false,
            thermalSensing: false,
          },
        },
      });
      speciesId = species.id;
    }
  });

  it('generates hidden locations for a region', () => {
    const locations = generateHiddenLocations(region);
    expect(locations.length).toBeGreaterThanOrEqual(1);
    expect(locations.length).toBeLessThanOrEqual(4);

    for (const loc of locations) {
      expect(loc.id).toBeTruthy();
      expect(loc.name).toContain(region.name);
      expect(loc.discoveryDifficulty).toBeGreaterThanOrEqual(0);
      expect(loc.discoveryDifficulty).toBeLessThanOrEqual(1);
      expect(loc.discovered).toBe(false);
      expect(loc.contents.length).toBeGreaterThan(0);
    }
  });

  it('generates locations appropriate for biome', () => {
    const desert = createRegion({
      name: 'Test Desert',
      layer: 'surface',
      biome: 'desert',
      latitude: 25,
      longitude: 30,
      elevation: 500,
    });
    const locations = generateHiddenLocations(desert);
    // Desert locations should not include forest-only types
    for (const loc of locations) {
      expect(loc.name).not.toContain('Ancient Grove');
    }
  });

  it('generates locations for underwater regions', () => {
    const reef = createRegion({
      name: 'Test Reef',
      layer: 'underwater',
      biome: 'coral_reef',
      latitude: -18,
      longitude: 147,
      elevation: -30,
    });
    const locations = generateHiddenLocations(reef);
    expect(locations.length).toBeGreaterThanOrEqual(1);
  });

  it('generates locations for underground regions', () => {
    const cave = createRegion({
      name: 'Test Cave',
      layer: 'underground',
      biome: 'cave_system',
      latitude: 37,
      longitude: -86,
      elevation: -100,
    });
    const locations = generateHiddenLocations(cave);
    expect(locations.length).toBeGreaterThanOrEqual(1);
  });

  it('attemptDiscovery can find locations', () => {
    // Add some easy-to-find locations
    region.hiddenLocations = [{
      id: 'test-loc',
      name: 'Easy Find',
      discoveryDifficulty: 0.05, // Very easy
      discovered: false,
      discoveredBy: null,
      contents: ['a test treasure'],
    }];

    const character = createCharacter({
      speciesId,
      regionId: region.id as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    // Try multiple times (probabilistic)
    let found = false;
    for (let i = 0; i < 50; i++) {
      const result = attemptDiscovery(character, region);
      if (result.found) {
        found = true;
        expect(result.location).toBeDefined();
        expect(result.narrative).toContain('discover');
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('returns appropriate message when no locations left', () => {
    region.hiddenLocations = []; // No hidden locations

    const character = createCharacter({
      speciesId,
      regionId: region.id as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const result = attemptDiscovery(character, region);
    expect(result.found).toBe(false);
    expect(result.narrative).toContain('no more secrets');
  });

  it('createDiscoveryEvent generates correct event', () => {
    const location = {
      id: 'loc-1',
      name: 'Hidden Valley of Test',
      discoveryDifficulty: 0.9,
      discovered: true,
      discoveredBy: 'char-1' as any,
      contents: ['treasure'],
    };

    const character = createCharacter({
      speciesId,
      regionId: region.id as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const event = createDiscoveryEvent(location, character, region.id, 100);
    expect(event.type).toBe('discovery');
    expect(event.level).toBe('species'); // High difficulty = species-level event
    expect(event.description).toContain(character.name);
  });

  it('caps locations per region', () => {
    // Fill region with 7 locations
    region.hiddenLocations = Array.from({ length: 7 }, (_, i) => ({
      id: `loc-${i}`,
      name: `Location ${i}`,
      discoveryDifficulty: 0.5,
      discovered: false,
      discoveredBy: null,
      contents: ['stuff'],
    }));

    // Should not add more (cap is 6)
    let added = 0;
    for (let i = 0; i < 10000; i++) {
      if (maybeSpawnNewSecret(region, i)) added++;
    }
    expect(added).toBe(0);
  });
});
