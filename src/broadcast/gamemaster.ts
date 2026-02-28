// ============================================================
// Gamemaster — Immortal AI Observer Entities
// ============================================================

import type { WorldEvent, TickResult } from '../types.js';
import { worldChronicle } from '../narrative/history.js';
import { narrateEvent } from '../narrative/narrator.js';

export interface BroadcastMessage {
  timestamp: number;
  category: 'breaking' | 'highlight' | 'commentary' | 'era_change';
  text: string;
}

export class Gamemaster {
  private name: string;
  private broadcastQueue: BroadcastMessage[] = [];
  private ticksSinceLastBroadcast = 0;
  private broadcastInterval = 60; // Broadcast every 60 ticks (~1 minute)

  constructor(name: string) {
    this.name = name;
  }

  /** Process a tick and decide if anything is broadcast-worthy */
  processTick(result: TickResult): BroadcastMessage[] {
    const messages: BroadcastMessage[] = [];
    this.ticksSinceLastBroadcast++;

    // Breaking news for significant events
    for (const event of result.events) {
      if (this.isBreakingNews(event)) {
        messages.push({
          timestamp: result.tick,
          category: 'breaking',
          text: `[${this.name}] BREAKING: ${narrateEvent(event)}`,
        });
      }
    }

    // Periodic commentary
    if (this.ticksSinceLastBroadcast >= this.broadcastInterval) {
      this.ticksSinceLastBroadcast = 0;
      const commentary = this.generateCommentary(result);
      if (commentary) {
        messages.push({
          timestamp: result.tick,
          category: 'commentary',
          text: `[${this.name}] ${commentary}`,
        });
      }
    }

    this.broadcastQueue.push(...messages);
    return messages;
  }

  private isBreakingNews(event: WorldEvent): boolean {
    return event.level === 'continental' || event.level === 'global'
      || event.type === 'tesla_moment' || event.type === 'extinction'
      || event.type === 'first_contact';
  }

  private generateCommentary(result: TickResult): string | null {
    if (result.deaths.length > 5) {
      return `A difficult period. ${result.deaths.length} souls lost this cycle.`;
    }
    if (result.births.length > 3) {
      return `Life flourishes. ${result.births.length} new lives begin.`;
    }
    if (result.discoveries.length > 0) {
      return `Progress stirs. New discoveries reshape the world.`;
    }
    return null;
  }

  getRecentBroadcasts(limit: number = 10): BroadcastMessage[] {
    return this.broadcastQueue.slice(-limit);
  }

  getName(): string {
    return this.name;
  }
}

// Create default gamemasters
export const gamemasters = [
  new Gamemaster('Chronos'),
  new Gamemaster('Gaia'),
];
