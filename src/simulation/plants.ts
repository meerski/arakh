// ============================================================
// Plants — Living Ecosystem Layer
// ============================================================

import type { Region, PlantPopulation, PlantType, Biome, RegionId } from '../types.js';
import { worldRNG } from './random.js';

// Default plants per biome
const BIOME_PLANTS: Record<string, PlantType[]> = {
  tropical_rainforest: ['tropical_tree', 'shrub', 'fungi', 'moss'],
  temperate_forest: ['deciduous_tree', 'shrub', 'fungi', 'moss', 'grass'],
  boreal_forest: ['conifer', 'moss', 'fungi', 'shrub'],
  savanna: ['grass', 'shrub', 'deciduous_tree'],
  grassland: ['grass', 'shrub'],
  desert: ['cactus', 'shrub'],
  tundra: ['moss', 'grass'],
  mountain: ['grass', 'conifer', 'moss'],
  wetland: ['grass', 'moss', 'fungi', 'shrub'],
  coastal: ['grass', 'shrub', 'seagrass'],
  coral_reef: ['algae', 'seagrass'],
  open_ocean: ['plankton', 'algae'],
  deep_ocean: ['plankton'],
  hydrothermal_vent: ['fungi'],
  kelp_forest: ['kelp', 'algae', 'seagrass'],
  cave_system: ['fungi', 'moss'],
  underground_river: ['fungi', 'moss'],
  subterranean_ecosystem: ['fungi'],
};

// Default growth rates per plant type
const GROWTH_RATES: Record<PlantType, number> = {
  grass: 0.05,
  shrub: 0.03,
  deciduous_tree: 0.01,
  conifer: 0.008,
  tropical_tree: 0.015,
  algae: 0.08,
  kelp: 0.06,
  seagrass: 0.04,
  plankton: 0.1,
  fungi: 0.04,
  moss: 0.02,
  cactus: 0.005,
};

// Default max biomass per plant type
const MAX_BIOMASS: Record<PlantType, number> = {
  grass: 500,
  shrub: 400,
  deciduous_tree: 800,
  conifer: 700,
  tropical_tree: 1000,
  algae: 300,
  kelp: 600,
  seagrass: 400,
  plankton: 200,
  fungi: 200,
  moss: 150,
  cactus: 100,
};

export function getDefaultPlants(biome: string): PlantPopulation[] {
  const plantTypes = BIOME_PLANTS[biome] ?? ['grass'];
  return plantTypes.map(plantType => ({
    plantType,
    biomass: MAX_BIOMASS[plantType] * 0.7,  // Start at 70% capacity
    maxBiomass: MAX_BIOMASS[plantType],
    growthRate: GROWTH_RATES[plantType],
    spreadRate: GROWTH_RATES[plantType] * 0.1,
    permanentlyDestroyed: false,
    ticksBelowThreshold: 0,
  }));
}

export function updatePlantTick(region: Region): void {
  const pollution = region.climate.pollution;

  for (const plant of region.plantPopulations) {
    if (plant.permanentlyDestroyed) continue;

    // Logistic growth: delta = rate * biomass * (1 - biomass/max) * (1 - pollution*0.5)
    const growthFactor = 1 - plant.biomass / plant.maxBiomass;
    const pollutionFactor = 1 - pollution * 0.5;
    const delta = plant.growthRate * plant.biomass * growthFactor * pollutionFactor;

    plant.biomass = Math.max(0, Math.min(plant.maxBiomass, plant.biomass + delta));

    // Check overgrazing threshold
    checkOvergrazing(plant);
  }
}

export function consumePlantBiomass(region: Region, plantType: PlantType, amount: number): number {
  const plant = region.plantPopulations.find(p => p.plantType === plantType && !p.permanentlyDestroyed);
  if (!plant || plant.biomass <= 0) return 0;

  const consumed = Math.min(plant.biomass, amount);
  plant.biomass -= consumed;
  return consumed;
}

function checkOvergrazing(plant: PlantPopulation): void {
  if (plant.biomass < plant.maxBiomass * 0.05) {
    plant.ticksBelowThreshold++;
    if (plant.ticksBelowThreshold >= 500) {
      plant.permanentlyDestroyed = true;
    }
  } else {
    plant.ticksBelowThreshold = 0;
  }
}

/** Get the ratio of current plant biomass to max biomass for stress calculations */
export function getPlantBiomassRatio(region: Region): number {
  if (region.plantPopulations.length === 0) return 1;
  const total = region.plantPopulations.reduce((s, p) => s + p.biomass, 0);
  const max = region.plantPopulations.reduce((s, p) => s + p.maxBiomass, 0);
  return max > 0 ? total / max : 1;
}

export function spreadPlants(sourceRegion: Region, allRegions: Map<string, Region>): void {
  for (const plant of sourceRegion.plantPopulations) {
    if (plant.permanentlyDestroyed) continue;
    if (plant.biomass < plant.maxBiomass * 0.7) continue;
    if (!worldRNG.chance(plant.spreadRate)) continue;

    for (const connId of sourceRegion.connections) {
      const target = allRegions.get(connId);
      if (!target) continue;

      // Check if target region already has this plant
      const existing = target.plantPopulations.find(p => p.plantType === plant.plantType);
      if (existing && !existing.permanentlyDestroyed) continue;

      // Check biome compatibility
      const biomePlants = BIOME_PLANTS[target.biome];
      if (!biomePlants || !biomePlants.includes(plant.plantType)) continue;

      if (existing && existing.permanentlyDestroyed) {
        // Revive destroyed plants via spread (nature reclaims)
        existing.permanentlyDestroyed = false;
        existing.ticksBelowThreshold = 0;
        existing.biomass = plant.maxBiomass * 0.1;
      } else {
        // Seed new plant population
        target.plantPopulations.push({
          plantType: plant.plantType,
          biomass: plant.maxBiomass * 0.1,
          maxBiomass: plant.maxBiomass,
          growthRate: plant.growthRate,
          spreadRate: plant.spreadRate,
          permanentlyDestroyed: false,
          ticksBelowThreshold: 0,
        });
      }

      break;  // One spread per plant per tick
    }
  }
}
