import { describe, it, expect, beforeEach } from 'vitest';
import { MainCharacterManager } from '../src/game/main-character.js';
import { createWorldContext, installWorldContext } from '../src/context.js';
import { createCharacter } from '../src/species/character.js';
import { seedTaxonomy } from '../src/data/taxonomy/seed.js';
import { seedMammals } from '../src/data/taxonomy/mammals.js';
import type { WorldContext } from '../src/context.js';
import type { RegionId, FamilyTreeId } from '../src/types.js';

describe('MainCharacterManager', () => {
  let ctx: WorldContext;
  let manager: MainCharacterManager;

  beforeEach(() => {
    ctx = createWorldContext();
    installWorldContext(ctx);
    seedTaxonomy();
    seedMammals();
    manager = ctx.mainCharacters;
  });

  it('founding elders are always main class', () => {
    const species = ctx.species.getAll()[0];
    const char = createCharacter({
      speciesId: species.id,
      regionId: 'region-1' as RegionId,
      familyTreeId: 'tree-1' as FamilyTreeId,
      tick: 0,
      isGenesisElder: true,
    });

    expect(char.characterClass).toBe('main');
    expect(char.isGenesisElder).toBe(true);
  });

  it('regular characters start as regular class', () => {
    const species = ctx.species.getAll()[0];
    const char = createCharacter({
      speciesId: species.id,
      regionId: 'region-1' as RegionId,
      familyTreeId: 'tree-1' as FamilyTreeId,
      tick: 0,
    });

    expect(char.characterClass).toBe('regular');
  });

  it('promotes top impact characters to main', () => {
    const species = ctx.species.getAll()[0];
    const regionId = 'region-1' as RegionId;
    const treeId = 'tree-1' as FamilyTreeId;

    // Create 25 characters
    const chars = [];
    for (let i = 0; i < 25; i++) {
      const char = createCharacter({
        speciesId: species.id,
        regionId,
        familyTreeId: treeId,
        tick: 0,
      });
      char.fame = i * 10; // Increasing fame
      ctx.characters.add(char);
      chars.push(char);
    }

    manager.evaluatePromotions(100);

    // Top 20 by fame should be main
    const mainCount = chars.filter(c => c.characterClass === 'main').length;
    expect(mainCount).toBe(20);

    // The 5 lowest-fame should be regular
    const regularCount = chars.filter(c => c.characterClass === 'regular').length;
    expect(regularCount).toBe(5);
  });

  it('genesis elders stay main even with low impact', () => {
    const species = ctx.species.getAll()[0];
    const regionId = 'region-1' as RegionId;
    const treeId = 'tree-1' as FamilyTreeId;

    // Create 25 characters, make the first a genesis elder with 0 fame
    const elder = createCharacter({
      speciesId: species.id,
      regionId,
      familyTreeId: treeId,
      tick: 0,
      isGenesisElder: true,
    });
    elder.fame = 0;
    ctx.characters.add(elder);

    for (let i = 1; i < 25; i++) {
      const char = createCharacter({
        speciesId: species.id,
        regionId,
        familyTreeId: treeId,
        tick: 0,
      });
      char.fame = 1000; // Higher fame than elder
      ctx.characters.add(char);
    }

    manager.evaluatePromotions(100);

    // Elder should still be main despite lowest fame
    expect(elder.characterClass).toBe('main');
  });

  it('creates death card for main character', () => {
    const species = ctx.species.getAll()[0];
    const char = createCharacter({
      speciesId: species.id,
      regionId: 'region-1' as RegionId,
      familyTreeId: 'tree-1' as FamilyTreeId,
      tick: 0,
      isGenesisElder: true,
    });
    char.fame = 100;
    ctx.characters.add(char);

    const cardsBefore = ctx.cards.getAll().length;
    manager.processMainCharacterDeath(char, 'The Dawn');
    const cardsAfter = ctx.cards.getAll().length;

    expect(cardsAfter).toBe(cardsBefore + 1);
  });

  it('does not create death card for regular character', () => {
    const species = ctx.species.getAll()[0];
    const char = createCharacter({
      speciesId: species.id,
      regionId: 'region-1' as RegionId,
      familyTreeId: 'tree-1' as FamilyTreeId,
      tick: 0,
    });
    ctx.characters.add(char);

    const cardsBefore = ctx.cards.getAll().length;
    manager.processMainCharacterDeath(char, 'The Dawn');
    const cardsAfter = ctx.cards.getAll().length;

    expect(cardsAfter).toBe(cardsBefore); // No card created
  });
});
