// ============================================================
// 24/7 News Broadcast — Aggregation & Daily Recaps
// ============================================================

import type { TickResult } from '../types.js';
import { gamemasters, type BroadcastMessage } from './gamemaster.js';
import { TICKS_PER_DAY } from '../simulation/world.js';

/** Daily recap summarizing a full in-game day. */
export interface DailyRecap {
  day: number;
  startTick: number;
  endTick: number;
  breakingCount: number;
  highlightCount: number;
  totalBirths: number;
  totalDeaths: number;
  totalDiscoveries: number;
  topStories: BroadcastMessage[];
  summary: string;
}

export class NewsBroadcast {
  private feed: BroadcastMessage[] = [];
  private maxFeedSize = 1000;

  // Daily recap tracking
  private dayStartTick = 0;
  private currentDay = 0;
  private dayMessages: BroadcastMessage[] = [];
  private dayBirths = 0;
  private dayDeaths = 0;
  private dayDiscoveries = 0;
  private recaps: DailyRecap[] = [];
  private maxRecaps = 30; // Keep last 30 days

  /** Process a tick through all gamemasters, deduplicating breaking news. */
  processTick(result: TickResult): BroadcastMessage[] {
    const allMessages: BroadcastMessage[] = [];

    // Track which events have already been broadcast to avoid cross-GM duplicates
    const seenCoreTexts = new Set<string>();

    for (const gm of gamemasters) {
      const messages = gm.processTick(result);
      for (const msg of messages) {
        if (msg.category === 'breaking' || msg.category === 'highlight') {
          // Strip gamemaster prefix to get the core event text for dedup
          const coreText = msg.text.replace(/^\[.*?\]\s*/, '');
          if (seenCoreTexts.has(coreText)) continue; // Skip duplicate from other GM
          seenCoreTexts.add(coreText);
        }
        allMessages.push(msg);
      }
    }

    this.feed.push(...allMessages);
    this.dayMessages.push(...allMessages);

    // Accumulate daily stats
    this.dayBirths += result.births.length;
    this.dayDeaths += result.deaths.length;
    this.dayDiscoveries += result.discoveries.length;

    // Check for day boundary
    const dayNumber = Math.floor(result.tick / TICKS_PER_DAY);
    if (dayNumber > this.currentDay && this.currentDay > 0) {
      this.finalizeDailyRecap(result.tick);
      this.currentDay = dayNumber;
    } else if (this.currentDay === 0) {
      this.currentDay = dayNumber;
      this.dayStartTick = dayNumber * TICKS_PER_DAY;
    }

    // Trim feed
    if (this.feed.length > this.maxFeedSize) {
      this.feed = this.feed.slice(-this.maxFeedSize);
    }

    return allMessages;
  }

  /** Finalize the daily recap when a new day begins. */
  private finalizeDailyRecap(currentTick: number): void {
    // Pick top stories: breaking first, then highlights, sorted by timestamp desc
    const breaking = this.dayMessages.filter(m => m.category === 'breaking');
    const highlights = this.dayMessages.filter(m => m.category === 'highlight');
    const topStories = [...breaking, ...highlights].slice(0, 5);

    const summary = this.generateRecapSummary(topStories);

    const recap: DailyRecap = {
      day: this.currentDay,
      startTick: this.dayStartTick,
      endTick: currentTick - 1,
      breakingCount: breaking.length,
      highlightCount: highlights.length,
      totalBirths: this.dayBirths,
      totalDeaths: this.dayDeaths,
      totalDiscoveries: this.dayDiscoveries,
      topStories,
      summary,
    };

    this.recaps.push(recap);
    if (this.recaps.length > this.maxRecaps) {
      this.recaps = this.recaps.slice(-this.maxRecaps);
    }

    // Inject recap message into feed
    const recapMessage: BroadcastMessage = {
      timestamp: currentTick,
      category: 'recap',
      text: summary,
      gamemasterName: 'Chronicle',
      relevanceTags: [],
    };
    this.feed.push(recapMessage);

    // Reset daily accumulators
    this.dayMessages = [];
    this.dayBirths = 0;
    this.dayDeaths = 0;
    this.dayDiscoveries = 0;
    this.dayStartTick = currentTick;
  }

  /** Generate a human-readable recap summary. */
  private generateRecapSummary(topStories: BroadcastMessage[]): string {
    const parts: string[] = [`Day ${this.currentDay} Recap:`];

    if (this.dayBirths > 0 || this.dayDeaths > 0) {
      parts.push(`${this.dayBirths} born, ${this.dayDeaths} perished.`);
    }

    if (this.dayDiscoveries > 0) {
      parts.push(`${this.dayDiscoveries} discoveries made.`);
    }

    if (topStories.length > 0) {
      // Extract just the narrative text (strip gamemaster prefix)
      const headlines = topStories.slice(0, 3).map(s => {
        const cleaned = s.text.replace(/^\[.*?\]\s*(BREAKING:\s*)?/, '');
        return cleaned;
      });
      parts.push('Headlines: ' + headlines.join(' | '));
    } else {
      parts.push('A quiet day in the world.');
    }

    return parts.join(' ');
  }

  /** Get the latest news items. */
  getLatest(limit: number = 20): BroadcastMessage[] {
    return this.feed.slice(-limit);
  }

  /** Get breaking news only. */
  getBreaking(limit: number = 5): BroadcastMessage[] {
    return this.feed
      .filter(m => m.category === 'breaking')
      .slice(-limit);
  }

  /** Get highlight stories. */
  getHighlights(limit: number = 10): BroadcastMessage[] {
    return this.feed
      .filter(m => m.category === 'highlight')
      .slice(-limit);
  }

  /** Get daily recaps. */
  getRecaps(limit: number = 7): DailyRecap[] {
    return this.recaps.slice(-limit);
  }

  /** Get the latest daily recap, or null if none yet. */
  getLatestRecap(): DailyRecap | null {
    return this.recaps.length > 0 ? this.recaps[this.recaps.length - 1] : null;
  }

  /** Get messages relevant to specific tags. */
  getRelevant(tags: string[], limit: number = 20): BroadcastMessage[] {
    const tagSet = new Set(tags);
    return this.feed
      .filter(m => m.relevanceTags.length === 0 || m.relevanceTags.some(t => tagSet.has(t)))
      .slice(-limit);
  }

  getFeedSize(): number {
    return this.feed.length;
  }

  getRecapCount(): number {
    return this.recaps.length;
  }

  clear(): void {
    this.feed = [];
    this.dayMessages = [];
    this.recaps = [];
    this.dayBirths = 0;
    this.dayDeaths = 0;
    this.dayDiscoveries = 0;
    this.currentDay = 0;
    this.dayStartTick = 0;
  }
}

export let newsBroadcast = new NewsBroadcast();

export function _installNewsBroadcast(instance: NewsBroadcast): void { newsBroadcast = instance; }
