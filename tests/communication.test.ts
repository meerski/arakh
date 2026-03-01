import { describe, it, expect } from 'vitest';
import { canCommunicate, getCommunicationSkill } from '../src/game/language.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';

describe('Extended Cross-Species Communication', () => {
  function getOrRegisterFull(
    name: string,
    cls: string,
    order: string,
    family: string,
    genus: string,
    sp: string,
    tier: 'flagship' | 'notable' | 'generated' = 'flagship',
  ): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const registered = speciesRegistry.register({
      commonName: name,
      scientificName: `Comtest ${name.toLowerCase()}`,
      taxonomy: { class: cls, order, family, genus, species: sp },
      tier,
      traitOverrides: { lifespan: 5000 },
    });
    return registered.id;
  }

  function makeChar(speciesId: string) {
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 't1' as any,
      tick: 0,
    });
  }

  describe('Taxonomy-based clarity', () => {
    it('same order species get clarity 0.1', () => {
      const spA = getOrRegisterFull('OrderTestA', 'TestClass', 'SharedOrder', 'FamA', 'GenA', 'spA');
      const spB = getOrRegisterFull('OrderTestB', 'TestClass', 'SharedOrder', 'FamB', 'GenB', 'spB');
      const a = makeChar(spA);
      const b = makeChar(spB);
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBeCloseTo(0.1);
    });

    it('same class species get clarity 0.02', () => {
      const spA = getOrRegisterFull('ClassTestA', 'SharedClass', 'OrderX', 'FamX', 'GenX', 'spX');
      const spB = getOrRegisterFull('ClassTestB', 'SharedClass', 'OrderY', 'FamY', 'GenY', 'spY');
      const a = makeChar(spA);
      const b = makeChar(spB);
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(true);
      expect(result.clarity).toBeCloseTo(0.02);
    });

    it('different class species get clarity 0', () => {
      const spA = getOrRegisterFull('DiffClassA', 'ClassAlpha', 'OrdA', 'FamDA', 'GenDA', 'spDA');
      const spB = getOrRegisterFull('DiffClassB', 'ClassBeta', 'OrdB', 'FamDB', 'GenDB', 'spDB');
      const a = makeChar(spA);
      const b = makeChar(spB);
      const result = canCommunicate(a, b);
      expect(result.canTalk).toBe(false);
      expect(result.clarity).toBe(0);
    });
  });

  describe('Communication skill', () => {
    it('adds +0.1 clarity per skill level', () => {
      const spA = getOrRegisterFull('SkillTestA', 'SkillClass', 'SkillOrdA', 'SkillFamA', 'SkillGenA', 'skA');
      const spB = getOrRegisterFull('SkillTestB', 'SkillClass', 'SkillOrdB', 'SkillFamB', 'SkillGenB', 'skB');
      const a = makeChar(spA);
      const b = makeChar(spB);

      // Add 3 communication_skill entries for a targeting b's species
      for (let i = 0; i < 3; i++) {
        a.knowledge.push({ topic: 'communication_skill', detail: spB, learnedAtTick: i, source: 'experience' });
      }

      const skill = getCommunicationSkill(a, spB);
      expect(skill).toBe(3);

      const result = canCommunicate(a, b);
      // Base clarity: same class = 0.02, skill bonus: (3 + 0) * 0.1 = 0.3
      expect(result.clarity).toBeCloseTo(0.02 + 0.3);
    });

    it('is capped at 5', () => {
      const spA = getOrRegisterFull('CapTestA', 'CapClass', 'CapOrdA', 'CapFamA', 'CapGenA', 'cpA');
      const spB = getOrRegisterFull('CapTestB', 'CapClass', 'CapOrdB', 'CapFamB', 'CapGenB', 'cpB');
      const a = makeChar(spA);

      // Add 8 communication_skill entries (more than the cap of 5)
      for (let i = 0; i < 8; i++) {
        a.knowledge.push({ topic: 'communication_skill', detail: spB, learnedAtTick: i, source: 'experience' });
      }

      const skill = getCommunicationSkill(a, spB);
      expect(skill).toBe(5);
    });
  });

  describe('Hybrid bonus', () => {
    it('generated (hybrid) species get +0.15 clarity bonus', () => {
      const spA = getOrRegisterFull('HybridComA', 'HybClass', 'HybOrdA', 'HybFamA', 'HybGenA', 'hyA', 'generated');
      const spB = getOrRegisterFull('HybridComB', 'HybClass', 'HybOrdB', 'HybFamB', 'HybGenB', 'hyB');
      const a = makeChar(spA);
      const b = makeChar(spB);

      const result = canCommunicate(a, b);
      // Base: same class = 0.02, + hybrid bonus 0.15 for species A being generated
      expect(result.clarity).toBeCloseTo(0.02 + 0.15);
      expect(result.canTalk).toBe(true);
    });
  });
});
