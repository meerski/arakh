// ============================================================
// Invertebrate Species Seed Data — 50+ new species
// ============================================================
// Lifespan reference: 1 tick = ~4 real days (86400 ticks = 1 year)
// lifespan = real_years * 86.4 (rounded)
// Very short-lived insects: lifespan in tens (days/weeks)
// ============================================================

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedInvertebrates(): void {

  // ============================================================
  // NEW CLASSES
  // ============================================================

  // Cnidaria — jellyfish, man o' war, coral
  taxonomyEngine.register({
    rank: 'class', name: 'Cnidaria', parentName: null,
    traits: {
      aquatic: true, habitat: ['underwater'], size: 10,
      lifespan: 864, speed: 5, strength: 5, intelligence: 1,
      diet: 'carnivore', socialStructure: 'solitary',
      reproductionRate: 80, metabolicRate: 0.5,
      perception: { visualRange: 5, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Echinodermata — sea urchins, starfish
  taxonomyEngine.register({
    rank: 'class', name: 'Echinodermata', parentName: null,
    traits: {
      aquatic: true, habitat: ['underwater'], size: 8,
      lifespan: 8640, speed: 3, strength: 10, intelligence: 1,
      diet: 'omnivore', socialStructure: 'solitary',
      reproductionRate: 40, metabolicRate: 0.3,
      perception: { visualRange: 5, hearingRange: 5, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Chilopoda — centipedes
  taxonomyEngine.register({
    rank: 'class', name: 'Chilopoda', parentName: null,
    traits: {
      size: 4, lifespan: 518, speed: 55, strength: 20,
      intelligence: 2, diet: 'carnivore', habitat: ['surface', 'underground'],
      socialStructure: 'solitary', reproductionRate: 15, nocturnal: true, metabolicRate: 2.5,
      perception: { visualRange: 10, hearingRange: 15, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Branchiopoda — krill and related small crustaceans
  taxonomyEngine.register({
    rank: 'class', name: 'Branchiopoda', parentName: null,
    traits: {
      aquatic: true, habitat: ['underwater'], size: 1,
      lifespan: 52, speed: 25, strength: 2, intelligence: 1,
      diet: 'filter_feeder', socialStructure: 'herd',
      reproductionRate: 200, metabolicRate: 2.0,
      perception: { visualRange: 5, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Merostomata — horseshoe crabs (ancient arthropods, not true crabs)
  taxonomyEngine.register({
    rank: 'class', name: 'Merostomata', parentName: null,
    traits: {
      aquatic: true, habitat: ['underwater', 'surface'], size: 18,
      lifespan: 17280, speed: 10, strength: 20, intelligence: 2,
      diet: 'omnivore', socialStructure: 'solitary',
      reproductionRate: 20, metabolicRate: 0.4,
      perception: { visualRange: 15, hearingRange: 5, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // Isopoda — woodlice / pill bugs (terrestrial crustaceans)
  taxonomyEngine.register({
    rank: 'class', name: 'Isopoda', parentName: null,
    traits: {
      size: 1, lifespan: 259, speed: 10, strength: 5,
      intelligence: 1, diet: 'detritivore', habitat: ['surface', 'underground'],
      socialStructure: 'colony', reproductionRate: 30, nocturnal: true, metabolicRate: 1.5,
      perception: { visualRange: 5, hearingRange: 5, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // ============================================================
  // NEW ORDERS
  // ============================================================

  // Insecta orders
  taxonomyEngine.register({
    rank: 'order', name: 'Diptera', parentName: 'Insecta',
    traits: { canFly: true, size: 1, lifespan: 3, reproductionRate: 120, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Hemiptera', parentName: 'Insecta',
    traits: { size: 2, lifespan: 10, reproductionRate: 60, diet: 'herbivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Phasmatodea', parentName: 'Insecta',
    traits: { size: 5, lifespan: 52, diet: 'herbivore', socialStructure: 'solitary', speed: 10 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Dermaptera', parentName: 'Insecta',
    traits: { size: 2, lifespan: 52, diet: 'omnivore', nocturnal: true, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Blattodea_Cockroach', parentName: 'Insecta',
    traits: { size: 3, lifespan: 60, diet: 'omnivore', speed: 55, socialStructure: 'colony' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Neuroptera', parentName: 'Insecta',
    traits: { canFly: true, size: 2, lifespan: 17, diet: 'carnivore', nocturnal: true },
  });

  // Arachnida orders
  taxonomyEngine.register({
    rank: 'order', name: 'Solifugae', parentName: 'Arachnida',
    traits: { size: 4, speed: 70, diet: 'carnivore', nocturnal: true, lifespan: 86 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Thelyphonida', parentName: 'Arachnida',
    traits: { size: 5, diet: 'carnivore', nocturnal: true, lifespan: 432, strength: 20 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Amblypygi', parentName: 'Arachnida',
    traits: { size: 4, diet: 'carnivore', nocturnal: true, lifespan: 432, socialStructure: 'solitary' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Ixodida', parentName: 'Arachnida',
    traits: {
      size: 1, lifespan: 259, diet: 'carnivore', socialStructure: 'solitary',
      perception: { visualRange: 3, hearingRange: 5, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // Malacostraca orders
  taxonomyEngine.register({
    rank: 'order', name: 'Euphausiacea', parentName: 'Malacostraca',
    traits: { size: 1, lifespan: 518, diet: 'filter_feeder', socialStructure: 'herd', speed: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Anomura', parentName: 'Malacostraca',
    traits: { size: 12, strength: 25, diet: 'omnivore' },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Brachyura', parentName: 'Malacostraca',
    traits: { size: 14, strength: 30, diet: 'omnivore', speed: 30 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Astacidea', parentName: 'Malacostraca',
    traits: { size: 12, strength: 25, diet: 'omnivore', aquatic: true },
  });

  // Cephalopoda orders
  taxonomyEngine.register({
    rank: 'order', name: 'Sepiida', parentName: 'Cephalopoda',
    traits: { intelligence: 35, size: 20, speed: 35 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Nautilida', parentName: 'Cephalopoda',
    traits: { intelligence: 15, size: 15, speed: 10, lifespan: 1728 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Oegopsida', parentName: 'Cephalopoda',
    traits: { speed: 70, size: 50, diet: 'carnivore' },
  });

  // Cnidaria orders
  taxonomyEngine.register({
    rank: 'order', name: 'Semaeostomeae', parentName: 'Cnidaria',
    traits: { size: 15, diet: 'carnivore', socialStructure: 'solitary', speed: 3 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Cubozoa', parentName: 'Cnidaria',
    traits: {
      size: 8, diet: 'carnivore', speed: 6,
      perception: { visualRange: 20, hearingRange: 5, smellRange: 5, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Siphonophorae', parentName: 'Cnidaria',
    traits: { size: 20, diet: 'carnivore', socialStructure: 'colony', speed: 5 },
  });

  // Echinodermata orders
  taxonomyEngine.register({
    rank: 'order', name: 'Camarodonta', parentName: 'Echinodermata',
    traits: { size: 8, diet: 'herbivore', strength: 10, speed: 2 },
  });
  taxonomyEngine.register({
    rank: 'order', name: 'Valvatida', parentName: 'Echinodermata',
    traits: { size: 12, diet: 'carnivore', strength: 20, speed: 3 },
  });

  // Chilopoda orders
  taxonomyEngine.register({
    rank: 'order', name: 'Scolopendromorpha', parentName: 'Chilopoda',
    traits: { size: 6, strength: 30, speed: 50, diet: 'carnivore' },
  });

  // Barnacle order
  taxonomyEngine.register({
    rank: 'order', name: 'Sessilia', parentName: 'Malacostraca',
    traits: { size: 2, speed: 0, diet: 'filter_feeder', socialStructure: 'colony', aquatic: true, lifespan: 1728 },
  });

  // ============================================================
  // NEW FAMILIES
  // ============================================================

  // Beetle families
  taxonomyEngine.register({ rank: 'family', name: 'Lucanidae', parentName: 'Coleoptera', traits: { size: 5, strength: 40, lifespan: 173 } });
  taxonomyEngine.register({ rank: 'family', name: 'Carabidae', parentName: 'Coleoptera', traits: { speed: 60, diet: 'carnivore', size: 2 } });
  taxonomyEngine.register({ rank: 'family', name: 'Buprestidae', parentName: 'Coleoptera', traits: { size: 3, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Goliathinae', parentName: 'Coleoptera', traits: { size: 8, strength: 55 } });
  taxonomyEngine.register({ rank: 'family', name: 'Cerambycidae', parentName: 'Coleoptera', traits: { size: 4, lifespan: 52 } });
  taxonomyEngine.register({ rank: 'family', name: 'Elateridae', parentName: 'Coleoptera', traits: { size: 2, canFly: true } });

  // Butterfly / moth families
  taxonomyEngine.register({ rank: 'family', name: 'Morphidae', parentName: 'Lepidoptera', traits: { size: 3, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Papilionidae', parentName: 'Lepidoptera', traits: { size: 3, canFly: true, speed: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Sphingidae', parentName: 'Lepidoptera', traits: { size: 4, canFly: true, speed: 55, nocturnal: false } });
  taxonomyEngine.register({ rank: 'family', name: 'Sesiidae', parentName: 'Lepidoptera', traits: { size: 2, canFly: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Geometridae', parentName: 'Lepidoptera', traits: { size: 2, nocturnal: true } });

  // Hymenoptera families
  taxonomyEngine.register({ rank: 'family', name: 'Vespidae', parentName: 'Hymenoptera', traits: { socialStructure: 'colony', canFly: true, size: 2, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Xylocopinae', parentName: 'Hymenoptera', traits: { size: 3, canFly: true, socialStructure: 'solitary', diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Bombini', parentName: 'Hymenoptera', traits: { size: 3, canFly: true, socialStructure: 'colony', diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Ponera', parentName: 'Hymenoptera', traits: { socialStructure: 'colony', strength: 20, size: 3 } });

  // Diptera families
  taxonomyEngine.register({ rank: 'family', name: 'Muscidae', parentName: 'Diptera', traits: { size: 1, canFly: true, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Tabanidae', parentName: 'Diptera', traits: { size: 2, canFly: true, diet: 'carnivore', speed: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Glossinidae', parentName: 'Diptera', traits: { size: 1, canFly: true, diet: 'carnivore' } });

  // Other insect families
  taxonomyEngine.register({ rank: 'family', name: 'Cicadidae', parentName: 'Hemiptera', traits: { size: 3, canFly: true, lifespan: 1296, diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Phylliidae', parentName: 'Phasmatodea', traits: { size: 6, speed: 5, diet: 'herbivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Gerridae', parentName: 'Hemiptera', traits: { size: 1, speed: 50, diet: 'carnivore', habitat: ['surface'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Dytiscidae', parentName: 'Coleoptera', traits: { size: 2, aquatic: true, habitat: ['underwater', 'surface'], diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Forficulidae', parentName: 'Dermaptera', traits: { size: 2, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Blaberidae', parentName: 'Blattodea_Cockroach', traits: { size: 4, speed: 40, nocturnal: true } });

  // Arachnid families
  taxonomyEngine.register({ rank: 'family', name: 'Araneidae', parentName: 'Araneae', traits: { size: 3, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Salticidae', parentName: 'Araneae', traits: { size: 1, speed: 40, perception: { visualRange: 50, hearingRange: 10, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false } } });
  taxonomyEngine.register({ rank: 'family', name: 'Lycosidae', parentName: 'Araneae', traits: { size: 3, speed: 45 } });
  taxonomyEngine.register({ rank: 'family', name: 'Sicariidae', parentName: 'Araneae', traits: { size: 2, nocturnal: true } });
  taxonomyEngine.register({ rank: 'family', name: 'Solifugidae', parentName: 'Solifugae', traits: { size: 4, strength: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Thelyphonidae', parentName: 'Thelyphonida', traits: { size: 5, strength: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Phrynidae', parentName: 'Amblypygi', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ixodidae', parentName: 'Ixodida', traits: { size: 1, diet: 'carnivore' } });

  // Crustacean families
  taxonomyEngine.register({ rank: 'family', name: 'Portunidae', parentName: 'Brachyura', traits: { size: 15, speed: 35 } });
  taxonomyEngine.register({ rank: 'family', name: 'Paguridae', parentName: 'Anomura', traits: { size: 8, diet: 'omnivore' } });
  taxonomyEngine.register({ rank: 'family', name: 'Coenobitidae', parentName: 'Anomura', traits: { size: 18, strength: 35, habitat: ['surface'] } });
  taxonomyEngine.register({ rank: 'family', name: 'Euphausiidae', parentName: 'Euphausiacea', traits: { size: 1 } });
  taxonomyEngine.register({ rank: 'family', name: 'Balanidae', parentName: 'Sessilia', traits: { size: 2, diet: 'filter_feeder' } });
  taxonomyEngine.register({ rank: 'family', name: 'Astacidae', parentName: 'Astacidea', traits: { size: 12 } });
  taxonomyEngine.register({ rank: 'family', name: 'Lithodidae', parentName: 'Anomura', traits: { size: 30, strength: 50 } });
  taxonomyEngine.register({ rank: 'family', name: 'Armadillidiidae', parentName: 'Isopoda', traits: { size: 1, diet: 'detritivore' } });

  // Cephalopod families
  taxonomyEngine.register({ rank: 'family', name: 'Sepiidae', parentName: 'Sepiida', traits: { intelligence: 40, size: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Nautilidae', parentName: 'Nautilida', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Ommastrephidae', parentName: 'Oegopsida', traits: { size: 55, speed: 75 } });
  taxonomyEngine.register({ rank: 'family', name: 'Amphitretidae', parentName: 'Octopoda', traits: { intelligence: 50, size: 15 } });

  // Cnidaria families
  taxonomyEngine.register({ rank: 'family', name: 'Ulmaridae', parentName: 'Semaeostomeae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'family', name: 'Chirodropidae', parentName: 'Cubozoa', traits: { size: 8, strength: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Physaliidae', parentName: 'Siphonophorae', traits: { size: 25, strength: 10 } });

  // Echinodermata families
  taxonomyEngine.register({ rank: 'family', name: 'Strongylocentrotidae', parentName: 'Camarodonta', traits: { size: 8, strength: 15 } });
  taxonomyEngine.register({ rank: 'family', name: 'Acanthasteridae', parentName: 'Valvatida', traits: { size: 18, strength: 15 } });

  // Chilopoda families
  taxonomyEngine.register({ rank: 'family', name: 'Scolopendridae', parentName: 'Scolopendromorpha', traits: { size: 7, strength: 35 } });

  // Merostomata families
  taxonomyEngine.register({ rank: 'family', name: 'Limulidae', parentName: 'Merostomata', traits: { size: 18, strength: 20 } });

  // ============================================================
  // NEW GENERA
  // ============================================================

  // Beetles
  taxonomyEngine.register({ rank: 'genus', name: 'Lucanus', parentName: 'Lucanidae', traits: { size: 6, strength: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Brachinus', parentName: 'Carabidae', traits: { size: 2, strength: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sternocera', parentName: 'Buprestidae', traits: { size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Goliathus', parentName: 'Goliathinae', traits: { size: 9, strength: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Titanus', parentName: 'Cerambycidae', traits: { size: 6 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Dynastes', parentName: 'Dynastinae', traits: { size: 7, strength: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Agrypnus', parentName: 'Elateridae', traits: { size: 2 } });

  // Butterflies / moths
  taxonomyEngine.register({ rank: 'genus', name: 'Actias', parentName: 'Saturniidae', traits: { size: 4, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Morpho', parentName: 'Morphidae', traits: { size: 4, canFly: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Vanessa', parentName: 'Nymphalidae', traits: { size: 2, speed: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Papilio', parentName: 'Papilionidae', traits: { size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Manduca', parentName: 'Sphingidae', traits: { size: 4, speed: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Biston', parentName: 'Geometridae', traits: { size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hemaris', parentName: 'Sesiidae', traits: { size: 2, canFly: true } });

  // Hymenoptera
  taxonomyEngine.register({ rank: 'genus', name: 'Atta', parentName: 'Formicidae', traits: { strength: 20, socialStructure: 'colony', diet: 'herbivore', size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Eciton', parentName: 'Formicidae', traits: { strength: 18, socialStructure: 'colony', diet: 'carnivore', size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Solenopsis', parentName: 'Formicidae', traits: { strength: 12, socialStructure: 'colony', size: 1 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Vespa', parentName: 'Vespidae', traits: { size: 3, strength: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Vespula', parentName: 'Vespidae', traits: { size: 2, strength: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Xylocopa', parentName: 'Xylocopinae', traits: { size: 3, strength: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Bombus', parentName: 'Bombini', traits: { size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Paraponera', parentName: 'Ponera', traits: { size: 4, strength: 25 } });

  // Diptera
  taxonomyEngine.register({ rank: 'genus', name: 'Musca', parentName: 'Muscidae', traits: { size: 1 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tabanus', parentName: 'Tabanidae', traits: { size: 2, speed: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Glossina', parentName: 'Glossinidae', traits: { size: 1 } });

  // Other insects
  taxonomyEngine.register({ rank: 'genus', name: 'Magicicada', parentName: 'Cicadidae', traits: { lifespan: 1469, size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Carausius', parentName: 'Phylliidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Gerris', parentName: 'Gerridae', traits: { size: 1 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Dytiscus', parentName: 'Dytiscidae', traits: { size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Forficula', parentName: 'Forficulidae', traits: { size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Gromphadorhina', parentName: 'Blaberidae', traits: { size: 4 } });

  // Arachnids
  taxonomyEngine.register({ rank: 'genus', name: 'Argiope', parentName: 'Araneidae', traits: { size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phidippus', parentName: 'Salticidae', traits: { size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hogna', parentName: 'Lycosidae', traits: { size: 3 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Loxosceles', parentName: 'Sicariidae', traits: { size: 2 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Galeodes', parentName: 'Solifugidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mastigoproctus', parentName: 'Thelyphonidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Damon', parentName: 'Phrynidae', traits: { size: 5 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ixodes', parentName: 'Ixodidae', traits: { size: 1 } });

  // Crustaceans
  taxonomyEngine.register({ rank: 'genus', name: 'Callinectes', parentName: 'Portunidae', traits: { size: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pagurus', parentName: 'Paguridae', traits: { size: 6 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Birgus', parentName: 'Coenobitidae', traits: { size: 20, strength: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Euphausia', parentName: 'Euphausiidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Balanus', parentName: 'Balanidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Astacus', parentName: 'Astacidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Paralithodes', parentName: 'Lithodidae', traits: { size: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Armadillidium', parentName: 'Armadillidiidae', traits: {} });

  // Cephalopods
  taxonomyEngine.register({ rank: 'genus', name: 'Sepia', parentName: 'Sepiidae', traits: { intelligence: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Nautilus', parentName: 'Nautilidae', traits: {} });
  taxonomyEngine.register({ rank: 'genus', name: 'Dosidicus', parentName: 'Ommastrephidae', traits: { size: 60, strength: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Thaumoctopus', parentName: 'Amphitretidae', traits: { intelligence: 50, size: 15 } });

  // Cnidaria
  taxonomyEngine.register({ rank: 'genus', name: 'Aurelia', parentName: 'Ulmaridae', traits: { size: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chironex', parentName: 'Chirodropidae', traits: { size: 9, strength: 18 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Physalia', parentName: 'Physaliidae', traits: { size: 25 } });

  // Echinodermata
  taxonomyEngine.register({ rank: 'genus', name: 'Strongylocentrotus', parentName: 'Strongylocentrotidae', traits: { size: 8 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Acanthaster', parentName: 'Acanthasteridae', traits: { size: 18, diet: 'carnivore' } });

  // Chilopoda
  taxonomyEngine.register({ rank: 'genus', name: 'Scolopendra', parentName: 'Scolopendridae', traits: { size: 7, strength: 35 } });

  // Merostomata
  taxonomyEngine.register({ rank: 'genus', name: 'Limulus', parentName: 'Limulidae', traits: {} });

  // ============================================================
  // SPECIES REGISTRATIONS (50+)
  // ============================================================

  // --- BEETLES ---

  speciesRegistry.register({
    commonName: 'Stag Beetle',
    scientificName: 'Lucanus cervus',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Lucanidae', genus: 'Lucanus', species: 'cervus' },
    tier: 'generated',
    traitOverrides: {
      // Adults live ~1-2 months; larvae 3-7 years but adults are the mobile form modeled here
      lifespan: 9, size: 5, speed: 25, strength: 45, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 10, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Bombardier Beetle',
    scientificName: 'Brachinus crepitans',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Carabidae', genus: 'Brachinus', species: 'crepitans' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 2, speed: 55, strength: 10, intelligence: 2,
      diet: 'carnivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 30, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 15, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Jewel Beetle',
    scientificName: 'Sternocera aequisignata',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Buprestidae', genus: 'Sternocera', species: 'aequisignata' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 17, size: 3, speed: 30, strength: 10, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 25, habitat: ['surface'],
      perception: { visualRange: 25, hearingRange: 10, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Tiger Beetle',
    scientificName: 'Cicindela campestris',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Carabidae', genus: 'Brachinus', species: 'campestris' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 2, speed: 70, strength: 12, intelligence: 3,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 30, habitat: ['surface'],
      perception: { visualRange: 45, hearingRange: 10, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Goliath Beetle',
    scientificName: 'Goliathus goliatus',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Goliathinae', genus: 'Goliathus', species: 'goliatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 9, size: 9, speed: 20, strength: 60, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 8, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 10, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Longhorn Beetle',
    scientificName: 'Titanus giganteus',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Cerambycidae', genus: 'Titanus', species: 'giganteus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 17, size: 7, speed: 15, strength: 30, intelligence: 2,
      diet: 'herbivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 10, habitat: ['surface'],
      perception: { visualRange: 10, hearingRange: 20, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Rhinoceros Beetle',
    scientificName: 'Dynastes hercules',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Dynastinae', genus: 'Dynastes', species: 'hercules' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 9, size: 7, speed: 20, strength: 65, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 12, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Click Beetle',
    scientificName: 'Agrypnus murinus',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Elateridae', genus: 'Agrypnus', species: 'murinus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 2, speed: 30, strength: 10, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 30, habitat: ['surface', 'underground'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- BUTTERFLIES / MOTHS ---

  speciesRegistry.register({
    commonName: 'Luna Moth',
    scientificName: 'Actias luna',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Saturniidae', genus: 'Actias', species: 'luna' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2, size: 4, speed: 30, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 80, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 20, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Blue Morpho',
    scientificName: 'Morpho peleides',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Morphidae', genus: 'Morpho', species: 'peleides' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 2, size: 4, speed: 35, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Painted Lady',
    scientificName: 'Vanessa cardui',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Nymphalidae', genus: 'Vanessa', species: 'cardui' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 3, size: 2, speed: 40, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 80, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Swallowtail Butterfly',
    scientificName: 'Papilio machaon',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Papilionidae', genus: 'Papilio', species: 'machaon' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 3, size: 3, speed: 38, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 70, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 10, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Hawkmoth',
    scientificName: 'Manduca sexta',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Sphingidae', genus: 'Manduca', species: 'sexta' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 3, size: 4, speed: 60, strength: 2, intelligence: 3,
      diet: 'herbivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['surface'],
      perception: { visualRange: 25, hearingRange: 20, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Clearwing Moth',
    scientificName: 'Hemaris thysbe',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Sesiidae', genus: 'Hemaris', species: 'thysbe' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 2, size: 2, speed: 50, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['surface'],
      perception: { visualRange: 25, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Peppered Moth',
    scientificName: 'Biston betularia',
    taxonomy: { class: 'Insecta', order: 'Lepidoptera', family: 'Geometridae', genus: 'Biston', species: 'betularia' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 3, size: 2, speed: 25, strength: 1, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 70, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 15, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- ANTS / WASPS / BEES ---

  speciesRegistry.register({
    commonName: 'Leafcutter Ant',
    scientificName: 'Atta cephalotes',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae', genus: 'Atta', species: 'cephalotes' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1, size: 2, speed: 25, strength: 20, intelligence: 8,
      diet: 'herbivore', canFly: false, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 200, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 15, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Army Ant',
    scientificName: 'Eciton burchellii',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae', genus: 'Eciton', species: 'burchellii' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 1, size: 2, speed: 30, strength: 18, intelligence: 7,
      diet: 'carnivore', canFly: false, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 200, habitat: ['surface'],
      perception: { visualRange: 5, hearingRange: 20, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Fire Ant',
    scientificName: 'Solenopsis invicta',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Formicidae', genus: 'Solenopsis', species: 'invicta' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 1, size: 1, speed: 20, strength: 12, intelligence: 6,
      diet: 'omnivore', canFly: false, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 200, habitat: ['surface', 'underground'],
      perception: { visualRange: 8, hearingRange: 15, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Asian Giant Hornet',
    scientificName: 'Vespa mandarinia',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Vespidae', genus: 'Vespa', species: 'mandarinia' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1, size: 4, speed: 45, strength: 22, intelligence: 8,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 60, habitat: ['surface'],
      perception: { visualRange: 35, hearingRange: 15, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Yellowjacket',
    scientificName: 'Vespula germanica',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Vespidae', genus: 'Vespula', species: 'germanica' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 1, size: 2, speed: 40, strength: 15, intelligence: 7,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 100, habitat: ['surface', 'underground'],
      perception: { visualRange: 30, hearingRange: 15, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Carpenter Bee',
    scientificName: 'Xylocopa violacea',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Xylocopinae', genus: 'Xylocopa', species: 'violacea' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 3, speed: 35, strength: 15, intelligence: 6,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 15, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 10, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Bumblebee',
    scientificName: 'Bombus terrestris',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Bombini', genus: 'Bombus', species: 'terrestris' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 4, size: 3, speed: 30, strength: 12, intelligence: 7,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 80, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 10, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Bullet Ant',
    scientificName: 'Paraponera clavata',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Ponera', genus: 'Paraponera', species: 'clavata' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 52, size: 4, speed: 25, strength: 28, intelligence: 7,
      diet: 'omnivore', canFly: false, nocturnal: false, socialStructure: 'colony',
      reproductionRate: 50, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 20, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- FLIES ---

  speciesRegistry.register({
    commonName: 'Housefly',
    scientificName: 'Musca domestica',
    taxonomy: { class: 'Insecta', order: 'Diptera', family: 'Muscidae', genus: 'Musca', species: 'domestica' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 1, size: 1, speed: 45, strength: 1, intelligence: 2,
      diet: 'omnivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 250, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Horsefly',
    scientificName: 'Tabanus bovinus',
    taxonomy: { class: 'Insecta', order: 'Diptera', family: 'Tabanidae', genus: 'Tabanus', species: 'bovinus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 2, size: 2, speed: 50, strength: 5, intelligence: 2,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 100, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  speciesRegistry.register({
    commonName: 'Tsetse Fly',
    scientificName: 'Glossina morsitans',
    taxonomy: { class: 'Insecta', order: 'Diptera', family: 'Glossinidae', genus: 'Glossina', species: 'morsitans' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 4, size: 1, speed: 40, strength: 2, intelligence: 2,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 40, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // --- OTHER INSECTS ---

  speciesRegistry.register({
    commonName: 'Cicada',
    scientificName: 'Magicicada septendecim',
    taxonomy: { class: 'Insecta', order: 'Hemiptera', family: 'Cicadidae', genus: 'Magicicada', species: 'septendecim' },
    tier: 'notable',
    traitOverrides: {
      // 17-year cycle; adult lifespan only ~4 weeks
      lifespan: 1469, size: 3, speed: 25, strength: 5, intelligence: 2,
      diet: 'herbivore', canFly: true, nocturnal: false, socialStructure: 'herd',
      reproductionRate: 30, habitat: ['surface', 'underground'],
      perception: { visualRange: 20, hearingRange: 50, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Walking Stick',
    scientificName: 'Carausius morosus',
    taxonomy: { class: 'Insecta', order: 'Phasmatodea', family: 'Phylliidae', genus: 'Carausius', species: 'morosus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 6, speed: 8, strength: 3, intelligence: 2,
      diet: 'herbivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 40, habitat: ['surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Water Strider',
    scientificName: 'Gerris lacustris',
    taxonomy: { class: 'Insecta', order: 'Hemiptera', family: 'Gerridae', genus: 'Gerris', species: 'lacustris' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 17, size: 1, speed: 50, strength: 3, intelligence: 2,
      diet: 'carnivore', canFly: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['surface'],
      aquatic: false,
      perception: { visualRange: 20, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Diving Beetle',
    scientificName: 'Dytiscus marginalis',
    taxonomy: { class: 'Insecta', order: 'Coleoptera', family: 'Dytiscidae', genus: 'Dytiscus', species: 'marginalis' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 2, speed: 40, strength: 10, intelligence: 2,
      diet: 'carnivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 40, habitat: ['underwater', 'surface'], aquatic: true,
      perception: { visualRange: 20, hearingRange: 10, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Earwig',
    scientificName: 'Forficula auricularia',
    taxonomy: { class: 'Insecta', order: 'Dermaptera', family: 'Forficulidae', genus: 'Forficula', species: 'auricularia' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 52, size: 2, speed: 25, strength: 5, intelligence: 2,
      diet: 'omnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 50, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 15, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Madagascar Hissing Cockroach',
    scientificName: 'Gromphadorhina portentosa',
    taxonomy: { class: 'Insecta', order: 'Blattodea_Cockroach', family: 'Blaberidae', genus: 'Gromphadorhina', species: 'portentosa' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 173, size: 4, speed: 35, strength: 10, intelligence: 3,
      diet: 'detritivore', canFly: false, nocturnal: true, socialStructure: 'colony',
      reproductionRate: 40, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 25, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Asian Giant Centipede',
    scientificName: 'Scolopendra subspinipes',
    taxonomy: { class: 'Chilopoda', order: 'Scolopendromorpha', family: 'Scolopendridae', genus: 'Scolopendra', species: 'subspinipes' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 518, size: 6, speed: 55, strength: 35, intelligence: 3,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 15, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 20, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- ARACHNIDS ---

  speciesRegistry.register({
    commonName: 'Garden Spider',
    scientificName: 'Argiope bruennichi',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Araneidae', genus: 'Argiope', species: 'bruennichi' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 3, speed: 20, strength: 10, intelligence: 4,
      diet: 'carnivore', canFly: false, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 10, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Jumping Spider',
    scientificName: 'Phidippus regius',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Salticidae', genus: 'Phidippus', species: 'regius' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 52, size: 2, speed: 40, strength: 10, intelligence: 8,
      diet: 'carnivore', canFly: false, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 40, habitat: ['surface'],
      perception: { visualRange: 55, hearingRange: 20, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Wolf Spider',
    scientificName: 'Hogna carolinensis',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Lycosidae', genus: 'Hogna', species: 'carolinensis' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 173, size: 3, speed: 45, strength: 12, intelligence: 5,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 50, habitat: ['surface'],
      perception: { visualRange: 30, hearingRange: 20, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Brown Recluse',
    scientificName: 'Loxosceles reclusa',
    taxonomy: { class: 'Arachnida', order: 'Araneae', family: 'Sicariidae', genus: 'Loxosceles', species: 'reclusa' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 173, size: 2, speed: 25, strength: 5, intelligence: 3,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 30, habitat: ['surface', 'underground'],
      perception: { visualRange: 15, hearingRange: 15, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Camel Spider',
    scientificName: 'Galeodes arabs',
    taxonomy: { class: 'Arachnida', order: 'Solifugae', family: 'Solifugidae', genus: 'Galeodes', species: 'arabs' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 86, size: 5, speed: 72, strength: 20, intelligence: 3,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 20, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 20, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Vinegaroon',
    scientificName: 'Mastigoproctus giganteus',
    taxonomy: { class: 'Arachnida', order: 'Thelyphonida', family: 'Thelyphonidae', genus: 'Mastigoproctus', species: 'giganteus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432, size: 5, speed: 20, strength: 20, intelligence: 4,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 12, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 25, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Whip Spider',
    scientificName: 'Damon variegatus',
    taxonomy: { class: 'Arachnida', order: 'Amblypygi', family: 'Phrynidae', genus: 'Damon', species: 'variegatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432, size: 4, speed: 20, strength: 12, intelligence: 4,
      diet: 'carnivore', canFly: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 15, habitat: ['surface', 'underground'],
      perception: { visualRange: 10, hearingRange: 20, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Deer Tick',
    scientificName: 'Ixodes scapularis',
    taxonomy: { class: 'Arachnida', order: 'Ixodida', family: 'Ixodidae', genus: 'Ixodes', species: 'scapularis' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 173, size: 1, speed: 5, strength: 2, intelligence: 1,
      diet: 'carnivore', canFly: false, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 100, habitat: ['surface'],
      perception: { visualRange: 3, hearingRange: 5, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: true },
    },
  });

  // --- CRUSTACEANS ---

  speciesRegistry.register({
    commonName: 'Blue Crab',
    scientificName: 'Callinectes sapidus',
    taxonomy: { class: 'Malacostraca', order: 'Brachyura', family: 'Portunidae', genus: 'Callinectes', species: 'sapidus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 259, size: 15, speed: 35, strength: 30, intelligence: 4,
      diet: 'omnivore', aquatic: true, socialStructure: 'solitary',
      reproductionRate: 25, habitat: ['underwater', 'surface'],
      perception: { visualRange: 20, hearingRange: 15, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Hermit Crab',
    scientificName: 'Pagurus bernhardus',
    taxonomy: { class: 'Malacostraca', order: 'Anomura', family: 'Paguridae', genus: 'Pagurus', species: 'bernhardus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 864, size: 6, speed: 15, strength: 15, intelligence: 4,
      diet: 'omnivore', aquatic: true, socialStructure: 'solitary',
      reproductionRate: 20, habitat: ['underwater', 'surface'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Coconut Crab',
    scientificName: 'Birgus latro',
    taxonomy: { class: 'Malacostraca', order: 'Anomura', family: 'Coenobitidae', genus: 'Birgus', species: 'latro' },
    tier: 'flagship',
    traitOverrides: {
      // Lives up to 60 years
      lifespan: 5184, size: 20, speed: 15, strength: 45, intelligence: 6,
      diet: 'omnivore', aquatic: false, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 5, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 15, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Antarctic Krill',
    scientificName: 'Euphausia superba',
    taxonomy: { class: 'Malacostraca', order: 'Euphausiacea', family: 'Euphausiidae', genus: 'Euphausia', species: 'superba' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 518, size: 1, speed: 25, strength: 1, intelligence: 1,
      diet: 'filter_feeder', aquatic: true, socialStructure: 'herd',
      reproductionRate: 300, habitat: ['underwater'],
      perception: { visualRange: 8, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Barnacle',
    scientificName: 'Balanus glandula',
    taxonomy: { class: 'Malacostraca', order: 'Sessilia', family: 'Balanidae', genus: 'Balanus', species: 'glandula' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 1728, size: 2, speed: 0, strength: 5, intelligence: 1,
      diet: 'filter_feeder', aquatic: true, socialStructure: 'colony',
      reproductionRate: 200, habitat: ['underwater'],
      perception: { visualRange: 2, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Horseshoe Crab',
    scientificName: 'Limulus polyphemus',
    taxonomy: { class: 'Merostomata', order: 'Xiphosura', family: 'Limulidae', genus: 'Limulus', species: 'polyphemus' },
    tier: 'notable',
    traitOverrides: {
      // Lives ~20 years; ancient arthropod
      lifespan: 1728, size: 18, speed: 10, strength: 22, intelligence: 2,
      diet: 'omnivore', aquatic: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 15, habitat: ['underwater', 'surface'],
      perception: { visualRange: 15, hearingRange: 5, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Pill Bug',
    scientificName: 'Armadillidium vulgare',
    taxonomy: { class: 'Isopoda', order: 'Isopoda_Oniscidea', family: 'Armadillidiidae', genus: 'Armadillidium', species: 'vulgare' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 259, size: 1, speed: 8, strength: 3, intelligence: 1,
      diet: 'detritivore', aquatic: false, nocturnal: true, socialStructure: 'colony',
      reproductionRate: 30, habitat: ['surface', 'underground'],
      perception: { visualRange: 5, hearingRange: 5, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Signal Crayfish',
    scientificName: 'Pacifastacus leniusculus',
    taxonomy: { class: 'Malacostraca', order: 'Astacidea', family: 'Astacidae', genus: 'Astacus', species: 'leniusculus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 864, size: 12, speed: 20, strength: 25, intelligence: 4,
      diet: 'omnivore', aquatic: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 20, habitat: ['underwater'],
      perception: { visualRange: 15, hearingRange: 10, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Red King Crab',
    scientificName: 'Paralithodes camtschaticus',
    taxonomy: { class: 'Malacostraca', order: 'Anomura', family: 'Lithodidae', genus: 'Paralithodes', species: 'camtschaticus' },
    tier: 'notable',
    traitOverrides: {
      // Lives ~20-30 years
      lifespan: 2160, size: 30, speed: 10, strength: 52, intelligence: 4,
      diet: 'omnivore', aquatic: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 10, habitat: ['underwater'],
      perception: { visualRange: 20, hearingRange: 10, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- CEPHALOPODS / MOLLUSKS ---

  speciesRegistry.register({
    commonName: 'Common Cuttlefish',
    scientificName: 'Sepia officinalis',
    taxonomy: { class: 'Cephalopoda', order: 'Sepiida', family: 'Sepiidae', genus: 'Sepia', species: 'officinalis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 173, size: 20, speed: 35, strength: 20, intelligence: 40,
      diet: 'carnivore', aquatic: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 15, habitat: ['underwater'],
      perception: { visualRange: 55, hearingRange: 20, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Nautilus',
    scientificName: 'Nautilus pompilius',
    taxonomy: { class: 'Cephalopoda', order: 'Nautilida', family: 'Nautilidae', genus: 'Nautilus', species: 'pompilius' },
    tier: 'notable',
    traitOverrides: {
      // Lives ~15-20 years — ancient lineage
      lifespan: 1382, size: 15, speed: 10, strength: 10, intelligence: 15,
      diet: 'carnivore', aquatic: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 5, habitat: ['underwater'],
      perception: { visualRange: 10, hearingRange: 15, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Humboldt Squid',
    scientificName: 'Dosidicus gigas',
    taxonomy: { class: 'Cephalopoda', order: 'Oegopsida', family: 'Ommastrephidae', genus: 'Dosidicus', species: 'gigas' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 173, size: 55, speed: 75, strength: 40, intelligence: 30,
      diet: 'carnivore', aquatic: true, nocturnal: true, socialStructure: 'pack',
      reproductionRate: 30, habitat: ['underwater'],
      perception: { visualRange: 50, hearingRange: 20, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Mimic Octopus',
    scientificName: 'Thaumoctopus mimicus',
    taxonomy: { class: 'Cephalopoda', order: 'Octopoda', family: 'Amphitretidae', genus: 'Thaumoctopus', species: 'mimicus' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 86, size: 14, speed: 40, strength: 15, intelligence: 52,
      diet: 'carnivore', aquatic: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 20, habitat: ['underwater'],
      perception: { visualRange: 55, hearingRange: 15, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- MARINE INVERTEBRATES ---

  speciesRegistry.register({
    commonName: 'Portuguese Man O War',
    scientificName: 'Physalia physalis',
    taxonomy: { class: 'Cnidaria', order: 'Siphonophorae', family: 'Physaliidae', genus: 'Physalia', species: 'physalis' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 26, size: 25, speed: 5, strength: 10, intelligence: 1,
      diet: 'carnivore', aquatic: true, socialStructure: 'colony',
      reproductionRate: 50, habitat: ['underwater', 'surface'],
      perception: { visualRange: 5, hearingRange: 5, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Sea Urchin',
    scientificName: 'Strongylocentrotus purpuratus',
    taxonomy: { class: 'Echinodermata', order: 'Camarodonta', family: 'Strongylocentrotidae', genus: 'Strongylocentrotus', species: 'purpuratus' },
    tier: 'generated',
    traitOverrides: {
      // Can live 70-100 years
      lifespan: 6048, size: 8, speed: 2, strength: 15, intelligence: 1,
      diet: 'herbivore', aquatic: true, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['underwater'],
      perception: { visualRange: 5, hearingRange: 5, smellRange: 15, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Crown-of-Thorns Starfish',
    scientificName: 'Acanthaster planci',
    taxonomy: { class: 'Echinodermata', order: 'Valvatida', family: 'Acanthasteridae', genus: 'Acanthaster', species: 'planci' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1555, size: 18, speed: 3, strength: 18, intelligence: 1,
      diet: 'carnivore', aquatic: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 40, habitat: ['underwater'],
      perception: { visualRange: 5, hearingRange: 5, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Box Jellyfish',
    scientificName: 'Chironex fleckeri',
    taxonomy: { class: 'Cnidaria', order: 'Cubozoa', family: 'Chirodropidae', genus: 'Chironex', species: 'fleckeri' },
    tier: 'flagship',
    traitOverrides: {
      lifespan: 26, size: 9, speed: 6, strength: 18, intelligence: 2,
      diet: 'carnivore', aquatic: true, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 60, habitat: ['underwater'],
      perception: { visualRange: 22, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Moon Jellyfish',
    scientificName: 'Aurelia aurita',
    taxonomy: { class: 'Cnidaria', order: 'Semaeostomeae', family: 'Ulmaridae', genus: 'Aurelia', species: 'aurita' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 26, size: 20, speed: 3, strength: 3, intelligence: 1,
      diet: 'filter_feeder', aquatic: true, socialStructure: 'herd',
      reproductionRate: 100, habitat: ['underwater'],
      perception: { visualRange: 5, hearingRange: 5, smellRange: 10, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // --- BONUS SPECIES (to exceed 50 comfortably) ---

  // Extra Isopoda order node needed for the pill bug genus — register here
  taxonomyEngine.register({
    rank: 'order', name: 'Isopoda_Oniscidea', parentName: 'Isopoda',
    traits: { habitat: ['surface', 'underground'], aquatic: false },
  });

  // Extra Merostomata order node
  taxonomyEngine.register({
    rank: 'order', name: 'Xiphosura', parentName: 'Merostomata',
    traits: { aquatic: true },
  });

  speciesRegistry.register({
    commonName: 'Firefly Squid',
    scientificName: 'Watasenia scintillans',
    taxonomy: { class: 'Cephalopoda', order: 'Oegopsida', family: 'Ommastrephidae', genus: 'Dosidicus', species: 'scintillans' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 86, size: 8, speed: 50, strength: 10, intelligence: 20,
      diet: 'carnivore', aquatic: true, nocturnal: true, socialStructure: 'herd',
      reproductionRate: 40, habitat: ['underwater'],
      perception: { visualRange: 40, hearingRange: 10, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Velvet Ant',
    scientificName: 'Dasymutilla occidentalis',
    taxonomy: { class: 'Insecta', order: 'Hymenoptera', family: 'Vespidae', genus: 'Vespula', species: 'occidentalis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 26, size: 3, speed: 35, strength: 15, intelligence: 4,
      diet: 'carnivore', canFly: false, nocturnal: false, socialStructure: 'solitary',
      reproductionRate: 20, habitat: ['surface'],
      perception: { visualRange: 20, hearingRange: 15, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Mantis Fly',
    scientificName: 'Mantispa styriaca',
    taxonomy: { class: 'Insecta', order: 'Neuroptera', family: 'Sesiidae', genus: 'Hemaris', species: 'styriaca' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 17, size: 2, speed: 40, strength: 8, intelligence: 4,
      diet: 'carnivore', canFly: true, nocturnal: true, socialStructure: 'solitary',
      reproductionRate: 30, habitat: ['surface'],
      perception: { visualRange: 35, hearingRange: 15, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Spiny Lobster',
    scientificName: 'Panulirus argus',
    taxonomy: { class: 'Malacostraca', order: 'Decapoda', family: 'Nephropidae', genus: 'Astacus', species: 'argus' },
    tier: 'generated',
    traitOverrides: {
      lifespan: 3110, size: 22, speed: 20, strength: 30, intelligence: 4,
      diet: 'omnivore', aquatic: true, nocturnal: true, socialStructure: 'herd',
      reproductionRate: 10, habitat: ['underwater'],
      perception: { visualRange: 20, hearingRange: 20, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Pistol Shrimp',
    scientificName: 'Alpheus randalli',
    taxonomy: { class: 'Malacostraca', order: 'Decapoda', family: 'Nephropidae', genus: 'Astacus', species: 'randalli' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 259, size: 4, speed: 30, strength: 35, intelligence: 5,
      diet: 'carnivore', aquatic: true, nocturnal: false, socialStructure: 'pair',
      reproductionRate: 20, habitat: ['underwater'],
      perception: { visualRange: 15, hearingRange: 40, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });
}
