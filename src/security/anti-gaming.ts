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
}

export const antiGaming = new AntiGamingSystem();
