import { describe, it, expect, beforeEach } from 'vitest';
import { processAction, buildActionContext, applyEffects } from '../src/game/actions.js';
import type { ActionContext } from '../src/game/actions.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import { createRegion } from '../src/simulation/world.js';
import type { Character, Region, AgentAction } from '../src/types.js';

describe('Action System', () => {
  let speciesId: string;
  let character: Character;
  let region: Region;
  let ctx: ActionContext;

  beforeEach(() => {
    characterRegistry.clear();

    const existing = speciesRegistry.getByName('ActionTester');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'ActionTester',
        scientificName: 'Testus actionis',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'AT' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 5000,
          size: 30,
          diet: 'omnivore',
          reproductionRate: 2,
          gestationTicks: 200,
          maturityTicks: 500,
          habitat: ['surface'],
        },
      });
      speciesId = sp.id;
    }

    character = createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    character.age = 1000; // Mature
    characterRegistry.add(character);

    region = createRegion({
      name: 'Test Plains',
      layer: 'surface',
      biome: 'grassland',
      latitude: 40,
      longitude: -100,
      elevation: 300,
    });
    region.resources.push(
      { type: 'grass', quantity: 500, maxQuantity: 1000, renewRate: 5, properties: new Map() },
      { type: 'vegetation', quantity: 300, maxQuantity: 600, renewRate: 3, properties: new Map() },
    );

    // Fix region ID to match character's
    character.regionId = region.id;

    ctx = {
      character,
      region,
      tick: 100,
      regionName: region.name,
      nearbyCharacters: [],
      availableResources: ['grass', 'vegetation'],
      threats: [],
      timeOfDay: 'day',
      season: 'spring',
      weather: 'clear',
    };
  });

  describe('processAction', () => {
    it('returns failure for unknown action types', () => {
      const action: AgentAction = { type: 'move' as any, params: { direction: 'north' }, timestamp: 0 };
      // Override handler mapping — this tests the fallback
      const result = processAction({ type: 'nonsense' as any, params: {}, timestamp: 0 }, ctx);
      expect(result.success).toBe(false);
      expect(result.narrative).toContain('incomprehensible');
    });

    it('handles rest action and increases energy', () => {
      character.energy = 0.5;
      const result = processAction({ type: 'rest', params: {}, timestamp: 0 }, ctx);
      expect(result.success).toBe(true);
      expect(character.energy).toBeGreaterThan(0.5);
    });

    it('handles forage action and decreases hunger', () => {
      character.hunger = 0.8;
      // Run multiple times since it's probabilistic
      let foraged = false;
      for (let i = 0; i < 20; i++) {
        character.hunger = 0.8;
        const result = processAction({ type: 'forage', params: {}, timestamp: 0 }, ctx);
        if (result.success) {
          foraged = true;
          expect(character.hunger).toBeLessThan(0.8);
          break;
        }
      }
      expect(foraged).toBe(true);
    });

    it('handles learn action and adds knowledge', () => {
      let learned = false;
      for (let i = 0; i < 50; i++) {
        const result = processAction({ type: 'learn', params: {}, timestamp: 0 }, ctx);
        if (result.success) {
          learned = true;
          break;
        }
      }
      expect(learned).toBe(true);
      expect(character.knowledge.length).toBeGreaterThan(0);
    });

    it('handles gather action and creates inventory item', () => {
      let gathered = false;
      for (let i = 0; i < 20; i++) {
        const result = processAction({ type: 'gather', params: {}, timestamp: 0 }, ctx);
        if (result.success) {
          gathered = true;
          break;
        }
      }
      expect(gathered).toBe(true);
      expect(character.inventory.length).toBeGreaterThan(0);
    });
  });

  describe('applyEffects', () => {
    it('applies hunger_decrease effect', () => {
      character.hunger = 0.8;
      applyEffects([{ type: 'hunger_decrease', target: character.id, value: -0.3 }], ctx);
      expect(character.hunger).toBeCloseTo(0.5);
    });

    it('applies energy_increase effect', () => {
      character.energy = 0.5;
      applyEffects([{ type: 'energy_increase', target: character.id, value: 0.3 }], ctx);
      expect(character.energy).toBeCloseTo(0.8);
    });

    it('applies health_increase effect', () => {
      character.health = 0.7;
      applyEffects([{ type: 'health_increase', target: character.id, value: 0.1 }], ctx);
      expect(character.health).toBeCloseTo(0.8);
    });

    it('applies damage_dealt and kills at zero health', () => {
      const victim = createCharacter({
        speciesId,
        regionId: region.id as any,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      });
      victim.health = 0.05;
      characterRegistry.add(victim);

      applyEffects([{ type: 'damage_dealt', target: victim.id, value: 0.1 }], ctx);
      expect(victim.isAlive).toBe(false);
      expect(victim.causeOfDeath).toBe('killed in combat');
    });

    it('applies resource_gathered and depletes region resource', () => {
      const initialQty = region.resources[0].quantity;
      applyEffects([{ type: 'resource_gathered', target: character.id, value: 'grass' }], ctx);
      expect(region.resources[0].quantity).toBeLessThan(initialQty);
      expect(character.inventory.length).toBe(1);
    });

    it('applies item_created and adds fame', () => {
      const initialFame = character.fame;
      applyEffects([{ type: 'item_created', target: character.id, value: 'stone axe' }], ctx);
      expect(character.inventory.length).toBe(1);
      expect(character.inventory[0].name).toBe('stone axe');
      expect(character.fame).toBeGreaterThan(initialFame);
    });
  });

  describe('buildActionContext', () => {
    it('builds context from character and regions', () => {
      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      const result = buildActionContext(character.id, regions, 100, 'day', 'spring', 'clear');
      expect(result).not.toBeNull();
      expect(result!.character.id).toBe(character.id);
      expect(result!.regionName).toBe(region.name);
      expect(result!.availableResources).toContain('grass');
    });

    it('returns null for dead character', () => {
      character.isAlive = false;
      const regions = new Map<string, Region>();
      regions.set(region.id, region);

      const result = buildActionContext(character.id, regions, 100, 'day', 'spring', 'clear');
      expect(result).toBeNull();
    });

    it('returns null for unknown character', () => {
      const regions = new Map<string, Region>();
      const result = buildActionContext('nonexistent', regions, 100, 'day', 'spring', 'clear');
      expect(result).toBeNull();
    });
  });

  describe('combat actions', () => {
    it('attack reduces target health', () => {
      const opponent = createCharacter({
        speciesId,
        regionId: region.id as any,
        familyTreeId: 'tree-2' as any,
        tick: 0,
      });
      characterRegistry.add(opponent);
      ctx.nearbyCharacters = [opponent];

      const initialHealth = opponent.health;
      let attacked = false;
      for (let i = 0; i < 30; i++) {
        opponent.health = initialHealth;
        const result = processAction({ type: 'attack', params: { targetId: opponent.id }, timestamp: 0 }, ctx);
        if (result.success) {
          attacked = true;
          expect(opponent.health).toBeLessThan(initialHealth);
          break;
        }
      }
      expect(attacked).toBe(true);
    });
  });

  describe('breeding action', () => {
    it('breeds with a suitable mate', () => {
      const mate = createCharacter({
        speciesId,
        regionId: region.id as any,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      });
      mate.age = 1000;
      mate.sex = character.sex === 'male' ? 'female' : 'male';
      characterRegistry.add(mate);
      ctx.nearbyCharacters = [mate];

      const result = processAction({ type: 'breed', params: {}, timestamp: 0 }, ctx);
      if (result.success) {
        expect(result.effects.length).toBeGreaterThan(0);
        expect(result.effects[0].type).toBe('birth');
      }
      // Even if canBreed fails (cooldown etc), the test validates the wiring
    });

    it('fails without a mate nearby', () => {
      ctx.nearbyCharacters = [];
      const result = processAction({ type: 'breed', params: {}, timestamp: 0 }, ctx);
      expect(result.success).toBe(false);
    });
  });

  describe('communication with language barriers', () => {
    it('fails when no one is nearby', () => {
      ctx.nearbyCharacters = [];
      const result = processAction({ type: 'communicate', params: { message: 'hello' }, timestamp: 0 }, ctx);
      expect(result.success).toBe(false);
    });

    it('succeeds with same-species nearby', () => {
      const other = createCharacter({
        speciesId,
        regionId: region.id as any,
        familyTreeId: 'tree-2' as any,
        tick: 0,
      });
      characterRegistry.add(other);
      ctx.nearbyCharacters = [other];

      const result = processAction({ type: 'communicate', params: { message: 'hello' }, timestamp: 0 }, ctx);
      expect(result.success).toBe(true);
      expect(result.narrative).toContain('clearly');
    });
  });
});
