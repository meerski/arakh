// ============================================================
// Evolving Environmental Catastrophe System
// ============================================================
// Catastrophes emerge from species behavior, not random templates.
// Pollution → disease. Overgrazing → floods. Overpopulation → famine.

import type { Region, RegionId, SpeciesId, WorldEvent, CharacterId } from '../types.js';
import { worldRNG } from './random.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';
import type { EcosystemState } from './ecosystem.js';

// ============================================================
// Types
// ============================================================

export type CatastropheType =
  | 'disease_outbreak' | 'famine' | 'flood' | 'landslide'
  | 'forest_fire' | 'rockfall' | 'lightning_storm' | 'plague'
  | 'toxic_bloom' | 'insect_swarm' | 'ice_age_pulse' | 'supervolcano';

export interface EnvironmentalStress {
  regionId: RegionId;
  pollution: number;        // 0-1
  deforestation: number;    // 0-1
  overpopulation: number;   // 0-1
  waterStress: number;      // 0-1
  soilDegradation: number;  // 0-1
  diseaseRisk: number;      // 0-1
}

export interface CatastropheEffect {
  type: 'population_kill' | 'resource_destroy' | 'plant_destroy' | 'family_wipe'
    | 'climate_shift' | 'mutation_surge' | 'terrain_change';
  magnitude: number;
  speciesFilter?: SpeciesId;
}

export interface Catastrophe {
  id: string;
  type: CatastropheType;
  regionIds: RegionId[];
  severity: number;          // 0-1
  tickStarted: number;
  duration: number;
  ticksRemaining: number;
  cause: string;
  effects: CatastropheEffect[];
  mutationBonus: number;
}

// ============================================================
// Catastrophe Engine — singleton
// ============================================================

export class CatastropheEngine {
  private stressMap: Map<RegionId, EnvironmentalStress> = new Map();
  private activeCatastrophes: Map<string, Catastrophe> = new Map();
  private overpopulationTicks: Map<RegionId, number> = new Map();

  /** Calculate environmental stress for a region */
  calculateStress(region: Region, ecosystem: EcosystemState): EnvironmentalStress {
    const capacity = ecosystem.carryingCapacity.get(region.id) ?? 10000;
    const totalPop = region.populations.reduce((s, p) => s + p.count, 0);

    // Deforestation: ratio of destroyed/low plant biomass
    let deforestation = 0;
    if (region.plantPopulations.length > 0) {
      const totalBiomass = region.plantPopulations.reduce((s, p) => s + p.biomass, 0);
      const totalMax = region.plantPopulations.reduce((s, p) => s + p.maxBiomass, 0);
      deforestation = totalMax > 0 ? 1 - totalBiomass / totalMax : 0;
    }

    // Overpopulation
    const overpopulation = Math.min(1, totalPop / Math.max(1, capacity));

    // Soil degradation from overgrazing
    const overgrazed = region.plantPopulations.filter(p => p.ticksBelowThreshold > 100).length;
    const soilDegradation = region.plantPopulations.length > 0
      ? overgrazed / region.plantPopulations.length
      : 0;

    // Water stress from drought/low humidity
    const waterStress = Math.max(0, 1 - region.climate.humidity);

    // Disease risk from combined factors
    const diseaseRisk = Math.min(1, (region.climate.pollution + overpopulation) / 2);

    const stress: EnvironmentalStress = {
      regionId: region.id,
      pollution: region.climate.pollution,
      deforestation,
      overpopulation,
      waterStress,
      soilDegradation,
      diseaseRisk,
    };

    this.stressMap.set(region.id, stress);
    return stress;
  }

