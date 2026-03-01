// ============================================================
// Write-Ahead Log — Crash Recovery for In-Flight Mutations
// ============================================================
// Appends tick-level state deltas as newline-delimited JSON to a
// local file. On startup, replays entries after the last snapshot
// tick to recover up to ~30 seconds of state. Truncated after
// each successful snapshot save.

import { writeFileSync, readFileSync, appendFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { dirname } from 'path';

export interface WALEntry {
  tick: number;
  timestamp: number;
  type: 'tick_summary';
  births: string[];     // CharacterIds born this tick
  deaths: string[];     // CharacterIds died this tick
  events: string[];     // Event descriptions (compact)
  actionCount: number;  // Number of actions processed
  discoveries: string[];
}

export class WriteAheadLog {
  private filePath: string;
  private enabled = false;
  private entryCount = 0;

  constructor(filePath: string = '') {
    this.filePath = filePath;
  }

  /** Initialize the WAL. Creates directory and file if needed. */
  init(filePath: string): void {
    this.filePath = filePath;
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    // Create file if it doesn't exist
    if (!existsSync(filePath)) {
      writeFileSync(filePath, '');
    }
    this.enabled = true;
    this.entryCount = this.readEntries().length;
  }

  /** Append a tick summary to the WAL. */
  append(entry: WALEntry): void {
    if (!this.enabled) return;
    try {
      const line = JSON.stringify(entry) + '\n';
      appendFileSync(this.filePath, line);
      this.entryCount++;
    } catch (err) {
      console.error('[WAL] Append failed:', (err as Error).message);
    }
  }

  /** Read all WAL entries from disk. */
  readEntries(): WALEntry[] {
    if (!this.enabled || !existsSync(this.filePath)) return [];
    try {
      const content = readFileSync(this.filePath, 'utf-8').trim();
      if (!content) return [];
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line) as WALEntry);
    } catch (err) {
      console.error('[WAL] Read failed:', (err as Error).message);
      return [];
    }
  }

  /** Get entries after a given tick (for replay after snapshot restore). */
  getEntriesAfterTick(snapshotTick: number): WALEntry[] {
    return this.readEntries().filter(e => e.tick > snapshotTick);
  }

  /** Truncate the WAL (called after successful snapshot save). */
  truncate(): void {
    if (!this.enabled) return;
    try {
      writeFileSync(this.filePath, '');
      this.entryCount = 0;
    } catch (err) {
      console.error('[WAL] Truncate failed:', (err as Error).message);
    }
  }

  /** Remove the WAL file entirely. */
  destroy(): void {
    if (!this.enabled) return;
    try {
      if (existsSync(this.filePath)) {
        unlinkSync(this.filePath);
      }
      this.enabled = false;
      this.entryCount = 0;
    } catch (err) {
      console.error('[WAL] Destroy failed:', (err as Error).message);
    }
  }

  get size(): number {
    return this.entryCount;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get path(): string {
    return this.filePath;
  }
}

// Singleton + bridge
export let wal = new WriteAheadLog();

export function _installWAL(instance: WriteAheadLog): void {
  wal = instance;
}
