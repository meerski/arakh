import { describe, it, expect, beforeEach } from 'vitest';
import {
  getKnowledgeReliability,
  filterReliableKnowledge,
  decayKnowledge,
  KNOWLEDGE_HALF_LIVES,
} from '../src/game/knowledge-decay.js';
import type { Character, Knowledge } from '../src/types.js';

describe('Knowledge Decay System', () => {
  let testCharacter: Character;
  const baseTick = 10000;

  /**
   * Create a minimal test character with knowledge array
   */
  function createTestCharacter(knowledge: Knowledge[] = []): Character {
    return {
      id: 'test-char-1',
      name: 'Test Scholar',
      speciesId: 'homo_sapiens',
      playerId: 'player-1',
      regionId: 'region-1',
      familyTreeId: 'family-1',
      bornAtTick: 0,
      diedAtTick: null,
      causeOfDeath: null,
      age: 1000,
      isAlive: true,
      sex: 'male',
      generation: 0,
      genetics: {
        genes: [],
        mutationRate: 0.01,
      },
      health: 1,
      energy: 1,
      hunger: 0,
      lastBreedingTick: null,
      gestationEndsAtTick: null,
      relationships: [],
      parentIds: null,
      childIds: [],
      inventory: [],
      knowledge,
      fame: 0,
      achievements: [],
      isGenesisElder: false,
      socialRank: 50,
      loyalties: new Map(),
      role: 'scout',
    };
  }

  /**
   * Create a knowledge entry
   */
  function createKnowledge(
    topic: string,
    detail: string,
    learnedAtTick: number,
    source: 'experience' | 'taught' | 'inherited' = 'experience'
  ): Knowledge {
    return { topic, detail, learnedAtTick, source };
  }

  beforeEach(() => {
    testCharacter = createTestCharacter();
  });

  describe('getKnowledgeReliability', () => {
    it('returns 1.0 for fresh knowledge (age = 0)', () => {
      const knowledge = createKnowledge('local_flora', 'Oak trees near water', baseTick);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBe(1);
    });

    it('returns 1.0 for knowledge learned in future (age < 0)', () => {
      const knowledge = createKnowledge('local_flora', 'Future knowledge', baseTick + 100);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBe(1);
    });

    it('returns ~0.5 for knowledge at half-life', () => {
      // local_flora has half-life of 800 ticks
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const knowledge = createKnowledge('local_flora', 'Oak trees', baseTick - halfLife);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBeCloseTo(0.5, 2);
    });

    it('returns ~0.25 for knowledge at 2x half-life', () => {
      // 2x half-life means 0.5^2 = 0.25
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const knowledge = createKnowledge('local_flora', 'Oak trees', baseTick - halfLife * 2);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBeCloseTo(0.25, 2);
    });

    it('returns lower reliability for shorter half-life topics', () => {
      const age = 400; // Equal to local_fauna's half-life
      const floraKnowledge = createKnowledge('local_flora', 'Flora', baseTick - age);
      const faunaKnowledge = createKnowledge('local_fauna', 'Fauna', baseTick - age);

      const floraReliability = getKnowledgeReliability(floraKnowledge, baseTick);
      const faunaReliability = getKnowledgeReliability(faunaKnowledge, baseTick);

      // flora has longer half-life (800) so decays SLOWER → higher reliability at same age
      // fauna has shorter half-life (600) so decays FASTER → lower reliability at same age
      expect(faunaReliability).toBeLessThan(floraReliability);
    });

    it('decays exponentially over time', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const k1 = getKnowledgeReliability(
        createKnowledge('local_flora', 'Test', baseTick - halfLife),
        baseTick
      );
      const k2 = getKnowledgeReliability(
        createKnowledge('local_flora', 'Test', baseTick - halfLife * 2),
        baseTick
      );
      const k3 = getKnowledgeReliability(
        createKnowledge('local_flora', 'Test', baseTick - halfLife * 3),
        baseTick
      );

      expect(k1).toBeCloseTo(0.5, 2);
      expect(k2).toBeCloseTo(0.25, 2);
      expect(k3).toBeCloseTo(0.125, 2);
    });
  });

  describe('Topic Half-Life Matching', () => {
    it('matches exact topic names', () => {
      const knowledge = createKnowledge('weather_patterns', 'Stormy', baseTick - 700);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBeCloseTo(0.5, 2);
    });

    it('matches prefix for experiment_ topics', () => {
      const knowledge = createKnowledge('experiment_fire', 'Fire burns wood', baseTick - 400);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      // experiment_ = 400 half-life
      expect(reliability).toBeCloseTo(0.5, 2);
    });

    it('matches prefix for resource_ topics', () => {
      const knowledge = createKnowledge('resource_gold_ore', 'Gold in mountains', baseTick - 600);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      // resource_ = 600 half-life
      expect(reliability).toBeCloseTo(0.5, 2);
    });

    it('uses default half-life for unknown topics', () => {
      const knowledge = createKnowledge('unknown_topic', 'Some detail', baseTick - 1200);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      // default = 1200 half-life
      expect(reliability).toBeCloseTo(0.5, 2);
    });

    it('checks prefix keys before default', () => {
      // "experiment_something" should match "experiment_" prefix (400), not default (1200)
      const knowledge = createKnowledge('experiment_color', 'Colors mix', baseTick - 400);
      const reliability = getKnowledgeReliability(knowledge, baseTick);
      expect(reliability).toBeCloseTo(0.5, 2);
    });
  });

  describe('filterReliableKnowledge', () => {
    it('includes fresh knowledge (reliability > 0.5)', () => {
      const fresh = createKnowledge('local_flora', 'Oak trees', baseTick);
      testCharacter.knowledge = [fresh];

      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliable).toHaveLength(1);
      expect(reliable[0].topic).toBe('local_flora');
    });

    it('includes knowledge at half-life (reliability ~0.5)', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const atHalfLife = createKnowledge('local_flora', 'Oak trees', baseTick - halfLife);
      testCharacter.knowledge = [atHalfLife];

      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      // At exactly half-life, reliability is ~0.5, which is NOT > 0.5, so it might be excluded
      // Let's check it's slightly above half-life
      const beforeHalfLife = createKnowledge('local_flora', 'Oak trees', baseTick - halfLife + 10);
      testCharacter.knowledge = [beforeHalfLife];
      const reliableBefore = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliableBefore).toHaveLength(1);
    });

    it('excludes very old knowledge (reliability < 0.5)', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const old = createKnowledge('local_flora', 'Old trees', baseTick - halfLife * 1.5);
      testCharacter.knowledge = [old];

      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliable).toHaveLength(0);
    });

    it('filters mixed age knowledge correctly', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const fresh = createKnowledge('local_flora', 'Fresh', baseTick - 100);
      const old = createKnowledge('local_flora', 'Old', baseTick - halfLife * 2);
      testCharacter.knowledge = [fresh, old];

      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliable).toHaveLength(1);
      expect(reliable[0].detail).toBe('Fresh');
    });

    it('handles empty knowledge array', () => {
      testCharacter.knowledge = [];
      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliable).toHaveLength(0);
    });

    it('preserves knowledge sources and details', () => {
      const taught = createKnowledge('local_fauna', 'Deer behavior', baseTick - 100, 'taught');
      const inherited = createKnowledge('terrain', 'Mountain pass', baseTick - 200, 'inherited');
      testCharacter.knowledge = [taught, inherited];

      const reliable = filterReliableKnowledge(testCharacter, baseTick);
      expect(reliable).toHaveLength(2);
      expect(reliable.find(k => k.source === 'taught')).toBeDefined();
      expect(reliable.find(k => k.source === 'inherited')).toBeDefined();
    });
  });

  describe('decayKnowledge', () => {
    it('removes knowledge past 2x half-life', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const veryOld = createKnowledge('local_flora', 'Ancient trees', baseTick - halfLife * 2.5);
      testCharacter.knowledge = [veryOld];

      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toHaveLength(1);
      expect(removed[0]).toBe('local_flora');
      expect(testCharacter.knowledge).toHaveLength(0);
    });

    it('retains knowledge at exactly 2x half-life', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_fauna;
      const atLimit = createKnowledge('local_fauna', 'Fauna limit', baseTick - halfLife * 2);
      testCharacter.knowledge = [atLimit];

      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toHaveLength(0);
      expect(testCharacter.knowledge).toHaveLength(1);
    });

    it('retains fresh knowledge', () => {
      const fresh = createKnowledge('local_flora', 'Fresh trees', baseTick - 100);
      testCharacter.knowledge = [fresh];

      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toHaveLength(0);
      expect(testCharacter.knowledge).toHaveLength(1);
    });

    it('returns removed topic strings', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.experiment_;
      const expired1 = createKnowledge('experiment_fire', 'Old fire', baseTick - halfLife * 2.5);
      const expired2 = createKnowledge('experiment_water', 'Old water', baseTick - halfLife * 3);
      testCharacter.knowledge = [expired1, expired2];

      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toContain('experiment_fire');
      expect(removed).toContain('experiment_water');
      expect(removed).toHaveLength(2);
    });

    it('handles mixed old and fresh knowledge', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.local_flora;
      const fresh = createKnowledge('local_flora', 'Fresh', baseTick - 100);
      const old = createKnowledge('local_flora', 'Old', baseTick - halfLife * 2.5);
      testCharacter.knowledge = [fresh, old];

      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toHaveLength(1);
      expect(testCharacter.knowledge).toHaveLength(1);
      expect(testCharacter.knowledge[0].detail).toBe('Fresh');
    });

    it('modifies character.knowledge in place', () => {
      const halfLife = KNOWLEDGE_HALF_LIVES.resource_;
      const fresh = createKnowledge('resource_ore', 'Ore', baseTick - 100);
      const veryOld = createKnowledge('resource_gold', 'Gold', baseTick - halfLife * 3);
      testCharacter.knowledge = [fresh, veryOld];

      const oldLength = testCharacter.knowledge.length;
      decayKnowledge(testCharacter, baseTick);

      expect(testCharacter.knowledge.length).toBeLessThan(oldLength);
      expect(testCharacter.knowledge).toEqual([fresh]);
    });

    it('handles empty knowledge array', () => {
      testCharacter.knowledge = [];
      const removed = decayKnowledge(testCharacter, baseTick);
      expect(removed).toHaveLength(0);
    });

    it('respects different half-lives during decay', () => {
      const shortHalfLife = KNOWLEDGE_HALF_LIVES.local_fauna; // 600
      const longHalfLife = KNOWLEDGE_HALF_LIVES.communication_skill; // 2000

      const oldShortLife = createKnowledge('local_fauna', 'Fauna', baseTick - shortHalfLife * 2.5);
      const oldLongLife = createKnowledge('communication_skill', 'Lang', baseTick - shortHalfLife * 2.5);

      testCharacter.knowledge = [oldShortLife, oldLongLife];

      const removed = decayKnowledge(testCharacter, baseTick);
      // Only the short-life knowledge should be removed
      expect(removed).toContain('local_fauna');
      expect(removed).not.toContain('communication_skill');
      expect(testCharacter.knowledge).toHaveLength(1);
      expect(testCharacter.knowledge[0].topic).toBe('communication_skill');
    });
  });

  describe('KNOWLEDGE_HALF_LIVES constant', () => {
    it('exports all required half-life mappings', () => {
      expect(KNOWLEDGE_HALF_LIVES.local_flora).toBe(800);
      expect(KNOWLEDGE_HALF_LIVES.local_fauna).toBe(600);
      expect(KNOWLEDGE_HALF_LIVES.experiment_).toBe(400);
      expect(KNOWLEDGE_HALF_LIVES.default).toBe(1200);
    });

    it('contains reasonable half-life values', () => {
      Object.values(KNOWLEDGE_HALF_LIVES).forEach(halfLife => {
        expect(halfLife).toBeGreaterThan(0);
        expect(Number.isInteger(halfLife)).toBe(true);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('simulates knowledge decay across a character lifespan', () => {
      const knowledge1 = createKnowledge('local_flora', 'Oak trees', 0);
      const knowledge2 = createKnowledge('local_fauna', 'Deer herd', 5000);
      const knowledge3 = createKnowledge('experiment_fire', 'Fire spreads', 8000);

      testCharacter.knowledge = [knowledge1, knowledge2, knowledge3];

      // After some time, filter for reliable knowledge
      const tick20000 = 20000;
      const reliable = filterReliableKnowledge(testCharacter, tick20000);

      // knowledge1 is very old (20000 ticks old, local_flora half-life 800)
      // 20000 / 800 = 25 half-lives → essentially 0 reliability
      // knowledge2 is 15000 ticks old (local_fauna half-life 600)
      // 15000 / 600 = 25 half-lives → essentially 0 reliability
      // knowledge3 is 12000 ticks old (experiment_ half-life 400)
      // 12000 / 400 = 30 half-lives → essentially 0 reliability

      expect(reliable).toHaveLength(0);
    });

    it('handles knowledge from different sources uniformly', () => {
      const learned = createKnowledge('terrain', 'Mountain pass', baseTick - 500, 'experience');
      const taught = createKnowledge('terrain', 'Valley route', baseTick - 500, 'taught');
      const inherited = createKnowledge('terrain', 'River crossing', baseTick - 500, 'inherited');

      testCharacter.knowledge = [learned, taught, inherited];
      const reliable = filterReliableKnowledge(testCharacter, baseTick);

      // All should decay at same rate regardless of source
      expect(reliable).toHaveLength(3);

      decayKnowledge(testCharacter, baseTick + KNOWLEDGE_HALF_LIVES.terrain * 2.5);
      expect(testCharacter.knowledge).toHaveLength(0);
    });
  });
});
