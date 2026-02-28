// ============================================================
// Arakh — Core Type Definitions
// ============================================================

// --- Identifiers ---
export type WorldId = string;
export type RegionId = string;
export type SpeciesId = string;
export type CharacterId = string;
export type CardId = string;
export type PlayerId = string;
export type OwnerId = string;
export type FamilyTreeId = string;
export type EventId = string;
export type ItemId = string;

// --- Time ---
export interface GameTime {
  tick: number;           // Monotonically increasing tick counter
  year: number;           // In-game year
  day: number;            // Day within year (0-364)
  hour: number;           // Hour within day (0-23)
  season: Season;
  lunarPhase: LunarPhase;
  isDay: boolean;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type LunarPhase = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// --- World ---
export interface World {
  id: WorldId;
  name: string;
  time: GameTime;
  regions: Map<RegionId, Region>;
  era: Era;
  startedAt: Date;
}

export interface Era {
  name: string;
  startTick: number;
  dominantSpecies: SpeciesId | null;
}

export interface Region {
  id: RegionId;
  name: string;
  layer: WorldLayer;
  biome: Biome;
  latitude: number;
  longitude: number;
  elevation: number;
  climate: RegionClimate;
  resources: Resource[];
  connections: RegionId[];
  hiddenLocations: HiddenLocation[];
  populations: Population[];
}

export type WorldLayer = 'surface' | 'underwater' | 'underground';

export type Biome =
  | 'tropical_rainforest' | 'temperate_forest' | 'boreal_forest'
  | 'savanna' | 'grassland' | 'desert' | 'tundra'
  | 'mountain' | 'wetland' | 'coastal'
  | 'coral_reef' | 'open_ocean' | 'deep_ocean' | 'hydrothermal_vent' | 'kelp_forest'
  | 'cave_system' | 'underground_river' | 'subterranean_ecosystem';

export interface RegionClimate {
  temperature: number;       // Celsius
  humidity: number;          // 0-1
  precipitation: number;     // mm per tick
  windSpeed: number;
  pollution: number;         // 0-1, caused by species activity
}

export interface Resource {
  type: string;              // e.g. "salmon", "oak_wood", "iron_ore"
  quantity: number;
  renewRate: number;         // Per tick regeneration
  maxQuantity: number;
  properties: Map<string, unknown>;  // Discoverable, species-dependent
}

export interface HiddenLocation {
  id: string;
  name: string;
  discoveryDifficulty: number;  // 0-1
  discovered: boolean;
  discoveredBy: CharacterId | null;
  contents: string[];           // Artifacts, resources, secrets
}

export interface Population {
  speciesId: SpeciesId;
  count: number;
  characters: CharacterId[];    // Agent-controlled characters in this region
}

// --- Taxonomy & Species ---
export interface TaxonomyNode {
  rank: TaxonomyRank;
  name: string;
  parentName: string | null;
  traits: Partial<SpeciesTraits>;
}

export type TaxonomyRank = 'class' | 'order' | 'family' | 'genus' | 'species';

export interface Species {
  id: SpeciesId;
  commonName: string;
  scientificName: string;
  taxonomy: TaxonomyPath;
  tier: SpeciesTier;
  traits: SpeciesTraits;
  status: SpeciesStatus;
  totalPopulation: number;
  genesisElderCount: number;
}

export interface TaxonomyPath {
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export type SpeciesTier = 'flagship' | 'notable' | 'generated';
export type SpeciesStatus = 'extant' | 'endangered' | 'extinct';

export interface SpeciesTraits {
  lifespan: number;             // In ticks
  size: number;                 // Relative scale 0-100
  speed: number;                // Movement speed
  strength: number;
  intelligence: number;
  perception: PerceptionProfile;
  diet: Diet;
  habitat: WorldLayer[];
  socialStructure: SocialStructure;
  reproductionRate: number;     // Offspring per breeding event
  gestationTicks: number;
  maturityTicks: number;
  nocturnal: boolean;
  aquatic: boolean;
  canFly: boolean;
}

export interface PerceptionProfile {
  visualRange: number;
  hearingRange: number;
  smellRange: number;
  echolocation: boolean;
  electroreception: boolean;
  thermalSensing: boolean;
}

export type Diet = 'herbivore' | 'carnivore' | 'omnivore' | 'detritivore' | 'filter_feeder';
export type SocialStructure = 'solitary' | 'pair' | 'pack' | 'herd' | 'colony' | 'hive';

// --- Character ---
export type Sex = 'male' | 'female';

export interface Character {
  id: CharacterId;
  name: string;
  speciesId: SpeciesId;
  playerId: PlayerId | null;
  regionId: RegionId;
  familyTreeId: FamilyTreeId;

  // Lifecycle
  bornAtTick: number;
  diedAtTick: number | null;
  causeOfDeath: string | null;
  age: number;                   // Current age in ticks
  isAlive: boolean;
  sex: Sex;
  generation: number;            // Generation number in family tree (0 = founder)

  // Genetics
  genetics: Genetics;

  // State
  health: number;                // 0-1
  energy: number;                // 0-1
  hunger: number;                // 0-1

  // Breeding
  lastBreedingTick: number | null;
  gestationEndsAtTick: number | null;  // Non-null if pregnant

  // Social
  relationships: Relationship[];
  parentIds: [CharacterId, CharacterId] | null;
  childIds: CharacterId[];

