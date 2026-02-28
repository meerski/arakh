// ============================================================
// Climate, Seasons, Celestial Cycles — Enhanced Simulation
// ============================================================
// Features: seasonal curves, persistent weather fronts, pollution-
// driven climate change, eclipses, tidal mechanics, volcanic
// activity, and drought cycles.

import type { Region, GameTime, WorldEvent, RegionId, Biome } from '../types.js';
import { worldRNG } from './random.js';

// ============================================================
// Constants
// ============================================================

const DAYS_PER_YEAR = 365;
const DEG_TO_RAD = Math.PI / 180;

/** Base temperatures (°C) by biome — annual mean at equator equivalent. */
const BIOME_BASE_TEMP: Record<Biome, number> = {
  tropical_rainforest: 27,
  temperate_forest: 12,
  boreal_forest: -2,
  savanna: 25,
  grassland: 14,
  desert: 30,
  tundra: -10,
  mountain: 2,
  wetland: 16,
  coastal: 17,
  coral_reef: 25,
  open_ocean: 18,
  deep_ocean: 4,
  hydrothermal_vent: 60,
  kelp_forest: 12,
  cave_system: 14,
  underground_river: 12,
  subterranean_ecosystem: 15,
};

/** Seasonal amplitude (°C half-swing) by biome — how much temperature varies. */
const BIOME_SEASONAL_AMPLITUDE: Record<Biome, number> = {
  tropical_rainforest: 2,
  temperate_forest: 14,
  boreal_forest: 22,
  savanna: 5,
  grassland: 16,
  desert: 18,
  tundra: 25,
  mountain: 18,
  wetland: 12,
  coastal: 8,
  coral_reef: 3,
  open_ocean: 5,
  deep_ocean: 1,
  hydrothermal_vent: 0.5,
  kelp_forest: 5,
  cave_system: 2,
  underground_river: 1,
  subterranean_ecosystem: 1,
};

/** Base humidity by biome (0–1). */
const BIOME_BASE_HUMIDITY: Record<Biome, number> = {
  tropical_rainforest: 0.85,
  temperate_forest: 0.6,
  boreal_forest: 0.5,
  savanna: 0.35,
  grassland: 0.45,
  desert: 0.1,
  tundra: 0.3,
  mountain: 0.4,
  wetland: 0.8,
  coastal: 0.65,
  coral_reef: 0.75,
  open_ocean: 0.7,
  deep_ocean: 0.9,
  hydrothermal_vent: 0.95,
  kelp_forest: 0.8,
  cave_system: 0.6,
  underground_river: 0.85,
  subterranean_ecosystem: 0.55,
};

// ============================================================
// Celestial State
// ============================================================

export interface CelestialState {
  solarElevation: number;     // 0–1 (0 = midnight, 1 = noon)
  lunarIllumination: number;  // 0–1
  tidalForce: number;         // 0–1
  isEclipse: boolean;
  eclipseType: EclipseType | null;
}

export type EclipseType = 'solar' | 'lunar';

const PHASE_ORDER = [
  'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
  'full', 'waning_gibbous', 'last_quarter', 'waning_crescent',
] as const;

export function getCelestialState(time: GameTime, latitude: number): CelestialState {
  // Solar elevation based on hour, latitude, and season
  const hourAngle = ((time.hour - 12) / 12) * Math.PI;
  const seasonalDeclination = 23.44 * Math.sin(((time.day - 81) / DAYS_PER_YEAR) * 2 * Math.PI);
  const latRad = latitude * DEG_TO_RAD;
  const declRad = seasonalDeclination * DEG_TO_RAD;
  const rawElevation = Math.sin(latRad) * Math.sin(declRad)
    + Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngle);
  const solarElevation = Math.max(0, Math.min(1, (rawElevation + 1) / 2));

  // Lunar illumination from phase
  const phaseIndex = PHASE_ORDER.indexOf(time.lunarPhase as typeof PHASE_ORDER[number]);
  const lunarIllumination = phaseIndex <= 4
    ? phaseIndex / 4
    : (8 - phaseIndex) / 4;

  // Tidal force: peaks at new and full moon (spring tides), minimum at quarters (neap tides)
  // Model as cosine of twice the phase angle for semi-diurnal pattern
  const phaseAngle = (phaseIndex / 8) * 2 * Math.PI;
  const tidalForce = 0.5 + 0.5 * Math.cos(2 * phaseAngle);

  // Eclipse detection
  let isEclipse = false;
  let eclipseType: EclipseType | null = null;

  if (time.lunarPhase === 'new' && worldRNG.chance(0.0001)) {
    isEclipse = true;
    eclipseType = 'solar';
  } else if (time.lunarPhase === 'full' && worldRNG.chance(0.001)) {
    isEclipse = true;
    eclipseType = 'lunar';
  }

  return { solarElevation, lunarIllumination, tidalForce, isEclipse, eclipseType };
}

