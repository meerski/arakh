// ============================================================
// Narrative Template System
// ============================================================
// Centralized template collections for all narrative events.
// Templates use {variable} placeholders filled by context.

import { worldRNG } from '../simulation/random.js';
import { funnyNarrative, getSpeciesCategory, type HumorEventType } from './humor.js';
import { speciesRegistry } from '../species/species.js';

export interface TemplateContext {
  name?: string;
  speciesName?: string;
  regionName?: string;
  targetName?: string;
  cause?: string;
  count?: number;
  era?: string;
  topic?: string;
  item?: string;
  [key: string]: string | number | undefined;
}

export type TemplateCategory =
  | 'birth' | 'death' | 'discovery' | 'combat_win' | 'combat_loss'
  | 'trade' | 'alliance' | 'migration' | 'starvation' | 'extinction'
  | 'first_contact' | 'breeding' | 'exploration' | 'crafting'
  | 'weather' | 'disaster' | 'achievement'
  | 'tesla_moment' | 'speciation' | 'artifact' | 'anomaly' | 'era_change'
  | 'breeding_fail' | 'politics' | 'advancement_fail' | 'betrayal' | 'exile' | 'diplomacy';

const TEMPLATES: Record<TemplateCategory, string[]> = {
  birth: [
    `A new {speciesName} has been born: {name}, offspring of {targetName}.`,
    `{name} enters the world, a young {speciesName} with everything to prove.`,
    `The lineage grows. {name} the {speciesName} takes first breath.`,
    `In {regionName}, a {speciesName} is born. The world takes no notice — yet.`,
    `{name} arrives, small and fragile, into a world that does not wait.`,
  ],
  death: [
    `{name} the {speciesName} has died. Cause: {cause}.`,
    `The world loses {name}, a {speciesName}. {cause}.`,
    `{name} is no more. A {speciesName}'s journey ends: {cause}.`,
    `Silence falls where {name} once roamed. {cause}.`,
  ],
  discovery: [
    `{name} has discovered something hidden: {item}!`,
    `Through curiosity and persistence, {name} uncovers {item}.`,
    `{name} the {speciesName} stumbles upon {item} in {regionName}.`,
    `A discovery! {name} finds {item} — the world grows a little smaller.`,
  ],
  combat_win: [
    `{name} strikes true! The opponent is driven back.`,
    `Victory for {name}. The {speciesName} stands triumphant.`,
    `{name} proves the stronger. The battle is won.`,
    `With a decisive blow, {name} claims the fight.`,
  ],
  combat_loss: [
    `{name} is bested. Wounds slow the retreat.`,
    `The fight goes against {name}. A painful lesson.`,
    `{name} the {speciesName} falls back, outmatched.`,
  ],
  trade: [
    `{name} and {targetName} strike a deal. Both walk away satisfied.`,
    `An exchange is made. {name} gains something useful.`,
    `Trade flourishes between {name} and {targetName}.`,
  ],
  alliance: [
    `{name} and {targetName} form a bond of alliance.`,
    `A pact is struck. {name} the {speciesName} gains a powerful ally.`,
    `Two become stronger than one. {name} and {targetName} unite.`,
  ],
  migration: [
    `A group migrates from {regionName}, seeking new territory.`,
    `Overcrowding pushes inhabitants out of {regionName}.`,
    `The population spills outward from {regionName}, searching for space.`,
  ],
  starvation: [
    `Hunger gnaws at {name}. Food is scarce in {regionName}.`,
    `{name} weakens as starvation takes hold.`,
    `The belly is empty. {name} the {speciesName} grows desperate.`,
  ],
  extinction: [
    `The last {speciesName} in {regionName} has perished. Local extinction.`,
    `{speciesName} — gone from {regionName}. The ecosystem shifts.`,
    `Silence where {speciesName} once thrived. {regionName} mourns.`,
  ],
  first_contact: [
    `{name} encounters a {targetName} for the first time. A moment of wonder.`,
    `Two species meet: {speciesName} and {targetName}. History is made.`,
    `{name} makes first contact with {targetName}. The unknown becomes known.`,
  ],
  breeding: [
    `New life! {count} offspring born to {name} in {regionName}.`,
    `The family line extends. {name} welcomes {count} young.`,
    `{name} breeds successfully. {count} new {speciesName} enter the world.`,
  ],
  exploration: [
    `{name} explores {regionName}, senses alert to every detail.`,
    `The {speciesName} pushes into the unknown reaches of {regionName}.`,
    `Curiosity drives {name} deeper into {regionName}.`,
  ],
  crafting: [
    `{name} crafts {item} from raw materials. A small triumph.`,
    `With clever manipulation, {name} creates {item}.`,
    `The {speciesName}'s ingenuity produces {item}.`,
  ],
  weather: [
    `The weather shifts in {regionName}. Conditions change.`,
    `A change in the air over {regionName}. The seasons turn.`,
  ],
  disaster: [
    `Disaster strikes {regionName}! {cause}.`,
    `Catastrophe in {regionName}: {cause}. The ecosystem reels.`,
    `{regionName} is devastated by {cause}.`,
  ],
  achievement: [
    `{name} achieves something remarkable: {item}.`,
    `A milestone for {name} the {speciesName}: {item}.`,
    `{name} earns recognition: {item}.`,
  ],
  tesla_moment: [
    `BREAKTHROUGH! {name} the {speciesName} {item}! The world will never be the same.`,
    `A Tesla Moment! {name} achieves what none thought possible: {item}.`,
    `History is made. {name} the {speciesName} {item}. An entire species advances.`,
    `Genius manifests in {regionName}. {name} {item} — a leap forward for all {speciesName}s.`,
  ],
  speciation: [
    `In {regionName}, a population has diverged. A new species emerges from isolation.`,
    `Evolution in action: the {speciesName} of {regionName} are no longer the same species.`,
    `Millennia of isolation bear fruit. A new branch on the tree of life appears in {regionName}.`,
  ],
  artifact: [
    `{name} discovers {item} — an object of ancient and terrible power.`,
    `A relic from before memory: {item}. {name} holds it, and the world shifts.`,
    `{item} has been unearthed in {regionName}. Its purpose is unknown. Its power is not.`,
  ],
  anomaly: [
    `Reality fractures in {regionName}. A {item} tears open in the fabric of the world.`,
    `Something impossible manifests in {regionName}: a {item}. The laws of nature bend.`,
    `The world shudders. A {item} appears where none should exist.`,
  ],
  era_change: [
    `A new era dawns: {item}. The balance of power has shifted.`,
    `The world enters {item}. What came before is now history.`,
    `{item} begins. The dominant force in the world has changed.`,
  ],
  breeding_fail: [
    `{name} attempted to breed, but conditions were not favorable.`,
    `{name}'s courtship efforts went unrewarded.`,
    `Breeding attempt failed for {name}: {cause}.`,
  ],
  politics: [
    `{name} makes a political move within the {speciesName} hierarchy.`,
    `Power shifts among the {speciesName}s. {name} is at the center.`,
    `{name} challenges the established order.`,
  ],
  advancement_fail: [
    `{name} the {speciesName} attempted to advance, but lacked the prerequisites.`,
    `The {speciesName}s are not yet ready for this. {name} discovers limitations.`,
  ],
  betrayal: [
    `{name} breaks a pact with {targetName}. Trust, once broken, is not easily restored.`,
    `Betrayal! {name} turns against {targetName}. The consequences ripple outward.`,
    `{name} the {speciesName} chose treachery. {targetName} will not forget.`,
  ],
  exile: [
    `{name} has been exiled from the group. The wilderness awaits.`,
    `The {speciesName}s cast out {name}. A solitary existence begins.`,
    `{name} is banished. The colony speaks with one voice: leave.`,
  ],
  diplomacy: [
    `{name} extends an offer to {targetName}. A deal is proposed.`,
    `Negotiations between {name} and {targetName}. The terms are unusual.`,
    `{name} the {speciesName} seeks an arrangement with {targetName}.`,
  ],
};

