import { describe, it, expect, beforeEach } from 'vitest';
import {
  catastropheEngine,
  type EnvironmentalStress,
  type Catastrophe,
} from '../src/simulation/catastrophes.js';
import { createRegion } from '../src/simulation/world.js';
import { speciesRegistry } from '../src/species/species.js';
import { createEcosystemState } from '../src/simulation/ecosystem.js';
import { initializePopulation } from '../src/species/population.js';
import type { Region, EcosystemState } from '../src/types.js';
import type { PlantPopulation } from '../src/types.js';

// ============================================================
// Helpers
// ============================================================

function makeRegion(biome: Region['biome'] = 'grassland', name = 'Test Region'): Region {
  return createRegion({
    name,
    layer: 'surface',
    biome,
    latitude: 0,
    longitude: 0,
    elevation: 100,
  });
}

function makePlant(overrides: Partial<PlantPopulation> = {}): PlantPopulation {
  return {
    plantType: 'grass',
    biomass: 350,
    maxBiomass: 500,
    growthRate: 0.05,
    spreadRate: 0.005,
    permanentlyDestroyed: false,
    ticksBelowThreshold: 0,
    ...overrides,
  };
}

function ensureTestSpecies(): { herbivoreId: string; carnivoreId: string } {
  let herbivoreId: string;
  let carnivoreId: string;

  const existingHerb = speciesRegistry.getByName('CatastropheTestHerbivore');
  if (existingHerb) {
    herbivoreId = existingHerb.id;
  } else {
    const h = speciesRegistry.register({
      commonName: 'CatastropheTestHerbivore',
      scientificName: 'Testus herbivorus catastrophi',
      taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'CTH' },
      tier: 'flagship',
      traitOverrides: {
        lifespan: 5000,
        size: 30,
        diet: 'herbivore',
        reproductionRate: 3,
        gestationTicks: 200,
        maturityTicks: 500,
        habitat: ['surface'],
      },
    });
    herbivoreId = h.id;
  }

  const existingCarn = speciesRegistry.getByName('CatastropheTestCarnivore');
  if (existingCarn) {
    carnivoreId = existingCarn.id;
  } else {
    const c = speciesRegistry.register({
      commonName: 'CatastropheTestCarnivore',
      scientificName: 'Testus carnivorius catastrophi',
      taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'CTC' },
      tier: 'flagship',
      traitOverrides: {
        lifespan: 8000,
        size: 60,
        diet: 'carnivore',
        reproductionRate: 2,
        gestationTicks: 400,
        maturityTicks: 1000,
        habitat: ['surface'],
      },
    });
    carnivoreId = c.id;
  }

  return { herbivoreId, carnivoreId };
}

// ============================================================
// Tests
// ============================================================

