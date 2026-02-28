// ============================================================
// 24/7 News Broadcast
// ============================================================

import type { TickResult } from '../types.js';
import { gamemasters, type BroadcastMessage } from './gamemaster.js';

export class NewsBroadcast {
  private feed: BroadcastMessage[] = [];
  private maxFeedSize = 1000;

  /** Process a tick through all gamemasters */
  processTick(result: TickResult): BroadcastMessage[] {
    const allMessages: BroadcastMessage[] = [];

    for (const gm of gamemasters) {
      const messages = gm.processTick(result);
      allMessages.push(...messages);
    }

    this.feed.push(...allMessages);

    // Trim feed
    if (this.feed.length > this.maxFeedSize) {
      this.feed = this.feed.slice(-this.maxFeedSize);
    }

    return allMessages;
  }

  /** Get the latest news items */
  getLatest(limit: number = 20): BroadcastMessage[] {
    return this.feed.slice(-limit);
  }

  /** Get breaking news only */
  getBreaking(limit: number = 5): BroadcastMessage[] {
    return this.feed
      .filter(m => m.category === 'breaking')
      .slice(-limit);
  }

  getFeedSize(): number {
    return this.feed.length;
  }
}

export const newsBroadcast = new NewsBroadcast();
