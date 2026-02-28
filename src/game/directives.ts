// ============================================================
// Directive Processing — Owner-to-Agent Behavior Modifiers
// ============================================================
// Owners send strategic directives that influence agent behavior.
// Directives are queued per player and influence action selection.

import type { PlayerId, OwnerId } from '../types.js';

export type DirectiveStrategy =
  | 'cautious'       // Avoid danger, prioritize survival
  | 'aggressive'     // Seek combat, expand territory
  | 'explorer'       // Prioritize exploration and discovery
  | 'social'         // Focus on alliances, trade, breeding
  | 'fame_seeker'    // Pursue achievements and fame
  | 'survivalist'    // Focus on food, health, shelter
  | 'scholar'        // Seek knowledge and learning
  | 'neutral';       // No specific bias (default)

export interface ActiveDirective {
  id: string;
  playerId: PlayerId;
  ownerId: OwnerId;
  instruction: string;
  strategy: DirectiveStrategy;
  priority: number;        // 0-1, how strongly to weight this directive
  issuedAt: number;        // tick when issued
  expiresAt: number | null; // tick when it expires (null = permanent until replaced)
}

export interface DirectiveModifiers {
  explorationBias: number;   // -1 to 1 (negative = avoid, positive = seek)
  combatBias: number;
  socialBias: number;
  cautionBias: number;
  knowledgeBias: number;
  fameBias: number;
}

const STRATEGY_MODIFIERS: Record<DirectiveStrategy, DirectiveModifiers> = {
  cautious:    { explorationBias: -0.3, combatBias: -0.5, socialBias: 0.1, cautionBias: 0.6, knowledgeBias: 0, fameBias: -0.2 },
  aggressive:  { explorationBias: 0.2, combatBias: 0.6, socialBias: -0.2, cautionBias: -0.4, knowledgeBias: 0, fameBias: 0.3 },
  explorer:    { explorationBias: 0.6, combatBias: -0.1, socialBias: 0, cautionBias: -0.1, knowledgeBias: 0.3, fameBias: 0.1 },
  social:      { explorationBias: 0, combatBias: -0.3, socialBias: 0.6, cautionBias: 0.1, knowledgeBias: 0.1, fameBias: 0.1 },
  fame_seeker: { explorationBias: 0.2, combatBias: 0.2, socialBias: 0.2, cautionBias: -0.3, knowledgeBias: 0.1, fameBias: 0.6 },
  survivalist: { explorationBias: -0.2, combatBias: -0.1, socialBias: 0, cautionBias: 0.5, knowledgeBias: 0, fameBias: -0.3 },
  scholar:     { explorationBias: 0.3, combatBias: -0.3, socialBias: 0.1, cautionBias: 0.1, knowledgeBias: 0.6, fameBias: 0.1 },
  neutral:     { explorationBias: 0, combatBias: 0, socialBias: 0, cautionBias: 0, knowledgeBias: 0, fameBias: 0 },
};

/** Keywords that map to strategies */
const KEYWORD_MAP: [RegExp, DirectiveStrategy][] = [
  [/\b(cautious|careful|safe|defensive|hide)\b/i, 'cautious'],
  [/\b(aggressive|attack|fight|war|conquer|dominate)\b/i, 'aggressive'],
  [/(explor|discover|wander|travel|scout|\bmap\b)/i, 'explorer'],
  [/(social|\bally\b|friend|trade|breed|partner|cooperat)/i, 'social'],
  [/(fame|glory|legend|achiev|hero|renowned)/i, 'fame_seeker'],
  [/(surviv|food|\beat\b|shelter|health|forage)/i, 'survivalist'],
  [/\b(learn|study|knowledge|research|scholar|observe)\b/i, 'scholar'],
];

export class DirectiveQueue {
  private directives: Map<PlayerId, ActiveDirective> = new Map();
  private history: ActiveDirective[] = [];

  /** Process a raw instruction string into a directive */
  issueDirective(
    playerId: PlayerId,
    ownerId: OwnerId,
    instruction: string,
    tick: number,
  ): ActiveDirective {
    const strategy = this.interpretStrategy(instruction);
    const directive: ActiveDirective = {
      id: crypto.randomUUID(),
      playerId,
      ownerId,
      instruction,
      strategy,
      priority: 0.5,
      issuedAt: tick,
      expiresAt: null, // Persists until replaced
    };

    // Replace existing directive for this player
    const old = this.directives.get(playerId);
    if (old) this.history.push(old);
    this.directives.set(playerId, directive);

    return directive;
  }

  /** Interpret natural language instruction into a strategy */
  interpretStrategy(instruction: string): DirectiveStrategy {
    for (const [pattern, strategy] of KEYWORD_MAP) {
      if (pattern.test(instruction)) return strategy;
    }
    return 'neutral';
  }

  /** Get current directive for a player */
  getDirective(playerId: PlayerId): ActiveDirective | undefined {
    const d = this.directives.get(playerId);
    if (d?.expiresAt !== null && d?.expiresAt !== undefined) {
      // Would need current tick to check expiry — caller should handle
    }
    return d;
  }

  /** Get behavior modifiers for a player based on their active directive */
  getModifiers(playerId: PlayerId): DirectiveModifiers {
    const directive = this.directives.get(playerId);
    if (!directive) return STRATEGY_MODIFIERS.neutral;
    return STRATEGY_MODIFIERS[directive.strategy];
  }

  /** Expire old directives */
  tick(currentTick: number): void {
    for (const [pid, d] of this.directives) {
      if (d.expiresAt !== null && currentTick >= d.expiresAt) {
        this.history.push(d);
        this.directives.delete(pid);
      }
    }
  }

  /** Get directive history for a player */
  getHistory(playerId: PlayerId): ActiveDirective[] {
    return this.history.filter(d => d.playerId === playerId);
  }

  /** Clear a player's directive */
  clear(playerId: PlayerId): void {
    const d = this.directives.get(playerId);
    if (d) this.history.push(d);
    this.directives.delete(playerId);
  }

  /** Get all active directives */
  getAll(): ActiveDirective[] {
    return Array.from(this.directives.values());
  }
}

export const directiveQueue = new DirectiveQueue();
