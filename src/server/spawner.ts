// ============================================================
// Character Spawning — First spawn and respawn on death
// ============================================================

import type {
  PlayerId, CharacterId, Region, Character,
} from '../types.js';
import { createCharacter } from '../species/character.js';
import { characterRegistry } from '../species/registry.js';
import { speciesRegistry } from '../species/species.js';
import { playerManager } from '../game/player.js';
import { lineageManager } from '../game/lineage.js';
import { worldRNG } from '../simulation/random.js';
import { determineRespawn } from '../game/respawn.js';
import { isBiomeSuitable } from '../simulation/biome.js';
import type { Session } from './session.js';

/**
 * Find regions suitable for a species based on habitat layer AND biome/climate.
 * Prevents tropical species from spawning in polar regions and vice versa.
 */
function findSuitableRegions(
  speciesId: string,
  regions: Map<string, Region>,
): Region[] {
  const species = speciesRegistry.get(speciesId);
  if (!species) return [];

  const validLayers = new Set(species.traits.habitat);
  const suitable: Region[] = [];

  for (const region of regions.values()) {
    if (validLayers.has(region.layer) && isBiomeSuitable(species, region)) {
      suitable.push(region);
    }
  }

  return suitable;
}

/**
 * Pick a spawn region, preferring regions where conspecifics already live.
 * If no conspecifics exist yet, falls back to a random suitable region.
 * Connected regions (neighbours) of populated ones are also favoured so
 * the newcomer spawns "nearby" rather than on top of the herd.
 */
function pickSpawnRegion(
  speciesId: string,
  suitable: Region[],
  regions: Map<string, Region>,
): Region {
  const living = characterRegistry.getLivingBySpecies(speciesId);
  if (living.length === 0) return worldRNG.pick(suitable);

  // Collect regions where this species already has members
  const populatedIds = new Set(living.map(c => c.regionId));

  // Prefer: regions connected to populated ones (close proximity, not identical)
  const suitableIds = new Set(suitable.map(r => r.id));
  const nearby: Region[] = [];
  const populated: Region[] = [];

  for (const region of suitable) {
    if (populatedIds.has(region.id)) {
      populated.push(region);
      // Also add connected regions that are suitable
      for (const connId of region.connections) {
        if (suitableIds.has(connId) && !populatedIds.has(connId)) {
          const conn = regions.get(connId);
          if (conn) nearby.push(conn);
        }
      }
    }
  }

  // Best: spawn in a neighbouring region so they can find the herd
  if (nearby.length > 0) return worldRNG.pick(nearby);
  // Good: spawn in the same region as conspecifics
  if (populated.length > 0) return worldRNG.pick(populated);
  // Fallback: random suitable region
  return worldRNG.pick(suitable);
}

/**
 * Build a short narrative greeting for a newly spawned character.
 */
function buildSpawnNarrative(character: Character, regionName: string, speciesName: string): string {
  const greetings = [
    `A ${speciesName} named ${character.name} stirs to life in ${regionName}. The world stretches out, vast and unknowable.`,
    `${character.name}, a ${speciesName}, opens their eyes for the first time. ${regionName} hums with unfamiliar sounds. Everything must be learned.`,
    `The wind carries strange scents across ${regionName}. ${character.name}, a young ${speciesName}, takes a first uncertain breath.`,
    `In ${regionName}, a new ${speciesName} called ${character.name} begins to exist. No memories. No knowledge. Only instinct.`,
    `${character.name}, a ${speciesName}, awakens in ${regionName}. The ground is solid underfoot. The sky is overhead. Beyond that, nothing is certain.`,
  ];
  return worldRNG.pick(greetings);
}

/**
 * Build a narrative for a respawn event.
 */
function buildRespawnNarrative(
  character: Character,
  regionName: string,
  speciesName: string,
  isDescendant: boolean,
): string {
  if (isDescendant) {
    const lines = [
      `The bloodline endures. ${character.name}, a ${speciesName} in ${regionName}, carries the legacy forward.`,
      `Death claimed the elder, but the lineage persists. You are now ${character.name}, dwelling in ${regionName}.`,
      `A descendant stirs with new purpose. ${character.name} stands in ${regionName}, heir to a story not yet finished.`,
    ];
    return worldRNG.pick(lines);
  }

  const lines = [
    `The old lineage has ended. But the world turns on. A ${speciesName} named ${character.name} emerges in ${regionName}, unburdened by the past.`,
    `Extinction of one bloodline. Birth of another. ${character.name} knows nothing of what came before, only the soil of ${regionName} beneath them.`,
    `The cycle begins anew. ${character.name}, a ${speciesName}, draws first breath in ${regionName}. A blank slate in a world full of secrets.`,
  ];
  return worldRNG.pick(lines);
}

/**
 * Update a session with species perception data.
 */
