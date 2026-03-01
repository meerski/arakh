// ============================================================
// Reptile & Amphibian Species Seed Data (52 species)
// ============================================================
// Excludes species already in seed.ts:
//   Saltwater Crocodile, Desert Tortoise, King Cobra, Green Anaconda,
//   Komodo Dragon, Green Sea Turtle, Panther Chameleon, Green Iguana,
//   Tokay Gecko, American Alligator, Burmese Python,
//   Western Diamondback Rattlesnake, Poison Dart Frog, Axolotl,
//   Japanese Giant Salamander, Red-eyed Tree Frog, Common Toad
//
// Tier mapping (SpeciesTier = 'flagship' | 'notable' | 'generated'):
//   flagship  — globally recognized, ecologically significant, or critically endangered
//   notable   — regionally important, widespread, ecologically well-defined

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedReptiles(): void {

  // ==========================================================
  // NEW TAXONOMY NODES
  // ==========================================================

  // --- Reptilia orders ---
  taxonomyEngine.register({
    rank: 'order', name: 'Rhynchocephalia', parentName: 'Reptilia',
    traits: { speed: 10, lifespan: 86400, size: 8, diet: 'carnivore', nocturnal: true },
  });

  // --- Reptilia families (Squamata) ---
  taxonomyEngine.register({ rank: 'family', name: 'Colubridae', parentName: 'Squamata', traits: { diet: 'carnivore', speed: 35, size: 12 } });
  taxonomyEngine.register({ rank: 'family', name: 'Crotalidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 18, strength: 25, perception: { visualRange: 30, hearingRange: 15, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: true } } });
  taxonomyEngine.register({ rank: 'family', name: 'Helodermatidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 25, strength: 30, speed: 10 } });
  taxonomyEngine.register({ rank: 'family', name: 'Molochidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 5, speed: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Agamidae', parentName: 'Squamata', traits: { size: 12, speed: 30, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Chlamydosauridae', parentName: 'Squamata', traits: { size: 15, speed: 35, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Scincidae', parentName: 'Squamata', traits: { size: 10, speed: 30, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Anguidae', parentName: 'Squamata', traits: { size: 12, speed: 20, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Teiidae', parentName: 'Squamata', traits: { size: 30, speed: 40, diet: 'carnivore', intelligence: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Corytophanidae', parentName: 'Squamata', traits: { size: 8, speed: 45, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Amblyrhynchidae', parentName: 'Squamata', traits: { diet: 'herbivore', size: 30, aquatic: true, habitat: ['surface'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Sphenodontidae', parentName: 'Rhynchocephalia', traits: { size: 8, lifespan: 86400, nocturnal: true } });

  // --- Reptilia families (Testudines) ---
  taxonomyEngine.register({ rank: 'family', name: 'Dermochelyidae', parentName: 'Testudines', traits: { aquatic: true, habitat: ['underwater'], size: 75, speed: 35, lifespan: 62208 } });
  taxonomyEngine.register({ rank: 'family', name: 'Chelydridae', parentName: 'Testudines', traits: { size: 35, strength: 55, speed: 10, aquatic: true, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Emydidae', parentName: 'Testudines', traits: { size: 15, speed: 15, aquatic: true, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Chelidae', parentName: 'Testudines', traits: { size: 25, aquatic: true, diet: 'carnivore', speed: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Trionychidae', parentName: 'Testudines', traits: { aquatic: true, size: 20, speed: 25, diet: 'carnivore' } });

  // --- Reptilia families (Crocodilia) ---
  taxonomyEngine.register({ rank: 'family', name: 'Gavialidae', parentName: 'Crocodilia', traits: { size: 70, strength: 65, diet: 'carnivore', aquatic: true } });
  // Dwarf Crocodile family — using genus as family name to avoid collision with Crocodylidae
  taxonomyEngine.register({ rank: 'family', name: 'Osteolaemidae', parentName: 'Crocodilia', traits: { size: 35, strength: 45, diet: 'carnivore' } });

  // --- Amphibia orders ---
  taxonomyEngine.register({
    rank: 'order', name: 'Gymnophiona', parentName: 'Amphibia',
    traits: { size: 10, speed: 10, habitat: ['underground'], aquatic: false, diet: 'carnivore', socialStructure: 'solitary' },
  });

  // --- Amphibia families ---
  taxonomyEngine.register({ rank: 'family', name: 'Pipidae', parentName: 'Anura', traits: { aquatic: true, size: 8, diet: 'carnivore', speed: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ceratophryidae', parentName: 'Anura', traits: { size: 12, strength: 20, diet: 'carnivore', speed: 10 } });
  taxonomyEngine.register({ rank: 'family', name: 'Conrauidae', parentName: 'Anura', traits: { size: 20, strength: 25, diet: 'carnivore', speed: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Pyxicephalidae', parentName: 'Anura', traits: { size: 15, strength: 20, diet: 'carnivore', speed: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Centrolenidae', parentName: 'Anura', traits: { size: 3, nocturnal: true, diet: 'carnivore', speed: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Rhinodermatidae', parentName: 'Anura', traits: { size: 3, diet: 'carnivore', speed: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ranidae', parentName: 'Anura', traits: { size: 7, speed: 40, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Salamandridae', parentName: 'Urodela', traits: { size: 12, diet: 'carnivore', aquatic: false } });
  taxonomyEngine.register({ rank: 'family', name: 'Proteidae', parentName: 'Urodela', traits: { size: 15, aquatic: true, diet: 'carnivore', habitat: ['underground'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Caeciliidae', parentName: 'Gymnophiona', traits: { size: 12, habitat: ['underground'], diet: 'carnivore' } });

  // ==========================================================
  // SPECIES — SNAKES (14)
  // ==========================================================

  // Black Mamba — fastest land snake, Africa; 11 yr * 86.4 = 950 ticks
  speciesRegistry.register({
    commonName: 'Black Mamba',
    scientificName: 'Dendroaspis polylepis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Elapidae', genus: 'Dendroaspis', species: 'polylepis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 950, size: 20, strength: 30, speed: 60, intelligence: 12,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false,
      habitat: ['surface'],
      perception: { visualRange: 45, hearingRange: 20, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // Eastern Coral Snake — fixed neurotoxin, southeastern USA; 7 yr = 605 ticks
  speciesRegistry.register({
    commonName: 'Eastern Coral Snake',
    scientificName: 'Micrurus fulvius',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Elapidae', genus: 'Micrurus', species: 'fulvius' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 605, size: 8, strength: 10, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Boa Constrictor — large constrictor, Central and South America; 30 yr = 2592 ticks
  speciesRegistry.register({
    commonName: 'Boa Constrictor',
    scientificName: 'Boa constrictor',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Boidae', genus: 'Boa', species: 'constrictor' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 55, strength: 65, speed: 18,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Reticulated Python — longest snake species, Southeast Asia; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Reticulated Python',
    scientificName: 'Malayopython reticulatus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Pythonidae', genus: 'Malayopython', species: 'reticulatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 72, strength: 75, speed: 15,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Inland Taipan — most venomous land snake, arid Australia; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Inland Taipan',
    scientificName: 'Oxyuranus microlepidotus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Elapidae', genus: 'Oxyuranus', species: 'microlepidotus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 16, strength: 20, speed: 40,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Gaboon Viper — longest fangs of any snake, sub-Saharan Africa; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Gaboon Viper',
    scientificName: 'Bitis gabonica',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Viperidae', genus: 'Bitis', species: 'gabonica' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 22, strength: 30, speed: 10,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
      perception: { visualRange: 25, hearingRange: 15, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // Corn Snake — docile colubrid, eastern USA; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Corn Snake',
    scientificName: 'Pantherophis guttatus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Colubridae', genus: 'Pantherophis', species: 'guttatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296, size: 10, strength: 10, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Eastern Indigo Snake — longest native USA snake, venom-immune; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Eastern Indigo Snake',
    scientificName: 'Drymarchon couperi',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Colubridae', genus: 'Drymarchon', species: 'couperi' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160, size: 18, strength: 20, speed: 35,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Sidewinder — iconic sidewinding locomotion, Mojave desert; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Sidewinder',
    scientificName: 'Crotalus cerastes',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Crotalidae', genus: 'Crotalus', species: 'cerastes' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 10, strength: 15, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
      perception: { visualRange: 25, hearingRange: 10, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // Green Tree Python — arboreal, New Guinea & Australia; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Green Tree Python',
    scientificName: 'Morelia viridis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Pythonidae', genus: 'Morelia', species: 'viridis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728, size: 22, strength: 30, speed: 15,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // California Kingsnake — immune to pit viper venom; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'California Kingsnake',
    scientificName: 'Lampropeltis californiae',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Colubridae', genus: 'Lampropeltis', species: 'californiae' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 13, strength: 18, speed: 30,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Common Garter Snake — widespread North America, semi-aquatic; 10 yr = 864 ticks
  speciesRegistry.register({
    commonName: 'Common Garter Snake',
    scientificName: 'Thamnophis sirtalis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Colubridae', genus: 'Thamnophis', species: 'sirtalis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864, size: 8, strength: 8, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Copperhead — pit viper, eastern and central USA; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Copperhead',
    scientificName: 'Agkistrodon contortrix',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Crotalidae', genus: 'Agkistrodon', species: 'contortrix' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160, size: 12, strength: 18, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
      perception: { visualRange: 28, hearingRange: 12, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // Cottonmouth — semi-aquatic pit viper, southeastern USA; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Cottonmouth',
    scientificName: 'Agkistrodon piscivorus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Crotalidae', genus: 'Agkistrodon', species: 'piscivorus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160, size: 14, strength: 20, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
      perception: { visualRange: 28, hearingRange: 12, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // ==========================================================
  // SPECIES — LIZARDS (12)
  // ==========================================================

  // Gila Monster — one of two venomous lizards, slow metabolizer, USA; 30 yr = 2592 ticks
  speciesRegistry.register({
    commonName: 'Gila Monster',
    scientificName: 'Heloderma suspectum',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Helodermatidae', genus: 'Heloderma', species: 'suspectum' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 25, strength: 30, speed: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Thorny Devil — moisture-channeling spines, Australian desert; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Thorny Devil',
    scientificName: 'Moloch horridus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Molochidae', genus: 'Moloch', species: 'horridus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 4, strength: 5, speed: 12,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Frilled Lizard — iconic neck-frill threat display, Australia and New Guinea; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Frilled Lizard',
    scientificName: 'Chlamydosaurus kingii',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Chlamydosauridae', genus: 'Chlamydosaurus', species: 'kingii' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 14, strength: 10, speed: 35,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Blue-tongued Skink — blue tongue deterrent, Australia; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Blue-tongued Skink',
    scientificName: 'Tiliqua scincoides',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Scincidae', genus: 'Tiliqua', species: 'scincoides' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160, size: 11, strength: 12, speed: 15,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Leopard Gecko — ground-dwelling, moveable eyelids, arid South Asia; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Leopard Gecko',
    scientificName: 'Eublepharis macularius',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Gekkonidae', genus: 'Eublepharis', species: 'macularius' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 3, strength: 4, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Bearded Dragon — semi-arboreal agamid, arid Australia; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Bearded Dragon',
    scientificName: 'Pogona vitticeps',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Agamidae', genus: 'Pogona', species: 'vitticeps' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296, size: 10, strength: 10, speed: 25, intelligence: 12,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Marine Iguana — only seafaring lizard, Galapagos, forages underwater; 60 yr = 5184 ticks
  speciesRegistry.register({
    commonName: 'Marine Iguana',
    scientificName: 'Amblyrhynchus cristatus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Amblyrhynchidae', genus: 'Amblyrhynchus', species: 'cristatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 5184, size: 22, strength: 18, speed: 20,
      diet: 'herbivore', socialStructure: 'colony', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Nile Monitor — large predatory monitor, widespread Africa; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Nile Monitor',
    scientificName: 'Varanus niloticus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Varanidae', genus: 'Varanus', species: 'niloticus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160, size: 50, strength: 55, speed: 35,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Lace Monitor — arboreal monitor, excellent climber, Australia; 40 yr = 3456 ticks
  speciesRegistry.register({
    commonName: 'Lace Monitor',
    scientificName: 'Varanus varius',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Varanidae', genus: 'Varanus', species: 'varius' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456, size: 45, strength: 50, speed: 30,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Eastern Glass Lizard — legless lizard (not snake), USA; 30 yr = 2592 ticks
  speciesRegistry.register({
    commonName: 'Eastern Glass Lizard',
    scientificName: 'Ophisaurus ventralis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Anguidae', genus: 'Ophisaurus', species: 'ventralis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592, size: 10, strength: 10, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Argentine Black and White Tegu — highly intelligent, South America; 20 yr = 1728 ticks
  speciesRegistry.register({
    commonName: 'Argentine Black and White Tegu',
    scientificName: 'Salvator merianae',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Teiidae', genus: 'Salvator', species: 'merianae' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728, size: 32, strength: 35, speed: 35, intelligence: 20,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Green Basilisk — runs on water surface, Central America; 10 yr = 864 ticks
  speciesRegistry.register({
    commonName: 'Green Basilisk',
    scientificName: 'Basiliscus plumifrons',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Corytophanidae', genus: 'Basiliscus', species: 'plumifrons' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864, size: 8, strength: 8, speed: 50,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Tuatara — living fossil, sole surviving Rhynchocephalia, New Zealand; 100 yr = 8640 ticks
  speciesRegistry.register({
    commonName: 'Tuatara',
    scientificName: 'Sphenodon punctatus',
    taxonomy: { class: 'Reptilia', order: 'Rhynchocephalia', family: 'Sphenodontidae', genus: 'Sphenodon', species: 'punctatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 8640, size: 8, strength: 12, speed: 10, intelligence: 14,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // ==========================================================
  // SPECIES — TURTLES / TORTOISES (8)
  // ==========================================================

  // Leatherback Sea Turtle — largest turtle, deepest diver, global; 45 yr = 3888 ticks
  speciesRegistry.register({
    commonName: 'Leatherback Sea Turtle',
    scientificName: 'Dermochelys coriacea',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Dermochelyidae', genus: 'Dermochelys', species: 'coriacea' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3888, size: 75, strength: 55, speed: 35,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['underwater'],
    },
  });

  // Hawksbill Sea Turtle — coral reef specialist, critically endangered; 50 yr = 4320 ticks
  speciesRegistry.register({
    commonName: 'Hawksbill Sea Turtle',
    scientificName: 'Eretmochelys imbricata',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Cheloniidae', genus: 'Eretmochelys', species: 'imbricata' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320, size: 35, strength: 30, speed: 28,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['underwater'],
    },
  });

  // Galapagos Giant Tortoise — longest-lived vertebrate, up to 175 yr; 175 * 86.4 = 15120 ticks
  speciesRegistry.register({
    commonName: 'Galapagos Giant Tortoise',
    scientificName: 'Chelonoidis niger',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Testudinidae', genus: 'Chelonoidis', species: 'niger' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 15120, size: 65, strength: 50, speed: 5,
      diet: 'herbivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Common Snapping Turtle — powerful jaws, freshwater, North America; 40 yr = 3456 ticks
  speciesRegistry.register({
    commonName: 'Common Snapping Turtle',
    scientificName: 'Chelydra serpentina',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Chelydridae', genus: 'Chelydra', species: 'serpentina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456, size: 35, strength: 55, speed: 10,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Eastern Box Turtle — terrestrial, hinged plastron, eastern USA; 100 yr = 8640 ticks
  speciesRegistry.register({
    commonName: 'Eastern Box Turtle',
    scientificName: 'Terrapene carolina',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Emydidae', genus: 'Terrapene', species: 'carolina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 8640, size: 10, strength: 12, speed: 5,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Painted Turtle — most widespread native turtle, North America; 55 yr = 4752 ticks
  speciesRegistry.register({
    commonName: 'Painted Turtle',
    scientificName: 'Chrysemys picta',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Emydidae', genus: 'Chrysemys', species: 'picta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 4752, size: 8, strength: 8, speed: 12,
      diet: 'omnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Mata Mata — leaf-mimicking Amazonian ambush hunter; 75 yr = 6480 ticks
  speciesRegistry.register({
    commonName: 'Mata Mata',
    scientificName: 'Chelus fimbriata',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Chelidae', genus: 'Chelus', species: 'fimbriata' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 6480, size: 25, strength: 20, speed: 5,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Florida Softshell Turtle — leathery shell, fast swimmer, freshwater; 30 yr = 2592 ticks
  speciesRegistry.register({
    commonName: 'Florida Softshell Turtle',
    scientificName: 'Apalone ferox',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Trionychidae', genus: 'Apalone', species: 'ferox' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592, size: 20, strength: 20, speed: 30,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // ==========================================================
  // SPECIES — CROCODILIANS (4)
  // ==========================================================

  // Nile Crocodile — Africa's largest reptile, apex river predator; 60 yr = 5184 ticks
  speciesRegistry.register({
    commonName: 'Nile Crocodile',
    scientificName: 'Crocodylus niloticus',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Crocodylidae', genus: 'Crocodylus', species: 'niloticus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 5184, size: 72, strength: 80, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Gharial — critically endangered, fish specialist, South Asian rivers; 60 yr = 5184 ticks
  speciesRegistry.register({
    commonName: 'Gharial',
    scientificName: 'Gavialis gangeticus',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Gavialidae', genus: 'Gavialis', species: 'gangeticus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 5184, size: 68, strength: 60, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Black Caiman — largest Amazon predator, nocturnal apex predator; 80 yr = 6912 ticks
  speciesRegistry.register({
    commonName: 'Black Caiman',
    scientificName: 'Melanosuchus niger',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Alligatoridae', genus: 'Melanosuchus', species: 'niger' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 6912, size: 70, strength: 78, speed: 22,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // Dwarf Crocodile — smallest living crocodilian, West Africa; 75 yr = 6480 ticks
  speciesRegistry.register({
    commonName: 'Dwarf Crocodile',
    scientificName: 'Osteolaemus tetraspis',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Osteolaemidae', genus: 'Osteolaemus', species: 'tetraspis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 6480, size: 28, strength: 40, speed: 18,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // ==========================================================
  // SPECIES — AMPHIBIANS: FROGS & TOADS (8)
  // ==========================================================

  // Cane Toad — invasive, toxic parotoid glands, tropical Americas; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Cane Toad',
    scientificName: 'Rhinella marina',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Bufonidae', genus: 'Rhinella', species: 'marina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296, size: 8, strength: 8, speed: 15,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Goliath Frog — largest frog in the world, Cameroon; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Goliath Frog',
    scientificName: 'Conraua goliath',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Conrauidae', genus: 'Conraua', species: 'goliath' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 20, strength: 25, speed: 25,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // African Bullfrog — male guards eggs, aestivates in drought; 45 yr = 3888 ticks
  speciesRegistry.register({
    commonName: 'African Bullfrog',
    scientificName: 'Pyxicephalus adspersus',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Pyxicephalidae', genus: 'Pyxicephalus', species: 'adspersus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3888, size: 15, strength: 20, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Glass Frog — transparent ventral skin, Central and South America; 14 yr = 1210 ticks
  speciesRegistry.register({
    commonName: 'Glass Frog',
    scientificName: 'Hyalinobatrachium valerioi',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Centrolenidae', genus: 'Hyalinobatrachium', species: 'valerioi' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1210, size: 2, strength: 2, speed: 20,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Darwin's Frog — male broods tadpoles in vocal sac, southern Chile; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: "Darwin's Frog",
    scientificName: 'Rhinoderma darwinii',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Rhinodermatidae', genus: 'Rhinoderma', species: 'darwinii' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296, size: 2, strength: 2, speed: 18,
      diet: 'carnivore', socialStructure: 'pair', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Surinam Toad — fully aquatic, eggs embed in mother's back, Amazon; 8 yr = 691 ticks
  speciesRegistry.register({
    commonName: 'Surinam Toad',
    scientificName: 'Pipa pipa',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Pipidae', genus: 'Pipa', species: 'pipa' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 691, size: 6, strength: 5, speed: 15,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // Wood Frog — freeze-tolerant, North American boreal forests; 5 yr = 432 ticks
  speciesRegistry.register({
    commonName: 'Wood Frog',
    scientificName: 'Rana sylvatica',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Ranidae', genus: 'Rana', species: 'sylvatica' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432, size: 4, strength: 4, speed: 30,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // Pac-Man Frog — enormous-mouthed ambush predator, Argentina; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Pac-Man Frog',
    scientificName: 'Ceratophrys ornata',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Ceratophryidae', genus: 'Ceratophrys', species: 'ornata' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296, size: 12, strength: 20, speed: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['surface'],
    },
  });

  // ==========================================================
  // SPECIES — AMPHIBIANS: SALAMANDERS & NEWTS (7)
  // ==========================================================

  // Fire Salamander — yellow-black warning colors, Europe; 50 yr = 4320 ticks
  speciesRegistry.register({
    commonName: 'Fire Salamander',
    scientificName: 'Salamandra salamandra',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Salamandridae', genus: 'Salamandra', species: 'salamandra' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 4320, size: 10, strength: 8, speed: 10,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Tiger Salamander — largest terrestrial salamander in North America; 25 yr = 2160 ticks
  speciesRegistry.register({
    commonName: 'Tiger Salamander',
    scientificName: 'Ambystoma tigrinum',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Ambystomatidae', genus: 'Ambystoma', species: 'tigrinum' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160, size: 12, strength: 10, speed: 12,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: false, habitat: ['surface'],
    },
  });

  // Olm — cave-dwelling neotenic salamander, Balkans, effectively blind; 100 yr = 8640 ticks
  speciesRegistry.register({
    commonName: 'Olm',
    scientificName: 'Proteus anguinus',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Proteidae', genus: 'Proteus', species: 'anguinus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 8640, size: 8, strength: 5, speed: 5, intelligence: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['underground'],
      perception: { visualRange: 0, hearingRange: 30, smellRange: 80, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Chinese Giant Salamander — world's largest amphibian, critically endangered; 60 yr = 5184 ticks
  speciesRegistry.register({
    commonName: 'Chinese Giant Salamander',
    scientificName: 'Andrias davidianus',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Cryptobranchidae', genus: 'Andrias', species: 'davidianus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 5184, size: 60, strength: 40, speed: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // Hellbender — North America's giant salamander, fully aquatic; 30 yr = 2592 ticks
  speciesRegistry.register({
    commonName: 'Hellbender',
    scientificName: 'Cryptobranchus alleganiensis',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Cryptobranchidae', genus: 'Cryptobranchus', species: 'alleganiensis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592, size: 35, strength: 25, speed: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // Eastern Newt — three-stage life cycle including toxic eft stage, eastern USA; 15 yr = 1296 ticks
  speciesRegistry.register({
    commonName: 'Eastern Newt',
    scientificName: 'Notophthalmus viridescens',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Salamandridae', genus: 'Notophthalmus', species: 'viridescens' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296, size: 5, strength: 3, speed: 10,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: true, habitat: ['surface'],
    },
  });

  // Great Crested Newt — impressive breeding crest on males, Europe; 27 yr = 2333 ticks
  speciesRegistry.register({
    commonName: 'Great Crested Newt',
    scientificName: 'Triturus cristatus',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Salamandridae', genus: 'Triturus', species: 'cristatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2333, size: 7, strength: 4, speed: 10,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, aquatic: true, habitat: ['surface'],
    },
  });

  // ==========================================================
  // SPECIES — AMPHIBIANS: CAECILIANS (1)
  // ==========================================================

  // Purple Caecilian — legless burrowing amphibian, Central America; 13 yr = 1123 ticks
  speciesRegistry.register({
    commonName: 'Purple Caecilian',
    scientificName: 'Gymnopis multiplicata',
    taxonomy: { class: 'Amphibia', order: 'Gymnophiona', family: 'Caeciliidae', genus: 'Gymnopis', species: 'multiplicata' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1123, size: 10, strength: 5, speed: 8,
      diet: 'carnivore', socialStructure: 'solitary', nocturnal: false, aquatic: false, habitat: ['underground'],
      perception: { visualRange: 5, hearingRange: 20, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

}
