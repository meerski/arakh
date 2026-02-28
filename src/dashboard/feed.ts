// ============================================================
// Live Feed — Real-time stream of agent actions
// ============================================================

import type { PlayerId, WorldEvent, ActionResult } from '../types.js';

export interface FeedItem {
  timestamp: number;
  type: 'action' | 'event' | 'broadcast';
  text: string;
  playerId?: PlayerId;
}

export class LiveFeed {
  private items: FeedItem[] = [];
  private maxItems = 500;

  addAction(playerId: PlayerId, result: ActionResult, tick: number): void {
    this.items.push({
      timestamp: tick,
      type: 'action',
      text: result.narrative,
      playerId,
    });
    this.trim();
  }

  addEvent(event: WorldEvent): void {
    this.items.push({
      timestamp: event.tick,
      type: 'event',
      text: event.description,
    });
    this.trim();
  }

  addBroadcast(text: string, tick: number): void {
    this.items.push({
      timestamp: tick,
      type: 'broadcast',
      text,
    });
    this.trim();
  }

  getForPlayer(playerId: PlayerId, limit: number = 50): FeedItem[] {
    return this.items
      .filter(i => !i.playerId || i.playerId === playerId)
      .slice(-limit);
  }

  getAll(limit: number = 50): FeedItem[] {
    return this.items.slice(-limit);
  }

  private trim(): void {
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(-this.maxItems);
    }
  }
}

export const liveFeed = new LiveFeed();
