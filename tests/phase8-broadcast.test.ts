import { describe, it, expect, beforeEach } from 'vitest';
import { Gamemaster, gamemasters, _installGamemasters } from '../src/broadcast/gamemaster.js';
import { NewsBroadcast } from '../src/broadcast/news.js';
import { LiveFeed } from '../src/dashboard/feed.js';
import { getWorldStats, getSpeciesRankings } from '../src/dashboard/stats.js';
import {
  calculateDynastyScore, updateDynastyScore, getOwnerDashboard,
} from '../src/dashboard/owner.js';
import {
  DirectiveQueue,
} from '../src/game/directives.js';
import { playerManager } from '../src/game/player.js';
import { cardCollection } from '../src/cards/collection.js';
import { lineageManager } from '../src/game/lineage.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import { createCharacter } from '../src/species/character.js';
import type { TickResult, WorldEvent, Card, OwnerId, PlayerId, RegionId } from '../src/types.js';

// Helpers
function getOrCreateSpecies(name: string, overrides: Record<string, unknown> = {}) {
  const existing = speciesRegistry.getByName(name);
  if (existing) return existing.id;
  return speciesRegistry.register({
    commonName: name,
    scientificName: `Testus ${name.toLowerCase()}`,
    taxonomy: { class: 'M', order: 'O', family: 'F', genus: 'G', species: name.slice(0, 2) },
    tier: 'flagship',
    traitOverrides: { lifespan: 5000, diet: 'herbivore', ...overrides },
  }).id;
}

function makeTickResult(overrides: Partial<TickResult> = {}): TickResult {
  return {
    tick: 100,
    time: {
      tick: 100, year: 0, day: 0, hour: 2, minute: 46,
      timeOfDay: 'night', season: 'spring', lunarPhase: 'new',
    },
    events: [],
    births: [],
    deaths: [],
    discoveries: [],
    actionResults: [],
    ...overrides,
  };
}

function makeEvent(overrides: Partial<WorldEvent> = {}): WorldEvent {
  return {
    id: crypto.randomUUID(),
    type: 'discovery',
    level: 'species',
    regionIds: ['r1' as RegionId],
    description: 'Something happened',
    tick: 100,
    effects: [],
    resolved: true,
    ...overrides,
  };
}

