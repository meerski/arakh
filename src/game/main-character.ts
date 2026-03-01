// ============================================================
// Main Character Manager
// ============================================================
// Characters are classified as 'main' (1-20 per species, emerge from impact)
// or 'regular' (bulk, no death cards).
//
// Rules:
//   - Founding elders (isGenesisElder) are always main.
//   - Top characters by impactScore are promoted to main.
//   - Max 20 main characters per species.
//   - Main characters get death cards on death.
//   - Demotion happens while alive if overtaken in impact.

import type { Character, CharacterId, SpeciesId, CharacterClass, OwnerId } from '../types.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';
import { createCard } from '../cards/card.js';
import { cardCollection } from '../cards/collection.js';

const MAX_MAIN_PER_SPECIES = 20;

export class MainCharacterManager {
  /** Evaluate all living characters and promote/demote as needed. */
  evaluatePromotions(tick: number): void {
    const allSpecies = speciesRegistry.getAll();

    for (const species of allSpecies) {
      const living = characterRegistry.getBySpecies(species.id).filter(c => c.isAlive);
      if (living.length === 0) continue;

      this.evaluateSpecies(living);
    }
  }

  /** Evaluate a group of living characters for a single species. */
  private evaluateSpecies(characters: Character[]): void {
    // Update impact scores
    for (const char of characters) {
      char.impactScore = this.calculateImpactScore(char);
    }

    // Sort by impact (genesis elders always first)
    const sorted = [...characters].sort((a, b) => {
      if (a.isGenesisElder && !b.isGenesisElder) return -1;
      if (!a.isGenesisElder && b.isGenesisElder) return 1;
      return b.impactScore - a.impactScore;
    });

    // Promote top N, demote the rest
    for (let i = 0; i < sorted.length; i++) {
      const char = sorted[i];
      const shouldBeMain = i < MAX_MAIN_PER_SPECIES;

      if (shouldBeMain && char.characterClass !== 'main') {
        char.characterClass = 'main';
      } else if (!shouldBeMain && char.characterClass === 'main' && !char.isGenesisElder) {
        char.characterClass = 'regular';
      }
    }
  }

  /** Calculate impact score for a character. */
  private calculateImpactScore(char: Character): number {
    let score = 0;

    // Fame is the primary driver
    score += char.fame * 2;

    // Achievements
    score += char.achievements.length * 5;

    // Social rank
    score += char.socialRank;

    // Descendants (dynasty impact)
    score += char.childIds.length * 10;

    // Age (older = more established)
    score += Math.min(50, char.age * 0.01);

    // Genesis elder bonus
    if (char.isGenesisElder) score += 1000;

    // Player-controlled bonus
    if (char.playerId) score += 50;

    return Math.round(score);
  }

  /** Handle death of a main character — create death card. */
  processMainCharacterDeath(character: Character, era: string): void {
    if (character.characterClass !== 'main') return;

    // Use familyTreeId as owner proxy (trees are bound to owners)
    const ownerId = (character.familyTreeId ?? character.id) as unknown as OwnerId;
    const card = createCard(character, ownerId, era);
    cardCollection.addCard(card);
  }
}

export let mainCharacterManager = new MainCharacterManager();

export function _installMainCharacterManager(instance: MainCharacterManager): void {
  mainCharacterManager = instance;
}
