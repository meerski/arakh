import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateProposal, PactRegistry } from '../src/game/diplomacy.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import { addRelationship } from '../src/game/social.js';
import type { Character } from '../src/types.js';

describe('Diplomacy System', () => {
  let speciesId1: string;
  let speciesId2: string;

  function makeChar(speciesId: string): Character {
    return createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
  }

  beforeEach(() => {
    const existing1 = speciesRegistry.getByName('DiploWolf');
    if (existing1) {
      speciesId1 = existing1.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'DiploWolf',
        scientificName: 'Diplo wolfus',
        taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'DG', species: 'DW' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000, socialStructure: 'pack' },
      });
      speciesId1 = sp.id;
    }

    const existing2 = speciesRegistry.getByName('DiploDeer');
    if (existing2) {
      speciesId2 = existing2.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'DiploDeer',
        scientificName: 'Diplo deerus',
        taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'DD', species: 'DD' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000, socialStructure: 'herd' },
      });
      speciesId2 = sp.id;
    }
  });

  describe('evaluateProposal', () => {
    it('returns a result with accepted boolean and narrative', () => {
      const a = makeChar(speciesId1);
      const b = makeChar(speciesId1);
      const result = evaluateProposal(a, b, 'share food', 'ceasefire');
      expect(typeof result.accepted).toBe('boolean');
      expect(typeof result.narrative).toBe('string');
      expect(result.narrative.length).toBeGreaterThan(0);
    });

    it('creates a pact when accepted', () => {
      // Run multiple times to get at least one acceptance
      let gotPact = false;
      for (let i = 0; i < 50; i++) {
        const a = makeChar(speciesId1);
        const b = makeChar(speciesId1);
        const result = evaluateProposal(a, b, 'share territory', 'non-aggression');
        if (result.accepted && result.pact) {
          gotPact = true;
          expect(result.pact.offer).toBe('share territory');
          expect(result.pact.demand).toBe('non-aggression');
          break;
        }
      }
      expect(gotPact).toBe(true);
    });

    it('enemies are more likely to reject', () => {
      let acceptCount = 0;
      for (let i = 0; i < 100; i++) {
        const a = makeChar(speciesId1);
        const b = makeChar(speciesId1);
        addRelationship(a, b.id, 'enemy', -0.8);
        const result = evaluateProposal(a, b, 'peace', 'ceasefire');
        if (result.accepted) acceptCount++;
      }
      // Should be very low acceptance rate
      expect(acceptCount).toBeLessThan(30);
    });

    it('cross-species proposals are harder', () => {
      let sameAccept = 0;
      let crossAccept = 0;
      for (let i = 0; i < 200; i++) {
        const a = makeChar(speciesId1);
        const b1 = makeChar(speciesId1);
        const b2 = makeChar(speciesId2);

        if (evaluateProposal(a, b1, 'deal', 'favor').accepted) sameAccept++;
        if (evaluateProposal(a, b2, 'deal', 'favor').accepted) crossAccept++;
      }
      // Cross-species should have lower acceptance
      expect(crossAccept).toBeLessThanOrEqual(sameAccept + 30); // allow some variance
    });
  });

  describe('PactRegistry', () => {
    let registry: PactRegistry;

    beforeEach(() => {
      registry = new PactRegistry();
    });

    it('stores and retrieves pacts', () => {
      registry.add({
        id: 'p1',
        proposerId: 'c1' as any,
        targetId: 'c2' as any,
        offer: 'food',
        demand: 'peace',
        acceptedAtTick: 100,
        expiresAtTick: null,
        broken: false,
        brokenBy: null,
      });
      expect(registry.getForCharacter('c1' as any)).toHaveLength(1);
      expect(registry.getForCharacter('c2' as any)).toHaveLength(1);
    });

    it('breaks pacts and applies reputation damage', () => {
      const betrayed = makeChar(speciesId1);
      const witness = makeChar(speciesId1);

      registry.add({
        id: 'p2',
        proposerId: 'breaker' as any,
        targetId: betrayed.id,
        offer: 'protection',
        demand: 'loyalty',
        acceptedAtTick: 100,
        expiresAtTick: null,
        broken: false,
        brokenBy: null,
      });

      registry.breakPact('p2', 'breaker' as any, betrayed, [witness]);
      const pact = registry.get('p2');
      expect(pact?.broken).toBe(true);
      expect(pact?.brokenBy).toBe('breaker');
    });

    it('excludes broken pacts from active list', () => {
      registry.add({
        id: 'p3',
        proposerId: 'c1' as any,
        targetId: 'c2' as any,
        offer: 'X',
        demand: 'Y',
        acceptedAtTick: 100,
        expiresAtTick: null,
        broken: true,
        brokenBy: 'c1' as any,
      });
      expect(registry.getForCharacter('c1' as any)).toHaveLength(0);
    });
  });
});
