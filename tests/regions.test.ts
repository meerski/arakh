import { describe, it, expect } from 'vitest';
import { createWorld } from '../src/simulation/world.js';
import { seedRegions } from '../src/data/earth/seed.js';
import type { World, Region } from '../src/types.js';

describe('Region Expansion', () => {
  let world: World;

  it('seeds at least 200 regions', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    expect(world.regions.size).toBeGreaterThanOrEqual(200);
  });

  it('includes all three world layers', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    const layers = new Set<string>();
    for (const region of world.regions.values()) {
      layers.add(region.layer);
    }
    expect(layers.has('surface')).toBe(true);
    expect(layers.has('underwater')).toBe(true);
    expect(layers.has('underground')).toBe(true);
  });

  it('has diverse biomes', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    const biomes = new Set<string>();
    for (const region of world.regions.values()) {
      biomes.add(region.biome);
    }
    // Should have at least 10 distinct biomes
    expect(biomes.size).toBeGreaterThanOrEqual(10);
  });

  it('all regions have connections', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    let isolatedCount = 0;
    for (const region of world.regions.values()) {
      if (region.connections.length === 0) isolatedCount++;
    }
    // Allow a small number of isolated regions (e.g., deep ocean vents)
    // but most should be connected
    expect(isolatedCount).toBeLessThan(world.regions.size * 0.1);
  });

  it('all regions have valid climate values', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    for (const region of world.regions.values()) {
      expect(Number.isFinite(region.climate.temperature)).toBe(true);
      expect(region.climate.humidity).toBeGreaterThanOrEqual(0);
      expect(region.climate.humidity).toBeLessThanOrEqual(1);
      expect(region.climate.precipitation).toBeGreaterThanOrEqual(0);
      expect(region.climate.windSpeed).toBeGreaterThanOrEqual(0);
      expect(region.climate.pollution).toBe(0); // Starts clean
    }
  });

  it('has regions across all major latitude bands', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    let hasArctic = false;
    let hasTemperate = false;
    let hasTropical = false;
    let hasSouthern = false;

    for (const region of world.regions.values()) {
      const lat = region.latitude;
      if (lat > 60) hasArctic = true;
      if (lat > 23.5 && lat < 60) hasTemperate = true;
      if (Math.abs(lat) < 23.5) hasTropical = true;
      if (lat < -30) hasSouthern = true;
    }

    expect(hasArctic).toBe(true);
    expect(hasTemperate).toBe(true);
    expect(hasTropical).toBe(true);
    expect(hasSouthern).toBe(true);
  });

  it('surface layer has the most regions', () => {
    world = createWorld('Test Earth');
    seedRegions(world);
    let surfaceCount = 0;
    let underwaterCount = 0;
    let undergroundCount = 0;

    for (const region of world.regions.values()) {
      if (region.layer === 'surface') surfaceCount++;
      else if (region.layer === 'underwater') underwaterCount++;
      else if (region.layer === 'underground') undergroundCount++;
    }

    expect(surfaceCount).toBeGreaterThan(underwaterCount);
    expect(surfaceCount).toBeGreaterThan(undergroundCount);
    expect(underwaterCount).toBeGreaterThan(0);
    expect(undergroundCount).toBeGreaterThan(0);
  });
});
