// ============================================================
// Perception Tick — Broadcast sensory data to connected agents
// ============================================================
// Called each simulation tick. Sends filtered perception data
// to all connected agents every 5 ticks to avoid flooding.

import type {
  PlayerId,
  ServerMessage,
  Region,
  SensoryData,
  PerceptionProfile,
  Character,
  EntitySighting,
  NarrativeMessage,
} from '../types.js';
import { SessionManager, type Session } from './session.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';
import { worldRNG } from '../simulation/random.js';

/**
 * Broadcast perception data to all connected agents.
 * Called from the simulation's onTick handler.
 * Only sends every 5 ticks to avoid flooding WebSocket connections.
 */
export function broadcastPerceptionTicks(
  sessions: SessionManager,
  sendToPlayer: (playerId: PlayerId, message: ServerMessage) => void,
  regions: Map<string, Region>,
  tick: number,
  timeOfDay: string,
  season: string,
  weather: string,
): void {
  // Only send every 5 ticks to avoid flooding
  if (tick % 5 !== 0) return;

  const activeSessions = sessions.getActiveSessions();

  for (const session of activeSessions) {
    // Skip sessions with no bound character
    if (!session.characterId) continue;

    const character = characterRegistry.get(session.characterId);
    if (!character) continue;

    // If character is dead, send a death narrative instead
    if (!character.isAlive) {
      const deathMessage: ServerMessage = {
        type: 'narrative',
        payload: buildDeathNarrative(character),
      };
      sendToPlayer(session.playerId, deathMessage);
      continue;
    }

    const region = regions.get(character.regionId);
    if (!region) continue;

    const perception = resolvePerception(character, session);
    const sensoryData = buildPerceptionData(
      character,
      region,
      perception,
      timeOfDay,
      season,
      weather,
    );

    const message: ServerMessage = {
      type: 'sensory_update',
      payload: sensoryData,
    };

    sendToPlayer(session.playerId, message);
  }
}

/**
 * Resolve the perception profile for a character.
 * Prefers species-level perception traits if available, falls back to session defaults.
 */
function resolvePerception(character: Character, session: Session): PerceptionProfile {
  const species = speciesRegistry.get(character.speciesId);
  if (species) {
    return species.traits.perception;
  }
  return session.speciesPerception;
}

/**
 * Build sensory data from a character's perspective, filtered through
 * their species' perception limits.
 */
function buildPerceptionData(
  character: Character,
  region: Region,
  perception: PerceptionProfile,
  timeOfDay: string,
  season: string,
  weather: string,
): SensoryData {
  const surroundings = buildSurroundingsNarrative(region, weather, timeOfDay, season);
  const nearbyEntities = buildEntitySightings(character, region, perception, timeOfDay);
  const threats = buildThreats(character, region, perception);
  const opportunities = buildOpportunities(character, region, perception);

  return {
    surroundings,
    nearbyEntities,
    weather,
    timeOfDay,
    season,
    threats,
    opportunities,
  };
}

/**
 * Generate a narrative description of the character's surroundings.
 */
