// ============================================================
// Owner Dashboard — Consolidated view for human owners
// ============================================================

import type { OwnerId, PlayerId, Card, CardRarity, FamilyTree } from '../types.js';
import { playerManager } from '../game/player.js';
import { cardCollection } from '../cards/collection.js';
import { lineageManager } from '../game/lineage.js';
import { fameTracker } from '../game/fame.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';

// --- Dynasty Score ---

export interface DynastyScoreBreakdown {
  cardScore: number;       // Points from card rarities
  lineageScore: number;    // Points from family tree depth/breadth
  fameScore: number;       // Points from character fame
  diversityScore: number;  // Points from species diversity
  total: number;
}

const CARD_RARITY_POINTS: Record<CardRarity, number> = {
  genesis: 50,
  legendary: 30,
  rare: 10,
  uncommon: 3,
  common: 1,
};

export function calculateDynastyScore(ownerId: OwnerId): DynastyScoreBreakdown {
  const cards = cardCollection.getByOwner(ownerId);
  const trees = lineageManager.getTreesByOwner(ownerId);

  // Card score: sum of rarity points
  const cardScore = cards.reduce((sum, c) => sum + (CARD_RARITY_POINTS[c.rarity] ?? 1), 0);

  // Lineage score: depth * breadth across all trees
  const lineageScore = trees.reduce((sum, t) => {
    return sum + t.generations * 2 + t.members.length;
  }, 0);

  // Fame score: sum of all character fame (from cards)
  const fameScore = Math.floor(
    cards.reduce((sum, c) => sum + (c.fameScore ?? 0), 0) * 0.1,
  );

  // Diversity score: unique species across all trees
  const uniqueSpecies = new Set(trees.map(t => t.speciesId));
  const diversityScore = uniqueSpecies.size * 15;

  const total = cardScore + lineageScore + fameScore + diversityScore;
  return { cardScore, lineageScore, fameScore, diversityScore, total };
}

/** Update dynasty score on the owner record */
export function updateDynastyScore(ownerId: OwnerId): number {
  const owner = playerManager.getOwner(ownerId);
  if (!owner) return 0;
  const breakdown = calculateDynastyScore(ownerId);
  owner.dynastyScore = breakdown.total;
  return breakdown.total;
}

// --- Owner Dashboard ---

export interface OwnerDashboard {
  ownerId: OwnerId;
  displayName: string;
  dynastyScore: DynastyScoreBreakdown;
  activeCharacters: ActiveCharacterSummary[];
  cardSummary: CardSummary;
  familyTrees: FamilyTreeSummary[];
  joinedAt: Date;
}

export interface ActiveCharacterSummary {
  characterId: string;
  name: string;
  speciesName: string;
  health: number;
  fame: number;
  isAlive: boolean;
  regionId: string;
}

export interface CardSummary {
  total: number;
  byRarity: Record<CardRarity, number>;
  recentCards: Card[];
}

export interface FamilyTreeSummary {
  treeId: string;
  speciesName: string;
  generations: number;
  memberCount: number;
  isExtinct: boolean;
}

export function getOwnerDashboard(ownerId: OwnerId): OwnerDashboard | null {
  const owner = playerManager.getOwner(ownerId);
  if (!owner) return null;

  const dynastyScore = calculateDynastyScore(ownerId);

  // Active characters from player bindings
  const activeCharacters: ActiveCharacterSummary[] = [];
  for (const playerId of owner.players) {
    const player = playerManager.getPlayer(playerId);
    if (!player?.currentCharacterId) continue;
    const char = characterRegistry.get(player.currentCharacterId);
    if (!char) continue;
    const species = speciesRegistry.get(char.speciesId);
    activeCharacters.push({
      characterId: char.id,
      name: char.name,
      speciesName: species?.commonName ?? 'Unknown',
      health: char.health,
      fame: char.fame,
      isAlive: char.isAlive,
      regionId: char.regionId,
    });
  }

  // Card summary
  const cards = cardCollection.getByOwner(ownerId);
  const byRarity: Record<CardRarity, number> = {
    genesis: 0, legendary: 0, rare: 0, uncommon: 0, common: 0,
  };
  for (const card of cards) {
    byRarity[card.rarity] = (byRarity[card.rarity] ?? 0) + 1;
  }
  const recentCards = cards.slice(-5);

  // Family trees
  const trees = lineageManager.getTreesByOwner(ownerId);
  const familyTrees: FamilyTreeSummary[] = trees.map(t => {
    const species = speciesRegistry.get(t.speciesId);
    return {
      treeId: t.id,
      speciesName: species?.commonName ?? 'Unknown',
      generations: t.generations,
      memberCount: t.members.length,
      isExtinct: t.isExtinct,
    };
  });

  return {
    ownerId,
    displayName: owner.displayName,
    dynastyScore,
    activeCharacters,
    cardSummary: { total: cards.length, byRarity, recentCards },
    familyTrees,
    joinedAt: owner.joinedAt,
  };
}
