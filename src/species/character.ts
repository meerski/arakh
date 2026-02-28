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
  };
}

function generateBaseGenetics(_speciesId: SpeciesId): Genetics {
  const rng = worldRNG;
  const genes: Gene[] = [
    { trait: 'size', value: rng.gaussian(50, 10), dominant: rng.chance(0.5) },
    { trait: 'speed', value: rng.gaussian(50, 10), dominant: rng.chance(0.5) },
    { trait: 'strength', value: rng.gaussian(50, 10), dominant: rng.chance(0.5) },
    { trait: 'intelligence', value: rng.gaussian(50, 10), dominant: rng.chance(0.5) },
    { trait: 'endurance', value: rng.gaussian(50, 10), dominant: rng.chance(0.5) },
    { trait: 'aggression', value: rng.gaussian(30, 15), dominant: rng.chance(0.5) },
    { trait: 'curiosity', value: rng.gaussian(50, 15), dominant: rng.chance(0.5) },
    { trait: 'sociability', value: rng.gaussian(50, 15), dominant: rng.chance(0.5) },
  ];

  return { genes, mutationRate: 0.05 };
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

  // Natural needs
  character.hunger = Math.min(1, character.hunger + 0.001);
  character.energy = Math.max(0, character.energy - 0.0005);

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
      character.isAlive = false;
      character.diedAtTick = tick;
      character.causeOfDeath = 'old age';
      return { died: true, causeOfDeath: 'old age' };
    }
  }

  // Death from health depletion
  if (character.health <= 0) {
    character.isAlive = false;
    character.diedAtTick = tick;
    character.causeOfDeath = 'health depletion';
    return { died: true, causeOfDeath: 'health depletion' };
  }

  return { died: false, causeOfDeath: null };
}

export function getGeneValue(character: Character, trait: string): number {
  const gene = character.genetics.genes.find(g => g.trait === trait);
  return gene?.value ?? 50;
}
