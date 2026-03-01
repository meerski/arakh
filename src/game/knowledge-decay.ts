// ============================================================
// Knowledge Decay — Layer-Specific Information Reliability
// ============================================================
// Three layers:
//   Instinct: never decays (species-hardwired behaviors)
//   Inherited: degrades per generation (generational telephone)
//   Experiential: decays over time (exponential half-life)

import type { Character, Knowledge, KnowledgeLayer } from '../types.js';

/** Half-lives for different knowledge topics (in ticks) — experiential layer only */
export const KNOWLEDGE_HALF_LIVES: Record<string, number> = {
  local_flora: 800,
  local_fauna: 600,
  experiment_: 400,
  species_insight: 1000,
  terrain: 1500,
  weather_patterns: 700,
  water_sources: 900,
  communication_skill: 2000,
  resource_: 600,
  intel_region: 500,
  intel_heartland: 300,
  espionage_finding: 400,
  betrayal_memory: 2000,
  cross_species_signal: 3000,
  default: 1200,
};

/** Per-generation reliability decay for inherited knowledge */
const INHERITED_DECAY_PER_GENERATION = 0.15;

/** Get the half-life for a knowledge topic */
function getHalfLife(topic: string): number {
  for (const [key, value] of Object.entries(KNOWLEDGE_HALF_LIVES)) {
    if (key !== 'default' && topic.startsWith(key)) return value;
  }
  return KNOWLEDGE_HALF_LIVES[topic] ?? KNOWLEDGE_HALF_LIVES.default;
}

/** Calculate reliability of a knowledge entry (0-1) based on layer, age, and generation. */
export function getKnowledgeReliability(knowledge: Knowledge, tick: number, currentGeneration?: number): number {
  const layer = knowledge.layer ?? 'experiential';

  // Instinct never decays
  if (layer === 'instinct') return 1;

  // Inherited: degrades per generation gap
  if (layer === 'inherited') {
    const gen = knowledge.generation ?? 0;
    const rel = knowledge.reliability ?? 1;
    const genGap = (currentGeneration ?? gen) - gen;
    if (genGap <= 0) return rel;
    return Math.max(0, rel * Math.pow(1 - INHERITED_DECAY_PER_GENERATION, genGap));
  }

  // Experiential: exponential time decay
  const age = tick - knowledge.learnedAtTick;
  if (age <= 0) return 1;

  const halfLife = getHalfLife(knowledge.topic);
  return Math.pow(0.5, age / halfLife);
}

/** Filter knowledge to only entries with reliability > threshold */
export function filterReliableKnowledge(character: Character, tick: number, threshold = 0.5): Knowledge[] {
  return character.knowledge.filter(k =>
    getKnowledgeReliability(k, tick, character.generation) > threshold,
  );
}

/**
 * Decay knowledge on a character. Removes entries past 2x half-life (experiential)
 * or below reliability threshold (inherited). Instinct is never removed.
 * Returns topics of removed knowledge.
 */
export function decayKnowledge(character: Character, tick: number): string[] {
  const removed: string[] = [];
  const retained: Knowledge[] = [];

  for (const k of character.knowledge) {
    const layer = k.layer ?? 'experiential';

    // Instinct never decays
    if (layer === 'instinct') {
      retained.push(k);
      continue;
    }

    // Inherited: check generation-based reliability
    if (layer === 'inherited') {
      const reliability = getKnowledgeReliability(k, tick, character.generation);
      if (reliability < 0.1) {
        removed.push(k.topic);
      } else {
        k.reliability = reliability;
        retained.push(k);
      }
      continue;
    }

    // Experiential: time-based decay
    const age = tick - k.learnedAtTick;
    const halfLife = getHalfLife(k.topic);
    if (age > halfLife * 2) {
      removed.push(k.topic);
    } else {
      k.reliability = getKnowledgeReliability(k, tick);
      retained.push(k);
    }
  }

  character.knowledge = retained;
  return removed;
}

/** Create instinct knowledge (never decays). */
export function createInstinctKnowledge(topic: string, detail: string): Knowledge {
  return {
    topic,
    detail,
    learnedAtTick: 0,
    source: 'instinct',
    layer: 'instinct',
    reliability: 1,
    generation: 0,
  };
}

/** Create inherited knowledge (decays per generation). */
export function createInheritedKnowledge(
  topic: string,
  detail: string,
  parentGeneration: number,
  tick: number,
): Knowledge {
  return {
    topic,
    detail,
    learnedAtTick: tick,
    source: 'inherited',
    layer: 'inherited',
    reliability: 1,
    generation: parentGeneration,
  };
}

/** Create experiential knowledge (decays over time). */
export function createExperientialKnowledge(
  topic: string,
  detail: string,
  tick: number,
  source: 'experience' | 'taught' = 'experience',
): Knowledge {
  return {
    topic,
    detail,
    learnedAtTick: tick,
    source,
    layer: 'experiential',
    reliability: 1,
    generation: 0,
  };
}

/** Get instinct knowledge for a species (species-hardwired behaviors). */
export function getSpeciesInstincts(speciesId: string): Knowledge[] {
  // Base instincts all species have
  return [
    createInstinctKnowledge('survival', 'seek food and water'),
    createInstinctKnowledge('danger_response', 'flee from threats'),
    createInstinctKnowledge('social_instinct', 'recognize kin'),
  ];
}

/** Prepare inherited knowledge for a newborn from parent knowledge. */
export function inheritKnowledge(
  parentKnowledge: Knowledge[],
  parentGeneration: number,
  tick: number,
): Knowledge[] {
  const inherited: Knowledge[] = [];

  for (const pk of parentKnowledge) {
    const layer = pk.layer ?? 'experiential';
    // Only inherit experiential and inherited knowledge (instincts come from species)
    if (layer === 'instinct') continue;

    // Inherited knowledge degrades per generation
    const reliability = layer === 'inherited'
      ? (pk.reliability ?? 1) * (1 - INHERITED_DECAY_PER_GENERATION)
      : 0.7; // Experiential → inherited starts at 70% reliability

    if (reliability < 0.1) continue; // Too degraded to pass on

    inherited.push({
      topic: pk.topic,
      detail: pk.detail,
      learnedAtTick: tick,
      source: 'inherited',
      layer: 'inherited',
      reliability,
      generation: parentGeneration,
    });
  }

  return inherited;
}
