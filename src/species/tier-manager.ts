// ============================================================
// Dynasty Tier Manager — Three-Tier Population Model
// ============================================================
// Manages transitions between Individual (1-149), Lineage (150-499),
// and Population (500+) tiers per family tree.
//
// Thresholds:
//   Individual → Lineage:    living members >= 150
//   Lineage → Population:    living members >= 500
//   Population → Lineage:    living members < 500  (down to 20)
//   Lineage → Individual:    living members < 20
//
// Hard cap: 5,000 individual Character objects across all trees.

import type {
  Character, CharacterId, FamilyTreeId, FamilyTree,
  DynastyTier, PopulationGenome,
} from '../types.js';
import { characterRegistry } from './registry.js';
import { lineageManager } from '../game/lineage.js';
import { buildPopulationGenome, sampleGeneticsFromGenome } from './population-genome.js';
import { createCharacter } from './character.js';

// --- Thresholds ---
const TIER_UP_LINEAGE = 150;
const TIER_UP_POPULATION = 500;
const TIER_DOWN_LINEAGE = 500;   // Pop → Lineage when below
const TIER_DOWN_INDIVIDUAL = 20; // Lineage → Individual when below
const MAX_INDIVIDUAL_CHARACTERS = 5000;

export interface TierTransitionEvent {
  familyTreeId: FamilyTreeId;
  oldTier: DynastyTier;
  newTier: DynastyTier;
  livingCount: number;
  narrative: string;
}

export class TierManager {
  /** Evaluate all family trees and trigger tier transitions. Returns narrative events. */
  evaluateAll(tick: number): TierTransitionEvent[] {
    const events: TierTransitionEvent[] = [];
    const allTrees = lineageManager.getAllTrees();

    for (const tree of allTrees) {
      if (tree.isExtinct) continue;

      const livingCount = this.countLivingMembers(tree);
      tree.populationCount = livingCount;

      const transition = this.evaluateTree(tree, livingCount, tick);
      if (transition) {
        events.push(transition);
      }
    }

    return events;
  }

  /** Evaluate a single tree and potentially transition its tier. */
  private evaluateTree(tree: FamilyTree, livingCount: number, tick: number): TierTransitionEvent | null {
    const currentTier = tree.tier;

    // Upward transitions
    if (currentTier === 'individual' && livingCount >= TIER_UP_LINEAGE) {
      return this.transitionToLineage(tree, livingCount, tick);
    }
    if (currentTier === 'lineage' && livingCount >= TIER_UP_POPULATION) {
      return this.transitionToPopulation(tree, livingCount, tick);
    }

    // Downward transitions
    if (currentTier === 'population' && livingCount < TIER_DOWN_LINEAGE) {
      return this.transitionToLineage(tree, livingCount, tick);
    }
    if (currentTier === 'lineage' && livingCount < TIER_DOWN_INDIVIDUAL) {
      return this.transitionToIndividual(tree, livingCount, tick);
    }

    return null;
  }

  /** Individual → Lineage: compress excess characters into population genome. */
  private transitionToLineage(tree: FamilyTree, livingCount: number, tick: number): TierTransitionEvent {
    const oldTier = tree.tier;

    // Build population genome from current living members
    const livingChars = this.getLivingCharacters(tree);
    tree.populationGenome = buildPopulationGenome(livingChars);

    // Archive oldest/least-important characters to stay under cap
    // Keep the most recent, highest-fame, and player-controlled characters
    const toKeep = Math.min(livingChars.length, 50); // Keep up to 50 standouts
    const sorted = [...livingChars].sort((a, b) => {
      // Player-controlled first
      if (a.playerId && !b.playerId) return -1;
      if (!a.playerId && b.playerId) return 1;
      // Then by fame
      if (b.fame !== a.fame) return b.fame - a.fame;
      // Then by recency
      return b.bornAtTick - a.bornAtTick;
    });

    const keep = new Set(sorted.slice(0, toKeep).map(c => c.id));
    for (const char of livingChars) {
      if (!keep.has(char.id)) {
        characterRegistry.markDead(char.id, tick, 'dynasty ascension (archived)');
      }
    }

    tree.tier = 'lineage';
    tree.populationCount = livingCount;

    return {
      familyTreeId: tree.id,
      oldTier,
      newTier: 'lineage',
      livingCount,
      narrative: `Dynasty Ascension! The ${tree.speciesId} family has grown to ${livingCount} members and ascended to Lineage tier.`,
    };
  }

