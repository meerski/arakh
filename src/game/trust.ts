// ============================================================
// Trust System — Inter-Family Trust Ledger
// ============================================================

import type { FamilyTreeId, TrustRecord } from '../types.js';

export class TrustLedger {
  private ledger: Map<string, TrustRecord> = new Map();

  private key(from: FamilyTreeId, to: FamilyTreeId): string {
    return `${from}:${to}`;
  }

  /** Get trust score between two families (0 if unknown) */
  getTrust(fromFamilyId: FamilyTreeId, toFamilyId: FamilyTreeId): number {
    const record = this.ledger.get(this.key(fromFamilyId, toFamilyId));
    return record?.trustScore ?? 0;
  }

  /** Get full trust record */
  getTrustRecord(fromFamilyId: FamilyTreeId, toFamilyId: FamilyTreeId): TrustRecord | undefined {
    return this.ledger.get(this.key(fromFamilyId, toFamilyId));
  }

  private getOrCreate(fromFamilyId: FamilyTreeId, toFamilyId: FamilyTreeId): TrustRecord {
    const k = this.key(fromFamilyId, toFamilyId);
    let record = this.ledger.get(k);
    if (!record) {
      record = {
        targetFamilyId: toFamilyId,
        trustScore: 0,
        betrayalCount: 0,
        cooperationCount: 0,
        lastInteractionTick: 0,
        intelSharedCount: 0,
        intelAccuracyScore: 1.0,
      };
      this.ledger.set(k, record);
    }
    return record;
  }

  /** Record cooperation — +0.02 trust, bidirectional */
  recordCooperation(familyA: FamilyTreeId, familyB: FamilyTreeId, tick: number): void {
    const ab = this.getOrCreate(familyA, familyB);
    ab.trustScore = Math.min(1, ab.trustScore + 0.02);
    ab.cooperationCount++;
    ab.lastInteractionTick = tick;

    const ba = this.getOrCreate(familyB, familyA);
    ba.trustScore = Math.min(1, ba.trustScore + 0.02);
    ba.cooperationCount++;
    ba.lastInteractionTick = tick;
  }

  /** Record betrayal — -0.5 trust from victim toward betrayer */
  recordBetrayal(betrayerFamilyId: FamilyTreeId, victimFamilyId: FamilyTreeId, tick: number): void {
    const record = this.getOrCreate(victimFamilyId, betrayerFamilyId);
    record.trustScore = Math.max(-1, record.trustScore - 0.5);
    record.betrayalCount++;
    record.lastInteractionTick = tick;
  }

  /** Record intel accuracy — rolling average */
  recordIntelAccuracy(fromFamilyId: FamilyTreeId, toFamilyId: FamilyTreeId, accurate: boolean): void {
    const record = this.getOrCreate(toFamilyId, fromFamilyId);
    record.intelSharedCount++;
    // Weighted rolling average
    const weight = 1 / record.intelSharedCount;
    record.intelAccuracyScore = record.intelAccuracyScore * (1 - weight) + (accurate ? 1 : 0) * weight;
  }

  /** Spread betrayal reputation to witnesses */
  spreadBetrayalReputation(betrayerFamilyId: FamilyTreeId, witnessFamilyIds: FamilyTreeId[], tick: number): void {
    for (const witnessId of witnessFamilyIds) {
      if (witnessId === betrayerFamilyId) continue;
      const record = this.getOrCreate(witnessId, betrayerFamilyId);
      record.trustScore = Math.max(-1, record.trustScore - 0.15);
      record.lastInteractionTick = tick;
    }
  }

  /** Decay all trust toward 0 */
  tickTrustDecay(tick: number): void {
    for (const record of this.ledger.values()) {
      if (record.trustScore > 0) {
        record.trustScore = Math.max(0, record.trustScore - 0.002);
      } else if (record.trustScore < 0) {
        record.trustScore = Math.min(0, record.trustScore + 0.002);
      }
    }
  }

  /** Evaluate whether a family is willing to share intel */
  evaluateIntelSharingWillingness(
    sharerFamilyId: FamilyTreeId,
    receiverFamilyId: FamilyTreeId,
    intelValue: number,
  ): { willing: boolean; riskAssessment: string } {
    const trust = this.getTrust(sharerFamilyId, receiverFamilyId);
    const record = this.getTrustRecord(sharerFamilyId, receiverFamilyId);

    // High trust = willing to share
    if (trust > 0.3) {
      return { willing: true, riskAssessment: 'trusted ally' };
    }

    // Moderate trust + low value intel = willing
    if (trust > 0 && intelValue < 0.5) {
      return { willing: true, riskAssessment: 'low-risk exchange' };
    }

    // Betrayal history = never
    if (record && record.betrayalCount > 0) {
      return { willing: false, riskAssessment: 'known betrayer — intel withheld' };
    }

    // Unknown = cautious
    if (trust === 0) {
      return { willing: intelValue < 0.3, riskAssessment: 'unknown entity — sharing only low-value intel' };
    }

    return { willing: false, riskAssessment: 'insufficient trust' };
  }

  /** Get all families that a given family has trust records with */
  getKnownFamilies(familyId: FamilyTreeId): FamilyTreeId[] {
    const families: FamilyTreeId[] = [];
    for (const [key, record] of this.ledger) {
      if (key.startsWith(familyId + ':')) {
        families.push(record.targetFamilyId);
      }
    }
    return families;
  }

  clear(): void {
    this.ledger.clear();
  }
}

export let trustLedger = new TrustLedger();
export function _installTrustLedger(instance: TrustLedger): void { trustLedger = instance; }
