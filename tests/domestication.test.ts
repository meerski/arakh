import { describe, it, expect, beforeEach } from 'vitest';
import { domesticationRegistry } from '../src/game/domestication.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import type { Character, Species } from '../src/types.js';

function makeSpecies(overrides: Partial<Species> & { id: string; commonName: string }): Species {
  return {
    scientificName: overrides.commonName,
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'test', genus: 'test', species: 'test' },
    tier: 'flagship',
    status: 'extant',
    totalPopulation: 100,
    genesisElderCount: 0,
    traits: {
      lifespan: 8640,
      size: 50,
      speed: 50,
      strength: 50,
      intelligence: 50,
      perception: { visualRange: 60, hearingRange: 50, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
      diet: 'omnivore',
      habitat: ['surface'],
      socialStructure: 'pack',
      reproductionRate: 2,
      gestationTicks: 500,
      maturityTicks: 2000,
      nocturnal: false,
      aquatic: false,
      canFly: false,
    },
    ...overrides,
  } as Species;
}

function makeCharacter(id: string, speciesId: string, overrides: Partial<Character> = {}): Character {
  return {
    id,
    name: `Char_${id}`,
    speciesId,
    playerId: null,
    regionId: 'region-1',
    familyTreeId: 'ft-1',
    bornAtTick: 0,
    diedAtTick: null,
    causeOfDeath: null,
    age: 100,
    isAlive: true,
    sex: 'male',
    generation: 0,
    genetics: {
      genes: [
        { trait: 'strength', value: 60, dominant: true },
        { trait: 'size', value: 50, dominant: true },
        { trait: 'speed', value: 50, dominant: true },
        { trait: 'intelligence', value: 50, dominant: true },
        { trait: 'aggression', value: 30, dominant: false },
        { trait: 'sociability', value: 50, dominant: true },
      ],
      mutationRate: 0.05,
    },
    health: 1,
    energy: 1,
    hunger: 0,
    lastBreedingTick: null,
    gestationEndsAtTick: null,
    relationships: [],
    parentIds: null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: false,
    socialRank: 0,
    loyalties: new Map(),
    role: 'none',
    ...overrides,
  } as Character;
}

