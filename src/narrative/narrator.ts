// ============================================================
// Narrative Engine
// ============================================================

import type { Character, WorldEvent, ActionResult, SpeciesId } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { selectTemplate } from './templates.js';
import { getSpeciesVoice, voicedBirth, voicedDeath, adaptNarrative } from './species-voice.js';

/** Generate narrative text for world events */
export function narrateEvent(event: WorldEvent): string {
  const levelPrefix: Record<string, string> = {
    personal: '',
    family: '[Family] ',
    community: '[Community] ',
    species: '[Species] ',
    cross_species: '[Cross-Species] ',
    regional: '[Regional] ',
    continental: '[Continental] ',
    global: '[GLOBAL] ',
  };

  return `${levelPrefix[event.level] ?? ''}${event.description}`;
}

/** Generate a daily summary for a character */
export function generateDailySummary(
  characterName: string,
  speciesName: string,
  events: WorldEvent[],
  actionCount: number,
): string {
  if (events.length === 0 && actionCount === 0) {
    return `${characterName} the ${speciesName} passed an uneventful day.`;
  }

  const parts: string[] = [];
  parts.push(`${characterName} the ${speciesName}:`);

  if (actionCount > 0) {
    parts.push(`Took ${actionCount} actions today.`);
  }

  const significant = events.filter(e =>
    e.level === 'species' || e.level === 'regional' || e.level === 'continental' || e.level === 'global'
  );

  for (const event of significant.slice(0, 3)) {
    parts.push(event.description);
  }

  return parts.join(' ');
}

/** Generate birth narrative with species voice */
export function narrateBirth(
  childName: string,
  speciesName: string,
  parentNames: string[],
  speciesId?: SpeciesId,
  regionName?: string,
): string {
  // Use template system
  const fromTemplate = selectTemplate('birth', {
    name: childName,
    speciesName,
    targetName: parentNames.join(' and '),
    regionName: regionName ?? 'the wild',
  });

  // Add species-specific flavor if available
  if (speciesId) {
    const voicedIntro = voicedBirth(speciesId);
    return `${voicedIntro} ${fromTemplate}`;
  }

  return fromTemplate;
}

/** Generate death narrative with species voice */
export function narrateDeath(
  name: string,
  speciesName: string,
  causeOfDeath: string,
  fame: number,
  speciesId?: SpeciesId,
): string {
  if (fame >= 500) {
    return `The legendary ${name}, a ${speciesName} of unparalleled renown, has passed. ${causeOfDeath}. Their name will be spoken for ages.`;
  }

  if (fame > 50) {
    return `The renowned ${name}, a ${speciesName} of great standing, has passed. ${causeOfDeath}. Their legacy echoes.`;
  }

  // Use template with species voice
  const fromTemplate = selectTemplate('death', {
    name,
    speciesName,
    cause: causeOfDeath,
  });

  if (speciesId) {
    const voicedEnding = voicedDeath(speciesId);
    return `${fromTemplate} ${voicedEnding}`;
  }

  return fromTemplate;
}

/** Generate discovery narrative */
export function narrateDiscovery(name: string, speciesName: string, discoveryName: string, regionName: string): string {
  return selectTemplate('discovery', {
    name,
    speciesName,
    item: discoveryName,
    regionName,
  });
}

/** Generate combat narrative */
export function narrateCombat(name: string, speciesName: string, won: boolean): string {
  return selectTemplate(won ? 'combat_win' : 'combat_loss', {
    name,
    speciesName,
  });
}

/** Generate first contact narrative */
export function narrateFirstContact(name: string, speciesName: string, otherSpeciesName: string): string {
  return selectTemplate('first_contact', {
    name,
    speciesName,
    targetName: otherSpeciesName,
  });
}

/** Generate breeding narrative */
export function narrateBreeding(name: string, speciesName: string, count: number, regionName: string): string {
  return selectTemplate('breeding', {
    name,
    speciesName,
    count,
    regionName,
  });
}

/** Adapt any narrative text for a species */
export function narrateForSpecies(text: string, speciesId: string): string {
  return adaptNarrative(text, speciesId);
}
