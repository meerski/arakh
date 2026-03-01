// ============================================================
// Betrayal System — Betrayal Mechanics & Economics
// ============================================================

import type {
  BetrayalEvent, BetrayalType, FamilyTreeId, CharacterId,
  Character, RegionIntel,
} from '../types.js';
import { characterRegistry } from '../species/registry.js';
import { trustLedger } from './trust.js';
import { allianceRegistry, dissolveAlliance } from './alliance.js';
import { fameTracker } from './fame.js';

/** Trust economics per betrayal type */
const BETRAYAL_ECONOMICS: Record<BetrayalType, {
  beneficiaryTrustGain: number;
  victimTrustLoss: number;
  witnessPenalty: number;
}> = {
  intel_leak: { beneficiaryTrustGain: 0.3, victimTrustLoss: -0.5, witnessPenalty: -0.2 },
  heartland_reveal: { beneficiaryTrustGain: 0.5, victimTrustLoss: -0.8, witnessPenalty: -0.3 },
  alliance_backstab: { beneficiaryTrustGain: 0, victimTrustLoss: -1.0, witnessPenalty: -0.4 },
  false_intel: { beneficiaryTrustGain: 0, victimTrustLoss: -0.6, witnessPenalty: 0 },
  resource_theft: { beneficiaryTrustGain: 0, victimTrustLoss: -0.4, witnessPenalty: -0.1 },
};

export class BetrayalRegistry {
  private betrayals: BetrayalEvent[] = [];
  private byBetrayer: Map<string, BetrayalEvent[]> = new Map();
  private byVictim: Map<string, BetrayalEvent[]> = new Map();

  /** Execute a betrayal */
  commitBetrayal(params: {
    betrayerFamilyId: FamilyTreeId;
    betrayerCharacterId: CharacterId;
    victimFamilyId: FamilyTreeId;
    beneficiaryFamilyId?: FamilyTreeId;
    type: BetrayalType;
    tick: number;
    intelShared?: RegionIntel;
    regionId?: string;
  }): BetrayalEvent {
    const witnesses = params.regionId
      ? this.identifyWitnesses(params.regionId, params.betrayerCharacterId, params.tick)
      : [];

    const event: BetrayalEvent = {
      id: crypto.randomUUID(),
      betrayerFamilyId: params.betrayerFamilyId,
      betrayerCharacterId: params.betrayerCharacterId,
      victimFamilyId: params.victimFamilyId,
      beneficiaryFamilyId: params.beneficiaryFamilyId ?? null,
      type: params.type,
      tick: params.tick,
      intelShared: params.intelShared ?? null,
      rewardGained: 0,
      witnessFamilyIds: witnesses,
    };

    this.betrayals.push(event);

    // Index by betrayer
    const byB = this.byBetrayer.get(event.betrayerFamilyId);
    if (byB) byB.push(event);
    else this.byBetrayer.set(event.betrayerFamilyId, [event]);

    // Index by victim
    const byV = this.byVictim.get(event.victimFamilyId);
    if (byV) byV.push(event);
    else this.byVictim.set(event.victimFamilyId, [event]);

    this.applyBetrayalConsequences(event);

    return event;
  }

  /** Get all betrayals committed by a family */
  getBetrayalsByFamily(familyTreeId: FamilyTreeId): BetrayalEvent[] {
    return this.byBetrayer.get(familyTreeId) ?? [];
  }

  /** Get all betrayals against a family */
  getBetrayalsAgainstFamily(familyTreeId: FamilyTreeId): BetrayalEvent[] {
    return this.byVictim.get(familyTreeId) ?? [];
  }

  /** Get betrayal reputation (0 = clean, 1 = known betrayer) */
  getBetrayalReputation(familyTreeId: FamilyTreeId): number {
    const count = this.byBetrayer.get(familyTreeId)?.length ?? 0;
    return Math.min(1, count * 0.2);
  }

  /** Calculate the economic value of a potential betrayal */
  calculateBetrayalEconomics(
    betrayerCharacter: Character,
    victimFamilyId: FamilyTreeId,
    type: BetrayalType,
  ): { potentialGain: number; potentialLoss: number; netValue: number } {
    const economics = BETRAYAL_ECONOMICS[type];
    const currentTrust = trustLedger.getTrust(victimFamilyId, betrayerCharacter.familyTreeId);

    const potentialGain = economics.beneficiaryTrustGain + (betrayerCharacter.fame * 0.001);
    const potentialLoss = Math.abs(economics.victimTrustLoss) + currentTrust;

    return {
      potentialGain,
      potentialLoss,
      netValue: potentialGain - potentialLoss,
    };
  }

  /** Identify witness families in a region */
  identifyWitnesses(regionId: string, betrayerCharacterId: CharacterId, tick: number): FamilyTreeId[] {
    const witnesses = new Set<FamilyTreeId>();
    const regionChars = characterRegistry.getByRegion(regionId);

    for (const char of regionChars) {
      if (char.id === betrayerCharacterId) continue;
      if (!char.isAlive) continue;
      witnesses.add(char.familyTreeId);
    }

    return Array.from(witnesses);
  }

  /** Apply betrayal consequences — trust, alliances, fame */
  applyBetrayalConsequences(event: BetrayalEvent): void {
    const economics = BETRAYAL_ECONOMICS[event.type];

    // Trust loss from victim
    trustLedger.recordBetrayal(event.betrayerFamilyId, event.victimFamilyId, event.tick);

    // Trust gain from beneficiary (if any)
    if (event.beneficiaryFamilyId && economics.beneficiaryTrustGain > 0) {
      trustLedger.recordCooperation(event.betrayerFamilyId, event.beneficiaryFamilyId, event.tick);
    }

    // Witness penalties
    if (event.witnessFamilyIds.length > 0) {
      trustLedger.spreadBetrayalReputation(event.betrayerFamilyId, event.witnessFamilyIds, event.tick);
    }

    // Alliance backstab dissolves alliances
    if (event.type === 'alliance_backstab') {
      const alliances = allianceRegistry.getAll();
      for (const alliance of alliances) {
        // Check if betrayer's species is in the alliance
        const betrayer = characterRegistry.get(event.betrayerCharacterId);
        if (betrayer && alliance.memberSpecies.includes(betrayer.speciesId)) {
          dissolveAlliance(alliance, 'betrayal');
        }
      }
    }

    // Fame change for betrayer
    const betrayer = characterRegistry.get(event.betrayerCharacterId);
    if (betrayer) {
      // Betrayal gives infamy (negative fame for some types)
      if (event.type === 'alliance_backstab') {
        betrayer.fame = Math.max(0, betrayer.fame - 5);
      } else {
        betrayer.fame += 2; // Notoriety has its own fame
      }
    }
  }

  clear(): void {
    this.betrayals = [];
    this.byBetrayer.clear();
    this.byVictim.clear();
  }
}

export let betrayalRegistry = new BetrayalRegistry();
export function _installBetrayalRegistry(instance: BetrayalRegistry): void { betrayalRegistry = instance; }
