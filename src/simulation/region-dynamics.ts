// ============================================================
// Region Dynamics — Harmony/Chaos Scoring & Strategic Migration
// ============================================================

import type { Region, RegionId, RegionProfile, SpeciesId } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { allianceRegistry } from '../game/alliance.js';
import type { EcosystemState } from './ecosystem.js';
import { getPredatorsOf } from './ecosystem.js';

// ============================================================
// Region Profile Registry — singleton
// ============================================================

export class RegionProfileRegistry {
  private profiles: Map<RegionId, RegionProfile> = new Map();
  private populationHistory: Map<RegionId, number[]> = new Map();
  private predationCounts: Map<RegionId, number> = new Map();
  private extinctionCounts: Map<RegionId, number> = new Map();

  getProfile(regionId: RegionId): RegionProfile | undefined {
    return this.profiles.get(regionId);
  }

  setProfile(regionId: RegionId, profile: RegionProfile): void {
    this.profiles.set(regionId, profile);
  }

  recordPredation(regionId: RegionId): void {
    this.predationCounts.set(regionId, (this.predationCounts.get(regionId) ?? 0) + 1);
  }

  recordExtinction(regionId: RegionId): void {
    this.extinctionCounts.set(regionId, (this.extinctionCounts.get(regionId) ?? 0) + 1);
  }

  recordPopulation(regionId: RegionId, totalPop: number): void {
    const history = this.populationHistory.get(regionId) ?? [];
    history.push(totalPop);
    // Keep last 100 entries
    if (history.length > 100) history.shift();
    this.populationHistory.set(regionId, history);
  }

  getPopulationHistory(regionId: RegionId): number[] {
    return this.populationHistory.get(regionId) ?? [];
  }

  getPredationCount(regionId: RegionId): number {
    return this.predationCounts.get(regionId) ?? 0;
  }

  getExtinctionCount(regionId: RegionId): number {
    return this.extinctionCounts.get(regionId) ?? 0;
  }

  /** Reset counters after profile calculation */
  resetCounters(regionId: RegionId): void {
    this.predationCounts.set(regionId, 0);
    this.extinctionCounts.set(regionId, 0);
  }

  getAll(): RegionProfile[] {
    return Array.from(this.profiles.values());
  }

  clear(): void {
    this.profiles.clear();
    this.populationHistory.clear();
    this.predationCounts.clear();
    this.extinctionCounts.clear();
  }
}

export let regionProfileRegistry = new RegionProfileRegistry();
export function _installRegionProfileRegistry(instance: RegionProfileRegistry): void { regionProfileRegistry = instance; }

// ============================================================
// Profile Calculation
// ============================================================

export function calculateRegionProfile(
  region: Region,
  ecosystem: EcosystemState,
  tick: number,
): RegionProfile {
  const regionId = region.id;

  // Population stability (low variance = harmony)
  const history = regionProfileRegistry.getPopulationHistory(regionId);
  let stabilityScore = 0.5;
  if (history.length >= 10) {
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + (b - mean) ** 2, 0) / history.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation
    stabilityScore = Math.max(0, 1 - cv * 2);
  }

  // Predation rate (high = chaos)
  const totalPop = region.populations.reduce((s, p) => s + p.count, 0);
  const predationCount = regionProfileRegistry.getPredationCount(regionId);
  const predationRate = totalPop > 0 ? predationCount / totalPop : 0;

  // Active alliances boost harmony
  const alliances = allianceRegistry.getAlliancesInRegion(regionId);
  const allianceBonus = Math.min(0.3, alliances.length * 0.1);

  // Recent extinctions boost chaos
  const extinctions = regionProfileRegistry.getExtinctionCount(regionId);
  const extinctionPenalty = Math.min(0.4, extinctions * 0.2);

  // Species diversity (high diversity + low predation = harmony)
  const speciesCount = region.populations.filter(p => p.count > 0).length;
  const diversityScore = Math.min(1, speciesCount / 10);

  // Plant health (depletion = chaos)
  let plantHealth = 0.5;
  if (region.plantPopulations.length > 0) {
    const avgBiomassRatio = region.plantPopulations.reduce(
      (s, p) => s + (p.permanentlyDestroyed ? 0 : p.biomass / p.maxBiomass), 0
    ) / region.plantPopulations.length;
    plantHealth = avgBiomassRatio;
  }

  // Calculate harmony and chaos
  let harmonyScore = (stabilityScore * 0.3 + diversityScore * 0.2 + plantHealth * 0.2 + allianceBonus);
  let chaosScore = (predationRate * 0.3 + extinctionPenalty + (1 - plantHealth) * 0.1 + (1 - stabilityScore) * 0.2);

  harmonyScore = Math.max(0, Math.min(1, harmonyScore));
  chaosScore = Math.max(0, Math.min(1, chaosScore));

  // Stability trend: positive = getting more harmonious, negative = destabilizing
  const previousProfile = regionProfileRegistry.getProfile(regionId);
  const stabilityTrend = previousProfile
    ? (harmonyScore - previousProfile.harmonyScore) - (chaosScore - previousProfile.chaosScore)
    : 0;

  const dominantStrategy: 'harmony' | 'chaos' | 'neutral' =
    harmonyScore > chaosScore + 0.2 ? 'harmony' :
    chaosScore > harmonyScore + 0.2 ? 'chaos' :
    'neutral';

  const profile: RegionProfile = {
    regionId,
    harmonyScore,
    chaosScore,
    stabilityTrend: Math.max(-1, Math.min(1, stabilityTrend)),
    dominantStrategy,
  };

  regionProfileRegistry.setProfile(regionId, profile);
  regionProfileRegistry.resetCounters(regionId);

  return profile;
}

