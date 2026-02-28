// ============================================================
// Arakh — Persistent Earth Simulation for AI Agents
// ============================================================

import { createWorld } from './simulation/world.js';
import { SimulationLoop } from './simulation/loop.js';
import { createEcosystemState, addFoodWebRelation } from './simulation/ecosystem.js';
import { createAPI } from './server/api.js';
import { GameWebSocket } from './server/websocket.js';
import { SessionManager } from './server/session.js';
import { newsBroadcast } from './broadcast/news.js';
import { liveFeed } from './dashboard/feed.js';
import { speciesRegistry } from './species/species.js';
import { initializePopulation } from './species/population.js';
import { generateHiddenLocations } from './game/exploration.js';
import { seedTaxonomy } from './data/taxonomy/seed.js';
import { seedRegions } from './data/earth/seed.js';
import { broadcastPerceptionTicks } from './server/perception-tick.js';
import type { World, Region, SpeciesId } from './types.js';
import type { EcosystemState } from './simulation/ecosystem.js';

async function main() {
  console.log('=== ARAKH — Persistent Earth Simulation ===');
  console.log('Initializing world...');

  // 1. Create world
  const world = createWorld('Earth');

  // 2. Seed taxonomy and species
  seedTaxonomy();
  const speciesCount = speciesRegistry.getAll().length;
  console.log(`Registered ${speciesCount} species`);

  // 3. Seed regions
  seedRegions(world);
  console.log(`Created ${world.regions.size} regions`);

  // 4. Generate hidden locations for each region
  let totalSecrets = 0;
  for (const region of world.regions.values()) {
    const locations = generateHiddenLocations(region);
    region.hiddenLocations = locations;
    totalSecrets += locations.length;
  }
  console.log(`Generated ${totalSecrets} hidden locations`);

  // 5. Create ecosystem with balanced food web
  const ecosystem = createEcosystemState();
  initializeBalancedEcosystem(world, ecosystem);

  // 6. Start simulation
  const simulation = new SimulationLoop(world, ecosystem, {
    tickIntervalMs: 1000,
  });

  // 7. Start REST API
  const api = createAPI(simulation);
  const sessions = new SessionManager();

  const port = parseInt(process.env.PORT ?? '3000');
  const host = process.env.HOST ?? '0.0.0.0';

  const address = await api.listen({ port, host });
  console.log(`REST API listening at ${address}`);

  // 8. Start WebSocket
  const rawServer = api.server;
  const gameWs = new GameWebSocket(rawServer, sessions);
  console.log('WebSocket server ready');

  // Register tick handler — broadcasts, world state sync, perception ticks
  simulation.onTick((result) => {
    const w = simulation.getWorld();
    const time = w.time;
    const timeOfDay = time.isDay ? (time.hour < 10 ? 'morning' : time.hour < 14 ? 'noon' : 'afternoon') : (time.hour < 6 ? 'night' : 'dusk');
    const weather = w.regions.values().next().value?.climate ? 'clear' : 'clear';

    // Sync world state to WebSocket handler
    gameWs.updateWorldState(w.regions, result.tick, timeOfDay, time.season, weather);

    // Broadcast perception data to connected agents
    broadcastPerceptionTicks(
      sessions,
      (playerId, message) => gameWs.sendToPlayer(playerId, message),
      w.regions,
      result.tick,
      timeOfDay,
      time.season,
      weather,
    );

    // News broadcast + live feed
    const broadcasts = newsBroadcast.processTick(result);
    for (const b of broadcasts) {
      liveFeed.addBroadcast(b.text, result.tick);
    }
    for (const event of result.events) {
      liveFeed.addEvent(event);
    }

    // Broadcast breaking events to all connected agents
    for (const event of result.events) {
      if (event.level !== 'personal') {
        gameWs.broadcast({
          type: 'event',
          payload: event,
        });
      }
    }
  });

  simulation.start();
  console.log('Simulation started (1 tick/second)');

  // Count populations
  let totalPop = 0;
  for (const region of world.regions.values()) {
    for (const pop of region.populations) {
      totalPop += pop.count;
    }
  }

  console.log('\n=== Arakh is alive ===');
  console.log(`World: ${world.name}`);
  console.log(`Species: ${speciesCount}`);
  console.log(`Regions: ${world.regions.size}`);
  console.log(`Hidden locations: ${totalSecrets}`);
  console.log(`Total population: ${totalPop.toLocaleString()}`);
  console.log(`Era: ${world.era.name}`);
  console.log('\nThe simulation runs. The world awaits its agents.\n');

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down...');
    simulation.stop();
    api.close().then(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

/** Initialize a balanced starting ecosystem where all species coexist in equilibrium */
function initializeBalancedEcosystem(world: World, ecosystem: EcosystemState): void {
  const allSpecies = speciesRegistry.getAll();
  const regions = Array.from(world.regions.values());

  if (regions.length === 0 || allSpecies.length === 0) return;

  // --- 1. Distribute species across biome-appropriate regions ---
  for (const species of allSpecies) {
    const suitableRegions = regions.filter(r =>
      species.traits.habitat.includes(r.layer) && isBiomeSuitable(species, r)
    );

    if (suitableRegions.length === 0) {
      // Fallback: just match by habitat layer
      const fallback = regions.filter(r => species.traits.habitat.includes(r.layer));
      if (fallback.length === 0) continue;
      const count = Math.min(fallback.length, 3);
      for (let i = 0; i < count; i++) {
        initializePopulation(fallback[i], species.id, 50);
      }
      continue;
    }

    // Distribute across 20-40% of suitable regions
    const count = Math.min(
      suitableRegions.length,
      Math.max(3, Math.floor(suitableRegions.length * 0.3))
    );

    for (let i = 0; i < count; i++) {
      const region = suitableRegions[i];
      // Population scaled by species tier and size
      // Small species have larger populations, large species smaller
      const sizeFactor = Math.max(0.2, 1 - species.traits.size / 150);
      const basePop = species.tier === 'flagship' ? 150 : 75;
      const pop = Math.round(basePop * sizeFactor);
      initializePopulation(region, species.id, pop);
    }
  }

  // --- 2. Build realistic food web ---
  const carnivores = allSpecies.filter(s => s.traits.diet === 'carnivore');
  const herbivores = allSpecies.filter(s => s.traits.diet === 'herbivore');
  const omnivores = allSpecies.filter(s => s.traits.diet === 'omnivore');

  // Carnivores prey on smaller species
  for (const pred of carnivores) {
    const prey = allSpecies.filter(s =>
      s.id !== pred.id &&
      s.traits.size < pred.traits.size * 1.2 && // Can't eat things much bigger
      s.traits.habitat.some(h => pred.traits.habitat.includes(h)) // Same habitat
    );
    for (const p of prey.slice(0, 5)) {
      const efficiency = 0.1 * (pred.traits.size / (p.traits.size + 1));
      addFoodWebRelation(ecosystem, pred.id, p.id, Math.min(0.2, efficiency));
    }
  }

  // Omnivores eat smaller herbivores
  for (const omni of omnivores) {
    const prey = herbivores.filter(h =>
      h.traits.size < omni.traits.size &&
      h.traits.habitat.some(hab => omni.traits.habitat.includes(hab))
    );
    for (const p of prey.slice(0, 3)) {
      addFoodWebRelation(ecosystem, omni.id, p.id, 0.05);
    }
  }

  // --- 3. Set carrying capacity per region ---
  for (const region of regions) {
    const resourceCapacity = region.resources.reduce((sum, r) => sum + r.maxQuantity, 0);
    // Carrying capacity based on resource richness and biome
    const biomeMultiplier = getBiomeCapacityMultiplier(region.biome);
    ecosystem.carryingCapacity.set(region.id, Math.round(resourceCapacity * biomeMultiplier));
  }

  console.log(`Initialized food web with ${ecosystem.foodWeb.length} predator-prey relationships`);
}

/** Check if a biome is suitable for a species based on its traits */
function isBiomeSuitable(species: ReturnType<typeof speciesRegistry.get> & {}, region: Region): boolean {
  const { biome } = region;
  const { aquatic, canFly } = species.traits;

  // Aquatic species need water biomes
  if (aquatic) {
    return ['coral_reef', 'open_ocean', 'deep_ocean', 'hydrothermal_vent', 'kelp_forest',
      'wetland', 'coastal', 'underground_river'].includes(biome);
  }

  // Flying species can go almost anywhere on surface
  if (canFly && region.layer === 'surface') return true;

  // Underground species
  if (region.layer === 'underground') {
    // Only small species fit underground
    return species.traits.size < 30;
  }

  // General surface suitability
  return region.layer === 'surface';
}

function getBiomeCapacityMultiplier(biome: string): number {
  const multipliers: Record<string, number> = {
    tropical_rainforest: 3.0,
    temperate_forest: 2.0,
    boreal_forest: 1.5,
    savanna: 2.0,
    grassland: 2.0,
    desert: 0.5,
    tundra: 0.3,
    mountain: 0.8,
    wetland: 2.5,
    coastal: 2.0,
    coral_reef: 3.0,
    open_ocean: 1.0,
    deep_ocean: 0.3,
    hydrothermal_vent: 0.5,
    kelp_forest: 2.0,
    cave_system: 0.5,
    underground_river: 0.8,
    subterranean_ecosystem: 0.6,
  };
  return multipliers[biome] ?? 1.0;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
