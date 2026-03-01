// ============================================================
// Population Genome — Compressed Genetic Representation
// ============================================================
// When a family tree transitions from Individual to Lineage/Population tier,
// individual Character genetics are compressed into a PopulationGenome
// that captures trait distributions. New standouts can be sampled from it.

import type { Character, Genetics, PopulationGenome, Gene } from '../types.js';
import { worldRNG } from '../simulation/random.js';

/** Build a PopulationGenome from a set of characters. */
export function buildPopulationGenome(characters: Character[]): PopulationGenome {
  if (characters.length === 0) {
    return {
      traitMeans: {},
      traitVariance: {},
      dominanceLikelihoods: {},
      mutationRate: 0.05,
      sampleSize: 0,
    };
  }

  const traitSums: Record<string, number> = {};
  const traitSqSums: Record<string, number> = {};
  const traitDomCounts: Record<string, number> = {};
  const traitCounts: Record<string, number> = {};
  let mutationRateSum = 0;

  for (const char of characters) {
    mutationRateSum += char.genetics.mutationRate;
    for (const gene of char.genetics.genes) {
      traitSums[gene.trait] = (traitSums[gene.trait] ?? 0) + gene.value;
      traitSqSums[gene.trait] = (traitSqSums[gene.trait] ?? 0) + gene.value * gene.value;
      traitDomCounts[gene.trait] = (traitDomCounts[gene.trait] ?? 0) + (gene.dominant ? 1 : 0);
      traitCounts[gene.trait] = (traitCounts[gene.trait] ?? 0) + 1;
    }
  }

  const n = characters.length;
  const traitMeans: Record<string, number> = {};
  const traitVariance: Record<string, number> = {};
  const dominanceLikelihoods: Record<string, number> = {};

  for (const trait of Object.keys(traitSums)) {
    const count = traitCounts[trait];
    const mean = traitSums[trait] / count;
    traitMeans[trait] = Math.round(mean * 100) / 100;
    traitVariance[trait] = Math.round((traitSqSums[trait] / count - mean * mean) * 100) / 100;
    dominanceLikelihoods[trait] = Math.round((traitDomCounts[trait] / count) * 100) / 100;
  }

  return {
    traitMeans,
    traitVariance,
    dominanceLikelihoods,
    mutationRate: mutationRateSum / n,
    sampleSize: n,
  };
}

/** Sample genetics from a PopulationGenome (for creating standout characters). */
export function sampleGeneticsFromGenome(genome: PopulationGenome): Genetics {
  const genes: Gene[] = [];

  for (const trait of Object.keys(genome.traitMeans)) {
    const mean = genome.traitMeans[trait];
    const variance = genome.traitVariance[trait] ?? 25;
    const stddev = Math.sqrt(Math.max(1, variance));
    const value = Math.max(0, Math.min(100, worldRNG.gaussian(mean, stddev)));
    const dominanceChance = genome.dominanceLikelihoods[trait] ?? 0.5;

    genes.push({
      trait,
      value: Math.round(value),
      dominant: worldRNG.chance(dominanceChance),
    });
  }

  return {
    genes,
    mutationRate: genome.mutationRate,
  };
}

/** Merge a character's genetics into an existing PopulationGenome (incremental update). */
export function mergeIntoGenome(genome: PopulationGenome, character: Character): PopulationGenome {
  const n = genome.sampleSize;
  const n1 = n + 1;

  const traitMeans = { ...genome.traitMeans };
  const traitVariance = { ...genome.traitVariance };
  const dominanceLikelihoods = { ...genome.dominanceLikelihoods };

  for (const gene of character.genetics.genes) {
    const oldMean = traitMeans[gene.trait] ?? gene.value;
    const newMean = (oldMean * n + gene.value) / n1;
    traitMeans[gene.trait] = Math.round(newMean * 100) / 100;

    const oldVar = traitVariance[gene.trait] ?? 0;
    const newVar = n > 0
      ? (oldVar * n + (gene.value - oldMean) * (gene.value - newMean)) / n1
      : 0;
    traitVariance[gene.trait] = Math.round(Math.max(0, newVar) * 100) / 100;

    const oldDom = dominanceLikelihoods[gene.trait] ?? 0.5;
    dominanceLikelihoods[gene.trait] = Math.round(((oldDom * n + (gene.dominant ? 1 : 0)) / n1) * 100) / 100;
  }

  return {
    traitMeans,
    traitVariance,
    dominanceLikelihoods,
    mutationRate: (genome.mutationRate * n + character.genetics.mutationRate) / n1,
    sampleSize: n1,
  };
}