// ============================================================
// Weather System — Persistent Fronts
// ============================================================

export interface WeatherFront {
  id: string;
  type: WeatherFrontType;
  intensity: number;          // 0–1
  remainingTicks: number;     // How many ticks this front persists
  originRegionId: RegionId;
  affectedRegionIds: Set<RegionId>;
  spreadProbability: number;  // Chance per tick of spreading to a connected region
  temperatureModifier: number;  // °C shift
  humidityModifier: number;     // additive shift to humidity
  windModifier: number;         // additive shift to wind speed
  precipitationMultiplier: number; // multiplier on precipitation
}

export type WeatherFrontType =
  | 'warm_front' | 'cold_front' | 'occluded_front'
  | 'tropical_storm' | 'high_pressure' | 'low_pressure'
  | 'monsoon' | 'blizzard' | 'heatwave';

/** Module-level store of active weather systems. Keyed by front id. */
const activeWeatherFronts: Map<string, WeatherFront> = new Map();

/** Create a new weather front originating in a region. */
function spawnWeatherFront(region: Region, time: GameTime): WeatherFront {
  const rng = worldRNG;

  // Choose front type based on climate conditions
  const temp = region.climate.temperature;
  const humid = region.climate.humidity;

  type FrontCandidate = { type: WeatherFrontType; weight: number; tempMod: number; humidMod: number; windMod: number; precipMul: number; duration: number };

  const candidates: FrontCandidate[] = [
    { type: 'warm_front',      weight: temp > 10 ? 2 : 0.5,   tempMod: 4,   humidMod: 0.15,  windMod: 5,   precipMul: 1.5, duration: rng.int(8, 24) },
    { type: 'cold_front',      weight: temp < 15 ? 2 : 0.5,   tempMod: -6,  humidMod: -0.05, windMod: 10,  precipMul: 1.8, duration: rng.int(6, 18) },
    { type: 'occluded_front',  weight: 1,                      tempMod: -2,  humidMod: 0.1,   windMod: 8,   precipMul: 2.0, duration: rng.int(6, 14) },
    { type: 'high_pressure',   weight: humid < 0.4 ? 2 : 0.5, tempMod: 2,   humidMod: -0.2,  windMod: -5,  precipMul: 0.2, duration: rng.int(12, 48) },
    { type: 'low_pressure',    weight: humid > 0.5 ? 2 : 0.5, tempMod: -1,  humidMod: 0.2,   windMod: 8,   precipMul: 2.5, duration: rng.int(8, 30) },
    { type: 'tropical_storm',  weight: temp > 25 && humid > 0.6 ? 2 : 0.1, tempMod: -3, humidMod: 0.3, windMod: 30, precipMul: 4.0, duration: rng.int(4, 12) },
    { type: 'monsoon',         weight: temp > 20 && humid > 0.5 ? 1.5 : 0.1, tempMod: -2, humidMod: 0.35, windMod: 15, precipMul: 5.0, duration: rng.int(12, 48) },
    { type: 'blizzard',        weight: temp < 0 ? 2.5 : 0,    tempMod: -12, humidMod: 0.1,   windMod: 25,  precipMul: 3.0, duration: rng.int(4, 10) },
    { type: 'heatwave',        weight: temp > 25 && humid < 0.4 ? 2 : 0.1, tempMod: 8, humidMod: -0.15, windMod: -3, precipMul: 0.1, duration: rng.int(12, 36) },
  ];

  const chosen = rng.weighted(candidates, candidates.map(c => c.weight));

  const front: WeatherFront = {
    id: `front_${time.tick}_${region.id}`,
    type: chosen.type,
    intensity: rng.float(0.4, 1.0),
    remainingTicks: chosen.duration,
    originRegionId: region.id,
    affectedRegionIds: new Set([region.id]),
    spreadProbability: rng.float(0.05, 0.25),
    temperatureModifier: chosen.tempMod * rng.float(0.7, 1.3),
    humidityModifier: chosen.humidMod * rng.float(0.7, 1.3),
    windModifier: chosen.windMod * rng.float(0.7, 1.3),
    precipitationMultiplier: chosen.precipMul,
  };

  return front;
}

