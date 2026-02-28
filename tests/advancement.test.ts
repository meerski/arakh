import { describe, it, expect, beforeEach } from 'vitest';
import { getAvailableDomains, advanceResearch, canAttemptAction } from '../src/game/advancement.js';
import { AdvancementRegistry } from '../src/game/advancement-registry.js';
import { speciesRegistry } from '../src/species/species.js';

describe('Advancement System', () => {
  let wolfId: string;
  let fishId: string;
  let antId: string;

  beforeEach(() => {
    const wolf = speciesRegistry.getByName('AdvWolf');
    if (wolf) {
      wolfId = wolf.id;
    } else {
      wolfId = speciesRegistry.register({
        commonName: 'AdvWolf',
        scientificName: 'Advancus wolfus',
        taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'AW', species: 'AW' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 5000,
          intelligence: 45,
          strength: 60,
          size: 50,
          socialStructure: 'pack',
          diet: 'carnivore',
          perception: {
            visualRange: 80,
            hearingRange: 70,
            smellRange: 80,
            echolocation: false,
            electroreception: false,
            thermalSensing: false,
          },
        },
      }).id;
    }

    const fish = speciesRegistry.getByName('AdvFish');
    if (fish) {
      fishId = fish.id;
    } else {
      fishId = speciesRegistry.register({
        commonName: 'AdvFish',
        scientificName: 'Advancus fishus',
        taxonomy: { class: 'Actinopterygii', order: 'Perciformes', family: 'AF', genus: 'AF', species: 'AF' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 3000,
          intelligence: 10,
          strength: 15,
          size: 15,
          aquatic: true,
          perception: {
            visualRange: 30,
            hearingRange: 20,
            smellRange: 40,
            echolocation: false,
            electroreception: true,
            thermalSensing: false,
          },
        },
      }).id;
    }

    const ant = speciesRegistry.getByName('AdvAnt');
    if (ant) {
      antId = ant.id;
    } else {
      antId = speciesRegistry.register({
        commonName: 'AdvAnt',
        scientificName: 'Advancus antus',
        taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae', genus: 'AA', species: 'AA' },
        tier: 'flagship',
        traitOverrides: {
          lifespan: 500,
          intelligence: 5,
          strength: 5,
          size: 1,
          socialStructure: 'colony',
          diet: 'omnivore',
          perception: {
            visualRange: 5,
            hearingRange: 10,
            smellRange: 70,
            echolocation: false,
            electroreception: false,
            thermalSensing: false,
          },
        },
      }).id;
    }
  });

  describe('getAvailableDomains', () => {
    it('wolves get predatory, social, visual, acoustic, chemical domains', () => {
      const species = speciesRegistry.get(wolfId)!;
      const domains = getAvailableDomains(species);
      expect(domains).toContain('predatory');
      expect(domains).toContain('social');
      expect(domains).toContain('visual');
      expect(domains).toContain('acoustic');
      expect(domains).toContain('chemical');
    });

    it('fish get electric and aquatic domains', () => {
      const species = speciesRegistry.get(fishId)!;
      const domains = getAvailableDomains(species);
      expect(domains).toContain('electric');
      expect(domains).toContain('aquatic');
      // Fish should NOT get manipulation (low intelligence and small)
      expect(domains).not.toContain('aerial');
    });

    it('ants get chemical and architectural domains', () => {
      const species = speciesRegistry.get(antId)!;
      const domains = getAvailableDomains(species);
      expect(domains).toContain('chemical');
      expect(domains).toContain('architectural');
      expect(domains).not.toContain('aerial');
    });

    it('fish cannot access manipulation', () => {
      const species = speciesRegistry.get(fishId)!;
      const domains = getAvailableDomains(species);
      expect(domains).not.toContain('manipulation');
    });
  });

  describe('advanceResearch', () => {
    it('returns null for unavailable domains', () => {
      const result = advanceResearch(fishId, 'r1', 'manipulation', 1000);
      expect(result).toBeNull();
    });

    it('returns null for unknown species', () => {
      const result = advanceResearch('nonexistent', 'r1', 'social', 100);
      expect(result).toBeNull();
    });

    it('advances tier when enough points accumulated', () => {
      // Tier 0→1 costs 100 points
      // With intelligence bonus, wolves get ~1.45x
      let event = null;
      for (let i = 0; i < 10; i++) {
        event = advanceResearch(wolfId, 'r1', 'predatory', 50);
        if (event) break;
      }
      expect(event).not.toBeNull();
      expect(event!.newTier).toBe(1);
      expect(event!.domain).toBe('predatory');
    });

    it('caps at tier 4', () => {
      // Force to tier 4
      for (let i = 0; i < 200; i++) {
        advanceResearch(wolfId, 'r2', 'social', 500);
      }
      // Should return null when maxed
      const result = advanceResearch(wolfId, 'r2', 'social', 99999);
      expect(result).toBeNull();
    });
  });

  describe('canAttemptAction', () => {
    it('blocks crafting without manipulation', () => {
      const species = speciesRegistry.get(fishId)!;
      const result = canAttemptAction(species, 'r1', 'craft');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('manipulation');
    });

    it('allows non-gated actions', () => {
      const species = speciesRegistry.get(fishId)!;
      const result = canAttemptAction(species, 'r1', 'forage');
      expect(result.allowed).toBe(true);
    });
  });

  describe('AdvancementRegistry', () => {
    it('creates and retrieves advancement state', () => {
      const registry = new AdvancementRegistry();
      const adv = registry.getOrCreate('sp1', 'r1');
      expect(adv.speciesId).toBe('sp1');
      expect(adv.regionId).toBe('r1');
      expect(Object.keys(adv.domains)).toHaveLength(0);
    });

    it('returns same instance on repeated calls', () => {
      const registry = new AdvancementRegistry();
      const a1 = registry.getOrCreate('sp1', 'r1');
      a1.domains['social'] = 2;
      const a2 = registry.getOrCreate('sp1', 'r1');
      expect(a2.domains['social']).toBe(2);
    });

    it('tracks multiple species independently', () => {
      const registry = new AdvancementRegistry();
      registry.getOrCreate('sp1', 'r1').domains['social'] = 1;
      registry.getOrCreate('sp2', 'r1').domains['social'] = 3;
      expect(registry.get('sp1', 'r1')?.domains['social']).toBe(1);
      expect(registry.get('sp2', 'r1')?.domains['social']).toBe(3);
    });
  });
});
