import { describe, it, expect } from 'vitest';
import { GameRNG } from '../src/simulation/random.js';

describe('GameRNG', () => {
  it('produces deterministic results with same seed', () => {
    const rng1 = new GameRNG(42);
    const rng2 = new GameRNG(42);
    const results1 = Array.from({ length: 10 }, () => rng1.random());
    const results2 = Array.from({ length: 10 }, () => rng2.random());
    expect(results1).toEqual(results2);
  });

  it('produces different results with different seeds', () => {
    const rng1 = new GameRNG(42);
    const rng2 = new GameRNG(99);
    const r1 = rng1.random();
    const r2 = rng2.random();
    expect(r1).not.toBe(r2);
  });

  it('random() returns values in [0, 1)', () => {
    const rng = new GameRNG(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng.random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() returns values in range', () => {
    const rng = new GameRNG(42);
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('chance() respects probability', () => {
    const rng = new GameRNG(42);
    let trueCount = 0;
    const trials = 10000;
    for (let i = 0; i < trials; i++) {
      if (rng.chance(0.3)) trueCount++;
    }
    // Should be roughly 30% ± 3%
    expect(trueCount / trials).toBeGreaterThan(0.25);
    expect(trueCount / trials).toBeLessThan(0.35);
  });

  it('pick() selects from array', () => {
    const rng = new GameRNG(42);
    const items = ['a', 'b', 'c', 'd'];
    const picked = rng.pick(items);
    expect(items).toContain(picked);
  });

  it('shuffle() produces permutation', () => {
    const rng = new GameRNG(42);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...arr]);
    expect(shuffled.sort()).toEqual(arr);
  });

  it('weighted() respects weights', () => {
    const rng = new GameRNG(42);
    const items = ['heavy', 'light'];
    const weights = [9, 1];
    let heavyCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (rng.weighted(items, weights) === 'heavy') heavyCount++;
    }
    expect(heavyCount).toBeGreaterThan(800);
  });

  it('gaussian() centers around mean', () => {
    const rng = new GameRNG(42);
    let sum = 0;
    const n = 10000;
    for (let i = 0; i < n; i++) {
      sum += rng.gaussian(50, 10);
    }
    const avg = sum / n;
    expect(avg).toBeGreaterThan(48);
    expect(avg).toBeLessThan(52);
  });

  it('entropy injection changes output', () => {
    const rng1 = new GameRNG(42);
    const rng2 = new GameRNG(42);
    rng2.injectEntropy(12345);

    // After entropy injection, results should diverge
    const r1 = rng1.random();
    const r2 = rng2.random();
    expect(r1).not.toBe(r2);
  });

  it('serializes and restores state', () => {
    const rng = new GameRNG(42);
    // Advance state
    for (let i = 0; i < 50; i++) rng.random();

    const state = rng.getState();
    const restored = GameRNG.fromState(state);

    const original = Array.from({ length: 10 }, () => rng.random());
    const fromRestored = Array.from({ length: 10 }, () => restored.random());
    expect(original).toEqual(fromRestored);
  });
});
