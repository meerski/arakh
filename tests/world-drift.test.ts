import { describe, it, expect, beforeEach } from 'vitest';
import { worldDrift } from '../src/security/world-drift.js';
import type { WorldCoefficients, DriftCycle } from '../src/security/world-drift.js';

describe('World Drift Engine', () => {
  beforeEach(() => {
    worldDrift.reset();
  });

  // -------------------------------------------------------
  // 1. Coefficients center around 1.0
  // -------------------------------------------------------
  describe('Coefficient centering', () => {
    it('all coefficients are centered on 1.0 ± amplitude at any tick', () => {
      const tick = 500;
      const domains = [
        'combat_strength',
        'combat_speed',
        'foraging',
        'breeding',
        'predator_detection',
        'exploration',
        'alliance_decay',
        'resource_renew',
        'disease_resistance',
        'migration_risk',
      ];

      for (const domain of domains) {
        const coeff = worldDrift.getCoefficient(domain, tick);
        expect(coeff).toBeGreaterThan(0.7); // All amplitudes are at most 0.25, so min is ~0.75
        expect(coeff).toBeLessThan(1.3); // Max is ~1.25
        // Coefficient may swing ± amplitude, just verify it's in valid range
      }
    });

    it('mean of coefficients across multiple ticks approaches 1.0', () => {
      const domain = 'combat_strength';
      const coefficients: number[] = [];

      for (let tick = 0; tick < 10000; tick++) {
        coefficients.push(worldDrift.getCoefficient(domain, tick));
      }

      const mean = coefficients.reduce((a, b) => a + b, 0) / coefficients.length;
      expect(mean).toBeCloseTo(1.0, 1);
    });
  });

  // -------------------------------------------------------
  // 2. Coefficients vary with tick
  // -------------------------------------------------------
  describe('Coefficient variation with time', () => {
    it('same domain returns different values at tick 0 vs tick 500', () => {
      const domain = 'foraging';
      const coeff0 = worldDrift.getCoefficient(domain, 0);
      const coeff500 = worldDrift.getCoefficient(domain, 500);

      expect(coeff0).not.toEqual(coeff500);
    });

    it('coefficients vary periodically with expected period', () => {
      const domain = 'combat_strength';
      const period = 1800; // From source code

      const coeff0 = worldDrift.getCoefficient(domain, 0);
      const coeffPeriod = worldDrift.getCoefficient(domain, period);

      // Should be very close after one full period (not exact due to floating point)
      expect(coeffPeriod).toBeCloseTo(coeff0, 5);
    });

    it('coefficient cycles through low and high values over period', () => {
      const domain = 'foraging';
      const period = 1200; // Foraging period
      const cycles: number[] = [];

      for (let tick = 0; tick <= period * 2; tick += Math.floor(period / 4)) {
        cycles.push(worldDrift.getCoefficient(domain, tick));
      }

      // Should see variation across the quarter-period samples
      const max = Math.max(...cycles);
      const min = Math.min(...cycles);
      expect(max - min).toBeGreaterThan(0.1); // Noticeable variation
    });
  });

  // -------------------------------------------------------
  // 3. Region salt differentiates same-tick coefficients
  // -------------------------------------------------------
  describe('Region salt variation', () => {
    it('same tick different regions have different coefficients', () => {
      const domain = 'breeding';
      const tick = 1000;
      const salt1 = 100;
      const salt2 = 200;

      const coeff1 = worldDrift.getCoefficient(domain, tick, salt1);
      const coeff2 = worldDrift.getCoefficient(domain, tick, salt2);

      expect(coeff1).not.toEqual(coeff2);
    });

    it('region salt shifts coefficient by roughly proportional amount', () => {
      const domain = 'predator_detection';
      const tick = 500;

      const baseline = worldDrift.getCoefficient(domain, tick, 0);
      const withSalt1 = worldDrift.getCoefficient(domain, tick, 50);
      const withSalt2 = worldDrift.getCoefficient(domain, tick, 100);

      // Each increment of salt should shift phase, causing different values
      expect(withSalt1).not.toEqual(baseline);
      expect(withSalt2).not.toEqual(withSalt1);
    });

    it('zero salt gives consistent baseline', () => {
      const domain = 'exploration';
      const tick = 750;

      const coeff1 = worldDrift.getCoefficient(domain, tick, 0);
      const coeff2 = worldDrift.getCoefficient(domain, tick, 0);

      expect(coeff1).toEqual(coeff2);
    });

    it('negative salt also differentiates from zero salt', () => {
      const domain = 'alliance_decay';
      const tick = 300;

      const zeroSalt = worldDrift.getCoefficient(domain, tick, 0);
      const negativeSalt = worldDrift.getCoefficient(domain, tick, -50);

      expect(zeroSalt).not.toEqual(negativeSalt);
    });
  });

  // -------------------------------------------------------
  // 4. All 10 domains return valid coefficients
  // -------------------------------------------------------
  describe('All 10 domains valid', () => {
    it('returns valid coefficient for all 10 domains at tick 0', () => {
      const domains = [
        'combat_strength',
        'combat_speed',
        'foraging',
        'breeding',
        'predator_detection',
        'exploration',
        'alliance_decay',
        'resource_renew',
        'disease_resistance',
        'migration_risk',
      ];

      for (const domain of domains) {
        const coeff = worldDrift.getCoefficient(domain, 0);
        expect(coeff).toBeGreaterThan(0);
        expect(Number.isFinite(coeff)).toBe(true);
        expect(isNaN(coeff)).toBe(false);
      }
    });

    it('returns valid coefficient for all 10 domains at arbitrary tick', () => {
      const domains = [
        'combat_strength',
        'combat_speed',
        'foraging',
        'breeding',
        'predator_detection',
        'exploration',
        'alliance_decay',
        'resource_renew',
        'disease_resistance',
        'migration_risk',
      ];

      for (const domain of domains) {
        const coeff = worldDrift.getCoefficient(domain, 5432);
        expect(coeff).toBeGreaterThan(0);
        expect(Number.isFinite(coeff)).toBe(true);
        expect(isNaN(coeff)).toBe(false);
      }
    });

    it('unknown domain returns 1.0', () => {
      const unknown = worldDrift.getCoefficient('unknown_domain', 100);
      expect(unknown).toBe(1.0);
    });
  });

  // -------------------------------------------------------
  // 5. perturbFromEvent shifts coefficients
  // -------------------------------------------------------
  describe('Event perturbation', () => {
    it('perturbFromEvent changes phase values', () => {
      const cycles1 = worldDrift.getCycles();
      const phases1 = cycles1.map(c => c.phase);

      worldDrift.perturbFromEvent('catastrophe', 1.0);

      const cycles2 = worldDrift.getCycles();
      const phases2 = cycles2.map(c => c.phase);

      // At least some phases should change
      const changedCount = phases1.filter((p, i) => p !== phases2[i]).length;
      expect(changedCount).toBeGreaterThan(0);
    });

    it('different event types cause different perturbations', () => {
      const coeff_base = worldDrift.getCoefficient('combat_strength', 1000);

      worldDrift.reset();
      worldDrift.perturbFromEvent('war', 1.0);
      const coeff_war = worldDrift.getCoefficient('combat_strength', 1000);

      worldDrift.reset();
      worldDrift.perturbFromEvent('disease', 1.0);
      const coeff_disease = worldDrift.getCoefficient('combat_strength', 1000);

      // War should affect combat_strength more than disease does (from affinity map)
      const war_delta = Math.abs(coeff_war - coeff_base);
      const disease_delta = Math.abs(coeff_disease - coeff_base);

      expect(war_delta).toBeGreaterThan(disease_delta);
    });

    it('larger magnitude causes larger perturbation', () => {
      const coeff_base = worldDrift.getCoefficient('breeding', 1000);

      worldDrift.reset();
      worldDrift.perturbFromEvent('plague', 0.5);
      const coeff_small = worldDrift.getCoefficient('breeding', 1000);

      worldDrift.reset();
      worldDrift.perturbFromEvent('plague', 2.0);
      const coeff_large = worldDrift.getCoefficient('breeding', 1000);

      const delta_small = Math.abs(coeff_small - coeff_base);
      const delta_large = Math.abs(coeff_large - coeff_base);

      expect(delta_large).toBeGreaterThan(delta_small);
    });

    it('perturbation is cumulative', () => {
      const coeff_base = worldDrift.getCoefficient('foraging', 1000);

      worldDrift.perturbFromEvent('famine', 0.5);
      const coeff_once = worldDrift.getCoefficient('foraging', 1000);

      worldDrift.perturbFromEvent('famine', 0.5);
      const coeff_twice = worldDrift.getCoefficient('foraging', 1000);

      expect(Math.abs(coeff_twice - coeff_base)).toBeGreaterThan(
        Math.abs(coeff_once - coeff_base)
      );
    });
  });

  // -------------------------------------------------------
  // 6. No two 1000-tick windows have identical patterns
  // -------------------------------------------------------
  describe('Non-repetition across windows', () => {
    it('1000-tick windows have different coefficient patterns', () => {
      const domain = 'exploration';
      const window1: number[] = [];
      const window2: number[] = [];

      // Collect window 1: ticks 0-999
      for (let i = 0; i < 1000; i++) {
        window1.push(worldDrift.getCoefficient(domain, i));
      }

      // Collect window 2: ticks 10000-10999
      for (let i = 10000; i < 11000; i++) {
        window2.push(worldDrift.getCoefficient(domain, i));
      }

      // Windows should not be identical
      const identical = window1.every((v, i) => v === window2[i]);
      expect(identical).toBe(false);
    });

    it('overlapping windows from different regions differ', () => {
      const domain = 'resource_renew';
      const tick = 5000;
      const window_size = 1000;
      const salt1 = 0;
      const salt2 = 500;

      const window1: number[] = [];
      const window2: number[] = [];

      for (let i = 0; i < window_size; i++) {
        window1.push(worldDrift.getCoefficient(domain, tick + i, salt1));
        window2.push(worldDrift.getCoefficient(domain, tick + i, salt2));
      }

      // Windows should differ due to different salt
      const identical = window1.every((v, i) => v === window2[i]);
      expect(identical).toBe(false);
    });
  });

  // -------------------------------------------------------
  // 7. getWorldCoefficients returns all 10 fields
  // -------------------------------------------------------
  describe('getWorldCoefficients completeness', () => {
    it('returns all 10 coefficient fields', () => {
      const coeffs = worldDrift.getWorldCoefficients(1000);

      expect(coeffs).toHaveProperty('combatStrengthWeight');
      expect(coeffs).toHaveProperty('combatSpeedWeight');
      expect(coeffs).toHaveProperty('foragingSuccessBase');
      expect(coeffs).toHaveProperty('breedingSuccessModifier');
      expect(coeffs).toHaveProperty('predatorDetectionBase');
      expect(coeffs).toHaveProperty('explorationRewardMultiplier');
      expect(coeffs).toHaveProperty('allianceDecayRate');
      expect(coeffs).toHaveProperty('resourceRenewModifier');
      expect(coeffs).toHaveProperty('diseaseResistanceBase');
      expect(coeffs).toHaveProperty('migrationRiskModifier');
    });

    it('all fields in getWorldCoefficients are valid numbers', () => {
      const coeffs = worldDrift.getWorldCoefficients(500);

      const values = Object.values(coeffs);
      expect(values).toHaveLength(10);

      for (const val of values) {
        expect(typeof val).toBe('number');
        expect(val).toBeGreaterThan(0);
        expect(Number.isFinite(val)).toBe(true);
        expect(isNaN(val)).toBe(false);
      }
    });

    it('getWorldCoefficients matches individual getCoefficient calls', () => {
      const tick = 2000;
      const salt = 123;

      const world = worldDrift.getWorldCoefficients(tick, salt);

      expect(world.combatStrengthWeight).toBe(
        worldDrift.getCoefficient('combat_strength', tick, salt)
      );
      expect(world.combatSpeedWeight).toBe(
        worldDrift.getCoefficient('combat_speed', tick, salt)
      );
      expect(world.foragingSuccessBase).toBe(
        worldDrift.getCoefficient('foraging', tick, salt)
      );
      expect(world.breedingSuccessModifier).toBe(
        worldDrift.getCoefficient('breeding', tick, salt)
      );
      expect(world.predatorDetectionBase).toBe(
        worldDrift.getCoefficient('predator_detection', tick, salt)
      );
      expect(world.explorationRewardMultiplier).toBe(
        worldDrift.getCoefficient('exploration', tick, salt)
      );
      expect(world.allianceDecayRate).toBe(
        worldDrift.getCoefficient('alliance_decay', tick, salt)
      );
      expect(world.resourceRenewModifier).toBe(
        worldDrift.getCoefficient('resource_renew', tick, salt)
      );
      expect(world.diseaseResistanceBase).toBe(
        worldDrift.getCoefficient('disease_resistance', tick, salt)
      );
      expect(world.migrationRiskModifier).toBe(
        worldDrift.getCoefficient('migration_risk', tick, salt)
      );
    });
  });

  // -------------------------------------------------------
  // 8. getCycles returns complete cycle data
  // -------------------------------------------------------
  describe('getCycles introspection', () => {
    it('returns 10 cycles', () => {
      const cycles = worldDrift.getCycles();
      expect(cycles).toHaveLength(10);
    });

    it('each cycle has required fields', () => {
      const cycles = worldDrift.getCycles();

      for (const cycle of cycles) {
        expect(cycle).toHaveProperty('id');
        expect(cycle).toHaveProperty('domain');
        expect(cycle).toHaveProperty('period');
        expect(cycle).toHaveProperty('phase');
        expect(cycle).toHaveProperty('amplitude');
        expect(cycle).toHaveProperty('lastShiftTick');
      }
    });

    it('periods are prime-ish and incommensurable', () => {
      const cycles = worldDrift.getCycles();
      const periods = cycles.map(c => c.period);

      // All periods should be different
      const uniquePeriods = new Set(periods);
      expect(uniquePeriods.size).toBe(periods.length);

      // Expected periods from source
      const expectedPeriods = [1800, 2400, 1200, 3600, 900, 2100, 4800, 1500, 3000, 2700];
      expect(periods.sort((a, b) => a - b)).toEqual(expectedPeriods.sort((a, b) => a - b));
    });

    it('initial phase is zero after reset', () => {
      const cycles = worldDrift.getCycles();

      for (const cycle of cycles) {
        expect(cycle.phase).toBe(0);
      }
    });

    it('getCycles returns copy (not reference)', () => {
      const cycles1 = worldDrift.getCycles();
      const cycles2 = worldDrift.getCycles();

      expect(cycles1).not.toBe(cycles2);
      expect(cycles1).toEqual(cycles2);
    });
  });

  // -------------------------------------------------------
  // 9. reset() clears all perturbations
  // -------------------------------------------------------
  describe('reset behavior', () => {
    it('reset restores phases to zero', () => {
      worldDrift.perturbFromEvent('catastrophe', 2.0);
      let cycles = worldDrift.getCycles();
      const perturbed = cycles.some(c => c.phase !== 0);
      expect(perturbed).toBe(true);

      worldDrift.reset();
      cycles = worldDrift.getCycles();
      for (const cycle of cycles) {
        expect(cycle.phase).toBe(0);
      }
    });

    it('reset restores original coefficients', () => {
      const originalCoeff = worldDrift.getCoefficient('breeding', 500);

      worldDrift.perturbFromEvent('plague', 1.5);
      const perturbedCoeff = worldDrift.getCoefficient('breeding', 500);
      expect(perturbedCoeff).not.toEqual(originalCoeff);

      worldDrift.reset();
      const restoredCoeff = worldDrift.getCoefficient('breeding', 500);
      expect(restoredCoeff).toEqual(originalCoeff);
    });

    it('reset is idempotent', () => {
      worldDrift.reset();
      const cycles1 = worldDrift.getCycles();

      worldDrift.reset();
      const cycles2 = worldDrift.getCycles();

      expect(cycles1).toEqual(cycles2);
    });
  });
});
