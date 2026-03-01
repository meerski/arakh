import { describe, it, expect, beforeEach } from 'vitest';
import {
  createColony, createDirectiveWheel, getColonyTier,
  tickColonyHealth, colonyForage, colonyDefend, colonyReproduce, colonyConstruct,
  ColonyRegistry,
} from '../src/species/colony.js';
import { tickQueenMechanics, designateQueen } from '../src/species/queen.js';
import { tryEmergeStandout, pruneDeadStandouts } from '../src/species/standout.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { Colony, ColonyId, CharacterId, SpeciesId } from '../src/types.js';

let speciesId: string;

function ensureSpecies(): string {
  const existing = speciesRegistry.getByName('TestAnt');
  if (existing) return existing.id;
  const sp = speciesRegistry.register({
    commonName: 'TestAnt',
    scientificName: 'Testus formicae',
    taxonomy: { class: 'I', order: 'Hymenoptera', family: 'Formicidae', genus: 'Testus', species: 'TF' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 100,
      size: 2,
      speed: 25,
      strength: 20,
      intelligence: 8,
      diet: 'omnivore',
      habitat: ['surface', 'underground'],
      socialStructure: 'colony',
      reproductionRate: 200,
      metabolicRate: 1.5,
    },
  });
  return sp.id;
}

function makeColony(overrides?: Partial<Colony>): Colony {
  const colony = createColony({
    speciesId: speciesId as SpeciesId,
    regionId: 'r-1' as any,
    familyTreeId: 'ft-1' as any,
    ownerId: null,
    name: 'Test Colony',
    queenId: null,
    tick: 0,
  });
  if (overrides) Object.assign(colony, overrides);
  return colony;
}

function makeQueen(): CharacterId {
  const char = createCharacter({
    speciesId: speciesId as SpeciesId,
    regionId: 'r-1' as any,
    familyTreeId: 'ft-1' as any,
    tick: 0,
    sex: 'female',
  });
  characterRegistry.add(char);
  return char.id;
}

