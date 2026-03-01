import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WriteAheadLog, type WALEntry } from '../src/data/wal.js';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = join(process.cwd(), 'test-wal-temp');
const TEST_FILE = join(TEST_DIR, 'test.wal.jsonl');

function makeEntry(tick: number): WALEntry {
  return {
    tick,
    timestamp: Date.now(),
    type: 'tick_summary',
    births: [],
    deaths: [],
    events: [],
    actionCount: 0,
    discoveries: [],
  };
}

describe('Write-Ahead Log', () => {
  let wal: WriteAheadLog;

  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    wal = new WriteAheadLog();
    wal.init(TEST_FILE);
  });

  afterEach(() => {
    wal.destroy();
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('creates WAL file on init', () => {
    expect(existsSync(TEST_FILE)).toBe(true);
    expect(wal.isEnabled).toBe(true);
  });

  it('appends and reads entries', () => {
    wal.append(makeEntry(1));
    wal.append(makeEntry(2));
    wal.append(makeEntry(3));

    const entries = wal.readEntries();
    expect(entries).toHaveLength(3);
    expect(entries[0].tick).toBe(1);
    expect(entries[2].tick).toBe(3);
  });

  it('tracks entry count', () => {
    expect(wal.size).toBe(0);
    wal.append(makeEntry(1));
    wal.append(makeEntry(2));
    expect(wal.size).toBe(2);
  });

  it('filters entries after a tick', () => {
    wal.append(makeEntry(10));
    wal.append(makeEntry(20));
    wal.append(makeEntry(30));
    wal.append(makeEntry(40));

    const after25 = wal.getEntriesAfterTick(25);
    expect(after25).toHaveLength(2);
    expect(after25[0].tick).toBe(30);
    expect(after25[1].tick).toBe(40);
  });

  it('truncates all entries', () => {
    wal.append(makeEntry(1));
    wal.append(makeEntry(2));
    expect(wal.size).toBe(2);

    wal.truncate();
    expect(wal.size).toBe(0);
    expect(wal.readEntries()).toHaveLength(0);
    // File still exists but is empty
    expect(existsSync(TEST_FILE)).toBe(true);
  });

  it('destroy removes file', () => {
    wal.append(makeEntry(1));
    wal.destroy();
    expect(existsSync(TEST_FILE)).toBe(false);
    expect(wal.isEnabled).toBe(false);
  });

  it('persists entries across instances', () => {
    wal.append(makeEntry(100));
    wal.append(makeEntry(200));

    // Create a new WAL pointing to the same file
    const wal2 = new WriteAheadLog();
    wal2.init(TEST_FILE);

    const entries = wal2.readEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0].tick).toBe(100);
    expect(entries[1].tick).toBe(200);
    expect(wal2.size).toBe(2);
  });

  it('no-ops when not enabled', () => {
    const disabled = new WriteAheadLog();
    // Never call init
    disabled.append(makeEntry(1));
    expect(disabled.readEntries()).toHaveLength(0);
    expect(disabled.size).toBe(0);
    // Should not throw
    disabled.truncate();
    disabled.destroy();
  });

  it('handles entries with data', () => {
    wal.append({
      tick: 42,
      timestamp: 1234567890,
      type: 'tick_summary',
      births: ['char-1', 'char-2'],
      deaths: ['char-3'],
      events: ['A storm brews'],
      actionCount: 5,
      discoveries: ['New area found'],
    });

    const entries = wal.readEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].births).toEqual(['char-1', 'char-2']);
    expect(entries[0].deaths).toEqual(['char-3']);
    expect(entries[0].actionCount).toBe(5);
  });
});
