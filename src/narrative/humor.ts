// ============================================================
// Humor Engine — Species-appropriate absurd narration
// ============================================================

import { worldRNG } from '../simulation/random.js';
import type { TaxonomyPath } from '../types.js';
import { fillTemplate, type TemplateContext } from './templates.js';

export type SpeciesCategory =
  | 'aquatic' | 'bird' | 'insect' | 'reptile'
  | 'small_mammal' | 'large_mammal' | 'primate'
  | 'cephalopod' | 'crustacean' | 'arachnid';

export type HumorEventType =
  | 'death' | 'breeding_fail' | 'breeding_success'
  | 'forage_fail' | 'combat' | 'exploration'
  | 'craft_fail' | 'politics' | 'advancement'
  | 'cross_species' | 'general_fail'
  | 'cross_breed_death' | 'cross_breed_reject' | 'cross_breed_success';

/** Map taxonomy class/order to a species category for humor selection */
export function getSpeciesCategory(taxonomy: TaxonomyPath): SpeciesCategory {
  const cls = taxonomy.class;
  const order = taxonomy.order;

  if (cls === 'Cephalopoda') return 'cephalopod';
  if (cls === 'Malacostraca') return 'crustacean';
  if (cls === 'Arachnida') return 'arachnid';
  if (cls === 'Insecta') return 'insect';
  if (cls === 'Aves') return 'bird';
  if (cls === 'Reptilia') return 'reptile';
  if (cls === 'Actinopterygii' || cls === 'Chondrichthyes') return 'aquatic';
  if (cls === 'Mammalia') {
    if (order === 'Primates') return 'primate';
    // Size heuristic: large mammals by order
    if (['Proboscidea', 'Carnivora', 'Cetacea', 'Perissodactyla', 'Artiodactyla'].includes(order)) {
      return 'large_mammal';
    }
    return 'small_mammal';
  }
  return 'aquatic'; // fallback
}

// ============================================================
// Template pools per event type, with species-specific variants
// ============================================================

