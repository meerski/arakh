// ============================================================
// Main Simulation Tick Loop — Always Running
// ============================================================

import type { World, TickResult, WorldEvent, CharacterId, GameTime, ActionResultEntry } from '../types.js';
import { createGameTime, TICK_SLOW, TICK_EPOCH } from './world.js';
import { tickWorldClimate } from './climate.js';
import {
  updatePopulations, regenerateResources, checkEcosystemHealth,
  checkMigration, generatePopulationPollution,
} from './ecosystem.js';
import { speciesRegistry } from '../species/species.js';
import { rollForEvents, applyEventEffects } from './events.js';
import { worldRNG } from './random.js';
import { maybeSpawnNewSecret } from '../game/exploration.js';
import { resourceProperties } from '../game/resources.js';
import { characterRegistry } from '../species/registry.js';
import { updateCharacterTick } from '../species/character.js';
import { fameTracker } from '../game/fame.js';
import { socialGraph } from '../game/social.js';
import { checkForTeslaMoment, teslaMomentToEvent } from './tesla-moments.js';
import {
  radiationTracker, anomalyTracker, maybeSpawnArtifact,
  createRadiationFromEvent, createAnomalyFromEvent, anomalyEvent,
} from './artifacts.js';
import {
  updatePopulationGenetics, incrementIsolation, checkSpeciation,
} from '../species/evolution.js';
import { worldChronicle } from '../narrative/history.js';
import type { EcosystemState } from './ecosystem.js';
import { processExtinctionCascade } from './ecosystem.js';
import { updatePlantTick, spreadPlants } from './plants.js';
import { corpseRegistry } from './corpses.js';
import { processIncidentalKills } from './incidental.js';
import { encounterRegistry } from '../game/encounters.js';
import { calculateRegionProfile, regionProfileRegistry } from './region-dynamics.js';
import { worldDrift } from '../security/world-drift.js';
import { decayKnowledge } from '../game/knowledge-decay.js';
import { roleRegistry } from '../game/roles.js';
import { catastropheEngine } from './catastrophes.js';
import { domesticationRegistry } from '../game/domestication.js';
import { intelligenceRegistry } from '../game/intelligence.js';
import { trustLedger } from '../game/trust.js';
import { heartlandTracker } from '../game/heartland.js';
import { espionageRegistry } from '../game/espionage.js';
import { actionQueue } from '../game/action-queue.js';
import { processAction, buildActionContext } from '../game/actions.js';
import { filterPerception } from '../security/perception.js';
import { tickMetrics } from '../server/health.js';
import { colonyRegistry, tickColonyHealth } from '../species/colony.js';
import { tryEmergeStandout, pruneDeadStandouts } from '../species/standout.js';
import { tickQueenMechanics } from '../species/queen.js';

export interface SimulationConfig {
  tickIntervalMs: number;      // Real milliseconds between ticks (default: 1000)
  paused: boolean;
}

export class SimulationLoop {
  private world: World;
  private ecosystem: EcosystemState;
  private config: SimulationConfig;
  private timer: ReturnType<typeof setInterval> | null = null;
  private tickHandlers: TickHandler[] = [];
  private running = false;

  constructor(world: World, ecosystem: EcosystemState, config?: Partial<SimulationConfig>) {
    this.world = world;
    this.ecosystem = ecosystem;
    this.config = {
      tickIntervalMs: config?.tickIntervalMs ?? 1000,
      paused: config?.paused ?? false,
    };
  }

  /** Register a handler called after each tick */
  onTick(handler: TickHandler): void {
    this.tickHandlers.push(handler);
  }

  /** Start the simulation loop */
  start(): void {
    if (this.running) return;
    this.running = true;
    console.log(`[Simulation] Starting tick loop (${this.config.tickIntervalMs}ms interval)`);

    this.timer = setInterval(() => {
      if (!this.config.paused) {
        const result = this.tick();
        for (const handler of this.tickHandlers) {
          handler(result);
        }
      }
    }, this.config.tickIntervalMs);
  }

