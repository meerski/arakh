/**
 * Demo: Information Warfare, Fog-of-War, Trust & Betrayal
 *
 * Runs offline (no server needed) — exercises all Feature Batch 3 systems
 * directly and prints a narrative of what happens.
 *
 * Usage:  npx tsx scripts/demo-intel-warfare.ts
 */

import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import { characterRegistry } from '../src/species/registry.js';
import { intelligenceRegistry } from '../src/game/intelligence.js';
import { trustLedger } from '../src/game/trust.js';
import { heartlandTracker } from '../src/game/heartland.js';
import { espionageRegistry } from '../src/game/espionage.js';
import { betrayalRegistry } from '../src/game/betrayal.js';
import { compartmentalizeIntel, evaluateIntelTrade } from '../src/game/intel-sharing.js';
import { allianceRegistry } from '../src/game/alliance.js';
import { createRegion } from '../src/simulation/world.js';
import type { Region } from '../src/types.js';

// ─── helpers ───────────────────────────────────────────────────────
function reg(name: string) {
  const existing = speciesRegistry.getByName(name);
  if (existing) return existing.id;
  return speciesRegistry.register({
    commonName: name,
    scientificName: `Demo ${name.toLowerCase()}`,
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'DemoFam', genus: 'DemoGen', species: name.slice(0, 3) },
    tier: 'flagship',
    traitOverrides: { size: 50, lifespan: 5000, habitat: ['surface'], diet: 'omnivore', intelligence: 60, socialStructure: 'pack' },
  }).id;
}

function mkChar(speciesId: string, regionId: string, familyTreeId: string, tick = 100) {
  const c = createCharacter({ speciesId, regionId, familyTreeId, tick });
  characterRegistry.add(c);
  return c;
}

function makeRegion(name: string, biome: string): Region {
  const r = createRegion({ name, layer: 'surface', biome, latitude: 40, longitude: -80, elevation: 100, connections: [] });
  r.resources = [
    { type: 'grass', quantity: 50, renewRate: 1, maxQuantity: 100, properties: new Map() },
    { type: 'water', quantity: 80, renewRate: 2, maxQuantity: 100, properties: new Map() },
    { type: 'berries', quantity: 30, renewRate: 1, maxQuantity: 60, properties: new Map() },
  ];
  r.populations = [];
  return r;
}