  /** Check if stress levels trigger a catastrophe */
  checkCatastropheTriggers(region: Region, stress: EnvironmentalStress, tick: number): Catastrophe | null {
    // Don't trigger multiple catastrophes in the same region
    for (const cat of this.activeCatastrophes.values()) {
      if (cat.regionIds.includes(region.id)) return null;
    }

    // Disease outbreak: pollution + overpopulation
    if (stress.pollution > 0.6 && stress.overpopulation > 0.5 &&
        stress.pollution + stress.overpopulation > 1.2) {
      if (worldRNG.chance(0.05)) {
        return this.createCatastrophe(
          'disease_outbreak', [region.id], 0.5 + stress.diseaseRisk * 0.3,
          tick, 200,
          'Pollution and overcrowding bred disease',
          [{ type: 'population_kill', magnitude: 0.3 }],
        );
      }
    }

    // Flood/landslide: deforestation + precipitation
    if (stress.deforestation > 0.7 && region.climate.precipitation > 5) {
      if (worldRNG.chance(0.08)) {
        const type = region.elevation > 500 ? 'landslide' : 'flood';
        return this.createCatastrophe(
          type as CatastropheType, [region.id], 0.4 + stress.deforestation * 0.3,
          tick, 100,
          'Deforestation left the land vulnerable to heavy rains',
          [
            { type: 'population_kill', magnitude: 0.2 },
            { type: 'resource_destroy', magnitude: 0.3 },
          ],
        );
      }
    }

    // Forest fire: deforestation + dry conditions
    if (stress.deforestation > 0.3 && stress.deforestation < 0.8 &&
        region.climate.humidity < 0.3) {
      if (worldRNG.chance(0.04)) {
        return this.createCatastrophe(
          'forest_fire', [region.id], 0.5 + (1 - region.climate.humidity) * 0.3,
          tick, 150,
          'Dry conditions and sparse vegetation ignited a wildfire',
          [
            { type: 'plant_destroy', magnitude: 0.5 },
            { type: 'population_kill', magnitude: 0.15 },
          ],
        );
      }
    }

    // Famine: sustained overpopulation
    const overTicks = this.overpopulationTicks.get(region.id) ?? 0;
    if (stress.overpopulation > 0.8) {
      this.overpopulationTicks.set(region.id, overTicks + 25); // Called every 25 ticks
      if (overTicks > 200 && worldRNG.chance(0.1)) {
        return this.createCatastrophe(
          'famine', [region.id], 0.6 + stress.overpopulation * 0.2,
          tick, 300,
          'Sustained overpopulation exhausted all food sources',
          [{ type: 'population_kill', magnitude: 0.25 }],
        );
      }
    } else {
      this.overpopulationTicks.set(region.id, Math.max(0, overTicks - 10));
    }

    // Toxic bloom: pollution + water stress in aquatic biomes
    const aquaticBiomes = ['coral_reef', 'open_ocean', 'deep_ocean', 'kelp_forest'];
    if (aquaticBiomes.includes(region.biome) &&
        stress.pollution > 0.8 && stress.waterStress > 0.3) {
      if (worldRNG.chance(0.06)) {
        return this.createCatastrophe(
          'toxic_bloom', [region.id], 0.5 + stress.pollution * 0.3,
          tick, 250,
          'Pollution and heat spawned a massive toxic algal bloom',
          [
            { type: 'population_kill', magnitude: 0.3 },
            { type: 'resource_destroy', magnitude: 0.4 },
          ],
        );
      }
    }

    // Soil degradation → herbivore famine
    if (stress.soilDegradation > 0.7) {
      // Check if plant biomass is critically low
      const totalBiomass = region.plantPopulations.reduce((s, p) => s + p.biomass, 0);
      const totalMax = region.plantPopulations.reduce((s, p) => s + p.maxBiomass, 0);
      if (totalMax > 0 && totalBiomass / totalMax < 0.1) {
        if (worldRNG.chance(0.08)) {
          return this.createCatastrophe(
            'famine', [region.id], 0.7,
            tick, 200,
            'Overgrazing destroyed the soil, starving herbivores',
            [{ type: 'population_kill', magnitude: 0.3 }],
          );
        }
      }
    }

    // Compound catastrophe: 3+ stresses above 0.5
    const stressValues = [
      stress.pollution, stress.deforestation, stress.overpopulation,
      stress.waterStress, stress.soilDegradation, stress.diseaseRisk,
    ];
    const highStresses = stressValues.filter(v => v > 0.5).length;
    if (highStresses >= 3 && worldRNG.chance(0.03)) {
      return this.createCatastrophe(
        'plague', [region.id], 0.7 + highStresses * 0.05,
        tick, 400,
        'Multiple environmental stresses cascaded into a devastating plague',
        [
          { type: 'population_kill', magnitude: 0.35 },
          { type: 'family_wipe', magnitude: 0.7 },
          { type: 'mutation_surge', magnitude: 0.5 },
        ],
      );
    }

    return null;
  }

