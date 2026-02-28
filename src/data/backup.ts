// ============================================================
// World State Serialization & Backup System
// ============================================================
// Serializes the entire simulation state to JSON snapshots.
// Saves to the saves/ directory. Supports restore.

import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { World } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { cardCollection } from '../cards/collection.js';
import { lineageManager } from '../game/lineage.js';
import { fameTracker } from '../game/fame.js';

// --- Serializable Snapshot ---

export interface WorldSnapshot {
  version: number;
  createdAt: string;
  tick: number;
  world: SerializedWorld;
  species: unknown[];
  cards: unknown[];
  familyTrees: unknown[];
  hallOfFame: unknown[];
  metadata: SnapshotMetadata;
}

export interface SerializedWorld {
  name: string;
  time: unknown;
  era: unknown;
  regions: SerializedRegion[];
  startedAt: string;
}

export interface SerializedRegion {
  id: string;
  name: string;
  type: string;
  biome: string;
  latitude: number;
  longitude: number;
  elevation: number;
  climate: unknown;
  populations: unknown[];
  resources: unknown[];
  connections: string[];
  hiddenLocations: unknown[];
}

export interface SnapshotMetadata {
  regionCount: number;
  speciesCount: number;
  cardCount: number;
  treeCount: number;
  totalPopulation: number;
}

// --- Serializer ---

export class WorldSerializer {
  /** Serialize current world state to a snapshot */
  serialize(world: World): WorldSnapshot {
    const regions: SerializedRegion[] = [];
    let totalPopulation = 0;

    for (const [_id, region] of world.regions) {
      for (const pop of region.populations) {
        totalPopulation += pop.count;
      }
      regions.push({
        id: region.id,
        name: region.name,
        type: region.layer,
        biome: region.biome,
        latitude: region.latitude,
        longitude: region.longitude,
        elevation: region.elevation,
        climate: { ...region.climate },
        populations: region.populations.map(p => ({ ...p })),
        resources: region.resources.map(r => ({ ...r })),
        connections: [...region.connections],
        hiddenLocations: region.hiddenLocations?.map(h => ({ ...h })) ?? [],
      });
    }

    const allSpecies = speciesRegistry.getAll();
    const allCards = cardCollection.getAll();
    const allTrees = lineageManager.getAllTrees();
    const hallOfFame = fameTracker.getTopFamous(100);

    return {
      version: 1,
      createdAt: new Date().toISOString(),
      tick: world.time.tick,
      world: {
        name: world.name,
        time: { ...world.time },
        era: { ...world.era },
        regions,
        startedAt: world.startedAt.toISOString(),
      },
      species: allSpecies.map(s => ({
        id: s.id,
        commonName: s.commonName,
        scientificName: s.scientificName,
        taxonomy: s.taxonomy,
        tier: s.tier,
        status: s.status,
        totalPopulation: s.totalPopulation,
      })),
      cards: allCards.map(c => ({
        id: c.id,
        rarity: c.rarity,
        characterName: c.characterName,
        speciesId: c.speciesId,
        soulboundTo: c.soulboundTo,
        fameScore: c.fameScore,
      })),
      familyTrees: allTrees.map(t => ({
        id: t.id,
        speciesId: t.speciesId,
        ownerId: t.ownerId,
        generations: t.generations,
        memberCount: t.members.length,
        isExtinct: t.isExtinct,
      })),
      hallOfFame,
      metadata: {
        regionCount: regions.length,
        speciesCount: allSpecies.length,
        cardCount: allCards.length,
        treeCount: allTrees.length,
        totalPopulation,
      },
    };
  }
}

export const worldSerializer = new WorldSerializer();

// --- Backup Manager ---

export interface BackupInfo {
  filename: string;
  tick: number;
  createdAt: string;
  sizeBytes: number;
  metadata: SnapshotMetadata;
}

export class BackupManager {
  private savesDir: string;

  constructor(savesDir: string) {
    this.savesDir = savesDir;
    if (!existsSync(this.savesDir)) {
      mkdirSync(this.savesDir, { recursive: true });
    }
  }

  /** Create a checkpoint backup */
  createCheckpoint(world: World, label?: string): BackupInfo {
    const snapshot = worldSerializer.serialize(world);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const suffix = label ? `-${label}` : '';
    const filename = `checkpoint-${snapshot.tick}${suffix}-${timestamp}.json`;
    const filepath = join(this.savesDir, filename);

    const json = JSON.stringify(snapshot, null, 2);
    writeFileSync(filepath, json, 'utf-8');

    return {
      filename,
      tick: snapshot.tick,
      createdAt: snapshot.createdAt,
      sizeBytes: Buffer.byteLength(json, 'utf-8'),
      metadata: snapshot.metadata,
    };
  }

  /** List available backups */
  listBackups(): BackupInfo[] {
    if (!existsSync(this.savesDir)) return [];

    const files = readdirSync(this.savesDir).filter(f => f.endsWith('.json'));
    const backups: BackupInfo[] = [];

    for (const filename of files) {
      try {
        const filepath = join(this.savesDir, filename);
        const json = readFileSync(filepath, 'utf-8');
        const snapshot: WorldSnapshot = JSON.parse(json);
        backups.push({
          filename,
          tick: snapshot.tick,
          createdAt: snapshot.createdAt,
          sizeBytes: Buffer.byteLength(json, 'utf-8'),
          metadata: snapshot.metadata,
        });
      } catch {
        // Skip corrupt files
      }
    }

    return backups.sort((a, b) => b.tick - a.tick);
  }

  /** Load a backup snapshot */
  loadSnapshot(filename: string): WorldSnapshot | null {
    const filepath = join(this.savesDir, filename);
    if (!existsSync(filepath)) return null;

    try {
      const json = readFileSync(filepath, 'utf-8');
      return JSON.parse(json) as WorldSnapshot;
    } catch {
      return null;
    }
  }

  /** Get the latest backup */
  getLatestBackup(): BackupInfo | null {
    const backups = this.listBackups();
    return backups.length > 0 ? backups[0] : null;
  }
}
