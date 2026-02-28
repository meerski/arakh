// ============================================================
// Trait-Driven Evolution & Advancement System
// ============================================================

import type { Species, SpeciesId, RegionId, Character } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';
import { getGeneValue } from '../species/character.js';
import { advancementRegistry } from './advancement-registry.js';

/** Capability domains and their trait requirements */
export interface DomainRequirement {
  domain: string;
  check: (species: Species) => boolean;
  tiers: string[]; // tier 0-4 descriptions
}

const DOMAIN_DEFINITIONS: DomainRequirement[] = [
  {
    domain: 'manipulation',
    check: (s) => s.traits.intelligence > 20 && s.traits.size > 10,
    tiers: ['grip', 'tools', 'construction', 'engineering', 'megastructures'],
  },
  {
    domain: 'acoustic',
    check: (s) => s.traits.perception.hearingRange > 60 || s.traits.perception.echolocation,
    tiers: ['calls', 'sonar mapping', 'acoustic coordination', 'sound weapons', 'sonic mastery'],
  },
  {
    domain: 'chemical',
    check: (s) => s.traits.perception.smellRange > 50 || s.traits.socialStructure === 'hive' || s.traits.socialStructure === 'colony',
    tiers: ['scent marks', 'pheromone trails', 'chemical warfare', 'toxin brewing', 'bioalchemy'],
  },
  {
    domain: 'electric',
    check: (s) => s.traits.perception.electroreception,
    tiers: ['pulse sense', 'stun hunting', 'electric networks', 'bioelectric fields', 'lightning mastery'],
  },
  {
    domain: 'thermal',
    check: (s) => s.traits.perception.thermalSensing,
    tiers: ['heat tracking', 'infrared mapping', 'ambush mastery', 'thermal manipulation', 'heat dominion'],
  },
  {
    domain: 'visual',
    check: (s) => s.traits.perception.visualRange > 70,
    tiers: ['pattern recognition', 'camouflage', 'visual signaling', 'deception', 'illusion mastery'],
  },
  {
    domain: 'social',
    check: (s) => ['pack', 'herd', 'colony', 'hive'].includes(s.traits.socialStructure) && s.traits.intelligence > 20,
    tiers: ['cooperation', 'hierarchy', 'collective decisions', 'governance', 'civilization'],
  },
  {
    domain: 'architectural',
    check: (s) => s.traits.socialStructure === 'colony' || s.traits.socialStructure === 'hive' || s.traits.intelligence > 30,
    tiers: ['shelter', 'complex nests', 'environmental engineering', 'megastructures', 'world shaping'],
  },
  {
    domain: 'aquatic',
    check: (s) => s.traits.aquatic,
    tiers: ['current riding', 'depth navigation', 'pressure craft', 'reef construction', 'ocean mastery'],
  },
  {
    domain: 'aerial',
    check: (s) => s.traits.canFly,
    tiers: ['thermal riding', 'formation flight', 'dive bombing', 'aerial territory', 'sky dominion'],
  },
  {
    domain: 'predatory',
    check: (s) => (s.traits.diet === 'carnivore' || s.traits.diet === 'omnivore') && s.traits.strength > 40,
    tiers: ['pack tactics', 'ambush', 'weaponized body parts', 'siege hunting', 'apex dominion'],
  },
  {
    domain: 'defensive',
    check: (s) => s.traits.diet === 'herbivore' || s.traits.strength < 30,
    tiers: ['camouflage', 'armoring', 'venom development', 'fortress building', 'impregnable defense'],
  },
];

/** Get domains available to a species based on its traits */
export function getAvailableDomains(species: Species): string[] {
  return DOMAIN_DEFINITIONS
    .filter(d => d.check(species))
    .map(d => d.domain);
}

/** Research cost per tier (exponential scaling) */
const TIER_COSTS = [100, 300, 800, 2000, 5000];

export interface AdvancementEvent {
  domain: string;
  newTier: number;
  tierName: string;
  speciesId: SpeciesId;
  regionId: RegionId;
}

/**
 * Add research progress toward a domain. Returns an event when a new tier is unlocked.
 */
