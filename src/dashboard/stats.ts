// ============================================================
// Stats and Rankings
// ============================================================

import { speciesRegistry } from '../species/species.js';
import { cardCollection } from '../cards/collection.js';
import { lineageManager } from '../game/lineage.js';

export interface WorldStats {
  totalSpecies: number;
  extantSpecies: number;
  extinctSpecies: number;
  totalCards: number;
  totalFamilyTrees: number;
  longestLineage: number;
}

export function getWorldStats(): WorldStats {
  const allSpecies = speciesRegistry.getAll();
  const allTrees = lineageManager.getAllTrees();

  return {
    totalSpecies: allSpecies.length,
    extantSpecies: allSpecies.filter(s => s.status === 'extant').length,
    extinctSpecies: allSpecies.filter(s => s.status === 'extinct').length,
    totalCards: cardCollection.count(),
    totalFamilyTrees: allTrees.length,
    longestLineage: allTrees.reduce((max, t) => Math.max(max, t.generations), 0),
  };
}

export interface SpeciesRanking {
  speciesName: string;
  population: number;
  rank: number;
}

export function getSpeciesRankings(): SpeciesRanking[] {
  return speciesRegistry.getAll()
    .filter(s => s.status === 'extant')
    .sort((a, b) => b.totalPopulation - a.totalPopulation)
    .map((s, i) => ({
      speciesName: s.commonName,
      population: s.totalPopulation,
      rank: i + 1,
    }));
}
