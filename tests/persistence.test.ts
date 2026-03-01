import { describe, it, expect, beforeEach } from 'vitest';
import { PersistenceLayer } from '../src/data/persistence.js';
import { createWorldContext, installWorldContext } from '../src/context.js';
import { createWorld, createGameTime } from '../src/simulation/world.js';
import { createEcosystemState, addFoodWebRelation } from '../src/simulation/ecosystem.js';
import { createRegion } from '../src/simulation/world.js';
import { createCharacter } from '../src/species/character.js';
import { seedTaxonomy } from '../src/data/taxonomy/seed.js';
import { seedMammals } from '../src/data/taxonomy/mammals.js';
import type { WorldContext } from '../src/context.js';
import type { SpeciesId, RegionId, FamilyTreeId } from '../src/types.js';

describe('PersistenceLayer', () => {
  let ctx: WorldContext;
  let persistence: PersistenceLayer;

  beforeEach(() => {
    ctx = createWorldContext();
    installWorldContext(ctx);
    persistence = new PersistenceLayer();

    seedTaxonomy();
    seedMammals();
  });

  it('creates a snapshot from world state', () => {
    const world = createWorld('TestWorld');
    const ecosystem = createEcosystemState();

    const region = createRegion({
      name: 'TestForest',
      layer: 'surface',
      biome: 'temperate_forest',
      latitude: 45,
      longitude: 10,
      elevation: 200,
    });
    world.regions.set(region.id, region);
    world.time = createGameTime(100);

    const snapshot = persistence.createSnapshot(world, ecosystem, ctx);

    expect(snapshot.version).toBe(2);
    expect(snapshot.tick).toBe(100);
    expect(snapshot.world.name).toBe('TestWorld');
    expect(snapshot.regions).toHaveLength(1);
    expect(snapshot.regions[0].name).toBe('TestForest');
  });

  it('round-trips world state through snapshot', () => {
    const world = createWorld('RoundTrip');
    const ecosystem = createEcosystemState();

    // Add a region
    const region = createRegion({
      name: 'Savanna',
      layer: 'surface',
      biome: 'savanna',
      latitude: -5,
      longitude: 30,
      elevation: 800,
    });
    world.regions.set(region.id, region);
    world.time = createGameTime(500);
    world.era = { name: 'Age of Beasts', startTick: 200, dominantSpecies: null };

    // Add ecosystem data
    const sp1 = 'species-1' as SpeciesId;
    const sp2 = 'species-2' as SpeciesId;
    addFoodWebRelation(ecosystem, sp1, sp2, 0.1);
    ecosystem.carryingCapacity.set(region.id, 5000);

    // Add a character
    const species = ctx.species.getAll()[0];
    if (species) {
      const char = createCharacter({
        speciesId: species.id,
        regionId: region.id,
        familyTreeId: 'tree-1' as FamilyTreeId,
        tick: 10,
      });
      ctx.characters.add(char);
    }

    // Create snapshot
    const snapshot = persistence.createSnapshot(world, ecosystem, ctx);

    // Create fresh context for hydration
    const ctx2 = createWorldContext();
    installWorldContext(ctx2);
    seedTaxonomy();
    seedMammals();

    const world2 = createWorld('Fresh');
    const eco2 = createEcosystemState();

    // Hydrate
    const resumeTick = persistence.hydrate(snapshot, world2, eco2, ctx2);

    expect(resumeTick).toBe(500);
    expect(world2.name).toBe('RoundTrip');
    expect(world2.era.name).toBe('Age of Beasts');
    expect(world2.regions.size).toBe(1);
    expect(world2.regions.values().next().value?.name).toBe('Savanna');
    expect(eco2.foodWeb).toHaveLength(1);
    expect(eco2.carryingCapacity.get(region.id)).toBe(5000);

    if (species) {
      expect(ctx2.characters.livingCount).toBe(1);
    }
  });

  it('handles empty world snapshot', () => {
    const world = createWorld('Empty');
    const ecosystem = createEcosystemState();

    const snapshot = persistence.createSnapshot(world, ecosystem, ctx);
    expect(snapshot.characters).toHaveLength(0);
    expect(snapshot.regions).toHaveLength(0);
    expect(snapshot.familyTrees).toHaveLength(0);
  });

  it('serializes character loyalties (Map) correctly', () => {
    const world = createWorld('LoyaltyTest');
    const ecosystem = createEcosystemState();

    const region = createRegion({
      name: 'Plains',
      layer: 'surface',
      biome: 'grassland',
      latitude: 20,
      longitude: 0,
      elevation: 100,
    });
    world.regions.set(region.id, region);

    const species = ctx.species.getAll()[0];
    if (!species) return;

    const char = createCharacter({
      speciesId: species.id,
      regionId: region.id,
      familyTreeId: 'tree-2' as FamilyTreeId,
      tick: 0,
    });
    char.loyalties.set('faction-1', 0.8);
    char.loyalties.set('faction-2', 0.3);
    ctx.characters.add(char);

    const snapshot = persistence.createSnapshot(world, ecosystem, ctx);

    // Hydrate into fresh context
    const ctx2 = createWorldContext();
    installWorldContext(ctx2);
    seedTaxonomy();
    seedMammals();

    const world2 = createWorld('Fresh');
    const eco2 = createEcosystemState();
    persistence.hydrate(snapshot, world2, eco2, ctx2);

    const restored = ctx2.characters.get(char.id);
    expect(restored).toBeDefined();
    expect(restored!.loyalties).toBeInstanceOf(Map);
    expect(restored!.loyalties.get('faction-1')).toBe(0.8);
    expect(restored!.loyalties.get('faction-2')).toBe(0.3);
  });
});
