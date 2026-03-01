import { describe, it, expect, beforeEach } from 'vitest';
import {
  determineRespawn, BirthQueue, wipeDynastyOnExtinction,
  markSpeciesExtinct, isSpeciesExtinct, pickRespawnSpecies,
} from '../src/game/respawn.js';
import { AchievementTierTracker, FameTracker } from '../src/game/fame.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { lineageManager } from '../src/game/lineage.js';
import { createCharacter } from '../src/species/character.js';
import type { Character, SpeciesId } from '../src/types.js';

let speciesId: string;

function ensureSpecies(): string {
  const existing = speciesRegistry.getByName('RespawnTestSpecies');
  if (existing) return existing.id;
  const sp = speciesRegistry.register({
    commonName: 'RespawnTestSpecies',
    scientificName: 'Testus respawnus',
    taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'TR' },
    tier: 'generated',
    traitOverrides: { lifespan: 1000, size: 30, metabolicRate: 1 },
  });
  return sp.id;
}

function makeChar(sid?: string): Character {
  const char = createCharacter({
    speciesId: (sid ?? speciesId) as SpeciesId,
    regionId: 'r-1' as any,
    familyTreeId: 'ft-1' as any,
    tick: 0,
  });
  characterRegistry.add(char);
  return char;
}

describe('Respawn System', () => {
  beforeEach(() => {
    characterRegistry.clear();
    speciesId = ensureSpecies();
  });

  it('respawns as descendant when descendants exist', () => {
    const dead = makeChar();
    dead.isAlive = false;
    const desc = makeChar();
    desc.health = 0.9;

    const result = determineRespawn(dead, [desc]);
    expect(result.type).toBe('descendant');
    expect(result.characterId).toBe(desc.id);
  });

  it('picks healthiest descendant', () => {
    const dead = makeChar();
    dead.isAlive = false;

    const weak = makeChar();
    weak.health = 0.3;
    const strong = makeChar();
    strong.health = 0.95;

    const result = determineRespawn(dead, [weak, strong]);
    expect(result.characterId).toBe(strong.id);
  });

  it('queues when no descendants exist', () => {
    const dead = makeChar();
    dead.isAlive = false;

    const result = determineRespawn(dead, []);
    expect(result.type).toBe('queued');
    expect(result.characterId).toBeNull();
  });
});

describe('Birth Queue', () => {
  it('enqueues and dequeues in order', () => {
    const queue = new BirthQueue();
    queue.enqueue({ playerId: 'p1' as any, ownerId: 'o1' as any, preferredSpeciesId: null, queuedAtTick: 0, extinctionWipe: false });
    queue.enqueue({ playerId: 'p2' as any, ownerId: 'o2' as any, preferredSpeciesId: null, queuedAtTick: 1, extinctionWipe: false });

    expect(queue.size).toBe(2);
    expect(queue.peek()!.playerId).toBe('p1');

    const first = queue.dequeue()!;
    expect(first.playerId).toBe('p1');
    expect(queue.size).toBe(1);
  });

  it('prevents duplicate entries', () => {
    const queue = new BirthQueue();
    queue.enqueue({ playerId: 'p1' as any, ownerId: 'o1' as any, preferredSpeciesId: null, queuedAtTick: 0, extinctionWipe: false });
    queue.enqueue({ playerId: 'p1' as any, ownerId: 'o1' as any, preferredSpeciesId: null, queuedAtTick: 1, extinctionWipe: false });
    expect(queue.size).toBe(1);
  });

  it('reports queue position', () => {
    const queue = new BirthQueue();
    queue.enqueue({ playerId: 'p1' as any, ownerId: 'o1' as any, preferredSpeciesId: null, queuedAtTick: 0, extinctionWipe: false });
    queue.enqueue({ playerId: 'p2' as any, ownerId: 'o2' as any, preferredSpeciesId: null, queuedAtTick: 1, extinctionWipe: false });

    expect(queue.getPosition('p1' as any)).toBe(1);
    expect(queue.getPosition('p2' as any)).toBe(2);
    expect(queue.getPosition('p3' as any)).toBe(-1);
  });

  it('removes specific player', () => {
    const queue = new BirthQueue();
    queue.enqueue({ playerId: 'p1' as any, ownerId: 'o1' as any, preferredSpeciesId: null, queuedAtTick: 0, extinctionWipe: false });
    queue.enqueue({ playerId: 'p2' as any, ownerId: 'o2' as any, preferredSpeciesId: null, queuedAtTick: 1, extinctionWipe: false });

    queue.remove('p1' as any);
    expect(queue.size).toBe(1);
    expect(queue.peek()!.playerId).toBe('p2');
  });
});

