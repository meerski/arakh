import { describe, it, expect, beforeEach } from 'vitest';
import { LineageManager } from '../src/game/lineage.js';
import type { CharacterId, FamilyTreeId } from '../src/types.js';

describe('LineageManager', () => {
  let manager: LineageManager;
  let treeId: FamilyTreeId;

  beforeEach(() => {
    manager = new LineageManager();
    const tree = manager.createTree({
      speciesId: 'sp-1' as any,
      ownerId: 'owner-1' as any,
      rootCharacterId: 'root' as CharacterId,
    });
    treeId = tree.id;
  });

  it('creates a tree with root member', () => {
    const tree = manager.getTree(treeId);
    expect(tree).toBeDefined();
    expect(tree!.members).toContain('root');
    expect(tree!.generations).toBe(1);
  });

  it('adds members with parent edges', () => {
    manager.addMember(treeId, 'child1' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'child2' as CharacterId, 2, ['root' as CharacterId]);

    const tree = manager.getTree(treeId);
    expect(tree!.members).toHaveLength(3);
    expect(tree!.generations).toBe(2);
  });

  it('computes generation correctly', () => {
    manager.addMember(treeId, 'child1' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'grandchild1' as CharacterId, 3, ['child1' as CharacterId]);

    expect(manager.getGeneration(treeId, 'root' as CharacterId)).toBe(1);
    expect(manager.getGeneration(treeId, 'child1' as CharacterId)).toBe(2);
    expect(manager.getGeneration(treeId, 'grandchild1' as CharacterId)).toBe(3);
  });

  it('finds ancestors', () => {
    manager.addMember(treeId, 'child1' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'grandchild1' as CharacterId, 3, ['child1' as CharacterId]);

    const ancestors = manager.getAncestors(treeId, 'grandchild1' as CharacterId);
    expect(ancestors).toContain('child1');
    expect(ancestors).toContain('root');
    expect(ancestors).toHaveLength(2);
  });

  it('finds descendants', () => {
    manager.addMember(treeId, 'child1' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'child2' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'grandchild1' as CharacterId, 3, ['child1' as CharacterId]);

    const descendants = manager.getDescendants(treeId, 'root' as CharacterId);
    expect(descendants).toContain('child1');
    expect(descendants).toContain('child2');
    expect(descendants).toContain('grandchild1');
    expect(descendants).toHaveLength(3);
  });

  it('filters living members with callback', () => {
    manager.addMember(treeId, 'alive' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'dead' as CharacterId, 2, ['root' as CharacterId]);

    const alive = new Set(['root', 'alive']);
    const living = manager.getLivingMembers(treeId, id => alive.has(id));
    expect(living).toHaveLength(2);
    expect(living).toContain('root');
    expect(living).toContain('alive');
  });

  it('calculates inbreeding coefficient', () => {
    // Build a family where two parents share a grandparent
    manager.addMember(treeId, 'child1' as CharacterId, 2, ['root' as CharacterId]);
    manager.addMember(treeId, 'child2' as CharacterId, 2, ['root' as CharacterId]);
    // Both child1 and child2 share 'root' as ancestor
    const coeff = manager.calculateInbreedingCoefficient(
      treeId,
      'child1' as CharacterId,
      'child2' as CharacterId,
    );
    expect(coeff).toBeGreaterThan(0); // Should find shared ancestor 'root'
    expect(coeff).toBeLessThanOrEqual(1);
  });

  it('returns 0 inbreeding for unrelated characters', () => {
    // Create a second tree with no shared ancestors
    const tree2 = manager.createTree({
      speciesId: 'sp-1' as any,
      ownerId: 'owner-2' as any,
      rootCharacterId: 'other-root' as CharacterId,
    });
    manager.addMember(tree2.id, 'other-child' as CharacterId, 2, ['other-root' as CharacterId]);

    // Characters from different trees have no shared ancestors in either tree
    const coeff = manager.calculateInbreedingCoefficient(
      treeId,
      'root' as CharacterId,
      'other-root' as CharacterId, // not in treeId's parent edges
    );
    expect(coeff).toBe(0);
  });
});
