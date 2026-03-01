// ============================================================
// Arakh — Core Type Definitions
// ============================================================

// --- Identifiers ---
export type WorldId = string;
export type RegionId = string;
export type SpeciesId = string;
export type CharacterId = string;
export type ColonyId = string;
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
  isDay: boolean;         // Kept for backward compat, derived from lightLevel
  lightLevel: number;     // 0 (midnight) to 1 (noon), continuous
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
  plantPopulations: PlantPopulation[];
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
  metabolicRate: number;    // Actions per tick (higher = faster metabolism, more stamina drain)
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
  stamina: number;               // 0-1, drains with actions, recovers with rest/sleep

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

  // Politics
  socialRank: number;           // 0-100, influence within group
  loyalties: Map<CharacterId, number>; // loyalty strength toward leaders

  // Role
  role: SpeciesRole;

  // Character class
  characterClass: CharacterClass;
  impactScore: number;
}

export type CharacterClass = 'main' | 'regular';

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

export type RelationshipType = 'friend' | 'rival' | 'mate' | 'mentor' | 'student' | 'ally' | 'enemy' | 'trade_partner' | 'pact' | 'master' | 'servant' | 'symbiont';

export interface Item {
  id: ItemId;
  name: string;
  type: ItemType;
  properties: Record<string, unknown>;
  createdAtTick: number;
  createdBy: CharacterId;
}

export type ItemType = 'tool' | 'artifact' | 'trophy' | 'resource' | 'food' | 'material';

export type KnowledgeLayer = 'instinct' | 'inherited' | 'experiential';
export type KnowledgeSource = 'experience' | 'taught' | 'inherited' | 'instinct';

export interface Knowledge {
  topic: string;
  detail: string;
  learnedAtTick: number;
  source: KnowledgeSource;
  layer?: KnowledgeLayer;        // Defaults to 'experiential' if omitted
  reliability?: number;          // 0-1, decays over time (defaults to 1)
  generation?: number;           // Generation when learned (for inherited decay)
}

export type AchievementTier = 'mythic' | 'legendary' | 'epic' | 'rare' | 'common';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tick: number;
  tier?: AchievementTier;
}

// --- Dynasty Tiers ---
export type DynastyTier = 'individual' | 'lineage' | 'population';

export interface PopulationGenome {
  traitMeans: Record<string, number>;
  traitVariance: Record<string, number>;
  dominanceLikelihoods: Record<string, number>;
  mutationRate: number;
  sampleSize: number;
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
  tier: DynastyTier;
  populationGenome: PopulationGenome | null;
  populationCount: number;
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

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

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
  | 'build' | 'craft' | 'gather' | 'scavenge'
  | 'communicate' | 'trade' | 'ally' | 'attack' | 'defend' | 'flee'
  | 'breed' | 'teach' | 'learn'
  | 'experiment' | 'observe' | 'inspect'
  | 'propose' | 'respond'
  | 'assign_role' | 'domesticate'
  | 'spy' | 'infiltrate' | 'spread_rumors' | 'counter_spy' | 'share_intel' | 'betray'
  | 'colony_forage' | 'colony_defend' | 'colony_expand' | 'colony_construct' | 'colony_reproduce';

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
  | 'birth' | 'death' | 'wedding' | 'settlement'
  | 'catastrophe' | 'famine' | 'flood' | 'forest_fire' | 'plague'
  | 'espionage' | 'betrayal';

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
  actionResults: ActionResultEntry[];
}

