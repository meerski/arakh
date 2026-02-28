import { describe, it, expect } from 'vitest';
import { createCard, calculateRarity, addHighlight } from '../src/cards/card.js';
import { CardCollection } from '../src/cards/collection.js';
import type { Character, OwnerId } from '../src/types.js';

function mockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1' as any,
    name: 'TestChar',
    speciesId: 'species-1' as any,
    playerId: null,
    regionId: 'region-1' as any,
    familyTreeId: 'tree-1' as any,
    bornAtTick: 0,
    diedAtTick: 100,
    causeOfDeath: 'old age',
    age: 100,
    isAlive: false,
    genetics: { genes: [], mutationRate: 0.05 },
    health: 0,
    energy: 0,
    hunger: 1,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
    ...overrides,
  };
}

describe('Card System', () => {
  it('creates a card from a character', () => {
    const char = mockCharacter();
    const card = createCard(char, 'owner-1' as OwnerId);

    expect(card.characterId).toBe('char-1');
    expect(card.soulboundTo).toBe('owner-1');
    expect(card.rarity).toBe('common');
  });

  it('genesis elder gets genesis rarity', () => {
    const char = mockCharacter({ isGenesisElder: true });
    expect(calculateRarity(char)).toBe('genesis');
  });

  it('high fame gets legendary rarity', () => {
    const char = mockCharacter({ fame: 100 });
    expect(calculateRarity(char)).toBe('legendary');
  });

  it('moderate fame gets rare rarity', () => {
    const char = mockCharacter({ fame: 50 });
    expect(calculateRarity(char)).toBe('rare');
  });

  it('card highlight reel stays capped at 10', () => {
    const char = mockCharacter();
    const card = createCard(char, 'owner-1' as OwnerId);

    for (let i = 0; i < 15; i++) {
      addHighlight(card, { tick: i, description: `Event ${i}`, significance: i * 0.06 });
    }

    expect(card.highlightReel.length).toBe(10);
    // Should keep the most significant
    expect(card.highlightReel[0].significance).toBeGreaterThan(card.highlightReel[9].significance);
  });
});

describe('CardCollection', () => {
  it('stores and retrieves cards', () => {
    const collection = new CardCollection();
    const char = mockCharacter();
    const card = createCard(char, 'owner-1' as OwnerId);

    collection.addCard(card);
    expect(collection.count()).toBe(1);
    expect(collection.getByOwner('owner-1' as OwnerId)).toHaveLength(1);
  });

  it('filters by rarity', () => {
    const collection = new CardCollection();
    const common = createCard(mockCharacter(), 'owner-1' as OwnerId);
    const genesis = createCard(mockCharacter({ isGenesisElder: true }), 'owner-1' as OwnerId);

    collection.addCard(common);
    collection.addCard(genesis);

    expect(collection.getByRarity('genesis')).toHaveLength(1);
    expect(collection.getByRarity('common')).toHaveLength(1);
  });
});
