// ============================================================
// Intel Sharing — Pure Functions for Sharing & Compartmentalization
// ============================================================

import type {
  ActionResult, RegionIntel, Character, FamilyTreeId,
  ActionEffect,
} from '../types.js';
import type { ActionContext } from './actions.js';
import { intelligenceRegistry } from './intelligence.js';
import { trustLedger } from './trust.js';
import { getGeneValue } from '../species/character.js';
import { speciesRegistry } from '../species/species.js';
import { worldRNG } from '../simulation/random.js';

/** Handle the share_intel action */
export function handleShareIntel(action: { params: Record<string, unknown> }, ctx: ActionContext): ActionResult {
  const targetCharacter = ctx.nearbyCharacters[0];
  if (!targetCharacter) {
    return {
      success: false,
      narrative: 'There is no one nearby to share intelligence with.',
      effects: [],
      sensoryData: buildBasicSensory(ctx),
    };
  }

  const regionId = action.params.regionId as string | undefined;
  if (!regionId) {
    return {
      success: false,
      narrative: 'You must specify which region to share intelligence about.',
      effects: [],
      sensoryData: buildBasicSensory(ctx),
    };
  }

  // Check if we have intel to share
  const intel = intelligenceRegistry.getRegionIntel(ctx.character.familyTreeId, regionId);
  if (!intel) {
    return {
      success: false,
      narrative: 'Your family has no intelligence on that region.',
      effects: [],
      sensoryData: buildBasicSensory(ctx),
    };
  }

  // Check willingness
  const willingness = trustLedger.evaluateIntelSharingWillingness(
    ctx.character.familyTreeId,
    targetCharacter.familyTreeId,
    intel.reliability,
  );

  // Compartmentalize based on intelligence gene
  const compartmentalized = compartmentalizeIntel(intel, getGeneValue(ctx.character, 'intelligence'));

  // Share the intel
  intelligenceRegistry.shareIntel(ctx.character.familyTreeId, targetCharacter.familyTreeId, regionId, ctx.tick);

  // Record cooperation
  trustLedger.recordCooperation(ctx.character.familyTreeId, targetCharacter.familyTreeId, ctx.tick);

  // Calculate exposure from sharing
  const exposure = calculateSharingExposure(ctx.character, targetCharacter, intel);

  const species = speciesRegistry.get(targetCharacter.speciesId);
  const targetName = species?.commonName ?? 'creature';

  return {
    success: true,
    narrative: `You share intelligence about the region with the ${targetName}. ${exposure.positionRevealed ? 'Your family\'s presence is now known.' : ''}`,
    effects: [],
    sensoryData: buildBasicSensory(ctx),
  };
}

/** Calculate what the sharer exposes by sharing intel */
export function calculateSharingExposure(
  sharer: Character,
  recipient: Character,
  intel: RegionIntel,
): { positionRevealed: boolean; familyInfoRevealed: boolean; exposureLevel: number } {
  // Sharing intel implicitly reveals the sharer's position
  const positionRevealed = true;

  // If intel is from exploration, it reveals where the family has been
  const familyInfoRevealed = intel.source === 'exploration';

  // Exposure increases with trust level (counter-intuitive but: trusted allies know more)
  const trust = trustLedger.getTrust(sharer.familyTreeId, recipient.familyTreeId);
  const exposureLevel = 0.3 + (trust > 0 ? trust * 0.3 : 0);

  return { positionRevealed, familyInfoRevealed, exposureLevel };
}

/** Compartmentalize intel — high intelligence strips identifying details */
export function compartmentalizeIntel(fullIntel: RegionIntel, intelligenceGene: number): RegionIntel {
  // Low intelligence: shares everything including source
  if (intelligenceGene < 40) {
    return { ...fullIntel };
  }

  // Medium intelligence: strips source character
  if (intelligenceGene < 70) {
    return {
      ...fullIntel,
      sourceCharacterId: null,
    };
  }

  // High intelligence: can selectively limit shared details
  return {
    ...fullIntel,
    sourceCharacterId: null,
    // Reduce detail granularity
    knownResources: fullIntel.knownResources.slice(0, 3),
    knownSpecies: fullIntel.knownSpecies.slice(0, 3),
    knownPopEstimate: Math.round(fullIntel.knownPopEstimate / 10) * 10,
  };
}

/** Evaluate a potential intel trade */
export function evaluateIntelTrade(
  offered: RegionIntel,
  requested: RegionIntel,
  sharerTrust: number,
  recipientTrust: number,
): { fair: boolean; tradeValue: number } {
  const offeredValue = offered.reliability * (offered.knownResources.length + offered.knownSpecies.length);
  const requestedValue = requested.reliability * (requested.knownResources.length + requested.knownSpecies.length);

  // Trust modifies perceived fairness
  const adjustedOffered = offeredValue * (1 + sharerTrust * 0.2);
  const adjustedRequested = requestedValue * (1 + recipientTrust * 0.2);

  const ratio = adjustedRequested > 0 ? adjustedOffered / adjustedRequested : 1;
  const fair = ratio >= 0.5 && ratio <= 2.0;

  return { fair, tradeValue: offeredValue };
}

function buildBasicSensory(ctx: ActionContext) {
  return {
    surroundings: `You are in ${ctx.regionName}.`,
    nearbyEntities: [],
    weather: ctx.weather,
    timeOfDay: ctx.timeOfDay,
    season: ctx.season,
    threats: ctx.threats,
    opportunities: [],
  };
}
