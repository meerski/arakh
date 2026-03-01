import { describe, it, expect } from 'vitest';
import {
  getDefaultPlants,
  updatePlantTick,
  consumePlantBiomass,
  spreadPlants,
} from '../src/simulation/plants.js';
import { createRegion } from '../src/simulation/world.js';
import type { PlantPopulation, Region } from '../src/types.js';

// Helper: build a minimal region with a given biome and no plant populations
function makeRegion(biome: Region['biome'], name = 'Test Region'): Region {
  return createRegion({
    name,
    layer: 'surface',
    biome,
    latitude: 0,
    longitude: 0,
    elevation: 0,
  });
}

// Helper: build a plant population directly
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

describe('Plants', () => {
  // -------------------------------------------------------
  // 1. getDefaultPlants — biome-appropriate plant types
  // -------------------------------------------------------
  describe('getDefaultPlants', () => {
    it('returns tropical_tree, shrub, fungi, and moss for tropical_rainforest', () => {
      const plants = getDefaultPlants('tropical_rainforest');
      const types = plants.map(p => p.plantType);
      expect(types).toContain('tropical_tree');
      expect(types).toContain('shrub');
      expect(types).toContain('fungi');
      expect(types).toContain('moss');
    });

    it('returns cactus and shrub for desert', () => {
      const plants = getDefaultPlants('desert');
      const types = plants.map(p => p.plantType);
      expect(types).toContain('cactus');
      expect(types).toContain('shrub');
      // Tropical tree should NOT appear in a desert
      expect(types).not.toContain('tropical_tree');
    });

    it('returns plankton and algae for open_ocean', () => {
      const plants = getDefaultPlants('open_ocean');
      const types = plants.map(p => p.plantType);
      expect(types).toContain('plankton');
      expect(types).toContain('algae');
      // Land plants should not appear in open ocean
      expect(types).not.toContain('grass');
      expect(types).not.toContain('deciduous_tree');
    });

    it('returns non-empty arrays for every biome', () => {
      const biomes = [
        'tropical_rainforest', 'temperate_forest', 'boreal_forest',
        'savanna', 'grassland', 'desert', 'tundra', 'mountain', 'wetland',
        'coastal', 'coral_reef', 'open_ocean', 'deep_ocean',
        'hydrothermal_vent', 'kelp_forest', 'cave_system',
        'underground_river', 'subterranean_ecosystem',
      ];
      for (const biome of biomes) {
        const plants = getDefaultPlants(biome);
        expect(plants.length, `Biome ${biome} should have plants`).toBeGreaterThan(0);
      }
    });

    it('initialises biomass at 70% of maxBiomass', () => {
      const plants = getDefaultPlants('grassland');
      for (const plant of plants) {
        expect(plant.biomass).toBeCloseTo(plant.maxBiomass * 0.7, 5);
      }
    });

    it('starts with permanentlyDestroyed false and zero ticksBelowThreshold', () => {
      const plants = getDefaultPlants('savanna');
      for (const plant of plants) {
        expect(plant.permanentlyDestroyed).toBe(false);
        expect(plant.ticksBelowThreshold).toBe(0);
      }
    });
  });

  // -------------------------------------------------------
  // 2. updatePlantTick — logistic growth
  // -------------------------------------------------------
  describe('updatePlantTick — logistic growth', () => {
    it('grows biomass when below maxBiomass and no pollution', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      const plant = makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 });
      region.plantPopulations = [plant];

      updatePlantTick(region);

      expect(region.plantPopulations[0].biomass).toBeGreaterThan(250);
    });

    it('growth slows as biomass approaches maxBiomass (logistic saturation)', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;

      // Plant at 50% capacity — growth headroom = 50%
      const plantLow = makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 });
      region.plantPopulations = [plantLow];
      updatePlantTick(region);
      const deltaLow = region.plantPopulations[0].biomass - 250;

      // Plant at 90% capacity — growth headroom = 10%
      const regionHigh = makeRegion('grassland');
      regionHigh.climate.pollution = 0;
      const plantHigh = makePlant({ biomass: 450, maxBiomass: 500, growthRate: 0.05 });
      regionHigh.plantPopulations = [plantHigh];
      updatePlantTick(regionHigh);
      const deltaHigh = regionHigh.plantPopulations[0].biomass - 450;

      expect(deltaLow).toBeGreaterThan(deltaHigh);
    });

    it('does not exceed maxBiomass', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      // Plant already at max
      const plant = makePlant({ biomass: 500, maxBiomass: 500, growthRate: 0.05 });
      region.plantPopulations = [plant];

      updatePlantTick(region);

      expect(region.plantPopulations[0].biomass).toBeLessThanOrEqual(500);
    });

    it('does not go below zero', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      const plant = makePlant({ biomass: 0, maxBiomass: 500, growthRate: 0.05 });
      region.plantPopulations = [plant];

      updatePlantTick(region);

      expect(region.plantPopulations[0].biomass).toBeGreaterThanOrEqual(0);
    });
  });

  // -------------------------------------------------------
  // 3. updatePlantTick — pollution penalty
  // -------------------------------------------------------
  describe('updatePlantTick — pollution penalty', () => {
    it('higher pollution reduces growth delta', () => {
      // Clean environment
      const cleanRegion = makeRegion('grassland');
      cleanRegion.climate.pollution = 0;
      cleanRegion.plantPopulations = [makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 })];
      updatePlantTick(cleanRegion);
      const cleanDelta = cleanRegion.plantPopulations[0].biomass - 250;

      // Polluted environment
      const pollutedRegion = makeRegion('grassland');
      pollutedRegion.climate.pollution = 1;
      pollutedRegion.plantPopulations = [makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 })];
      updatePlantTick(pollutedRegion);
      const pollutedDelta = pollutedRegion.plantPopulations[0].biomass - 250;

      expect(cleanDelta).toBeGreaterThan(pollutedDelta);
    });

    it('pollution factor of 1 (max pollution) halves the growth multiplier', () => {
      // At pollution=1: factor = 1 - 1*0.5 = 0.5, so delta should be half
      const cleanRegion = makeRegion('grassland');
      cleanRegion.climate.pollution = 0;
      cleanRegion.plantPopulations = [makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 })];
      updatePlantTick(cleanRegion);
      const cleanDelta = cleanRegion.plantPopulations[0].biomass - 250;

      const pollutedRegion = makeRegion('grassland');
      pollutedRegion.climate.pollution = 1;
      pollutedRegion.plantPopulations = [makePlant({ biomass: 250, maxBiomass: 500, growthRate: 0.05 })];
      updatePlantTick(pollutedRegion);
      const pollutedDelta = pollutedRegion.plantPopulations[0].biomass - 250;

      expect(pollutedDelta).toBeCloseTo(cleanDelta * 0.5, 5);
    });
  });

  // -------------------------------------------------------
  // 4. updatePlantTick — skips permanently destroyed plants
  // -------------------------------------------------------
  describe('updatePlantTick — permanently destroyed plants', () => {
    it('does not change biomass of a permanently destroyed plant', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      const plant = makePlant({
        biomass: 10,
        maxBiomass: 500,
        growthRate: 0.05,
        permanentlyDestroyed: true,
      });
      region.plantPopulations = [plant];

      updatePlantTick(region);

      expect(region.plantPopulations[0].biomass).toBe(10);
    });
  });

  // -------------------------------------------------------
  // 5. consumePlantBiomass — reduces biomass and returns consumed amount
  // -------------------------------------------------------
  describe('consumePlantBiomass', () => {
    it('reduces plant biomass and returns the consumed amount', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [makePlant({ plantType: 'grass', biomass: 300 })];

      const consumed = consumePlantBiomass(region, 'grass', 100);

      expect(consumed).toBe(100);
      expect(region.plantPopulations[0].biomass).toBe(200);
    });

    it('returns only available biomass when requested amount exceeds stock', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [makePlant({ plantType: 'grass', biomass: 50 })];

      const consumed = consumePlantBiomass(region, 'grass', 200);

      expect(consumed).toBe(50);
      expect(region.plantPopulations[0].biomass).toBe(0);
    });

    it('returns exact amount when requested amount equals available biomass', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [makePlant({ plantType: 'grass', biomass: 75 })];

      const consumed = consumePlantBiomass(region, 'grass', 75);

      expect(consumed).toBe(75);
      expect(region.plantPopulations[0].biomass).toBe(0);
    });
  });

  // -------------------------------------------------------
  // 6. consumePlantBiomass — returns 0 for destroyed plants
  // -------------------------------------------------------
  describe('consumePlantBiomass — destroyed plants', () => {
    it('returns 0 when plant is permanently destroyed', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [
        makePlant({ plantType: 'grass', biomass: 300, permanentlyDestroyed: true }),
      ];

      const consumed = consumePlantBiomass(region, 'grass', 100);

      expect(consumed).toBe(0);
      // Biomass should be unchanged
      expect(region.plantPopulations[0].biomass).toBe(300);
    });

    it('returns 0 when plant type is not present in the region', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [makePlant({ plantType: 'grass', biomass: 300 })];

      const consumed = consumePlantBiomass(region, 'kelp', 100);

      expect(consumed).toBe(0);
    });

    it('returns 0 when plant biomass is zero', () => {
      const region = makeRegion('grassland');
      region.plantPopulations = [makePlant({ plantType: 'grass', biomass: 0 })];

      const consumed = consumePlantBiomass(region, 'grass', 100);

      expect(consumed).toBe(0);
    });
  });

  // -------------------------------------------------------
  // 7. Overgrazing: biomass below 5% max for 500+ ticks
  // -------------------------------------------------------
  describe('Overgrazing — permanentlyDestroyed after threshold', () => {
    it('marks plant as permanently destroyed after 500 ticks below 5% maxBiomass', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      // Keep biomass fixed just below the threshold by consuming after each tick
      const plant = makePlant({
        plantType: 'grass',
        biomass: 24, // 24/500 = 4.8% — just below 5%
        maxBiomass: 500,
        growthRate: 0,   // No growth, so biomass stays low
        permanentlyDestroyed: false,
        ticksBelowThreshold: 0,
      });
      region.plantPopulations = [plant];

      // Run 499 ticks — should NOT be destroyed yet
      for (let i = 0; i < 499; i++) {
        updatePlantTick(region);
      }
      expect(region.plantPopulations[0].permanentlyDestroyed).toBe(false);
      expect(region.plantPopulations[0].ticksBelowThreshold).toBe(499);

      // Tick 500 — should now be permanently destroyed
      updatePlantTick(region);
      expect(region.plantPopulations[0].permanentlyDestroyed).toBe(true);
    });

    it('resets ticksBelowThreshold when biomass recovers above 5% max', () => {
      const region = makeRegion('grassland');
      region.climate.pollution = 0;
      const plant = makePlant({
        plantType: 'grass',
        biomass: 24,
        maxBiomass: 500,
        growthRate: 0,
        ticksBelowThreshold: 100,
      });
      region.plantPopulations = [plant];

      // Restore biomass above threshold, then tick
      region.plantPopulations[0].biomass = 50; // 50/500 = 10% — above 5%
      updatePlantTick(region);

      expect(region.plantPopulations[0].ticksBelowThreshold).toBe(0);
      expect(region.plantPopulations[0].permanentlyDestroyed).toBe(false);
    });
  });

  // -------------------------------------------------------
  // 8. spreadPlants — seeds plants to connected biome-compatible regions
  // -------------------------------------------------------
  describe('spreadPlants — spreading to compatible biomes', () => {
    it('seeds a new plant population into a connected compatible region', () => {
      const source = makeRegion('grassland', 'Source Grassland');
      const target = makeRegion('grassland', 'Target Grassland');

      // Set source grass at high biomass (>= 70%) so spread triggers
      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 500,   // 100% — well above 70% threshold
          maxBiomass: 500,
          growthRate: 0.05,
          spreadRate: 1,  // 100% chance so spread is deterministic
        }),
      ];
      // Target has no grass yet
      target.plantPopulations = [];

      source.connections = [target.id];
      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      const seeded = target.plantPopulations.find(p => p.plantType === 'grass');
      expect(seeded).toBeDefined();
      expect(seeded!.permanentlyDestroyed).toBe(false);
      expect(seeded!.biomass).toBeGreaterThan(0);
    });

    it('seeded biomass is 10% of source maxBiomass', () => {
      const source = makeRegion('grassland', 'Source');
      const target = makeRegion('grassland', 'Target');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 500,
          maxBiomass: 500,
          growthRate: 0.05,
          spreadRate: 1,
        }),
      ];
      target.plantPopulations = [];
      source.connections = [target.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      const seeded = target.plantPopulations.find(p => p.plantType === 'grass');
      expect(seeded).toBeDefined();
      expect(seeded!.biomass).toBe(500 * 0.1);  // 10% of source maxBiomass
    });

    it('does not spread when source biomass is below 70% of max', () => {
      const source = makeRegion('grassland', 'Low Source');
      const target = makeRegion('grassland', 'Target');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 300,   // 60% — below 70% threshold
          maxBiomass: 500,
          growthRate: 0.05,
          spreadRate: 1,
        }),
      ];
      target.plantPopulations = [];
      source.connections = [target.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      expect(target.plantPopulations).toHaveLength(0);
    });
  });

  // -------------------------------------------------------
  // 9. spreadPlants — does not spread to incompatible biomes
  // -------------------------------------------------------
  describe('spreadPlants — incompatible biome rejection', () => {
    it('does not spread grass into open_ocean', () => {
      const source = makeRegion('grassland', 'Grassland Source');
      const ocean = makeRegion('open_ocean', 'Ocean Target');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 500,
          maxBiomass: 500,
          growthRate: 0.05,
          spreadRate: 1,
        }),
      ];
      ocean.plantPopulations = [];
      source.connections = [ocean.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(ocean.id, ocean);

      spreadPlants(source, allRegions);

      const grassInOcean = ocean.plantPopulations.find(p => p.plantType === 'grass');
      expect(grassInOcean).toBeUndefined();
    });

    it('does not spread tropical_tree into tundra', () => {
      const source = makeRegion('tropical_rainforest', 'Rainforest');
      const tundra = makeRegion('tundra', 'Tundra');

      source.plantPopulations = [
        makePlant({
          plantType: 'tropical_tree',
          biomass: 1000,
          maxBiomass: 1000,
          growthRate: 0.015,
          spreadRate: 1,
        }),
      ];
      tundra.plantPopulations = [];
      source.connections = [tundra.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(tundra.id, tundra);

      spreadPlants(source, allRegions);

      const treesInTundra = tundra.plantPopulations.find(p => p.plantType === 'tropical_tree');
      expect(treesInTundra).toBeUndefined();
    });

    it('does not spread to a region that is not in allRegions', () => {
      const source = makeRegion('grassland', 'Source');
      source.plantPopulations = [
        makePlant({ plantType: 'grass', biomass: 500, maxBiomass: 500, spreadRate: 1 }),
      ];
      // Connect to an ID that is not in the map
      source.connections = ['ghost-region-id'];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);

      // Should not throw
      expect(() => spreadPlants(source, allRegions)).not.toThrow();
    });
  });

  // -------------------------------------------------------
  // 10. spreadPlants — revives permanently destroyed plants
  // -------------------------------------------------------
  describe('spreadPlants — reviving destroyed plants', () => {
    it('revives a permanently destroyed plant when a healthy neighbour spreads into its region', () => {
      const source = makeRegion('grassland', 'Healthy Grassland');
      const target = makeRegion('grassland', 'Recovering Grassland');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 500,
          maxBiomass: 500,
          growthRate: 0.05,
          spreadRate: 1,
        }),
      ];

      // Target has grass but it's permanently destroyed
      target.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 0,
          maxBiomass: 500,
          permanentlyDestroyed: true,
          ticksBelowThreshold: 600,
        }),
      ];

      source.connections = [target.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      const revived = target.plantPopulations.find(p => p.plantType === 'grass');
      expect(revived).toBeDefined();
      expect(revived!.permanentlyDestroyed).toBe(false);
      expect(revived!.ticksBelowThreshold).toBe(0);
      expect(revived!.biomass).toBeGreaterThan(0);
    });

    it('does not revive if source plant is permanently destroyed', () => {
      const source = makeRegion('grassland', 'Dead Grassland');
      const target = makeRegion('grassland', 'Target');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 0,
          maxBiomass: 500,
          permanentlyDestroyed: true,
          spreadRate: 1,
        }),
      ];
      target.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 0,
          maxBiomass: 500,
          permanentlyDestroyed: true,
        }),
      ];

      source.connections = [target.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      // Target should remain destroyed — source was skipped
      expect(target.plantPopulations[0].permanentlyDestroyed).toBe(true);
    });

    it('does not spread into a region already containing a healthy plant of the same type', () => {
      const source = makeRegion('grassland', 'Source');
      const target = makeRegion('grassland', 'Already Has Grass');

      source.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: 500,
          maxBiomass: 500,
          spreadRate: 1,
        }),
      ];

      const originalBiomass = 300;
      target.plantPopulations = [
        makePlant({
          plantType: 'grass',
          biomass: originalBiomass,
          maxBiomass: 500,
          permanentlyDestroyed: false,
        }),
      ];

      source.connections = [target.id];

      const allRegions = new Map<string, Region>();
      allRegions.set(source.id, source);
      allRegions.set(target.id, target);

      spreadPlants(source, allRegions);

      // Target's existing grass should be untouched
      expect(target.plantPopulations).toHaveLength(1);
      expect(target.plantPopulations[0].biomass).toBe(originalBiomass);
    });
  });
});
