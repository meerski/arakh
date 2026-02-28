// ============================================================
// Ecosystem — Food Web, Population Dynamics, Resources
// ============================================================
// Full Lotka-Volterra inspired dynamics with species-appropriate
// growth rates, resource consumption, trophic cascades, migration,
// carrying capacity, collapse detection, and recovery mechanics.

import type { Region, RegionId, SpeciesId, Population, Resource, WorldEvent } from '../types.js';
import { worldRNG } from './random.js';
import { speciesRegistry } from '../species/species.js';

// ============================================================
// Types
// ============================================================

export interface FoodWebEntry {
  predatorId: SpeciesId;
  preyId: SpeciesId;
  efficiency: number;       // 0-1, energy transfer efficiency
}

export interface EcosystemState {
  foodWeb: FoodWebEntry[];
  carryingCapacity: Map<string, number>;  // regionId -> max total pop
  /** Per-species carrying capacity overrides: "regionId:speciesId" -> cap */
  speciesCapacity: Map<string, number>;
}

/** Minimum viable population — below this, stochastic extinction accelerates */
const MVP_THRESHOLD = 5;

/** Population below which recovery bonus kicks in */
const RECOVERY_THRESHOLD = 20;

// ============================================================
// Factory & Food Web Management
// ============================================================

export function createEcosystemState(): EcosystemState {
  return {
    foodWeb: [],
    carryingCapacity: new Map(),
    speciesCapacity: new Map(),
  };
}

export function addFoodWebRelation(
  ecosystem: EcosystemState,
  predator: SpeciesId,
  prey: SpeciesId,
  efficiency: number = 0.1,
): void {
  ecosystem.foodWeb.push({ predatorId: predator, preyId: prey, efficiency });
}

export function getPreyOf(ecosystem: EcosystemState, speciesId: SpeciesId): FoodWebEntry[] {
  return ecosystem.foodWeb.filter(e => e.predatorId === speciesId);
}

export function getPredatorsOf(ecosystem: EcosystemState, speciesId: SpeciesId): FoodWebEntry[] {
  return ecosystem.foodWeb.filter(e => e.preyId === speciesId);
}

// ============================================================
// Species-Appropriate Growth Rate
// ============================================================

/**
 * Compute the intrinsic growth rate for a species.
 * Fast-breeding species (insects, rodents) grow much faster than
 * slow-breeding species (whales, elephants).
 *
 * Growth rate derived from: reproductionRate / gestationTicks
 * Scaled to per-tick values (small numbers).
 */
function getSpeciesGrowthRate(speciesId: SpeciesId): number {
  const species = speciesRegistry.get(speciesId);
  if (!species) return 0.001; // fallback

  const { reproductionRate, gestationTicks, lifespan } = species.traits;

  // Births per tick = (offspring per breeding) / (gestation period)
  // Scaled down to prevent explosive growth
  const birthRate = (reproductionRate / Math.max(1, gestationTicks)) * 0.01;

  // Natural death rate = 1 / lifespan (probability of dying per tick)
  const deathRate = 1 / Math.max(1, lifespan);

  // Net intrinsic growth = birth rate - death rate
  // Clamped to prevent negative intrinsic growth (death rate handled separately)
  return Math.max(0.0001, birthRate - deathRate * 0.5);
}

// ============================================================
// Resource Consumption
// ============================================================

/**
 * Calculate resource availability for a species based on its diet.
 * Consumes resources from the region. Returns a 0-1 factor.
 */
