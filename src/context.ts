// ============================================================
// WorldContext — Dependency Injection Container
// ============================================================
// Replaces module-level singletons with a single context object.
// During migration, the bridge pattern ensures both ctx.foo and
// imported singletons reference the same instances.

import { CharacterRegistry } from './species/registry.js';
import { SpeciesRegistry } from './species/species.js';
import { TaxonomyEngine } from './species/taxonomy.js';
import { GameRNG } from './simulation/random.js';
import { CorpseRegistry } from './simulation/corpses.js';
import { ArtifactRegistry, RadiationTracker, AnomalyTracker } from './simulation/artifacts.js';
import { CatastropheEngine } from './simulation/catastrophes.js';
import { RegionProfileRegistry } from './simulation/region-dynamics.js';
import { PerformanceMonitor } from './simulation/performance.js';
import { FameTracker, StandingMap, DebtLedger, AchievementTierTracker } from './game/fame.js';
import { BirthQueue } from './game/respawn.js';
import { SocialGraph } from './game/social.js';
import { LineageManager } from './game/lineage.js';
import { PlayerManager } from './game/player.js';
import { RoleRegistry } from './game/roles.js';
import { DirectiveQueue } from './game/directives.js';
import { CosmeticCatalog, CosmeticInventory } from './game/cosmetics.js';
import { EncounterRegistry } from './game/encounters.js';
import { AllianceRegistry } from './game/alliance.js';
import { BetrayalRegistry } from './game/betrayal.js';
import { PactRegistry } from './game/diplomacy.js';
import { DomesticationRegistry } from './game/domestication.js';
import { EspionageRegistry } from './game/espionage.js';
import { IntelligenceRegistry } from './game/intelligence.js';
import { HeartlandTracker } from './game/heartland.js';
import { TrustLedger } from './game/trust.js';
import { ResourcePropertyRegistry } from './game/resources.js';
import { AdvancementRegistry } from './game/advancement-registry.js';
import { CardCollection } from './cards/collection.js';
import { NewsBroadcast } from './broadcast/news.js';
import { Gamemaster } from './broadcast/gamemaster.js';
import { LiveFeed } from './dashboard/feed.js';
import { WorldChronicle } from './narrative/history.js';
import { SentinelAgent } from './security/sentinel.js';
import { WorldDriftEngine } from './security/world-drift.js';
import { AntiGamingSystem } from './security/anti-gaming.js';
import { RateLimiter } from './security/rate-limit.js';
import { WorldSerializer } from './data/backup.js';
import { ActionQueue } from './game/action-queue.js';
import { PersistenceLayer } from './data/persistence.js';
import { TierManager } from './species/tier-manager.js';
import { MainCharacterManager } from './game/main-character.js';
import { AuditLog } from './data/audit-log.js';
import { ColonyRegistry } from './species/colony.js';
import { WriteAheadLog } from './data/wal.js';

// --- WorldContext Interface ---

export interface WorldContext {
  // Core
  rng: GameRNG;
  taxonomy: TaxonomyEngine;

  // Registries
  characters: CharacterRegistry;
  species: SpeciesRegistry;
  tierManager: TierManager;
  mainCharacters: MainCharacterManager;
  colonies: ColonyRegistry;

  // Simulation
  corpses: CorpseRegistry;
  artifacts: ArtifactRegistry;
  radiation: RadiationTracker;
  anomalies: AnomalyTracker;
  catastrophes: CatastropheEngine;
  regionProfiles: RegionProfileRegistry;
  performance: PerformanceMonitor;

  // Game Systems
  fame: FameTracker;
  achievementTiers: AchievementTierTracker;
  standings: StandingMap;
  debt: DebtLedger;
  social: SocialGraph;
  lineage: LineageManager;
  players: PlayerManager;
  roles: RoleRegistry;
  directives: DirectiveQueue;
  cosmeticCatalog: CosmeticCatalog;
  cosmeticInventory: CosmeticInventory;
  encounters: EncounterRegistry;
  alliances: AllianceRegistry;
  betrayals: BetrayalRegistry;
  pacts: PactRegistry;
  domestication: DomesticationRegistry;
  espionage: EspionageRegistry;
  intelligence: IntelligenceRegistry;
  heartland: HeartlandTracker;
  trust: TrustLedger;
  resources: ResourcePropertyRegistry;
  advancements: AdvancementRegistry;
  cards: CardCollection;
  birthQueue: BirthQueue;

