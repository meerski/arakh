// ============================================================
// Taxonomy & Species Seed Data
// ============================================================

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedTaxonomy(): void {
  // === CLASSES ===
  taxonomyEngine.register({
    rank: 'class', name: 'Mammalia', parentName: null,
    traits: { intelligence: 30, socialStructure: 'pack', diet: 'omnivore', metabolicRate: 1.0 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Aves', parentName: null,
    traits: { canFly: true, speed: 70, metabolicRate: 2.5, perception: { visualRange: 80, hearingRange: 40, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Reptilia', parentName: null,
    traits: { speed: 30, lifespan: 17280, metabolicRate: 0.5, perception: { visualRange: 40, hearingRange: 20, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: true } },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Actinopterygii', parentName: null,
    traits: { aquatic: true, habitat: ['underwater'], speed: 60, metabolicRate: 0.8 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Insecta', parentName: null,
    traits: { size: 2, lifespan: 480, reproductionRate: 50, socialStructure: 'hive', speed: 40, metabolicRate: 3.0 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Arachnida', parentName: null,
    traits: { size: 3, lifespan: 720, diet: 'carnivore', metabolicRate: 2.5 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Malacostraca', parentName: null,
    traits: { aquatic: true, habitat: ['underwater'], size: 10, metabolicRate: 1.0 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Chondrichthyes', parentName: null,
    traits: { aquatic: true, habitat: ['underwater'], diet: 'carnivore', size: 70, speed: 70, metabolicRate: 0.6 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Amphibia', parentName: null,
    traits: { size: 8, lifespan: 8640, diet: 'carnivore', habitat: ['surface'], aquatic: false, speed: 25, metabolicRate: 1.5 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Cephalopoda', parentName: null,
    traits: { aquatic: true, habitat: ['underwater'], intelligence: 30, diet: 'carnivore', size: 30, metabolicRate: 1.2 },
  });
  taxonomyEngine.register({
    rank: 'class', name: 'Gastropoda', parentName: null,
    traits: { size: 5, speed: 5, lifespan: 4320, diet: 'herbivore', habitat: ['surface'], metabolicRate: 0.3 },
  });

  // === ORDERS ===
  taxonomyEngine.register({
    rank: 'order', name: 'Primates', parentName: 'Mammalia',
    traits: { intelligence: 60, socialStructure: 'pack', perception: { visualRange: 70, hearingRange: 50, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Carnivora', parentName: 'Mammalia',
    traits: { diet: 'carnivore', strength: 70, speed: 65 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Artiodactyla', parentName: 'Mammalia',
    traits: { diet: 'herbivore', socialStructure: 'herd', size: 70, speed: 60 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Rodentia', parentName: 'Mammalia',
    traits: { size: 5, reproductionRate: 6, lifespan: 1728, metabolicRate: 2.5 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cetacea', parentName: 'Mammalia',
    traits: { aquatic: true, habitat: ['underwater'], size: 90, intelligence: 50, socialStructure: 'pack', metabolicRate: 0.4 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Chiroptera', parentName: 'Mammalia',
    traits: { canFly: true, nocturnal: true, size: 5, metabolicRate: 2.5, perception: { visualRange: 20, hearingRange: 90, smellRange: 30, echolocation: true, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Proboscidea', parentName: 'Mammalia',
    traits: { size: 95, strength: 90, intelligence: 50, socialStructure: 'herd', lifespan: 51840, metabolicRate: 0.3 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Passeriformes', parentName: 'Aves',
    traits: { size: 5, socialStructure: 'pack', metabolicRate: 3.0 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Accipitriformes', parentName: 'Aves',
    traits: { diet: 'carnivore', size: 30, perception: { visualRange: 95, hearingRange: 50, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Hymenoptera', parentName: 'Insecta',
    traits: { socialStructure: 'hive', intelligence: 5, reproductionRate: 100 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Coleoptera', parentName: 'Insecta',
    traits: { strength: 20, size: 3 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Squamata', parentName: 'Reptilia',
    traits: { size: 15 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Testudines', parentName: 'Reptilia',
    traits: { speed: 10, lifespan: 129600, size: 40, strength: 20 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Crocodilia', parentName: 'Reptilia',
    traits: { diet: 'carnivore', size: 75, strength: 85, speed: 25 },
  });
  // New orders
  taxonomyEngine.register({
    rank: 'order', name: 'Perissodactyla', parentName: 'Mammalia',
    traits: { diet: 'herbivore', size: 80, strength: 75, speed: 65, socialStructure: 'herd' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Diprotodontia', parentName: 'Mammalia',
    traits: { diet: 'herbivore', size: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Monotremata', parentName: 'Mammalia',
    traits: { size: 15, reproductionRate: 1 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Pilosa', parentName: 'Mammalia',
    traits: { speed: 10, strength: 20, diet: 'herbivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Pholidota', parentName: 'Mammalia',
    traits: { size: 20, diet: 'carnivore', nocturnal: true, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Lagomorpha', parentName: 'Mammalia',
    traits: { size: 10, speed: 55, diet: 'herbivore', reproductionRate: 6, metabolicRate: 2.0 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Erinaceomorpha', parentName: 'Mammalia',
    traits: { size: 8, nocturnal: true, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Pinnipedia', parentName: 'Mammalia',
    traits: { aquatic: true, habitat: ['underwater'], size: 70, strength: 50 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Sphenisciformes', parentName: 'Aves',
    traits: { canFly: false, aquatic: true, size: 30, socialStructure: 'colony', speed: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Phoenicopteriformes', parentName: 'Aves',
    traits: { size: 30, socialStructure: 'colony', diet: 'filter_feeder' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Struthioniformes', parentName: 'Aves',
    traits: { canFly: false, size: 60, speed: 80, strength: 40 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Strigiformes', parentName: 'Aves',
    traits: { diet: 'carnivore', nocturnal: true, perception: { visualRange: 90, hearingRange: 85, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Apodiformes', parentName: 'Aves',
    traits: { size: 3, speed: 90, canFly: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Procellariiformes', parentName: 'Aves',
    traits: { size: 35, canFly: true, habitat: ['surface'] },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Psittaciformes', parentName: 'Aves',
    traits: { intelligence: 35, socialStructure: 'pack', size: 15 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Galliformes', parentName: 'Aves',
    traits: { size: 25, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Falconiformes', parentName: 'Aves',
    traits: { diet: 'carnivore', speed: 80, perception: { visualRange: 95, hearingRange: 50, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cathartiformes', parentName: 'Aves',
    traits: { diet: 'carnivore', size: 30, perception: { visualRange: 90, hearingRange: 30, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Pelecaniformes', parentName: 'Aves',
    traits: { size: 35, diet: 'carnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Coraciiformes', parentName: 'Aves',
    traits: { size: 10, diet: 'carnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Piciformes', parentName: 'Aves',
    traits: { size: 10, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Lepidoptera', parentName: 'Insecta',
    traits: { canFly: true, size: 2, lifespan: 240, diet: 'herbivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Odonata', parentName: 'Insecta',
    traits: { canFly: true, speed: 60, diet: 'carnivore', size: 3 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Mantodea', parentName: 'Insecta',
    traits: { diet: 'carnivore', size: 3, perception: { visualRange: 60, hearingRange: 20, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Blattodea', parentName: 'Insecta',
    traits: { socialStructure: 'colony', size: 2 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Orthoptera', parentName: 'Insecta',
    traits: { size: 3, speed: 50, diet: 'herbivore', socialStructure: 'herd' },
  });
  // Amphibian orders
  taxonomyEngine.register({
    rank: 'order', name: 'Anura', parentName: 'Amphibia',
    traits: { size: 5, speed: 35 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Urodela', parentName: 'Amphibia',
    traits: { size: 12, speed: 15, aquatic: true },
  });
  // Cephalopod orders
  taxonomyEngine.register({
    rank: 'order', name: 'Octopoda', parentName: 'Cephalopoda',
    traits: { intelligence: 40, size: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Teuthida', parentName: 'Cephalopoda',
    traits: { speed: 60, size: 40 },
  });
  // Gastropod orders
  taxonomyEngine.register({
    rank: 'order', name: 'Stylommatophora', parentName: 'Gastropoda',
    traits: { size: 8, speed: 3 },
  });
  // Shark orders
  taxonomyEngine.register({
    rank: 'order', name: 'Lamniformes', parentName: 'Chondrichthyes',
    traits: { speed: 75, strength: 80, size: 80 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Carcharhiniformes', parentName: 'Chondrichthyes',
    traits: { speed: 65, strength: 70, size: 70 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Orectolobiformes', parentName: 'Chondrichthyes',
    traits: { diet: 'filter_feeder', size: 95, speed: 40, strength: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Myliobatiformes', parentName: 'Chondrichthyes',
    traits: { size: 75, speed: 50, diet: 'filter_feeder' },
  });
  // Crustacean orders
  taxonomyEngine.register({
    rank: 'order', name: 'Decapoda', parentName: 'Malacostraca',
    traits: { size: 15, strength: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Stomatopoda', parentName: 'Malacostraca',
    traits: { strength: 60, speed: 50, perception: { visualRange: 90, hearingRange: 20, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false } },
  });
  // Arachnid orders
  taxonomyEngine.register({
    rank: 'order', name: 'Araneae', parentName: 'Arachnida',
    traits: { size: 3, diet: 'carnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Scorpiones', parentName: 'Arachnida',
    traits: { size: 5, nocturnal: true, strength: 25 },
  });
  // Fish orders
  taxonomyEngine.register({
    rank: 'order', name: 'Salmoniformes', parentName: 'Actinopterygii',
    traits: { size: 25, speed: 55 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Perciformes', parentName: 'Actinopterygii',
    traits: { size: 20, speed: 50 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Lophiiformes', parentName: 'Actinopterygii',
    traits: { size: 15, speed: 15, habitat: ['underwater'], nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Characiformes', parentName: 'Actinopterygii',
    traits: { size: 10, speed: 55, diet: 'carnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Tetraodontiformes', parentName: 'Actinopterygii',
    traits: { size: 12, speed: 25 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Scombriformes', parentName: 'Actinopterygii',
    traits: { size: 40, speed: 80 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Syngnathiformes', parentName: 'Actinopterygii',
    traits: { size: 5, speed: 10, socialStructure: 'pair' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Gymnotiformes', parentName: 'Actinopterygii',
    traits: { size: 30, perception: { visualRange: 10, hearingRange: 30, smellRange: 20, echolocation: false, electroreception: true, thermalSensing: false } },
  });

  // === FAMILIES ===
  taxonomyEngine.register({ rank: 'family', name: 'Hominidae', parentName: 'Primates', traits: { intelligence: 70, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Canidae', parentName: 'Carnivora', traits: { socialStructure: 'pack', speed: 70 } });
  taxonomyEngine.register({ rank: 'family', name: 'Felidae', parentName: 'Carnivora', traits: { socialStructure: 'solitary', speed: 80, strength: 65 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ursidae', parentName: 'Carnivora', traits: { size: 85, strength: 90, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Cervidae', parentName: 'Artiodactyla', traits: { speed: 70, size: 60 } });
  taxonomyEngine.register({ rank: 'family', name: 'Bovidae', parentName: 'Artiodactyla', traits: { strength: 60, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'family', name: 'Corvidae', parentName: 'Passeriformes', traits: { intelligence: 40 } });
  taxonomyEngine.register({ rank: 'family', name: 'Accipitridae', parentName: 'Accipitriformes', traits: { strength: 50 } });
  taxonomyEngine.register({ rank: 'family', name: 'Formicidae', parentName: 'Hymenoptera', traits: { socialStructure: 'colony', strength: 15, intelligence: 8 } });
  taxonomyEngine.register({ rank: 'family', name: 'Apidae', parentName: 'Hymenoptera', traits: { socialStructure: 'hive', canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Delphinidae', parentName: 'Cetacea', traits: { intelligence: 55, speed: 70, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Elephantidae', parentName: 'Proboscidea', traits: { intelligence: 55 } });
  taxonomyEngine.register({ rank: 'family', name: 'Viperidae', parentName: 'Squamata', traits: { diet: 'carnivore', perception: { visualRange: 30, hearingRange: 20, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: true } } });
  taxonomyEngine.register({ rank: 'family', name: 'Testudinidae', parentName: 'Testudines', traits: { strength: 30, lifespan: 129600 } });
  taxonomyEngine.register({ rank: 'family', name: 'Crocodylidae', parentName: 'Crocodilia', traits: {} });
  taxonomyEngine.register({ rank: 'family', name: 'Muridae', parentName: 'Rodentia', traits: { size: 3, reproductionRate: 8 } });
  // New families
  taxonomyEngine.register({ rank: 'family', name: 'Mustelidae', parentName: 'Carnivora', traits: { size: 20, speed: 50, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Odobenidae', parentName: 'Pinnipedia', traits: { size: 85, strength: 70 } });
  taxonomyEngine.register({ rank: 'family', name: 'Hippopotamidae', parentName: 'Artiodactyla', traits: { size: 90, strength: 85, speed: 30, aquatic: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Rhinocerotidae', parentName: 'Perissodactyla', traits: { size: 90, strength: 85, speed: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Giraffidae', parentName: 'Artiodactyla', traits: { size: 95, speed: 55 } });
  taxonomyEngine.register({ rank: 'family', name: 'Equidae', parentName: 'Perissodactyla', traits: { size: 65, speed: 75, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'family', name: 'Macropodidae', parentName: 'Diprotodontia', traits: { size: 40, speed: 60, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'family', name: 'Phascolarctidae', parentName: 'Diprotodontia', traits: { size: 20, speed: 10, diet: 'herbivore', socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'family', name: 'Ornithorhynchidae', parentName: 'Monotremata', traits: { size: 15, aquatic: true, perception: { visualRange: 20, hearingRange: 30, smellRange: 30, echolocation: false, electroreception: true, thermalSensing: false } } });
  taxonomyEngine.register({ rank: 'family', name: 'Pteropodidae', parentName: 'Chiroptera', traits: { size: 10, diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Balaenopteridae', parentName: 'Cetacea', traits: { size: 98, diet: 'filter_feeder', socialStructure: 'pair' } });
  taxonomyEngine.register({ rank: 'family', name: 'Monodontidae', parentName: 'Cetacea', traits: { size: 75, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Phocoenidae', parentName: 'Cetacea', traits: {} });
  taxonomyEngine.register({ rank: 'family', name: 'Manidae', parentName: 'Pholidota', traits: { size: 20, strength: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Bradypodidae', parentName: 'Pilosa', traits: { size: 18, speed: 5 } });
  taxonomyEngine.register({ rank: 'family', name: 'Castoridae', parentName: 'Rodentia', traits: { size: 20, aquatic: true, socialStructure: 'colony' } });
  taxonomyEngine.register({ rank: 'family', name: 'Leporidae', parentName: 'Lagomorpha', traits: { size: 12, speed: 55 } });
  taxonomyEngine.register({ rank: 'family', name: 'Erinaceidae', parentName: 'Erinaceomorpha', traits: { size: 8, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Spheniscidae', parentName: 'Sphenisciformes', traits: { size: 35, socialStructure: 'colony' } });
  taxonomyEngine.register({ rank: 'family', name: 'Phoenicopteridae', parentName: 'Phoenicopteriformes', traits: { size: 35, socialStructure: 'colony' } });
  taxonomyEngine.register({ rank: 'family', name: 'Struthionidae', parentName: 'Struthioniformes', traits: { size: 65, strength: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Strigidae', parentName: 'Strigiformes', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Trochilidae', parentName: 'Apodiformes', traits: { size: 2, speed: 85 } });
  taxonomyEngine.register({ rank: 'family', name: 'Diomedeidae', parentName: 'Procellariiformes', traits: { size: 40, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Psittacidae', parentName: 'Psittaciformes', traits: { intelligence: 40 } });
  taxonomyEngine.register({ rank: 'family', name: 'Phasianidae', parentName: 'Galliformes', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Cathartidae', parentName: 'Cathartiformes', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Pelecanidae', parentName: 'Pelecaniformes', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'family', name: 'Alcedinidae', parentName: 'Coraciiformes', traits: { size: 8, speed: 65 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ramphastidae', parentName: 'Piciformes', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Picidae', parentName: 'Piciformes', traits: { size: 10 } });
  taxonomyEngine.register({ rank: 'family', name: 'Elapidae', parentName: 'Squamata', traits: { diet: 'carnivore', speed: 35 } });
  taxonomyEngine.register({ rank: 'family', name: 'Boidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 60, strength: 70, speed: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Pythonidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 55, strength: 65, speed: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Varanidae', parentName: 'Squamata', traits: { diet: 'carnivore', size: 50, strength: 55, intelligence: 15, speed: 35 } });
  taxonomyEngine.register({ rank: 'family', name: 'Cheloniidae', parentName: 'Testudines', traits: { aquatic: true, habitat: ['underwater'], size: 35, speed: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Chamaeleonidae', parentName: 'Squamata', traits: { size: 10, speed: 10, perception: { visualRange: 80, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false } } });
  taxonomyEngine.register({ rank: 'family', name: 'Iguanidae', parentName: 'Squamata', traits: { diet: 'herbivore', size: 25, speed: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Gekkonidae', parentName: 'Squamata', traits: { size: 5, speed: 40, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Alligatoridae', parentName: 'Crocodilia', traits: { size: 70, strength: 80 } });
  taxonomyEngine.register({ rank: 'family', name: 'Nymphalidae', parentName: 'Lepidoptera', traits: { canFly: true, size: 2 } });
  taxonomyEngine.register({ rank: 'family', name: 'Saturniidae', parentName: 'Lepidoptera', traits: { size: 4, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Libellulidae', parentName: 'Odonata', traits: { speed: 60, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Mantidae', parentName: 'Mantodea', traits: {} });
  taxonomyEngine.register({ rank: 'family', name: 'Scarabaeidae', parentName: 'Coleoptera', traits: { strength: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Lampyridae', parentName: 'Coleoptera', traits: { nocturnal: true, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Termitidae', parentName: 'Blattodea', traits: { socialStructure: 'colony', strength: 10 } });
  taxonomyEngine.register({ rank: 'family', name: 'Acrididae', parentName: 'Orthoptera', traits: { speed: 50, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'family', name: 'Coccinellidae', parentName: 'Coleoptera', traits: { size: 1, canFly: true, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Dynastinae', parentName: 'Coleoptera', traits: { strength: 50, size: 5 } });
  taxonomyEngine.register({ rank: 'family', name: 'Dendrobatidae', parentName: 'Anura', traits: { size: 3, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Ambystomatidae', parentName: 'Urodela', traits: { size: 10, aquatic: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Cryptobranchidae', parentName: 'Urodela', traits: { size: 40, aquatic: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Hylidae', parentName: 'Anura', traits: { size: 4, speed: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Bufonidae', parentName: 'Anura', traits: { size: 6, speed: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Octopodidae', parentName: 'Octopoda', traits: { intelligence: 45, size: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Architeuthidae', parentName: 'Teuthida', traits: { size: 80, speed: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Achatinidae', parentName: 'Stylommatophora', traits: { size: 10, speed: 3 } });
  taxonomyEngine.register({ rank: 'family', name: 'Lamnidae', parentName: 'Lamniformes', traits: { speed: 75, strength: 85 } });
  taxonomyEngine.register({ rank: 'family', name: 'Sphyrnidae', parentName: 'Carcharhiniformes', traits: { size: 75, perception: { visualRange: 80, hearingRange: 40, smellRange: 80, echolocation: false, electroreception: true, thermalSensing: false } } });
  taxonomyEngine.register({ rank: 'family', name: 'Rhincodontidae', parentName: 'Orectolobiformes', traits: { size: 98, diet: 'filter_feeder' } });
  taxonomyEngine.register({ rank: 'family', name: 'Mobulidae', parentName: 'Myliobatiformes', traits: { size: 80, diet: 'filter_feeder' } });
  taxonomyEngine.register({ rank: 'family', name: 'Carcharhinidae', parentName: 'Carcharhiniformes', traits: { speed: 70, strength: 75 } });
  taxonomyEngine.register({ rank: 'family', name: 'Majidae', parentName: 'Decapoda', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Nephropidae', parentName: 'Decapoda', traits: { size: 20, strength: 35 } });
  taxonomyEngine.register({ rank: 'family', name: 'Squillidae', parentName: 'Stomatopoda', traits: { strength: 65 } });
  taxonomyEngine.register({ rank: 'family', name: 'Theraphosidae', parentName: 'Araneae', traits: { size: 8, strength: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Theridiidae', parentName: 'Araneae', traits: { size: 1 } });
  taxonomyEngine.register({ rank: 'family', name: 'Scorpionidae', parentName: 'Scorpiones', traits: { size: 8, strength: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Salmonidae', parentName: 'Salmoniformes', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'family', name: 'Pomacentridae', parentName: 'Perciformes', traits: { size: 5, socialStructure: 'pair' } });
  taxonomyEngine.register({ rank: 'family', name: 'Ceratiidae', parentName: 'Lophiiformes', traits: { size: 15, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Serrasalmidae', parentName: 'Characiformes', traits: { size: 10, socialStructure: 'pack', diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Tetraodontidae', parentName: 'Tetraodontiformes', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'family', name: 'Xiphiidae', parentName: 'Scombriformes', traits: { size: 60, speed: 85 } });
  taxonomyEngine.register({ rank: 'family', name: 'Syngnathidae', parentName: 'Syngnathiformes', traits: { size: 5, speed: 5 } });
  taxonomyEngine.register({ rank: 'family', name: 'Gymnotidae', parentName: 'Gymnotiformes', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Scombridae', parentName: 'Scombriformes', traits: { size: 50, speed: 80 } });
  taxonomyEngine.register({ rank: 'family', name: 'Sphyraenidae', parentName: 'Perciformes', traits: { size: 40, speed: 75, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Falconidae', parentName: 'Falconiformes', traits: { speed: 85, strength: 40 } });

  // === GENERA ===
  taxonomyEngine.register({ rank: 'genus', name: 'Homo', parentName: 'Hominidae', traits: { intelligence: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pan', parentName: 'Hominidae', traits: { intelligence: 60, strength: 70 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Canis', parentName: 'Canidae', traits: { perception: { visualRange: 40, hearingRange: 70, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false } } });
  taxonomyEngine.register({ rank: 'genus', name: 'Panthera', parentName: 'Felidae', traits: { size: 70, strength: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Felis', parentName: 'Felidae', traits: { size: 10, speed: 60, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ursus', parentName: 'Ursidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Corvus', parentName: 'Corvidae', traits: { intelligence: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Aquila', parentName: 'Accipitridae', traits: { size: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tursiops', parentName: 'Delphinidae', traits: { intelligence: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Loxodonta', parentName: 'Elephantidae', traits: { size: 97 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Crocodylus', parentName: 'Crocodylidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Gopherus', parentName: 'Testudinidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Mus', parentName: 'Muridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Lasius', parentName: 'Formicidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Apis', parentName: 'Apidae', traits: {} });
  // New genera
  taxonomyEngine.register({ rank: 'genus', name: 'Vulpes', parentName: 'Canidae', traits: { size: 15, speed: 60, socialStructure: 'pair' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Alces', parentName: 'Cervidae', traits: { size: 80, strength: 70 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Bison', parentName: 'Bovidae', traits: { size: 85, strength: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hippopotamus', parentName: 'Hippopotamidae', traits: { size: 90 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Diceros', parentName: 'Rhinocerotidae', traits: { size: 88 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Giraffa', parentName: 'Giraffidae', traits: { size: 95 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Equus', parentName: 'Equidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Macropus', parentName: 'Macropodidae', traits: { size: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phascolarctos', parentName: 'Phascolarctidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Ornithorhynchus', parentName: 'Ornithorhynchidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pteropus', parentName: 'Pteropodidae', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Orcinus', parentName: 'Delphinidae', traits: { size: 90, strength: 85, intelligence: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Megaptera', parentName: 'Balaenopteridae', traits: { size: 95 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Balaenoptera', parentName: 'Balaenopteridae', traits: { size: 99 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Enhydra', parentName: 'Mustelidae', traits: { aquatic: true, size: 20, intelligence: 25 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Odobenus', parentName: 'Odobenidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pongo', parentName: 'Hominidae', traits: { intelligence: 55, socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Gorilla', parentName: 'Hominidae', traits: { intelligence: 55, strength: 85, size: 75 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Manis', parentName: 'Manidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Bradypus', parentName: 'Bradypodidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Castor', parentName: 'Castoridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Oryctolagus', parentName: 'Leporidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Erinaceus', parentName: 'Erinaceidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Gulo', parentName: 'Mustelidae', traits: { size: 25, strength: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Monodon', parentName: 'Monodontidae', traits: { size: 75 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Aptenodytes', parentName: 'Spheniscidae', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phoenicopterus', parentName: 'Phoenicopteridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Struthio', parentName: 'Struthionidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Bubo', parentName: 'Strigidae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Archilochus', parentName: 'Trochilidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Diomedea', parentName: 'Diomedeidae', traits: { size: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ara', parentName: 'Psittacidae', traits: { size: 25, intelligence: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pavo', parentName: 'Phasianidae', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Haliaeetus', parentName: 'Accipitridae', traits: { size: 35, strength: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Buteo', parentName: 'Accipitridae', traits: { size: 25 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cathartes', parentName: 'Cathartidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pelecanus', parentName: 'Pelecanidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Alcedo', parentName: 'Alcedinidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Ramphastos', parentName: 'Ramphastidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Dryocopus', parentName: 'Picidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Ophiophagus', parentName: 'Elapidae', traits: { size: 55, strength: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Eunectes', parentName: 'Boidae', traits: { size: 70, strength: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Varanus', parentName: 'Varanidae', traits: { size: 55, intelligence: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chelonia', parentName: 'Cheloniidae', traits: { lifespan: 69120 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chamaeleo', parentName: 'Chamaeleonidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Iguana', parentName: 'Iguanidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Gekko', parentName: 'Gekkonidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Alligator', parentName: 'Alligatoridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Python', parentName: 'Pythonidae', traits: { size: 55, strength: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Crotalus', parentName: 'Viperidae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Danaus', parentName: 'Nymphalidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Attacus', parentName: 'Saturniidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Anax', parentName: 'Libellulidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Mantis', parentName: 'Mantidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Scarabaeus', parentName: 'Scarabaeidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Photinus', parentName: 'Lampyridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Macrotermes', parentName: 'Termitidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Schistocerca', parentName: 'Acrididae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Coccinella', parentName: 'Coccinellidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Dynastes', parentName: 'Dynastinae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Dendrobates', parentName: 'Dendrobatidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Ambystoma', parentName: 'Ambystomatidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Andrias', parentName: 'Cryptobranchidae', traits: { size: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Agalychnis', parentName: 'Hylidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Bufo', parentName: 'Bufonidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Enteroctopus', parentName: 'Octopodidae', traits: { size: 40, intelligence: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hapalochlaena', parentName: 'Octopodidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Architeuthis', parentName: 'Architeuthidae', traits: { size: 85 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Achatina', parentName: 'Achatinidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Carcharodon', parentName: 'Lamnidae', traits: { size: 85 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sphyrna', parentName: 'Sphyrnidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Rhincodon', parentName: 'Rhincodontidae', traits: { size: 98 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mobula', parentName: 'Mobulidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Galeocerdo', parentName: 'Carcharhinidae', traits: { size: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Macrocheira', parentName: 'Majidae', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Homarus', parentName: 'Nephropidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Odontodactylus', parentName: 'Squillidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Theraphosa', parentName: 'Theraphosidae', traits: { size: 10 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Latrodectus', parentName: 'Theridiidae', traits: { size: 1 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pandinus', parentName: 'Scorpionidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Salmo', parentName: 'Salmonidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Amphiprion', parentName: 'Pomacentridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Cryptopsaras', parentName: 'Ceratiidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Pygocentrus', parentName: 'Serrasalmidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Takifugu', parentName: 'Tetraodontidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Xiphias', parentName: 'Xiphiidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Hippocampus', parentName: 'Syngnathidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Electrophorus', parentName: 'Gymnotidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Thunnus', parentName: 'Scombridae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Sphyraena', parentName: 'Sphyraenidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Uncia', parentName: 'Felidae', traits: { size: 50, strength: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Falco', parentName: 'Falconidae', traits: {} });

  // === FLAGSHIP SPECIES ===

  // ========================
  // MAMMALS
  // ========================

  speciesRegistry.register({
    commonName: 'Human', scientificName: 'Homo sapiens',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Homo', species: 'sapiens' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048, intelligence: 80, socialStructure: 'pack', size: 50 },
  });

  speciesRegistry.register({
    commonName: 'Gray Wolf', scientificName: 'Canis lupus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'lupus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1296, socialStructure: 'pack', size: 40 },
  });

  speciesRegistry.register({
    commonName: 'African Elephant', scientificName: 'Loxodonta africana',
    taxonomy: { class: 'Mammalia', order: 'Proboscidea', family: 'Elephantidae', genus: 'Loxodonta', species: 'africana' },
    tier: 'flagship',
    traitOverrides: { lifespan: 51840 },
  });

  speciesRegistry.register({
    commonName: 'Lion', scientificName: 'Panthera leo',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'leo' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1296, socialStructure: 'pack' },
  });

  speciesRegistry.register({
    commonName: 'Chimpanzee', scientificName: 'Pan troglodytes',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Pan', species: 'troglodytes' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, intelligence: 60, socialStructure: 'pack' },
  });

  speciesRegistry.register({
    commonName: 'Grizzly Bear', scientificName: 'Ursus arctos',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ursus', species: 'arctos' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, socialStructure: 'solitary' },
  });

  speciesRegistry.register({
    commonName: 'House Mouse', scientificName: 'Mus musculus',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Muridae', genus: 'Mus', species: 'musculus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 173 },
  });

  speciesRegistry.register({
    commonName: 'Bottlenose Dolphin', scientificName: 'Tursiops truncatus',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Delphinidae', genus: 'Tursiops', species: 'truncatus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3888, intelligence: 60, habitat: ['underwater'] },
  });

  speciesRegistry.register({
    commonName: 'Tiger', scientificName: 'Panthera tigris',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'tigris' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, size: 75, strength: 85, socialStructure: 'solitary', maturityTicks: 2500 },
  });

  speciesRegistry.register({
    commonName: 'Leopard', scientificName: 'Panthera pardus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'pardus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1555, size: 55, strength: 70, socialStructure: 'solitary', nocturnal: true, maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Snow Leopard', scientificName: 'Uncia uncia',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Uncia', species: 'uncia' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 50, strength: 60, socialStructure: 'solitary', habitat: ['surface'], maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Polar Bear', scientificName: 'Ursus maritimus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ursus', species: 'maritimus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, size: 90, strength: 92, diet: 'carnivore', socialStructure: 'solitary', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Red Fox', scientificName: 'Vulpes vulpes',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Vulpes', species: 'vulpes' },
    tier: 'flagship',
    traitOverrides: { lifespan: 432, size: 15, speed: 60, socialStructure: 'pair', nocturnal: true, maturityTicks: 700 },
  });

  speciesRegistry.register({
    commonName: 'Arctic Fox', scientificName: 'Vulpes lagopus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Vulpes', species: 'lagopus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 345, size: 12, speed: 55, socialStructure: 'pair', maturityTicks: 600 },
  });

  speciesRegistry.register({
    commonName: 'Moose', scientificName: 'Alces alces',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'Alces', species: 'alces' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 85, strength: 75, socialStructure: 'solitary', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'American Bison', scientificName: 'Bison bison',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Bison', species: 'bison' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 88, strength: 85, socialStructure: 'herd', maturityTicks: 2500 },
  });

  speciesRegistry.register({
    commonName: 'Hippopotamus', scientificName: 'Hippopotamus amphibius',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Hippopotamidae', genus: 'Hippopotamus', species: 'amphibius' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3888, size: 92, strength: 90, aquatic: true, socialStructure: 'herd', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Black Rhinoceros', scientificName: 'Diceros bicornis',
    taxonomy: { class: 'Mammalia', order: 'Perissodactyla', family: 'Rhinocerotidae', genus: 'Diceros', species: 'bicornis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3888, size: 88, strength: 88, socialStructure: 'solitary', maturityTicks: 3500 },
  });

  speciesRegistry.register({
    commonName: 'Giraffe', scientificName: 'Giraffa camelopardalis',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Giraffidae', genus: 'Giraffa', species: 'camelopardalis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, size: 97, speed: 55, socialStructure: 'herd', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Plains Zebra', scientificName: 'Equus quagga',
    taxonomy: { class: 'Mammalia', order: 'Perissodactyla', family: 'Equidae', genus: 'Equus', species: 'quagga' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, size: 65, speed: 70, socialStructure: 'herd', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Red Kangaroo', scientificName: 'Macropus rufus',
    taxonomy: { class: 'Mammalia', order: 'Diprotodontia', family: 'Macropodidae', genus: 'Macropus', species: 'rufus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 50, speed: 65, socialStructure: 'herd', maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Koala', scientificName: 'Phascolarctos cinereus',
    taxonomy: { class: 'Mammalia', order: 'Diprotodontia', family: 'Phascolarctidae', genus: 'Phascolarctos', species: 'cinereus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1123, size: 20, speed: 8, diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Platypus', scientificName: 'Ornithorhynchus anatinus',
    taxonomy: { class: 'Mammalia', order: 'Monotremata', family: 'Ornithorhynchidae', genus: 'Ornithorhynchus', species: 'anatinus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1469, size: 15, aquatic: true, diet: 'carnivore', socialStructure: 'solitary', perception: { visualRange: 20, hearingRange: 30, smellRange: 30, echolocation: false, electroreception: true, thermalSensing: false }, maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Large Flying Fox', scientificName: 'Pteropus vampyrus',
    taxonomy: { class: 'Mammalia', order: 'Chiroptera', family: 'Pteropodidae', genus: 'Pteropus', species: 'vampyrus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592, size: 12, canFly: true, nocturnal: true, diet: 'herbivore', socialStructure: 'colony', maturityTicks: 700 },
  });

  speciesRegistry.register({
    commonName: 'Orca', scientificName: 'Orcinus orca',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Delphinidae', genus: 'Orcinus', species: 'orca' },
    tier: 'flagship',
    traitOverrides: { lifespan: 7776, size: 90, strength: 90, intelligence: 60, aquatic: true, habitat: ['underwater'], socialStructure: 'pack', maturityTicks: 5000 },
  });

  speciesRegistry.register({
    commonName: 'Humpback Whale', scientificName: 'Megaptera novaeangliae',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Balaenopteridae', genus: 'Megaptera', species: 'novaeangliae' },
    tier: 'flagship',
    traitOverrides: { lifespan: 7776, size: 95, aquatic: true, habitat: ['underwater'], socialStructure: 'pair', maturityTicks: 4000 },
  });

  speciesRegistry.register({
    commonName: 'Blue Whale', scientificName: 'Balaenoptera musculus',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Balaenopteridae', genus: 'Balaenoptera', species: 'musculus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 7776, size: 99, aquatic: true, habitat: ['underwater'], socialStructure: 'pair', maturityTicks: 5000 },
  });

  speciesRegistry.register({
    commonName: 'Sea Otter', scientificName: 'Enhydra lutris',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Enhydra', species: 'lutris' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 20, aquatic: true, habitat: ['underwater'], intelligence: 25, socialStructure: 'pack', maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Walrus', scientificName: 'Odobenus rosmarus',
    taxonomy: { class: 'Mammalia', order: 'Pinnipedia', family: 'Odobenidae', genus: 'Odobenus', species: 'rosmarus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 88, strength: 70, aquatic: true, habitat: ['underwater'], socialStructure: 'herd', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Bornean Orangutan', scientificName: 'Pongo pygmaeus',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Pongo', species: 'pygmaeus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3888, size: 50, intelligence: 55, socialStructure: 'solitary', maturityTicks: 4000 },
  });

  speciesRegistry.register({
    commonName: 'Western Gorilla', scientificName: 'Gorilla gorilla',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Gorilla', species: 'gorilla' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 75, strength: 85, intelligence: 55, socialStructure: 'pack', maturityTicks: 4000 },
  });

  speciesRegistry.register({
    commonName: 'Chinese Pangolin', scientificName: 'Manis pentadactyla',
    taxonomy: { class: 'Mammalia', order: 'Pholidota', family: 'Manidae', genus: 'Manis', species: 'pentadactyla' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 18, nocturnal: true, socialStructure: 'solitary', maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Brown-throated Sloth', scientificName: 'Bradypus variegatus',
    taxonomy: { class: 'Mammalia', order: 'Pilosa', family: 'Bradypodidae', genus: 'Bradypus', species: 'variegatus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 18, speed: 5, diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 1200 },
  });

  speciesRegistry.register({
    commonName: 'North American Beaver', scientificName: 'Castor canadensis',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Castoridae', genus: 'Castor', species: 'canadensis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 22, aquatic: true, socialStructure: 'colony', intelligence: 20, maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'European Rabbit', scientificName: 'Oryctolagus cuniculus',
    taxonomy: { class: 'Mammalia', order: 'Lagomorpha', family: 'Leporidae', genus: 'Oryctolagus', species: 'cuniculus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 777, size: 12, speed: 55, reproductionRate: 8, socialStructure: 'colony', maturityTicks: 400 },
  });

  speciesRegistry.register({
    commonName: 'European Hedgehog', scientificName: 'Erinaceus europaeus',
    taxonomy: { class: 'Mammalia', order: 'Erinaceomorpha', family: 'Erinaceidae', genus: 'Erinaceus', species: 'europaeus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 518, size: 8, nocturnal: true, socialStructure: 'solitary', maturityTicks: 500 },
  });

  speciesRegistry.register({
    commonName: 'Wolverine', scientificName: 'Gulo gulo',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Gulo', species: 'gulo' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1296, size: 25, strength: 65, diet: 'carnivore', socialStructure: 'solitary', maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Narwhal', scientificName: 'Monodon monoceros',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Monodontidae', genus: 'Monodon', species: 'monoceros' },
    tier: 'flagship',
    traitOverrides: { lifespan: 4320, size: 75, aquatic: true, habitat: ['underwater'], socialStructure: 'pack', maturityTicks: 3500 },
  });

  // ========================
  // BIRDS
  // ========================

  speciesRegistry.register({
    commonName: 'Common Raven', scientificName: 'Corvus corax',
    taxonomy: { class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Corvus', species: 'corax' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1814, intelligence: 45 },
  });

  speciesRegistry.register({
    commonName: 'Golden Eagle', scientificName: 'Aquila chrysaetos',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Aquila', species: 'chrysaetos' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592 },
  });

  speciesRegistry.register({
    commonName: 'Emperor Penguin', scientificName: 'Aptenodytes forsteri',
    taxonomy: { class: 'Aves', order: 'Sphenisciformes', family: 'Spheniscidae', genus: 'Aptenodytes', species: 'forsteri' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 40, canFly: false, aquatic: true, socialStructure: 'colony', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Greater Flamingo', scientificName: 'Phoenicopterus roseus',
    taxonomy: { class: 'Aves', order: 'Phoenicopteriformes', family: 'Phoenicopteridae', genus: 'Phoenicopterus', species: 'roseus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 35, diet: 'filter_feeder', socialStructure: 'colony', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Common Ostrich', scientificName: 'Struthio camelus',
    taxonomy: { class: 'Aves', order: 'Struthioniformes', family: 'Struthionidae', genus: 'Struthio', species: 'camelus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 70, canFly: false, speed: 80, strength: 50, socialStructure: 'herd', maturityTicks: 2500 },
  });

  speciesRegistry.register({
    commonName: 'Snowy Owl', scientificName: 'Bubo scandiacus',
    taxonomy: { class: 'Aves', order: 'Strigiformes', family: 'Strigidae', genus: 'Bubo', species: 'scandiacus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 20, nocturnal: true, diet: 'carnivore', perception: { visualRange: 95, hearingRange: 85, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 700 },
  });

  speciesRegistry.register({
    commonName: 'Ruby-throated Hummingbird', scientificName: 'Archilochus colubris',
    taxonomy: { class: 'Aves', order: 'Apodiformes', family: 'Trochilidae', genus: 'Archilochus', species: 'colubris' },
    tier: 'flagship',
    traitOverrides: { lifespan: 518, size: 2, speed: 85, canFly: true, diet: 'herbivore', maturityTicks: 300 },
  });

  speciesRegistry.register({
    commonName: 'Wandering Albatross', scientificName: 'Diomedea exulans',
    taxonomy: { class: 'Aves', order: 'Procellariiformes', family: 'Diomedeidae', genus: 'Diomedea', species: 'exulans' },
    tier: 'flagship',
    traitOverrides: { lifespan: 4320, size: 45, canFly: true, socialStructure: 'pair', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Scarlet Macaw', scientificName: 'Ara macao',
    taxonomy: { class: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Ara', species: 'macao' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048, size: 25, intelligence: 40, socialStructure: 'pack', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Indian Peafowl', scientificName: 'Pavo cristatus',
    taxonomy: { class: 'Aves', order: 'Galliformes', family: 'Phasianidae', genus: 'Pavo', species: 'cristatus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 30, socialStructure: 'herd', maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Bald Eagle', scientificName: 'Haliaeetus leucocephalus',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Haliaeetus', species: 'leucocephalus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 35, strength: 55, socialStructure: 'pair', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Red-tailed Hawk', scientificName: 'Buteo jamaicensis',
    taxonomy: { class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Buteo', species: 'jamaicensis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 25, perception: { visualRange: 95, hearingRange: 50, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Turkey Vulture', scientificName: 'Cathartes aura',
    taxonomy: { class: 'Aves', order: 'Cathartiformes', family: 'Cathartidae', genus: 'Cathartes', species: 'aura' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 30, diet: 'carnivore', perception: { visualRange: 90, hearingRange: 30, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 1200 },
  });

  speciesRegistry.register({
    commonName: 'Great White Pelican', scientificName: 'Pelecanus onocrotalus',
    taxonomy: { class: 'Aves', order: 'Pelecaniformes', family: 'Pelecanidae', genus: 'Pelecanus', species: 'onocrotalus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592, size: 45, socialStructure: 'colony', maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Common Kingfisher', scientificName: 'Alcedo atthis',
    taxonomy: { class: 'Aves', order: 'Coraciiformes', family: 'Alcedinidae', genus: 'Alcedo', species: 'atthis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 518, size: 6, speed: 65, diet: 'carnivore', maturityTicks: 300 },
  });

  speciesRegistry.register({
    commonName: 'Toco Toucan', scientificName: 'Ramphastos toco',
    taxonomy: { class: 'Aves', order: 'Piciformes', family: 'Ramphastidae', genus: 'Ramphastos', species: 'toco' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 18, diet: 'omnivore', socialStructure: 'pack', maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Pileated Woodpecker', scientificName: 'Dryocopus pileatus',
    taxonomy: { class: 'Aves', order: 'Piciformes', family: 'Picidae', genus: 'Dryocopus', species: 'pileatus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1037, size: 12, socialStructure: 'pair', maturityTicks: 700 },
  });

  // ========================
  // REPTILES
  // ========================

  speciesRegistry.register({
    commonName: 'Saltwater Crocodile', scientificName: 'Crocodylus porosus',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Crocodylidae', genus: 'Crocodylus', species: 'porosus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048 },
  });

  speciesRegistry.register({
    commonName: 'Desert Tortoise', scientificName: 'Gopherus agassizii',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Testudinidae', genus: 'Gopherus', species: 'agassizii' },
    tier: 'flagship',
    traitOverrides: { lifespan: 129600 },
  });

  speciesRegistry.register({
    commonName: 'King Cobra', scientificName: 'Ophiophagus hannah',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Elapidae', genus: 'Ophiophagus', species: 'hannah' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 55, strength: 50, diet: 'carnivore', socialStructure: 'solitary', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Green Anaconda', scientificName: 'Eunectes murinus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Boidae', genus: 'Eunectes', species: 'murinus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 70, strength: 80, aquatic: true, socialStructure: 'solitary', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Komodo Dragon', scientificName: 'Varanus komodoensis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Varanidae', genus: 'Varanus', species: 'komodoensis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592, size: 55, strength: 60, intelligence: 18, socialStructure: 'solitary', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Green Sea Turtle', scientificName: 'Chelonia mydas',
    taxonomy: { class: 'Reptilia', order: 'Testudines', family: 'Cheloniidae', genus: 'Chelonia', species: 'mydas' },
    tier: 'flagship',
    traitOverrides: { lifespan: 69120, size: 35, aquatic: true, habitat: ['underwater'], diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 5000 },
  });

  speciesRegistry.register({
    commonName: 'Panther Chameleon', scientificName: 'Chamaeleo pardalis',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Chamaeleonidae', genus: 'Chamaeleo', species: 'pardalis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 518, size: 10, speed: 10, socialStructure: 'solitary', perception: { visualRange: 80, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 500 },
  });

  speciesRegistry.register({
    commonName: 'Green Iguana', scientificName: 'Iguana iguana',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Iguanidae', genus: 'Iguana', species: 'iguana' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 30, diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 1500 },
  });

  speciesRegistry.register({
    commonName: 'Tokay Gecko', scientificName: 'Gekko gecko',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Gekkonidae', genus: 'Gekko', species: 'gecko' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 6, nocturnal: true, socialStructure: 'solitary', maturityTicks: 500 },
  });

  speciesRegistry.register({
    commonName: 'American Alligator', scientificName: 'Alligator mississippiensis',
    taxonomy: { class: 'Reptilia', order: 'Crocodilia', family: 'Alligatoridae', genus: 'Alligator', species: 'mississippiensis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 4320, size: 70, strength: 80, aquatic: true, socialStructure: 'solitary', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Burmese Python', scientificName: 'Python bivittatus',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Pythonidae', genus: 'Python', species: 'bivittatus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2160, size: 60, strength: 65, socialStructure: 'solitary', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Western Diamondback Rattlesnake', scientificName: 'Crotalus atrox',
    taxonomy: { class: 'Reptilia', order: 'Squamata', family: 'Viperidae', genus: 'Crotalus', species: 'atrox' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 20, socialStructure: 'solitary', perception: { visualRange: 30, hearingRange: 20, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: true }, maturityTicks: 1000 },
  });

  // ========================
  // AMPHIBIANS
  // ========================

  speciesRegistry.register({
    commonName: 'Poison Dart Frog', scientificName: 'Dendrobates tinctorius',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Dendrobatidae', genus: 'Dendrobates', species: 'tinctorius' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 3, diet: 'carnivore', socialStructure: 'solitary', maturityTicks: 400 },
  });

  speciesRegistry.register({
    commonName: 'Axolotl', scientificName: 'Ambystoma mexicanum',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Ambystomatidae', genus: 'Ambystoma', species: 'mexicanum' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1296, size: 10, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 600 },
  });

  speciesRegistry.register({
    commonName: 'Japanese Giant Salamander', scientificName: 'Andrias japonicus',
    taxonomy: { class: 'Amphibia', order: 'Urodela', family: 'Cryptobranchidae', genus: 'Andrias', species: 'japonicus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048, size: 45, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Red-eyed Tree Frog', scientificName: 'Agalychnis callidryas',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Hylidae', genus: 'Agalychnis', species: 'callidryas' },
    tier: 'flagship',
    traitOverrides: { lifespan: 432, size: 4, nocturnal: true, socialStructure: 'solitary', maturityTicks: 300 },
  });

  speciesRegistry.register({
    commonName: 'Common Toad', scientificName: 'Bufo bufo',
    taxonomy: { class: 'Amphibia', order: 'Anura', family: 'Bufonidae', genus: 'Bufo', species: 'bufo' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 8, nocturnal: true, socialStructure: 'solitary', maturityTicks: 700 },
  });

  // ========================
  // INSECTS
  // ========================

  speciesRegistry.register({
    commonName: 'Black Garden Ant', scientificName: 'Lasius niger',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae', genus: 'Lasius', species: 'niger' },
    tier: 'flagship',
    traitOverrides: { lifespan: 48, socialStructure: 'colony', reproductionRate: 20 },
  });

  speciesRegistry.register({
    commonName: 'Honeybee', scientificName: 'Apis mellifera',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Apidae', genus: 'Apis', species: 'mellifera' },
    tier: 'flagship',
    traitOverrides: { lifespan: 36, socialStructure: 'hive', canFly: true },
  });

  speciesRegistry.register({
    commonName: 'Monarch Butterfly', scientificName: 'Danaus plexippus',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Nymphalidae', genus: 'Danaus', species: 'plexippus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 72, size: 2, canFly: true, diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 30 },
  });

  speciesRegistry.register({
    commonName: 'Atlas Moth', scientificName: 'Attacus atlas',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Saturniidae', genus: 'Attacus', species: 'atlas' },
    tier: 'flagship',
    traitOverrides: { lifespan: 14, size: 5, canFly: true, nocturnal: true, maturityTicks: 10 },
  });

  speciesRegistry.register({
    commonName: 'Green Darner Dragonfly', scientificName: 'Anax junius',
    taxonomy: { class: 'Insecta', order: 'Odonata', family: 'Libellulidae', genus: 'Anax', species: 'junius' },
    tier: 'flagship',
    traitOverrides: { lifespan: 168, size: 3, speed: 60, canFly: true, diet: 'carnivore', maturityTicks: 100 },
  });

  speciesRegistry.register({
    commonName: 'Praying Mantis', scientificName: 'Mantis religiosa',
    taxonomy: { class: 'Insecta', order: 'Mantodea', family: 'Mantidae', genus: 'Mantis', species: 'religiosa' },
    tier: 'flagship',
    traitOverrides: { lifespan: 96, size: 3, diet: 'carnivore', socialStructure: 'solitary', perception: { visualRange: 60, hearingRange: 20, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 60 },
  });

  speciesRegistry.register({
    commonName: 'Dung Beetle', scientificName: 'Scarabaeus sacer',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Scarabaeidae', genus: 'Scarabaeus', species: 'sacer' },
    tier: 'flagship',
    traitOverrides: { lifespan: 288, size: 2, strength: 40, diet: 'detritivore', socialStructure: 'solitary', maturityTicks: 100 },
  });

  speciesRegistry.register({
    commonName: 'Common Eastern Firefly', scientificName: 'Photinus pyralis',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Lampyridae', genus: 'Photinus', species: 'pyralis' },
    tier: 'flagship',
    traitOverrides: { lifespan: 21, size: 1, nocturnal: true, canFly: true, maturityTicks: 10 },
  });

  speciesRegistry.register({
    commonName: 'African Mound Termite', scientificName: 'Macrotermes bellicosus',
    taxonomy: { class: 'Insecta', order: 'Blattodea', family: 'Termitidae', genus: 'Macrotermes', species: 'bellicosus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 36, socialStructure: 'colony', reproductionRate: 30, diet: 'detritivore', maturityTicks: 20 },
  });

  speciesRegistry.register({
    commonName: 'Desert Locust', scientificName: 'Schistocerca gregaria',
    taxonomy: { class: 'Insecta', order: 'Orthoptera', family: 'Acrididae', genus: 'Schistocerca', species: 'gregaria' },
    tier: 'flagship',
    traitOverrides: { lifespan: 72, size: 3, canFly: true, diet: 'herbivore', socialStructure: 'herd', maturityTicks: 40 },
  });

  speciesRegistry.register({
    commonName: 'Seven-spot Ladybug', scientificName: 'Coccinella septempunctata',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Coccinellidae', genus: 'Coccinella', species: 'septempunctata' },
    tier: 'flagship',
    traitOverrides: { lifespan: 96, size: 1, canFly: true, diet: 'carnivore', maturityTicks: 30 },
  });

  speciesRegistry.register({
    commonName: 'Hercules Beetle', scientificName: 'Dynastes hercules',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Dynastinae', genus: 'Dynastes', species: 'hercules' },
    tier: 'flagship',
    traitOverrides: { lifespan: 288, size: 5, strength: 55, maturityTicks: 150 },
  });

  // ========================
  // ARACHNIDS
  // ========================

  speciesRegistry.register({
    commonName: 'Goliath Birdeater Tarantula', scientificName: 'Theraphosa blondi',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Theraphosidae', genus: 'Theraphosa', species: 'blondi' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 10, strength: 15, diet: 'carnivore', socialStructure: 'solitary', nocturnal: true, maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Black Widow Spider', scientificName: 'Latrodectus mactans',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Theridiidae', genus: 'Latrodectus', species: 'mactans' },
    tier: 'flagship',
    traitOverrides: { lifespan: 288, size: 1, diet: 'carnivore', socialStructure: 'solitary', maturityTicks: 150 },
  });

  speciesRegistry.register({
    commonName: 'Emperor Scorpion', scientificName: 'Pandinus imperator',
    taxonomy: { class: 'Arachnida', order: 'Scorpiones', family: 'Scorpionidae', genus: 'Pandinus', species: 'imperator' },
    tier: 'flagship',
    traitOverrides: { lifespan: 691, size: 8, strength: 25, nocturnal: true, socialStructure: 'solitary', maturityTicks: 400 },
  });

  // ========================
  // CRUSTACEANS
  // ========================

  speciesRegistry.register({
    commonName: 'Japanese Spider Crab', scientificName: 'Macrocheira kaempferi',
    taxonomy: { class: 'Malacostraca', order: 'Decapoda', family: 'Majidae', genus: 'Macrocheira', species: 'kaempferi' },
    tier: 'flagship',
    traitOverrides: { lifespan: 8640, size: 30, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 3000 },
  });

  speciesRegistry.register({
    commonName: 'Mantis Shrimp', scientificName: 'Odontodactylus scyllarus',
    taxonomy: { class: 'Malacostraca', order: 'Stomatopoda', family: 'Squillidae', genus: 'Odontodactylus', species: 'scyllarus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1728, size: 8, strength: 65, aquatic: true, habitat: ['underwater'], perception: { visualRange: 90, hearingRange: 20, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false }, maturityTicks: 500 },
  });

  speciesRegistry.register({
    commonName: 'American Lobster', scientificName: 'Homarus americanus',
    taxonomy: { class: 'Malacostraca', order: 'Decapoda', family: 'Nephropidae', genus: 'Homarus', species: 'americanus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 8640, size: 22, strength: 40, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 2500 },
  });

  // ========================
  // CEPHALOPODS
  // ========================

  speciesRegistry.register({
    commonName: 'Giant Pacific Octopus', scientificName: 'Enteroctopus dofleini',
    taxonomy: { class: 'Cephalopoda', order: 'Octopoda', family: 'Octopodidae', genus: 'Enteroctopus', species: 'dofleini' },
    tier: 'flagship',
    traitOverrides: { lifespan: 432, size: 40, intelligence: 50, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 300 },
  });

  speciesRegistry.register({
    commonName: 'Blue-ringed Octopus', scientificName: 'Hapalochlaena lunulata',
    taxonomy: { class: 'Cephalopoda', order: 'Octopoda', family: 'Octopodidae', genus: 'Hapalochlaena', species: 'lunulata' },
    tier: 'flagship',
    traitOverrides: { lifespan: 173, size: 5, intelligence: 35, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 100 },
  });

  speciesRegistry.register({
    commonName: 'Giant Squid', scientificName: 'Architeuthis dux',
    taxonomy: { class: 'Cephalopoda', order: 'Teuthida', family: 'Architeuthidae', genus: 'Architeuthis', species: 'dux' },
    tier: 'flagship',
    traitOverrides: { lifespan: 432, size: 85, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 300 },
  });

  // ========================
  // GASTROPODS
  // ========================

  speciesRegistry.register({
    commonName: 'Giant African Land Snail', scientificName: 'Achatina fulica',
    taxonomy: { class: 'Gastropoda', order: 'Stylommatophora', family: 'Achatinidae', genus: 'Achatina', species: 'fulica' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 10, speed: 3, diet: 'herbivore', socialStructure: 'solitary', maturityTicks: 300 },
  });

  // ========================
  // SHARKS & RAYS
  // ========================

  speciesRegistry.register({
    commonName: 'Great White Shark', scientificName: 'Carcharodon carcharias',
    taxonomy: { class: 'Chondrichthyes', order: 'Lamniformes', family: 'Lamnidae', genus: 'Carcharodon', species: 'carcharias' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048, size: 85, strength: 90, speed: 75, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', perception: { visualRange: 50, hearingRange: 40, smellRange: 95, echolocation: false, electroreception: true, thermalSensing: false }, maturityTicks: 5000 },
  });

  speciesRegistry.register({
    commonName: 'Scalloped Hammerhead Shark', scientificName: 'Sphyrna lewini',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Sphyrnidae', genus: 'Sphyrna', species: 'lewini' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592, size: 75, aquatic: true, habitat: ['underwater'], socialStructure: 'pack', perception: { visualRange: 80, hearingRange: 40, smellRange: 80, echolocation: false, electroreception: true, thermalSensing: false }, maturityTicks: 3500 },
  });

  speciesRegistry.register({
    commonName: 'Whale Shark', scientificName: 'Rhincodon typus',
    taxonomy: { class: 'Chondrichthyes', order: 'Orectolobiformes', family: 'Rhincodontidae', genus: 'Rhincodon', species: 'typus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 6048, size: 99, diet: 'filter_feeder', aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', speed: 40, maturityTicks: 8000 },
  });

  speciesRegistry.register({
    commonName: 'Giant Oceanic Manta Ray', scientificName: 'Mobula birostris',
    taxonomy: { class: 'Chondrichthyes', order: 'Myliobatiformes', family: 'Mobulidae', genus: 'Mobula', species: 'birostris' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 82, diet: 'filter_feeder', aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 4000 },
  });

  speciesRegistry.register({
    commonName: 'Tiger Shark', scientificName: 'Galeocerdo cuvier',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Carcharhinidae', genus: 'Galeocerdo', species: 'cuvier' },
    tier: 'flagship',
    traitOverrides: { lifespan: 4320, size: 80, strength: 80, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 4000 },
  });

  // ========================
  // FISH
  // ========================

  speciesRegistry.register({
    commonName: 'Atlantic Salmon', scientificName: 'Salmo salar',
    taxonomy: { class: 'Actinopterygii', order: 'Salmoniformes', family: 'Salmonidae', genus: 'Salmo', species: 'salar' },
    tier: 'flagship',
    traitOverrides: { lifespan: 691, size: 25, speed: 55, aquatic: true, habitat: ['underwater'], socialStructure: 'pack', maturityTicks: 400 },
  });

  speciesRegistry.register({
    commonName: 'Clownfish', scientificName: 'Amphiprion ocellaris',
    taxonomy: { class: 'Actinopterygii', order: 'Perciformes', family: 'Pomacentridae', genus: 'Amphiprion', species: 'ocellaris' },
    tier: 'flagship',
    traitOverrides: { lifespan: 518, size: 4, aquatic: true, habitat: ['underwater'], socialStructure: 'pair', maturityTicks: 300 },
  });

  speciesRegistry.register({
    commonName: 'Triplewart Seadevil', scientificName: 'Cryptopsaras couesii',
    taxonomy: { class: 'Actinopterygii', order: 'Lophiiformes', family: 'Ceratiidae', genus: 'Cryptopsaras', species: 'couesii' },
    tier: 'flagship',
    traitOverrides: { lifespan: 2592, size: 12, aquatic: true, habitat: ['underwater'], nocturnal: true, socialStructure: 'solitary', maturityTicks: 1000 },
  });

  speciesRegistry.register({
    commonName: 'Red-bellied Piranha', scientificName: 'Pygocentrus nattereri',
    taxonomy: { class: 'Actinopterygii', order: 'Characiformes', family: 'Serrasalmidae', genus: 'Pygocentrus', species: 'nattereri' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 10, diet: 'carnivore', aquatic: true, habitat: ['underwater'], socialStructure: 'pack', maturityTicks: 400 },
  });

  speciesRegistry.register({
    commonName: 'Tiger Pufferfish', scientificName: 'Takifugu rubripes',
    taxonomy: { class: 'Actinopterygii', order: 'Tetraodontiformes', family: 'Tetraodontidae', genus: 'Takifugu', species: 'rubripes' },
    tier: 'flagship',
    traitOverrides: { lifespan: 864, size: 12, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 400 },
  });

  speciesRegistry.register({
    commonName: 'Swordfish', scientificName: 'Xiphias gladius',
    taxonomy: { class: 'Actinopterygii', order: 'Scombriformes', family: 'Xiphiidae', genus: 'Xiphias', species: 'gladius' },
    tier: 'flagship',
    traitOverrides: { lifespan: 777, size: 60, speed: 85, aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 500 },
  });

  speciesRegistry.register({
    commonName: 'Lined Seahorse', scientificName: 'Hippocampus erectus',
    taxonomy: { class: 'Actinopterygii', order: 'Syngnathiformes', family: 'Syngnathidae', genus: 'Hippocampus', species: 'erectus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 345, size: 5, speed: 5, aquatic: true, habitat: ['underwater'], socialStructure: 'pair', maturityTicks: 200 },
  });

  speciesRegistry.register({
    commonName: 'Electric Eel', scientificName: 'Electrophorus electricus',
    taxonomy: { class: 'Actinopterygii', order: 'Gymnotiformes', family: 'Gymnotidae', genus: 'Electrophorus', species: 'electricus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1296, size: 35, aquatic: true, habitat: ['underwater'], perception: { visualRange: 10, hearingRange: 30, smellRange: 20, echolocation: false, electroreception: true, thermalSensing: false }, socialStructure: 'solitary', maturityTicks: 700 },
  });

  speciesRegistry.register({
    commonName: 'Atlantic Bluefin Tuna', scientificName: 'Thunnus thynnus',
    taxonomy: { class: 'Actinopterygii', order: 'Scombriformes', family: 'Scombridae', genus: 'Thunnus', species: 'thynnus' },
    tier: 'flagship',
    traitOverrides: { lifespan: 3456, size: 55, speed: 80, aquatic: true, habitat: ['underwater'], socialStructure: 'pack', maturityTicks: 2000 },
  });

  speciesRegistry.register({
    commonName: 'Great Barracuda', scientificName: 'Sphyraena barracuda',
    taxonomy: { class: 'Actinopterygii', order: 'Perciformes', family: 'Sphyraenidae', genus: 'Sphyraena', species: 'barracuda' },
    tier: 'flagship',
    traitOverrides: { lifespan: 1209, size: 40, speed: 75, diet: 'carnivore', aquatic: true, habitat: ['underwater'], socialStructure: 'solitary', maturityTicks: 700 },
  });

  console.log(`Seeded taxonomy with ${speciesRegistry.getAll().length} flagship species`);
}
