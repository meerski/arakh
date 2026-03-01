// ============================================================
// Extended Mammal Species Seed — 80+ additional mammals
// ============================================================
// Lifespan formula: real_years * 86400 (ticks/year), rounded
// Gestation: real_months * 30 * 86400 / 86400 = real_months * 2592 ticks
// Maturity: rough ticks to sexual maturity

import { taxonomyEngine } from '../../species/taxonomy.js';
import { speciesRegistry } from '../../species/species.js';

export function seedMammals(): void {

  // ============================================================
  // NEW ORDERS (not in seed.ts)
  // ============================================================

  taxonomyEngine.register({
    rank: 'order', name: 'Sirenia', parentName: 'Mammalia',
    traits: { aquatic: true, habitat: ['underwater'], diet: 'herbivore', size: 70, speed: 20, socialStructure: 'pair' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Dasyuromorphia', parentName: 'Mammalia',
    traits: { diet: 'carnivore', size: 25, socialStructure: 'solitary' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Peramelemorphia', parentName: 'Mammalia',
    traits: { size: 15, diet: 'omnivore', nocturnal: true },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Tubulidentata', parentName: 'Mammalia',
    traits: { size: 40, diet: 'carnivore', nocturnal: true, socialStructure: 'solitary' },
  });

  taxonomyEngine.register({
    rank: 'order', name: 'Macroscelidea', parentName: 'Mammalia',
    traits: { size: 5, speed: 60, diet: 'omnivore' },
  });

  // Petauridae (Sugar Glider) order — Diprotodontia already exists, only need family

  // ============================================================
  // NEW FAMILIES (not in seed.ts)
  // ============================================================

  // Felidae already registered; new genera only needed
  // Canidae already registered; new genera only needed

  // Bears — Ursidae already registered; new genera only needed

  // Mustelidae already registered; new genera only needed

  // Primates — Hominidae registered; need new families
  taxonomyEngine.register({ rank: 'family', name: 'Lemuridae', parentName: 'Primates',
    traits: { size: 12, intelligence: 30, socialStructure: 'pack', nocturnal: false } });

  taxonomyEngine.register({ rank: 'family', name: 'Cercopithecidae', parentName: 'Primates',
    traits: { size: 25, intelligence: 45, socialStructure: 'pack' } });

  taxonomyEngine.register({ rank: 'family', name: 'Tarsiidae', parentName: 'Primates',
    traits: { size: 5, nocturnal: true, intelligence: 25,
      perception: { visualRange: 70, hearingRange: 75, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false } } });

  taxonomyEngine.register({ rank: 'family', name: 'Atelidae', parentName: 'Primates',
    traits: { size: 20, intelligence: 40, socialStructure: 'pack' } });

  taxonomyEngine.register({ rank: 'family', name: 'Hylobatidae', parentName: 'Primates',
    traits: { size: 18, intelligence: 48, socialStructure: 'pair', speed: 55 } });

  taxonomyEngine.register({ rank: 'family', name: 'Bonoboidae', parentName: 'Primates',
    traits: { size: 42, intelligence: 62, socialStructure: 'pack' } });

  // Ungulates
  taxonomyEngine.register({ rank: 'family', name: 'Antilocapridae', parentName: 'Artiodactyla',
    traits: { size: 45, speed: 85, diet: 'herbivore', socialStructure: 'herd' } });

  taxonomyEngine.register({ rank: 'family', name: 'Suidae', parentName: 'Artiodactyla',
    traits: { size: 45, strength: 50, diet: 'omnivore', socialStructure: 'herd' } });

  taxonomyEngine.register({ rank: 'family', name: 'Camelidae', parentName: 'Artiodactyla',
    traits: { size: 70, strength: 60, diet: 'herbivore', socialStructure: 'herd', speed: 55 } });

  taxonomyEngine.register({ rank: 'family', name: 'Tayassuidae', parentName: 'Artiodactyla',
    traits: { size: 30, diet: 'omnivore', socialStructure: 'pack' } });

  taxonomyEngine.register({ rank: 'family', name: 'Tragulidae', parentName: 'Artiodactyla',
    traits: { size: 10, diet: 'herbivore', socialStructure: 'solitary' } });

  // Perissodactyla — Equidae, Rhinocerotidae already exist; add Tapiridae
  taxonomyEngine.register({ rank: 'family', name: 'Tapiridae', parentName: 'Perissodactyla',
    traits: { size: 60, strength: 55, diet: 'herbivore', socialStructure: 'solitary' } });

  // Cetacea new families
  taxonomyEngine.register({ rank: 'family', name: 'Physeteridae', parentName: 'Cetacea',
    traits: { size: 96, strength: 88, diet: 'carnivore', socialStructure: 'pack',
      perception: { visualRange: 30, hearingRange: 95, smellRange: 5, echolocation: true, electroreception: false, thermalSensing: false } } });

  taxonomyEngine.register({ rank: 'family', name: 'Trichechidae', parentName: 'Sirenia',
    traits: { size: 65, diet: 'herbivore', socialStructure: 'pair' } });

  // Pinnipedia new families
  taxonomyEngine.register({ rank: 'family', name: 'Phocidae', parentName: 'Pinnipedia',
    traits: { aquatic: true, habitat: ['underwater'], diet: 'carnivore', size: 55, speed: 40 } });

  taxonomyEngine.register({ rank: 'family', name: 'Otariidae', parentName: 'Pinnipedia',
    traits: { aquatic: true, habitat: ['underwater'], diet: 'carnivore', size: 50, socialStructure: 'herd' } });

  // Carnivora new families
  taxonomyEngine.register({ rank: 'family', name: 'Hyaenidae', parentName: 'Carnivora',
    traits: { size: 50, strength: 70, diet: 'carnivore', socialStructure: 'pack',
      perception: { visualRange: 40, hearingRange: 65, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false } } });

  taxonomyEngine.register({ rank: 'family', name: 'Viverridae', parentName: 'Carnivora',
    traits: { size: 15, speed: 45, diet: 'carnivore', nocturnal: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Herpestidae', parentName: 'Carnivora',
    traits: { size: 10, speed: 50, diet: 'carnivore', intelligence: 25 } });

  taxonomyEngine.register({ rank: 'family', name: 'Mephitidae', parentName: 'Carnivora',
    traits: { size: 10, speed: 20, diet: 'omnivore', nocturnal: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Procyonidae', parentName: 'Carnivora',
    traits: { size: 15, intelligence: 28, diet: 'omnivore', nocturnal: true } });

  taxonomyEngine.register({ rank: 'family', name: 'Ailuridae', parentName: 'Carnivora',
    traits: { size: 15, diet: 'herbivore', nocturnal: true, socialStructure: 'solitary' } });

  // Rodentia new families
  taxonomyEngine.register({ rank: 'family', name: 'Caviidae', parentName: 'Rodentia',
    traits: { size: 22, diet: 'herbivore', socialStructure: 'herd', speed: 35 } });

  taxonomyEngine.register({ rank: 'family', name: 'Erethizontidae', parentName: 'Rodentia',
    traits: { size: 20, strength: 20, diet: 'herbivore', speed: 15 } });

  taxonomyEngine.register({ rank: 'family', name: 'Chinchillidae', parentName: 'Rodentia',
    traits: { size: 8, speed: 40, diet: 'herbivore', socialStructure: 'colony' } });

  taxonomyEngine.register({ rank: 'family', name: 'Bathyergidae', parentName: 'Rodentia',
    traits: { size: 5, habitat: ['underground'], socialStructure: 'colony', diet: 'herbivore',
      perception: { visualRange: 5, hearingRange: 40, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false } } });

  taxonomyEngine.register({ rank: 'family', name: 'Sciuridae', parentName: 'Rodentia',
    traits: { size: 8, speed: 45, diet: 'herbivore' } });

  taxonomyEngine.register({ rank: 'family', name: 'Dipodidae', parentName: 'Rodentia',
    traits: { size: 5, speed: 50, diet: 'herbivore', nocturnal: true } });

  // Chiroptera new families
  taxonomyEngine.register({ rank: 'family', name: 'Phyllostomidae', parentName: 'Chiroptera',
    traits: { size: 5, diet: 'carnivore', nocturnal: true,
      perception: { visualRange: 15, hearingRange: 92, smellRange: 40, echolocation: true, electroreception: false, thermalSensing: false } } });

  taxonomyEngine.register({ rank: 'family', name: 'Pteropodidae2', parentName: 'Chiroptera',
    traits: { size: 8, diet: 'herbivore', nocturnal: true } });
  // Note: using Pteropodidae which already exists — Egyptian Fruit Bat uses existing family

  // Monotremata new families
  taxonomyEngine.register({ rank: 'family', name: 'Tachyglossidae', parentName: 'Monotremata',
    traits: { size: 18, diet: 'carnivore', socialStructure: 'solitary',
      perception: { visualRange: 20, hearingRange: 35, smellRange: 70, echolocation: false, electroreception: true, thermalSensing: false } } });

  // Marsupial families
  taxonomyEngine.register({ rank: 'family', name: 'Dasyuridae', parentName: 'Dasyuromorphia',
    traits: { size: 20, diet: 'carnivore', strength: 40 } });

  taxonomyEngine.register({ rank: 'family', name: 'Vombatidae', parentName: 'Diprotodontia',
    traits: { size: 30, strength: 50, diet: 'herbivore', habitat: ['underground'] } });

  taxonomyEngine.register({ rank: 'family', name: 'Petauridae', parentName: 'Diprotodontia',
    traits: { size: 8, canFly: false, diet: 'omnivore', socialStructure: 'colony' } });

  // Aardvark
  taxonomyEngine.register({ rank: 'family', name: 'Orycteropodidae', parentName: 'Tubulidentata',
    traits: { size: 40, diet: 'carnivore', nocturnal: true,
      perception: { visualRange: 20, hearingRange: 70, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false } } });

  // ============================================================
  // NEW GENERA
  // ============================================================

  // Cats
  taxonomyEngine.register({ rank: 'genus', name: 'Acinonyx', parentName: 'Felidae', traits: { speed: 95, size: 35, strength: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Neofelis', parentName: 'Felidae', traits: { size: 32, strength: 55, speed: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Lynx', parentName: 'Felidae', traits: { size: 25, speed: 65, strength: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Leopardus', parentName: 'Felidae', traits: { size: 22, speed: 65, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Leptailurus', parentName: 'Felidae', traits: { size: 18, speed: 68, strength: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Caracal', parentName: 'Felidae', traits: { size: 22, speed: 70, strength: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Prionailurus', parentName: 'Felidae', traits: { size: 12, aquatic: true, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Felis2', parentName: 'Felidae', traits: { size: 8, nocturnal: true, speed: 55 } });
  // Sand Cat uses Felis genus (Felis margarita) — already have Felis registered
  taxonomyEngine.register({ rank: 'genus', name: 'Puma', parentName: 'Felidae', traits: { size: 55, strength: 70, speed: 75 } });

  // Dogs
  taxonomyEngine.register({ rank: 'genus', name: 'Lycaon', parentName: 'Canidae', traits: { size: 35, speed: 65, strength: 45, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Canis2', parentName: 'Canidae', traits: { size: 18, speed: 55, diet: 'omnivore' } });
  // Coyote uses Canis latrans — use existing Canis genus
  taxonomyEngine.register({ rank: 'genus', name: 'Urocyon', parentName: 'Canidae', traits: { size: 12, speed: 55, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chrysocyon', parentName: 'Canidae', traits: { size: 28, speed: 60, diet: 'omnivore', socialStructure: 'pair' } });
  // Jackals use Canis genus
  // Fennec uses Vulpes genus (Vulpes zerda) — already have Vulpes

  // Bears
  taxonomyEngine.register({ rank: 'genus', name: 'Helarctos', parentName: 'Ursidae', traits: { size: 50, strength: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tremarctos', parentName: 'Ursidae', traits: { size: 70, strength: 75 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Melursus', parentName: 'Ursidae', traits: { size: 60, strength: 65, diet: 'carnivore' } });

  // Mustelids
  taxonomyEngine.register({ rank: 'genus', name: 'Meles', parentName: 'Mustelidae', traits: { size: 18, strength: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mellivora', parentName: 'Mustelidae', traits: { size: 18, strength: 55, intelligence: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Lontra', parentName: 'Mustelidae', traits: { size: 20, aquatic: true, speed: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Martes', parentName: 'Mustelidae', traits: { size: 15, speed: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mustela', parentName: 'Mustelidae', traits: { size: 6, speed: 45, diet: 'carnivore' } });

  // Primates
  taxonomyEngine.register({ rank: 'genus', name: 'Lemur', parentName: 'Lemuridae', traits: { size: 12, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mandrillus', parentName: 'Cercopithecidae', traits: { size: 30, strength: 60, intelligence: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Nasalis', parentName: 'Cercopithecidae', traits: { size: 22, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tarsius', parentName: 'Tarsiidae', traits: { size: 5, nocturnal: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ateles', parentName: 'Atelidae', traits: { size: 20, speed: 50, intelligence: 40 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Alouatta', parentName: 'Atelidae', traits: { size: 22, intelligence: 35, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Nomascus', parentName: 'Hylobatidae', traits: { size: 18, speed: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pan2', parentName: 'Hominidae', traits: { intelligence: 62, size: 42 } });
  // Bonobo uses Pan paniscus — existing Pan genus works

  // Ungulates
  taxonomyEngine.register({ rank: 'genus', name: 'Odocoileus', parentName: 'Cervidae', traits: { size: 45, speed: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cervus', parentName: 'Cervidae', traits: { size: 65, strength: 60, speed: 65 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Rangifer', parentName: 'Cervidae', traits: { size: 55, strength: 55, speed: 60 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Connochaetes', parentName: 'Bovidae', traits: { size: 65, speed: 65, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Aepyceros', parentName: 'Bovidae', traits: { size: 45, speed: 75 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tragelaphus', parentName: 'Bovidae', traits: { size: 65, strength: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Oreamnos', parentName: 'Bovidae', traits: { size: 45, strength: 55, speed: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Capra', parentName: 'Bovidae', traits: { size: 40, strength: 50, speed: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ovibos', parentName: 'Bovidae', traits: { size: 65, strength: 70, socialStructure: 'herd' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Antilocapra', parentName: 'Antilocapridae', traits: { size: 45, speed: 85 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Phacochoerus', parentName: 'Suidae', traits: { size: 40, strength: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sus', parentName: 'Suidae', traits: { size: 45, strength: 55, intelligence: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Okapia', parentName: 'Giraffidae', traits: { size: 60, speed: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Tapirus', parentName: 'Tapiridae', traits: { size: 60, strength: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Pecari', parentName: 'Tayassuidae', traits: { size: 30, socialStructure: 'pack' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Camelus', parentName: 'Camelidae', traits: { size: 72, strength: 65, intelligence: 22 } });

  // Cetaceans
  taxonomyEngine.register({ rank: 'genus', name: 'Physeter', parentName: 'Physeteridae', traits: { size: 96, strength: 88 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Delphinapterus', parentName: 'Monodontidae', traits: { size: 65, intelligence: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Trichechus', parentName: 'Trichechidae', traits: { size: 65, diet: 'herbivore' } });

  // Pinnipeds
  taxonomyEngine.register({ rank: 'genus', name: 'Phoca', parentName: 'Phocidae', traits: { size: 35 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Hydrurga', parentName: 'Phocidae', traits: { size: 75, strength: 72, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mirounga', parentName: 'Phocidae', traits: { size: 88, strength: 80 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Zalophus', parentName: 'Otariidae', traits: { size: 45, intelligence: 30, speed: 35 } });

  // Carnivora misc
  taxonomyEngine.register({ rank: 'genus', name: 'Crocuta', parentName: 'Hyaenidae', traits: { size: 55, strength: 72, intelligence: 32 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Suricata', parentName: 'Herpestidae', traits: { size: 8, socialStructure: 'colony', intelligence: 28 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Herpestes', parentName: 'Herpestidae', traits: { size: 12, speed: 55 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Mephitis', parentName: 'Mephitidae', traits: { size: 10, strength: 15 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Procyon', parentName: 'Procyonidae', traits: { size: 15, intelligence: 30 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ailurus', parentName: 'Ailuridae', traits: { size: 15, intelligence: 22 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Ailuropoda', parentName: 'Ursidae', traits: { size: 75, diet: 'herbivore', intelligence: 25 } });

  // Rodents
  taxonomyEngine.register({ rank: 'genus', name: 'Hydrochoerus', parentName: 'Caviidae', traits: { size: 35, aquatic: true } });
  taxonomyEngine.register({ rank: 'genus', name: 'Erethizon', parentName: 'Erethizontidae', traits: { size: 18, strength: 20 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Chinchilla', parentName: 'Chinchillidae', traits: { size: 7 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Heterocephalus', parentName: 'Bathyergidae', traits: { size: 4, habitat: ['underground'], socialStructure: 'colony' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Sciurus', parentName: 'Sciuridae', traits: { size: 7, speed: 45 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Cynomys', parentName: 'Sciuridae', traits: { size: 8, socialStructure: 'colony' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Jaculus', parentName: 'Dipodidae', traits: { size: 5, speed: 55, nocturnal: true } });

  // Bats
  taxonomyEngine.register({ rank: 'genus', name: 'Desmodus', parentName: 'Phyllostomidae', traits: { size: 4, nocturnal: true } });

  // Monotremes
  taxonomyEngine.register({ rank: 'genus', name: 'Tachyglossus', parentName: 'Tachyglossidae', traits: { size: 18 } });

  // Marsupials
  taxonomyEngine.register({ rank: 'genus', name: 'Sarcophilus', parentName: 'Dasyuridae', traits: { size: 25, strength: 55, diet: 'carnivore' } });
  taxonomyEngine.register({ rank: 'genus', name: 'Vombatus', parentName: 'Vombatidae', traits: { size: 30, strength: 50 } });
  taxonomyEngine.register({ rank: 'genus', name: 'Petaurus', parentName: 'Petauridae', traits: { size: 8 } });

  // Aardvark
  taxonomyEngine.register({ rank: 'genus', name: 'Orycteropus', parentName: 'Orycteropodidae', traits: { size: 40 } });

  // Tapir — Tapirus already added above

  // ============================================================
  // SPECIES REGISTRATIONS (80+ mammals)
  // ============================================================

  // === FELIDAE (Cats) ===

  speciesRegistry.register({
    commonName: 'Cheetah', scientificName: 'Acinonyx jubatus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Acinonyx', species: 'jubatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1037,     // ~12 years * 86.4
      size: 35, speed: 95, strength: 45, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 7776,   // ~3 months
      maturityTicks: 1300,
      perception: { visualRange: 85, hearingRange: 55, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Jaguar', scientificName: 'Panthera onca',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'onca' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 65, speed: 70, strength: 82, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 8208,   // ~3.2 months
      maturityTicks: 2000,
      nocturnal: true,
      perception: { visualRange: 70, hearingRange: 60, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Cougar', scientificName: 'Puma concolor',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Puma', species: 'concolor' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 55, speed: 75, strength: 72, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 7776,
      maturityTicks: 1800,
      perception: { visualRange: 75, hearingRange: 65, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Eurasian Lynx', scientificName: 'Lynx lynx',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Lynx', species: 'lynx' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1382,     // ~16 years
      size: 25, speed: 65, strength: 45, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5832,   // ~2.25 months
      maturityTicks: 1500,
      nocturnal: true,
      perception: { visualRange: 80, hearingRange: 75, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Ocelot', scientificName: 'Leopardus pardalis',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Leopardus', species: 'pardalis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 18, speed: 65, strength: 38, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 6480,   // ~2.5 months
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 65, hearingRange: 70, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Serval', scientificName: 'Leptailurus serval',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Leptailurus', species: 'serval' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 18, speed: 68, strength: 32, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5832,
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 70, hearingRange: 85, smellRange: 45, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Caracal', scientificName: 'Caracal caracal',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Caracal', species: 'caracal' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1382,     // ~16 years
      size: 22, speed: 70, strength: 40, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5832,
      maturityTicks: 1100,
      nocturnal: true,
      perception: { visualRange: 72, hearingRange: 80, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Clouded Leopard', scientificName: 'Neofelis nebulosa',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Neofelis', species: 'nebulosa' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 32, speed: 60, strength: 58, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 6912,   // ~2.67 months
      maturityTicks: 1400,
      nocturnal: true,
      perception: { visualRange: 68, hearingRange: 65, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Black-footed Cat', scientificName: 'Felis nigripes',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Felis', species: 'nigripes' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 7, speed: 55, strength: 20, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5400,   // ~2.1 months
      maturityTicks: 800,
      nocturnal: true,
      perception: { visualRange: 60, hearingRange: 78, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Fishing Cat', scientificName: 'Prionailurus viverrinus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Prionailurus', species: 'viverrinus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 14, speed: 45, strength: 35, diet: 'carnivore',
      aquatic: true, socialStructure: 'solitary',
      gestationTicks: 5659,   // ~2.2 months
      maturityTicks: 900,
      nocturnal: true,
      perception: { visualRange: 60, hearingRange: 70, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Sand Cat', scientificName: 'Felis margarita',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Felis', species: 'margarita' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 8, speed: 58, strength: 18, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5400,
      maturityTicks: 800,
      nocturnal: true,
      perception: { visualRange: 55, hearingRange: 82, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === CANIDAE (Dogs) ===

  speciesRegistry.register({
    commonName: 'African Wild Dog', scientificName: 'Lycaon pictus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Lycaon', species: 'pictus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 35, speed: 65, strength: 48, diet: 'carnivore',
      socialStructure: 'pack',
      gestationTicks: 5832,   // ~2.25 months
      maturityTicks: 1000,
      perception: { visualRange: 60, hearingRange: 75, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Coyote', scientificName: 'Canis latrans',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'latrans' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 18, speed: 60, strength: 38, diet: 'omnivore',
      socialStructure: 'pack',
      gestationTicks: 5357,   // ~2.07 months
      maturityTicks: 800,
      perception: { visualRange: 50, hearingRange: 72, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Dingo', scientificName: 'Canis lupus dingo',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'dingo' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 22, speed: 62, strength: 42, diet: 'carnivore',
      socialStructure: 'pack',
      gestationTicks: 5529,   // ~2.14 months
      maturityTicks: 900,
      perception: { visualRange: 55, hearingRange: 70, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Fennec Fox', scientificName: 'Vulpes zerda',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Vulpes', species: 'zerda' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 6, speed: 55, strength: 12, diet: 'omnivore',
      socialStructure: 'pair',
      gestationTicks: 4406,   // ~1.7 months
      maturityTicks: 600,
      nocturnal: true,
      perception: { visualRange: 45, hearingRange: 92, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Gray Fox', scientificName: 'Urocyon cinereoargenteus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Urocyon', species: 'cinereoargenteus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 12, speed: 55, strength: 22, diet: 'omnivore',
      socialStructure: 'pair',
      gestationTicks: 4752,   // ~1.83 months
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 50, hearingRange: 70, smellRange: 82, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Black-backed Jackal', scientificName: 'Canis mesomelas',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'mesomelas' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 16, speed: 58, strength: 28, diet: 'omnivore',
      socialStructure: 'pair',
      gestationTicks: 4752,
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 50, hearingRange: 72, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Maned Wolf', scientificName: 'Chrysocyon brachyurus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Chrysocyon', species: 'brachyurus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 28, speed: 60, strength: 38, diet: 'omnivore',
      socialStructure: 'pair',
      gestationTicks: 5529,   // ~2.13 months
      maturityTicks: 1000,
      perception: { visualRange: 55, hearingRange: 75, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === URSIDAE (Bears) ===

  speciesRegistry.register({
    commonName: 'Sun Bear', scientificName: 'Helarctos malayanus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Helarctos', species: 'malayanus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 50, speed: 40, strength: 65, diet: 'omnivore',
      socialStructure: 'solitary',
      gestationTicks: 17280,  // ~6.7 months
      maturityTicks: 2500,
      nocturnal: true,
      perception: { visualRange: 35, hearingRange: 55, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Spectacled Bear', scientificName: 'Tremarctos ornatus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Tremarctos', species: 'ornatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 68, speed: 35, strength: 72, diet: 'omnivore',
      socialStructure: 'solitary',
      gestationTicks: 17280,
      maturityTicks: 2800,
      perception: { visualRange: 38, hearingRange: 52, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Asian Black Bear', scientificName: 'Ursus thibetanus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ursus', species: 'thibetanus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 72, speed: 38, strength: 78, diet: 'omnivore',
      socialStructure: 'solitary',
      gestationTicks: 17280,
      maturityTicks: 2800,
      perception: { visualRange: 35, hearingRange: 55, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Sloth Bear', scientificName: 'Melursus ursinus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Melursus', species: 'ursinus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 62, speed: 32, strength: 68, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 18144,  // ~7 months
      maturityTicks: 2500,
      nocturnal: true,
      perception: { visualRange: 28, hearingRange: 60, smellRange: 92, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Giant Panda', scientificName: 'Ailuropoda melanoleuca',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ailuropoda', species: 'melanoleuca' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 75, speed: 20, strength: 68, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 4320,   // ~1.67 months (variable, implantation delayed)
      maturityTicks: 3000,
      perception: { visualRange: 35, hearingRange: 50, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === MUSTELIDAE ===

  speciesRegistry.register({
    commonName: 'Eurasian Badger', scientificName: 'Meles meles',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Meles', species: 'meles' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 18, speed: 28, strength: 42, diet: 'omnivore',
      socialStructure: 'colony', habitat: ['underground'],
      gestationTicks: 17280,  // delayed implantation — ~7 months total
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 30, hearingRange: 55, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Honey Badger', scientificName: 'Mellivora capensis',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Mellivora', species: 'capensis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years in captivity
      size: 18, speed: 30, strength: 58, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 5400,
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 35, hearingRange: 58, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'North American River Otter', scientificName: 'Lontra canadensis',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Lontra', species: 'canadensis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 20, speed: 40, strength: 35, diet: 'carnivore',
      aquatic: true, socialStructure: 'pair',
      gestationTicks: 15552,  // ~6 months including delayed implantation
      maturityTicks: 1200,
      perception: { visualRange: 50, hearingRange: 60, smellRange: 72, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Pine Marten', scientificName: 'Martes martes',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Martes', species: 'martes' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 12, speed: 48, strength: 28, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 7776,   // ~3 months
      maturityTicks: 1000,
      nocturnal: true,
      perception: { visualRange: 50, hearingRange: 65, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Black-footed Ferret', scientificName: 'Mustela nigripes',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Mustela', species: 'nigripes' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 518,      // ~6 years
      size: 5, speed: 45, strength: 18, diet: 'carnivore',
      socialStructure: 'solitary', habitat: ['underground'],
      gestationTicks: 3110,   // ~1.2 months
      maturityTicks: 500,
      nocturnal: true,
      perception: { visualRange: 45, hearingRange: 70, smellRange: 78, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Stoat', scientificName: 'Mustela erminea',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mustelidae', genus: 'Mustela', species: 'erminea' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,      // ~5 years
      size: 4, speed: 50, strength: 12, diet: 'carnivore',
      socialStructure: 'solitary',
      gestationTicks: 2419,   // ~28 days active gestation (delayed implant)
      maturityTicks: 350,
      nocturnal: false,
      perception: { visualRange: 40, hearingRange: 68, smellRange: 75, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === PRIMATES ===

  speciesRegistry.register({
    commonName: 'Ring-tailed Lemur', scientificName: 'Lemur catta',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Lemuridae', genus: 'Lemur', species: 'catta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1555,     // ~18 years
      size: 12, speed: 38, strength: 15, diet: 'omnivore',
      socialStructure: 'pack', intelligence: 32,
      gestationTicks: 3715,   // ~1.43 months
      maturityTicks: 1200,
      perception: { visualRange: 65, hearingRange: 60, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Mandrill', scientificName: 'Mandrillus sphinx',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Cercopithecidae', genus: 'Mandrillus', species: 'sphinx' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2419,     // ~28 years
      size: 30, speed: 40, strength: 62, diet: 'omnivore',
      socialStructure: 'pack', intelligence: 42,
      gestationTicks: 14256,  // ~5.5 months
      maturityTicks: 2500,
      perception: { visualRange: 72, hearingRange: 55, smellRange: 40, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Proboscis Monkey', scientificName: 'Nasalis larvatus',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Cercopithecidae', genus: 'Nasalis', species: 'larvatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 22, speed: 35, strength: 38, diet: 'herbivore',
      socialStructure: 'pack', intelligence: 35,
      gestationTicks: 15120,  // ~5.8 months
      maturityTicks: 2000,
      perception: { visualRange: 68, hearingRange: 52, smellRange: 35, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Philippine Tarsier', scientificName: 'Tarsius syrichta',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Tarsiidae', genus: 'Tarsius', species: 'syrichta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1037,     // ~12 years
      size: 5, speed: 40, strength: 8, diet: 'carnivore',
      socialStructure: 'pair', intelligence: 25,
      gestationTicks: 4925,   // ~1.9 months
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 75, hearingRange: 80, smellRange: 20, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Black Spider Monkey', scientificName: 'Ateles paniscus',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Atelidae', genus: 'Ateles', species: 'paniscus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 20, speed: 52, strength: 35, diet: 'herbivore',
      socialStructure: 'pack', intelligence: 42,
      gestationTicks: 18144,  // ~7 months
      maturityTicks: 3000,
      perception: { visualRange: 70, hearingRange: 58, smellRange: 30, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Howler Monkey', scientificName: 'Alouatta seniculus',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Atelidae', genus: 'Alouatta', species: 'seniculus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 22, speed: 30, strength: 40, diet: 'herbivore',
      socialStructure: 'pack', intelligence: 35,
      gestationTicks: 15984,  // ~6.17 months
      maturityTicks: 2500,
      perception: { visualRange: 65, hearingRange: 70, smellRange: 28, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Northern White-cheeked Gibbon', scientificName: 'Nomascus leucogenys',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hylobatidae', genus: 'Nomascus', species: 'leucogenys' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2419,     // ~28 years
      size: 18, speed: 55, strength: 38, diet: 'herbivore',
      socialStructure: 'pair', intelligence: 48,
      gestationTicks: 18144,  // ~7 months
      maturityTicks: 3000,
      perception: { visualRange: 68, hearingRange: 60, smellRange: 25, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Bonobo', scientificName: 'Pan paniscus',
    taxonomy: { class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Pan', species: 'paniscus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456,     // ~40 years
      size: 42, speed: 38, strength: 68, diet: 'omnivore',
      socialStructure: 'pack', intelligence: 62,
      gestationTicks: 19872,  // ~7.67 months
      maturityTicks: 4000,
      perception: { visualRange: 70, hearingRange: 55, smellRange: 28, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === UNGULATES ===

  speciesRegistry.register({
    commonName: 'White-tailed Deer', scientificName: 'Odocoileus virginianus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'Odocoileus', species: 'virginianus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 45, speed: 68, strength: 42, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 17856,  // ~6.9 months
      maturityTicks: 1200,
      perception: { visualRange: 68, hearingRange: 75, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Elk', scientificName: 'Cervus canadensis',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'Cervus', species: 'canadensis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 70, speed: 65, strength: 65, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 20736,  // ~8 months
      maturityTicks: 2000,
      perception: { visualRange: 65, hearingRange: 72, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Reindeer', scientificName: 'Rangifer tarandus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Cervidae', genus: 'Rangifer', species: 'tarandus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1382,     // ~16 years
      size: 55, speed: 62, strength: 55, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 19008,  // ~7.33 months
      maturityTicks: 1500,
      perception: { visualRange: 60, hearingRange: 68, smellRange: 82, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Blue Wildebeest', scientificName: 'Connochaetes taurinus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Connochaetes', species: 'taurinus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 65, speed: 65, strength: 58, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 20736,  // ~8 months
      maturityTicks: 2000,
      perception: { visualRange: 62, hearingRange: 65, smellRange: 72, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Impala', scientificName: 'Aepyceros melampus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Aepyceros', species: 'melampus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 42, speed: 75, strength: 40, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 16848,  // ~6.5 months
      maturityTicks: 1200,
      perception: { visualRange: 70, hearingRange: 70, smellRange: 68, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Greater Kudu', scientificName: 'Tragelaphus strepsiceros',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Tragelaphus', species: 'strepsiceros' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 68, speed: 58, strength: 60, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 18576,  // ~7.17 months
      maturityTicks: 2000,
      perception: { visualRange: 68, hearingRange: 72, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Okapi', scientificName: 'Okapia johnstoni',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Giraffidae', genus: 'Okapia', species: 'johnstoni' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1814,     // ~21 years
      size: 60, speed: 50, strength: 55, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 37152,  // ~14.33 months
      maturityTicks: 2200,
      perception: { visualRange: 60, hearingRange: 78, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Pronghorn', scientificName: 'Antilocapra americana',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Antilocapridae', genus: 'Antilocapra', species: 'americana' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1037,     // ~12 years
      size: 45, speed: 88, strength: 45, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 13824,  // ~5.33 months
      maturityTicks: 1000,
      perception: { visualRange: 88, hearingRange: 68, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Mountain Goat', scientificName: 'Oreamnos americanus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Oreamnos', species: 'americanus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 45, speed: 35, strength: 58, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 15984,  // ~6.17 months
      maturityTicks: 2000,
      perception: { visualRange: 70, hearingRange: 62, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Alpine Ibex', scientificName: 'Capra ibex',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Capra', species: 'ibex' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 42, speed: 42, strength: 55, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 15120,  // ~5.83 months
      maturityTicks: 2000,
      perception: { visualRange: 72, hearingRange: 65, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Musk Ox', scientificName: 'Ovibos moschatus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Bovidae', genus: 'Ovibos', species: 'moschatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1728,     // ~20 years
      size: 70, speed: 38, strength: 75, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 21600,  // ~8.33 months
      maturityTicks: 2500,
      perception: { visualRange: 55, hearingRange: 60, smellRange: 75, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Common Warthog', scientificName: 'Phacochoerus africanus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Suidae', genus: 'Phacochoerus', species: 'africanus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 40, speed: 48, strength: 52, diet: 'omnivore',
      socialStructure: 'herd',
      gestationTicks: 14688,  // ~5.67 months
      maturityTicks: 1500,
      perception: { visualRange: 50, hearingRange: 65, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Wild Boar', scientificName: 'Sus scrofa',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Suidae', genus: 'Sus', species: 'scrofa' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 48, speed: 45, strength: 58, diet: 'omnivore',
      socialStructure: 'herd', intelligence: 22,
      gestationTicks: 10108,  // ~3.9 months
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 45, hearingRange: 68, smellRange: 90, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Tapir', scientificName: 'Tapirus terrestris',
    taxonomy: { class: 'Mammalia', order: 'Perissodactyla', family: 'Tapiridae', genus: 'Tapirus', species: 'terrestris' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,     // ~30 years
      size: 60, speed: 35, strength: 58, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 32400,  // ~12.5 months
      maturityTicks: 2500,
      nocturnal: true,
      perception: { visualRange: 35, hearingRange: 65, smellRange: 82, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'African Wild Ass', scientificName: 'Equus africanus',
    taxonomy: { class: 'Mammalia', order: 'Perissodactyla', family: 'Equidae', genus: 'Equus', species: 'africanus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,     // ~30 years
      size: 60, speed: 65, strength: 55, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 31104,  // ~12 months
      maturityTicks: 2000,
      perception: { visualRange: 65, hearingRange: 80, smellRange: 70, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === CETACEA (Marine Mammals) ===

  speciesRegistry.register({
    commonName: 'Sperm Whale', scientificName: 'Physeter macrocephalus',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Physeteridae', genus: 'Physeter', species: 'macrocephalus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 5184,     // ~60 years
      size: 96, speed: 45, strength: 90, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'pack',
      intelligence: 55,
      gestationTicks: 39744,  // ~15.33 months
      maturityTicks: 8000,
      perception: { visualRange: 30, hearingRange: 95, smellRange: 5, echolocation: true, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Beluga Whale', scientificName: 'Delphinapterus leucas',
    taxonomy: { class: 'Mammalia', order: 'Cetacea', family: 'Monodontidae', genus: 'Delphinapterus', species: 'leucas' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456,     // ~40 years
      size: 65, speed: 40, strength: 55, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'pack',
      intelligence: 55,
      gestationTicks: 34560,  // ~13.33 months
      maturityTicks: 4500,
      perception: { visualRange: 35, hearingRange: 95, smellRange: 5, echolocation: true, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'West Indian Manatee', scientificName: 'Trichechus manatus',
    taxonomy: { class: 'Mammalia', order: 'Sirenia', family: 'Trichechidae', genus: 'Trichechus', species: 'manatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 5184,     // ~60 years
      size: 65, speed: 18, strength: 45, diet: 'herbivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'pair',
      gestationTicks: 32400,  // ~12.5 months
      maturityTicks: 4000,
      perception: { visualRange: 25, hearingRange: 65, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === PINNIPEDIA ===

  speciesRegistry.register({
    commonName: 'Harbor Seal', scientificName: 'Phoca vitulina',
    taxonomy: { class: 'Mammalia', order: 'Pinnipedia', family: 'Phocidae', genus: 'Phoca', species: 'vitulina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,     // ~30 years
      size: 35, speed: 38, strength: 40, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'colony',
      gestationTicks: 23328,  // ~9 months
      maturityTicks: 2500,
      perception: { visualRange: 55, hearingRange: 72, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Leopard Seal', scientificName: 'Hydrurga leptonyx',
    taxonomy: { class: 'Mammalia', order: 'Pinnipedia', family: 'Phocidae', genus: 'Hydrurga', species: 'leptonyx' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 75, speed: 50, strength: 75, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'solitary',
      gestationTicks: 23328,  // ~9 months (delayed implantation)
      maturityTicks: 3000,
      perception: { visualRange: 60, hearingRange: 68, smellRange: 50, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Southern Elephant Seal', scientificName: 'Mirounga leonina',
    taxonomy: { class: 'Mammalia', order: 'Pinnipedia', family: 'Phocidae', genus: 'Mirounga', species: 'leonina' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1814,     // ~21 years
      size: 90, speed: 35, strength: 85, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'herd',
      gestationTicks: 28512,  // ~11 months (delayed implantation)
      maturityTicks: 4000,
      perception: { visualRange: 50, hearingRange: 65, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'California Sea Lion', scientificName: 'Zalophus californianus',
    taxonomy: { class: 'Mammalia', order: 'Pinnipedia', family: 'Otariidae', genus: 'Zalophus', species: 'californianus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1814,     // ~21 years
      size: 48, speed: 35, strength: 50, diet: 'carnivore',
      aquatic: true, habitat: ['underwater'], socialStructure: 'herd',
      intelligence: 32,
      gestationTicks: 28512,  // ~11 months (delayed implantation)
      maturityTicks: 3000,
      perception: { visualRange: 58, hearingRange: 68, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === RODENTIA ===

  speciesRegistry.register({
    commonName: 'Capybara', scientificName: 'Hydrochoerus hydrochaeris',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Caviidae', genus: 'Hydrochoerus', species: 'hydrochaeris' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 35, speed: 35, strength: 38, diet: 'herbivore',
      aquatic: true, socialStructure: 'herd',
      gestationTicks: 9504,   // ~3.67 months
      maturityTicks: 1200,
      perception: { visualRange: 50, hearingRange: 60, smellRange: 68, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'North American Porcupine', scientificName: 'Erethizon dorsatum',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Erethizontidae', genus: 'Erethizon', species: 'dorsatum' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 18, speed: 15, strength: 22, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 16848,  // ~6.5 months
      maturityTicks: 1200,
      nocturnal: true,
      perception: { visualRange: 25, hearingRange: 55, smellRange: 75, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Chinchilla', scientificName: 'Chinchilla lanigera',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Chinchillidae', genus: 'Chinchilla', species: 'lanigera' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 7, speed: 42, strength: 10, diet: 'herbivore',
      socialStructure: 'colony',
      gestationTicks: 9158,   // ~3.53 months
      maturityTicks: 600,
      nocturnal: true,
      perception: { visualRange: 48, hearingRange: 80, smellRange: 55, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Naked Mole Rat', scientificName: 'Heterocephalus glaber',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Bathyergidae', genus: 'Heterocephalus', species: 'glaber' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2592,     // ~30 years (exceptional longevity)
      size: 4, speed: 15, strength: 10, diet: 'herbivore',
      habitat: ['underground'], socialStructure: 'colony',
      gestationTicks: 2419,   // ~28 days
      maturityTicks: 400,
      nocturnal: false,
      perception: { visualRange: 5, hearingRange: 40, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Eastern Gray Squirrel', scientificName: 'Sciurus carolinensis',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Sciuridae', genus: 'Sciurus', species: 'carolinensis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1037,     // ~12 years
      size: 7, speed: 48, strength: 10, diet: 'herbivore',
      socialStructure: 'solitary',
      reproductionRate: 4,
      gestationTicks: 1296,   // ~15 days
      maturityTicks: 400,
      perception: { visualRange: 62, hearingRange: 60, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Black-tailed Prairie Dog', scientificName: 'Cynomys ludovicianus',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Sciuridae', genus: 'Cynomys', species: 'ludovicianus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,      // ~5 years in wild
      size: 8, speed: 38, strength: 12, diet: 'herbivore',
      habitat: ['underground'], socialStructure: 'colony',
      reproductionRate: 4,
      gestationTicks: 2851,   // ~33 days
      maturityTicks: 500,
      perception: { visualRange: 65, hearingRange: 65, smellRange: 58, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Greater Egyptian Jerboa', scientificName: 'Jaculus orientalis',
    taxonomy: { class: 'Mammalia', order: 'Rodentia', family: 'Dipodidae', genus: 'Jaculus', species: 'orientalis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 432,      // ~5 years
      size: 5, speed: 55, strength: 6, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 1728,   // ~20 days
      maturityTicks: 350,
      nocturnal: true,
      perception: { visualRange: 50, hearingRange: 82, smellRange: 60, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === CHIROPTERA (Bats) ===

  speciesRegistry.register({
    commonName: 'Common Vampire Bat', scientificName: 'Desmodus rotundus',
    taxonomy: { class: 'Mammalia', order: 'Chiroptera', family: 'Phyllostomidae', genus: 'Desmodus', species: 'rotundus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1555,     // ~18 years
      size: 4, speed: 30, strength: 8, diet: 'carnivore',
      canFly: true, nocturnal: true, socialStructure: 'colony',
      gestationTicks: 5529,   // ~2.13 months
      maturityTicks: 600,
      perception: { visualRange: 18, hearingRange: 92, smellRange: 42, echolocation: true, electroreception: false, thermalSensing: true },
    },
  });

  speciesRegistry.register({
    commonName: 'Egyptian Fruit Bat', scientificName: 'Rousettus aegyptiacus',
    taxonomy: { class: 'Mammalia', order: 'Chiroptera', family: 'Pteropodidae', genus: 'Rousettus', species: 'aegyptiacus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 6, speed: 35, strength: 10, diet: 'herbivore',
      canFly: true, nocturnal: true, socialStructure: 'colony',
      gestationTicks: 5529,   // ~2.13 months
      maturityTicks: 700,
      perception: { visualRange: 45, hearingRange: 88, smellRange: 38, echolocation: true, electroreception: false, thermalSensing: false },
    },
  });

  // === CARNIVORA — MISCELLANEOUS ===

  speciesRegistry.register({
    commonName: 'Spotted Hyena', scientificName: 'Crocuta crocuta',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Hyaenidae', genus: 'Crocuta', species: 'crocuta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 55, speed: 55, strength: 75, diet: 'carnivore',
      socialStructure: 'pack', intelligence: 32,
      gestationTicks: 9331,   // ~3.6 months
      maturityTicks: 2000,
      perception: { visualRange: 42, hearingRange: 68, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Meerkat', scientificName: 'Suricata suricatta',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Herpestidae', genus: 'Suricata', species: 'suricatta' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 8, speed: 32, strength: 12, diet: 'carnivore',
      socialStructure: 'colony', intelligence: 30,
      reproductionRate: 3,
      gestationTicks: 5616,   // ~11 weeks
      maturityTicks: 700,
      perception: { visualRange: 75, hearingRange: 65, smellRange: 58, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Indian Mongoose', scientificName: 'Herpestes javanicus',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Herpestidae', genus: 'Herpestes', species: 'javanicus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 10, speed: 55, strength: 20, diet: 'carnivore',
      socialStructure: 'pack',
      reproductionRate: 3,
      gestationTicks: 4406,   // ~1.7 months
      maturityTicks: 600,
      perception: { visualRange: 60, hearingRange: 65, smellRange: 72, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Striped Skunk', scientificName: 'Mephitis mephitis',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Mephitidae', genus: 'Mephitis', species: 'mephitis' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 518,      // ~6 years
      size: 10, speed: 20, strength: 15, diet: 'omnivore',
      socialStructure: 'solitary',
      gestationTicks: 5529,   // ~2.13 months
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 25, hearingRange: 50, smellRange: 78, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Raccoon', scientificName: 'Procyon lotor',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Procyonidae', genus: 'Procyon', species: 'lotor' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1037,     // ~12 years
      size: 15, speed: 25, strength: 22, diet: 'omnivore',
      socialStructure: 'pair', intelligence: 30,
      reproductionRate: 4,
      gestationTicks: 5529,   // ~2.13 months
      maturityTicks: 800,
      nocturnal: true,
      perception: { visualRange: 40, hearingRange: 65, smellRange: 72, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Red Panda', scientificName: 'Ailurus fulgens',
    taxonomy: { class: 'Mammalia', order: 'Carnivora', family: 'Ailuridae', genus: 'Ailurus', species: 'fulgens' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1123,     // ~13 years
      size: 15, speed: 28, strength: 20, diet: 'herbivore',
      socialStructure: 'solitary',
      gestationTicks: 11232,  // ~4.33 months (variable)
      maturityTicks: 1500,
      nocturnal: true,
      perception: { visualRange: 50, hearingRange: 60, smellRange: 65, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === MARSUPIALS ===

  speciesRegistry.register({
    commonName: 'Tasmanian Devil', scientificName: 'Sarcophilus harrisii',
    taxonomy: { class: 'Mammalia', order: 'Dasyuromorphia', family: 'Dasyuridae', genus: 'Sarcophilus', species: 'harrisii' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 518,      // ~6 years
      size: 25, speed: 25, strength: 58, diet: 'carnivore',
      socialStructure: 'solitary',
      reproductionRate: 4,
      gestationTicks: 576,    // ~21 days gestation (marsupial)
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 28, hearingRange: 62, smellRange: 88, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Common Wombat', scientificName: 'Vombatus ursinus',
    taxonomy: { class: 'Mammalia', order: 'Diprotodontia', family: 'Vombatidae', genus: 'Vombatus', species: 'ursinus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 2160,     // ~25 years
      size: 30, speed: 35, strength: 52, diet: 'herbivore',
      habitat: ['underground'], socialStructure: 'solitary',
      gestationTicks: 900,    // ~26 days (marsupial)
      maturityTicks: 1500,
      nocturnal: true,
      perception: { visualRange: 25, hearingRange: 62, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Sugar Glider', scientificName: 'Petaurus breviceps',
    taxonomy: { class: 'Mammalia', order: 'Diprotodontia', family: 'Petauridae', genus: 'Petaurus', species: 'breviceps' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1296,     // ~15 years
      size: 8, speed: 35, strength: 8, diet: 'omnivore',
      socialStructure: 'colony',
      gestationTicks: 480,    // ~16 days (marsupial)
      maturityTicks: 700,
      nocturnal: true,
      perception: { visualRange: 55, hearingRange: 72, smellRange: 52, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === MONOTREMATA ===

  speciesRegistry.register({
    commonName: 'Short-beaked Echidna', scientificName: 'Tachyglossus aculeatus',
    taxonomy: { class: 'Mammalia', order: 'Monotremata', family: 'Tachyglossidae', genus: 'Tachyglossus', species: 'aculeatus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 4320,     // ~50 years
      size: 18, speed: 15, strength: 30, diet: 'carnivore',
      socialStructure: 'solitary',
      reproductionRate: 1,
      gestationTicks: 1555,   // ~18 days egg incubation
      maturityTicks: 1800,
      nocturnal: true,
      perception: { visualRange: 20, hearingRange: 35, smellRange: 72, echolocation: false, electroreception: true, thermalSensing: false },
    },
  });

  // === TAYASSUIDAE ===

  speciesRegistry.register({
    commonName: 'Collared Peccary', scientificName: 'Pecari tajacu',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Tayassuidae', genus: 'Pecari', species: 'tajacu' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 864,      // ~10 years
      size: 28, speed: 38, strength: 40, diet: 'omnivore',
      socialStructure: 'pack',
      gestationTicks: 11232,  // ~4.33 months
      maturityTicks: 1000,
      nocturnal: false,
      perception: { visualRange: 42, hearingRange: 62, smellRange: 80, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  speciesRegistry.register({
    commonName: 'Bactrian Camel', scientificName: 'Camelus bactrianus',
    taxonomy: { class: 'Mammalia', order: 'Artiodactyla', family: 'Camelidae', genus: 'Camelus', species: 'bactrianus' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 3456,     // ~40 years
      size: 72, speed: 55, strength: 65, diet: 'herbivore',
      socialStructure: 'herd',
      gestationTicks: 34560,  // ~13.33 months
      maturityTicks: 3000,
      perception: { visualRange: 60, hearingRange: 65, smellRange: 75, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

  // === TUBULIDENTATA ===

  speciesRegistry.register({
    commonName: 'Aardvark', scientificName: 'Orycteropus afer',
    taxonomy: { class: 'Mammalia', order: 'Tubulidentata', family: 'Orycteropodidae', genus: 'Orycteropus', species: 'afer' },
    tier: 'notable',
    traitOverrides: {
      lifespan: 1814,     // ~21 years
      size: 40, speed: 20, strength: 45, diet: 'carnivore',
      socialStructure: 'solitary', habitat: ['underground'],
      reproductionRate: 1,
      gestationTicks: 18576,  // ~7.17 months
      maturityTicks: 1800,
      nocturnal: true,
      perception: { visualRange: 18, hearingRange: 72, smellRange: 85, echolocation: false, electroreception: false, thermalSensing: false },
    },
  });

}
