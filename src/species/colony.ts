// ============================================================
// Colony — Swarm Mode for Eusocial Species
// ============================================================
// Colony-as-character for ants, bees, termites, wasps, etc.
// 4 health bars: Vitality, Cohesion, Provisions, Genetic Diversity.
// Colony tiers 1-5 based on worker count.
// Standouts emerge as playable main characters from the colony.

import type {
  Colony, ColonyId, ColonyTier, ColonyHealthBars,
  DirectiveWheel, DirectiveSector,
  SpeciesId, RegionId, FamilyTreeId, OwnerId, CharacterId,
  PopulationGenome,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';

// --- Colony Tier Thresholds ---
const TIER_THRESHOLDS: Record<ColonyTier, number> = {
  1: 0,       // Founding colony (1-49 workers)
  2: 50,      // Established (50-199)
  3: 200,     // Thriving (200-999)
  4: 1000,    // Dominant (1000-4999)
  5: 5000,    // Supercolony (5000+)
};

/** Determine colony tier from worker count. */
export function getColonyTier(workerCount: number): ColonyTier {
  if (workerCount >= TIER_THRESHOLDS[5]) return 5;
  if (workerCount >= TIER_THRESHOLDS[4]) return 4;
  if (workerCount >= TIER_THRESHOLDS[3]) return 3;
  if (workerCount >= TIER_THRESHOLDS[2]) return 2;
  return 1;
}

/** Create a default directive wheel. */
export function createDirectiveWheel(): DirectiveWheel {
  const sectors: DirectiveSector[] = [
    'expansion', 'defense', 'foraging',
    'reproduction', 'construction', 'diplomacy',
  ];
  return {
    sectors,
    active: ['foraging', 'defense'],
    weights: {
      expansion: 0.1,
      defense: 0.2,
      foraging: 0.3,
      reproduction: 0.15,
      construction: 0.15,
      diplomacy: 0.1,
    },
  };
}

/** Create a new colony. */
export function createColony(opts: {
  speciesId: SpeciesId;
  regionId: RegionId;
  familyTreeId: FamilyTreeId;
  ownerId: OwnerId | null;
  name: string;
  queenId: CharacterId | null;
  tick: number;
}): Colony {
  return {
    id: `colony-${crypto.randomUUID().slice(0, 8)}` as ColonyId,
    speciesId: opts.speciesId,
    regionId: opts.regionId,
    familyTreeId: opts.familyTreeId,
    ownerId: opts.ownerId,
    name: opts.name,
    tier: 1,
    health: {
      vitality: 1,
      cohesion: 1,
      provisions: 0.5,
      geneticDiversity: 0.8,
    },
    directives: createDirectiveWheel(),
    queenId: opts.queenId,
    standoutIds: [],
    workerCount: 10,
    soldierCount: 2,
    foundedAtTick: opts.tick,
    isAlive: true,
    diedAtTick: null,
    causeOfDeath: null,
    populationGenome: null,
    successionCrisis: false,
  };
}

// --- Colony Health Bar Updates ---

/** Tick colony health bars based on state. Returns narrative descriptions of significant changes. */
export function tickColonyHealth(colony: Colony): string[] {
  const narratives: string[] = [];
  const total = colony.workerCount + colony.soldierCount;

  // Vitality: based on queen presence and total population
  if (!colony.queenId) {
    colony.health.vitality = Math.max(0, colony.health.vitality - 0.02);
    if (colony.health.vitality < 0.3 && !colony.successionCrisis) {
      colony.successionCrisis = true;
      narratives.push(`${colony.name} is in succession crisis! The colony weakens without a queen.`);
    }
  } else {
    // Slow recovery when queen is present
    colony.health.vitality = Math.min(1, colony.health.vitality + 0.005);
  }

  // Cohesion: decays if population too large for tier, or during crises
  const tierCap = TIER_THRESHOLDS[Math.min(5, colony.tier + 1) as ColonyTier] ?? 10000;
  if (total > tierCap * 0.9) {
    colony.health.cohesion = Math.max(0, colony.health.cohesion - 0.01);
  }
  if (colony.successionCrisis) {
    colony.health.cohesion = Math.max(0, colony.health.cohesion - 0.015);
  }

  // Provisions: slowly drain each tick (workers consume food)
  const consumptionRate = 0.003 * (total / Math.max(1, colony.tier * 100));
  colony.health.provisions = Math.max(0, colony.health.provisions - consumptionRate);
  if (colony.health.provisions < 0.1) {
    narratives.push(`${colony.name} is starving! Provisions critically low.`);
    colony.health.vitality = Math.max(0, colony.health.vitality - 0.01);
  }

  // Genetic Diversity: slowly decays in small colonies
  if (total < 30) {
    colony.health.geneticDiversity = Math.max(0, colony.health.geneticDiversity - 0.002);
  }

  // Colony death check
  if (colony.health.vitality <= 0) {
    colony.isAlive = false;
    colony.causeOfDeath = colony.successionCrisis ? 'succession crisis' : 'colony collapse';
    narratives.push(`${colony.name} has collapsed. The colony is no more.`);
  }

  // Tier re-evaluation
  const newTier = getColonyTier(total);
  if (newTier !== colony.tier) {
    const oldTier = colony.tier;
    colony.tier = newTier;
    if (newTier > oldTier) {
      narratives.push(`${colony.name} has grown to tier ${newTier}!`);
    }
  }

  return narratives;
}

/** Apply foraging results to colony provisions. */
export function colonyForage(colony: Colony, successRate: number): void {
  const gain = 0.05 * successRate * (1 + colony.workerCount / 500);
  colony.health.provisions = Math.min(1, colony.health.provisions + gain);
}

/** Apply defense results to colony. */
export function colonyDefend(colony: Colony, threatLevel: number): void {
  const defenseStrength = colony.soldierCount / Math.max(1, colony.workerCount + colony.soldierCount);
  const damage = Math.max(0, threatLevel - defenseStrength) * 0.1;
  colony.health.vitality = Math.max(0, colony.health.vitality - damage);
  colony.health.cohesion = Math.max(0, colony.health.cohesion - damage * 0.5);
}

/** Expand colony worker count. */
export function colonyReproduce(colony: Colony): string | null {
  if (!colony.queenId) return null;
  if (colony.health.provisions < 0.2) return null;

  const newWorkers = Math.floor(worldRNG.float(1, 5) * colony.tier);
  const newSoldiers = worldRNG.chance(0.3) ? 1 : 0;
  colony.workerCount += newWorkers;
  colony.soldierCount += newSoldiers;
  colony.health.provisions = Math.max(0, colony.health.provisions - 0.03);

  return `${colony.name} brood hatches: ${newWorkers} workers${newSoldiers ? ' and 1 soldier' : ''}.`;
}

/** Build structures to improve colony. */
export function colonyConstruct(colony: Colony): string | null {
  if (colony.health.provisions < 0.15) return null;

  colony.health.provisions = Math.max(0, colony.health.provisions - 0.02);
  colony.health.cohesion = Math.min(1, colony.health.cohesion + 0.02);

  const structures = ['nursery chamber', 'storage chamber', 'ventilation tunnel', 'defensive wall', 'fungus garden'];
  const built = structures[Math.floor(worldRNG.float(0, structures.length))];
  return `${colony.name} constructs a new ${built}.`;
}

// --- Colony Registry ---

export class ColonyRegistry {
  private colonies: Map<ColonyId, Colony> = new Map();

  add(colony: Colony): void {
    this.colonies.set(colony.id, colony);
  }

  get(id: ColonyId): Colony | undefined {
    return this.colonies.get(id);
  }

  getByRegion(regionId: RegionId): Colony[] {
    return [...this.colonies.values()].filter(c => c.regionId === regionId && c.isAlive);
  }

  getBySpecies(speciesId: SpeciesId): Colony[] {
    return [...this.colonies.values()].filter(c => c.speciesId === speciesId && c.isAlive);
  }

  getByFamilyTree(familyTreeId: FamilyTreeId): Colony | undefined {
    return [...this.colonies.values()].find(c => c.familyTreeId === familyTreeId && c.isAlive);
  }

  getLiving(): Colony[] {
    return [...this.colonies.values()].filter(c => c.isAlive);
  }

  getAll(): Colony[] {
    return [...this.colonies.values()];
  }

  remove(id: ColonyId): void {
    this.colonies.delete(id);
  }

  clear(): void {
    this.colonies.clear();
  }

  restore(colony: Colony): void {
    this.colonies.set(colony.id, colony);
  }

  get size(): number {
    return this.colonies.size;
  }

  get livingCount(): number {
    return this.getLiving().length;
  }
}

// Singleton + bridge
export let colonyRegistry = new ColonyRegistry();

export function _installColonyRegistry(instance: ColonyRegistry): void {
  colonyRegistry = instance;
}