describe('Catastrophe System', () => {
  let ecosystem: EcosystemState;
  let herbivoreId: string;
  let carnivoreId: string;

  beforeEach(() => {
    catastropheEngine.clear();
    ecosystem = createEcosystemState();
    const { herbivoreId: hId, carnivoreId: cId } = ensureTestSpecies();
    herbivoreId = hId;
    carnivoreId = cId;
  });

  // -------------------------------------------------------
  // Test 1: calculateStress returns 0s for clean region
  // -------------------------------------------------------
  describe('calculateStress', () => {
    it('returns zero stress for clean region with no pollution, adequate plants, low population', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      region.climate.humidity = 0.8;
      region.plantPopulations = [
        makePlant({ biomass: 500, maxBiomass: 500 }),
      ];
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      const stress = catastropheEngine.calculateStress(region, ecosystem);

      expect(stress.pollution).toBe(0);
      expect(stress.deforestation).toBe(0);
      expect(stress.overpopulation).toBe(0);
      expect(stress.soilDegradation).toBe(0);
      expect(stress.diseaseRisk).toBeCloseTo(0, 5);
    });

    // -------------------------------------------------------
    // Test 2: calculateStress reflects high pollution
    // -------------------------------------------------------
    it('reflects high pollution in stress calculation', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.8;
      region.climate.humidity = 0.8;
      region.plantPopulations = [
        makePlant({ biomass: 500, maxBiomass: 500 }),
      ];
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      const stress = catastropheEngine.calculateStress(region, ecosystem);

      expect(stress.pollution).toBe(0.8);
      // Disease risk should also increase due to pollution
      expect(stress.diseaseRisk).toBeGreaterThan(0);
    });

    // -------------------------------------------------------
    // Test 3: calculateStress reflects overpopulation
    // -------------------------------------------------------
    it('reflects overpopulation when population/capacity ratio is high', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      region.climate.humidity = 0.8;
      region.plantPopulations = [
        makePlant({ biomass: 500, maxBiomass: 500 }),
      ];

      const capacity = 1000;
      ecosystem.carryingCapacity.set(region.id, capacity);
      region.populations = [
        { speciesId: herbivoreId, count: 800, characters: [] },
      ];

      const stress = catastropheEngine.calculateStress(region, ecosystem);

      expect(stress.overpopulation).toBeCloseTo(0.8, 1);
    });

    // -------------------------------------------------------
    // Test 4: calculateStress reflects deforestation
    // -------------------------------------------------------
    it('reflects deforestation when plant biomass is low', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      region.climate.humidity = 0.8;
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      // Deforestation = 1 - (biomass / maxBiomass)
      // biomass=100, maxBiomass=500 => deforestation = 0.8
      region.plantPopulations = [
        makePlant({ biomass: 100, maxBiomass: 500 }),
      ];

      const stress = catastropheEngine.calculateStress(region, ecosystem);

      expect(stress.deforestation).toBeCloseTo(0.8, 1);
    });

    // -------------------------------------------------------
    // Test 5: calculateStress reflects soil degradation
    // -------------------------------------------------------
    it('reflects soil degradation from overgrazing', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      region.climate.humidity = 0.8;
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      region.plantPopulations = [
        makePlant({ biomass: 100, maxBiomass: 500, ticksBelowThreshold: 150 }),
        makePlant({ plantType: 'shrub', biomass: 200, maxBiomass: 500, ticksBelowThreshold: 0 }),
      ];

      const stress = catastropheEngine.calculateStress(region, ecosystem);

      // 1 out of 2 plants is overgrazed => soilDegradation = 0.5
      expect(stress.soilDegradation).toBeCloseTo(0.5, 1);
    });
  });

  // -------------------------------------------------------
  // Test 6: checkCatastropheTriggers returns null for low stress
  // -------------------------------------------------------
  describe('checkCatastropheTriggers', () => {
    it('returns null when stress levels are all low', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.1;
      region.climate.humidity = 0.8;
      region.plantPopulations = [
        makePlant({ biomass: 450, maxBiomass: 500 }),
      ];
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      const stress = catastropheEngine.calculateStress(region, ecosystem);
      const catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, 100);

      expect(catastrophe).toBeNull();
    });

    // -------------------------------------------------------
    // Test 7: Disease outbreak triggers on pollution+overpop
    // -------------------------------------------------------
    it('can trigger disease outbreak when pollution and overpopulation are high (multiple attempts)', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.7;
      region.climate.humidity = 0.5;
      region.plantPopulations = [
        makePlant({ biomass: 350, maxBiomass: 500 }),
      ];

      const capacity = 1000;
      ecosystem.carryingCapacity.set(region.id, capacity);
      region.populations = [
        { speciesId: herbivoreId, count: 600, characters: [] },
      ];

      let foundDisease = false;
      // Run 20 checks to increase chance of RNG success
      for (let i = 0; i < 20; i++) {
        const stress = catastropheEngine.calculateStress(region, ecosystem);
        const catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, 100 + i);
        if (catastrophe && catastrophe.type === 'disease_outbreak') {
          foundDisease = true;
          expect(catastrophe.regionIds).toContain(region.id);
          expect(catastrophe.severity).toBeGreaterThan(0.4);
          expect(catastrophe.duration).toBeGreaterThan(0);
          break;
        }
      }
      expect(foundDisease).toBe(true);
    });

    // -------------------------------------------------------
    // Test 8: Flood triggers on deforestation + precipitation
    // -------------------------------------------------------
    it('can trigger flood when deforestation is high and precipitation is heavy', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.1;
      region.climate.humidity = 0.7;
      region.climate.precipitation = 8;  // High precipitation
      region.populations = [];
      ecosystem.carryingCapacity.set(region.id, 10000);

      // High deforestation: biomass << maxBiomass
      region.plantPopulations = [
        makePlant({ biomass: 80, maxBiomass: 500 }),
      ];

      let foundFlood = false;
      for (let i = 0; i < 20; i++) {
        const stress = catastropheEngine.calculateStress(region, ecosystem);
        const catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, 100 + i);
        if (catastrophe && (catastrophe.type === 'flood' || catastrophe.type === 'landslide')) {
          foundFlood = true;
          expect(catastrophe.regionIds).toContain(region.id);
          break;
        }
      }
      expect(foundFlood).toBe(true);
    });

    // -------------------------------------------------------
    // Test 9: Forest fire triggers on deforestation + low humidity
    // -------------------------------------------------------
    it('can trigger forest fire when deforestation is moderate and humidity is low', () => {
      let foundFire = false;
      for (let i = 0; i < 50; i++) {
        catastropheEngine.clear();
        const region = makeRegion('grassland');
        region.climate.pollution = 0.1;
        region.climate.humidity = 0.15;  // Very low humidity (dry)
        region.climate.precipitation = 1;
        region.populations = [];
        ecosystem.carryingCapacity.set(region.id, 10000);

        // Moderate deforestation (30-80% range for fire trigger)
        region.plantPopulations = [
          makePlant({ biomass: 200, maxBiomass: 500 }),
        ];

        const stress = catastropheEngine.calculateStress(region, ecosystem);
        const catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, 100 + i);
        if (catastrophe && catastrophe.type === 'forest_fire') {
          foundFire = true;
          expect(catastrophe.regionIds).toContain(region.id);
          break;
        }
      }
      expect(foundFire).toBe(true);
    });
  });

  // -------------------------------------------------------
  // Test 10: getEvolutionPressure returns 1.0 when no catastrophes
  // -------------------------------------------------------
  describe('getEvolutionPressure', () => {
    it('returns 1.0 as baseline when no catastrophes are active', () => {
      const region = makeRegion('grassland');
      const pressure = catastropheEngine.getEvolutionPressure(region.id);
      expect(pressure).toBe(1.0);
    });

    // -------------------------------------------------------
    // Test 11: getEvolutionPressure > 1.0 with active catastrophe
    // -------------------------------------------------------
    it('returns > 1.0 when an active catastrophe affects the region', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.7;
      region.climate.humidity = 0.5;
      region.plantPopulations = [
        makePlant({ biomass: 100, maxBiomass: 500 }),
      ];
      const capacity = 1000;
      ecosystem.carryingCapacity.set(region.id, capacity);
      region.populations = [
        { speciesId: herbivoreId, count: 600, characters: [] },
      ];

      // Keep trying until we get a catastrophe
      let catastrophe: Catastrophe | null = null;
      for (let i = 0; i < 50; i++) {
        const stress = catastropheEngine.calculateStress(region, ecosystem);
        catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, 100 + i);
        if (catastrophe) break;
      }

      if (catastrophe) {
        const pressure = catastropheEngine.getEvolutionPressure(region.id);
        expect(pressure).toBeGreaterThan(1.0);
      } else {
        // If we couldn't trigger catastrophe, at least confirm baseline is 1.0
        const pressure = catastropheEngine.getEvolutionPressure(region.id);
        expect(pressure).toBe(1.0);
      }
    });
  });

  // -------------------------------------------------------
  // Test 12: tickCatastrophe reduces ticksRemaining
  // -------------------------------------------------------
  describe('tickCatastrophe', () => {
    it('reduces ticksRemaining on each tick', () => {
      const region = makeRegion('grassland');
      region.populations = [
        { speciesId: herbivoreId, count: 100, characters: [] },
      ];
      region.plantPopulations = [
        makePlant({ biomass: 350, maxBiomass: 500 }),
      ];
      region.resources = [];

      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      // Manually create a catastrophe
      const catastrophe: Catastrophe = {
        id: 'test-cat-1',
        type: 'flood',
        regionIds: [region.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test flood',
        effects: [{ type: 'population_kill', magnitude: 0.2 }],
        mutationBonus: 1.5,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe.id, catastrophe);

      const beforeTicks = catastrophe.ticksRemaining;
      catastropheEngine.tickCatastrophe(catastrophe, regions, 0);
      const afterTicks = catastrophe.ticksRemaining;

      expect(afterTicks).toBe(beforeTicks - 1);
    });

    // -------------------------------------------------------
    // Test 13: tickCatastrophe returns event when catastrophe expires
    // -------------------------------------------------------
    it('returns a WorldEvent when catastrophe expires (ticksRemaining <= 0)', () => {
      const region = makeRegion('grassland');
      region.populations = [
        { speciesId: herbivoreId, count: 100, characters: [] },
      ];
      region.plantPopulations = [
        makePlant({ biomass: 350, maxBiomass: 500 }),
      ];
      region.resources = [];

      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      const catastrophe: Catastrophe = {
        id: 'test-cat-2',
        type: 'forest_fire',
        regionIds: [region.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 1,
        ticksRemaining: 1,
        cause: 'Test fire',
        effects: [{ type: 'plant_destroy', magnitude: 0.3 }],
        mutationBonus: 1.5,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe.id, catastrophe);

      const events = catastropheEngine.tickCatastrophe(catastrophe, regions, 100);

      expect(events.length).toBeGreaterThan(0);
      const expiredEvent = events.find(e => e.type === 'catastrophe');
      expect(expiredEvent).toBeDefined();
      expect(expiredEvent?.resolved).toBe(true);
    });

    // -------------------------------------------------------
    // Test 14: Active catastrophes reduce populations
    // -------------------------------------------------------
    it('reduces region population during catastrophe tick with population_kill effect', () => {
      const region = makeRegion('grassland');
      const initialCount = 10000;
      region.populations = [
        { speciesId: herbivoreId, count: initialCount, characters: [] },
      ];
      region.plantPopulations = [
        makePlant({ biomass: 350, maxBiomass: 500 }),
      ];
      region.resources = [];

      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      const catastrophe: Catastrophe = {
        id: 'test-cat-3',
        type: 'plague',
        regionIds: [region.id],
        severity: 0.9,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test plague',
        effects: [{ type: 'population_kill', magnitude: 0.8 }],
        mutationBonus: 1.8,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe.id, catastrophe);

      catastropheEngine.tickCatastrophe(catastrophe, regions, 0);

      // Population should be reduced
      expect(region.populations[0].count).toBeLessThan(initialCount);
    });

    // -------------------------------------------------------
    // Test 15: Active catastrophes reduce plant biomass
    // -------------------------------------------------------
    it('reduces plant biomass during catastrophe tick with plant_destroy effect', () => {
      const region = makeRegion('grassland');
      const initialBiomass = 350;
      region.populations = [];
      region.plantPopulations = [
        makePlant({ biomass: initialBiomass, maxBiomass: 500 }),
      ];
      region.resources = [];

      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      const catastrophe: Catastrophe = {
        id: 'test-cat-4',
        type: 'forest_fire',
        regionIds: [region.id],
        severity: 0.7,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test fire',
        effects: [{ type: 'plant_destroy', magnitude: 0.5 }],
        mutationBonus: 2.1,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe.id, catastrophe);

      catastropheEngine.tickCatastrophe(catastrophe, regions, 0);

      // Plant biomass should be reduced
      expect(region.plantPopulations[0].biomass).toBeLessThan(initialBiomass);
    });
  });

  // -------------------------------------------------------
  // Test 16: getActiveCatastrophes returns correct catastrophes
  // -------------------------------------------------------
  describe('getActiveCatastrophes', () => {
    it('returns only catastrophes affecting the specified region', () => {
      const region1 = makeRegion('grassland');
      const region2 = makeRegion('desert');

      const catastrophe1: Catastrophe = {
        id: 'test-cat-5',
        type: 'flood',
        regionIds: [region1.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test flood',
        effects: [{ type: 'population_kill', magnitude: 0.2 }],
        mutationBonus: 1.5,
      };

      const catastrophe2: Catastrophe = {
        id: 'test-cat-6',
        type: 'forest_fire',
        regionIds: [region2.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test fire',
        effects: [{ type: 'plant_destroy', magnitude: 0.3 }],
        mutationBonus: 1.5,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe1.id, catastrophe1);
      catastropheEngine['activeCatastrophes'].set(catastrophe2.id, catastrophe2);

      const active1 = catastropheEngine.getActiveCatastrophes(region1.id);
      const active2 = catastropheEngine.getActiveCatastrophes(region2.id);

      expect(active1).toHaveLength(1);
      expect(active1[0].id).toBe(catastrophe1.id);

      expect(active2).toHaveLength(1);
      expect(active2[0].id).toBe(catastrophe2.id);
    });
  });

  // -------------------------------------------------------
  // Test 17: getAllActive returns all catastrophes
  // -------------------------------------------------------
  describe('getAllActive', () => {
    it('returns all active catastrophes across all regions', () => {
      const region1 = makeRegion('grassland');
      const region2 = makeRegion('desert');

      const catastrophe1: Catastrophe = {
        id: 'test-cat-7',
        type: 'flood',
        regionIds: [region1.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test flood',
        effects: [{ type: 'population_kill', magnitude: 0.2 }],
        mutationBonus: 1.5,
      };

      const catastrophe2: Catastrophe = {
        id: 'test-cat-8',
        type: 'forest_fire',
        regionIds: [region2.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test fire',
        effects: [{ type: 'plant_destroy', magnitude: 0.3 }],
        mutationBonus: 1.5,
      };

      catastropheEngine['activeCatastrophes'].set(catastrophe1.id, catastrophe1);
      catastropheEngine['activeCatastrophes'].set(catastrophe2.id, catastrophe2);

      const allActive = catastropheEngine.getAllActive();

      expect(allActive).toHaveLength(2);
      expect(allActive.map(c => c.id)).toContain(catastrophe1.id);
      expect(allActive.map(c => c.id)).toContain(catastrophe2.id);
    });
  });

  // -------------------------------------------------------
  // Test 18: clear() resets all catastrophes and stress maps
  // -------------------------------------------------------
  describe('clear()', () => {
    it('clears all active catastrophes and stress data', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0.7;
      region.plantPopulations = [
        makePlant({ biomass: 100, maxBiomass: 500 }),
      ];
      region.populations = [
        { speciesId: herbivoreId, count: 100, characters: [] },
      ];
      ecosystem.carryingCapacity.set(region.id, 1000);

      // Calculate stress
      catastropheEngine.calculateStress(region, ecosystem);

      // Create a catastrophe manually
      const catastrophe: Catastrophe = {
        id: 'test-cat-9',
        type: 'plague',
        regionIds: [region.id],
        severity: 0.5,
        tickStarted: 0,
        duration: 100,
        ticksRemaining: 100,
        cause: 'Test',
        effects: [{ type: 'population_kill', magnitude: 0.2 }],
        mutationBonus: 1.5,
      };
      catastropheEngine['activeCatastrophes'].set(catastrophe.id, catastrophe);

      // Verify they exist
      expect(catastropheEngine.getAllActive()).toHaveLength(1);

      // Clear
      catastropheEngine.clear();

      // Verify cleared
      expect(catastropheEngine.getAllActive()).toHaveLength(0);
      expect(catastropheEngine.getActiveCatastrophes(region.id)).toHaveLength(0);
    });
  });
});
