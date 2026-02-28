// ============================================================
// Rarity Calculation
// ============================================================

import type { Character, CardRarity } from '../types.js';

export interface RarityFactors {
  isGenesis: boolean;
  fame: number;
  achievementCount: number;
  generationsLived: number;
  isFirstOfKind: boolean;
  discoveryCount: number;
}

export function calculateDetailedRarity(factors: RarityFactors): CardRarity {
  if (factors.isGenesis) return 'genesis';

  let score = 0;
  score += factors.fame * 2;
  score += factors.achievementCount * 10;
  score += factors.generationsLived * 5;
  if (factors.isFirstOfKind) score += 50;
  score += factors.discoveryCount * 15;

  if (score >= 200) return 'legendary';
  if (score >= 100) return 'rare';
  if (score >= 30) return 'uncommon';
  return 'common';
}

export function getRarityColor(rarity: CardRarity): string {
  const colors: Record<CardRarity, string> = {
    genesis: '#FFD700',    // Gold
    legendary: '#FF6B00',  // Orange
    rare: '#9B59B6',       // Purple
    uncommon: '#3498DB',   // Blue
    common: '#95A5A6',     // Gray
  };
  return colors[rarity];
}
