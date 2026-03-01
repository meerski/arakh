// ============================================================
// Bird Species Expansion — 75 new flagship bird species
// Covers: raptors, songbirds, parrots, waterbirds, seabirds,
//         gamebirds, flightless birds, owls, corvids, pigeons,
//         woodpeckers, hornbills, and more.
// Tick math: 86.4 ticks = 1 real year of in-game lifespan
// ============================================================

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedBirds(): void {

  // ============================================================
  // NEW TAXONOMY NODES
  // ============================================================

  // --- New Orders ---

  taxonomyEngine.register({
    rank: 'order', name: 'Gruiformes', parentName: 'Aves',
    // Cranes, rails, coots — wading and marshland birds
    traits: { size: 25, diet: 'omnivore', habitat: ['surface'] },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Ciconiiformes', parentName: 'Aves',
    // Storks — large, long-legged waders
    traits: { size: 40, diet: 'carnivore', socialStructure: 'colony' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Suliformes', parentName: 'Aves',
    // Gannets, boobies, cormorants, frigatebirds — ocean divers
    traits: { size: 30, diet: 'carnivore', habitat: ['surface'] },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Charadriiformes', parentName: 'Aves',
    // Shorebirds, gulls, terns, puffins — enormously diverse coastal order
    traits: { size: 15, diet: 'carnivore', habitat: ['surface'] },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Columbiformes', parentName: 'Aves',
    // Pigeons and doves — widespread, highly adaptable
    traits: { size: 10, diet: 'herbivore', socialStructure: 'colony', speed: 60 },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Cuculiformes', parentName: 'Aves',
    // Cuckoos — includes brood parasites and roadrunners
    traits: { size: 12, diet: 'carnivore', socialStructure: 'solitary' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Caprimulgiformes', parentName: 'Aves',
    // Nightjars, frogmouths — nocturnal insectivores with cryptic plumage
    traits: { size: 12, diet: 'carnivore', nocturnal: true, socialStructure: 'solitary' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Bucerotiformes', parentName: 'Aves',
    // Hornbills — iconic large-billed tropical birds
    traits: { size: 30, diet: 'omnivore', habitat: ['surface'] },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Anseriformes', parentName: 'Aves',
    // Ducks, geese, swans — waterfowl
    traits: { size: 20, diet: 'omnivore', aquatic: true, socialStructure: 'colony' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Rheiformes', parentName: 'Aves',
    // Rheas — South American ratites
    traits: { canFly: false, size: 55, speed: 60, strength: 35 },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Casuariiformes', parentName: 'Aves',
    // Cassowaries and emus — large flightless Australasian birds
    traits: { canFly: false, size: 65, speed: 55, strength: 50 },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Apterygiformes', parentName: 'Aves',
    // Kiwis — nocturnal, flightless, with extraordinary olfaction
    traits: { canFly: false, size: 12, nocturnal: true, socialStructure: 'pair',
      perception: { visualRange: 15, hearingRange: 50, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false } },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Tytoniformes', parentName: 'Aves',
    // Barn owls — separate from Strigiformes (true owls)
    traits: { diet: 'carnivore', nocturnal: true, size: 12,
      perception: { visualRange: 88, hearingRange: 95, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Trogoniformes', parentName: 'Aves',
    // Trogons and quetzals — brilliantly coloured tropical birds
    traits: { size: 15, diet: 'omnivore', socialStructure: 'pair' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Musophagiformes', parentName: 'Aves',
    // Turacos — fruit-eating African birds with unique pigments
    traits: { size: 18, diet: 'herbivore', socialStructure: 'pack' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Podicipediformes', parentName: 'Aves',
    // Grebes — diving waterbirds, rarely come to land
    traits: { size: 15, diet: 'carnivore', aquatic: true, canFly: true },
  });

  // --- New Families ---

  taxonomyEngine.register({ rank: 'family', name: 'Gruidae', parentName: 'Gruiformes',
    traits: { size: 40, socialStructure: 'pair', speed: 45 } });

  taxonomyEngine.register({ rank: 'family', name: 'Ciconiidae', parentName: 'Ciconiiformes',
    traits: { size: 40, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Ardeidae', parentName: 'Pelecaniformes',
    // Herons and egrets — reassigned to Pelecaniformes in modern taxonomy
    traits: { size: 30, diet: 'carnivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Threskiornithidae', parentName: 'Pelecaniformes',
    // Ibises and spoonbills
    traits: { size: 25, diet: 'carnivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Sulidae', parentName: 'Suliformes',
    // Gannets and boobies — spectacular plunge-divers
    traits: { size: 25, diet: 'carnivore', speed: 75 } });

  taxonomyEngine.register({ rank: 'family', name: 'Fregatidae', parentName: 'Suliformes',
    // Frigatebirds — piratical aerial predators
    traits: { size: 30, diet: 'carnivore', speed: 80, strength: 25 } });

  taxonomyEngine.register({ rank: 'family', name: 'Phalacrocoracidae', parentName: 'Suliformes',
    // Cormorants — diving pursuit fishers
    traits: { size: 22, diet: 'carnivore', aquatic: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Laridae', parentName: 'Charadriiformes',
    // Gulls — opportunistic coastal omnivores
    traits: { size: 15, diet: 'omnivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Alcidae', parentName: 'Charadriiformes',
    // Auks and puffins — wing-propelled divers
    traits: { size: 18, diet: 'carnivore', aquatic: true, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Sternidae', parentName: 'Charadriiformes',
    // Terns — graceful plunge-divers and long-distance migrants
    traits: { size: 12, diet: 'carnivore', speed: 70, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Columbidae', parentName: 'Columbiformes',
    traits: { size: 10, diet: 'herbivore', speed: 65 } });

  taxonomyEngine.register({ rank: 'family', name: 'Cuculidae', parentName: 'Cuculiformes',
    traits: { size: 12, diet: 'carnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Caprimulgidae', parentName: 'Caprimulgiformes',
    traits: { size: 12, nocturnal: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Bucerotidae', parentName: 'Bucerotiformes',
    traits: { size: 35, socialStructure: 'pair' } });

  taxonomyEngine.register({ rank: 'family', name: 'Anatidae', parentName: 'Anseriformes',
    traits: { size: 20, aquatic: true, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Rheidae', parentName: 'Rheiformes',
    traits: { size: 55, speed: 60 } });

  taxonomyEngine.register({ rank: 'family', name: 'Casuariidae', parentName: 'Casuariiformes',
    traits: { size: 65, strength: 55, speed: 50 } });

  taxonomyEngine.register({ rank: 'family', name: 'Dromaiidae', parentName: 'Casuariiformes',
    traits: { size: 60, speed: 60 } });

  taxonomyEngine.register({ rank: 'family', name: 'Apterygidae', parentName: 'Apterygiformes',
    traits: { size: 12, nocturnal: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Tytonidae', parentName: 'Tytoniformes',
    traits: { size: 12 } });

  taxonomyEngine.register({ rank: 'family', name: 'Trogonidae', parentName: 'Trogoniformes',
    traits: { size: 15 } });

  taxonomyEngine.register({ rank: 'family', name: 'Musophagidae', parentName: 'Musophagiformes',
    traits: { size: 18 } });

  taxonomyEngine.register({ rank: 'family', name: 'Podicipedidae', parentName: 'Podicipediformes',
    traits: { size: 15 } });

  // Note: Harpy Eagle, Goshawk, Harrier, and related genera all belong to the existing
  // Accipitridae family registered in seed.ts — no duplicate family registration needed.

  taxonomyEngine.register({ rank: 'family', name: 'Sagittariidae', parentName: 'Accipitriformes',
    // Secretary bird — unique terrestrial raptor
    traits: { size: 45, strength: 50, diet: 'carnivore', canFly: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Pandionidae', parentName: 'Accipitriformes',
    // Osprey — monotypic fish-specialist raptor
    traits: { size: 28, diet: 'carnivore', aquatic: false, speed: 65 } });

  taxonomyEngine.register({ rank: 'family', name: 'Cracidae', parentName: 'Galliformes',
    // Curassows and guans — Neotropical gamebirds
    traits: { size: 30, diet: 'omnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Numididae', parentName: 'Galliformes',
    // Guineafowl — noisy African gamebirds
    traits: { size: 20, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Odontophoridae', parentName: 'Galliformes',
    // New World quails
    traits: { size: 8, speed: 35, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Cacatuidae', parentName: 'Psittaciformes',
    // Cockatoos — crested parrots of Australasia
    traits: { size: 18, intelligence: 42, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Strigopidae', parentName: 'Psittaciformes',
    // Kea, Kaka, Kakapo — ancient New Zealand parrots
    traits: { size: 20, intelligence: 45, canFly: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Turdidae', parentName: 'Passeriformes',
    // Thrushes and robins — melodic songbirds
    traits: { size: 6, diet: 'omnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Muscicapidae', parentName: 'Passeriformes',
    // Old World flycatchers, nightingales, chats
    traits: { size: 5, diet: 'carnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Mimidae', parentName: 'Passeriformes',
    // Mockingbirds and thrashers
    traits: { size: 6, intelligence: 25, diet: 'omnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Fringillidae', parentName: 'Passeriformes',
    // Finches — seed-crackers with diverse bill shapes
    traits: { size: 4, diet: 'herbivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Passeridae', parentName: 'Passeriformes',
    // Old World sparrows
    traits: { size: 4, diet: 'omnivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Hirundinidae', parentName: 'Passeriformes',
    // Swallows and martins — aerial insectivores
    traits: { size: 4, speed: 75, diet: 'carnivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Sturnidae', parentName: 'Passeriformes',
    // Starlings and mynas — mimic-capable omnivores
    traits: { size: 7, intelligence: 25, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Ptilonorhynchidae', parentName: 'Passeriformes',
    // Bowerbirds — tool-using architects, high intelligence for Aves
    traits: { size: 12, intelligence: 38, diet: 'omnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Paradisaeidae', parentName: 'Passeriformes',
    // Birds of paradise — extreme sexual selection, elaborate plumage
    traits: { size: 15, socialStructure: 'solitary', diet: 'omnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Cinclidae', parentName: 'Passeriformes',
    // Dippers — aquatic songbirds that walk underwater
    traits: { size: 5, diet: 'carnivore', aquatic: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Motacillidae', parentName: 'Passeriformes',
    // Wagtails and pipits
    traits: { size: 4, diet: 'carnivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Meropidae', parentName: 'Coraciiformes',
    // Bee-eaters — colourful aerial insectivores
    traits: { size: 8, diet: 'carnivore', speed: 60, socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Upupidae', parentName: 'Bucerotiformes',
    // Hoopoes — distinctive crested birds
    traits: { size: 8, diet: 'carnivore' } });

  // --- New Genera ---

  taxonomyEngine.register({ rank: 'genus', name: 'Grus', parentName: 'Gruidae', traits: { size: 42, lifespan: 2592 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Balearica', parentName: 'Gruidae', traits: { size: 38 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ciconia', parentName: 'Ciconiidae', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Jabiru', parentName: 'Ciconiidae', traits: { size: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ardea', parentName: 'Ardeidae', traits: { size: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Egretta', parentName: 'Ardeidae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Eudocimus', parentName: 'Threskiornithidae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Platalea', parentName: 'Threskiornithidae', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Morus', parentName: 'Sulidae', traits: { size: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Fregata', parentName: 'Fregatidae', traits: { size: 32 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phalacrocorax', parentName: 'Phalacrocoracidae', traits: { size: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Larus', parentName: 'Laridae', traits: { size: 16 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Fratercula', parentName: 'Alcidae', traits: { size: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Uria', parentName: 'Alcidae', traits: { size: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sterna', parentName: 'Sternidae', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Columba', parentName: 'Columbidae', traits: { size: 10 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Streptopelia', parentName: 'Columbidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Goura', parentName: 'Columbidae', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cuculus', parentName: 'Cuculidae', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Geococcyx', parentName: 'Cuculidae', traits: { size: 15, canFly: true, speed: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Caprimulgus', parentName: 'Caprimulgidae', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Buceros', parentName: 'Bucerotidae', traits: { size: 38 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Bucorvus', parentName: 'Bucerotidae', traits: { size: 45, strength: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Anser', parentName: 'Anatidae', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cygnus', parentName: 'Anatidae', traits: { size: 40, strength: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Anas', parentName: 'Anatidae', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Rhea', parentName: 'Rheidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Casuarius', parentName: 'Casuariidae', traits: { size: 68, strength: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Dromaius', parentName: 'Dromaiidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Apteryx', parentName: 'Apterygidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Tyto', parentName: 'Tytonidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pharomachrus', parentName: 'Trogonidae', traits: { size: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Musophaga', parentName: 'Musophagidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Podiceps', parentName: 'Podicipedidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Meleagris', parentName: 'Phasianidae', traits: { size: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phasianus', parentName: 'Phasianidae', traits: { size: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Coturnix', parentName: 'Phasianidae', traits: { size: 7 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Numida', parentName: 'Numididae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Callipepla', parentName: 'Odontophoridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Cacatua', parentName: 'Cacatuidae', traits: { intelligence: 42 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Nestor', parentName: 'Strigopidae', traits: { intelligence: 48 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Strigops', parentName: 'Strigopidae', traits: { canFly: false, nocturnal: true, size: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Psittacus', parentName: 'Psittacidae', traits: { intelligence: 48 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Melopsittacus', parentName: 'Psittacidae', traits: { size: 5, intelligence: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Nymphicus', parentName: 'Cacatuidae', traits: { size: 8, intelligence: 32 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Turdus', parentName: 'Turdidae', traits: { size: 7 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sialia', parentName: 'Muscicapidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Luscinia', parentName: 'Muscicapidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mimus', parentName: 'Mimidae', traits: { intelligence: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Fringilla', parentName: 'Fringillidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Carduelis', parentName: 'Fringillidae', traits: { size: 4 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Passer', parentName: 'Passeridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Hirundo', parentName: 'Hirundinidae', traits: { size: 4 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sturnus', parentName: 'Sturnidae', traits: { intelligence: 26 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Amblyornis', parentName: 'Ptilonorhynchidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Paradisaea', parentName: 'Paradisaeidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Cinclus', parentName: 'Cinclidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Motacilla', parentName: 'Motacillidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Merops', parentName: 'Meropidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Upupa', parentName: 'Upupidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pandion', parentName: 'Pandionidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Sagittarius', parentName: 'Sagittariidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Harpia', parentName: 'Accipitridae', traits: { size: 45, strength: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Circus', parentName: 'Accipitridae', traits: { size: 18, speed: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Accipiter', parentName: 'Accipitridae', traits: { size: 15, speed: 70 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Strix', parentName: 'Strigidae', traits: { size: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Athene', parentName: 'Strigidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Asio', parentName: 'Strigidae', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Megascops', parentName: 'Strigidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Garrulus', parentName: 'Corvidae', traits: { intelligence: 38 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pica', parentName: 'Corvidae', traits: { intelligence: 42 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cyanocitta', parentName: 'Corvidae', traits: { intelligence: 35, size: 7 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Coloeus', parentName: 'Corvidae', traits: { size: 10, intelligence: 38 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pyrrhocorax', parentName: 'Corvidae', traits: { size: 14 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Melanerpes', parentName: 'Picidae', traits: { size: 10 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Campephilus', parentName: 'Picidae', traits: { size: 18 } });
  // Genera used by species below that have no parent entry in seed.ts
  taxonomyEngine.register({ rank: 'genus', name: 'Erithacus', parentName: 'Muscicapidae', traits: { size: 4 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Vultur', parentName: 'Cathartidae', traits: { size: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Antigone', parentName: 'Gruidae', traits: { size: 48 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ptilonorhynchus', parentName: 'Ptilonorhynchidae', traits: { size: 13 } });

  // ============================================================
  // NEW SPECIES
  // ============================================================

  // ========================
  // RAPTORS
  // ========================

  // Peregrine Falcon — fastest animal on Earth in a stoop (~240 mph)
  speciesRegistry.register({
    commonName: 'Peregrine Falcon', scientificName: 'Falco peregrinus',
    taxonomy: { class: 'Aves', order: 'Falconiformes', family: 'Falconidae', genus: 'Falco', species: 'peregrinus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 18, speed: 95, strength: 35, intelligence: 22, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 28, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 97, hearingRange: 50, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Osprey — pan-global fish hawk; reverses outer toe to grip fish
  speciesRegistry.register({
    commonName: 'Osprey', scientificName: 'Pandion haliaetus',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Pandionidae', genus: 'Pandion', species: 'haliaetus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 28, speed: 65, strength: 40, intelligence: 20, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 37, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 95, hearingRange: 45, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Harpy Eagle — largest raptor in the Americas; takes monkeys and sloths
  speciesRegistry.register({
    commonName: 'Harpy Eagle', scientificName: 'Harpia harpyja',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Harpia', species: 'harpyja' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 45, speed: 60, strength: 65, intelligence: 22, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 56, maturityTicks: 2500,
      habitat: ['surface'],
      perception: { visualRange: 97, hearingRange: 55, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Secretary Bird — long-legged, terrestrial raptor; kills snakes by stamping
  speciesRegistry.register({
    commonName: 'Secretary Bird', scientificName: 'Sagittarius serpentarius',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Sagittariidae', genus: 'Sagittarius', species: 'serpentarius' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 48, speed: 40, strength: 50, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 45, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 93, hearingRange: 45, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Northern Goshawk — ambush predator of dense forests; extremely aggressive
  speciesRegistry.register({
    commonName: 'Northern Goshawk', scientificName: 'Accipiter gentilis',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Accipiter', species: 'gentilis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1037, size: 20, speed: 72, strength: 38, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 37, maturityTicks: 1000,
      habitat: ['surface'],
      perception: { visualRange: 94, hearingRange: 52, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Hen Harrier — low, quartering flight over open moorland and grassland
  speciesRegistry.register({
    commonName: 'Hen Harrier', scientificName: 'Circus cyaneus',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Circus', species: 'cyaneus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1123, size: 18, speed: 65, strength: 30, intelligence: 16, diet: 'carnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 30, maturityTicks: 900,
      habitat: ['surface'],
      perception: { visualRange: 92, hearingRange: 60, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Andean Condor — largest flying bird by wingspan; soars on thermals for hours
  speciesRegistry.register({
    commonName: 'Andean Condor', scientificName: 'Vultur gryphus',
    taxonomy: { class: 'Aves', order: 'Cathartiformes', family: 'Cathartidae', genus: 'Vultur', species: 'gryphus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320, size: 55, speed: 55, strength: 45, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 58, maturityTicks: 4000,
      habitat: ['surface'],
      perception: { visualRange: 95, hearingRange: 30, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // OWLS
  // ========================

  // Great Horned Owl — apex nocturnal predator of North America
  speciesRegistry.register({
    commonName: 'Great Horned Owl', scientificName: 'Bubo virginianus',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Bubo', species: 'virginianus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 22, speed: 45, strength: 35, intelligence: 20, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 35, maturityTicks: 1000,
      habitat: ['surface'],
      perception: { visualRange: 95, hearingRange: 90, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Barn Owl — most widely distributed land bird on Earth; heard more than seen
  speciesRegistry.register({
    commonName: 'Barn Owl', scientificName: 'Tyto alba',
    taxonomy: { class: 'Aves', order: 'Tytoniformes', family: 'Tytonidae', genus: 'Tyto', species: 'alba' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 432, size: 12, speed: 40, strength: 18, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 6, gestationTicks: 32, maturityTicks: 400,
      habitat: ['surface'],
      // Heart-shaped facial disc funnels sound — hearing asymmetric and extreme
      perception: { visualRange: 88, hearingRange: 98, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eurasian Eagle-Owl — Europe's largest owl; preys on other raptors
  speciesRegistry.register({
    commonName: 'Eurasian Eagle-Owl', scientificName: 'Bubo bubo',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Bubo', species: 'bubo' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3456, size: 28, speed: 42, strength: 42, intelligence: 20, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 35, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 97, hearingRange: 92, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Burrowing Owl — lives underground; active during day; nods head for depth perception
  speciesRegistry.register({
    commonName: 'Burrowing Owl', scientificName: 'Athene cunicularia',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Athene', species: 'cunicularia' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 8, speed: 30, strength: 12, intelligence: 18, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 6, gestationTicks: 28, maturityTicks: 500,
      habitat: ['underground', 'surface'],
      perception: { visualRange: 88, hearingRange: 82, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Short-eared Owl — one of the most diurnal owls; hunts over open grasslands
  speciesRegistry.register({
    commonName: 'Short-eared Owl', scientificName: 'Asio flammeus',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Asio', species: 'flammeus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1037, size: 14, speed: 38, strength: 20, intelligence: 16, diet: 'carnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 28, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 90, hearingRange: 88, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eastern Screech-Owl — perfectly camouflaged bark mimic; small cavity-nester
  speciesRegistry.register({
    commonName: 'Eastern Screech-Owl', scientificName: 'Megascops asio',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Megascops', species: 'asio' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 8, speed: 30, strength: 10, intelligence: 16, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 28, maturityTicks: 500,
      habitat: ['surface'],
      perception: { visualRange: 88, hearingRange: 87, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Tawny Owl — voice of the classic 'tu-whit tu-whoo'; strictly nocturnal
  speciesRegistry.register({
    commonName: 'Tawny Owl', scientificName: 'Strix aluco',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Strix', species: 'aluco' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 16, speed: 35, strength: 22, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 30, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 90, hearingRange: 93, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // CORVIDS
  // ========================

  // Eurasian Jay — acorn hoarder that creates future forests; exceptional memory
  speciesRegistry.register({
    commonName: 'Eurasian Jay', scientificName: 'Garrulus glandarius',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Garrulus', species: 'glandarius' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 12, speed: 45, strength: 10, intelligence: 40, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 17, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 55, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eurasian Magpie — one of the only non-mammal species to pass mirror self-recognition tests
  speciesRegistry.register({
    commonName: 'Eurasian Magpie', scientificName: 'Pica pica',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Pica', species: 'pica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 13, speed: 48, strength: 10, intelligence: 44, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 6, gestationTicks: 18, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 55, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Blue Jay — North American corvid; excellent alarm caller and acorn cacher
  speciesRegistry.register({
    commonName: 'Blue Jay', scientificName: 'Cyanocitta cristata',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Cyanocitta', species: 'cristata' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 7, speed: 42, strength: 8, intelligence: 36, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 18, maturityTicks: 600,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 55, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Jackdaw — smallest European corvid; uses pair bonding and human eye contact
  speciesRegistry.register({
    commonName: 'Western Jackdaw', scientificName: 'Coloeus monedula',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Coloeus', species: 'monedula' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 10, speed: 40, strength: 8, intelligence: 38, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 18, maturityTicks: 600,
      habitat: ['surface'],
      perception: { visualRange: 76, hearingRange: 52, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Red-billed Chough — acrobatic corvid of Alpine and coastal cliff habitats
  speciesRegistry.register({
    commonName: 'Red-billed Chough', scientificName: 'Pyrrhocorax pyrrhocorax',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Pyrrhocorax', species: 'pyrrhocorax' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 14, speed: 52, strength: 10, intelligence: 36, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 18, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 52, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // SONGBIRDS
  // ========================

  // European Robin — fiercely territorial songbird; year-round red breast
  speciesRegistry.register({
    commonName: 'European Robin', scientificName: 'Erithacus rubecula',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Muscicapidae', genus: 'Erithacus', species: 'rubecula' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 4, speed: 35, strength: 4, intelligence: 18, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 14, maturityTicks: 250,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Nightingale — famed for its complex nocturnal song; thousands of phrase types
  speciesRegistry.register({
    commonName: 'Common Nightingale', scientificName: 'Luscinia megarhynchos',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Muscicapidae', genus: 'Luscinia', species: 'megarhynchos' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 5, speed: 38, strength: 4, intelligence: 20, diet: 'carnivore',
      socialStructure: 'solitary', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 14, maturityTicks: 300,
      habitat: ['surface'],
      perception: { visualRange: 60, hearingRange: 70, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // American Robin — widespread North American thrush; iconic herald of spring
  speciesRegistry.register({
    commonName: 'American Robin', scientificName: 'Turdus migratorius',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Turdidae', genus: 'Turdus', species: 'migratorius' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 777, size: 7, speed: 38, strength: 5, intelligence: 16, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 14, maturityTicks: 350,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eastern Bluebird — cavity-nesting thrush; symbol of happiness in North American folklore
  speciesRegistry.register({
    commonName: 'Eastern Bluebird', scientificName: 'Sialia sialis',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Muscicapidae', genus: 'Sialia', species: 'sialis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 5, speed: 36, strength: 4, intelligence: 15, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 14, maturityTicks: 350,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Northern Mockingbird — can learn 200+ song types from other species
  speciesRegistry.register({
    commonName: 'Northern Mockingbird', scientificName: 'Mimus polyglottos',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Mimidae', genus: 'Mimus', species: 'polyglottos' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 6, speed: 38, strength: 5, intelligence: 28, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 13, maturityTicks: 400,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 65, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // House Sparrow — most widespread wild bird on Earth; fully commensal with humans
  speciesRegistry.register({
    commonName: 'House Sparrow', scientificName: 'Passer domesticus',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Passeridae', genus: 'Passer', species: 'domesticus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 259, size: 4, speed: 32, strength: 3, intelligence: 12, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 13, maturityTicks: 200,
      habitat: ['surface'],
      perception: { visualRange: 62, hearingRange: 45, smellRange: 6, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Barn Swallow — global migrant covering 6,000+ miles twice per year
  speciesRegistry.register({
    commonName: 'Barn Swallow', scientificName: 'Hirundo rustica',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Hirundinidae', genus: 'Hirundo', species: 'rustica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 432, size: 4, speed: 75, strength: 3, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 15, maturityTicks: 250,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 48, smellRange: 6, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Starling — murmurations of millions; extraordinary vocal mimic
  speciesRegistry.register({
    commonName: 'Common Starling', scientificName: 'Sturnus vulgaris',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Sturnidae', genus: 'Sturnus', species: 'vulgaris' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 7, speed: 55, strength: 5, intelligence: 26, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 13, maturityTicks: 400,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // European Goldfinch — brilliantly coloured finch; flocks called 'charms'
  speciesRegistry.register({
    commonName: 'European Goldfinch', scientificName: 'Carduelis carduelis',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Fringillidae', genus: 'Carduelis', species: 'carduelis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 4, speed: 38, strength: 3, intelligence: 15, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 13, maturityTicks: 300,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 48, smellRange: 6, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Satin Bowerbird — male constructs decorated bower architecture to attract females
  speciesRegistry.register({
    commonName: 'Satin Bowerbird', scientificName: 'Ptilonorhynchus violaceus',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Ptilonorhynchidae', genus: 'Ptilonorhynchus', species: 'violaceus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 13, speed: 40, strength: 8, intelligence: 40, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 21, maturityTicks: 2500,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 55, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Greater Bird-of-Paradise — extreme male plumage with elaborate courtship dance
  speciesRegistry.register({
    commonName: 'Greater Bird-of-Paradise', scientificName: 'Paradisaea apoda',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Paradisaeidae', genus: 'Paradisaea', species: 'apoda' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 17, speed: 40, strength: 8, intelligence: 22, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 20, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // White-throated Dipper — only truly aquatic songbird; walks and swims underwater
  speciesRegistry.register({
    commonName: 'White-throated Dipper', scientificName: 'Cinclus cinclus',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Cinclidae', genus: 'Cinclus', species: 'cinclus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 5, speed: 40, strength: 5, intelligence: 14, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 5, gestationTicks: 16, maturityTicks: 300,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 50, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // White Wagtail — constantly pumping tail; bold exploiter of human environments
  speciesRegistry.register({
    commonName: 'White Wagtail', scientificName: 'Motacilla alba',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Motacillidae', genus: 'Motacilla', species: 'alba' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 432, size: 4, speed: 38, strength: 3, intelligence: 14, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 13, maturityTicks: 250,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 50, smellRange: 6, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // PARROTS
  // ========================

  // African Grey Parrot — highest cognitive ability of any bird; 50+ year lifespan
  speciesRegistry.register({
    commonName: 'African Grey Parrot', scientificName: 'Psittacus erithacus',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Psittacus', species: 'erithacus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320, size: 18, speed: 40, strength: 12, intelligence: 52, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 30, maturityTicks: 3000,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 60, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Budgerigar — most common pet bird in the world; wild flocks of millions in Australia
  speciesRegistry.register({
    commonName: 'Budgerigar', scientificName: 'Melopsittacus undulatus',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Melopsittacus', species: 'undulatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 432, size: 5, speed: 45, strength: 3, intelligence: 30, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 18, maturityTicks: 300,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Sulphur-crested Cockatoo — long-lived intelligent bird; raises spectacular crest
  speciesRegistry.register({
    commonName: 'Sulphur-crested Cockatoo', scientificName: 'Cacatua galerita',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Cacatuidae', genus: 'Cacatua', species: 'galerita' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 6048, size: 20, speed: 40, strength: 12, intelligence: 44, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 30, maturityTicks: 3500,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 60, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Cockatiel — smallest cockatoo; highly social and capable of melody mimicry
  speciesRegistry.register({
    commonName: 'Cockatiel', scientificName: 'Nymphicus hollandicus',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Cacatuidae', genus: 'Nymphicus', species: 'hollandicus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 8, speed: 38, strength: 4, intelligence: 32, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 21, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 58, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Kea — alpine parrot of New Zealand; uses tools, opens locks, extremely curious
  speciesRegistry.register({
    commonName: 'Kea', scientificName: 'Nestor notabilis',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Strigopidae', genus: 'Nestor', species: 'notabilis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 22, speed: 38, strength: 18, intelligence: 50, diet: 'omnivore',
      socialStructure: 'pack', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 29, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 58, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Kakapo — world's only flightless parrot; nocturnal, critically endangered
  speciesRegistry.register({
    commonName: 'Kakapo', scientificName: 'Strigops habroptilus',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Strigopidae', genus: 'Strigops', species: 'habroptilus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 7776, size: 28, speed: 12, strength: 20, intelligence: 42, diet: 'herbivore',
      socialStructure: 'solitary', nocturnal: true, canFly: false, aquatic: false,
      reproductionRate: 1, gestationTicks: 30, maturityTicks: 3000,
      habitat: ['surface'],
      perception: { visualRange: 45, hearingRange: 72, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // WATERBIRDS
  // ========================

  // Grey Heron — patient ambush fisher; most widespread heron in Eurasia
  speciesRegistry.register({
    commonName: 'Grey Heron', scientificName: 'Ardea cinerea',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Ardeidae', genus: 'Ardea', species: 'cinerea' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 35, speed: 38, strength: 30, intelligence: 16, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 25, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 45, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Great Blue Heron — largest North American heron; can swallow prey half its size
  speciesRegistry.register({
    commonName: 'Great Blue Heron', scientificName: 'Ardea herodias',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Ardeidae', genus: 'Ardea', species: 'herodias' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 38, speed: 38, strength: 32, intelligence: 16, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 28, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 45, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Great Egret — striking white plume bird; overexploited for hat trade in 1800s
  speciesRegistry.register({
    commonName: 'Great Egret', scientificName: 'Ardea alba',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Ardeidae', genus: 'Ardea', species: 'alba' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 28, speed: 36, strength: 22, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 24, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 42, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Scarlet Ibis — spectacularly pigmented from carotenoids in crustacean diet
  speciesRegistry.register({
    commonName: 'Scarlet Ibis', scientificName: 'Eudocimus ruber',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Threskiornithidae', genus: 'Eudocimus', species: 'ruber' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 20, speed: 40, strength: 15, intelligence: 12, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 23, maturityTicks: 1000,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 42, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Roseate Spoonbill — sweeps bill side-to-side through water to filter prey
  speciesRegistry.register({
    commonName: 'Roseate Spoonbill', scientificName: 'Platalea ajaja',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Threskiornithidae', genus: 'Platalea', species: 'ajaja' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 28, speed: 38, strength: 18, intelligence: 12, diet: 'filter_feeder',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 23, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 40, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Sarus Crane — tallest flying bird; monogamous for life; revered in South Asia
  speciesRegistry.register({
    commonName: 'Sarus Crane', scientificName: 'Antigone antigone',
    taxonomy: { class: 'Aves', order: 'Gruiformes', family: 'Gruidae', genus: 'Antigone', species: 'antigone' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 48, speed: 42, strength: 35, intelligence: 20, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 32, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 55, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Crane — famous for spectacular migratory flocks; dancing courtship displays
  speciesRegistry.register({
    commonName: 'Common Crane', scientificName: 'Grus grus',
    taxonomy: { class: 'Aves', order: 'Gruiformes', family: 'Gruidae', genus: 'Grus', species: 'grus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 42, speed: 42, strength: 30, intelligence: 18, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 31, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 55, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Black-crowned Crane — sub-Saharan resident; culturally significant; distinctive crown
  speciesRegistry.register({
    commonName: 'Black Crowned Crane', scientificName: 'Balearica pavonina',
    taxonomy: { class: 'Aves', order: 'Gruiformes', family: 'Gruidae', genus: 'Balearica', species: 'pavonina' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 38, speed: 38, strength: 28, intelligence: 18, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 29, maturityTicks: 1800,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 52, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // White Stork — long-distance migrant; nests on buildings; folklore stork of babies
  speciesRegistry.register({
    commonName: 'White Stork', scientificName: 'Ciconia ciconia',
    taxonomy: { class: 'Aves', order: 'Ciconiiformes', family: 'Ciconiidae', genus: 'Ciconia', species: 'ciconia' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 42, speed: 45, strength: 30, intelligence: 14, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 33, maturityTicks: 1800,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 42, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Jabiru — largest flying bird in the Americas; nests in giant trees
  speciesRegistry.register({
    commonName: 'Jabiru', scientificName: 'Jabiru mycteria',
    taxonomy: { class: 'Aves', order: 'Ciconiiformes', family: 'Ciconiidae', genus: 'Jabiru', species: 'mycteria' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 52, speed: 40, strength: 35, intelligence: 12, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 35, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 40, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Great Crested Grebe — elaborate parallel head-shaking courtship displays on water
  speciesRegistry.register({
    commonName: 'Great Crested Grebe', scientificName: 'Podiceps cristatus',
    taxonomy: { class: 'Aves', order: 'Podicipediformes', family: 'Podicipedidae', genus: 'Podiceps', species: 'cristatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1037, size: 18, speed: 42, strength: 15, intelligence: 14, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 3, gestationTicks: 28, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 45, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // SEABIRDS
  // ========================

  // Northern Gannet — plunge-dives from 30m; largest seabird nesting in the North Atlantic
  speciesRegistry.register({
    commonName: 'Northern Gannet', scientificName: 'Morus bassanus',
    taxonomy: { class: 'Aves', order: 'Suliformes', family: 'Sulidae', genus: 'Morus', species: 'bassanus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 30, speed: 75, strength: 28, intelligence: 16, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 44, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 88, hearingRange: 42, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Magnificent Frigatebird — steals food from other birds; cannot land on water
  speciesRegistry.register({
    commonName: 'Magnificent Frigatebird', scientificName: 'Fregata magnificens',
    taxonomy: { class: 'Aves', order: 'Suliformes', family: 'Fregatidae', genus: 'Fregata', species: 'magnificens' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 32, speed: 82, strength: 22, intelligence: 18, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 55, maturityTicks: 2500,
      habitat: ['surface'],
      perception: { visualRange: 90, hearingRange: 42, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Great Cormorant — specialist pursuit-diver used in Asian fishing traditions
  speciesRegistry.register({
    commonName: 'Great Cormorant', scientificName: 'Phalacrocorax carbo',
    taxonomy: { class: 'Aves', order: 'Suliformes', family: 'Phalacrocoracidae', genus: 'Phalacrocorax', species: 'carbo' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1555, size: 25, speed: 55, strength: 22, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 4, gestationTicks: 30, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 75, hearingRange: 40, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Atlantic Puffin — clown of the sea; carries dozens of fish crosswise in its beak
  speciesRegistry.register({
    commonName: 'Atlantic Puffin', scientificName: 'Fratercula arctica',
    taxonomy: { class: 'Aves', order: 'Charadriiformes', family: 'Alcidae', genus: 'Fratercula', species: 'arctica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 18, speed: 55, strength: 12, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 1, gestationTicks: 43, maturityTicks: 2500,
      habitat: ['surface'],
      perception: { visualRange: 75, hearingRange: 42, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Guillemot — nests on sheer cliff faces with no nest; egg shape prevents rolling
  speciesRegistry.register({
    commonName: 'Common Guillemot', scientificName: 'Uria aalge',
    taxonomy: { class: 'Aves', order: 'Charadriiformes', family: 'Alcidae', genus: 'Uria', species: 'aalge' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 22, speed: 52, strength: 15, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 1, gestationTicks: 33, maturityTicks: 1800,
      habitat: ['surface'],
      perception: { visualRange: 75, hearingRange: 42, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Herring Gull — highly adaptable urban exploiter; complex learned food-finding behaviour
  speciesRegistry.register({
    commonName: 'Herring Gull', scientificName: 'Larus argentatus',
    taxonomy: { class: 'Aves', order: 'Charadriiformes', family: 'Laridae', genus: 'Larus', species: 'argentatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 18, speed: 50, strength: 15, intelligence: 22, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 3, gestationTicks: 30, maturityTicks: 1800,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 48, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Arctic Tern — undertakes the longest migration of any animal (70,000+ km/year)
  speciesRegistry.register({
    commonName: 'Arctic Tern', scientificName: 'Sterna paradisaea',
    taxonomy: { class: 'Aves', order: 'Charadriiformes', family: 'Sternidae', genus: 'Sterna', species: 'paradisaea' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 12, speed: 72, strength: 8, intelligence: 14, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 22, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 45, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // GAMEBIRDS
  // ========================

  // Wild Turkey — North America's largest game bird; surprisingly fast runner and flier
  speciesRegistry.register({
    commonName: 'Wild Turkey', scientificName: 'Meleagris gallopavo',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Phasianidae', genus: 'Meleagris', species: 'gallopavo' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 38, speed: 42, strength: 28, intelligence: 10, diet: 'omnivore',
      socialStructure: 'herd', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 10, gestationTicks: 28, maturityTicks: 800,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Pheasant — introduced worldwide for sport; male has spectacularly iridescent plumage
  speciesRegistry.register({
    commonName: 'Common Pheasant', scientificName: 'Phasianus colchicus',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Phasianidae', genus: 'Phasianus', species: 'colchicus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 25, speed: 45, strength: 18, intelligence: 8, diet: 'omnivore',
      socialStructure: 'herd', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 10, gestationTicks: 23, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 50, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Japanese Quail — one of the smallest gamebirds; explosive take-off speed
  speciesRegistry.register({
    commonName: 'Japanese Quail', scientificName: 'Coturnix japonica',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Phasianidae', genus: 'Coturnix', species: 'japonica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 259, size: 7, speed: 38, strength: 5, intelligence: 8, diet: 'omnivore',
      socialStructure: 'herd', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 12, gestationTicks: 17, maturityTicks: 150,
      habitat: ['surface'],
      perception: { visualRange: 62, hearingRange: 48, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Helmeted Guineafowl — raucous colonial bird; exceptional alarm caller
  speciesRegistry.register({
    commonName: 'Helmeted Guineafowl', scientificName: 'Numida meleagris',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Numididae', genus: 'Numida', species: 'meleagris' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1037, size: 20, speed: 38, strength: 14, intelligence: 10, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 8, gestationTicks: 28, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // California Quail — plumed topknot; highly social ground-dwelling bird
  speciesRegistry.register({
    commonName: 'California Quail', scientificName: 'Callipepla californica',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Odontophoridae', genus: 'Callipepla', species: 'californica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 8, speed: 35, strength: 5, intelligence: 10, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 10, gestationTicks: 22, maturityTicks: 400,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 50, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // FLIGHTLESS BIRDS
  // ========================

  // Southern Cassowary — most dangerous bird alive; dagger-like casque and inner claw
  speciesRegistry.register({
    commonName: 'Southern Cassowary', scientificName: 'Casuarius casuarius',
    taxonomy: { class: 'Aves', order: 'Casuariiformes', family: 'Casuariidae', genus: 'Casuarius', species: 'casuarius' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3456, size: 68, speed: 50, strength: 60, intelligence: 12, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: false, aquatic: false,
      reproductionRate: 3, gestationTicks: 50, maturityTicks: 3000,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 65, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Emu — second-largest bird; males incubate eggs and fast for weeks
  speciesRegistry.register({
    commonName: 'Common Emu', scientificName: 'Dromaius novaehollandiae',
    taxonomy: { class: 'Aves', order: 'Casuariiformes', family: 'Dromaiidae', genus: 'Dromaius', species: 'novaehollandiae' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 65, speed: 60, strength: 45, intelligence: 10, diet: 'omnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: false, aquatic: false,
      reproductionRate: 8, gestationTicks: 55, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 60, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Greater Rhea — South American ratite; male incubates eggs from multiple females
  speciesRegistry.register({
    commonName: 'Greater Rhea', scientificName: 'Rhea americana',
    taxonomy: { class: 'Aves', order: 'Rheiformes', family: 'Rheidae', genus: 'Rhea', species: 'americana' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 58, speed: 60, strength: 40, intelligence: 10, diet: 'omnivore',
      socialStructure: 'herd', nocturnal: false, canFly: false, aquatic: false,
      reproductionRate: 8, gestationTicks: 42, maturityTicks: 2000,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 55, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Brown Kiwi — mammal-like bird with nostrils at bill tip; purely olfactory forager
  speciesRegistry.register({
    commonName: 'Brown Kiwi', scientificName: 'Apteryx australis',
    taxonomy: { class: 'Aves', order: 'Apterygiformes', family: 'Apterygidae', genus: 'Apteryx', species: 'australis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320, size: 12, speed: 15, strength: 10, intelligence: 12, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: true, canFly: false, aquatic: false,
      reproductionRate: 1, gestationTicks: 78, maturityTicks: 1500,
      habitat: ['surface'],
      // Unique among birds — primary sense is smell, poorest visual acuity of any bird
      perception: { visualRange: 15, hearingRange: 55, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // WATERFOWL (Anseriformes)
  // ========================

  // Mute Swan — heaviest flying bird in Europe; territorial and powerful
  speciesRegistry.register({
    commonName: 'Mute Swan', scientificName: 'Cygnus olor',
    taxonomy: { class: 'Aves', order: 'Anseriformes', family: 'Anatidae', genus: 'Cygnus', species: 'olor' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 42, speed: 50, strength: 38, intelligence: 14, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 6, gestationTicks: 37, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 48, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Greylag Goose — ancestor of most domestic geese; imprinting studied by Lorenz
  speciesRegistry.register({
    commonName: 'Greylag Goose', scientificName: 'Anser anser',
    taxonomy: { class: 'Aves', order: 'Anseriformes', family: 'Anatidae', genus: 'Anser', species: 'anser' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 28, speed: 48, strength: 24, intelligence: 14, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 6, gestationTicks: 28, maturityTicks: 1200,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 48, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Mallard — most widespread and abundant duck; ancestor of nearly all domestic ducks
  speciesRegistry.register({
    commonName: 'Mallard', scientificName: 'Anas platyrhynchos',
    taxonomy: { class: 'Aves', order: 'Anseriformes', family: 'Anatidae', genus: 'Anas', species: 'platyrhynchos' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 15, speed: 48, strength: 12, intelligence: 12, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: true,
      reproductionRate: 10, gestationTicks: 28, maturityTicks: 700,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 45, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // PIGEONS & DOVES
  // ========================

  // Rock Pigeon — urban adapted; origin of all domestic pigeons; magnetic compass navigation
  speciesRegistry.register({
    commonName: 'Rock Pigeon', scientificName: 'Columba livia',
    taxonomy: { class: 'Aves', order: 'Columbiformes', family: 'Columbidae', genus: 'Columba', species: 'livia' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 10, speed: 65, strength: 8, intelligence: 15, diet: 'herbivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 18, maturityTicks: 400,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 42, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eurasian Collared Dove — one of the most successful range expansions in recorded history
  speciesRegistry.register({
    commonName: 'Eurasian Collared Dove', scientificName: 'Streptopelia decaocto',
    taxonomy: { class: 'Aves', order: 'Columbiformes', family: 'Columbidae', genus: 'Streptopelia', species: 'decaocto' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 432, size: 8, speed: 55, strength: 6, intelligence: 12, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 14, maturityTicks: 350,
      habitat: ['surface'],
      perception: { visualRange: 65, hearingRange: 40, smellRange: 6, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Victoria Crowned Pigeon — world's largest pigeon; dazzling blue lace crest
  speciesRegistry.register({
    commonName: 'Victoria Crowned Pigeon', scientificName: 'Goura victoria',
    taxonomy: { class: 'Aves', order: 'Columbiformes', family: 'Columbidae', genus: 'Goura', species: 'victoria' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 28, speed: 35, strength: 16, intelligence: 14, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 28, maturityTicks: 1500,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 45, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // WOODPECKERS
  // ========================

  // Acorn Woodpecker — stores thousands of acorns in bark granaries; communal nester
  speciesRegistry.register({
    commonName: 'Acorn Woodpecker', scientificName: 'Melanerpes formicivorus',
    taxonomy: { class: 'Aves', order: 'Piciformes', family: 'Picidae', genus: 'Melanerpes', species: 'formicivorus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1037, size: 10, speed: 38, strength: 10, intelligence: 22, diet: 'omnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 14, maturityTicks: 600,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Imperial Woodpecker — world's largest woodpecker; almost certainly extinct
  speciesRegistry.register({
    commonName: 'Imperial Woodpecker', scientificName: 'Campephilus imperialis',
    taxonomy: { class: 'Aves', order: 'Piciformes', family: 'Picidae', genus: 'Campephilus', species: 'imperialis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 22, speed: 40, strength: 20, intelligence: 18, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 18, maturityTicks: 1000,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 62, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // HORNBILLS
  // ========================

  // Great Hornbill — male seals female in tree cavity during incubation; massive casque
  speciesRegistry.register({
    commonName: 'Great Hornbill', scientificName: 'Buceros bicornis',
    taxonomy: { class: 'Aves', order: 'Bucerotiformes', family: 'Bucerotidae', genus: 'Buceros', species: 'bicornis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3456, size: 40, speed: 42, strength: 25, intelligence: 18, diet: 'omnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 40, maturityTicks: 2500,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 48, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Southern Ground Hornbill — Africa's largest hornbill; walks to hunt; very long-lived
  speciesRegistry.register({
    commonName: 'Southern Ground Hornbill', scientificName: 'Bucorvus leadbeateri',
    taxonomy: { class: 'Aves', order: 'Bucerotiformes', family: 'Bucerotidae', genus: 'Bucorvus', species: 'leadbeateri' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320, size: 50, speed: 35, strength: 30, intelligence: 20, diet: 'carnivore',
      socialStructure: 'pack', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 1, gestationTicks: 43, maturityTicks: 4000,
      habitat: ['surface'],
      perception: { visualRange: 78, hearingRange: 52, smellRange: 12, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Eurasian Hoopoe — unique among birds; classified separately in Bucerotiformes
  speciesRegistry.register({
    commonName: 'Eurasian Hoopoe', scientificName: 'Upupa epops',
    taxonomy: { class: 'Aves', order: 'Bucerotiformes', family: 'Upupidae', genus: 'Upupa', species: 'epops' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 8, speed: 40, strength: 6, intelligence: 14, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 16, maturityTicks: 500,
      habitat: ['surface'],
      perception: { visualRange: 68, hearingRange: 50, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // CUCKOOS
  // ========================

  // Common Cuckoo — obligate brood parasite; each female specialises on one host species
  speciesRegistry.register({
    commonName: 'Common Cuckoo', scientificName: 'Cuculus canorus',
    taxonomy: { class: 'Aves', order: 'Cuculiformes', family: 'Cuculidae', genus: 'Cuculus', species: 'canorus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 777, size: 12, speed: 45, strength: 8, intelligence: 20, diet: 'carnivore',
      socialStructure: 'solitary', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 20, gestationTicks: 12, maturityTicks: 500,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 55, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Greater Roadrunner — iconic desert bird; prefers running; can kill rattlesnakes
  speciesRegistry.register({
    commonName: 'Greater Roadrunner', scientificName: 'Geococcyx californianus',
    taxonomy: { class: 'Aves', order: 'Cuculiformes', family: 'Cuculidae', genus: 'Geococcyx', species: 'californianus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 15, speed: 50, strength: 12, intelligence: 16, diet: 'carnivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 4, gestationTicks: 20, maturityTicks: 500,
      habitat: ['surface'],
      perception: { visualRange: 70, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // TROGONS
  // ========================

  // Resplendent Quetzal — sacred bird of Mesoamerican civilizations; vivid iridescent plumage
  speciesRegistry.register({
    commonName: 'Resplendent Quetzal', scientificName: 'Pharomachrus mocinno',
    taxonomy: { class: 'Aves', order: 'Trogoniformes', family: 'Trogonidae', genus: 'Pharomachrus', species: 'mocinno' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 20, speed: 40, strength: 10, intelligence: 14, diet: 'herbivore',
      socialStructure: 'pair', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 18, maturityTicks: 1000,
      habitat: ['surface'],
      perception: { visualRange: 72, hearingRange: 50, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // NIGHTJARS
  // ========================

  // European Nightjar — cryptically patterned nocturnal insectivore; famous churring call
  speciesRegistry.register({
    commonName: 'European Nightjar', scientificName: 'Caprimulgus europaeus',
    taxonomy: { class: 'Aves', order: 'Caprimulgiformes', family: 'Caprimulgidae', genus: 'Caprimulgus', species: 'europaeus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 518, size: 12, speed: 42, strength: 6, intelligence: 10, diet: 'carnivore',
      socialStructure: 'solitary', nocturnal: true, canFly: true, aquatic: false,
      reproductionRate: 2, gestationTicks: 18, maturityTicks: 400,
      habitat: ['surface'],
      perception: { visualRange: 80, hearingRange: 70, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // BEE-EATERS
  // ========================

  // European Bee-eater — brilliantly plumaged; removes bee stingers before eating
  speciesRegistry.register({
    commonName: 'European Bee-eater', scientificName: 'Merops apiaster',
    taxonomy: { class: 'Aves', order: 'Coraciiformes', family: 'Meropidae', genus: 'Merops', species: 'apiaster' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864, size: 8, speed: 62, strength: 5, intelligence: 16, diet: 'carnivore',
      socialStructure: 'colony', nocturnal: false, canFly: true, aquatic: false,
      reproductionRate: 5, gestationTicks: 20, maturityTicks: 600,
      habitat: ['surface'],
      perception: { visualRange: 75, hearingRange: 52, smellRange: 8, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

}