  /** Stop the simulation loop */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log('[Simulation] Stopped');
  }

  /** Pause/unpause */
  setPaused(paused: boolean): void {
    this.config.paused = paused;
    console.log(`[Simulation] ${paused ? 'Paused' : 'Resumed'}`);
  }

  /** Execute a single tick */
  tick(): TickResult {
    const tickStart = Date.now();
    const tick = this.world.time.tick + 1;
    const time = createGameTime(tick);
    this.world.time = time;

    try {
    return this.tickInner(tick, time, tickStart);
    } catch (err) {
      // Never crash from a single tick failure
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Simulation] Tick ${tick} FAILED: ${message}`);
      if (err instanceof Error && err.stack) {
        console.error(err.stack);
      }
      tickMetrics.recordError(message);
      return {
        tick,
        time,
        events: [],
        births: [],
        deaths: [],
        discoveries: [`TICK ERROR: ${message}`],
        actionResults: [],
      };
    }
  }

  private tickInner(tick: number, time: GameTime, tickStart: number): TickResult {
    // Inject entropy from tick timing
    worldRNG.injectEntropy(Date.now() ^ tick);

    const events: WorldEvent[] = [];
    const births: CharacterId[] = [];
    const deaths: CharacterId[] = [];
    const discoveries: string[] = [];

    const regions = Array.from(this.world.regions.values());

    // 1. Full climate tick (weather, fronts, pollution, tides, disasters, volcanics, droughts)
    const climateEvents = tickWorldClimate(this.world.regions, time);
    events.push(...climateEvents);

    // 2. Update populations (ecosystem dynamics with species-appropriate rates)
    for (const region of regions) {
      // Population dynamics
      const popUpdates = updatePopulations(region, this.ecosystem);

      // Track significant births/deaths from population changes (only truly dramatic shifts)
      for (const update of popUpdates) {
        if (update.delta > 0 && update.delta > update.oldCount * 0.5 && update.oldCount >= 20) {
          // Dramatic population boom (50%+ increase with meaningful base)
          const species = speciesRegistry.get(update.speciesId);
          discoveries.push(`${species?.commonName ?? update.speciesId} population is booming in ${region.name}`);
        }
      }

      // Resource regeneration (pollution-aware, drift-modified)
      const renewMod = worldDrift.getCoefficient('resource_renew', tick);
      regenerateResources(region, renewMod);

      // Population-generated pollution
      generatePopulationPollution(region, this.ecosystem);
    }

    // 2b. Plant tick — logistic growth per region
    for (const region of regions) {
      updatePlantTick(region);
    }

    // 2c. Plant spreading (every Epoch tick — ~12.5 in-game days)
    if (tick % TICK_EPOCH === 0) {
      for (const region of regions) {
        spreadPlants(region, this.world.regions);
      }
    }

    // 2d. Incidental kills (size-based passive deaths)
    for (const region of regions) {
      const incidentalResults = processIncidentalKills(region, tick);
      for (const result of incidentalResults) {
        if (result.killed >= 50) {
          // Only noteworthy mass trampling events
          const largeSpecies = speciesRegistry.get(result.largeSpeciesId);
          const smallSpecies = speciesRegistry.get(result.smallSpeciesId);
          discoveries.push(`${largeSpecies?.commonName ?? 'Large species'} trampled ${result.killed} ${smallSpecies?.commonName ?? 'small creatures'} in ${region.name}`);
        }
      }
    }

    // 2e. Corpse decay
    corpseRegistry.tickCorpseDecay(tick);

    // 2f. Expire pending encounters
    encounterRegistry.expireEncounters(tick);

    // 3. Migration check (populations spill into connected regions)
    let migrationCount = 0;
    for (const region of regions) {
      const migrations = checkMigration(region, this.ecosystem, this.world.regions);
      migrationCount += migrations.length;
    }
    // Only log migration as discovery when it's notably high
    if (migrationCount > regions.length * 0.1) {
      discoveries.push(`${migrationCount} migration events across the world`);
    }

    // 4. Ecosystem health checks (extinctions, depletions, collapses)
    for (const region of regions) {
      const healthEvents = checkEcosystemHealth(region, tick);
      // Wire extinction cascades
      for (const event of healthEvents) {
        if (event.type === 'extinction' && event.level === 'global') {
          const extinctSpeciesId = event.effects[0]?.speciesId;
          if (extinctSpeciesId) {
            const cascadeEvents = processExtinctionCascade(extinctSpeciesId, this.ecosystem, tick);
            events.push(...cascadeEvents);
          }
        }
      }
      events.push(...healthEvents);
    }

    // 4b. Region profile updates (every Slow*2 ticks — ~1 in-game day)
    if (tick % (TICK_SLOW * 2) === 0) {
      for (const region of regions) {
        const totalPop = region.populations.reduce((s, p) => s + p.count, 0);
        regionProfileRegistry.recordPopulation(region.id, totalPop);
        calculateRegionProfile(region, this.ecosystem, tick);
      }
    }

    // 4c. Catastrophe stress checks (every Slow tick)
    if (tick % TICK_SLOW === 0) {
      for (const region of regions) {
        const stress = catastropheEngine.calculateStress(region, this.ecosystem);
        const catastrophe = catastropheEngine.checkCatastropheTriggers(region, stress, tick);
        if (catastrophe) {
          events.push({
            id: crypto.randomUUID(),
            type: 'catastrophe',
            level: 'regional',
            regionIds: catastrophe.regionIds,
            description: `CATASTROPHE: ${catastrophe.type.replace(/_/g, ' ')}! ${catastrophe.cause}.`,
            tick,
            effects: [{ type: 'catastrophe_start', magnitude: catastrophe.severity }],
            resolved: false,
          });
          worldDrift.perturbFromEvent(catastrophe.type, catastrophe.severity);
        }
      }
    }

    // 4d. Tick active catastrophes every tick
    for (const catastrophe of catastropheEngine.getAllActive()) {
      const catEvents = catastropheEngine.tickCatastrophe(catastrophe, this.world.regions, tick);
      events.push(...catEvents);
    }

    // 5. Roll for world events
    const worldEvents = rollForEvents(regions, time);
    for (const event of worldEvents) {
      applyEventEffects(event, this.world.regions);
      events.push(event);
    }

    // 6. Spawn new hidden secrets occasionally
    for (const region of regions) {
      const newSecret = maybeSpawnNewSecret(region, tick);
      if (newSecret) {
        discoveries.push(`A new secret has formed in ${region.name}`);
      }
    }

    // 7. Resource property decay (world chemistry evolves — every Epoch/3 ticks)
    if (tick % 200 === 0) {
      resourceProperties.resourceDecay(tick);
    }

    // 7b. Artifacts, radiation, anomalies from cosmic/meteor events
    for (const event of events) {
      if (event.type === 'meteor' || event.type === 'cosmic') {
        for (const rid of event.regionIds) {
          const region = this.world.regions.get(rid);
          if (!region) continue;
          // Meteors may spawn artifacts and radiation
          const artifact = maybeSpawnArtifact(region, tick);
          if (artifact) {
            discoveries.push(`An ancient artifact has appeared in ${region.name}: ${artifact.name}`);
          }
          if (event.type === 'cosmic') {
            createRadiationFromEvent(rid, worldRNG.float(0.3, 0.8), tick);
          }
        }
      }
      if (event.type === 'anomaly') {
        for (const rid of event.regionIds) {
          const anomaly = createAnomalyFromEvent(rid, tick);
          events.push(anomalyEvent(anomaly, tick));
        }
      }
    }

    // 7c. Tick radiation decay and anomaly expiration
    radiationTracker.tick();
    anomalyTracker.tick(tick);

    // 7d. Tesla Moments — check for rare breakthroughs (every Slow tick)
    if (tick % TICK_SLOW === 0) {
      for (const region of regions) {
        const moment = checkForTeslaMoment(region, tick);
        if (moment) {
          const tEvent = teslaMomentToEvent(moment);
          events.push(tEvent);
          discoveries.push(`TESLA MOMENT: ${moment.description}`);
        }
      }
    }

    // 7e. Speciation checks (every Epoch tick)
    if (tick % TICK_EPOCH === 0) {
      for (const region of regions) {
        for (const pop of region.populations) {
          if (pop.count < 5) continue;
          // Track isolation for populations without migration
          incrementIsolation(pop.speciesId, region.id);
          const result = checkSpeciation(pop.speciesId, region.id);
          const evolutionPressure = catastropheEngine.getEvolutionPressure(region.id);
          // Apply evolution pressure — higher catastrophe severity means more speciation
          if (result.shouldSpeciate || (!result.shouldSpeciate && evolutionPressure > 2 && worldRNG.chance(0.1 * (evolutionPressure - 1)))) {
            const specEvent: WorldEvent = {
              id: crypto.randomUUID(),
              type: 'speciation',
              level: 'species',
              regionIds: [region.id],
              description: `A population in ${region.name} has diverged enough to form a new species!`,
              tick,
              effects: [{ type: 'speciation', speciesId: pop.speciesId, magnitude: 1.0 }],
              resolved: true,
            };
            events.push(specEvent);
            discoveries.push(`Speciation event in ${region.name}!`);
          }
        }
      }
    }

    // 7f. Era change detection (every 3 Epoch ticks — ~37 in-game days)
    if (tick % (TICK_EPOCH * 3) === 0) {
      const populations = new Map<string, number>();
      for (const region of regions) {
        for (const pop of region.populations) {
          populations.set(pop.speciesId, (populations.get(pop.speciesId) ?? 0) + pop.count);
        }
      }
      const newEra = worldChronicle.checkForEraChange(populations);
      if (newEra) {
        this.world.era = newEra;
        const eraEvent: WorldEvent = {
          id: crypto.randomUUID(),
          type: 'speciation', // Closest match — era shifts are species-level
          level: 'global',
          regionIds: [],
          description: `A new era begins: ${newEra.name}`,
          tick,
          effects: [{ type: 'era_change', magnitude: 1.0 }],
          resolved: true,
        };
        events.push(eraEvent);
        discoveries.push(`ERA CHANGE: ${newEra.name}`);
      }
    }

    // 7g. Record significant events in world chronicle
    for (const event of events) {
      if (event.level !== 'personal') {
        worldChronicle.recordEvent(event, time.year);
      }
    }

    // 7h. Role proficiency tick (every Slow tick)
    if (tick % TICK_SLOW === 0) {
      roleRegistry.tickRoleProficiency(tick);
    }

    // 8. Character lifecycle — age, hunger, energy, death checks
    for (const character of characterRegistry.getLiving()) {
      updateCharacterTick(character, tick);

      // Natural death checks
      if (character.health <= 0 && character.isAlive) {
        characterRegistry.markDead(character.id, tick, character.causeOfDeath ?? 'natural causes');
        deaths.push(character.id);
        fameTracker.finalizeCharacterFame(character, this.world.era.name);
      }

      // Relationship decay (every 200 ticks — ~4 in-game days)
      if (tick % 200 === 0) {
        socialGraph.decayRelationships(character, 100);
      }

      // Fame for long survival (every 3 Epoch ticks alive)
      if (tick % (TICK_EPOCH * 3) === 0 && character.isAlive) {
        character.fame += 1;
      }
    }

    // 8b. Knowledge decay (every Epoch tick)
    if (tick % TICK_EPOCH === 0) {
      for (const character of characterRegistry.getLiving()) {
        decayKnowledge(character, tick);
      }
    }

    // 8c. Domestication tick (every Slow*2 ticks)
    if (tick % (TICK_SLOW * 2) === 0) {
      const domEvents = domesticationRegistry.tickDomestication(tick);
      events.push(...domEvents);
    }

    // 8d. Espionage tick — progress all active missions
    const espionageResults = espionageRegistry.tickMissions(tick);
    for (const result of espionageResults) {
      if (!result.success && result.narrative.includes('detected')) {
        events.push({
          id: crypto.randomUUID(),
          type: 'espionage',
          level: 'family',
          regionIds: [],
          description: result.narrative,
          tick,
          effects: [{ type: 'espionage_detected', magnitude: 0.5 }],
          resolved: true,
        });
      }
    }

    // 8e. Heartland recalculation (every Slow*2 ticks)
    if (tick % (TICK_SLOW * 2) === 0) {
      heartlandTracker.recalculateAll(tick);
    }

    // 8f. Trust decay (every 200 ticks)
    if (tick % 200 === 0) {
      trustLedger.tickTrustDecay(tick);
    }

    // 8g. Intel reliability decay (every Epoch tick)
    if (tick % TICK_EPOCH === 0) {
      intelligenceRegistry.decayAll(tick);
    }

    // 8h. Colony tick — health bars, queen mechanics, standout emergence (every Slow tick)
    if (tick % TICK_SLOW === 0) {
      for (const colony of colonyRegistry.getLiving()) {
        // Queen mechanics
        const queenEvent = tickQueenMechanics(colony, tick);
        if (queenEvent) {
          discoveries.push(queenEvent.narrative);
        }

        // Health bar updates
        const healthNarratives = tickColonyHealth(colony);
        for (const n of healthNarratives) {
          discoveries.push(n);
        }

        // Prune dead standouts
        pruneDeadStandouts(colony);

        // Standout emergence
        const standout = tryEmergeStandout(colony, tick);
        if (standout) {
          discoveries.push(standout.narrative);
        }

        // Colony death
        if (!colony.isAlive) {
          deaths.push(colony.id as CharacterId);
        }
      }
    }

    // 9. Process queued actions deterministically
    const actionResults: ActionResultEntry[] = [];
    const queued = actionQueue.drain();
    for (const item of queued) {
      const actCtx = buildActionContext(
        item.characterId, this.world.regions, tick,
        time.isDay ? 'day' : 'night', time.season, 'clear',
      );
      if (!actCtx) continue;
      const result = processAction(item.action, actCtx);
      actionResults.push({
        playerId: item.playerId,
        characterId: item.characterId,
        action: item.action,
        result,
      });
      // Deliver filtered result back to the connection
      item.deliver(result);
    }

    // Deduplicate events by ID (same event can be generated from multiple regions)
    const seenEventIds = new Set<string>();
    const dedupedEvents = events.filter(e => {
      if (seenEventIds.has(e.id)) return false;
      seenEventIds.add(e.id);
      return true;
    });

    tickMetrics.recordTick(Date.now() - tickStart);
    return { tick, time, events: dedupedEvents, births, deaths, discoveries, actionResults };
  }

  getWorld(): World {
    return this.world;
  }

  getEcosystem(): EcosystemState {
    return this.ecosystem;
  }

  isRunning(): boolean {
    return this.running;
  }
}

export type TickHandler = (result: TickResult) => void;
