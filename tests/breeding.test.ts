import { describe, it, expect, beforeEach } from 'vitest';
import { canBreed, breed, calculateOffspringGenetics } from '../src/species/genetics.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import { CharacterRegistry } from '../src/species/registry.js';
import type { Character } from '../src/types.js';

describe('Breeding System', () => {
  let speciesId: string;
  let registry: CharacterRegistry;

  beforeEach(() => {
    registry = new CharacterRegistry();

    const existing = speciesRegistry.getByName('Breeder');
    if (existing) {
      speciesId = existing.id;
    } else {
      const species = speciesRegistry.register({
        commonName: 'Breeder',
        scientificName: 'Testus breederus',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'B' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 10000,
          maturityTicks: 100,
          gestationTicks: 50,
          reproductionRate: 2,
        },
      });
      speciesId = species.id;
    }
  });

  function makeMale(tick = 0, age = 200): Character {
    const c = createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick,
      sex: 'male',
    });
    c.age = age;
    return c;
  }

  function makeFemale(tick = 0, age = 200): Character {
    const c = createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick,
      sex: 'female',
    });
    c.age = age;
    return c;
  }

  it('allows breeding between mature male and female', () => {
    const male = makeMale();
    const female = makeFemale();
    const result = canBreed(male, female);
    expect(result.canBreed).toBe(true);
    expect(result.offspringCount).toBeGreaterThanOrEqual(1);
  });

  it('prevents same-sex breeding', () => {
    const male1 = makeMale();
    const male2 = makeMale();
    const result = canBreed(male1, male2);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('Same sex');
  });

  it('prevents breeding of immature characters', () => {
    const male = makeMale(0, 10); // Too young
    const female = makeFemale();
    const result = canBreed(male, female);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('Not yet mature');
  });

  it('prevents parent-child breeding', () => {
    const parent = makeMale();
    const child = makeFemale();
    child.parentIds = [parent.id, 'other' as any];
    const result = canBreed(parent, child);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('parent-child');
  });

  it('prevents sibling breeding', () => {
    const sibling1 = makeMale();
    const sibling2 = makeFemale();
    sibling1.parentIds = ['p1' as any, 'p2' as any];
    sibling2.parentIds = ['p1' as any, 'p2' as any];
    const result = canBreed(sibling1, sibling2);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('Siblings');
  });

  it('prevents breeding when too unhealthy', () => {
    const male = makeMale();
    male.health = 0.1;
    const female = makeFemale();
    const result = canBreed(male, female);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('unhealthy');
  });

  it('prevents breeding while gestating', () => {
    const male = makeMale();
    const female = makeFemale();
    female.gestationEndsAtTick = 500;
    const result = canBreed(male, female);
    expect(result.canBreed).toBe(false);
    expect(result.reason).toContain('gestating');
  });

  it('breed() produces offspring', () => {
    const male = makeMale();
    const female = makeFemale();
    const result = breed(male, female, 300);
    expect(result).not.toBeNull();
    expect(result!.offspring.length).toBeGreaterThanOrEqual(1);
    expect(result!.offspring[0].parentIds).toEqual([male.id, female.id]);
    expect(result!.offspring[0].generation).toBe(1);
  });

  it('breed() sets gestation on mother', () => {
    const male = makeMale();
    const female = makeFemale();
    breed(male, female, 300);
    expect(female.gestationEndsAtTick).toBeGreaterThan(300);
    expect(male.lastBreedingTick).toBe(300);
    expect(female.lastBreedingTick).toBe(300);
  });

  it('breed() updates parent childIds', () => {
    const male = makeMale();
    const female = makeFemale();
    const result = breed(male, female, 300);
    expect(male.childIds.length).toBeGreaterThanOrEqual(1);
    expect(female.childIds.length).toBeGreaterThanOrEqual(1);
    expect(male.childIds[0]).toBe(result!.offspring[0].id);
  });

  it('offspring inherit genetics from parents', () => {
    const male = makeMale();
    const female = makeFemale();
    const result = breed(male, female, 300);
    const child = result!.offspring[0];
    // Child should have same number of genes as parents
    expect(child.genetics.genes.length).toBe(male.genetics.genes.length);
    // Gene values should be within a reasonable range (blended + possible mutation)
    for (const gene of child.genetics.genes) {
      expect(gene.value).toBeGreaterThanOrEqual(0);
      expect(gene.value).toBeLessThanOrEqual(100);
    }
  });

  it('offspring have sex assigned', () => {
    const male = makeMale();
    const female = makeFemale();
    const result = breed(male, female, 300);
    for (const child of result!.offspring) {
      expect(['male', 'female']).toContain(child.sex);
    }
  });
});
