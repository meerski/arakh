import { describe, it, expect, vi, afterEach } from 'vitest';
import { SimulationLoop } from '../src/simulation/loop.js';
import { createWorld, createRegion } from '../src/simulation/world.js';
import { createEcosystemState } from '../src/simulation/ecosystem.js';
import type { TickResult } from '../src/types.js';

describe('SimulationLoop', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('advances ticks', () => {
    const world = createWorld('Test');
    const ecosystem = createEcosystemState();
    const sim = new SimulationLoop(world, ecosystem);

    const result = sim.tick();
    expect(result.tick).toBe(1);
    expect(world.time.tick).toBe(1);

    const result2 = sim.tick();
    expect(result2.tick).toBe(2);
  });

  it('calls tick handlers', () => {
    const world = createWorld('Test');
    const ecosystem = createEcosystemState();
    const sim = new SimulationLoop(world, ecosystem);

    const results: TickResult[] = [];
    sim.onTick((r) => results.push(r));

    // Use fake timers
    vi.useFakeTimers();
    sim.start();
    vi.advanceTimersByTime(3000);
    sim.stop();

    expect(results.length).toBe(3);
    expect(results[0].tick).toBe(1);
    expect(results[2].tick).toBe(3);
  });

  it('respects pause', () => {
    const world = createWorld('Test');
    const ecosystem = createEcosystemState();
    const sim = new SimulationLoop(world, ecosystem);

    const results: TickResult[] = [];
    sim.onTick((r) => results.push(r));

    vi.useFakeTimers();
    sim.start();
    vi.advanceTimersByTime(2000);
    sim.setPaused(true);
    vi.advanceTimersByTime(3000);
    sim.setPaused(false);
    vi.advanceTimersByTime(1000);
    sim.stop();

    expect(results.length).toBe(3); // 2 before pause + 1 after unpause
  });

  it('processes regions during tick', () => {
    const world = createWorld('Test');
    const region = createRegion({
      name: 'TestRegion',
      layer: 'surface',
      biome: 'grassland',
      latitude: 30,
      longitude: 10,
      elevation: 100,
    });
    region.resources.push({
      type: 'grass',
      quantity: 500,
      renewRate: 1,
      maxQuantity: 1000,
      properties: new Map(),
    });
    world.regions.set(region.id, region);

    const ecosystem = createEcosystemState();
    const sim = new SimulationLoop(world, ecosystem);
    sim.tick();

    // Resources should have been regenerated
    // Resource quantity increases (drift modifier may cause slight variation)
    expect(region.resources[0].quantity).toBeGreaterThan(500);
  });
});
