import { describe, it, expect } from 'vitest';
import { canCommunicate } from '../src/game/language.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import { processMessage } from '../src/server/messaging.js';
import type { ChatMessage } from '../src/types.js';

describe('Language & Communication', () => {
  function getOrCreateSpecies(name: string, genus: string, family: string) {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Testus ${name.toLowerCase()}`,
      taxonomy: { class: 'M', order: 'O', family, genus, species: name.slice(0, 2) },
      tier: 'flagship',
      traitOverrides: { lifespan: 5000 },
    });
    return sp.id;
  }

  describe('canCommunicate', () => {
    it('same species communicate freely', () => {
      const spId = getOrCreateSpecies('LangTestA', 'LG', 'LF');
      const a = createCharacter({ speciesId: spId, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const b = createCharacter({ speciesId: spId, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBe(1.0);
    });

    it('same genus has partial communication', () => {
      const spA = getOrCreateSpecies('LangSameGenusA', 'LGShared', 'LFam');
      const spB = getOrCreateSpecies('LangSameGenusB', 'LGShared', 'LFam');
      const a = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const b = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBe(0.5);
    });

    it('same family has minimal communication', () => {
      const spA = getOrCreateSpecies('LangSameFamA', 'LGFam1', 'SharedFam');
      const spB = getOrCreateSpecies('LangSameFamB', 'LGFam2', 'SharedFam');
      const a = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const b = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBe(0.2);
    });

    it('unrelated species cannot communicate', () => {
      const spA = getOrCreateSpecies('LangUnrelA', 'UGA', 'UFA');
      const spB = getOrCreateSpecies('LangUnrelB', 'UGB', 'UFB');
      const a = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const b = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(false);
    });

    it('learned language allows cross-species communication', () => {
      const spA = getOrCreateSpecies('LangLearnA', 'LLA', 'LFA2');
      const spB = getOrCreateSpecies('LangLearnB', 'LLB', 'LFB2');
      const a = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const b = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });

      // Both learn each other's language
      a.knowledge.push({ topic: 'language', detail: spB, learnedAtTick: 0, source: 'experience' });
      b.knowledge.push({ topic: 'language', detail: spA, learnedAtTick: 0, source: 'experience' });

      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBe(0.7);
    });
  });

  describe('processMessage', () => {
    it('delivers message between same species', () => {
      const spId = getOrCreateSpecies('MsgTestA', 'MG', 'MF');
      const sender = createCharacter({ speciesId: spId, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const receiver = createCharacter({ speciesId: spId, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });

      const msg: ChatMessage = { from: sender.id, to: receiver.id, content: 'Hello friend' };
      const result = processMessage(msg, sender, receiver);
      expect(result.delivered).toBe(true);
      expect(result.clarity).toBe(1.0);
    });

    it('garbles message for partial communication', () => {
      const spA = getOrCreateSpecies('MsgPartialA', 'MPG', 'MPF');
      const spB = getOrCreateSpecies('MsgPartialB', 'MPG', 'MPF');
      const sender = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const receiver = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });

      const msg: ChatMessage = { from: sender.id, to: receiver.id, content: 'This is a test message' };
      const result = processMessage(msg, sender, receiver);
      expect(result.delivered).toBe(true);
      expect(result.clarity).toBe(0.5);
      expect(result.garbledContent).toBeDefined();
    });

    it('does not deliver message for unrelated species', () => {
      const spA = getOrCreateSpecies('MsgNoA', 'MNA', 'MNFA');
      const spB = getOrCreateSpecies('MsgNoB', 'MNB', 'MNFB');
      const sender = createCharacter({ speciesId: spA, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });
      const receiver = createCharacter({ speciesId: spB, regionId: 'r1' as any, familyTreeId: 't1' as any, tick: 0 });

      const msg: ChatMessage = { from: sender.id, to: receiver.id, content: 'Can you hear me?' };
      const result = processMessage(msg, sender, receiver);
      expect(result.delivered).toBe(false);
    });
  });
});
