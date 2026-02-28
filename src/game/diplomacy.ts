// ============================================================
// Cross-Species Diplomacy & Pact System
// ============================================================

import type { Character, CharacterId, Pact } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { canCommunicate } from './language.js';
import { getGeneValue } from '../species/character.js';
import { speciesRegistry } from '../species/species.js';
import { modifyRelationshipStrength } from './social.js';

export interface ProposalResult {
  accepted: boolean;
  narrative: string;
  pact?: Pact;
}

/** Evaluate whether a proposal between two characters succeeds */
export function evaluateProposal(
  proposer: Character,
  target: Character,
  offer: string,
  demand: string,
): ProposalResult {
  // 1. Can they communicate?
  const comm = canCommunicate(proposer, target);
  if (!comm.canTalk && comm.clarity < 0.2) {
    return {
      accepted: false,
      narrative: `${proposer.name} tries to propose a deal, but the language barrier is absolute. The message does not get through.`,
    };
  }

  // 2. Is the proposer trusted?
  const rel = proposer.relationships.find(r => r.targetId === target.id);
  const relStrength = rel?.strength ?? 0;

  // Enemies auto-reject 80%
  if (relStrength < -0.5 && worldRNG.chance(0.8)) {
    return {
      accepted: false,
      narrative: `${target.name} regards ${proposer.name} with open hostility. The proposal is rejected before it begins.`,
    };
  }

  // 3. Target personality check
  const targetAggression = getGeneValue(target, 'aggression');
  const targetSociability = getGeneValue(target, 'sociability');
  const targetIntelligence = getGeneValue(target, 'intelligence');

  // Base acceptance: 40%
  let acceptChance = 0.4;

  // Sociability increases acceptance
  acceptChance += targetSociability * 0.004;

  // Aggression decreases acceptance
  acceptChance -= targetAggression * 0.003;

  // Intelligence makes better decisions (helps for good deals)
  acceptChance += targetIntelligence * 0.001;

  // Communication clarity affects understanding
  acceptChance *= comm.clarity;

  // Existing relationship modifies acceptance
  acceptChance += relStrength * 0.2;

  // Cross-species proposals are harder
  if (proposer.speciesId !== target.speciesId) {
    acceptChance *= 0.7;
  }

  acceptChance = Math.max(0.05, Math.min(0.95, acceptChance));

  const accepted = worldRNG.chance(acceptChance);

  if (accepted) {
    const pact: Pact = {
      id: crypto.randomUUID(),
      proposerId: proposer.id,
      targetId: target.id,
      offer,
      demand,
      acceptedAtTick: 0, // caller should set
      expiresAtTick: null,
      broken: false,
      brokenBy: null,
    };

    const sp1 = speciesRegistry.get(proposer.speciesId);
    const sp2 = speciesRegistry.get(target.speciesId);

    return {
      accepted: true,
      narrative: `${proposer.name} the ${sp1?.commonName ?? 'creature'} and ${target.name} the ${sp2?.commonName ?? 'creature'} reach an agreement. A pact is formed.`,
      pact,
    };
  }

  return {
    accepted: false,
    narrative: `${target.name} considers ${proposer.name}'s proposal and declines. The offer was not compelling enough.`,
  };
}

// ============================================================
// Pact Registry — tracks active pacts
// ============================================================

export class PactRegistry {
  private pacts: Map<string, Pact> = new Map();

  add(pact: Pact): void {
    this.pacts.set(pact.id, pact);
  }

  get(id: string): Pact | undefined {
    return this.pacts.get(id);
  }

  /** Get all active pacts involving a character */
  getForCharacter(characterId: CharacterId): Pact[] {
    return Array.from(this.pacts.values()).filter(
      p => !p.broken && (p.proposerId === characterId || p.targetId === characterId),
    );
  }

  /** Break a pact — betrayal */
  breakPact(
    pactId: string,
    breakerId: CharacterId,
    betrayed: Character,
    witnesses: Character[],
  ): void {
    const pact = this.pacts.get(pactId);
    if (!pact) return;

    pact.broken = true;
    pact.brokenBy = breakerId;

    // Destroy relationship with betrayed
    modifyRelationshipStrength(betrayed, breakerId, -1.5); // goes to -1

    // Witnesses spread reputation damage
    for (const witness of witnesses) {
      if (witness.speciesId === betrayed.speciesId) {
        modifyRelationshipStrength(witness, breakerId, -0.3);
      }
    }
  }

  /** Get all pacts */
  getAll(): Pact[] {
    return Array.from(this.pacts.values());
  }

  clear(): void {
    this.pacts.clear();
  }
}

export const pactRegistry = new PactRegistry();
