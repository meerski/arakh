// ============================================================
// Corpses — Death Materials & Decay System
// ============================================================

import type { Character, Corpse, CorpseMaterial, MaterialType, SpeciesId, RegionId } from '../types.js';
import { speciesRegistry } from '../species/species.js';

// Materials yielded by species class
const CLASS_MATERIALS: Record<string, MaterialType[]> = {
  Mammalia: ['bone', 'hide', 'teeth'],
  Aves: ['feather', 'bone'],
  Reptilia: ['scale', 'hide', 'teeth'],
  Amphibia: ['bone'],
  Actinopterygii: ['bone', 'scale'],
  Chondrichthyes: ['cartilage', 'teeth'],
  Insecta: ['chitin'],
  Arachnida: ['chitin'],
  Crustacea: ['shell', 'chitin'],
  Malacostraca: ['shell', 'chitin'],
  Gastropoda: ['shell'],
  Cephalopoda: ['cartilage'],
  Bivalvia: ['shell'],
  Anthozoa: ['coral_fragment'],
  Cnidaria: ['coral_fragment'],
};

// Special material overrides based on traits
function getSpecialMaterials(speciesId: SpeciesId): MaterialType[] {
  const species = speciesRegistry.get(speciesId);
  if (!species) return [];
  const extras: MaterialType[] = [];

  // Large mammals may yield ivory/horn/blubber
  if (species.taxonomy.class === 'Mammalia') {
    if (species.traits.size > 70) extras.push('blubber');
    // Elephants, walruses, etc.
    if (species.commonName.toLowerCase().includes('elephant') ||
        species.commonName.toLowerCase().includes('walrus') ||
        species.commonName.toLowerCase().includes('narwhal')) {
      extras.push('ivory');
    }
    if (species.commonName.toLowerCase().includes('rhino') ||
        species.commonName.toLowerCase().includes('buffalo') ||
        species.commonName.toLowerCase().includes('bison') ||
        species.commonName.toLowerCase().includes('goat') ||
        species.commonName.toLowerCase().includes('deer') ||
        species.commonName.toLowerCase().includes('elk') ||
        species.commonName.toLowerCase().includes('moose')) {
      extras.push('horn');
    }
  }

  // Birds with quills
  if (species.taxonomy.class === 'Aves' && species.commonName.toLowerCase().includes('porcupine')) {
    extras.push('quill');
  }

  // Silk producers
  if (species.commonName.toLowerCase().includes('spider') ||
      species.commonName.toLowerCase().includes('silkworm')) {
    extras.push('silk');
  }

  return extras;
}

export function generateCorpseMaterials(speciesId: SpeciesId): CorpseMaterial[] {
  const species = speciesRegistry.get(speciesId);
  if (!species) return [];

  const cls = species.taxonomy.class;
  const baseMats = CLASS_MATERIALS[cls] ?? ['bone'];
  const specialMats = getSpecialMaterials(speciesId);
  const allMats = [...new Set([...baseMats, ...specialMats])];

  // Quantity scales with species size trait
  const sizeFactor = Math.max(0.1, species.traits.size / 50);

  return allMats.map(type => ({
    type,
    quantity: Math.max(1, Math.round(5 * sizeFactor)),
    quality: 0.5 + Math.random() * 0.5,  // 0.5-1.0
  }));
}

// ============================================================
// Corpse Registry — singleton
// ============================================================

export class CorpseRegistry {
  private corpses: Map<string, Corpse> = new Map();

  createCorpse(character: Character, tick: number): Corpse {
    const species = speciesRegistry.get(character.speciesId);
    const sizeFactor = species ? Math.max(0.1, species.traits.size / 50) : 1;

    const corpse: Corpse = {
      id: crypto.randomUUID(),
      speciesId: character.speciesId,
      regionId: character.regionId,
      characterId: character.id,
      diedAtTick: tick,
      materials: generateCorpseMaterials(character.speciesId),
      biomassRemaining: sizeFactor * 100,
      // Small corpses decay fast (~50 ticks), large ones slow (~500 ticks)
      decayRate: Math.max(0.2, 2 / sizeFactor),
    };

    this.corpses.set(corpse.id, corpse);
    return corpse;
  }

  tickCorpseDecay(tick: number): void {
    const toRemove: string[] = [];

    for (const [id, corpse] of this.corpses) {
      corpse.biomassRemaining -= corpse.decayRate;

      // Degrade material quality over time
      for (const mat of corpse.materials) {
        mat.quality = Math.max(0, mat.quality - 0.001);
      }

      // Remove fully decayed corpses
      if (corpse.biomassRemaining <= 0 && corpse.materials.every(m => m.quantity <= 0 || m.quality <= 0)) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.corpses.delete(id);
    }
  }

  harvestFromCorpse(corpseId: string, materialType: MaterialType, amount: number): number {
    const corpse = this.corpses.get(corpseId);
    if (!corpse) return 0;

    const material = corpse.materials.find(m => m.type === materialType);
    if (!material || material.quantity <= 0) return 0;

    const harvested = Math.min(material.quantity, amount);
    material.quantity -= harvested;
    return harvested;
  }

  getCorpsesInRegion(regionId: RegionId): Corpse[] {
    return Array.from(this.corpses.values()).filter(c => c.regionId === regionId);
  }

  get(id: string): Corpse | undefined {
    return this.corpses.get(id);
  }

  getAll(): Corpse[] {
    return Array.from(this.corpses.values());
  }

  clear(): void {
    this.corpses.clear();
  }
}

export let corpseRegistry = new CorpseRegistry();
export function _installCorpseRegistry(instance: CorpseRegistry): void { corpseRegistry = instance; }
