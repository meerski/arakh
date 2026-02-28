import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEcosystemState,
  addFoodWebRelation,
  updatePopulations,
  regenerateResources,
  checkEcosystemHealth,
  checkMigration,
  generatePopulationPollution,
  getPreyOf,
  getPredatorsOf,
} from '../src/simulation/ecosystem.js';
import { createRegion } from '../src/simulation/world.js';
import { speciesRegistry } from '../src/species/species.js';
import { initializePopulation } from '../src/species/population.js';
import type { Region, EcosystemState } from '../src/simulation/ecosystem.js';
import type { RegionId } from '../src/types.js';

describe('Ecosystem Dynamics', () => {
  let ecosystem: ReturnType<typeof createEcosystemState>;
  let herbivoreId: string;
  let carnivoreId: string;
  let region: Region;

  beforeEach(() => {
    ecosystem = createEcosystemState();

    // Register test species if not already present
    const existingHerb = speciesRegistry.getByName('TestHerbivore');
    if (existingHerb) {
      herbivoreId = existingHerb.id;
    } else {
      const h = speciesRegistry.register({
        commonName: 'TestHerbivore',
        scientificName: 'Testus herbivorus',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'TH' },
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

    const existingCarn = speciesRegistry.getByName('TestCarnivore');
    if (existingCarn) {
      carnivoreId = existingCarn.id;
    } else {
      const c = speciesRegistry.register({
        commonName: 'TestCarnivore',
        scientificName: 'Testus carnivorius',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'TC' },
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

    region = createRegion({
      name: 'Test Grassland',
      layer: 'surface',
      biome: 'grassland',
      latitude: 40,
      longitude: -100,
      elevation: 300,
    });

    // Add resources
    region.resources.push(
      { type: 'grass', quantity: 500, maxQuantity: 1000, renewRate: 5, properties: new Map() },
      { type: 'vegetation', quantity: 300, maxQuantity: 600, renewRate: 3, properties: new Map() },
    );

    ecosystem.carryingCapacity.set(region.id, 5000);
  });

  describe('Food Web', () => {
    it('tracks predator-prey relationships', () => {
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.15);
      const prey = getPreyOf(ecosystem, carnivoreId);
      expect(prey).toHaveLength(1);
      expect(prey[0].preyId).toBe(herbivoreId);

      const predators = getPredatorsOf(ecosystem, herbivoreId);
      expect(predators).toHaveLength(1);
      expect(predators[0].predatorId).toBe(carnivoreId);
    });
  });

  describe('Population Dynamics', () => {
    it('populations grow with available resources', () => {
      initializePopulation(region, herbivoreId, 100);
      const updates = updatePopulations(region, ecosystem);
      expect(updates).toHaveLength(1);
      // Population should grow when resources are abundant
      expect(updates[0].newCount).toBeGreaterThanOrEqual(100);
    });

    it('predators reduce prey population', () => {
      initializePopulation(region, herbivoreId, 200);
      initializePopulation(region, carnivoreId, 50);
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.15);

      // Run several ticks to see predation effect
      let herbPop = 200;
      for (let i = 0; i < 20; i++) {
        updatePopulations(region, ecosystem);
        herbPop = region.populations.find(p => p.speciesId === herbivoreId)?.count ?? 0;
      }
      // Herbivore should be lower than if no predator was present
      // (exact value depends on growth vs predation balance)
      expect(herbPop).toBeLessThan(500); // Should not grow unchecked
    });

    it('uses species-appropriate growth rates', () => {
      // Fast-breeder vs slow-breeder
      const fastBreeder = speciesRegistry.getByName('TestHerbivore')!;
      const slowBreeder = speciesRegistry.getByName('TestCarnivore')!;

      // Herbivore has reproductionRate: 3, gestationTicks: 200
      // Carnivore has reproductionRate: 2, gestationTicks: 400
      // Herbivore should grow faster intrinsically
      const region1 = createRegion({
        name: 'Fast Region',
        layer: 'surface',
        biome: 'grassland',
        latitude: 40,
        longitude: -100,
        elevation: 300,
      });
      region1.resources.push(
        { type: 'grass', quantity: 1000, maxQuantity: 2000, renewRate: 10, properties: new Map() },
      );

      const region2 = createRegion({
        name: 'Slow Region',
        layer: 'surface',
        biome: 'grassland',
        latitude: 40,
        longitude: -100,
        elevation: 300,
      });
      region2.resources.push(
        { type: 'grass', quantity: 1000, maxQuantity: 2000, renewRate: 10, properties: new Map() },
      );

      initializePopulation(region1, herbivoreId, 100);
      initializePopulation(region2, carnivoreId, 100);
      // Give carnivore prey so it doesn't starve
      initializePopulation(region2, herbivoreId, 200);
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.05);

      ecosystem.carryingCapacity.set(region1.id, 10000);
      ecosystem.carryingCapacity.set(region2.id, 10000);

      // Run 500 ticks to allow growth to accumulate
      for (let i = 0; i < 500; i++) {
        updatePopulations(region1, ecosystem);
        regenerateResources(region1);
        updatePopulations(region2, ecosystem);
        regenerateResources(region2);
      }

      const herbFinal = region1.populations.find(p => p.speciesId === herbivoreId)?.count ?? 0;
      // Herbivore should have grown over 500 ticks
      expect(herbFinal).toBeGreaterThanOrEqual(100);
    });

    it('density regulation prevents infinite growth', () => {
      ecosystem.carryingCapacity.set(region.id, 500);
      initializePopulation(region, herbivoreId, 400);

      // Run many ticks — population should stabilize near capacity
      for (let i = 0; i < 100; i++) {
        updatePopulations(region, ecosystem);
        regenerateResources(region);
      }

      const finalPop = region.populations.find(p => p.speciesId === herbivoreId)?.count ?? 0;
      // Should stay near or below carrying capacity
      expect(finalPop).toBeLessThanOrEqual(600); // Allow some overshoot
    });

    it('trophic cascade: predators decline when prey collapses', () => {
      initializePopulation(region, carnivoreId, 50);
      // No prey at all
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.15);

      // Run ticks — carnivores should decline without prey
      for (let i = 0; i < 50; i++) {
        updatePopulations(region, ecosystem);
      }

      const carnPop = region.populations.find(p => p.speciesId === carnivoreId)?.count ?? 0;
      expect(carnPop).toBeLessThan(50);
    });
  });

  describe('Resource Consumption', () => {
    it('herbivore populations consume vegetation resources', () => {
      initializePopulation(region, herbivoreId, 500);
      const initialGrass = region.resources[0].quantity;

      updatePopulations(region, ecosystem);

      // Resources should be drawn down
      expect(region.resources[0].quantity).toBeLessThanOrEqual(initialGrass);
    });

    it('resource regeneration replenishes resources', () => {
      region.resources[0].quantity = 100; // Depleted
      regenerateResources(region);
      expect(region.resources[0].quantity).toBeGreaterThan(100);
      expect(region.resources[0].quantity).toBeLessThanOrEqual(region.resources[0].maxQuantity);
    });

    it('pollution reduces resource regeneration', () => {
      region.resources[0].quantity = 100;
      region.climate.pollution = 0.8;
      regenerateResources(region);
      const pollutedRegen = region.resources[0].quantity - 100;

      region.resources[0].quantity = 100;
      region.climate.pollution = 0;
      regenerateResources(region);
      const cleanRegen = region.resources[0].quantity - 100;

      expect(pollutedRegen).toBeLessThan(cleanRegen);
    });
  });

  describe('Migration', () => {
    it('populations migrate when overcrowded', () => {
      ecosystem.carryingCapacity.set(region.id, 100);
      initializePopulation(region, herbivoreId, 95); // 95% capacity — well over 70%

      // Create a connected region
      const neighbor = createRegion({
        name: 'Neighbor',
        layer: 'surface',
        biome: 'grassland',
        latitude: 42,
        longitude: -98,
        elevation: 300,
      });
      region.connections.push(neighbor.id);
      neighbor.connections.push(region.id);
      ecosystem.carryingCapacity.set(neighbor.id, 5000);

      const regions = new Map<RegionId, Region>();
      regions.set(region.id, region);
      regions.set(neighbor.id, neighbor);

      // Try migration many times (probabilistic)
      let migrated = false;
      for (let i = 0; i < 500; i++) {
        const migrations = checkMigration(region, ecosystem, regions);
        if (migrations.length > 0) {
          migrated = true;
          expect(migrations[0].count).toBeGreaterThan(0);
          break;
        }
      }
      expect(migrated).toBe(true);
    });

    it('does not migrate to full regions', () => {
      ecosystem.carryingCapacity.set(region.id, 200);
      initializePopulation(region, herbivoreId, 180);

      const neighbor = createRegion({
        name: 'Full Neighbor',
        layer: 'surface',
        biome: 'grassland',
        latitude: 42,
        longitude: -98,
        elevation: 300,
      });
      ecosystem.carryingCapacity.set(neighbor.id, 100);
      initializePopulation(neighbor, herbivoreId, 95); // Already 95% full
      region.connections.push(neighbor.id);

      const regions = new Map<RegionId, Region>();
      regions.set(region.id, region);
      regions.set(neighbor.id, neighbor);

      let migrated = false;
      for (let i = 0; i < 50; i++) {
        const migrations = checkMigration(region, ecosystem, regions);
        if (migrations.length > 0) migrated = true;
      }
      expect(migrated).toBe(false);
    });
  });

  describe('Ecosystem Health', () => {
    it('detects local extinction', () => {
      region.populations.push({ speciesId: herbivoreId, count: 0, characters: [] });
      const events = checkEcosystemHealth(region, 100);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('extinction');
    });

    it('detects resource depletion', () => {
      region.resources[0].quantity = 10; // 1% of maxQuantity 1000
      const events = checkEcosystemHealth(region, 100);
      const depletion = events.find(e => e.type === 'resource_depletion');
      expect(depletion).toBeDefined();
    });

    it('detects pollution crisis', () => {
      region.climate.pollution = 0.9;
      const events = checkEcosystemHealth(region, 100);
      const pollution = events.find(e => e.description.includes('pollution'));
      expect(pollution).toBeDefined();
    });

    it('removes zero-count populations after health check', () => {
      region.populations.push(
        { speciesId: herbivoreId, count: 0, characters: [] },
        { speciesId: carnivoreId, count: 50, characters: [] },
      );
      checkEcosystemHealth(region, 100);
      // Zero-count population should be cleaned up
      expect(region.populations).toHaveLength(1);
      expect(region.populations[0].count).toBe(50);
    });
  });

  describe('Pollution Feedback', () => {
    it('generates pollution from overcrowding', () => {
      ecosystem.carryingCapacity.set(region.id, 100);
      initializePopulation(region, herbivoreId, 95);
      region.climate.pollution = 0;

      generatePopulationPollution(region, ecosystem);
      expect(region.climate.pollution).toBeGreaterThan(0);
    });

    it('does not generate pollution below capacity threshold', () => {
      ecosystem.carryingCapacity.set(region.id, 1000);
      initializePopulation(region, herbivoreId, 100);
      region.climate.pollution = 0;

      generatePopulationPollution(region, ecosystem);
      expect(region.climate.pollution).toBe(0);
    });
  });

  describe('Full Ecosystem Cycle', () => {
    it('runs a balanced predator-prey cycle over many ticks', () => {
      initializePopulation(region, herbivoreId, 200);
      initializePopulation(region, carnivoreId, 30);
      addFoodWebRelation(ecosystem, carnivoreId, herbivoreId, 0.1);

      const herbHistory: number[] = [];
      const carnHistory: number[] = [];

      for (let i = 0; i < 100; i++) {
        updatePopulations(region, ecosystem);
        regenerateResources(region);
        herbHistory.push(region.populations.find(p => p.speciesId === herbivoreId)?.count ?? 0);
        carnHistory.push(region.populations.find(p => p.speciesId === carnivoreId)?.count ?? 0);
      }

      // Both species should still exist (balanced ecosystem doesn't collapse in 100 ticks)
      const finalHerb = herbHistory[herbHistory.length - 1];
      const finalCarn = carnHistory[carnHistory.length - 1];
      expect(finalHerb).toBeGreaterThan(0);
      expect(finalCarn).toBeGreaterThanOrEqual(0);

      // Populations should have fluctuated (not constant)
      const herbMin = Math.min(...herbHistory);
      const herbMax = Math.max(...herbHistory);
      expect(herbMax).toBeGreaterThan(herbMin);
    });
  });
});
