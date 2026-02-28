// ============================================================
// Hybrid Species System
// ============================================================
// Handles inter-species breeding outcomes: viability checks,
// trait blending, hybrid species registration, fertility rules.

import type { Character, Species, SpeciesId, SpeciesTraits, TaxonomyPath } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from './species.js';

// --- Hybrid Viability ---

export interface HybridViability {
  viable: boolean;
  reason?: string;
  fertility: number;       // 0-1, chance offspring are fertile (0 = sterile hybrid like mule)
  traitDominance: 'parent1' | 'parent2' | 'blended';
}

/**
 * Check if two species can produce a viable hybrid.
 * Based on taxonomic distance — closer species are more compatible.
 */
export function checkHybridViability(speciesA: Species, speciesB: Species): HybridViability {
  const taxA = speciesA.taxonomy;
  const taxB = speciesB.taxonomy;

  // Same species — not a hybrid
  if (speciesA.id === speciesB.id) {
    return { viable: false, reason: 'Same species', fertility: 1, traitDominance: 'blended' };
  }

  // Different class — impossible
  if (taxA.class !== taxB.class) {
    return { viable: false, reason: 'Too distantly related (different class)', fertility: 0, traitDominance: 'blended' };
  }

  // Same genus — most viable (like horse + donkey = mule)
  if (taxA.genus === taxB.genus) {
    return {
      viable: true,
      fertility: 0.1, // Most inter-species hybrids are infertile or nearly so
      traitDominance: 'blended',
    };
  }

  // Same family — possible but rare and low fertility
  if (taxA.family === taxB.family) {
    return {
      viable: worldRNG.chance(0.3),
      reason: worldRNG.chance(0.3) ? undefined : 'Genetic incompatibility',
      fertility: 0.01,
      traitDominance: worldRNG.chance(0.5) ? 'parent1' : 'parent2',
    };
  }

  // Same order — extremely unlikely
  if (taxA.order === taxB.order) {
    return {
      viable: worldRNG.chance(0.01),
      reason: worldRNG.chance(0.01) ? undefined : 'Too distantly related',
      fertility: 0,
      traitDominance: worldRNG.chance(0.5) ? 'parent1' : 'parent2',
    };
  }

  // Different order, same class — not viable
  return { viable: false, reason: 'Too distantly related (different order)', fertility: 0, traitDominance: 'blended' };
}

/**
 * Blend traits from two species to create hybrid species traits.
 */
export function blendHybridTraits(
  traitsA: SpeciesTraits,
  traitsB: SpeciesTraits,
  dominance: HybridViability['traitDominance'],
): Partial<SpeciesTraits> {
  const w1 = dominance === 'parent1' ? 0.7 : dominance === 'parent2' ? 0.3 : 0.5;
  const w2 = 1 - w1;

  return {
    lifespan: Math.round(traitsA.lifespan * w1 + traitsB.lifespan * w2),
    size: Math.round(traitsA.size * w1 + traitsB.size * w2),
    speed: Math.round(traitsA.speed * w1 + traitsB.speed * w2),
    strength: Math.round(traitsA.strength * w1 + traitsB.strength * w2),
    intelligence: Math.round(traitsA.intelligence * w1 + traitsB.intelligence * w2),
    reproductionRate: Math.round(traitsA.reproductionRate * w1 + traitsB.reproductionRate * w2),
    gestationTicks: Math.round(traitsA.gestationTicks * w1 + traitsB.gestationTicks * w2),
    maturityTicks: Math.round(traitsA.maturityTicks * w1 + traitsB.maturityTicks * w2),
    // Take habitats from both parents (union)
    habitat: [...new Set([...traitsA.habitat, ...traitsB.habitat])],
    // Pick one diet (dominant parent or random)
    diet: dominance === 'parent1' ? traitsA.diet
      : dominance === 'parent2' ? traitsB.diet
      : worldRNG.chance(0.5) ? traitsA.diet : traitsB.diet,
    aquatic: traitsA.aquatic || traitsB.aquatic,
    canFly: traitsA.canFly && traitsB.canFly, // Both must fly for hybrid to fly
    nocturnal: worldRNG.chance(0.5) ? traitsA.nocturnal : traitsB.nocturnal,
    socialStructure: worldRNG.chance(w1) ? traitsA.socialStructure : traitsB.socialStructure,
    perception: {
      visualRange: Math.round(traitsA.perception.visualRange * w1 + traitsB.perception.visualRange * w2),
      hearingRange: Math.round(traitsA.perception.hearingRange * w1 + traitsB.perception.hearingRange * w2),
      smellRange: Math.round(traitsA.perception.smellRange * w1 + traitsB.perception.smellRange * w2),
      echolocation: traitsA.perception.echolocation || traitsB.perception.echolocation,
      electroreception: traitsA.perception.electroreception || traitsB.perception.electroreception,
      thermalSensing: traitsA.perception.thermalSensing || traitsB.perception.thermalSensing,
    },
  };
}

/**
 * Create and register a new hybrid species.
 * Returns the new species ID, or null if not viable.
 */
export function createHybridSpecies(parent1: Character, parent2: Character): SpeciesId | null {
  const speciesA = speciesRegistry.get(parent1.speciesId);
  const speciesB = speciesRegistry.get(parent2.speciesId);
  if (!speciesA || !speciesB) return null;

  const viability = checkHybridViability(speciesA, speciesB);
  if (!viability.viable) return null;

  const blendedTraits = blendHybridTraits(speciesA.traits, speciesB.traits, viability.traitDominance);

  // Generate hybrid taxonomy — placed in parent1's genus with new species name
  const taxonomy: TaxonomyPath = {
    class: speciesA.taxonomy.class,
    order: speciesA.taxonomy.order,
    family: speciesA.taxonomy.family,
    genus: speciesA.taxonomy.genus,
    species: `${speciesA.taxonomy.species}_x_${speciesB.taxonomy.species}`,
  };

  const hybridSpecies = speciesRegistry.register({
    commonName: `${speciesA.commonName}-${speciesB.commonName} Hybrid`,
    scientificName: `${speciesA.scientificName} × ${speciesB.scientificName}`,
    taxonomy,
    tier: 'generated',
    traitOverrides: blendedTraits,
  });

  return hybridSpecies.id;
}
