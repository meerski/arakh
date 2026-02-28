import { describe, it, expect, beforeEach } from 'vitest';
import {
  cosmeticCatalog, cosmeticInventory, seedDefaultCatalog,
} from '../src/game/cosmetics.js';
import {
  SentinelAgent,
} from '../src/security/sentinel.js';
import {
  PerformanceMonitor,
} from '../src/simulation/performance.js';
import {
  WorldSerializer, BackupManager,
} from '../src/data/backup.js';
import { createWorld } from '../src/simulation/world.js';
import type { OwnerId, CardId } from '../src/types.js';

describe('Phase 9 — Monetization & Polish', () => {
  // --- Cosmetics Marketplace ---
  describe('Cosmetics Catalog', () => {
    beforeEach(() => {
      // Reset catalog by adding fresh items
    });

    it('adds items to catalog', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Test Frame', description: 'A test frame',
        category: 'card_frame', rarity: 'standard', price: 100, isAvailable: true,
      });
      expect(item.id).toBeDefined();
      expect(item.name).toBe('Test Frame');
      expect(item.purchaseCount).toBe(0);
    });

    it('retrieves item by id', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Lookup Frame', description: 'Test',
        category: 'card_frame', rarity: 'premium', price: 500, isAvailable: true,
      });
      expect(cosmeticCatalog.getItem(item.id)).toBeDefined();
      expect(cosmeticCatalog.getItem(item.id)!.name).toBe('Lookup Frame');
    });

    it('filters by category', () => {
      cosmeticCatalog.addItem({
        name: 'Badge1', description: 'Test',
        category: 'profile_badge', rarity: 'standard', price: 50, isAvailable: true,
      });
      const badges = cosmeticCatalog.getByCategory('profile_badge');
      expect(badges.length).toBeGreaterThanOrEqual(1);
      expect(badges.every(b => b.category === 'profile_badge')).toBe(true);
    });

    it('filters available items excluding sold out', () => {
      const limited = cosmeticCatalog.addItem({
        name: 'Sold Out Item', description: 'Test',
        category: 'title', rarity: 'limited', price: 100, isAvailable: true, maxOwners: 1,
      });
      // Purchase it once (manually bump count)
      limited.purchaseCount = 1;

      const available = cosmeticCatalog.getAvailable();
      expect(available.some(i => i.id === limited.id)).toBe(false);
    });

    it('filters out unavailable items', () => {
      const unavailable = cosmeticCatalog.addItem({
        name: 'Retired Item', description: 'No longer sold',
        category: 'card_effect', rarity: 'exclusive', price: 2000, isAvailable: false,
      });
      const available = cosmeticCatalog.getAvailable();
      expect(available.some(i => i.id === unavailable.id)).toBe(false);
    });

    it('seeds default catalog with items', () => {
      seedDefaultCatalog();
      const all = cosmeticCatalog.getAll();
      expect(all.length).toBeGreaterThanOrEqual(12); // At least the seeded items
    });
  });

  describe('Cosmetics Inventory', () => {
    beforeEach(() => {
      cosmeticInventory.clear();
    });

    it('purchases a cosmetic for an owner', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Purchase Test', description: 'Test',
        category: 'card_frame', rarity: 'standard', price: 100, isAvailable: true,
      });
      const owned = cosmeticInventory.purchase('owner1' as OwnerId, item.id);
      expect(owned).not.toBeNull();
      expect(owned!.cosmeticId).toBe(item.id);
      expect(owned!.ownerId).toBe('owner1');
      expect(item.purchaseCount).toBe(1);
    });

    it('prevents duplicate purchase by same owner', () => {
      const item = cosmeticCatalog.addItem({
        name: 'No Dupe', description: 'Test',
        category: 'card_back', rarity: 'standard', price: 100, isAvailable: true,
      });
      cosmeticInventory.purchase('owner2' as OwnerId, item.id);
      const second = cosmeticInventory.purchase('owner2' as OwnerId, item.id);
      expect(second).toBeNull();
    });

    it('prevents purchase of sold out limited item', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Limited One', description: 'Only 1',
        category: 'title', rarity: 'limited', price: 100, isAvailable: true, maxOwners: 1,
      });
      cosmeticInventory.purchase('owner3' as OwnerId, item.id);
      const second = cosmeticInventory.purchase('owner4' as OwnerId, item.id);
      expect(second).toBeNull();
    });

    it('retrieves cosmetics by owner', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Owned Item', description: 'Test',
        category: 'dashboard_theme', rarity: 'standard', price: 100, isAvailable: true,
      });
      cosmeticInventory.purchase('owner5' as OwnerId, item.id);
      const owned = cosmeticInventory.getByOwner('owner5' as OwnerId);
      expect(owned).toHaveLength(1);
    });

    it('applies and unapplies cosmetics', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Applicable', description: 'Test',
        category: 'card_frame', rarity: 'standard', price: 100, isAvailable: true,
      });
      cosmeticInventory.purchase('owner6' as OwnerId, item.id);

      expect(cosmeticInventory.apply('owner6' as OwnerId, item.id, 'card-123' as CardId)).toBe(true);
      expect(cosmeticInventory.getAppliedTo('owner6' as OwnerId, 'card-123' as CardId)).toHaveLength(1);

      expect(cosmeticInventory.unapply('owner6' as OwnerId, item.id)).toBe(true);
      expect(cosmeticInventory.getAppliedTo('owner6' as OwnerId, 'card-123' as CardId)).toHaveLength(0);
    });

    it('cannot apply cosmetic not owned', () => {
      expect(cosmeticInventory.apply('nobody' as OwnerId, 'fake-id', 'profile')).toBe(false);
    });

    it('applies to profile and dashboard targets', () => {
      const item = cosmeticCatalog.addItem({
        name: 'Theme Apply', description: 'Test',
        category: 'dashboard_theme', rarity: 'standard', price: 100, isAvailable: true,
      });
      cosmeticInventory.purchase('owner7' as OwnerId, item.id);
      expect(cosmeticInventory.apply('owner7' as OwnerId, item.id, 'dashboard')).toBe(true);
      expect(cosmeticInventory.getAppliedTo('owner7' as OwnerId, 'dashboard')).toHaveLength(1);
    });
  });

  // --- Sentinel Red-Teaming ---
  describe('Sentinel Agent', () => {
    it('probes rate limits', () => {
      const sentinel = new SentinelAgent();
      const result = sentinel.probeRateLimits();
      expect(result.type).toBe('rate_limit_bypass');
      expect(result.passed).toBe(true); // Rate limiter should block
    });

    it('probes action replay detection', () => {
      const sentinel = new SentinelAgent();
      const result = sentinel.probeActionReplay();
      expect(result.type).toBe('action_replay');
      // Anti-gaming should detect repetitive actions
      expect(result.passed).toBe(true);
    });

    it('probes boundary tests', () => {
      const sentinel = new SentinelAgent();
      const result = sentinel.probeBoundaryTests();
      expect(result.type).toBe('boundary_test');
      expect(result.passed).toBe(true); // No crashes
    });

    it('probes resource exploits', () => {
      const sentinel = new SentinelAgent();
      const result = sentinel.probeResourceExploit();
      expect(result.type).toBe('resource_exploit');
    });

    it('probes information leakage', () => {
      const sentinel = new SentinelAgent();
      const result = sentinel.probeInformationLeakage();
      expect(result.type).toBe('information_leakage');
      expect(result.passed).toBe(true);
    });

    it('runs full suite and generates report', () => {
      const sentinel = new SentinelAgent();
      const report = sentinel.runFullSuite();
      expect(report.totalProbes).toBe(6);
      expect(report.passed).toBeGreaterThan(0);
      expect(report.lastRunAt).toBeGreaterThan(0);
    });

    it('detects critical issues in report', () => {
      const sentinel = new SentinelAgent();
      sentinel.runFullSuite();
      const report = sentinel.getReport();
      // Should have no critical issues in a healthy system
      expect(report.criticalIssues).toHaveLength(0);
    });

    it('stores and retrieves results', () => {
      const sentinel = new SentinelAgent();
      sentinel.probeRateLimits();
      sentinel.probeBoundaryTests();
      expect(sentinel.getResults()).toHaveLength(2);
      sentinel.clear();
      expect(sentinel.getResults()).toHaveLength(0);
    });
  });

  // --- Performance Monitor ---
  describe('Performance Monitor', () => {
    it('records tick metrics', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordTick(1, 5.2, 100, 500, 3);
      monitor.recordTick(2, 8.1, 100, 502, 5);

      const recent = monitor.getRecentMetrics(10);
      expect(recent).toHaveLength(2);
      expect(recent[0].durationMs).toBe(5.2);
    });

    it('computes performance snapshot', () => {
      const monitor = new PerformanceMonitor();
      for (let i = 0; i < 100; i++) {
        monitor.recordTick(i, 3 + Math.random() * 10, 100, 500, 2);
      }

      const snapshot = monitor.getSnapshot();
      expect(snapshot.totalTicks).toBe(100);
      expect(snapshot.avgTickMs).toBeGreaterThan(0);
      expect(snapshot.maxTickMs).toBeGreaterThanOrEqual(snapshot.avgTickMs);
      expect(snapshot.minTickMs).toBeLessThanOrEqual(snapshot.avgTickMs);
      expect(snapshot.p95TickMs).toBeGreaterThanOrEqual(snapshot.avgTickMs);
    });

    it('returns empty snapshot when no metrics', () => {
      const monitor = new PerformanceMonitor();
      const snapshot = monitor.getSnapshot();
      expect(snapshot.totalTicks).toBe(0);
      expect(snapshot.avgTickMs).toBe(0);
    });

    it('detects slow ticks', () => {
      const monitor = new PerformanceMonitor();
      monitor.setSlowThreshold(50);
      monitor.recordTick(1, 10, 100, 500, 2);   // Fast
      monitor.recordTick(2, 200, 100, 500, 2);  // Slow!
      monitor.recordTick(3, 15, 100, 500, 2);   // Fast

      const alerts = monitor.getSlowTicks();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].tick).toBe(2);
      expect(alerts[0].severity).toBe('high'); // 200 > 50*3
    });

    it('alerts on high event count', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordTick(1, 5, 100, 500, 100); // 100 events

      const alerts = monitor.getAlerts();
      expect(alerts.some(a => a.type === 'high_events')).toBe(true);
    });

    it('clears metrics and alerts', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordTick(1, 5, 100, 500, 2);
      monitor.clear();
      expect(monitor.getRecentMetrics()).toHaveLength(0);
      expect(monitor.getAlerts()).toHaveLength(0);
    });
  });

  // --- Backup System ---
  describe('World Serializer', () => {
    it('serializes a world to snapshot', () => {
      const world = createWorld('TestWorld');
      const serializer = new WorldSerializer();
      const snapshot = serializer.serialize(world);

      expect(snapshot.version).toBe(1);
      expect(snapshot.tick).toBe(0);
      expect(snapshot.world.name).toBe('TestWorld');
      expect(snapshot.createdAt).toBeDefined();
      expect(snapshot.metadata.regionCount).toBe(0);
    });

    it('includes metadata in snapshot', () => {
      const world = createWorld('MetaWorld');
      const serializer = new WorldSerializer();
      const snapshot = serializer.serialize(world);

      expect(snapshot.metadata).toBeDefined();
      expect(typeof snapshot.metadata.regionCount).toBe('number');
      expect(typeof snapshot.metadata.speciesCount).toBe('number');
      expect(typeof snapshot.metadata.cardCount).toBe('number');
      expect(typeof snapshot.metadata.totalPopulation).toBe('number');
    });
  });

  describe('Backup Manager', () => {
    const testSavesDir = join(process.cwd(), 'saves', 'test-backups');

    beforeEach(() => {
      // Clean test dir
      try {
        const { readdirSync, unlinkSync } = require('fs');
        if (require('fs').existsSync(testSavesDir)) {
          for (const f of readdirSync(testSavesDir)) {
            unlinkSync(join(testSavesDir, f));
          }
        }
      } catch { /* ignore */ }
    });

    it('creates checkpoint backup', () => {
      const manager = new BackupManager(testSavesDir);
      const world = createWorld('BackupWorld');
      const info = manager.createCheckpoint(world, 'test');

      expect(info.filename).toContain('checkpoint');
      expect(info.filename).toContain('test');
      expect(info.tick).toBe(0);
      expect(info.sizeBytes).toBeGreaterThan(0);
    });

    it('lists backups sorted by tick', () => {
      const manager = new BackupManager(testSavesDir);
      const world = createWorld('ListWorld');

      manager.createCheckpoint(world, 'first');
      world.time.tick = 100;
      manager.createCheckpoint(world, 'second');

      const backups = manager.listBackups();
      expect(backups.length).toBe(2);
      expect(backups[0].tick).toBe(100); // Most recent first
    });

    it('loads a saved snapshot', () => {
      const manager = new BackupManager(testSavesDir);
      const world = createWorld('LoadWorld');
      const info = manager.createCheckpoint(world, 'loadtest');

      const snapshot = manager.loadSnapshot(info.filename);
      expect(snapshot).not.toBeNull();
      expect(snapshot!.world.name).toBe('LoadWorld');
      expect(snapshot!.version).toBe(1);
    });

    it('returns null for nonexistent backup', () => {
      const manager = new BackupManager(testSavesDir);
      expect(manager.loadSnapshot('nonexistent.json')).toBeNull();
    });

    it('gets latest backup', () => {
      const manager = new BackupManager(testSavesDir);
      const world = createWorld('LatestWorld');
      manager.createCheckpoint(world, 'old');
      world.time.tick = 500;
      manager.createCheckpoint(world, 'new');

      const latest = manager.getLatestBackup();
      expect(latest).not.toBeNull();
      expect(latest!.tick).toBe(500);
    });
  });
});

function join(...parts: string[]): string {
  return parts.join('/').replace(/\\/g, '/');
}