function consumeResources(region: Region, pop: Population): number {
  const species = speciesRegistry.get(pop.speciesId);
  if (!species || pop.count === 0) return 1;

  const { diet, size } = species.traits;
  // Consumption per individual per tick, scaled by body size
  const consumptionPerCapita = 0.001 * Math.max(0.1, size / 50);
  const totalDemand = pop.count * consumptionPerCapita;

  if (diet === 'herbivore' || diet === 'omnivore') {
    // Consume plant/vegetation resources
    const plantResources = region.resources.filter(r =>
      ['vegetation', 'grass', 'berries', 'fruit', 'seeds', 'algae', 'kelp', 'plankton',
       'bamboo', 'leaves', 'roots', 'bark', 'nectar', 'pollen', 'fungi'].includes(r.type)
    );
    if (plantResources.length === 0) {
      // Fall back to any resource
      return consumeFromPool(region.resources, totalDemand * (diet === 'omnivore' ? 0.5 : 1));
    }
    return consumeFromPool(plantResources, totalDemand * (diet === 'omnivore' ? 0.5 : 1));
  }

  if (diet === 'detritivore') {
    // Detritivores consume dead matter — modeled as a fraction of all resources
    const available = region.resources.reduce((s, r) => s + r.quantity, 0);
    const consumed = Math.min(available * 0.01, totalDemand);
    // Detritivores don't deplete resources as heavily — they recycle
    return Math.min(1, (consumed + 0.5) / Math.max(0.01, totalDemand));
  }

  if (diet === 'filter_feeder') {
    // Filter feeders consume plankton/particulates in water biomes
    const waterResources = region.resources.filter(r =>
      ['plankton', 'krill', 'algae', 'organic_matter'].includes(r.type)
    );
    if (waterResources.length === 0) return 0.5; // Some baseline
    return consumeFromPool(waterResources, totalDemand);
  }

  // Carnivores get their sustenance from prey, not resources directly
  // Return baseline — their food comes from prey populations
  return 0.8;
}

/** Consume from a pool of resources, returning a 0-1 satisfaction factor */
function consumeFromPool(resources: Resource[], demand: number): number {
  if (resources.length === 0 || demand <= 0) return 1;

  const available = resources.reduce((s, r) => s + r.quantity, 0);
  if (available <= 0) return 0;

  const consumed = Math.min(available, demand);
  const satisfaction = consumed / demand;

  // Distribute consumption proportionally across resources
  const ratio = consumed / available;
  for (const r of resources) {
    r.quantity = Math.max(0, r.quantity - r.quantity * ratio * 0.1);
  }

  return Math.min(1, satisfaction);
}

// ============================================================
// Population Dynamics — Main Per-Region Update
// ============================================================

/**
 * Update all populations in a region using species-appropriate
 * Lotka-Volterra dynamics with resource consumption.
 */
export function updatePopulations(region: Region, ecosystem: EcosystemState): PopulationUpdate[] {
  const rng = worldRNG;
  const regionCapacity = ecosystem.carryingCapacity.get(region.id) ?? 10000;
  const updates: PopulationUpdate[] = [];

  // Snapshot populations before modification (for predator-prey calculations)
  const popSnapshot = new Map<SpeciesId, number>();
  for (const pop of region.populations) {
    popSnapshot.set(pop.speciesId, pop.count);
  }

  const totalPop = region.populations.reduce((s, p) => s + p.count, 0);

  for (const pop of region.populations) {
    if (pop.count <= 0) continue;

    const species = speciesRegistry.get(pop.speciesId);
    if (!species) continue;

    // 1. Species-specific intrinsic growth rate
    const growthRate = getSpeciesGrowthRate(pop.speciesId);

    // 2. Resource consumption and satisfaction
    const resourceSatisfaction = consumeResources(region, pop);

    // 3. Predation pressure (from predators eating this species)
    const predatorEntries = getPredatorsOf(ecosystem, pop.speciesId);
    let predationLoss = 0;
    for (const entry of predatorEntries) {
      const predCount = popSnapshot.get(entry.predatorId) ?? 0;
      // Predation scales with predator count and efficiency
      predationLoss += predCount * entry.efficiency * 0.001;
    }

    // 4. Prey availability bonus (for predators/omnivores)
    const preyEntries = getPreyOf(ecosystem, pop.speciesId);
    let preyBonus = 0;
    if (preyEntries.length > 0) {
      for (const entry of preyEntries) {
        const preyCount = popSnapshot.get(entry.preyId) ?? 0;
        if (preyCount > 0) {
          // Predators benefit from prey — energy transfer
          preyBonus += (preyCount / (preyCount + pop.count)) * entry.efficiency * 0.01;
        }
      }
      // If no prey available at all, predators starve faster
      const totalPreyAvailable = preyEntries.reduce((s, e) => s + (popSnapshot.get(e.preyId) ?? 0), 0);
      if (totalPreyAvailable === 0 && species.traits.diet === 'carnivore') {
        // Trophic cascade: predators die off non-linearly when prey collapses
        predationLoss += 0.01; // Additional starvation pressure
      }
    }

    // 5. Density-dependent regulation (logistic growth)
    const speciesCapKey = `${region.id}:${pop.speciesId}`;
    const speciesCap = ecosystem.speciesCapacity.get(speciesCapKey) ?? regionCapacity;
    const densityFactor = Math.max(0, 1 - totalPop / regionCapacity);
    const speciesDensity = Math.max(0, 1 - pop.count / speciesCap);
    const effectiveDensity = Math.min(densityFactor, speciesDensity);

    // 6. Environmental stress
    const pollutionPenalty = region.climate.pollution * 0.002;
    const temperatureStress = getTemperatureStress(region, species.traits.habitat);

    // 7. Calculate net change
    const growth = pop.count * (growthRate * resourceSatisfaction + preyBonus) * effectiveDensity;
    const losses = pop.count * (predationLoss + pollutionPenalty + temperatureStress);

    // 8. Stochastic noise (demographic stochasticity)
    const noise = rng.gaussian(0, Math.sqrt(Math.max(1, pop.count)) * 0.005);

    // 9. MVP effect: small populations have increased extinction risk
    let mvpPenalty = 0;
    if (pop.count < MVP_THRESHOLD && pop.count > 0) {
      mvpPenalty = (MVP_THRESHOLD - pop.count) * 0.01;
    }

    // 10. Recovery bonus: depleted populations bounce back faster when conditions improve
    let recoveryBonus = 0;
    if (pop.count < RECOVERY_THRESHOLD && pop.count > MVP_THRESHOLD && resourceSatisfaction > 0.7 && predationLoss < 0.001) {
      recoveryBonus = growthRate * 0.5; // 50% growth boost during recovery
    }

    const delta = growth - losses + noise + (pop.count * recoveryBonus) - (pop.count * mvpPenalty);
    const oldCount = pop.count;
    pop.count = Math.max(0, Math.round(pop.count + delta));

    const actualDelta = pop.count - oldCount;

    // Sync with species registry
    if (actualDelta !== 0) {
      speciesRegistry.updatePopulation(pop.speciesId, actualDelta);
    }

    updates.push({
      speciesId: pop.speciesId,
      oldCount,
      newCount: pop.count,
      delta: actualDelta,
      growthRate,
      resourceSatisfaction,
      predationLoss,
      preyBonus,
    });
  }

  return updates;
}

