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
  const isNight = data.timeOfDay === 'night' || data.timeOfDay === 'dusk';

  // Filter nearby entities by combined sensory range
  const filteredEntities = data.nearbyEntities.filter(entity => {
    const distanceFactor = entity.distance === 'close' ? 1.0
      : entity.distance === 'near' ? 0.6
      : 0.3;

    const threshold = worldRNG.float(10, 50);

    // Visual detection (reduced at night)
    const visualEff = isNight ? perception.visualRange * 0.3 : perception.visualRange;
    if (visualEff * distanceFactor > threshold) return true;

    // Hearing detection — picks up movement at any time
    if (perception.hearingRange * distanceFactor > threshold * 1.2) return true;

    // Smell detection — unaffected by time of day, better at close range
    const smellFactor = entity.distance === 'close' ? 1.5 : distanceFactor;
    if (perception.smellRange * smellFactor > threshold * 1.5) return true;

    // Echolocation — works best at night, full effectiveness in dark
    if (perception.echolocation) {
      const echoRange = isNight ? 90 : 60;
      if (echoRange * distanceFactor > threshold) return true;
    }

    // Electroreception — detects living things at close range (aquatic)
    if (perception.electroreception && entity.distance === 'close') return true;

    // Thermal sensing — detects warm-blooded creatures
    if (perception.thermalSensing && distanceFactor > 0.5) return true;

    return false;
  });

  // Add noise to descriptions based on perception quality + primary sense
  const noisyEntities = filteredEntities.map(entity => ({
    ...entity,
    description: addPerceptionNoise(entity.description, perception, isNight),
    behavior: addPerceptionNoise(entity.behavior, perception, isNight),
  }));

  // Perception-based opportunity count: better senses = notice more
  const perceptiveness = Math.max(
    perception.visualRange,
    perception.hearingRange,
    perception.smellRange,
    perception.echolocation ? 80 : 0,
  );

  return {
    ...data,
    nearbyEntities: noisyEntities,
    // Never expose raw threat IDs — only narrative descriptions
    threats: data.threats.map(t => vaguifyThreat(t, perception)),
    opportunities: data.opportunities.slice(0, Math.ceil(perceptiveness / 20)),
  };
}

function addPerceptionNoise(text: string, perception: PerceptionProfile, isNight: boolean): string {
  // Overall perception quality considers all senses
  const visualEff = isNight ? perception.visualRange * 0.3 : perception.visualRange;
  const echoBonus = perception.echolocation ? 40 : 0;
  const thermalBonus = perception.thermalSensing ? 15 : 0;

  const quality = Math.max(
    visualEff / 100,
    perception.hearingRange / 120,
    perception.smellRange / 120,
    echoBonus / 100,
  ) + thermalBonus / 200;

  if (quality > 0.7) return text;
  if (quality > 0.5) return `Something... ${text.split(' ').slice(0, 3).join(' ')}...`;
  if (quality > 0.3) return `Something... ${text.split(' ').slice(0, 2).join(' ')}...`;
  return 'A vague presence';
}

function vaguifyThreat(threat: string, perception: PerceptionProfile): string {
  const quality = perception.visualRange / 100;
  if (quality > 0.7) return threat;
  if (quality > 0.4) return 'A potential danger nearby';
  return 'Something feels wrong';
}
