import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateSharingExposure,
  compartmentalizeIntel,
  evaluateIntelTrade,
} from '../src/game/intel-sharing.js';
import { trustLedger } from '../src/game/trust.js';
import { intelligenceRegistry } from '../src/game/intelligence.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { RegionIntel } from '../src/types.js';

describe('Intel Sharing', () => {
  let speciesId: string;

  function getOrRegister(name: string): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Sharetest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'ShareFam', genus: 'ShareGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 50, lifespan: 5000, habitat: ['surface'], diet: 'omnivore' },
    });
    return sp.id;
  }

  function mkChar(regionId: string, familyTreeId: string) {
    const c = createCharacter({ speciesId, regionId, familyTreeId, tick: 100 });
    characterRegistry.add(c);
    return c;
  }

  const baseIntel: RegionIntel = {
    regionId: 'region-test',
    discoveredAtTick: 100,
    lastUpdatedTick: 100,
    reliability: 0.9,
    knownResources: ['grass', 'water', 'berries', 'stone', 'iron'],
    knownSpecies: ['sp-1', 'sp-2', 'sp-3', 'sp-4'],
    knownPopEstimate: 123,
    knownThreats: ['extreme_heat'],
    source: 'exploration',
    sourceCharacterId: 'char-1',
    isMisinformation: false,
  };

  beforeEach(() => {
    trustLedger.clear();
    intelligenceRegistry.clear();
    speciesId = getOrRegister('ShareFox');
  });

  describe('compartmentalizeIntel', () => {
    it('should share everything with low intelligence', () => {
      const result = compartmentalizeIntel(baseIntel, 30);
      expect(result.sourceCharacterId).toBe('char-1');
      expect(result.knownResources.length).toBe(5);
    });

    it('should strip source character with medium intelligence', () => {
      const result = compartmentalizeIntel(baseIntel, 55);
      expect(result.sourceCharacterId).toBeNull();
      expect(result.knownResources.length).toBe(5);
    });

    it('should limit details with high intelligence', () => {
      const result = compartmentalizeIntel(baseIntel, 80);
      expect(result.sourceCharacterId).toBeNull();
      expect(result.knownResources.length).toBeLessThanOrEqual(3);
      expect(result.knownSpecies.length).toBeLessThanOrEqual(3);
      expect(result.knownPopEstimate % 10).toBe(0);
    });
  });

  describe('calculateSharingExposure', () => {
    it('should always reveal position', () => {
      const sharer = mkChar('region-a', 'family-sharer');
      const recipient = mkChar('region-b', 'family-recipient');

      const exposure = calculateSharingExposure(sharer, recipient, baseIntel);
      expect(exposure.positionRevealed).toBe(true);
    });

    it('should reveal family info when intel is from exploration', () => {
      const sharer = mkChar('region-a', 'family-sharer');
      const recipient = mkChar('region-b', 'family-recipient');

      const explorationIntel: RegionIntel = { ...baseIntel, source: 'exploration' };
      const exposure = calculateSharingExposure(sharer, recipient, explorationIntel);
      expect(exposure.familyInfoRevealed).toBe(true);
    });

    it('should not reveal family info for shared intel', () => {
      const sharer = mkChar('region-a', 'family-sharer');
      const recipient = mkChar('region-b', 'family-recipient');

      const sharedIntel: RegionIntel = { ...baseIntel, source: 'shared' };
      const exposure = calculateSharingExposure(sharer, recipient, sharedIntel);
      expect(exposure.familyInfoRevealed).toBe(false);
    });

    it('should increase exposure with higher trust', () => {
      const sharer = mkChar('region-a', 'family-sharer-t');
      const recipient = mkChar('region-b', 'family-recipient-t');

      const exposureLow = calculateSharingExposure(sharer, recipient, baseIntel);

      // Build significant trust
      for (let i = 0; i < 50; i++) {
        trustLedger.recordCooperation('family-sharer-t', 'family-recipient-t', i);
      }

      const exposureHigh = calculateSharingExposure(sharer, recipient, baseIntel);
      expect(exposureHigh.exposureLevel).toBeGreaterThan(exposureLow.exposureLevel);
    });
  });

  describe('evaluateIntelTrade', () => {
    it('should evaluate a fair trade', () => {
      const offered: RegionIntel = {
        ...baseIntel,
        knownResources: ['grass', 'water'],
        knownSpecies: ['sp-1'],
        reliability: 0.8,
      };
      const requested: RegionIntel = {
        ...baseIntel,
        knownResources: ['iron', 'stone'],
        knownSpecies: ['sp-2'],
        reliability: 0.8,
      };

      const result = evaluateIntelTrade(offered, requested, 0.5, 0.5);
      expect(result.fair).toBe(true);
    });

    it('should detect unfair trades', () => {
      const offered: RegionIntel = {
        ...baseIntel,
        knownResources: ['grass'],
        knownSpecies: [],
        reliability: 0.2,
      };
      const requested: RegionIntel = {
        ...baseIntel,
        knownResources: ['iron', 'stone', 'gold', 'diamond'],
        knownSpecies: ['sp-1', 'sp-2', 'sp-3'],
        reliability: 1.0,
      };

      const result = evaluateIntelTrade(offered, requested, 0, 0);
      expect(result.fair).toBe(false);
    });

    it('should have positive trade value', () => {
      const result = evaluateIntelTrade(baseIntel, baseIntel, 0, 0);
      expect(result.tradeValue).toBeGreaterThan(0);
    });
  });
});
