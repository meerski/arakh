import { describe, it, expect, beforeEach } from 'vitest';
import { generateCorpseMaterials, corpseRegistry } from '../src/simulation/corpses.js';
import { speciesRegistry } from '../src/species/species.js';
import { createCharacter } from '../src/species/character.js';
import type { SpeciesId } from '../src/types.js';

// ----------------------------------------------------------------
// Helpers — register a minimal species and return its id
// ----------------------------------------------------------------

function registerSpecies(opts: {
  commonName: string;
  cls: string;
  size: number;
}): SpeciesId {
  const species = speciesRegistry.register({
    commonName: opts.commonName,
    scientificName: `${opts.commonName.toLowerCase().replace(/\s+/g, '.')} testus`,
    taxonomy: {
      class: opts.cls,
      order: 'TestOrder',
      family: 'TestFamily',
      genus: 'Testus',
      species: opts.commonName.toLowerCase().replace(/\s+/g, '_'),
    },
    tier: 'flagship',
    traitOverrides: { size: opts.size, lifespan: 5000 },
  });
  return species.id;
}

// ----------------------------------------------------------------

describe('Corpses & Materials', () => {
  let mammalId: SpeciesId;
  let birdId: SpeciesId;
  let insectId: SpeciesId;
  let fishId: SpeciesId;
  let sharkId: SpeciesId;
  let crabId: SpeciesId;

  beforeEach(() => {
    corpseRegistry.clear();

    mammalId  = registerSpecies({ commonName: 'Test Wolf',        cls: 'Mammalia',       size: 50 });
    birdId    = registerSpecies({ commonName: 'Test Sparrow',     cls: 'Aves',           size: 20 });
    insectId  = registerSpecies({ commonName: 'Test Beetle',      cls: 'Insecta',        size: 5  });
    fishId    = registerSpecies({ commonName: 'Test Perch',       cls: 'Actinopterygii', size: 30 });
    sharkId   = registerSpecies({ commonName: 'Test Shark',       cls: 'Chondrichthyes', size: 60 });
    crabId    = registerSpecies({ commonName: 'Test Crab',        cls: 'Crustacea',      size: 15 });
  });

  // --------------------------------------------------------------
  // 1. generateCorpseMaterials — mammals
  // --------------------------------------------------------------

  it('returns bone, hide, and teeth for mammals', () => {
    const materials = generateCorpseMaterials(mammalId);
    const types = materials.map(m => m.type);

    expect(types).toContain('bone');
    expect(types).toContain('hide');
    expect(types).toContain('teeth');
  });

  // --------------------------------------------------------------
  // 2. generateCorpseMaterials — birds
  // --------------------------------------------------------------

  it('returns feather and bone for birds', () => {
    const materials = generateCorpseMaterials(birdId);
    const types = materials.map(m => m.type);

    expect(types).toContain('feather');
    expect(types).toContain('bone');
  });

  // --------------------------------------------------------------
  // 3. generateCorpseMaterials — insects
  // --------------------------------------------------------------

  it('returns chitin for insects', () => {
    const materials = generateCorpseMaterials(insectId);
    const types = materials.map(m => m.type);

    expect(types).toContain('chitin');
    // Insects should not produce bone or hide
    expect(types).not.toContain('bone');
    expect(types).not.toContain('hide');
  });

  // --------------------------------------------------------------
  // 4. createCorpse creates a corpse from a character
  // --------------------------------------------------------------

  it('createCorpse produces a corpse linked to the character', () => {
    const character = createCharacter({
      speciesId: mammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 100);

    expect(corpse.id).toBeDefined();
    expect(corpse.characterId).toBe(character.id);
    expect(corpse.speciesId).toBe(mammalId);
    expect(corpse.regionId).toBe('region-1');
    expect(corpse.diedAtTick).toBe(100);
    expect(corpse.materials.length).toBeGreaterThan(0);
    expect(corpse.biomassRemaining).toBeGreaterThan(0);
    expect(corpse.decayRate).toBeGreaterThan(0);
  });

  it('created corpse appears in getAll()', () => {
    const character = createCharacter({
      speciesId: birdId,
      regionId: 'region-2' as any,
      familyTreeId: 'tree-2' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 50);

    expect(corpseRegistry.getAll()).toHaveLength(1);
    expect(corpseRegistry.get(corpse.id)).toBeDefined();
  });

  // --------------------------------------------------------------
  // 5. tickCorpseDecay reduces biomass
  // --------------------------------------------------------------

  it('tickCorpseDecay reduces biomassRemaining each call', () => {
    const character = createCharacter({
      speciesId: insectId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 0);
    const biomassBefore = corpse.biomassRemaining;

    corpseRegistry.tickCorpseDecay(1);

    expect(corpse.biomassRemaining).toBeLessThan(biomassBefore);
  });

  it('repeated decay ticks remove a fully decomposed corpse', () => {
    const character = createCharacter({
      speciesId: insectId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 0);
    const corpseId = corpse.id;

    // Drain all biomass manually so the removal condition can trigger quickly
    corpse.biomassRemaining = 0;
    for (const mat of corpse.materials) {
      mat.quantity = 0;
    }

    corpseRegistry.tickCorpseDecay(1);

    expect(corpseRegistry.get(corpseId)).toBeUndefined();
  });

  // --------------------------------------------------------------
  // 6. harvestFromCorpse returns the correct amount and mutates qty
  // --------------------------------------------------------------

  it('harvestFromCorpse returns requested amount and reduces material quantity', () => {
    const character = createCharacter({
      speciesId: mammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 0);
    const boneMat = corpse.materials.find(m => m.type === 'bone')!;
    const originalQty = boneMat.quantity;

    const harvested = corpseRegistry.harvestFromCorpse(corpse.id, 'bone', 1);

    expect(harvested).toBe(1);
    expect(boneMat.quantity).toBe(originalQty - 1);
  });

  it('harvestFromCorpse caps at available quantity', () => {
    const character = createCharacter({
      speciesId: mammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 0);
    const boneMat = corpse.materials.find(m => m.type === 'bone')!;
    const available = boneMat.quantity;

    // Request more than is available
    const harvested = corpseRegistry.harvestFromCorpse(corpse.id, 'bone', available + 100);

    expect(harvested).toBe(available);
    expect(boneMat.quantity).toBe(0);
  });

  it('harvestFromCorpse returns 0 for a non-existent corpse', () => {
    const result = corpseRegistry.harvestFromCorpse('no-such-id', 'bone', 1);
    expect(result).toBe(0);
  });

  it('harvestFromCorpse returns 0 for a material the corpse does not have', () => {
    const character = createCharacter({
      speciesId: insectId,   // yields only chitin
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const corpse = corpseRegistry.createCorpse(character, 0);
    const result = corpseRegistry.harvestFromCorpse(corpse.id, 'bone', 1);
    expect(result).toBe(0);
  });

  // --------------------------------------------------------------
  // 7. getCorpsesInRegion filters by region
  // --------------------------------------------------------------

  it('getCorpsesInRegion returns only corpses in the target region', () => {
    const charA = createCharacter({
      speciesId: mammalId,
      regionId: 'region-alpha' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    const charB = createCharacter({
      speciesId: birdId,
      regionId: 'region-beta' as any,
      familyTreeId: 'tree-2' as any,
      tick: 0,
    });

    corpseRegistry.createCorpse(charA, 10);
    corpseRegistry.createCorpse(charB, 10);

    const alphaCorpses = corpseRegistry.getCorpsesInRegion('region-alpha' as any);
    const betaCorpses  = corpseRegistry.getCorpsesInRegion('region-beta' as any);

    expect(alphaCorpses).toHaveLength(1);
    expect(alphaCorpses[0].regionId).toBe('region-alpha');
    expect(betaCorpses).toHaveLength(1);
    expect(betaCorpses[0].regionId).toBe('region-beta');
  });

  it('getCorpsesInRegion returns an empty array when none match', () => {
    const result = corpseRegistry.getCorpsesInRegion('region-nowhere' as any);
    expect(result).toEqual([]);
  });

  // --------------------------------------------------------------
  // 8. Material quantities scale with species size
  // --------------------------------------------------------------

  it('larger species produce more material quantity than smaller ones', () => {
    // Large mammal (size 90) vs small mammal (size 10)
    const largeMammalId = registerSpecies({ commonName: 'Test Elephant', cls: 'Mammalia', size: 90 });
    const smallMammalId = registerSpecies({ commonName: 'Test Mouse',    cls: 'Mammalia', size: 10 });

    const largeMats = generateCorpseMaterials(largeMammalId);
    const smallMats = generateCorpseMaterials(smallMammalId);

    const largeBoneQty = largeMats.find(m => m.type === 'bone')!.quantity;
    const smallBoneQty = smallMats.find(m => m.type === 'bone')!.quantity;

    expect(largeBoneQty).toBeGreaterThan(smallBoneQty);
  });

  it('corpse biomassRemaining scales with species size', () => {
    const largeMammalId = registerSpecies({ commonName: 'Test Bison', cls: 'Mammalia', size: 80 });
    const smallMammalId = registerSpecies({ commonName: 'Test Vole',  cls: 'Mammalia', size: 5  });

    const largeChar = createCharacter({
      speciesId: largeMammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    const smallChar = createCharacter({
      speciesId: smallMammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    const largeCorpse = corpseRegistry.createCorpse(largeChar, 0);
    const smallCorpse = corpseRegistry.createCorpse(smallChar, 0);

    expect(largeCorpse.biomassRemaining).toBeGreaterThan(smallCorpse.biomassRemaining);
  });

  // --------------------------------------------------------------
  // Additional coverage — fish and shark materials
  // --------------------------------------------------------------

  it('returns bone and scale for bony fish', () => {
    const materials = generateCorpseMaterials(fishId);
    const types = materials.map(m => m.type);

    expect(types).toContain('bone');
    expect(types).toContain('scale');
  });

  it('returns cartilage and teeth for sharks', () => {
    const materials = generateCorpseMaterials(sharkId);
    const types = materials.map(m => m.type);

    expect(types).toContain('cartilage');
    expect(types).toContain('teeth');
  });

  it('returns shell and chitin for crustaceans', () => {
    const materials = generateCorpseMaterials(crabId);
    const types = materials.map(m => m.type);

    expect(types).toContain('shell');
    expect(types).toContain('chitin');
  });

  // --------------------------------------------------------------
  // clear() empties the registry
  // --------------------------------------------------------------

  it('clear() removes all corpses', () => {
    const character = createCharacter({
      speciesId: mammalId,
      regionId: 'region-1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });

    corpseRegistry.createCorpse(character, 0);
    expect(corpseRegistry.getAll().length).toBeGreaterThan(0);

    corpseRegistry.clear();
    expect(corpseRegistry.getAll()).toHaveLength(0);
  });
});
