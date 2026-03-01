// ============================================================
// Reactive Encounter System — Situation Response
// ============================================================

import type {
  EncounterEvent, EncounterOption, EncounterType,
  CharacterId, Character,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { getGeneValue } from '../species/character.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';
import { corpseRegistry } from '../simulation/corpses.js';
import { allianceRegistry } from './alliance.js';
import { domesticationRegistry } from './domestication.js';

// ============================================================
// Encounter Registry — singleton
// ============================================================

export class EncounterRegistry {
  private encounters: Map<string, EncounterEvent> = new Map();

  createEncounter(
    characterId: CharacterId,
    type: EncounterType,
    context: { predatorId?: CharacterId; threatLevel?: number },
    tick: number,
  ): EncounterEvent {
    const options = getEncounterOptions(type);

    const encounter: EncounterEvent = {
      id: crypto.randomUUID(),
      type,
      characterId,
      triggerTick: tick,
      predatorId: context.predatorId ?? null,
      threatLevel: context.threatLevel ?? 0.5,
      options,
      expiresAtTick: tick + 3,
      resolved: false,
    };

    this.encounters.set(encounter.id, encounter);
    return encounter;
  }

  resolveEncounter(encounterId: string, chosenAction: string, tick: number): EncounterResolution {
    const encounter = this.encounters.get(encounterId);
    if (!encounter || encounter.resolved) {
      return { success: false, narrative: 'The moment has passed.', damage: 0, escaped: false };
    }

    encounter.resolved = true;
    const character = characterRegistry.get(encounter.characterId);
    if (!character || !character.isAlive) {
      return { success: false, narrative: 'Too late.', damage: 0, escaped: false };
    }

    const option = encounter.options.find(o => o.action === chosenAction);
    if (!option) {
      // Invalid choice — worst outcome
      return resolveWorstOutcome(character, encounter, tick);
    }

    return resolveChoice(character, encounter, option, tick);
  }

  getActiveEncounters(characterId: CharacterId): EncounterEvent[] {
    return Array.from(this.encounters.values()).filter(
      e => e.characterId === characterId && !e.resolved,
    );
  }

  /** Expire old encounters with worst outcome */
  expireEncounters(tick: number): EncounterResolution[] {
    const results: EncounterResolution[] = [];

    for (const encounter of this.encounters.values()) {
      if (encounter.resolved) continue;
      if (tick < encounter.expiresAtTick) continue;

      encounter.resolved = true;
      const character = characterRegistry.get(encounter.characterId);
      if (!character || !character.isAlive) continue;

      results.push(resolveWorstOutcome(character, encounter, tick));
    }

    return results;
  }

  clear(): void {
    this.encounters.clear();
  }

  get(id: string): EncounterEvent | undefined {
    return this.encounters.get(id);
  }
}

export let encounterRegistry = new EncounterRegistry();
export function _installEncounterRegistry(instance: EncounterRegistry): void { encounterRegistry = instance; }

// ============================================================
// Encounter Option Generation
// ============================================================

function getEncounterOptions(type: EncounterType): EncounterOption[] {
  switch (type) {
    case 'predator_spotted':
      return [
        { action: 'hide', description: 'Conceal yourself and hope it passes', successFactors: ['speed', 'size'], riskLevel: 0.3 },
        { action: 'flee', description: 'Run for your life', successFactors: ['speed'], riskLevel: 0.4 },
        { action: 'fight', description: 'Stand and fight the predator', successFactors: ['strength', 'size'], riskLevel: 0.7 },
        { action: 'call_for_help', description: 'Call out for nearby allies', successFactors: ['sociability'], riskLevel: 0.5 },
      ];
    case 'territorial_challenge':
      return [
        { action: 'submit', description: 'Back down and accept lower rank', successFactors: [], riskLevel: 0.1 },
        { action: 'challenge', description: 'Fight for dominance', successFactors: ['strength'], riskLevel: 0.6 },
        { action: 'negotiate', description: 'Try to find a middle ground', successFactors: ['intelligence', 'sociability'], riskLevel: 0.3 },
        { action: 'retreat', description: 'Leave the territory entirely', successFactors: ['speed'], riskLevel: 0.2 },
      ];
    case 'stampede':
      return [
        { action: 'dodge', description: 'Try to dodge the stampede', successFactors: ['speed', 'size'], riskLevel: 0.5 },
        { action: 'burrow', description: 'Dig underground to safety', successFactors: ['strength'], riskLevel: 0.3 },
        { action: 'climb', description: 'Climb to higher ground', successFactors: ['speed', 'strength'], riskLevel: 0.4 },
      ];
    case 'natural_hazard':
      return [
        { action: 'flee', description: 'Run from the hazard', successFactors: ['speed'], riskLevel: 0.4 },
        { action: 'shelter', description: 'Find shelter and wait it out', successFactors: ['intelligence'], riskLevel: 0.3 },
        { action: 'endure', description: 'Tough it out', successFactors: ['endurance', 'strength'], riskLevel: 0.6 },
      ];
    case 'rival_confrontation':
      return [
        { action: 'fight', description: 'Engage in combat', successFactors: ['strength', 'aggression'], riskLevel: 0.6 },
        { action: 'intimidate', description: 'Try to scare them off', successFactors: ['strength', 'size'], riskLevel: 0.4 },
        { action: 'flee', description: 'Avoid the confrontation', successFactors: ['speed'], riskLevel: 0.2 },
      ];
    case 'spy_detected':
      return [
        { action: 'capture', description: 'Attempt to capture the spy', successFactors: ['strength', 'speed'], riskLevel: 0.5 },
        { action: 'chase', description: 'Chase the spy away', successFactors: ['speed'], riskLevel: 0.3 },
        { action: 'alert_family', description: 'Alert your family to the spy\'s presence', successFactors: ['sociability'], riskLevel: 0.1 },
        { action: 'ignore', description: 'Let the spy go unnoticed', successFactors: [], riskLevel: 0.0 },
      ];
  }
}

// ============================================================
// Resolution Logic
// ============================================================

export interface EncounterResolution {
  success: boolean;
  narrative: string;
  damage: number;
  escaped: boolean;
}

function resolveChoice(
  character: Character,
  encounter: EncounterEvent,
  option: EncounterOption,
  tick: number,
): EncounterResolution {
  // Calculate success from character's relevant genes
  let successChance = 0.5;
  for (const factor of option.successFactors) {
    const geneVal = getGeneValue(character, factor);
    successChance += (geneVal - 50) * 0.005;
  }

  // Small size helps with hiding
  if (option.action === 'hide') {
    const size = getGeneValue(character, 'size');
    successChance += (50 - size) * 0.005;  // smaller = better for hiding
  }

  // Call for help: check for nearby allies, alliance members, and domestication allies
  if (option.action === 'call_for_help') {
    const allies = characterRegistry.getByRegion(character.regionId)
      .filter(c => c.id !== character.id && c.isAlive)
      .filter(c => {
        const rel = character.relationships.find(r => r.targetId === c.id);
        return rel && rel.strength > 0.3;
      });

    // Add alliance members from other species
    const regionAlliances = allianceRegistry.getAlliancesInRegion(character.regionId);
    for (const alliance of regionAlliances) {
      if (!alliance.memberSpecies.includes(character.speciesId)) continue;
      for (const allySpeciesId of alliance.memberSpecies) {
        if (allySpeciesId === character.speciesId) continue;
        const allyChars = characterRegistry.getByRegion(character.regionId)
          .filter(c => c.speciesId === allySpeciesId && c.isAlive);
        for (const a of allyChars.slice(0, 2)) {
          if (!allies.some(x => x.id === a.id)) allies.push(a);
        }
      }
    }

    // Add domesticated defense_bond allies
    const defenseAllies = domesticationRegistry.getDefenseBondAllies(character.id, character.regionId);
    for (const a of defenseAllies) {
      if (!allies.some(x => x.id === a.id)) allies.push(a);
    }

    successChance += allies.length * 0.1;

    // Combined strength of allies
    let allyStrength = 0;
    for (const ally of allies.slice(0, 5)) {
      allyStrength += getGeneValue(ally, 'strength') * 0.003;
    }
    successChance += allyStrength;
  }

  // Threat level reduces success
  successChance -= encounter.threatLevel * 0.2;

  successChance = Math.max(0.05, Math.min(0.95, successChance));
  const success = worldRNG.chance(successChance);

  if (success) {
    return resolveSuccess(character, encounter, option);
  }

  return resolveFailure(character, encounter, option, tick);
}

function resolveSuccess(
  character: Character,
  encounter: EncounterEvent,
  option: EncounterOption,
): EncounterResolution {
  const predSpecies = encounter.predatorId
    ? speciesRegistry.get(characterRegistry.get(encounter.predatorId)?.speciesId ?? '')
    : null;
  const threatName = predSpecies?.commonName ?? 'the threat';

  const narratives: Record<string, string> = {
    hide: `You press yourself low and still. The ${threatName} passes without noticing you.`,
    flee: `Your legs carry you to safety. The ${threatName} falls behind.`,
    fight: `You turn and fight! The ${threatName} backs away, wounded.`,
    call_for_help: `Your call is answered! Allies rush to your aid and the ${threatName} retreats.`,
    submit: `You lower your head in submission. The tension fades, your pride bruised but body intact.`,
    challenge: `You rise to the challenge and prove your dominance!`,
    negotiate: `Through careful posturing and patience, you reach an understanding.`,
    retreat: `You slip away before things escalate.`,
    dodge: `You twist and leap out of the way just in time!`,
    burrow: `You dig frantically and shelter underground as the danger passes overhead.`,
    climb: `You scramble upward and watch the danger pass below.`,
    shelter: `You find cover and wait. The hazard passes.`,
    endure: `You steel yourself and weather the worst of it.`,
    intimidate: `Your display of strength sends the rival running.`,
  };

  // If fight succeeded and predator exists, damage the predator
  if (option.action === 'fight' && encounter.predatorId) {
    const predator = characterRegistry.get(encounter.predatorId);
    if (predator && predator.isAlive) {
      const damage = getGeneValue(character, 'strength') * 0.008;
      predator.health = Math.max(0, predator.health - damage);
    }
  }

  return {
    success: true,
    narrative: narratives[option.action] ?? `You handle the situation successfully.`,
    damage: 0,
    escaped: true,
  };
}

function resolveFailure(
  character: Character,
  encounter: EncounterEvent,
  option: EncounterOption,
  tick: number,
): EncounterResolution {
  const damage = option.riskLevel * encounter.threatLevel * 0.3;
  character.health = Math.max(0, character.health - damage);

  let died = false;
  if (character.health <= 0) {
    const predSpecies = encounter.predatorId
      ? speciesRegistry.get(characterRegistry.get(encounter.predatorId)?.speciesId ?? '')
      : null;
    const deathCause = encounter.type === 'predator_spotted'
      ? `killed by ${predSpecies?.commonName ?? 'a predator'}`
      : `killed during ${encounter.type}`;
    characterRegistry.markDead(character.id, tick, deathCause);
    died = true;
    corpseRegistry.createCorpse(character, tick);
  }

  const predSpecies = encounter.predatorId
    ? speciesRegistry.get(characterRegistry.get(encounter.predatorId)?.speciesId ?? '')
    : null;
  const threatName = predSpecies?.commonName ?? 'the threat';

  const narrative = died
    ? `Your attempt to ${option.action} fails. The ${threatName} is upon you. You do not survive.`
    : `Your attempt to ${option.action} fails. The ${threatName} strikes, leaving you wounded.`;

  return {
    success: false,
    narrative,
    damage,
    escaped: false,
  };
}

function resolveWorstOutcome(
  character: Character,
  encounter: EncounterEvent,
  tick: number,
): EncounterResolution {
  const damage = encounter.threatLevel * 0.3;
  character.health = Math.max(0, character.health - damage);

  if (character.health <= 0) {
    characterRegistry.markDead(character.id, tick, `caught off guard during ${encounter.type}`);
    corpseRegistry.createCorpse(character, tick);
  }

  return {
    success: false,
    narrative: `You hesitate too long and the danger catches up to you.`,
    damage,
    escaped: false,
  };
}
