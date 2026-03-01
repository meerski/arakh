import { describe, it, expect, beforeEach } from 'vitest';
import {
  allianceRegistry,
  evaluateAllianceTriggers,
  tickAlliance,
  tickAlliances,
  applyAllianceDefense,
  dissolveAlliance,
} from '../src/game/alliance.js';
import {
  createEcosystemState,
  addFoodWebRelation,
} from '../src/simulation/ecosystem.js';
import { createRegion } from '../src/simulation/world.js';
import { speciesRegistry } from '../src/species/species.js';
import type { EcosystemState } from '../src/simulation/ecosystem.js';
import type { Region, MultiSpeciesAlliance } from '../src/types.js';

describe('Multi-Species Alliances', () => {
  let ecosystem: EcosystemState;
  let region: Region;
  let preyAId: string;
  let preyBId: string;
  let predatorId: string;

  function getOrRegister(name: string, overrides: Record<string, unknown> = {}): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Allitest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'AllyFam', genus: 'AllyGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 50, lifespan: 5000, habitat: ['surface'], ...overrides },
    });
    return sp.id;
  }

  beforeEach(() => {
    allianceRegistry.clear();
    ecosystem = createEcosystemState();

    preyAId = getOrRegister('AllyPreyA', { diet: 'herbivore', size: 25 });
    preyBId = getOrRegister('AllyPreyB', { diet: 'herbivore', size: 30 });
    predatorId = getOrRegister('AllyPredator', { diet: 'carnivore', size: 70 });

    region = createRegion({
      name: 'Alliance Grassland',
      layer: 'surface',
      biome: 'grassland',
      latitude: 35,
      longitude: -90,
      elevation: 200,
    });

    region.resources.push(
      { type: 'grass', quantity: 500, maxQuantity: 1000, renewRate: 5, properties: new Map() },
    );
  });

  describe('evaluateAllianceTriggers', () => {
    it('forms alliance when 2+ species share a predator', () => {
      // Both prey species present in region, predator hunts both
      region.populations.push(
        { speciesId: preyAId, count: 100, characters: [] },
        { speciesId: preyBId, count: 80, characters: [] },
        { speciesId: predatorId, count: 20, characters: [] },
      );
      addFoodWebRelation(ecosystem, predatorId, preyAId, 0.1);
      addFoodWebRelation(ecosystem, predatorId, preyBId, 0.1);

      const alliance = evaluateAllianceTriggers(region, ecosystem, 100);

      expect(alliance).not.toBeNull();
      expect(alliance!.memberSpecies).toContain(preyAId);
      expect(alliance!.memberSpecies).toContain(preyBId);
      expect(alliance!.trigger).toBe('common_enemy');
      expect(alliance!.strength).toBe(0.8);
    });

    it('forms alliance during resource scarcity (<20%)', () => {
      region.populations.push(
        { speciesId: preyAId, count: 50, characters: [] },
        { speciesId: preyBId, count: 50, characters: [] },
      );
      // Set resources to below 20% of max
      region.resources = [
        { type: 'grass', quantity: 10, maxQuantity: 1000, renewRate: 1, properties: new Map() },
      ];

      const alliance = evaluateAllianceTriggers(region, ecosystem, 200);

      expect(alliance).not.toBeNull();
      expect(alliance!.trigger).toBe('resource_scarcity');
    });
  });

  describe('tickAlliance', () => {
    it('decays strength by 0.001 per tick', () => {
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Test Alliance',
        memberSpecies: [preyAId, preyBId],
        sharedRegionIds: [region.id],
        formedAtTick: 0,
        trigger: 'common_enemy',
        strength: 0.8,
      };
      allianceRegistry.add(alliance);

      tickAlliance(alliance, 1);
      expect(alliance.strength).toBeCloseTo(0.799);
    });

    it('dissolves alliance at 0 strength', () => {
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Dying Alliance',
        memberSpecies: [preyAId, preyBId],
        sharedRegionIds: [region.id],
        formedAtTick: 0,
        trigger: 'common_enemy',
        strength: 0.001,
      };
      allianceRegistry.add(alliance);

      const event = tickAlliance(alliance, 100);

      expect(event).not.toBeNull();
      expect(event!.type).toBe('alliance');
      expect(event!.description).toContain('dissolved');
      // Alliance should be removed from registry
      expect(allianceRegistry.get(alliance.id)).toBeUndefined();
    });
  });

  describe('applyAllianceDefense', () => {
    it('returns defense bonus for alliance members', () => {
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Defender Alliance',
        memberSpecies: [preyAId, preyBId],
        sharedRegionIds: [region.id],
        formedAtTick: 0,
        trigger: 'common_enemy',
        strength: 0.8,
      };
      allianceRegistry.add(alliance);

      const bonus = applyAllianceDefense(region.id, preyAId);
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(0.5);
    });

    it('returns 0 for non-members', () => {
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Exclusive Alliance',
        memberSpecies: [preyAId, preyBId],
        sharedRegionIds: [region.id],
        formedAtTick: 0,
        trigger: 'common_enemy',
        strength: 0.8,
      };
      allianceRegistry.add(alliance);

      const bonus = applyAllianceDefense(region.id, predatorId);
      expect(bonus).toBe(0);
    });
  });

  describe('Alliance Registry', () => {
    it('tracks alliances by region', () => {
      const alliance: MultiSpeciesAlliance = {
        id: crypto.randomUUID(),
        name: 'Regional Alliance',
        memberSpecies: [preyAId, preyBId],
        sharedRegionIds: [region.id],
        formedAtTick: 0,
        trigger: 'common_enemy',
        strength: 0.5,
      };
      allianceRegistry.add(alliance);

      const found = allianceRegistry.getAlliancesInRegion(region.id);
      expect(found).toHaveLength(1);
      expect(found[0].name).toBe('Regional Alliance');

      // Different region should have none
      const other = allianceRegistry.getAlliancesInRegion('nonexistent-region' as any);
      expect(other).toHaveLength(0);
    });
  });
});
