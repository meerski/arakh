import { describe, it, expect, beforeEach } from 'vitest';
import { TierManager } from '../src/species/tier-manager.js';
import { buildPopulationGenome, sampleGeneticsFromGenome, mergeIntoGenome } from '../src/species/population-genome.js';
import { createWorldContext, installWorldContext } from '../src/context.js';
import { createCharacter } from '../src/species/character.js';
import { seedTaxonomy } from '../src/data/taxonomy/seed.js';
import { seedMammals } from '../src/data/taxonomy/mammals.js';
import type { WorldContext } from '../src/context.js';
import type { Character, SpeciesId, RegionId, FamilyTreeId } from '../src/types.js';

describe('PopulationGenome', () => {
  let ctx: WorldContext;

  beforeEach(() => {
    ctx = createWorldContext();
    installWorldContext(ctx);
    seedTaxonomy();
    seedMammals();
  });

  function makeChars(count: number): Character[] {
    const species = ctx.species.getAll()[0];
    const chars: Character[] = [];
    for (let i = 0; i < count; i++) {
      chars.push(createCharacter({
        speciesId: species.id,
        regionId: 'region-1' as RegionId,
        familyTreeId: 'tree-1' as FamilyTreeId,
        tick: 0,
      }));
    }
    return chars;
  }

  it('builds genome from characters', () => {
    const chars = makeChars(20);
    const genome = buildPopulationGenome(chars);

    expect(genome.sampleSize).toBe(20);
    expect(Object.keys(genome.traitMeans).length).toBeGreaterThan(0);
    expect(genome.traitMeans.size).toBeDefined();
    expect(genome.mutationRate).toBeGreaterThan(0);
  });

  it('handles empty character array', () => {
    const genome = buildPopulationGenome([]);
    expect(genome.sampleSize).toBe(0);
    expect(genome.mutationRate).toBe(0.05);
  });

  it('samples genetics from genome', () => {
    const chars = makeChars(50);
    const genome = buildPopulationGenome(chars);
    const genetics = sampleGeneticsFromGenome(genome);

    expect(genetics.genes.length).toBeGreaterThan(0);
    for (const gene of genetics.genes) {
      expect(gene.value).toBeGreaterThanOrEqual(0);
      expect(gene.value).toBeLessThanOrEqual(100);
    }
  });

  it('merges character into genome incrementally', () => {
    const chars = makeChars(10);
    let genome = buildPopulationGenome(chars.slice(0, 5));
    expect(genome.sampleSize).toBe(5);

    for (const char of chars.slice(5)) {
      genome = mergeIntoGenome(genome, char);
    }
    expect(genome.sampleSize).toBe(10);
  });
});

describe('TierManager', () => {
  let ctx: WorldContext;
  let tierManager: TierManager;

  beforeEach(() => {
    ctx = createWorldContext();
    installWorldContext(ctx);
    seedTaxonomy();
    seedMammals();
    tierManager = ctx.tierManager;
  });

  function createPopulatedTree(memberCount: number) {
    const species = ctx.species.getAll()[0];
    const regionId = 'region-1' as RegionId;

    // Create first character (root)
    const root = createCharacter({
      speciesId: species.id,
      regionId,
      familyTreeId: 'placeholder' as FamilyTreeId,
      tick: 0,
      isGenesisElder: true,
    });

    const tree = ctx.lineage.createTree({
      speciesId: species.id,
      ownerId: 'owner-1' as any,
      rootCharacterId: root.id,
    });

    root.familyTreeId = tree.id;
    ctx.characters.add(root);

    // Add more members
    for (let i = 1; i < memberCount; i++) {
      const char = createCharacter({
        speciesId: species.id,
        regionId,
        familyTreeId: tree.id,
        tick: 0,
      });
      ctx.characters.add(char);
      tree.members.push(char.id);
    }

    return tree;
  }

  it('keeps tree at individual tier below 150', () => {
    createPopulatedTree(100);
    const events = tierManager.evaluateAll(100);
    expect(events).toHaveLength(0);

    const trees = ctx.lineage.getAllTrees();
    expect(trees[0].tier).toBe('individual');
  });

  it('transitions to lineage at 150 members', () => {
    createPopulatedTree(150);
    const events = tierManager.evaluateAll(100);

    expect(events).toHaveLength(1);
    expect(events[0].oldTier).toBe('individual');
    expect(events[0].newTier).toBe('lineage');
    expect(events[0].narrative).toContain('Lineage');

    const trees = ctx.lineage.getAllTrees();
    expect(trees[0].tier).toBe('lineage');
    expect(trees[0].populationGenome).not.toBeNull();
  });

  it('transitions to population at 500 members', () => {
    const tree = createPopulatedTree(500);
    // First transition to lineage
    tierManager.evaluateAll(100);
    expect(tree.tier).toBe('lineage');

    // Set populationCount manually (simulating growth beyond tracked chars)
    tree.populationCount = 500;
    const events = tierManager.evaluateAll(200);

    expect(events.some(e => e.newTier === 'population')).toBe(true);
    expect(tree.tier).toBe('population');
  });

  it('transitions back to individual below 20', () => {
    const tree = createPopulatedTree(150);
    tierManager.evaluateAll(100);
    expect(tree.tier).toBe('lineage');

    // Kill most characters to get below threshold
    const living = ctx.characters.getLiving().filter(c => c.familyTreeId === tree.id);
    for (let i = 0; i < living.length - 15; i++) {
      ctx.characters.markDead(living[i].id, 200, 'culled');
    }
    tree.populationCount = 15;

    const events = tierManager.evaluateAll(300);
    expect(events.some(e => e.newTier === 'individual')).toBe(true);
    expect(tree.tier).toBe('individual');
  });

  it('spawns standout from lineage tier', () => {
    const tree = createPopulatedTree(150);
    tierManager.evaluateAll(100);
    expect(tree.tier).toBe('lineage');
    expect(tree.populationGenome).not.toBeNull();

    const beforeCount = ctx.characters.livingCount;
    const standout = tierManager.spawnStandout(tree, 'region-1', 200);

    expect(standout).not.toBeNull();
    expect(standout!.familyTreeId).toBe(tree.id);
    expect(ctx.characters.livingCount).toBeGreaterThan(beforeCount);
  });

  it('skips extinct trees', () => {
    const tree = createPopulatedTree(150);
    tree.isExtinct = true;

    const events = tierManager.evaluateAll(100);
    expect(events).toHaveLength(0);
    expect(tree.tier).toBe('individual');
  });
});