function section(title: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function log(msg: string) { console.log(`  ${msg}`); }

// ─── main demo ─────────────────────────────────────────────────────
function main() {
  const wolfId = reg('DemoWolf');
  const foxId = reg('DemoFox');
  const rabbitId = reg('DemoRabbit');

  const forest = makeRegion('Dark Forest', 'forest');
  const plains = makeRegion('Open Plains', 'grassland');
  const mountain = makeRegion('Iron Mountains', 'mountain');

  // ── Scene 1: Fog-of-War Intelligence ─────────────────────────────
  section('ACT 1 — FOG OF WAR: Intelligence Maps');

  const wolfAlpha = mkChar(wolfId, forest.id, 'wolf-pack', 100);
  const wolfScout = mkChar(wolfId, plains.id, 'wolf-pack', 100);
  const foxLeader = mkChar(foxId, plains.id, 'fox-den', 100);

  log(`Wolf alpha (${wolfAlpha.id.slice(0, 8)}) lives in ${forest.name}`);
  log(`Wolf scout (${wolfScout.id.slice(0, 8)}) explores ${plains.name}`);
  log(`Fox leader (${foxLeader.id.slice(0, 8)}) lives in ${plains.name}`);

  // Wolf scout explores the plains
  intelligenceRegistry.recordExploration(wolfScout.id, plains.id, plains, 100);
  const wolfIntel = intelligenceRegistry.getRegionIntel('wolf-pack', plains.id);
  log(`\nWolf pack discovers ${plains.name}:`);
  log(`  Resources: ${wolfIntel!.knownResources.join(', ')}`);
  log(`  Reliability: ${wolfIntel!.reliability} (first-hand exploration)`);
  log(`  Source: ${wolfIntel!.source}`);

  // Fox explores forest
  intelligenceRegistry.recordExploration(foxLeader.id, forest.id, forest, 105);

  // Wolves share intel about plains with foxes
  const shared = intelligenceRegistry.shareIntel('wolf-pack', 'fox-den', plains.id, 110);
  log(`\nWolves share plains intel with foxes:`);
  log(`  Reliability after sharing: ${shared!.reliability} (degraded to 0.8x)`);
  log(`  Source: ${shared!.source}`);

  // Intel decay over time
  const wolfMap = intelligenceRegistry.getOrCreate('wolf-pack');
  intelligenceRegistry.decayIntelReliability(wolfMap, 600);
  const decayed = intelligenceRegistry.getRegionIntel('wolf-pack', plains.id);
  log(`\nAfter 500 ticks, wolf intel reliability: ${decayed!.reliability.toFixed(3)} (decayed)`);

  // ── Scene 2: Trust System ────────────────────────────────────────
  section('ACT 2 — TRUST: Cooperation & Suspicion');

  log('Wolves and foxes begin cooperating...');
  for (let i = 0; i < 20; i++) {
    trustLedger.recordCooperation('wolf-pack', 'fox-den', 100 + i);
  }
  const trustAfterCoop = trustLedger.getTrust('wolf-pack', 'fox-den');
  log(`Trust after 20 cooperative encounters: ${trustAfterCoop.toFixed(2)}`);

  const record = trustLedger.getTrustRecord('wolf-pack', 'fox-den');
  log(`  Cooperation count: ${record!.cooperationCount}`);
  log(`  Betrayal count: ${record!.betrayalCount}`);

  // Check willingness to share intel
  const willingness = trustLedger.evaluateIntelSharingWillingness('wolf-pack', 'fox-den', 0.5);
  log(`\nWilling to share intel? ${willingness.willing ? 'YES' : 'NO'}`);
  log(`  Risk assessment: ${willingness.riskAssessment}`);

  // Trust decay
  trustLedger.tickTrustDecay(300);
  const trustAfterDecay = trustLedger.getTrust('wolf-pack', 'fox-den');
  log(`\nTrust after time decay: ${trustAfterDecay.toFixed(3)} (slowly fading)`);

  // ── Scene 3: Heartland ───────────────────────────────────────────
  section('ACT 3 — HEARTLAND: Territorial Concentration');

  // Create a concentrated rabbit population in the forest
  for (let i = 0; i < 12; i++) mkChar(rabbitId, forest.id, 'rabbit-warren', 100);
  for (let i = 0; i < 3; i++) mkChar(rabbitId, plains.id, 'rabbit-warren', 100);

  heartlandTracker.recalculateAll(200);
  const rabbitProfile = heartlandTracker.getProfile('rabbit-warren');

  log(`Rabbit warren: 12 in forest, 3 in plains`);
  log(`  Heartland region: ${rabbitProfile!.heartlandRegionId === forest.id ? forest.name : 'none'}`);
  log(`  Heartland strength: ${rabbitProfile!.heartlandStrength.toFixed(2)}`);
  log(`  Defense bonus: +${(heartlandTracker.getHeartlandDefenseBonus('rabbit-warren', forest.id) * 100).toFixed(0)}%`);
  log(`  Foraging bonus: +${(heartlandTracker.getHeartlandForagingBonus('rabbit-warren', forest.id) * 100).toFixed(0)}%`);

  // Wolves discover rabbit heartland
  heartlandTracker.recordHeartlandDiscovery('wolf-pack', 'rabbit-warren');
  const huntBonus = heartlandTracker.getHeartlandHuntBonus('wolf-pack', forest.id);
  log(`\nWolves discover rabbit heartland!`);
  log(`  Hunt bonus in forest: +${(huntBonus * 100).toFixed(0)}% (devastating knowledge)`);
  log(`  Rabbit exposure level: ${heartlandTracker.getExposureLevel('rabbit-warren')}`);

  // ── Scene 4: Espionage ───────────────────────────────────────────
  section('ACT 4 — ESPIONAGE: Shadows Between Territories');

  const foxSpy = mkChar(foxId, plains.id, 'fox-den', 200);
  foxSpy.role = 'spy';
  log(`Fox spy (${foxSpy.id.slice(0, 8)}) departs on mission to ${forest.name}...`);

  const mission = espionageRegistry.startMission({
    type: 'spy',
    agentCharacterId: foxSpy.id,
    targetRegionId: forest.id,
    tick: 200,
  });
  log(`  Mission type: ${mission.type}`);
  log(`  Duration: ${mission.durationTicks} ticks`);
  log(`  Status: ${mission.completed ? 'complete' : 'in progress'}`);

  // Create a sentinel in the forest
  const wolfSentinel = mkChar(wolfId, forest.id, 'wolf-pack', 200);
  wolfSentinel.role = 'sentinel';
  log(`\nWolf sentinel (${wolfSentinel.id.slice(0, 8)}) patrols ${forest.name}`);

  const detectionChance = espionageRegistry.calculateDetectionChance(foxSpy, forest.id, [wolfSentinel]);
  const detectionWithout = espionageRegistry.calculateDetectionChance(foxSpy, forest.id, []);
  log(`  Detection chance without sentinel: ${(detectionWithout * 100).toFixed(1)}%`);
  log(`  Detection chance with sentinel: ${(detectionChance * 100).toFixed(1)}%`);

  // Tick the mission forward
  log(`\nTicking mission...`);
  let detected = false;
  for (let t = 201; t <= 205; t++) {
    const results = espionageRegistry.tickMissions(t);
    if (results.length > 0) {
      for (const r of results) {
        if (r.success) {
          log(`  Tick ${t}: Mission SUCCESS — intel gathered!`);
        } else {
          log(`  Tick ${t}: Mission FAILED — ${r.narrative}`);
          detected = true;
        }
      }
    }
  }

  if (!detected && espionageRegistry.getActiveMissions().length === 0) {
    const foxForestIntel = intelligenceRegistry.getRegionIntel('fox-den', forest.id);
    if (foxForestIntel) {
      log(`  Fox den gained intel on ${forest.name} (reliability: ${foxForestIntel.reliability})`);
    }
  }

  // ── Scene 5: Infiltration to discover heartland ──────────────────
  section('ACT 5 — INFILTRATION: Deep Cover Mission');

  const foxInfiltrator = mkChar(foxId, plains.id, 'fox-den', 300);
  log(`Fox infiltrator attempts deep cover in rabbit territory...`);

  espionageRegistry.startMission({
    type: 'infiltrate',
    agentCharacterId: foxInfiltrator.id,
    targetRegionId: forest.id,
    tick: 300,
  });
  log(`  Duration: 15 ticks (long, dangerous mission)`);

  for (let t = 301; t <= 315; t++) {
    espionageRegistry.tickMissions(t);
  }

  const knowsHeartland = heartlandTracker.knowsHeartland('fox-den', 'rabbit-warren');
  log(`  Foxes now know rabbit heartland? ${knowsHeartland ? 'YES — devastating intelligence!' : 'NO — mission was detected'}`);

  // ── Scene 6: Betrayal ────────────────────────────────────────────
  section('ACT 6 — BETRAYAL: The Fox Turns');

  // Foxes betray the wolf-fox trust by leaking wolf intel to rabbits
  log('Foxes decide to leak wolf positions to the rabbits...');

  const betrayalEcon = betrayalRegistry.calculateBetrayalEconomics(foxLeader, 'wolf-pack', 'intel_leak');
  log(`  Potential gain: ${betrayalEcon.potentialGain.toFixed(2)}`);
  log(`  Potential loss: ${betrayalEcon.potentialLoss.toFixed(2)}`);
  log(`  Net value: ${betrayalEcon.netValue.toFixed(2)}`);

  // Some wolves witness the betrayal
  const witnesses = ['rabbit-warren']; // rabbits see the foxes sharing wolf info
  const event = betrayalRegistry.commitBetrayal({
    betrayerFamilyId: 'fox-den',
    betrayerCharacterId: foxLeader.id,
    victimFamilyId: 'wolf-pack',
    type: 'intel_leak',
    tick: 400,
    regionId: plains.id,
  });

  log(`\nBetrayal committed: ${event.type}`);
  log(`  Wolf trust in foxes now: ${trustLedger.getTrust('wolf-pack', 'fox-den').toFixed(2)} (was positive!)`);
  log(`  Fox betrayal reputation: ${betrayalRegistry.getBetrayalReputation('fox-den').toFixed(2)}`);

  const betrayals = betrayalRegistry.getBetrayalsByFamily('fox-den');
  log(`  Total fox betrayals on record: ${betrayals.length}`);

  // ── Scene 7: Intel Compartmentalization ──────────────────────────
  section('ACT 7 — COMPARTMENTALIZATION: Smart Intel Sharing');

  const fullIntel = intelligenceRegistry.getRegionIntel('wolf-pack', plains.id);
  if (fullIntel) {
    const lowIQ = compartmentalizeIntel(fullIntel, 25);
    const midIQ = compartmentalizeIntel(fullIntel, 55);
    const highIQ = compartmentalizeIntel(fullIntel, 85);

    log('Sharing plains intel at different intelligence levels:');
    log(`  Low IQ (25):  Resources: ${lowIQ.knownResources.length}, Source visible: ${lowIQ.sourceCharacterId ? 'yes' : 'no'}`);
    log(`  Mid IQ (55):  Resources: ${midIQ.knownResources.length}, Source visible: ${midIQ.sourceCharacterId ? 'yes' : 'no'}`);
    log(`  High IQ (85): Resources: ${highIQ.knownResources.length}, Source visible: ${highIQ.sourceCharacterId ? 'yes' : 'no'}`);
  }

  // ── Scene 8: Misinformation ──────────────────────────────────────
  section('ACT 8 — MISINFORMATION: Planting False Intel');

  intelligenceRegistry.plantMisinformation('rabbit-warren', mountain.id, {
    lastUpdatedTick: 400,
    knownThreats: ['massive_predator', 'avalanche'],
    knownPopEstimate: 9999,
  });

  const falseIntel = intelligenceRegistry.getRegionIntel('rabbit-warren', mountain.id);
  log(`Foxes plant false intel in rabbit maps about ${mountain.name}:`);
  log(`  Threats: ${falseIntel!.knownThreats.join(', ')}`);
  log(`  Population estimate: ${falseIntel!.knownPopEstimate} (wildly inflated)`);
  log(`  Is misinformation: ${falseIntel!.isMisinformation}`);
  log(`  Source: ${falseIntel!.source}`);
  log(`  Rabbits will avoid the mountains — exactly as planned.`);

  // ── Scene 9: Alliance backstab ───────────────────────────────────
  section('ACT 9 — ALLIANCE BACKSTAB: The Ultimate Betrayal');

  allianceRegistry.add({
    id: 'wolf-fox-pact',
    name: 'Wolf-Fox Hunting Pact',
    memberSpecies: [wolfId, foxId],
    sharedRegionIds: [forest.id, plains.id],
    formedAtTick: 50,
    trigger: 'diplomatic',
    strength: 0.8,
  });

  log(`Alliance "Wolf-Fox Hunting Pact" exists (strength 0.8)`);
  log(`Fox leader fame before backstab: ${foxLeader.fame}`);

  betrayalRegistry.commitBetrayal({
    betrayerFamilyId: 'fox-den',
    betrayerCharacterId: foxLeader.id,
    victimFamilyId: 'wolf-pack',
    type: 'alliance_backstab',
    tick: 500,
  });

  log(`\nFox backstabs the alliance!`);
  log(`  Alliances remaining: ${allianceRegistry.getAll().length}`);
  log(`  Fox leader fame after backstab: ${foxLeader.fame}`);
  log(`  Fox betrayal reputation: ${betrayalRegistry.getBetrayalReputation('fox-den').toFixed(2)}`);
  log(`  Wolf trust in foxes: ${trustLedger.getTrust('wolf-pack', 'fox-den').toFixed(2)}`);

  // ── Summary ──────────────────────────────────────────────────────
  section('SUMMARY');
  log(`Total intel maps: ${['wolf-pack', 'fox-den', 'rabbit-warren'].filter(f => intelligenceRegistry.getOrCreate(f).knownRegions.size > 0).length} families with intel`);
  log(`Trust relationships: wolf↔fox = ${trustLedger.getTrust('wolf-pack', 'fox-den').toFixed(2)} (destroyed)`);
  log(`Heartlands known: wolves know rabbit heartland = ${heartlandTracker.knowsHeartland('wolf-pack', 'rabbit-warren')}`);
  log(`Active spy missions: ${espionageRegistry.getActiveMissions().length}`);
  log(`Fox betrayal count: ${betrayalRegistry.getBetrayalsByFamily('fox-den').length}`);
  log(`Fox reputation: ${betrayalRegistry.getBetrayalReputation('fox-den').toFixed(2)} (known betrayer)`);
  log('');
  log('Information is the true currency of survival.');
}

main();
