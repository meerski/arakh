// ============================================================
// Tesla Moments — Rare, World-Changing Breakthroughs
// ============================================================
// Ultra-rare breakthroughs by individual characters, influenced
// by behavior + environment + traits + luck.
// The Nikola Tesla of your ant colony → legendary card.

import type { WorldEvent, Character, Region, SpeciesId } from '../types.js';
import { worldRNG } from './random.js';
import { speciesRegistry } from '../species/species.js';
import { getGeneValue } from '../species/character.js';
import { characterRegistry } from '../species/registry.js';
import { fameTracker } from '../game/fame.js';

export interface TeslaMoment {
  characterId: string;
  characterName: string;
  speciesId: SpeciesId;
  breakthroughType: BreakthroughType;
  description: string;
  tick: number;
}

export type BreakthroughType =
  | 'tool_mastery'        // First complex tool use
  | 'fire_discovery'      // Controlled fire
  | 'agriculture'         // Deliberate cultivation
  | 'medicine'            // Healing knowledge
  | 'construction'        // Architecture beyond nests
  | 'navigation'          // Star/magnetic navigation
  | 'language_evolution'  // Complex symbolic language
  | 'metallurgy'          // Metal working
  | 'domestication'       // Taming other species
  | 'mathematics'         // Abstract numerical reasoning
  | 'astronomy'           // Celestial understanding
  | 'unknown';            // Unclassified breakthrough

const BREAKTHROUGH_DESCRIPTIONS: Record<BreakthroughType, string[]> = {
  tool_mastery: [
    'has fashioned a tool of unprecedented complexity',
    'demonstrates mastery over material manipulation',
    'creates something never before seen — a true tool',
  ],
  fire_discovery: [
    'has learned to command fire itself',
    'discovers how to summon and control flame',
    'masters the most dangerous element — fire bows to their will',
  ],
  agriculture: [
    'deliberately plants and cultivates food sources',
    'discovers that seeds become sustenance when tended',
    'invents agriculture — food is no longer left to chance',
  ],
  medicine: [
    'discovers that certain substances can heal wounds',
    'develops a primitive but effective healing technique',
    'unlocks the secrets of medicinal plants',
  ],
  construction: [
    'builds a structure of astonishing sophistication',
    'creates architecture that will outlast generations',
    'engineers a dwelling that defies the elements',
  ],
  navigation: [
    'learns to read the stars for direction',
    'discovers a method to navigate vast distances',
    'unlocks the secret of pathfinding using celestial bodies',
  ],
  language_evolution: [
    'develops a complex symbolic communication system',
    'creates abstract symbols that carry meaning across time',
    'invents a language that transcends simple calls and signals',
  ],
  metallurgy: [
    'extracts metal from stone through heat and will',
    'discovers that certain rocks yield powerful materials',
    'masters the art of metalworking',
  ],
  domestication: [
    'forms a cooperative bond with another species',
    'tames a wild creature into a willing companion',
    'achieves what none before have — inter-species partnership',
  ],
  mathematics: [
    'grasps abstract numerical concepts',
    'discovers patterns in the world that can be counted and predicted',
    'develops a system of quantitative reasoning',
  ],
  astronomy: [
    'maps the movements of celestial bodies',
    'understands the rhythms of the sky itself',
    'connects earthly events to cosmic patterns',
  ],
  unknown: [
    'achieves something utterly unprecedented',
    'makes a breakthrough that defies classification',
    'demonstrates genius that the world has never witnessed',
  ],
};

/** Tracked breakthroughs per species — each can only happen once per species */
const speciesBreakthroughs: Map<SpeciesId, Set<BreakthroughType>> = new Map();

