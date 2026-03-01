import { describe, it, expect, beforeEach } from 'vitest';
import { betrayalRegistry } from '../src/game/betrayal.js';
import { trustLedger } from '../src/game/trust.js';
import { allianceRegistry } from '../src/game/alliance.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';

describe('Betrayal System', () => {
  let speciesId: string;

  function getOrRegister(name: string): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Betraytest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'BetrayFam', genus: 'BetrayGen', species: name.slice(0, 3) },
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
    betrayalRegistry.clear();
    trustLedger.clear();
    allianceRegistry.clear();
    speciesId = getOrRegister('BetrayalWolf');
  });

  it('should commit a betrayal and record it', () => {
    const betrayer = mkChar('region-a', 'family-betrayer');

    const event = betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-betrayer',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'intel_leak',
      tick: 100,
    });

    expect(event.type).toBe('intel_leak');
    expect(event.betrayerFamilyId).toBe('family-betrayer');
    expect(event.victimFamilyId).toBe('family-victim');
  });

  it('should apply trust penalty to victim', () => {
    const betrayer = mkChar('region-a', 'family-betrayer');

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-betrayer',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'intel_leak',
      tick: 100,
    });

    const trust = trustLedger.getTrust('family-victim', 'family-betrayer');
    expect(trust).toBeLessThan(0);
  });

  it('should spread betrayal reputation to witnesses', () => {
    const betrayer = mkChar('region-a', 'family-betrayer');
    mkChar('region-a', 'family-witness');

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-betrayer',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'intel_leak',
      tick: 100,
      regionId: 'region-a',
    });

    const witnessTrust = trustLedger.getTrust('family-witness', 'family-betrayer');
    expect(witnessTrust).toBeLessThan(0);
  });

  it('should track betrayal reputation', () => {
    const betrayer = mkChar('region-a', 'family-betrayer');

    expect(betrayalRegistry.getBetrayalReputation('family-betrayer')).toBe(0);

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-betrayer',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'intel_leak',
      tick: 100,
    });

    expect(betrayalRegistry.getBetrayalReputation('family-betrayer')).toBeGreaterThan(0);
  });

  it('should cap betrayal reputation at 1', () => {
    const betrayer = mkChar('region-a', 'family-serial');

    for (let i = 0; i < 10; i++) {
      betrayalRegistry.commitBetrayal({
        betrayerFamilyId: 'family-serial',
        betrayerCharacterId: betrayer.id,
        victimFamilyId: `family-victim-${i}`,
        type: 'intel_leak',
        tick: 100 + i,
      });
    }

    expect(betrayalRegistry.getBetrayalReputation('family-serial')).toBeLessThanOrEqual(1);
  });

  it('should get betrayals by and against family', () => {
    const betrayer = mkChar('region-a', 'family-a');

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-a',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-b',
      type: 'intel_leak',
      tick: 100,
    });

    expect(betrayalRegistry.getBetrayalsByFamily('family-a').length).toBe(1);
    expect(betrayalRegistry.getBetrayalsAgainstFamily('family-b').length).toBe(1);
    expect(betrayalRegistry.getBetrayalsByFamily('family-b').length).toBe(0);
  });

  it('should calculate betrayal economics', () => {
    const betrayer = mkChar('region-a', 'family-calc');

    const economics = betrayalRegistry.calculateBetrayalEconomics(
      betrayer,
      'family-victim',
      'intel_leak',
    );

    expect(economics.potentialGain).toBeGreaterThanOrEqual(0);
    expect(economics.potentialLoss).toBeGreaterThanOrEqual(0);
    expect(typeof economics.netValue).toBe('number');
  });

  it('should handle alliance_backstab type', () => {
    const betrayer = mkChar('region-a', 'family-backstab');

    allianceRegistry.add({
      id: 'test-alliance',
      name: 'Test Alliance',
      memberSpecies: [speciesId],
      sharedRegionIds: ['region-a'],
      formedAtTick: 50,
      trigger: 'diplomatic',
      strength: 0.8,
    });

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-backstab',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'alliance_backstab',
      tick: 100,
    });

    expect(allianceRegistry.getAll().length).toBe(0);
  });

  it('should reduce fame on alliance_backstab', () => {
    const betrayer = mkChar('region-a', 'family-fame');
    betrayer.fame = 20;

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-fame',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'alliance_backstab',
      tick: 100,
    });

    expect(betrayer.fame).toBeLessThan(20);
  });

  it('should give notoriety fame for non-backstab betrayals', () => {
    const betrayer = mkChar('region-a', 'family-notify');
    betrayer.fame = 10;

    betrayalRegistry.commitBetrayal({
      betrayerFamilyId: 'family-notify',
      betrayerCharacterId: betrayer.id,
      victimFamilyId: 'family-victim',
      type: 'resource_theft',
      tick: 100,
    });

    expect(betrayer.fame).toBeGreaterThan(10);
  });

  it('should identify witnesses in region', () => {
    const betrayer = mkChar('region-witness', 'family-betrayer');
    mkChar('region-witness', 'family-w1');
    mkChar('region-witness', 'family-w2');
    mkChar('region-far', 'family-far');

    const witnesses = betrayalRegistry.identifyWitnesses('region-witness', betrayer.id, 100);
    expect(witnesses).toContain('family-w1');
    expect(witnesses).toContain('family-w2');
    expect(witnesses).not.toContain('family-far');
    expect(witnesses).not.toContain('family-betrayer');
  });
});