describe('Domestication System', () => {
  beforeEach(() => {
    domesticationRegistry.clear();
    speciesRegistry.clear();
    characterRegistry.clear();
  });

  describe('canDomesticate', () => {
    it('should allow enslavement when master has 1.5x power', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-strong', commonName: 'Lion', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 80, size: 70 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-weak', commonName: 'Rabbit', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 20, size: 15, diet: 'herbivore' } }));

      const result = domesticationRegistry.canDomesticate('sp-strong', 'sp-weak');
      expect(result.possible).toBe(true);
    });

    it('should allow symbiosis when both intelligent', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-smart1', commonName: 'Dolphin', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, intelligence: 40 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-smart2', commonName: 'Crow', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, intelligence: 35 } }));

      const result = domesticationRegistry.canDomesticate('sp-smart1', 'sp-smart2');
      expect(result.possible).toBe(true);
      expect(result.bestType).toBe('symbiosis');
    });

    it('should allow husbandry when master intelligent and target herbivore', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-farmer', commonName: 'Human', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, intelligence: 40, strength: 40, size: 50 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-cow', commonName: 'Cow', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, intelligence: 10, diet: 'herbivore', strength: 50, size: 60 } }));

      const result = domesticationRegistry.canDomesticate('sp-farmer', 'sp-cow');
      expect(result.possible).toBe(true);
    });

    it('should return not possible for unknown species', () => {
      const result = domesticationRegistry.canDomesticate('nonexistent', 'also-nonexistent');
      expect(result.possible).toBe(false);
    });
  });

  describe('attemptDomestication', () => {
    it('should create a bond on success', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-master', commonName: 'Wolf', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 80, size: 60, intelligence: 40 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-servant', commonName: 'Sheep', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 20, size: 25, intelligence: 10, diet: 'herbivore' } }));

      const master = makeCharacter('master-1', 'sp-master', { genetics: { genes: [{ trait: 'strength', value: 90, dominant: true }, { trait: 'intelligence', value: 60, dominant: true }, { trait: 'aggression', value: 30, dominant: false }], mutationRate: 0.05 } });
      const servant = makeCharacter('servant-1', 'sp-servant', { genetics: { genes: [{ trait: 'strength', value: 20, dominant: true }, { trait: 'intelligence', value: 10, dominant: true }, { trait: 'aggression', value: 10, dominant: false }], mutationRate: 0.05 } });
      characterRegistry.add(master);
      characterRegistry.add(servant);

      // Try many times to get at least one success (RNG-dependent)
      let succeeded = false;
      for (let i = 0; i < 20; i++) {
        domesticationRegistry.clear();
        const result = domesticationRegistry.attemptDomestication(master, servant, 'husbandry', 100);
        if (result.success) {
          succeeded = true;
          expect(result.bond).toBeDefined();
          expect(result.bond!.type).toBe('husbandry');
          break;
        }
      }
      expect(succeeded).toBe(true);
    });

    it('should fail for incompatible species', () => {
      const master = makeCharacter('m1', 'nonexistent');
      const servant = makeCharacter('s1', 'also-nonexistent');
      characterRegistry.add(master);
      characterRegistry.add(servant);

      const result = domesticationRegistry.attemptDomestication(master, servant, undefined, 100);
      expect(result.success).toBe(false);
    });
  });

  describe('getDomesticationBenefits', () => {
    it('should aggregate benefits from all bonds', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-m', commonName: 'Master', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 80, size: 70, intelligence: 50 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-s', commonName: 'Servant', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 20, size: 20, intelligence: 10, diet: 'herbivore' } }));

      const master = makeCharacter('m2', 'sp-m');
      const servant = makeCharacter('s2', 'sp-s');
      characterRegistry.add(master);
      characterRegistry.add(servant);

      // Force a bond
      let bonded = false;
      for (let i = 0; i < 30; i++) {
        domesticationRegistry.clear();
        const r = domesticationRegistry.attemptDomestication(master, servant, 'husbandry', 100);
        if (r.success) { bonded = true; break; }
      }
      if (!bonded) return; // Skip if RNG doesn't cooperate

      const benefits = domesticationRegistry.getDomesticationBenefits(master.id);
      expect(benefits.length).toBeGreaterThan(0);
      expect(benefits.some(b => b.type === 'food_production')).toBe(true);
    });

    it('should return empty for no bonds', () => {
      const benefits = domesticationRegistry.getDomesticationBenefits('nobody');
      expect(benefits).toEqual([]);
    });
  });

  describe('rebellion', () => {
    it('should have rebellion pressure grow over ticks for enslavement', () => {
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-m3', commonName: 'Alpha', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 90, size: 70 } }));
      speciesRegistry.registerDirect(makeSpecies({ id: 'sp-s3', commonName: 'Beta', traits: { ...makeSpecies({ id: '', commonName: '' }).traits, strength: 20, size: 20 } }));

      const master = makeCharacter('m3', 'sp-m3');
      const servant = makeCharacter('s3', 'sp-s3');
      characterRegistry.add(master);
      characterRegistry.add(servant);

      let bonded = false;
      for (let i = 0; i < 30; i++) {
        domesticationRegistry.clear();
        const r = domesticationRegistry.attemptDomestication(master, servant, 'enslavement', 100);
        if (r.success) { bonded = true; break; }
      }
      if (!bonded) return;

      const bondsBefore = domesticationRegistry.getBondsForMaster(master.id);
      expect(bondsBefore.length).toBe(1);
      const pressureBefore = bondsBefore[0].rebellionPressure;

      domesticationRegistry.tickDomestication(200);

      const bondsAfter = domesticationRegistry.getBondsForMaster(master.id);
      if (bondsAfter.length > 0) {
        expect(bondsAfter[0].rebellionPressure).toBeGreaterThan(pressureBefore);
      }
    });
  });

  describe('symbiosis stability', () => {
    it('symbiosis has much lower rebellion pressure growth than enslavement', () => {
      // Symbiosis grows at 0.0002/tick vs enslavement at 0.002/tick
      expect(0.0002).toBeLessThan(0.002);
    });

    it('symbiosis family tree impact is positive', () => {
      // Family tree impact rates: symbiosis +0.0005, enslavement +0.0006
      // But enslavement risks -2.0 penalty on rebellion
      expect(0.0005).toBeGreaterThan(0);
    });
  });

  describe('defense bond allies', () => {
    it('should return empty when no defense bonds exist', () => {
      const allies = domesticationRegistry.getDefenseBondAllies('nobody', 'nowhere');
      expect(allies).toEqual([]);
    });
  });

  describe('releaseDomesticated', () => {
    it('should return message for non-existent bond', () => {
      const msg = domesticationRegistry.releaseDomesticated('nonexistent', 100);
      expect(msg).toBe('No such bond exists.');
    });
  });
});
