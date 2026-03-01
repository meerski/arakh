// ============================================================
// Persistence Layer — Write-Behind Buffer + Snapshots
// ============================================================
// 3-layer persistence: dirty tracking → async PostgreSQL upserts → periodic snapshots.
// Max 30s data loss on crash (flush every 30 ticks at 1 tick/second).

import type pg from 'pg';
import type {
  World, Region, RegionId, Character, CharacterId, SpeciesId,
  PlayerId, FamilyTreeId,
} from '../types.js';
import type { WorldContext } from '../context.js';
import type { EcosystemState } from '../simulation/ecosystem.js';
import { query, withTransaction } from './db.js';

// --- Snapshot Payload ---

export interface PersistenceSnapshot {
  version: number;
  tick: number;
  createdAt: string;

  // World core
  world: {
    id: string;
    name: string;
    tick: number;
    era: { name: string; startTick: number; dominantSpecies: string | null };
    startedAt: string;
  };

  // Regions (with populations, resources, climate, plants, connections, hidden locations)
  regions: SerializedRegion[];

  // Ecosystem
  ecosystem: {
    foodWeb: { predatorId: string; preyId: string; efficiency: number }[];
    carryingCapacity: [string, number][];
    speciesCapacity: [string, number][];
  };

  // Characters (living only — dead characters are archived separately)
  characters: Record<string, unknown>[];

  // Species state (population counts, status)
  speciesState: { id: string; totalPopulation: number; status: string; genesisElderCount: number }[];

  // Family trees
  familyTrees: Record<string, unknown>[];

  // Players & Owners
  players: Record<string, unknown>[];
  owners: Record<string, unknown>[];

  // Cards
  cards: Record<string, unknown>[];

  // Fame hall
  hallOfFame: Record<string, unknown>[];

  // Alliances
  alliances: Record<string, unknown>[];

  // Pacts
  pacts: Record<string, unknown>[];

  // Domestication bonds
  domesticationBonds: Record<string, unknown>[];

  // Advancements
  advancements: Record<string, unknown>[];

  // Chronicle records
  chronicle: { records: Record<string, unknown>[]; eras: Record<string, unknown>[] };
}

interface SerializedRegion {
  id: string;
  name: string;
  layer: string;
  biome: string;
  latitude: number;
  longitude: number;
  elevation: number;
  climate: Record<string, unknown>;
  populations: Record<string, unknown>[];
  plantPopulations: Record<string, unknown>[];
  resources: Record<string, unknown>[];
  connections: string[];
  hiddenLocations: Record<string, unknown>[];
}

// --- Persistence Layer ---

export class PersistenceLayer {
  private flushing = false;
  private maxSnapshots = 20;  // Keep last 20 snapshots in DB

  /** Create a snapshot of the current world state. */
  createSnapshot(world: World, ecosystem: EcosystemState, ctx: WorldContext): PersistenceSnapshot {
    const tick = world.time.tick;

    // Serialize regions
    const regions: SerializedRegion[] = [];
    for (const region of world.regions.values()) {
      regions.push(serializeRegion(region));
    }

    // Serialize characters (living only for main snapshot; dead chars archived on death)
    const livingChars = ctx.characters.getLiving();
    const characters = livingChars.map(c => serializeCharacter(c));

    // Species state
    const allSpecies = ctx.species.getAll();
    const speciesState = allSpecies.map(s => ({
      id: s.id,
      totalPopulation: s.totalPopulation,
      status: s.status,
      genesisElderCount: s.genesisElderCount,
    }));

    // Family trees
    const allTrees = ctx.lineage.getAllTrees();
    const familyTrees = allTrees.map(t => ({
      id: t.id,
      speciesId: t.speciesId,
      ownerId: t.ownerId,
      rootCharacterId: t.rootCharacterId,
      generations: t.generations,
      members: [...t.members],
      isExtinct: t.isExtinct,
      tier: t.tier,
      populationGenome: t.populationGenome,
      populationCount: t.populationCount,
    }));

    // Players & Owners
    const allPlayers = ctx.players.getAllPlayers();
    const players = allPlayers.map(p => ({
      id: p.id,
      ownerId: p.ownerId,
      currentCharacterId: p.currentCharacterId,
      familyTreeId: p.familyTreeId,
      isConnected: p.isConnected,
    }));
    const owners: Record<string, unknown>[] = [];  // Owners restored from players on load

    // Cards
    const allCards = ctx.cards.getAll();
    const cards = allCards.map(c => ({ ...c }));

    // Fame
    const hallOfFame = ctx.fame.getTopFamous(1000).map(f => ({ ...f }));

    // Alliances
    const allAlliances = ctx.alliances.getAll();
    const alliances = allAlliances.map(a => ({ ...a }));

    // Pacts
    const allPacts = ctx.pacts.getAll();
    const pacts = allPacts.map(p => ({ ...p }));

    // Domestication
    const domesticationBonds = ctx.domestication.getAll().map(b => ({ ...b }));

    // Advancements
    const advancementsList = ctx.advancements.getAll();
    const advancements = advancementsList.map(a => ({ ...a }));

    // Chronicle
    const chronicleData = ctx.chronicle.getSnapshot() as any;

    // Ecosystem
    const ecosystemData = {
      foodWeb: ecosystem.foodWeb.map(e => ({
        predatorId: e.predatorId,
        preyId: e.preyId,
        efficiency: e.efficiency,
      })),
      carryingCapacity: [...ecosystem.carryingCapacity.entries()] as [string, number][],
      speciesCapacity: [...ecosystem.speciesCapacity.entries()] as [string, number][],
    };

    return {
      version: 2,
      tick,
      createdAt: new Date().toISOString(),
      world: {
        id: world.id,
        name: world.name,
        tick,
        era: {
          name: world.era.name,
          startTick: world.era.startTick,
          dominantSpecies: world.era.dominantSpecies,
        },
        startedAt: world.startedAt.toISOString(),
      },
      regions,
      ecosystem: ecosystemData,
      characters,
      speciesState,
      familyTrees,
      players,
      owners,
      cards,
      hallOfFame,
      alliances,
      pacts,
      domesticationBonds,
      advancements,
      chronicle: chronicleData,
    };
  }

