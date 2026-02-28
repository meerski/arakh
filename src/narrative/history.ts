// ============================================================
// World Chronicle, Eras of Dominance
// ============================================================

import type { WorldEvent, SpeciesId, Era } from '../types.js';
import { speciesRegistry } from '../species/species.js';

export interface HistoricalRecord {
  tick: number;
  year: number;
  event: WorldEvent;
  significance: number;
}

export class WorldChronicle {
  private records: HistoricalRecord[] = [];
  private eras: Era[] = [];
  private currentEra: Era;

  constructor() {
    this.currentEra = { name: 'The Dawn', startTick: 0, dominantSpecies: null };
    this.eras.push(this.currentEra);
  }

  recordEvent(event: WorldEvent, year: number): void {
    const significance = this.calculateSignificance(event);
    this.records.push({ tick: event.tick, year, event, significance });

    // Keep records manageable
    if (this.records.length > 10000) {
      // Keep only significant records
      this.records = this.records.filter(r => r.significance > 0.3);
    }
  }

  checkForEraChange(populations: Map<SpeciesId, number>): Era | null {
    // Find dominant species (>30% of total population)
    let total = 0;
    let dominant: SpeciesId | null = null;
    let dominantPop = 0;

    for (const [speciesId, pop] of populations) {
      total += pop;
      if (pop > dominantPop) {
        dominantPop = pop;
        dominant = speciesId;
      }
    }

    if (dominant && dominantPop / total > 0.3 && dominant !== this.currentEra.dominantSpecies) {
      const species = speciesRegistry.get(dominant);
      const name = species
        ? `The Age of the ${species.commonName}s`
        : 'A New Era';

      const era: Era = {
        name,
        startTick: this.records.length > 0 ? this.records[this.records.length - 1].tick : 0,
        dominantSpecies: dominant,
      };

      this.currentEra = era;
      this.eras.push(era);
      return era;
    }

    return null;
  }

  getCurrentEra(): Era {
    return this.currentEra;
  }

  getSignificantEvents(limit: number = 20): HistoricalRecord[] {
    return [...this.records]
      .sort((a, b) => b.significance - a.significance)
      .slice(0, limit);
  }

  getTimeline(startTick: number, endTick: number): HistoricalRecord[] {
    return this.records.filter(r => r.tick >= startTick && r.tick <= endTick);
  }

  private calculateSignificance(event: WorldEvent): number {
    const levelWeights: Record<string, number> = {
      personal: 0.1,
      family: 0.2,
      community: 0.3,
      species: 0.5,
      cross_species: 0.6,
      regional: 0.7,
      continental: 0.85,
      global: 1.0,
    };
    return levelWeights[event.level] ?? 0.1;
  }
}

export const worldChronicle = new WorldChronicle();
