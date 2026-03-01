// ============================================================
// Within-Species Politics — Leadership, Exile, Coups
// ============================================================

import type { Character, RegionId, SpeciesId } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { getGeneValue } from '../species/character.js';
import { speciesRegistry } from '../species/species.js';
import { modifyRelationshipStrength } from './social.js';
import { fameTracker } from './fame.js';
import { characterRegistry } from '../species/registry.js';

export interface PoliticalEvent {
  type: 'alpha_challenge' | 'exile' | 'coup' | 'coalition' | 'assassination';
  actorId: string;
  targetId?: string;
  narrative: string;
}

/**
 * Run politics tick for all characters in a region of the same species.
 * Returns political events that occurred.
 */
export function tickPolitics(
  characters: Character[],
  tick: number,
): PoliticalEvent[] {
  if (characters.length < 3) return [];

  const events: PoliticalEvent[] = [];

  // Group by species and region
  const groups = new Map<string, Character[]>();
  for (const c of characters) {
    if (!c.isAlive) continue;
    const key = `${c.speciesId}:${c.regionId}`;
    const group = groups.get(key) ?? [];
    group.push(c);
    groups.set(key, group);
  }

  for (const [_key, group] of groups) {
    if (group.length < 3) continue;

    const species = speciesRegistry.get(group[0].speciesId);
    if (!species) continue;

    // Only social species have politics
    const socialType = species.traits.socialStructure;
    if (socialType === 'solitary' || socialType === 'pair') continue;

    // Find current leader (highest socialRank)
    const sorted = [...group].sort((a, b) => b.socialRank - a.socialRank);
    const leader = sorted[0];

    // --- Alpha Challenge ---
    for (const challenger of sorted.slice(1)) {
      const aggression = getGeneValue(challenger, 'aggression');
      const strength = getGeneValue(challenger, 'strength');
      const leaderStrength = getGeneValue(leader, 'strength');

      // Only challenge if aggressive enough and stronger
      if (aggression > 60 && strength > leaderStrength && worldRNG.chance(0.02)) {
        const success = worldRNG.chance(0.3 + (strength - leaderStrength) / 200);

        if (success) {
          // Challenger takes over
          const oldRank = leader.socialRank;
          leader.socialRank = Math.max(0, leader.socialRank - 30);
          challenger.socialRank = Math.min(100, oldRank + 10);
          fameTracker.recordAchievement(challenger, 'Won alpha challenge', 8);

          events.push({
            type: 'alpha_challenge',
            actorId: challenger.id,
            targetId: leader.id,
            narrative: getAlphaNarrative(species.traits.socialStructure, challenger.name, leader.name, species.commonName, true),
          });
        } else {
          // Challenger loses
          challenger.health = Math.max(0.1, challenger.health - 0.2);
          challenger.socialRank = Math.max(0, challenger.socialRank - 10);

          events.push({
            type: 'alpha_challenge',
            actorId: challenger.id,
            targetId: leader.id,
            narrative: getAlphaNarrative(species.traits.socialStructure, challenger.name, leader.name, species.commonName, false),
          });
        }
        break; // Only one challenge per tick
      }
    }

    // --- Exile Vote ---
    for (const candidate of group) {
      // Count how many group members dislike this character
      const enemies = group.filter(g =>
        g.id !== candidate.id &&
        g.relationships.some(r => r.targetId === candidate.id && r.strength < -0.3),
      );

      // Majority dislikes = exile
      if (enemies.length > group.length / 2 && worldRNG.chance(0.05)) {
        candidate.socialRank = 0;
        // "Move" to connected region (just mark as exiled)
        candidate.knowledge.push({
          topic: 'exiled',
          detail: `Exiled from group at tick ${tick}`,
          learnedAtTick: tick,
          source: 'experience',
        });

        events.push({
          type: 'exile',
          actorId: candidate.id,
          narrative: getExileNarrative(species.traits.socialStructure, candidate.name, species.commonName),
        });
        break; // One exile per tick
      }
    }

    // --- Coup ---
    const disgruntled = group.filter(g =>
      g.id !== leader.id &&
      g.relationships.some(r => r.targetId === leader.id && r.strength < -0.2),
    );

    if (disgruntled.length >= 3 && worldRNG.chance(0.01)) {
      const coupStrength = disgruntled.reduce((sum, c) => sum + getGeneValue(c, 'strength'), 0) / disgruntled.length;
      const leaderPower = getGeneValue(leader, 'strength') * 1.5; // Leader has advantage

      const success = worldRNG.chance(0.3 + (coupStrength - leaderPower) / 200);

      if (success) {
        // New leader from coup
        const newLeader = disgruntled.sort((a, b) =>
          getGeneValue(b, 'intelligence') - getGeneValue(a, 'intelligence'),
        )[0];

        leader.socialRank = 0;
        newLeader.socialRank = Math.min(100, leader.socialRank + 20);
        fameTracker.recordAchievement(newLeader, 'Led a successful coup', 15);

        events.push({
          type: 'coup',
          actorId: newLeader.id,
          targetId: leader.id,
          narrative: `A coup! ${newLeader.name} and ${disgruntled.length - 1} allies overthrow ${leader.name}. The ${species.commonName} hierarchy has been reshaped.`,
        });
      } else {
        // Failed coup — punish conspirators
        for (const rebel of disgruntled) {
          rebel.socialRank = Math.max(0, rebel.socialRank - 10);
          modifyRelationshipStrength(leader, rebel.id, -0.3);
        }

        events.push({
          type: 'coup',
          actorId: disgruntled[0].id,
          targetId: leader.id,
          narrative: `A coup attempt against ${leader.name} fails. The conspirators are identified. Retribution follows.`,
        });
      }
    }

    // --- Coalition Building ---
    for (const char of group) {
      const sociability = getGeneValue(char, 'sociability');
      if (sociability > 65 && worldRNG.chance(0.01)) {
        // Find a nearby character to befriend
        const potential = group.find(g =>
          g.id !== char.id &&
          !char.relationships.some(r => r.targetId === g.id && r.strength > 0.3),
        );
        if (potential) {
          modifyRelationshipStrength(char, potential.id, 0.1);
          modifyRelationshipStrength(potential, char.id, 0.1);
          char.socialRank = Math.min(100, char.socialRank + 2);

          events.push({
            type: 'coalition',
            actorId: char.id,
            targetId: potential.id,
            narrative: `${char.name} builds political capital among the ${species.commonName}s, strengthening ties with ${potential.name}.`,
          });
        }
        break; // One coalition event per tick
      }
    }

    // --- Assassination ---
    for (const char of group) {
      const intel = getGeneValue(char, 'intelligence');
      const aggression = getGeneValue(char, 'aggression');
      const sociability = getGeneValue(char, 'sociability');

      // High intelligence + high aggression + low sociability = assassin
      if (intel > 60 && aggression > 70 && sociability < 30 && worldRNG.chance(0.005)) {
        // Target the leader
        const stealth = (intel + (100 - sociability)) / 2;
        const detection = getGeneValue(leader, 'intelligence') + leader.socialRank / 2;
        const success = worldRNG.chance(0.2 + (stealth - detection) / 200);

        if (success) {
          characterRegistry.markDead(leader.id, tick, 'assassinated');
          char.socialRank = Math.min(100, char.socialRank + 15);
          fameTracker.recordAchievement(char, 'Assassination', 12);

          events.push({
            type: 'assassination',
            actorId: char.id,
            targetId: leader.id,
            narrative: `${leader.name} the ${species.commonName} is found dead under mysterious circumstances. ${char.name} says nothing.`,
          });
        } else {
          // Caught — severe consequences
          char.health = Math.max(0.1, char.health - 0.4);
          char.socialRank = 0;
          for (const g of group) {
            modifyRelationshipStrength(g, char.id, -0.5);
          }

          events.push({
            type: 'assassination',
            actorId: char.id,
            targetId: leader.id,
            narrative: `${char.name} is caught attempting to assassinate ${leader.name}. The ${species.commonName} colony is horrified.`,
          });
        }
        break; // One assassination attempt per tick
      }
    }
  }

  return events;
}

