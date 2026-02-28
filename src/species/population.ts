// ============================================================
// Population Dynamics
// ============================================================

import type { Region, SpeciesId, Population, Character } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from './species.js';

export function initializePopulation(region: Region, speciesId: SpeciesId, count: number): void {
  const existing = region.populations.find(p => p.speciesId === speciesId);
  if (existing) {
    existing.count += count;
  } else {
    region.populations.push({
      speciesId,
      count,
      characters: [],
    });
  }

  // Update global species population
  speciesRegistry.updatePopulation(speciesId, count);
}

export function addCharacterToRegion(region: Region, character: Character): void {
  let pop = region.populations.find(p => p.speciesId === character.speciesId);
  if (!pop) {
    pop = { speciesId: character.speciesId, count: 0, characters: [] };
    region.populations.push(pop);
  }
  if (!pop.characters.includes(character.id)) {
    pop.characters.push(character.id);
  }
}

export function removeCharacterFromRegion(region: Region, character: Character): void {
  const pop = region.populations.find(p => p.speciesId === character.speciesId);
  if (pop) {
    pop.characters = pop.characters.filter(id => id !== character.id);
  }
}

export function getRegionSpeciesCount(region: Region, speciesId: SpeciesId): number {
  return region.populations.find(p => p.speciesId === speciesId)?.count ?? 0;
}

export function getTotalPopulation(region: Region): number {
  return region.populations.reduce((sum, p) => sum + p.count, 0);
}
