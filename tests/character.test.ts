import { describe, it, expect, beforeEach } from 'vitest';
import { createCharacter, updateCharacterTick, getGeneValue } from '../src/species/character.js';
import { SpeciesRegistry } from '../src/species/species.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';

describe('Character', () => {
  let speciesId: string;

  beforeEach(() => {
    // Register a test species
    const species = speciesRegistry.register({
      commonName: 'TestCreature',
      scientificName: 'Testus creatura',
      taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'S' },
      tier: 'flagship',
      traitOverrides: { lifespan: 100 },
    });
    speciesId = species.id;
  });

  it('creates a character with base genetics', () => {
    const char = createCharacter({
      speciesId,
      regionId: 'test-region' as any,
      familyTreeId: 'test-tree' as any,
      tick: 0,
    });

    expect(char.isAlive).toBe(true);
    expect(char.health).toBe(1);
    expect(char.genetics.genes.length).toBeGreaterThan(0);
    expect(char.name.length).toBeGreaterThan(0);
  });

  it('ages and dies from old age', () => {
    const char = createCharacter({
      speciesId,
      regionId: 'test-region' as any,
      familyTreeId: 'test-tree' as any,
      tick: 0,
    });
    characterRegistry.add(char);

    // Simulate well past lifespan
    let died = false;
    for (let tick = 1; tick <= 200; tick++) {
      const result = updateCharacterTick(char, tick);
      if (result.died) {
        died = true;
        break;
      }
    }

    expect(died).toBe(true);
    expect(char.isAlive).toBe(false);
  });

  it('gets hungrier and loses energy over time', () => {
    const char = createCharacter({
      speciesId,
      regionId: 'test-region' as any,
      familyTreeId: 'test-tree' as any,
      tick: 0,
    });

    updateCharacterTick(char, 1);
    expect(char.hunger).toBeGreaterThan(0);
    expect(char.energy).toBeLessThan(1);
  });

  it('retrieves gene values', () => {
    const char = createCharacter({
      speciesId,
      regionId: 'test-region' as any,
      familyTreeId: 'test-tree' as any,
      tick: 0,
    });

    const strength = getGeneValue(char, 'strength');
    expect(strength).toBeGreaterThan(0);
    expect(strength).toBeLessThan(100);
  });

  it('marks genesis elder correctly', () => {
    const char = createCharacter({
      speciesId,
      regionId: 'test-region' as any,
      familyTreeId: 'test-tree' as any,
      tick: 0,
      isGenesisElder: true,
    });

    expect(char.isGenesisElder).toBe(true);
  });
});
