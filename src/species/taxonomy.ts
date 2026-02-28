// ============================================================
// Taxonomy Engine — Class → Order → Family → Genus → Species
// ============================================================

import type { TaxonomyNode, TaxonomyRank, TaxonomyPath, SpeciesTraits } from '../types.js';

export class TaxonomyEngine {
  private nodes: Map<string, TaxonomyNode> = new Map();
  private children: Map<string, string[]> = new Map();

  /** Register a taxonomy node with inherited traits */
  register(node: TaxonomyNode): void {
    const key = `${node.rank}:${node.name}`;
    this.nodes.set(key, node);

    if (node.parentName) {
      const parentChildren = this.children.get(node.parentName) ?? [];
      parentChildren.push(node.name);
      this.children.set(node.parentName, parentChildren);
    }
  }

  /** Get a node by rank and name */
  get(rank: TaxonomyRank, name: string): TaxonomyNode | undefined {
    return this.nodes.get(`${rank}:${name}`);
  }

  /** Resolve full traits for a species by walking up the taxonomy tree */
  resolveTraits(path: TaxonomyPath): SpeciesTraits {
    const ranks: TaxonomyRank[] = ['class', 'order', 'family', 'genus', 'species'];
    const names = [path.class, path.order, path.family, path.genus, path.species];

    // Start with defaults
    let resolved = defaultTraits();

    // Apply traits from each level (class → species), more specific overrides
    for (let i = 0; i < ranks.length; i++) {
      const node = this.get(ranks[i], names[i]);
      if (node?.traits) {
        resolved = mergeTraits(resolved, node.traits);
      }
    }

    return resolved;
  }

  /** Get all registered species */
  getAllSpecies(): TaxonomyNode[] {
    return Array.from(this.nodes.values()).filter(n => n.rank === 'species');
  }

  /** Get children of a node */
  getChildren(name: string): string[] {
    return this.children.get(name) ?? [];
  }
}

function defaultTraits(): SpeciesTraits {
  return {
    lifespan: 8640,       // ~100 days (moderate)
    size: 50,
    speed: 50,
    strength: 50,
    intelligence: 10,
    perception: {
      visualRange: 50,
      hearingRange: 50,
      smellRange: 30,
      echolocation: false,
      electroreception: false,
      thermalSensing: false,
    },
    diet: 'omnivore',
    habitat: ['surface'],
    socialStructure: 'solitary',
    reproductionRate: 2,
    gestationTicks: 100,
    maturityTicks: 500,
    nocturnal: false,
    aquatic: false,
    canFly: false,
  };
}

function mergeTraits(base: SpeciesTraits, override: Partial<SpeciesTraits>): SpeciesTraits {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) {
      if (key === 'perception' && typeof value === 'object') {
        result.perception = { ...result.perception, ...value };
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  return result;
}

// Singleton taxonomy engine
export const taxonomyEngine = new TaxonomyEngine();