export function advanceResearch(
  speciesId: SpeciesId,
  regionId: RegionId,
  domain: string,
  points: number,
): AdvancementEvent | null {
  const species = speciesRegistry.get(speciesId);
  if (!species) return null;

  // Verify this domain is available
  const available = getAvailableDomains(species);
  if (!available.includes(domain)) return null;

  const adv = advancementRegistry.getOrCreate(speciesId, regionId);
  const currentTier = adv.domains[domain] ?? 0;

  if (currentTier >= 4) return null; // maxed out

  // Intelligence speeds research
  const intelBonus = 1 + (species.traits.intelligence / 100);
  const adjustedPoints = points * intelBonus;

  adv.researchProgress[domain] = (adv.researchProgress[domain] ?? 0) + adjustedPoints;

  const cost = TIER_COSTS[currentTier];
  if (adv.researchProgress[domain] >= cost) {
    adv.researchProgress[domain] -= cost;
    const newTier = currentTier + 1;
    adv.domains[domain] = newTier;

    const def = DOMAIN_DEFINITIONS.find(d => d.domain === domain);
    return {
      domain,
      newTier,
      tierName: def?.tiers[newTier] ?? `tier ${newTier}`,
      speciesId,
      regionId,
    };
  }

  return null;
}

/**
 * Check if a species' advancement level supports a given action.
 */
export function canAttemptAction(
  species: Species,
  regionId: RegionId,
  actionType: string,
): { allowed: boolean; reason: string } {
  const adv = advancementRegistry.get(species.id, regionId);
  const getTier = (domain: string) => adv?.domains[domain] ?? 0;

  switch (actionType) {
    case 'craft':
      if (getTier('manipulation') < 1) {
        return { allowed: false, reason: `${species.commonName}s lack the manipulation ability to craft. They need opposable appendages or equivalent.` };
      }
      return { allowed: true, reason: '' };

    case 'build':
      if (getTier('architectural') < 1 && getTier('manipulation') < 2) {
        return { allowed: false, reason: `${species.commonName}s haven't developed building capabilities yet.` };
      }
      return { allowed: true, reason: '' };

    default:
      return { allowed: true, reason: '' };
  }
}

// ============================================================
// Slow Physical Evolution — Species-level trait shifts
// ============================================================

/**
 * Check for slow evolutionary adaptations based on collective behavior.
 * Called periodically (not every tick) for a species in a region.
 */
export function tickEvolution(
  speciesId: SpeciesId,
  regionId: RegionId,
  characters: Character[],
  tick: number,
): string | null {
  const species = speciesRegistry.get(speciesId);
  if (!species || characters.length < 5) return null;

  // Only check every 500 ticks
  if (tick % 500 !== 0) return null;

  // --- Diet shift detection ---
  // Count how many characters have been hunting vs foraging
  const hunters = characters.filter(c =>
    c.knowledge.some(k => k.topic.startsWith('experiment_hunt') || k.topic === 'local_fauna'),
  ).length;
  const foragers = characters.filter(c =>
    c.knowledge.some(k => k.topic === 'local_flora' || k.topic.startsWith('experiment_forage')),
  ).length;

  const huntRatio = hunters / characters.length;
  const forageRatio = foragers / characters.length;

  if (species.traits.diet === 'herbivore' && huntRatio > 0.6 && worldRNG.chance(0.02)) {
    species.traits.diet = 'omnivore';
    return `The ${species.commonName}s in this region have begun supplementing their diet with meat. A dietary shift is underway.`;
  }

  if (species.traits.diet === 'omnivore' && huntRatio > 0.8 && worldRNG.chance(0.01)) {
    species.traits.diet = 'carnivore';
    return `The ${species.commonName}s have fully transitioned to a carnivorous diet. Evolution in action.`;
  }

  if (species.traits.diet === 'carnivore' && forageRatio > 0.7 && worldRNG.chance(0.01)) {
    species.traits.diet = 'omnivore';
    return `The ${species.commonName}s have begun eating plants. Survival demands flexibility.`;
  }

  // --- Size drift ---
  const avgStrength = characters.reduce((sum, c) => sum + getGeneValue(c, 'strength'), 0) / characters.length;
  if (avgStrength > 70 && worldRNG.chance(0.01)) {
    species.traits.size = Math.min(100, species.traits.size + 2);
    return `The ${species.commonName}s are growing larger over generations. Natural selection favors the strong.`;
  }
  if (avgStrength < 30 && worldRNG.chance(0.01)) {
    species.traits.size = Math.max(1, species.traits.size - 2);
    return `The ${species.commonName}s are trending smaller. Being small has its advantages.`;
  }

  // --- Sense enhancement ---
  const avgIntel = characters.reduce((sum, c) => sum + getGeneValue(c, 'intelligence'), 0) / characters.length;
  if (avgIntel > 65 && worldRNG.chance(0.005)) {
    species.traits.intelligence = Math.min(100, species.traits.intelligence + 3);
    return `The ${species.commonName}s are getting smarter. Each generation builds on the last.`;
  }

  return null;
}
