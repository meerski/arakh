import { describe, it, expect } from 'vitest';
import {
  addRelationship,
  addBidirectionalRelationship,
  modifyRelationshipStrength,
  SocialGraph,
} from '../src/game/social.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character } from '../src/types.js';

describe('Social System', () => {
  let speciesId: string;

  function makeChar(): Character {
    if (!speciesId) {
      const existing = speciesRegistry.getByName('SocialTest');
      if (existing) {
        speciesId = existing.id;
      } else {
        const sp = speciesRegistry.register({
          commonName: 'SocialTest',
          scientificName: 'Testus socialis',
          taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: 'S' },
          tier: 'flagship',
          traitOverrides: { lifespan: 1000 },
        });
        speciesId = sp.id;
      }
    }
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
  }

  describe('Relationships', () => {
    it('adds a one-directional relationship', () => {
      const a = makeChar();
      const b = makeChar();
      addRelationship(a, b.id, 'friend', 0.7);
      expect(a.relationships).toHaveLength(1);
      expect(a.relationships[0].type).toBe('friend');
      expect(a.relationships[0].strength).toBe(0.7);
      // b should have no relationship to a
      expect(b.relationships).toHaveLength(0);
    });

    it('adds bidirectional relationships with mirrored types', () => {
      const a = makeChar();
      const b = makeChar();
      addBidirectionalRelationship(a, b, 'mentor', 0.8);
      expect(a.relationships[0].type).toBe('mentor');
      expect(b.relationships[0].type).toBe('student');
    });

    it('clamps strength to [-1, 1]', () => {
      const a = makeChar();
      const b = makeChar();
      addRelationship(a, b.id, 'rival', -5);
      expect(a.relationships[0].strength).toBe(-1);
      addRelationship(a, b.id, 'friend', 5);
      expect(a.relationships[0].strength).toBe(1);
    });

    it('modifies existing relationship strength', () => {
      const a = makeChar();
      const b = makeChar();
      addRelationship(a, b.id, 'friend', 0.5);
      modifyRelationshipStrength(a, b.id, 0.3);
      expect(a.relationships[0].strength).toBe(0.8);
    });
  });

  describe('SocialGraph', () => {
    it('tracks edges between characters', () => {
      const graph = new SocialGraph();
      graph.addEdge('a' as any, 'b' as any);
      expect(graph.isConnected('a' as any, 'b' as any)).toBe(true);
      expect(graph.isConnected('b' as any, 'a' as any)).toBe(true);
    });

    it('removes edges', () => {
      const graph = new SocialGraph();
      graph.addEdge('a' as any, 'b' as any);
      graph.removeEdge('a' as any, 'b' as any);
      expect(graph.isConnected('a' as any, 'b' as any)).toBe(false);
    });

    it('decays relationships toward zero', () => {
      const graph = new SocialGraph();
      const char = makeChar();
      const other = makeChar();
      addRelationship(char, other.id, 'friend', 0.5);

      graph.decayRelationships(char, 100);
      expect(char.relationships[0].strength).toBeLessThan(0.5);
      expect(char.relationships[0].strength).toBeGreaterThan(0);
    });

    it('generates lethal rivalry event', () => {
      const graph = new SocialGraph();
      const event = graph.generateSocialEvent(
        { targetId: 'b' as any, type: 'rival', strength: -0.95 },
        'a' as any,
      );
      expect(event).not.toBeNull();
      expect(event!.type).toBe('war');
    });

    it('generates wedding event for strong mate bond', () => {
      const graph = new SocialGraph();
      const event = graph.generateSocialEvent(
        { targetId: 'b' as any, type: 'mate', strength: 0.95 },
        'a' as any,
      );
      expect(event).not.toBeNull();
      expect(event!.type).toBe('wedding');
    });

    it('returns null for moderate relationships', () => {
      const graph = new SocialGraph();
      const event = graph.generateSocialEvent(
        { targetId: 'b' as any, type: 'friend', strength: 0.5 },
        'a' as any,
      );
      expect(event).toBeNull();
    });
  });
});
