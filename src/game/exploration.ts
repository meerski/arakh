// ============================================================
// Hidden Locations & Secrets System
// ============================================================
// The world is full of hidden places: secret caves, lost valleys,
// ancient artifacts. Some extremely hard to find — reward deep
// exploration. New secrets can emerge over time.

import type {
  HiddenLocation, CharacterId, RegionId, Region,
  SpeciesId, PerceptionProfile, WorldEvent,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';
import { getGeneValue } from '../species/character.js';
import type { Character } from '../types.js';

// --- Hidden Location Templates ---

export interface LocationTemplate {
  name: string;
  biomes: string[];           // Biomes where this can appear
  layers: string[];           // World layers where this can appear
  difficultyRange: [number, number];
  contentTypes: ContentType[];
  rarity: 'common' | 'rare' | 'legendary';
}

export type ContentType = 'artifact' | 'resource_cache' | 'ancient_text'
  | 'fossil' | 'crystal_formation' | 'sacred_spring' | 'portal'
  | 'nest' | 'burial_site' | 'mineral_vein' | 'underground_lake'
  | 'tide_pool' | 'thermal_spring' | 'fungal_garden';

const LOCATION_TEMPLATES: LocationTemplate[] = [
  // Surface
  { name: 'Hidden Valley', biomes: ['mountain', 'temperate_forest', 'boreal_forest'], layers: ['surface'], difficultyRange: [0.4, 0.7], contentTypes: ['resource_cache', 'sacred_spring'], rarity: 'rare' },
  { name: 'Ancient Grove', biomes: ['temperate_forest', 'tropical_rainforest', 'boreal_forest'], layers: ['surface'], difficultyRange: [0.3, 0.6], contentTypes: ['ancient_text', 'sacred_spring', 'fungal_garden'], rarity: 'common' },
  { name: 'Hollow Tree', biomes: ['temperate_forest', 'tropical_rainforest', 'boreal_forest'], layers: ['surface'], difficultyRange: [0.1, 0.3], contentTypes: ['nest', 'resource_cache'], rarity: 'common' },
  { name: 'Abandoned Burrow', biomes: ['grassland', 'savanna', 'desert'], layers: ['surface'], difficultyRange: [0.2, 0.4], contentTypes: ['nest', 'fossil'], rarity: 'common' },
  { name: 'Oasis', biomes: ['desert'], layers: ['surface'], difficultyRange: [0.5, 0.8], contentTypes: ['sacred_spring', 'resource_cache'], rarity: 'rare' },
  { name: 'Frozen Cavern', biomes: ['tundra', 'mountain'], layers: ['surface'], difficultyRange: [0.6, 0.9], contentTypes: ['fossil', 'crystal_formation', 'mineral_vein'], rarity: 'rare' },
  { name: 'Volcanic Vent', biomes: ['mountain'], layers: ['surface'], difficultyRange: [0.7, 0.95], contentTypes: ['mineral_vein', 'thermal_spring', 'crystal_formation'], rarity: 'legendary' },
  { name: 'Bone Field', biomes: ['savanna', 'grassland', 'desert'], layers: ['surface'], difficultyRange: [0.3, 0.5], contentTypes: ['fossil', 'burial_site'], rarity: 'common' },
  { name: 'Tidal Cave', biomes: ['coastal'], layers: ['surface'], difficultyRange: [0.4, 0.7], contentTypes: ['tide_pool', 'mineral_vein', 'crystal_formation'], rarity: 'rare' },
  { name: 'Mist Plateau', biomes: ['mountain', 'tropical_rainforest'], layers: ['surface'], difficultyRange: [0.8, 0.99], contentTypes: ['artifact', 'sacred_spring', 'portal'], rarity: 'legendary' },
  { name: 'Marshland Sanctuary', biomes: ['wetland'], layers: ['surface'], difficultyRange: [0.3, 0.5], contentTypes: ['nest', 'fungal_garden', 'sacred_spring'], rarity: 'common' },

  // Underwater
  { name: 'Sunken Reef', biomes: ['coral_reef', 'open_ocean'], layers: ['underwater'], difficultyRange: [0.3, 0.6], contentTypes: ['resource_cache', 'fossil'], rarity: 'common' },
  { name: 'Deep Grotto', biomes: ['deep_ocean', 'open_ocean'], layers: ['underwater'], difficultyRange: [0.6, 0.9], contentTypes: ['crystal_formation', 'mineral_vein', 'artifact'], rarity: 'rare' },
  { name: 'Whale Graveyard', biomes: ['deep_ocean', 'open_ocean'], layers: ['underwater'], difficultyRange: [0.5, 0.8], contentTypes: ['fossil', 'burial_site'], rarity: 'rare' },
  { name: 'Bioluminescent Cavern', biomes: ['deep_ocean', 'hydrothermal_vent'], layers: ['underwater'], difficultyRange: [0.7, 0.95], contentTypes: ['crystal_formation', 'portal', 'sacred_spring'], rarity: 'legendary' },
  { name: 'Kelp Labyrinth', biomes: ['kelp_forest'], layers: ['underwater'], difficultyRange: [0.3, 0.5], contentTypes: ['nest', 'resource_cache'], rarity: 'common' },
  { name: 'Thermal Oasis', biomes: ['hydrothermal_vent', 'deep_ocean'], layers: ['underwater'], difficultyRange: [0.5, 0.7], contentTypes: ['thermal_spring', 'mineral_vein'], rarity: 'rare' },

  // Underground
  { name: 'Crystal Chamber', biomes: ['cave_system'], layers: ['underground'], difficultyRange: [0.5, 0.8], contentTypes: ['crystal_formation', 'mineral_vein'], rarity: 'rare' },
  { name: 'Fungal Forest', biomes: ['cave_system', 'subterranean_ecosystem'], layers: ['underground'], difficultyRange: [0.3, 0.5], contentTypes: ['fungal_garden', 'resource_cache'], rarity: 'common' },
  { name: 'Underground Lake', biomes: ['cave_system', 'underground_river'], layers: ['underground'], difficultyRange: [0.4, 0.7], contentTypes: ['underground_lake', 'sacred_spring'], rarity: 'rare' },
  { name: 'Fossil Gallery', biomes: ['cave_system', 'subterranean_ecosystem'], layers: ['underground'], difficultyRange: [0.6, 0.85], contentTypes: ['fossil', 'ancient_text', 'artifact'], rarity: 'legendary' },
  { name: 'Lava Tube', biomes: ['cave_system', 'subterranean_ecosystem'], layers: ['underground'], difficultyRange: [0.5, 0.7], contentTypes: ['mineral_vein', 'thermal_spring'], rarity: 'rare' },
  { name: 'Echo Chamber', biomes: ['cave_system'], layers: ['underground'], difficultyRange: [0.2, 0.4], contentTypes: ['nest', 'crystal_formation'], rarity: 'common' },
];

// --- Content Generation ---

const CONTENT_DESCRIPTIONS: Record<ContentType, string[]> = {
  artifact: ['a strange relic of unknown origin', 'an ancient carved stone', 'a crystallized object pulsing with faint energy'],
  resource_cache: ['a rich deposit of natural materials', 'a hidden store of valuable resources', 'an untouched cache of rare materials'],
  ancient_text: ['markings on the wall that seem deliberate', 'strange patterns that might be a language', 'scratches that form a recognizable pattern'],
  fossil: ['the preserved remains of an ancient creature', 'petrified bones from a long-dead species', 'an imprint in stone of something once alive'],
  crystal_formation: ['a cluster of naturally formed crystals', 'translucent mineral growths catching the light', 'a geode split open revealing inner beauty'],
  sacred_spring: ['a spring of unusually pure water', 'a pool that seems to glow faintly', 'water that tastes unlike any other'],
  portal: ['a place where the air shimmers strangely', 'a spot where reality seems thin', 'a distortion in the fabric of the world'],
  nest: ['an abandoned nest or den', 'signs of past habitation', 'a sheltered spot used by many creatures before'],
  burial_site: ['a place heavy with the weight of the past', 'bones arranged with apparent purpose', 'a site of ancient significance'],
  mineral_vein: ['a seam of valuable mineral exposed in rock', 'glittering ore visible in the stone', 'a rich vein of raw material'],
  underground_lake: ['a vast body of still water in the darkness', 'a subterranean lake of unknown depth', 'dark water stretching into silence'],
  tide_pool: ['a sheltered pool teeming with small life', 'a natural aquarium carved by the tides', 'a miniature ecosystem in stone'],
  thermal_spring: ['warm water bubbling from below', 'a hot spring heated by deep earth', 'steaming water in a cold landscape'],
  fungal_garden: ['a carpet of strange mushrooms and molds', 'bioluminescent fungi lighting the darkness', 'an entire ecosystem of fungal life'],
};

// --- Core Functions ---

/** Generate hidden locations for a region based on its biome and layer */
export function generateHiddenLocations(region: Region): HiddenLocation[] {
  const rng = worldRNG;
  const applicable = LOCATION_TEMPLATES.filter(t =>
    t.biomes.includes(region.biome) && t.layers.includes(region.layer)
  );

  if (applicable.length === 0) return [];

  // Each region gets 1-4 hidden locations
  const count = rng.int(1, 4);
  const locations: HiddenLocation[] = [];

  for (let i = 0; i < count; i++) {
    const template = rng.pick(applicable);
    // Legendary locations are rarer, but guarantee at least 1 location
    const isLastChance = i === count - 1 && locations.length === 0;
    if (!isLastChance) {
      if (template.rarity === 'legendary' && !rng.chance(0.3)) continue;
      if (template.rarity === 'rare' && !rng.chance(0.6)) continue;
    }

    const difficulty = rng.float(template.difficultyRange[0], template.difficultyRange[1]);
    const contentType = rng.pick(template.contentTypes);
    const descriptions = CONTENT_DESCRIPTIONS[contentType];

    locations.push({
      id: crypto.randomUUID(),
      name: `${template.name} of ${region.name}`,
      discoveryDifficulty: difficulty,
      discovered: false,
      discoveredBy: null,
      contents: [rng.pick(descriptions)],
    });
  }

  return locations;
}

/** Attempt to discover a hidden location in a region */
export function attemptDiscovery(
  character: Character,
  region: Region,
): { found: boolean; location?: HiddenLocation; narrative: string } {
  const rng = worldRNG;
  const species = speciesRegistry.get(character.speciesId);
  if (!species) return { found: false, narrative: 'You search but find nothing.' };

  // Filter to undiscovered locations
  const undiscovered = region.hiddenLocations.filter(l => !l.discovered);
  if (undiscovered.length === 0) {
    return { found: false, narrative: 'You explore thoroughly, but this area holds no more secrets.' };
  }

  // Discovery chance based on:
  // - Species perception (visual, smell, hearing)
  // - Character curiosity gene
  // - Location difficulty
  const perception = species.traits.perception;
  const perceptionScore = (perception.visualRange + perception.hearingRange + perception.smellRange) / 300;
  const curiosity = getGeneValue(character, 'curiosity') / 100;
  const intelligence = getGeneValue(character, 'intelligence') / 100;

  // Echolocation bonus in caves
  const echoBonus = perception.echolocation && region.layer === 'underground' ? 0.2 : 0;
  // Electroreception bonus underwater
  const electroBonus = perception.electroreception && region.layer === 'underwater' ? 0.2 : 0;

  const discoveryPower = (perceptionScore * 0.4 + curiosity * 0.3 + intelligence * 0.2 + 0.1) + echoBonus + electroBonus;

  // Try each undiscovered location
  for (const location of undiscovered) {
    const chance = discoveryPower * (1 - location.discoveryDifficulty);
    // Apply world noise for non-determinism
    const adjustedChance = rng.applyWorldNoise(chance, character.age, region.latitude);

    if (rng.chance(Math.max(0.01, adjustedChance))) {
      // Found it!
      location.discovered = true;
      location.discoveredBy = character.id;

      return {
        found: true,
        location,
        narrative: `You discover something hidden: ${location.name}. ${location.contents[0]}`,
      };
    }
  }

  return {
    found: false,
    narrative: 'You sense there may be more to this place, but nothing reveals itself... yet.',
  };
}

/** Spawn new hidden locations over time (the world keeps generating secrets) */
export function maybeSpawnNewSecret(region: Region, tick: number): HiddenLocation | null {
  const rng = worldRNG;

  // Very low chance per tick — secrets are rare
  if (!rng.chance(0.00005)) return null;

  // More likely in regions with fewer known locations
  const discoveredCount = region.hiddenLocations.filter(l => l.discovered).length;
  const totalCount = region.hiddenLocations.length;
  if (totalCount > 6) return null; // Cap total locations per region

  const applicable = LOCATION_TEMPLATES.filter(t =>
    t.biomes.includes(region.biome) && t.layers.includes(region.layer)
  );
  if (applicable.length === 0) return null;

  const template = rng.pick(applicable);
  const contentType = rng.pick(template.contentTypes);
  const descriptions = CONTENT_DESCRIPTIONS[contentType];

  const newLocation: HiddenLocation = {
    id: crypto.randomUUID(),
    name: `${template.name} of ${region.name}`,
    discoveryDifficulty: rng.float(template.difficultyRange[0], template.difficultyRange[1]),
    discovered: false,
    discoveredBy: null,
    contents: [rng.pick(descriptions)],
  };

  region.hiddenLocations.push(newLocation);
  return newLocation;
}

/** Create a world event when a hidden location is discovered */
export function createDiscoveryEvent(
  location: HiddenLocation,
  character: Character,
  regionId: RegionId,
  tick: number,
): WorldEvent {
  const isLegendary = location.discoveryDifficulty > 0.8;

  return {
    id: crypto.randomUUID(),
    type: 'discovery',
    level: isLegendary ? 'species' : 'community',
    regionIds: [regionId],
    description: `${character.name} has discovered ${location.name}!`,
    tick,
    effects: [{
      type: 'discovery',
      regionId,
      magnitude: location.discoveryDifficulty,
    }],
    resolved: true,
  };
}
