// ============================================================
// Multi-Species Alliances
// ============================================================

import type {
  MultiSpeciesAlliance, AllianceTrigger, SpeciesId, RegionId, Region, WorldEvent,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';
import type { EcosystemState } from '../simulation/ecosystem.js';
import { getPredatorsOf } from '../simulation/ecosystem.js';
import { worldDrift } from '../security/world-drift.js';
import { trustLedger } from './trust.js';
import { characterRegistry } from '../species/registry.js';

// ============================================================
// Alliance Registry — singleton
// ============================================================

export class AllianceRegistry {
  private alliances: Map<string, MultiSpeciesAlliance> = new Map();

  add(alliance: MultiSpeciesAlliance): void {
    this.alliances.set(alliance.id, alliance);
  }

  get(id: string): MultiSpeciesAlliance | undefined {
    return this.alliances.get(id);
  }

  getAll(): MultiSpeciesAlliance[] {
    return Array.from(this.alliances.values());
  }

  getAlliancesInRegion(regionId: RegionId): MultiSpeciesAlliance[] {
    return Array.from(this.alliances.values()).filter(
      a => a.sharedRegionIds.includes(regionId) && a.strength > 0,
    );
  }

  getAlliancesForSpecies(speciesId: SpeciesId): MultiSpeciesAlliance[] {
    return Array.from(this.alliances.values()).filter(
      a => a.memberSpecies.includes(speciesId) && a.strength > 0,
    );
  }

  remove(id: string): void {
    this.alliances.delete(id);
  }

  restore(alliance: MultiSpeciesAlliance): void {
    this.alliances.set(alliance.id, alliance);
  }

  clear(): void {
    this.alliances.clear();
  }
}

export let allianceRegistry = new AllianceRegistry();
export function _installAllianceRegistry(instance: AllianceRegistry): void { allianceRegistry = instance; }

// ============================================================
// Alliance Formation
// ============================================================

export function evaluateAllianceTriggers(
  region: Region,
  ecosystem: EcosystemState,
  tick: number,
): MultiSpeciesAlliance | null {
  // Don't form alliances in regions with too few species
  const speciesInRegion = region.populations.filter(p => p.count > 0).map(p => p.speciesId);
  if (speciesInRegion.length < 2) return null;

  // Check: already have an alliance for these species in this region?
  const existing = allianceRegistry.getAlliancesInRegion(region.id);
  if (existing.length > 0) return null;

  // --- Common enemy detection ---
  // Find predators that threaten 2+ species in this region
  const sharedPredators = new Map<SpeciesId, SpeciesId[]>(); // predator -> [prey species]
  for (const speciesId of speciesInRegion) {
    const predators = getPredatorsOf(ecosystem, speciesId);
    for (const pred of predators) {
      const predPop = region.populations.find(p => p.speciesId === pred.predatorId && p.count > 0);
      if (!predPop) continue;
      const list = sharedPredators.get(pred.predatorId) ?? [];
      list.push(speciesId);
      sharedPredators.set(pred.predatorId, list);
    }
  }

  for (const [predatorId, preyList] of sharedPredators) {
    if (preyList.length >= 2) {
      return formAlliance(preyList, [region.id], 'common_enemy', tick);
    }
  }

  // --- Resource scarcity ---
  const totalResource = region.resources.reduce((s, r) => s + r.quantity, 0);
  const maxResource = region.resources.reduce((s, r) => s + r.maxQuantity, 0);
  if (maxResource > 0 && totalResource / maxResource < 0.2 && speciesInRegion.length >= 2) {
    return formAlliance(speciesInRegion.slice(0, 3), [region.id], 'resource_scarcity', tick);
  }

  return null;
}

function formAlliance(
  memberSpecies: SpeciesId[],
  regionIds: RegionId[],
  trigger: AllianceTrigger,
  tick: number,
): MultiSpeciesAlliance {
  const names = memberSpecies.map(id => speciesRegistry.get(id)?.commonName ?? 'Unknown');
  const name = `${names.slice(0, 2).join('-')} Alliance`;

  const alliance: MultiSpeciesAlliance = {
    id: crypto.randomUUID(),
    name,
    memberSpecies: [...memberSpecies],
    sharedRegionIds: [...regionIds],
    formedAtTick: tick,
    trigger,
    strength: 0.8,
  };

  allianceRegistry.add(alliance);

  // Record cooperation for all member families
  const memberFamilies = new Set<string>();
  for (const speciesId of memberSpecies) {
    for (const char of characterRegistry.getLiving()) {
      if (char.speciesId === speciesId) {
        memberFamilies.add(char.familyTreeId);
      }
    }
  }
  const familyIds = Array.from(memberFamilies);
  for (let i = 0; i < familyIds.length; i++) {
    for (let j = i + 1; j < familyIds.length; j++) {
      trustLedger.recordCooperation(familyIds[i], familyIds[j], tick);
    }
  }

  return alliance;
}

// ============================================================
// Alliance Tick — Decay & Dissolution
// ============================================================

export function tickAlliance(alliance: MultiSpeciesAlliance, tick: number): WorldEvent | null {
  // Strength decays over time (drift-modified)
  const decayCoeff = worldDrift.getCoefficient('alliance_decay', tick);
  alliance.strength -= 0.001 * decayCoeff;

  if (alliance.strength <= 0) {
    return dissolveAlliance(alliance, 'natural decay');
  }

  return null;
}

export function dissolveAlliance(alliance: MultiSpeciesAlliance, reason: string): WorldEvent {
  allianceRegistry.remove(alliance.id);

  const names = alliance.memberSpecies.map(id => speciesRegistry.get(id)?.commonName ?? 'Unknown');

  return {
    id: crypto.randomUUID(),
    type: 'alliance',
    level: 'cross_species',
    regionIds: alliance.sharedRegionIds,
    description: `The ${alliance.name} (${names.join(', ')}) has dissolved due to ${reason}.`,
    tick: 0,
    effects: [{ type: 'alliance_dissolved', magnitude: 0.5 }],
    resolved: true,
  };
}

// ============================================================
// Alliance Defense Bonus
// ============================================================

export function applyAllianceDefense(regionId: RegionId, speciesId: SpeciesId): number {
  const alliances = allianceRegistry.getAlliancesInRegion(regionId);
  let defenseBonus = 0;

  for (const alliance of alliances) {
    if (alliance.memberSpecies.includes(speciesId)) {
      defenseBonus += alliance.strength * 0.3;
    }
  }

  return Math.min(0.5, defenseBonus);  // Cap at 50% reduction
}

// ============================================================
// Defense Pact Evaluation
// ============================================================

export function evaluateDefensePact(
  proposerSpeciesId: SpeciesId,
  targetSpeciesId: SpeciesId,
  regionId: RegionId,
  ecosystem: EcosystemState,
): { viable: boolean; benefitScore: number } {
  // Check for shared predators in the food web
  const proposerPreds = getPredatorsOf(ecosystem, proposerSpeciesId).map(e => e.predatorId);
  const targetPreds = getPredatorsOf(ecosystem, targetSpeciesId).map(e => e.predatorId);
  const sharedPredators = proposerPreds.filter(p => targetPreds.includes(p));

  if (sharedPredators.length === 0) {
    return { viable: false, benefitScore: 0 };
  }

  const benefitScore = Math.min(1, sharedPredators.length * 0.3);
  return { viable: true, benefitScore };
}

// ============================================================
// Alliance Events Tick
// ============================================================

export function tickAlliances(tick: number): WorldEvent[] {
  const events: WorldEvent[] = [];

  for (const alliance of allianceRegistry.getAll()) {
    const event = tickAlliance(alliance, tick);
    if (event) {
      event.tick = tick;
      events.push(event);
    }
  }

  return events;
}
