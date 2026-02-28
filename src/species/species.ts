// ============================================================
// Species Definitions
// ============================================================

import type { Species, SpeciesId, TaxonomyPath, SpeciesTraits, SpeciesTier } from '../types.js';
import { taxonomyEngine } from './taxonomy.js';

export class SpeciesRegistry {
  private species: Map<SpeciesId, Species> = new Map();

  register(params: {
    commonName: string;
    scientificName: string;
    taxonomy: TaxonomyPath;
    tier: SpeciesTier;
    traitOverrides?: Partial<SpeciesTraits>;
  }): Species {
    const traits = taxonomyEngine.resolveTraits(params.taxonomy);
    if (params.traitOverrides) {
      Object.assign(traits, params.traitOverrides);
    }

    const species: Species = {
      id: crypto.randomUUID() as SpeciesId,
      commonName: params.commonName,
      scientificName: params.scientificName,
      taxonomy: params.taxonomy,
      tier: params.tier,
      traits,
      status: 'extant',
      totalPopulation: 0,
      genesisElderCount: 0,
    };

    this.species.set(species.id, species);
    return species;
  }

  get(id: SpeciesId): Species | undefined {
    return this.species.get(id);
  }

  getByName(commonName: string): Species | undefined {
    for (const s of this.species.values()) {
      if (s.commonName === commonName) return s;
    }
    return undefined;
  }

  getAll(): Species[] {
    return Array.from(this.species.values());
  }

  getFlagship(): Species[] {
    return this.getAll().filter(s => s.tier === 'flagship');
  }

  getExtant(): Species[] {
    return this.getAll().filter(s => s.status === 'extant');
  }

  updatePopulation(id: SpeciesId, delta: number): void {
    const species = this.species.get(id);
    if (species) {
      species.totalPopulation = Math.max(0, species.totalPopulation + delta);
      if (species.totalPopulation === 0 && species.status === 'extant') {
        species.status = 'endangered';
      }
    }
  }

  markExtinct(id: SpeciesId): void {
    const species = this.species.get(id);
    if (species) {
      species.status = 'extinct';
      species.totalPopulation = 0;
    }
  }

  /** Increment the genesis elder count for a species. */
  incrementGenesisElderCount(id: SpeciesId): void {
    const species = this.species.get(id);
    if (species) {
      species.genesisElderCount++;
    }
  }

  /** Returns true if the species can still accept genesis elders (limit: 100). */
  isGenesisElderAvailable(id: SpeciesId): boolean {
    const species = this.species.get(id);
    if (!species) return false;
    return species.genesisElderCount < 100;
  }
}

export const speciesRegistry = new SpeciesRegistry();