  /** Tick active catastrophes — apply ongoing damage */
  tickCatastrophe(catastrophe: Catastrophe, regions: Map<string, Region>, tick: number): WorldEvent[] {
    const events: WorldEvent[] = [];
    catastrophe.ticksRemaining--;

    for (const regionId of catastrophe.regionIds) {
      const region = regions.get(regionId);
      if (!region) continue;

      for (const effect of catastrophe.effects) {
        switch (effect.type) {
          case 'population_kill': {
            // Kill a fraction of population each tick
            const killRate = effect.magnitude * catastrophe.severity * 0.001;
            for (const pop of region.populations) {
              if (effect.speciesFilter && pop.speciesId !== effect.speciesFilter) continue;
              const killed = Math.round(pop.count * killRate);
              if (killed > 0) {
                pop.count = Math.max(0, pop.count - killed);
                speciesRegistry.updatePopulation(pop.speciesId, -killed);
              }
            }
            break;
          }
          case 'resource_destroy': {
            const destroyRate = effect.magnitude * catastrophe.severity * 0.005;
            for (const res of region.resources) {
              res.quantity = Math.max(0, res.quantity * (1 - destroyRate));
            }
            break;
          }
          case 'plant_destroy': {
            const plantDestroyRate = effect.magnitude * catastrophe.severity * 0.005;
            for (const plant of region.plantPopulations) {
              if (!plant.permanentlyDestroyed) {
                plant.biomass = Math.max(0, plant.biomass * (1 - plantDestroyRate));
              }
            }
            break;
          }
          case 'family_wipe': {
            if (catastrophe.ticksRemaining === Math.floor(catastrophe.duration / 2)) {
              // Check family wipe only once at midpoint
              this.applyFamilyWipe(regionId, catastrophe.severity, tick);
            }
            break;
          }
          case 'climate_shift': {
            region.climate.temperature += (worldRNG.chance(0.5) ? 0.01 : -0.01) * effect.magnitude;
            break;
          }
          case 'mutation_surge': {
            // Handled via getEvolutionPressure
            break;
          }
          case 'terrain_change':
            break;
        }
      }
    }

    // Remove expired catastrophes
    if (catastrophe.ticksRemaining <= 0) {
      this.activeCatastrophes.delete(catastrophe.id);
      events.push({
        id: crypto.randomUUID(),
        type: 'catastrophe',
        level: 'regional',
        regionIds: [...catastrophe.regionIds],
        description: `The ${catastrophe.type.replace(/_/g, ' ')} has subsided. ${catastrophe.cause}.`,
        tick,
        effects: [{ type: 'catastrophe_end', magnitude: catastrophe.severity }],
        resolved: true,
      });
    }

    return events;
  }

  /** Apply family wipe — if all members of a family tree are in the affected region */
  applyFamilyWipe(regionId: RegionId, severity: number, tick: number): void {
    if (severity < 0.7) return;

    // Group living characters by family tree
    const familyRegions = new Map<string, { inRegion: number; total: number; characters: Character[] }>();
    type Character = { id: CharacterId; familyTreeId: string; regionId: string; isAlive: boolean;
      speciesId: string; diedAtTick: number | null; causeOfDeath: string | null; };

    for (const char of characterRegistry.getLiving()) {
      const key = char.familyTreeId;
      const entry = familyRegions.get(key) ?? { inRegion: 0, total: 0, characters: [] };
      entry.total++;
      if (char.regionId === regionId) {
        entry.inRegion++;
        entry.characters.push(char as any);
      }
      familyRegions.set(key, entry);
    }

    for (const [_familyId, data] of familyRegions) {
      // All members in the affected region
      if (data.inRegion === data.total && data.total > 0) {
        // Small species more vulnerable
        const species = speciesRegistry.get(data.characters[0]?.speciesId ?? '');
        const sizeVulnerability = species && species.traits.size < 20 ? 0.4 : 0.15;

        if (worldRNG.chance(sizeVulnerability * severity)) {
          for (const char of data.characters) {
            const c = characterRegistry.get(char.id);
            if (c && c.isAlive) {
              characterRegistry.markDead(c.id, tick, 'family wiped by catastrophe');
            }
          }
        }
      }
    }
  }

  /** Get evolution pressure from active catastrophes */
  getEvolutionPressure(regionId: RegionId): number {
    let pressure = 1.0;
    for (const cat of this.activeCatastrophes.values()) {
      if (cat.regionIds.includes(regionId)) {
        // 2-5x speciation bonus based on severity
        pressure += 1 + cat.severity * 3;
      }
    }
    return pressure;
  }

  /** Get active catastrophes in a region */
  getActiveCatastrophes(regionId: RegionId): Catastrophe[] {
    return Array.from(this.activeCatastrophes.values()).filter(
      c => c.regionIds.includes(regionId),
    );
  }

  /** Get all active catastrophes */
  getAllActive(): Catastrophe[] {
    return Array.from(this.activeCatastrophes.values());
  }

  /** Get stress for a region */
  getStress(regionId: RegionId): EnvironmentalStress | undefined {
    return this.stressMap.get(regionId);
  }

  private createCatastrophe(
    type: CatastropheType,
    regionIds: RegionId[],
    severity: number,
    tick: number,
    duration: number,
    cause: string,
    effects: CatastropheEffect[],
  ): Catastrophe {
    const catastrophe: Catastrophe = {
      id: crypto.randomUUID(),
      type,
      regionIds: [...regionIds],
      severity: Math.min(1, severity),
      tickStarted: tick,
      duration,
      ticksRemaining: duration,
      cause,
      effects,
      mutationBonus: severity * 3,
    };
    this.activeCatastrophes.set(catastrophe.id, catastrophe);
    return catastrophe;
  }

  clear(): void {
    this.stressMap.clear();
    this.activeCatastrophes.clear();
    this.overpopulationTicks.clear();
  }
}

export let catastropheEngine = new CatastropheEngine();
export function _installCatastropheEngine(instance: CatastropheEngine): void { catastropheEngine = instance; }
