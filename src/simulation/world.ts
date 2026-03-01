// ============================================================
// World State & Region Management
// ============================================================

import type {
  World, Region, RegionId, WorldId, GameTime, Era,
  Resource, HiddenLocation, Population, WorldLayer, Biome, RegionClimate,
} from '../types.js';
import { worldRNG } from './random.js';

// --- Time Constants ---
// 1 tick = 30 in-game minutes. ~5 years/day at 1 tick/second.
export const TICKS_PER_HOUR = 2;
export const TICKS_PER_DAY = 48;
export const TICKS_PER_YEAR = 17520;  // 365 * 48

// Tiered processing intervals
export const TICK_FAST = 1;           // Every tick (1s real)
export const TICK_SLOW = 30;          // Every 30 ticks (30s real, ~15 in-game hours)
export const TICK_EPOCH = 600;        // Every 600 ticks (10min real, ~12.5 in-game days)

// Gestation cap: 14400 ticks = 4 real hours for all species
export const MAX_GESTATION_TICKS = 14400;

export function createGameTime(tick: number): GameTime {
  const year = Math.floor(tick / TICKS_PER_YEAR);
  const dayOfYear = Math.floor((tick % TICKS_PER_YEAR) / TICKS_PER_DAY);
  const hourFloat = ((tick % TICKS_PER_DAY) / TICKS_PER_HOUR);
  const hour = Math.floor(hourFloat);

  const seasonIndex = Math.floor(dayOfYear / 91.25);
  const seasons: GameTime['season'][] = ['spring', 'summer', 'autumn', 'winter'];

  // Lunar cycle: ~29.5 days
  const lunarCycleTicks = 29.5 * TICKS_PER_DAY;
  const lunarProgress = (tick % lunarCycleTicks) / lunarCycleTicks;
  const lunarPhases: GameTime['lunarPhase'][] = [
    'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full', 'waning_gibbous', 'last_quarter', 'waning_crescent',
  ];
  const lunarIndex = Math.floor(lunarProgress * 8);

  // Continuous light level: sinusoidal curve, 0 at midnight, 1 at noon
  // hourFloat ranges 0-24; peak at 12, trough at 0/24
  const lightLevel = Math.max(0, Math.sin((hourFloat / 24) * Math.PI));
  const isDay = lightLevel > 0.2;  // ~5am to ~7pm

  return {
    tick,
    year,
    day: dayOfYear,
    hour,
    season: seasons[seasonIndex] ?? 'spring',
    lunarPhase: lunarPhases[lunarIndex] ?? 'new',
    isDay,
    lightLevel,
  };
}

export function createWorld(name: string): World {
  return {
    id: crypto.randomUUID() as WorldId,
    name,
    time: createGameTime(0),
    regions: new Map(),
    era: { name: 'The Dawn', startTick: 0, dominantSpecies: null },
    startedAt: new Date(),
  };
}

export function createRegion(params: {
  name: string;
  layer: WorldLayer;
  biome: Biome;
  latitude: number;
  longitude: number;
  elevation: number;
}): Region {
  return {
    id: crypto.randomUUID() as RegionId,
    name: params.name,
    layer: params.layer,
    biome: params.biome,
    latitude: params.latitude,
    longitude: params.longitude,
    elevation: params.elevation,
    climate: defaultClimate(params.biome, params.latitude),
    resources: [],
    connections: [],
    hiddenLocations: [],
    populations: [],
    plantPopulations: [],
  };
}

function defaultClimate(biome: Biome, latitude: number): RegionClimate {
  const absLat = Math.abs(latitude);
  // Base temperature decreases with latitude
  const baseTemp = 30 - absLat * 0.5;

  const biomeModifiers: Partial<Record<Biome, Partial<RegionClimate>>> = {
    tropical_rainforest: { temperature: 28, humidity: 0.9, precipitation: 200 },
    desert: { temperature: 35, humidity: 0.1, precipitation: 5 },
    tundra: { temperature: -10, humidity: 0.3, precipitation: 20 },
    deep_ocean: { temperature: 4, humidity: 1, precipitation: 0 },
    cave_system: { temperature: 15, humidity: 0.7, precipitation: 0 },
  };

  const mods = biomeModifiers[biome] ?? {};
  return {
    temperature: mods.temperature ?? baseTemp,
    humidity: mods.humidity ?? 0.5,
    precipitation: mods.precipitation ?? 50,
    windSpeed: 10 + worldRNG.float(-5, 5),
    pollution: 0,
  };
}

export function addRegionConnection(world: World, a: RegionId, b: RegionId): void {
  const regionA = world.regions.get(a);
  const regionB = world.regions.get(b);
  if (!regionA || !regionB) return;
  if (!regionA.connections.includes(b)) regionA.connections.push(b);
  if (!regionB.connections.includes(a)) regionB.connections.push(a);
}

export function getRegionPopulation(region: Region, speciesId: string): Population | undefined {
  return region.populations.find(p => p.speciesId === speciesId);
}

export function updateRegionClimate(region: Region, tick: number): void {
  const time = createGameTime(tick);
  const seasonTemp: Record<string, number> = {
    spring: 0, summer: 5, autumn: -2, winter: -10,
  };
  const seasonMod = seasonTemp[time.season] ?? 0;
  // Southern hemisphere: invert seasons
  const hemisphereFlip = region.latitude < 0 ? -1 : 1;
  region.climate.temperature += seasonMod * hemisphereFlip * 0.01; // Gradual shift
}
