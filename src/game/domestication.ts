// ============================================================
// Domestication — Species Control & Bonds
// ============================================================

import type { Character, CharacterId, SpeciesId, RegionId, WorldEvent } from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from '../species/species.js';
import { characterRegistry } from '../species/registry.js';
import { getGeneValue } from '../species/character.js';
import { getEcosystem } from '../simulation/ecosystem.js';
import { addBidirectionalRelationship } from './social.js';

// ============================================================
// Types
// ============================================================

export type DomesticationType = 'enslavement' | 'symbiosis' | 'defense_bond' | 'husbandry';

export interface DomesticationBenefit {
  type: 'food_production' | 'material_production' | 'defense_bonus' | 'labor' | 'transport' | 'scouting';
  magnitude: number;
}

export interface DomesticationBond {
  id: string;
  masterId: CharacterId;
  masterSpeciesId: SpeciesId;
  servantId: CharacterId;
  servantSpeciesId: SpeciesId;
  regionId: RegionId;
  type: DomesticationType;
  formedAtTick: number;
  stability: number;           // 0-1
  rebellionPressure: number;   // 0-1
  benefits: DomesticationBenefit[];
  familyTreeImpact: number;
}

export interface DomesticationAttempt {
  success: boolean;
  narrative: string;
  bond?: DomesticationBond;
}

// ============================================================
// Domestication Registry — singleton
// ============================================================

export class DomesticationRegistry {
  private bonds: Map<string, DomesticationBond> = new Map();

  /** Check if domestication is possible and what type fits best */
  canDomesticate(masterSpeciesId: SpeciesId, targetSpeciesId: SpeciesId): {
    possible: boolean;
    difficulty: number;
    bestType: DomesticationType;
    reasons: string[];
  } {
    const master = speciesRegistry.get(masterSpeciesId);
    const target = speciesRegistry.get(targetSpeciesId);

    if (!master || !target) {
      return { possible: false, difficulty: 1, bestType: 'husbandry', reasons: ['Unknown species'] };
    }

    const reasons: string[] = [];
    let bestType: DomesticationType = 'husbandry';
    let difficulty = 0.7;

    // Check enslavement: strength * size dominance
    const masterPower = master.traits.strength * master.traits.size;
    const targetPower = target.traits.strength * target.traits.size;
    if (masterPower >= targetPower * 1.5) {
      bestType = 'enslavement';
      difficulty = 0.4;
      reasons.push('Physical dominance allows enslavement');
    }

    // Check symbiosis: both intelligent
    if (master.traits.intelligence > 25 && target.traits.intelligence > 25) {
      bestType = 'symbiosis';
      difficulty = 0.5;
      reasons.push('Both species are intelligent enough for symbiosis');
    }

    // Check defense bond: shared predator
    const ecosystem = getEcosystem();
    if (ecosystem) {
      const masterPredators = ecosystem.foodWeb
        .filter(e => e.preyId === masterSpeciesId)
        .map(e => e.predatorId);
      const targetPredators = ecosystem.foodWeb
        .filter(e => e.preyId === targetSpeciesId)
        .map(e => e.predatorId);
      const sharedPredators = masterPredators.filter(p => targetPredators.includes(p));
      if (sharedPredators.length > 0) {
        bestType = 'defense_bond';
        difficulty = 0.3;
        reasons.push('Shared predators enable a defense pact');
      }
    }

    // Check husbandry: master intelligent, target is herbivore
    if (master.traits.intelligence > 30 && target.traits.diet === 'herbivore') {
      if (bestType !== 'defense_bond' && bestType !== 'symbiosis') {
        bestType = 'husbandry';
        difficulty = 0.5;
        reasons.push('Target can be raised for resources');
      }
    }

    const possible = reasons.length > 0;
    return { possible, difficulty, bestType, reasons };
  }

