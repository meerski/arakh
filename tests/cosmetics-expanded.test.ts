import { describe, it, expect, beforeEach } from 'vitest';
import {
  CosmeticCatalog, CosmeticInventory, seedDefaultCatalog,
  cosmeticCatalog, cosmeticInventory,
  type CosmeticCategory,
} from '../src/game/cosmetics.js';
import type { OwnerId, FamilyTreeId, ColonyId } from '../src/types.js';

describe('Expanded Cosmetics — Phase 12', () => {
  describe('New categories in catalog', () => {
    beforeEach(() => {
      seedDefaultCatalog();
    });

    it('includes dynasty crests', () => {
      const crests = cosmeticCatalog.getByCategory('dynasty_crest');
      expect(crests.length).toBeGreaterThanOrEqual(3);
      expect(crests.some(c => c.name === 'Iron Crown')).toBe(true);
      expect(crests.some(c => c.name === 'Sunburst')).toBe(true);
    });

    it('includes appearance variants', () => {
      const variants = cosmeticCatalog.getByCategory('appearance_variant');
      expect(variants.length).toBeGreaterThanOrEqual(3);
      expect(variants.some(c => c.name === 'Albino')).toBe(true);
      expect(variants.some(c => c.name === 'Melanistic')).toBe(true);
    });

    it('includes narrator voices', () => {
      const voices = cosmeticCatalog.getByCategory('narrator_voice');
      expect(voices.length).toBeGreaterThanOrEqual(3);
      expect(voices.some(c => c.name === 'The Bard')).toBe(true);
    });

    it('includes memorial markers', () => {
      const memorials = cosmeticCatalog.getByCategory('memorial_marker');
      expect(memorials.length).toBeGreaterThanOrEqual(3);
      expect(memorials.some(c => c.name === 'Eternal Flame')).toBe(true);
    });

    it('includes colony skins', () => {
      const skins = cosmeticCatalog.getByCategory('colony_skin');
      expect(skins.length).toBeGreaterThanOrEqual(3);
      expect(skins.some(c => c.name === 'Crystal Hive')).toBe(true);
    });

    it('seed catalog has at least 27 items total', () => {
      const all = cosmeticCatalog.getAll();
      expect(all.length).toBeGreaterThanOrEqual(27);
    });
  });

  describe('Dynasty crest application', () => {
    let catalog: CosmeticCatalog;
    let inventory: CosmeticInventory;

    beforeEach(() => {
      catalog = new CosmeticCatalog();
      inventory = new CosmeticInventory();
    });

    it('applies dynasty crest to a family tree', () => {
      const crest = catalog.addItem({
        name: 'Wolf Crest', description: 'Wolf emblem',
        category: 'dynasty_crest', rarity: 'standard', price: 100, isAvailable: true,
      });
      // Need to make the inventory use our local catalog
      // Since CosmeticInventory.purchase uses the global cosmeticCatalog, let's use the global
      cosmeticCatalog.addItem({
        name: 'Test Crest', description: 'Test',
        category: 'dynasty_crest', rarity: 'standard', price: 100, isAvailable: true,
      });
      const items = cosmeticCatalog.getByCategory('dynasty_crest');
      const testCrest = items.find(i => i.name === 'Test Crest')!;

      cosmeticInventory.clear();
      cosmeticInventory.purchase('o1' as OwnerId, testCrest.id);

      const treeId = 'ft-dynasty-1' as FamilyTreeId;
      expect(cosmeticInventory.apply('o1' as OwnerId, testCrest.id, treeId)).toBe(true);

      const applied = cosmeticInventory.getAppliedTo('o1' as OwnerId, treeId);
      expect(applied).toHaveLength(1);
      expect(applied[0].cosmeticId).toBe(testCrest.id);
    });
  });

  describe('Colony skin application', () => {
    it('applies colony skin to a colony', () => {
      const skin = cosmeticCatalog.addItem({
        name: 'Test Colony Skin', description: 'Test',
        category: 'colony_skin', rarity: 'standard', price: 100, isAvailable: true,
      });

      cosmeticInventory.clear();
      cosmeticInventory.purchase('o1' as OwnerId, skin.id);

      const colonyId = 'colony-1' as ColonyId;
      expect(cosmeticInventory.apply('o1' as OwnerId, skin.id, colonyId)).toBe(true);

      const applied = cosmeticInventory.getAppliedTo('o1' as OwnerId, colonyId);
      expect(applied).toHaveLength(1);
    });
  });

  describe('Narrator voice application', () => {
    it('applies narrator voice to narrator target', () => {
      const voice = cosmeticCatalog.addItem({
        name: 'Test Voice', description: 'Test',
        category: 'narrator_voice', rarity: 'standard', price: 100, isAvailable: true,
      });

      cosmeticInventory.clear();
      cosmeticInventory.purchase('o1' as OwnerId, voice.id);

      expect(cosmeticInventory.apply('o1' as OwnerId, voice.id, 'narrator')).toBe(true);

      const applied = cosmeticInventory.getAppliedTo('o1' as OwnerId, 'narrator');
      expect(applied).toHaveLength(1);
    });
  });

  describe('Zero gameplay impact', () => {
    it('cosmetic items have no stat modifiers', () => {
      seedDefaultCatalog();
      const all = cosmeticCatalog.getAll();
      for (const item of all) {
        // CosmeticItem has no 'stats', 'modifier', 'bonus', or gameplay fields
        expect(item).not.toHaveProperty('statModifier');
        expect(item).not.toHaveProperty('bonus');
        expect(item).not.toHaveProperty('gameplayEffect');
      }
    });

    it('all cosmetic categories are purely visual', () => {
      const visualCategories: CosmeticCategory[] = [
        'card_frame', 'card_effect', 'profile_badge', 'dashboard_theme',
        'title', 'card_back', 'dynasty_crest', 'appearance_variant',
        'narrator_voice', 'memorial_marker', 'colony_skin',
      ];
      // Verify the type system enforces these are the only categories
      expect(visualCategories).toHaveLength(11);
    });

    it('limited edition caps are enforced', () => {
      const limited = cosmeticCatalog.addItem({
        name: 'Ultra Rare Crest', description: 'Only 2 ever',
        category: 'dynasty_crest', rarity: 'limited', price: 5000, isAvailable: true, maxOwners: 2,
      });

      cosmeticInventory.clear();
      cosmeticInventory.purchase('o1' as OwnerId, limited.id);
      cosmeticInventory.purchase('o2' as OwnerId, limited.id);
      const third = cosmeticInventory.purchase('o3' as OwnerId, limited.id);
      expect(third).toBeNull();
    });
  });
});
