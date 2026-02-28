import { describe, it, expect } from 'vitest';
import { AntiGamingSystem } from '../src/security/anti-gaming.js';
import { RateLimiter } from '../src/security/rate-limit.js';

describe('AntiGamingSystem', () => {
  it('does not flag new players', () => {
    const ags = new AntiGamingSystem();
    expect(ags.isSuspicious('player-1')).toBe(false);
  });

  it('detects repetitive action patterns', () => {
    const ags = new AntiGamingSystem();
    const now = Date.now();

    // Simulate perfectly timed repetitive actions
    for (let i = 0; i < 50; i++) {
      ags.recordAction('player-1', {
        type: i % 2 === 0 ? 'move' : 'forage',
        params: {},
        timestamp: now + i * 1000,
      });
    }

    // Should detect pattern (repetitive 2-action cycle with regular timing)
    const noise = ags.getNoiseFactor('player-1');
    expect(noise).toBeGreaterThan(0);
  });

  it('does not flag varied natural play', () => {
    const ags = new AntiGamingSystem();
    const actions = ['move', 'explore', 'forage', 'rest', 'observe', 'hunt', 'communicate', 'gather'];

    for (let i = 0; i < 20; i++) {
      ags.recordAction('player-2', {
        type: actions[Math.floor(Math.random() * actions.length)] as any,
        params: {},
        timestamp: Date.now() + i * (800 + Math.random() * 2000),
      });
    }

    expect(ags.getNoiseFactor('player-2')).toBeLessThan(0.15);
  });
});

describe('RateLimiter', () => {
  it('allows requests under limit', () => {
    const limiter = new RateLimiter(5, 60000);
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('test')).toBe(true);
    }
  });

  it('blocks requests over limit', () => {
    const limiter = new RateLimiter(3, 60000);
    limiter.check('test');
    limiter.check('test');
    limiter.check('test');
    expect(limiter.check('test')).toBe(false);
  });

  it('tracks remaining correctly', () => {
    const limiter = new RateLimiter(10, 60000);
    limiter.check('test');
    limiter.check('test');
    expect(limiter.remaining('test')).toBe(8);
  });
});
