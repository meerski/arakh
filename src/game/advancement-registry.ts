// ============================================================
// Advancement Registry — Tracks species progress per region
// ============================================================

import type { SpeciesAdvancement, SpeciesId, RegionId } from '../types.js';

export class AdvancementRegistry {
  private advancements: Map<string, SpeciesAdvancement> = new Map();

  private key(speciesId: SpeciesId, regionId: RegionId): string {
    return `${speciesId}:${regionId}`;
  }

  /** Get or create advancement state for a species in a region */
  getOrCreate(speciesId: SpeciesId, regionId: RegionId): SpeciesAdvancement {
    const k = this.key(speciesId, regionId);
    let adv = this.advancements.get(k);
    if (!adv) {
      adv = {
        speciesId,
        regionId,
        domains: {},
        researchProgress: {},
      };
      this.advancements.set(k, adv);
    }
    return adv;
  }

  get(speciesId: SpeciesId, regionId: RegionId): SpeciesAdvancement | undefined {
    return this.advancements.get(this.key(speciesId, regionId));
  }

  /** Get all advancements for a species across all regions */
  getForSpecies(speciesId: SpeciesId): SpeciesAdvancement[] {
    return Array.from(this.advancements.values()).filter(a => a.speciesId === speciesId);
  }

  /** Get all advancements */
  getAll(): SpeciesAdvancement[] {
    return Array.from(this.advancements.values());
  }

  restore(advancement: SpeciesAdvancement): void {
    this.advancements.set(this.key(advancement.speciesId, advancement.regionId), advancement);
  }

  clear(): void {
    this.advancements.clear();
  }
}

export let advancementRegistry = new AdvancementRegistry();
export function _installAdvancementRegistry(instance: AdvancementRegistry): void { advancementRegistry = instance; }
