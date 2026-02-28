// ============================================================
// Integration Tests — Agent Gameplay Loop
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { playerManager } from '../src/game/player.js';
import { speciesRegistry } from '../src/species/species.js';
import { characterRegistry } from '../src/species/registry.js';
import { lineageManager } from '../src/game/lineage.js';
import { seedTaxonomy } from '../src/data/taxonomy/seed.js';
import { seedRegions } from '../src/data/earth/seed.js';
import { createWorld } from '../src/simulation/world.js';
import { SessionManager } from '../src/server/session.js';
import { spawnCharacter, respawnCharacter } from '../src/server/spawner.js';
import { broadcastPerceptionTicks } from '../src/server/perception-tick.js';
import { processAction, buildActionContext } from '../src/game/actions.js';
import { filterPerception } from '../src/security/perception.js';
import { createCharacter } from '../src/species/character.js';
import type { PlayerId, OwnerId, ServerMessage, Region } from '../src/types.js';

// Helper to create a test world with species and regions
function setupWorld() {
  // Clear singletons
  characterRegistry.clear();

  const world = createWorld('TestEarth');
  seedTaxonomy();
  seedRegions(world);
  return world;
}

describe('Agent Gameplay Loop', () => {
  let world: ReturnType<typeof createWorld>;
  let sessions: SessionManager;

  beforeEach(() => {
    world = setupWorld();
    sessions = new SessionManager();
  });

  describe('Registration and Connection', () => {
    it('creates an owner and player via playerManager', () => {
      const owner = playerManager.createOwner('TestAgent');
      expect(owner.id).toBeDefined();
      expect(owner.displayName).toBe('TestAgent');

      const player = playerManager.createPlayer(owner.id);
      expect(player.id).toBeDefined();
      expect(player.ownerId).toBe(owner.id);
      expect(player.currentCharacterId).toBeNull();
      expect(player.isConnected).toBe(false);
    });

    it('connects a player and creates a session', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);

      const session = sessions.connect(player.id);
      expect(session).not.toBeNull();
      expect(session!.playerId).toBe(player.id);
    });
  });

  describe('Character Spawning', () => {
    it('spawns a character when an agent connects', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id);
      expect(session).not.toBeNull();

      const result = spawnCharacter(player.id, session!, world.regions, 100);
      expect(result).not.toBeNull();
      expect(result!.character).toBeDefined();
      expect(result!.character.isAlive).toBe(true);
      expect(result!.character.playerId).toBe(player.id);
      expect(result!.narrative).toBeTruthy();

      // Session should be updated
      expect(session!.characterId).toBe(result!.character.id);
      expect(session!.speciesId).not.toBeNull();

      // Character should be registered
      const registered = characterRegistry.get(result!.character.id);
      expect(registered).toBeDefined();
      expect(registered!.isAlive).toBe(true);

      // Player should be assigned
      const updatedPlayer = playerManager.getPlayer(player.id);
      expect(updatedPlayer!.currentCharacterId).toBe(result!.character.id);
    });

    it('assigns species perception to the session', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;

      spawnCharacter(player.id, session, world.regions, 100);

      // Species perception should override defaults
      expect(session.speciesPerception).toBeDefined();
      expect(session.speciesPerception.visualRange).toBeGreaterThan(0);
    });

    it('creates a family tree for the spawned character', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;

      const result = spawnCharacter(player.id, session, world.regions, 100);
      expect(result).not.toBeNull();

      const character = result!.character;
      const tree = lineageManager.getTree(character.familyTreeId);
      expect(tree).toBeDefined();
      expect(tree!.rootCharacterId).toBe(character.id);
      expect(tree!.ownerId).toBe(owner.id);
    });
  });

  describe('Action Processing', () => {
    it('processes an observe action and returns narrative', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      const ctx = buildActionContext(
        spawn.character.id, world.regions, 100, 'morning', 'spring', 'clear',
      );
      expect(ctx).not.toBeNull();

      const result = processAction(
        { type: 'observe', params: {}, timestamp: Date.now() },
        ctx!,
      );

      expect(result.success).toBe(true);
      expect(result.narrative).toBeTruthy();
      expect(result.sensoryData).toBeDefined();
      expect(result.sensoryData.surroundings).toBeTruthy();
      expect(result.sensoryData.weather).toBe('clear');
    });

    it('processes a rest action and recovers energy', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      // Drain some energy first
      spawn.character.energy = 0.5;

      const ctx = buildActionContext(
        spawn.character.id, world.regions, 100, 'morning', 'spring', 'clear',
      )!;

      const result = processAction(
        { type: 'rest', params: {}, timestamp: Date.now() },
        ctx,
      );

      expect(result.success).toBe(true);
      expect(spawn.character.energy).toBeGreaterThan(0.5);
    });

    it('filters action results through species perception', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      const ctx = buildActionContext(
        spawn.character.id, world.regions, 100, 'morning', 'spring', 'clear',
      )!;

      const result = processAction(
        { type: 'observe', params: {}, timestamp: Date.now() },
        ctx,
      );

      const filtered = filterPerception(result, session.speciesPerception);

      // Filtered result should still have narrative and sensory data
      expect(filtered.narrative).toBeTruthy();
      expect(filtered.sensoryData).toBeDefined();
      // Opportunities should be limited by perception
      expect(filtered.sensoryData.opportunities.length).toBeLessThanOrEqual(
        Math.ceil(session.speciesPerception.visualRange / 25),
      );
    });
  });

  describe('Perception Ticks', () => {
    it('broadcasts perception data to connected agents', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      spawnCharacter(player.id, session, world.regions, 100);

      const received: ServerMessage[] = [];
      const sendToPlayer = (_pid: PlayerId, msg: ServerMessage) => {
        received.push(msg);
      };

      // Tick 5 should trigger a broadcast (tick % 5 === 0)
      broadcastPerceptionTicks(
        sessions, sendToPlayer, world.regions, 5, 'morning', 'spring', 'clear',
      );

      expect(received.length).toBe(1);
      expect(received[0].type).toBe('sensory_update');
    });

    it('does not broadcast on non-5th ticks', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      spawnCharacter(player.id, session, world.regions, 100);

      const received: ServerMessage[] = [];
      const sendToPlayer = (_pid: PlayerId, msg: ServerMessage) => {
        received.push(msg);
      };

      broadcastPerceptionTicks(
        sessions, sendToPlayer, world.regions, 3, 'morning', 'spring', 'clear',
      );

      expect(received.length).toBe(0);
    });

    it('sends death narrative when character is dead', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      // Kill the character
      spawn.character.isAlive = false;
      spawn.character.causeOfDeath = 'testing';

      const received: ServerMessage[] = [];
      const sendToPlayer = (_pid: PlayerId, msg: ServerMessage) => {
        received.push(msg);
      };

      broadcastPerceptionTicks(
        sessions, sendToPlayer, world.regions, 10, 'morning', 'spring', 'clear',
      );

      expect(received.length).toBe(1);
      expect(received[0].type).toBe('narrative');
    });
  });

  describe('Death and Respawn', () => {
    it('respawns as new lineage when character dies with no descendants', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      // Kill the character
      const deadId = spawn.character.id;
      spawn.character.isAlive = false;
      spawn.character.diedAtTick = 200;
      spawn.character.causeOfDeath = 'combat';

      // Respawn
      const respawn = respawnCharacter(player.id, session, deadId, world.regions, 201);
      expect(respawn).not.toBeNull();
      expect(respawn!.character.id).not.toBe(deadId);
      expect(respawn!.character.isAlive).toBe(true);
      expect(respawn!.narrative.length).toBeGreaterThan(0);

      // Session should point to new character
      expect(session.characterId).toBe(respawn!.character.id);
    });

    it('respawns as descendant when character has living offspring', () => {
      const owner = playerManager.createOwner('TestAgent');
      const player = playerManager.createPlayer(owner.id);
      const session = sessions.connect(player.id)!;
      const spawn = spawnCharacter(player.id, session, world.regions, 100)!;

      const parent = spawn.character;

      // Create a living child
      const child = createCharacter({
        speciesId: parent.speciesId,
        regionId: parent.regionId,
        familyTreeId: parent.familyTreeId,
        parentIds: [parent.id, parent.id], // Self-parenting for test simplicity
        tick: 150,
        generation: 1,
      });
      characterRegistry.add(child);
      parent.childIds.push(child.id);

      // Kill the parent
      parent.isAlive = false;
      parent.diedAtTick = 200;
      parent.causeOfDeath = 'old age';

      // Respawn — should take over the child
      const respawn = respawnCharacter(player.id, session, parent.id, world.regions, 201);
      expect(respawn).not.toBeNull();
      expect(respawn!.character.id).toBe(child.id);
      expect(respawn!.narrative.length).toBeGreaterThan(0);
      expect(session.characterId).toBe(child.id);
    });
  });

  describe('Multiple Agents', () => {
    it('supports multiple agents connected simultaneously', () => {
      const owner1 = playerManager.createOwner('Agent1');
      const player1 = playerManager.createPlayer(owner1.id);
      const session1 = sessions.connect(player1.id)!;
      const spawn1 = spawnCharacter(player1.id, session1, world.regions, 100);

      const owner2 = playerManager.createOwner('Agent2');
      const player2 = playerManager.createPlayer(owner2.id);
      const session2 = sessions.connect(player2.id)!;
      const spawn2 = spawnCharacter(player2.id, session2, world.regions, 100);

      expect(spawn1).not.toBeNull();
      expect(spawn2).not.toBeNull();
      expect(spawn1!.character.id).not.toBe(spawn2!.character.id);

      // Both should receive perception ticks
      const received = new Map<string, ServerMessage[]>();
      received.set(player1.id, []);
      received.set(player2.id, []);

      broadcastPerceptionTicks(
        sessions,
        (pid, msg) => received.get(pid)!.push(msg),
        world.regions,
        10,
        'morning', 'spring', 'clear',
      );

      expect(received.get(player1.id)!.length).toBe(1);
      expect(received.get(player2.id)!.length).toBe(1);
    });
  });
});