describe('Colony System', () => {
  beforeEach(() => {
    characterRegistry.clear();
    speciesId = ensureSpecies();
  });

  describe('Colony Tier', () => {
    it('tier 1 for small colonies', () => {
      expect(getColonyTier(10)).toBe(1);
      expect(getColonyTier(49)).toBe(1);
    });

    it('tier 2 at 50 workers', () => {
      expect(getColonyTier(50)).toBe(2);
      expect(getColonyTier(199)).toBe(2);
    });

    it('tier 3 at 200 workers', () => {
      expect(getColonyTier(200)).toBe(3);
    });

    it('tier 4 at 1000 workers', () => {
      expect(getColonyTier(1000)).toBe(4);
    });

    it('tier 5 at 5000 workers', () => {
      expect(getColonyTier(5000)).toBe(5);
    });
  });

  describe('Colony Creation', () => {
    it('creates colony with default values', () => {
      const colony = makeColony();
      expect(colony.isAlive).toBe(true);
      expect(colony.tier).toBe(1);
      expect(colony.health.vitality).toBe(1);
      expect(colony.health.cohesion).toBe(1);
      expect(colony.health.provisions).toBe(0.5);
      expect(colony.health.geneticDiversity).toBe(0.8);
      expect(colony.workerCount).toBe(10);
      expect(colony.soldierCount).toBe(2);
    });

    it('creates directive wheel with 6 sectors', () => {
      const wheel = createDirectiveWheel();
      expect(wheel.sectors).toHaveLength(6);
      expect(wheel.active).toHaveLength(2);
      expect(wheel.active).toContain('foraging');
      expect(wheel.active).toContain('defense');
    });
  });

  describe('Colony Health', () => {
    it('vitality decays without queen', () => {
      const colony = makeColony({ queenId: null });
      const initial = colony.health.vitality;
      tickColonyHealth(colony);
      expect(colony.health.vitality).toBeLessThan(initial);
    });

    it('vitality recovers with queen', () => {
      const queenId = makeQueen();
      const colony = makeColony({ queenId, health: { vitality: 0.9, cohesion: 1, provisions: 0.5, geneticDiversity: 0.8 } });
      tickColonyHealth(colony);
      expect(colony.health.vitality).toBeGreaterThan(0.9);
    });

    it('provisions drain each tick', () => {
      const queenId = makeQueen();
      const colony = makeColony({ queenId });
      const initial = colony.health.provisions;
      tickColonyHealth(colony);
      expect(colony.health.provisions).toBeLessThan(initial);
    });

    it('colony dies when vitality reaches 0', () => {
      const colony = makeColony({
        queenId: null,
        health: { vitality: 0.01, cohesion: 0.1, provisions: 0, geneticDiversity: 0.1 },
      });
      tickColonyHealth(colony);
      expect(colony.isAlive).toBe(false);
      expect(colony.causeOfDeath).toBeTruthy();
    });

    it('succession crisis triggers without queen', () => {
      const colony = makeColony({
        queenId: null,
        health: { vitality: 0.25, cohesion: 0.5, provisions: 0.5, geneticDiversity: 0.8 },
      });
      tickColonyHealth(colony);
      expect(colony.successionCrisis).toBe(true);
    });
  });

  describe('Colony Actions', () => {
    it('foraging increases provisions', () => {
      const colony = makeColony();
      const initial = colony.health.provisions;
      colonyForage(colony, 0.8);
      expect(colony.health.provisions).toBeGreaterThan(initial);
    });

    it('defense reduces vitality from threats', () => {
      const colony = makeColony();
      const initial = colony.health.vitality;
      colonyDefend(colony, 0.5);
      expect(colony.health.vitality).toBeLessThan(initial);
    });

    it('reproduce adds workers when queen present', () => {
      const queenId = makeQueen();
      const colony = makeColony({ queenId, health: { vitality: 1, cohesion: 1, provisions: 0.5, geneticDiversity: 0.8 } });
      const initial = colony.workerCount;
      const narrative = colonyReproduce(colony);
      expect(narrative).toBeTruthy();
      expect(colony.workerCount).toBeGreaterThan(initial);
    });

    it('reproduce fails without queen', () => {
      const colony = makeColony({ queenId: null });
      const narrative = colonyReproduce(colony);
      expect(narrative).toBeNull();
    });

    it('construct fails with low provisions', () => {
      const colony = makeColony({ health: { vitality: 1, cohesion: 1, provisions: 0.05, geneticDiversity: 0.8 } });
      const narrative = colonyConstruct(colony);
      expect(narrative).toBeNull();
    });

    it('construct succeeds and boosts cohesion', () => {
      const colony = makeColony({ health: { vitality: 1, cohesion: 0.5, provisions: 0.5, geneticDiversity: 0.8 } });
      const narrative = colonyConstruct(colony);
      expect(narrative).toBeTruthy();
      expect(colony.health.cohesion).toBeGreaterThan(0.5);
    });
  });

  describe('Queen Mechanics', () => {
    it('detects queen death and starts succession', () => {
      const queenId = makeQueen();
      const colony = makeColony({ queenId });

      // Kill the queen
      const queen = characterRegistry.get(queenId)!;
      queen.isAlive = false;

      const event = tickQueenMechanics(colony, 100);
      expect(event).toBeTruthy();
      expect(event!.type).toBe('queen_died');
      expect(colony.successionCrisis).toBe(true);
      expect(colony.queenId).toBeNull();
    });

    it('designateQueen sets up queen correctly', () => {
      const colony = makeColony({ successionCrisis: true });
      const queenId = makeQueen();
      const result = designateQueen(colony, queenId);
      expect(result).toBe(true);
      expect(colony.queenId).toBe(queenId);
      expect(colony.successionCrisis).toBe(false);
      expect(colony.standoutIds).toContain(queenId);
    });

    it('no event when queen is alive', () => {
      const queenId = makeQueen();
      const colony = makeColony({ queenId });
      const event = tickQueenMechanics(colony, 100);
      expect(event).toBeNull();
    });
  });

  describe('ColonyRegistry', () => {
    it('stores and retrieves colonies', () => {
      const registry = new ColonyRegistry();
      const colony = makeColony();
      registry.add(colony);
      expect(registry.get(colony.id)).toBe(colony);
      expect(registry.size).toBe(1);
    });

    it('filters by region', () => {
      const registry = new ColonyRegistry();
      const c1 = makeColony();
      const c2 = makeColony();
      c2.regionId = 'r-2' as any;
      registry.add(c1);
      registry.add(c2);
      expect(registry.getByRegion('r-1' as any)).toHaveLength(1);
    });

    it('filters living colonies', () => {
      const registry = new ColonyRegistry();
      const c1 = makeColony();
      const c2 = makeColony();
      c2.isAlive = false;
      registry.add(c1);
      registry.add(c2);
      expect(registry.getLiving()).toHaveLength(1);
      expect(registry.livingCount).toBe(1);
    });

    it('clears all colonies', () => {
      const registry = new ColonyRegistry();
      registry.add(makeColony());
      registry.add(makeColony());
      registry.clear();
      expect(registry.size).toBe(0);
    });
  });

  describe('Standout Emergence', () => {
    it('does not emerge from dead colony', () => {
      const colony = makeColony({ isAlive: false, workerCount: 100 });
      const event = tryEmergeStandout(colony, 100);
      expect(event).toBeNull();
    });

    it('does not emerge from tiny colony', () => {
      const colony = makeColony({ workerCount: 5 });
      const event = tryEmergeStandout(colony, 100);
      expect(event).toBeNull();
    });

    it('prunes dead standouts', () => {
      const queenId = makeQueen();
      const char = characterRegistry.get(queenId)!;
      const colony = makeColony({ standoutIds: [queenId] });

      // Standout alive — stays
      pruneDeadStandouts(colony);
      expect(colony.standoutIds).toHaveLength(1);

      // Kill standout — pruned
      char.isAlive = false;
      pruneDeadStandouts(colony);
      expect(colony.standoutIds).toHaveLength(0);
    });
  });
});
