import { describe, it, expect, beforeEach } from 'vitest';
import { roleRegistry } from '../src/game/roles.js';
import { characterRegistry } from '../src/species/registry.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { Character } from '../src/types.js';

describe('Species Roles System', () => {
  let packSpeciesId: string;
  let solitarySpeciesId: string;
  let nocturnalPackSpeciesId: string;
  let testRegionId: string;
  let testFamilyTreeId: string;

  function createTestSpecies(
    commonName: string,
    socialStructure: string,
    nocturnal: boolean = false,
  ): string {
    const existing = speciesRegistry.getByName(commonName);
    if (existing) return existing.id;

    const species = speciesRegistry.register({
      commonName,
      scientificName: `Test ${commonName}`,
      taxonomy: {
        class: 'Mammalia',
        order: 'TestOrder',
        family: 'TestFamily',
        genus: 'TestGenus',
        species: commonName.toLowerCase(),
      },
      tier: 'flagship',
      traitOverrides: {
        size: 50,
        speed: 50,
        strength: 50,
        intelligence: 50,
        lifespan: 10000,
        reproductionRate: 2,
        gestationTicks: 500,
        maturityTicks: 1000,
        socialStructure: socialStructure as any,
        nocturnal,
        habitat: ['surface'],
        diet: 'carnivore',
        canFly: false,
        aquatic: false,
      },
    });

    return species.id;
  }

  function createTestCharacter(
    speciesId: string,
    name: string = 'TestChar',
  ): Character {
    const character = createCharacter({
      speciesId,
      regionId: testRegionId,
      familyTreeId: testFamilyTreeId,
      tick: 0,
    });
    character.name = name;
    characterRegistry.add(character);
    return character;
  }

  beforeEach(() => {
    // Clear all registries
    roleRegistry.clear();
    characterRegistry.clear();

    // Clear existing species that may be in the registry (simulating fresh state)
    speciesRegistry.getAll().forEach((s) => {
      // We can't clear speciesRegistry directly, but we track by name
      // just set up fresh test species
    });

    testRegionId = 'test-region';
    testFamilyTreeId = 'test-tree';

    // Create test species
    packSpeciesId = createTestSpecies('PackWolf', 'pack');
    solitarySpeciesId = createTestSpecies('SolitaryLynx', 'solitary');
    nocturnalPackSpeciesId = createTestSpecies('NocturnalPack', 'pack', true);
  });

  describe('assignRole', () => {
    it('assigns role to pack species succeeds', () => {
      const char = createTestCharacter(packSpeciesId, 'AlphaWolf');

      const result = roleRegistry.assignRole(char.id, 'sentinel', 0);

      expect(result).toContain('has been assigned the role');
      expect(char.role).toBe('sentinel');
    });

    it('assigns role to herd species succeeds', () => {
      const herdSpeciesId = createTestSpecies('HerdDeer', 'herd');
      const char = createTestCharacter(herdSpeciesId, 'LeadDeer');

      const result = roleRegistry.assignRole(char.id, 'scout', 10);

      expect(result).toContain('has been assigned the role');
      expect(char.role).toBe('scout');
    });

    it('assigns role to colony species succeeds', () => {
      const colonySpeciesId = createTestSpecies('ColonyAnt', 'colony');
      const char = createTestCharacter(colonySpeciesId, 'WorkerAnt');

      const result = roleRegistry.assignRole(char.id, 'forager', 20);

      expect(result).toContain('has been assigned the role');
      expect(char.role).toBe('forager');
    });

    it('assigns role to hive species succeeds', () => {
      const hiveSpeciesId = createTestSpecies('HiveBee', 'hive');
      const char = createTestCharacter(hiveSpeciesId, 'QueenBee');

      const result = roleRegistry.assignRole(char.id, 'guardian', 30);

      expect(result).toContain('has been assigned the role');
      expect(char.role).toBe('guardian');
    });

    it('rejects role assignment for solitary species', () => {
      const char = createTestCharacter(solitarySpeciesId, 'LonelyLynx');

      const result = roleRegistry.assignRole(char.id, 'sentinel', 0);

      expect(result).toContain('solitary creatures and cannot take on group roles');
      expect(char.role).toBe('none');
    });

    it('rejects role assignment for pair species', () => {
      const pairSpeciesId = createTestSpecies('PairSwan', 'pair');
      const char = createTestCharacter(pairSpeciesId, 'MaleSwan');

      const result = roleRegistry.assignRole(char.id, 'scout', 0);

      expect(result).toContain('pair creatures and cannot take on group roles');
      expect(char.role).toBe('none');
    });

    it('returns error for non-existent character', () => {
      const result = roleRegistry.assignRole('non-existent-id' as any, 'sentinel', 0);

      expect(result).toContain('Character not found');
    });
  });

  describe('getRoleBonus', () => {
    it('returns bonus for sentinel + observe action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'observe');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns bonus for sentinel + defend action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'defend');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns bonus for scout + explore action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'scout', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'explore');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns bonus for scout + move action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'scout', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'move');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns bonus for forager + forage action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'forager', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'forage');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns bonus for guardian + attack action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'guardian', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'attack');

      expect(bonus).toBeGreaterThanOrEqual(0.1);
      expect(bonus).toBeLessThanOrEqual(0.3);
    });

    it('returns 0 for role with non-matching action', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const bonus = roleRegistry.getRoleBonus(char, 'forage');

      expect(bonus).toBe(0);
    });

    it('returns 0 for character without role', () => {
      const char = createTestCharacter(packSpeciesId);

      const bonus = roleRegistry.getRoleBonus(char, 'observe');

      expect(bonus).toBe(0);
    });

    it('increases bonus with proficiency', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      // Manually increase proficiency
      const initialBonus = roleRegistry.getRoleBonus(char, 'observe');

      // Tick proficiency growth multiple times
      for (let i = 0; i < 100; i++) {
        roleRegistry.tickRoleProficiency(i);
      }

      const improvedBonus = roleRegistry.getRoleBonus(char, 'observe');

      expect(improvedBonus).toBeGreaterThan(initialBonus);
    });
  });

  describe('trainObservation', () => {
    it('increases observation level', () => {
      const char = createTestCharacter(packSpeciesId);

      const initialSkill = roleRegistry.trainObservation(char, 0, {});

      expect(initialSkill.level).toBeGreaterThan(0);
      expect(initialSkill.level).toBeLessThanOrEqual(3);
    });

    it('grants bonus for night training', () => {
      const char = createTestCharacter(packSpeciesId);

      let dayGain = 0;
      for (let i = 0; i < 10; i++) {
        const skill = roleRegistry.trainObservation(char, i, { isNight: false });
        dayGain = skill.level;
      }

      roleRegistry.clear(); // Reset
      characterRegistry.add(char);

      let nightGain = 0;
      for (let i = 0; i < 10; i++) {
        const skill = roleRegistry.trainObservation(char, i, { isNight: true });
        nightGain = skill.level;
      }

      expect(nightGain).toBeGreaterThan(dayGain);
    });

    it('grants bonus for nearby predators', () => {
      const char = createTestCharacter(packSpeciesId);

      // Train many times to average out randomness
      let totalNoPredators = 0;
      let totalWithPredators = 0;
      const trials = 50;

      for (let i = 0; i < trials; i++) {
        roleRegistry.clear();
        characterRegistry.add(char);
        const skillNo = roleRegistry.trainObservation(char, i, { nearbyPredators: 0 });
        totalNoPredators += skillNo.level;

        roleRegistry.clear();
        characterRegistry.add(char);
        const skillWith = roleRegistry.trainObservation(char, i, { nearbyPredators: 1 });
        totalWithPredators += skillWith.level;
      }

      const avgNoPredators = totalNoPredators / trials;
      const avgWithPredators = totalWithPredators / trials;

      expect(avgWithPredators).toBeGreaterThan(avgNoPredators);
    });

    it('caps observation at level 100', () => {
      const char = createTestCharacter(packSpeciesId);

      for (let i = 0; i < 1000; i++) {
        roleRegistry.trainObservation(char, i, {});
      }

      const skill = roleRegistry.trainObservation(char, 1001, {});

      expect(skill.level).toBeLessThanOrEqual(100);
    });

    it('combines night and predator bonuses', () => {
      const char = createTestCharacter(packSpeciesId);

      const skillNormal = roleRegistry.trainObservation(char, 0, {});
      const normalLevel = skillNormal.level;

      roleRegistry.clear();
      characterRegistry.add(char);

      const skillBoosted = roleRegistry.trainObservation(char, 1, {
        isNight: true,
        nearbyPredators: 2,
      });
      const boostedLevel = skillBoosted.level;

      expect(boostedLevel).toBeGreaterThan(normalLevel);
    });
  });

  describe('getObservationModifier', () => {
    it('returns 0 for character without observation skill', () => {
      const char = createTestCharacter(packSpeciesId);

      const modifier = roleRegistry.getObservationModifier(char);

      expect(modifier).toBe(0);
    });

    it('increases modifier with observation level', () => {
      const char = createTestCharacter(packSpeciesId);

      roleRegistry.trainObservation(char, 0, {});
      const initialModifier = roleRegistry.getObservationModifier(char);

      for (let i = 1; i < 50; i++) {
        roleRegistry.trainObservation(char, i, {});
      }

      const improvedModifier = roleRegistry.getObservationModifier(char);

      expect(improvedModifier).toBeGreaterThan(initialModifier);
    });

    it('reaches 0.6 at level 100', () => {
      const char = createTestCharacter(packSpeciesId);

      // Train to high level
      for (let i = 0; i < 1000; i++) {
        roleRegistry.trainObservation(char, i, {});
      }

      const modifier = roleRegistry.getObservationModifier(char);

      expect(modifier).toBeCloseTo(0.6, 2);
    });

    it('provides proportional reduction at mid-levels', () => {
      const char = createTestCharacter(packSpeciesId);

      // Train to approximately level 50
      for (let i = 0; i < 200; i++) {
        roleRegistry.trainObservation(char, i, {});
      }

      const modifier = roleRegistry.getObservationModifier(char);

      expect(modifier).toBeGreaterThan(0.2);
      expect(modifier).toBeLessThanOrEqual(0.6);
    });
  });

  describe('getSentinelProtection', () => {
    it('returns 0 when no sentinels present', () => {
      const protection = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protection).toBe(0);
    });

    it('increases with sentinel count', () => {
      const char1 = createTestCharacter(packSpeciesId, 'Sentinel1');
      roleRegistry.assignRole(char1.id, 'sentinel', 0);

      const protectionOne = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      const char2 = createTestCharacter(packSpeciesId, 'Sentinel2');
      roleRegistry.assignRole(char2.id, 'sentinel', 0);

      const protectionTwo = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protectionTwo).toBeGreaterThan(protectionOne);
    });

    it('ignores dead sentinels', () => {
      const char = createTestCharacter(packSpeciesId, 'DeadSentinel');
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const protectionAlive = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      // Kill the character
      char.isAlive = false;

      const protectionDead = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protectionDead).toBe(0);
    });

    it('ignores sentinels in other regions', () => {
      const char = createTestCharacter(packSpeciesId, 'FarSentinel');
      char.regionId = 'other-region';
      characterRegistry.add(char);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const protection = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protection).toBe(0);
    });

    it('ignores sentinels of other species', () => {
      const otherSpeciesId = createTestSpecies('OtherPack', 'pack');
      const char = createTestCharacter(otherSpeciesId, 'OtherSentinel');
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const protection = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protection).toBe(0);
    });

    it('caps protection at 0.5', () => {
      // Create many sentinels
      for (let i = 0; i < 10; i++) {
        const char = createTestCharacter(packSpeciesId, `Sentinel${i}`);
        roleRegistry.assignRole(char.id, 'sentinel', 0);
      }

      const protection = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);

      expect(protection).toBeLessThanOrEqual(0.5);
    });
  });

  describe('getNightVulnerability', () => {
    it('returns 0.5 for non-nocturnal during night without sentinels', () => {
      const char = createTestCharacter(packSpeciesId);

      const vulnerability = roleRegistry.getNightVulnerability(char, true);

      expect(vulnerability).toBeCloseTo(0.5, 1);
    });

    it('returns 0 for nocturnal during night', () => {
      const char = createTestCharacter(nocturnalPackSpeciesId);

      const vulnerability = roleRegistry.getNightVulnerability(char, true);

      expect(vulnerability).toBe(0);
    });

    it('returns 0 during day regardless of nocturnal', () => {
      const char = createTestCharacter(packSpeciesId);

      const vulnerability = roleRegistry.getNightVulnerability(char, false);

      expect(vulnerability).toBe(0);
    });

    it('reduces vulnerability with sentinel protection', () => {
      const char = createTestCharacter(packSpeciesId);
      const sentinel = createTestCharacter(packSpeciesId, 'Sentinel');
      roleRegistry.assignRole(sentinel.id, 'sentinel', 0);

      const vulnerabilityWithSentinel = roleRegistry.getNightVulnerability(char, true);

      // Remove sentinel
      sentinel.isAlive = false;

      const vulnerabilityWithoutSentinel = roleRegistry.getNightVulnerability(char, true);

      expect(vulnerabilityWithoutSentinel).toBeGreaterThan(vulnerabilityWithSentinel);
    });

    it('applies sentinel protection correctly to vulnerability calculation', () => {
      const char = createTestCharacter(packSpeciesId);

      // No sentinel, should be 0.5
      const noProtection = roleRegistry.getNightVulnerability(char, true);
      expect(noProtection).toBeCloseTo(0.5, 1);

      // Add sentinel for 50% reduction
      const sentinel = createTestCharacter(packSpeciesId, 'Sentinel');
      roleRegistry.assignRole(sentinel.id, 'sentinel', 0);

      const withProtection = roleRegistry.getNightVulnerability(char, true);

      // Sentinel provides ~0.1-0.25 protection, so vulnerability should be reduced
      expect(withProtection).toBeLessThan(noProtection);
    });
  });

  describe('tickRoleProficiency', () => {
    it('increases proficiency over time', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      const roleInitial = roleRegistry.getRole(char.id);
      const initialProficiency = roleInitial?.proficiency ?? 0;

      for (let tick = 1; tick <= 100; tick++) {
        roleRegistry.tickRoleProficiency(tick);
      }

      const roleFinal = roleRegistry.getRole(char.id);
      const finalProficiency = roleFinal?.proficiency ?? 0;

      expect(finalProficiency).toBeGreaterThan(initialProficiency);
    });

    it('caps proficiency at 1.0', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'guardian', 0);

      // Tick many times
      for (let tick = 0; tick < 10000; tick++) {
        roleRegistry.tickRoleProficiency(tick);
      }

      const role = roleRegistry.getRole(char.id);
      const proficiency = role?.proficiency ?? 0;

      expect(proficiency).toBeLessThanOrEqual(1);
    });

    it('removes dead characters from roles', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'scout', 0);

      expect(roleRegistry.getRole(char.id)).toBeDefined();

      // Kill character
      char.isAlive = false;

      roleRegistry.tickRoleProficiency(100);

      expect(roleRegistry.getRole(char.id)).toBeUndefined();
    });

    it('ignores characters with none role', () => {
      const char = createTestCharacter(packSpeciesId);
      // Don't assign a role, it stays 'none'

      // This should not throw
      roleRegistry.tickRoleProficiency(0);

      // Verify the character wasn't added to roles
      expect(roleRegistry.getRole(char.id)).toBeUndefined();
    });

    it('proficiency growth rate is 0.002 per tick', () => {
      const char = createTestCharacter(packSpeciesId);
      roleRegistry.assignRole(char.id, 'sentinel', 0);

      for (let tick = 0; tick < 500; tick++) {
        roleRegistry.tickRoleProficiency(tick);
      }

      const role = roleRegistry.getRole(char.id);
      const proficiency = role?.proficiency ?? 0;

      // 500 ticks * 0.002 = 1.0 (capped at max)
      expect(proficiency).toBeCloseTo(1, 1);
    });
  });

  describe('clear', () => {
    it('clears all roles and observations', () => {
      const char1 = createTestCharacter(packSpeciesId, 'Char1');
      const char2 = createTestCharacter(packSpeciesId, 'Char2');

      roleRegistry.assignRole(char1.id, 'sentinel', 0);
      roleRegistry.assignRole(char2.id, 'scout', 0);
      roleRegistry.trainObservation(char1, 0, {});
      roleRegistry.trainObservation(char2, 0, {});

      expect(roleRegistry.getRole(char1.id)).toBeDefined();
      expect(roleRegistry.getRole(char2.id)).toBeDefined();

      roleRegistry.clear();

      expect(roleRegistry.getRole(char1.id)).toBeUndefined();
      expect(roleRegistry.getRole(char2.id)).toBeUndefined();
      expect(roleRegistry.getObservation(char1.id)).toBeUndefined();
      expect(roleRegistry.getObservation(char2.id)).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('full role lifecycle: assign, train, grow proficiency', () => {
      const char = createTestCharacter(packSpeciesId, 'GrowthTest');

      // Assign role
      const assignResult = roleRegistry.assignRole(char.id, 'sentinel', 0);
      expect(assignResult).toContain('assigned');

      // Train observation
      roleRegistry.trainObservation(char, 0, { isNight: true });

      // Grow proficiency
      for (let tick = 0; tick < 200; tick++) {
        roleRegistry.tickRoleProficiency(tick);
      }

      // Get improvements
      const role = roleRegistry.getRole(char.id);
      const modifier = roleRegistry.getObservationModifier(char);
      const bonus = roleRegistry.getRoleBonus(char, 'observe');

      expect(role?.proficiency).toBeGreaterThan(0);
      expect(modifier).toBeGreaterThan(0);
      expect(bonus).toBeGreaterThan(0.1);
    });

    it('multi-sentinel region provides protection', () => {
      const defender = createTestCharacter(packSpeciesId, 'Defender');

      // Create sentinel network
      for (let i = 0; i < 3; i++) {
        const sentinel = createTestCharacter(packSpeciesId, `Sentinel${i}`);
        roleRegistry.assignRole(sentinel.id, 'sentinel', 0);

        // Grow proficiency
        for (let tick = 0; tick < 300; tick++) {
          roleRegistry.tickRoleProficiency(tick);
        }
      }

      const protection = roleRegistry.getSentinelProtection(testRegionId, packSpeciesId);
      const nightVuln = roleRegistry.getNightVulnerability(defender, true);

      expect(protection).toBeGreaterThan(0);
      expect(nightVuln).toBeLessThan(0.5);
    });

    it('scout role with high observation detects threats', () => {
      const scout = createTestCharacter(packSpeciesId, 'Scout');
      roleRegistry.assignRole(scout.id, 'scout', 0);

      // Train observation extensively
      for (let tick = 0; tick < 500; tick++) {
        roleRegistry.trainObservation(scout, tick, {
          isNight: tick % 2 === 0,
          nearbyPredators: 1,
        });
      }

      const scoutBonus = roleRegistry.getRoleBonus(scout, 'explore');
      const detectionModifier = roleRegistry.getObservationModifier(scout);

      expect(scoutBonus).toBeGreaterThanOrEqual(0.1);
      expect(detectionModifier).toBeGreaterThan(0);
    });
  });
});
