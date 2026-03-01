// ============================================================
// Species-Specific Narrative Voice
// ============================================================
// Different species "sound" different in narrative text.
// Predators use hunting language, prey use survival language,
// social animals use community language.

import type { Diet, SocialStructure } from '../types.js';
import { speciesRegistry } from '../species/species.js';
import { worldRNG } from '../simulation/random.js';

export interface SpeciesVoice {
  moveVerbs: string[];
  eatVerbs: string[];
  fightVerbs: string[];
  socialVerbs: string[];
  deathDescriptors: string[];
  birthDescriptors: string[];
  successAdjectives: string[];
  failureAdjectives: string[];
}

const PREDATOR_VOICE: SpeciesVoice = {
  moveVerbs: ['stalks', 'prowls', 'advances', 'charges', 'slinks'],
  eatVerbs: ['devours', 'feasts on', 'tears into', 'gorges on', 'consumes'],
  fightVerbs: ['strikes', 'lunges', 'mauls', 'tackles', 'overwhelms'],
  socialVerbs: ['dominates', 'leads', 'commands', 'rallies', 'intimidates'],
  deathDescriptors: ['fell in battle', 'met a worthy end', 'fought to the last'],
  birthDescriptors: ['A predator is born', 'A new hunter enters the world', 'The pack grows stronger'],
  successAdjectives: ['fierce', 'dominant', 'powerful', 'relentless'],
  failureAdjectives: ['outmatched', 'denied', 'thwarted', 'outwitted'],
};

const PREY_VOICE: SpeciesVoice = {
  moveVerbs: ['darts', 'scurries', 'bounds', 'trots', 'grazes forward'],
  eatVerbs: ['nibbles', 'grazes on', 'forages for', 'browses on', 'pecks at'],
  fightVerbs: ['kicks', 'butts', 'flees from', 'stampedes', 'defends against'],
  socialVerbs: ['huddles with', 'grooms', 'signals', 'herds', 'nuzzles'],
  deathDescriptors: ['was taken by the wild', 'succumbed to the cycle', 'returned to the earth'],
  birthDescriptors: ['New life stirs', 'A gentle soul enters the world', 'The herd welcomes a new member'],
  successAdjectives: ['nimble', 'resourceful', 'alert', 'swift'],
  failureAdjectives: ['vulnerable', 'exposed', 'caught off-guard', 'cornered'],
};

const OMNIVORE_VOICE: SpeciesVoice = {
  moveVerbs: ['wanders', 'explores', 'treks', 'ambles', 'ventures'],
  eatVerbs: ['samples', 'gathers', 'scavenges', 'snacks on', 'discovers'],
  fightVerbs: ['grapples', 'wrestles', 'clashes with', 'confronts', 'struggles'],
  socialVerbs: ['befriends', 'cooperates with', 'negotiates', 'bonds with', 'trades with'],
  deathDescriptors: ['passed on', 'departed', 'left the world behind'],
  birthDescriptors: ['A curious mind is born', 'New potential enters the world', 'An adaptable soul arrives'],
  successAdjectives: ['clever', 'adaptable', 'persistent', 'cunning'],
  failureAdjectives: ['frustrated', 'stumped', 'rebuffed', 'unlucky'],
};

const COLONY_VOICE: SpeciesVoice = {
  moveVerbs: ['marches', 'swarms', 'migrates', 'files forward', 'advances in formation'],
  eatVerbs: ['harvests', 'collects', 'processes', 'strips', 'ferments'],
  fightVerbs: ['swarms', 'overwhelms', 'defends the colony', 'sacrifices for the whole', 'mobilizes'],
  socialVerbs: ['serves', 'signals the colony', 'dances for', 'feeds', 'nurtures'],
  deathDescriptors: ['served the colony well', 'fulfilled their purpose', 'one of countless who gave all'],
  birthDescriptors: ['The colony grows', 'Another worker joins the ranks', 'The hive expands'],
  successAdjectives: ['tireless', 'efficient', 'unified', 'disciplined'],
  failureAdjectives: ['overwhelmed', 'scattered', 'divided', 'outmaneuvered'],
};

const AQUATIC_VOICE: SpeciesVoice = {
  moveVerbs: ['glides', 'drifts', 'surges', 'dives', 'surfaces'],
  eatVerbs: ['filter-feeds', 'gulps', 'catches', 'scours the depths for', 'sifts'],
  fightVerbs: ['rams', 'thrashes', 'circles', 'bites', 'evades'],
  socialVerbs: ['schools with', 'calls to', 'pods with', 'signals', 'swims alongside'],
  deathDescriptors: ['sank into the depths', 'was claimed by the deep', 'returned to the current'],
  birthDescriptors: ['A new swimmer enters the current', 'The school gains a member', 'Life stirs beneath the waves'],
  successAdjectives: ['graceful', 'powerful', 'swift', 'deep-dwelling'],
  failureAdjectives: ['beached', 'outswum', 'outmaneuvered', 'stranded'],
};

