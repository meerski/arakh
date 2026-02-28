// ============================================================
// Intent-Based Action System
// ============================================================

import type {
  AgentAction, ActionResult, ActionType, Character, Region,
  SensoryData, EntitySighting, ActionEffect, CharacterId,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { getGeneValue } from '../species/character.js';
import { canBreed, breed } from '../species/genetics.js';
import { canCommunicate } from './language.js';
import { observeSpecies, createSpeciesDiscoveryEvent } from '../species/discovery.js';
import { attemptDiscovery } from './exploration.js';
import { characterRegistry } from '../species/registry.js';
import { addBidirectionalRelationship, modifyRelationshipStrength } from './social.js';
import { fameTracker } from './fame.js';
import { speciesRegistry } from '../species/species.js';

export interface ActionContext {
  character: Character;
  region: Region;
  tick: number;
  regionName: string;
  nearbyCharacters: Character[];
  availableResources: string[];
  threats: string[];
  timeOfDay: string;
  season: string;
  weather: string;
}

/** Build an ActionContext from a character ID and world state */
export function buildActionContext(
  characterId: CharacterId,
  regions: Map<string, Region>,
  tick: number,
  timeOfDay: string,
  season: string,
  weather: string,
): ActionContext | null {
  const character = characterRegistry.get(characterId);
  if (!character || !character.isAlive) return null;

  const region = regions.get(character.regionId);
  if (!region) return null;

  const nearbyCharacters = characterRegistry.getByRegion(character.regionId)
    .filter(c => c.id !== character.id);

  const availableResources = region.resources
    .filter(r => r.quantity > 0)
    .map(r => r.type);

  const threats = nearbyCharacters
    .filter(c => {
      const rel = character.relationships.find(r => r.targetId === c.id);
      return rel && rel.strength < -0.5;
    })
    .map(() => 'A hostile presence lurks nearby');

  return {
    character,
    region,
    tick,
    regionName: region.name,
    nearbyCharacters,
    availableResources,
    threats,
    timeOfDay,
    season,
    weather,
  };
}

/** Process an agent's action intent and return a narrative result */
export function processAction(action: AgentAction, context: ActionContext): ActionResult {
  const handler = ACTION_HANDLERS[action.type];
  if (!handler) {
    return {
      success: false,
      narrative: 'You attempt something incomprehensible. Nothing happens.',
      effects: [],
      sensoryData: buildSensoryData(context),
    };
  }

  const result = handler(action, context);

  // Apply effects to world state
  applyEffects(result.effects, context);

  return result;
}

// ============================================================
// Effect Applier — mutates Character/Region state
// ============================================================

/** Apply action effects to world state */
export function applyEffects(effects: ActionEffect[], ctx: ActionContext): void {
  for (const effect of effects) {
    const target = effect.target === ctx.character.id
      ? ctx.character
      : characterRegistry.get(effect.target as CharacterId);

    switch (effect.type) {
      case 'hunger_decrease': {
        if (target) {
          target.hunger = Math.max(0, target.hunger + (effect.value as number));
        }
        break;
      }
      case 'energy_increase': {
        if (target) {
          target.energy = Math.min(1, target.energy + (effect.value as number));
        }
        break;
      }
      case 'energy_decrease': {
        if (target) {
          target.energy = Math.max(0, target.energy + (effect.value as number));
        }
        break;
      }
      case 'health_increase': {
        if (target) {
          target.health = Math.min(1, target.health + (effect.value as number));
        }
        break;
      }
      case 'health_decrease': {
        if (target) {
          target.health = Math.max(0, target.health + (effect.value as number));
        }
        break;
      }
      case 'damage_dealt': {
        if (target) {
          const dmg = effect.value as number;
          target.health = Math.max(0, target.health - dmg);
          if (target.health <= 0) {
            target.isAlive = false;
            target.diedAtTick = ctx.tick;
            target.causeOfDeath = 'killed in combat';
          }
        }
        break;
      }
      case 'fame_increase': {
        ctx.character.fame += effect.value as number;
        break;
      }
      case 'knowledge_gained': {
        const topic = effect.value as string;
        if (!ctx.character.knowledge.some(k => k.topic === topic)) {
          ctx.character.knowledge.push({
            topic,
            detail: `Learned through ${topic}`,
            learnedAtTick: ctx.tick,
            source: 'experience',
          });
        }
        break;
      }
      case 'knowledge_shared': {
        // Knowledge transferred to the nearby character
        const shareTopic = effect.value as string;
        const recipient = ctx.nearbyCharacters[0];
        if (recipient && shareTopic) {
          const sourceKnowledge = ctx.character.knowledge.find(k => k.topic === shareTopic);
          if (sourceKnowledge && !recipient.knowledge.some(k => k.topic === shareTopic)) {
            recipient.knowledge.push({
              topic: shareTopic,
              detail: sourceKnowledge.detail,
              learnedAtTick: ctx.tick,
              source: 'taught',
            });
          }
        }
        break;
      }
      case 'relationship_change': {
        const relTarget = ctx.nearbyCharacters[0];
        if (relTarget) {
          const relType = effect.value as string;
          addBidirectionalRelationship(
            ctx.character, relTarget,
            relType as any,
            relType === 'ally' ? 0.6 : relType === 'enemy' ? -0.6 : 0.5,
          );
        }
        break;
      }
      case 'resource_gathered': {
        const resType = effect.value as string;
        const res = ctx.region.resources.find(r => r.type === resType);
        if (res && res.quantity > 0) {
          const amount = Math.min(5, res.quantity);
          res.quantity -= amount;
          ctx.character.inventory.push({
            id: crypto.randomUUID(),
            name: resType,
            type: 'resource',
            properties: {},
            createdAtTick: ctx.tick,
            createdBy: ctx.character.id,
          });
        }
        break;
      }
      case 'item_created': {
        const itemName = (effect.value as string) ?? 'crafted item';
        ctx.character.inventory.push({
          id: crypto.randomUUID(),
          name: itemName,
          type: 'tool',
          properties: {},
          createdAtTick: ctx.tick,
          createdBy: ctx.character.id,
        });
        fameTracker.recordAchievement(ctx.character, `Crafted ${itemName}`, 2);
        break;
      }
      case 'structure_built': {
        fameTracker.recordAchievement(ctx.character, `Built a structure`, 3);
        break;
      }
      // position_change, communication, defense_stance, discovery — handled in handlers
    }
  }
}

type ActionHandler = (action: AgentAction, context: ActionContext) => ActionResult;

const ACTION_HANDLERS: Record<ActionType, ActionHandler> = {
  move: handleMove,
  explore: handleExplore,
  forage: handleForage,
  hunt: handleHunt,
  rest: handleRest,
  build: handleBuild,
  craft: handleCraft,
  gather: handleGather,
  communicate: handleCommunicate,
  trade: handleTrade,
  ally: handleAlly,
  attack: handleAttack,
  defend: handleDefend,
  flee: handleFlee,
  breed: handleBreed,
  teach: handleTeach,
  learn: handleLearn,
  experiment: handleExperiment,
  observe: handleObserve,
  inspect: handleInspect,
};

function handleMove(action: AgentAction, ctx: ActionContext): ActionResult {
  const direction = (action.params.direction as string) ?? 'forward';
  const speed = getGeneValue(ctx.character, 'speed');
  const success = worldRNG.chance(0.8 + speed * 0.002);

  if (success) {
    // Energy cost for movement
    ctx.character.energy = Math.max(0, ctx.character.energy - 0.05);
    ctx.character.hunger = Math.min(1, ctx.character.hunger + 0.02);
  }

  return {
    success,
    narrative: success
      ? `You move ${direction}. The terrain shifts as you travel.`
      : `You try to move ${direction}, but the path is blocked.`,
    effects: success ? [{ type: 'position_change', target: ctx.character.id, value: direction }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleExplore(_action: AgentAction, ctx: ActionContext): ActionResult {
  // Wire into the real discovery system
  const discovery = attemptDiscovery(ctx.character, ctx.region);

  // Energy/hunger cost for exploring
  ctx.character.energy = Math.max(0, ctx.character.energy - 0.08);
  ctx.character.hunger = Math.min(1, ctx.character.hunger + 0.03);

  const effects: ActionEffect[] = [];
  if (discovery.found && discovery.location) {
    effects.push({ type: 'discovery', target: ctx.character.id, value: discovery.location.name });
    fameTracker.recordAchievement(ctx.character, `Discovered ${discovery.location.name}`, 10);
  }

  return {
    success: true,
    narrative: discovery.narrative,
    effects,
    sensoryData: buildSensoryData(ctx),
  };
}

function handleForage(_action: AgentAction, ctx: ActionContext): ActionResult {
  const hasFood = ctx.availableResources.some(r =>
    ['grass', 'vegetation', 'berries', 'fruit', 'seeds', 'algae', 'plankton'].includes(r),
  );
  const success = hasFood && worldRNG.chance(0.7);

  if (success) {
    // Consume some vegetation resource
    const foodResource = ctx.region.resources.find(r =>
      r.quantity > 0 && ['grass', 'vegetation', 'berries', 'fruit', 'seeds', 'algae', 'plankton'].includes(r.type),
    );
    if (foodResource) {
      foodResource.quantity = Math.max(0, foodResource.quantity - 2);
    }
  }

  return {
    success,
    narrative: success
      ? `You find sustenance among the vegetation.`
      : `You search for food but find nothing edible nearby.`,
    effects: success ? [
      { type: 'hunger_decrease', target: ctx.character.id, value: -0.3 },
    ] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleHunt(_action: AgentAction, ctx: ActionContext): ActionResult {
  const strength = getGeneValue(ctx.character, 'strength');
  const speed = getGeneValue(ctx.character, 'speed');
  const hasPrey = ctx.nearbyCharacters.length > 0;
  const success = hasPrey && worldRNG.chance(0.3 + (strength + speed) * 0.002);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  if (success) {
    // Pick the weakest nearby character as prey
    const prey = [...ctx.nearbyCharacters].sort((a, b) => a.health - b.health)[0];
    if (prey) {
      const damage = strength * 0.015;
      prey.health = Math.max(0, prey.health - damage);
      if (prey.health <= 0) {
        prey.isAlive = false;
        prey.diedAtTick = ctx.tick;
        prey.causeOfDeath = `hunted by ${ctx.character.name}`;
      }
    }
  }

  return {
    success,
    narrative: success
      ? `The hunt is successful. You secure a meal.`
      : `You stalk potential prey, but the hunt yields nothing.`,
    effects: success ? [
      { type: 'hunger_decrease', target: ctx.character.id, value: -0.5 },
    ] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleRest(_action: AgentAction, ctx: ActionContext): ActionResult {
  return {
    success: true,
    narrative: `You rest, recovering your strength.`,
    effects: [
      { type: 'energy_increase', target: ctx.character.id, value: 0.3 },
      { type: 'health_increase', target: ctx.character.id, value: 0.05 },
    ],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleBuild(action: AgentAction, ctx: ActionContext): ActionResult {
  const intelligence = getGeneValue(ctx.character, 'intelligence');
  const success = worldRNG.chance(0.3 + intelligence * 0.005);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.15);

  return {
    success,
    narrative: success
      ? `You construct a simple structure.`
      : `Your building attempt doesn't quite work out.`,
    effects: success ? [{ type: 'structure_built', target: ctx.character.id, value: action.params.what }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleCraft(action: AgentAction, ctx: ActionContext): ActionResult {
  const intelligence = getGeneValue(ctx.character, 'intelligence');
  const success = worldRNG.chance(0.3 + intelligence * 0.005);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  return {
    success,
    narrative: success
      ? `You craft something from the materials at hand.`
      : `The materials resist your efforts.`,
    effects: success ? [{ type: 'item_created', target: ctx.character.id, value: action.params.what }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleGather(_action: AgentAction, ctx: ActionContext): ActionResult {
  const hasResources = ctx.availableResources.length > 0;
  const success = hasResources && worldRNG.chance(0.8);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.05);

  return {
    success,
    narrative: success
      ? `You gather resources from the environment.`
      : `There's nothing useful to gather here.`,
    effects: success ? [{ type: 'resource_gathered', target: ctx.character.id, value: worldRNG.pick(ctx.availableResources) }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleCommunicate(action: AgentAction, ctx: ActionContext): ActionResult {
  const target = ctx.nearbyCharacters[0];
  if (!target) {
    return {
      success: false,
      narrative: `There is no one nearby to communicate with.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Wire into language barrier system
  const comm = canCommunicate(ctx.character, target);
  if (!comm.canTalk) {
    return {
      success: false,
      narrative: `You try to communicate, but the other creature does not understand you at all.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Successful communication strengthens relationship
  modifyRelationshipStrength(ctx.character, target.id, 0.05 * comm.clarity);
  modifyRelationshipStrength(target, ctx.character.id, 0.05 * comm.clarity);

  const clarityDesc = comm.clarity >= 0.8 ? 'clearly' :
    comm.clarity >= 0.5 ? 'with some difficulty' : 'through gestures and sounds';

  return {
    success: true,
    narrative: `You communicate ${clarityDesc} with another creature.`,
    effects: [{ type: 'communication', target: ctx.character.id, value: action.params.message }],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleTrade(action: AgentAction, ctx: ActionContext): ActionResult {
  const sociability = getGeneValue(ctx.character, 'sociability');
  const partner = ctx.nearbyCharacters[0];
  const success = partner && worldRNG.chance(0.4 + sociability * 0.004);

  if (success && partner) {
    // Exchange an item if both have inventory
    const myItem = ctx.character.inventory[0];
    const theirItem = partner.inventory[0];
    if (myItem && theirItem) {
      ctx.character.inventory.shift();
      partner.inventory.shift();
      ctx.character.inventory.push(theirItem);
      partner.inventory.push(myItem);
    }
    modifyRelationshipStrength(ctx.character, partner.id, 0.1);
    modifyRelationshipStrength(partner, ctx.character.id, 0.1);
  }

  return {
    success: !!success,
    narrative: success
      ? `A trade is struck.`
      : `No trading partner is available or willing.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleAlly(_action: AgentAction, ctx: ActionContext): ActionResult {
  const sociability = getGeneValue(ctx.character, 'sociability');
  const target = ctx.nearbyCharacters[0];
  const success = target && worldRNG.chance(0.3 + sociability * 0.005);

  if (success && target) {
    addBidirectionalRelationship(ctx.character, target, 'ally', 0.6);
  }

  return {
    success: !!success,
    narrative: success
      ? `An alliance is formed.`
      : `Your overture of alliance goes unanswered.`,
    effects: success ? [{ type: 'relationship_change', target: ctx.character.id, value: 'ally' }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleAttack(_action: AgentAction, ctx: ActionContext): ActionResult {
  const strength = getGeneValue(ctx.character, 'strength');
  const aggression = getGeneValue(ctx.character, 'aggression');
  const target = ctx.nearbyCharacters[0];
  const success = target && worldRNG.chance(0.3 + (strength + aggression) * 0.003);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.12);

  if (success && target) {
    const damage = strength * 0.01;
    target.health = Math.max(0, target.health - damage);
    if (target.health <= 0) {
      target.isAlive = false;
      target.diedAtTick = ctx.tick;
      target.causeOfDeath = `killed by ${ctx.character.name}`;
      fameTracker.recordAchievement(ctx.character, 'Killed an opponent', 5);
    }
    // Create enmity
    modifyRelationshipStrength(target, ctx.character.id, -0.3);
  }

  return {
    success: !!success,
    narrative: success
      ? `Your attack connects. The opponent recoils.`
      : `You lunge, but miss your target.`,
    effects: success && target ? [{ type: 'damage_dealt', target: target.id, value: strength * 0.01 }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleDefend(_action: AgentAction, ctx: ActionContext): ActionResult {
  return {
    success: true,
    narrative: `You brace yourself, ready to defend.`,
    effects: [{ type: 'defense_stance', target: ctx.character.id, value: true }],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleFlee(_action: AgentAction, ctx: ActionContext): ActionResult {
  const speed = getGeneValue(ctx.character, 'speed');
  const success = worldRNG.chance(0.5 + speed * 0.004);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  return {
    success,
    narrative: success
      ? `You escape to safety.`
      : `You try to flee but are cornered.`,
    effects: success ? [{ type: 'position_change', target: ctx.character.id, value: 'flee' }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleBreed(_action: AgentAction, ctx: ActionContext): ActionResult {
  // Find a potential mate — opposite sex, same species
  const potentialMates = ctx.nearbyCharacters.filter(c =>
    c.speciesId === ctx.character.speciesId &&
    c.sex !== ctx.character.sex &&
    c.isAlive,
  );

  if (potentialMates.length === 0) {
    return {
      success: false,
      narrative: `Breeding requires a willing mate nearby.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Pick healthiest mate
  const mate = potentialMates.sort((a, b) => b.health - a.health)[0];
  const result = breed(ctx.character, mate, ctx.tick);

  if (!result) {
    const breedCheck = canBreed(ctx.character, mate);
    return {
      success: false,
      narrative: `Breeding fails: ${breedCheck.reason ?? 'conditions not met'}.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Register offspring
  for (const child of result.offspring) {
    characterRegistry.add(child);
  }

  // Create mate relationship
  addBidirectionalRelationship(ctx.character, mate, 'mate', 0.7);

  const count = result.offspring.length;
  fameTracker.recordAchievement(ctx.character, 'Produced offspring', 3);

  return {
    success: true,
    narrative: count === 1
      ? `New life enters the world. An offspring is born.`
      : `New life enters the world. ${count} offspring are born.`,
    effects: result.offspring.map(c => ({ type: 'birth', target: c.id, value: c.name })),
    sensoryData: buildSensoryData(ctx),
  };
}

function handleTeach(action: AgentAction, ctx: ActionContext): ActionResult {
  const intelligence = getGeneValue(ctx.character, 'intelligence');
  const target = ctx.nearbyCharacters[0];
  const success = target && worldRNG.chance(0.4 + intelligence * 0.004);

  const topic = (action.params.topic as string) ?? 'general';

  if (success && target) {
    // Check language barrier
    const comm = canCommunicate(ctx.character, target);
    if (!comm.canTalk) {
      return {
        success: false,
        narrative: `You try to teach, but the language barrier is insurmountable.`,
        effects: [],
        sensoryData: buildSensoryData(ctx),
      };
    }

    // Transfer knowledge
    const sourceKnowledge = ctx.character.knowledge.find(k => k.topic === topic);
    if (sourceKnowledge && !target.knowledge.some(k => k.topic === topic)) {
      target.knowledge.push({
        topic: sourceKnowledge.topic,
        detail: sourceKnowledge.detail,
        learnedAtTick: ctx.tick,
        source: 'taught',
      });
      modifyRelationshipStrength(ctx.character, target.id, 0.1);
      modifyRelationshipStrength(target, ctx.character.id, 0.15);
      fameTracker.recordAchievement(ctx.character, `Taught ${topic}`, 2);
    }
  }

  return {
    success: !!success,
    narrative: success
      ? `You share your knowledge with another.`
      : `Your lesson falls on deaf ears.`,
    effects: success ? [{ type: 'knowledge_shared', target: ctx.character.id, value: topic }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleLearn(_action: AgentAction, ctx: ActionContext): ActionResult {
  const intelligence = getGeneValue(ctx.character, 'intelligence');
  const success = worldRNG.chance(0.3 + intelligence * 0.005);

  if (success) {
    // Learn something about the environment
    const topics = ['terrain', 'weather_patterns', 'local_flora', 'local_fauna', 'water_sources'];
    const topic = worldRNG.pick(topics);
    if (!ctx.character.knowledge.some(k => k.topic === topic)) {
      ctx.character.knowledge.push({
        topic,
        detail: `Knowledge of ${topic} in ${ctx.regionName}`,
        learnedAtTick: ctx.tick,
        source: 'experience',
      });
    }
  }

  return {
    success,
    narrative: success
      ? `You gain new understanding from your observations.`
      : `The world holds its secrets for now.`,
    effects: success ? [{ type: 'knowledge_gained', target: ctx.character.id, value: 'observation' }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleExperiment(action: AgentAction, ctx: ActionContext): ActionResult {
  const intelligence = getGeneValue(ctx.character, 'intelligence');
  const curiosity = getGeneValue(ctx.character, 'curiosity');
  const success = worldRNG.chance(0.1 + (intelligence + curiosity) * 0.003);

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  if (success) {
    const subject = (action.params.subject as string) ?? 'the unknown';
    ctx.character.knowledge.push({
      topic: `experiment_${subject}`,
      detail: `Experimental discovery about ${subject}`,
      learnedAtTick: ctx.tick,
      source: 'experience',
    });
    fameTracker.recordAchievement(ctx.character, `Experimental discovery: ${subject}`, 8);
  }

  return {
    success,
    narrative: success
      ? `Your experiment yields unexpected results!`
      : `The experiment produces nothing of note.`,
    effects: success ? [{ type: 'discovery', target: ctx.character.id, value: action.params.subject }] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleObserve(_action: AgentAction, ctx: ActionContext): ActionResult {
  // Wire into species observation system
  const effects: ActionEffect[] = [];
  let narrative = `You observe your surroundings carefully.`;

  // Observe nearby species
  const seenSpecies = new Set<string>();
  for (const nearby of ctx.nearbyCharacters) {
    if (seenSpecies.has(nearby.speciesId)) continue;
    seenSpecies.add(nearby.speciesId);

    const observation = observeSpecies(ctx.character, nearby.speciesId, ctx.tick);
    if (observation.isFirstSighting) {
      narrative = observation.narrative;
      effects.push({ type: 'discovery', target: ctx.character.id, value: nearby.speciesId });
      fameTracker.recordAchievement(ctx.character, `First sighting of a new species`, 5);
    }
  }

  return {
    success: true,
    narrative,
    effects,
    sensoryData: buildSensoryData(ctx, true),
  };
}

function handleInspect(action: AgentAction, ctx: ActionContext): ActionResult {
  const targetName = (action.params.target as string) ?? 'the area';

  // If inspecting a resource, might discover properties
  const resource = ctx.region.resources.find(r => r.type === targetName);
  if (resource) {
    ctx.character.knowledge.push({
      topic: `resource_${targetName}`,
      detail: `Inspected ${targetName}: quantity appears ${resource.quantity > resource.maxQuantity * 0.5 ? 'abundant' : 'scarce'}`,
      learnedAtTick: ctx.tick,
      source: 'experience',
    });
  }

  return {
    success: true,
    narrative: `You inspect ${targetName} closely.`,
    effects: [],
    sensoryData: buildSensoryData(ctx, true),
  };
}

/** Patterns that indicate animal-based food */
const ANIMAL_FOOD_PATTERN = /fish|salmon|tuna|herring|sardine|krill|shrimp|crab|shellfish|squid|insect|worm|carrion|meat|egg|prey|rodent|mammal|bird|tilapia|lobster|clam|mussel|oyster|octopus|seal|whale|deer|rabbit|snake|frog|lizard|caribou|pike|abalone|eland|wombat|king_crab|elephant_seal|walrus|penguin|albatross|jellyfish|sturgeon|crawfish|catfish|trout|bass|anchov/i;
/** Patterns that indicate plant-based food */
const PLANT_FOOD_PATTERN = /grass|vegetation|berr|fruit|seed|algae|plankton|kelp|leaf|leaves|bark|root|nut|nectar|flower|fungi|bamboo|seagrass|lichen|moss|tuber|grain|millet|cacao|coffee|vanilla|palm|acacia|shea|gum|argan|rubber|coconut|mango|banana|papyrus|rice|wheat|sorghum|yam|cassava|taro|fern|herb|potato|pistachio|saffron|date|chestnut|ginseng|agave|barley|saltbush|spinifex|welwitschia|joshua_tree|edelweiss|cactus|peat|beech|birch|spruce|pine|eucalyptus|reed|quinoa|breadfruit|clove|nutmeg|pepper|tea|olive|grape|fig|citrus|melon|squash|bean|lentil|pea/i;
/** Water is universally relevant */
const WATER_PATTERN = /water|fresh_water|spring|oasis|river|stream|geothermal/i;

/** Filter available resources to only what this species would notice */
function filterResourcesByDiet(resources: string[], diet: string): string[] {
  return resources.filter(r => {
    if (WATER_PATTERN.test(r)) return true;
    if (diet === 'carnivore') return ANIMAL_FOOD_PATTERN.test(r);
    if (diet === 'herbivore') return PLANT_FOOD_PATTERN.test(r);
    if (diet === 'omnivore') return ANIMAL_FOOD_PATTERN.test(r) || PLANT_FOOD_PATTERN.test(r);
    if (diet === 'filter_feeder') return /plankton|krill|algae|seagrass/i.test(r);
    if (diet === 'detritivore') return /carrion|fungi|worm|leaf|leaves|bark|moss|lichen|silt/i.test(r);
    return false;
  });
}

/** Build sensory data for the character — filtered through species perception */
function buildSensoryData(ctx: ActionContext, enhanced: boolean = false): SensoryData {
  const nearby: EntitySighting[] = ctx.nearbyCharacters
    .slice(0, enhanced ? 5 : 3)
    .map(c => ({
      description: `A creature moves nearby`,
      distance: worldRNG.pick(['close', 'near', 'far'] as const),
      behavior: worldRNG.pick(['resting', 'moving', 'feeding', 'alert', 'hunting']),
    }));

  // Filter opportunities by species diet
  const species = speciesRegistry.get(ctx.character.speciesId);
  const diet = species?.traits.diet ?? 'omnivore';
  const relevantResources = filterResourcesByDiet(ctx.availableResources, diet);

  return {
    surroundings: `You are in ${ctx.regionName}. The ${ctx.weather} ${ctx.season} ${ctx.timeOfDay} surrounds you.`,
    nearbyEntities: nearby,
    weather: ctx.weather,
    timeOfDay: ctx.timeOfDay,
    season: ctx.season,
    threats: ctx.threats,
    opportunities: relevantResources.slice(0, 3),
  };
}
