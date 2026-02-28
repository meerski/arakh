// ============================================================
// Card Highlight System
// ============================================================
// Tracks notable moments during a character's life and
// selects the most significant for the card highlight reel.

import type { Character, CardHighlight, WorldEvent, Achievement } from '../types.js';

/** Create a highlight from a notable moment */
export function createHighlight(tick: number, description: string, significance: number): CardHighlight {
  return {
    tick,
    description,
    significance: Math.max(0, Math.min(1, significance)),
  };
}

/** Generate highlights from a character's life events */
export function generateHighlightsFromCharacter(character: Character): CardHighlight[] {
  const highlights: CardHighlight[] = [];

  // Birth
  highlights.push(createHighlight(
    character.bornAtTick,
    character.isGenesisElder
      ? `Born as a Genesis Elder — among the first of their kind.`
      : `Born into the world.`,
    character.isGenesisElder ? 0.9 : 0.2,
  ));

  // Achievements → highlights
  for (const achievement of character.achievements) {
    highlights.push(createHighlight(
      achievement.tick,
      achievement.description,
      achievementSignificance(achievement),
    ));
  }

  // Offspring milestones
  if (character.childIds.length >= 10) {
    highlights.push(createHighlight(0, `Raised a dynasty of ${character.childIds.length} offspring.`, 0.7));
  } else if (character.childIds.length >= 5) {
    highlights.push(createHighlight(0, `Parent to ${character.childIds.length} offspring.`, 0.5));
  } else if (character.childIds.length >= 1) {
    highlights.push(createHighlight(0, `Continued the family line.`, 0.3));
  }

  // Fame milestones
  if (character.fame >= 500) {
    highlights.push(createHighlight(0, `Became a legend — fame score ${character.fame}.`, 0.95));
  } else if (character.fame >= 150) {
    highlights.push(createHighlight(0, `Rose to fame — known across the land.`, 0.7));
  } else if (character.fame >= 50) {
    highlights.push(createHighlight(0, `Gained recognition among peers.`, 0.4));
  }

  // Knowledge breadth
  if (character.knowledge.length >= 10) {
    highlights.push(createHighlight(0, `Accumulated vast knowledge — ${character.knowledge.length} topics mastered.`, 0.6));
  }

  // Heirlooms
  const artifacts = character.inventory.filter(i => i.type === 'artifact');
  if (artifacts.length > 0) {
    highlights.push(createHighlight(
      0,
      `Possessed ${artifacts.length} artifact${artifacts.length > 1 ? 's' : ''}: ${artifacts.map(a => a.name).join(', ')}.`,
      0.5 + artifacts.length * 0.1,
    ));
  }

  // Death
  if (!character.isAlive && character.causeOfDeath) {
    highlights.push(createHighlight(
      character.diedAtTick ?? 0,
      `Died: ${character.causeOfDeath}. Lived ${character.age} ticks.`,
      character.causeOfDeath === 'natural causes' ? 0.3 : 0.5,
    ));
  }

  // Sort by significance and keep top 10
  highlights.sort((a, b) => b.significance - a.significance);
  return highlights.slice(0, 10);
}

/** Convert world events into card highlights */
export function eventsToHighlights(events: WorldEvent[]): CardHighlight[] {
  return events.map(e => createHighlight(
    e.tick,
    e.description,
    eventSignificance(e),
  ));
}

/** Calculate significance for an achievement */
function achievementSignificance(achievement: Achievement): number {
  const name = achievement.name.toLowerCase();
  if (name.includes('legendary') || name.includes('tesla')) return 0.95;
  if (name.includes('discover') || name.includes('first')) return 0.7;
  if (name.includes('built') || name.includes('craft')) return 0.4;
  if (name.includes('kill') || name.includes('survive')) return 0.6;
  if (name.includes('taught') || name.includes('offspring')) return 0.35;
  return 0.3;
}

/** Calculate significance from event level */
function eventSignificance(event: WorldEvent): number {
  const levelMap: Record<string, number> = {
    personal: 0.1,
    family: 0.2,
    community: 0.3,
    species: 0.5,
    cross_species: 0.6,
    regional: 0.7,
    continental: 0.85,
    global: 1.0,
  };
  return levelMap[event.level] ?? 0.2;
}
