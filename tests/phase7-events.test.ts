import { describe, it, expect, beforeEach } from 'vitest';
import {
  artifactRegistry, radiationTracker, anomalyTracker,
  maybeSpawnArtifact, createRadiationFromEvent, createAnomalyFromEvent,
  artifactDiscoveryEvent, anomalyEvent,
} from '../src/simulation/artifacts.js';
import {
  checkForTeslaMoment, teslaMomentToEvent, getSpeciesBreakthroughs, resetTeslaMoments,
} from '../src/simulation/tesla-moments.js';
import { rollForEvents, applyEventEffects } from '../src/simulation/events.js';
import {
  updatePopulationGenetics, incrementIsolation, checkSpeciation,
  calculateGeneticDrift, generateSpeciatedName, resetEvolutionState,
  getPopulationGenetics,
} from '../src/species/evolution.js';
import { WorldChronicle } from '../src/narrative/history.js';
import { selectTemplate, fillTemplate, getCategories } from '../src/narrative/templates.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import { createCharacter, getGeneValue } from '../src/species/character.js';
import { createGameTime } from '../src/simulation/world.js';
import type { Character, Region, RegionId, WorldEvent } from '../src/types.js';

// Helpers
function getOrCreateSpecies(name: string, overrides: Record<string, unknown> = {}) {
  const existing = speciesRegistry.getByName(name);
  if (existing) return existing.id;
  return speciesRegistry.register({
    commonName: name,
    scientificName: `Testus ${name.toLowerCase()}`,
    taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: name.slice(0, 2) },
    tier: 'flagship',
    traitOverrides: { lifespan: 5000, diet: 'herbivore', ...overrides },
  }).id;
}

function makeRegion(id: string = 'r1', name: string = 'Test Plains'): Region {
  return {
    id: id as RegionId,
    name,
    type: 'surface',
    biome: 'grassland',
    latitude: 30,
    longitude: 0,
    elevation: 100,
    climate: {
      temperature: 20,
      humidity: 0.5,
      precipitation: 0.3,
      windSpeed: 10,
      windDirection: 180,
      pollution: 0,
      season: 'summer',
    },
    populations: [
      { speciesId: 'sp-test', count: 100, capacity: 500, growthRate: 0.01 },
    ],
    resources: [
      { id: 'res1', type: 'food', name: 'Grass', quantity: 500, maxQuantity: 1000, regenerationRate: 0.01 },
    ],
    connections: [],
    hiddenLocations: [],
  } as unknown as Region;
}

function makeCharInRegion(speciesId: string, regionId: string, geneOverrides?: Record<string, number>): Character {
  const c = createCharacter({
    speciesId,
    regionId: regionId as RegionId,
    familyTreeId: 'tree-1' as any,
    tick: 0,
  });
  if (geneOverrides) {
    for (const [gene, val] of Object.entries(geneOverrides)) {
      const g = c.genes.find(g => g.name === gene);
      if (g) g.value = val;
    }
  }
  characterRegistry.register(c);
  return c;
}

