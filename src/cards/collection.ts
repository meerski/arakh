// ============================================================
// Card Collection per Owner
// ============================================================

import type { Card, CardId, CardRarity, OwnerId, SpeciesId } from '../types.js';

export class CardCollection {
  private cards: Map<CardId, Card> = new Map();

  addCard(card: Card): void {
    this.cards.set(card.id, card);
  }

  getCard(id: CardId): Card | undefined {
    return this.cards.get(id);
  }

  getByOwner(ownerId: OwnerId): Card[] {
    return Array.from(this.cards.values()).filter(c => c.soulboundTo === ownerId);
  }

  getByRarity(rarity: CardRarity): Card[] {
    return Array.from(this.cards.values()).filter(c => c.rarity === rarity);
  }

  getBySpecies(speciesId: SpeciesId): Card[] {
    return Array.from(this.cards.values()).filter(c => c.speciesId === speciesId);
  }

  getAll(): Card[] {
    return Array.from(this.cards.values());
  }

  count(): number {
    return this.cards.size;
  }
}

export const cardCollection = new CardCollection();
