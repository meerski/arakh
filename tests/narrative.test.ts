import { describe, it, expect } from 'vitest';
import {
  narrateEvent, generateDailySummary, narrateBirth, narrateDeath,
  narrateDiscovery, narrateCombat, narrateFirstContact, narrateBreeding,
  narrateForSpecies,
} from '../src/narrative/narrator.js';
import { selectTemplate, fillTemplate, getCategories } from '../src/narrative/templates.js';
import { getSpeciesVoice, voicedBirth, voicedDeath, adaptNarrative } from '../src/narrative/species-voice.js';
import { generateCardFlavorText, generateEpitaph, summarizeHighlights } from '../src/narrative/card-text.js';
import {
  createHighlight, generateHighlightsFromCharacter, eventsToHighlights,
} from '../src/cards/highlights.js';
import { createCard } from '../src/cards/card.js';
import { createCharacter } from '../src/species/character.js';
import { speciesRegistry } from '../src/species/species.js';
import type { Character, WorldEvent } from '../src/types.js';

describe('Narrative & Cards Pipeline', () => {
  let herbivoreId: string;
  let carnivoreId: string;

  function getOrCreate(name: string, overrides: Record<string, unknown> = {}) {
    const existing = speciesRegistry.getByName(name);
    if (existing) return existing.id;
    const sp = speciesRegistry.register({
      commonName: name,
      scientificName: `Testus ${name.toLowerCase()}`,
      taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: name.slice(0, 2) },
      tier: 'flagship',
      traitOverrides: { lifespan: 5000, diet: 'herbivore', ...overrides },
    });
    return sp.id;
  }

  function makeChar(speciesId: string, overrides?: Partial<Character>): Character {
    const c = createCharacter({
      speciesId,
      regionId: 'r1' as any,
      familyTreeId: 'tree-1' as any,
      tick: 0,
    });
    if (overrides) Object.assign(c, overrides);
    return c;
  }

  herbivoreId = getOrCreate('NarrHerb', { diet: 'herbivore' });
  carnivoreId = getOrCreate('NarrCarn', { diet: 'carnivore' });

  // --- Templates ---
  describe('Template System', () => {
    it('fills template placeholders', () => {
      const result = fillTemplate('Hello {name}, welcome to {regionName}!', {
        name: 'Zara',
        regionName: 'Emerald Forest',
      });
      expect(result).toBe('Hello Zara, welcome to Emerald Forest!');
    });

    it('leaves unfilled placeholders intact', () => {
      const result = fillTemplate('{name} found {item}', { name: 'Rex' });
      expect(result).toContain('Rex');
      expect(result).toContain('{item}');
    });

    it('selects and fills templates by category', () => {
      const result = selectTemplate('birth', {
        name: 'Luna',
        speciesName: 'Wolf',
        targetName: 'Alpha and Beta',
        regionName: 'Northern Forest',
      });
      expect(result).toContain('Luna');
    });

    it('has all expected categories', () => {
      const categories = getCategories();
      expect(categories).toContain('birth');
      expect(categories).toContain('death');
      expect(categories).toContain('discovery');
      expect(categories).toContain('combat_win');
      expect(categories).toContain('first_contact');
      expect(categories.length).toBeGreaterThanOrEqual(15);
    });
  });

  // --- Species Voice ---
  describe('Species Voice', () => {
    it('returns predator voice for carnivores', () => {
      const voice = getSpeciesVoice(carnivoreId);
      expect(voice.moveVerbs).toContain('stalks');
      expect(voice.eatVerbs).toContain('devours');
    });

    it('returns prey voice for herbivores', () => {
      const voice = getSpeciesVoice(herbivoreId);
      expect(voice.moveVerbs).toContain('darts');
      expect(voice.eatVerbs).toContain('grazes on');
    });

    it('returns default voice for unknown species', () => {
      const voice = getSpeciesVoice('nonexistent');
      expect(voice.moveVerbs.length).toBeGreaterThan(0);
    });

    it('generates species-specific birth text', () => {
      const birth = voicedBirth(carnivoreId);
      expect(birth.length).toBeGreaterThan(0);
    });

    it('generates species-specific death text', () => {
      const death = voicedDeath(herbivoreId);
      expect(death.length).toBeGreaterThan(0);
    });

    it('adapts narrative text with species vocabulary', () => {
      const adapted = adaptNarrative('The creature moves forward and eats.', carnivoreId);
      expect(adapted).not.toBe('The creature moves forward and eats.');
    });
  });

  // --- Narrator ---
  describe('Narrator', () => {
    it('narrates events with level prefix', () => {
      const event: WorldEvent = {
        id: 'e1',
        type: 'discovery',
        level: 'species',
        regionIds: ['r1'],
        description: 'A new species has been found!',
        tick: 100,
        effects: [],
        resolved: false,
      };
      const text = narrateEvent(event);
      expect(text).toContain('[Species]');
      expect(text).toContain('A new species');
    });

    it('generates daily summaries', () => {
      const summary = generateDailySummary('Rex', 'Wolf', [], 5);
      expect(summary).toContain('Rex');
      expect(summary).toContain('5 actions');
    });

    it('generates birth narrative with species voice', () => {
      const text = narrateBirth('Cub', 'Wolf', ['Alpha', 'Beta'], carnivoreId, 'Northern Forest');
      // Template may or may not include character name, but always has species voice prefix + content
      expect(text.length).toBeGreaterThan(10);
      expect(text).toMatch(/predator|born|Wolf/i);
    });

    it('generates death narrative with fame tiers', () => {
      const legendary = narrateDeath('Great One', 'Eagle', 'old age', 500, herbivoreId);
      expect(legendary).toContain('legendary');

      const common = narrateDeath('Nobody', 'Rat', 'starvation', 0, herbivoreId);
      expect(common).toContain('Nobody');
    });

    it('generates discovery narrative', () => {
      const text = narrateDiscovery('Explorer', 'Fox', 'Hidden Cave', 'Dark Woods');
      expect(text).toContain('Explorer');
      expect(text).toContain('Hidden Cave');
    });

    it('generates combat narratives', () => {
      const win = narrateCombat('Fighter', 'Bear', true);
      expect(win).toContain('Fighter');

      const loss = narrateCombat('Loser', 'Rabbit', false);
      expect(loss).toContain('Loser');
    });

    it('generates first contact narrative', () => {
      const text = narrateFirstContact('Scout', 'Wolf', 'Eagle');
      // Template may or may not include character name, but always references the species
      expect(text.length).toBeGreaterThan(10);
      expect(text).toMatch(/Wolf|Eagle|contact|meet/i);
    });

    it('generates breeding narrative', () => {
      const text = narrateBreeding('Mother', 'Deer', 3, 'Meadow');
      expect(text).toContain('Mother');
      expect(text).toContain('3');
    });
  });

  // --- Highlights ---
  describe('Highlights', () => {
    it('creates highlights with clamped significance', () => {
      const h = createHighlight(100, 'Found treasure', 1.5);
      expect(h.significance).toBe(1);
      expect(h.description).toBe('Found treasure');
    });

    it('generates highlights from character', () => {
      const char = makeChar(herbivoreId, {
        fame: 200,
        isGenesisElder: true,
      } as any);
      char.achievements.push({
        id: 'a1', name: 'First Discovery', description: 'Found something', tick: 50,
      });
      char.childIds.push('c1' as any, 'c2' as any);

      const highlights = generateHighlightsFromCharacter(char);
      expect(highlights.length).toBeGreaterThan(0);
      // Genesis elder highlight should be high significance
      const genesis = highlights.find(h => h.description.includes('Genesis'));
      expect(genesis).toBeDefined();
      expect(genesis!.significance).toBeGreaterThanOrEqual(0.9);
    });

    it('caps highlights at 10', () => {
      const char = makeChar(herbivoreId);
      // Add many achievements
      for (let i = 0; i < 15; i++) {
        char.achievements.push({
          id: `a${i}`, name: `Achievement ${i}`, description: `Did thing ${i}`, tick: i * 10,
        });
      }
      const highlights = generateHighlightsFromCharacter(char);
      expect(highlights.length).toBeLessThanOrEqual(10);
    });

    it('converts world events to highlights', () => {
      const events: WorldEvent[] = [
        { id: 'e1', type: 'discovery', level: 'species', regionIds: ['r1'], description: 'Big find!', tick: 100, effects: [], resolved: false },
        { id: 'e2', type: 'extinction', level: 'regional', regionIds: ['r1'], description: 'Species gone!', tick: 200, effects: [], resolved: false },
      ];
      const highlights = eventsToHighlights(events);
      expect(highlights).toHaveLength(2);
      expect(highlights[0].description).toBe('Big find!');
    });
  });

  // --- Card Text ---
  describe('Card Text', () => {
    it('generates flavor text for common characters', () => {
      const char = makeChar(herbivoreId);
      const text = generateCardFlavorText(char, 'Age of Beasts');
      expect(text.length).toBeGreaterThan(10);
    });

    it('generates legendary flavor for high fame', () => {
      const char = makeChar(herbivoreId, { fame: 600 } as any);
      const text = generateCardFlavorText(char, 'Golden Era');
      expect(text).toContain(char.name);
    });

    it('generates dynasty flavor for many children', () => {
      const char = makeChar(herbivoreId);
      char.childIds = ['c1', 'c2', 'c3', 'c4', 'c5'] as any[];
      const text = generateCardFlavorText(char, 'Era 1');
      expect(text).toContain(char.name);
      expect(text.length).toBeGreaterThan(0);
    });

    it('generates epitaph for dead characters', () => {
      const char = makeChar(herbivoreId, {
        isAlive: false,
        causeOfDeath: 'natural causes',
      } as any);
      const epitaph = generateEpitaph(char);
      expect(epitaph.length).toBeGreaterThan(0);
    });

    it('generates combat epitaph for killed characters', () => {
      const char = makeChar(herbivoreId, {
        isAlive: false,
        causeOfDeath: 'killed by a predator',
      } as any);
      const epitaph = generateEpitaph(char);
      expect(epitaph.length).toBeGreaterThan(0);
    });

    it('summarizes highlights', () => {
      const highlights = [
        { tick: 100, description: 'Found treasure', significance: 0.8 },
        { tick: 200, description: 'Built a home', significance: 0.5 },
        { tick: 300, description: 'Met a friend', significance: 0.3 },
      ];
      const summary = summarizeHighlights(highlights);
      expect(summary).toContain('Found treasure');
      expect(summary).toContain('Built a home');
    });

    it('handles empty highlights', () => {
      expect(summarizeHighlights([])).toBe('An uneventful existence.');
    });
  });

  // --- Full Card Pipeline ---
  describe('Full Card Generation Pipeline', () => {
    it('creates a complete card with flavor text and highlights', () => {
      const char = makeChar(herbivoreId, { fame: 75 } as any);
      char.achievements.push({
        id: 'a1', name: 'Discovered Fire', description: 'Found fire', tick: 100,
      });
      char.childIds.push('c1' as any);
      char.isAlive = false;
      char.diedAtTick = 5000;
      char.causeOfDeath = 'old age';

      const card = createCard(char, 'owner-1', 'Age of Discovery');

      expect(card.characterName).toBe(char.name);
      expect(card.rarity).toBe('rare'); // fame >= 50
      expect(card.flavorText.length).toBeGreaterThan(0);
      expect(card.highlightReel.length).toBeGreaterThan(0);
      expect(card.era).toBe('Age of Discovery');
      expect(card.taxonomy.class).toBeTruthy();
      expect(card.familyTreePosition.generation).toBe(char.generation);
      expect(card.fameScore).toBe(75);
    });

    it('creates genesis card for genesis elders', () => {
      const char = makeChar(herbivoreId, { isGenesisElder: true } as any);
      const card = createCard(char, 'owner-1');
      expect(card.rarity).toBe('genesis');
    });

    it('creates card with epitaph for dead characters', () => {
      const char = makeChar(herbivoreId);
      char.isAlive = false;
      char.causeOfDeath = 'killed in battle';
      char.diedAtTick = 3000;

      const card = createCard(char, 'owner-1', 'Era of War');
      expect(card.flavorText.length).toBeGreaterThan(0);
      expect(card.causeOfDeath).toBe('killed in battle');
    });
  });
});
