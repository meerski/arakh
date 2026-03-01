// ============================================================
// Incidental Kills — Size-Based Passive Kills
// ============================================================

import type { Region, SpeciesId } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';
import { worldRNG } from './random.js';
import { corpseRegistry } from './corpses.js';

export interface IncidentalKillResult {
  largeSpeciesId: SpeciesId;
  smallSpeciesId: SpeciesId;
  killed: number;
  agentKills: string[];  // character IDs killed
}

export function processIncidentalKills(region: Region, tick: number): IncidentalKillResult[] {
  const results: IncidentalKillResult[] = [];

  for (let i = 0; i < region.populations.length; i++) {
    const largePop = region.populations[i];
    if (largePop.count <= 0) continue;

    const largeSpecies = speciesRegistry.get(largePop.speciesId);
    if (!largeSpecies) continue;

    for (let j = 0; j < region.populations.length; j++) {
      if (i === j) continue;
      const smallPop = region.populations[j];
      if (smallPop.count <= 0) continue;

      const smallSpecies = speciesRegistry.get(smallPop.speciesId);
      if (!smallSpecies) continue;

      // Must share a habitat layer
      if (!largeSpecies.traits.habitat.some(h => smallSpecies.traits.habitat.includes(h))) continue;

      const sizeRatio = largeSpecies.traits.size / Math.max(1, smallSpecies.traits.size);
      if (sizeRatio <= 10) continue;

      // Kill rate: 0.001 * (sizeRatio / 10) * largePopCount
      const killRate = 0.001 * (sizeRatio / 10) * largePop.count;
      const killed = Math.min(smallPop.count, Math.floor(killRate));

      if (killed <= 0) continue;

      smallPop.count -= killed;
      speciesRegistry.updatePopulation(smallPop.speciesId, -killed);

      // Check for agent-controlled character kills
      const agentKills: string[] = [];
      const smallChars = characterRegistry.getByRegion(region.id)
        .filter(c => c.speciesId === smallPop.speciesId && c.isAlive);

      for (const char of smallChars) {
        if (worldRNG.chance(killRate / Math.max(1, smallPop.count + killed))) {
          characterRegistry.markDead(char.id, tick, `trampled by ${largeSpecies.commonName}`);
          agentKills.push(char.id);
          // Generate corpse for trampled character
          corpseRegistry.createCorpse(char, tick);
        }
      }

      results.push({
        largeSpeciesId: largePop.speciesId,
        smallSpeciesId: smallPop.speciesId,
        killed,
        agentKills,
      });
    }
  }

  return results;
}