  // Legacy
  inventory: Item[];
  knowledge: Knowledge[];
  fame: number;
  achievements: Achievement[];
  isGenesisElder: boolean;
}

export interface Genetics {
  genes: Gene[];
  mutationRate: number;
}

export interface Gene {
  trait: string;
  value: number;
  dominant: boolean;
}

export interface Relationship {
  targetId: CharacterId;
  type: RelationshipType;
  strength: number;          // -1 to 1
}

export type RelationshipType = 'friend' | 'rival' | 'mate' | 'mentor' | 'student' | 'ally' | 'enemy' | 'trade_partner';

export interface Item {
  id: ItemId;
  name: string;
  type: ItemType;
  properties: Record<string, unknown>;
  createdAtTick: number;
  createdBy: CharacterId;
}

export type ItemType = 'tool' | 'artifact' | 'trophy' | 'resource' | 'food';

export interface Knowledge {
  topic: string;
  detail: string;
  learnedAtTick: number;
  source: 'experience' | 'taught' | 'inherited';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tick: number;
}

// --- Family Tree ---
export interface FamilyTree {
  id: FamilyTreeId;
  speciesId: SpeciesId;
  ownerId: OwnerId;
  rootCharacterId: CharacterId;
  generations: number;
  members: CharacterId[];
  isExtinct: boolean;
}

// --- Cards ---
export interface Card {
  id: CardId;
  characterId: CharacterId;
  ownerId: OwnerId;
  rarity: CardRarity;
  speciesId: SpeciesId;
  taxonomy: TaxonomyPath;
  characterName: string;
  genetics: Genetics;
  familyTreePosition: { generation: number; siblingIndex: number };
  achievements: Achievement[];
  heirlooms: Item[];
  fameScore: number;
  highlightReel: CardHighlight[];
  flavorText: string;
  causeOfDeath: string | null;
  era: string;
  bornAtTick: number;
  diedAtTick: number | null;
  soulboundTo: OwnerId;
  createdAt: Date;
}

export type CardRarity = 'genesis' | 'legendary' | 'rare' | 'uncommon' | 'common';

export interface CardHighlight {
  tick: number;
  description: string;
  significance: number;      // 0-1
}

// --- Player & Owner ---
export interface Player {
  id: PlayerId;
  ownerId: OwnerId;
  currentCharacterId: CharacterId | null;
  familyTreeId: FamilyTreeId | null;
  connectedAt: Date | null;
  isConnected: boolean;
}

export interface Owner {
  id: OwnerId;
  displayName: string;
  players: PlayerId[];
  cards: CardId[];
  dynastyScore: number;
  joinedAt: Date;
}

// --- Actions ---
export interface AgentAction {
  type: ActionType;
  params: Record<string, unknown>;
  timestamp: number;
}

export type ActionType =
  | 'move' | 'explore' | 'forage' | 'hunt' | 'rest'
  | 'build' | 'craft' | 'gather'
  | 'communicate' | 'trade' | 'ally' | 'attack' | 'defend' | 'flee'
  | 'breed' | 'teach' | 'learn'
  | 'experiment' | 'observe' | 'inspect';

export interface ActionResult {
  success: boolean;
  narrative: string;
  effects: ActionEffect[];
  sensoryData: SensoryData;
}

export interface ActionEffect {
  type: string;
  target: string;
  value: unknown;
}

export interface SensoryData {
  surroundings: string;          // Narrative description
  nearbyEntities: EntitySighting[];
  weather: string;
  timeOfDay: string;
  season: string;
  threats: string[];
  opportunities: string[];
}

export interface EntitySighting {
  description: string;        // Narrative, not IDs or stats
  distance: 'close' | 'near' | 'far';
  behavior: string;
}

// --- Events ---
export interface WorldEvent {
  id: EventId;
  type: EventType;
  level: EventLevel;
  regionIds: RegionId[];
  description: string;
  tick: number;
  effects: EventEffect[];
  resolved: boolean;
}

export type EventLevel = 'personal' | 'family' | 'community' | 'species' | 'cross_species' | 'regional' | 'continental' | 'global';

export type EventType =
  | 'natural_disaster' | 'weather_extreme' | 'eclipse' | 'meteor'
  | 'disease' | 'migration' | 'resource_depletion' | 'resource_discovery'
  | 'first_contact' | 'war' | 'alliance' | 'trade_route'
  | 'discovery' | 'tesla_moment' | 'extinction' | 'speciation'
  | 'cosmic' | 'artifact' | 'anomaly'
  | 'birth' | 'death' | 'wedding' | 'settlement';

export interface EventEffect {
  type: string;
  regionId?: RegionId;
  speciesId?: SpeciesId;
  magnitude: number;
}

// --- Simulation ---
export interface TickResult {
  tick: number;
  time: GameTime;
  events: WorldEvent[];
  births: CharacterId[];
  deaths: CharacterId[];
  discoveries: string[];
}

// --- API Messages ---
export interface AgentMessage {
  type: 'action' | 'chat' | 'directive';
  payload: AgentAction | ChatMessage | Directive;
}

export interface ChatMessage {
  from: CharacterId;
  to: CharacterId;
  content: string;
}

export interface Directive {
  ownerId: OwnerId;
  playerId: PlayerId;
  instruction: string;
}

export interface ServerMessage {
  type: 'action_result' | 'event' | 'sensory_update' | 'narrative' | 'error';
  payload: ActionResult | WorldEvent | SensoryData | NarrativeMessage | ErrorMessage;
}

export interface NarrativeMessage {
  text: string;
  category: 'personal' | 'world' | 'broadcast';
}

export interface ErrorMessage {
  code: string;
  message: string;
}
