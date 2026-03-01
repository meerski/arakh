// ============================================================
// REST API (Fastify)
// ============================================================

import Fastify from 'fastify';
import type { SimulationLoop } from '../simulation/loop.js';
import type { GameTime } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';
import { cardCollection } from '../cards/collection.js';
import { playerManager } from '../game/player.js';
import { fameTracker } from '../game/fame.js';
import { lineageManager } from '../game/lineage.js';
import { getOwnerDashboard, updateDynastyScore } from '../dashboard/owner.js';
import { getWorldStats, getSpeciesRankings } from '../dashboard/stats.js';
import { newsBroadcast } from '../broadcast/news.js';
import { liveFeed } from '../dashboard/feed.js';
import { getHealthResponse, getMetricsResponse } from './health.js';

export function createAPI(simulation: SimulationLoop, options?: { dbEnabled?: boolean }) {
  const app = Fastify({ logger: true });
  const dbEnabled = options?.dbEnabled ?? false;

  // Health check (lightweight, for load balancers)
  app.get('/health', async () => {
    return getHealthResponse(simulation);
  });

  // Metrics (detailed, for dashboards/monitoring)
  app.get('/metrics', async () => {
    return getMetricsResponse(simulation, dbEnabled);
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

  // Owner registration — returns owner + player IDs for WebSocket connection
  app.post<{ Body: { displayName: string } }>('/owner', async (request) => {
    const owner = playerManager.createOwner(request.body.displayName);
    const player = playerManager.createPlayer(owner.id);
    return {
      ownerId: owner.id,
      playerId: player.id,
      displayName: owner.displayName,
      instructions: 'Connect to WebSocket with {"type":"action","payload":{"playerId":"<your-player-id>"}}, then send actions.',
    };
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

  // Highlight stories
  app.get('/news/highlights', async () => {
    return newsBroadcast.getHighlights(10);
  });

  // Daily recaps
  app.get('/news/recaps', async () => {
    return newsBroadcast.getRecaps(7);
  });

  // Live feed for a player
  app.get<{ Params: { playerId: string } }>('/feed/:playerId', async (request) => {
    return liveFeed.getForPlayer(request.params.playerId, 50);
  });

  // Global live feed
  app.get('/feed', async () => {
    return liveFeed.getAll(50);
  });

  // Admin: list regions (first 5 with names)
  app.get('/admin/regions', async () => {
    const world = simulation.getWorld();
    const result: { id: string; name: string }[] = [];
    for (const [id, region] of world.regions) {
      result.push({ id, name: region.name });
      if (result.length >= 10) break;
    }
    return { total: world.regions.size, sample: result };
  });

  // Admin: teleport a character to a region (for testing)
  app.post<{ Body: { characterId: string; regionId: string } }>('/admin/teleport', async (request) => {
    const { characterId, regionId } = request.body;
    const character = characterRegistry.get(characterId);
    if (!character) return { error: 'Character not found', characterId };
    const world = simulation.getWorld();
    const region = world.regions.get(regionId);
    characterRegistry.moveRegion(character.id, regionId);
    return {
      success: true,
      name: character.name,
      region: region?.name ?? 'unknown',
      regionFound: !!region,
      worldRegionCount: world.regions.size,
      requestedRegionId: regionId,
    };
  });

  // Admin: list all characters in a region
  app.get<{ Params: { regionId: string } }>('/admin/region/:regionId/characters', async (request) => {
    const chars = characterRegistry.getByRegion(request.params.regionId);
    return chars.map(c => ({ id: c.id, name: c.name, speciesId: c.speciesId, isAlive: c.isAlive }));
  });

  return app;
}
