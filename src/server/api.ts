// ============================================================
// REST API (Fastify)
// ============================================================

import Fastify from 'fastify';
import type { SimulationLoop } from '../simulation/loop.js';
import type { GameTime } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { cardCollection } from '../cards/collection.js';
import { playerManager } from '../game/player.js';
import { fameTracker } from '../game/fame.js';
import { lineageManager } from '../game/lineage.js';
import { getOwnerDashboard, updateDynastyScore } from '../dashboard/owner.js';
import { getWorldStats, getSpeciesRankings } from '../dashboard/stats.js';
import { newsBroadcast } from '../broadcast/news.js';
import { liveFeed } from '../dashboard/feed.js';

export function createAPI(simulation: SimulationLoop) {
  const app = Fastify({ logger: true });

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      running: simulation.isRunning(),
      tick: simulation.getWorld().time.tick,
    };
  });

  // World state (public, high-level)
  app.get('/world', async () => {
    const world = simulation.getWorld();
    return {
      name: world.name,
      time: world.time,
      era: world.era,
      regionCount: world.regions.size,
      startedAt: world.startedAt,
    };
  });

  // Species list
  app.get('/species', async () => {
    return speciesRegistry.getAll().map(s => ({
      id: s.id,
      commonName: s.commonName,
      scientificName: s.scientificName,
      tier: s.tier,
      status: s.status,
      totalPopulation: s.totalPopulation,
    }));
  });

  // Species detail
  app.get<{ Params: { id: string } }>('/species/:id', async (request) => {
    const species = speciesRegistry.get(request.params.id);
    if (!species) return { error: 'Species not found' };
    return {
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      taxonomy: species.taxonomy,
      tier: species.tier,
      status: species.status,
      totalPopulation: species.totalPopulation,
      // Traits are NOT exposed — agents discover through experimentation
    };
  });

  // Cards by owner
  app.get<{ Params: { ownerId: string } }>('/cards/:ownerId', async (request) => {
    return cardCollection.getByOwner(request.params.ownerId);
  });

  // Hall of fame
  app.get('/fame', async () => {
    return fameTracker.getTopFamous(20);
  });

  // Player info
  app.get<{ Params: { id: string } }>('/player/:id', async (request) => {
    const player = playerManager.getPlayer(request.params.id);
    if (!player) return { error: 'Player not found' };
    return {
      id: player.id,
      ownerId: player.ownerId,
      isConnected: player.isConnected,
      currentCharacterId: player.currentCharacterId,
    };
  });

  // Owner registration
  app.post<{ Body: { displayName: string } }>('/owner', async (request) => {
    const owner = playerManager.createOwner(request.body.displayName);
    const player = playerManager.createPlayer(owner.id);
    return { owner, player };
  });

  // Dynasty (family trees for an owner)
  app.get<{ Params: { ownerId: string } }>('/dynasty/:ownerId', async (request) => {
    return lineageManager.getTreesByOwner(request.params.ownerId);
  });

  // Owner dashboard (consolidated view)
  app.get<{ Params: { ownerId: string } }>('/dashboard/:ownerId', async (request) => {
    const dashboard = getOwnerDashboard(request.params.ownerId);
    if (!dashboard) return { error: 'Owner not found' };
    updateDynastyScore(request.params.ownerId);
    return dashboard;
  });

  // World stats
  app.get('/stats', async () => {
    return {
      world: getWorldStats(),
      rankings: getSpeciesRankings(),
    };
  });

  // News broadcast
  app.get('/news', async () => {
    return newsBroadcast.getLatest(50);
  });

  // Breaking news only
  app.get('/news/breaking', async () => {
    return newsBroadcast.getBreaking(10);
  });

  // Live feed for a player
  app.get<{ Params: { playerId: string } }>('/feed/:playerId', async (request) => {
    return liveFeed.getForPlayer(request.params.playerId, 50);
  });

  // Global live feed
  app.get('/feed', async () => {
    return liveFeed.getAll(50);
  });

  return app;
}
