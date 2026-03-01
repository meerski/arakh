import { describe, it, expect, beforeEach } from 'vitest';
import { heartlandTracker } from '../src/game/heartland.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';

describe('Heartland System', () => {
  let speciesId: string;

  function getOrRegister(name: string): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Hearttest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'HeartFam', genus: 'HeartGen', species: name.slice(0, 3) },
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

  beforeEach(() => {
    heartlandTracker.clear();
    speciesId = getOrRegister('HeartlandDeer');
  });

  it('should return undefined profile for unknown family', () => {
    expect(heartlandTracker.getProfile('unknown')).toBeUndefined();
  });

  it('should detect heartland when 70%+ in one region', () => {
    for (let i = 0; i < 8; i++) mkChar('region-a', 'family-1');
    for (let i = 0; i < 2; i++) mkChar('region-b', 'family-1');

    heartlandTracker.recalculateAll(100);

    const profile = heartlandTracker.getProfile('family-1');
    expect(profile).toBeDefined();
    expect(profile!.heartlandRegionId).toBe('region-a');
    expect(profile!.heartlandStrength).toBeGreaterThanOrEqual(0.7);
  });

  it('should not set heartland below 50% concentration', () => {
    for (let i = 0; i < 5; i++) mkChar('region-c', 'family-2');
    for (let i = 0; i < 5; i++) mkChar('region-d', 'family-2');

    heartlandTracker.recalculateAll(100);

    const profile = heartlandTracker.getProfile('family-2');
    expect(profile).toBeDefined();
    expect(profile!.heartlandRegionId).toBeNull();
    // 50% concentration gives reduced strength (0.5 * 0.7 = 0.35) but no heartland
    expect(profile!.heartlandStrength).toBeLessThan(0.5);
  });

  it('should provide defense bonus in heartland', () => {
    for (let i = 0; i < 10; i++) mkChar('region-e', 'family-3');

    heartlandTracker.recalculateAll(100);

    const bonus = heartlandTracker.getHeartlandDefenseBonus('family-3', 'region-e');
    expect(bonus).toBeGreaterThan(0);
    expect(heartlandTracker.getHeartlandDefenseBonus('family-3', 'region-other')).toBe(0);
  });

  it('should provide foraging bonus in heartland', () => {
    for (let i = 0; i < 10; i++) mkChar('region-f', 'family-4');

    heartlandTracker.recalculateAll(100);

    const bonus = heartlandTracker.getHeartlandForagingBonus('family-4', 'region-f');
    expect(bonus).toBeGreaterThan(0);
  });

  it('should track heartland discovery', () => {
    for (let i = 0; i < 10; i++) mkChar('region-g', 'family-5');

    heartlandTracker.recalculateAll(100);
    heartlandTracker.recordHeartlandDiscovery('enemy-family', 'family-5');

    const profile = heartlandTracker.getProfile('family-5');
    expect(profile!.discoveredBy).toContain('enemy-family');
    expect(profile!.exposureLevel).toBeGreaterThan(0);
  });

  it('should not duplicate heartland discovery', () => {
    for (let i = 0; i < 10; i++) mkChar('region-h', 'family-6');

    heartlandTracker.recalculateAll(100);
    heartlandTracker.recordHeartlandDiscovery('enemy-family', 'family-6');
    heartlandTracker.recordHeartlandDiscovery('enemy-family', 'family-6');

    const profile = heartlandTracker.getProfile('family-6');
    expect(profile!.discoveredBy.filter(f => f === 'enemy-family').length).toBe(1);
  });

  it('should provide hunt bonus to predators who know heartland', () => {
    for (let i = 0; i < 10; i++) mkChar('region-i', 'family-7');

    heartlandTracker.recalculateAll(100);
    heartlandTracker.recordHeartlandDiscovery('predator-family', 'family-7');

    const bonus = heartlandTracker.getHeartlandHuntBonus('predator-family', 'region-i');
    expect(bonus).toBe(0.15);
    expect(heartlandTracker.getHeartlandHuntBonus('other-family', 'region-i')).toBe(0);
  });

  it('should find families with heartland in a region', () => {
    for (let i = 0; i < 10; i++) mkChar('region-j', 'family-8');

    heartlandTracker.recalculateAll(100);

    const families = heartlandTracker.getFamiliesWithHeartlandIn('region-j');
    expect(families).toContain('family-8');
  });

  it('should check knowsHeartland', () => {
    for (let i = 0; i < 10; i++) mkChar('region-k', 'family-9');

    heartlandTracker.recalculateAll(100);
    expect(heartlandTracker.knowsHeartland('spy-family', 'family-9')).toBe(false);

    heartlandTracker.recordHeartlandDiscovery('spy-family', 'family-9');
    expect(heartlandTracker.knowsHeartland('spy-family', 'family-9')).toBe(true);
  });
});
