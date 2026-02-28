// ============================================================
// Biome Suitability — Shared logic for species-to-region matching
// ============================================================

import type { Species, Region, Biome } from '../types.js';

/**
 * Biome groups by climate zone.
 * Used to prevent tropical species from spawning in polar regions and vice versa.
 */
const TROPICAL_BIOMES: Set<Biome> = new Set([
  'tropical_rainforest', 'savanna', 'coral_reef',
]);

const TEMPERATE_BIOMES: Set<Biome> = new Set([
  'temperate_forest', 'grassland', 'wetland', 'coastal', 'mountain',
]);

const COLD_BIOMES: Set<Biome> = new Set([
  'tundra', 'boreal_forest',
]);

const AQUATIC_BIOMES: Set<Biome> = new Set([
  'coral_reef', 'open_ocean', 'deep_ocean', 'hydrothermal_vent', 'kelp_forest',
  'wetland', 'coastal', 'underground_river',
]);

const UNDERGROUND_BIOMES: Set<Biome> = new Set([
  'cave_system', 'underground_river', 'subterranean_ecosystem',
]);

/**
 * Map species to their tolerated climate zones based on biological traits.
 * Species with high latitude tolerance (cold-adapted) can handle cold biomes.
 * Large herbivores from tropical/savanna lineages cannot survive polar regions.
 */
function getToleratedBiomes(species: Species): Set<Biome> | null {
  const { aquatic, canFly, size } = species.traits;
  const name = species.commonName.toLowerCase();
  const taxonomy = species.taxonomy;

  // Aquatic species — return aquatic biomes only
  if (aquatic && species.traits.habitat.includes('underwater')) {
    return AQUATIC_BIOMES;
  }

  // Flying species can go almost anywhere on the surface
  if (canFly) return null; // null = no restriction beyond layer check

  // Map known species/families to climate zones
  // Cold-adapted species
  const coldAdapted = isColdAdapted(name, taxonomy);
  const tropicalAdapted = isTropicalAdapted(name, taxonomy);

  if (coldAdapted && !tropicalAdapted) {
    // Only cold + temperate biomes
    return new Set([...COLD_BIOMES, ...TEMPERATE_BIOMES, ...UNDERGROUND_BIOMES]);
  }

  if (tropicalAdapted && !coldAdapted) {
    // Only tropical + temperate biomes
    return new Set([...TROPICAL_BIOMES, ...TEMPERATE_BIOMES, ...UNDERGROUND_BIOMES]);
  }

  // Generalist species (small, medium, or explicitly wide-ranging) — no climate restriction
  if (size < 30) return null;

  // Default: temperate + one adjacent zone based on taxonomy hints
  return null;
}

/** Check if a species is cold-adapted based on name/taxonomy */
function isColdAdapted(name: string, taxonomy: { family: string; order: string }): boolean {
  const coldNames = [
    'arctic', 'polar', 'snow', 'snowy', 'penguin', 'walrus', 'seal',
    'moose', 'caribou', 'reindeer', 'musk', 'lemming', 'wolverine',
    'arctic fox', 'ermine', 'ptarmigan', 'yak',
  ];
  if (coldNames.some(n => name.includes(n))) return true;

  const coldFamilies = ['Odobenidae', 'Phocidae'];
  if (coldFamilies.includes(taxonomy.family)) return true;

  return false;
}

/** Check if a species is tropical-adapted based on name/taxonomy */
function isTropicalAdapted(name: string, taxonomy: { family: string; order: string }): boolean {
  const tropicalNames = [
    'hippo', 'gorilla', 'chimpanzee', 'orangutan', 'elephant', 'giraffe',
    'lion', 'leopard', 'rhino', 'zebra', 'crocodile', 'parrot', 'macaw',
    'toucan', 'jaguar', 'sloth', 'pangolin', 'lemur', 'cassowary',
    'komodo', 'iguana', 'chameleon', 'anaconda', 'python', 'mamba',
    'flamingo', 'mandrill', 'baboon', 'colobus', 'howler',
  ];
  if (tropicalNames.some(n => name.includes(n))) return true;

  const tropicalFamilies = [
    'Hippopotamidae', 'Giraffidae', 'Rhinocerotidae',
    'Crocodylidae', 'Hominidae', 'Cercopithecidae',
  ];
  if (tropicalFamilies.includes(taxonomy.family)) return true;

  const tropicalOrders = ['Crocodilia', 'Pilosa', 'Pholidota'];
  if (tropicalOrders.includes(taxonomy.order)) return true;

  return false;
}

/**
 * Check if a biome is suitable for a species based on its traits.
 * Used by both initial population seeding and character spawning.
 */
export function isBiomeSuitable(species: Species, region: Region): boolean {
  const { aquatic, canFly } = species.traits;

  // Aquatic species need water biomes
  if (aquatic && species.traits.habitat.includes('underwater')) {
    return AQUATIC_BIOMES.has(region.biome);
  }

  // Semi-aquatic surface species (e.g. hippo): can use surface + wetland/coastal
  if (aquatic && species.traits.habitat.includes('surface')) {
    // Must be a biome with water access
    const waterBiomes: Set<Biome> = new Set([
      'wetland', 'coastal', 'savanna', 'tropical_rainforest',
      'temperate_forest', 'grassland',
    ]);
    if (!waterBiomes.has(region.biome)) return false;
  }

  // Flying species can go almost anywhere on matching layer
  if (canFly && region.layer === 'surface') {
    return checkClimateZone(species, region);
  }

  // Underground species
  if (region.layer === 'underground') {
    return species.traits.size < 30;
  }

  // Surface suitability — must pass climate zone check
  if (region.layer === 'surface') {
    return checkClimateZone(species, region);
  }

  return false;
}

/** Check if the species can tolerate the region's climate zone */
function checkClimateZone(species: Species, region: Region): boolean {
  const tolerated = getToleratedBiomes(species);
  // null means no restriction
  if (tolerated === null) return true;
  return tolerated.has(region.biome);
}

/** Get a biome-based capacity multiplier for population seeding */
export function getBiomeCapacityMultiplier(biome: string): number {
  const multipliers: Record<string, number> = {
    tropical_rainforest: 3.0,
    temperate_forest: 2.0,
    boreal_forest: 1.5,
    savanna: 2.0,
    grassland: 2.0,
    desert: 0.5,
    tundra: 0.3,
    mountain: 0.8,
    wetland: 2.5,
    coastal: 2.0,
    coral_reef: 3.0,
    open_ocean: 1.0,
    deep_ocean: 0.3,
    hydrothermal_vent: 0.5,
    kelp_forest: 2.0,
    cave_system: 0.5,
    underground_river: 0.8,
    subterranean_ecosystem: 0.6,
  };
  return multipliers[biome] ?? 1.0;
}