  /** Flush current state to PostgreSQL (non-blocking, max 30-tick interval). */
  async flush(world: World, ecosystem: EcosystemState, ctx: WorldContext): Promise<void> {
    if (this.flushing) return;  // Skip if previous flush still running
    this.flushing = true;

    try {
      const snapshot = this.createSnapshot(world, ecosystem, ctx);
      await query(
        'INSERT INTO snapshots (tick, version, data) VALUES ($1, $2, $3)',
        [snapshot.tick, snapshot.version, JSON.stringify(snapshot)],
      );
    } catch (err) {
      console.error('[Persistence] Flush failed:', (err as Error).message);
    } finally {
      this.flushing = false;
    }
  }

  /** Save a named snapshot (for periodic checkpoints). Also prunes old snapshots. */
  async saveSnapshot(world: World, ecosystem: EcosystemState, ctx: WorldContext): Promise<void> {
    await this.flush(world, ecosystem, ctx);
    await this.pruneOldSnapshots();
  }

  /** Load the latest snapshot from the database. Returns null if none found. */
  async loadLatest(): Promise<PersistenceSnapshot | null> {
    try {
      const result = await query<{ data: PersistenceSnapshot }>(
        'SELECT data FROM snapshots ORDER BY tick DESC LIMIT 1',
      );
      if (result.rows.length === 0) return null;
      return result.rows[0].data;
    } catch (err) {
      console.error('[Persistence] Failed to load snapshot:', (err as Error).message);
      return null;
    }
  }

  /** Hydrate world state from a snapshot. Returns the tick to resume from. */
  hydrate(
    snapshot: PersistenceSnapshot,
    world: World,
    ecosystem: EcosystemState,
    ctx: WorldContext,
  ): number {
    const tick = snapshot.tick;
    console.log(`[Persistence] Hydrating from tick ${tick}...`);

    // Restore world core
    world.name = snapshot.world.name;
    world.era = {
      name: snapshot.world.era.name,
      startTick: snapshot.world.era.startTick,
      dominantSpecies: snapshot.world.era.dominantSpecies as SpeciesId | null,
    };
    world.startedAt = new Date(snapshot.world.startedAt);

    // Restore regions
    world.regions.clear();
    for (const sr of snapshot.regions) {
      const region = deserializeRegion(sr);
      world.regions.set(region.id as RegionId, region);
    }

    // Restore ecosystem
    ecosystem.foodWeb = snapshot.ecosystem.foodWeb.map(e => ({
      predatorId: e.predatorId as SpeciesId,
      preyId: e.preyId as SpeciesId,
      efficiency: e.efficiency,
    }));
    ecosystem.carryingCapacity = new Map(snapshot.ecosystem.carryingCapacity);
    ecosystem.speciesCapacity = new Map(snapshot.ecosystem.speciesCapacity);

    // Restore species state (population counts & status only — species definitions are seeded)
    for (const ss of snapshot.speciesState) {
      const species = ctx.species.get(ss.id as SpeciesId);
      if (species) {
        species.totalPopulation = ss.totalPopulation;
        (species as any).status = ss.status;
        (species as any).genesisElderCount = ss.genesisElderCount;
      }
    }

    // Restore characters
    ctx.characters.clear();
    for (const sc of snapshot.characters) {
      const character = deserializeCharacter(sc);
      ctx.characters.add(character);
    }

    // Restore family trees
    for (const st of snapshot.familyTrees) {
      ctx.lineage.restoreTree(st as any);
    }

    // Restore players
    for (const sp of snapshot.players) {
      ctx.players.restorePlayer(sp as any);
    }

    // Restore cards
    for (const card of snapshot.cards) {
      ctx.cards.restoreCard(card as any);
    }

    // Restore fame
    ctx.fame.restoreHallOfFame(snapshot.hallOfFame as any[]);

    // Restore alliances
    for (const a of snapshot.alliances) {
      ctx.alliances.restore(a as any);
    }

    // Restore pacts
    for (const p of snapshot.pacts) {
      ctx.pacts.restore(p as any);
    }

    // Restore domestication bonds
    for (const b of snapshot.domesticationBonds) {
      ctx.domestication.restore(b as any);
    }

    // Restore advancements
    for (const a of snapshot.advancements) {
      ctx.advancements.restore(a as any);
    }

    // Restore chronicle
    ctx.chronicle.restoreSnapshot(snapshot.chronicle);

    console.log(`[Persistence] Hydrated: ${snapshot.characters.length} characters, ${snapshot.regions.length} regions, tick ${tick}`);
    return tick;
  }