/**
 * Advance all active weather fronts. Decay, spread, and remove expired ones.
 * Call once per tick with the full region map so fronts can spread.
 */
export function advanceWeatherFronts(regions: Map<RegionId, Region>): void {
  const toRemove: string[] = [];

  for (const [id, front] of activeWeatherFronts) {
    front.remainingTicks--;
    front.intensity *= 0.97; // slow decay

    if (front.remainingTicks <= 0 || front.intensity < 0.05) {
      toRemove.push(id);
      continue;
    }

    // Attempt to spread to connected regions
    const regionIdsSnapshot = [...front.affectedRegionIds];
    for (const rid of regionIdsSnapshot) {
      const region = regions.get(rid);
      if (!region) continue;
      for (const connId of region.connections) {
        if (!front.affectedRegionIds.has(connId) && worldRNG.chance(front.spreadProbability)) {
          front.affectedRegionIds.add(connId);
        }
      }
    }
  }

  for (const id of toRemove) {
    activeWeatherFronts.delete(id);
  }
}

/** Get the aggregate weather modifiers from all fronts affecting a region. */
function getWeatherFrontModifiers(regionId: RegionId): {
  tempMod: number; humidMod: number; windMod: number; precipMul: number;
} {
  let tempMod = 0;
  let humidMod = 0;
  let windMod = 0;
  let precipMul = 1;

  for (const front of activeWeatherFronts.values()) {
    if (front.affectedRegionIds.has(regionId)) {
      const scale = front.intensity;
      tempMod += front.temperatureModifier * scale;
      humidMod += front.humidityModifier * scale;
      windMod += front.windModifier * scale;
      precipMul *= 1 + (front.precipitationMultiplier - 1) * scale;
    }
  }

  return { tempMod, humidMod, windMod, precipMul };
}

/** Possibly spawn a new weather front. Called per-region per-tick. */
function maybeSpawnFront(region: Region, time: GameTime): void {
  // Don't spawn too many fronts for the same region
  let existingCount = 0;
  for (const front of activeWeatherFronts.values()) {
    if (front.affectedRegionIds.has(region.id)) existingCount++;
  }
  if (existingCount >= 3) return;

  // ~1% chance per tick of a new front spawning in a given region
  if (worldRNG.chance(0.01)) {
    const front = spawnWeatherFront(region, time);
    activeWeatherFronts.set(front.id, front);
  }
}

// ============================================================
// Drought Tracking
// ============================================================

export interface DroughtState {
  ticksWithoutRain: number;
  severity: number;  // 0–1, rises over time during drought
  active: boolean;
}

/** Module-level drought tracking per region. */
const droughtStates: Map<RegionId, DroughtState> = new Map();

/** Drought threshold in ticks of low precipitation before drought begins. */
const DROUGHT_ONSET_TICKS = 24;

function getDroughtState(regionId: RegionId): DroughtState {
  let state = droughtStates.get(regionId);
  if (!state) {
    state = { ticksWithoutRain: 0, severity: 0, active: false };
    droughtStates.set(regionId, state);
  }
  return state;
}

