import { describe, it, expect } from 'vitest';
import { inheritLegacy } from '../src/game/legacy-transfer.js';
import { processCharacterDeath } from '../src/game/legacy.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character, FamilyTree } from '../src/types.js';

describe('Legacy & Death Processing', () => {
  let speciesId: string;

  function setup() {
    const existing = speciesRegistry.getByName('LegacyTest');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'LegacyTest',
        scientificName: 'Testus legatus',
        taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'L' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000 },
      });
      speciesId = sp.id;
    }
  }

  function makeChar(overrides?: Partial<{ tick: number }>): Character {
    setup();
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: overrides?.tick ?? 0,
    });
  }

  describe('inheritLegacy', () => {
    it('transfers items from parent to child', () => {
      const parent = makeChar();
      const child = makeChar();
      parent.inventory.push({
        id: 'item-1' as any,
        name: 'Ancient Sword',
        type: 'artifact',
        properties: {},
        createdAtTick: 0,
        createdBy: parent.id,
      });

      inheritLegacy(parent, child);
      expect(child.inventory).toHaveLength(1);
      expect(child.inventory[0].name).toBe('Ancient Sword');
    });

    it('transfers knowledge with inherited source', () => {
      const parent = makeChar();
      const child = makeChar();
      parent.knowledge.push({
        topic: 'fire',
        detail: 'Can be made from sticks',
        learnedAtTick: 100,
        source: 'experience',
      });
      parent.knowledge.push({
        topic: 'water',
        detail: 'Found in rivers',
        learnedAtTick: 200,
        source: 'inherited', // Should not transfer (not experience)
      });

      inheritLegacy(parent, child);
      expect(child.knowledge).toHaveLength(1);
      expect(child.knowledge[0].source).toBe('inherited');
      expect(child.knowledge[0].topic).toBe('fire');
    });

    it('transfers 30% of fame', () => {
      const parent = makeChar();
      const child = makeChar();
      parent.fame = 100;

      inheritLegacy(parent, child);
      expect(child.fame).toBe(30);
    });

    it('transfers strong relationships diluted by 50%', () => {
      const parent = makeChar();
      const child = makeChar();
      parent.relationships.push(
        { targetId: 'ally-1' as any, type: 'ally', strength: 0.8 },
        { targetId: 'enemy-1' as any, type: 'enemy', strength: -0.9 },
        { targetId: 'weak-1' as any, type: 'friend', strength: 0.2 }, // Too weak to transfer
      );

      inheritLegacy(parent, child);
      expect(child.relationships).toHaveLength(2); // Only strong ones
      expect(child.relationships[0].strength).toBeCloseTo(0.4);
      expect(child.relationships[1].strength).toBeCloseTo(-0.45);
    });
  });

  describe('processCharacterDeath', () => {
    it('transfers legacy to healthiest descendant', () => {
      const parent = makeChar();
      parent.fame = 100;
      parent.isAlive = false;

      const weakChild = makeChar();
      weakChild.health = 0.5;
      const strongChild = makeChar();
      strongChild.health = 0.9;

      const tree: FamilyTree = {
        id: 'tree-1' as any,
        speciesId,
        ownerId: 'owner-1' as any,
        rootCharacterId: parent.id,
        generations: 2,
        members: [parent.id, weakChild.id, strongChild.id],
        isExtinct: false,
      };

      const result = processCharacterDeath(parent, tree, [weakChild, strongChild]);
      expect(result.legacyTransferred).toBe(true);
      expect(result.heir?.id).toBe(strongChild.id);
      expect(strongChild.fame).toBe(30); // 30% of 100
    });

    it('handles death with no descendants', () => {
      const parent = makeChar();
      parent.isAlive = false;

      const tree: FamilyTree = {
        id: 'tree-1' as any,
        speciesId,
        ownerId: 'owner-1' as any,
        rootCharacterId: parent.id,
        generations: 1,
        members: [parent.id],
        isExtinct: false,
      };

      const result = processCharacterDeath(parent, tree, []);
      expect(result.legacyTransferred).toBe(false);
      expect(result.heir).toBeNull();
      expect(result.respawn).toBeDefined();
    });
  });
});
