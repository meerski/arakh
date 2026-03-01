import { describe, it, expect } from 'vitest';
import { createWorldContext, installWorldContext } from '../src/context.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character, CharacterId, SpeciesId, FamilyTreeId, RegionId } from '../src/types.js';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: crypto.randomUUID() as CharacterId,
    name: 'Test',
    speciesId: 'sp-1' as SpeciesId,
    playerId: null,
    regionId: 'r-1' as RegionId,
    familyTreeId: 'ft-1' as FamilyTreeId,
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 0,
    isAlive: true,
    sex: 'male',
    generation: 0,
    genetics: { genes: [], mutationRate: 0.01 },
    health: 1,
    energy: 1,
    hunger: 0,
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
    ...overrides,
  };
}

describe('WorldContext', () => {
  it('createWorldContext produces independent instances', () => {
    const ctx1 = createWorldContext();
    const ctx2 = createWorldContext();

    // Add a character to ctx1 — should NOT appear in ctx2
    const char = makeCharacter();
    ctx1.characters.add(char);

    expect(ctx1.characters.size).toBe(1);
    expect(ctx2.characters.size).toBe(0);
  });

  it('installWorldContext bridges module-level singletons', () => {
    const ctx = createWorldContext();
    installWorldContext(ctx);

    // The module-level singleton should now BE the ctx instance
    expect(characterRegistry).toBe(ctx.characters);
    expect(speciesRegistry).toBe(ctx.species);

    // Adding via singleton should reflect in ctx
    const char = makeCharacter();
    characterRegistry.add(char);
    expect(ctx.characters.get(char.id)).toBe(char);

    // Clean up
    ctx.characters.clear();
  });

  it('two contexts have completely independent state', () => {
    const ctx1 = createWorldContext();
    const ctx2 = createWorldContext();

    // Species in ctx1
    ctx1.species.registerDirect({
      id: 'test-species' as SpeciesId,
      commonName: 'Test Bird',
      scientificName: 'Testus birdus',
      taxonomy: { class: 'Aves', order: 'Test', family: 'Test', genus: 'Testus', species: 'birdus' },
      tier: 'generated',
      traits: {} as any,
      status: 'extant',
      totalPopulation: 100,
      genesisElderCount: 0,
    });

    expect(ctx1.species.getAll().length).toBe(1);
    expect(ctx2.species.getAll().length).toBe(0);

    // Fame trackers are distinct instances
    expect(ctx1.fame).not.toBe(ctx2.fame);
    expect(ctx1.social).not.toBe(ctx2.social);
    expect(ctx1.rng).not.toBe(ctx2.rng);
  });
});