function updateDrought(region: Region): void {
  const ds = getDroughtState(region.id);
  const effectivePrecip = region.climate.precipitation;
  const baseHumidity = BIOME_BASE_HUMIDITY[region.biome];

  if (effectivePrecip < 5 && region.climate.humidity < baseHumidity * 0.6) {
    ds.ticksWithoutRain++;
    if (ds.ticksWithoutRain > DROUGHT_ONSET_TICKS) {
      ds.active = true;
      // Severity increases logarithmically — quick onset, slow escalation
      ds.severity = Math.min(1, Math.log2(ds.ticksWithoutRain - DROUGHT_ONSET_TICKS + 1) / 8);
    }
  } else {
    // Rain breaks the drought slowly
    ds.ticksWithoutRain = Math.max(0, ds.ticksWithoutRain - 3);
    if (ds.ticksWithoutRain <= DROUGHT_ONSET_TICKS / 2) {
      ds.active = false;
      ds.severity = Math.max(0, ds.severity - 0.05);
    }
  }

  // Active drought effects: reduce humidity, increase temperature
  if (ds.active) {
    region.climate.humidity = Math.max(0, region.climate.humidity - 0.02 * ds.severity);
    region.climate.temperature += 1.5 * ds.severity;
  }
}

// ============================================================
// Pollution & Species-Caused Climate Change
// ============================================================

/**
 * Apply pollution effects to climate. Pollution is stored on RegionClimate.pollution (0–1).
 * High pollution: raises temperature, reduces precipitation, increases extreme weather.
 */
function applyPollutionEffects(region: Region): void {
  const p = region.climate.pollution;
  if (p <= 0) return;

  // Greenhouse effect: +0 to +5°C at full pollution
  region.climate.temperature += p * 5;

  // Reduced precipitation due to particulate matter disrupting rain formation
  region.climate.precipitation *= 1 - p * 0.3;

  // Humidity drops slightly from atmospheric disruption
  region.climate.humidity = Math.max(0, region.climate.humidity - p * 0.05);
}

/**
 * Spread pollution to connected regions at a slow rate.
 * Call once per tick with the full region map.
 */
export function spreadPollution(regions: Map<RegionId, Region>): void {
  // Collect current pollution levels before spreading
  const pollutionSnapshot = new Map<RegionId, number>();
  for (const [id, region] of regions) {
    pollutionSnapshot.set(id, region.climate.pollution);
  }

  for (const [id, region] of regions) {
    const myPollution = pollutionSnapshot.get(id) ?? 0;
    if (myPollution <= 0.01) continue;

    for (const connId of region.connections) {
      const neighbor = regions.get(connId);
      if (!neighbor) continue;
      const neighborPollution = pollutionSnapshot.get(connId) ?? 0;

      // Diffusion: pollution flows from high to low concentration
      const diff = myPollution - neighborPollution;
      if (diff > 0) {
        const transfer = diff * 0.005; // Very slow spread
        neighbor.climate.pollution = Math.min(1, neighbor.climate.pollution + transfer);
      }
    }

    // Natural pollution decay (forests absorb more)
    const absorptionRate = region.biome === 'tropical_rainforest' ? 0.003
      : region.biome === 'temperate_forest' ? 0.002
      : region.biome === 'boreal_forest' ? 0.0015
      : region.biome === 'wetland' ? 0.002
      : region.biome === 'kelp_forest' ? 0.0015
      : 0.0005;
    region.climate.pollution = Math.max(0, region.climate.pollution - absorptionRate);
  }
}

// ============================================================
// Tidal Mechanics
// ============================================================

const COASTAL_BIOMES: ReadonlySet<Biome> = new Set([
  'coastal', 'coral_reef', 'open_ocean', 'deep_ocean',
  'hydrothermal_vent', 'kelp_forest',
]);

/**
 * Apply tidal effects to coastal and underwater regions.
 * High tides increase resource availability (nutrients), affect species behavior.
 */
export function applyTidalEffects(region: Region, celestial: CelestialState): void {
  if (!COASTAL_BIOMES.has(region.biome) && region.layer !== 'underwater') return;

  const tidal = celestial.tidalForce;

  // High tides stir nutrients — boost resource renewal rates temporarily
  for (const resource of region.resources) {
    const tidalBoost = 1 + (tidal - 0.5) * 0.3; // 0.85x at neap, 1.15x at spring
    resource.renewRate *= tidalBoost;
  }

  // Extreme tides affect coastal regions' wind and humidity
  if (region.biome === 'coastal') {
    region.climate.windSpeed += (tidal - 0.5) * 4;
    region.climate.humidity += (tidal - 0.5) * 0.03;
  }
}

