// ============================================================
// Audit Log — All Actions Logged for Security Analysis
// ============================================================
// In-memory ring buffer with optional PostgreSQL persistence.
// Logs every action attempt (valid or rejected) for analysis.

import type { AgentAction, PlayerId, CharacterId, ActionResult } from '../types.js';

export interface AuditEntry {
  tick: number;
  timestamp: number;
  playerId: PlayerId;
  characterId: CharacterId;
  action: AgentAction;
  valid: boolean;
  rejectionReason?: string;
  resultSuccess?: boolean;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 10000) {
    this.maxEntries = maxEntries;
  }

  /** Log an action attempt. */
  log(entry: AuditEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /** Get recent entries for a player. */
  getByPlayer(playerId: PlayerId, limit = 50): AuditEntry[] {
    return this.entries
      .filter(e => e.playerId === playerId)
      .slice(-limit);
  }

  /** Get entries in a tick range. */
  getByTickRange(startTick: number, endTick: number): AuditEntry[] {
    return this.entries.filter(e => e.tick >= startTick && e.tick <= endTick);
  }

  /** Get rejected actions for a player (potential exploit attempts). */
  getRejections(playerId: PlayerId, limit = 20): AuditEntry[] {
    return this.entries
      .filter(e => e.playerId === playerId && !e.valid)
      .slice(-limit);
  }

  /** Count rejections in the last N ticks for a player. */
  recentRejectionCount(playerId: PlayerId, lastNTicks: number, currentTick: number): number {
    const cutoff = currentTick - lastNTicks;
    return this.entries.filter(
      e => e.playerId === playerId && !e.valid && e.tick >= cutoff,
    ).length;
  }

  /** Get all entries (for persistence/analysis). */
  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  /** Clear the log. */
  clear(): void {
    this.entries = [];
  }

  get size(): number {
    return this.entries.length;
  }
}

export let auditLog = new AuditLog();

export function _installAuditLog(instance: AuditLog): void {
  auditLog = instance;
}
