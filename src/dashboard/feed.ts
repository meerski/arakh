// ============================================================
// Live Feed — Personalized real-time stream per player
// ============================================================

import type { PlayerId, WorldEvent, ActionResult, CharacterId, SpeciesId } from '../types.js';
import type { BroadcastMessage } from '../broadcast/gamemaster.js';

export interface FeedItem {
  timestamp: number;
  type: 'action' | 'event' | 'broadcast' | 'recap';
  text: string;
  playerId?: PlayerId;
  /** Tags for relevance filtering (region IDs, species IDs, character IDs). */
  relevanceTags: string[];
}

/** Player context used for personalized feed filtering. */
export interface PlayerFeedContext {
  playerId: PlayerId;
  characterId: CharacterId | null;
  speciesId: SpeciesId | null;
  regionId: string | null;
  familyTreeId: string | null;
}

export class LiveFeed {
  private items: FeedItem[] = [];
  private maxItems = 500;

  addAction(playerId: PlayerId, result: ActionResult, tick: number, tags: string[] = []): void {
    this.items.push({
      timestamp: tick,
      type: 'action',
      text: result.narrative,
      playerId,
      relevanceTags: tags,
    });
    this.trim();
  }

  addEvent(event: WorldEvent): void {
    this.items.push({
      timestamp: event.tick,
      type: 'event',
      text: event.description,
      relevanceTags: [...event.regionIds],
    });
    this.trim();
  }

  addBroadcast(message: BroadcastMessage): void {
    this.items.push({
      timestamp: message.timestamp,
      type: message.category === 'recap' ? 'recap' : 'broadcast',
      text: message.text,
      relevanceTags: [...message.relevanceTags],
    });
    this.trim();
  }

  /** Legacy overload: add broadcast from plain text. */
  addBroadcastText(text: string, tick: number): void {
    this.items.push({
      timestamp: tick,
      type: 'broadcast',
      text,
      relevanceTags: [],
    });
    this.trim();
  }

  /**
   * Get a personalized feed for a player.
   * Includes: their own actions, events in their region/species, and global broadcasts.
   */
  getPersonalized(ctx: PlayerFeedContext, limit: number = 50): FeedItem[] {
    const tags = new Set<string>();
    if (ctx.regionId) tags.add(ctx.regionId);
    if (ctx.speciesId) tags.add(ctx.speciesId);
    if (ctx.characterId) tags.add(ctx.characterId);
    if (ctx.familyTreeId) tags.add(ctx.familyTreeId);

    return this.items
      .filter(item => {
        // Always include the player's own actions
        if (item.playerId === ctx.playerId) return true;
        // Always include global broadcasts (no relevance tags = global)
        if (item.relevanceTags.length === 0) return true;
        // Include items tagged with player's context (region, species, etc.)
        if (item.relevanceTags.some(t => tags.has(t))) return true;
        // Include recaps
        if (item.type === 'recap') return true;
        return false;
      })
      .slice(-limit);
  }

  /** Get items for a specific player (own actions + public items). */
  getForPlayer(playerId: PlayerId, limit: number = 50): FeedItem[] {
    return this.items
      .filter(i => !i.playerId || i.playerId === playerId)
      .slice(-limit);
  }

  /** Get all items (admin/dashboard view). */
  getAll(limit: number = 50): FeedItem[] {
    return this.items.slice(-limit);
  }

  /** Get only events of a specific type. */
  getByType(type: FeedItem['type'], limit: number = 50): FeedItem[] {
    return this.items.filter(i => i.type === type).slice(-limit);
  }

  /** Get items within a tick range. */
  getByTickRange(startTick: number, endTick: number): FeedItem[] {
    return this.items.filter(i => i.timestamp >= startTick && i.timestamp <= endTick);
  }

  getSize(): number {
    return this.items.length;
  }

  private trim(): void {
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(-this.maxItems);
    }
  }

  clear(): void {
    this.items = [];
  }
}

export let liveFeed = new LiveFeed();

export function _installLiveFeed(instance: LiveFeed): void { liveFeed = instance; }