export interface ActionResultEntry {
  playerId: PlayerId;
  characterId: CharacterId;
  action: AgentAction;
  result: ActionResult;
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

// --- Pacts & Diplomacy ---
export interface Pact {
  id: string;
  proposerId: CharacterId;
  targetId: CharacterId;
  offer: string;
  demand: string;
  acceptedAtTick: number;
  expiresAtTick: number | null;
  broken: boolean;
  brokenBy: CharacterId | null;
}

// --- Species Advancement ---
export interface SpeciesAdvancement {
  speciesId: SpeciesId;
  regionId: RegionId;
  domains: Record<string, number>;         // domain → tier 0-4
  researchProgress: Record<string, number>; // domain → partial progress toward next tier
}

// --- Plants ---
export type PlantType =
  | 'grass' | 'shrub' | 'deciduous_tree' | 'conifer' | 'tropical_tree'
  | 'algae' | 'kelp' | 'seagrass' | 'plankton' | 'fungi' | 'moss' | 'cactus';

export interface PlantPopulation {
  plantType: PlantType;
  biomass: number;
  maxBiomass: number;
  growthRate: number;
  spreadRate: number;
  permanentlyDestroyed: boolean;
  ticksBelowThreshold: number;
}

// --- Corpses & Materials ---
export type MaterialType =
  | 'bone' | 'shell' | 'hide' | 'teeth' | 'horn' | 'feather'
  | 'scale' | 'chitin' | 'silk' | 'blubber' | 'ivory'
  | 'coral_fragment' | 'cartilage' | 'quill';

export interface CorpseMaterial {
  type: MaterialType;
  quantity: number;
  quality: number;  // 0-1
}

export interface Corpse {
  id: string;
  speciesId: SpeciesId;
  regionId: RegionId;
  characterId: CharacterId;
  diedAtTick: number;
  materials: CorpseMaterial[];
  biomassRemaining: number;
  decayRate: number;
}

// --- Encounters ---
export type EncounterType =
  | 'predator_spotted' | 'territorial_challenge' | 'stampede'
  | 'natural_hazard' | 'rival_confrontation' | 'spy_detected';

export interface EncounterOption {
  action: string;
  description: string;
  successFactors: string[];
  riskLevel: number;  // 0-1
}

export interface EncounterEvent {
  id: string;
  type: EncounterType;
  characterId: CharacterId;
  triggerTick: number;
  predatorId: CharacterId | null;
  threatLevel: number;  // 0-1
  options: EncounterOption[];
  expiresAtTick: number;
  resolved: boolean;
}

// --- Multi-Species Alliances ---
export type SpeciesRole = 'sentinel' | 'scout' | 'forager' | 'guardian' | 'healer' | 'spy' | 'none';

export type AllianceTrigger = 'common_enemy' | 'resource_scarcity' | 'invasive_species' | 'diplomatic' | 'defense_pact';

export interface MultiSpeciesAlliance {
  id: string;
  name: string;
  memberSpecies: SpeciesId[];
  sharedRegionIds: RegionId[];
  formedAtTick: number;
  trigger: AllianceTrigger;
  strength: number;  // 0-1
}

// --- Region Dynamics ---
export interface RegionProfile {
  regionId: RegionId;
  harmonyScore: number;   // 0-1
  chaosScore: number;     // 0-1
  stabilityTrend: number; // -1 to 1
  dominantStrategy: 'harmony' | 'chaos' | 'neutral';
}

// --- Intelligence & Fog-of-War ---
export interface RegionIntel {
  regionId: RegionId;
  discoveredAtTick: number;
  lastUpdatedTick: number;
  reliability: number; // 0-1
  knownResources: string[];
  knownSpecies: SpeciesId[];
  knownPopEstimate: number;
  knownThreats: string[];
  source: 'exploration' | 'shared' | 'rumor' | 'inherited';
  sourceCharacterId: CharacterId | null;
  isMisinformation: boolean;
  lastDecayTick?: number;
}

export interface FamilyIntelMap {
  familyTreeId: FamilyTreeId;
  knownRegions: Map<RegionId, RegionIntel>;
  exploredRegionIds: Set<RegionId>;
  lastFullSurveyTick: number;
}

// --- Trust System ---
export interface TrustRecord {
  targetFamilyId: FamilyTreeId;
  trustScore: number; // -1 to 1
  betrayalCount: number;
  cooperationCount: number;
  lastInteractionTick: number;
  intelSharedCount: number;
  intelAccuracyScore: number; // 0-1
}

// --- Heartland System ---
export interface HeartlandProfile {
  familyTreeId: FamilyTreeId;
  concentrationRegions: Map<RegionId, number>;
  heartlandRegionId: RegionId | null;
  heartlandStrength: number; // 0-1
  exposureLevel: number; // 0-1
  discoveredBy: FamilyTreeId[];
}

// --- Espionage System ---
export type EspionageActionType = 'spy' | 'infiltrate' | 'spread_rumors' | 'counter_spy' | 'share_intel' | 'plant_misinformation';

export interface EspionageMission {
  id: string;
  type: EspionageActionType;
  agentCharacterId: CharacterId;
  supportCharacterIds: CharacterId[];  // Pack members sharing risk
  targetRegionId: RegionId;
  targetFamilyId: FamilyTreeId | null;
  startTick: number;
  durationTicks: number;
  detected: boolean;
  detectedByCharacterId: CharacterId | null;
  casualtyCharacterIds: CharacterId[];  // Pack members caught during mission
  completed: boolean;
  result: EspionageResult | null;
}

export interface EspionageResult {
  success: boolean;
  intelGained: RegionIntel | null;
  narrative: string;
  consequences: EspionageConsequence[];
}

export interface DetectionReport {
  detected: boolean;
  identificationLevel: 'none' | 'size_class' | 'taxonomy_class' | 'species' | 'family';
  description: string;  // Narrative: "Massive creature detected" vs "Bear from northern family"
}

export type EspionageConsequence =
  | { type: 'trust_change'; familyId: FamilyTreeId; targetFamilyId: FamilyTreeId; delta: number }
  | { type: 'relationship_change'; characterId: CharacterId; targetId: CharacterId; delta: number }
  | { type: 'heartland_exposed'; familyId: FamilyTreeId; discovererFamilyId: FamilyTreeId }
  | { type: 'misinformation_planted'; targetFamilyId: FamilyTreeId; regionId: RegionId }
  | { type: 'detected'; spyCharacterId: CharacterId; detectorCharacterId: CharacterId }
  | { type: 'fame_change'; characterId: CharacterId; delta: number };

// --- Betrayal System ---
export type BetrayalType = 'intel_leak' | 'heartland_reveal' | 'alliance_backstab' | 'false_intel' | 'resource_theft';

export interface BetrayalEvent {
  id: string;
  betrayerFamilyId: FamilyTreeId;
  betrayerCharacterId: CharacterId;
  victimFamilyId: FamilyTreeId;
  beneficiaryFamilyId: FamilyTreeId | null;
  type: BetrayalType;
  tick: number;
  intelShared: RegionIntel | null;
  rewardGained: number;
  witnessFamilyIds: FamilyTreeId[];
}

// --- Colony / Swarm Mode (Eusocial Species) ---

export type ColonyTier = 1 | 2 | 3 | 4 | 5;

export type DirectiveSector =
  | 'expansion' | 'defense' | 'foraging'
  | 'reproduction' | 'construction' | 'diplomacy';

export interface DirectiveWheel {
  sectors: DirectiveSector[];
  active: [DirectiveSector, DirectiveSector];
  weights: Record<DirectiveSector, number>;  // 0-1 priority per sector
}

export type StandoutOrigin = 'statistical' | 'event' | 'player_spotlight';

export interface ColonyHealthBars {
  vitality: number;        // 0-1 overall colony health (queen health, worker count)
  cohesion: number;        // 0-1 social unity (loyalty, morale)
  provisions: number;      // 0-1 food/resource stores
  geneticDiversity: number; // 0-1 gene pool health
}

export interface Colony {
  id: ColonyId;
  speciesId: SpeciesId;
  regionId: RegionId;
  familyTreeId: FamilyTreeId;
  ownerId: OwnerId | null;

  name: string;
  tier: ColonyTier;
  health: ColonyHealthBars;
  directives: DirectiveWheel;

  queenId: CharacterId | null;
  standoutIds: CharacterId[];
  workerCount: number;
  soldierCount: number;

  foundedAtTick: number;
  isAlive: boolean;
  diedAtTick: number | null;
  causeOfDeath: string | null;

  populationGenome: PopulationGenome | null;
  successionCrisis: boolean;
}
