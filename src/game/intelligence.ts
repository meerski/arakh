// ============================================================
// Family Intelligence Map — Per-Family Fog-of-War
// ============================================================

import type {
  FamilyTreeId, RegionId, RegionIntel, FamilyIntelMap,
  CharacterId, Region, SpeciesId,
} from '../types.js';
import { characterRegistry } from '../species/registry.js';

export class IntelligenceRegistry {
  private maps: Map<FamilyTreeId, FamilyIntelMap> = new Map();

  getOrCreate(familyTreeId: FamilyTreeId): FamilyIntelMap {
    let map = this.maps.get(familyTreeId);
    if (!map) {
      map = {
        familyTreeId,
        knownRegions: new Map(),
        exploredRegionIds: new Set(),
        lastFullSurveyTick: 0,
      };
      this.maps.set(familyTreeId, map);
    }
    return map;
  }

  /** Record exploration — character explores/moves, family learns the region */
  recordExploration(characterId: CharacterId, regionId: RegionId, region: Region, tick: number): void {
    const character = characterRegistry.get(characterId);
    if (!character) return;

    const map = this.getOrCreate(character.familyTreeId);

    const resources = region.resources
      .filter(r => r.quantity > 0)
      .map(r => r.type);

    const species: SpeciesId[] = region.populations
      .filter(p => p.count > 0)
      .map(p => p.speciesId);

    const popEstimate = region.populations.reduce((s, p) => s + p.count, 0);

    const threats: string[] = [];
    if (region.climate.temperature > 40) threats.push('extreme_heat');
    if (region.climate.temperature < -15) threats.push('extreme_cold');
    if (region.climate.pollution > 0.5) threats.push('pollution');

    const intel: RegionIntel = {
      regionId,
      discoveredAtTick: tick,
      lastUpdatedTick: tick,
      reliability: 1.0,
      knownResources: resources,
      knownSpecies: species,
      knownPopEstimate: popEstimate,
      knownThreats: threats,
      source: 'exploration',
      sourceCharacterId: characterId,
      isMisinformation: false,
    };

    // Update existing or create new
    const existing = map.knownRegions.get(regionId);
    if (existing) {
      intel.discoveredAtTick = existing.discoveredAtTick;
    }

    map.knownRegions.set(regionId, intel);
    map.exploredRegionIds.add(regionId);
  }

  /** Share intel between families — reliability reduced by 0.8x */
  shareIntel(fromFamilyId: FamilyTreeId, toFamilyId: FamilyTreeId, regionId: RegionId, tick: number): RegionIntel | null {
    const fromMap = this.maps.get(fromFamilyId);
    if (!fromMap) return null;

    const sourceIntel = fromMap.knownRegions.get(regionId);
    if (!sourceIntel) return null;

    const toMap = this.getOrCreate(toFamilyId);

    const sharedIntel: RegionIntel = {
      ...sourceIntel,
      lastUpdatedTick: tick,
      reliability: sourceIntel.reliability * 0.8,
      source: 'shared',
      sourceCharacterId: sourceIntel.sourceCharacterId,
    };

    // Only update if better reliability or new
    const existing = toMap.knownRegions.get(regionId);
    if (!existing || existing.reliability < sharedIntel.reliability) {
      toMap.knownRegions.set(regionId, sharedIntel);
    }

    return sharedIntel;
  }

  /** Get region intel for a family */
  getRegionIntel(familyTreeId: FamilyTreeId, regionId: RegionId): RegionIntel | null {
    const map = this.maps.get(familyTreeId);
    if (!map) return null;
    return map.knownRegions.get(regionId) ?? null;
  }

  /** Get all known region IDs for a family */
  getKnownRegions(familyTreeId: FamilyTreeId): RegionId[] {
    const map = this.maps.get(familyTreeId);
    if (!map) return [];
    return Array.from(map.knownRegions.keys());
  }

  /** Check if a family has explored a region directly */
  hasExplored(familyTreeId: FamilyTreeId, regionId: RegionId): boolean {
    const map = this.maps.get(familyTreeId);
    if (!map) return false;
    return map.exploredRegionIds.has(regionId);
  }

  /** Plant misinformation in a target family's intel map */
  plantMisinformation(targetFamilyId: FamilyTreeId, regionId: RegionId, falseIntel: Partial<RegionIntel>): void {
    const map = this.getOrCreate(targetFamilyId);

    const existing = map.knownRegions.get(regionId);

    // If no existing intel or existing reliability is low, overwrite fully
    if (!existing || existing.reliability < 0.6) {
      const misinfo: RegionIntel = {
        regionId,
        discoveredAtTick: falseIntel.discoveredAtTick ?? existing?.discoveredAtTick ?? 0,
        lastUpdatedTick: falseIntel.lastUpdatedTick ?? 0,
        reliability: falseIntel.reliability ?? 0.7,
        knownResources: falseIntel.knownResources ?? existing?.knownResources ?? [],
        knownSpecies: falseIntel.knownSpecies ?? existing?.knownSpecies ?? [],
        knownPopEstimate: falseIntel.knownPopEstimate ?? existing?.knownPopEstimate ?? 0,
        knownThreats: falseIntel.knownThreats ?? existing?.knownThreats ?? [],
        source: 'rumor',
        sourceCharacterId: falseIntel.sourceCharacterId ?? null,
        isMisinformation: true,
      };
      map.knownRegions.set(regionId, misinfo);
    } else {
      // High-reliability existing intel: blend instead of replace
      existing.reliability = Math.max(0, existing.reliability - 0.2);
      // Append false threats without replacing existing ones
      const falseThreats = falseIntel.knownThreats ?? [];
      for (const threat of falseThreats) {
        if (!existing.knownThreats.includes(threat)) {
          existing.knownThreats.push(threat);
        }
      }
      existing.isMisinformation = true;
      existing.lastUpdatedTick = falseIntel.lastUpdatedTick ?? existing.lastUpdatedTick;
      // Keep existing resources, species, popEstimate intact
    }
  }

  /** Decay intel reliability over time */
  decayIntelReliability(familyMap: FamilyIntelMap, tick: number): void {
    const toRemove: RegionId[] = [];

    for (const [regionId, intel] of familyMap.knownRegions) {
      const lastDecay = intel.lastDecayTick ?? intel.lastUpdatedTick;
      const delta = tick - lastDecay;
      intel.reliability = Math.max(0, intel.reliability - delta * 0.001);
      intel.lastDecayTick = tick;

      if (intel.reliability <= 0) {
        toRemove.push(regionId);
      }
    }

    for (const regionId of toRemove) {
      familyMap.knownRegions.delete(regionId);
    }
  }

  /** Decay all intel across all families */
  decayAll(tick: number): void {
    for (const map of this.maps.values()) {
      this.decayIntelReliability(map, tick);
    }
  }

  clear(): void {
    this.maps.clear();
  }
}

export let intelligenceRegistry = new IntelligenceRegistry();
export function _installIntelligenceRegistry(instance: IntelligenceRegistry): void { intelligenceRegistry = instance; }