describe('Dynasty Extinction', () => {
  beforeEach(() => {
    characterRegistry.clear();
    speciesId = ensureSpecies();
  });

  it('wipes dynasty state on extinction', () => {
    const char1 = makeChar();
    const char2 = makeChar();
    char1.familyTreeId = 'ft-test' as any;
    char2.familyTreeId = 'ft-test' as any;

    const tree = lineageManager.createTree({
      speciesId: speciesId as SpeciesId,
      ownerId: 'owner-1' as any,
      rootCharacterId: char1.id,
    });

    // Re-assign family tree IDs to match the real tree
    char1.familyTreeId = tree.id;
    char2.familyTreeId = tree.id;

    const wiped = wipeDynastyOnExtinction(tree.id);
    expect(wiped.length).toBeGreaterThan(0);

    // Characters should be dead
    expect(char1.isAlive).toBe(false);
    expect(char2.isAlive).toBe(false);

    // Tree should be marked extinct
    const updatedTree = lineageManager.getTree(tree.id);
    expect(updatedTree?.isExtinct).toBe(true);
  });
});

describe('Species Extinction', () => {
  beforeEach(() => {
    speciesId = ensureSpecies();
  });

  it('marks species as permanently extinct', () => {
    expect(isSpeciesExtinct(speciesId as SpeciesId)).toBe(false);
    const narrative = markSpeciesExtinct(speciesId as SpeciesId, 100);
    expect(narrative).toContain('extinct');
    expect(isSpeciesExtinct(speciesId as SpeciesId)).toBe(true);
  });

  it('no-ops on already extinct species', () => {
    markSpeciesExtinct(speciesId as SpeciesId, 100);
    const narrative = markSpeciesExtinct(speciesId as SpeciesId, 200);
    expect(narrative).toBe('');
  });

  it('pickRespawnSpecies avoids extinct species', () => {
    markSpeciesExtinct(speciesId as SpeciesId, 100);
    // Should not pick the extinct species
    const picked = pickRespawnSpecies(speciesId as SpeciesId);
    if (picked) {
      expect(picked).not.toBe(speciesId);
    }
    // (picked could be null if all species extinct, which is fine)
  });
});

describe('Achievement Tiers', () => {
  let tracker: AchievementTierTracker;

  beforeEach(() => {
    tracker = new AchievementTierTracker();
  });

  it('first achiever gets mythic', () => {
    expect(tracker.recordAndGetTier('first_contact')).toBe('mythic');
  });

  it('2nd-51st achievers get legendary', () => {
    tracker.recordAndGetTier('fire_maker'); // #1 = mythic
    for (let i = 2; i <= 51; i++) {
      expect(tracker.recordAndGetTier('fire_maker')).toBe('legendary');
    }
  });

  it('52nd-501st achievers get epic', () => {
    for (let i = 1; i <= 51; i++) tracker.recordAndGetTier('toolmaker');
    expect(tracker.recordAndGetTier('toolmaker')).toBe('epic'); // #52
  });

  it('502nd-5001st achievers get rare', () => {
    for (let i = 1; i <= 501; i++) tracker.recordAndGetTier('hunter');
    expect(tracker.recordAndGetTier('hunter')).toBe('rare'); // #502
  });

  it('5002nd+ achievers get common', () => {
    for (let i = 1; i <= 5001; i++) tracker.recordAndGetTier('survivor');
    expect(tracker.recordAndGetTier('survivor')).toBe('common'); // #5002
  });

  it('tracks count per achievement', () => {
    tracker.recordAndGetTier('discover_fire');
    tracker.recordAndGetTier('discover_fire');
    tracker.recordAndGetTier('discover_fire');
    expect(tracker.getCount('discover_fire')).toBe(3);
  });

  it('getNextTier predicts correctly', () => {
    expect(tracker.getNextTier('new_achievement')).toBe('mythic');
    tracker.recordAndGetTier('new_achievement');
    expect(tracker.getNextTier('new_achievement')).toBe('legendary');
  });

  it('FameTracker.recordAchievement assigns tier', () => {
    const fame = new FameTracker();
    const char = makeChar();
    const tier = fame.recordAchievement(char, 'first_fire', 10, 0);
    expect(tier).toBeTruthy();
    expect(char.achievements[0].tier).toBeTruthy();
  });
});
