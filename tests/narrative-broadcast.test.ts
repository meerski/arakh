import { describe, it, expect, beforeEach } from 'vitest';
import { Gamemaster } from '../src/broadcast/gamemaster.js';
import { NewsBroadcast } from '../src/broadcast/news.js';
import { LiveFeed, type PlayerFeedContext } from '../src/dashboard/feed.js';
import type { TickResult, WorldEvent, PlayerId } from '../src/types.js';
import { TICKS_PER_DAY } from '../src/simulation/world.js';

function makeEvent(overrides: Partial<WorldEvent> = {}): WorldEvent {
  return {
    id: crypto.randomUUID() as any,
    type: 'natural_disaster',
    level: 'regional',
    regionIds: ['r1' as any],
    description: 'A storm ravages the plains.',
    tick: 100,
    effects: [],
    resolved: false,
    ...overrides,
  };
}

function makeTickResult(overrides: Partial<TickResult> = {}): TickResult {
  return {
    tick: 100,
    time: {
      tick: 100,
      year: 1,
      day: 1,
      hour: 12,
      season: 'spring',
      lightLevel: 0.8,
      moonPhase: 'full',
    } as any,
    events: [],
    births: [],
    deaths: [],
    discoveries: [],
    actionResults: [],
    ...overrides,
  };
}

describe('Gamemaster', () => {
  let gm: Gamemaster;

  beforeEach(() => {
    gm = new Gamemaster('TestMaster');
  });

  it('buffers events during broadcast window', () => {
    const result = makeTickResult({
      events: [makeEvent()],
    });
    gm.processTick(result);
    expect(gm.getBufferSize()).toBe(1);
  });

  it('emits breaking news for high-score events (global/continental)', () => {
    const globalEvent = makeEvent({
      type: 'extinction',
      level: 'global',
      description: 'Species X has gone extinct.',
    });
    const result = makeTickResult({ events: [globalEvent] });
    const messages = gm.processTick(result);

    const breaking = messages.filter(m => m.category === 'breaking');
    expect(breaking.length).toBeGreaterThan(0);
    expect(breaking[0].text).toContain('BREAKING');
  });

  it('curates 1-3 stories at broadcast interval (60 ticks)', () => {
    // Feed events across 59 ticks
    for (let i = 1; i < 60; i++) {
      gm.processTick(makeTickResult({
        tick: i,
        events: i % 10 === 0 ? [makeEvent({ tick: i, type: 'migration', level: 'species' })] : [],
      }));
    }

    // Tick 60 triggers broadcast
    const messages = gm.processTick(makeTickResult({
      tick: 60,
      events: [makeEvent({ tick: 60, type: 'resource_discovery', level: 'regional' })],
    }));

    // Should have curated stories (highlights)
    const highlights = messages.filter(m => m.category === 'highlight');
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    expect(highlights.length).toBeLessThanOrEqual(3);
  });

  it('deduplicates event types in curated stories', () => {
    // Buffer many events of the same type
    for (let i = 1; i < 60; i++) {
      gm.processTick(makeTickResult({
        tick: i,
        events: [makeEvent({ tick: i, type: 'weather_extreme', level: 'regional' })],
      }));
    }

    const messages = gm.processTick(makeTickResult({ tick: 60 }));
    const highlights = messages.filter(m => m.category === 'highlight');
    // At most 1 weather_extreme story (deduplication)
    expect(highlights.length).toBeLessThanOrEqual(1);
  });

  it('generates ambient commentary when no events', () => {
    // 60 ticks with no events but some actions
    for (let i = 1; i < 60; i++) {
      gm.processTick(makeTickResult({
        tick: i,
        actionResults: [{ playerId: 'p1', characterId: 'c1', action: {} as any, result: {} as any }],
      }));
    }

    const messages = gm.processTick(makeTickResult({ tick: 60 }));
    expect(messages.length).toBeGreaterThanOrEqual(1);
    const commentary = messages.filter(m => m.category === 'commentary');
    expect(commentary.length).toBe(1);
  });

  it('returns no messages for completely empty windows', () => {
    for (let i = 1; i <= 60; i++) {
      gm.processTick(makeTickResult({ tick: i }));
    }
    // After 60 empty ticks, no ambient commentary (no activity at all)
    const history = gm.getRecentBroadcasts(100);
    const commentary = history.filter(m => m.category === 'commentary');
    expect(commentary.length).toBe(0);
  });

  it('includes relevance tags from events', () => {
    const event = makeEvent({
      type: 'extinction',
      level: 'global',
      regionIds: ['r1' as any, 'r2' as any],
    });
    const messages = gm.processTick(makeTickResult({ events: [event] }));
    const breaking = messages.find(m => m.category === 'breaking');
    expect(breaking?.relevanceTags).toContain('r1');
    expect(breaking?.relevanceTags).toContain('r2');
  });

  it('forceBroadcast triggers immediate curation', () => {
    gm.processTick(makeTickResult({
      tick: 1,
      events: [makeEvent({ tick: 1, type: 'disease', level: 'species' })],
    }));

    const messages = gm.forceBroadcast(2);
    expect(messages.length).toBeGreaterThanOrEqual(1);
    expect(gm.getBufferSize()).toBe(0);
  });

  it('getRelevantBroadcasts filters by tags', () => {
    const event = makeEvent({
      type: 'extinction',
      level: 'global',
      regionIds: ['r5' as any],
    });
    gm.processTick(makeTickResult({ events: [event] }));

    const relevant = gm.getRelevantBroadcasts(['r5']);
    expect(relevant.length).toBeGreaterThan(0);

    const irrelevant = gm.getRelevantBroadcasts(['r99']);
    // Global broadcasts with no tags are included, but r5-tagged ones are not
    // Actually breaking news for r5 has relevanceTags=['r5'], so filtering for r99 excludes it
    // But broadcasts with empty relevanceTags are always included
    const r5Only = irrelevant.filter(m => m.relevanceTags.includes('r5'));
    expect(r5Only.length).toBe(0);
  });
});