  /** Attempt domestication */
  attemptDomestication(
    master: Character,
    target: Character,
    desiredType: DomesticationType | undefined,
    tick: number,
  ): DomesticationAttempt {
    const check = this.canDomesticate(master.speciesId, target.speciesId);
    if (!check.possible) {
      return { success: false, narrative: 'These species cannot form a domestication bond.' };
    }

    const type = desiredType ?? check.bestType;
    const masterStrength = getGeneValue(master, 'strength');
    const servantStrength = getGeneValue(target, 'strength');
    const masterIntel = getGeneValue(master, 'intelligence');
    const servantAggression = getGeneValue(target, 'aggression');
    const relationship = master.relationships.find(r => r.targetId === target.id);
    const relStrength = relationship?.strength ?? 0;

    const successChance = Math.max(0.05, Math.min(0.9,
      0.3 +
      (masterStrength - servantStrength) * 0.005 +
      masterIntel * 0.003 -
      servantAggression * 0.004 +
      relStrength * 0.2
    ));

    if (!worldRNG.chance(successChance)) {
      const targetSpecies = speciesRegistry.get(target.speciesId);
      return {
        success: false,
        narrative: `The ${targetSpecies?.commonName ?? 'creature'} resists your attempts at ${type}. It will not be controlled.`,
      };
    }

    // Create bond
    const benefits = this.calculateBenefits(type, master, target);
    const bond: DomesticationBond = {
      id: crypto.randomUUID(),
      masterId: master.id,
      masterSpeciesId: master.speciesId,
      servantId: target.id,
      servantSpeciesId: target.speciesId,
      regionId: master.regionId,
      type,
      formedAtTick: tick,
      stability: 0.8,
      rebellionPressure: 0,
      benefits,
      familyTreeImpact: 0,
    };

    this.bonds.set(bond.id, bond);

    // Create relationships
    const relType = type === 'symbiosis' ? 'symbiont' as const
      : type === 'defense_bond' ? 'ally' as const
      : 'master' as const;

    if (relType === 'master') {
      addBidirectionalRelationship(master, target, 'master', 0.5);
    } else {
      addBidirectionalRelationship(master, target, relType, 0.6);
    }

    const targetSpecies = speciesRegistry.get(target.speciesId);
    return {
      success: true,
      narrative: `A ${type} bond forms with the ${targetSpecies?.commonName ?? 'creature'}. ${this.getBondNarrative(type)}.`,
      bond,
    };
  }

  /** Get aggregated benefits for a master */
  getDomesticationBenefits(masterId: CharacterId): DomesticationBenefit[] {
    const benefits: DomesticationBenefit[] = [];
    for (const bond of this.bonds.values()) {
      if (bond.masterId === masterId) {
        // Check servant is still alive
        const servant = characterRegistry.get(bond.servantId);
        if (servant?.isAlive) {
          benefits.push(...bond.benefits);
        }
      }
    }
    return benefits;
  }

  /** Tick all domestication bonds — rebellion pressure, benefit generation */
  tickDomestication(tick: number): WorldEvent[] {
    const events: WorldEvent[] = [];

    for (const bond of this.bonds.values()) {
      const servant = characterRegistry.get(bond.servantId);
      const master = characterRegistry.get(bond.masterId);

      // Clean up dead bonds
      if (!servant?.isAlive || !master?.isAlive) {
        this.bonds.delete(bond.id);
        continue;
      }

      // Rebellion pressure grows
      const pressureRate: Record<DomesticationType, number> = {
        enslavement: 0.002,
        symbiosis: 0.0002,
        defense_bond: 0.0005,
        husbandry: 0.001,
      };
      bond.rebellionPressure = Math.min(1, bond.rebellionPressure + (pressureRate[bond.type] ?? 0.001));

      // Check for rebellion
      if (bond.rebellionPressure > 0.8 && worldRNG.chance(0.05)) {
        const rebellion = this.checkRebellion(bond, tick);
        if (rebellion.rebelled) {
          const servantSpecies = speciesRegistry.get(bond.servantSpeciesId);
          events.push({
            id: crypto.randomUUID(),
            type: 'war',
            level: 'personal',
            regionIds: [bond.regionId],
            description: rebellion.narrative,
            tick,
            effects: [{ type: 'rebellion', magnitude: 0.8 }],
            resolved: true,
          });
        }
      }

      // Family tree impact accumulates
      const impactRates: Record<DomesticationType, number> = {
        symbiosis: 0.0005,
        defense_bond: 0.0003,
        husbandry: 0.0004,
        enslavement: 0.0006,
      };
      bond.familyTreeImpact += impactRates[bond.type] ?? 0;
    }

    return events;
  }