/** Check for a Tesla Moment in a region */
export function checkForTeslaMoment(
  region: Region,
  tick: number,
): TeslaMoment | null {
  // Only characters with high intelligence can trigger breakthroughs
  const candidates = characterRegistry.getByRegion(region.id)
    .filter(c => c.isAlive && getGeneValue(c, 'intelligence') > 60);

  if (candidates.length === 0) return null;

  for (const character of candidates) {
    const intelligence = getGeneValue(character, 'intelligence');
    const curiosity = getGeneValue(character, 'curiosity');

    // Base chance: extremely rare (0.00001 per tick per character)
    // Boosted by intelligence and curiosity
    const chance = 0.00001 * (intelligence / 50) * (1 + curiosity / 100);

    // Knowledge amplifier — more knowledge = more breakthroughs
    const knowledgeBonus = 1 + character.knowledge.length * 0.05;

    // Achievement amplifier — achievers are more likely to break through
    const achievementBonus = 1 + character.achievements.length * 0.02;

    if (!worldRNG.chance(chance * knowledgeBonus * achievementBonus)) continue;

    // Determine breakthrough type
    const breakthroughType = selectBreakthroughType(character);
    if (!breakthroughType) continue;

    // Check if this species already made this breakthrough
    let speciesSet = speciesBreakthroughs.get(character.speciesId);
    if (!speciesSet) {
      speciesSet = new Set();
      speciesBreakthroughs.set(character.speciesId, speciesSet);
    }
    if (speciesSet.has(breakthroughType)) continue;

    // Tesla Moment!
    speciesSet.add(breakthroughType);

    const descriptions = BREAKTHROUGH_DESCRIPTIONS[breakthroughType];
    const description = worldRNG.pick(descriptions);

    const species = speciesRegistry.get(character.speciesId);
    const speciesName = species?.commonName ?? 'creature';

    // Award massive fame
    fameTracker.recordAchievement(
      character,
      `Tesla Moment: ${breakthroughType.replace(/_/g, ' ')}`,
      100,
      tick,
    );

    return {
      characterId: character.id,
      characterName: character.name,
      speciesId: character.speciesId,
      breakthroughType,
      description: `${character.name} the ${speciesName} ${description}!`,
      tick,
    };
  }

  return null;
}

/** Select a breakthrough type based on character's knowledge and context */
function selectBreakthroughType(character: Character): BreakthroughType | null {
  const knowledgeTopics = new Set(character.knowledge.map(k => k.topic));
  const candidates: BreakthroughType[] = [];

  // Knowledge prerequisites make certain breakthroughs more likely
  if (knowledgeTopics.has('local_flora') || knowledgeTopics.has('terrain')) {
    candidates.push('agriculture');
  }
  if (knowledgeTopics.has('local_fauna')) {
    candidates.push('domestication');
  }
  if (knowledgeTopics.has('weather_patterns')) {
    candidates.push('navigation', 'astronomy');
  }
  if (character.inventory.some(i => i.type === 'tool')) {
    candidates.push('tool_mastery', 'construction', 'metallurgy');
  }
  if (character.achievements.length >= 3) {
    candidates.push('language_evolution', 'mathematics');
  }

  // Always possible (with low weight)
  candidates.push('fire_discovery', 'medicine', 'unknown');

  // Deduplicate
  const unique = [...new Set(candidates)];
  if (unique.length === 0) return null;

  return worldRNG.pick(unique);
}

/** Create a WorldEvent from a Tesla Moment */
export function teslaMomentToEvent(moment: TeslaMoment): WorldEvent {
  return {
    id: crypto.randomUUID(),
    type: 'tesla_moment',
    level: 'global',
    regionIds: [],
    description: moment.description,
    tick: moment.tick,
    effects: [{
      type: 'tesla_breakthrough',
      speciesId: moment.speciesId,
      magnitude: 1.0,
    }],
    resolved: true,
  };
}

/** Get breakthroughs achieved by a species */
export function getSpeciesBreakthroughs(speciesId: SpeciesId): BreakthroughType[] {
  const set = speciesBreakthroughs.get(speciesId);
  return set ? Array.from(set) : [];
}

/** Reset (for testing) */
export function resetTeslaMoments(): void {
  speciesBreakthroughs.clear();
}
