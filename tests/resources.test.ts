import { describe, it, expect, beforeEach } from 'vitest';
import { GameRNG } from '../src/simulation/random.js';
import { SpeciesRegistry } from '../src/species/species.js';
import { TaxonomyEngine } from '../src/species/taxonomy.js';
import {
  ResourcePropertyRegistry,
  categorizeResource,
  buildEffectWeights,
  ALL_EFFECTS,
  type ResourceEffect,
} from '../src/game/resources.js';
import type { Character, SpeciesTraits, Species } from '../src/types.js';

// --- Helpers ---

/** Minimal taxonomy setup so SpeciesRegistry.register works */
function setupTaxonomy(engine: TaxonomyEngine, traits: Partial<SpeciesTraits>): void {
  engine.register({ rank: 'class', name: 'TestClass', parentName: null, traits });
  engine.register({ rank: 'order', name: 'TestOrder', parentName: 'TestClass', traits: {} });
  engine.register({ rank: 'family', name: 'TestFamily', parentName: 'TestOrder', traits: {} });
  engine.register({ rank: 'genus', name: 'TestGenus', parentName: 'TestFamily', traits: {} });
  engine.register({ rank: 'species', name: 'testus', parentName: 'TestGenus', traits: {} });
}

const TEST_TAXONOMY = {
  class: 'TestClass',
  order: 'TestOrder',
  family: 'TestFamily',
  genus: 'TestGenus',
  species: 'testus',
};

function makeCharacter(speciesId: string, id: string = 'char-1'): Character {
  return {
    id,
    name: 'Test Character',
    speciesId,
    playerId: null,
    regionId: 'region-1',
    familyTreeId: 'tree-1',
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 100,
    isAlive: true,
    genetics: { genes: [], mutationRate: 0.01 },
    health: 0.8,
    energy: 0.7,
    hunger: 0.5,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
  };
}

// --- Tests ---

