// ============================================================
// Species Roles & Observation Skills
// ============================================================

import type { SpeciesRole, CharacterId, Character, RegionId } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';

export interface RoleAssignment {
  characterId: CharacterId;
  role: SpeciesRole;
  assignedAtTick: number;
  proficiency: number; // 0-1
}

export interface ObservationSkill {
  characterId: CharacterId;
  level: number; // 0-100
  lastTrainedTick: number;
  specializations: string[];
}

export class RoleRegistry {
  private roles: Map<CharacterId, RoleAssignment> = new Map();
  private observations: Map<CharacterId, ObservationSkill> = new Map();

  /** Assign a role to a character. Validates social structure. */
  assignRole(characterId: CharacterId, role: SpeciesRole, tick: number): string {
    const character = characterRegistry.get(characterId);
    if (!character) return 'Character not found.';

    const species = speciesRegistry.get(character.speciesId);
    if (!species) return 'Species not found.';

    // Validate social structure — solitary/pair cannot have roles
    const social = species.traits.socialStructure;
    if (social === 'solitary' || social === 'pair') {
      return `${species.commonName} are ${social} creatures and cannot take on group roles.`;
    }

    // Set role
    character.role = role;
    this.roles.set(characterId, {
      characterId,
      role,
      assignedAtTick: tick,
      proficiency: 0,
    });

    return `${character.name} has been assigned the role of ${role}.`;
  }

  /** Get role bonus for a given action type */
  getRoleBonus(character: Character, actionType: string): number {
    const assignment = this.roles.get(character.id);
    if (!assignment || assignment.role === 'none') return 0;

    const proficiency = assignment.proficiency;
    const bonusMap: Record<string, string[]> = {
      sentinel: ['observe', 'defend', 'counter_spy'],
      scout: ['explore', 'move'],
      forager: ['forage', 'gather'],
      guardian: ['attack', 'defend'],
      healer: ['rest', 'communicate'],
      spy: ['spy', 'infiltrate', 'spread_rumors'],
    };

    const boosted = bonusMap[assignment.role] ?? [];
    if (boosted.includes(actionType)) {
      return 0.1 + proficiency * 0.2; // 0.1 to 0.3 bonus
    }
    return 0;
  }

  /** Train observation through observe actions */
  trainObservation(character: Character, tick: number, context: {
    isNight?: boolean;
    nearbyPredators?: number;
  }): ObservationSkill {
    let skill = this.observations.get(character.id);
    if (!skill) {
      skill = {
        characterId: character.id,
        level: 0,
        lastTrainedTick: tick,
        specializations: [],
      };
      this.observations.set(character.id, skill);
    }

    // Base gain: 1-3 per observe action
    let gain = 1 + Math.random() * 2;

    // Night training bonus
    if (context.isNight) gain += 2;

    // Nearby predator bonus
    if (context.nearbyPredators && context.nearbyPredators > 0) gain += 1;

    skill.level = Math.min(100, skill.level + gain);
    skill.lastTrainedTick = tick;

    return { ...skill };
  }

  /** Get observation modifier — reduces predator encounter risk */
  getObservationModifier(character: Character): number {
    const skill = this.observations.get(character.id);
    if (!skill) return 0;
    // Up to 0.6 reduction at level 100
    return (skill.level / 100) * 0.6;
  }

  /** Get sentinel protection level in a region for a species */
  getSentinelProtection(regionId: RegionId, speciesId: string): number {
    let protection = 0;

    for (const [charId, assignment] of this.roles) {
      if (assignment.role !== 'sentinel') continue;

      const character = characterRegistry.get(charId);
      if (!character || !character.isAlive) continue;
      if (character.regionId !== regionId) continue;
      if (character.speciesId !== speciesId) continue;

      protection += 0.1 + assignment.proficiency * 0.15;
    }

    return Math.min(0.5, protection); // Cap at 50% reduction
  }

  /** Get night vulnerability modifier */
  getNightVulnerability(character: Character, isNight: boolean): number {
    if (!isNight) return 0;

    const species = speciesRegistry.get(character.speciesId);
    if (species?.traits.nocturnal) return 0; // Nocturnal species unaffected

    // +50% predator risk at night for non-nocturnal
    let vulnerability = 0.5;

    // Sentinel protection reduces this
    const sentinelProtection = this.getSentinelProtection(character.regionId, character.speciesId);
    vulnerability *= (1 - sentinelProtection);

    return vulnerability;
  }

  /** Tick role proficiency growth */
  tickRoleProficiency(tick: number): void {
    for (const [charId, assignment] of this.roles) {
      if (assignment.role === 'none') continue;

      const character = characterRegistry.get(charId);
      if (!character || !character.isAlive) {
        this.roles.delete(charId);
        continue;
      }

      // Proficiency grows slowly while role is active
      assignment.proficiency = Math.min(1, assignment.proficiency + 0.002);
    }
  }

  /** Get role assignment for a character */
  getRole(characterId: CharacterId): RoleAssignment | undefined {
    return this.roles.get(characterId);
  }

  /** Get observation skill for a character */
  getObservation(characterId: CharacterId): ObservationSkill | undefined {
    return this.observations.get(characterId);
  }

  clear(): void {
    this.roles.clear();
    this.observations.clear();
  }
}

export let roleRegistry = new RoleRegistry();
export function _installRoleRegistry(instance: RoleRegistry): void { roleRegistry = instance; }
