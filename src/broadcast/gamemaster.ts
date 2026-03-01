// ============================================================
// Gamemaster — Immortal AI Observer Entities
// ============================================================
// Gamemasters observe the world and curate 1-3 stories per
// broadcast window (60 ticks). They NEVER modify world state.

import type { WorldEvent, TickResult, PlayerId, CharacterId, SpeciesId } from '../types.js';
import { narrateEvent } from '../narrative/narrator.js';

export interface BroadcastMessage {
  timestamp: number;
  category: 'breaking' | 'highlight' | 'commentary' | 'era_change' | 'recap';
  text: string;
  gamemasterName: string;
  /** Relevance tags for personalization (species IDs, region IDs, character IDs) */
  relevanceTags: string[];
}

/** An event with a computed story score for curation. */
interface ScoredEvent {
  event: WorldEvent;
  score: number;
}

/** Accumulated stats for recap generation. */
interface WindowStats {
  totalBirths: number;
  totalDeaths: number;
  totalDiscoveries: number;
  totalActions: number;
  eventCounts: Map<string, number>;  // event type → count
  regionActivity: Map<string, number>; // regionId → event count
  speciesMentions: Map<string, number>; // speciesId → mention count
}

function emptyWindowStats(): WindowStats {
  return {
    totalBirths: 0,
    totalDeaths: 0,
    totalDiscoveries: 0,
    totalActions: 0,
    eventCounts: new Map(),
    regionActivity: new Map(),
    speciesMentions: new Map(),
  };
}

/** Event significance weights for story scoring. */
const EVENT_SCORE: Record<string, number> = {
  // Global-scale
  extinction: 100,
  tesla_moment: 90,
  era_change: 85,
  meteor: 80,
  // Continental
  catastrophe: 70,
  first_contact: 65,
  betrayal: 60,
  speciation: 55,
  // Regional
  natural_disaster: 40,
  migration: 35,
  espionage: 30,
  resource_discovery: 25,
  weather_extreme: 20,
  disease: 20,
  // Local
  resource_depletion: 10,
  eclipse: 8,
};

const LEVEL_MULTIPLIER: Record<string, number> = {
  global: 3.0,
  continental: 2.0,
  regional: 1.5,
  cross_species: 1.3,
  species: 1.0,
  community: 0.8,
  family: 0.5,
  personal: 0.3,
};

export class Gamemaster {
  private name: string;
  private broadcastHistory: BroadcastMessage[] = [];
  private maxHistory = 500;

  // Event buffer for the current broadcast window
  private eventBuffer: ScoredEvent[] = [];
  private windowStats: WindowStats = emptyWindowStats();
  private ticksSinceLastBroadcast = 0;
  private broadcastInterval = 60;

  // Track recently told stories to avoid repetition
  private recentStoryTypes = new Set<string>();

  constructor(name: string) {
    this.name = name;
  }

  /** Process a tick's results. Observe only — never modify. */
  processTick(result: TickResult): BroadcastMessage[] {
    const messages: BroadcastMessage[] = [];
    this.ticksSinceLastBroadcast++;

    // Accumulate stats for recap
    this.windowStats.totalBirths += result.births.length;
    this.windowStats.totalDeaths += result.deaths.length;
    this.windowStats.totalDiscoveries += result.discoveries.length;
    this.windowStats.totalActions += result.actionResults.length;

    // Score and buffer events
    for (const event of result.events) {
      const score = this.scoreEvent(event);
      this.eventBuffer.push({ event, score });

      // Track event type counts
      const count = this.windowStats.eventCounts.get(event.type) ?? 0;
      this.windowStats.eventCounts.set(event.type, count + 1);

      // Track region activity
      for (const regionId of event.regionIds) {
        const rCount = this.windowStats.regionActivity.get(regionId) ?? 0;
        this.windowStats.regionActivity.set(regionId, rCount + 1);
      }

      // Immediate breaking news for truly global events
      if (score >= 80) {
        messages.push(this.createMessage(result.tick, 'breaking', event));
      }
    }

    // Curate stories at broadcast interval
    if (this.ticksSinceLastBroadcast >= this.broadcastInterval) {
      const curated = this.curateStories(result.tick);
      messages.push(...curated);

      // Reset window
      this.ticksSinceLastBroadcast = 0;
      this.eventBuffer = [];
      this.windowStats = emptyWindowStats();
      this.recentStoryTypes.clear();
    }

    // Store in history
    this.broadcastHistory.push(...messages);
    if (this.broadcastHistory.length > this.maxHistory) {
      this.broadcastHistory = this.broadcastHistory.slice(-this.maxHistory);
    }

    return messages;
  }