// ============================================================
// Seasonal Temperature Calculation
// ============================================================

/**
 * Calculate the target temperature for a region based on latitude, day of year,
 * time of day, and biome characteristics.
 *
 * Temperature follows a sinusoidal curve:
 * - Tropical regions (|lat| < 23.5): minimal seasonal variation
 * - Temperate regions: moderate swing
 * - Polar regions (|lat| > 66.5): extreme seasonal swing
 * - Southern hemisphere: inverted seasons (180° phase shift)
 */
function calculateSeasonalTemperature(region: Region, time: GameTime): number {
  const baseTemp = BIOME_BASE_TEMP[region.biome];
  const amplitude = BIOME_SEASONAL_AMPLITUDE[region.biome];

  // Latitude factor: polar regions get extra amplitude
  const absLat = Math.abs(region.latitude);
  const latitudeAmplification = 1 + Math.max(0, absLat - 30) / 60; // 1.0 at equator, ~2.0 at poles

  // Seasonal sinusoid — peaks at summer solstice (~day 172 in northern hemisphere)
  // Phase inverted for southern hemisphere
  const hemisphereSign = region.latitude >= 0 ? 1 : -1;
  const dayAngle = ((time.day - 172) / DAYS_PER_YEAR) * 2 * Math.PI;
  const seasonalOffset = amplitude * latitudeAmplification * Math.cos(dayAngle) * hemisphereSign;

  // Diurnal variation — warmer during day, cooler at night
  const hourAngle = ((time.hour - 14) / 12) * Math.PI; // Peak at 14:00
  const diurnalAmplitude = 3 + absLat * 0.05; // Larger swing at high latitudes (continental)
  const diurnalOffset = diurnalAmplitude * Math.cos(hourAngle);

  // Altitude lapse rate: ~6.5°C per 1000m
  const altitudeOffset = -(region.elevation / 1000) * 6.5;

  // Underground / cave regions are thermally buffered
  const bufferFactor = region.layer === 'underground' ? 0.1
    : region.layer === 'underwater' ? 0.4
    : 1.0;

  const target = baseTemp
    + seasonalOffset * bufferFactor
    + diurnalOffset * bufferFactor
    + altitudeOffset;

  return target;
}

// ============================================================
// Update Region Weather (main per-region tick)
// ============================================================

/**
 * Update climate for a single region. Should be called each tick per region.
 *
 * Temperature smoothly tracks seasonal targets rather than jumping randomly.
 * Weather fronts apply persistent modifiers. Pollution and drought layer on top.
 */
export function updateRegionWeather(region: Region, time: GameTime): void {
  const rng = worldRNG;

  // --- Seasonal target temperature ---
  const targetTemp = calculateSeasonalTemperature(region, time);

  // Smoothly approach target (inertia — oceans slower, deserts faster)
  const thermalInertia = COASTAL_BIOMES.has(region.biome) ? 0.02
    : region.biome === 'desert' ? 0.08
    : 0.05;
  region.climate.temperature += (targetTemp - region.climate.temperature) * thermalInertia;

  // Small stochastic noise
  region.climate.temperature += rng.gaussian(0, 0.3);

  // --- Weather front modifiers ---
  maybeSpawnFront(region, time);
  const frontMods = getWeatherFrontModifiers(region.id);
  region.climate.temperature += frontMods.tempMod * 0.05; // Gradual front influence per tick

  // --- Humidity ---
  const baseHumidity = BIOME_BASE_HUMIDITY[region.biome];
  // Humidity tends toward biome baseline with seasonal modulation
  const seasonalHumidMod = region.biome === 'savanna' || region.biome === 'grassland'
    ? 0.15 * Math.sin(((time.day - 80) / DAYS_PER_YEAR) * 2 * Math.PI) * (region.latitude >= 0 ? 1 : -1)
    : 0;
  const targetHumidity = Math.max(0, Math.min(1, baseHumidity + seasonalHumidMod + frontMods.humidMod * 0.05));
  region.climate.humidity += (targetHumidity - region.climate.humidity) * 0.03;
  region.climate.humidity += rng.gaussian(0, 0.01);
  region.climate.humidity = Math.max(0, Math.min(1, region.climate.humidity));

  // --- Precipitation ---
  // Precipitation depends on humidity and temperature (warmer air holds more moisture)
  const precipBase = region.climate.humidity > 0.6
    ? (region.climate.humidity - 0.5) * 150 * (1 + Math.max(0, region.climate.temperature) / 40)
    : rng.float(0, 5);
  region.climate.precipitation = Math.max(0, precipBase * frontMods.precipMul + rng.gaussian(0, 2));

  // --- Wind ---
  const baseWind = region.biome === 'open_ocean' ? 18
    : region.biome === 'coastal' ? 14
    : region.biome === 'mountain' ? 16
    : region.biome === 'grassland' ? 12
    : 8;
  const targetWind = baseWind + frontMods.windMod * 0.1;
  region.climate.windSpeed += (targetWind - region.climate.windSpeed) * 0.05;
  region.climate.windSpeed += rng.gaussian(0, 0.5);
  region.climate.windSpeed = Math.max(0, region.climate.windSpeed);

  // --- Pollution effects ---
  applyPollutionEffects(region);

  // --- Drought tracking ---
  updateDrought(region);
}