function buildSurroundingsNarrative(
  region: Region,
  weather: string,
  timeOfDay: string,
  season: string,
): string {
  const biomeDescriptions: Record<string, string> = {
    tropical_rainforest: 'Dense canopy overhead, alive with calls and rustling',
    temperate_forest: 'Tall trees stretch in every direction, dappled light filtering through',
    boreal_forest: 'Dark conifers stand packed together, the air sharp with resin',
    savanna: 'Open grasslands roll to the horizon under a vast sky',
    grassland: 'Waves of grass ripple in the wind across the plain',
    desert: 'Sand and stone stretch endlessly under a merciless sky',
    tundra: 'Frozen ground extends in all directions, barren and windswept',
    mountain: 'Rocky slopes rise steeply, the air thin and cold',
    wetland: 'Murky water pools among reeds and half-submerged vegetation',
    coastal: 'Waves lap against the shore where land meets sea',
    coral_reef: 'Vivid corals and swaying anemones surround you in warm shallows',
    open_ocean: 'Nothing but water in every direction, the deep below unknowable',
    deep_ocean: 'Crushing darkness presses in, broken only by faint bioluminescence',
    hydrothermal_vent: 'Superheated water shimmers upward from cracks in the ocean floor',
    kelp_forest: 'Towering kelp sways in the current, filtering pale green light',
    cave_system: 'Stone walls close in, darkness absolute beyond a few paces',
    underground_river: 'Water rushes through carved stone passages in the deep dark',
    subterranean_ecosystem: 'Strange life clings to damp rock in the lightless depths',
  };

  const biomeNarrative = biomeDescriptions[region.biome] ?? 'An unfamiliar landscape surrounds you';

  const weatherNarratives: Record<string, string> = {
    clear: '',
    rain: 'Rain falls steadily, dampening everything.',
    storm: 'A fierce storm rages, wind howling and rain lashing.',
    snow: 'Snow drifts down, muffling all sound.',
    fog: 'Thick fog obscures the distance.',
    drought: 'The air is parched, the ground cracked and dry.',
    heatwave: 'Oppressive heat radiates from every surface.',
  };

  const timeNarratives: Record<string, string> = {
    dawn: 'The first light of dawn creeps across the horizon.',
    morning: 'Morning light illuminates the landscape.',
    noon: 'The sun sits high overhead.',
    afternoon: 'Long shadows begin to stretch eastward.',
    dusk: 'The sky burns with the colors of dusk.',
    night: 'Darkness has settled over the land.',
  };

  const parts = [
    `${region.name}. ${biomeNarrative}.`,
    timeNarratives[timeOfDay] ?? '',
    weatherNarratives[weather] ?? '',
    `It is ${season}.`,
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Build entity sightings for other characters in the same region,
 * filtered through the character's perception profile.
 */
function buildEntitySightings(
  character: Character,
  region: Region,
  perception: PerceptionProfile,
  timeOfDay: string,
): EntitySighting[] {
  const regionCharacters = characterRegistry.getByRegion(region.id);
  const sightings: EntitySighting[] = [];

  for (const other of regionCharacters) {
    // Skip self
    if (other.id === character.id) continue;

    // Assign a simulated distance category
    const distanceRoll = worldRNG.float(0, 100);
    const distance: 'close' | 'near' | 'far' =
      distanceRoll < 30 ? 'close' : distanceRoll < 65 ? 'near' : 'far';

    // Check if this entity is within perception range
    const distanceThreshold = distance === 'close' ? 20 : distance === 'near' ? 50 : 80;

    // Night reduces visual range unless nocturnal or has echolocation
    let effectiveVisualRange = perception.visualRange;
    if (timeOfDay === 'night' || timeOfDay === 'dusk') {
      if (perception.echolocation) {
        effectiveVisualRange *= 1.2;
      } else {
        effectiveVisualRange *= 0.4;
      }
    }

    // Hearing and smell can supplement visual range
    const effectiveRange = Math.max(
      effectiveVisualRange,
      perception.hearingRange * 0.7,
      perception.smellRange * 0.5,
    );

    if (effectiveRange < distanceThreshold) continue;

    // Build narrative description (never expose IDs or stats)
    const species = speciesRegistry.get(other.speciesId);
    const speciesName = species ? species.commonName : 'unknown creature';

    const description = buildEntityDescription(other, speciesName, perception);
    const behavior = describeEntityBehavior(other);

    sightings.push({ description, distance, behavior });
  }

  return sightings;
}

/**
 * Build a narrative description of an observed entity.
 * Detail depends on perception quality.
 */
function buildEntityDescription(
  other: Character,
  speciesName: string,
  perception: PerceptionProfile,
): string {
  const quality = (perception.visualRange + perception.hearingRange) / 200;

  if (quality > 0.7) {
    const healthDesc = other.health > 0.7 ? 'healthy-looking' : other.health > 0.3 ? 'weary' : 'wounded';
    return `A ${healthDesc} ${speciesName}`;
  }
  if (quality > 0.4) {
    return `What appears to be a ${speciesName}`;
  }
  return 'A vague shape moving in the distance';
}

/**
 * Describe what an observed entity appears to be doing.
 */
function describeEntityBehavior(other: Character): string {
  if (other.hunger > 0.7) return 'appears to be searching for food';
  if (other.energy < 0.3) return 'resting quietly';
  if (other.health < 0.3) return 'moving slowly, seemingly injured';
  if (other.gestationEndsAtTick !== null) return 'moving carefully, protectively';

  const behaviors = [
    'moving through the area',
    'watching its surroundings',
    'foraging nearby',
    'alert and attentive',
    'going about its business',
  ];
  const idx = Math.abs(worldRNG.int(0, behaviors.length - 1));
  return behaviors[idx];
}

/**
 * Build threat descriptions for the character.
 * Threats are hostile characters in the same region, filtered by perception.
 */
function buildThreats(
  character: Character,
  region: Region,
  perception: PerceptionProfile,
): string[] {
  const threats: string[] = [];

  // Find hostile relationships in region
  const regionCharacters = characterRegistry.getByRegion(region.id);

  for (const other of regionCharacters) {
    if (other.id === character.id) continue;

    const isHostile = character.relationships.some(
      r => r.targetId === other.id && (r.type === 'enemy' || r.type === 'rival') && r.strength < -0.3,
    );

    if (!isHostile) continue;

    // Filter by perception
    const quality = perception.visualRange / 100;
    const species = speciesRegistry.get(other.speciesId);
    const speciesName = species ? species.commonName : 'creature';

    if (quality > 0.7) {
      threats.push(`A hostile ${speciesName} lurks nearby`);
    } else if (quality > 0.4) {
      threats.push('A potential danger nearby');
    } else {
      threats.push('Something feels wrong');
    }
  }

  // Environmental threats from climate
  if (region.climate.temperature > 45) {
    threats.push('The heat is dangerously intense');
  } else if (region.climate.temperature < -20) {
    threats.push('The cold bites deep, threatening survival');
  }

  if (region.climate.pollution > 0.7) {
    threats.push('The air feels toxic and heavy');
  }

  return threats;
}

/** Patterns that indicate animal-based food (carnivore/omnivore relevant) */
const ANIMAL_FOOD_PATTERNS = /fish|salmon|tuna|herring|sardine|krill|shrimp|crab|shellfish|squid|insect|worm|carrion|meat|egg|prey|rodent|mammal|bird|tilapia|lobster|clam|mussel|oyster|octopus|seal|whale|deer|rabbit|snake|frog|lizard|caribou|pike|abalone|eland|wombat|king_crab|elephant_seal|walrus|penguin|albatross|jellyfish|sturgeon|crawfish|catfish|trout|bass|anchov/i;

/** Patterns that indicate plant-based food (herbivore/omnivore relevant) */
const PLANT_FOOD_PATTERNS = /grass|vegetation|berr|fruit|seed|algae|plankton|kelp|leaf|leaves|bark|root|nut|nectar|flower|fungi|bamboo|seagrass|lichen|moss|tuber|grain|millet|cacao|coffee|vanilla|palm|acacia|shea|gum|argan|rubber|coconut|mango|banana|papyrus|rice|wheat|sorghum|yam|cassava|taro|fern|herb|potato|pistachio|saffron|date|chestnut|ginseng|agave|barley|saltbush|spinifex|welwitschia|joshua_tree|edelweiss|cactus|peat|beech|birch|spruce|pine|eucalyptus|reed|quinoa|breadfruit|clove|nutmeg|pepper|tea|olive|grape|fig|citrus|melon|squash|bean|lentil|pea/i;

/** Patterns for water sources (relevant to all species) */
const WATER_PATTERNS = /water|fresh_water|spring|oasis|river|stream|geothermal/i;

/** Patterns for materials only intelligent species would notice */
const MATERIAL_PATTERNS = /wood|hardwood|rosewood|cedar|stone|iron|copper|clay|flint|obsidian|sulfur|salt|gem|gold|silver|diamond|sapphire|phosphate|marble|granite|sand|silt|coral|amber|jade|tin|coal|oil|crystal/i;

/** Check if a resource is relevant to a species based on diet */
function isResourceRelevant(resourceType: string, diet: string, intelligence: number): boolean {
  // Water is universally relevant
  if (WATER_PATTERNS.test(resourceType)) return true;

  if (diet === 'carnivore') {
    return ANIMAL_FOOD_PATTERNS.test(resourceType);
  }
  if (diet === 'herbivore') {
    return PLANT_FOOD_PATTERNS.test(resourceType);
  }
  if (diet === 'omnivore') {
    if (ANIMAL_FOOD_PATTERNS.test(resourceType) || PLANT_FOOD_PATTERNS.test(resourceType)) return true;
    return intelligence > 60 && MATERIAL_PATTERNS.test(resourceType);
  }
  if (diet === 'filter_feeder') {
    return /plankton|krill|algae|seagrass/i.test(resourceType);
  }
  if (diet === 'detritivore') {
    return /carrion|fungi|worm|leaf|leaves|bark|moss|lichen|silt/i.test(resourceType);
  }
  return false;
}

/**
 * Build opportunity descriptions based on available resources,
 * filtered by species biology and limited by perception range.
 */
function buildOpportunities(
  character: Character,
  region: Region,
  perception: PerceptionProfile,
): string[] {
  const opportunities: string[] = [];
  const species = speciesRegistry.get(character.speciesId);
  const diet = species?.traits.diet ?? 'omnivore';
  const intelligence = species?.traits.intelligence ?? 50;

  // Number of opportunities visible depends on perception
  const maxVisible = Math.ceil(perception.visualRange / 25);

  for (const resource of region.resources) {
    if (opportunities.length >= maxVisible) break;
    if (resource.quantity <= 0) continue;
    if (!isResourceRelevant(resource.type, diet, intelligence)) continue;

    const abundanceDesc = resource.quantity > resource.maxQuantity * 0.7
      ? 'abundant'
      : resource.quantity > resource.maxQuantity * 0.3
        ? 'some'
        : 'scarce traces of';

    opportunities.push(`${abundanceDesc} ${resource.type} available nearby`);
  }

  // Smell-based hints: carnivores/omnivores might sense prey nearby
  if ((diet === 'carnivore' || diet === 'omnivore') && perception.smellRange > 40) {
    const preyInRegion = characterRegistry.getByRegion(region.id)
      .filter(c => c.id !== character.id && c.isAlive);
    if (preyInRegion.length > 0 && opportunities.length < maxVisible) {
      opportunities.push('the scent of prey carries on the current');
    }
  }

  // If no food found, provide environmental awareness hints
  if (opportunities.length === 0) {
    const biomeHints: Record<string, string[]> = {
      mountain: ['the terrain is steep and rocky, but life clings to the crevices', 'thin air carries faint scents from the valleys below'],
      desert: ['the barren landscape offers little, but something stirs beneath the sand', 'the dry wind carries distant scents'],
      tundra: ['the frozen ground hides what little sustenance exists here', 'beneath the ice, faint signs of life persist'],
      boreal_forest: ['the dense forest holds secrets among its roots', 'the scent of resin mingles with something faintly edible'],
      deep_ocean: ['the crushing depths hold sparse but concentrated life', 'faint chemical traces drift through the darkness'],
      cave_system: ['dampness clings to the walls — something grows in the dark', 'the still air carries the faintest organic traces'],
    };
    const hints = biomeHints[region.biome];
    if (hints) {
      opportunities.push(worldRNG.pick(hints));
    } else {
      opportunities.push('the environment holds potential, but nothing obvious presents itself');
    }
  }

  // Hidden locations can be hinted at with high perception
  if (perception.visualRange > 70 || perception.smellRange > 60) {
    for (const hidden of region.hiddenLocations) {
      if (hidden.discovered) continue;
      if (worldRNG.float(0, 1) < hidden.discoveryDifficulty) continue;
      opportunities.push('Something interesting seems hidden nearby');
      break; // Only hint at one per tick
    }
  }

  return opportunities;
}

/**
 * Build a death narrative for a character that has died.
 */
function buildDeathNarrative(character: Character): NarrativeMessage {
  const cause = character.causeOfDeath ?? 'unknown causes';
  return {
    text: `${character.name} has perished. Cause: ${cause}. Their story has ended, but their legacy may live on through their descendants.`,
    category: 'personal',
  };
}
