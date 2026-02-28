// ============================================================
// Family Tree Management
// ============================================================

import type { FamilyTree, FamilyTreeId, CharacterId, SpeciesId, OwnerId } from '../types.js';

export class LineageManager {
  private trees: Map<FamilyTreeId, FamilyTree> = new Map();

  /** Parent -> Children edge map, keyed by tree */
  private childrenEdges: Map<FamilyTreeId, Map<CharacterId, CharacterId[]>> = new Map();

  /** Child -> Parents edge map, keyed by tree */
  private parentEdges: Map<FamilyTreeId, Map<CharacterId, CharacterId[]>> = new Map();

  createTree(params: {
    speciesId: SpeciesId;
    ownerId: OwnerId;
    rootCharacterId: CharacterId;
  }): FamilyTree {
    const tree: FamilyTree = {
      id: crypto.randomUUID() as FamilyTreeId,
      speciesId: params.speciesId,
      ownerId: params.ownerId,
      rootCharacterId: params.rootCharacterId,
      generations: 1,
      members: [params.rootCharacterId],
      isExtinct: false,
    };
    this.trees.set(tree.id, tree);
    this.childrenEdges.set(tree.id, new Map());
    this.parentEdges.set(tree.id, new Map());
    return tree;
  }

  addMember(
    treeId: FamilyTreeId,
    characterId: CharacterId,
    generation: number,
    parentIds?: CharacterId[],
  ): void {
    const tree = this.trees.get(treeId);
    if (!tree) return;
    tree.members.push(characterId);
    if (generation > tree.generations) {
      tree.generations = generation;
    }

    // Record edges if parents are provided
    if (parentIds && parentIds.length > 0) {
      const children = this.childrenEdges.get(treeId);
      const parents = this.parentEdges.get(treeId);
      if (children && parents) {
        // Store child -> parents
        parents.set(characterId, [...parentIds]);

        // Store parent -> children
        for (const pid of parentIds) {
          const existing = children.get(pid);
          if (existing) {
            existing.push(characterId);
          } else {
            children.set(pid, [characterId]);
          }
        }
      }
    }
  }

  markExtinct(treeId: FamilyTreeId): void {
    const tree = this.trees.get(treeId);
    if (tree) tree.isExtinct = true;
  }

  getTree(treeId: FamilyTreeId): FamilyTree | undefined {
    return this.trees.get(treeId);
  }

  getTreesByOwner(ownerId: OwnerId): FamilyTree[] {
    return Array.from(this.trees.values()).filter(t => t.ownerId === ownerId);
  }

  getAllTrees(): FamilyTree[] {
    return Array.from(this.trees.values());
  }

  /**
   * Compute the generation number of a character by walking up parentIds.
   * The root character (no parents) is generation 1.
   */
  getGeneration(treeId: FamilyTreeId, characterId: CharacterId): number {
    const parents = this.parentEdges.get(treeId);
    if (!parents) return 1;

    let generation = 1;
    let current = characterId;
    const visited = new Set<CharacterId>();

    while (true) {
      if (visited.has(current)) break;
      visited.add(current);

      const pids = parents.get(current);
      if (!pids || pids.length === 0) break;

      // Walk up via first parent
      current = pids[0];
      generation++;
    }

    return generation;
  }

  /**
   * Return all ancestors of a character by walking up parentIds.
   */
  getAncestors(treeId: FamilyTreeId, characterId: CharacterId): CharacterId[] {
    const parents = this.parentEdges.get(treeId);
    if (!parents) return [];

    const ancestors: CharacterId[] = [];
    const queue: CharacterId[] = [];
    const visited = new Set<CharacterId>();

    // Seed with immediate parents
    const directParents = parents.get(characterId);
    if (directParents) {
      queue.push(...directParents);
    }

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      ancestors.push(id);

      const pids = parents.get(id);
      if (pids) {
        queue.push(...pids);
      }
    }

    return ancestors;
  }

  /**
   * Return all descendants of a character by walking down children edges.
   */
  getDescendants(treeId: FamilyTreeId, characterId: CharacterId): CharacterId[] {
    const children = this.childrenEdges.get(treeId);
    if (!children) return [];

    const descendants: CharacterId[] = [];
    const queue: CharacterId[] = [];
    const visited = new Set<CharacterId>();

    const directChildren = children.get(characterId);
    if (directChildren) {
      queue.push(...directChildren);
    }

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      descendants.push(id);

      const kids = children.get(id);
      if (kids) {
        queue.push(...kids);
      }
    }

    return descendants;
  }

  /**
   * Filter tree members using a callback to determine liveness.
   */
  getLivingMembers(
    treeId: FamilyTreeId,
    isAliveFn: (characterId: CharacterId) => boolean,
  ): CharacterId[] {
    const tree = this.trees.get(treeId);
    if (!tree) return [];
    return tree.members.filter(isAliveFn);
  }

  /**
   * Calculate a simplified inbreeding coefficient by checking shared ancestors
   * within 4 generations. Returns a value between 0 (no shared ancestors) and 1.
   */
  calculateInbreedingCoefficient(
    treeId: FamilyTreeId,
    parentAId: CharacterId,
    parentBId: CharacterId,
  ): number {
    const parents = this.parentEdges.get(treeId);
    if (!parents) return 0;

    // Collect ancestors up to 4 generations for each parent
    const collectAncestorsLimited = (startId: CharacterId, maxDepth: number): Set<CharacterId> => {
      const result = new Set<CharacterId>();
      const queue: Array<{ id: CharacterId; depth: number }> = [{ id: startId, depth: 0 }];

      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (depth >= maxDepth) continue;

        const pids = parents.get(id);
        if (pids) {
          for (const pid of pids) {
            if (!result.has(pid)) {
              result.add(pid);
              queue.push({ id: pid, depth: depth + 1 });
            }
          }
        }
      }

      return result;
    };

    const ancestorsA = collectAncestorsLimited(parentAId, 4);
    const ancestorsB = collectAncestorsLimited(parentBId, 4);

    if (ancestorsA.size === 0 || ancestorsB.size === 0) return 0;

    // Count shared ancestors
    let shared = 0;
    for (const id of ancestorsA) {
      if (ancestorsB.has(id)) shared++;
    }

    // Normalize: ratio of shared ancestors to the smaller ancestor set
    const minSize = Math.min(ancestorsA.size, ancestorsB.size);
    if (minSize === 0) return 0;

    return Math.min(1, shared / minSize);
  }

  /** Get the children edge map for a tree (read-only access). */
  getChildrenEdges(treeId: FamilyTreeId): Map<CharacterId, CharacterId[]> | undefined {
    return this.childrenEdges.get(treeId);
  }

  /** Get the parent edge map for a tree (read-only access). */
  getParentEdges(treeId: FamilyTreeId): Map<CharacterId, CharacterId[]> | undefined {
    return this.parentEdges.get(treeId);
  }
}

export const lineageManager = new LineageManager();
