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
import { seedBirds } from './data/taxonomy/birds.js';
import { seedFish } from './data/taxonomy/fish.js';
import { seedInvertebrates } from './data/taxonomy/invertebrates.js';
import { seedReptiles } from './data/taxonomy/reptiles.js';
import { seedMammals } from './data/taxonomy/mammals.js';
import { seedRegions } from './data/earth/seed.js';
import { broadcastPerceptionTicks } from './server/perception-tick.js';
import { isBiomeSuitable, getBiomeCapacityMultiplier } from './simulation/biome.js';
import { tickPolitics } from './game/politics.js';
import { tickEvolution } from './game/advancement.js';
import { characterRegistry } from './species/registry.js';
import type { World, Region, SpeciesId } from './types.js';
import type { EcosystemState } from './simulation/ecosystem.js';

async function main() {
  console.log('=== ARAKH — Persistent Earth Simulation ===');
  console.log('Initializing world...');

  // 1. Create world
  const world = createWorld('Earth');

  // 2. Seed taxonomy and species
  seedTaxonomy();
  seedBirds();
  seedFish();
  seedInvertebrates();
  seedReptiles();
  seedMammals();
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

    // Run politics tick (every 10 ticks to avoid performance impact)
    if (result.tick % 10 === 0) {
      const allLiving = characterRegistry.getLiving();
      const politicalEvents = tickPolitics(allLiving, result.tick);
      for (const pe of politicalEvents) {
        liveFeed.addBroadcast(pe.narrative, result.tick);
      }
    }

    // Run evolution tick (handled internally — checks every 500 ticks)
    if (result.tick % 500 === 0) {
      const allLiving = characterRegistry.getLiving();
      // Group by species+region
      const groups = new Map<string, { speciesId: string; regionId: string; chars: typeof allLiving }>();
      for (const c of allLiving) {
        const key = `${c.speciesId}:${c.regionId}`;
        const g = groups.get(key);
        if (g) g.chars.push(c);
        else groups.set(key, { speciesId: c.speciesId, regionId: c.regionId, chars: [c] });
      }
      for (const { speciesId, regionId, chars } of groups.values()) {
        const evoNarrative = tickEvolution(speciesId, regionId, chars, result.tick);
        if (evoNarrative) {
          liveFeed.addBroadcast(evoNarrative, result.tick);
        }
      }
    }

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
  // Carnivores/omnivores prey on appropriately-sized species in shared habitats.
  // Prey count scales with predator size tier: apex predators get more prey options.
  for (const pred of allSpecies) {
    if (pred.traits.diet !== 'carnivore' && pred.traits.diet !== 'omnivore') continue;

    // Filter feeders don't hunt individual prey
    if (pred.traits.diet === 'filter_feeder' as string) continue;

    const potentialPrey = allSpecies.filter(s => {
      if (s.id === pred.id) return false;
      // Must share a habitat layer
      if (!s.traits.habitat.some(h => pred.traits.habitat.includes(h))) return false;
      // Predator can eat things up to 1.2x its own size (pack hunters) down to 1/50 its size
      if (s.traits.size > pred.traits.size * 1.2) return false;
      if (s.traits.size < pred.traits.size * 0.02 && s.traits.size > 0) return false;
      // Carnivores eat everything smaller; omnivores prefer herbivores/smaller omnivores
      if (pred.traits.diet === 'omnivore' && s.traits.diet === 'carnivore') return false;
      return true;
    });

    // Sort prey by size proximity (predators prefer appropriately-sized prey)
    const idealPreySize = pred.traits.size * 0.4;
    potentialPrey.sort((a, b) =>
      Math.abs(a.traits.size - idealPreySize) - Math.abs(b.traits.size - idealPreySize)
    );

    // Prey count scales: small predators 3-5, medium 5-8, apex 8-12
    const maxPrey = pred.traits.diet === 'carnivore'
      ? Math.min(12, Math.max(3, Math.floor(pred.traits.size / 10) + 3))
      : Math.min(6, Math.max(2, Math.floor(pred.traits.size / 15) + 2));

    for (const p of potentialPrey.slice(0, maxPrey)) {
      const sizeRatio = pred.traits.size / Math.max(1, p.traits.size);
      const efficiency = pred.traits.diet === 'carnivore'
        ? Math.min(0.2, 0.05 + 0.03 * Math.min(3, sizeRatio))
        : 0.03 + 0.02 * Math.min(2, sizeRatio);
      addFoodWebRelation(ecosystem, pred.id, p.id, Math.min(0.2, efficiency));
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

// isBiomeSuitable and getBiomeCapacityMultiplier imported from ./simulation/biome.js

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
