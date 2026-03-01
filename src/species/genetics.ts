// ============================================================
// Breeding, Inheritance, Mutation
// ============================================================

import type { Character, CharacterId, SpeciesId, Genetics, Species, SpeciesTraits, TaxonomyPath, PerceptionProfile } from '../types.js';
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

  // Cross-species breeding: strict habitat + size gates
  if (a.speciesId !== b.speciesId) {
    const spA = speciesRegistry.get(a.speciesId);
    const spB = speciesRegistry.get(b.speciesId);
    if (!spA || !spB) return { canBreed: false, reason: 'Unknown species' };

    // Hard habitat check — must share at least one habitat layer
    const sharedHabitat = spA.traits.habitat.some(h => spB.traits.habitat.includes(h));
    if (!sharedHabitat) {
      return { canBreed: false, reason: 'Incompatible habitats' };
    }

    // Size compatibility — max 2x size ratio for cross-species breeding
    const sizeRatio = Math.max(spA.traits.size, spB.traits.size) / Math.max(1, Math.min(spA.traits.size, spB.traits.size));
    if (sizeRatio > 2) {
      return { canBreed: false, reason: 'Size difference too great' };
    }

    // 1% chance of cross-species attempt
    if (!worldRNG.chance(0.01)) {
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

  const mutRate = (g1.mutationRate + g2.mutationRate) / 2;

  const genes = g1.genes.map((gene, i) => {
    const otherGene = g2.genes[i];
    if (!otherGene) return { ...gene };

    // Mendelian-ish: pick from one parent, influenced by dominance
    const source = gene.dominant && !otherGene.dominant ? gene
      : !gene.dominant && otherGene.dominant ? otherGene
      : rng.chance(0.5) ? gene : otherGene;

    let value = source.value;

    // Mutation
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

  // Handle genes that exist in parent2 but not parent1 (e.g., appearance genes)
  if (g2.genes.length > g1.genes.length) {
    for (let i = g1.genes.length; i < g2.genes.length; i++) {
      const gene = g2.genes[i];
      let value = gene.value;
      if (rng.chance(mutRate)) {
        value += rng.gaussian(0, 8);
      }
      genes.push({
        trait: gene.trait,
        value: Math.max(0, Math.min(100, value)),
        dominant: rng.chance(0.5),
      });
    }
  }

  return {
    genes,
    mutationRate: Math.max(0.01, mutRate + rng.gaussian(0, 0.005)),
  };
}

/** Check if a hybrid species should be created from inter-species breeding */
export function checkHybridSpeciation(parent1: Character, parent2: Character): boolean {
  if (parent1.speciesId === parent2.speciesId) return false;
  // Ultra-rare: hybrid speciation event
  return worldRNG.chance(0.01);
}

// ============================================================
// Cross-Species Breeding — Danger Evaluation
// ============================================================

export type CrossBreedOutcome = 'death' | 'rejection' | 'success' | 'new_species';

export interface CrossBreedResult {
  outcome: CrossBreedOutcome;
  deathTarget?: 'initiator'; // only the initiator can die
}

/** Evaluate what happens when two different species try to breed */
export function evaluateCrossSpeciesEncounter(
  initiator: Character,
  target: Character,
): CrossBreedResult {
  const sp1 = speciesRegistry.get(initiator.speciesId);
  const sp2 = speciesRegistry.get(target.speciesId);
  if (!sp1 || !sp2) return { outcome: 'rejection' };

  // Hard habitat gate — reject immediately if no shared habitat
  const sharedHabitat = sp1.traits.habitat.some(h => sp2.traits.habitat.includes(h));
  if (!sharedHabitat) return { outcome: 'rejection' };

  // Hard size gate — reject immediately if size ratio > 2
  const sizeRatio = Math.max(sp1.traits.size, sp2.traits.size) / Math.max(1, Math.min(sp1.traits.size, sp2.traits.size));
  if (sizeRatio > 2) return { outcome: 'rejection' };

  // Size difference makes it more dangerous for the smaller one
  const sizeDiff = Math.abs(sp1.traits.size - sp2.traits.size);

  // Base danger: large size difference + carnivore target = very dangerous
  let deathChance = 0.3; // base 30%

  // Size difference adds danger
  deathChance += Math.min(0.4, sizeDiff / 100);

  // Diet mismatch: carnivore meeting herbivore = danger for herbivore
  if (sp2.traits.diet === 'carnivore' && sp1.traits.diet !== 'carnivore') {
    deathChance += 0.2;
  }
  if (sp1.traits.diet === 'carnivore' && sp2.traits.diet !== 'carnivore') {
    deathChance -= 0.1; // predator approaching prey is slightly safer for predator
  }

  // High aggression target = more dangerous
  const targetAggression = target.genetics.genes.find(g => g.trait === 'aggression')?.value ?? 30;
  deathChance += targetAggression / 500;

  // Positive relationship reduces danger
  const rel = initiator.relationships.find(r => r.targetId === target.id);
  if (rel && rel.strength > 0) {
    deathChance -= rel.strength * 0.3;
  }

  // Shared habitat = slightly safer
  if (sharedHabitat) deathChance -= 0.05;

  // Clamp
  deathChance = Math.max(0.1, Math.min(0.95, deathChance));

  // Roll outcomes
  const roll = worldRNG.float(0, 1);

  if (roll < deathChance) {
    return { outcome: 'death', deathTarget: 'initiator' };
  }

  // Adjusted probabilities: 95% rejection, 4.5% success, 0.5% new species
  // (of the 1% cross-species attempts, only ~5% produce offspring)
  const remaining = 1 - deathChance;
  const rejectThreshold = deathChance + remaining * 0.95;
  const successThreshold = deathChance + remaining * 0.995;

  if (roll < rejectThreshold) {
    return { outcome: 'rejection' };
  }
  if (roll < successThreshold) {
    return { outcome: 'success' };
  }
  return { outcome: 'new_species' };
}

/** Create a hybrid species from two parent species */
export function createHybridSpecies(species1: Species, species2: Species): Species {
  // Generate portmanteau name
  const name1 = species1.commonName;
  const name2 = species2.commonName;
  const hybridName = generatePortmanteau(name1, name2);

  // Weighted average traits (closer parent gets more weight)
  const t1 = species1.traits;
  const t2 = species2.traits;
  const w1 = 0.6; // slight bias toward first parent
  const w2 = 0.4;

  const hybridPerception: PerceptionProfile = {
    visualRange: Math.round(t1.perception.visualRange * w1 + t2.perception.visualRange * w2),
    hearingRange: Math.round(t1.perception.hearingRange * w1 + t2.perception.hearingRange * w2),
    smellRange: Math.round(t1.perception.smellRange * w1 + t2.perception.smellRange * w2),
    echolocation: t1.perception.echolocation || t2.perception.echolocation,
    electroreception: t1.perception.electroreception || t2.perception.electroreception,
    thermalSensing: t1.perception.thermalSensing || t2.perception.thermalSensing,
  };

  const hybridTraits: SpeciesTraits = {
    lifespan: Math.round(t1.lifespan * w1 + t2.lifespan * w2),
    size: Math.round(t1.size * w1 + t2.size * w2 + worldRNG.gaussian(0, 5)),
    speed: Math.round(t1.speed * w1 + t2.speed * w2 + worldRNG.gaussian(0, 3)),
    strength: Math.round(t1.strength * w1 + t2.strength * w2 + worldRNG.gaussian(0, 3)),
    intelligence: Math.round(t1.intelligence * w1 + t2.intelligence * w2 + worldRNG.gaussian(0, 3)),
    perception: hybridPerception,
    diet: worldRNG.chance(w1) ? t1.diet : t2.diet,
    habitat: [...new Set([...t1.habitat, ...t2.habitat])],
    socialStructure: worldRNG.chance(w1) ? t1.socialStructure : t2.socialStructure,
    reproductionRate: Math.round(t1.reproductionRate * w1 + t2.reproductionRate * w2),
    gestationTicks: Math.round(t1.gestationTicks * w1 + t2.gestationTicks * w2),
    maturityTicks: Math.round(t1.maturityTicks * w1 + t2.maturityTicks * w2),
    nocturnal: worldRNG.chance(0.5) ? t1.nocturnal : t2.nocturnal,
    aquatic: t1.aquatic || t2.aquatic,
    canFly: t1.canFly && t2.canFly, // both must fly
  };

  // Taxonomy: new genus under the closer parent's family
  const taxonomy: TaxonomyPath = {
    class: species1.taxonomy.class,
    order: species1.taxonomy.order,
    family: species1.taxonomy.family,
    genus: `Hybrid_${species1.taxonomy.genus}_${species2.taxonomy.genus}`.slice(0, 30),
    species: hybridName,
  };

  return speciesRegistry.register({
    commonName: hybridName,
    scientificName: `${taxonomy.genus} ${hybridName.toLowerCase()}`,
    taxonomy,
    tier: 'generated',
    traitOverrides: hybridTraits,
  });
}

function generatePortmanteau(name1: string, name2: string): string {
  // Take first half of name1 and second half of name2
  const mid1 = Math.ceil(name1.length / 2);
  const mid2 = Math.floor(name2.length / 2);
  const result = name1.slice(0, mid1) + name2.slice(mid2);
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
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
  const isCrossSpecies = parent1.speciesId !== parent2.speciesId;
  const isHybrid = isCrossSpecies && checkHybridSpeciation(parent1, parent2);

  // For hybrid speciation, create a new species
  let offspringSpeciesId = parent1.speciesId;
  if (isHybrid && isCrossSpecies) {
    const sp1 = speciesRegistry.get(parent1.speciesId);
    const sp2 = speciesRegistry.get(parent2.speciesId);
    if (sp1 && sp2) {
      const hybridSpecies = createHybridSpecies(sp1, sp2);
      offspringSpeciesId = hybridSpecies.id;
    }
  }

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
      speciesId: offspringSpeciesId,
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
