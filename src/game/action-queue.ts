// ============================================================
// Action Queue — Deterministic Action Processing
// ============================================================
// Actions are enqueued from WebSocket, drained and processed
// deterministically during the tick loop.

import type { AgentAction, ActionResult, PlayerId, CharacterId } from '../types.js';

export interface QueuedAction {
  playerId: PlayerId;
  characterId: CharacterId;
  action: AgentAction;
  enqueuedAtTick: number;
  /** Callback to deliver the result back to the connection */
  deliver: (result: ActionResult) => void;
}

export class ActionQueue {
  private queue: QueuedAction[] = [];

  /** Add an action to be processed on the next tick */
  enqueue(item: QueuedAction): void {
    this.queue.push(item);
  }

  /** Drain all pending actions (returns and clears the queue) */
  drain(): QueuedAction[] {
    const items = this.queue;
    this.queue = [];
    return items;
  }

  /** Number of pending actions */
  get size(): number {
    return this.queue.length;
  }

  /** Clear the queue without processing */
  clear(): void {
    this.queue = [];
  }
}

export let actionQueue = new ActionQueue();

/** @internal Bridge: install a WorldContext-owned instance */
export function _installActionQueue(instance: ActionQueue): void { actionQueue = instance; }