  /** Lineage → Population: further compress, keep only a few standouts. */
  private transitionToPopulation(tree: FamilyTree, livingCount: number, tick: number): TierTransitionEvent {
    const oldTier = tree.tier;

    // Refresh genome from any remaining characters
    const livingChars = this.getLivingCharacters(tree);
    if (livingChars.length > 0) {
      tree.populationGenome = buildPopulationGenome(livingChars);
    }

    // Archive all except player-controlled and top 10 by fame
    const sorted = [...livingChars].sort((a, b) => {
      if (a.playerId && !b.playerId) return -1;
      if (!a.playerId && b.playerId) return 1;
      return b.fame - a.fame;
    });

    const keep = new Set(sorted.slice(0, 10).map(c => c.id));
    for (const char of livingChars) {
      if (!keep.has(char.id)) {
        characterRegistry.markDead(char.id, tick, 'dynasty ascension (archived)');
      }
    }

    tree.tier = 'population';
    tree.populationCount = livingCount;

    return {
      familyTreeId: tree.id,
      oldTier,
      newTier: 'population',
      livingCount,
      narrative: `The ${tree.speciesId} dynasty has become a thriving population of ${livingCount}, ascending to Population tier.`,
    };
  }

  /** Lineage → Individual: all remaining members become full characters. */
  private transitionToIndividual(tree: FamilyTree, livingCount: number, _tick: number): TierTransitionEvent {
    const oldTier = tree.tier;
    tree.tier = 'individual';

    return {
      familyTreeId: tree.id,
      oldTier,
      newTier: 'individual',
      livingCount,
      narrative: `The ${tree.speciesId} dynasty has dwindled to ${livingCount} members, returning to Individual tier.`,
    };
  }

  /** Spawn a standout character from a Lineage/Population tier tree. */
  spawnStandout(tree: FamilyTree, regionId: string, tick: number): Character | null {
    if (!tree.populationGenome || tree.populationGenome.sampleSize === 0) return null;
    if (characterRegistry.livingCount >= MAX_INDIVIDUAL_CHARACTERS) return null;

    const genetics = sampleGeneticsFromGenome(tree.populationGenome);
    const char = createCharacter({
      speciesId: tree.speciesId as any,
      regionId: regionId as any,
      familyTreeId: tree.id,
      tick,
      parentGenetics: [genetics, genetics], // Self-sampled from population
      generation: tree.generations,
    });

    characterRegistry.add(char);
    tree.members.push(char.id);

    return char;
  }

  /** Count living members of a family tree using the character registry index. */
  private countLivingMembers(tree: FamilyTree): number {
    const treeChars = characterRegistry.getByFamilyTree(tree.id);
    let living = 0;
    for (const char of treeChars) {
      if (char.isAlive) living++;
    }
    // For lineage/population tiers, the populationCount may exceed tracked characters
    if (tree.tier !== 'individual') {
      return Math.max(living, tree.populationCount);
    }
    return living;
  }

  /** Get all living characters in a family tree. */
  private getLivingCharacters(tree: FamilyTree): Character[] {
    return characterRegistry.getByFamilyTree(tree.id).filter(c => c.isAlive);
  }

  /** Check if the global character cap has been reached. */
  get atCharacterCap(): boolean {
    return characterRegistry.livingCount >= MAX_INDIVIDUAL_CHARACTERS;
  }
}

// Singleton
export let tierManager = new TierManager();

export function _installTierManager(instance: TierManager): void {
  tierManager = instance;
}
