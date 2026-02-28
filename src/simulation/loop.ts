// ============================================================
// Main Simulation Tick Loop — Always Running
// ============================================================

import type { World, TickResult, WorldEvent, CharacterId, GameTime } from '../types.js';
import { createGameTime } from './world.js';
import { tickWorldClimate } from './climate.js';
import {
  updatePopulations, regenerateResources, checkEcosystemHealth,
  checkMigration, generatePopulationPollution,
} from './ecosystem.js';
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
    const tick = this.world.time.tick + 1;
    const time = createGameTime(tick);
    this.world.time = time;

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

      // Track significant births/deaths from population changes
      for (const update of popUpdates) {
        if (update.delta > 0 && update.delta > update.oldCount * 0.1) {
          // Significant population boom
          discoveries.push(`${update.speciesId} population is booming in ${region.name}`);
        }
      }

      // Resource regeneration (pollution-aware)
      regenerateResources(region);

      // Population-generated pollution
      generatePopulationPollution(region, this.ecosystem);
    }

    // 3. Migration check (populations spill into connected regions)
    for (const region of regions) {
      const migrations = checkMigration(region, this.ecosystem, this.world.regions);
      for (const migration of migrations) {
        const species = this.ecosystem.foodWeb.length > 0 ? migration.speciesId : migration.speciesId;
        discoveries.push(`A group has migrated from ${region.name}`);
      }
    }

    // 4. Ecosystem health checks (extinctions, depletions, collapses)
    for (const region of regions) {
      const healthEvents = checkEcosystemHealth(region, tick);
      events.push(...healthEvents);
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

    // 7. Resource property decay (world chemistry evolves)
    if (tick % 100 === 0) {
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

    // 7d. Tesla Moments — check for rare breakthroughs (every 10 ticks)
    if (tick % 10 === 0) {
      for (const region of regions) {
        const moment = checkForTeslaMoment(region, tick);
        if (moment) {
          const tEvent = teslaMomentToEvent(moment);
          events.push(tEvent);
          discoveries.push(`TESLA MOMENT: ${moment.description}`);
        }
      }
    }

    // 7e. Speciation checks (every 500 ticks)
    if (tick % 500 === 0) {
      for (const region of regions) {
        for (const pop of region.populations) {
          if (pop.count < 5) continue;
          // Track isolation for populations without migration
          incrementIsolation(pop.speciesId, region.id);
          const result = checkSpeciation(pop.speciesId, region.id);
          if (result.shouldSpeciate) {
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

    // 7f. Era change detection (every 1000 ticks)
    if (tick % 1000 === 0) {
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

    // 8. Character lifecycle — age, hunger, energy, death checks
    for (const character of characterRegistry.getLiving()) {
      updateCharacterTick(character, tick);

      // Natural death checks
      if (character.health <= 0 && character.isAlive) {
        character.isAlive = false;
        character.diedAtTick = tick;
        if (!character.causeOfDeath) character.causeOfDeath = 'natural causes';
        deaths.push(character.id);
        fameTracker.finalizeCharacterFame(character, this.world.era.name);
      }

      // Relationship decay (every 100 ticks)
      if (tick % 100 === 0) {
        socialGraph.decayRelationships(character, 100);
      }

      // Fame for long survival (every 1000 ticks alive)
      if (tick % 1000 === 0 && character.isAlive) {
        character.fame += 1;
      }
    }

    // 9. Character actions, births, deaths handled by game layer (registered via onTick)

    return { tick, time, events, births, deaths, discoveries };
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