export interface PopulationUpdate {
  speciesId: SpeciesId;
  oldCount: number;
  newCount: number;
  delta: number;
  growthRate: number;
  resourceSatisfaction: number;
  predationLoss: number;
  preyBonus: number;
}

/** Temperature stress for populations in extreme conditions */
function getTemperatureStress(region: Region, habitats: string[]): number {
  const temp = region.climate.temperature;
  // Underground and underwater are buffered
  if (habitats.includes('underground') || habitats.includes('underwater')) return 0;
  // Extreme heat or cold
  if (temp > 45) return (temp - 45) * 0.001;
  if (temp < -30) return (-30 - temp) * 0.001;
  return 0;
}

// ============================================================
// Migration
// ============================================================

/**
 * Check if populations should migrate to connected regions.
 * Triggered when a region is near carrying capacity or resources are scarce.
 */
export function checkMigration(
  region: Region,
  ecosystem: EcosystemState,
  allRegions: Map<RegionId, Region>,
): MigrationEvent[] {
  const migrations: MigrationEvent[] = [];
  const regionCapacity = ecosystem.carryingCapacity.get(region.id) ?? 10000;
  const totalPop = region.populations.reduce((s, p) => s + p.count, 0);

  // Only migrate when significantly over 70% capacity
  if (totalPop < regionCapacity * 0.7) return migrations;

  for (const pop of region.populations) {
    if (pop.count < 10) continue; // Too few to migrate

    const species = speciesRegistry.get(pop.speciesId);
    if (!species) continue;

    // Migration probability increases with overcrowding
    const pressure = totalPop / regionCapacity;
    if (!worldRNG.chance(Math.min(0.1, (pressure - 0.7) * 0.05))) continue;

    // Find a suitable connected region
    for (const connId of region.connections) {
      const target = allRegions.get(connId);
      if (!target) continue;

      // Check habitat suitability
      if (!species.traits.habitat.includes(target.layer)) continue;

      // Check target isn't also full
      const targetPop = target.populations.reduce((s, p) => s + p.count, 0);
      const targetCap = ecosystem.carryingCapacity.get(target.id) ?? 10000;
      if (targetPop > targetCap * 0.9) continue;

      // Migrate 10-20% of population
      const migrateCount = Math.max(1, Math.round(pop.count * worldRNG.float(0.1, 0.2)));
      pop.count -= migrateCount;

      // Add to target region
      let targetSpeciesPop = target.populations.find(p => p.speciesId === pop.speciesId);
      if (!targetSpeciesPop) {
        targetSpeciesPop = { speciesId: pop.speciesId, count: 0, characters: [] };
        target.populations.push(targetSpeciesPop);
      }
      targetSpeciesPop.count += migrateCount;

      migrations.push({
        speciesId: pop.speciesId,
        fromRegionId: region.id,
        toRegionId: target.id,
        count: migrateCount,
      });

      break; // One migration per species per tick
    }
  }

  return migrations;
}

