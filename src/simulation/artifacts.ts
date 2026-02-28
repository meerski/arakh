// ============================================================
// Artifacts, Anomalies & Radiation Zones
// ============================================================
// Ancient artifacts with transformative powers.
// Dimensional anomalies where reality behaves differently.
// Cosmic radiation zones granting mutations/powers.

import type { Character, Region, RegionId, SpeciesId, WorldEvent } from '../types.js';
import { worldRNG } from './random.js';
import { getGeneValue } from '../species/character.js';
import { fameTracker } from '../game/fame.js';

// ============================================================
// Artifacts
// ============================================================

export interface Artifact {
  id: string;
  name: string;
  type: ArtifactType;
  regionId: RegionId;
  discoveredBy: string | null;
  discoveredAtTick: number | null;
  power: number;          // 0-1, how powerful
  effects: ArtifactEffect[];
  isActive: boolean;
}

export type ArtifactType =
  | 'relic'           // Ancient object with passive effects
  | 'catalyst'        // Accelerates evolution/discovery
  | 'weapon'          // Combat advantage
  | 'oracle'          // Knowledge/perception boost
  | 'seed'            // Creates new resources/life
  | 'prison';         // Contains something dangerous

export interface ArtifactEffect {
  type: ArtifactEffectType;
  magnitude: number;
  targetScope: 'holder' | 'region' | 'species';
}

export type ArtifactEffectType =
  | 'intelligence_boost'
  | 'mutation_rate_increase'
  | 'health_regen'
  | 'perception_boost'
  | 'strength_boost'
  | 'resource_generation'
  | 'fertility_boost'
  | 'danger_aura';

const ARTIFACT_NAMES: Record<ArtifactType, string[]> = {
  relic: ['The Everstone', 'Crown of the First', 'The Ageless Bone', 'Singing Crystal', 'The Worldseed'],
  catalyst: ['The Spark Shard', 'Essence of Change', 'The Quickening', 'Vial of Potential', 'The Accelerant'],
  weapon: ['The Thorn of Ages', 'Stormfang', 'The Devourer', 'Obsidian Edge', 'Claw of the Fallen'],
  oracle: ['Eye of the Deep', 'The All-Seeing Stone', 'Mirror of Truth', 'The Whispering Shell', 'Dream Lens'],
  seed: ['Heart of the Forest', 'The Genesis Stone', 'Coral Heart', 'The Sprouting Gem', 'Life Ember'],
  prison: ['The Sealed Sphere', 'Cage of Shadows', 'The Bound Stone', 'Vessel of Containment', 'The Lock'],
};

const ARTIFACT_EFFECTS: Record<ArtifactType, ArtifactEffect[]> = {
  relic: [{ type: 'health_regen', magnitude: 0.3, targetScope: 'holder' }],
  catalyst: [{ type: 'mutation_rate_increase', magnitude: 0.5, targetScope: 'region' }],
  weapon: [{ type: 'strength_boost', magnitude: 0.4, targetScope: 'holder' }],
  oracle: [{ type: 'perception_boost', magnitude: 0.5, targetScope: 'holder' }, { type: 'intelligence_boost', magnitude: 0.3, targetScope: 'holder' }],
  seed: [{ type: 'resource_generation', magnitude: 0.4, targetScope: 'region' }, { type: 'fertility_boost', magnitude: 0.3, targetScope: 'region' }],
  prison: [{ type: 'danger_aura', magnitude: 0.6, targetScope: 'region' }],
};

class ArtifactRegistry {
  private artifacts: Map<string, Artifact> = new Map();

  /** Spawn a new artifact in a region */
  spawn(regionId: RegionId, type?: ArtifactType): Artifact {
    const artifactType = type ?? worldRNG.pick(['relic', 'catalyst', 'weapon', 'oracle', 'seed', 'prison'] as ArtifactType[]);
    const names = ARTIFACT_NAMES[artifactType];

    const artifact: Artifact = {
      id: crypto.randomUUID(),
      name: worldRNG.pick(names),
      type: artifactType,
      regionId,
      discoveredBy: null,
      discoveredAtTick: null,
      power: worldRNG.float(0.3, 1.0),
      effects: ARTIFACT_EFFECTS[artifactType].map(e => ({
        ...e,
        magnitude: e.magnitude * worldRNG.float(0.5, 1.5),
      })),
      isActive: true,
    };

    this.artifacts.set(artifact.id, artifact);
    return artifact;
  }

