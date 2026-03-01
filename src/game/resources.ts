// ============================================================
// Resource Property Discovery System
// ============================================================
// Resources have species-dependent properties that must be
// DISCOVERED through experimentation. The same berry might heal
// one species, poison another, grant magic to a third.
// Properties can drift over time as the world's chemistry evolves.

import type {
  SpeciesId,
  CharacterId,
  Character,
  Species,
  SpeciesTraits,
  Diet,
} from '../types.js';
import { worldRNG, GameRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';

// --- Types ---

export type ResourceEffect =
  | 'nourishing'
  | 'poisonous'
  | 'healing'
  | 'energizing'
  | 'hallucinogenic'
  | 'strengthening'
  | 'weakening'
  | 'mutagenic'
  | 'addictive'
  | 'inert';

export const ALL_EFFECTS: ResourceEffect[] = [
  'nourishing',
  'poisonous',
  'healing',
  'energizing',
  'hallucinogenic',
  'strengthening',
  'weakening',
  'mutagenic',
  'addictive',
  'inert',
];

export interface ResourceProperty {
  effect: ResourceEffect;
  magnitude: number; // 0-1 strength
  speciesId: SpeciesId; // Different per species!
  discoveredBy: CharacterId | null;
  discoveredAtTick: number | null;
}

/** Categorization of resource types for diet-based weighting */
export type ResourceCategory = 'plant' | 'meat' | 'mineral' | 'fungus' | 'other';

// --- Resource categorization ---

const PLANT_RESOURCES = new Set([
  'berry', 'herb', 'root', 'leaf', 'fruit', 'seed', 'bark', 'flower',
  'moss', 'vine', 'grain', 'tuber', 'oak_wood', 'pine_wood', 'bamboo',
  'seaweed', 'kelp', 'algae', 'cactus', 'fern', 'mushroom_cap',
]);

const MEAT_RESOURCES = new Set([
  'salmon', 'rabbit_meat', 'deer_meat', 'insect', 'grub', 'fish',
  'shellfish', 'bird_egg', 'lizard', 'frog', 'worm', 'crab',
  'venison', 'poultry', 'carrion',
]);

const MINERAL_RESOURCES = new Set([
  'iron_ore', 'copper_ore', 'gold_ore', 'salt', 'crystal', 'stone',
  'clay', 'sulfur', 'obsidian', 'flint', 'gem', 'coal',
]);

const FUNGUS_RESOURCES = new Set([
  'mushroom', 'truffle', 'lichen', 'mold', 'spore', 'toadstool',
]);

export function categorizeResource(resourceType: string): ResourceCategory {
  if (PLANT_RESOURCES.has(resourceType)) return 'plant';
  if (MEAT_RESOURCES.has(resourceType)) return 'meat';
  if (MINERAL_RESOURCES.has(resourceType)) return 'mineral';
  if (FUNGUS_RESOURCES.has(resourceType)) return 'fungus';
  return 'other';
}

// --- Effect weight generation based on species traits ---

/**
 * Build per-effect weights influenced by species diet, intelligence, and size.
 * Returns an array of weights aligned with ALL_EFFECTS.
 */
export function buildEffectWeights(
  traits: SpeciesTraits,
  category: ResourceCategory,
): number[] {
  // Base weights — all effects equally likely
  const w: Record<ResourceEffect, number> = {
    nourishing: 1,
    poisonous: 1,
    healing: 1,
    energizing: 1,
    hallucinogenic: 1,
    strengthening: 1,
    weakening: 1,
    mutagenic: 0.3,
    addictive: 0.5,
    inert: 1,
  };

  const diet: Diet = traits.diet;

  // --- Diet + resource category interactions ---
  if (category === 'plant') {
    if (diet === 'herbivore' || diet === 'omnivore') {
      w.nourishing += 3;
      w.healing += 1.5;
      w.energizing += 1;
      w.poisonous *= 0.3;
    }
    if (diet === 'carnivore') {
      w.inert += 3;
      w.poisonous += 2;
      w.nourishing *= 0.2;
    }
    if (diet === 'filter_feeder') {
      w.inert += 2;
    }
  }

  if (category === 'meat') {
    if (diet === 'carnivore' || diet === 'omnivore') {
      w.nourishing += 3;
      w.strengthening += 1.5;
      w.energizing += 1;
      w.poisonous *= 0.3;
    }
    if (diet === 'herbivore') {
      w.poisonous += 2;
      w.weakening += 1.5;
      w.nourishing *= 0.2;
    }
  }

  if (category === 'fungus') {
    w.hallucinogenic += 2;
    w.mutagenic += 0.5;
    if (diet === 'detritivore') {
      w.nourishing += 2;
      w.poisonous *= 0.3;
    }
  }

  if (category === 'mineral') {
    w.inert += 3;
    w.mutagenic += 0.5;
    w.nourishing *= 0.1;
    if (diet === 'detritivore') {
      w.nourishing += 1;
    }
  }

  // --- Intelligence influence ---
  // High-intelligence species are more likely to find useful (non-harmful) effects
  // This represents evolutionary adaptation / innate avoidance behavior
  const intel = traits.intelligence / 100; // normalize to 0-1
  if (intel > 0.5) {
    const bonus = (intel - 0.5) * 2; // 0-1 range for smart species
    w.nourishing += bonus;
    w.healing += bonus * 0.8;
    w.energizing += bonus * 0.5;
    w.poisonous *= 1 - bonus * 0.4;
    w.weakening *= 1 - bonus * 0.3;
  }

  return ALL_EFFECTS.map((e) => Math.max(0.01, w[e]));
}

/**
 * Compute magnitude modifier based on species size.
 * Small creatures are affected more strongly by poisons/negative effects
 * and less by strengthening effects (they can't get that much stronger).
 */
export function sizeMagnitudeModifier(
  size: number,
  effect: ResourceEffect,
): number {
  const normalizedSize = size / 100; // 0-1

  switch (effect) {
    case 'poisonous':
    case 'weakening':
    case 'hallucinogenic':
    case 'mutagenic':
      // Small creatures hit harder by negative/transformative effects
      return 1 + (1 - normalizedSize) * 0.5;
    case 'strengthening':
    case 'energizing':
      // Large creatures gain more from positive physical effects
      return 0.5 + normalizedSize * 0.5;
    default:
      return 1;
  }
}

// --- Core hash function for deterministic property generation ---

/**
 * Simple deterministic hash from two strings.
 * Used to seed the RNG for a specific resource+species combo
 * so that properties are stable across calls.
 */
function hashPair(a: string, b: string): number {
  let h = 0x811c9dc5;
  const combined = a + ':' + b;
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// --- Resource Property Registry ---

export class ResourcePropertyRegistry {
  /** Map key: "resourceType:speciesId" -> property */
  private properties: Map<string, ResourceProperty> = new Map();

  /** Map key: characterId -> set of property keys they know about */
  private knowledgeMap: Map<CharacterId, Set<string>> = new Map();

  /** Tick of last decay pass */
  private lastDecayTick: number = 0;

  /** How many ticks between decay passes */
  static readonly DECAY_INTERVAL = 5000;

  /** Maximum magnitude drift per decay pass */
  static readonly DECAY_DRIFT = 0.02;

  private makeKey(resourceType: string, speciesId: SpeciesId): string {
    return `${resourceType}:${speciesId}`;
  }

  // --- Generate ---

  /**
   * Generate the property for a resource+species pair.
   * Uses a deterministic hash so the same combo always produces the same
   * base property (before any decay drift).
   */
  generateResourceProperty(
    resourceType: string,
    speciesId: SpeciesId,
    rng?: GameRNG,
  ): ResourceProperty {
    const key = this.makeKey(resourceType, speciesId);
    const existing = this.properties.get(key);
    if (existing) return existing;

    const species = speciesRegistry.get(speciesId);
    const traits = species?.traits;

    // Create a local RNG seeded deterministically for this pair
    const seed = hashPair(resourceType, speciesId);
    const localRng = rng ?? new GameRNG(seed);

    const category = categorizeResource(resourceType);

    // Build weights and pick effect
    const weights = traits
      ? buildEffectWeights(traits, category)
      : ALL_EFFECTS.map(() => 1);

    const effect = localRng.weighted(ALL_EFFECTS, weights);

    // Base magnitude
    let magnitude = localRng.float(0.1, 0.9);

    // Apply size modifier
    if (traits) {
      magnitude *= sizeMagnitudeModifier(traits.size, effect);
    }

    // Clamp to [0, 1]
    magnitude = Math.max(0, Math.min(1, magnitude));

    const property: ResourceProperty = {
      effect,
      magnitude,
      speciesId,
      discoveredBy: null,
      discoveredAtTick: null,
    };

    this.properties.set(key, property);
    return property;
  }

  // --- Discover ---

  /**
   * A character experiments with a resource and discovers its property
   * for their species. Records who discovered it and when.
   * Returns the discovered property.
   */
  discoverProperty(
    resourceType: string,
    character: Character,
    currentTick: number,
    rng?: GameRNG,
  ): ResourceProperty {
    const property = this.generateResourceProperty(
      resourceType,
      character.speciesId,
      rng,
    );

    // Only record the first discoverer
    if (property.discoveredBy === null) {
      property.discoveredBy = character.id;
      property.discoveredAtTick = currentTick;
    }

    // Add to character's knowledge
    this.addKnowledge(character.id, resourceType, character.speciesId);

    return property;
  }

  // --- Knowledge management ---

  /**
   * Record that a character knows about a resource property.
   */
  addKnowledge(
    characterId: CharacterId,
    resourceType: string,
    speciesId: SpeciesId,
  ): void {
    const key = this.makeKey(resourceType, speciesId);
    let known = this.knowledgeMap.get(characterId);
    if (!known) {
      known = new Set();
      this.knowledgeMap.set(characterId, known);
    }
    known.add(key);
  }

  /**
   * Teach a resource property from one character to another.
   * Both must be of the same species (you can only teach your own species'
   * experience).
   */
  teachProperty(
    resourceType: string,
    teacher: Character,
    student: Character,
  ): boolean {
    if (teacher.speciesId !== student.speciesId) return false;

    const key = this.makeKey(resourceType, teacher.speciesId);
    const teacherKnowledge = this.knowledgeMap.get(teacher.id);
    if (!teacherKnowledge || !teacherKnowledge.has(key)) return false;

    this.addKnowledge(student.id, resourceType, student.speciesId);
    return true;
  }

  /**
   * Get all resource properties a character knows about.
   * Returns properties for their own species only.
   */
  getKnownProperties(characterId: CharacterId): ResourceProperty[] {
    const known = this.knowledgeMap.get(characterId);
    if (!known) return [];

    const result: ResourceProperty[] = [];
    for (const key of known) {
      const prop = this.properties.get(key);
      if (prop) result.push(prop);
    }
    return result;
  }

  /**
   * Check if a character knows about a specific resource.
   */
  hasKnowledge(
    characterId: CharacterId,
    resourceType: string,
    speciesId: SpeciesId,
  ): boolean {
    const key = this.makeKey(resourceType, speciesId);
    const known = this.knowledgeMap.get(characterId);
    return known?.has(key) ?? false;
  }

  // --- Get property (without discovery) ---

  /**
   * Get a property if it has already been generated.
   * Returns undefined if this combo hasn't been encountered yet.
   */
  getProperty(
    resourceType: string,
    speciesId: SpeciesId,
  ): ResourceProperty | undefined {
    return this.properties.get(this.makeKey(resourceType, speciesId));
  }

  // --- Apply effects ---

  /**
   * Apply a resource's effect to a character.
   * Modifies health, energy, hunger based on effect type and magnitude.
   * Returns a description of what happened.
   */
  applyResourceEffect(
    resourceType: string,
    character: Character,
    rng?: GameRNG,
  ): { effect: ResourceEffect; magnitude: number; description: string } {
    const property = this.generateResourceProperty(
      resourceType,
      character.speciesId,
      rng,
    );

    const m = property.magnitude;

    switch (property.effect) {
      case 'nourishing':
        character.hunger = Math.max(0, character.hunger - m * 0.4);
        character.energy = Math.min(1, character.energy + m * 0.2);
        return {
          effect: 'nourishing',
          magnitude: m,
          description: `The ${resourceType} satisfies hunger and provides energy.`,
        };

      case 'poisonous':
        character.health = Math.max(0, character.health - m * 0.3);
        character.energy = Math.max(0, character.energy - m * 0.2);
        return {
          effect: 'poisonous',
          magnitude: m,
          description: `The ${resourceType} is toxic! Health and energy drain away.`,
        };

      case 'healing':
        character.health = Math.min(1, character.health + m * 0.4);
        return {
          effect: 'healing',
          magnitude: m,
          description: `The ${resourceType} mends wounds and restores vitality.`,
        };

      case 'energizing':
        character.energy = Math.min(1, character.energy + m * 0.5);
        return {
          effect: 'energizing',
          magnitude: m,
          description: `The ${resourceType} fills the body with vigour.`,
        };

      case 'hallucinogenic':
        // Minor health cost, but could unlock knowledge in a full system
        character.health = Math.max(0, character.health - m * 0.05);
        character.energy = Math.max(0, character.energy - m * 0.1);
        return {
          effect: 'hallucinogenic',
          magnitude: m,
          description: `The ${resourceType} warps perception — the world shimmers and bends.`,
        };

      case 'strengthening':
        character.health = Math.min(1, character.health + m * 0.1);
        character.energy = Math.min(1, character.energy + m * 0.15);
        return {
          effect: 'strengthening',
          magnitude: m,
          description: `The ${resourceType} hardens muscle and bone.`,
        };

      case 'weakening':
        character.energy = Math.max(0, character.energy - m * 0.3);
        character.health = Math.max(0, character.health - m * 0.1);
        return {
          effect: 'weakening',
          magnitude: m,
          description: `The ${resourceType} saps strength from the limbs.`,
        };

      case 'mutagenic':
        // Subtle — affects genetics in a full system, minor health wobble here
        character.health = Math.max(
          0,
          Math.min(1, character.health + (rng ?? worldRNG).float(-0.1, 0.1) * m),
        );
        return {
          effect: 'mutagenic',
          magnitude: m,
          description: `The ${resourceType} hums with strange energy — something changes within.`,
        };

      case 'addictive':
        character.hunger = Math.max(0, character.hunger - m * 0.2);
        character.energy = Math.min(1, character.energy + m * 0.3);
        // Feels good now — consequences come later in a full system
        return {
          effect: 'addictive',
          magnitude: m,
          description: `The ${resourceType} brings a rush of pleasure and craving.`,
        };

      case 'inert':
      default:
        return {
          effect: 'inert',
          magnitude: m,
          description: `The ${resourceType} has no discernible effect.`,
        };
    }
  }

  // --- Decay / Drift ---

  /**
   * Over time, resource properties can subtly shift.
   * Call this periodically (e.g., every DECAY_INTERVAL ticks).
   * The drift is very slow — magnitudes shift by at most DECAY_DRIFT per pass,
   * and effects can only change with very low probability.
   */
  resourceDecay(currentTick: number, rng?: GameRNG): number {
    if (currentTick - this.lastDecayTick < ResourcePropertyRegistry.DECAY_INTERVAL) {
      return 0;
    }

    this.lastDecayTick = currentTick;
    const r = rng ?? worldRNG;
    let changed = 0;

    for (const [_key, prop] of this.properties) {
      // Magnitude drift — small random walk
      const drift = r.float(
        -ResourcePropertyRegistry.DECAY_DRIFT,
        ResourcePropertyRegistry.DECAY_DRIFT,
      );
      prop.magnitude = Math.max(0, Math.min(1, prop.magnitude + drift));
      changed++;

      // Very rare effect change (0.5% chance per decay pass)
      if (r.chance(0.005)) {
        const newEffect = r.pick(ALL_EFFECTS);
        if (newEffect !== prop.effect) {
          prop.effect = newEffect;
        }
      }
    }

    return changed;
  }

  // --- Serialization ---

  getState(): {
    properties: Array<[string, ResourceProperty]>;
    knowledge: Array<[CharacterId, string[]]>;
    lastDecayTick: number;
  } {
    return {
      properties: Array.from(this.properties.entries()),
      knowledge: Array.from(this.knowledgeMap.entries()).map(([id, set]) => [
        id,
        Array.from(set),
      ]),
      lastDecayTick: this.lastDecayTick,
    };
  }

  static fromState(saved: {
    properties: Array<[string, ResourceProperty]>;
    knowledge: Array<[CharacterId, string[]]>;
    lastDecayTick: number;
  }): ResourcePropertyRegistry {
    const reg = new ResourcePropertyRegistry();
    reg.properties = new Map(saved.properties);
    reg.knowledgeMap = new Map(
      saved.knowledge.map(([id, keys]) => [id, new Set(keys)]),
    );
    reg.lastDecayTick = saved.lastDecayTick;
    return reg;
  }

  /** Clear all data (useful for testing) */
  clear(): void {
    this.properties.clear();
    this.knowledgeMap.clear();
    this.lastDecayTick = 0;
  }
}

// --- Singleton ---

export let resourceProperties = new ResourcePropertyRegistry();
export function _installResourceProperties(instance: ResourcePropertyRegistry): void { resourceProperties = instance; }
