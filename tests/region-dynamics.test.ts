import { describe, it, expect, beforeEach } from 'vitest';
import {
  regionProfileRegistry,
  calculateRegionProfile,
  getStrategicMigrationTargets,
  getRegionFeelNarrative,
} from '../src/simulation/region-dynamics.js';
import { createRegion } from '../src/simulation/world.js';
import {
  createEcosystemState,
  addFoodWebRelation,
} from '../src/simulation/ecosystem.js';
import { allianceRegistry } from '../src/game/alliance.js';
import { speciesRegistry } from '../src/species/species.js';
import type { EcosystemState } from '../src/simulation/ecosystem.js';
import type { Region, RegionId, MultiSpeciesAlliance } from '../src/types.js';

describe('Region Dynamics', () => {
  let ecosystem: EcosystemState;
  let region: Region;
  let herbivoreId: string;
  let carnivoreId: string;

  function getOrRegister(name: string, overrides: Record<string, unknown> = {}): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Rdtest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'RDOrder', family: 'RDFam', genus: 'RDGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 50, lifespan: 5000, habitat: ['surface'], ...overrides },
    });
    return sp.id;
  }

  beforeEach(() => {
    regionProfileRegistry.clear();
    allianceRegistry.clear();
    ecosystem = createEcosystemState();

    herbivoreId = getOrRegister('RDHerbivore', { diet: 'herbivore', size: 30, socialStructure: 'herd' });
    carnivoreId = getOrRegister('RDCarnivore', { diet: 'carnivore', size: 60, strength: 70 });

    region = createRegion({
      name: 'Dynamics Plains',
      layer: 'surface',
      biome: 'grassland',
      latitude: 40,
      longitude: -100,
      elevation: 300,
    });

    region.resources.push(
      { type: 'grass', quantity: 800, maxQuantity: 1000, renewRate: 5, properties: new Map() },
    );
  });

  describe('calculateRegionProfile', () => {
    it('returns harmony for stable diverse region', () => {
      // Populate region with multiple species
      const sp1 = getOrRegister('RDDiverse1', { diet: 'herbivore' });
      const sp2 = getOrRegister('RDDiverse2', { diet: 'herbivore' });
      const sp3 = getOrRegister('RDDiverse3', { diet: 'omnivore' });

      region.populations.push(
        { speciesId: herbivoreId, count: 100, characters: [] },
        { speciesId: sp1, count: 80, characters: [] },
        { speciesId: sp2, count: 60, characters: [] },
        { speciesId: sp3, count: 40, characters: [] },
      );

      // Add stable population history (low variance)
      for (let i = 0; i < 20; i++) {
        regionProfileRegistry.recordPopulation(region.id, 280 + Math.round(Math.random() * 5));
      }

      // Add healthy plant populations
      region.plantPopulations.push(
        { plantType: 'grass', biomass: 900, maxBiomass: 1000, growthRate: 0.1, spreadRate: 0.01, permanentlyDestroyed: false, ticksBelowThreshold: 0 },
      );

      const profile = calculateRegionProfile(region, ecosystem, 1000);

      expect(profile.harmonyScore).toBeGreaterThan(0);
      expect(profile.dominantStrategy).not.toBe('chaos');
    });

    it('returns chaos for region with high predation and extinctions', () => {
      region.populations.push(
        { speciesId: herbivoreId, count: 50, characters: [] },
        { speciesId: carnivoreId, count: 30, characters: [] },
      );

      // Record many predation events and extinctions
      for (let i = 0; i < 50; i++) {
        regionProfileRegistry.recordPredation(region.id);
      }
      regionProfileRegistry.recordExtinction(region.id);
      regionProfileRegistry.recordExtinction(region.id);

      // Depleted plants
      region.plantPopulations.push(
        { plantType: 'grass', biomass: 50, maxBiomass: 1000, growthRate: 0.1, spreadRate: 0.01, permanentlyDestroyed: false, ticksBelowThreshold: 0 },
      );

      // Unstable population history
      const pops = [200, 50, 300, 20, 250, 10, 180, 40, 220, 30];
      for (const p of pops) {
        regionProfileRegistry.recordPopulation(region.id, p);
      }

      const profile = calculateRegionProfile(region, ecosystem, 1000);

      expect(profile.chaosScore).toBeGreaterThan(0);
    });
  });

  describe('getRegionFeelNarrative', () => {
    it('returns appropriate narrative for harmony', () => {
      regionProfileRegistry.setProfile(region.id, {
        regionId: region.id,
        harmonyScore: 0.8,
        chaosScore: 0.1,
        stabilityTrend: 0.5,
        dominantStrategy: 'harmony',
      });

      const narrative = getRegionFeelNarrative(region.id);
      expect(narrative).toContain('peaceful');
    });

    it('returns appropriate narrative for chaos', () => {
      regionProfileRegistry.setProfile(region.id, {
        regionId: region.id,
        harmonyScore: 0.1,
        chaosScore: 0.8,
        stabilityTrend: -0.5,
        dominantStrategy: 'chaos',
      });

      const narrative = getRegionFeelNarrative(region.id);
      expect(narrative).toContain('Danger');
    });

    it('returns neutral narrative when neither dominates', () => {
      regionProfileRegistry.setProfile(region.id, {
        regionId: region.id,
        harmonyScore: 0.4,
        chaosScore: 0.4,
        stabilityTrend: 0,
        dominantStrategy: 'neutral',
      });

      const narrative = getRegionFeelNarrative(region.id);
      expect(narrative).toContain('truce');
    });
  });

  describe('getStrategicMigrationTargets', () => {
    it('returns targets sorted by score', () => {
      const neighbor1 = createRegion({
        name: 'Harmony Meadow',
        layer: 'surface',
        biome: 'grassland',
        latitude: 42,
        longitude: -98,
        elevation: 250,
      });
      const neighbor2 = createRegion({
        name: 'Chaos Wasteland',
        layer: 'surface',
        biome: 'savanna',
        latitude: 38,
        longitude: -102,
        elevation: 350,
      });

      region.connections.push(neighbor1.id, neighbor2.id);

      // Set profiles for neighbors
      regionProfileRegistry.setProfile(neighbor1.id, {
        regionId: neighbor1.id,
        harmonyScore: 0.9,
        chaosScore: 0.1,
        stabilityTrend: 0.5,
        dominantStrategy: 'harmony',
      });
      regionProfileRegistry.setProfile(neighbor2.id, {
        regionId: neighbor2.id,
        harmonyScore: 0.1,
        chaosScore: 0.8,
        stabilityTrend: -0.5,
        dominantStrategy: 'chaos',
      });

      const allRegions = new Map<string, Region>();
      allRegions.set(region.id, region);
      allRegions.set(neighbor1.id, neighbor1);
      allRegions.set(neighbor2.id, neighbor2);

      // Herbivore (peaceful) should prefer harmony region
      const targets = getStrategicMigrationTargets(region, allRegions, herbivoreId);
      expect(targets.length).toBeGreaterThanOrEqual(2);
      // First target should be the harmony meadow (higher score for peaceful species)
      expect(targets[0].regionId).toBe(neighbor1.id);
      expect(targets[0].score).toBeGreaterThan(targets[1].score);
    });
  });

  describe('regionProfileRegistry', () => {
    it('tracks population history', () => {
      regionProfileRegistry.recordPopulation(region.id, 100);
      regionProfileRegistry.recordPopulation(region.id, 110);
      regionProfileRegistry.recordPopulation(region.id, 105);

      const history = regionProfileRegistry.getPopulationHistory(region.id);
      expect(history).toHaveLength(3);
      expect(history[0]).toBe(100);
      expect(history[2]).toBe(105);
    });
  });

  describe('Alliance integration', () => {
    it('region with alliances gets harmony bonus', () => {
      region.populations.push(
        { speciesId: herbivoreId, count: 100, characters: [] },
        { speciesId: carnivoreId, count: 50, characters: [] },
      );

      // Record stable population history
      for (let i = 0; i < 15; i++) {
        regionProfileRegistry.recordPopulation(region.id, 150);
      }

      // Calculate profile WITHOUT alliance
      const profileWithout = calculateRegionProfile(region, ecosystem, 1000);
      const harmonyWithout = profileWithout.harmonyScore;

      // Reset counters (calculateRegionProfile resets them)
      // Re-record population history
      for (let i = 0; i < 15; i++) {
        regionProfileRegistry.recordPopulation(region.id, 150);
      }

      // Add an alliance
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Harmony Alliance',
        memberSpecies: [herbivoreId, carnivoreId],
        sharedRegionIds: [region.id],
        formedAtTick: 500,
        trigger: 'common_enemy',
        strength: 0.8,
      };
      allianceRegistry.add(alliance);

      const profileWith = calculateRegionProfile(region, ecosystem, 1001);

      expect(profileWith.harmonyScore).toBeGreaterThan(harmonyWithout);

      // Clean up
      allianceRegistry.clear();
    });
  });
});
