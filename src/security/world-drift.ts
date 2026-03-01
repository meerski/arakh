// ============================================================
// World Drift Engine — Anti-Meta Sinusoidal Coefficient System
// ============================================================
// Every game formula references drifting coefficients that shift
// on incommensurable sine wave periods. No strategy is permanent.

export interface DriftCycle {
  id: string;
  domain: string;
  period: number;
  phase: number;
  amplitude: number;
  lastShiftTick: number;
}

export interface WorldCoefficients {
  combatStrengthWeight: number;
  combatSpeedWeight: number;
  foragingSuccessBase: number;
  breedingSuccessModifier: number;
  predatorDetectionBase: number;
  explorationRewardMultiplier: number;
  allianceDecayRate: number;
  resourceRenewModifier: number;
  diseaseResistanceBase: number;
  migrationRiskModifier: number;
}

const DOMAIN_MAP: Record<string, keyof WorldCoefficients> = {
  combat_strength: 'combatStrengthWeight',
  combat_speed: 'combatSpeedWeight',
  foraging: 'foragingSuccessBase',
  breeding: 'breedingSuccessModifier',
  predator_detection: 'predatorDetectionBase',
  exploration: 'explorationRewardMultiplier',
  alliance_decay: 'allianceDecayRate',
  resource_renew: 'resourceRenewModifier',
  disease_resistance: 'diseaseResistanceBase',
  migration_risk: 'migrationRiskModifier',
};

export class WorldDriftEngine {
  private cycles: DriftCycle[] = [];

  constructor() {
    this.initCycles();
  }

  private initCycles(): void {
    // Prime-ish periods ensure cycles never fully align
    const definitions: [string, number, number][] = [
      ['combat_strength', 1800, 0.15],
      ['combat_speed', 2400, 0.12],
      ['foraging', 1200, 0.2],
      ['breeding', 3600, 0.1],
      ['predator_detection', 900, 0.18],
      ['exploration', 2100, 0.15],
      ['alliance_decay', 4800, 0.25],
      ['resource_renew', 1500, 0.15],
      ['disease_resistance', 3000, 0.12],
      ['migration_risk', 2700, 0.18],
    ];

    this.cycles = definitions.map(([domain, period, amplitude]) => ({
      id: `drift_${domain}`,
      domain,
      period,
      phase: 0,
      amplitude,
      lastShiftTick: 0,
    }));
  }

  /** Get a single coefficient for a domain at a given tick */
  getCoefficient(domain: string, tick: number, regionSalt: number = 0): number {
    const cycle = this.cycles.find(c => c.domain === domain);
    if (!cycle) return 1.0;

    const effectivePhase = cycle.phase + regionSalt * 0.01;
    return 1.0 + Math.sin(2 * Math.PI * tick / cycle.period + effectivePhase) * cycle.amplitude;
  }

  /** Get all world coefficients at a given tick */
  getWorldCoefficients(tick: number, regionSalt: number = 0): WorldCoefficients {
    const coeffs: Record<string, number> = {};
    for (const [domain, key] of Object.entries(DOMAIN_MAP)) {
      coeffs[key] = this.getCoefficient(domain, tick, regionSalt);
    }
    return coeffs as unknown as WorldCoefficients;
  }

  /** Catastrophes and major events shift phases unpredictably */
  perturbFromEvent(eventType: string, magnitude: number): void {
    for (const cycle of this.cycles) {
      // Different events affect different domains more
      const affinity = this.getEventAffinity(cycle.domain, eventType);
      cycle.phase += affinity * magnitude * (Math.PI / 4);
    }
  }

  private getEventAffinity(domain: string, eventType: string): number {
    const affinities: Record<string, Record<string, number>> = {
      combat_strength: { catastrophe: 0.3, disease: 0.5, war: 0.8 },
      combat_speed: { catastrophe: 0.2, stampede: 0.6, migration: 0.4 },
      foraging: { famine: 0.9, flood: 0.6, drought: 0.7 },
      breeding: { disease: 0.7, catastrophe: 0.4, plague: 0.8 },
      predator_detection: { catastrophe: 0.3, forest_fire: 0.5 },
      exploration: { catastrophe: 0.4, anomaly: 0.6 },
      alliance_decay: { war: 0.6, catastrophe: 0.3 },
      resource_renew: { flood: 0.5, drought: 0.8, famine: 0.7 },
      disease_resistance: { plague: 0.9, disease: 0.8, catastrophe: 0.3 },
      migration_risk: { catastrophe: 0.6, flood: 0.4, forest_fire: 0.5 },
    };
    return affinities[domain]?.[eventType] ?? 0.1;
  }

  /** Get all cycles (for testing/inspection) */
  getCycles(): DriftCycle[] {
    return [...this.cycles];
  }

  /** Reset for testing */
  reset(): void {
    this.initCycles();
  }
}

export let worldDrift = new WorldDriftEngine();

export function _installWorldDrift(instance: WorldDriftEngine): void { worldDrift = instance; }
