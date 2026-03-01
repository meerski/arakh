// ============================================================
// Anti-Meta-Gaming Systems
// ============================================================

import type { PlayerId, AgentAction } from '../types.js';

interface BehaviorProfile {
  actionHistory: { type: string; timestamp: number }[];
  patternScore: number;       // Higher = more mechanical/scripted
  lastWarning: number;
}

export class AntiGamingSystem {
  private profiles: Map<PlayerId, BehaviorProfile> = new Map();

  /** Record an action for pattern analysis */
  recordAction(playerId: PlayerId, action: AgentAction): void {
    let profile = this.profiles.get(playerId);
    if (!profile) {
      profile = { actionHistory: [], patternScore: 0, lastWarning: 0 };
      this.profiles.set(playerId, profile);
    }

    profile.actionHistory.push({
      type: action.type,
      timestamp: Date.now(),
    });

    // Keep last 100 actions
    if (profile.actionHistory.length > 100) {
      profile.actionHistory = profile.actionHistory.slice(-100);
    }

    // Analyze for scripting patterns
    profile.patternScore = this.analyzePatterns(profile);
  }

  /** Check if a player is suspected of scripting */
  isSuspicious(playerId: PlayerId): boolean {
    const profile = this.profiles.get(playerId);
    return (profile?.patternScore ?? 0) > 0.7;
  }

  /** Get noise factor to apply to suspicious players' outcomes */
  getNoiseFactor(playerId: PlayerId): number {
    const profile = this.profiles.get(playerId);
    if (!profile) return 0;
    // More noise for more suspicious behavior
    return Math.min(0.3, profile.patternScore * 0.3);
  }

  private analyzePatterns(profile: BehaviorProfile): number {
    const history = profile.actionHistory;
    if (history.length < 10) return 0;

    let score = 0;

    // Check for perfectly regular timing (scripting indicator)
    const intervals: number[] = [];
    for (let i = 1; i < history.length; i++) {
      intervals.push(history[i].timestamp - history[i - 1].timestamp);
    }

    if (intervals.length > 5) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((s, i) => s + (i - avgInterval) ** 2, 0) / intervals.length;
      const cv = Math.sqrt(variance) / (avgInterval || 1); // Coefficient of variation

      // Very low CV = suspiciously regular timing
      if (cv < 0.05) score += 0.4;
      else if (cv < 0.1) score += 0.2;
    }

    // Check for repetitive action sequences
    const recentTypes = history.slice(-20).map(h => h.type);
    const uniqueTypes = new Set(recentTypes);
    if (uniqueTypes.size <= 2 && recentTypes.length >= 15) {
      score += 0.3;
    }

    // Check for systematic probing (cycling through all action types)
    const last30Types = history.slice(-30).map(h => h.type);
    const typeSet = new Set(last30Types);
    if (typeSet.size >= 15 && last30Types.length >= 20) {
      // Trying every action type = probing
      score += 0.3;
    }

    return Math.min(1, score);
  }

  /**
   * Detect collusion: multiple agents from different species performing
   * identical action sequences in the same region within a short window.
   */
  analyzeCollusion(playerActions: { playerId: PlayerId; speciesId: string; regionId: string; actions: string[] }[]): PlayerId[] {
    const flagged: PlayerId[] = [];

    // Group by region
    const byRegion = new Map<string, typeof playerActions>();
    for (const entry of playerActions) {
      const list = byRegion.get(entry.regionId) ?? [];
      list.push(entry);
      byRegion.set(entry.regionId, list);
    }

    for (const [_regionId, regionPlayers] of byRegion) {
      if (regionPlayers.length < 2) continue;

      // Compare action sequences between different species
      for (let i = 0; i < regionPlayers.length; i++) {
        for (let j = i + 1; j < regionPlayers.length; j++) {
          const a = regionPlayers[i];
          const b = regionPlayers[j];
          if (a.speciesId === b.speciesId) continue; // Same species isn't suspicious

          // Check for identical action sequences
          const seqA = a.actions.slice(-10).join(',');
          const seqB = b.actions.slice(-10).join(',');
          if (seqA === seqB && a.actions.length >= 5) {
            flagged.push(a.playerId, b.playerId);

            // Increase noise for flagged players
            const profA = this.profiles.get(a.playerId);
            const profB = this.profiles.get(b.playerId);
            if (profA) profA.patternScore = Math.min(1, profA.patternScore + 0.3);
            if (profB) profB.patternScore = Math.min(1, profB.patternScore + 0.3);
          }
        }
      }
    }

    return [...new Set(flagged)];
  }
}

export let antiGaming = new AntiGamingSystem();

export function _installAntiGaming(instance: AntiGamingSystem): void { antiGaming = instance; }