describe('Phase 8 — Broadcast & Human Experience', () => {
  // --- Gamemaster ---
  describe('Gamemaster', () => {
    it('creates gamemaster with a name', () => {
      const gm = new Gamemaster('TestMaster');
      expect(gm.getName()).toBe('TestMaster');
    });

    it('broadcasts breaking news for global events', () => {
      const gm = new Gamemaster('Oracle');
      const result = makeTickResult({
        events: [makeEvent({ level: 'global', type: 'meteor', description: 'A meteor strikes!' })],
      });
      const messages = gm.processTick(result);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].category).toBe('breaking');
      expect(messages[0].text).toContain('Oracle');
    });

    it('broadcasts breaking news for tesla moments', () => {
      const gm = new Gamemaster('Sage');
      const result = makeTickResult({
        events: [makeEvent({ type: 'tesla_moment', level: 'global', description: 'Fire discovered!' })],
      });
      const messages = gm.processTick(result);
      expect(messages.some(m => m.category === 'breaking')).toBe(true);
    });

    it('does not broadcast for minor events', () => {
      const gm = new Gamemaster('Silent');
      const result = makeTickResult({
        events: [makeEvent({ level: 'personal', type: 'discovery' })],
      });
      const messages = gm.processTick(result);
      // Personal events are not breaking and no commentary interval reached
      expect(messages.filter(m => m.category === 'breaking')).toHaveLength(0);
    });

    it('generates periodic commentary about deaths', () => {
      const gm = new Gamemaster('Commentator');
      // Set ticks since last broadcast high enough
      for (let i = 0; i < 59; i++) {
        gm.processTick(makeTickResult());
      }
      const result = makeTickResult({ deaths: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as any[] });
      const messages = gm.processTick(result);
      expect(messages.some(m => m.category === 'commentary' && m.text.includes('souls lost'))).toBe(true);
    });

    it('stores broadcast history', () => {
      const gm = new Gamemaster('Historian');
      gm.processTick(makeTickResult({
        events: [makeEvent({ level: 'global', type: 'meteor' })],
      }));
      expect(gm.getRecentBroadcasts(10).length).toBeGreaterThan(0);
    });

    it('default gamemasters are Chronos and Gaia', () => {
      expect(gamemasters).toHaveLength(2);
      expect(gamemasters[0].getName()).toBe('Chronos');
      expect(gamemasters[1].getName()).toBe('Gaia');
    });
  });

  // --- News Broadcast ---
  describe('News Broadcast', () => {
    beforeEach(() => {
      // Reset global gamemasters to fresh instances
      _installGamemasters([new Gamemaster('Chronos'), new Gamemaster('Gaia')]);
    });

    it('processes tick through all gamemasters (deduplicates breaking)', () => {
      const news = new NewsBroadcast();
      const result = makeTickResult({
        events: [makeEvent({ level: 'global', type: 'extinction', description: 'Plague spreads!' })],
      });
      const messages = news.processTick(result);
      // Breaking news is deduplicated — only the first gamemaster's version is kept
      const breaking = messages.filter(m => m.category === 'breaking');
      expect(breaking).toHaveLength(1);
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    it('retrieves latest news', () => {
      const news = new NewsBroadcast();
      news.processTick(makeTickResult({
        events: [makeEvent({ level: 'global', type: 'extinction' })],
      }));
      expect(news.getLatest(10).length).toBeGreaterThan(0);
    });

    it('filters breaking news', () => {
      const news = new NewsBroadcast();
      news.processTick(makeTickResult({
        events: [makeEvent({ level: 'global', type: 'first_contact' })],
      }));
      const breaking = news.getBreaking(10);
      expect(breaking.length).toBeGreaterThan(0);
      expect(breaking.every(m => m.category === 'breaking')).toBe(true);
    });

    it('tracks feed size', () => {
      const news = new NewsBroadcast();
      expect(news.getFeedSize()).toBe(0);
      news.processTick(makeTickResult({
        events: [makeEvent({ level: 'global', type: 'extinction' })],
      }));
      expect(news.getFeedSize()).toBeGreaterThan(0);
    });
  });

  // --- Live Feed ---
  describe('Live Feed', () => {
    it('adds and retrieves action items', () => {
      const feed = new LiveFeed();
      feed.addAction('p1' as PlayerId, { narrative: 'Found food', effects: [], success: true } as any, 100);
      const items = feed.getForPlayer('p1' as PlayerId);
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('action');
      expect(items[0].text).toBe('Found food');
    });

    it('adds world events to feed', () => {
      const feed = new LiveFeed();
      feed.addEvent(makeEvent({ description: 'Storm hits!' }));
      const items = feed.getAll();
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('event');
    });

    it('adds broadcast messages', () => {
      const feed = new LiveFeed();
      feed.addBroadcastText('BREAKING NEWS: Meteor!', 500);
      const items = feed.getAll();
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('broadcast');
    });

    it('filters feed by player', () => {
      const feed = new LiveFeed();
      feed.addAction('p1' as PlayerId, { narrative: 'P1 action', effects: [], success: true } as any, 1);
      feed.addAction('p2' as PlayerId, { narrative: 'P2 action', effects: [], success: true } as any, 2);
      feed.addEvent(makeEvent({ description: 'Global event' })); // No player

      const p1Feed = feed.getForPlayer('p1' as PlayerId);
      // Should include p1's action + events without player (broadcast/events)
      expect(p1Feed.some(i => i.text === 'P1 action')).toBe(true);
      expect(p1Feed.some(i => i.text === 'Global event')).toBe(true);
      expect(p1Feed.some(i => i.text === 'P2 action')).toBe(false);
    });

    it('limits feed size', () => {
      const feed = new LiveFeed();
      for (let i = 0; i < 20; i++) {
        feed.addBroadcastText(`Message ${i}`, i);
      }
      const items = feed.getAll(5);
      expect(items).toHaveLength(5);
    });
  });

  // --- Directives ---
  describe('Directive System', () => {
    it('interprets cautious directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Be careful and avoid danger')).toBe('cautious');
    });

    it('interprets aggressive directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Attack everything in sight')).toBe('aggressive');
    });

    it('interprets explorer directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Go explore the northern territories')).toBe('explorer');
    });

    it('interprets social directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Find allies and trade partners')).toBe('social');
    });

    it('interprets fame seeker directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Become a legendary hero')).toBe('fame_seeker');
    });

    it('interprets survivalist directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Focus on finding food and shelter')).toBe('survivalist');
    });

    it('interprets scholar directive', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Study and learn everything you can')).toBe('scholar');
    });

    it('defaults to neutral for unknown instructions', () => {
      const q = new DirectiveQueue();
      expect(q.interpretStrategy('Do whatever you want')).toBe('neutral');
    });

    it('issues and replaces directives per player', () => {
      const q = new DirectiveQueue();
      const pid = 'p1' as PlayerId;

      q.issueDirective(pid, 'o1' as OwnerId, 'Be cautious', 100);
      expect(q.getDirective(pid)?.strategy).toBe('cautious');

      q.issueDirective(pid, 'o1' as OwnerId, 'Now explore everything', 200);
      expect(q.getDirective(pid)?.strategy).toBe('explorer');
      expect(q.getHistory(pid)).toHaveLength(1); // old one moved to history
    });

    it('returns modifiers for active directive', () => {
      const q = new DirectiveQueue();
      const pid = 'p1' as PlayerId;
      q.issueDirective(pid, 'o1' as OwnerId, 'Attack aggressively', 100);

      const mods = q.getModifiers(pid);
      expect(mods.combatBias).toBeGreaterThan(0);
      expect(mods.cautionBias).toBeLessThan(0);
    });

    it('returns neutral modifiers when no directive', () => {
      const q = new DirectiveQueue();
      const mods = q.getModifiers('nobody' as PlayerId);
      expect(mods.combatBias).toBe(0);
      expect(mods.explorationBias).toBe(0);
    });

    it('clears directives', () => {
      const q = new DirectiveQueue();
      const pid = 'p1' as PlayerId;
      q.issueDirective(pid, 'o1' as OwnerId, 'Explore', 100);
      q.clear(pid);
      expect(q.getDirective(pid)).toBeUndefined();
      expect(q.getHistory(pid)).toHaveLength(1);
    });

    it('expires timed directives', () => {
      const q = new DirectiveQueue();
      const pid = 'p1' as PlayerId;
      const d = q.issueDirective(pid, 'o1' as OwnerId, 'Be cautious', 100);
      d.expiresAt = 200;

      q.tick(150); // Not expired yet
      expect(q.getDirective(pid)).toBeDefined();

      q.tick(200); // Expired
      expect(q.getDirective(pid)).toBeUndefined();
    });
  });

  // --- Owner Dashboard ---
  describe('Owner Dashboard', () => {
    it('returns null for unknown owner', () => {
      expect(getOwnerDashboard('nonexistent' as OwnerId)).toBeNull();
    });

    it('builds dashboard for an owner', () => {
      const owner = playerManager.createOwner('TestOwner');
      const dashboard = getOwnerDashboard(owner.id);
      expect(dashboard).not.toBeNull();
      expect(dashboard!.displayName).toBe('TestOwner');
      expect(dashboard!.dynastyScore).toBeDefined();
      expect(dashboard!.cardSummary.total).toBe(0);
      expect(dashboard!.familyTrees).toHaveLength(0);
      expect(dashboard!.activeCharacters).toHaveLength(0);
    });

    it('includes active characters in dashboard', () => {
      const speciesId = getOrCreateSpecies('DashDog');
      const owner = playerManager.createOwner('CharOwner');
      const player = playerManager.createPlayer(owner.id);

      const char = createCharacter({
        speciesId,
        regionId: 'r1' as RegionId,
        familyTreeId: 'tree-1' as any,
        tick: 0,
      });
      characterRegistry.add(char);
      playerManager.assignCharacter(player.id, char.id as any, 'tree-1' as any);

      const dashboard = getOwnerDashboard(owner.id);
      expect(dashboard!.activeCharacters).toHaveLength(1);
      expect(dashboard!.activeCharacters[0].name).toBe(char.name);
    });
  });

  // --- Dynasty Score ---
  describe('Dynasty Score', () => {
    it('returns zero score for owner with nothing', () => {
      const owner = playerManager.createOwner('EmptyOwner');
      const score = calculateDynastyScore(owner.id);
      expect(score.total).toBe(0);
      expect(score.cardScore).toBe(0);
      expect(score.lineageScore).toBe(0);
    });

    it('scores cards by rarity', () => {
      const owner = playerManager.createOwner('CardOwner');
      // Add a mock legendary card
      cardCollection.addCard({
        id: crypto.randomUUID(),
        rarity: 'legendary',
        soulboundTo: owner.id,
        fameScore: 200,
      } as unknown as Card);

      const score = calculateDynastyScore(owner.id);
      expect(score.cardScore).toBe(30); // legendary = 30 points
      expect(score.fameScore).toBe(20); // 200 * 0.1 = 20
    });

    it('scores lineage depth and breadth', () => {
      const speciesId = getOrCreateSpecies('ScoreAnt');
      const owner = playerManager.createOwner('LineageOwner');
      const tree = lineageManager.createTree({
        speciesId,
        ownerId: owner.id,
        rootCharacterId: 'c-root' as any,
      });
      lineageManager.addMember(tree.id, 'c-child1' as any, 2);
      lineageManager.addMember(tree.id, 'c-child2' as any, 2);

      const score = calculateDynastyScore(owner.id);
      // generations=2 * 2 + members=3 = 7
      expect(score.lineageScore).toBe(7);
      // 1 unique species * 15 = 15
      expect(score.diversityScore).toBe(15);
    });

    it('updates dynasty score on owner record', () => {
      const owner = playerManager.createOwner('UpdateOwner');
      expect(owner.dynastyScore).toBe(0);
      updateDynastyScore(owner.id);
      // No cards/trees so still 0
      expect(owner.dynastyScore).toBe(0);
    });
  });

  // --- World Stats ---
  describe('World Stats', () => {
    it('returns world stats', () => {
      const stats = getWorldStats();
      expect(stats.totalSpecies).toBeGreaterThanOrEqual(0);
      expect(typeof stats.extantSpecies).toBe('number');
      expect(typeof stats.totalCards).toBe('number');
      expect(typeof stats.totalFamilyTrees).toBe('number');
    });

    it('returns species rankings', () => {
      const rankings = getSpeciesRankings();
      // Rankings should be sorted by population descending
      for (let i = 1; i < rankings.length; i++) {
        expect(rankings[i].population).toBeLessThanOrEqual(rankings[i - 1].population);
      }
    });
  });
});
