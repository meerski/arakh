import { describe, it, expect } from 'vitest';
import {
  getKnowledgeReliability,
  decayKnowledge,
  createInstinctKnowledge,
  createInheritedKnowledge,
  createExperientialKnowledge,
  getSpeciesInstincts,
  inheritKnowledge,
} from '../src/game/knowledge-decay.js';
import { recordCrossSpeciesContact } from '../src/game/language.js';
import type { Character, Knowledge, SpeciesId } from '../src/types.js';

function makeChar(speciesId: string = 'sp-1'): Character {
  return {
    id: 'char-1',
    name: 'Test',
    speciesId: speciesId as SpeciesId,
    playerId: null,
    regionId: 'r-1' as any,
    familyTreeId: 'ft-1' as any,
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 0,
    isAlive: true,
    sex: 'male',
    generation: 2,
    genetics: { genes: [], mutationRate: 0.05 },
    health: 1,
    energy: 1,
    hunger: 0,
    stamina: 1,
    lastBreedingTick: null,
    gestationEndsAtTick: null,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
    socialRank: 0,
    loyalties: new Map(),
    role: 'none',
    characterClass: 'regular',
    impactScore: 0,
  } as Character;
}

describe('Knowledge Layers', () => {
  it('instinct knowledge never decays', () => {
    const k = createInstinctKnowledge('survival', 'seek food');
    expect(getKnowledgeReliability(k, 0)).toBe(1);
    expect(getKnowledgeReliability(k, 100000)).toBe(1);
  });

  it('inherited knowledge degrades per generation', () => {
    const k = createInheritedKnowledge('fire', 'can be made from sticks', 0, 100);

    // Same generation: full reliability
    expect(getKnowledgeReliability(k, 100, 0)).toBe(1);

    // One generation later: ~85%
    const gen1 = getKnowledgeReliability(k, 100, 1);
    expect(gen1).toBeGreaterThan(0.8);
    expect(gen1).toBeLessThan(0.9);

    // Five generations later: much lower
    const gen5 = getKnowledgeReliability(k, 100, 5);
    expect(gen5).toBeLessThan(0.5);
  });

  it('experiential knowledge decays over time', () => {
    const k = createExperientialKnowledge('local_flora', 'berries found', 0);

    expect(getKnowledgeReliability(k, 0)).toBe(1);
    expect(getKnowledgeReliability(k, 800)).toBeCloseTo(0.5, 1); // Half-life = 800
    expect(getKnowledgeReliability(k, 1600)).toBeCloseTo(0.25, 1);
  });

  it('decayKnowledge preserves instinct, removes old experiential', () => {
    const char = makeChar();
    char.knowledge = [
      createInstinctKnowledge('survival', 'seek food'),
      createExperientialKnowledge('local_flora', 'berries', 0),
    ];

    // At tick 0, nothing removed
    const removed0 = decayKnowledge(char, 0);
    expect(removed0).toHaveLength(0);
    expect(char.knowledge).toHaveLength(2);

    // Way past half-life, experiential should be removed
    const removed = decayKnowledge(char, 10000);
    expect(removed).toContain('local_flora');
    expect(char.knowledge).toHaveLength(1); // Only instinct remains
    expect(char.knowledge[0].layer).toBe('instinct');
  });

  it('decayKnowledge removes degraded inherited knowledge', () => {
    const char = makeChar();
    char.generation = 20; // 20 generations past: (0.85)^20 ≈ 0.039 < 0.1
    char.knowledge = [
      createInheritedKnowledge('ancient_secret', 'lost wisdom', 0, 0),
    ];

    const removed = decayKnowledge(char, 100);
    expect(removed).toContain('ancient_secret');
  });

  it('getSpeciesInstincts returns base instincts', () => {
    const instincts = getSpeciesInstincts('any-species');
    expect(instincts.length).toBeGreaterThanOrEqual(3);
    expect(instincts.every(k => k.layer === 'instinct')).toBe(true);
  });

  it('inheritKnowledge passes parent knowledge to offspring', () => {
    const parentKnowledge: Knowledge[] = [
      createInstinctKnowledge('survival', 'seek food'),
      createExperientialKnowledge('local_flora', 'berries', 0),
      createInheritedKnowledge('fire', 'useful', 0, 0),
    ];

    const inherited = inheritKnowledge(parentKnowledge, 1, 100);

    // Instinct is NOT inherited (comes from species)
    expect(inherited.some(k => k.topic === 'survival')).toBe(false);

    // Experiential and inherited are inherited
    expect(inherited.some(k => k.topic === 'local_flora')).toBe(true);
    expect(inherited.some(k => k.topic === 'fire')).toBe(true);

    // All inherited entries have layer = 'inherited'
    expect(inherited.every(k => k.layer === 'inherited')).toBe(true);
  });
});

describe('Cross-Species Signals', () => {
  it('records cross-species contact', () => {
    const a = makeChar('sp-1');
    const b = makeChar('sp-2');
    b.id = 'char-2' as any;

    recordCrossSpeciesContact(a, b, 100);

    expect(a.knowledge.some(k => k.topic === 'cross_species_signal' && k.detail === 'sp-2')).toBe(true);
    expect(b.knowledge.some(k => k.topic === 'cross_species_signal' && k.detail === 'sp-1')).toBe(true);
  });

  it('does not record contact for same species', () => {
    const a = makeChar('sp-1');
    const b = makeChar('sp-1');
    b.id = 'char-2' as any;

    recordCrossSpeciesContact(a, b, 100);
    expect(a.knowledge).toHaveLength(0);
  });

  it('caps signals at 10 per species pair', () => {
    const a = makeChar('sp-1');
    const b = makeChar('sp-2');
    b.id = 'char-2' as any;

    for (let i = 0; i < 15; i++) {
      recordCrossSpeciesContact(a, b, i * 10);
    }

    const aSignals = a.knowledge.filter(k => k.topic === 'cross_species_signal').length;
    expect(aSignals).toBe(10);
  });
});