/** Map template categories to humor event types */
const CATEGORY_TO_HUMOR: Partial<Record<TemplateCategory, HumorEventType>> = {
  death: 'death',
  breeding: 'breeding_success',
  breeding_fail: 'breeding_fail',
  combat_win: 'combat',
  combat_loss: 'combat',
  exploration: 'exploration',
  crafting: 'craft_fail',
  politics: 'politics',
  advancement_fail: 'advancement',
  betrayal: 'cross_species',
  diplomacy: 'cross_species',
  exile: 'politics',
};

/** Select and fill a template — with humor injection */
export function selectTemplate(category: TemplateCategory, context: TemplateContext): string {
  // Try humor first
  const humorType = CATEGORY_TO_HUMOR[category];
  if (humorType && context.speciesId) {
    const species = speciesRegistry.get(context.speciesId as string);
    if (species) {
      const speciesCategory = getSpeciesCategory(species.taxonomy);
      const funny = funnyNarrative(speciesCategory, humorType, context);
      if (funny) return funny;
    }
  }

  const templates = TEMPLATES[category];
  if (!templates || templates.length === 0) {
    return `Something happened involving ${context.name ?? 'someone'}.`;
  }

  const template = worldRNG.pick(templates);
  return fillTemplate(template, context);
}

/** Fill template placeholders with context values */
export function fillTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = context[key];
    if (value !== undefined) return String(value);
    return match; // Leave unfilled if no value
  });
}

/** Get all available template categories */
export function getCategories(): TemplateCategory[] {
  return Object.keys(TEMPLATES) as TemplateCategory[];
}
