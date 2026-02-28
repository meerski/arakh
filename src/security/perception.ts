// ============================================================
// Information Fog / Sensory Filtering
// ============================================================
// Agents only perceive what their species biology allows.
// No meta-data, no maps, no stat sheets.

import type { ActionResult, PerceptionProfile, SensoryData, EntitySighting } from '../types.js';
import { worldRNG } from '../simulation/random.js';

/** Filter action results through species-specific perception */
export function filterPerception(
  result: ActionResult,
  perception: PerceptionProfile,
): ActionResult {
  return {
    ...result,
    sensoryData: filterSensoryData(result.sensoryData, perception),
  };
}

function filterSensoryData(data: SensoryData, perception: PerceptionProfile): SensoryData {
  // Filter nearby entities by visual range
  const filteredEntities = data.nearbyEntities.filter(entity => {
    const distanceFactor = entity.distance === 'close' ? 1.0
      : entity.distance === 'near' ? 0.6
      : 0.3;

    // Can we see this far?
    return perception.visualRange * distanceFactor > worldRNG.float(10, 50);
  });

  // Add noise to descriptions based on perception quality
  const noisyEntities = filteredEntities.map(entity => ({
    ...entity,
    description: addPerceptionNoise(entity.description, perception),
    behavior: addPerceptionNoise(entity.behavior, perception),
  }));

  // Echolocation bonus for dark environments
  if (perception.echolocation && data.timeOfDay === 'night') {
    // Can detect more entities at night
  }

  return {
    ...data,
    nearbyEntities: noisyEntities,
    // Never expose raw threat IDs — only narrative descriptions
    threats: data.threats.map(t => vaguifyThreat(t, perception)),
    opportunities: data.opportunities.slice(0, Math.ceil(perception.visualRange / 25)),
  };
}

function addPerceptionNoise(text: string, perception: PerceptionProfile): string {
  // Low perception = vaguer descriptions
  const quality = (perception.visualRange + perception.hearingRange) / 200;
  if (quality > 0.7) return text;
  if (quality > 0.4) return `Something... ${text.split(' ').slice(0, 2).join(' ')}...`;
  return 'A vague presence';
}

function vaguifyThreat(threat: string, perception: PerceptionProfile): string {
  const quality = perception.visualRange / 100;
  if (quality > 0.7) return threat;
  if (quality > 0.4) return 'A potential danger nearby';
  return 'Something feels wrong';
}