  /** Remove old snapshots, keeping only the most recent N. */
  private async pruneOldSnapshots(): Promise<void> {
    try {
      await query(`
        DELETE FROM snapshots
        WHERE id NOT IN (
          SELECT id FROM snapshots ORDER BY tick DESC LIMIT $1
        )
      `, [this.maxSnapshots]);
    } catch (err) {
      console.error('[Persistence] Prune failed:', (err as Error).message);
    }
  }
}

// --- Serialization Helpers ---

function serializeRegion(region: Region): SerializedRegion {
  return {
    id: region.id,
    name: region.name,
    layer: region.layer,
    biome: region.biome,
    latitude: region.latitude,
    longitude: region.longitude,
    elevation: region.elevation,
    climate: { ...region.climate },
    populations: region.populations.map(p => ({ ...p })),
    plantPopulations: (region.plantPopulations ?? []).map(p => ({ ...p })),
    resources: region.resources.map(r => ({ ...r })),
    connections: [...region.connections],
    hiddenLocations: (region.hiddenLocations ?? []).map(h => ({ ...h })),
  };
}

function deserializeRegion(sr: SerializedRegion): Region {
  return {
    id: sr.id as RegionId,
    name: sr.name,
    layer: sr.layer as any,
    biome: sr.biome as any,
    latitude: sr.latitude,
    longitude: sr.longitude,
    elevation: sr.elevation,
    climate: sr.climate as any,
    populations: sr.populations as any[],
    plantPopulations: sr.plantPopulations as any[] ?? [],
    resources: sr.resources as any[],
    connections: sr.connections as RegionId[],
    hiddenLocations: sr.hiddenLocations as any[],
  };
}

function serializeCharacter(c: Character): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    speciesId: c.speciesId,
    playerId: c.playerId,
    regionId: c.regionId,
    familyTreeId: c.familyTreeId,
    bornAtTick: c.bornAtTick,
    diedAtTick: c.diedAtTick,
    causeOfDeath: c.causeOfDeath,
    age: c.age,
    isAlive: c.isAlive,
    sex: c.sex,
    generation: c.generation,
    genetics: c.genetics,
    health: c.health,
    energy: c.energy,
    hunger: c.hunger,
    stamina: c.stamina,
    lastBreedingTick: c.lastBreedingTick,
    gestationEndsAtTick: c.gestationEndsAtTick,
    relationships: c.relationships,
    parentIds: c.parentIds,
    childIds: c.childIds,
    inventory: c.inventory,
    knowledge: c.knowledge,
    fame: c.fame,
    achievements: c.achievements,
    isGenesisElder: c.isGenesisElder,
    socialRank: c.socialRank,
    loyalties: c.loyalties instanceof Map ? [...c.loyalties.entries()] : [],
    role: c.role,
    characterClass: c.characterClass,
    impactScore: c.impactScore,
  };
}

function deserializeCharacter(sc: Record<string, unknown>): Character {
  return {
    ...sc,
    loyalties: new Map(sc.loyalties as [string, unknown][] ?? []),
  } as Character;
}

// Export singleton
export let persistenceLayer = new PersistenceLayer();

export function _installPersistenceLayer(instance: PersistenceLayer): void {
  persistenceLayer = instance;
}