// ============================================================
// Eclipse Event Generation
// ============================================================

/**
 * Generate a world event for an eclipse. Called when CelestialState.isEclipse is true.
 */
export function createEclipseEvent(
  celestial: CelestialState,
  time: GameTime,
  regionIds: RegionId[],
): WorldEvent {
  const isSolar = celestial.eclipseType === 'solar';
  const description = isSolar
    ? 'The sky darkens as the moon passes before the sun. An eerie twilight descends and the air cools rapidly.'
    : 'The full moon turns blood red as the earth\'s shadow consumes it. Nocturnal creatures stir with unease.';

  return {
    id: crypto.randomUUID(),
    type: 'eclipse',
    level: 'global',
    regionIds,
    description,
    tick: time.tick,
    effects: [
      {
        type: 'climate_disruption',
        magnitude: isSolar ? 0.6 : 0.2,
      },
      {
        type: 'mystical_trigger',
        magnitude: isSolar ? 0.9 : 0.5,
      },
    ],
    resolved: false,
  };
}

/**
 * Apply the temporary climate effect of an eclipse — brief temperature drop.
 */
export function applyEclipseClimateEffect(region: Region, celestial: CelestialState): void {
  if (!celestial.isEclipse) return;

  if (celestial.eclipseType === 'solar') {
    // Solar eclipse: sudden temperature drop
    region.climate.temperature -= 5;
    region.climate.windSpeed += 3; // Eerie wind change
  } else {
    // Lunar eclipse: very slight temperature rise (less radiative cooling)
    region.climate.temperature += 0.5;
  }
}

// ============================================================
// Volcanic Activity
// ============================================================

export interface VolcanicState {
  pressure: number;    // 0–1, builds up over time
  erupting: boolean;
  eruptionTicksLeft: number;
  ashSpreadRegions: Set<RegionId>;
}

/** Module-level volcanic state per region. */
const volcanicStates: Map<RegionId, VolcanicState> = new Map();

/** Biomes / conditions that make volcanic activity more likely. */
function getVolcanicPotential(region: Region): number {
  if (region.layer === 'underground') return 0.3;
  if (region.biome === 'mountain') return 0.5;
  if (region.biome === 'hydrothermal_vent') return 0.7;
  if (region.elevation > 800) return 0.3;
  if (region.biome === 'coastal' && region.elevation > 200) return 0.2; // Island arc
  return 0;
}

function getVolcanicState(regionId: RegionId): VolcanicState {
  let state = volcanicStates.get(regionId);
  if (!state) {
    state = { pressure: 0, erupting: false, eruptionTicksLeft: 0, ashSpreadRegions: new Set() };
    volcanicStates.set(regionId, state);
  }
  return state;
}

/**
 * Update volcanic pressure and check for eruptions.
 * Returns a world event if an eruption occurs this tick.
 */