const HUMOR_TEMPLATES: Record<HumorEventType, string[]> = {
  death: [
    `{name} the {speciesName} confidently ate something new. It was the last thing {name} ever did.`,
    `{name} picked a fight with gravity. Gravity won.`,
    `{name} fell asleep somewhere creative. Specifically, in a predator's mouth.`,
    `{name} died doing what {name} loved: making questionable decisions.`,
    `{name} the {speciesName} lived fast and died confused.`,
    `{name} went out with all the grace and dignity of a falling coconut.`,
    `{name} tried something bold. The world said no.`,
    `{name} the {speciesName} has passed away. The ecosystem will recover. Probably.`,
    `{name} died of natural causes. If you consider 'being eaten' natural.`,
    `In memoriam: {name}. Cause of death: overconfidence.`,
    `{name} the {speciesName} has shuffled off this mortal coil. The coil is fine.`,
    `{name} is survived by no one who particularly noticed.`,
  ],
  breeding_fail: [
    `{name} performed an elaborate courtship display. The audience walked away mid-performance.`,
    `{name} brought a gift to impress a mate. It was a dead beetle. The mate was a herbivore.`,
    `The mood was perfect. Then {name} fell off a branch. Romance: cancelled.`,
    `{name} tried to breed. {name} is currently alone. This is a fundamental problem.`,
    `{name} made eye contact with a potential mate. The mate made eye contact with the exit.`,
    `{name}'s mating call was described by witnesses as 'unfortunate.'`,
    `{name} spent hours grooming for a date. The date never showed up.`,
    `{name} tried the classic approach: staring without blinking. It did not work.`,
    `{name} presented a courtship offering. It was the wrong species' courting ritual. Awkward.`,
    `{name} waited by the watering hole looking attractive. Nobody came. Nobody cared.`,
  ],
  breeding_success: [
    `{name} is a parent now. {name} is not ready for this.`,
    `New offspring! {name} looks exhausted already.`,
    `{name} successfully bred. Nature continues its relentless march.`,
    `Congratulations to {name}. Parenthood: no refunds.`,
    `{name} welcomes offspring into a world of predators, starvation, and weather. Good luck, little ones.`,
  ],
  forage_fail: [
    `{name} found what looked like food. It was another {speciesName}'s territory marker. Appetite: gone.`,
    `{name} spent all day foraging. Total yield: one thing too small to see.`,
    `{name} sniffed around for food. Found dirt. Ate some anyway. Still hungry.`,
    `{name} found a promising food source. It was a rock. {name} bit it to be sure.`,
    `{name} foraged with great enthusiasm and zero results.`,
    `{name} located food. Someone else located it first. {name} located disappointment.`,
    `The search for sustenance continues. {name}'s stomach makes concerning sounds.`,
    `{name} mistook something inedible for food. Twice.`,
    `{name} watched another {speciesName} eat successfully and felt personally attacked.`,
    `{name} the {speciesName} went hungry. The ecosystem does not care about your feelings.`,
  ],
  combat: [
    `Both fighters stared at each other. Then walked away. Nobody won. Everyone was confused.`,
    `{name} charged with the confidence of something much, much larger.`,
    `{name} entered combat. {name}'s strategy: panic.`,
    `{name} and {targetName} clashed. The real winner was whoever wasn't watching.`,
    `{name} fought bravely. 'Bravely' here means 'with eyes closed.'`,
    `{name} assumed a threatening posture. The threat was not received.`,
    `{name} won the fight, primarily through the element of surprise. {name} was also surprised.`,
    `{name} lost the fight but gained a valuable lesson about picking fights.`,
    `{name} fought with the ferocity of a cornered hamster. Results: mixed.`,
    `The battle was fierce. Both sides agree it was mostly a misunderstanding.`,
  ],
  exploration: [
    `{name} explored boldly. Found nothing. Explored again. Found less than nothing.`,
    `{name} wandered into unknown territory. The territory was unimpressed.`,
    `{name} discovered a new area. It looks exactly like the old area.`,
    `{name} the explorer. {name} the lost. Same character, different perspective.`,
    `{name} mapped new territory by walking into things.`,
    `{name} found a path nobody had taken before. There was a reason nobody had taken it.`,
  ],
  craft_fail: [
    `{name} tried to pick up a stick. {name} is a fish. The stick floated away. So did {name}'s dignity.`,
    `{name} attempted to craft something. The materials disagree on what that something was.`,
    `{name} spent considerable effort creating... nothing recognizable.`,
    `{name} tried to build a tool. The tool fell apart. The tool was a leaf.`,
    `{name}'s crafting attempt was ambitious. The result was abstract.`,
    `{name} tried to manipulate objects. The objects manipulated {name}'s expectations instead.`,
    `{name} invented something. Nobody, including {name}, knows what it is.`,
  ],
  politics: [
    `{name} tried to stage a coup. Nobody showed up. {name} pretended it was a joke.`,
    `{name} was exiled from the colony. Official reason: 'bad vibes.'`,
    `The hive voted. {name} is out. Democracy is brutal when you're an ant.`,
    `{name} declared themselves leader. The group continued ignoring {name}.`,
    `{name} formed a political alliance. Both members are confused about what that means.`,
    `{name} challenged the alpha. The alpha yawned.`,
    `{name} attempted to seize power. Power was not interested in being seized.`,
    `{name} gave a rousing speech. The audience ate a bug and left.`,
    `{name} built a coalition of one. Morale is high. Numbers are not.`,
    `{name} was voted most likely to be exiled. {name} was the only voter.`,
    `Leadership changed hands. The old leader didn't notice for three days.`,
    `{name} the {speciesName} ran for office. There is no office. {name} ran anyway.`,
  ],
  advancement: [
    `The eels held a council via electric pulses. Nobody knows what was decided, but the water is warmer now.`,
    `The corvid parliament convened. After much deliberation, they stole a shiny rock. Advancement: unclear.`,
    `{name}'s species took a great leap forward. By which we mean they jumped.`,
    `The ants developed a new technique. It's the same as the old technique, but with more ants.`,
    `{name} had a breakthrough. Or a breakdown. Hard to tell with {speciesName}s.`,
    `The {speciesName}s advanced their understanding of the world. The world did not advance its understanding of them.`,
    `{name} contributed to species progress. Contribution: falling into something educational.`,
    `The {speciesName}s invented a new social ritual. It looks like the old one but louder.`,
  ],
  cross_species: [
    `{name} the {speciesName} tried to negotiate with a {targetName}. The language barrier was less a barrier and more a wall. With spikes.`,
    `Cross-species diplomacy: {name} extended an olive branch. The other species ate it.`,
    `{name} attempted interspecies communication. Both parties left more confused than before.`,
    `{name} proposed a cross-species alliance. The other species stared blankly. Progress!`,
    `{name} tried to trade with a {targetName}. Neither side understood the concept. Or each other.`,
    `{name} made first contact. It went about as well as first contacts usually go.`,
  ],
  general_fail: [
    `{name} tried. That's the nicest thing that can be said about it.`,
    `{name} failed, but in a way that showed real character.`,
    `{name}'s plan had one flaw: every part of it.`,
    `{name} attempted the impossible. The impossible won, handily.`,
    `{name} gave it everything. Everything was not enough.`,
    `{name} learned a valuable lesson today. The lesson was 'don't do that.'`,
    `{name} failed with such conviction that nearby animals were briefly impressed.`,
  ],
  cross_breed_death: [
    `{name} the {speciesName} approached the {targetName} with romantic intentions. The {targetName} had... different intentions.`,
    `{name} tried to court a {targetName}. This was, objectively, the worst idea {name} ever had. Also the last.`,
    `The {speciesName} and the {targetName} made eye contact. One was feeling love. The other was feeling hungry.`,
    `Cross-species romance is rarely rewarded. {name} learned this. Briefly.`,
    `{name} presented a mating display to a {targetName}. The {targetName} ate {name}. Mixed signals.`,
    `{name} died pursuing forbidden love. The love was not forbidden. Just inadvisable. And fatal.`,
    `{name} thought size was just a number. It was not. It was a survival statistic.`,
  ],
  cross_breed_reject: [
    `{name} attempted to woo a {targetName}. The {targetName} stared blankly, then walked away. Interspecies dating is hard.`,
    `The {targetName} looked at {name} the way you'd look at someone who just proposed marriage in a language you don't speak.`,
    `{name} performed an elaborate courtship dance for a {targetName}. The {targetName} fell asleep.`,
    `{name} tried cross-species romance. The {targetName} was not interested. The {targetName} was not even aware.`,
    `{name} left a gift for a {targetName}. The {targetName} sat on it. Accidentally.`,
  ],
  cross_breed_success: [
    `Against all odds, against all biology, against all common sense — {name} the {speciesName} and a {targetName} have produced offspring. Scientists would be baffled if scientists existed.`,
    `Nature said no. {name} said yes. A {hybridName} is born. The world doesn't know what to do with this information.`,
    `{name} and a {targetName} defied biology. The result is alive, confused, and technically a new species.`,
    `A {hybridName} enters the world. Both parent species are pretending this didn't happen.`,
    `Evolution just had a very unexpected day. Meet the {hybridName}.`,
  ],
};

