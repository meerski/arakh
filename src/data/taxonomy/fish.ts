// ============================================================
// Fish Species Seed Data — 50+ new species
// Does NOT duplicate species already in seed.ts
// ============================================================

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedFish(): void {

  // ============================================================
  // NEW ORDERS (not in seed.ts)
  // ============================================================

  // Sarcopterygii (lobe-finned fish — coelacanth lineage)
  taxonomyEngine.register({
    rank: 'order', name: 'Coelacanthiformes', parentName: 'Actinopterygii',
    traits: { speed: 15, lifespan: 4147, size: 45, diet: 'carnivore', nocturnal: true },
  });

  // Sharks / Rays — new orders
  taxonomyEngine.register({
    rank: 'order', name: 'Heterodontiformes', parentName: 'Chondrichthyes',
    traits: { size: 30, speed: 20, diet: 'carnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Orectolobiformes2', parentName: 'Chondrichthyes',
    // Wobbegong carpetsharks (keeping separate to not conflict with existing Orectolobiformes)
    traits: { size: 40, speed: 15, diet: 'carnivore', nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Hexanchiformes', parentName: 'Chondrichthyes',
    traits: { size: 55, speed: 20, diet: 'carnivore', nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Squatiniformes', parentName: 'Chondrichthyes',
    traits: { size: 40, speed: 20, diet: 'carnivore', nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Rajiformes', parentName: 'Chondrichthyes',
    traits: { size: 50, speed: 30, diet: 'carnivore', habitat: ['underwater'] },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Torpediniformes', parentName: 'Chondrichthyes',
    traits: { size: 35, speed: 20, diet: 'carnivore', nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Pristiformes', parentName: 'Chondrichthyes',
    traits: { size: 70, speed: 30, strength: 60, diet: 'carnivore' },
  });

  // Bony fish — freshwater
  taxonomyEngine.register({
    rank: 'order', name: 'Esociformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', speed: 65, size: 35, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Centrarchiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 25, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Siluriformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 30, nocturnal: true, speed: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Osteoglossiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 60, strength: 55, intelligence: 10 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cypriniformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 20, socialStructure: 'pack', speed: 35 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cyprinodontiformes', parentName: 'Actinopterygii',
    traits: { size: 5, diet: 'omnivore', socialStructure: 'pack', reproductionRate: 6 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Beloniformes', parentName: 'Actinopterygii',
    traits: { size: 20, speed: 55, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cichliformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 20, intelligence: 10 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Anabantiformes', parentName: 'Actinopterygii',
    traits: { size: 8, diet: 'carnivore', socialStructure: 'solitary', intelligence: 8 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Perciformes2', parentName: 'Actinopterygii',
    // Freshwater perch-like — separate to avoid collision with existing Perciformes
    traits: { diet: 'omnivore', size: 25, speed: 40 },
  });

  // Bony fish — reef / tropical
  taxonomyEngine.register({
    rank: 'order', name: 'Acanthuriformes', parentName: 'Actinopterygii',
    traits: { diet: 'herbivore', size: 15, socialStructure: 'pack', speed: 40 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Zancliformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 12, socialStructure: 'pair' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Labriformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 30, intelligence: 12, speed: 45 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Callionymiformes', parentName: 'Actinopterygii',
    traits: { size: 6, speed: 20, diet: 'carnivore', nocturnal: false },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Scorpaeniformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 25, speed: 20, nocturnal: true },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Grouper_Perciformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 55, strength: 50, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Spariformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 18, socialStructure: 'pack' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Mugiliformes', parentName: 'Actinopterygii',
    traits: { diet: 'detritivore', size: 20, socialStructure: 'pack', speed: 45 },
  });

  // Bony fish — pelagic
  taxonomyEngine.register({
    rank: 'order', name: 'Istiophoriformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 65, speed: 90, strength: 65 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Carangiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 40, speed: 75 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Exocoetiformes', parentName: 'Actinopterygii',
    traits: { size: 10, speed: 60, diet: 'omnivore', habitat: ['underwater', 'surface'] },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Lampridiformes', parentName: 'Actinopterygii',
    traits: { size: 75, speed: 25, diet: 'carnivore', socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Tetraodontiformes2', parentName: 'Actinopterygii',
    // Mola — separate from existing Tetraodontiformes to avoid collision
    traits: { size: 80, speed: 15, diet: 'carnivore', socialStructure: 'solitary' },
  });

  // Deep sea
  taxonomyEngine.register({
    rank: 'order', name: 'Stomiiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 15, speed: 25, nocturnal: true, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Myctophiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 8, speed: 30, nocturnal: true, socialStructure: 'pack' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Saccopharyngiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 20, speed: 15, nocturnal: true, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Beryciformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 18, nocturnal: true, speed: 25 },
  });

  // Other / ancient lineages
  taxonomyEngine.register({
    rank: 'order', name: 'Acipenseriformes', parentName: 'Actinopterygii',
    traits: { diet: 'detritivore', size: 70, strength: 55, lifespan: 9504, speed: 25 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Lepisosteiformes', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 45, strength: 40, speed: 35, lifespan: 4320 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Dipnoi', parentName: 'Actinopterygii',
    traits: { diet: 'carnivore', size: 30, speed: 10, lifespan: 8640, habitat: ['underwater'] },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Gobiiformes', parentName: 'Actinopterygii',
    traits: { diet: 'omnivore', size: 8, speed: 25, habitat: ['underwater', 'surface'] },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Echeneiformes', parentName: 'Actinopterygii',
    traits: { diet: 'detritivore', size: 18, speed: 50, socialStructure: 'solitary' },
  });

  // ============================================================
  // NEW FAMILIES
  // ============================================================

  // Sharks
  taxonomyEngine.register({ rank: 'family', name: 'Latimeriidae', parentName: 'Coelacanthiformes', traits: { size: 45, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Heterodontidae', parentName: 'Heterodontiformes', traits: { size: 28, strength: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Orectolobidae', parentName: 'Orectolobiformes2', traits: { size: 40, speed: 10, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Hexanchidae', parentName: 'Hexanchiformes', traits: { size: 55, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Squatinidae', parentName: 'Squatiniformes', traits: { size: 40, speed: 15, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Cetorhinidae', parentName: 'Lamniformes', traits: { size: 95, diet: 'filter_feeder', speed: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Alopiidae', parentName: 'Lamniformes', traits: { size: 75, speed: 70 } });
  taxonomyEngine.register({ rank: 'family', name: 'Mitsukurinidae', parentName: 'Lamniformes', traits: { size: 55, speed: 20, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Ginglymostomatidae', parentName: 'Orectolobiformes', traits: { size: 40, speed: 15, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Triakidae', parentName: 'Carcharhiniformes', traits: { size: 30, speed: 40, socialStructure: 'solitary' } });

  // Rays
  taxonomyEngine.register({ rank: 'family', name: 'Dasyatidae', parentName: 'Rajiformes', traits: { size: 50, speed: 30, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Torpedinidae', parentName: 'Torpediniformes', traits: { size: 35, speed: 15, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Pristidae', parentName: 'Pristiformes', traits: { size: 72, strength: 65 } });
  taxonomyEngine.register({ rank: 'family', name: 'Myliobatidae', parentName: 'Rajiformes', traits: { size: 55, speed: 40, diet: 'carnivore' } });

  // Freshwater bony fish
  taxonomyEngine.register({ rank: 'family', name: 'Esocidae', parentName: 'Esociformes', traits: { size: 35, speed: 70, diet: 'carnivore', socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'family', name: 'Centrarchidae', parentName: 'Centrarchiformes', traits: { size: 28, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Siluridae', parentName: 'Siluriformes', traits: { size: 65, nocturnal: true, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Arapaimidae', parentName: 'Osteoglossiformes', traits: { size: 75, strength: 60, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Latidae', parentName: 'Cichliformes', traits: { size: 60, strength: 55, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Toxotidae', parentName: 'Perciformes2', traits: { size: 10, intelligence: 15, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Cichlidae', parentName: 'Cichliformes', traits: { size: 20, intelligence: 12, diet: 'omnivore', socialStructure: 'pair' } });
  taxonomyEngine.register({ rank: 'family', name: 'Osphronemidae', parentName: 'Anabantiformes', traits: { size: 8, diet: 'carnivore', socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'family', name: 'Cyprinidae', parentName: 'Cypriniformes', traits: { size: 30, diet: 'omnivore', socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Poeciliidae', parentName: 'Cyprinodontiformes', traits: { size: 3, socialStructure: 'pack', reproductionRate: 8 } });
  taxonomyEngine.register({ rank: 'family', name: 'Cichlidae_Tilapia', parentName: 'Cichliformes', traits: { size: 22, diet: 'herbivore', socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Oncorhynchidae', parentName: 'Salmoniformes', traits: { size: 28, speed: 55, diet: 'carnivore' } });

  // Reef / tropical
  taxonomyEngine.register({ rank: 'family', name: 'Acanthuridae', parentName: 'Acanthuriformes', traits: { size: 15, diet: 'herbivore', socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Zanclidae', parentName: 'Zancliformes', traits: { size: 12, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Labridae', parentName: 'Labriformes', traits: { size: 30, diet: 'carnivore', intelligence: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Callionymidae', parentName: 'Callionymiformes', traits: { size: 6, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Scorpaenidae', parentName: 'Scorpaeniformes', traits: { size: 25, diet: 'carnivore', nocturnal: true, speed: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Serranidae', parentName: 'Grouper_Perciformes', traits: { size: 60, strength: 55, diet: 'carnivore', socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'family', name: 'Scaridae', parentName: 'Labriformes', traits: { size: 30, diet: 'omnivore', socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Muraenidae', parentName: 'Anguilliformes', traits: { size: 35, diet: 'carnivore', nocturnal: true, socialStructure: 'solitary', speed: 30 } });
  taxonomyEngine.register({ rank: 'family', name: 'Balistidae', parentName: 'Tetraodontiformes', traits: { size: 22, diet: 'carnivore', intelligence: 12 } });
  taxonomyEngine.register({ rank: 'family', name: 'Pomacentridae2', parentName: 'Perciformes', traits: { size: 6, diet: 'omnivore', socialStructure: 'pair', speed: 30 } });

  // Pelagic
  taxonomyEngine.register({ rank: 'family', name: 'Istiophoridae', parentName: 'Istiophoriformes', traits: { size: 65, speed: 95, strength: 65 } });
  taxonomyEngine.register({ rank: 'family', name: 'Coryphaenidae', parentName: 'Carangiformes', traits: { size: 38, speed: 75, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Acanthocybium_family', parentName: 'Scombriformes', traits: { size: 40, speed: 80, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Exocoetidae', parentName: 'Exocoetiformes', traits: { size: 10, speed: 60, habitat: ['underwater', 'surface'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Regalecidae', parentName: 'Lampridiformes', traits: { size: 90, speed: 20, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Molidae', parentName: 'Tetraodontiformes2', traits: { size: 82, speed: 12, diet: 'carnivore', socialStructure: 'solitary' } });

  // Deep sea
  taxonomyEngine.register({ rank: 'family', name: 'Stomiidae', parentName: 'Stomiiformes', traits: { size: 15, nocturnal: true, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Myctophidae', parentName: 'Myctophiformes', traits: { size: 8, nocturnal: true, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'family', name: 'Eurypharyngidae', parentName: 'Saccopharyngiformes', traits: { size: 20, nocturnal: true, diet: 'carnivore', socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'family', name: 'Anoplogastridae', parentName: 'Beryciformes', traits: { size: 18, nocturnal: true, diet: 'carnivore', socialStructure: 'solitary' } });

  // Other
  taxonomyEngine.register({ rank: 'family', name: 'Acipenseridae', parentName: 'Acipenseriformes', traits: { size: 72, strength: 55, lifespan: 9504 } });
  taxonomyEngine.register({ rank: 'family', name: 'Lepisosteidae', parentName: 'Lepisosteiformes', traits: { size: 48, strength: 42 } });
  taxonomyEngine.register({ rank: 'family', name: 'Protopteridae', parentName: 'Dipnoi', traits: { size: 30, speed: 8, lifespan: 8640 } });
  taxonomyEngine.register({ rank: 'family', name: 'Periophthalmidae', parentName: 'Gobiiformes', traits: { size: 8, speed: 20, habitat: ['underwater', 'surface'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Echeneidae', parentName: 'Echeneiformes', traits: { size: 18, speed: 50 } });

  // ============================================================
  // NEW GENERA
  // ============================================================

  // Sharks
  taxonomyEngine.register({ rank: 'genus', name: 'Latimeria', parentName: 'Latimeriidae', traits: { size: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Heterodontus', parentName: 'Heterodontidae', traits: { size: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Orectolobus', parentName: 'Orectolobidae', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hexanchus', parentName: 'Hexanchidae', traits: { size: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Squatina', parentName: 'Squatinidae', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cetorhinus', parentName: 'Cetorhinidae', traits: { size: 95 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Alopias', parentName: 'Alopiidae', traits: { size: 75 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mitsukurina', parentName: 'Mitsukurinidae', traits: { size: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Prionace', parentName: 'Carcharhinidae', traits: { size: 70 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Isurus', parentName: 'Lamnidae', traits: { size: 72 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Carcharhinus', parentName: 'Carcharhinidae', traits: { size: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ginglymostoma', parentName: 'Ginglymostomatidae', traits: { size: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Triakis', parentName: 'Triakidae', traits: { size: 28 } });

  // Rays
  taxonomyEngine.register({ rank: 'genus', name: 'Dasyatis', parentName: 'Dasyatidae', traits: { size: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Torpedo', parentName: 'Torpedinidae', traits: { size: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pristis', parentName: 'Pristidae', traits: { size: 72 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Myliobatis', parentName: 'Myliobatidae', traits: { size: 55 } });

  // Freshwater
  taxonomyEngine.register({ rank: 'genus', name: 'Esox', parentName: 'Esocidae', traits: { size: 35, speed: 70 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Micropterus', parentName: 'Centrarchidae', traits: { size: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Silurus', parentName: 'Siluridae', traits: { size: 65, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Arapaima', parentName: 'Arapaimidae', traits: { size: 78 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Lates', parentName: 'Latidae', traits: { size: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Toxotes', parentName: 'Toxotidae', traits: { size: 10, intelligence: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Symphysodon', parentName: 'Cichlidae', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Astronotus', parentName: 'Cichlidae', traits: { size: 20, intelligence: 14 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Betta', parentName: 'Osphronemidae', traits: { size: 6, socialStructure: 'solitary' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cyprinus', parentName: 'Cyprinidae', traits: { size: 30, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Carassius', parentName: 'Cyprinidae', traits: { size: 15, diet: 'omnivore', socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Poecilia', parentName: 'Poeciliidae', traits: { size: 3, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Oreochromis', parentName: 'Cichlidae_Tilapia', traits: { size: 22, diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Oncorhynchus', parentName: 'Oncorhynchidae', traits: { size: 28, speed: 55 } });

  // Reef / tropical
  taxonomyEngine.register({ rank: 'genus', name: 'Paracanthurus', parentName: 'Acanthuridae', traits: { size: 13 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Zanclus', parentName: 'Zanclidae', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cheilinus', parentName: 'Labridae', traits: { size: 45, intelligence: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Synchiropus', parentName: 'Callionymidae', traits: { size: 6 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pterois', parentName: 'Scorpaenidae', traits: { size: 22, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Epinephelus', parentName: 'Serranidae', traits: { size: 60, strength: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sparisoma', parentName: 'Scaridae', traits: { size: 30, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Gymnothorax', parentName: 'Muraenidae', traits: { size: 35, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Balistoides', parentName: 'Balistidae', traits: { size: 22, intelligence: 14 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chromis', parentName: 'Pomacentridae2', traits: { size: 6, socialStructure: 'pack' } });

  // Pelagic
  taxonomyEngine.register({ rank: 'genus', name: 'Makaira', parentName: 'Istiophoridae', traits: { size: 65, speed: 95 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Istiophorus', parentName: 'Istiophoridae', traits: { size: 55, speed: 98 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Thunnus_yellow', parentName: 'Scombridae', traits: { size: 45, speed: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Coryphaena', parentName: 'Coryphaenidae', traits: { size: 38, speed: 72 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Acanthocybium', parentName: 'Acanthocybium_family', traits: { size: 40, speed: 82 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Exocoetus', parentName: 'Exocoetidae', traits: { size: 10 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Regalecus', parentName: 'Regalecidae', traits: { size: 92 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mola', parentName: 'Molidae', traits: { size: 83 } });

  // Deep sea
  taxonomyEngine.register({ rank: 'genus', name: 'Chauliodus', parentName: 'Stomiidae', traits: { size: 14, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Myctophum', parentName: 'Myctophidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Eurypharynx', parentName: 'Eurypharyngidae', traits: { size: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Anoplogaster', parentName: 'Anoplogastridae', traits: { size: 18 } });

  // Other
  taxonomyEngine.register({ rank: 'genus', name: 'Acipenser', parentName: 'Acipenseridae', traits: { size: 72 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Atractosteus', parentName: 'Lepisosteidae', traits: { size: 48 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Protopterus', parentName: 'Protopteridae', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Periophthalmus', parentName: 'Periophthalmidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Echeneis', parentName: 'Echeneidae', traits: { size: 18 } });

  // ============================================================
  // SPECIES REGISTRATIONS (50+ total)
  // ============================================================

  // ========================
  // SHARKS — Chondrichthyes
  // ========================

  // Bull Shark — aggressive, freshwater-capable euryhaline carnivore
  speciesRegistry.register({
    commonName: 'Bull Shark', scientificName: 'Carcharhinus leucas',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Carcharhinidae', genus: 'Carcharhinus', species: 'leucas' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160,  // ~25 years
      size: 65, speed: 65, strength: 75, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 50, hearingRange: 50, smellRange: 85, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Nurse Shark — slow, benthic, nocturnal
  speciesRegistry.register({
    commonName: 'Nurse Shark', scientificName: 'Ginglymostoma cirratum',
    taxonomy: { class: 'Chondrichthyes', order: 'Orectolobiformes', family: 'Ginglymostomatidae', genus: 'Ginglymostoma', species: 'cirratum' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592,  // ~30 years
      size: 40, speed: 15, strength: 35, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: true,
      perception: { visualRange: 30, hearingRange: 40, smellRange: 75, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Blue Shark — wide-ranging pelagic, schooling
  speciesRegistry.register({
    commonName: 'Blue Shark', scientificName: 'Prionace glauca',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Carcharhinidae', genus: 'Prionace', species: 'glauca' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 70, speed: 68, strength: 65, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 50, smellRange: 88, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Thresher Shark — uses long tail to stun prey
  speciesRegistry.register({
    commonName: 'Thresher Shark', scientificName: 'Alopias vulpinus',
    taxonomy: { class: 'Chondrichthyes', order: 'Lamniformes', family: 'Alopiidae', genus: 'Alopias', species: 'vulpinus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 75, speed: 70, strength: 65, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 55, smellRange: 80, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Greenland Shark — extremely long-lived, deep cold water
  speciesRegistry.register({
    commonName: 'Greenland Shark', scientificName: 'Somniosus microcephalus',
    taxonomy: { class: 'Chondrichthyes', order: 'Hexanchiformes', family: 'Hexanchidae', genus: 'Hexanchus', species: 'microcephalus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 34560,  // ~400 years
      size: 72, speed: 8, strength: 60, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 40, smellRange: 90, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Goblin Shark — bizarre deep-sea shark with extendable jaw
  speciesRegistry.register({
    commonName: 'Goblin Shark', scientificName: 'Mitsukurina owstoni',
    taxonomy: { class: 'Chondrichthyes', order: 'Lamniformes', family: 'Mitsukurinidae', genus: 'Mitsukurina', species: 'owstoni' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592,  // ~30 years estimated
      size: 50, speed: 20, strength: 40, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 15, hearingRange: 30, smellRange: 80, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Basking Shark — second-largest fish, filter feeder
  speciesRegistry.register({
    commonName: 'Basking Shark', scientificName: 'Cetorhinus maximus',
    taxonomy: { class: 'Chondrichthyes', order: 'Lamniformes', family: 'Cetorhinidae', genus: 'Cetorhinus', species: 'maximus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320,  // ~50 years
      size: 95, speed: 30, strength: 60, intelligence: 5,
      diet: 'filter_feeder', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 30, hearingRange: 40, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Leopard Shark — calm, coastal, sociable
  speciesRegistry.register({
    commonName: 'Leopard Shark', scientificName: 'Triakis semifasciata',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Triakidae', genus: 'Triakis', species: 'semifasciata' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,  // ~30 years
      size: 28, speed: 35, strength: 30, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: true,
      perception: { visualRange: 40, hearingRange: 40, smellRange: 70, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Port Jackson Shark — bottom-dwelling, egg layer
  speciesRegistry.register({
    commonName: 'Port Jackson Shark', scientificName: 'Heterodontus portusjacksoni',
    taxonomy: { class: 'Chondrichthyes', order: 'Heterodontiformes', family: 'Heterodontidae', genus: 'Heterodontus', species: 'portusjacksoni' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,  // ~30 years
      size: 28, speed: 20, strength: 28, intelligence: 7,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 25, hearingRange: 35, smellRange: 70, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Wobbegong — camouflaged ambush carpet shark
  speciesRegistry.register({
    commonName: 'Wobbegong', scientificName: 'Orectolobus maculatus',
    taxonomy: { class: 'Chondrichthyes', order: 'Orectolobiformes2', family: 'Orectolobidae', genus: 'Orectolobus', species: 'maculatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,  // ~25 years
      size: 40, speed: 10, strength: 40, intelligence: 6,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 30, hearingRange: 40, smellRange: 75, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Blacktip Reef Shark — iconic coral reef shark
  speciesRegistry.register({
    commonName: 'Blacktip Reef Shark', scientificName: 'Carcharhinus melanopterus',
    taxonomy: { class: 'Chondrichthyes', order: 'Carcharhiniformes', family: 'Carcharhinidae', genus: 'Carcharhinus', species: 'melanopterus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1296,  // ~15 years
      size: 48, speed: 65, strength: 55, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: true,
      perception: { visualRange: 55, hearingRange: 50, smellRange: 85, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Mako Shark — fastest shark, highly athletic
  speciesRegistry.register({
    commonName: 'Shortfin Mako Shark', scientificName: 'Isurus oxyrinchus',
    taxonomy: { class: 'Chondrichthyes', order: 'Lamniformes', family: 'Lamnidae', genus: 'Isurus', species: 'oxyrinchus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592,  // ~30 years
      size: 72, speed: 90, strength: 80, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 65, hearingRange: 55, smellRange: 85, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Angel Shark — flat, benthic ambush predator
  speciesRegistry.register({
    commonName: 'Angel Shark', scientificName: 'Squatina squatina',
    taxonomy: { class: 'Chondrichthyes', order: 'Squatiniformes', family: 'Squatinidae', genus: 'Squatina', species: 'squatina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,  // ~25 years
      size: 40, speed: 15, strength: 35, intelligence: 6,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 30, hearingRange: 45, smellRange: 70, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // ========================
  // RAYS — Chondrichthyes
  // ========================

  // Southern Stingray
  speciesRegistry.register({
    commonName: 'Southern Stingray', scientificName: 'Dasyatis americana',
    taxonomy: { class: 'Chondrichthyes', order: 'Rajiformes', family: 'Dasyatidae', genus: 'Dasyatis', species: 'americana' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 50, speed: 30, strength: 30, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 30, hearingRange: 35, smellRange: 60, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Electric Ray — stuns prey with electric organs
  speciesRegistry.register({
    commonName: 'Atlantic Torpedo Ray', scientificName: 'Torpedo nobiliana',
    taxonomy: { class: 'Chondrichthyes', order: 'Torpediniformes', family: 'Torpedinidae', genus: 'Torpedo', species: 'nobiliana' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 35, speed: 15, strength: 35, intelligence: 7,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 25, hearingRange: 30, smellRange: 55, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Sawfish — critically endangered, rostrum-equipped
  speciesRegistry.register({
    commonName: 'Largetooth Sawfish', scientificName: 'Pristis pristis',
    taxonomy: { class: 'Chondrichthyes', order: 'Pristiformes', family: 'Pristidae', genus: 'Pristis', species: 'pristis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3456,  // ~40 years
      size: 72, speed: 25, strength: 65, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 50, smellRange: 75, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Eagle Ray — graceful pelagic ray
  speciesRegistry.register({
    commonName: 'Spotted Eagle Ray', scientificName: 'Aetobatus narinari',
    taxonomy: { class: 'Chondrichthyes', order: 'Rajiformes', family: 'Myliobatidae', genus: 'Myliobatis', species: 'narinari' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 55, speed: 40, strength: 35, intelligence: 9,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 40, smellRange: 60, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Devil Ray — smaller mobulid, acrobatic jumper
  speciesRegistry.register({
    commonName: 'Spinetail Devil Ray', scientificName: 'Mobula japanica',
    taxonomy: { class: 'Chondrichthyes', order: 'Myliobatiformes', family: 'Mobulidae', genus: 'Mobula', species: 'japanica' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 60, speed: 45, strength: 30, intelligence: 9,
      diet: 'filter_feeder', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 40, smellRange: 50, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // ========================
  // FRESHWATER BONY FISH
  // ========================

  // Rainbow Trout — salmonid, cold freshwater
  speciesRegistry.register({
    commonName: 'Rainbow Trout', scientificName: 'Oncorhynchus mykiss',
    taxonomy: { class: 'Actinopterygii', order: 'Salmoniformes', family: 'Oncorhynchidae', genus: 'Oncorhynchus', species: 'mykiss' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 22, speed: 55, strength: 25, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 40, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Northern Pike — apex freshwater predator
  speciesRegistry.register({
    commonName: 'Northern Pike', scientificName: 'Esox lucius',
    taxonomy: { class: 'Actinopterygii', order: 'Esociformes', family: 'Esocidae', genus: 'Esox', species: 'lucius' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2160,  // ~25 years
      size: 35, speed: 70, strength: 50, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 55, hearingRange: 40, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Largemouth Bass — popular sport fish
  speciesRegistry.register({
    commonName: 'Largemouth Bass', scientificName: 'Micropterus salmoides',
    taxonomy: { class: 'Actinopterygii', order: 'Centrarchiformes', family: 'Centrarchidae', genus: 'Micropterus', species: 'salmoides' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1382,  // ~16 years
      size: 28, speed: 50, strength: 35, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 50, hearingRange: 40, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Wels Catfish — largest freshwater fish in Europe
  speciesRegistry.register({
    commonName: 'Wels Catfish', scientificName: 'Silurus glanis',
    taxonomy: { class: 'Actinopterygii', order: 'Siluriformes', family: 'Siluridae', genus: 'Silurus', species: 'glanis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 8640,  // ~100 years
      size: 65, speed: 30, strength: 65, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 55, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Arapaima — giant, air-breathing Amazonian fish
  speciesRegistry.register({
    commonName: 'Arapaima', scientificName: 'Arapaima gigas',
    taxonomy: { class: 'Actinopterygii', order: 'Osteoglossiformes', family: 'Arapaimidae', genus: 'Arapaima', species: 'gigas' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 78, speed: 40, strength: 65, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pair', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 50, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Nile Perch — invasive, devastated Lake Victoria ecosystem
  speciesRegistry.register({
    commonName: 'Nile Perch', scientificName: 'Lates niloticus',
    taxonomy: { class: 'Actinopterygii', order: 'Cichliformes', family: 'Latidae', genus: 'Lates', species: 'niloticus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1382,  // ~16 years
      size: 60, speed: 45, strength: 55, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 40, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Archer Fish — spits water jets to knock prey from branches
  speciesRegistry.register({
    commonName: 'Archer Fish', scientificName: 'Toxotes chatareus',
    taxonomy: { class: 'Actinopterygii', order: 'Perciformes2', family: 'Toxotidae', genus: 'Toxotes', species: 'chatareus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 10, speed: 35, strength: 10, intelligence: 20,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 55, hearingRange: 25, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Discus — high-care cichlid, parental behaviour
  speciesRegistry.register({
    commonName: 'Discus', scientificName: 'Symphysodon aequifasciatus',
    taxonomy: { class: 'Actinopterygii', order: 'Cichliformes', family: 'Cichlidae', genus: 'Symphysodon', species: 'aequifasciatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 15, speed: 25, strength: 8, intelligence: 14,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pair', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Oscar — intelligent, recognises owners
  speciesRegistry.register({
    commonName: 'Oscar', scientificName: 'Astronotus ocellatus',
    taxonomy: { class: 'Actinopterygii', order: 'Cichliformes', family: 'Cichlidae', genus: 'Astronotus', species: 'ocellatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 20, speed: 30, strength: 15, intelligence: 18,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pair', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 25, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Betta — territorial, labyrinth organ breather
  speciesRegistry.register({
    commonName: 'Siamese Fighting Fish', scientificName: 'Betta splendens',
    taxonomy: { class: 'Actinopterygii', order: 'Anabantiformes', family: 'Osphronemidae', genus: 'Betta', species: 'splendens' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 259,  // ~3 years
      size: 6, speed: 25, strength: 5, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 30, hearingRange: 15, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Common Carp — highly adaptable, omnivorous
  speciesRegistry.register({
    commonName: 'Common Carp', scientificName: 'Cyprinus carpio',
    taxonomy: { class: 'Actinopterygii', order: 'Cypriniformes', family: 'Cyprinidae', genus: 'Cyprinus', species: 'carpio' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456,  // ~40 years
      size: 30, speed: 35, strength: 25, intelligence: 10,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 40, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Goldfish — domesticated carp, remarkable memory
  speciesRegistry.register({
    commonName: 'Goldfish', scientificName: 'Carassius auratus',
    taxonomy: { class: 'Actinopterygii', order: 'Cypriniformes', family: 'Cyprinidae', genus: 'Carassius', species: 'auratus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 12, speed: 25, strength: 5, intelligence: 8,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 30, hearingRange: 30, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Guppy — livebearing, sexually dimorphic
  speciesRegistry.register({
    commonName: 'Guppy', scientificName: 'Poecilia reticulata',
    taxonomy: { class: 'Actinopterygii', order: 'Cyprinodontiformes', family: 'Poeciliidae', genus: 'Poecilia', species: 'reticulata' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 173,  // ~2 years
      size: 3, speed: 30, strength: 1, intelligence: 6,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 20, hearingRange: 15, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Tilapia — hardy cichlid, globally farmed
  speciesRegistry.register({
    commonName: 'Nile Tilapia', scientificName: 'Oreochromis niloticus',
    taxonomy: { class: 'Actinopterygii', order: 'Cichliformes', family: 'Cichlidae_Tilapia', genus: 'Oreochromis', species: 'niloticus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 22, speed: 30, strength: 15, intelligence: 10,
      diet: 'herbivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 30, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // REEF / TROPICAL BONY FISH
  // ========================

  // Blue Tang — herbivorous surgeonfish
  speciesRegistry.register({
    commonName: 'Blue Tang', scientificName: 'Paracanthurus hepatus',
    taxonomy: { class: 'Actinopterygii', order: 'Acanthuriformes', family: 'Acanthuridae', genus: 'Paracanthurus', species: 'hepatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 13, speed: 45, strength: 8, intelligence: 10,
      diet: 'herbivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Moorish Idol — iconic long-snouted reef fish
  speciesRegistry.register({
    commonName: 'Moorish Idol', scientificName: 'Zanclus cornutus',
    taxonomy: { class: 'Actinopterygii', order: 'Zancliformes', family: 'Zanclidae', genus: 'Zanclus', species: 'cornutus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 12, speed: 35, strength: 5, intelligence: 10,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pair', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 15, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Napoleon Wrasse — large, intelligent, sequential hermaphrodite
  speciesRegistry.register({
    commonName: 'Napoleon Wrasse', scientificName: 'Cheilinus undulatus',
    taxonomy: { class: 'Actinopterygii', order: 'Labriformes', family: 'Labridae', genus: 'Cheilinus', species: 'undulatus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3024,  // ~35 years
      size: 45, speed: 45, strength: 40, intelligence: 20,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 50, hearingRange: 25, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Mandarin Fish — arguably most colourful fish
  speciesRegistry.register({
    commonName: 'Mandarin Fish', scientificName: 'Synchiropus splendidus',
    taxonomy: { class: 'Actinopterygii', order: 'Callionymiformes', family: 'Callionymidae', genus: 'Synchiropus', species: 'splendidus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,  // ~5 years
      size: 6, speed: 20, strength: 2, intelligence: 7,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pair', nocturnal: false,
      perception: { visualRange: 25, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Goliath Grouper — massive apex reef predator
  speciesRegistry.register({
    commonName: 'Goliath Grouper', scientificName: 'Epinephelus itajara',
    taxonomy: { class: 'Actinopterygii', order: 'Grouper_Perciformes', family: 'Serranidae', genus: 'Epinephelus', species: 'itajara' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 3456,  // ~40 years
      size: 60, speed: 35, strength: 60, intelligence: 14,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 35, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Parrotfish — reef herbivore, produces sand
  speciesRegistry.register({
    commonName: 'Stoplight Parrotfish', scientificName: 'Sparisoma viride',
    taxonomy: { class: 'Actinopterygii', order: 'Labriformes', family: 'Scaridae', genus: 'Sparisoma', species: 'viride' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,  // ~15 years
      size: 28, speed: 40, strength: 20, intelligence: 10,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Giant Moray Eel — powerful reef predator
  speciesRegistry.register({
    commonName: 'Giant Moray Eel', scientificName: 'Gymnothorax javanicus',
    taxonomy: { class: 'Actinopterygii', order: 'Anguilliformes', family: 'Muraenidae', genus: 'Gymnothorax', species: 'javanicus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2592,  // ~30 years
      size: 35, speed: 30, strength: 45, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 30, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Lionfish — venomous ambush predator, invasive
  speciesRegistry.register({
    commonName: 'Red Lionfish', scientificName: 'Pterois volitans',
    taxonomy: { class: 'Actinopterygii', order: 'Scorpaeniformes', family: 'Scorpaenidae', genus: 'Pterois', species: 'volitans' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,  // ~15 years
      size: 22, speed: 20, strength: 15, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 40, hearingRange: 20, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Titan Triggerfish — aggressively territorial
  speciesRegistry.register({
    commonName: 'Titan Triggerfish', scientificName: 'Balistoides viridescens',
    taxonomy: { class: 'Actinopterygii', order: 'Tetraodontiformes', family: 'Balistidae', genus: 'Balistoides', species: 'viridescens' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,  // ~15 years
      size: 22, speed: 40, strength: 20, intelligence: 15,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 45, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Damselfish — aggressive territory defenders
  speciesRegistry.register({
    commonName: 'Blue Chromis', scientificName: 'Chromis cyanea',
    taxonomy: { class: 'Actinopterygii', order: 'Perciformes', family: 'Pomacentridae2', genus: 'Chromis', species: 'cyanea' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,  // ~5 years
      size: 6, speed: 30, strength: 3, intelligence: 8,
      diet: 'omnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 15, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // PELAGIC BONY FISH
  // ========================

  // Atlantic Blue Marlin — billfish, apex predator
  speciesRegistry.register({
    commonName: 'Atlantic Blue Marlin', scientificName: 'Makaira nigricans',
    taxonomy: { class: 'Actinopterygii', order: 'Istiophoriformes', family: 'Istiophoridae', genus: 'Makaira', species: 'nigricans' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 65, speed: 90, strength: 70, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 30, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Indo-Pacific Sailfish — fastest fish recorded
  speciesRegistry.register({
    commonName: 'Indo-Pacific Sailfish', scientificName: 'Istiophorus platypterus',
    taxonomy: { class: 'Actinopterygii', order: 'Istiophoriformes', family: 'Istiophoridae', genus: 'Istiophorus', species: 'platypterus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 55, speed: 98, strength: 60, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 65, hearingRange: 30, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Yellowfin Tuna — schooling pelagic predator
  speciesRegistry.register({
    commonName: 'Yellowfin Tuna', scientificName: 'Thunnus albacares',
    taxonomy: { class: 'Actinopterygii', order: 'Scombriformes', family: 'Scombridae', genus: 'Thunnus_yellow', species: 'albacares' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 648,  // ~7.5 years
      size: 45, speed: 80, strength: 50, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 35, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Wahoo — fast, solitary, highly prized
  speciesRegistry.register({
    commonName: 'Wahoo', scientificName: 'Acanthocybium solandri',
    taxonomy: { class: 'Actinopterygii', order: 'Scombriformes', family: 'Acanthocybium_family', genus: 'Acanthocybium', species: 'solandri' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 40, speed: 82, strength: 50, intelligence: 10,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 30, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Mahi-Mahi — fast-growing, colorful pelagic
  speciesRegistry.register({
    commonName: 'Mahi-Mahi', scientificName: 'Coryphaena hippurus',
    taxonomy: { class: 'Actinopterygii', order: 'Carangiformes', family: 'Coryphaenidae', genus: 'Coryphaena', species: 'hippurus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,  // ~5 years
      size: 38, speed: 72, strength: 40, intelligence: 12,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: false,
      perception: { visualRange: 60, hearingRange: 30, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Atlantic Flying Fish — glides above the surface
  speciesRegistry.register({
    commonName: 'Atlantic Flying Fish', scientificName: 'Exocoetus volitans',
    taxonomy: { class: 'Actinopterygii', order: 'Exocoetiformes', family: 'Exocoetidae', genus: 'Exocoetus', species: 'volitans' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,  // ~5 years
      size: 10, speed: 60, strength: 5, intelligence: 5,
      diet: 'omnivore', habitat: ['underwater', 'surface'], aquatic: true,
      socialStructure: 'pack', nocturnal: false, canFly: false,
      perception: { visualRange: 40, hearingRange: 20, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Oarfish — longest bony fish, serpentine deep-water
  speciesRegistry.register({
    commonName: 'Giant Oarfish', scientificName: 'Regalecus glesne',
    taxonomy: { class: 'Actinopterygii', order: 'Lampridiformes', family: 'Regalecidae', genus: 'Regalecus', species: 'glesne' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 864,  // ~10 years estimated
      size: 90, speed: 20, strength: 30, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 40, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Ocean Sunfish — heaviest bony fish
  speciesRegistry.register({
    commonName: 'Ocean Sunfish', scientificName: 'Mola mola',
    taxonomy: { class: 'Actinopterygii', order: 'Tetraodontiformes2', family: 'Molidae', genus: 'Mola', species: 'mola' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1728,  // ~20 years
      size: 83, speed: 12, strength: 25, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // DEEP SEA BONY FISH
  // ========================

  // Pacific Viperfish — terrifying fang-jawed predator
  speciesRegistry.register({
    commonName: 'Pacific Viperfish', scientificName: 'Chauliodus macouni',
    taxonomy: { class: 'Actinopterygii', order: 'Stomiiformes', family: 'Stomiidae', genus: 'Chauliodus', species: 'macouni' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1382,  // ~16 years estimated
      size: 14, speed: 25, strength: 15, intelligence: 5,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 10, hearingRange: 30, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Lanternfish — most abundant vertebrate on Earth by biomass
  speciesRegistry.register({
    commonName: 'Lanternfish', scientificName: 'Myctophum punctatum',
    taxonomy: { class: 'Actinopterygii', order: 'Myctophiformes', family: 'Myctophidae', genus: 'Myctophum', species: 'punctatum' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 259,  // ~3 years
      size: 8, speed: 30, strength: 3, intelligence: 3,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'pack', nocturnal: true,
      perception: { visualRange: 15, hearingRange: 20, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Gulper Eel — enormous distensible jaw
  speciesRegistry.register({
    commonName: 'Pelican Eel', scientificName: 'Eurypharynx pelecanoides',
    taxonomy: { class: 'Actinopterygii', order: 'Saccopharyngiformes', family: 'Eurypharyngidae', genus: 'Eurypharynx', species: 'pelecanoides' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years estimated
      size: 18, speed: 15, strength: 10, intelligence: 4,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 5, hearingRange: 25, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Fangtooth — deepest recorded fish relative to its size
  speciesRegistry.register({
    commonName: 'Common Fangtooth', scientificName: 'Anoplogaster cornuta',
    taxonomy: { class: 'Actinopterygii', order: 'Beryciformes', family: 'Anoplogastridae', genus: 'Anoplogaster', species: 'cornuta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years estimated
      size: 18, speed: 20, strength: 15, intelligence: 4,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 8, hearingRange: 30, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ========================
  // ANCIENT / OTHER LINEAGES
  // ========================

  // Coelacanth — living fossil, lobe-finned
  speciesRegistry.register({
    commonName: 'Coelacanth', scientificName: 'Latimeria chalumnae',
    taxonomy: { class: 'Actinopterygii', order: 'Coelacanthiformes', family: 'Latimeriidae', genus: 'Latimeria', species: 'chalumnae' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 5184,  // ~60 years
      size: 45, speed: 15, strength: 35, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 30, smellRange: 60, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Beluga Sturgeon — largest freshwater fish, caviar source
  speciesRegistry.register({
    commonName: 'Beluga Sturgeon', scientificName: 'Acipenser huso',
    taxonomy: { class: 'Actinopterygii', order: 'Acipenseriformes', family: 'Acipenseridae', genus: 'Acipenser', species: 'huso' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 9504,  // ~110 years
      size: 72, speed: 25, strength: 60, intelligence: 10,
      diet: 'detritivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 25, hearingRange: 45, smellRange: 75, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // Alligator Gar — armour-scaled freshwater predator
  speciesRegistry.register({
    commonName: 'Alligator Gar', scientificName: 'Atractosteus spatula',
    taxonomy: { class: 'Actinopterygii', order: 'Lepisosteiformes', family: 'Lepisosteidae', genus: 'Atractosteus', species: 'spatula' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 4320,  // ~50 years
      size: 48, speed: 35, strength: 50, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 30, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // African Lungfish — can aestivate in mud for years
  speciesRegistry.register({
    commonName: 'African Lungfish', scientificName: 'Protopterus annectens',
    taxonomy: { class: 'Actinopterygii', order: 'Dipnoi', family: 'Protopteridae', genus: 'Protopterus', species: 'annectens' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 8640,  // ~100 years
      size: 30, speed: 8, strength: 20, intelligence: 8,
      diet: 'carnivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 20, hearingRange: 30, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Mudskipper — amphibious goby, walks on pectoral fins
  speciesRegistry.register({
    commonName: 'Atlantic Mudskipper', scientificName: 'Periophthalmus barbarus',
    taxonomy: { class: 'Actinopterygii', order: 'Gobiiformes', family: 'Periophthalmidae', genus: 'Periophthalmus', species: 'barbarus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,  // ~5 years
      size: 8, speed: 20, strength: 5, intelligence: 12,
      diet: 'omnivore', habitat: ['underwater', 'surface'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 35, hearingRange: 15, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Remora — hitchhiker using suction disc
  speciesRegistry.register({
    commonName: 'Remora', scientificName: 'Echeneis naucrates',
    taxonomy: { class: 'Actinopterygii', order: 'Echeneiformes', family: 'Echeneidae', genus: 'Echeneis', species: 'naucrates' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,  // ~10 years
      size: 18, speed: 50, strength: 10, intelligence: 8,
      diet: 'detritivore', habitat: ['underwater'], aquatic: true,
      socialStructure: 'solitary', nocturnal: false,
      perception: { visualRange: 40, hearingRange: 25, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });
}
