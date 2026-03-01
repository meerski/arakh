// ============================================================
// WebSocket Handler — Agent Real-Time Connection
// ============================================================

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { AgentMessage, ServerMessage, PlayerId, AgentAction, ChatMessage, Directive } from '../types.js';
import { SessionManager } from './session.js';
import { rateLimiter } from '../security/rate-limit.js';
import { filterPerception } from '../security/perception.js';
import { actionQueue } from '../game/action-queue.js';
import { processMessage } from './messaging.js';
import { characterRegistry } from '../species/registry.js';
import { directiveQueue } from '../game/directives.js';
import { spawnCharacter, respawnCharacter } from './spawner.js';
import type { Region } from '../types.js';

export class GameWebSocket {
  private wss: WebSocketServer;
  private sessions: SessionManager;
  private connections: Map<PlayerId, WebSocket> = new Map();
  private regions: Map<string, Region> = new Map();
  private currentTick: number = 0;
  private timeOfDay: string = 'day';
  private season: string = 'spring';
  private weather: string = 'clear';

  constructor(server: Server, sessions: SessionManager) {
    this.wss = new WebSocketServer({ server });
    this.sessions = sessions;
    this.setupHandlers();
  }

  /** Update world state references (called from tick loop) */
  updateWorldState(regions: Map<string, Region>, tick: number, timeOfDay: string, season: string, weather: string): void {
    this.regions = regions;
    this.currentTick = tick;
    this.timeOfDay = timeOfDay;
    this.season = season;
    this.weather = weather;
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      let playerId: PlayerId | null = null;

      ws.on('message', (data: Buffer) => {
        try {
          const message: AgentMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message, playerId).then(pid => {
            if (pid) playerId = pid;
          });
        } catch {
          this.sendError(ws, 'PARSE_ERROR', 'Invalid message format');
        }
      });

      ws.on('close', () => {
        if (playerId) {
          this.sessions.disconnect(playerId);
          this.connections.delete(playerId);
        }
      });

      // Send welcome
      this.send(ws, {
        type: 'narrative',
        payload: {
          text: 'Connected to Arakh. Send {"type":"action","payload":{"type":"observe","params":{}}} to begin.',
          category: 'world',
        },
      });
    });
  }

  private async handleMessage(
    ws: WebSocket,
    message: AgentMessage,
    playerId: PlayerId | null,
  ): Promise<PlayerId | null> {
    // Authentication / session binding
    if (!playerId) {
      // First message should identify the player
      const payload = message.payload as unknown as Record<string, unknown>;
      const pid = payload?.playerId as string;
      if (!pid) {
        this.sendError(ws, 'AUTH_REQUIRED', 'First message must include playerId');
        return null;
      }

      // Rate check
      if (!rateLimiter.check(pid)) {
        this.sendError(ws, 'RATE_LIMITED', 'Too many requests');
        return null;
      }

      const session = this.sessions.connect(pid);
      if (!session) {
        this.sendError(ws, 'SESSION_ERROR', 'Could not create session');
        return null;
      }

      this.connections.set(pid, ws);

      // Auto-spawn a character if the player doesn't have one
      if (!session.characterId) {
        const spawn = spawnCharacter(pid, session, this.regions, this.currentTick);
        if (spawn) {
          this.send(ws, {
            type: 'narrative',
            payload: { text: spawn.narrative, category: 'personal' as const },
          });
        } else {
          this.sendError(ws, 'SPAWN_FAILED', 'No species or regions available for spawning');
        }
      }

      return pid;
    }

    // Rate limit
    if (!rateLimiter.check(playerId)) {
      this.sendError(ws, 'RATE_LIMITED', 'Too many requests');
      return playerId;
    }

    // Handle action
    if (message.type === 'action') {
      const action = message.payload as AgentAction;
      const session = this.sessions.getSession(playerId);
      if (!session?.characterId) {
        this.sendError(ws, 'NO_CHARACTER', 'No active character');
        return playerId;
      }

      // Check if character is dead — trigger respawn
      const currentChar = characterRegistry.get(session.characterId);
      if (currentChar && !currentChar.isAlive) {
        const respawn = respawnCharacter(
          playerId, session, session.characterId, this.regions, this.currentTick,
        );
        if (respawn) {
          this.send(ws, {
            type: 'narrative',
            payload: { text: respawn.narrative, category: 'personal' as const },
          });
        } else {
          this.sendError(ws, 'RESPAWN_FAILED', 'Could not respawn. The world may have no place for you.');
        }
        return playerId;
      }

      // Enqueue action — will be processed deterministically in next tick
      const characterId = session.characterId;
      actionQueue.enqueue({
        playerId,
        characterId,
        action,
        enqueuedAtTick: this.currentTick,
        deliver: (result) => {
          const filtered = filterPerception(result, session.speciesPerception);
          this.send(ws, { type: 'action_result', payload: filtered });
        },
      });
    }

    // Handle chat messages between agents
    if (message.type === 'chat') {
      const chat = message.payload as ChatMessage;
      const session = this.sessions.getSession(playerId);
      if (!session?.characterId) {
        this.sendError(ws, 'NO_CHARACTER', 'No active character');
        return playerId;
      }

      const sender = characterRegistry.get(session.characterId);
      const receiver = characterRegistry.get(chat.to);
      if (!sender || !receiver) {
        this.sendError(ws, 'INVALID_TARGET', 'Sender or receiver not found');
        return playerId;
      }

      const result = processMessage(chat, sender, receiver);

      // Find the receiving player's connection and deliver
      for (const [pid, sess] of Array.from(this.sessions.getActiveSessions().entries())) {
        if (sess.characterId === chat.to) {
          const targetWs = this.connections.get(sess.playerId);
          if (targetWs) {
            this.send(targetWs, {
              type: 'narrative',
              payload: {
                text: result.delivered
                  ? (result.garbledContent ?? chat.content)
                  : 'An unintelligible sound reaches you.',
                category: 'personal',
              },
            });
          }
          break;
        }
      }

      // Confirm to sender
      this.send(ws, {
        type: 'narrative',
        payload: {
          text: result.delivered ? 'Your message is received.' : 'Your words seem to fall on deaf ears.',
          category: 'personal',
        },
      });
    }

    // Handle owner directives
    if (message.type === 'directive') {
      const directive = message.payload as Directive;
      const active = directiveQueue.issueDirective(
        playerId, directive.ownerId, directive.instruction, this.currentTick,
      );
      this.send(ws, {
        type: 'narrative',
        payload: {
          text: `Directive received: "${directive.instruction}" → strategy: ${active.strategy}`,
          category: 'personal',
        },
      });
    }

    return playerId;
  }

  /** Send a message to a specific player */
  sendToPlayer(playerId: PlayerId, message: ServerMessage): void {
    const ws = this.connections.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, message);
    }
  }

  /** Broadcast to all connected players */
  broadcast(message: ServerMessage): void {
    for (const ws of this.connections.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        this.send(ws, message);
      }
    }
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    ws.send(JSON.stringify(message));
  }

  private sendError(ws: WebSocket, code: string, msg: string): void {
    this.send(ws, {
      type: 'error',
      payload: { code, message: msg },
    });
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}
