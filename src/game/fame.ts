// ============================================================
// Fame Tracking & Legendary Status
// ============================================================

import type { Character, CharacterId, SpeciesId, CardRarity } from '../types.js';
import { speciesRegistry } from '../species/species.js';

export interface FameEntry {
  characterId: CharacterId;
  characterName: string;
  speciesId: SpeciesId;
  speciesName: string;
  fameScore: number;
  achievements: string[];
  era: string;
  isLegendary: boolean;
}

/** Fame thresholds */
export const FAME_THRESHOLDS = {
  notable: 50,
  famous: 150,
  legendary: 500,
  mythical: 1500,
} as const;

/** Determine card rarity boost from fame */
export function fameToCardRarity(fame: number): CardRarity {
  if (fame >= FAME_THRESHOLDS.mythical) return 'mythic';
  if (fame >= FAME_THRESHOLDS.legendary) return 'legendary';
  if (fame >= FAME_THRESHOLDS.famous) return 'epic';
  if (fame >= FAME_THRESHOLDS.notable) return 'rare';
  if (fame >= 25) return 'uncommon';
  return 'common';
}

/** Fame points for common actions */
export const FAME_POINTS = {
  first_species_sighting: 5,
  discovery: 10,
  craft_item: 2,
  build_structure: 3,
  kill_opponent: 5,
  produce_offspring: 3,
  teach_knowledge: 2,
  experiment_success: 8,
  survive_disaster: 15,
  first_contact: 20,
  territorial_conquest: 10,
  long_survival: 1,  // per 1000 ticks alive
} as const;

export class FameTracker {
  private hallOfFame: FameEntry[] = [];

  /** Record an achievement and add fame points */
  recordAchievement(character: Character, achievement: string, points: number, tick: number = 0): void {
    character.fame += points;
    character.achievements.push({
      id: crypto.randomUUID(),
      name: achievement,
      description: achievement,
      tick,
    });
  }

  /** Check if character has reached legendary status */
  isLegendary(character: Character): boolean {
    return character.fame >= FAME_THRESHOLDS.legendary;
  }

  /** Add to hall of fame (called on death or when reaching legendary) */
  addToHallOfFame(entry: FameEntry): void {
    // Don't duplicate
    if (this.hallOfFame.some(e => e.characterId === entry.characterId)) return;
    this.hallOfFame.push(entry);
    this.hallOfFame.sort((a, b) => b.fameScore - a.fameScore);
  }

  /** Finalize a character's fame entry (on death) */
  finalizeCharacterFame(character: Character, era: string): FameEntry {
    const species = speciesRegistry.get(character.speciesId);
    const entry: FameEntry = {
      characterId: character.id,
      characterName: character.name,
      speciesId: character.speciesId,
      speciesName: species?.commonName ?? 'Unknown',
      fameScore: character.fame,
      achievements: character.achievements.map(a => a.name),
      era,
      isLegendary: this.isLegendary(character),
    };

    if (character.fame >= FAME_THRESHOLDS.notable) {
      this.addToHallOfFame(entry);
    }

    return entry;
  }

  /** Get top famous characters */
  getTopFamous(limit: number = 10): FameEntry[] {
    return this.hallOfFame.slice(0, limit);
  }

  /** Get fame entries for a species */
  getFameBySpecies(speciesId: SpeciesId): FameEntry[] {
    return this.hallOfFame.filter(e => e.speciesId === speciesId);
  }

  /** Get all legendary characters */
  getLegendaries(): FameEntry[] {
    return this.hallOfFame.filter(e => e.isLegendary);
  }

  /** Get hall of fame size */
  get size(): number {
    return this.hallOfFame.length;
  }

  /** Clear (for testing) */
  clear(): void {
    this.hallOfFame.length = 0;
  }
}

export const fameTracker = new FameTracker();

// ============================================================
// Cross-Species Standing
// ============================================================

/** Track standing between species at the population level */
export interface SpeciesStanding {
  speciesA: SpeciesId;
  speciesB: SpeciesId;
  standing: number;  // -1 (war) to 1 (alliance)
  interactions: number;
}

export class StandingMap {
  private standings: Map<string, SpeciesStanding> = new Map();

  private key(a: SpeciesId, b: SpeciesId): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
  }

  /** Get or create standing between two species */
  get(a: SpeciesId, b: SpeciesId): SpeciesStanding {
    const k = this.key(a, b);
    let standing = this.standings.get(k);
    if (!standing) {
      standing = { speciesA: a, speciesB: b, standing: 0, interactions: 0 };
      this.standings.set(k, standing);
    }
    return standing;
  }

  /** Record an interaction that modifies standing */
  recordInteraction(a: SpeciesId, b: SpeciesId, delta: number): void {
    if (a === b) return;
    const s = this.get(a, b);
    s.interactions++;
    s.standing = Math.max(-1, Math.min(1, s.standing + delta));
  }

  /** Check if two species are hostile */
  areHostile(a: SpeciesId, b: SpeciesId): boolean {
    return this.get(a, b).standing < -0.5;
  }

  /** Check if two species are allied */
  areAllied(a: SpeciesId, b: SpeciesId): boolean {
    return this.get(a, b).standing > 0.5;
  }

  /** Get all standings */
  getAll(): SpeciesStanding[] {
    return Array.from(this.standings.values());
  }

  /** Clear (for testing) */
  clear(): void {
    this.standings.clear();
  }
}

export const speciesStandings = new StandingMap();

// ============================================================
// Debt System
// ============================================================

export interface Debt {
  id: string;
  debtorId: CharacterId;
  creditorId: CharacterId;
  reason: string;
  magnitude: number;  // 0-1
  createdAtTick: number;
  resolved: boolean;
}

export class DebtLedger {
  private debts: Debt[] = [];

  /** Record a new debt */
  addDebt(debtorId: CharacterId, creditorId: CharacterId, reason: string, magnitude: number, tick: number): Debt {
    const debt: Debt = {
      id: crypto.randomUUID(),
      debtorId,
      creditorId,
      reason,
      magnitude: Math.max(0, Math.min(1, magnitude)),
      createdAtTick: tick,
      resolved: false,
    };
    this.debts.push(debt);
    return debt;
  }

  /** Get unresolved debts for a character */
  getDebts(characterId: CharacterId): Debt[] {
    return this.debts.filter(d => d.debtorId === characterId && !d.resolved);
  }

  /** Get debts owed TO a character */
  getCredits(characterId: CharacterId): Debt[] {
    return this.debts.filter(d => d.creditorId === characterId && !d.resolved);
  }

  /** Resolve a debt */
  resolve(debtId: string): void {
    const debt = this.debts.find(d => d.id === debtId);
    if (debt) debt.resolved = true;
  }

  /** Transfer debts from parent to heir (legacy) */
  transferDebts(fromId: CharacterId, toId: CharacterId): void {
    for (const debt of this.debts) {
      if (debt.debtorId === fromId && !debt.resolved) {
        debt.debtorId = toId;
        debt.magnitude *= 0.7; // Diluted by inheritance
      }
    }
  }

  /** Clear (for testing) */
  clear(): void {
    this.debts.length = 0;
  }
}

export const debtLedger = new DebtLedger();