  // Broadcast & Narrative
  news: NewsBroadcast;
  gamemasters: Gamemaster[];
  feed: LiveFeed;
  chronicle: WorldChronicle;

  // Security
  sentinel: SentinelAgent;
  drift: WorldDriftEngine;
  antiGaming: AntiGamingSystem;
  rateLimiter: RateLimiter;

  // Action Processing
  actionQueue: ActionQueue;

  // Data
  serializer: WorldSerializer;
  persistence: PersistenceLayer;
  auditLog: AuditLog;
  wal: WriteAheadLog;
}

// --- Factory ---

/** Create a fresh WorldContext with independent instances (no shared state). */
export function createWorldContext(): WorldContext {
  return {
    // Core
    rng: new GameRNG(),
    taxonomy: new TaxonomyEngine(),

    // Registries
    characters: new CharacterRegistry(),
    species: new SpeciesRegistry(),
    tierManager: new TierManager(),
    mainCharacters: new MainCharacterManager(),
    colonies: new ColonyRegistry(),

    // Simulation
    corpses: new CorpseRegistry(),
    artifacts: new ArtifactRegistry(),
    radiation: new RadiationTracker(),
    anomalies: new AnomalyTracker(),
    catastrophes: new CatastropheEngine(),
    regionProfiles: new RegionProfileRegistry(),
    performance: new PerformanceMonitor(),

    // Game Systems
    fame: new FameTracker(),
    achievementTiers: new AchievementTierTracker(),
    standings: new StandingMap(),
    debt: new DebtLedger(),
    social: new SocialGraph(),
    lineage: new LineageManager(),
    players: new PlayerManager(),
    roles: new RoleRegistry(),
    directives: new DirectiveQueue(),
    cosmeticCatalog: new CosmeticCatalog(),
    cosmeticInventory: new CosmeticInventory(),
    encounters: new EncounterRegistry(),
    alliances: new AllianceRegistry(),
    betrayals: new BetrayalRegistry(),
    pacts: new PactRegistry(),
    domestication: new DomesticationRegistry(),
    espionage: new EspionageRegistry(),
    intelligence: new IntelligenceRegistry(),
    heartland: new HeartlandTracker(),
    trust: new TrustLedger(),
    resources: new ResourcePropertyRegistry(),
    advancements: new AdvancementRegistry(),
    cards: new CardCollection(),
    birthQueue: new BirthQueue(),

    // Broadcast & Narrative
    news: new NewsBroadcast(),
    gamemasters: [new Gamemaster('Chronos'), new Gamemaster('Gaia')],
    feed: new LiveFeed(),
    chronicle: new WorldChronicle(),

    // Security
    sentinel: new SentinelAgent(),
    drift: new WorldDriftEngine(),
    antiGaming: new AntiGamingSystem(),
    rateLimiter: new RateLimiter(),

    // Action Processing
    actionQueue: new ActionQueue(),

    // Data
    serializer: new WorldSerializer(),
    persistence: new PersistenceLayer(),
    auditLog: new AuditLog(),
    wal: new WriteAheadLog(),
  };
}

// --- Bridge: Install ctx instances into module-level singletons ---

