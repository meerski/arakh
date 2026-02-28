import { describe, it, expect, beforeEach } from 'vitest';
import { TaxonomyEngine } from '../src/species/taxonomy.js';
import { SpeciesRegistry } from '../src/species/species.js';

describe('TaxonomyEngine', () => {
  let engine: TaxonomyEngine;

  beforeEach(() => {
    engine = new TaxonomyEngine();
  });

  it('registers and retrieves nodes', () => {
    engine.register({ rank: 'class', name: 'Mammalia', parentName: null, traits: { intelligence: 30 } });
    const node = engine.get('class', 'Mammalia');
    expect(node).toBeDefined();
    expect(node!.traits.intelligence).toBe(30);
  });

  it('resolves traits through taxonomy hierarchy', () => {
    engine.register({ rank: 'class', name: 'Mammalia', parentName: null, traits: { intelligence: 30, size: 50 } });
    engine.register({ rank: 'order', name: 'Primates', parentName: 'Mammalia', traits: { intelligence: 60 } });
    engine.register({ rank: 'family', name: 'Hominidae', parentName: 'Primates', traits: { intelligence: 70 } });
    engine.register({ rank: 'genus', name: 'Homo', parentName: 'Hominidae', traits: { intelligence: 80 } });
    engine.register({ rank: 'species', name: 'sapiens', parentName: 'Homo', traits: {} });

    const traits = engine.resolveTraits({
      class: 'Mammalia',
      order: 'Primates',
      family: 'Hominidae',
      genus: 'Homo',
      species: 'sapiens',
    });

    expect(traits.intelligence).toBe(80); // Most specific override
    expect(traits.size).toBe(50); // From class level
  });
});

describe('SpeciesRegistry', () => {
  it('registers and retrieves species', () => {
    const registry = new SpeciesRegistry();
    const species = registry.register({
      commonName: 'Test Animal',
      scientificName: 'Testus animus',
      taxonomy: { class: 'Mammalia', order: 'Test', family: 'Test', genus: 'Testus', species: 'animus' },
      tier: 'flagship',
    });

    expect(species.commonName).toBe('Test Animal');
    expect(registry.get(species.id)).toBeDefined();
    expect(registry.getByName('Test Animal')).toBeDefined();
  });

  it('tracks population', () => {
    const registry = new SpeciesRegistry();
    const species = registry.register({
      commonName: 'Test',
      scientificName: 'T. t',
      taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'S' },
      tier: 'flagship',
    });

    registry.updatePopulation(species.id, 100);
    expect(registry.get(species.id)!.totalPopulation).toBe(100);

    registry.updatePopulation(species.id, -100);
    expect(registry.get(species.id)!.status).toBe('endangered');
  });
});
