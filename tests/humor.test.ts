import { describe, it, expect } from 'vitest';
import { getSpeciesCategory, funnyNarrative, type SpeciesCategory, type HumorEventType } from '../src/narrative/humor.js';
import type { TaxonomyPath } from '../src/types.js';

describe('Humor Engine', () => {
  describe('getSpeciesCategory', () => {
    it('maps Mammalia/Primates to primate', () => {
      const taxonomy: TaxonomyPath = { class: 'Mammalia', order: 'Primates', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('primate');
    });

    it('maps Mammalia/Carnivora to large_mammal', () => {
      const taxonomy: TaxonomyPath = { class: 'Mammalia', order: 'Carnivora', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('large_mammal');
    });

    it('maps Mammalia/Rodentia to small_mammal', () => {
      const taxonomy: TaxonomyPath = { class: 'Mammalia', order: 'Rodentia', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('small_mammal');
    });

    it('maps Aves to bird', () => {
      const taxonomy: TaxonomyPath = { class: 'Aves', order: 'Passeriformes', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('bird');
    });

    it('maps Insecta to insect', () => {
      const taxonomy: TaxonomyPath = { class: 'Insecta', order: 'Hymenoptera', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('insect');
    });

    it('maps Actinopterygii to aquatic', () => {
      const taxonomy: TaxonomyPath = { class: 'Actinopterygii', order: 'Perciformes', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('aquatic');
    });

    it('maps Cephalopoda to cephalopod', () => {
      const taxonomy: TaxonomyPath = { class: 'Cephalopoda', order: 'Octopoda', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('cephalopod');
    });

    it('maps Arachnida to arachnid', () => {
      const taxonomy: TaxonomyPath = { class: 'Arachnida', order: 'Araneae', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('arachnid');
    });

    it('maps Reptilia to reptile', () => {
      const taxonomy: TaxonomyPath = { class: 'Reptilia', order: 'Squamata', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('reptile');
    });

    it('maps Malacostraca to crustacean', () => {
      const taxonomy: TaxonomyPath = { class: 'Malacostraca', order: 'Decapoda', family: 'F', genus: 'G', species: 'S' };
      expect(getSpeciesCategory(taxonomy)).toBe('crustacean');
    });
  });

  describe('funnyNarrative', () => {
    it('returns string or null', () => {
      const result = funnyNarrative('bird', 'death', {
        name: 'Tweety',
        speciesName: 'Crow',
      });
      // Could be null (70%) or a string (30%)
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('fills template placeholders when it fires', () => {
      // Run many times to get at least one hit
      let gotFunny = false;
      for (let i = 0; i < 100; i++) {
        const result = funnyNarrative('insect', 'death', {
          name: 'Buzzwick',
          speciesName: 'Ant',
        });
        if (result) {
          gotFunny = true;
          // Should not contain unfilled {name} placeholders
          expect(result).not.toContain('{name}');
          expect(result).not.toContain('{speciesName}');
          break;
        }
      }
      expect(gotFunny).toBe(true);
    });

    it('covers all event types with templates', () => {
      const eventTypes: HumorEventType[] = [
        'death', 'breeding_fail', 'breeding_success',
        'forage_fail', 'combat', 'exploration',
        'craft_fail', 'politics', 'advancement',
        'cross_species', 'general_fail',
        'cross_breed_death', 'cross_breed_reject', 'cross_breed_success',
      ];

      for (const eventType of eventTypes) {
        let found = false;
        for (let i = 0; i < 200; i++) {
          const result = funnyNarrative('small_mammal', eventType, {
            name: 'TestChar',
            speciesName: 'Mouse',
            targetName: 'Cat',
            hybridName: 'Mouat',
          });
          if (result) {
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      }
    });

    it('fires approximately 30% of the time', () => {
      let hits = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const result = funnyNarrative('large_mammal', 'death', {
          name: 'BigBoy',
          speciesName: 'Elephant',
        });
        if (result) hits++;
      }
      // Should be roughly 30% ± 5%
      const ratio = hits / trials;
      expect(ratio).toBeGreaterThan(0.2);
      expect(ratio).toBeLessThan(0.4);
    });
  });
});
