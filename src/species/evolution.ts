// ============================================================
// Evolution & Speciation
// ============================================================
// Tracks genetic drift in isolated populations. When a population
// diverges enough from the parent species, a speciation event occurs
// and a new species is born.

import type { Character, SpeciesId, RegionId } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from './species.js';
import { getGeneValue } from './character.js';

// --- Mutation Tracking ---

export interface PopulationGenetics {
  speciesId: SpeciesId;
  regionId: RegionId;
  /** Average gene values across all living characters in this population */
  averageGenes: Map<string, number>;
  /** How many ticks this population has been isolated (no gene flow from other regions) */
  isolationTicks: number;
  /** Cumulative genetic distance from the species baseline */
  geneticDrift: number;
  /** Number of characters sampled */
  sampleSize: number;
}

/** Module-level tracking of population genetics per region-species pair */
const populationGenetics: Map<string, PopulationGenetics> = new Map();

function getKey(speciesId: SpeciesId, regionId: RegionId): string {
  return `${speciesId}:${regionId}`;
}

/** Update population genetics from a sample of characters in a region */
export function updatePopulationGenetics(
  characters: Character[],
  speciesId: SpeciesId,
  regionId: RegionId,
): PopulationGenetics {
  const key = getKey(speciesId, regionId);
  let pg = populationGenetics.get(key);

  if (!pg) {
    pg = {
      speciesId,
      regionId,
      averageGenes: new Map(),
      isolationTicks: 0,
      geneticDrift: 0,
      sampleSize: 0,
    };
    populationGenetics.set(key, pg);
  }

  const living = characters.filter(c => c.isAlive && c.speciesId === speciesId);
  if (living.length === 0) return pg;

  // Calculate average gene values
  const geneTraits = ['size', 'speed', 'strength', 'intelligence', 'endurance', 'aggression', 'curiosity', 'sociability'];
  for (const trait of geneTraits) {
    const avg = living.reduce((sum, c) => sum + getGeneValue(c, trait), 0) / living.length;
    pg.averageGenes.set(trait, avg);
  }
  pg.sampleSize = living.length;

  return pg;
}

/** Increment isolation counter. Call when no migration occurred this tick. */
export function incrementIsolation(speciesId: SpeciesId, regionId: RegionId): void {
  const key = getKey(speciesId, regionId);
  const pg = populationGenetics.get(key);
  if (pg) pg.isolationTicks++;
}

/** Reset isolation counter. Call when migration occurs. */
export function resetIsolation(speciesId: SpeciesId, regionId: RegionId): void {
  const key = getKey(speciesId, regionId);
  const pg = populationGenetics.get(key);
  if (pg) pg.isolationTicks = 0;
}

/**
 * Calculate genetic distance between a population and its species baseline.
 * Returns a 0-1 value where 1 means maximally diverged.
 */
export function calculateGeneticDrift(speciesId: SpeciesId, regionId: RegionId): number {
  const key = getKey(speciesId, regionId);
  const pg = populationGenetics.get(key);
  if (!pg || pg.sampleSize === 0) return 0;

  // Baseline is 50 for all genes (species average at creation)
  const geneTraits = ['size', 'speed', 'strength', 'intelligence', 'endurance', 'aggression', 'curiosity', 'sociability'];
  let totalDiff = 0;
  let count = 0;

  for (const trait of geneTraits) {
    const avg = pg.averageGenes.get(trait) ?? 50;
    totalDiff += Math.abs(avg - 50);
    count++;
  }

  // Normalize: max possible diff per gene is 50, so max total is 50 * geneCount
  const maxDiff = 50 * count;
  const drift = totalDiff / maxDiff;
  pg.geneticDrift = drift;
  return drift;
}

/**
 * Check if a population has diverged enough to speciate.
 * Requires: significant genetic drift AND long isolation period.
 */
export function checkSpeciation(speciesId: SpeciesId, regionId: RegionId): {
  shouldSpeciate: boolean;
  drift: number;
  isolationTicks: number;
} {
  const key = getKey(speciesId, regionId);
  const pg = populationGenetics.get(key);
  if (!pg) return { shouldSpeciate: false, drift: 0, isolationTicks: 0 };

  const drift = calculateGeneticDrift(speciesId, regionId);

  // Speciation thresholds:
  // - Minimum 10,000 ticks of isolation (~2.8 hours real time)
  // - Genetic drift > 0.3 (30% diverged from baseline)
  // - Probabilistic: higher drift = higher chance
  const ISOLATION_THRESHOLD = 10000;
  const DRIFT_THRESHOLD = 0.3;

  const meetsThresholds = pg.isolationTicks > ISOLATION_THRESHOLD && drift > DRIFT_THRESHOLD;
  const chance = meetsThresholds ? (drift - DRIFT_THRESHOLD) * 0.01 : 0;
  const shouldSpeciate = meetsThresholds && worldRNG.chance(chance);

  return { shouldSpeciate, drift, isolationTicks: pg.isolationTicks };
}

/**
 * Generate a name for a new species based on its parent and region.
 */
export function generateSpeciatedName(parentSpeciesName: string, regionName: string): {
  commonName: string;
  scientificName: string;
} {
  const rng = worldRNG;
  const prefixes = ['Greater', 'Lesser', 'Mountain', 'Plains', 'Island', 'Deep', 'Northern', 'Southern', 'Giant', 'Dwarf'];
  const prefix = rng.pick(prefixes);

  // Extract the base name (remove existing prefixes)
  const baseName = parentSpeciesName.replace(/^(Greater|Lesser|Mountain|Plains|Island|Deep|Northern|Southern|Giant|Dwarf)\s+/, '');

  return {
    commonName: `${prefix} ${baseName}`,
    scientificName: `${baseName.toLowerCase().replace(/\s+/g, '_')}_${regionName.toLowerCase().replace(/\s+/g, '_').slice(0, 10)}`,
  };
}

/** Get population genetics data for a species-region pair */
export function getPopulationGenetics(speciesId: SpeciesId, regionId: RegionId): PopulationGenetics | undefined {
  return populationGenetics.get(getKey(speciesId, regionId));
}

/** Reset all evolution state (for testing) */
export function resetEvolutionState(): void {
  populationGenetics.clear();
}