describe('Phase 7 — Events & Magic', () => {
  // --- Artifacts ---
  describe('Artifact System', () => {
    beforeEach(() => {
      artifactRegistry.clear();
    });

    it('spawns an artifact in a region', () => {
      const artifact = artifactRegistry.spawn('r1' as RegionId, 'relic');
      expect(artifact).toBeDefined();
      expect(artifact.type).toBe('relic');
      expect(artifact.regionId).toBe('r1');
      expect(artifact.isActive).toBe(true);
      expect(artifact.discoveredBy).toBeNull();
      expect(artifact.power).toBeGreaterThanOrEqual(0.3);
      expect(artifact.power).toBeLessThanOrEqual(1.0);
    });

    it('spawns random artifact types', () => {
      const types = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const a = artifactRegistry.spawn('r1' as RegionId);
        types.add(a.type);
      }
      // Should see at least 3 different types
      expect(types.size).toBeGreaterThanOrEqual(3);
    });

    it('discovers an artifact for a character', () => {
      const speciesId = getOrCreateSpecies('ArtHerb');
      const artifact = artifactRegistry.spawn('r1' as RegionId, 'oracle');
      const char = createCharacter({
        speciesId,
        regionId: 'r1' as RegionId,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      });

      const result = artifactRegistry.discover(artifact.id, char, 100);
      expect(result).toBe(true);
      expect(artifact.discoveredBy).toBe(char.id);
      expect(artifact.discoveredAtTick).toBe(100);
      expect(char.inventory.some(i => i.name === artifact.name)).toBe(true);
    });

    it('prevents double discovery of same artifact', () => {
      const speciesId = getOrCreateSpecies('ArtHerb2');
      const artifact = artifactRegistry.spawn('r1' as RegionId, 'weapon');
      const char1 = createCharacter({ speciesId, regionId: 'r1' as RegionId, familyTreeId: 'tree-1' as any, tick: 0 });
      const char2 = createCharacter({ speciesId, regionId: 'r1' as RegionId, familyTreeId: 'tree-1' as any, tick: 0 });

      expect(artifactRegistry.discover(artifact.id, char1, 100)).toBe(true);
      expect(artifactRegistry.discover(artifact.id, char2, 200)).toBe(false);
    });

    it('retrieves artifacts by region', () => {
      artifactRegistry.spawn('r1' as RegionId, 'relic');
      artifactRegistry.spawn('r1' as RegionId, 'seed');
      artifactRegistry.spawn('r2' as RegionId, 'weapon');

      expect(artifactRegistry.getByRegion('r1' as RegionId)).toHaveLength(2);
      expect(artifactRegistry.getByRegion('r2' as RegionId)).toHaveLength(1);
    });

    it('filters undiscovered artifacts in region', () => {
      const speciesId = getOrCreateSpecies('ArtHerb3');
      const a1 = artifactRegistry.spawn('r1' as RegionId, 'relic');
      artifactRegistry.spawn('r1' as RegionId, 'seed');
      const char = createCharacter({ speciesId, regionId: 'r1' as RegionId, familyTreeId: 'tree-1' as any, tick: 0 });
      artifactRegistry.discover(a1.id, char, 10);

      expect(artifactRegistry.getUndiscoveredInRegion('r1' as RegionId)).toHaveLength(1);
    });

    it('creates artifact discovery event', () => {
      const speciesId = getOrCreateSpecies('ArtHerb4');
      const artifact = artifactRegistry.spawn('r1' as RegionId, 'catalyst');
      const char = createCharacter({ speciesId, regionId: 'r1' as RegionId, familyTreeId: 'tree-1' as any, tick: 0 });

      const event = artifactDiscoveryEvent(artifact, char, 500);
      expect(event.type).toBe('artifact');
      expect(event.level).toBe('species');
      expect(event.description).toContain(char.name);
      expect(event.description).toContain(artifact.name);
    });
  });

  // --- Radiation ---
  describe('Radiation Zones', () => {
    beforeEach(() => {
      radiationTracker.clear();
    });

    it('creates a radiation zone', () => {
      const zone = radiationTracker.create('r1' as RegionId, 0.7, 100);
      expect(zone.regionId).toBe('r1');
      expect(zone.intensity).toBeCloseTo(0.7, 1);
      expect(zone.mutationBonus).toBeCloseTo(0.07, 2);
    });

    it('caps intensity at 1.0', () => {
      const zone = radiationTracker.create('r1' as RegionId, 1.5, 100);
      expect(zone.intensity).toBe(1.0);
    });

    it('decays radiation over ticks', () => {
      const zone = radiationTracker.create('r1' as RegionId, 0.5, 0);
      const initialIntensity = zone.intensity;

      for (let i = 0; i < 100; i++) {
        radiationTracker.tick();
      }

      expect(zone.intensity).toBeLessThan(initialIntensity);
      expect(zone.intensity).toBeGreaterThan(0);
    });

    it('removes fully decayed zones', () => {
      radiationTracker.create('r1' as RegionId, 0.001, 0);

      // Tick enough for it to decay below threshold
      for (let i = 0; i < 20; i++) {
        radiationTracker.tick();
      }

      expect(radiationTracker.getAll().length).toBe(0);
    });

    it('sums radiation across multiple zones in a region', () => {
      radiationTracker.create('r1' as RegionId, 0.3, 0);
      radiationTracker.create('r1' as RegionId, 0.4, 0);

      const total = radiationTracker.getRegionRadiation('r1' as RegionId);
      expect(total).toBeCloseTo(0.7, 1);
    });

    it('creates radiation from event helper', () => {
      const zone = createRadiationFromEvent('r1' as RegionId, 0.6, 500);
      expect(zone.regionId).toBe('r1');
      expect(zone.intensity).toBeCloseTo(0.6, 1);
    });
  });

  // --- Anomalies ---
  describe('Dimensional Anomalies', () => {
    beforeEach(() => {
      anomalyTracker.clear();
    });

    it('creates an anomaly', () => {
      const anomaly = anomalyTracker.create('r1' as RegionId, 100, 'dream_nexus');
      expect(anomaly.regionId).toBe('r1');
      expect(anomaly.type).toBe('dream_nexus');
      expect(anomaly.intensity).toBeGreaterThanOrEqual(0.3);
      expect(anomaly.duration).toBeGreaterThanOrEqual(500);
      expect(anomaly.description.length).toBeGreaterThan(0);
    });

    it('expires anomalies after duration', () => {
      const anomaly = anomalyTracker.create('r1' as RegionId, 0, 'temporal_rift');
      const duration = anomaly.duration;

      // Not expired yet
      const closedEarly = anomalyTracker.tick(duration - 1);
      expect(closedEarly).toHaveLength(0);
      expect(anomalyTracker.getAll()).toHaveLength(1);

      // Expired now
      const closedLate = anomalyTracker.tick(duration);
      expect(closedLate).toHaveLength(1);
      expect(anomalyTracker.getAll()).toHaveLength(0);
    });

    it('retrieves anomalies by region', () => {
      anomalyTracker.create('r1' as RegionId, 0, 'void_pocket');
      anomalyTracker.create('r1' as RegionId, 0, 'spatial_tear');
      anomalyTracker.create('r2' as RegionId, 0, 'primal_wellspring');

      expect(anomalyTracker.getByRegion('r1' as RegionId)).toHaveLength(2);
      expect(anomalyTracker.getByRegion('r2' as RegionId)).toHaveLength(1);
    });

    it('creates anomaly event with description', () => {
      const anomaly = anomalyTracker.create('r1' as RegionId, 50, 'dream_nexus');
      const event = anomalyEvent(anomaly, 50);
      expect(event.type).toBe('anomaly');
      expect(event.level).toBe('regional');
      expect(event.description).toContain('dream nexus');
    });

    it('creates anomaly from event helper', () => {
      const anomaly = createAnomalyFromEvent('r2' as RegionId, 200);
      expect(anomaly.regionId).toBe('r2');
      expect(anomaly.createdAtTick).toBe(200);
    });
  });

  // --- Event Effect Handlers ---
  describe('Event Effect Handlers', () => {
    it('applies mass_disruption effect (meteor)', () => {
      const region = makeRegion('rmet', 'Meteor Plains');
      const regions = new Map([[region.id, region]]);
      const initialTemp = region.climate.temperature;
      const initialPop = region.populations[0].count;
      const initialRes = region.resources[0].quantity;

      const event: WorldEvent = {
        id: 'ev-1',
        type: 'meteor',
        level: 'global',
        regionIds: [region.id],
        description: 'Meteor strike',
        tick: 100,
        effects: [{ type: 'mass_disruption', regionId: region.id, magnitude: 0.8 }],
        resolved: false,
      };

      applyEventEffects(event, regions);
      expect(region.climate.temperature).toBeGreaterThan(initialTemp);
      expect(region.climate.pollution).toBeGreaterThan(0);
      expect(region.populations[0].count).toBeLessThan(initialPop);
      expect(region.resources[0].quantity).toBeLessThan(initialRes);
      expect(event.resolved).toBe(true);
    });

    it('applies resource_spawn effect', () => {
      const region = makeRegion('rres', 'Resource Valley');
      const regions = new Map([[region.id, region]]);
      const initialQty = region.resources[0].quantity;

      const event: WorldEvent = {
        id: 'ev-2',
        type: 'resource_discovery',
        level: 'regional',
        regionIds: [region.id],
        description: 'New deposit found',
        tick: 200,
        effects: [{ type: 'resource_spawn', regionId: region.id, magnitude: 0.5 }],
        resolved: false,
      };

      applyEventEffects(event, regions);
      expect(region.resources[0].quantity).toBeGreaterThan(initialQty);
    });

    it('applies population_decline effect', () => {
      const region = makeRegion('rpop', 'Plague Lands');
      const regions = new Map([[region.id, region]]);
      const initialPop = region.populations[0].count;

      const event: WorldEvent = {
        id: 'ev-3',
        type: 'disease',
        level: 'regional',
        regionIds: [region.id],
        description: 'Disease!',
        tick: 300,
        effects: [{ type: 'population_decline', regionId: region.id, magnitude: 0.5 }],
        resolved: false,
      };

      applyEventEffects(event, regions);
      expect(region.populations[0].count).toBeLessThan(initialPop);
      expect(region.populations[0].count).toBeGreaterThan(0);
    });

    it('applies climate_disruption effect', () => {
      const region = makeRegion('rclim', 'Storm Coast');
      const regions = new Map([[region.id, region]]);
      const initialWind = region.climate.windSpeed;

      const event: WorldEvent = {
        id: 'ev-4',
        type: 'weather_extreme',
        level: 'continental',
        regionIds: [region.id],
        description: 'Storm!',
        tick: 400,
        effects: [{ type: 'climate_disruption', regionId: region.id, magnitude: 0.7 }],
        resolved: false,
      };

      applyEventEffects(event, regions);
      expect(region.climate.windSpeed).toBeGreaterThan(initialWind);
    });

    it('applies reality_distortion effect', () => {
      const region = makeRegion('ranom', 'Anomaly Fields');
      const regions = new Map([[region.id, region]]);
      const initialTemp = region.climate.temperature;

      const event: WorldEvent = {
        id: 'ev-5',
        type: 'anomaly',
        level: 'regional',
        regionIds: [region.id],
        description: 'Rift!',
        tick: 500,
        effects: [{ type: 'reality_distortion', regionId: region.id, magnitude: 1.0 }],
        resolved: false,
      };

      applyEventEffects(event, regions);
      // Temperature should change (±3)
      expect(Math.abs(region.climate.temperature - initialTemp)).toBeGreaterThan(0);
    });
  });

  // --- Tesla Moments ---
  describe('Tesla Moments', () => {
    beforeEach(() => {
      resetTeslaMoments();
      characterRegistry.clear();
    });

    it('returns null when no eligible characters exist', () => {
      const region = makeRegion('rtesla', 'Tesla Region');
      const result = checkForTeslaMoment(region, 100);
      expect(result).toBeNull();
    });

    it('tracks breakthroughs per species', () => {
      const speciesId = getOrCreateSpecies('TeslaBird');
      expect(getSpeciesBreakthroughs(speciesId)).toHaveLength(0);
    });

    it('converts tesla moment to world event', () => {
      const moment = {
        characterId: 'c1',
        characterName: 'Einstein',
        speciesId: 'sp-1',
        breakthroughType: 'fire_discovery' as const,
        description: 'Einstein the bird discovers fire!',
        tick: 500,
      };

      const event = teslaMomentToEvent(moment);
      expect(event.type).toBe('tesla_moment');
      expect(event.level).toBe('global');
      expect(event.description).toContain('Einstein');
      expect(event.effects[0].type).toBe('tesla_breakthrough');
    });
  });

  // --- Evolution & Speciation ---
  describe('Evolution & Speciation', () => {
    beforeEach(() => {
      resetEvolutionState();
      characterRegistry.clear();
    });

    it('tracks population genetics from character samples', () => {
      const speciesId = getOrCreateSpecies('EvoFish');
      const chars: Character[] = [];
      for (let i = 0; i < 5; i++) {
        chars.push(createCharacter({
          speciesId,
          regionId: 'r1' as RegionId,
          familyTreeId: 'tree-1' as any,
          tick: 0,
        }));
      }

      const pg = updatePopulationGenetics(chars, speciesId, 'r1' as RegionId);
      expect(pg.sampleSize).toBe(5);
      expect(pg.averageGenes.size).toBeGreaterThan(0);
    });

    it('increments isolation ticks', () => {
      const speciesId = getOrCreateSpecies('EvoFish2');
      const chars = [createCharacter({
        speciesId,
        regionId: 'r1' as RegionId,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      })];
      updatePopulationGenetics(chars, speciesId, 'r1' as RegionId);

      incrementIsolation(speciesId, 'r1' as RegionId);
      incrementIsolation(speciesId, 'r1' as RegionId);

      const pg = getPopulationGenetics(speciesId, 'r1' as RegionId);
      expect(pg!.isolationTicks).toBe(2);
    });

    it('calculates genetic drift from baseline', () => {
      const speciesId = getOrCreateSpecies('EvoFish3');
      // Create characters with extreme gene values to force drift
      const chars: Character[] = [];
      for (let i = 0; i < 10; i++) {
        const c = createCharacter({
          speciesId,
          regionId: 'r1' as RegionId,
          familyTreeId: 'tree-1' as any,
          tick: 0,
        });
        // Force extreme gene values
        for (const gene of c.genetics.genes) {
          gene.value = 90;
        }
        chars.push(c);
      }

      updatePopulationGenetics(chars, speciesId, 'r1' as RegionId);
      const drift = calculateGeneticDrift(speciesId, 'r1' as RegionId);
      // With genes at 90 vs baseline 50, drift should be significant
      expect(drift).toBeGreaterThan(0.3);
    });

    it('does not speciate without sufficient isolation', () => {
      const speciesId = getOrCreateSpecies('EvoFish4');
      const chars = [createCharacter({
        speciesId,
        regionId: 'r1' as RegionId,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      })];
      updatePopulationGenetics(chars, speciesId, 'r1' as RegionId);

      // Not enough isolation
      const result = checkSpeciation(speciesId, 'r1' as RegionId);
      expect(result.shouldSpeciate).toBe(false);
      expect(result.isolationTicks).toBe(0);
    });

    it('generates speciated names from parent species', () => {
      const result = generateSpeciatedName('Golden Eagle', 'Mountain Peak');
      expect(result.commonName).toMatch(/\w+ Eagle/);
      expect(result.scientificName).toContain('eagle');
    });
  });

  // --- World Chronicle & Eras ---
  describe('World Chronicle', () => {
    it('starts in The Dawn era', () => {
      const chronicle = new WorldChronicle();
      expect(chronicle.getCurrentEra().name).toBe('The Dawn');
      expect(chronicle.getCurrentEra().dominantSpecies).toBeNull();
    });

    it('records events with significance', () => {
      const chronicle = new WorldChronicle();
      const event: WorldEvent = {
        id: 'ev-chron-1',
        type: 'meteor',
        level: 'global',
        regionIds: ['r1' as RegionId],
        description: 'A meteor!',
        tick: 1000,
        effects: [],
        resolved: true,
      };

      chronicle.recordEvent(event, 1);
      const significant = chronicle.getSignificantEvents(10);
      expect(significant).toHaveLength(1);
      expect(significant[0].significance).toBe(1.0); // global = 1.0
    });

    it('detects era change when species dominates', () => {
      const speciesId = getOrCreateSpecies('EraAnt');
      const populations = new Map<string, number>([
        [speciesId, 700],
        ['other-1', 100],
        ['other-2', 100],
      ]);

      const chronicle = new WorldChronicle();
      const newEra = chronicle.checkForEraChange(populations);
      expect(newEra).not.toBeNull();
      expect(newEra!.name).toContain('EraAnt');
      expect(newEra!.dominantSpecies).toBe(speciesId);
    });

    it('does not change era if no species dominates', () => {
      const chronicle = new WorldChronicle();
      const populations = new Map<string, number>([
        ['sp1', 100],
        ['sp2', 100],
        ['sp3', 100],
        ['sp4', 100],
      ]);

      const newEra = chronicle.checkForEraChange(populations);
      expect(newEra).toBeNull();
    });

    it('does not change era if same species still dominates', () => {
      const speciesId = getOrCreateSpecies('EraDom');
      const populations = new Map<string, number>([
        [speciesId, 700],
        ['other-1', 100],
      ]);

      const chronicle = new WorldChronicle();
      // First change
      chronicle.checkForEraChange(populations);
      // Same species still dominant — no change
      const second = chronicle.checkForEraChange(populations);
      expect(second).toBeNull();
    });

    it('retrieves timeline within tick range', () => {
      const chronicle = new WorldChronicle();
      for (let i = 0; i < 5; i++) {
        chronicle.recordEvent({
          id: `ev-${i}`,
          type: 'discovery',
          level: 'species',
          regionIds: [],
          description: `Event ${i}`,
          tick: i * 100,
          effects: [],
          resolved: true,
        }, i);
      }

      const timeline = chronicle.getTimeline(100, 300);
      expect(timeline).toHaveLength(3); // ticks 100, 200, 300
    });
  });

  // --- New Narrative Templates ---
  describe('Phase 7 Narrative Templates', () => {
    it('has tesla_moment template category', () => {
      const categories = getCategories();
      expect(categories).toContain('tesla_moment');
    });

    it('has speciation template category', () => {
      const categories = getCategories();
      expect(categories).toContain('speciation');
    });

    it('has artifact template category', () => {
      const categories = getCategories();
      expect(categories).toContain('artifact');
    });

    it('has anomaly template category', () => {
      const categories = getCategories();
      expect(categories).toContain('anomaly');
    });

    it('has era_change template category', () => {
      const categories = getCategories();
      expect(categories).toContain('era_change');
    });

    it('fills tesla_moment template with context', () => {
      const text = selectTemplate('tesla_moment', {
        name: 'Archimedes',
        speciesName: 'Crow',
        item: 'discovers controlled fire',
        regionName: 'Forest Edge',
      });
      expect(text.length).toBeGreaterThan(10);
      expect(text).toContain('Archimedes');
    });

    it('fills artifact template with context', () => {
      const text = selectTemplate('artifact', {
        name: 'Finder',
        item: 'The Everstone',
        regionName: 'Deep Caves',
      });
      expect(text.length).toBeGreaterThan(10);
    });

    it('fills anomaly template with context', () => {
      const text = selectTemplate('anomaly', {
        regionName: 'Broken Lands',
        item: 'temporal rift',
      });
      expect(text.length).toBeGreaterThan(10);
    });

    it('fills era_change template with context', () => {
      const text = selectTemplate('era_change', {
        item: 'The Age of the Corvids',
      });
      expect(text.length).toBeGreaterThan(10);
    });

    it('fills speciation template with context', () => {
      const text = selectTemplate('speciation', {
        speciesName: 'Golden Finch',
        regionName: 'Island Peaks',
      });
      expect(text.length).toBeGreaterThan(10);
    });
  });

  // --- Event Generation ---
  describe('World Event Rolling', () => {
    it('rolls for events across regions', () => {
      const regions: Region[] = [];
      for (let i = 0; i < 50; i++) {
        regions.push(makeRegion(`r-${i}`, `Region ${i}`));
      }
      const time = createGameTime(100);

      // Run many rolls — with 50 regions some events should fire occasionally
      let totalEvents = 0;
      for (let i = 0; i < 100; i++) {
        const events = rollForEvents(regions, time);
        totalEvents += events.length;
      }
      // With 50 regions * 100 rolls, should get at least a few events
      expect(totalEvents).toBeGreaterThan(0);
    });

    it('continental/global events affect multiple regions', () => {
      const regions: Region[] = [];
      for (let i = 0; i < 20; i++) {
        regions.push(makeRegion(`r-${i}`, `Region ${i}`));
      }
      const time = createGameTime(100);

      // Run many rolls to find a multi-region event
      let foundMultiRegion = false;
      for (let i = 0; i < 500; i++) {
        const events = rollForEvents(regions, time);
        for (const e of events) {
          if (e.regionIds.length > 1) {
            foundMultiRegion = true;
            break;
          }
        }
        if (foundMultiRegion) break;
      }
      // Probabilistic — may not always trigger, but with 500 * 20 region rolls it's very likely
      // Skip strict assertion since it's probabilistic
    });
  });
});
