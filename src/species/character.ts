// ============================================================
// Individual Character Model
// ============================================================

import type {
  Character, CharacterId, SpeciesId, PlayerId, RegionId,
  FamilyTreeId, Genetics, Gene, Sex,
} from '../types.js';
import { worldRNG } from '../simulation/random.js';
import { speciesRegistry } from './species.js';
import { calculateOffspringGenetics } from './genetics.js';
import { corpseRegistry } from '../simulation/corpses.js';
import { domesticationRegistry } from '../game/domestication.js';
import { characterRegistry } from './registry.js';
import { mainCharacterManager } from '../game/main-character.js';

export function createCharacter(params: {
  speciesId: SpeciesId;
  regionId: RegionId;
  familyTreeId: FamilyTreeId;
  playerId?: PlayerId;
  parentIds?: [CharacterId, CharacterId];
  parentGenetics?: [Genetics, Genetics];
  tick: number;
  isGenesisElder?: boolean;
  sex?: Sex;
  generation?: number;
}): Character {
  const genetics = params.parentGenetics
    ? calculateOffspringGenetics(
        { genetics: params.parentGenetics[0] } as any,
        { genetics: params.parentGenetics[1] } as any,
      )
    : generateBaseGenetics(params.speciesId);

  const name = generateName(params.speciesId);
  const sex: Sex = params.sex ?? (worldRNG.chance(0.5) ? 'male' : 'female');

  return {
    id: crypto.randomUUID() as CharacterId,
    name,
    speciesId: params.speciesId,
    playerId: params.playerId ?? null,
    regionId: params.regionId,
    familyTreeId: params.familyTreeId,
    bornAtTick: params.tick,
    diedAtTick: null,
    causeOfDeath: null,
    age: 0,
    isAlive: true,
    sex,
    generation: params.generation ?? 0,
    genetics,
    health: 1,
    energy: 1,
    hunger: 0,
    stamina: 1,
    lastBreedingTick: null,
    gestationEndsAtTick: null,
    relationships: [],
    parentIds: params.parentIds ?? null,
    childIds: [],
    inventory: [],
    knowledge: [],
    fame: 0,
    achievements: [],
    isGenesisElder: params.isGenesisElder ?? false,
    socialRank: params.isGenesisElder ? 50 : 0,
    loyalties: new Map(),
    role: 'none',
    characterClass: params.isGenesisElder ? 'main' : 'regular',
    impactScore: 0,
  };
}

function generateBaseGenetics(speciesId: SpeciesId): Genetics {
  const rng = worldRNG;
  const species = speciesRegistry.get(speciesId);
  const traits = species?.traits;

  // Seed core genes from species traits (with individual variation ±10)
  const genes: Gene[] = [
    { trait: 'size', value: clampGene(traits?.size ?? 50, 10), dominant: rng.chance(0.5) },
    { trait: 'speed', value: clampGene(traits?.speed ?? 50, 10), dominant: rng.chance(0.5) },
    { trait: 'strength', value: clampGene(traits?.strength ?? 50, 10), dominant: rng.chance(0.5) },
    { trait: 'intelligence', value: clampGene(traits?.intelligence ?? 50, 10), dominant: rng.chance(0.5) },
    { trait: 'endurance', value: clampGene(rng.gaussian(50, 10), 0), dominant: rng.chance(0.5) },
    { trait: 'aggression', value: clampGene(rng.gaussian(30, 15), 0), dominant: rng.chance(0.5) },
    { trait: 'curiosity', value: clampGene(rng.gaussian(50, 15), 0), dominant: rng.chance(0.5) },
    { trait: 'sociability', value: clampGene(rng.gaussian(50, 15), 0), dominant: rng.chance(0.5) },
    // Appearance genes — cosmetic variation within species
    { trait: 'body_size_var', value: clampGene(rng.gaussian(50, 12), 0), dominant: rng.chance(0.5) },
    { trait: 'limb_length', value: clampGene(rng.gaussian(50, 10), 0), dominant: rng.chance(0.5) },
    { trait: 'coat_shade', value: clampGene(rng.gaussian(50, 20), 0), dominant: rng.chance(0.7) },
    { trait: 'marking_pattern', value: clampGene(rng.gaussian(50, 25), 0), dominant: rng.chance(0.4) },
    { trait: 'ear_size', value: clampGene(rng.gaussian(50, 12), 0), dominant: rng.chance(0.5) },
    { trait: 'teeth_size', value: clampGene(rng.gaussian(50, 10), 0), dominant: rng.chance(0.6) },
  ];

  return { genes, mutationRate: 0.05 };
}

function clampGene(base: number, spread: number): number {
  const value = spread > 0 ? worldRNG.gaussian(base, spread) : base;
  return Math.max(0, Math.min(100, value));
}

