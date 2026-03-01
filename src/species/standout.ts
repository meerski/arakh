// ============================================================
// Standout Emergence — Individual Heroes from Colonies
// ============================================================
// Standouts are individual characters that emerge from a colony
// and become player-controllable main characters. Three paths:
//   Statistical: highest traits in the colony genome
//   Event-driven: survived a crisis or achieved something notable
//   Player spotlight: player directs attention to an individual

import type { Colony, Character, CharacterId, StandoutOrigin } from '../types.js';
import { createCharacter } from './character.js';
import { characterRegistry } from './registry.js';
import { sampleGeneticsFromGenome } from './population-genome.js';
import { worldRNG } from '../simulation/random.js';

export interface StandoutEvent {
  characterId: CharacterId;
  colonyId: string;
  origin: StandoutOrigin;
  narrative: string;
}

/** Try to emerge a standout from a colony. Returns null if conditions not met. */
export function tryEmergeStandout(colony: Colony, tick: number): StandoutEvent | null {
  if (!colony.isAlive) return null;

  // Max standouts based on colony tier
  const maxStandouts = colony.tier + 1; // tier 1 = 2, tier 5 = 6
  if (colony.standoutIds.length >= maxStandouts) return null;

  // Must have at least 30 workers
  if (colony.workerCount < 30) return null;

  // Chance per tick (increases with tier)
  const chance = 0.002 * colony.tier;
  if (!worldRNG.chance(chance)) return null;

  // Pick emergence type
  const roll = worldRNG.float(0, 1);
  let origin: StandoutOrigin;
  if (roll < 0.5) origin = 'statistical';
  else if (roll < 0.85) origin = 'event';
  else origin = 'player_spotlight';

  // Create the standout character
  const genetics = colony.populationGenome
    ? sampleGeneticsFromGenome(colony.populationGenome)
    : { genes: [], mutationRate: 0.05 };

  const char = createCharacter({
    speciesId: colony.speciesId,
    regionId: colony.regionId,
    familyTreeId: colony.familyTreeId,
    tick,
    parentIds: undefined,
    sex: worldRNG.chance(0.5) ? 'male' : 'female',
  });

  // Boost standout traits above average
  for (const gene of char.genetics.genes) {
    gene.value = Math.min(100, gene.value + worldRNG.float(5, 20));
  }

  char.characterClass = 'main';
  char.role = pickStandoutRole(colony);
  characterRegistry.add(char);
  colony.standoutIds.push(char.id);

  const narratives: Record<StandoutOrigin, string> = {
    statistical: `A remarkably gifted ${char.role} emerges from ${colony.name}. Its traits surpass all others in the colony.`,
    event: `After surviving a harrowing ordeal, an exceptional ${char.role} rises to prominence in ${colony.name}.`,
    player_spotlight: `The colony ${colony.name} produces a standout ${char.role} that catches the eye of observers.`,
  };

  return {
    characterId: char.id,
    colonyId: colony.id,
    origin,
    narrative: narratives[origin],
  };
}

/** Pick a role for the standout based on colony directives. */
function pickStandoutRole(colony: Colony): 'sentinel' | 'scout' | 'forager' | 'guardian' | 'healer' | 'spy' {
  const [d1, d2] = colony.directives.active;
  const directiveToRole: Record<string, string> = {
    expansion: 'scout',
    defense: 'guardian',
    foraging: 'forager',
    reproduction: 'healer',
    construction: 'forager',
    diplomacy: 'spy',
  };
  const roles = [directiveToRole[d1], directiveToRole[d2], 'sentinel', 'scout', 'forager', 'guardian'];
  return roles[Math.floor(worldRNG.float(0, roles.length))] as any;
}

/** Remove dead standouts from colony tracking. */
export function pruneDeadStandouts(colony: Colony): void {
  colony.standoutIds = colony.standoutIds.filter(id => {
    const char = characterRegistry.get(id);
    return char && char.isAlive;
  });
}