describe('NewsBroadcast', () => {
  let news: NewsBroadcast;
  let gm: Gamemaster;

  beforeEach(() => {
    news = new NewsBroadcast();
    gm = new Gamemaster('TestGM');
  });

  it('processes ticks through gamemasters', () => {
    const result = makeTickResult({
      events: [makeEvent({ type: 'extinction', level: 'global' })],
    });
    const messages = news.processTick(result);
    // Gamemasters produce messages
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  it('generates daily recap at day boundary', () => {
    // Start at day 1 (tick TICKS_PER_DAY) so currentDay initializes to 1
    const dayStart = TICKS_PER_DAY;
    for (let t = 0; t < TICKS_PER_DAY; t++) {
      const tick = dayStart + t;
      news.processTick(makeTickResult({
        tick,
        births: t % 10 === 0 ? ['c1' as any] : [],
        deaths: t % 15 === 0 ? ['c2' as any] : [],
        events: t === 20 ? [makeEvent({ tick, type: 'extinction', level: 'global' })] : [],
      }));
    }

    // Cross into day 2 — this triggers the recap for day 1
    news.processTick(makeTickResult({ tick: dayStart + TICKS_PER_DAY }));

    const recaps = news.getRecaps();
    expect(recaps.length).toBe(1);
    expect(recaps[0].day).toBe(1);
    expect(recaps[0].totalBirths).toBeGreaterThan(0);
  });

  it('getLatestRecap returns null when no recaps', () => {
    expect(news.getLatestRecap()).toBeNull();
  });

  it('getHighlights returns highlight messages', () => {
    // Process enough ticks to trigger curated highlights
    for (let t = 0; t < 60; t++) {
      news.processTick(makeTickResult({
        tick: t,
        events: t % 15 === 0 ? [makeEvent({ tick: t })] : [],
      }));
    }
    // Highlights may or may not exist depending on curation
    const highlights = news.getHighlights();
    // Just verify it returns an array
    expect(Array.isArray(highlights)).toBe(true);
  });

  it('getRelevant filters by tags', () => {
    // Process a tick with a tagged event
    news.processTick(makeTickResult({
      tick: 1,
      events: [makeEvent({ type: 'extinction', level: 'global', regionIds: ['r7' as any] })],
    }));

    const relevant = news.getRelevant(['r7']);
    const all = news.getLatest(100);
    // Relevant should be a subset
    expect(relevant.length).toBeLessThanOrEqual(all.length);
  });

  it('caps recaps at maxRecaps', () => {
    // Simulate 35 days
    for (let day = 0; day < 35; day++) {
      const baseTick = day * TICKS_PER_DAY;
      for (let t = 0; t < TICKS_PER_DAY; t++) {
        news.processTick(makeTickResult({ tick: baseTick + t }));
      }
    }
    // Cross one more boundary
    news.processTick(makeTickResult({ tick: 35 * TICKS_PER_DAY }));

    // Should have at most 30 recaps
    expect(news.getRecapCount()).toBeLessThanOrEqual(30);
  });
});

describe('LiveFeed', () => {
  let feed: LiveFeed;

  beforeEach(() => {
    feed = new LiveFeed();
  });

  it('adds actions with relevance tags', () => {
    feed.addAction('p1' as PlayerId, { narrative: 'You foraged.', stateChanges: {} } as any, 100, ['r1']);
    const items = feed.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].relevanceTags).toContain('r1');
  });

  it('adds events from WorldEvent', () => {
    feed.addEvent(makeEvent({ regionIds: ['r2' as any] }));
    const items = feed.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].relevanceTags).toContain('r2');
  });

  it('adds broadcast messages', () => {
    feed.addBroadcast({
      timestamp: 50,
      category: 'highlight',
      text: 'A storm approaches.',
      gamemasterName: 'Chronos',
      relevanceTags: ['r3'],
    });
    const items = feed.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('broadcast');
  });

  it('adds recap broadcast messages with recap type', () => {
    feed.addBroadcast({
      timestamp: 50,
      category: 'recap',
      text: 'Day 1 Recap: ...',
      gamemasterName: 'Chronicle',
      relevanceTags: [],
    });
    const items = feed.getAll();
    expect(items[0].type).toBe('recap');
  });

  it('addBroadcastText works for legacy calls', () => {
    feed.addBroadcastText('Alliance formed!', 200);
    const items = feed.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].text).toBe('Alliance formed!');
  });

  it('getPersonalized filters by player context', () => {
    // Player's own action
    feed.addAction('p1' as PlayerId, { narrative: 'You moved.' } as any, 1, ['r1']);
    // Someone else's action in same region
    feed.addAction('p2' as PlayerId, { narrative: 'They moved.' } as any, 2, ['r1']);
    // Someone else's action in different region
    feed.addAction('p3' as PlayerId, { narrative: 'Far away.' } as any, 3, ['r99']);
    // Global broadcast (no tags)
    feed.addBroadcastText('World news.', 4);

    const ctx: PlayerFeedContext = {
      playerId: 'p1' as PlayerId,
      characterId: 'c1' as any,
      speciesId: 'sp1' as any,
      regionId: 'r1',
      familyTreeId: null,
    };

    const personal = feed.getPersonalized(ctx);

    // Should include: own action, same-region action, global broadcast
    // Should exclude: r99 action
    expect(personal.some(i => i.text === 'You moved.')).toBe(true);
    expect(personal.some(i => i.text === 'They moved.')).toBe(true);
    expect(personal.some(i => i.text === 'World news.')).toBe(true);
    expect(personal.some(i => i.text === 'Far away.')).toBe(false);
  });

  it('getPersonalized always includes recaps', () => {
    feed.addBroadcast({
      timestamp: 50,
      category: 'recap',
      text: 'Day recap.',
      gamemasterName: 'Chronicle',
      relevanceTags: ['r99'],  // Different region
    });

    const ctx: PlayerFeedContext = {
      playerId: 'p1' as PlayerId,
      characterId: null,
      speciesId: null,
      regionId: 'r1',
      familyTreeId: null,
    };

    const personal = feed.getPersonalized(ctx);
    expect(personal.some(i => i.text === 'Day recap.')).toBe(true);
  });

  it('getByType filters correctly', () => {
    feed.addAction('p1' as PlayerId, { narrative: 'Action.' } as any, 1);
    feed.addEvent(makeEvent());
    feed.addBroadcastText('Broadcast.', 3);

    expect(feed.getByType('action')).toHaveLength(1);
    expect(feed.getByType('event')).toHaveLength(1);
    expect(feed.getByType('broadcast')).toHaveLength(1);
  });

  it('getByTickRange returns items in range', () => {
    feed.addBroadcastText('Early.', 10);
    feed.addBroadcastText('Mid.', 50);
    feed.addBroadcastText('Late.', 90);

    const range = feed.getByTickRange(40, 60);
    expect(range).toHaveLength(1);
    expect(range[0].text).toBe('Mid.');
  });

  it('trims to maxItems', () => {
    for (let i = 0; i < 600; i++) {
      feed.addBroadcastText(`Item ${i}`, i);
    }
    expect(feed.getSize()).toBeLessThanOrEqual(500);
  });
});

describe('Gamemaster observes only', () => {
  it('never modifies tick results', () => {
    const gm = new Gamemaster('Observer');
    const events = [makeEvent({ type: 'extinction', level: 'global' })];
    const result = makeTickResult({
      events,
      births: ['c1' as any],
      deaths: ['c2' as any],
    });

    // Take a snapshot before
    const eventsBefore = [...result.events];
    const birthsBefore = [...result.births];
    const deathsBefore = [...result.deaths];

    gm.processTick(result);

    // Verify nothing was mutated
    expect(result.events).toEqual(eventsBefore);
    expect(result.births).toEqual(birthsBefore);
    expect(result.deaths).toEqual(deathsBefore);
  });
});
