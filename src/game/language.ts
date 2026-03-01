// ============================================================
// Language Barriers & Cross-Species Communication
// ============================================================
// Dual communication system:
//   Intra-species: rich, narrative-quality (same species = clarity 1.0)
//   Cross-species: signal-based vocabulary that evolves with contact

import type { Character, Knowledge, SpeciesId } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { createExperientialKnowledge } from './knowledge-decay.js';

/** Check if two characters can communicate */
export function canCommunicate(a: Character, b: Character): {
  canTalk: boolean;
  clarity: number; // 0-1, how well they understand each other
} {
  // Same species: full communication
  if (a.speciesId === b.speciesId) {
    return { canTalk: true, clarity: 1.0 };
  }

  // Check taxonomy proximity
  const speciesA = speciesRegistry.get(a.speciesId);
  const speciesB = speciesRegistry.get(b.speciesId);

  let baseClarity = 0;

  if (speciesA && speciesB) {
    if (speciesA.taxonomy.genus === speciesB.taxonomy.genus) {
      baseClarity = 0.5;
    } else if (speciesA.taxonomy.family === speciesB.taxonomy.family) {
      baseClarity = 0.2;
    } else if (speciesA.taxonomy.order === speciesB.taxonomy.order) {
      baseClarity = 0.1;
    } else if (speciesA.taxonomy.class === speciesB.taxonomy.class) {
      baseClarity = 0.02;
    }
  }

  // Hybrid bonus: generated species get +0.15 bridging parent groups
  if (speciesA?.tier === 'generated') baseClarity += 0.15;
  if (speciesB?.tier === 'generated') baseClarity += 0.15;

  // Communication skill from knowledge entries
  const aSkill = getCommunicationSkill(a, b.speciesId);
  const bSkill = getCommunicationSkill(b, a.speciesId);
  const skillBonus = Math.min(0.5, (aSkill + bSkill) * 0.1);

  // Cross-species signal vocabulary bonus
  const signalBonus = getCrossSpeciesSignalBonus(a, b);

  // Check legacy cross-species language knowledge
  const aKnows = a.knowledge.some(k => k.topic === 'language' && k.detail === b.speciesId);
  const bKnows = b.knowledge.some(k => k.topic === 'language' && k.detail === a.speciesId);
  let legacyBonus = 0;
  if (aKnows && bKnows) legacyBonus = 0.7;
  else if (aKnows || bKnows) legacyBonus = 0.3;

  const clarity = Math.min(1, Math.max(baseClarity, legacyBonus) + skillBonus + signalBonus);

  return {
    canTalk: clarity > 0,
    clarity,
  };
}

/** Count communication_skill knowledge entries for a specific target species */
export function getCommunicationSkill(character: Character, targetSpeciesId: SpeciesId): number {
  return Math.min(5, character.knowledge.filter(
    k => k.topic === 'communication_skill' && k.detail === targetSpeciesId,
  ).length);
}

/** Get bonus from cross-species signal vocabulary. Signals improve with repeated contact. */
function getCrossSpeciesSignalBonus(a: Character, b: Character): number {
  const aSignals = a.knowledge.filter(
    k => k.topic === 'cross_species_signal' && k.detail === b.speciesId,
  ).length;
  const bSignals = b.knowledge.filter(
    k => k.topic === 'cross_species_signal' && k.detail === a.speciesId,
  ).length;

  // Each signal adds diminishing clarity (log scale)
  const totalSignals = aSignals + bSignals;
  if (totalSignals === 0) return 0;
  return Math.min(0.3, Math.log2(1 + totalSignals) * 0.05);
}

/** Record a cross-species contact event. Both characters gain signal knowledge. */
export function recordCrossSpeciesContact(a: Character, b: Character, tick: number): void {
  if (a.speciesId === b.speciesId) return;

  // Only add if they don't already have too many signals
  const aSignalCount = a.knowledge.filter(
    k => k.topic === 'cross_species_signal' && k.detail === b.speciesId,
  ).length;
  const bSignalCount = b.knowledge.filter(
    k => k.topic === 'cross_species_signal' && k.detail === a.speciesId,
  ).length;

  if (aSignalCount < 10) {
    a.knowledge.push(
      createExperientialKnowledge('cross_species_signal', b.speciesId, tick),
    );
  }
  if (bSignalCount < 10) {
    b.knowledge.push(
      createExperientialKnowledge('cross_species_signal', a.speciesId, tick),
    );
  }
}