export function updateVolcanicActivity(
  region: Region,
  time: GameTime,
  allRegions: Map<RegionId, Region>,
): WorldEvent | null {
  const potential = getVolcanicPotential(region);
  if (potential <= 0) return null;

  const vs = getVolcanicState(region.id);

  if (vs.erupting) {
    // Ongoing eruption: apply effects
    vs.eruptionTicksLeft--;
    region.climate.temperature -= 2; // Local cooling from ash blocking sun
    region.climate.humidity += 0.05;
    region.climate.precipitation += 10; // Acid rain potential

    // Ash spreads to connected regions
    for (const connId of region.connections) {
      if (worldRNG.chance(0.1)) {
        vs.ashSpreadRegions.add(connId);
      }
    }

    // Apply ash effects to spread regions
    for (const ashRegionId of vs.ashSpreadRegions) {
      const ashRegion = allRegions.get(ashRegionId);
      if (ashRegion) {
        ashRegion.climate.temperature -= 0.5;
        ashRegion.climate.pollution = Math.min(1, ashRegion.climate.pollution + 0.01);
      }
    }

    if (vs.eruptionTicksLeft <= 0) {
      vs.erupting = false;
      vs.pressure = 0;
      vs.ashSpreadRegions.clear();
    }

    return null; // Event was already generated at eruption start
  }

  // Build pressure slowly
  vs.pressure += potential * worldRNG.float(0.0001, 0.001);
  vs.pressure = Math.min(1, vs.pressure);

  // Eruption chance scales with pressure
  const eruptionChance = vs.pressure > 0.7 ? (vs.pressure - 0.7) * 0.005 : 0;
  if (vs.pressure > 0.5 && worldRNG.chance(eruptionChance)) {
    vs.erupting = true;
    vs.eruptionTicksLeft = worldRNG.int(6, 24);
    vs.ashSpreadRegions = new Set([region.id]);

    // Global cooling effect — slight pollution increase everywhere would be
    // handled by spreadPollution over time, but we spike local pollution
    region.climate.pollution = Math.min(1, region.climate.pollution + 0.15);

    const affectedIds = [region.id, ...region.connections];
    return {
      id: crypto.randomUUID(),
      type: 'natural_disaster',
      level: 'continental',
      regionIds: affectedIds,
      description: `A volcanic eruption rocks ${region.name}! Ash fills the sky, temperatures plummet, and rivers of molten rock reshape the landscape.`,
      tick: time.tick,
      effects: [
        {
          type: 'volcanic_eruption',
          regionId: region.id,
          magnitude: vs.pressure,
        },
        {
          type: 'climate_disruption',
          regionId: region.id,
          magnitude: 0.8,
        },
        ...region.connections.map(connId => ({
          type: 'ash_fallout',
          regionId: connId,
          magnitude: 0.3,
        })),
      ],
      resolved: false,
    };
  }

  return null;
}

// ============================================================
// Natural Disasters (enhanced)
// ============================================================

/**
 * Check for natural disasters. Enhanced with volcanic eruptions,
 * drought events, and pollution-amplified extreme weather.
 */