function getAlphaNarrative(
  social: string,
  challengerName: string,
  leaderName: string,
  speciesName: string,
  success: boolean,
): string {
  if (success) {
    switch (social) {
      case 'pack':
        return `${challengerName} defeats ${leaderName} in combat. The ${speciesName} pack has a new alpha.`;
      case 'hive':
      case 'colony':
        return `Through pheromone dominance, ${challengerName} displaces ${leaderName} as the colony's primary authority.`;
      case 'herd':
        return `${challengerName} pushes ${leaderName} to the edge of the herd. New leadership.`;
      default:
        return `${challengerName} challenges ${leaderName} for dominance among the ${speciesName}s and wins.`;
    }
  }
  return `${challengerName} challenges ${leaderName} for dominance among the ${speciesName}s. The challenge fails.`;
}

function getExileNarrative(social: string, name: string, speciesName: string): string {
  switch (social) {
    case 'hive':
    case 'colony':
      return `${name} is expelled from the ${speciesName} colony. The hive has spoken through pheromone consensus.`;
    case 'pack':
      return `The ${speciesName} pack drives ${name} out. A lone wanderer now.`;
    case 'herd':
      return `${name} is pushed to the fringes and expelled from the ${speciesName} herd.`;
    default:
      return `${name} has been exiled from the ${speciesName} group. The decision was collective.`;
  }
}
