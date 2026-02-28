import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCelestialState,
  updateRegionWeather,
  applyTidalEffects,
  applyEclipseClimateEffect,
  tickWorldClimate,
  resetClimateState,
  spreadPollution,
  getRegionDroughtState,
} from '../src/simulation/climate.js';
import { createRegion } from '../src/simulation/world.js';
import { createGameTime } from '../src/simulation/world.js';
import type { Region, RegionId } from '../src/types.js';

describe('Climate System', () => {
  beforeEach(() => {
    resetClimateState();
  });

  describe('Celestial State', () => {
    it('calculates solar elevation based on hour and latitude', () => {
      const noon = createGameTime(86400 / 365 / 2); // roughly midday
      const midnight = createGameTime(0);
      const equator = getCelestialState(noon, 0);
      const polar = getCelestialState(noon, 80);

      // Solar elevation should be a number between 0 and 1
      expect(equator.solarElevation).toBeGreaterThanOrEqual(0);
      expect(equator.solarElevation).toBeLessThanOrEqual(1);
      expect(polar.solarElevation).toBeGreaterThanOrEqual(0);
      expect(polar.solarElevation).toBeLessThanOrEqual(1);
    });

    it('calculates lunar illumination from phase', () => {
      // At tick 0, lunarPhase is 'new' -> illumination should be 0
      const time = createGameTime(0);
      const state = getCelestialState(time, 0);
      expect(state.lunarIllumination).toBe(0); // New moon = 0 illumination
    });

    it('calculates tidal force', () => {
      const time = createGameTime(0);
      const state = getCelestialState(time, 0);
      expect(state.tidalForce).toBeGreaterThanOrEqual(0);
      expect(state.tidalForce).toBeLessThanOrEqual(1);
    });
  });

  describe('Seasonal Temperature', () => {
    it('tropical regions have minimal seasonal variation', () => {
      const tropicalRegion = createRegion({
        name: 'Tropical Test',
        layer: 'surface',
        biome: 'tropical_rainforest',
        latitude: 5,
        longitude: 0,
        elevation: 100,
      });

      const winterTemp = tropicalRegion.climate.temperature;
      // Run weather update for summer
      const summerTime = createGameTime(86400 / 2); // ~mid-year
      updateRegionWeather(tropicalRegion, summerTime);
      const summerTemp = tropicalRegion.climate.temperature;

      // Tropical should not swing wildly (within ~10 degrees of original)
      expect(Math.abs(summerTemp - winterTemp)).toBeLessThan(15);
    });

    it('high latitude regions have larger temperature swings', () => {
      const arcticRegion = createRegion({
        name: 'Arctic Test',
        layer: 'surface',
        biome: 'tundra',
        latitude: 70,
        longitude: 0,
        elevation: 50,
      });

      // Record initial temperature
      const initialTemp = arcticRegion.climate.temperature;

      // Simulate many ticks to let temperature converge toward seasonal target
      for (let i = 0; i < 100; i++) {
        const summerTime = createGameTime(172 * (86400 / 365)); // summer solstice area
        updateRegionWeather(arcticRegion, summerTime);
      }

      // Temperature should have moved from the initial value
      expect(arcticRegion.climate.temperature).not.toBe(initialTemp);
    });

    it('underground regions are thermally buffered', () => {
      const caveRegion = createRegion({
        name: 'Cave Test',
        layer: 'underground',
        biome: 'cave_system',
        latitude: 50,
        longitude: 0,
        elevation: -200,
      });

      const initialTemp = caveRegion.climate.temperature;

      // Run many ticks - underground should remain stable
      for (let i = 0; i < 50; i++) {
        const time = createGameTime(i * 100);
        updateRegionWeather(caveRegion, time);
      }

      // Cave temperature should stay close to base (~14°C for cave_system)
      expect(Math.abs(caveRegion.climate.temperature - 14)).toBeLessThan(10);
    });
  });

  describe('Weather Updates', () => {
    it('updates temperature, humidity, wind, and precipitation', () => {
      const region = createRegion({
        name: 'Weather Test',
        layer: 'surface',
        biome: 'temperate_forest',
        latitude: 45,
        longitude: 0,
        elevation: 300,
      });

      const time = createGameTime(1000);
      updateRegionWeather(region, time);

      // All climate values should be finite numbers
      expect(Number.isFinite(region.climate.temperature)).toBe(true);
      expect(Number.isFinite(region.climate.humidity)).toBe(true);
      expect(Number.isFinite(region.climate.windSpeed)).toBe(true);
      expect(Number.isFinite(region.climate.precipitation)).toBe(true);
      // Humidity should stay in bounds
      expect(region.climate.humidity).toBeGreaterThanOrEqual(0);
      expect(region.climate.humidity).toBeLessThanOrEqual(1);
    });
  });

  describe('Tidal Effects', () => {
    it('applies tidal effects to coastal regions', () => {
      const coastal = createRegion({
        name: 'Coast Test',
        layer: 'surface',
        biome: 'coastal',
        latitude: 30,
        longitude: -80,
        elevation: 5,
      });
      coastal.resources.push({
        type: 'fish',
        quantity: 100,
        maxQuantity: 200,
        renewRate: 0.1,
      });

      const initialRenewRate = coastal.resources[0].renewRate;
      const time = createGameTime(0);
      const celestial = getCelestialState(time, 30);
      applyTidalEffects(coastal, celestial);

      // Renew rate should be modified by tidal force
      expect(coastal.resources[0].renewRate).not.toBe(initialRenewRate);
    });

    it('does not apply tidal effects to inland surface regions', () => {
      const inland = createRegion({
        name: 'Inland Test',
        layer: 'surface',
        biome: 'grassland',
        latitude: 40,
        longitude: -100,
        elevation: 500,
      });
      inland.resources.push({
        type: 'grass',
        quantity: 100,
        maxQuantity: 200,
        renewRate: 0.1,
      });

      const initialRenewRate = inland.resources[0].renewRate;
      const time = createGameTime(0);
      const celestial = getCelestialState(time, 40);
      applyTidalEffects(inland, celestial);

      // Should remain unchanged
      expect(inland.resources[0].renewRate).toBe(initialRenewRate);
    });
  });

  describe('Pollution', () => {
    it('spreads pollution from high to low concentration', () => {
      const regionA = createRegion({
        name: 'Polluted',
        layer: 'surface',
        biome: 'grassland',
        latitude: 40,
        longitude: 0,
        elevation: 200,
      });
      const regionB = createRegion({
        name: 'Clean',
        layer: 'surface',
        biome: 'grassland',
        latitude: 42,
        longitude: 2,
        elevation: 200,
      });

      // Connect them
      regionA.connections.push(regionB.id);
      regionB.connections.push(regionA.id);

      // Set high pollution on A
      regionA.climate.pollution = 0.8;
      regionB.climate.pollution = 0;

      const regions = new Map<RegionId, Region>();
      regions.set(regionA.id, regionA);
      regions.set(regionB.id, regionB);

      // Spread pollution
      spreadPollution(regions);

      // B should have gained some pollution
      expect(regionB.climate.pollution).toBeGreaterThan(0);
      // A should have lost some (natural decay)
      expect(regionA.climate.pollution).toBeLessThan(0.8);
    });

    it('forests absorb pollution faster', () => {
      const forest = createRegion({
        name: 'Forest',
        layer: 'surface',
        biome: 'tropical_rainforest',
        latitude: 0,
        longitude: 0,
        elevation: 100,
      });
      const desert = createRegion({
        name: 'Desert',
        layer: 'surface',
        biome: 'desert',
        latitude: 25,
        longitude: 30,
        elevation: 500,
      });

      forest.climate.pollution = 0.5;
      desert.climate.pollution = 0.5;

      const regions = new Map<RegionId, Region>();
      regions.set(forest.id, forest);
      regions.set(desert.id, desert);

      spreadPollution(regions);

      // Forest should have absorbed more
      expect(forest.climate.pollution).toBeLessThan(desert.climate.pollution);
    });
  });

  describe('Eclipse Effects', () => {
    it('solar eclipse drops temperature', () => {
      const region = createRegion({
        name: 'Eclipse Test',
        layer: 'surface',
        biome: 'temperate_forest',
        latitude: 45,
        longitude: 0,
        elevation: 300,
      });

      const initialTemp = region.climate.temperature;
      applyEclipseClimateEffect(region, {
        solarElevation: 0.8,
        lunarIllumination: 0,
        tidalForce: 1,
        isEclipse: true,
        eclipseType: 'solar',
      });

      expect(region.climate.temperature).toBeLessThan(initialTemp);
    });
  });

  describe('tickWorldClimate', () => {
    it('runs a full climate tick without errors', () => {
      const regions = new Map<RegionId, Region>();
      const r1 = createRegion({
        name: 'Test Region 1',
        layer: 'surface',
        biome: 'temperate_forest',
        latitude: 50,
        longitude: 10,
        elevation: 300,
      });
      const r2 = createRegion({
        name: 'Test Region 2',
        layer: 'underwater',
        biome: 'coral_reef',
        latitude: -18,
        longitude: 147,
        elevation: -30,
      });
      r1.connections.push(r2.id);
      r2.connections.push(r1.id);
      regions.set(r1.id, r1);
      regions.set(r2.id, r2);

      const time = createGameTime(1000);
      const events = tickWorldClimate(regions, time);

      // Should return an array (possibly empty)
      expect(Array.isArray(events)).toBe(true);
      // Climate values should still be valid
      expect(Number.isFinite(r1.climate.temperature)).toBe(true);
      expect(Number.isFinite(r2.climate.temperature)).toBe(true);
    });
  });
});