  /** Curate 1-3 stories from the event buffer. */
  private curateStories(tick: number): BroadcastMessage[] {
    const stories: BroadcastMessage[] = [];

    if (this.eventBuffer.length === 0) {
      // No events — generate window commentary if there's notable activity, else ambient
      const commentary = this.generateWindowCommentary(tick);
      if (commentary) {
        stories.push(commentary);
      } else {
        const ambient = this.generateAmbientCommentary(tick);
        if (ambient) stories.push(ambient);
      }
      return stories;
    }

    // Sort events by score, pick top 1-3 diverse stories
    const sorted = [...this.eventBuffer].sort((a, b) => b.score - a.score);

    // Deduplicate: don't pick two events of the same type
    const picked: ScoredEvent[] = [];
    const usedTypes = new Set<string>();

    for (const entry of sorted) {
      if (picked.length >= 3) break;
      if (usedTypes.has(entry.event.type)) continue;
      // Skip events already broadcast as breaking
      if (entry.score >= 80) continue;

      usedTypes.add(entry.event.type);
      picked.push(entry);
    }

    // Generate highlight messages for curated events
    for (const entry of picked) {
      stories.push(this.createMessage(tick, 'highlight', entry.event));
    }

    // If we had events but picked none (all were breaking), add a commentary
    if (stories.length === 0) {
      const commentary = this.generateWindowCommentary(tick);
      if (commentary) stories.push(commentary);
    }

    return stories;
  }

  /** Score an event for story worthiness. */
  private scoreEvent(event: WorldEvent): number {
    const baseScore = EVENT_SCORE[event.type] ?? 5;
    const levelMult = LEVEL_MULTIPLIER[event.level] ?? 1.0;

    // Freshness bonus: penalize event types we've recently covered
    const freshness = this.recentStoryTypes.has(event.type) ? 0.5 : 1.0;

    return baseScore * levelMult * freshness;
  }

  /** Create a broadcast message for an event. */
  private createMessage(
    tick: number,
    category: BroadcastMessage['category'],
    event: WorldEvent,
  ): BroadcastMessage {
    const prefix = category === 'breaking' ? 'BREAKING: ' : '';
    return {
      timestamp: tick,
      category,
      text: `[${this.name}] ${prefix}${narrateEvent(event)}`,
      gamemasterName: this.name,
      relevanceTags: [...event.regionIds],
    };
  }

  /** Generate commentary summarizing the broadcast window. */
  private generateWindowCommentary(tick: number): BroadcastMessage | null {
    const s = this.windowStats;
    const parts: string[] = [];

    if (s.totalDeaths > 5) {
      parts.push(`A difficult period. ${s.totalDeaths} souls lost this cycle.`);
    }
    if (s.totalBirths > 3) {
      parts.push(`${s.totalBirths} new lives emerged.`);
    }
    if (s.totalDiscoveries > 0) {
      parts.push(`${s.totalDiscoveries} discoveries reshape understanding.`);
    }

    if (parts.length === 0) return null;

    return {
      timestamp: tick,
      category: 'commentary',
      text: `[${this.name}] ${parts.join(' ')}`,
      gamemasterName: this.name,
      relevanceTags: [],
    };
  }

  /** Ambient commentary when nothing notable happened. */
  private generateAmbientCommentary(tick: number): BroadcastMessage | null {
    // Only comment if window stats show some activity
    const s = this.windowStats;
    if (s.totalBirths === 0 && s.totalDeaths === 0 && s.totalActions === 0) {
      return null;
    }

    const lines = [
      `The world turns quietly. ${s.totalActions} actions taken in silence.`,
      `A calm stretch. Life persists without spectacle.`,
      `No great events, but the small struggles of survival continue.`,
    ];

    // Simple deterministic pick based on tick
    const text = lines[tick % lines.length];

    return {
      timestamp: tick,
      category: 'commentary',
      text: `[${this.name}] ${text}`,
      gamemasterName: this.name,
      relevanceTags: [],
    };
  }

  /** Get recent broadcasts, optionally filtered by category. */
  getRecentBroadcasts(limit: number = 10, category?: BroadcastMessage['category']): BroadcastMessage[] {
    const filtered = category
      ? this.broadcastHistory.filter(m => m.category === category)
      : this.broadcastHistory;
    return filtered.slice(-limit);
  }

  /** Get broadcasts relevant to specific tags (regions, species). */
  getRelevantBroadcasts(tags: string[], limit: number = 10): BroadcastMessage[] {
    const tagSet = new Set(tags);
    return this.broadcastHistory
      .filter(m => m.relevanceTags.some(t => tagSet.has(t)) || m.relevanceTags.length === 0)
      .slice(-limit);
  }

  getName(): string {
    return this.name;
  }

  /** Get buffered event count (for testing). */
  getBufferSize(): number {
    return this.eventBuffer.length;
  }

  /** Get broadcast history size. */
  getHistorySize(): number {
    return this.broadcastHistory.length;
  }

  /** Force a broadcast cycle (for testing). */
  forceBroadcast(tick: number): BroadcastMessage[] {
    const curated = this.curateStories(tick);
    this.broadcastHistory.push(...curated);
    this.ticksSinceLastBroadcast = 0;
    this.eventBuffer = [];
    this.windowStats = emptyWindowStats();
    this.recentStoryTypes.clear();
    return curated;
  }

  clear(): void {
    this.broadcastHistory = [];
    this.eventBuffer = [];
    this.windowStats = emptyWindowStats();
    this.ticksSinceLastBroadcast = 0;
    this.recentStoryTypes.clear();
  }
}

// Create default gamemasters
export let gamemasters: Gamemaster[] = [
  new Gamemaster('Chronos'),
  new Gamemaster('Gaia'),
];

export function _installGamemasters(instance: Gamemaster[]): void { gamemasters = instance; }
