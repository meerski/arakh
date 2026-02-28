import { describe, it, expect, beforeEach } from 'vitest';
import {
  updatePopulationGenetics,
  incrementIsolation,
  resetIsolation,
  calculateGeneticDrift,
  checkSpeciation,
  generateSpeciatedName,
  resetEvolutionState,
} from '../src/species/evolution.js';
import { createCharacter, getGeneValue } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character } from '../src/types.js';

describe('Evolution System', () => {
  let speciesId: string;

  beforeEach(() => {
    resetEvolutionState();
    const existing = speciesRegistry.getByName('Evolver');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'Evolver',
        scientificName: 'Testus evolvens',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'EV' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000 },
      });
      speciesId = sp.id;
    }
  });

  function makeChar(): Character {
    return createCharacter({
      speciesId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
  }

  it('tracks population genetics', () => {
    const chars = Array.from({ length: 10 }, () => makeChar());
    const pg = updatePopulationGenetics(chars, speciesId, 'region-1' as any);
    expect(pg.sampleSize).toBe(10);
    expect(pg.averageGenes.size).toBeGreaterThan(0);
  });

  it('calculates genetic drift from baseline', () => {
    const chars = Array.from({ length: 10 }, () => makeChar());
    updatePopulationGenetics(chars, speciesId, 'region-1' as any);
    const drift = calculateGeneticDrift(speciesId, 'region-1' as any);
    expect(drift).toBeGreaterThanOrEqual(0);
    expect(drift).toBeLessThanOrEqual(1);
  });

  it('tracks isolation ticks', () => {
    const chars = [makeChar()];
    updatePopulationGenetics(chars, speciesId, 'region-1' as any);
    incrementIsolation(speciesId, 'region-1' as any);
    incrementIsolation(speciesId, 'region-1' as any);

    const result = checkSpeciation(speciesId, 'region-1' as any);
    expect(result.isolationTicks).toBe(2);
  });

  it('resets isolation on migration', () => {
    const chars = [makeChar()];
    updatePopulationGenetics(chars, speciesId, 'region-1' as any);
    incrementIsolation(speciesId, 'region-1' as any);
    incrementIsolation(speciesId, 'region-1' as any);
    resetIsolation(speciesId, 'region-1' as any);

    const result = checkSpeciation(speciesId, 'region-1' as any);
    expect(result.isolationTicks).toBe(0);
  });

  it('does not speciate without sufficient drift and isolation', () => {
    const chars = Array.from({ length: 10 }, () => makeChar());
    updatePopulationGenetics(chars, speciesId, 'region-1' as any);
    const result = checkSpeciation(speciesId, 'region-1' as any);
    expect(result.shouldSpeciate).toBe(false);
  });

  it('generates speciated names', () => {
    const names = generateSpeciatedName('Gray Wolf', 'Northern Tundra');
    expect(names.commonName).toBeTruthy();
    expect(names.scientificName).toBeTruthy();
    expect(names.commonName).toContain('Wolf');
  });
});
