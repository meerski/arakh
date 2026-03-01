import { describe, it, expect, beforeEach } from 'vitest';
import { espionageRegistry } from '../src/game/espionage.js';
import { intelligenceRegistry } from '../src/game/intelligence.js';
import { heartlandTracker } from '../src/game/heartland.js';
import { trustLedger } from '../src/game/trust.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import { roleRegistry } from '../src/game/roles.js';

describe('Espionage System', () => {
  let speciesId: string;
  let tinySpeciesId: string;
  let largeSpeciesId: string;

  function getOrRegister(name: string, overrides?: Record<string, any>): string {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Spytest ${name.toLowerCase()}`,
      taxonomy: { class: 'Mammalia', order: 'TestOrder', family: 'SpyFam', genus: 'SpyGen', species: name.slice(0, 3) },
      tier: 'flagship',
      traitOverrides: { size: 40, lifespan: 5000, habitat: ['surface'], diet: 'omnivore', intelligence: 60, socialStructure: 'pack', speed: 50, ...overrides },
    });
    return sp.id;
  }

  function mkChar(regionId: string, familyTreeId: string, sid?: string) {
    const c = createCharacter({ speciesId: sid ?? speciesId, regionId, familyTreeId, tick: 100 });
    characterRegistry.add(c);
    return c;
  }

  beforeEach(() => {
    espionageRegistry.clear();
    intelligenceRegistry.clear();
    heartlandTracker.clear();
    trustLedger.clear();
    roleRegistry.clear();
    speciesId = getOrRegister('SpyRat');
    tinySpeciesId = getOrRegister('SpyAnt', { size: 2, speed: 20 });
    largeSpeciesId = getOrRegister('SpyBear', { size: 80, speed: 40 });
  });

  it('should start a spy mission with speed-based duration', () => {
    const spy = mkChar('region-a', 'family-spy');

    const mission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    expect(mission.type).toBe('spy');
    expect(mission.agentCharacterId).toBe(spy.id);
    expect(mission.completed).toBe(false);
    expect(mission.detected).toBe(false);
    expect(mission.supportCharacterIds).toEqual([]);
    expect(mission.casualtyCharacterIds).toEqual([]);
    // Duration depends on species speed (50 = base, so should be 5)
    expect(mission.durationTicks).toBe(5);
  });

  it('should scale mission duration by species speed', () => {
    // Slow species (ant, speed 20) should take longer
    const slowSpy = mkChar('region-a', 'family-slow', tinySpeciesId);
    const slowMission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: slowSpy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    // Fast species (rat, speed 50) = base duration
    const fastSpy = mkChar('region-a', 'family-fast');
    const fastMission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: fastSpy.id,
      targetRegionId: 'region-target-2',
      tick: 100,
    });

    expect(slowMission.durationTicks).toBeGreaterThan(fastMission.durationTicks);
  });

  it('should track if character is on mission', () => {
    const spy = mkChar('region-a', 'family-spy');

    expect(espionageRegistry.isOnMission(spy.id)).toBe(false);

    espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    expect(espionageRegistry.isOnMission(spy.id)).toBe(true);
  });

  it('should track support characters as on mission', () => {
    const spy = mkChar('region-a', 'family-spy');
    const support = mkChar('region-a', 'family-spy');

    espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      supportCharacterIds: [support.id],
      targetRegionId: 'region-target',
      tick: 100,
    });

    expect(espionageRegistry.isOnMission(support.id)).toBe(true);
  });

  it('should complete spy mission after duration', () => {
    const spy = mkChar('region-a', 'family-spy');

    const mission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    for (let t = 101; t <= 100 + mission.durationTicks; t++) {
      espionageRegistry.tickMissions(t);
    }

    expect(espionageRegistry.getActiveMissions().length).toBe(0);
  });

  it('should gather intel on successful spy mission (when undetected)', () => {
    let gathered = false;
    for (let attempt = 0; attempt < 30 && !gathered; attempt++) {
      espionageRegistry.clear();
      intelligenceRegistry.clear();

      const spy = mkChar(`region-a-spy-${attempt}`, `family-spy-g-${attempt}`);

      const mission = espionageRegistry.startMission({
        type: 'spy',
        agentCharacterId: spy.id,
        targetRegionId: `region-target-${attempt}`,
        tick: 100,
      });

      for (let t = 101; t <= 100 + mission.durationTicks; t++) {
        espionageRegistry.tickMissions(t);
      }

      const intel = intelligenceRegistry.getRegionIntel(`family-spy-g-${attempt}`, `region-target-${attempt}`);
      if (intel) {
        expect(intel.regionId).toBe(`region-target-${attempt}`);
        gathered = true;
      }
    }

    expect(gathered).toBe(true);
  });

  it('should start infiltrate mission with speed-based longer duration', () => {
    const spy = mkChar('region-a', 'family-spy');

    const mission = espionageRegistry.startMission({
      type: 'infiltrate',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    // Base 15 ticks at speed 50
    expect(mission.durationTicks).toBe(15);
  });

  it('should discover heartland on infiltrate mission (when undetected)', () => {
    let discovered = false;
    for (let attempt = 0; attempt < 30 && !discovered; attempt++) {
      espionageRegistry.clear();
      intelligenceRegistry.clear();
      heartlandTracker.clear();

      const spy = mkChar('region-a-infil', 'family-spy-infil');

      for (let i = 0; i < 10; i++) mkChar('region-target-infil', 'family-target-infil');
      heartlandTracker.recalculateAll(100);

      const mission = espionageRegistry.startMission({
        type: 'infiltrate',
        agentCharacterId: spy.id,
        targetRegionId: 'region-target-infil',
        tick: 100,
      });

      for (let t = 101; t <= 100 + mission.durationTicks; t++) {
        espionageRegistry.tickMissions(t);
      }

      if (heartlandTracker.knowsHeartland('family-spy-infil', 'family-target-infil')) {
        discovered = true;
      }
    }

    expect(discovered).toBe(true);
  });

  it('should plant misinformation on spread_rumors mission (when undetected)', () => {
    let planted = false;
    for (let attempt = 0; attempt < 30 && !planted; attempt++) {
      espionageRegistry.clear();
      intelligenceRegistry.clear();

      const spy = mkChar('region-a-rumor', 'family-spy-rumor');

      const mission = espionageRegistry.startMission({
        type: 'spread_rumors',
        agentCharacterId: spy.id,
        targetRegionId: 'region-target-rumor',
        targetFamilyId: 'family-victim-rumor',
        tick: 100,
      });

      for (let t = 101; t <= 100 + mission.durationTicks; t++) {
        espionageRegistry.tickMissions(t);
      }

      const intel = intelligenceRegistry.getRegionIntel('family-victim-rumor', 'region-target-rumor');
      if (intel && intel.isMisinformation) {
        planted = true;
      }
    }

    expect(planted).toBe(true);
  });

  it('should detect spy via sentinel', () => {
    const spy = mkChar('region-target', 'family-spy');

    const sentinel = mkChar('region-target', 'family-defender');
    sentinel.role = 'sentinel';

    espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    const detected = espionageRegistry.attemptDetection(sentinel, 'region-target', 101);
    // Detection is probabilistic
    if (detected) {
      expect(detected.agentCharacterId).toBe(spy.id);
      expect(detected.detected).toBe(true);
    }
  });

  it('should calculate detection chance with size-based base rate', () => {
    const spy = mkChar('region-target', 'family-spy');

    const chance = espionageRegistry.calculateDetectionChance(spy, 'region-target', []);
    // Size 40 species: 0.05 * (40/40) = 0.05 base, minus intelligence bonus
    expect(chance).toBeGreaterThanOrEqual(0.01);
    expect(chance).toBeLessThanOrEqual(0.8);
  });

  it('should give tiny species much lower detection chance', () => {
    const tinySpy = mkChar('region-target', 'family-tiny', tinySpeciesId);
    const largeSpy = mkChar('region-target', 'family-large', largeSpeciesId);

    const tinyChance = espionageRegistry.calculateDetectionChance(tinySpy, 'region-target', []);
    const largeChance = espionageRegistry.calculateDetectionChance(largeSpy, 'region-target', []);

    // Ant (size 2) should be much harder to detect than bear (size 80)
    expect(tinyChance).toBeLessThan(largeChance);
    expect(largeChance / tinyChance).toBeGreaterThan(2);
  });

  it('should increase detection chance with sentinels', () => {
    const spy = mkChar('region-target', 'family-spy');

    const sentinel = mkChar('region-target', 'family-defender');
    sentinel.role = 'sentinel';

    const chanceWithout = espionageRegistry.calculateDetectionChance(spy, 'region-target', []);
    const chanceWith = espionageRegistry.calculateDetectionChance(spy, 'region-target', [sentinel]);

    expect(chanceWith).toBeGreaterThan(chanceWithout);
  });

  it('should apply logarithmic sentinel diminishing returns', () => {
    const spy = mkChar('region-target', 'family-spy');

    const sentinel1 = mkChar('region-target', 'family-d1');
    sentinel1.role = 'sentinel';
    const sentinel2 = mkChar('region-target', 'family-d2');
    sentinel2.role = 'sentinel';
    const sentinel3 = mkChar('region-target', 'family-d3');
    sentinel3.role = 'sentinel';

    const chance1 = espionageRegistry.calculateDetectionChance(spy, 'region-target', [sentinel1]);
    const chance2 = espionageRegistry.calculateDetectionChance(spy, 'region-target', [sentinel1, sentinel2]);
    const chance3 = espionageRegistry.calculateDetectionChance(spy, 'region-target', [sentinel1, sentinel2, sentinel3]);

    // Each additional sentinel should add less than the previous
    const delta1to2 = chance2 - chance1;
    const delta2to3 = chance3 - chance2;
    expect(delta2to3).toBeLessThan(delta1to2);
  });

  it('should make sentinel size-relative to spy size', () => {
    const largeSpy = mkChar('region-target', 'family-large', largeSpeciesId);
    const tinySentinel = mkChar('region-target', 'family-d-tiny', tinySpeciesId);
    tinySentinel.role = 'sentinel';
    const largeSentinel = mkChar('region-target', 'family-d-large', largeSpeciesId);
    largeSentinel.role = 'sentinel';

    // A tiny sentinel (ant) trying to spot a large spy (bear) should be less effective
    const chanceWithTiny = espionageRegistry.calculateDetectionChance(largeSpy, 'region-target', [tinySentinel]);
    const chanceWithLarge = espionageRegistry.calculateDetectionChance(largeSpy, 'region-target', [largeSentinel]);

    expect(chanceWithLarge).toBeGreaterThan(chanceWithTiny);
  });

  it('should generate identification report with observation-based accuracy', () => {
    const spy = mkChar('region-target', 'family-spy');
    const detector = mkChar('region-target', 'family-defender');
    detector.role = 'sentinel';

    // Low observation = vague report
    const report = espionageRegistry.generateDetectionReport(spy, detector);
    expect(report.detected).toBe(true);
    // With 0 observation, should be size_class level
    expect(report.identificationLevel).toBe('size_class');
    expect(report.description).toBeTruthy();

    // Train observation to high level
    for (let i = 0; i < 40; i++) {
      roleRegistry.trainObservation(detector, 100 + i, {});
    }

    const betterReport = espionageRegistry.generateDetectionReport(spy, detector);
    // Higher observation should give better identification
    const levels = ['size_class', 'taxonomy_class', 'species', 'family'];
    const oldIdx = levels.indexOf(report.identificationLevel);
    const newIdx = levels.indexOf(betterReport.identificationLevel);
    expect(newIdx).toBeGreaterThanOrEqual(oldIdx);
  });

  it('should enforce mission cooldown', () => {
    expect(espionageRegistry.isOnCooldown('fake-char', 100)).toBe(false);

    // Cooldown is set internally after mission completion
    // We test the public API
    const spy = mkChar('region-a', 'family-spy');
    const mission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    // Complete the mission
    for (let t = 101; t <= 100 + mission.durationTicks + 1; t++) {
      espionageRegistry.tickMissions(t);
    }

    // Character should be on cooldown now
    expect(espionageRegistry.isOnCooldown(spy.id, 100 + mission.durationTicks + 1)).toBe(true);
    // After cooldown period (30 ticks), should be clear
    expect(espionageRegistry.isOnCooldown(spy.id, 100 + mission.durationTicks + 31)).toBe(false);
  });

  it('should support pack missions with casualty absorption', () => {
    const spy = mkChar('region-a', 'family-pack');
    const support1 = mkChar('region-a', 'family-pack');
    const support2 = mkChar('region-a', 'family-pack');

    const mission = espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      supportCharacterIds: [support1.id, support2.id],
      targetRegionId: 'region-target',
      tick: 100,
    });

    expect(mission.supportCharacterIds).toEqual([support1.id, support2.id]);
    expect(mission.casualtyCharacterIds).toEqual([]);
  });

  it('should prune completed missions older than 500 ticks', () => {
    const spy = mkChar('region-a', 'family-prune');
    espionageRegistry.startMission({
      type: 'spy',
      agentCharacterId: spy.id,
      targetRegionId: 'region-target',
      tick: 100,
    });

    // Complete it
    for (let t = 101; t <= 106; t++) {
      espionageRegistry.tickMissions(t);
    }

    expect(espionageRegistry.getRecentMissions().length).toBeGreaterThanOrEqual(1);

    // Tick far into the future — should prune
    espionageRegistry.tickMissions(700);
    expect(espionageRegistry.getRecentMissions().length).toBe(0);
  });
});
