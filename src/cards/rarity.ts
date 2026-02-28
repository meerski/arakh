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
  if (factors.isGenesis) return 'mythic';

  let score = 0;
  score += factors.fame * 2;
  score += factors.achievementCount * 10;
  score += factors.generationsLived * 5;
  if (factors.isFirstOfKind) score += 50;
  score += factors.discoveryCount * 15;

  if (score >= 300) return 'mythic';
  if (score >= 200) return 'legendary';
  if (score >= 100) return 'epic';
  if (score >= 50) return 'rare';
  if (score >= 20) return 'uncommon';
  return 'common';
}

export function getRarityColor(rarity: CardRarity): string {
  const colors: Record<CardRarity, string> = {
    common: '#95A5A6',     // Gray
    uncommon: '#2ECC71',   // Green
    rare: '#3498DB',       // Blue
    epic: '#9B59B6',       // Purple
    legendary: '#FFD700',  // Gold
    mythic: '#E74C3C',     // Red
  };
  return colors[rarity];
}