function applyPerception(session: Session, speciesId: string): void {
  const species = speciesRegistry.get(speciesId);
  if (!species) return;

  session.speciesId = speciesId;
  session.speciesPerception = { ...species.traits.perception };
}

/**
 * Spawn a brand new character for an agent connecting for the first time.
 *
 * Picks a random extant species, finds a habitat-compatible region,
 * creates the character, registers it, starts a family tree, and
 * assigns it to the player.
 *
 * Returns the character and a narrative welcome, or null if spawning
 * is impossible (no extant species or no suitable regions).
 */
export function spawnCharacter(
  playerId: PlayerId,
  session: Session,
  regions: Map<string, Region>,
  tick: number,
): { character: Character; narrative: string } | null {
  const extant = speciesRegistry.getExtant();
  if (extant.length === 0) return null;

  const species = worldRNG.pick(extant);
  const suitable = findSuitableRegions(species.id, regions);
  if (suitable.length === 0) return null;

  const region = pickSpawnRegion(species.id, suitable, regions);

  const player = playerManager.getPlayer(playerId);
  if (!player) return null;

  // Create a placeholder tree ID -- we will replace it after tree creation
  const character = createCharacter({
    speciesId: species.id,
    regionId: region.id,
    familyTreeId: '' as any, // temporary, replaced below
    playerId,
    tick,
    isGenesisElder: true,
    generation: 0,
  });

  // Create the family tree rooted at this character
  const tree = lineageManager.createTree({
    speciesId: species.id,
    ownerId: player.ownerId,
    rootCharacterId: character.id,
  });

  // Patch the character with the real tree ID
  character.familyTreeId = tree.id;

  // Register and assign
  characterRegistry.add(character);
  speciesRegistry.updatePopulation(species.id, 1);
  speciesRegistry.incrementGenesisElderCount(species.id);
  playerManager.assignCharacter(playerId, character.id, tree.id);

  // Update session perception
  session.characterId = character.id;
  applyPerception(session, species.id);

  const narrative = buildSpawnNarrative(character, region.name, species.commonName);

  return { character, narrative };
}

/**
 * Respawn a player after their character dies.
 *
 * Uses determineRespawn to check for living descendants first.
 * If a descendant exists, the player takes control of it.
 * Otherwise, a new lineage begins with a random species.
 *
 * Returns the (new or inherited) character and a narrative, or null
 * if respawn is impossible.
 */
export function respawnCharacter(
  playerId: PlayerId,
  session: Session,
  deadCharacterId: CharacterId,
  regions: Map<string, Region>,
  tick: number,
): { character: Character; narrative: string } | null {
  const deadCharacter = characterRegistry.get(deadCharacterId);
  if (!deadCharacter) return null;

  const player = playerManager.getPlayer(playerId);
  if (!player) return null;

  // Gather living descendants for the respawn check
  const livingDescendants = characterRegistry.getLivingDescendants(deadCharacterId);

  const result = determineRespawn(deadCharacter, livingDescendants);

  if (result.type === 'descendant' && result.characterId) {
    // Continue as an existing descendant
    const descendant = characterRegistry.get(result.characterId as CharacterId);
    if (!descendant) return null;

    // Assign the player to the descendant
    descendant.playerId = playerId;
    playerManager.assignCharacter(playerId, descendant.id, descendant.familyTreeId);

    // Update session
    session.characterId = descendant.id;
    applyPerception(session, descendant.speciesId);

    const species = speciesRegistry.get(descendant.speciesId);
    const regionObj = regions.get(descendant.regionId);
    const speciesName = species?.commonName ?? 'creature';
    const regionName = regionObj?.name ?? 'an unknown land';

    const narrative = buildRespawnNarrative(descendant, regionName, speciesName, true);
    return { character: descendant, narrative };
  }

  // New lineage: spawn a fresh character of the determined species
  const suitable = findSuitableRegions(result.speciesId, regions);
  if (suitable.length === 0) return null;

  const region = pickSpawnRegion(result.speciesId, suitable, regions);

  const character = createCharacter({
    speciesId: result.speciesId,
    regionId: region.id,
    familyTreeId: '' as any, // temporary
    playerId,
    tick,
    isGenesisElder: true,
    generation: 0,
  });

  const tree = lineageManager.createTree({
    speciesId: result.speciesId,
    ownerId: player.ownerId,
    rootCharacterId: character.id,
  });

  character.familyTreeId = tree.id;

  characterRegistry.add(character);
  speciesRegistry.updatePopulation(result.speciesId, 1);
  speciesRegistry.incrementGenesisElderCount(result.speciesId);
  playerManager.assignCharacter(playerId, character.id, tree.id);

  session.characterId = character.id;
  applyPerception(session, result.speciesId);

  const species = speciesRegistry.get(result.speciesId);
  const speciesName = species?.commonName ?? 'creature';

  const narrative = buildRespawnNarrative(character, region.name, speciesName, false);
  return { character, narrative };
}