  /** Check if a rebellion occurs */
  checkRebellion(bond: DomesticationBond, tick: number): { rebelled: boolean; narrative: string } {
    const servant = characterRegistry.get(bond.servantId);
    const master = characterRegistry.get(bond.masterId);
    if (!servant || !master) return { rebelled: false, narrative: '' };

    // Rebellion: servant attacks master, bond dissolves
    const servantAgg = getGeneValue(servant, 'aggression');
    servant.relationships = servant.relationships.map(r => {
      if (r.targetId === master.id) return { ...r, type: 'enemy' as const, strength: -0.8 };
      return r;
    });

    // Damage to master
    const damage = getGeneValue(servant, 'strength') * 0.01;
    master.health = Math.max(0, master.health - damage);

    // Servant gains aggression boost (permanent via knowledge)
    servant.knowledge.push({
      topic: 'rebellion_experience',
      detail: 'Broke free from domestication',
      learnedAtTick: tick,
      source: 'experience',
    });

    // Family tree penalty
    bond.familyTreeImpact = -2.0;

    // Remove bond
    this.bonds.delete(bond.id);

    const servantSpecies = speciesRegistry.get(bond.servantSpeciesId);
    return {
      rebelled: true,
      narrative: `The ${servantSpecies?.commonName ?? 'creature'} rebels against its ${bond.type}! It strikes back at its master and breaks free.`,
    };
  }

  /** Release a domesticated creature */
  releaseDomesticated(bondId: string, tick: number): string {
    const bond = this.bonds.get(bondId);
    if (!bond) return 'No such bond exists.';

    this.bonds.delete(bondId);
    const servantSpecies = speciesRegistry.get(bond.servantSpeciesId);
    return `The ${servantSpecies?.commonName ?? 'creature'} is released from its ${bond.type} bond.`;
  }

  /** Get bonds where a character is master */
  getBondsForMaster(masterId: CharacterId): DomesticationBond[] {
    return Array.from(this.bonds.values()).filter(b => b.masterId === masterId);
  }

  /** Get bond where a character is servant */
  getBondForServant(servantId: CharacterId): DomesticationBond | undefined {
    return Array.from(this.bonds.values()).find(b => b.servantId === servantId);
  }

  /** Get defense bond allies in a region */
  getDefenseBondAllies(characterId: CharacterId, regionId: RegionId): Character[] {
    const allies: Character[] = [];
    for (const bond of this.bonds.values()) {
      if (bond.type !== 'defense_bond') continue;
      if (bond.regionId !== regionId) continue;

      if (bond.masterId === characterId) {
        const servant = characterRegistry.get(bond.servantId);
        if (servant?.isAlive) allies.push(servant);
      } else if (bond.servantId === characterId) {
        const master = characterRegistry.get(bond.masterId);
        if (master?.isAlive) allies.push(master);
      }
    }
    return allies;
  }

  private calculateBenefits(type: DomesticationType, _master: Character, target: Character): DomesticationBenefit[] {
    const targetSpecies = speciesRegistry.get(target.speciesId);
    const benefits: DomesticationBenefit[] = [];

    switch (type) {
      case 'husbandry':
        benefits.push({ type: 'food_production', magnitude: 0.2 });
        if (targetSpecies && targetSpecies.traits.size > 30) {
          benefits.push({ type: 'material_production', magnitude: 0.1 });
        }
        break;
      case 'defense_bond':
        benefits.push({ type: 'defense_bonus', magnitude: 0.15 + getGeneValue(target, 'strength') * 0.002 });
        break;
      case 'enslavement':
        benefits.push({ type: 'labor', magnitude: 0.2 });
        if (targetSpecies?.traits.canFly) {
          benefits.push({ type: 'scouting', magnitude: 0.15 });
        }
        if (targetSpecies && targetSpecies.traits.size > 50) {
          benefits.push({ type: 'transport', magnitude: 0.15 });
        }
        break;
      case 'symbiosis':
        benefits.push({ type: 'defense_bonus', magnitude: 0.1 });
        benefits.push({ type: 'scouting', magnitude: 0.1 });
        break;
    }

    return benefits;
  }

  private getBondNarrative(type: DomesticationType): string {
    switch (type) {
      case 'enslavement': return 'The creature submits, though resentment simmers beneath';
      case 'symbiosis': return 'Both species benefit from this partnership';
      case 'defense_bond': return 'Together you stand stronger against shared enemies';
      case 'husbandry': return 'The creature accepts your care in exchange for sustenance';
    }
  }

  getAll(): DomesticationBond[] {
    return Array.from(this.bonds.values());
  }

  restore(bond: DomesticationBond): void {
    this.bonds.set(bond.id, bond);
  }

  clear(): void {
    this.bonds.clear();
  }
}

export let domesticationRegistry = new DomesticationRegistry();
export function _installDomesticationRegistry(instance: DomesticationRegistry): void { domesticationRegistry = instance; }
