import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateCrossSpeciesEncounter,
  createHybridSpecies,
  type CrossBreedOutcome,
} from '../src/species/genetics.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character } from '../src/types.js';

describe('Cross-Species Breeding & Hybrid Speciation', () => {
  let wolfId: string;
  let mouseId: string;
  let deerAId: string;
  let deerBId: string;

  function makeChar(speciesId: string): Character {
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
  }

  beforeEach(() => {
    const wolf = speciesRegistry.getByName('HybWolf');
    if (wolf) { wolfId = wolf.id; } else {
      wolfId = speciesRegistry.register({
        commonName: 'HybWolf',
        scientificName: 'Hybridus wolfus',
        taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'HW', species: 'HW' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000, size: 60, strength: 60, diet: 'carnivore' },
      }).id;
    }

    const mouse = speciesRegistry.getByName('HybMouse');
    if (mouse) { mouseId = mouse.id; } else {
      mouseId = speciesRegistry.register({
        commonName: 'HybMouse',
        scientificName: 'Hybridus mousus',
        taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Muridae', genus: 'HM', species: 'HM' },
        tier: 'flagship',
        traitOverrides: { lifespan: 1000, size: 5, strength: 5, diet: 'herbivore' },
      }).id;
    }

    const deerA = speciesRegistry.getByName('HybDeerA');
    if (deerA) { deerAId = deerA.id; } else {
      deerAId = speciesRegistry.register({
        commonName: 'HybDeerA',
        scientificName: 'Hybridus deerA',
        taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'HDA', species: 'HDA' },
        tier: 'flagship',
        traitOverrides: { lifespan: 4000, size: 50, strength: 30, diet: 'herbivore' },
      }).id;
    }

    const deerB = speciesRegistry.getByName('HybDeerB');
    if (deerB) { deerBId = deerB.id; } else {
      deerBId = speciesRegistry.register({
        commonName: 'HybDeerB',
        scientificName: 'Hybridus deerB',
        taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'HDB', species: 'HDB' },
        tier: 'flagship',
        traitOverrides: { lifespan: 4000, size: 45, strength: 25, diet: 'herbivore' },
      }).id;
    }
  });

  describe('evaluateCrossSpeciesEncounter', () => {
    it('returns a valid outcome', () => {
      const wolf = makeChar(wolfId);
      const mouse = makeChar(mouseId);
      const result = evaluateCrossSpeciesEncounter(mouse, wolf);
      const validOutcomes: CrossBreedOutcome[] = ['death', 'rejection', 'success', 'new_species'];
      expect(validOutcomes).toContain(result.outcome);
    });

    it('mouse approaching wolf is rejected due to size incompatibility', () => {
      // Size ratio 60/5 = 12x, far exceeds the 2x limit
      const mouse = makeChar(mouseId);
      const wolf = makeChar(wolfId);
      const result = evaluateCrossSpeciesEncounter(mouse, wolf);
      expect(result.outcome).toBe('rejection');
    });

    it('similar-sized herbivores are safer', () => {
      let deaths = 0;
      const trials = 200;
      for (let i = 0; i < trials; i++) {
        const a = makeChar(deerAId);
        const b = makeChar(deerBId);
        const result = evaluateCrossSpeciesEncounter(a, b);
        if (result.outcome === 'death') deaths++;
      }
      // Should have lower death rate than mouse-wolf
      expect(deaths / trials).toBeLessThan(0.6);
    });

    it('only initiator can die', () => {
      for (let i = 0; i < 50; i++) {
        const mouse = makeChar(mouseId);
        const wolf = makeChar(wolfId);
        const result = evaluateCrossSpeciesEncounter(mouse, wolf);
        if (result.outcome === 'death') {
          expect(result.deathTarget).toBe('initiator');
        }
      }
    });
  });

  describe('createHybridSpecies', () => {
    it('creates a new species with blended traits', () => {
      const sp1 = speciesRegistry.get(deerAId)!;
      const sp2 = speciesRegistry.get(deerBId)!;
      const hybrid = createHybridSpecies(sp1, sp2);

      expect(hybrid).toBeDefined();
      expect(hybrid.tier).toBe('generated');
      expect(hybrid.status).toBe('extant');
      expect(hybrid.commonName.length).toBeGreaterThan(0);

      // Traits should be between the two parents
      expect(hybrid.traits.size).toBeGreaterThan(0);
      expect(hybrid.traits.lifespan).toBeGreaterThan(0);
    });

    it('registers in species registry', () => {
      const sp1 = speciesRegistry.get(deerAId)!;
      const sp2 = speciesRegistry.get(deerBId)!;
      const hybrid = createHybridSpecies(sp1, sp2);

      const retrieved = speciesRegistry.get(hybrid.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.commonName).toBe(hybrid.commonName);
    });

    it('generates a portmanteau name', () => {
      const sp1 = speciesRegistry.get(wolfId)!;
      const sp2 = speciesRegistry.get(mouseId)!;
      const hybrid = createHybridSpecies(sp1, sp2);

      // Name should be non-empty and different from both parents
      expect(hybrid.commonName).toBeTruthy();
      expect(hybrid.commonName).not.toBe(sp1.commonName);
      expect(hybrid.commonName).not.toBe(sp2.commonName);
    });

    it('hybrid taxonomy references parent family', () => {
      const sp1 = speciesRegistry.get(deerAId)!;
      const sp2 = speciesRegistry.get(deerBId)!;
      const hybrid = createHybridSpecies(sp1, sp2);

      expect(hybrid.taxonomy.family).toBe(sp1.taxonomy.family);
      expect(hybrid.taxonomy.genus).toContain('Hybrid');
    });
  });
});
