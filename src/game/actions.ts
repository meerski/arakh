// ============================================================
// Intent-Based Action System
// ============================================================

import type {
  AgentAction, ActionResult, ActionType, Character, Region,
  SensoryData, EntitySighting, ActionEffect, CharacterId, Corpse,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { getGeneValue } from '../species/character.js';
import { funnyNarrative, getSpeciesCategory, type SpeciesCategory } from '../narrative/humor.js';
import { evaluateProposal } from './diplomacy.js';
import { canBreed, breed, evaluateCrossSpeciesEncounter } from '../species/genetics.js';
import { canCommunicate } from './language.js';
import { observeSpecies, createSpeciesDiscoveryEvent } from '../species/discovery.js';
import { attemptDiscovery } from './exploration.js';
import { characterRegistry } from '../species/registry.js';
import { addBidirectionalRelationship, modifyRelationshipStrength } from './social.js';
import { fameTracker } from './fame.js';
import { speciesRegistry } from '../species/species.js';
import { getEcosystem } from '../simulation/ecosystem.js';
import { corpseRegistry } from '../simulation/corpses.js';
import { encounterRegistry } from './encounters.js';
import { worldDrift } from '../security/world-drift.js';
import { roleRegistry } from './roles.js';
import { tierManager } from '../species/tier-manager.js';
import { domesticationRegistry } from './domestication.js';
import { intelligenceRegistry } from './intelligence.js';
import { espionageRegistry } from './espionage.js';
import { heartlandTracker } from './heartland.js';
import { betrayalRegistry } from './betrayal.js';
import { handleShareIntel } from './intel-sharing.js';
import { trustLedger } from './trust.js';
import { validateAction, sanitizeAction } from '../security/action-validator.js';
import { auditLog } from '../data/audit-log.js';
import { rateLimiter } from '../security/rate-limit.js';
import { antiGaming } from '../security/anti-gaming.js';
import { colonyRegistry, colonyForage, colonyDefend, colonyReproduce, colonyConstruct } from '../species/colony.js';

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
  corpses: Corpse[];
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

  // Filter nearby characters by compatible habitat layers (hard block)
  const charSpecies = speciesRegistry.get(character.speciesId);
  const charHabitat = charSpecies?.traits.habitat ?? ['surface'];

  const nearbyCharacters = characterRegistry.getByRegion(character.regionId)
    .filter(c => c.id !== character.id)
    .filter(c => {
      const otherSpecies = speciesRegistry.get(c.speciesId);
      const otherHabitat = otherSpecies?.traits.habitat ?? ['surface'];
      return charHabitat.some(h => otherHabitat.includes(h));
    });

  const availableResources = region.resources
    .filter(r => r.quantity > 0)
    .map(r => r.type);

  const threats = nearbyCharacters
    .filter(c => {
      const rel = character.relationships.find(r => r.targetId === c.id);
      return rel && rel.strength < -0.5;
    })
    .map(() => 'A hostile presence lurks nearby');

  const corpses = corpseRegistry.getCorpsesInRegion(region.id);

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
    corpses,
  };
}

