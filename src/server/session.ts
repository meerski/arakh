// ============================================================
// Agent Session Management
// ============================================================

import type { PlayerId, CharacterId, SpeciesId } from '../types.js';
import type { ActionContext } from '../game/actions.js';
import type { PerceptionProfile } from '../types.js';
import { playerManager } from '../game/player.js';

export interface Session {
  playerId: PlayerId;
  characterId: CharacterId | null;
  speciesId: SpeciesId | null;
  speciesPerception: PerceptionProfile;
  actionContext: ActionContext | null;
  connectedAt: Date;
  lastActionAt: Date;
}

export class SessionManager {
  private sessions: Map<PlayerId, Session> = new Map();

  connect(playerId: PlayerId): Session | null {
    const player = playerManager.getPlayer(playerId);
    if (!player) return null;

    playerManager.connectPlayer(playerId);

    const session: Session = {
      playerId,
      characterId: player.currentCharacterId,
      speciesId: null,
      speciesPerception: {
        visualRange: 50,
        hearingRange: 50,
        smellRange: 30,
        echolocation: false,
        electroreception: false,
        thermalSensing: false,
      },
      actionContext: null,
      connectedAt: new Date(),
      lastActionAt: new Date(),
    };

    this.sessions.set(playerId, session);
    return session;
  }

  disconnect(playerId: PlayerId): void {
    this.sessions.delete(playerId);
    playerManager.disconnectPlayer(playerId);
  }

  getSession(playerId: PlayerId): Session | undefined {
    return this.sessions.get(playerId);
  }

  updateActionContext(playerId: PlayerId, context: ActionContext): void {
    const session = this.sessions.get(playerId);
    if (session) {
      session.actionContext = context;
      session.lastActionAt = new Date();
    }
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values());
  }
}