// ============================================================
// Strategic Migration Targets
// ============================================================

export function getStrategicMigrationTargets(
  sourceRegion: Region,
  allRegions: Map<string, Region>,
  speciesId: SpeciesId,
): { regionId: RegionId; score: number; reason: string }[] {
  const species = speciesRegistry.get(speciesId);
  if (!species) return [];

  const targets: { regionId: RegionId; score: number; reason: string }[] = [];

  for (const connId of sourceRegion.connections) {
    const target = allRegions.get(connId);
    if (!target) continue;

    // Must be habitat-compatible
    if (!species.traits.habitat.includes(target.layer)) continue;

    const profile = regionProfileRegistry.getProfile(target.id);
    if (!profile) continue;

    let score = 0;
    let reason = '';

    const isAggressive = species.traits.strength > 60 || species.traits.diet === 'carnivore';
    const isPeaceful = species.traits.diet === 'herbivore' || species.traits.socialStructure === 'herd';

    if (isPeaceful) {
      // Peaceful species prefer harmony
      score = profile.harmonyScore - profile.chaosScore;
      reason = score > 0 ? 'seeking peaceful territory' : 'avoiding dangerous territory';
    } else if (isAggressive) {
      // Aggressive species see opportunity in chaos
      score = profile.chaosScore * 0.5 + profile.harmonyScore * 0.3; // some interest in both
      reason = profile.chaosScore > 0.5 ? 'hunting opportunity' : 'new territory to claim';
    } else {
      // Neutral species prefer stability
      score = profile.harmonyScore * 0.5 + (1 - profile.chaosScore) * 0.3;
      reason = 'seeking stable territory';
    }

    // Intelligent species may seek to restore order in chaotic regions
    if (species.traits.intelligence > 70 && species.traits.socialStructure !== 'solitary') {
      if (profile.chaosScore > 0.6) {
        score += 0.2;
        reason = 'seeking to restore order';
      }
    }

    targets.push({ regionId: target.id, score, reason });
  }

  // Sort by score descending
  targets.sort((a, b) => b.score - a.score);
  return targets;
}

// ============================================================
// Region Feel Narrative
// ============================================================

export function getRegionFeelNarrative(regionId: RegionId): string {
  const profile = regionProfileRegistry.getProfile(regionId);
  if (!profile) return '';

  if (profile.dominantStrategy === 'harmony') {
    if (profile.harmonyScore > 0.7) {
      return 'The land feels peaceful. Species coexist in careful balance.';
    }
    return 'A tentative peace holds here. Life carries on without great conflict.';
  }

  if (profile.dominantStrategy === 'chaos') {
    if (profile.chaosScore > 0.7) {
      return 'Danger lurks everywhere. The strong feed on the weak.';
    }
    return 'Tension fills the air. This is not a safe place to linger.';
  }

  return 'An uneasy truce holds, but tensions simmer beneath the surface.';
}