/** Species-flavored name generation */
function generateName(speciesId: SpeciesId): string {
  const rng = worldRNG;
  const species = speciesRegistry.get(speciesId);
  const taxonomy = species?.taxonomy;

  // Pick naming style based on taxonomy class
  const cls = taxonomy?.class ?? '';
  if (cls === 'Insecta' || cls === 'Arachnida') {
    return generateInsectName(rng);
  }
  if (cls === 'Actinopterygii' || cls === 'Chondrichthyes') {
    return generateAquaticName(rng);
  }
  if (cls === 'Aves') {
    return generateBirdName(rng);
  }
  // Default: mammalian-style
  return generateMammalName(rng);
}

function generateMammalName(rng: typeof worldRNG): string {
  const consonants = 'bdfghjklmnprstvwz';
  const vowels = 'aeiou';
  const syllables = rng.int(2, 3);
  let name = '';
  for (let i = 0; i < syllables; i++) {
    name += consonants[rng.int(0, consonants.length - 1)];
    name += vowels[rng.int(0, vowels.length - 1)];
    if (rng.chance(0.3)) name += consonants[rng.int(0, consonants.length - 1)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateInsectName(rng: typeof worldRNG): string {
  const prefixes = ['Zk', 'Xr', 'Kk', 'Tz', 'Sk', 'Vr', 'Zz', 'Kr'];
  const mids = ['ik', 'ak', 'ix', 'az', 'uk', 'ez', 'ik', 'oz'];
  const suffixes = ['ik', 'ax', 'uz', 'it', 'ok', 'az', 'ix'];
  return rng.pick(prefixes) + rng.pick(mids) + (rng.chance(0.5) ? rng.pick(suffixes) : '');
}

function generateAquaticName(rng: typeof worldRNG): string {
  const parts = ['lu', 'ma', 'wa', 'na', 'ko', 'ri', 'shi', 'mu', 'ai', 'kai', 'mo', 'ru'];
  const count = rng.int(2, 3);
  let name = '';
  for (let i = 0; i < count; i++) name += rng.pick(parts);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateBirdName(rng: typeof worldRNG): string {
  const starts = ['Tr', 'Fl', 'Sw', 'Sk', 'Wr', 'Cr', 'Pr', 'Br', 'Thr', 'Str'];
  const mids = ['ee', 'i', 'a', 'o', 'oo', 'ai'];
  const ends = ['ll', 'p', 'k', 'th', 'ng', 'n', 'ck', 'r'];
  return rng.pick(starts) + rng.pick(mids) + rng.pick(ends);
}

export function updateCharacterTick(character: Character, tick: number): {
  died: boolean;
  causeOfDeath: string | null;
} {
  if (!character.isAlive) return { died: false, causeOfDeath: null };

  const species = speciesRegistry.get(character.speciesId);
  if (!species) return { died: false, causeOfDeath: null };

  // Age
  character.age = tick - character.bornAtTick;

  // Natural needs — use species metabolic rate (from taxonomy)
  const metabolicRate = species.traits.metabolicRate ?? 1.0;
  character.hunger = Math.min(1, character.hunger + 0.001 * metabolicRate);

  // Servants in forced domestication drain energy 10% faster
  const servantBond = domesticationRegistry.getBondForServant(character.id);
  const servantDrain = servantBond && servantBond.type === 'enslavement' ? 1.1 : 1.0;
  character.energy = Math.max(0, character.energy - 0.0005 * metabolicRate * servantDrain);

  // Stamina drain (recovers during rest actions, drains with activity)
  character.stamina = Math.max(0, character.stamina - 0.0003 * metabolicRate);

  // Starvation
  if (character.hunger >= 1) {
    character.health -= 0.01;
  }

  // Exhaustion
  if (character.energy <= 0) {
    character.health -= 0.005;
  }

  // Gestation check — give birth when gestation ends
  // (actual birth handling done by breed system, this just clears the flag)
  if (character.gestationEndsAtTick !== null && tick >= character.gestationEndsAtTick) {
    character.gestationEndsAtTick = null;
  }

  // Natural death from old age (influenced by endurance gene)
  const endurance = getGeneValue(character, 'endurance');
  const lifespanBonus = 1 + (endurance - 50) / 200; // ±25% lifespan from genetics
  const effectiveLifespan = species.traits.lifespan * lifespanBonus;

  if (character.age >= effectiveLifespan) {
    const deathChance = (character.age - effectiveLifespan) / (effectiveLifespan * 0.2);
    if (worldRNG.chance(Math.min(0.5, deathChance))) {
      characterRegistry.markDead(character.id, tick, 'old age');
      corpseRegistry.createCorpse(character, tick);
      mainCharacterManager.processMainCharacterDeath(character, 'current');
      return { died: true, causeOfDeath: 'old age' };
    }
  }

  // Death from health depletion
  if (character.health <= 0) {
    characterRegistry.markDead(character.id, tick, 'health depletion');
    corpseRegistry.createCorpse(character, tick);
    mainCharacterManager.processMainCharacterDeath(character, 'current');
    return { died: true, causeOfDeath: 'health depletion' };
  }

  return { died: false, causeOfDeath: null };
}

export function getGeneValue(character: Character, trait: string): number {
  const gene = character.genetics.genes.find(g => g.trait === trait);
  return gene?.value ?? 50;
}
