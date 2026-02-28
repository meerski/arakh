import { describe, it, expect, beforeEach } from 'vitest';
import { tickPolitics } from '../src/game/politics.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import { addRelationship } from '../src/game/social.js';
import type { Character } from '../src/types.js';

describe('Politics System', () => {
  let speciesId: string;

  function makeChar(overrides?: Partial<{ aggression: number; strength: number; sociability: number; intelligence: number }>): Character {
    const char = createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    // Override gene values for testing
    if (overrides) {
      for (const [trait, value] of Object.entries(overrides)) {
        const gene = char.genetics.genes.find(g => g.trait === trait);
        if (gene) gene.value = value;
      }
    }
    return char;
  }

  beforeEach(() => {
    const existing = speciesRegistry.getByName('PolWolf');
    if (existing) {
      speciesId = existing.id;
    } else {
      const sp = speciesRegistry.register({
        commonName: 'PolWolf',
        scientificName: 'Politicus wolfus',
        taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'PG', species: 'PW' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000, socialStructure: 'pack' },
      });
      speciesId = sp.id;
    }
  });

  it('returns empty for fewer than 3 characters', () => {
    const chars = [makeChar(), makeChar()];
    expect(tickPolitics(chars, 100)).toEqual([]);
  });

  it('returns empty for solitary species', () => {
    const solitaryId = (() => {
      const existing = speciesRegistry.getByName('PolCat');
      if (existing) return existing.id;
      return speciesRegistry.register({
        commonName: 'PolCat',
        scientificName: 'Politicus catus',
        taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'PC', species: 'PC' },
        tier: 'flagship',
        traitOverrides: { lifespan: 5000, socialStructure: 'solitary' },
      }).id;
    })();

    const chars = Array.from({ length: 5 }, () =>
      createCharacter({
        speciesId: solitaryId,
        regionId: 'r1' as any,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      }),
    );
    expect(tickPolitics(chars, 100)).toEqual([]);
  });

  it('can generate exile events when majority dislikes a character', () => {
    // Run many iterations to catch the random event
    let gotExile = false;
    for (let trial = 0; trial < 200 && !gotExile; trial++) {
      const target = makeChar();
      target.socialRank = 10;
      const group = [target];
      for (let i = 0; i < 6; i++) {
        const c = makeChar();
        c.socialRank = 20 + i * 5;
        // All dislike the target
        addRelationship(c, target.id, 'enemy', -0.5);
        group.push(c);
      }

      const events = tickPolitics(group, trial);
      if (events.some(e => e.type === 'exile')) {
        gotExile = true;
      }
    }
    expect(gotExile).toBe(true);
  });

  it('can generate alpha challenge events', () => {
    let gotChallenge = false;
    for (let trial = 0; trial < 500 && !gotChallenge; trial++) {
      const leader = makeChar({ strength: 40, aggression: 20 });
      leader.socialRank = 80;

      const challenger = makeChar({ strength: 80, aggression: 80 });
      challenger.socialRank = 30;

      const filler = makeChar();
      filler.socialRank = 10;

      const events = tickPolitics([leader, challenger, filler], trial);
      if (events.some(e => e.type === 'alpha_challenge')) {
        gotChallenge = true;
      }
    }
    expect(gotChallenge).toBe(true);
  });

  it('political events have narrative text', () => {
    // Generate any event
    let foundNarrative = false;
    for (let trial = 0; trial < 500 && !foundNarrative; trial++) {
      const chars: Character[] = [];
      for (let i = 0; i < 8; i++) {
        const c = makeChar({ aggression: 70, strength: 50 + i * 5, sociability: 70 });
        c.socialRank = i * 10;
        // Create some tensions
        if (i > 0) {
          addRelationship(c, chars[0].id, 'enemy', -0.5);
        }
        chars.push(c);
      }

      const events = tickPolitics(chars, trial);
      if (events.length > 0) {
        foundNarrative = true;
        expect(events[0].narrative.length).toBeGreaterThan(0);
        expect(events[0].actorId).toBeTruthy();
      }
    }
    expect(foundNarrative).toBe(true);
  });
});