  /** Character discovers and claims an artifact */
  discover(artifactId: string, character: Character, tick: number): boolean {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact || artifact.discoveredBy) return false;

    artifact.discoveredBy = character.id;
    artifact.discoveredAtTick = tick;

    // Add to character's inventory as an artifact item
    character.inventory.push({
      id: artifact.id,
      name: artifact.name,
      type: 'artifact',
      properties: {
        artifactType: artifact.type,
        power: artifact.power,
      },
      createdAtTick: tick,
      createdBy: character.id,
    });

    fameTracker.recordAchievement(character, `Discovered artifact: ${artifact.name}`, 25, tick);
    return true;
  }

  /** Get artifacts in a region */
  getByRegion(regionId: RegionId): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.regionId === regionId);
  }

  /** Get undiscovered artifacts in a region */
  getUndiscoveredInRegion(regionId: RegionId): Artifact[] {
    return this.getByRegion(regionId).filter(a => !a.discoveredBy);
  }

  get(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  getAll(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  clear(): void {
    this.artifacts.clear();
  }
}

export const artifactRegistry = new ArtifactRegistry();

// ============================================================
// Radiation Zones
// ============================================================

export interface RadiationZone {
  id: string;
  regionId: RegionId;
  intensity: number;      // 0-1
  createdAtTick: number;
  decayRate: number;       // How fast it fades per tick
  mutationBonus: number;   // Extra mutation chance
}

class RadiationTracker {
  private zones: Map<string, RadiationZone> = new Map();

  /** Create a radiation zone */
  create(regionId: RegionId, intensity: number, tick: number): RadiationZone {
    const zone: RadiationZone = {
      id: crypto.randomUUID(),
      regionId,
      intensity: Math.min(1, intensity),
      createdAtTick: tick,
      decayRate: 0.0001,  // Very slow decay
      mutationBonus: intensity * 0.1,
    };
    this.zones.set(zone.id, zone);
    return zone;
  }

  /** Decay radiation zones over time */
  tick(): void {
    for (const [id, zone] of this.zones) {
      zone.intensity = Math.max(0, zone.intensity - zone.decayRate);
      zone.mutationBonus = zone.intensity * 0.1;
      if (zone.intensity <= 0.01) {
        this.zones.delete(id);
      }
    }
  }

  /** Get radiation in a region */
  getRegionRadiation(regionId: RegionId): number {
    let total = 0;
    for (const zone of this.zones.values()) {
      if (zone.regionId === regionId) total += zone.intensity;
    }
    return Math.min(1, total);
  }

  /** Get zones in a region */
  getByRegion(regionId: RegionId): RadiationZone[] {
    return Array.from(this.zones.values()).filter(z => z.regionId === regionId);
  }

  getAll(): RadiationZone[] {
    return Array.from(this.zones.values());
  }

  clear(): void {
    this.zones.clear();
  }
}

export const radiationTracker = new RadiationTracker();

// ============================================================
// Dimensional Anomalies
// ============================================================

export interface Anomaly {
  id: string;
  regionId: RegionId;
  type: AnomalyType;
  intensity: number;
  createdAtTick: number;
  duration: number;        // Ticks before it closes
  description: string;
}

export type AnomalyType =
  | 'temporal_rift'       // Time flows differently
  | 'spatial_tear'        // Connects two distant regions
  | 'void_pocket'         // Null space, dangerous
  | 'dream_nexus'         // Enhances intelligence/perception
  | 'primal_wellspring';  // Enhances physical traits

const ANOMALY_DESCRIPTIONS: Record<AnomalyType, string[]> = {
  temporal_rift: [
    'Time flows strangely here — moments stretch and compress.',
    'A shimmer in the air where past and future blur.',
  ],
  spatial_tear: [
    'The air splits open, revealing a distant landscape beyond.',
    'Reality folds upon itself — two places become one.',
  ],
  void_pocket: [
    'An absence of everything — a hole in the fabric of existence.',
    'Darkness deeper than night pools in this space.',
  ],
  dream_nexus: [
    'The boundary between thought and reality thins here.',
    'Visions of possibilities dance at the edge of perception.',
  ],
  primal_wellspring: [
    'Raw, untamed energy surges from the earth itself.',
    'Life force concentrates here with overwhelming intensity.',
  ],
};

class AnomalyTracker {
  private anomalies: Map<string, Anomaly> = new Map();

  /** Create an anomaly */
  create(regionId: RegionId, tick: number, type?: AnomalyType): Anomaly {
    const anomalyType = type ?? worldRNG.pick([
      'temporal_rift', 'spatial_tear', 'void_pocket', 'dream_nexus', 'primal_wellspring',
    ] as AnomalyType[]);

    const anomaly: Anomaly = {
      id: crypto.randomUUID(),
      regionId,
      type: anomalyType,
      intensity: worldRNG.float(0.3, 1.0),
      createdAtTick: tick,
      duration: worldRNG.int(500, 5000),
      description: worldRNG.pick(ANOMALY_DESCRIPTIONS[anomalyType]),
    };
    this.anomalies.set(anomaly.id, anomaly);
    return anomaly;
  }

  /** Tick — close expired anomalies */
  tick(currentTick: number): Anomaly[] {
    const closed: Anomaly[] = [];
    for (const [id, anomaly] of this.anomalies) {
      if (currentTick - anomaly.createdAtTick >= anomaly.duration) {
        closed.push(anomaly);
        this.anomalies.delete(id);
      }
    }
    return closed;
  }

  /** Get anomalies in a region */
  getByRegion(regionId: RegionId): Anomaly[] {
    return Array.from(this.anomalies.values()).filter(a => a.regionId === regionId);
  }

  getAll(): Anomaly[] {
    return Array.from(this.anomalies.values());
  }

  clear(): void {
    this.anomalies.clear();
  }
}

export const anomalyTracker = new AnomalyTracker();

// ============================================================
// Event Generators — spawn artifacts, radiation, anomalies
// ============================================================

/** Maybe spawn an artifact from a cosmic/meteor event */
export function maybeSpawnArtifact(region: Region, tick: number): Artifact | null {
  if (!worldRNG.chance(0.1)) return null;
  return artifactRegistry.spawn(region.id);
}

/** Create a radiation zone from a cosmic/meteor event */
export function createRadiationFromEvent(regionId: RegionId, intensity: number, tick: number): RadiationZone {
  return radiationTracker.create(regionId, intensity, tick);
}

/** Create an anomaly from a cosmic event */
export function createAnomalyFromEvent(regionId: RegionId, tick: number): Anomaly {
  return anomalyTracker.create(regionId, tick);
}

/** Create WorldEvent for artifact discovery */
export function artifactDiscoveryEvent(artifact: Artifact, character: Character, tick: number): WorldEvent {
  return {
    id: crypto.randomUUID(),
    type: 'artifact',
    level: 'species',
    regionIds: [artifact.regionId],
    description: `${character.name} has discovered ${artifact.name} — an ancient ${artifact.type} of power ${artifact.power.toFixed(1)}.`,
    tick,
    effects: [{
      type: 'artifact_found',
      regionId: artifact.regionId,
      magnitude: artifact.power,
    }],
    resolved: true,
  };
}

/** Create WorldEvent for anomaly appearance */
export function anomalyEvent(anomaly: Anomaly, tick: number): WorldEvent {
  return {
    id: crypto.randomUUID(),
    type: 'anomaly',
    level: 'regional',
    regionIds: [anomaly.regionId],
    description: `A ${anomaly.type.replace(/_/g, ' ')} has manifested. ${anomaly.description}`,
    tick,
    effects: [{
      type: 'reality_distortion',
      regionId: anomaly.regionId,
      magnitude: anomaly.intensity,
    }],
    resolved: false,
  };
}
