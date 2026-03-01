import { describe, it, expect } from 'vitest';
import {
  createGameTime, createWorld, createRegion, addRegionConnection,
  TICKS_PER_YEAR, TICKS_PER_DAY, TICKS_PER_HOUR,
} from '../src/simulation/world.js';

describe('GameTime', () => {
  it('tick 0 is year 0, day 0, hour 0', () => {
    const t = createGameTime(0);
    expect(t.tick).toBe(0);
    expect(t.year).toBe(0);
    expect(t.day).toBe(0);
    expect(t.hour).toBe(0);
    expect(t.season).toBe('spring');
  });

  it('17520 ticks = 1 year', () => {
    const t = createGameTime(TICKS_PER_YEAR);
    expect(t.year).toBe(1);
    expect(t.day).toBe(0);
  });

  it('48 ticks = 1 day', () => {
    const t = createGameTime(TICKS_PER_DAY);
    expect(t.year).toBe(0);
    expect(t.day).toBe(1);
    expect(t.hour).toBe(0);
  });

  it('2 ticks = 1 hour', () => {
    const t = createGameTime(TICKS_PER_HOUR);
    expect(t.hour).toBe(1);
  });

  it('correctly determines day/night via lightLevel', () => {
    // Hour 0 = midnight = dark
    const midnight = createGameTime(0);
    expect(midnight.isDay).toBe(false);
    expect(midnight.lightLevel).toBe(0);

    // ~noon (hour 12 = tick 24)
    const noon = createGameTime(12 * TICKS_PER_HOUR);
    expect(noon.isDay).toBe(true);
    expect(noon.lightLevel).toBeGreaterThan(0.9);
  });

  it('cycles through seasons', () => {
    const spring = createGameTime(0);
    const summer = createGameTime(Math.floor(TICKS_PER_YEAR * 0.3));
    const autumn = createGameTime(Math.floor(TICKS_PER_YEAR * 0.55));
    const winter = createGameTime(Math.floor(TICKS_PER_YEAR * 0.8));

    expect(spring.season).toBe('spring');
    expect(summer.season).toBe('summer');
    expect(autumn.season).toBe('autumn');
    expect(winter.season).toBe('winter');
  });

  it('has lunar phases', () => {
    const t = createGameTime(0);
    expect(t.lunarPhase).toBeDefined();
  });
});

describe('World', () => {
  it('creates a new world', () => {
    const world = createWorld('TestWorld');
    expect(world.name).toBe('TestWorld');
    expect(world.time.tick).toBe(0);
    expect(world.era.name).toBe('The Dawn');
    expect(world.regions.size).toBe(0);
  });
});

describe('Region', () => {
  it('creates a region with correct properties', () => {
    const region = createRegion({
      name: 'Test Forest',
      layer: 'surface',
      biome: 'temperate_forest',
      latitude: 50,
      longitude: 10,
      elevation: 300,
    });

    expect(region.name).toBe('Test Forest');
    expect(region.layer).toBe('surface');
    expect(region.biome).toBe('temperate_forest');
    expect(region.connections).toHaveLength(0);
  });

  it('connects regions bidirectionally', () => {
    const world = createWorld('Test');
    const r1 = createRegion({ name: 'A', layer: 'surface', biome: 'grassland', latitude: 0, longitude: 0, elevation: 0 });
    const r2 = createRegion({ name: 'B', layer: 'surface', biome: 'grassland', latitude: 1, longitude: 1, elevation: 0 });

    world.regions.set(r1.id, r1);
    world.regions.set(r2.id, r2);
    addRegionConnection(world, r1.id, r2.id);

    expect(r1.connections).toContain(r2.id);
    expect(r2.connections).toContain(r1.id);
  });
});
