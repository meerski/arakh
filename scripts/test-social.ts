// scripts/test-social.ts — Biological Realism Verification
//
// Run with: npx tsx scripts/test-social.ts
//
// Verifies six biological realism scenarios against the live simulation
// systems. Any FAILED line means a real biological rule is not enforced
// by the current engine — it is a gap that the Biologist must close.

import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import { createCharacter } from '../src/species/character.js';
import { canBreed } from '../src/species/genetics.js';
import { createRegion } from '../src/simulation/world.js';
import {
  createEcosystemState,
  addFoodWebRelation,
} from '../src/simulation/ecosystem.js';
import {
  buildActionContext,
  processAction,
} from '../src/game/actions.js';
import { taxonomyEngine } from '../src/species/taxonomy.js';
import type {
  SpeciesId,
  RegionId,
  FamilyTreeId,
  CharacterId,
  AgentAction,
} from '../src/types.js';

// ============================================================
// Helpers
// ============================================================

let totalFailed = 0;

function verify(name: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    console.log(`  ✗ ${name} — FAILED`);
    totalFailed++;
    process.exitCode = 1;
  }
}

/** Register a minimal taxonomy path so speciesRegistry.register() can
 *  resolve traits without calling seedTaxonomy().
 *  Guards against double-registration with a get() check first.
 */
function ensureTaxonomyNodes(
  cls: string,
  order: string,
  family: string,
  genus: string,
  sp: string,
): void {
  const nodes: Array<{
    rank: 'class' | 'order' | 'family' | 'genus' | 'species';
    name: string;
    parentName: string | null;
  }> = [
    { rank: 'class',   name: cls,    parentName: null   },
    { rank: 'order',   name: order,  parentName: cls    },
    { rank: 'family',  name: family, parentName: order  },
    { rank: 'genus',   name: genus,  parentName: family },
    { rank: 'species', name: sp,     parentName: genus  },
  ];
  for (const node of nodes) {
    if (!taxonomyEngine.get(node.rank, node.name)) {
      taxonomyEngine.register({
        rank: node.rank,
        name: node.name,
        parentName: node.parentName,
        traits: {},
      });
    }
  }
}

function makeRegion(name: string, layer: 'surface' | 'underwater' | 'underground') {
  return createRegion({
    name,
    layer,
    biome: layer === 'underwater' ? 'open_ocean' : 'grassland',
    latitude: 0,
    longitude: 0,
    elevation: layer === 'underwater' ? -200 : 100,
  });
}

/** Construct a minimal AgentAction (timestamp is required by the type). */
function action(type: AgentAction['type'], params: Record<string, unknown> = {}): AgentAction {
  return { type, params, timestamp: Date.now() };
}

