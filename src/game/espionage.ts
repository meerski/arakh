// ============================================================
// Espionage System — Spy Missions, Detection, Counter-Intel
//
// Detection is biology-driven:
//   - Size affects visibility (ants nearly invisible, wolves conspicuous)
//   - Pack missions share risk (detected = one member caught, not mission failure)
//   - Speed affects mission duration (fast species finish quicker)
//   - Sentinel effectiveness is size-relative and logarithmic
//   - Observation skill determines identification accuracy
// ============================================================

import type {
  EspionageMission, EspionageActionType, EspionageResult, EspionageConsequence,
  DetectionReport, CharacterId, RegionId, FamilyTreeId, RegionIntel, Character,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';
import { getGeneValue } from '../species/character.js';
import { roleRegistry } from './roles.js';
import { intelligenceRegistry } from './intelligence.js';
import { heartlandTracker } from './heartland.js';
import { trustLedger } from './trust.js';

/** Base mission durations for a size-50 species. Scaled by speed. */
const BASE_MISSION_DURATIONS: Record<EspionageActionType, number> = {
  spy: 5,
  infiltrate: 15,
  spread_rumors: 10,
  counter_spy: 20,
  share_intel: 1,
  plant_misinformation: 8,
};

/** Per-character cooldown after completing a mission (ticks) */
const MISSION_COOLDOWN = 30;

/** Size class thresholds */
function getSizeClass(size: number): 'tiny' | 'small' | 'medium' | 'large' {
  if (size < 5) return 'tiny';
  if (size < 20) return 'small';
  if (size < 60) return 'medium';
  return 'large';
}

export class EspionageRegistry {
  private missions: Map<string, EspionageMission> = new Map();
  private completedMissions: EspionageMission[] = [];
  /** Tracks when each character last completed a mission */
  private missionCooldowns: Map<CharacterId, number> = new Map();

  /** Calculate mission duration based on species speed */
  getMissionDuration(type: EspionageActionType, spy: Character): number {
    const base = BASE_MISSION_DURATIONS[type];
    const species = speciesRegistry.get(spy.speciesId);
    const speed = species?.traits.speed ?? 50;
    // Fast species (speed 80) finish in ~63% of base time, slow (speed 20) take ~250%
    const speedFactor = Math.max(0.4, Math.min(2.5, 50 / Math.max(speed, 1)));
    return Math.max(1, Math.round(base * speedFactor));
  }

  /** Check if character is on cooldown */
  isOnCooldown(characterId: CharacterId, tick: number): boolean {
    const lastCompleted = this.missionCooldowns.get(characterId);
    if (lastCompleted === undefined) return false;
    return tick - lastCompleted < MISSION_COOLDOWN;
  }

  /** Start a new espionage mission */
  startMission(params: {
    type: EspionageActionType;
    agentCharacterId: CharacterId;
    supportCharacterIds?: CharacterId[];
    targetRegionId: RegionId;
    targetFamilyId?: FamilyTreeId;
    tick: number;
  }): EspionageMission {
    const spy = characterRegistry.get(params.agentCharacterId);
    const duration = spy
      ? this.getMissionDuration(params.type, spy)
      : BASE_MISSION_DURATIONS[params.type];

    const mission: EspionageMission = {
      id: crypto.randomUUID(),
      type: params.type,
      agentCharacterId: params.agentCharacterId,
      supportCharacterIds: params.supportCharacterIds ?? [],
      targetRegionId: params.targetRegionId,
      targetFamilyId: params.targetFamilyId ?? null,
      startTick: params.tick,
      durationTicks: duration,
      detected: false,
      detectedByCharacterId: null,
      casualtyCharacterIds: [],
      completed: false,
      result: null,
    };

    this.missions.set(mission.id, mission);
    return mission;
  }

  /** Tick all active missions */
  tickMissions(tick: number): EspionageResult[] {
    const results: EspionageResult[] = [];
    const newlyCompleted: string[] = [];

    for (const mission of this.missions.values()) {
      if (mission.completed) continue;

      const elapsed = tick - mission.startTick;

      // Detection check each tick
      if (!mission.detected) {
        const spy = characterRegistry.get(mission.agentCharacterId);
        if (!spy || !spy.isAlive) {
          mission.completed = true;
          newlyCompleted.push(mission.id);
          this.missionCooldowns.set(mission.agentCharacterId, tick);
          continue;
        }

        const sentinels = this.getSentinelsInRegion(mission.targetRegionId, spy);
        const detectionChance = this.calculateDetectionChance(spy, mission.targetRegionId, sentinels);

        if (worldRNG.chance(detectionChance)) {
          // Detection triggered — pack missions can absorb it
          const remainingSupport = mission.supportCharacterIds.filter(
            id => !mission.casualtyCharacterIds.includes(id),
          );

          const detector = sentinels.length > 0 ? sentinels[0] : null;

          if (remainingSupport.length > 0) {
            // Pack absorbs: a support member is caught instead
            const caughtId = remainingSupport[0];
            mission.casualtyCharacterIds.push(caughtId);

            const caught = characterRegistry.get(caughtId);
            if (caught) {
              const packStrength = this.getPackStrength(mission);
              const detectorStrength = detector ? getGeneValue(detector, 'strength') : 30;
              if (packStrength > detectorStrength * 1.5) {
                // Pack overpowers — member escapes with minor energy loss
                caught.energy = Math.max(0, caught.energy - 0.3);
              } else {
                // Member is captured/injured
                caught.health = Math.max(0, caught.health - 0.4);
              }
            }
            // Mission continues — just lost a pack member
            continue;
          }

          // No support left — lead spy is detected, mission fails
          mission.detected = true;
          mission.detectedByCharacterId = detector?.id ?? null;
          mission.completed = true;
          newlyCompleted.push(mission.id);
          this.missionCooldowns.set(mission.agentCharacterId, tick);

          const report = this.generateDetectionReport(spy, detector);

          const consequences: EspionageConsequence[] = [
            { type: 'detected', spyCharacterId: spy.id, detectorCharacterId: detector?.id ?? spy.id },
          ];

          // Trust penalty only if family was identified
          if (mission.targetFamilyId && (report.identificationLevel === 'species' || report.identificationLevel === 'family')) {
            consequences.push({
              type: 'trust_change',
              familyId: mission.targetFamilyId,
              targetFamilyId: spy.familyTreeId,
              delta: -0.3,
            });
            trustLedger.recordBetrayal(spy.familyTreeId, mission.targetFamilyId, tick);
          }

          const result: EspionageResult = {
            success: false,
            intelGained: null,
            narrative: report.description,
            consequences,
          };
          mission.result = result;
          results.push(result);
          continue;
        }
      }

      // Check if mission duration complete
      if (elapsed >= mission.durationTicks) {
        const result = this.resolveMission(mission, tick);
        mission.completed = true;
        mission.result = result;
        results.push(result);
        newlyCompleted.push(mission.id);
        this.missionCooldowns.set(mission.agentCharacterId, tick);
        for (const sid of mission.supportCharacterIds) {
          this.missionCooldowns.set(sid, tick);
        }
      }
    }

    // Move completed missions to history
    for (const id of newlyCompleted) {
      const mission = this.missions.get(id);
      if (mission) {
        this.completedMissions.push(mission);
        this.missions.delete(id);
      }
    }

    // Prune completed missions older than 500 ticks
    this.completedMissions = this.completedMissions.filter(m => tick - m.startTick <= 500);

    return results;
  }

  /** Get combined pack strength for a mission */
  private getPackStrength(mission: EspionageMission): number {
    let strength = 0;
    const spy = characterRegistry.get(mission.agentCharacterId);
    if (spy?.isAlive) strength += getGeneValue(spy, 'strength');

    for (const id of mission.supportCharacterIds) {
      if (mission.casualtyCharacterIds.includes(id)) continue;
      const c = characterRegistry.get(id);
      if (c?.isAlive) strength += getGeneValue(c, 'strength') * 0.7;
    }
    return strength;
  }

  /** Generate identification report based on sentinel observation skill and size ratio */
  generateDetectionReport(spy: Character, detector: Character | null): DetectionReport {
    if (!detector) {
      return { detected: true, identificationLevel: 'size_class', description: 'An intruder was detected in the region.' };
    }

    const observation = roleRegistry.getObservation(detector.id);
    const obsLevel = observation?.level ?? 0;

    const spySpecies = speciesRegistry.get(spy.speciesId);
    const detectorSpecies = speciesRegistry.get(detector.speciesId);
    const spySize = spySpecies?.traits.size ?? 50;
    const detectorSize = detectorSpecies?.traits.size ?? 50;
    const sizeRatio = spySize / Math.max(detectorSize, 1);

    // Size mismatch makes identification harder
    const sizePenalty = Math.abs(Math.log2(Math.max(sizeRatio, 0.01))) * 15;
    const effectiveObs = Math.max(0, obsLevel - sizePenalty);

    const spyName = spySpecies?.commonName ?? 'creature';
    const spyClass = spySpecies?.taxonomy.class ?? 'unknown';
    const sizeDesc = getSizeClass(spySize);

    if (effectiveObs >= 80) {
      return {
        detected: true,
        identificationLevel: 'family',
        description: `${detector.name} identified a ${spyName} from the ${spy.familyTreeId} family!`,
      };
    }
    if (effectiveObs >= 60) {
      return {
        detected: true,
        identificationLevel: 'species',
        description: `${detector.name} spotted a ${spyName} sneaking through the territory.`,
      };
    }
    if (effectiveObs >= 30) {
      return {
        detected: true,
        identificationLevel: 'taxonomy_class',
        description: `${detector.name} detected a ${spyClass} creature moving suspiciously.`,
      };
    }
    return {
      detected: true,
      identificationLevel: 'size_class',
      description: `${detector.name} noticed a ${sizeDesc} creature in the area.`,
    };
  }

  /** Resolve a completed mission */
  private resolveMission(mission: EspionageMission, tick: number): EspionageResult {
    switch (mission.type) {
      case 'spy': return this.resolveSpy(mission, tick);
      case 'infiltrate': return this.resolveInfiltrate(mission, tick);
      case 'spread_rumors': return this.resolveSpreadRumors(mission, tick);
      default: return this.resolveGeneric(mission);
    }
  }

  /** Resolve spy mission — gather intel on a region */
  private resolveSpy(mission: EspionageMission, tick: number): EspionageResult {
    const spy = characterRegistry.get(mission.agentCharacterId);
    if (!spy) return { success: false, intelGained: null, narrative: 'Agent lost.', consequences: [] };

    const intel: RegionIntel = {
      regionId: mission.targetRegionId,
      discoveredAtTick: tick,
      lastUpdatedTick: tick,
      reliability: 0.8,
      knownResources: [],
      knownSpecies: [],
      knownPopEstimate: 0,
      knownThreats: [],
      source: 'shared',
      sourceCharacterId: spy.id,
      isMisinformation: false,
    };

    const map = intelligenceRegistry.getOrCreate(spy.familyTreeId);
    map.knownRegions.set(mission.targetRegionId, intel);

    return {
      success: true,
      intelGained: intel,
      narrative: `${spy.name} successfully gathered intelligence on the target region.`,
      consequences: [],
    };
  }

  /** Resolve infiltrate — can discover heartlands */
  private resolveInfiltrate(mission: EspionageMission, tick: number): EspionageResult {
    const spy = characterRegistry.get(mission.agentCharacterId);
    if (!spy) return { success: false, intelGained: null, narrative: 'Agent lost.', consequences: [] };

    const consequences: EspionageConsequence[] = [];

    const heartlandFamilies = heartlandTracker.getFamiliesWithHeartlandIn(mission.targetRegionId);
    for (const familyId of heartlandFamilies) {
      if (familyId === spy.familyTreeId) continue;
      heartlandTracker.recordHeartlandDiscovery(spy.familyTreeId, familyId);
      consequences.push({
        type: 'heartland_exposed',
        familyId,
        discovererFamilyId: spy.familyTreeId,
      });
    }

    const intel: RegionIntel = {
      regionId: mission.targetRegionId,
      discoveredAtTick: tick,
      lastUpdatedTick: tick,
      reliability: 0.9,
      knownResources: [],
      knownSpecies: [],
      knownPopEstimate: 0,
      knownThreats: [],
      source: 'shared',
      sourceCharacterId: spy.id,
      isMisinformation: false,
    };

    intelligenceRegistry.getOrCreate(spy.familyTreeId).knownRegions.set(mission.targetRegionId, intel);

    const narrative = heartlandFamilies.length > 0
      ? `${spy.name} infiltrated deep and discovered a family's heartland territory!`
      : `${spy.name} completed an infiltration mission, gathering detailed intelligence.`;

    return { success: true, intelGained: intel, narrative, consequences };
  }

  /** Resolve spread rumors — plants misinformation */
  private resolveSpreadRumors(mission: EspionageMission, tick: number): EspionageResult {
    const spy = characterRegistry.get(mission.agentCharacterId);
    if (!spy) return { success: false, intelGained: null, narrative: 'Agent lost.', consequences: [] };

    const consequences: EspionageConsequence[] = [];

    if (mission.targetFamilyId) {
      intelligenceRegistry.plantMisinformation(mission.targetFamilyId, mission.targetRegionId, {
        lastUpdatedTick: tick,
        knownThreats: ['massive_predator_presence', 'resource_depleted'],
        knownPopEstimate: 999,
        reliability: 0.6,
      });

      consequences.push({
        type: 'misinformation_planted',
        targetFamilyId: mission.targetFamilyId,
        regionId: mission.targetRegionId,
      });
    }

    return {
      success: true,
      intelGained: null,
      narrative: `${spy.name} successfully spread false information about the region.`,
      consequences,
    };
  }

  private resolveGeneric(mission: EspionageMission): EspionageResult {
    return {
      success: true,
      intelGained: null,
      narrative: `Mission of type '${mission.type}' completed.`,
      consequences: [],
    };
  }

  /** Check if a character is currently on a mission */
  isOnMission(characterId: CharacterId): boolean {
    for (const mission of this.missions.values()) {
      if (mission.completed) continue;
      if (mission.agentCharacterId === characterId) return true;
      if (mission.supportCharacterIds.includes(characterId)) return true;
    }
    return false;
  }

  /** Get sentinels in a region that could detect spies */
  private getSentinelsInRegion(regionId: RegionId, excludeCharacter: Character): Character[] {
    return characterRegistry.getByRegion(regionId)
      .filter(c => c.id !== excludeCharacter.id && c.isAlive && c.role === 'sentinel');
  }

  /** Calculate detection chance per tick — biology-driven */
  calculateDetectionChance(spy: Character, regionId: RegionId, sentinels: Character[]): number {
    const spySpecies = speciesRegistry.get(spy.speciesId);
    const spySize = spySpecies?.traits.size ?? 50;

    // Base: 5% per tick
    let chance = 0.05;

    // Size modifier: tiny species nearly invisible, large are conspicuous
    // ant (size 1) = 0.3x, cat (size 25) = 0.63x, wolf (size 60) = 1.5x, bear (size 80) = 2.0x
    const sizeModifier = Math.max(0.3, Math.min(2.0, spySize / 40));
    chance *= sizeModifier;

    // Pack bonus: slight coordination advantage (main value is absorbing detections)
    const livingSupport = this.getLivingSupportCount(spy);
    chance -= livingSupport * 0.005;

    // Logarithmic sentinel scaling with size-relative effectiveness
    if (sentinels.length > 0) {
      let sentinelContribution = 0;
      for (const sentinel of sentinels) {
        const sentinelSpecies = speciesRegistry.get(sentinel.speciesId);
        const sentinelSize = sentinelSpecies?.traits.size ?? 50;
        // Size-relative: beetle can't spot a bear well, eagle spots everything
        const sizeEffectiveness = Math.max(0.2, Math.min(2.0, sentinelSize / Math.max(spySize, 1)));
        sentinelContribution += 0.12 * sizeEffectiveness;
      }
      // Logarithmic diminishing returns
      chance += 0.12 * Math.log(1 + sentinelContribution / 0.12);
    }

    // Spy role proficiency reduces detection
    const roleAssignment = roleRegistry.getRole(spy.id);
    if (roleAssignment?.role === 'spy') {
      chance -= roleAssignment.proficiency * 0.03 * 5;
    }

    // High intelligence reduces detection
    const intel = getGeneValue(spy, 'intelligence');
    if (intel > 50) {
      chance -= (intel - 50) * 0.001;
    }

    return Math.max(0.01, Math.min(0.8, chance));
  }

  /** Count living support characters for a mission involving this spy */
  private getLivingSupportCount(spy: Character): number {
    for (const mission of this.missions.values()) {
      if (mission.completed) continue;
      if (mission.agentCharacterId !== spy.id) continue;
      return mission.supportCharacterIds.filter(id => {
        if (mission.casualtyCharacterIds.includes(id)) return false;
        const c = characterRegistry.get(id);
        return c?.isAlive ?? false;
      }).length;
    }
    return 0;
  }

  /** Attempt detection by a sentinel */
  attemptDetection(sentinelCharacter: Character, regionId: RegionId, tick: number): EspionageMission | null {
    for (const mission of this.missions.values()) {
      if (mission.completed || mission.detected) continue;
      if (mission.targetRegionId !== regionId) continue;

      const spy = characterRegistry.get(mission.agentCharacterId);
      if (!spy || !spy.isAlive) continue;

      const detectionChance = this.calculateDetectionChance(spy, regionId, [sentinelCharacter]);
      if (worldRNG.chance(detectionChance)) {
        mission.detected = true;
        mission.detectedByCharacterId = sentinelCharacter.id;
        return mission;
      }
    }
    return null;
  }

  /** Get all active missions */
  getActiveMissions(): EspionageMission[] {
    return Array.from(this.missions.values()).filter(m => !m.completed);
  }

  /** Get recently completed missions (for history/narrative) */
  getRecentMissions(): EspionageMission[] {
    return [...this.completedMissions];
  }

  clear(): void {
    this.missions.clear();
    this.completedMissions = [];
    this.missionCooldowns.clear();
  }
}

export let espionageRegistry = new EspionageRegistry();
export function _installEspionageRegistry(instance: EspionageRegistry): void { espionageRegistry = instance; }
