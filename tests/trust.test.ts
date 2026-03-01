import { describe, it, expect, beforeEach } from 'vitest';
import { trustLedger } from '../src/game/trust.js';

describe('Trust System', () => {
  beforeEach(() => {
    trustLedger.clear();
  });

  it('should return 0 trust for unknown families', () => {
    expect(trustLedger.getTrust('family-a', 'family-b')).toBe(0);
  });

  it('should record cooperation and increase trust bidirectionally', () => {
    trustLedger.recordCooperation('family-a', 'family-b', 100);

    expect(trustLedger.getTrust('family-a', 'family-b')).toBe(0.02);
    expect(trustLedger.getTrust('family-b', 'family-a')).toBe(0.02);
  });

  it('should accumulate cooperation trust', () => {
    trustLedger.recordCooperation('family-a', 'family-b', 100);
    trustLedger.recordCooperation('family-a', 'family-b', 200);
    trustLedger.recordCooperation('family-a', 'family-b', 300);

    expect(trustLedger.getTrust('family-a', 'family-b')).toBeCloseTo(0.06, 5);
  });

  it('should cap trust at 1', () => {
    for (let i = 0; i < 100; i++) {
      trustLedger.recordCooperation('family-a', 'family-b', i * 10);
    }
    expect(trustLedger.getTrust('family-a', 'family-b')).toBeLessThanOrEqual(1);
  });

  it('should record betrayal with heavy trust penalty', () => {
    // Build some trust first
    for (let i = 0; i < 10; i++) {
      trustLedger.recordCooperation('family-a', 'family-b', i * 10);
    }
    const trustBefore = trustLedger.getTrust('family-b', 'family-a');

    trustLedger.recordBetrayal('family-a', 'family-b', 500);

    const trustAfter = trustLedger.getTrust('family-b', 'family-a');
    expect(trustAfter).toBeLessThan(trustBefore);
    expect(trustAfter).toBeLessThan(0);
  });

  it('should track betrayal count', () => {
    trustLedger.recordBetrayal('family-a', 'family-b', 100);
    trustLedger.recordBetrayal('family-a', 'family-b', 200);

    const record = trustLedger.getTrustRecord('family-b', 'family-a');
    expect(record).toBeDefined();
    expect(record!.betrayalCount).toBe(2);
  });

  it('should spread betrayal reputation to witnesses', () => {
    trustLedger.spreadBetrayalReputation('family-a', ['family-c', 'family-d'], 100);

    expect(trustLedger.getTrust('family-c', 'family-a')).toBe(-0.15);
    expect(trustLedger.getTrust('family-d', 'family-a')).toBe(-0.15);
  });

  it('should not spread reputation to self', () => {
    trustLedger.spreadBetrayalReputation('family-a', ['family-a', 'family-c'], 100);

    const selfRecord = trustLedger.getTrustRecord('family-a', 'family-a');
    expect(selfRecord).toBeUndefined();
    expect(trustLedger.getTrust('family-c', 'family-a')).toBe(-0.15);
  });

  it('should decay trust toward zero', () => {
    trustLedger.recordCooperation('family-a', 'family-b', 100);
    const before = trustLedger.getTrust('family-a', 'family-b');

    trustLedger.tickTrustDecay(200);

    const after = trustLedger.getTrust('family-a', 'family-b');
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThanOrEqual(0);
  });

  it('should decay negative trust toward zero', () => {
    trustLedger.recordBetrayal('family-a', 'family-b', 100);
    const before = trustLedger.getTrust('family-b', 'family-a');
    expect(before).toBeLessThan(0);

    trustLedger.tickTrustDecay(200);

    const after = trustLedger.getTrust('family-b', 'family-a');
    expect(after).toBeGreaterThan(before);
  });

  it('should record intel accuracy as rolling average', () => {
    trustLedger.recordIntelAccuracy('family-a', 'family-b', true);
    trustLedger.recordIntelAccuracy('family-a', 'family-b', true);
    trustLedger.recordIntelAccuracy('family-a', 'family-b', false);

    const record = trustLedger.getTrustRecord('family-b', 'family-a');
    expect(record!.intelAccuracyScore).toBeLessThan(1);
    expect(record!.intelAccuracyScore).toBeGreaterThan(0);
    expect(record!.intelSharedCount).toBe(3);
  });

  it('should evaluate intel sharing willingness based on trust', () => {
    // Unknown — cautious
    let result = trustLedger.evaluateIntelSharingWillingness('family-a', 'family-b', 0.5);
    expect(result.willing).toBe(false);

    // Build trust
    for (let i = 0; i < 20; i++) {
      trustLedger.recordCooperation('family-a', 'family-b', i * 10);
    }

    result = trustLedger.evaluateIntelSharingWillingness('family-a', 'family-b', 0.5);
    expect(result.willing).toBe(true);
    expect(result.riskAssessment).toBe('trusted ally');
  });

  it('should refuse to share intel with known betrayers', () => {
    trustLedger.recordBetrayal('family-b', 'family-a', 100);

    const result = trustLedger.evaluateIntelSharingWillingness('family-a', 'family-b', 0.1);
    expect(result.willing).toBe(false);
    expect(result.riskAssessment).toContain('betrayer');
  });

  it('should list known families', () => {
    trustLedger.recordCooperation('family-a', 'family-b', 100);
    trustLedger.recordCooperation('family-a', 'family-c', 200);

    const known = trustLedger.getKnownFamilies('family-a');
    expect(known).toContain('family-b');
    expect(known).toContain('family-c');
  });
});