// Tick set high enough that all species with maturityTicks <= 100 are mature
const TICK = 50_000;

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log('\n=== Biological Realism Verification ===\n');

  // Always start with a clean registry so tests are independent
  characterRegistry.clear();

  // Initialise the ecosystem state used by food-web tests
  const ecosystem = createEcosystemState();

  // ============================================================
  // 1. Water / Land Separation
  // ============================================================
  console.log('1. Water/Land Separation');

  ensureTaxonomyNodes('Chondrichthyes', 'Lamniformes', 'Lamnidae', 'Carcharodon', 'carcharias');
  ensureTaxonomyNodes('Insecta', 'Coleoptera', 'Coccinellidae', 'Coccinella', 'septempunctata');

  const sharkSpecies = speciesRegistry.register({
    commonName: 'Great White Shark',
    scientificName: 'Carcharodon carcharias',
    taxonomy: {
      class: 'Chondrichthyes', order: 'Lamniformes', family: 'Lamnidae',
      genus: 'Carcharodon', species: 'carcharias',
    },
    tier: 'flagship',
    traitOverrides: {
      habitat: ['underwater'],
      aquatic: true,
      diet: 'carnivore',
      size: 70,
      strength: 75,
      maturityTicks: 100,
    },
  });

  const ladybugSpecies = speciesRegistry.register({
    commonName: 'Ladybug',
    scientificName: 'Coccinella septempunctata',
    taxonomy: {
      class: 'Insecta', order: 'Coleoptera', family: 'Coccinellidae',
      genus: 'Coccinella', species: 'septempunctata',
    },
    tier: 'notable',
    traitOverrides: {
      habitat: ['surface'],
      aquatic: false,
      diet: 'herbivore',
      size: 1,
      strength: 1,
      maturityTicks: 10,
    },
  });

  // Place both in the SAME region (maximises potential visibility)
  const sharedRegion = makeRegion('Shared Test Region', 'surface');
  const sharedRegionMap = new Map([[sharedRegion.id as RegionId, sharedRegion]]);

  const shark = createCharacter({
    speciesId: sharkSpecies.id as SpeciesId,
    regionId: sharedRegion.id as RegionId,
    familyTreeId: 'tree-shark-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(shark);

  const ladybug = createCharacter({
    speciesId: ladybugSpecies.id as SpeciesId,
    regionId: sharedRegion.id as RegionId,
    familyTreeId: 'tree-ladybug-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(ladybug);

  const sharkCtx = buildActionContext(
    shark.id as CharacterId, sharedRegionMap, TICK, 'day', 'summer', 'clear',
  );
  const ladybugCtx = buildActionContext(
    ladybug.id as CharacterId, sharedRegionMap, TICK, 'day', 'summer', 'clear',
  );

  // NOTE: The current engine does NOT filter nearbyCharacters by habitat layer —
  // a shark and ladybug in the same region CAN see each other today.
  // These tests assert the EXPECTED biological behaviour.
  // A FAILED result means the habitat-layer filter is not yet implemented.
  const sharkSeesLadybug = sharkCtx?.nearbyCharacters.some(c => c.id === ladybug.id) ?? false;
  const ladybugSeesShark = ladybugCtx?.nearbyCharacters.some(c => c.id === shark.id) ?? false;

  verify('Shark does NOT see ladybug in nearbyCharacters (habitat separation)', !sharkSeesLadybug);
  verify('Ladybug does NOT see shark in nearbyCharacters (habitat separation)', !ladybugSeesShark);

  // ============================================================
  // 2. Same-Layer Interaction
  // ============================================================
  console.log('\n2. Same-Layer Interaction');

  ensureTaxonomyNodes('Mammalia', 'Carnivora', 'Canidae', 'Canis', 'lupus');

  const wolfSpecies = speciesRegistry.register({
    commonName: 'Wolf',
    scientificName: 'Canis lupus',
    taxonomy: {
      class: 'Mammalia', order: 'Carnivora', family: 'Canidae',
      genus: 'Canis', species: 'lupus',
    },
    tier: 'flagship',
    traitOverrides: {
      habitat: ['surface'],
      aquatic: false,
      diet: 'carnivore',
      size: 40,
      strength: 65,
      maturityTicks: 100,
    },
  });

  const surfaceRegion = makeRegion('Grassland Region', 'surface');
  const surfaceRegionMap = new Map([[surfaceRegion.id as RegionId, surfaceRegion]]);

  const wolf1 = createCharacter({
    speciesId: wolfSpecies.id as SpeciesId,
    regionId: surfaceRegion.id as RegionId,
    familyTreeId: 'tree-wolf-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(wolf1);

  const wolf2 = createCharacter({
    speciesId: wolfSpecies.id as SpeciesId,
    regionId: surfaceRegion.id as RegionId,
    familyTreeId: 'tree-wolf-2' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(wolf2);

  const wolf1Ctx = buildActionContext(
    wolf1.id as CharacterId, surfaceRegionMap, TICK, 'day', 'summer', 'clear',
  );
  const wolf2Ctx = buildActionContext(
    wolf2.id as CharacterId, surfaceRegionMap, TICK, 'day', 'summer', 'clear',
  );

  verify('Wolf 1 context exists', wolf1Ctx !== null);
  verify('Wolf 2 context exists', wolf2Ctx !== null);
  verify(
    'Wolf 1 sees Wolf 2 in nearbyCharacters',
    wolf1Ctx?.nearbyCharacters.some(c => c.id === wolf2.id) ?? false,
  );
  verify(
    'Wolf 2 sees Wolf 1 in nearbyCharacters',
    wolf2Ctx?.nearbyCharacters.some(c => c.id === wolf1.id) ?? false,
  );

  // ============================================================
  // 3. Cross-Species Breeding Gates
  // ============================================================
  console.log('\n3. Cross-Species Breeding Gates');

  ensureTaxonomyNodes('Insecta', 'Hymenoptera', 'Formicidae', 'Formica', 'minima');
  ensureTaxonomyNodes('Mammalia', 'Proboscidea', 'Elephantidae', 'Loxodonta', 'africana');

  const antSpecies = speciesRegistry.register({
    commonName: 'Tiny Ant',
    scientificName: 'Formica minima',
    taxonomy: {
      class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae',
      genus: 'Formica', species: 'minima',
    },
    tier: 'notable',
    traitOverrides: {
      size: 2,
      maturityTicks: 10,
      habitat: ['surface'],
      gestationTicks: 20,
    },
  });

  const elephantSpecies = speciesRegistry.register({
    commonName: 'Bull Elephant',
    scientificName: 'Loxodonta africana',
    taxonomy: {
      class: 'Mammalia', order: 'Proboscidea', family: 'Elephantidae',
      genus: 'Loxodonta', species: 'africana',
    },
    tier: 'flagship',
    traitOverrides: {
      size: 95,
      maturityTicks: 10,
      habitat: ['surface'],
      gestationTicks: 20,
    },
  });

  const antChar = createCharacter({
    speciesId: antSpecies.id as SpeciesId,
    regionId: surfaceRegion.id as RegionId,
    familyTreeId: 'tree-ant-1' as FamilyTreeId,
    tick: TICK,
    sex: 'female',
  });
  antChar.age = 1000; // ensure mature
  characterRegistry.add(antChar);

  const elephantChar = createCharacter({
    speciesId: elephantSpecies.id as SpeciesId,
    regionId: surfaceRegion.id as RegionId,
    familyTreeId: 'tree-elephant-1' as FamilyTreeId,
    tick: TICK,
    sex: 'male',
  });
  elephantChar.age = 1000; // ensure mature
  characterRegistry.add(elephantChar);

  const sizeBreedResult = canBreed(antChar, elephantChar);
  // Expected: { canBreed: false, reason: 'Size difference too great' }
  // Current code: returns { canBreed: false, reason: 'Different species' } probabilistically —
  // size is not checked. FAILED here means the size gate is missing.
  verify(
    'canBreed returns false for ant vs elephant (size ratio >> 2)',
    !sizeBreedResult.canBreed,
  );
  verify(
    "canBreed reason is 'Size difference too great' for extreme size mismatch",
    sizeBreedResult.reason === 'Size difference too great',
  );

  // Incompatible-habitat check: shark (underwater) vs deer (surface)
  ensureTaxonomyNodes('Mammalia', 'Artiodactyla', 'Cervidae', 'Cervus', 'elaphus');

  const deerSpecies = speciesRegistry.register({
    commonName: 'Land Deer',
    scientificName: 'Cervus elaphus',
    taxonomy: {
      class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae',
      genus: 'Cervus', species: 'elaphus',
    },
    tier: 'notable',
    traitOverrides: {
      habitat: ['surface'],
      aquatic: false,
      maturityTicks: 10,
      gestationTicks: 20,
      diet: 'herbivore',
      size: 55,
    },
  });

  const deerChar = createCharacter({
    speciesId: deerSpecies.id as SpeciesId,
    regionId: surfaceRegion.id as RegionId,
    familyTreeId: 'tree-deer-1' as FamilyTreeId,
    tick: TICK,
    sex: 'female',
  });
  deerChar.age = 1000;
  characterRegistry.add(deerChar);

  // Shark is habitat:['underwater'], deer is habitat:['surface']
  const habitatBreedResult = canBreed(shark, deerChar);
  // Expected: { canBreed: false, reason: 'Incompatible habitats' }
  // Current code: returns 'Different species' or randomly passes — habitat not checked.
  verify(
    'canBreed returns false for shark (underwater) vs deer (surface)',
    !habitatBreedResult.canBreed,
  );
  verify(
    "canBreed reason is 'Incompatible habitats' for underwater vs surface species",
    habitatBreedResult.reason === 'Incompatible habitats',
  );

  // ============================================================
  // 4. Food Web Hunting
  // ============================================================
  console.log('\n4. Food Web Hunting');

  addFoodWebRelation(
    ecosystem,
    wolfSpecies.id as SpeciesId,
    deerSpecies.id as SpeciesId,
    0.15,
  );

  const huntRegion = makeRegion('Hunt Region', 'surface');
  const huntRegionMap = new Map([[huntRegion.id as RegionId, huntRegion]]);

  const wolfHunter = createCharacter({
    speciesId: wolfSpecies.id as SpeciesId,
    regionId: huntRegion.id as RegionId,
    familyTreeId: 'tree-wolf-hunter-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(wolfHunter);

  const deerPrey = createCharacter({
    speciesId: deerSpecies.id as SpeciesId,
    regionId: huntRegion.id as RegionId,
    familyTreeId: 'tree-deer-prey-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(deerPrey);

  const wolfHunterCtx = buildActionContext(
    wolfHunter.id as CharacterId, huntRegionMap, TICK, 'day', 'summer', 'clear',
  );
  verify('Wolf hunter context exists', wolfHunterCtx !== null);
  verify(
    'Wolf hunter sees deer in nearbyCharacters',
    wolfHunterCtx?.nearbyCharacters.some(c => c.id === deerPrey.id) ?? false,
  );

  // Up to 30 attempts — probability is 0.3 + (strength+speed)*0.002, so should hit quickly
  let wolfHuntSucceeded = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    const freshCtx = buildActionContext(
      wolfHunter.id as CharacterId, huntRegionMap, TICK + attempt, 'day', 'summer', 'clear',
    );
    if (!freshCtx) break;
    const result = processAction(action('hunt'), freshCtx);
    if (result.success) {
      wolfHuntSucceeded = true;
      break;
    }
  }
  verify('Wolf hunt can succeed with deer prey present', wolfHuntSucceeded);

  // Herbivore (deer) attempts to hunt — expected diet gate rejection
  // NOTE: Current handleHunt has no diet check, so a herbivore CAN hunt.
  // FAILED here means the diet gate is missing.
  const herbRegion = makeRegion('Herbivore Region', 'surface');
  const herbRegionMap = new Map([[herbRegion.id as RegionId, herbRegion]]);

  const herbivore = createCharacter({
    speciesId: deerSpecies.id as SpeciesId,
    regionId: herbRegion.id as RegionId,
    familyTreeId: 'tree-deer-herb-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(herbivore);

  // Place a wolf nearby so the "no prey present" path does not mask the diet gate
  const wolfNearby = createCharacter({
    speciesId: wolfSpecies.id as SpeciesId,
    regionId: herbRegion.id as RegionId,
    familyTreeId: 'tree-wolf-nearby-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(wolfNearby);

  const herbCtx = buildActionContext(
    herbivore.id as CharacterId, herbRegionMap, TICK, 'day', 'summer', 'clear',
  );
  const herbHuntResult = herbCtx
    ? processAction(action('hunt'), herbCtx)
    : null;

  verify(
    "Herbivore hunt is rejected with diet gate (narrative includes \"doesn't hunt\")",
    herbHuntResult !== null
    && !herbHuntResult.success
    && herbHuntResult.narrative.includes("doesn't hunt"),
  );

  // ============================================================
  // 5. Species-Seeded Genetics
  // ============================================================
  console.log('\n5. Species-Seeded Genetics');

  // generateBaseGenetics() currently uses gaussian(50, 10) regardless of species —
  // species trait overrides are NOT seeded into individual gene values.
  // A FAILED result here means species-specific gene seeding is not implemented.

  const SAMPLE_SIZE = 20;
  let sharkStrengthSum = 0;
  let ladybugStrengthSum = 0;

  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const s = createCharacter({
      speciesId: sharkSpecies.id as SpeciesId,
      regionId: sharedRegion.id as RegionId,
      familyTreeId: `tree-shark-sample-${i}` as FamilyTreeId,
      tick: TICK,
    });
    const sg = s.genetics.genes.find(g => g.trait === 'strength');
    sharkStrengthSum += sg?.value ?? 50;

    const l = createCharacter({
      speciesId: ladybugSpecies.id as SpeciesId,
      regionId: sharedRegion.id as RegionId,
      familyTreeId: `tree-ladybug-sample-${i}` as FamilyTreeId,
      tick: TICK,
    });
    const lg = l.genetics.genes.find(g => g.trait === 'strength');
    ladybugStrengthSum += lg?.value ?? 50;
  }

  const avgSharkStrength = sharkStrengthSum / SAMPLE_SIZE;
  const avgLadybugStrength = ladybugStrengthSum / SAMPLE_SIZE;

  console.log(
    `    (shark avg strength: ${avgSharkStrength.toFixed(1)}, ` +
    `ladybug avg strength: ${avgLadybugStrength.toFixed(1)})`,
  );

  verify('Shark average strength gene is >= 55 (species-seeded)', avgSharkStrength >= 55);
  verify('Ladybug average strength gene is <= 10 (species-seeded)', avgLadybugStrength <= 10);

  // Appearance genes (color / pattern / markings) — not present in the engine today
  const sampleShark = createCharacter({
    speciesId: sharkSpecies.id as SpeciesId,
    regionId: sharedRegion.id as RegionId,
    familyTreeId: 'tree-shark-appearance' as FamilyTreeId,
    tick: TICK,
  });
  const hasAppearanceGene = sampleShark.genetics.genes.some(
    g => g.trait === 'color' || g.trait === 'pattern' || g.trait === 'markings',
  );
  verify(
    'Character genetics include at least one appearance gene (color / pattern / markings)',
    hasAppearanceGene,
  );

  // ============================================================
  // 6. Predator Encounter Risk during Explore
  // ============================================================
  console.log('\n6. Predator Encounter Risk');

  // wolf→deer relation already registered in ecosystem above.
  // handleExplore always returns success:true today — no predator-interrupt path exists.
  // A FAILED result here means the predator-interrupt mechanic is not yet implemented.

  const preyRegion = makeRegion('Prey Region', 'surface');
  const preyRegionMap = new Map([[preyRegion.id as RegionId, preyRegion]]);

  const fearfulDeer = createCharacter({
    speciesId: deerSpecies.id as SpeciesId,
    regionId: preyRegion.id as RegionId,
    familyTreeId: 'tree-deer-fearful-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(fearfulDeer);

  const stalkerWolf = createCharacter({
    speciesId: wolfSpecies.id as SpeciesId,
    regionId: preyRegion.id as RegionId,
    familyTreeId: 'tree-wolf-stalker-1' as FamilyTreeId,
    tick: TICK,
  });
  characterRegistry.add(stalkerWolf);

  let exploreInterruptedByPredator = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    const ctx = buildActionContext(
      fearfulDeer.id as CharacterId, preyRegionMap, TICK + attempt, 'day', 'summer', 'clear',
    );
    if (!ctx) break;
    const result = processAction(action('explore'), ctx);
    if (!result.success) {
      exploreInterruptedByPredator = true;
      break;
    }
  }

  verify(
    'Explore returns success:false at least once when a predator is present (predator interrupt)',
    exploreInterruptedByPredator,
  );

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n--- Summary ---');
  if (totalFailed === 0) {
    console.log('All biological realism checks passed.\n');
  } else {
    console.log(`${totalFailed} check(s) failed — biological gaps detected above.\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
