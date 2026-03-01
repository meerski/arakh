// ============================================================
// RNG Module — Seeded + Non-Deterministic Elements
// ============================================================
// Uses a seeded PRNG for reproducibility with entropy injection
// for anti-gaming. Hidden variables shift based on time, history,
// and true randomness.

export class GameRNG {
  private state: number;
  private entropy: number;

  constructor(seed?: number) {
    this.state = seed ?? Date.now();
    this.entropy = 0;
  }

  /** Inject entropy from external sources (time, agent behavior, etc.) */
  injectEntropy(value: number): void {
    this.entropy = (this.entropy + value) & 0x7fffffff;
  }

  /** Core xorshift32 PRNG */
  private next(): number {
    let s = this.state ^ (this.entropy & 0xff);
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    this.state = s >>> 0;
    // Slowly mix entropy
    this.entropy = (this.entropy * 1103515245 + 12345) & 0x7fffffff;
    return this.state;
  }

  /** Random float in [0, 1) */
  random(): number {
    return this.next() / 0x100000000;
  }

  /** Random integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return min + Math.floor(this.random() * (max - min + 1));
  }

  /** Random float in [min, max) */
  float(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  /** Random boolean with given probability of true */
  chance(probability: number): boolean {
    return this.random() < probability;
  }

  /** Pick a random element from an array */
  pick<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot pick from empty array');
    return array[this.int(0, array.length - 1)];
  }

  /** Shuffle array in place (Fisher-Yates) */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /** Weighted random selection */
  weighted<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) throw new Error('Items and weights must have same length');
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** Gaussian distribution (Box-Muller transform) */
  gaussian(mean: number = 0, stddev: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stddev;
  }

  /** Non-deterministic modifier — adds hidden variance based on world state */
  applyWorldNoise(baseValue: number, tick: number, regionSalt: number): number {
    // Combine tick, region, and entropy to create unpredictable modifier
    const noise = Math.sin(tick * 0.1 + regionSalt * 0.7 + this.entropy * 0.01) * 0.1;
    return baseValue * (1 + noise);
  }

  /** Get current state for serialization */
  getState(): { state: number; entropy: number } {
    return { state: this.state, entropy: this.entropy };
  }

  /** Restore from serialized state */
  static fromState(saved: { state: number; entropy: number }): GameRNG {
    const rng = new GameRNG();
    rng.state = saved.state;
    rng.entropy = saved.entropy;
    return rng;
  }
}

// Global RNG instance — inject entropy each tick
export let worldRNG = new GameRNG();
export function _installWorldRNG(instance: GameRNG): void { worldRNG = instance; }
