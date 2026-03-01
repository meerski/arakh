// ============================================================
// Heartland System — Family Concentration Tracking
// ============================================================

import type {
  FamilyTreeId, RegionId, HeartlandProfile,
} from '../types.js';
import { characterRegistry } from '../species/registry.js';

export class HeartlandTracker {
  private profiles: Map<FamilyTreeId, HeartlandProfile> = new Map();

  /** Get heartland profile for a family */
  getProfile(familyTreeId: FamilyTreeId): HeartlandProfile | undefined {
    return this.profiles.get(familyTreeId);
  }

  /** Recalculate all heartland profiles from living characters */
  recalculateAll(tick: number): void {
    // Group living characters by family
    const familyRegions = new Map<FamilyTreeId, Map<RegionId, number>>();

    for (const character of characterRegistry.getLiving()) {
      let regions = familyRegions.get(character.familyTreeId);
      if (!regions) {
        regions = new Map();
        familyRegions.set(character.familyTreeId, regions);
      }
      regions.set(character.regionId, (regions.get(character.regionId) ?? 0) + 1);
    }

    for (const [familyId, regions] of familyRegions) {
      const totalMembers = Array.from(regions.values()).reduce((s, c) => s + c, 0);
      if (totalMembers === 0) continue;

      // Find highest concentration
      let maxRegionId: RegionId | null = null;
      let maxConcentration = 0;

      const concentrationRegions = new Map<RegionId, number>();
      for (const [regionId, count] of regions) {
        const concentration = count / totalMembers;
        concentrationRegions.set(regionId, concentration);
        if (concentration > maxConcentration) {
          maxConcentration = concentration;
          maxRegionId = regionId;
        }
      }

      const existing = this.profiles.get(familyId);
      const heartlandRegionId = maxConcentration >= 0.7 ? maxRegionId : null;
      const heartlandStrength = maxConcentration >= 0.7 ? maxConcentration
        : maxConcentration >= 0.5 ? maxConcentration * 0.7
        : 0;

      this.profiles.set(familyId, {
        familyTreeId: familyId,
        concentrationRegions,
        heartlandRegionId,
        heartlandStrength,
        exposureLevel: existing?.exposureLevel ?? 0,
        discoveredBy: existing?.discoveredBy ?? [],
      });
    }
  }

  /** Get families that have a heartland in a given region */
  getFamiliesWithHeartlandIn(regionId: RegionId): FamilyTreeId[] {
    const families: FamilyTreeId[] = [];
    for (const [familyId, profile] of this.profiles) {
      if (profile.heartlandRegionId === regionId) {
        families.push(familyId);
      }
    }
    return families;
  }

  /** Record that a family has discovered another's heartland */
  recordHeartlandDiscovery(discovererFamilyId: FamilyTreeId, targetFamilyId: FamilyTreeId): void {
    const profile = this.profiles.get(targetFamilyId);
    if (!profile) return;

    if (!profile.discoveredBy.includes(discovererFamilyId)) {
      profile.discoveredBy.push(discovererFamilyId);
      // Update exposure level based on number of hostile discoveries
      profile.exposureLevel = Math.min(1, profile.discoveredBy.length * 0.2);
    }
  }

  /** Get exposure level — how many hostile families know heartland */
  getExposureLevel(familyTreeId: FamilyTreeId): number {
    const profile = this.profiles.get(familyTreeId);
    return profile?.exposureLevel ?? 0;
  }

  /** Check if a family knows the heartland of another */
  knowsHeartland(discovererFamilyId: FamilyTreeId, targetFamilyId: FamilyTreeId): boolean {
    const profile = this.profiles.get(targetFamilyId);
    if (!profile) return false;
    return profile.discoveredBy.includes(discovererFamilyId);
  }

  /** Get heartland defense bonus (+10% in heartland) */
  getHeartlandDefenseBonus(familyTreeId: FamilyTreeId, regionId: RegionId): number {
    const profile = this.profiles.get(familyTreeId);
    if (!profile || profile.heartlandRegionId !== regionId) return 0;
    return 0.1 * profile.heartlandStrength;
  }

  /** Get foraging bonus (+5% in heartland) */
  getHeartlandForagingBonus(familyTreeId: FamilyTreeId, regionId: RegionId): number {
    const profile = this.profiles.get(familyTreeId);
    if (!profile || profile.heartlandRegionId !== regionId) return 0;
    return 0.05 * profile.heartlandStrength;
  }

  /** Get hunt bonus for predators who know a heartland (+15%) */
  getHeartlandHuntBonus(hunterFamilyId: FamilyTreeId, regionId: RegionId): number {
    // Check if any family has heartland here and hunter knows it
    for (const [targetFamilyId, profile] of this.profiles) {
      if (targetFamilyId === hunterFamilyId) continue;
      if (profile.heartlandRegionId !== regionId) continue;
      if (profile.discoveredBy.includes(hunterFamilyId)) {
        return 0.15;
      }
    }
    return 0;
  }

  clear(): void {
    this.profiles.clear();
  }
}

export let heartlandTracker = new HeartlandTracker();
export function _installHeartlandTracker(instance: HeartlandTracker): void { heartlandTracker = instance; }