describe('ResourcePropertyRegistry', () => {
  let registry: ResourcePropertyRegistry;

  beforeEach(() => {
    registry = new ResourcePropertyRegistry();
  });

  describe('generateResourceProperty', () => {
    it('generates a property with valid fields', () => {
      const rng = new GameRNG(42);
      const prop = registry.generateResourceProperty('berry', 'species-a', rng);

      expect(prop.speciesId).toBe('species-a');
      expect(prop.magnitude).toBeGreaterThanOrEqual(0);
      expect(prop.magnitude).toBeLessThanOrEqual(1);
      expect(ALL_EFFECTS).toContain(prop.effect);
      expect(prop.discoveredBy).toBeNull();
      expect(prop.discoveredAtTick).toBeNull();
    });

    it('returns the same property on subsequent calls (lazy caching)', () => {
      const rng = new GameRNG(42);
      const prop1 = registry.generateResourceProperty('berry', 'species-a', rng);
      const prop2 = registry.generateResourceProperty('berry', 'species-a', rng);

      expect(prop1).toBe(prop2); // Same reference — cached
    });

    it('generates deterministically for the same seed', () => {
      const rng1 = new GameRNG(42);
      const rng2 = new GameRNG(42);

      const reg1 = new ResourcePropertyRegistry();
      const reg2 = new ResourcePropertyRegistry();

      const prop1 = reg1.generateResourceProperty('berry', 'species-a', rng1);
      const prop2 = reg2.generateResourceProperty('berry', 'species-a', rng2);

      expect(prop1.effect).toBe(prop2.effect);
      expect(prop1.magnitude).toBeCloseTo(prop2.magnitude, 10);
    });

    it('generates different properties for different species', () => {
      // Use distinct seeded RNGs (the default path uses hashPair so no rng needed)
      const reg = new ResourcePropertyRegistry();
      const propA = reg.generateResourceProperty('berry', 'species-aaa');
      const propB = reg.generateResourceProperty('berry', 'species-bbb');

      // Different species should get independent properties.
      // Statistically they almost certainly differ, but we just verify independence:
      // they are separate objects
      expect(propA).not.toBe(propB);
      expect(propA.speciesId).toBe('species-aaa');
      expect(propB.speciesId).toBe('species-bbb');
    });

    it('generates different properties for different resources', () => {
      const reg = new ResourcePropertyRegistry();
      const propA = reg.generateResourceProperty('berry', 'species-x');
      const propB = reg.generateResourceProperty('iron_ore', 'species-x');

      expect(propA).not.toBe(propB);
    });
  });

  describe('diet-based weighting', () => {
    it('herbivores find plants more nourishing on average', () => {
      // Run many trials and check statistical tendency
      const herbTraits: SpeciesTraits = {
        lifespan: 1000,
        size: 50,
        speed: 5,
        strength: 5,
        intelligence: 30,
        perception: {
          visualRange: 10,
          hearingRange: 10,
          smellRange: 10,
          echolocation: false,
          electroreception: false,
          thermalSensing: false,
        },
        diet: 'herbivore',
        habitat: ['surface'],
        socialStructure: 'herd',
        reproductionRate: 2,
        gestationTicks: 100,
        maturityTicks: 200,
        nocturnal: false,
        aquatic: false,
        canFly: false,
      };

      const carnTraits: SpeciesTraits = { ...herbTraits, diet: 'carnivore' };

      const herbWeights = buildEffectWeights(herbTraits, 'plant');
      const carnWeights = buildEffectWeights(carnTraits, 'plant');

      const nourishIdx = ALL_EFFECTS.indexOf('nourishing');
      const poisonIdx = ALL_EFFECTS.indexOf('poisonous');

      // Herbivores should have higher nourishing weight for plants
      expect(herbWeights[nourishIdx]).toBeGreaterThan(carnWeights[nourishIdx]);
      // Carnivores should have higher poisonous weight for plants
      expect(carnWeights[poisonIdx]).toBeGreaterThan(herbWeights[poisonIdx]);
    });

    it('carnivores find meat more nourishing', () => {
      const baseTraits: SpeciesTraits = {
        lifespan: 1000,
        size: 50,
        speed: 5,
        strength: 5,
        intelligence: 30,
        perception: {
          visualRange: 10,
          hearingRange: 10,
          smellRange: 10,
          echolocation: false,
          electroreception: false,
          thermalSensing: false,
        },
        diet: 'carnivore',
        habitat: ['surface'],
        socialStructure: 'pack',
        reproductionRate: 2,
        gestationTicks: 100,
        maturityTicks: 200,
        nocturnal: false,
        aquatic: false,
        canFly: false,
      };

      const herbTraits: SpeciesTraits = { ...baseTraits, diet: 'herbivore' };

      const carnWeights = buildEffectWeights(baseTraits, 'meat');
      const herbWeights = buildEffectWeights(herbTraits, 'meat');

      const nourishIdx = ALL_EFFECTS.indexOf('nourishing');
      expect(carnWeights[nourishIdx]).toBeGreaterThan(herbWeights[nourishIdx]);
    });
  });

  describe('categorizeResource', () => {
    it('categorizes known resource types', () => {
      expect(categorizeResource('berry')).toBe('plant');
      expect(categorizeResource('salmon')).toBe('meat');
      expect(categorizeResource('iron_ore')).toBe('mineral');
      expect(categorizeResource('mushroom')).toBe('fungus');
      expect(categorizeResource('unknown_thing')).toBe('other');
    });
  });

  describe('discoverProperty', () => {
    it('records discoverer and tick', () => {
      const char = makeCharacter('species-1', 'char-discover');
      const rng = new GameRNG(99);

      const prop = registry.discoverProperty('berry', char, 500, rng);

      expect(prop.discoveredBy).toBe('char-discover');
      expect(prop.discoveredAtTick).toBe(500);
      expect(prop.speciesId).toBe('species-1');
    });

    it('only records the first discoverer', () => {
      const char1 = makeCharacter('species-1', 'char-first');
      const char2 = makeCharacter('species-1', 'char-second');
      const rng = new GameRNG(99);

      registry.discoverProperty('berry', char1, 100, rng);
      registry.discoverProperty('berry', char2, 200, rng);

      const prop = registry.getProperty('berry', 'species-1');
      expect(prop!.discoveredBy).toBe('char-first');
      expect(prop!.discoveredAtTick).toBe(100);
    });

    it('adds knowledge to the discovering character', () => {
      const char = makeCharacter('species-1', 'char-k');
      const rng = new GameRNG(99);

      registry.discoverProperty('berry', char, 100, rng);

      expect(registry.hasKnowledge('char-k', 'berry', 'species-1')).toBe(true);
      expect(registry.hasKnowledge('char-k', 'herb', 'species-1')).toBe(false);
    });
  });

  describe('knowledge and teaching', () => {
    it('teaching transfers knowledge', () => {
      const teacher = makeCharacter('species-1', 'teacher');
      const student = makeCharacter('species-1', 'student');
      const rng = new GameRNG(99);

      registry.discoverProperty('berry', teacher, 100, rng);

      expect(registry.hasKnowledge('student', 'berry', 'species-1')).toBe(false);

      const success = registry.teachProperty('berry', teacher, student);
      expect(success).toBe(true);
      expect(registry.hasKnowledge('student', 'berry', 'species-1')).toBe(true);
    });

    it('cannot teach across species', () => {
      const teacher = makeCharacter('species-1', 'teacher');
      const student = makeCharacter('species-2', 'student');
      const rng = new GameRNG(99);

      registry.discoverProperty('berry', teacher, 100, rng);

      const success = registry.teachProperty('berry', teacher, student);
      expect(success).toBe(false);
    });

    it('cannot teach unknown properties', () => {
      const teacher = makeCharacter('species-1', 'teacher');
      const student = makeCharacter('species-1', 'student');

      const success = registry.teachProperty('berry', teacher, student);
      expect(success).toBe(false);
    });

    it('getKnownProperties returns all known props', () => {
      const char = makeCharacter('species-1', 'char-all');
      const rng = new GameRNG(42);

      registry.discoverProperty('berry', char, 100, rng);
      registry.discoverProperty('herb', char, 110, rng);
      registry.discoverProperty('root', char, 120, rng);

      const known = registry.getKnownProperties('char-all');
      expect(known).toHaveLength(3);
    });
  });

  describe('applyResourceEffect', () => {
    it('nourishing effect reduces hunger and increases energy', () => {
      // We need a controlled property, so seed specifically
      const char = makeCharacter('species-nourish', 'char-eat');
      char.hunger = 0.8;
      char.energy = 0.4;
      const rng = new GameRNG(42);

      // Force a nourishing property by manipulating the registry
      registry.generateResourceProperty('test_food', char.speciesId, rng);
      // Get the generated property and override for test
      const prop = registry.getProperty('test_food', char.speciesId)!;
      prop.effect = 'nourishing';
      prop.magnitude = 0.5;

      const result = registry.applyResourceEffect('test_food', char, rng);

      expect(result.effect).toBe('nourishing');
      expect(char.hunger).toBeLessThan(0.8);
      expect(char.energy).toBeGreaterThan(0.4);
    });

    it('poisonous effect reduces health and energy', () => {
      const char = makeCharacter('species-poison', 'char-poison');
      char.health = 0.8;
      char.energy = 0.7;
      const rng = new GameRNG(42);

      registry.generateResourceProperty('bad_berry', char.speciesId, rng);
      const prop = registry.getProperty('bad_berry', char.speciesId)!;
      prop.effect = 'poisonous';
      prop.magnitude = 0.5;

      const result = registry.applyResourceEffect('bad_berry', char, rng);

      expect(result.effect).toBe('poisonous');
      expect(char.health).toBeLessThan(0.8);
      expect(char.energy).toBeLessThan(0.7);
    });

    it('healing effect increases health', () => {
      const char = makeCharacter('species-heal', 'char-heal');
      char.health = 0.3;
      const rng = new GameRNG(42);

      registry.generateResourceProperty('heal_herb', char.speciesId, rng);
      const prop = registry.getProperty('heal_herb', char.speciesId)!;
      prop.effect = 'healing';
      prop.magnitude = 0.8;

      const result = registry.applyResourceEffect('heal_herb', char, rng);

      expect(result.effect).toBe('healing');
      expect(char.health).toBeGreaterThan(0.3);
    });

    it('inert effect changes nothing', () => {
      const char = makeCharacter('species-inert', 'char-inert');
      const origHealth = char.health;
      const origEnergy = char.energy;
      const origHunger = char.hunger;
      const rng = new GameRNG(42);

      registry.generateResourceProperty('rock', char.speciesId, rng);
      const prop = registry.getProperty('rock', char.speciesId)!;
      prop.effect = 'inert';
      prop.magnitude = 0.5;

      registry.applyResourceEffect('rock', char, rng);

      expect(char.health).toBe(origHealth);
      expect(char.energy).toBe(origEnergy);
      expect(char.hunger).toBe(origHunger);
    });

    it('stats are clamped to [0, 1]', () => {
      const char = makeCharacter('species-clamp', 'char-clamp');
      char.health = 0.95;
      const rng = new GameRNG(42);

      registry.generateResourceProperty('super_heal', char.speciesId, rng);
      const prop = registry.getProperty('super_heal', char.speciesId)!;
      prop.effect = 'healing';
      prop.magnitude = 1.0;

      registry.applyResourceEffect('super_heal', char, rng);

      expect(char.health).toBeLessThanOrEqual(1);
    });
  });

  describe('resourceDecay', () => {
    it('does nothing before DECAY_INTERVAL ticks', () => {
      const rng = new GameRNG(42);
      registry.generateResourceProperty('berry', 'species-1', rng);
      const prop = registry.getProperty('berry', 'species-1')!;
      const origMag = prop.magnitude;
      const origEffect = prop.effect;

      // Decay at tick 100 — should be too early (interval is 5000)
      const changed = registry.resourceDecay(100, new GameRNG(1));

      expect(changed).toBe(0);
      expect(prop.magnitude).toBe(origMag);
      expect(prop.effect).toBe(origEffect);
    });

    it('drifts magnitude after sufficient ticks', () => {
      const rng = new GameRNG(42);
      registry.generateResourceProperty('berry', 'species-1', rng);
      const prop = registry.getProperty('berry', 'species-1')!;
      const origMag = prop.magnitude;

      // Decay at tick >= DECAY_INTERVAL
      const changed = registry.resourceDecay(
        ResourcePropertyRegistry.DECAY_INTERVAL + 1,
        new GameRNG(77),
      );

      expect(changed).toBeGreaterThan(0);
      // Magnitude should have drifted (may be same if drift ~ 0, but very unlikely)
      // We just check it stays in bounds
      expect(prop.magnitude).toBeGreaterThanOrEqual(0);
      expect(prop.magnitude).toBeLessThanOrEqual(1);
    });
  });

  describe('serialization', () => {
    it('round-trips state correctly', () => {
      const rng = new GameRNG(42);
      const char = makeCharacter('species-1', 'char-serial');

      registry.discoverProperty('berry', char, 100, rng);
      registry.discoverProperty('herb', char, 200, rng);

      const state = registry.getState();
      const restored = ResourcePropertyRegistry.fromState(state);

      expect(restored.getProperty('berry', 'species-1')).toBeDefined();
      expect(restored.getProperty('herb', 'species-1')).toBeDefined();
      expect(restored.hasKnowledge('char-serial', 'berry', 'species-1')).toBe(true);
      expect(restored.hasKnowledge('char-serial', 'herb', 'species-1')).toBe(true);

      const known = restored.getKnownProperties('char-serial');
      expect(known).toHaveLength(2);
    });
  });
});
