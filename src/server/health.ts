// ============================================================
// Health & Metrics Endpoints
// ============================================================
// /health — lightweight liveness check
// /metrics — detailed operational metrics

import type { SimulationLoop } from '../simulation/loop.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';
import { wal } from '../data/wal.js';

const startTime = Date.now();

/** Track tick performance (ring buffer of last 100 tick durations) */
class TickMetrics {
  private durations: number[] = [];
  private maxSamples = 100;
  private lastTickAt = 0;
  private tickCount = 0;
  private consecutiveErrors = 0;
  private lastError: string | null = null;

  recordTick(durationMs: number): void {
    this.durations.push(durationMs);
    if (this.durations.length > this.maxSamples) {
      this.durations.shift();
    }
    this.lastTickAt = Date.now();
    this.tickCount++;
    this.consecutiveErrors = 0;
  }

  recordError(message: string): void {
    this.consecutiveErrors++;
    this.lastError = message;
  }

  getAverageDuration(): number {
    if (this.durations.length === 0) return 0;
    return this.durations.reduce((a, b) => a + b, 0) / this.durations.length;
  }

  getMaxDuration(): number {
    if (this.durations.length === 0) return 0;
    return Math.max(...this.durations);
  }

  getLastTickAt(): number { return this.lastTickAt; }
  getTickCount(): number { return this.tickCount; }
  getConsecutiveErrors(): number { return this.consecutiveErrors; }
  getLastError(): string | null { return this.lastError; }
}

export const tickMetrics = new TickMetrics();

/** Build health response (lightweight, for load balancers) */
export function getHealthResponse(simulation: SimulationLoop) {
  const now = Date.now();
  const lastTick = tickMetrics.getLastTickAt();
  const tickStale = lastTick > 0 && (now - lastTick) > 10000; // 10s without a tick = unhealthy

  return {
    status: tickStale ? 'degraded' : 'ok',
    running: simulation.isRunning(),
    tick: simulation.getWorld().time.tick,
    uptimeMs: now - startTime,
    lastTickAgoMs: lastTick > 0 ? now - lastTick : null,
    consecutiveErrors: tickMetrics.getConsecutiveErrors(),
  };
}

/** Build metrics response (detailed, for dashboards/monitoring) */
export function getMetricsResponse(simulation: SimulationLoop, dbEnabled: boolean) {
  const mem = process.memoryUsage();
  const world = simulation.getWorld();

  return {
    server: {
      uptimeMs: Date.now() - startTime,
      memoryMB: {
        rss: Math.round(mem.rss / 1048576),
        heapUsed: Math.round(mem.heapUsed / 1048576),
        heapTotal: Math.round(mem.heapTotal / 1048576),
        external: Math.round(mem.external / 1048576),
      },
      nodeVersion: process.version,
    },
    simulation: {
      running: simulation.isRunning(),
      tick: world.time.tick,
      era: world.era.name,
      year: world.time.year,
      day: world.time.day,
      ticksProcessed: tickMetrics.getTickCount(),
      avgTickMs: Math.round(tickMetrics.getAverageDuration() * 100) / 100,
      maxTickMs: Math.round(tickMetrics.getMaxDuration() * 100) / 100,
      consecutiveErrors: tickMetrics.getConsecutiveErrors(),
      lastError: tickMetrics.getLastError(),
    },
    world: {
      regions: world.regions.size,
      livingCharacters: characterRegistry.livingCount,
      totalSpecies: speciesRegistry.getAll().length,
    },
    persistence: {
      dbEnabled,
      walEnabled: wal.isEnabled,
      walEntries: wal.size,
    },
  };
}