import { _installCharacterRegistry } from './species/registry.js';
import { _installSpeciesRegistry } from './species/species.js';
import { _installTierManager } from './species/tier-manager.js';
import { _installMainCharacterManager } from './game/main-character.js';
import { _installTaxonomyEngine } from './species/taxonomy.js';
import { _installWorldRNG } from './simulation/random.js';
import { _installCorpseRegistry } from './simulation/corpses.js';
import { _installArtifactRegistry, _installRadiationTracker, _installAnomalyTracker } from './simulation/artifacts.js';
import { _installCatastropheEngine } from './simulation/catastrophes.js';
import { _installRegionProfileRegistry } from './simulation/region-dynamics.js';
import { _installPerformanceMonitor } from './simulation/performance.js';
import { _installFameTracker, _installSpeciesStandings, _installDebtLedger, _installAchievementTiers } from './game/fame.js';
import { _installBirthQueue } from './game/respawn.js';
import { _installSocialGraph } from './game/social.js';
import { _installLineageManager } from './game/lineage.js';
import { _installPlayerManager } from './game/player.js';
import { _installRoleRegistry } from './game/roles.js';
import { _installDirectiveQueue } from './game/directives.js';
import { _installCosmeticCatalog, _installCosmeticInventory } from './game/cosmetics.js';
import { _installEncounterRegistry } from './game/encounters.js';
import { _installAllianceRegistry } from './game/alliance.js';
import { _installBetrayalRegistry } from './game/betrayal.js';
import { _installPactRegistry } from './game/diplomacy.js';
import { _installDomesticationRegistry } from './game/domestication.js';
import { _installEspionageRegistry } from './game/espionage.js';
import { _installIntelligenceRegistry } from './game/intelligence.js';
import { _installHeartlandTracker } from './game/heartland.js';
import { _installTrustLedger } from './game/trust.js';
import { _installResourceProperties } from './game/resources.js';
import { _installAdvancementRegistry } from './game/advancement-registry.js';
import { _installCardCollection } from './cards/collection.js';
import { _installNewsBroadcast } from './broadcast/news.js';
import { _installGamemasters } from './broadcast/gamemaster.js';
import { _installLiveFeed } from './dashboard/feed.js';
import { _installWorldChronicle } from './narrative/history.js';
import { _installSentinelAgent } from './security/sentinel.js';
import { _installWorldDrift } from './security/world-drift.js';
import { _installAntiGaming } from './security/anti-gaming.js';
import { _installRateLimiter } from './security/rate-limit.js';
import { _installWorldSerializer } from './data/backup.js';
import { _installPersistenceLayer } from './data/persistence.js';
import { _installAuditLog } from './data/audit-log.js';
import { _installWAL } from './data/wal.js';
import { _installColonyRegistry } from './species/colony.js';
import { _installActionQueue } from './game/action-queue.js';

/**
 * Install all WorldContext instances into their module-level singletons.
 * This is the bridge: existing code using `import { characterRegistry }` will
 * get the same instance as `ctx.characters` after this call.
 */
export function installWorldContext(ctx: WorldContext): void {
  // Core
  _installWorldRNG(ctx.rng);
  _installTaxonomyEngine(ctx.taxonomy);

  // Registries
  _installCharacterRegistry(ctx.characters);
  _installSpeciesRegistry(ctx.species);
  _installTierManager(ctx.tierManager);
  _installMainCharacterManager(ctx.mainCharacters);
  _installColonyRegistry(ctx.colonies);

  // Simulation
  _installCorpseRegistry(ctx.corpses);
  _installArtifactRegistry(ctx.artifacts);
  _installRadiationTracker(ctx.radiation);
  _installAnomalyTracker(ctx.anomalies);
  _installCatastropheEngine(ctx.catastrophes);
  _installRegionProfileRegistry(ctx.regionProfiles);
  _installPerformanceMonitor(ctx.performance);

  // Game Systems
  _installFameTracker(ctx.fame);
  _installAchievementTiers(ctx.achievementTiers);
  _installSpeciesStandings(ctx.standings);
  _installDebtLedger(ctx.debt);
  _installSocialGraph(ctx.social);
  _installLineageManager(ctx.lineage);
  _installPlayerManager(ctx.players);
  _installRoleRegistry(ctx.roles);
  _installDirectiveQueue(ctx.directives);
  _installCosmeticCatalog(ctx.cosmeticCatalog);
  _installCosmeticInventory(ctx.cosmeticInventory);
  _installEncounterRegistry(ctx.encounters);
  _installAllianceRegistry(ctx.alliances);
  _installBetrayalRegistry(ctx.betrayals);
  _installPactRegistry(ctx.pacts);
  _installDomesticationRegistry(ctx.domestication);
  _installEspionageRegistry(ctx.espionage);
  _installIntelligenceRegistry(ctx.intelligence);
  _installHeartlandTracker(ctx.heartland);
  _installTrustLedger(ctx.trust);
  _installResourceProperties(ctx.resources);
  _installAdvancementRegistry(ctx.advancements);
  _installCardCollection(ctx.cards);
  _installBirthQueue(ctx.birthQueue);

  // Broadcast & Narrative
  _installNewsBroadcast(ctx.news);
  _installGamemasters(ctx.gamemasters);
  _installLiveFeed(ctx.feed);
  _installWorldChronicle(ctx.chronicle);

  // Security
  _installSentinelAgent(ctx.sentinel);
  _installWorldDrift(ctx.drift);
  _installAntiGaming(ctx.antiGaming);
  _installRateLimiter(ctx.rateLimiter);

  // Action Processing
  _installActionQueue(ctx.actionQueue);

  // Data
  _installWorldSerializer(ctx.serializer);
  _installPersistenceLayer(ctx.persistence);
  _installAuditLog(ctx.auditLog);
  _installWAL(ctx.wal);
}
