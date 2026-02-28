// ============================================================
// Player — Agent + Human Owner Binding
// ============================================================

import type { Player, PlayerId, OwnerId, CharacterId, FamilyTreeId, Owner } from '../types.js';

export class PlayerManager {
  private players: Map<PlayerId, Player> = new Map();
  private owners: Map<OwnerId, Owner> = new Map();

  createOwner(displayName: string): Owner {
    const owner: Owner = {
      id: crypto.randomUUID() as OwnerId,
      displayName,
      players: [],
      cards: [],
      dynastyScore: 0,
      joinedAt: new Date(),
    };
    this.owners.set(owner.id, owner);
    return owner;
  }

  createPlayer(ownerId: OwnerId): Player {
    const owner = this.owners.get(ownerId);
    if (!owner) throw new Error(`Owner ${ownerId} not found`);

    const player: Player = {
      id: crypto.randomUUID() as PlayerId,
      ownerId,
      currentCharacterId: null,
      familyTreeId: null,
      connectedAt: null,
      isConnected: false,
    };

    this.players.set(player.id, player);
    owner.players.push(player.id);
    return player;
  }

  connectPlayer(playerId: PlayerId): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isConnected = true;
      player.connectedAt = new Date();
    }
  }

  disconnectPlayer(playerId: PlayerId): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isConnected = false;
    }
  }

  assignCharacter(playerId: PlayerId, characterId: CharacterId, familyTreeId: FamilyTreeId): void {
    const player = this.players.get(playerId);
    if (player) {
      player.currentCharacterId = characterId;
      player.familyTreeId = familyTreeId;
    }
  }

  getPlayer(id: PlayerId): Player | undefined {
    return this.players.get(id);
  }

  getOwner(id: OwnerId): Owner | undefined {
    return this.owners.get(id);
  }

  getConnectedPlayers(): Player[] {
    return Array.from(this.players.values()).filter(p => p.isConnected);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}

export const playerManager = new PlayerManager();
