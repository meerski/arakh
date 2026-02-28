// ============================================================
// Soulbound Card System
// ============================================================

import type {
  Card, CardId, CardRarity, Character, OwnerId,
  Achievement, Item, CardHighlight,
} from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { generateHighlightsFromCharacter } from './highlights.js';
import { generateCardFlavorText, generateEpitaph } from '../narrative/card-text.js';

export function createCard(character: Character, ownerId: OwnerId, era: string = ''): Card {
  const species = speciesRegistry.get(character.speciesId);
  const taxonomy = species
    ? species.taxonomy
    : { class: '', order: '', family: '', genus: '', species: '' };

  const highlights = generateHighlightsFromCharacter(character);
  const flavorText = generateCardFlavorText(character, era || 'the current age');
  const epitaph = !character.isAlive ? generateEpitaph(character) : '';

  return {
    id: crypto.randomUUID() as CardId,
    characterId: character.id,
    ownerId,
    rarity: calculateRarity(character),
    speciesId: character.speciesId,
    taxonomy,
    characterName: character.name,
    genetics: { ...character.genetics },
    familyTreePosition: { generation: character.generation, siblingIndex: 0 },
    achievements: [...character.achievements],
    heirlooms: character.inventory.filter(i => i.type === 'artifact' || i.type === 'trophy'),
    fameScore: character.fame,
    highlightReel: highlights,
    flavorText: epitaph ? `${flavorText} ${epitaph}` : flavorText,
    causeOfDeath: character.causeOfDeath,
    era,
    bornAtTick: character.bornAtTick,
    diedAtTick: character.diedAtTick,
    soulboundTo: ownerId,
    createdAt: new Date(),
  };
}

export function calculateRarity(character: Character): CardRarity {
  if (character.isGenesisElder) return 'genesis';
  if (character.fame >= 100) return 'legendary';
  if (character.fame >= 50 || character.achievements.length >= 5) return 'rare';
  if (character.fame >= 20 || character.achievements.length >= 2) return 'uncommon';
  return 'common';
}

export function addHighlight(card: Card, highlight: CardHighlight): void {
  card.highlightReel.push(highlight);
  card.highlightReel.sort((a, b) => b.significance - a.significance);
  // Keep top 10
  if (card.highlightReel.length > 10) {
    card.highlightReel = card.highlightReel.slice(0, 10);
  }
}