export function checkNaturalDisaster(
  region: Region,
  time: GameTime,
  allRegions?: Map<RegionId, Region>,
): WorldEvent | null {
  const rng = worldRNG;

  // Volcanic activity check (needs allRegions for ash spread)
  if (allRegions) {
    const volcanicEvent = updateVolcanicActivity(region, time, allRegions);
    if (volcanicEvent) return volcanicEvent;
  }

  // Drought event generation
  const ds = getDroughtState(region.id);
  if (ds.active && ds.severity > 0.5 && rng.chance(0.005 * ds.severity)) {
    return {
      id: crypto.randomUUID(),
      type: 'weather_extreme',
      level: 'regional',
      regionIds: [region.id],
      description: `A severe drought grips ${region.name}. Water sources run dry, vegetation withers, and the earth cracks beneath an unforgiving sun.`,
      tick: time.tick,
      effects: [
        {
          type: 'drought',
          regionId: region.id,
          magnitude: ds.severity,
        },
        {
          type: 'resource_depletion',
          regionId: region.id,
          magnitude: ds.severity * 0.5,
        },
      ],
      resolved: false,
    };
  }

  // Base disaster probability — pollution increases extreme weather likelihood
  const pollutionMultiplier = 1 + region.climate.pollution * 4; // Up to 5x at max pollution
  const baseChance = 0.0001 * pollutionMultiplier;

  if (!rng.chance(baseChance)) return null;

  const disasters = [
    {
      type: 'natural_disaster' as const,
      desc: 'earthquake',
      weight: region.elevation > 500 ? 3 : 1,
    },
    {
      type: 'natural_disaster' as const,
      desc: 'flood',
      weight: region.climate.precipitation > 80 ? 3 : 0.5,
    },
    {
      type: 'weather_extreme' as const,
      desc: 'severe storm',
      weight: region.climate.windSpeed > 30 ? 3 : 1,
    },
    {
      type: 'natural_disaster' as const,
      desc: 'wildfire',
      weight: region.climate.humidity < 0.3 ? 3 : 0.2,
    },
    {
      type: 'natural_disaster' as const,
      desc: 'landslide',
      weight: region.elevation > 400 && region.climate.precipitation > 50 ? 2.5 : 0.3,
    },
    {
      type: 'weather_extreme' as const,
      desc: 'tornado',
      weight: region.biome === 'grassland' || region.biome === 'savanna' ? 2 : 0.3,
    },
    {
      type: 'weather_extreme' as const,
      desc: 'tsunami',
      weight: COASTAL_BIOMES.has(region.biome) ? 1.5 : 0,
    },
  ];

  const validDisasters = disasters.filter(d => d.weight > 0);
  if (validDisasters.length === 0) return null;

  const chosen = rng.weighted(validDisasters, validDisasters.map(d => d.weight));

  return {
    id: crypto.randomUUID(),
    type: chosen.type,
    level: 'regional',
    regionIds: [region.id],
    description: `A ${chosen.desc} strikes ${region.name}`,
    tick: time.tick,
    effects: [{
      type: 'climate_disruption',
      regionId: region.id,
      magnitude: rng.float(0.3, 1.0),
    }],
    resolved: false,
  };
}

// ============================================================
// World-Level Climate Tick
// ============================================================

/**
 * Run a full climate tick for the entire world.
 * Handles weather front advancement, pollution spread, tidal effects,
 * and per-region weather updates.
 *
 * Returns any world events generated this tick (eclipses, disasters).
 */
export function tickWorldClimate(
  regions: Map<RegionId, Region>,
  time: GameTime,
): WorldEvent[] {
  const events: WorldEvent[] = [];

  // Advance persistent weather fronts
  advanceWeatherFronts(regions);

  // Spread pollution
  spreadPollution(regions);

  // Compute celestial state once (use latitude 0 for global checks)
  const globalCelestial = getCelestialState(time, 0);

  // Eclipse event
  if (globalCelestial.isEclipse) {
    const allRegionIds = [...regions.keys()];
    events.push(createEclipseEvent(globalCelestial, time, allRegionIds));
  }

  // Per-region updates
  for (const [, region] of regions) {
    const celestial = getCelestialState(time, region.latitude);

    // Core weather update
    updateRegionWeather(region, time);

    // Eclipse climate effect
    if (globalCelestial.isEclipse) {
      applyEclipseClimateEffect(region, globalCelestial);
    }

    // Tidal effects for coastal / underwater regions
    applyTidalEffects(region, celestial);

    // Natural disasters (including volcanic, drought)
    const disaster = checkNaturalDisaster(region, time, regions);
    if (disaster) {
      events.push(disaster);
    }
  }

  return events;
}

// ============================================================
// Utility Exports
// ============================================================

/** Get active weather fronts affecting a specific region. */
export function getActiveFronts(regionId: RegionId): WeatherFront[] {
  const result: WeatherFront[] = [];
  for (const front of activeWeatherFronts.values()) {
    if (front.affectedRegionIds.has(regionId)) {
      result.push(front);
    }
  }
  return result;
}

/** Get the current drought state for a region. */
export function getRegionDroughtState(regionId: RegionId): DroughtState {
  return getDroughtState(regionId);
}

/** Get the current volcanic state for a region (if any). */
export function getRegionVolcanicState(regionId: RegionId): VolcanicState | null {
  return volcanicStates.get(regionId) ?? null;
}

/** Reset all module-level state (for testing or world reset). */
export function resetClimateState(): void {
  activeWeatherFronts.clear();
  droughtStates.clear();
  volcanicStates.clear();
}
