// ============================================================
// Breeding, Inheritance, Mutation
// ============================================================

import type { Character, CharacterId, SpeciesId, Genetics } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from './species.js';
import { createCharacter } from './character.js';

export interface BreedingResult {
  canBreed: boolean;
  reason?: string;
  offspringCount?: number;
}

/** Check if two characters can breed */
export function canBreed(a: Character, b: Character): BreedingResult {
  // Must be alive
  if (!a.isAlive || !b.isAlive) {
    return { canBreed: false, reason: 'One or both characters are dead' };
  }

  // Must be different sexes (for same-species breeding)
  if (a.speciesId === b.speciesId && a.sex === b.sex) {
    return { canBreed: false, reason: 'Same sex cannot breed' };
  }

  // Must be same species (inter-species breeding is extremely rare)
  if (a.speciesId !== b.speciesId) {
    if (!worldRNG.chance(0.001)) {
      return { canBreed: false, reason: 'Different species' };
    }
  }

  // Must be mature
  const species = speciesRegistry.get(a.speciesId);
  if (!species) return { canBreed: false, reason: 'Unknown species' };

  if (a.age < species.traits.maturityTicks || b.age < species.traits.maturityTicks) {
    return { canBreed: false, reason: 'Not yet mature' };
  }

  // Must not be direct relatives (parent-child or siblings)
  if (a.parentIds?.includes(b.id) || b.parentIds?.includes(a.id)) {
    return { canBreed: false, reason: 'Direct relatives (parent-child)' };
  }
  // Sibling check: share both parents
  if (a.parentIds && b.parentIds &&
      a.parentIds[0] === b.parentIds[0] && a.parentIds[1] === b.parentIds[1]) {
    return { canBreed: false, reason: 'Siblings cannot breed' };
  }

  // Health check
  if (a.health < 0.3 || b.health < 0.3) {
    return { canBreed: false, reason: 'Too unhealthy to breed' };
  }

  // Breeding cooldown — must wait at least gestationTicks since last breeding
  const cooldown = species.traits.gestationTicks;
  if (a.lastBreedingTick !== null && (a.age - (a.lastBreedingTick - a.bornAtTick)) < cooldown) {
    return { canBreed: false, reason: 'Breeding cooldown not elapsed' };
  }
  if (b.lastBreedingTick !== null && (b.age - (b.lastBreedingTick - b.bornAtTick)) < cooldown) {
    return { canBreed: false, reason: 'Breeding cooldown not elapsed' };
  }

  // Cannot breed while gestating
  if (a.gestationEndsAtTick !== null || b.gestationEndsAtTick !== null) {
    return { canBreed: false, reason: 'Currently gestating' };
  }

  return {
    canBreed: true,
    offspringCount: Math.max(1, species.traits.reproductionRate + worldRNG.int(-1, 1)),
  };
}

/** Calculate offspring genetics from two parents */
export function calculateOffspringGenetics(parent1: Pick<Character, 'genetics'>, parent2: Pick<Character, 'genetics'>): Genetics {
  const rng = worldRNG;
  const g1 = parent1.genetics;
  const g2 = parent2.genetics;

  const genes = g1.genes.map((gene, i) => {
    const otherGene = g2.genes[i];
    if (!otherGene) return { ...gene };

    // Mendelian-ish: pick from one parent, influenced by dominance
    const source = gene.dominant && !otherGene.dominant ? gene
      : !gene.dominant && otherGene.dominant ? otherGene
      : rng.chance(0.5) ? gene : otherGene;

    let value = source.value;

    // Mutation
    const mutRate = (g1.mutationRate + g2.mutationRate) / 2;
    if (rng.chance(mutRate)) {
      value += rng.gaussian(0, 8);
    }

    // Blend slightly with other parent
    const otherValue = source === gene ? otherGene.value : gene.value;
    value = value * 0.7 + otherValue * 0.3;

    return {
      trait: gene.trait,
      value: Math.max(0, Math.min(100, value)),
      dominant: rng.chance(0.5),
    };
  });

  return {
    genes,
    mutationRate: Math.max(0.01, (g1.mutationRate + g2.mutationRate) / 2 + rng.gaussian(0, 0.005)),
  };
}

/** Check if a hybrid species should be created from inter-species breeding */
export function checkHybridSpeciation(parent1: Character, parent2: Character): boolean {
  if (parent1.speciesId === parent2.speciesId) return false;
  // Ultra-rare: hybrid speciation event
  return worldRNG.chance(0.01);
}

// ============================================================
// Breed Orchestrator — produces offspring from two parents
// ============================================================

export interface BirthResult {
  offspring: Character[];
  isHybrid: boolean;
}

/**
 * Execute breeding between two characters.
 * Creates offspring, updates parent records, sets gestation/cooldowns.
 * Caller is responsible for registering offspring in CharacterRegistry and FamilyTree.
 */
export function breed(parent1: Character, parent2: Character, tick: number): BirthResult | null {
  const check = canBreed(parent1, parent2);
  if (!check.canBreed) return null;

  const species = speciesRegistry.get(parent1.speciesId);
  if (!species) return null;

  const offspringCount = check.offspringCount ?? 1;
  const isHybrid = parent1.speciesId !== parent2.speciesId && checkHybridSpeciation(parent1, parent2);

  // Determine the mother (female parent) for gestation
  const mother = parent1.sex === 'female' ? parent1 : parent2;
  const father = parent1.sex === 'female' ? parent2 : parent1;

  // Set breeding cooldown and gestation
  mother.lastBreedingTick = tick;
  father.lastBreedingTick = tick;
  mother.gestationEndsAtTick = tick + species.traits.gestationTicks;

  // Determine offspring generation
  const gen = Math.max(parent1.generation, parent2.generation) + 1;

  const offspring: Character[] = [];
  for (let i = 0; i < offspringCount; i++) {
    const child = createCharacter({
      speciesId: parent1.speciesId, // For hybrids, this would be the new species
      regionId: mother.regionId,
      familyTreeId: mother.familyTreeId,
      parentIds: [parent1.id, parent2.id],
      parentGenetics: [parent1.genetics, parent2.genetics],
      tick,
      generation: gen,
    });

    // Update parent records
    parent1.childIds.push(child.id);
    parent2.childIds.push(child.id);

    offspring.push(child);
  }

  return { offspring, isHybrid };
}
