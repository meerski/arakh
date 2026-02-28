// ============================================================
// Social Web — Friendships, Rivalries, Bonds
// ============================================================

import type { Character, CharacterId, RelationshipType, Relationship, WorldEvent, EventId } from '../types.js';

// Extended relationship types including kinship
export type ExtendedRelationshipType = RelationshipType | 'kin';

/** Mirror map: when A has type X toward B, B gets type Y toward A */
const RELATIONSHIP_MIRRORS: Record<string, ExtendedRelationshipType> = {
  friend: 'friend',
  rival: 'rival',
  mate: 'mate',
  mentor: 'student',
  student: 'mentor',
  ally: 'ally',
  enemy: 'enemy',
  trade_partner: 'trade_partner',
  kin: 'kin',
};

export function addRelationship(
  character: Character,
  targetId: CharacterId,
  type: RelationshipType,
  strength: number = 0.5,
): void {
  const existing = character.relationships.find(r => r.targetId === targetId);
  if (existing) {
    existing.type = type;
    existing.strength = Math.max(-1, Math.min(1, strength));
  } else {
    character.relationships.push({
      targetId,
      type,
      strength: Math.max(-1, Math.min(1, strength)),
    });
  }
}

/**
 * Add a bidirectional relationship between two characters.
 * The reverse relationship uses the mirrored type.
 */
export function addBidirectionalRelationship(
  characterA: Character,
  characterB: Character,
  type: RelationshipType,
  strength: number = 0.5,
): void {
  addRelationship(characterA, characterB.id, type, strength);

  const mirroredType = (RELATIONSHIP_MIRRORS[type] || type) as RelationshipType;
  addRelationship(characterB, characterA.id, mirroredType, strength);
}

export function modifyRelationshipStrength(
  character: Character,
  targetId: CharacterId,
  delta: number,
): void {
  const rel = character.relationships.find(r => r.targetId === targetId);
  if (rel) {
    rel.strength = Math.max(-1, Math.min(1, rel.strength + delta));
  }
}

export function getRelationship(character: Character, targetId: CharacterId): Relationship | undefined {
  return character.relationships.find(r => r.targetId === targetId);
}

export function getRelationshipsByType(character: Character, type: RelationshipType): Relationship[] {
  return character.relationships.filter(r => r.type === type);
}

// ============================================================
// Social Graph — Indexed relationship lookups
// ============================================================

export class SocialGraph {
  /** Quick adjacency index: characterId -> set of connected characterIds */
  private index: Map<CharacterId, Set<CharacterId>> = new Map();

  /** Register a relationship edge between two characters */
  addEdge(a: CharacterId, b: CharacterId): void {
    if (!this.index.has(a)) this.index.set(a, new Set());
    if (!this.index.has(b)) this.index.set(b, new Set());
    this.index.get(a)!.add(b);
    this.index.get(b)!.add(a);
  }

  /** Remove a relationship edge */
  removeEdge(a: CharacterId, b: CharacterId): void {
    this.index.get(a)?.delete(b);
    this.index.get(b)?.delete(a);
  }

  /** Get all character IDs connected to the given character */
  getConnections(characterId: CharacterId): CharacterId[] {
    const set = this.index.get(characterId);
    return set ? Array.from(set) : [];
  }

  /** Check if two characters are directly connected */
  isConnected(a: CharacterId, b: CharacterId): boolean {
    return this.index.get(a)?.has(b) ?? false;
  }

  /** Get all relationships for a character from their relationship array */
  getAllRelationships(character: Character): Relationship[] {
    return [...character.relationships];
  }

  /**
   * Decay all relationships on a character by a small amount per tick elapsed.
   * Relationships naturally weaken over time toward 0 (neutral).
   */
  decayRelationships(character: Character, ticksElapsed: number): void {
    const decayPerTick = 0.001;
    const totalDecay = decayPerTick * ticksElapsed;

    for (const rel of character.relationships) {
      if (rel.strength > 0) {
        rel.strength = Math.max(0, rel.strength - totalDecay);
      } else if (rel.strength < 0) {
        rel.strength = Math.min(0, rel.strength + totalDecay);
      }
    }
  }

  /**
   * Add a kinship relationship between two characters.
   * Uses the 'kin' type concept mapped onto the existing RelationshipType.
   * Since 'kin' is not in the base RelationshipType, we use 'ally' with high strength
   * as the canonical representation, or the caller can cast as needed.
   */
  addKinship(characterA: Character, characterB: Character, strength: number = 0.8): void {
    // Store kin relationships as 'ally' type with kinship-level strength
    addBidirectionalRelationship(characterA, characterB, 'ally', strength);
    this.addEdge(characterA.id, characterB.id);
  }

  /**
   * Generate a social event when a relationship crosses critical thresholds.
   * Returns a WorldEvent if a threshold is crossed, or null otherwise.
   */
  generateSocialEvent(relationship: Relationship, sourceCharacterId: CharacterId): WorldEvent | null {
    // Rivalry becomes lethal at -0.9
    if (relationship.type === 'rival' && relationship.strength <= -0.9) {
      return {
        id: crypto.randomUUID() as EventId,
        type: 'war',
        level: 'personal',
        regionIds: [],
        description: `A rivalry between characters has turned lethal (strength: ${relationship.strength.toFixed(2)}).`,
        tick: 0,
        effects: [
          {
            type: 'lethal_rivalry',
            magnitude: Math.abs(relationship.strength),
          },
        ],
        resolved: false,
      };
    }

    // Enemy crosses into extreme hostility at -0.8
    if (relationship.type === 'enemy' && relationship.strength <= -0.8) {
      return {
        id: crypto.randomUUID() as EventId,
        type: 'war',
        level: 'personal',
        regionIds: [],
        description: `Enmity has escalated to open conflict.`,
        tick: 0,
        effects: [
          {
            type: 'open_conflict',
            magnitude: Math.abs(relationship.strength),
          },
        ],
        resolved: false,
      };
    }

    // Deep friendship triggers alliance event at 0.9
    if (relationship.type === 'friend' && relationship.strength >= 0.9) {
      return {
        id: crypto.randomUUID() as EventId,
        type: 'alliance',
        level: 'personal',
        regionIds: [],
        description: `A deep bond of friendship has formed into an unbreakable alliance.`,
        tick: 0,
        effects: [
          {
            type: 'deep_alliance',
            magnitude: relationship.strength,
          },
        ],
        resolved: false,
      };
    }

    // Mate bond strengthens into a formal union at 0.9
    if (relationship.type === 'mate' && relationship.strength >= 0.9) {
      return {
        id: crypto.randomUUID() as EventId,
        type: 'wedding',
        level: 'family',
        regionIds: [],
        description: `A mating bond has solidified into a lifelong union.`,
        tick: 0,
        effects: [
          {
            type: 'lifelong_bond',
            magnitude: relationship.strength,
          },
        ],
        resolved: false,
      };
    }

    return null;
  }
}

/** Singleton social graph instance */
export const socialGraph = new SocialGraph();