/** Process an agent's action intent and return a narrative result */
export function processAction(action: AgentAction, context: ActionContext): ActionResult {
  const playerId = context.character.playerId;

  // --- Security Gate: Rate Limiting ---
  if (playerId && !rateLimiter.check(playerId)) {
    auditLog.log({
      tick: context.tick,
      timestamp: Date.now(),
      playerId: playerId,
      characterId: context.character.id,
      action,
      valid: false,
      rejectionReason: 'Rate limit exceeded',
    });
    return {
      success: false,
      narrative: 'You are acting too quickly. Take a moment to gather your thoughts.',
      effects: [],
      sensoryData: buildSensoryData(context),
    };
  }

  // --- Security Gate: Action Validation ---
  const validation = validateAction(action, context.character.id);
  if (!validation.valid) {
    auditLog.log({
      tick: context.tick,
      timestamp: Date.now(),
      playerId: playerId ?? ('system' as any),
      characterId: context.character.id,
      action,
      valid: false,
      rejectionReason: validation.reason,
    });
    return {
      success: false,
      narrative: 'You attempt something incomprehensible. Nothing happens.',
      effects: [],
      sensoryData: buildSensoryData(context),
    };
  }

  // --- Sanitize action params ---
  const sanitized = sanitizeAction(action);

  // --- Anti-gaming: record action for pattern analysis ---
  if (playerId) {
    antiGaming.recordAction(playerId, sanitized);
  }

  // Check for pending encounters — must respond first
  const pendingEncounters = encounterRegistry.getActiveEncounters(context.character.id);
  if (pendingEncounters.length > 0 && sanitized.type !== 'respond') {
    // Auto-resolve with the action as implicit response
    const enc = pendingEncounters[0];
    const resolution = encounterRegistry.resolveEncounter(enc.id, 'flee', context.tick);
    if (!context.character.isAlive) {
      return {
        success: false,
        narrative: resolution.narrative,
        effects: [],
        sensoryData: buildSensoryData(context),
      };
    }
  }

  const handler = ACTION_HANDLERS[sanitized.type];
  if (!handler) {
    return {
      success: false,
      narrative: 'You attempt something incomprehensible. Nothing happens.',
      effects: [],
      sensoryData: buildSensoryData(context),
    };
  }

  const result = handler(sanitized, context);

  // Apply effects to world state
  applyEffects(result.effects, context);

  // --- Audit: log successful action ---
  auditLog.log({
    tick: context.tick,
    timestamp: Date.now(),
    playerId: playerId ?? ('system' as any),
    characterId: context.character.id,
    action: sanitized,
    valid: true,
    resultSuccess: result.success,
  });

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
            characterRegistry.markDead(target.id, ctx.tick, 'killed in combat');
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

// ============================================================
// Predator Encounter Check — shared by risky actions
// ============================================================

/** Check for a predator encounter during a risky action. Returns an ActionResult if encounter fires, null otherwise. */
export function checkPredatorEncounter(ctx: ActionContext, riskLevel: number): ActionResult | null {
  const ecosystem = getEcosystem();
  if (!ecosystem) return null;

  const predators = ctx.nearbyCharacters.filter(c => {
    return ecosystem.foodWeb.some(e => e.predatorId === c.speciesId && e.preyId === ctx.character.speciesId);
  });

  // Apply drift, observation, sentinel protection, and night modifiers
  const detectionCoeff = worldDrift.getCoefficient('predator_detection', ctx.tick);
  const observationReduction = roleRegistry.getObservationModifier(ctx.character);
  const sentinelReduction = roleRegistry.getSentinelProtection(ctx.region.id, ctx.character.speciesId);
  const isNight = ctx.timeOfDay === 'night' || ctx.timeOfDay === 'dusk';
  const nightVuln = roleRegistry.getNightVulnerability(ctx.character, isNight);

  const adjustedRisk = riskLevel * detectionCoeff * (1 - observationReduction) * (1 - sentinelReduction) * (1 + nightVuln);

  if (predators.length === 0 || !worldRNG.chance(adjustedRisk)) return null;

  const predator = worldRNG.pick(predators);
  const predSpecies = speciesRegistry.get(predator.speciesId);
  const threatLevel = Math.min(1, getGeneValue(predator, 'strength') / 100 + getGeneValue(predator, 'size') / 200);

  // Create an encounter event instead of auto-resolving
  const encounter = encounterRegistry.createEncounter(
    ctx.character.id,
    'predator_spotted',
    { predatorId: predator.id, threatLevel },
    ctx.tick,
  );

  const optionList = encounter.options.map(o => o.action).join(', ');
  return {
    success: false,
    narrative: `A ${predSpecies?.commonName ?? 'predator'} approaches! You can: ${optionList}. Use the 'respond' action with your choice.`,
    effects: [{ type: 'energy_decrease', target: ctx.character.id, value: -0.02 }],
    sensoryData: buildSensoryData(ctx),
  };
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
  scavenge: handleScavenge,
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
  propose: handlePropose,
  respond: handleRespond,
  assign_role: handleAssignRole,
  domesticate: handleDomesticate,
  spy: handleSpy,
  infiltrate: handleInfiltrate,
  spread_rumors: handleSpreadRumors,
  counter_spy: handleCounterSpy,
  share_intel: (action, ctx) => handleShareIntel(action, ctx),
  betray: handleBetray,
  colony_forage: handleColonyForage,
  colony_defend: handleColonyDefend,
  colony_expand: handleColonyExpand,
  colony_construct: handleColonyConstruct,
  colony_reproduce: handleColonyReproduce,
};

function handleMove(action: AgentAction, ctx: ActionContext): ActionResult {
  // Predator encounter risk while moving (5%)
  const encounter = checkPredatorEncounter(ctx, 0.05);
  if (encounter) return encounter;

  const direction = (action.params.direction as string) ?? 'forward';
  const speed = getGeneValue(ctx.character, 'speed');
  const success = worldRNG.chance(0.8 + speed * 0.002);

  if (success) {
    // Energy cost for movement
    ctx.character.energy = Math.max(0, ctx.character.energy - 0.05);
    ctx.character.hunger = Math.min(1, ctx.character.hunger + 0.02);

    // Record exploration for family intel map
    intelligenceRegistry.recordExploration(ctx.character.id, ctx.region.id, ctx.region, ctx.tick);
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
  // Predator encounter risk while exploring (15%)
  const encounter = checkPredatorEncounter(ctx, 0.15);
  if (encounter) return encounter;

  // Wire into the real discovery system (drift-modified)
  const _explorationCoeff = worldDrift.getCoefficient('exploration', ctx.tick);
  const discovery = attemptDiscovery(ctx.character, ctx.region);

  // Energy/hunger cost for exploring
  ctx.character.energy = Math.max(0, ctx.character.energy - 0.08);
  ctx.character.hunger = Math.min(1, ctx.character.hunger + 0.03);

  // Record exploration for family intel map
  intelligenceRegistry.recordExploration(ctx.character.id, ctx.region.id, ctx.region, ctx.tick);

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
  // Predator encounter risk while foraging (10%)
  const encounter = checkPredatorEncounter(ctx, 0.10);
  if (encounter) return encounter;

  // Energy/hunger cost for searching for food
  ctx.character.energy = Math.max(0, ctx.character.energy - 0.04);
  ctx.character.hunger = Math.min(1, ctx.character.hunger + 0.01);

  const species = speciesRegistry.get(ctx.character.speciesId);
  const diet = species?.traits.diet ?? 'omnivore';

  // Find food matching the species' diet
  const foodPattern = diet === 'carnivore' ? ANIMAL_FOOD_PATTERN
    : diet === 'herbivore' ? PLANT_FOOD_PATTERN
    : diet === 'filter_feeder' ? /plankton|krill|algae|seagrass/i
    : diet === 'detritivore' ? /carrion|fungi|worm|leaf|leaves|bark|moss|lichen|silt/i
    : new RegExp(`${ANIMAL_FOOD_PATTERN.source}|${PLANT_FOOD_PATTERN.source}`, 'i'); // omnivore

  const hasFood = ctx.availableResources.some(r => foodPattern.test(r));
  const forageCoeff = worldDrift.getCoefficient('foraging', ctx.tick);
  const roleBonus = roleRegistry.getRoleBonus(ctx.character, 'forage');
  const husbandryBonus = domesticationRegistry.getDomesticationBenefits(ctx.character.id)
    .filter(b => b.type === 'food_production')
    .reduce((s, b) => s + b.magnitude, 0);
  const success = hasFood && worldRNG.chance(Math.min(0.95, 0.7 * forageCoeff + roleBonus + husbandryBonus));

  if (success) {
    // Consume a matching food resource
    const foodResource = ctx.region.resources.find(r =>
      r.quantity > 0 && foodPattern.test(r.type),
    );
    if (foodResource) {
      foodResource.quantity = Math.max(0, foodResource.quantity - 2);
    }
  }

  const dietNarratives: Record<string, [string, string]> = {
    carnivore: ['You find scraps of prey to sustain yourself.', 'You search for prey but find nothing to eat.'],
    herbivore: ['You find edible vegetation and graze.', 'You search for food but find nothing edible nearby.'],
    omnivore: ['You find sustenance nearby.', 'You search for food but find nothing edible nearby.'],
    filter_feeder: ['You filter nutrients from the water around you.', 'The water yields nothing to filter.'],
    detritivore: ['You find decaying matter to feed on.', 'You search the ground but find nothing to consume.'],
  };
  const [successText, failText] = dietNarratives[diet] ?? dietNarratives.omnivore;

  return {
    success,
    narrative: success ? successText : failText,
    effects: success ? [
      { type: 'hunger_decrease', target: ctx.character.id, value: -0.3 },
    ] : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleHunt(action: AgentAction, ctx: ActionContext): ActionResult {
  const mySpecies = speciesRegistry.get(ctx.character.speciesId);
  const diet = mySpecies?.traits.diet ?? 'omnivore';

  // Herbivores can't hunt
  if (diet === 'herbivore' || diet === 'filter_feeder' || diet === 'detritivore') {
    return {
      success: false,
      narrative: `Your species doesn't hunt.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  // Use food web to find valid prey species
  const ecosystem = getEcosystem();
  const preySpeciesIds = ecosystem
    ? ecosystem.foodWeb.filter(e => e.predatorId === ctx.character.speciesId).map(e => e.preyId)
    : [];

  // Filter nearby characters to food web prey only
  let validPrey = preySpeciesIds.length > 0
    ? ctx.nearbyCharacters.filter(c => preySpeciesIds.includes(c.speciesId) && c.isAlive)
    : ctx.nearbyCharacters.filter(c => c.isAlive); // fallback if no food web entries

  // Selective targeting via params.target
  const target = action.params.target as string | undefined;
  if (target && validPrey.length > 0) {
    switch (target) {
      case 'injured':
        validPrey = validPrey.filter(c => c.health < 0.5);
        break;
      case 'strongest':
        validPrey = [...validPrey].sort((a, b) => getGeneValue(b, 'strength') - getGeneValue(a, 'strength'));
        break;
      case 'nearest':
        // Just use first available (distance is simulated)
        validPrey = validPrey.slice(0, 1);
        break;
      case 'weakest':
        // Default behavior — sort by health ascending
        break;
      default: {
        // Treat as species name filter
        const speciesFilter = validPrey.filter(c => {
          const sp = speciesRegistry.get(c.speciesId);
          return sp?.commonName.toLowerCase().includes(target.toLowerCase());
        });
        if (speciesFilter.length > 0) validPrey = speciesFilter;
        break;
      }
    }
  }

  if (validPrey.length === 0) {
    return {
      success: false,
      narrative: `You stalk the area, but no suitable prey is nearby.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const strength = getGeneValue(ctx.character, 'strength');
  const speed = getGeneValue(ctx.character, 'speed');
  const strengthCoeff = worldDrift.getCoefficient('combat_strength', ctx.tick);
  const speedCoeff = worldDrift.getCoefficient('combat_speed', ctx.tick);

  // Pick weakest valid prey (unless already sorted by target preference)
  const prey = target === 'strongest' || target === 'nearest'
    ? validPrey[0]
    : [...validPrey].sort((a, b) => a.health - b.health)[0];
  const preySpeed = getGeneValue(prey, 'speed');
  const preySize = getGeneValue(prey, 'size');

  // Heartland hunt bonus — predators who know target's heartland get +15%
  const heartlandBonus = heartlandTracker.getHeartlandHuntBonus(ctx.character.familyTreeId, ctx.region.id);

  // Success based on predator strength/speed vs prey speed/size (drift-modified)
  const advantage = (strength * strengthCoeff + speed * speedCoeff) - (preySpeed + preySize * 0.5);
  const successChance = Math.max(0.1, Math.min(0.8, 0.4 + advantage * 0.003 + heartlandBonus));
  const success = worldRNG.chance(successChance);

  if (success) {
    const damage = strength * 0.015;
    prey.health = Math.max(0, prey.health - damage);
    if (prey.health <= 0) {
      const predSpecies = speciesRegistry.get(ctx.character.speciesId);
      characterRegistry.markDead(prey.id, ctx.tick, `hunted by ${predSpecies?.commonName ?? ctx.character.name}`);
      corpseRegistry.createCorpse(prey, ctx.tick);
    }
  } else {
    // Failed hunt: counter-attack chance from larger prey
    if (preySize > getGeneValue(ctx.character, 'size') && worldRNG.chance(0.2)) {
      const counterDmg = getGeneValue(prey, 'strength') * 0.008;
      ctx.character.health = Math.max(0, ctx.character.health - counterDmg);
      // Counter-attack creates encounter
      if (ctx.character.isAlive) {
        encounterRegistry.createEncounter(
          ctx.character.id,
          'rival_confrontation',
          { predatorId: prey.id, threatLevel: preySize / 100 },
          ctx.tick,
        );
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
  // Predator encounter risk while resting (3%)
  const encounter = checkPredatorEncounter(ctx, 0.03);
  if (encounter) return encounter;

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

  // Cross-species communication skill learning
  if (ctx.character.speciesId !== target.speciesId) {
    // 30% chance to gain communication_skill for this species
    if (worldRNG.chance(0.3)) {
      const existingSkill = ctx.character.knowledge.filter(
        k => k.topic === 'communication_skill' && k.detail === target.speciesId,
      ).length;
      if (existingSkill < 5) {
        ctx.character.knowledge.push({
          topic: 'communication_skill',
          detail: target.speciesId,
          learnedAtTick: ctx.tick,
          source: 'experience',
        });
      }
    }
    // 20% reciprocal for target
    if (worldRNG.chance(0.2)) {
      const targetSkill = target.knowledge.filter(
        k => k.topic === 'communication_skill' && k.detail === ctx.character.speciesId,
      ).length;
      if (targetSkill < 5) {
        target.knowledge.push({
          topic: 'communication_skill',
          detail: ctx.character.speciesId,
          learnedAtTick: ctx.tick,
          source: 'experience',
        });
      }
    }
  }

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
  const target = ctx.nearbyCharacters[0];
  if (!target) {
    return {
      success: false,
      narrative: `There is nothing nearby to attack.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.12);

  const strength = getGeneValue(ctx.character, 'strength');
  const mySize = getGeneValue(ctx.character, 'size');
  const targetStrength = getGeneValue(target, 'strength');
  const targetSize = getGeneValue(target, 'size');

  // Check for hostile/rival relationship or same-species rivalry
  const rel = ctx.character.relationships.find(r => r.targetId === target.id);
  const isHostile = rel && rel.strength < -0.3;
  const isSameSpecies = ctx.character.speciesId === target.speciesId;

  // Unprovoked cross-species attack: lower success, triggers enmity
  let successMod = 0;
  if (!isHostile && !isSameSpecies) {
    successMod = -0.15;
  }

  // Smaller attacker vs larger target: disadvantage + counter-damage risk
  const sizeAdvantage = mySize - targetSize;
  const baseSucessChance = 0.3 + (strength * 0.003) + (sizeAdvantage * 0.002) + successMod;
  const success = worldRNG.chance(Math.max(0.05, Math.min(0.85, baseSucessChance)));

  if (success) {
    const damage = strength * 0.01 + Math.max(0, sizeAdvantage * 0.001);
    target.health = Math.max(0, target.health - damage);
    if (target.health <= 0) {
      characterRegistry.markDead(target.id, ctx.tick, `killed by ${ctx.character.name}`);
      fameTracker.recordAchievement(ctx.character, 'Killed an opponent', 5);
    }
    modifyRelationshipStrength(target, ctx.character.id, -0.3);
  } else {
    // Counter-damage from larger target
    if (targetSize > mySize && worldRNG.chance(0.3)) {
      const counterDmg = targetStrength * 0.008;
      ctx.character.health = Math.max(0, ctx.character.health - counterDmg);
      modifyRelationshipStrength(target, ctx.character.id, -0.2);
    }
  }

  return {
    success,
    narrative: success
      ? `Your attack connects. The opponent recoils.`
      : `You lunge, but miss your target.${targetSize > mySize ? ' The larger creature retaliates.' : ''}`,
    effects: success ? [{ type: 'damage_dealt', target: target.id, value: strength * 0.01 }] : [],
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
  // Find a potential mate — opposite sex, preferably same species
  const sameSpeciesMates = ctx.nearbyCharacters.filter(c =>
    c.speciesId === ctx.character.speciesId &&
    c.sex !== ctx.character.sex &&
    c.isAlive,
  );

  // Also consider cross-species mates — must be opposite sex and alive
  const crossSpeciesMates = ctx.nearbyCharacters.filter(c =>
    c.speciesId !== ctx.character.speciesId &&
    c.sex !== ctx.character.sex &&
    c.isAlive,
  );

  const mate = sameSpeciesMates.length > 0
    ? sameSpeciesMates.sort((a, b) => b.health - a.health)[0]
    : crossSpeciesMates.length > 0
      ? crossSpeciesMates.sort((a, b) => b.health - a.health)[0]
      : null;

  if (!mate) {
    const species = speciesRegistry.get(ctx.character.speciesId);
    const category = species ? getSpeciesCategory(species.taxonomy) : 'small_mammal' as SpeciesCategory;
    const funny = funnyNarrative(category, 'breeding_fail', {
      name: ctx.character.name,
      speciesName: species?.commonName ?? 'creature',
    });
    return {
      success: false,
      narrative: funny ?? `Breeding requires a willing mate nearby.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Cross-species breeding: evaluate danger
  if (mate.speciesId !== ctx.character.speciesId) {
    const encounter = evaluateCrossSpeciesEncounter(ctx.character, mate);
    const sp1 = speciesRegistry.get(ctx.character.speciesId);
    const sp2 = speciesRegistry.get(mate.speciesId);
    const category = sp1 ? getSpeciesCategory(sp1.taxonomy) : 'small_mammal' as SpeciesCategory;
    const humorCtx = {
      name: ctx.character.name,
      speciesName: sp1?.commonName ?? 'creature',
      targetName: sp2?.commonName ?? 'creature',
    };

    if (encounter.outcome === 'death') {
      // Kill the initiator
      characterRegistry.markDead(ctx.character.id, ctx.tick, `killed during cross-species encounter with ${sp2?.commonName ?? 'unknown'}`);

      const funny = funnyNarrative(category, 'cross_breed_death', humorCtx);
      return {
        success: false,
        narrative: funny ?? `${ctx.character.name} approached a ${sp2?.commonName ?? 'creature'} with romantic intentions. It ended badly.`,
        effects: [{ type: 'damage_dealt', target: ctx.character.id, value: 999 }],
        sensoryData: buildSensoryData(ctx),
      };
    }

    if (encounter.outcome === 'rejection') {
      const funny = funnyNarrative(category, 'cross_breed_reject', humorCtx);
      return {
        success: false,
        narrative: funny ?? `The ${sp2?.commonName ?? 'creature'} showed no interest in ${ctx.character.name}'s advances.`,
        effects: [],
        sensoryData: buildSensoryData(ctx),
      };
    }

    // success or new_species — proceed to breed
  }

  // Character cap check — prevent breeding if at maximum
  if (tierManager.atCharacterCap) {
    return {
      success: false,
      narrative: 'The world teems with life — no room for more individuals right now.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const result = breed(ctx.character, mate, ctx.tick);

  if (!result) {
    const breedCheck = canBreed(ctx.character, mate);
    const species = speciesRegistry.get(ctx.character.speciesId);
    const category = species ? getSpeciesCategory(species.taxonomy) : 'small_mammal' as SpeciesCategory;
    const funny = funnyNarrative(category, 'breeding_fail', {
      name: ctx.character.name,
      speciesName: species?.commonName ?? 'creature',
    });
    return {
      success: false,
      narrative: funny ?? `Breeding fails: ${breedCheck.reason ?? 'conditions not met'}.`,
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

  if (result.isHybrid) {
    const sp1 = speciesRegistry.get(ctx.character.speciesId);
    const sp2 = speciesRegistry.get(mate.speciesId);
    const hybridSpecies = speciesRegistry.get(result.offspring[0]?.speciesId ?? '');
    const category = sp1 ? getSpeciesCategory(sp1.taxonomy) : 'small_mammal' as SpeciesCategory;
    const funny = funnyNarrative(category, 'cross_breed_success', {
      name: ctx.character.name,
      speciesName: sp1?.commonName ?? 'creature',
      targetName: sp2?.commonName ?? 'creature',
      hybridName: hybridSpecies?.commonName ?? 'hybrid',
    });
    fameTracker.recordAchievement(ctx.character, `Created hybrid species: ${hybridSpecies?.commonName ?? 'unknown'}`, 50);
    return {
      success: true,
      narrative: funny ?? `A new hybrid species is born! The ${hybridSpecies?.commonName ?? 'hybrid'} enters the world.`,
      effects: result.offspring.map(c => ({ type: 'birth', target: c.id, value: c.name })),
      sensoryData: buildSensoryData(ctx),
    };
  }

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
  // Predator encounter risk while observing (5%)
  const encounter = checkPredatorEncounter(ctx, 0.05);
  if (encounter) return encounter;

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

  // Train observation skill
  const ecosystem = getEcosystem();
  const nearbyPredators = ecosystem ? ctx.nearbyCharacters.filter(c =>
    ecosystem.foodWeb.some(e => e.predatorId === c.speciesId && e.preyId === ctx.character.speciesId),
  ).length : 0;
  const isNight = ctx.timeOfDay === 'night' || ctx.timeOfDay === 'dusk';
  roleRegistry.trainObservation(ctx.character, ctx.tick, { isNight, nearbyPredators });

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

function handlePropose(action: AgentAction, ctx: ActionContext): ActionResult {
  const targetId = action.params.targetId as string;
  const offer = (action.params.offer as string) ?? 'nothing';
  const demand = (action.params.demand as string) ?? 'nothing';

  // Find target
  const target = targetId
    ? ctx.nearbyCharacters.find(c => c.id === targetId)
    : ctx.nearbyCharacters[0];

  if (!target) {
    return {
      success: false,
      narrative: `There is no one nearby to negotiate with.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const result = evaluateProposal(ctx.character, target, offer, demand);

  if (result.accepted) {
    // Create pact relationship
    addBidirectionalRelationship(ctx.character, target, 'pact', 0.5);
    modifyRelationshipStrength(ctx.character, target.id, 0.15);
    modifyRelationshipStrength(target, ctx.character.id, 0.15);
    fameTracker.recordAchievement(ctx.character, 'Diplomatic agreement', 5);
  }

  return {
    success: result.accepted,
    narrative: result.narrative,
    effects: result.accepted
      ? [{ type: 'relationship_change', target: ctx.character.id, value: 'pact' }]
      : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleScavenge(action: AgentAction, ctx: ActionContext): ActionResult {
  const corpses = ctx.corpses;
  if (corpses.length === 0) {
    return {
      success: false,
      narrative: `There are no remains to scavenge from nearby.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.04);

  // Pick the freshest corpse with materials remaining
  const corpse = corpses
    .filter(c => c.materials.some(m => m.quantity > 0))
    .sort((a, b) => b.diedAtTick - a.diedAtTick)[0];

  if (!corpse) {
    return {
      success: false,
      narrative: `The remains nearby have already been picked clean.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  // Harvest the first available material
  const materialType = action.params.material as string | undefined;
  const mat = materialType
    ? corpse.materials.find(m => m.type === materialType && m.quantity > 0)
    : corpse.materials.find(m => m.quantity > 0);

  if (!mat) {
    return {
      success: false,
      narrative: `No usable materials remain on the corpse.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const harvested = corpseRegistry.harvestFromCorpse(corpse.id, mat.type, 2);
  if (harvested <= 0) {
    return {
      success: false,
      narrative: `The material crumbles as you try to harvest it.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const species = speciesRegistry.get(corpse.speciesId);
  const speciesName = species?.commonName ?? 'creature';

  // Add material to inventory
  ctx.character.inventory.push({
    id: crypto.randomUUID(),
    name: `${mat.type} from ${speciesName}`,
    type: 'material',
    properties: { materialType: mat.type, quality: mat.quality, quantity: harvested },
    createdAtTick: ctx.tick,
    createdBy: ctx.character.id,
  });

  // If biomass remains, also yield some food
  const effects: ActionEffect[] = [];
  if (corpse.biomassRemaining > 0) {
    effects.push({ type: 'hunger_decrease', target: ctx.character.id, value: -0.15 });
  }

  return {
    success: true,
    narrative: `You harvest ${mat.type} from the remains of a ${speciesName}.`,
    effects,
    sensoryData: buildSensoryData(ctx),
  };
}

function handleRespond(action: AgentAction, ctx: ActionContext): ActionResult {
  const encounterId = action.params.encounterId as string;
  const choice = action.params.choice as string;

  if (!encounterId || !choice) {
    // Try to respond to any active encounter
    const active = encounterRegistry.getActiveEncounters(ctx.character.id);
    if (active.length === 0) {
      return {
        success: false,
        narrative: `There is nothing to respond to.`,
        effects: [],
        sensoryData: buildSensoryData(ctx),
      };
    }
    const enc = active[0];
    const resolution = encounterRegistry.resolveEncounter(enc.id, choice ?? 'flee', ctx.tick);
    return {
      success: resolution.success,
      narrative: resolution.narrative,
      effects: resolution.damage > 0
        ? [{ type: 'damage_dealt', target: ctx.character.id, value: resolution.damage }]
        : [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const resolution = encounterRegistry.resolveEncounter(encounterId, choice, ctx.tick);
  return {
    success: resolution.success,
    narrative: resolution.narrative,
    effects: resolution.damage > 0
      ? [{ type: 'damage_dealt', target: ctx.character.id, value: resolution.damage }]
      : [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleAssignRole(action: AgentAction, ctx: ActionContext): ActionResult {
  const role = action.params.role as string;
  const validRoles = ['sentinel', 'scout', 'forager', 'guardian', 'healer', 'spy', 'none'];
  if (!role || !validRoles.includes(role)) {
    return {
      success: false,
      narrative: `Invalid role. Available roles: ${validRoles.join(', ')}.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const result = roleRegistry.assignRole(ctx.character.id, role as any, ctx.tick);
  const success = result.includes('assigned');

  return {
    success,
    narrative: result,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleDomesticate(action: AgentAction, ctx: ActionContext): ActionResult {
  const targetSpecies = action.params.species as string | undefined;
  const desiredType = action.params.type as string | undefined;

  // Find target: by species name or nearest non-same-species
  let target = ctx.nearbyCharacters.find(c => {
    if (c.speciesId === ctx.character.speciesId) return false;
    if (!c.isAlive) return false;
    if (targetSpecies) {
      const sp = speciesRegistry.get(c.speciesId);
      return sp?.commonName.toLowerCase().includes(targetSpecies.toLowerCase());
    }
    return true;
  });

  if (!target) {
    return {
      success: false,
      narrative: 'There is no suitable creature nearby to domesticate.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  const attempt = domesticationRegistry.attemptDomestication(
    ctx.character, target,
    desiredType as any,
    ctx.tick,
  );

  return {
    success: attempt.success,
    narrative: attempt.narrative,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleSpy(action: AgentAction, ctx: ActionContext): ActionResult {
  if (espionageRegistry.isOnMission(ctx.character.id)) {
    return {
      success: false,
      narrative: 'You are already on an espionage mission.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const targetRegion = (action.params.regionId as string) ?? ctx.region.id;
  const targetFamily = action.params.targetFamilyId as string | undefined;

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.08);

  const mission = espionageRegistry.startMission({
    type: 'spy',
    agentCharacterId: ctx.character.id,
    targetRegionId: targetRegion,
    targetFamilyId: targetFamily,
    tick: ctx.tick,
  });

  return {
    success: true,
    narrative: `You begin a covert reconnaissance mission. Stay hidden and observe.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleInfiltrate(action: AgentAction, ctx: ActionContext): ActionResult {
  if (espionageRegistry.isOnMission(ctx.character.id)) {
    return {
      success: false,
      narrative: 'You are already on an espionage mission.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const targetRegion = (action.params.regionId as string) ?? ctx.region.id;
  const targetFamily = action.params.targetFamilyId as string | undefined;

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.12);

  espionageRegistry.startMission({
    type: 'infiltrate',
    agentCharacterId: ctx.character.id,
    targetRegionId: targetRegion,
    targetFamilyId: targetFamily,
    tick: ctx.tick,
  });

  return {
    success: true,
    narrative: `You begin a deep infiltration mission. This will take time but may reveal heartland territories.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleSpreadRumors(action: AgentAction, ctx: ActionContext): ActionResult {
  if (espionageRegistry.isOnMission(ctx.character.id)) {
    return {
      success: false,
      narrative: 'You are already on an espionage mission.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const targetRegion = (action.params.regionId as string) ?? ctx.region.id;
  const targetFamily = action.params.targetFamilyId as string | undefined;

  if (!targetFamily) {
    return {
      success: false,
      narrative: 'You must specify a target family to spread rumors about.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.06);

  espionageRegistry.startMission({
    type: 'spread_rumors',
    agentCharacterId: ctx.character.id,
    targetRegionId: targetRegion,
    targetFamilyId: targetFamily,
    tick: ctx.tick,
  });

  return {
    success: true,
    narrative: `You begin planting false information to mislead the target family.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleCounterSpy(_action: AgentAction, ctx: ActionContext): ActionResult {
  if (espionageRegistry.isOnMission(ctx.character.id)) {
    return {
      success: false,
      narrative: 'You are already on an espionage mission.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.05);

  // Attempt to detect any active spy missions in this region
  const detected = espionageRegistry.attemptDetection(ctx.character, ctx.region.id, ctx.tick);

  if (detected) {
    const spy = characterRegistry.get(detected.agentCharacterId);
    const spySpecies = spy ? speciesRegistry.get(spy.speciesId) : null;

    // Create spy_detected encounter
    encounterRegistry.createEncounter(
      ctx.character.id,
      'spy_detected',
      { predatorId: spy?.id, threatLevel: 0.3 },
      ctx.tick,
    );

    return {
      success: true,
      narrative: `You detect a ${spySpecies?.commonName ?? 'creature'} conducting espionage in the area! Their family identity has been exposed.`,
      effects: [{ type: 'fame_increase', target: ctx.character.id, value: 3 }],
      sensoryData: buildSensoryData(ctx),
    };
  }

  return {
    success: true,
    narrative: `You scan the area for signs of espionage. The area appears clean.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleBetray(action: AgentAction, ctx: ActionContext): ActionResult {
  const victimFamilyId = action.params.victimFamilyId as string | undefined;
  const beneficiaryFamilyId = action.params.beneficiaryFamilyId as string | undefined;
  const betrayalType = (action.params.type as string) ?? 'intel_leak';

  if (!victimFamilyId) {
    return {
      success: false,
      narrative: 'You must specify a victim family to betray.',
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  const validTypes = ['intel_leak', 'heartland_reveal', 'alliance_backstab', 'false_intel', 'resource_theft'];
  if (!validTypes.includes(betrayalType)) {
    return {
      success: false,
      narrative: `Invalid betrayal type. Options: ${validTypes.join(', ')}.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }

  ctx.character.energy = Math.max(0, ctx.character.energy - 0.1);

  const event = betrayalRegistry.commitBetrayal({
    betrayerFamilyId: ctx.character.familyTreeId,
    betrayerCharacterId: ctx.character.id,
    victimFamilyId,
    beneficiaryFamilyId,
    type: betrayalType as any,
    tick: ctx.tick,
    regionId: ctx.region.id,
  });

  const witnessCount = event.witnessFamilyIds.length;
  const witnessWarning = witnessCount > 0
    ? ` ${witnessCount} families witnessed the betrayal.`
    : '';

  return {
    success: true,
    narrative: `You commit an act of ${betrayalType.replace(/_/g, ' ')}.${witnessWarning} Trust has been broken.`,
    effects: [{ type: 'fame_increase', target: ctx.character.id, value: 2 }],
    sensoryData: buildSensoryData(ctx),
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

// ============================================================
// Colony Actions — Swarm Mode
// ============================================================

function getCharacterColony(ctx: ActionContext) {
  return colonyRegistry.getByRegion(ctx.region.id)
    .find(c => c.speciesId === ctx.character.speciesId);
}

function handleColonyForage(_action: AgentAction, ctx: ActionContext): ActionResult {
  const colony = getCharacterColony(ctx);
  if (!colony) {
    return { success: false, narrative: 'No colony found in this region.', effects: [], sensoryData: buildSensoryData(ctx) };
  }
  const successRate = worldRNG.float(0.3, 1.0);
  colonyForage(colony, successRate);
  return {
    success: true,
    narrative: `The colony's foragers return with provisions. Stores now at ${Math.round(colony.health.provisions * 100)}%.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleColonyDefend(_action: AgentAction, ctx: ActionContext): ActionResult {
  const colony = getCharacterColony(ctx);
  if (!colony) {
    return { success: false, narrative: 'No colony found in this region.', effects: [], sensoryData: buildSensoryData(ctx) };
  }
  const threatLevel = ctx.threats.length > 0 ? 0.3 : 0.05;
  colonyDefend(colony, threatLevel);
  return {
    success: true,
    narrative: ctx.threats.length > 0
      ? `The soldiers of ${colony.name} rally against threats. The colony holds.`
      : `The colony guards patrol the perimeter. All is quiet.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleColonyExpand(action: AgentAction, ctx: ActionContext): ActionResult {
  const colony = getCharacterColony(ctx);
  if (!colony) {
    return { success: false, narrative: 'No colony found in this region.', effects: [], sensoryData: buildSensoryData(ctx) };
  }
  if (colony.health.provisions < 0.3) {
    return { success: false, narrative: `${colony.name} cannot expand — insufficient provisions.`, effects: [], sensoryData: buildSensoryData(ctx) };
  }
  colony.workerCount += Math.floor(worldRNG.float(2, 8));
  colony.health.provisions = Math.max(0, colony.health.provisions - 0.05);
  return {
    success: true,
    narrative: `${colony.name} extends its territory. New tunnels and chambers take shape.`,
    effects: [],
    sensoryData: buildSensoryData(ctx),
  };
}

function handleColonyConstruct(_action: AgentAction, ctx: ActionContext): ActionResult {
  const colony = getCharacterColony(ctx);
  if (!colony) {
    return { success: false, narrative: 'No colony found in this region.', effects: [], sensoryData: buildSensoryData(ctx) };
  }
  const narrative = colonyConstruct(colony);
  if (!narrative) {
    return { success: false, narrative: `${colony.name} lacks the provisions to build.`, effects: [], sensoryData: buildSensoryData(ctx) };
  }
  return { success: true, narrative, effects: [], sensoryData: buildSensoryData(ctx) };
}

function handleColonyReproduce(_action: AgentAction, ctx: ActionContext): ActionResult {
  const colony = getCharacterColony(ctx);
  if (!colony) {
    return { success: false, narrative: 'No colony found in this region.', effects: [], sensoryData: buildSensoryData(ctx) };
  }
  const narrative = colonyReproduce(colony);
  if (!narrative) {
    return {
      success: false,
      narrative: colony.queenId ? `${colony.name} cannot reproduce — provisions too low.` : `${colony.name} has no queen to produce offspring.`,
      effects: [],
      sensoryData: buildSensoryData(ctx),
    };
  }
  return { success: true, narrative, effects: [], sensoryData: buildSensoryData(ctx) };
}