export interface MigrationEvent {
  speciesId: SpeciesId;
  fromRegionId: RegionId;
  toRegionId: RegionId;
  count: number;
}

// ============================================================
// Ecosystem Health & Collapse
// ============================================================

/**
 * Check ecosystem health and generate events for collapses.
 * Returns WorldEvents for significant ecological changes.
 */
export function checkEcosystemHealth(region: Region, tick: number): WorldEvent[] {
  const events: WorldEvent[] = [];

  // Check for local extinctions
  for (const pop of region.populations) {
    if (pop.count === 0) {
      const species = speciesRegistry.get(pop.speciesId);
      const name = species?.commonName ?? pop.speciesId;

      // Check if globally extinct
      if (species && species.totalPopulation <= 0 && species.status !== 'extinct') {
        speciesRegistry.markExtinct(pop.speciesId);
        events.push({
          id: crypto.randomUUID(),
          type: 'extinction',
          level: 'global',
          regionIds: [region.id],
          description: `The ${name} has gone globally extinct. The last of their kind has perished.`,
          tick,
          effects: [{ type: 'extinction', speciesId: pop.speciesId, magnitude: 1.0 }],
          resolved: true,
        });
      } else {
        events.push({
          id: crypto.randomUUID(),
          type: 'extinction',
          level: 'regional',
          regionIds: [region.id],
          description: `The ${name} has gone locally extinct in ${region.name}.`,
          tick,
          effects: [{ type: 'local_extinction', speciesId: pop.speciesId, regionId: region.id, magnitude: 0.5 }],
          resolved: true,
        });
      }
    }
  }

  // Check resource depletion
  for (const resource of region.resources) {
    if (resource.quantity < resource.maxQuantity * 0.05) {
      events.push({
        id: crypto.randomUUID(),
        type: 'resource_depletion',
        level: 'regional',
        regionIds: [region.id],
        description: `${resource.type} is critically depleted in ${region.name}. The ecosystem strains under the shortage.`,
        tick,
        effects: [{ type: 'resource_depletion', regionId: region.id, magnitude: 0.7 }],
        resolved: false,
      });
    }
  }

  // Pollution crisis
  if (region.climate.pollution > 0.8) {
    events.push({
      id: crypto.randomUUID(),
      type: 'resource_depletion',
      level: 'regional',
      regionIds: [region.id],
      description: `${region.name} is choking under severe pollution. Life struggles to survive.`,
      tick,
      effects: [{ type: 'pollution_crisis', regionId: region.id, magnitude: region.climate.pollution }],
      resolved: false,
    });
  }

  // Clean up zero-count populations (remove from list to prevent spam)
  region.populations = region.populations.filter(p => p.count > 0);

  return events;
}

// ============================================================
// Pollution Feedback
// ============================================================

/**
 * Generate pollution from high population density and activity.
 * Regions with more populations generate more waste.
 */
export function generatePopulationPollution(region: Region, ecosystem: EcosystemState): void {
  const totalPop = region.populations.reduce((s, p) => s + p.count, 0);
  const capacity = ecosystem.carryingCapacity.get(region.id) ?? 10000;

  // Pollution from overcrowding — only when exceeding 80% capacity
  if (totalPop > capacity * 0.8) {
    const excess = (totalPop - capacity * 0.8) / capacity;
    region.climate.pollution = Math.min(1, region.climate.pollution + excess * 0.0001);
  }
}

// ============================================================
// Resource Regeneration
// ============================================================

/** Regenerate resources each tick */
export function regenerateResources(region: Region): void {
  for (const resource of region.resources) {
    // Pollution reduces regeneration rate
    const pollutionFactor = 1 - region.climate.pollution * 0.5;
    const effectiveRegen = resource.renewRate * Math.max(0.1, pollutionFactor);

    resource.quantity = Math.min(
      resource.maxQuantity,
      resource.quantity + effectiveRegen,
    );
  }
}
