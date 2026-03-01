import { describe, it, expect, beforeEach } from 'vitest';
import { encounterRegistry } from '../src/game/encounters.js';
import type { EncounterResolution } from '../src/game/encounters.js';
import { createCharacter } from '../src/species/character.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { corpseRegistry } from '../src/simulation/corpses.js';
import type { Character } from '../src/types.js';

describe('Encounter System', () => {
  let speciesId: string;
  let character: Character;

  beforeEach(() => {
    encounterRegistry.clear();
    characterRegistry.clear();
    corpseRegistry.clear();

    const existing = speciesRegistry.getByName('EncounterTester');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'EncounterTester',
        scientificName: 'Testus encounteris',
        taxonomy: { class: 'Mammalia', order: 'Testia', family: 'Testidae', genus: 'Testus', species: 'encounteris' },
        tier: 'common',
        traitOverrides: {
          lifespan: 50000,
          size: 40,
          diet: 'omnivore',
          habitat: ['surface'],
          reproductionRate: 1,
          gestationTicks: 500,
          maturityTicks: 1000,
        },
      });
      speciesId = sp.id;
    }

    character = createCharacter({
      speciesId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    character.health = 1;
    characterRegistry.add(character);
  });

  describe('createEncounter', () => {
    it('creates a predator_spotted encounter with correct options', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.6 },
        100,
      );

      expect(encounter.id).toBeTruthy();
      expect(encounter.type).toBe('predator_spotted');
      expect(encounter.characterId).toBe(character.id);
      expect(encounter.triggerTick).toBe(100);
      expect(encounter.expiresAtTick).toBe(103);
      expect(encounter.resolved).toBe(false);
      expect(encounter.threatLevel).toBe(0.6);

      const actions = encounter.options.map(o => o.action);
      expect(actions).toContain('hide');
      expect(actions).toContain('flee');
      expect(actions).toContain('fight');
      expect(actions).toContain('call_for_help');
      expect(encounter.options).toHaveLength(4);
    });

    it('creates a territorial_challenge encounter with correct options', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'territorial_challenge',
        { threatLevel: 0.4 },
        200,
      );

      expect(encounter.type).toBe('territorial_challenge');
      expect(encounter.expiresAtTick).toBe(203);

      const actions = encounter.options.map(o => o.action);
      expect(actions).toContain('submit');
      expect(actions).toContain('challenge');
      expect(actions).toContain('negotiate');
      expect(actions).toContain('retreat');
      expect(encounter.options).toHaveLength(4);
    });

    it('defaults threatLevel to 0.5 when not provided', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        {},
        50,
      );

      expect(encounter.threatLevel).toBe(0.5);
    });

    it('stores predatorId when provided', () => {
      const predator = createCharacter({
        speciesId,
        regionId: 'region-1' as any,
        familyTreeId: 'tree-2' as any,
        tick: 0,
      });
      characterRegistry.add(predator);

      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { predatorId: predator.id },
        100,
      );

      expect(encounter.predatorId).toBe(predator.id);
    });
  });

  describe('resolveEncounter', () => {
    it('resolves a flee action and returns a result', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.3 },
        100,
      );

      const result: EncounterResolution = encounterRegistry.resolveEncounter(
        encounter.id,
        'flee',
        101,
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('escaped');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.narrative).toBe('string');
      expect(result.narrative.length).toBeGreaterThan(0);
    });

    it('marks the encounter as resolved after resolveEncounter is called', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.2 },
        100,
      );

      expect(encounter.resolved).toBe(false);

      encounterRegistry.resolveEncounter(encounter.id, 'flee', 101);

      const stored = encounterRegistry.get(encounter.id);
      expect(stored?.resolved).toBe(true);
    });

    it('returns "moment has passed" narrative when resolving an already-resolved encounter', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.3 },
        100,
      );

      encounterRegistry.resolveEncounter(encounter.id, 'flee', 101);

      // Attempt double-resolve
      const secondResult = encounterRegistry.resolveEncounter(
        encounter.id,
        'flee',
        102,
      );

      expect(secondResult.success).toBe(false);
      expect(secondResult.narrative).toContain('moment has passed');
      expect(secondResult.damage).toBe(0);
      expect(secondResult.escaped).toBe(false);
    });
  });

  describe('getActiveEncounters', () => {
    it('returns only unresolved encounters for the given character', () => {
      const e1 = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.5 },
        100,
      );
      const e2 = encounterRegistry.createEncounter(
        character.id,
        'territorial_challenge',
        { threatLevel: 0.3 },
        101,
      );

      // Resolve one
      encounterRegistry.resolveEncounter(e1.id, 'flee', 102);

      const active = encounterRegistry.getActiveEncounters(character.id);
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(e2.id);
    });

    it('does not return encounters belonging to a different character', () => {
      const other = createCharacter({
        speciesId,
        regionId: 'region-1' as any,
        familyTreeId: 'tree-3' as any,
        tick: 0,
      });
      characterRegistry.add(other);

      encounterRegistry.createEncounter(
        other.id,
        'stampede',
        { threatLevel: 0.5 },
        100,
      );

      const active = encounterRegistry.getActiveEncounters(character.id);
      expect(active).toHaveLength(0);
    });

    it('returns an empty array when a character has no encounters', () => {
      const active = encounterRegistry.getActiveEncounters(character.id);
      expect(active).toHaveLength(0);
    });
  });

  describe('expireEncounters', () => {
    it('auto-resolves encounters whose expiresAtTick has been reached', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.4 },
        100,
      );

      // Tick exactly at expiry (100 + 3 = 103)
      const results = encounterRegistry.expireEncounters(103);

      expect(encounter.resolved).toBe(true);
      expect(results).toHaveLength(1);
    });

    it('does not expire encounters that have not yet reached expiresAtTick', () => {
      encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.4 },
        100,
      );

      // Tick is 102, expires at 103 — should not expire yet
      const results = encounterRegistry.expireEncounters(102);

      expect(results).toHaveLength(0);
    });

    it('applies damage to the character when an encounter expires', () => {
      const initialHealth = character.health;

      encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.6 },
        100,
      );

      encounterRegistry.expireEncounters(103);

      // resolveWorstOutcome: damage = threatLevel * 0.3 = 0.18
      expect(character.health).toBeLessThan(initialHealth);
    });

    it('returns worst-outcome resolution with success: false and escaped: false on expiry', () => {
      encounterRegistry.createEncounter(
        character.id,
        'natural_hazard',
        { threatLevel: 0.5 },
        200,
      );

      const results = encounterRegistry.expireEncounters(203);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].escaped).toBe(false);
      expect(results[0].damage).toBeGreaterThan(0);
      expect(results[0].narrative).toContain('hesitate');
    });

    it('does not re-expire encounters that were already resolved', () => {
      const encounter = encounterRegistry.createEncounter(
        character.id,
        'predator_spotted',
        { threatLevel: 0.3 },
        100,
      );

      encounterRegistry.resolveEncounter(encounter.id, 'flee', 101);

      const results = encounterRegistry.expireEncounters(103);
      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('removes all encounters from the registry', () => {
      encounterRegistry.createEncounter(character.id, 'predator_spotted', { threatLevel: 0.5 }, 100);
      encounterRegistry.createEncounter(character.id, 'stampede', { threatLevel: 0.3 }, 101);

      encounterRegistry.clear();

      const active = encounterRegistry.getActiveEncounters(character.id);
      expect(active).toHaveLength(0);
    });
  });
});