const AERIAL_VOICE: SpeciesVoice = {
  moveVerbs: ['soars', 'swoops', 'wheels', 'glides', 'circles'],
  eatVerbs: ['snatches', 'plucks', 'dives for', 'catches mid-flight', 'picks off'],
  fightVerbs: ['dives at', 'talons flash at', 'stoops on', 'harries', 'circles above'],
  socialVerbs: ['calls to', 'roosts with', 'displays for', 'nests beside', 'flocks with'],
  deathDescriptors: ['fell from the sky', 'took a final flight', 'wings folded for the last time'],
  birthDescriptors: ['A fledgling stirs in the nest', 'New wings unfurl', 'The sky gains another'],
  successAdjectives: ['keen-eyed', 'swift', 'graceful', 'sharp'],
  failureAdjectives: ['grounded', 'clipped', 'outflown', 'battered by wind'],
};

const NOCTURNAL_VOICE: SpeciesVoice = {
  moveVerbs: ['creeps', 'slinks', 'emerges', 'prowls silently', 'shadows'],
  eatVerbs: ['snatches in the dark', 'catches by sound', 'hunts by moonlight', 'finds by scent', 'ambushes'],
  fightVerbs: ['strikes from shadow', 'lunges unseen', 'ambushes', 'startles', 'pounces silently'],
  socialVerbs: ['calls into the dark', 'echoes back to', 'huddles with', 'shares the den with', 'signals softly'],
  deathDescriptors: ['slipped away in the dark', 'faded with the dawn', 'was taken by the night'],
  birthDescriptors: ['Born under cover of darkness', 'Night welcomes a new hunter', 'A shadow stirs to life'],
  successAdjectives: ['silent', 'unseen', 'patient', 'sharp-eared'],
  failureAdjectives: ['blinded', 'exposed', 'caught in daylight', 'startled'],
};

const UNDERGROUND_VOICE: SpeciesVoice = {
  moveVerbs: ['burrows', 'tunnels', 'scuttles', 'digs through', 'wriggles'],
  eatVerbs: ['unearths', 'gnaws', 'roots out', 'strips the soil of', 'finds below'],
  fightVerbs: ['claws at', 'bites blindly', 'blocks the tunnel', 'collapses earth on', 'defends the burrow'],
  socialVerbs: ['shares the tunnel with', 'digs alongside', 'grooms in the dark', 'warms', 'guards the nest'],
  deathDescriptors: ['was buried where they lived', 'returned to the earth', 'the tunnel fell silent'],
  birthDescriptors: ['Deep below, new life stirs', 'The warren grows', 'A small shape moves in the dark'],
  successAdjectives: ['tenacious', 'tireless', 'keen-nosed', 'sturdy'],
  failureAdjectives: ['trapped', 'caved in', 'flooded out', 'dug out'],
};

/** Get the narrative voice profile for a species */
export function getSpeciesVoice(speciesId: string): SpeciesVoice {
  const species = speciesRegistry.get(speciesId);
  if (!species) return OMNIVORE_VOICE;

  // Underground species override
  if (species.traits.habitat.includes('underground') && !species.traits.habitat.includes('surface')) {
    return UNDERGROUND_VOICE;
  }

  // Aquatic species override
  if (species.traits.aquatic) return AQUATIC_VOICE;

  // Flying carnivore/raptor override (birds of prey)
  if (species.traits.canFly && species.traits.diet === 'carnivore') return AERIAL_VOICE;

  // Colony/hive override
  if (species.traits.socialStructure === 'colony' || species.traits.socialStructure === 'hive') {
    return COLONY_VOICE;
  }

  // Nocturnal override (when also carnivore)
  if (species.traits.nocturnal && species.traits.diet === 'carnivore') return NOCTURNAL_VOICE;

  // Diet-based selection
  switch (species.traits.diet) {
    case 'carnivore': return PREDATOR_VOICE;
    case 'herbivore': return PREY_VOICE;
    case 'omnivore': return OMNIVORE_VOICE;
    case 'detritivore': return COLONY_VOICE;
    case 'filter_feeder': return AQUATIC_VOICE;
    default: return OMNIVORE_VOICE;
  }
}

/** Adapt a narrative string using species-specific vocabulary */
export function adaptNarrative(text: string, speciesId: string): string {
  const voice = getSpeciesVoice(speciesId);

  // Replace generic verbs with species-specific ones
  let result = text;
  result = result.replace(/\bmoves\b/gi, worldRNG.pick(voice.moveVerbs));
  result = result.replace(/\beats\b/gi, worldRNG.pick(voice.eatVerbs));
  result = result.replace(/\bfights\b/gi, worldRNG.pick(voice.fightVerbs));
  result = result.replace(/\bsucceeds\b/gi, worldRNG.pick(voice.successAdjectives));
  result = result.replace(/\bfails\b/gi, worldRNG.pick(voice.failureAdjectives));

  return result;
}

/** Get a species-flavored birth announcement */
export function voicedBirth(speciesId: string): string {
  const voice = getSpeciesVoice(speciesId);
  return worldRNG.pick(voice.birthDescriptors);
}

/** Get a species-flavored death description */
export function voicedDeath(speciesId: string): string {
  const voice = getSpeciesVoice(speciesId);
  return worldRNG.pick(voice.deathDescriptors);
}