// Species-category-specific overrides (appended to pool when category matches)
const CATEGORY_TEMPLATES: Partial<Record<SpeciesCategory, Partial<Record<HumorEventType, string[]>>>> = {
  aquatic: {
    death: [
      `{name} forgot which direction was up. This is embarrassing for a {speciesName}.`,
      `{name} swam into something. The something swam faster.`,
      `{name} surfaced at the wrong moment. A bird was waiting.`,
    ],
    forage_fail: [
      `{name} opened its mouth and nothing swam in. Filtering: failed.`,
      `{name} chased prey through a coral maze. The prey knew the maze. {name} did not.`,
    ],
  },
  bird: {
    death: [
      `{name} flew into a situation that, in hindsight, was clearly a trap. A very obvious trap.`,
      `{name} discovered that not all thermals go up.`,
      `{name} misjudged a landing. The landing was permanent.`,
    ],
    exploration: [
      `{name} soared majestically over new territory. Then got lost.`,
      `{name} flew in circles. {name} says it was "surveying." Sure, {name}.`,
    ],
  },
  insect: {
    death: [
      `{name} was stepped on. Life is unfair when you're small.`,
      `{name} flew toward a light. It was not the kind of light you come back from.`,
      `{name} was eaten by something that didn't even notice. The food chain is harsh.`,
    ],
    politics: [
      `The colony voted with pheromones. {name} smells like exile.`,
      `{name} challenged the queen. The colony ate {name}'s lunch. And {name}.`,
    ],
  },
  reptile: {
    death: [
      `{name} basked in the sun too long. Or not long enough. Temperature regulation is complicated.`,
      `{name} hissed at the wrong predator. The predator was not impressed.`,
    ],
    combat: [
      `{name} deployed its most threatening posture. The opponent didn't speak lizard.`,
    ],
  },
  small_mammal: {
    death: [
      `{name} was small and delicious. Two traits that don't mix well.`,
      `{name} tried to hide. {name}'s hiding spot was already occupied. By a predator.`,
    ],
    forage_fail: [
      `{name} found a nut. It was someone else's nut. There were consequences.`,
      `{name} hid food for later. {name} forgot where. The squirrel's curse continues.`,
    ],
  },
  large_mammal: {
    combat: [
      `{name} charged. The ground shook. The opponent reconsidered life choices.`,
      `{name} sat on the problem. The problem did not survive.`,
    ],
    death: [
      `{name} was too large to hide and too stubborn to run. A fatal combination.`,
    ],
  },
  primate: {
    politics: [
      `{name} threw something at the leader. It was not a challenge. It was worse.`,
      `{name} groomed the wrong ally. Social dynamics: demolished.`,
    ],
    craft_fail: [
      `{name} had the opposable thumbs for this. Somehow, that wasn't enough.`,
    ],
  },
  cephalopod: {
    death: [
      `{name} changed color one last time. To the color of regret.`,
    ],
    combat: [
      `{name} deployed ink. The water went dark. When it cleared, both fighters had forgotten what they were doing.`,
    ],
    craft_fail: [
      `{name} had eight arms for this job. Still not enough.`,
    ],
  },
  crustacean: {
    death: [
      `{name} molted at the worst possible moment.`,
    ],
    combat: [
      `{name} waved claws menacingly. The opponent was already eating {name}'s dinner.`,
    ],
  },
  arachnid: {
    death: [
      `{name}'s web caught something too big. Much too big.`,
    ],
    breeding_fail: [
      `{name} approached a mate. The mate considered eating {name}. Romance is complicated for arachnids.`,
    ],
  },
};

/**
 * Attempt to generate a funny narrative variant.
 * Returns a filled template ~30% of the time, null otherwise.
 */
export function funnyNarrative(
  category: SpeciesCategory,
  eventType: HumorEventType,
  context: TemplateContext,
): string | null {
  // 30% chance of humor
  if (!worldRNG.chance(0.3)) return null;

  // Build pool: base templates + category-specific
  const pool = [...(HUMOR_TEMPLATES[eventType] ?? [])];
  const categoryExtra = CATEGORY_TEMPLATES[category]?.[eventType];
  if (categoryExtra) {
    pool.push(...categoryExtra);
  }

  if (pool.length === 0) return null;

  const template = worldRNG.pick(pool);
  return fillTemplate(template, context);
}
