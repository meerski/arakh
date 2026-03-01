// ============================================================
// Real Earth Region Seed Data
// 200+ regions across surface, underwater, and underground
// ============================================================

import type { World, Region, Biome, WorldLayer } from '../../types.js';
import { createRegion, addRegionConnection } from '../../simulation/world.js';
import { getDefaultPlants } from '../../simulation/plants.js';

interface RegionSeed {
  name: string;
  layer: WorldLayer;
  biome: Biome;
  latitude: number;
  longitude: number;
  elevation: number;
  resources: string[];
}

// ============================================================
// SURFACE REGIONS (~130)
// ============================================================
const SURFACE_REGIONS: RegionSeed[] = [
  // ---- Africa (12) ----
  { name: 'Sahara Desert', layer: 'surface', biome: 'desert', latitude: 23, longitude: 10, elevation: 400, resources: ['sand', 'iron_ore', 'copper'] },
  { name: 'Congo Rainforest', layer: 'surface', biome: 'tropical_rainforest', latitude: 0, longitude: 22, elevation: 400, resources: ['tropical_fruit', 'hardwood', 'rubber'] },
  { name: 'East African Savanna', layer: 'surface', biome: 'savanna', latitude: -2, longitude: 35, elevation: 1200, resources: ['grass', 'acacia_wood', 'fresh_water'] },
  { name: 'Kalahari Desert', layer: 'surface', biome: 'desert', latitude: -24, longitude: 22, elevation: 900, resources: ['diamond', 'sand', 'tubers'] },
  { name: 'Ethiopian Highlands', layer: 'surface', biome: 'mountain', latitude: 9, longitude: 39, elevation: 3000, resources: ['coffee', 'fresh_water', 'obsidian'] },
  { name: 'West African Coast', layer: 'surface', biome: 'coastal', latitude: 6, longitude: -2, elevation: 20, resources: ['palm_oil', 'cacao', 'tropical_fish'] },
  { name: 'Nile Delta', layer: 'surface', biome: 'wetland', latitude: 31, longitude: 31, elevation: 5, resources: ['papyrus', 'tilapia', 'silt'] },
  { name: 'Madagascar', layer: 'surface', biome: 'tropical_rainforest', latitude: -19, longitude: 47, elevation: 800, resources: ['vanilla', 'rosewood', 'sapphire'] },
  { name: 'Sahel', layer: 'surface', biome: 'savanna', latitude: 14, longitude: 0, elevation: 300, resources: ['millet', 'gum_arabic', 'shea_butter'] },
  { name: 'Atlas Mountains', layer: 'surface', biome: 'mountain', latitude: 33, longitude: -2, elevation: 3200, resources: ['cedar_wood', 'phosphate', 'argan_oil'] },
  { name: 'Great Rift Valley', layer: 'surface', biome: 'savanna', latitude: -3, longitude: 36, elevation: 600, resources: ['soda_ash', 'obsidian', 'fresh_water'] },
  { name: 'Zanzibar Coast', layer: 'surface', biome: 'coastal', latitude: -6, longitude: 39, elevation: 10, resources: ['cloves', 'coconut', 'coral'] },

  // ---- Europe (14) ----
  { name: 'Central European Forest', layer: 'surface', biome: 'temperate_forest', latitude: 50, longitude: 12, elevation: 400, resources: ['oak_wood', 'deer', 'mushrooms'] },
  { name: 'Mediterranean Coast', layer: 'surface', biome: 'coastal', latitude: 41, longitude: 14, elevation: 50, resources: ['olive', 'grape', 'fish'] },
  { name: 'Scandinavian Boreal', layer: 'surface', biome: 'boreal_forest', latitude: 63, longitude: 15, elevation: 400, resources: ['pine_wood', 'berries', 'iron_ore'] },
  { name: 'British Isles', layer: 'surface', biome: 'temperate_forest', latitude: 53, longitude: -2, elevation: 200, resources: ['oak_wood', 'coal', 'wool'] },
  { name: 'Iberian Peninsula', layer: 'surface', biome: 'grassland', latitude: 40, longitude: -4, elevation: 600, resources: ['cork', 'olive', 'iron_ore'] },
  { name: 'Alpine Mountains', layer: 'surface', biome: 'mountain', latitude: 47, longitude: 10, elevation: 3000, resources: ['granite', 'edelweiss', 'fresh_water'] },
  { name: 'Balkan Forests', layer: 'surface', biome: 'temperate_forest', latitude: 43, longitude: 21, elevation: 600, resources: ['beech_wood', 'plum', 'copper'] },
  { name: 'Ukrainian Steppe', layer: 'surface', biome: 'grassland', latitude: 49, longitude: 33, elevation: 200, resources: ['wheat', 'sunflower', 'chernozem'] },
  { name: 'Icelandic Highlands', layer: 'surface', biome: 'tundra', latitude: 65, longitude: -18, elevation: 500, resources: ['basalt', 'geothermal_energy', 'moss'] },
  { name: 'Carpathian Mountains', layer: 'surface', biome: 'mountain', latitude: 48, longitude: 24, elevation: 2500, resources: ['spruce_wood', 'wolf_fur', 'salt'] },
  { name: 'Polish Lowlands', layer: 'surface', biome: 'temperate_forest', latitude: 52, longitude: 20, elevation: 100, resources: ['amber', 'rye', 'birch_wood'] },
  { name: 'Scottish Highlands', layer: 'surface', biome: 'grassland', latitude: 57, longitude: -5, elevation: 600, resources: ['peat', 'salmon', 'heather'] },
  { name: 'Finnish Lakeland', layer: 'surface', biome: 'boreal_forest', latitude: 62, longitude: 27, elevation: 150, resources: ['birch_wood', 'pike', 'fresh_water'] },
  { name: 'Aegean Coast', layer: 'surface', biome: 'coastal', latitude: 38, longitude: 25, elevation: 30, resources: ['olive', 'sponge', 'marble'] },

  // ---- Asia (22) ----
  { name: 'Siberian Taiga', layer: 'surface', biome: 'boreal_forest', latitude: 60, longitude: 90, elevation: 300, resources: ['pine_wood', 'fur', 'iron_ore'] },
  { name: 'Himalayan Mountains', layer: 'surface', biome: 'mountain', latitude: 28, longitude: 85, elevation: 5500, resources: ['fresh_water', 'medicinal_herbs', 'salt'] },
  { name: 'Mongolian Steppe', layer: 'surface', biome: 'grassland', latitude: 47, longitude: 105, elevation: 1500, resources: ['grass', 'horse_milk', 'iron_ore'] },
  { name: 'Southeast Asian Jungle', layer: 'surface', biome: 'tropical_rainforest', latitude: 5, longitude: 110, elevation: 200, resources: ['bamboo', 'rice', 'spices'] },
  { name: 'Japanese Islands', layer: 'surface', biome: 'temperate_forest', latitude: 36, longitude: 138, elevation: 500, resources: ['bamboo', 'fish', 'cedar_wood'] },
  { name: 'Indian Subcontinent', layer: 'surface', biome: 'tropical_rainforest', latitude: 20, longitude: 78, elevation: 400, resources: ['spices', 'cotton', 'rice'] },
  { name: 'Arabian Desert', layer: 'surface', biome: 'desert', latitude: 24, longitude: 45, elevation: 500, resources: ['oil', 'sand', 'date_palm'] },
  { name: 'Gobi Desert', layer: 'surface', biome: 'desert', latitude: 43, longitude: 105, elevation: 1000, resources: ['sand', 'dinosaur_fossils', 'copper'] },
  { name: 'Tibetan Plateau', layer: 'surface', biome: 'tundra', latitude: 33, longitude: 88, elevation: 4500, resources: ['yak_wool', 'barley', 'lithium'] },
  { name: 'Korean Peninsula', layer: 'surface', biome: 'temperate_forest', latitude: 37, longitude: 127, elevation: 300, resources: ['ginseng', 'pine_wood', 'iron_ore'] },
  { name: 'Philippine Islands', layer: 'surface', biome: 'tropical_rainforest', latitude: 12, longitude: 122, elevation: 300, resources: ['coconut', 'mahogany', 'nickel'] },
  { name: 'Borneo Jungle', layer: 'surface', biome: 'tropical_rainforest', latitude: 1, longitude: 114, elevation: 200, resources: ['palm_oil', 'ironwood', 'pitcher_plant'] },
  { name: 'Mekong Delta', layer: 'surface', biome: 'wetland', latitude: 10, longitude: 106, elevation: 5, resources: ['rice', 'catfish', 'lotus'] },
  { name: 'Kamchatka Peninsula', layer: 'surface', biome: 'boreal_forest', latitude: 55, longitude: 160, elevation: 1200, resources: ['salmon', 'obsidian', 'geothermal_energy'] },
  { name: 'Central Asian Steppe', layer: 'surface', biome: 'grassland', latitude: 42, longitude: 65, elevation: 300, resources: ['wheat', 'cotton', 'natural_gas'] },
  { name: 'Iranian Plateau', layer: 'surface', biome: 'desert', latitude: 33, longitude: 53, elevation: 1200, resources: ['pistachio', 'saffron', 'turquoise'] },
  { name: 'Sri Lanka', layer: 'surface', biome: 'tropical_rainforest', latitude: 7, longitude: 81, elevation: 500, resources: ['tea', 'cinnamon', 'sapphire'] },
  { name: 'Caucasus Mountains', layer: 'surface', biome: 'mountain', latitude: 42, longitude: 44, elevation: 4200, resources: ['walnut_wood', 'obsidian', 'fresh_water'] },
  { name: 'Ural Mountains', layer: 'surface', biome: 'mountain', latitude: 56, longitude: 59, elevation: 1600, resources: ['malachite', 'platinum', 'emerald'] },
  { name: 'Yangtze River Valley', layer: 'surface', biome: 'wetland', latitude: 30, longitude: 112, elevation: 50, resources: ['rice', 'silk', 'bamboo'] },
  { name: 'Bengal Delta', layer: 'surface', biome: 'wetland', latitude: 22, longitude: 89, elevation: 10, resources: ['jute', 'rice', 'hilsa_fish'] },
  { name: 'Deccan Plateau', layer: 'surface', biome: 'savanna', latitude: 17, longitude: 77, elevation: 600, resources: ['cotton', 'sugarcane', 'basalt'] },

  // ---- North America (17) ----
  { name: 'Great Plains', layer: 'surface', biome: 'grassland', latitude: 40, longitude: -100, elevation: 500, resources: ['grass', 'bison', 'wheat'] },
  { name: 'Pacific Northwest', layer: 'surface', biome: 'temperate_forest', latitude: 47, longitude: -122, elevation: 200, resources: ['salmon', 'cedar_wood', 'berries'] },
  { name: 'Rocky Mountains', layer: 'surface', biome: 'mountain', latitude: 40, longitude: -106, elevation: 3500, resources: ['gold', 'silver', 'fresh_water'] },
  { name: 'Sonoran Desert', layer: 'surface', biome: 'desert', latitude: 32, longitude: -112, elevation: 600, resources: ['cactus_fruit', 'copper', 'sand'] },
  { name: 'Eastern Deciduous Forest', layer: 'surface', biome: 'temperate_forest', latitude: 38, longitude: -80, elevation: 300, resources: ['maple_wood', 'deer', 'corn'] },
  { name: 'Canadian Tundra', layer: 'surface', biome: 'tundra', latitude: 65, longitude: -100, elevation: 200, resources: ['lichen', 'caribou', 'fresh_water'] },
  { name: 'Central American Jungle', layer: 'surface', biome: 'tropical_rainforest', latitude: 15, longitude: -88, elevation: 300, resources: ['cacao', 'jade', 'tropical_fruit'] },
  { name: 'Alaskan Wilderness', layer: 'surface', biome: 'boreal_forest', latitude: 64, longitude: -150, elevation: 500, resources: ['salmon', 'spruce_wood', 'gold'] },
  { name: 'Hawaiian Islands', layer: 'surface', biome: 'tropical_rainforest', latitude: 20, longitude: -156, elevation: 800, resources: ['pineapple', 'taro', 'sandalwood'] },
  { name: 'Florida Everglades', layer: 'surface', biome: 'wetland', latitude: 26, longitude: -81, elevation: 2, resources: ['sawgrass', 'alligator', 'mangrove'] },
  { name: 'Appalachian Mountains', layer: 'surface', biome: 'mountain', latitude: 37, longitude: -81, elevation: 1800, resources: ['coal', 'ginseng', 'chestnut'] },
  { name: 'Great Lakes Region', layer: 'surface', biome: 'temperate_forest', latitude: 44, longitude: -84, elevation: 200, resources: ['walleye', 'maple_wood', 'fresh_water'] },
  { name: 'Mexican Highlands', layer: 'surface', biome: 'grassland', latitude: 22, longitude: -102, elevation: 2000, resources: ['agave', 'silver', 'obsidian'] },
  { name: 'Caribbean Islands', layer: 'surface', biome: 'coastal', latitude: 18, longitude: -72, elevation: 100, resources: ['sugarcane', 'rum', 'tropical_fruit'] },
  { name: 'Baja California', layer: 'surface', biome: 'desert', latitude: 28, longitude: -113, elevation: 300, resources: ['salt', 'abalone', 'cactus_fruit'] },
  { name: 'Hudson Bay Lowlands', layer: 'surface', biome: 'wetland', latitude: 56, longitude: -85, elevation: 50, resources: ['peat', 'caribou', 'cranberry'] },
  { name: 'Mississippi Delta', layer: 'surface', biome: 'wetland', latitude: 29, longitude: -89, elevation: 2, resources: ['crawfish', 'catfish', 'cypress_wood'] },

  // ---- South America (11) ----
  { name: 'Amazon Rainforest', layer: 'surface', biome: 'tropical_rainforest', latitude: -3, longitude: -60, elevation: 100, resources: ['rubber', 'tropical_fruit', 'hardwood'] },
  { name: 'Andes Mountains', layer: 'surface', biome: 'mountain', latitude: -15, longitude: -70, elevation: 4000, resources: ['potatoes', 'llama_wool', 'silver'] },
  { name: 'Patagonian Steppe', layer: 'surface', biome: 'grassland', latitude: -45, longitude: -69, elevation: 500, resources: ['grass', 'guanaco', 'wind'] },
  { name: 'Pantanal Wetlands', layer: 'surface', biome: 'wetland', latitude: -18, longitude: -57, elevation: 100, resources: ['fish', 'fresh_water', 'caiman'] },
  { name: 'Brazilian Cerrado', layer: 'surface', biome: 'savanna', latitude: -15, longitude: -47, elevation: 1000, resources: ['soy', 'pequi_fruit', 'bauxite'] },
  { name: 'Atacama Desert', layer: 'surface', biome: 'desert', latitude: -24, longitude: -69, elevation: 2400, resources: ['lithium', 'copper', 'nitrate'] },
  { name: 'Orinoco Delta', layer: 'surface', biome: 'wetland', latitude: 9, longitude: -62, elevation: 5, resources: ['palm_heart', 'piranha', 'mangrove'] },
  { name: 'Galapagos Islands', layer: 'surface', biome: 'coastal', latitude: -1, longitude: -90, elevation: 300, resources: ['giant_tortoise', 'marine_iguana', 'volcanic_rock'] },
  { name: 'Chilean Fjords', layer: 'surface', biome: 'coastal', latitude: -46, longitude: -74, elevation: 50, resources: ['salmon', 'mussel', 'beech_wood'] },
  { name: 'Gran Chaco', layer: 'surface', biome: 'savanna', latitude: -22, longitude: -60, elevation: 200, resources: ['quebracho_wood', 'honey', 'cotton'] },
  { name: 'Guiana Shield', layer: 'surface', biome: 'tropical_rainforest', latitude: 4, longitude: -60, elevation: 800, resources: ['bauxite', 'gold', 'orchid'] },

  // ---- Oceania (8) ----
  { name: 'Australian Outback', layer: 'surface', biome: 'desert', latitude: -25, longitude: 135, elevation: 400, resources: ['eucalyptus', 'iron_ore', 'opals'] },
  { name: 'Australian Rainforest', layer: 'surface', biome: 'tropical_rainforest', latitude: -16, longitude: 145, elevation: 200, resources: ['eucalyptus', 'tropical_fruit', 'hardwood'] },
  { name: 'New Zealand Temperate', layer: 'surface', biome: 'temperate_forest', latitude: -42, longitude: 172, elevation: 500, resources: ['fern', 'jade', 'fresh_water'] },
  { name: 'Tasmanian Wilderness', layer: 'surface', biome: 'temperate_forest', latitude: -42, longitude: 146, elevation: 600, resources: ['huon_pine', 'trout', 'tin'] },
  { name: 'Papua New Guinea Highlands', layer: 'surface', biome: 'tropical_rainforest', latitude: -6, longitude: 145, elevation: 2500, resources: ['sweet_potato', 'bird_of_paradise', 'gold'] },
  { name: 'Fiji Islands', layer: 'surface', biome: 'coastal', latitude: -18, longitude: 178, elevation: 200, resources: ['coconut', 'kava', 'sugarcane'] },
  { name: 'Polynesian Islands', layer: 'surface', biome: 'coastal', latitude: -17, longitude: -150, elevation: 50, resources: ['breadfruit', 'coconut', 'pearl'] },
  { name: 'Micronesian Atolls', layer: 'surface', biome: 'coastal', latitude: 7, longitude: 150, elevation: 5, resources: ['copra', 'tuna', 'pandanus'] },

  // ---- Polar (6) ----
  { name: 'Arctic Tundra', layer: 'surface', biome: 'tundra', latitude: 75, longitude: 0, elevation: 50, resources: ['lichen', 'seal', 'fresh_water'] },
  { name: 'Antarctic Ice', layer: 'surface', biome: 'tundra', latitude: -80, longitude: 0, elevation: 2000, resources: ['fish', 'krill', 'fresh_water'] },
  { name: 'Svalbard', layer: 'surface', biome: 'tundra', latitude: 78, longitude: 16, elevation: 400, resources: ['coal', 'arctic_fox_fur', 'lichen'] },
  { name: 'Greenland Ice Sheet', layer: 'surface', biome: 'tundra', latitude: 72, longitude: -40, elevation: 2500, resources: ['cryolite', 'seal', 'fresh_water'] },
  { name: 'Antarctic Peninsula', layer: 'surface', biome: 'tundra', latitude: -67, longitude: -60, elevation: 500, resources: ['krill', 'penguin_guano', 'moss'] },
  { name: 'Sub-Antarctic Islands', layer: 'surface', biome: 'tundra', latitude: -54, longitude: -38, elevation: 300, resources: ['albatross_feather', 'seal', 'kelp'] },

  // ---- Additional Africa (5) ----
  { name: 'Niger River Basin', layer: 'surface', biome: 'wetland', latitude: 12, longitude: 3, elevation: 200, resources: ['rice', 'shea_butter', 'catfish'] },
  { name: 'Namib Desert', layer: 'surface', biome: 'desert', latitude: -24, longitude: 15, elevation: 500, resources: ['uranium', 'welwitschia', 'diamond'] },
  { name: 'Mozambique Coast', layer: 'surface', biome: 'coastal', latitude: -15, longitude: 40, elevation: 10, resources: ['cashew', 'prawn', 'mangrove'] },
  { name: 'Cameroon Highlands', layer: 'surface', biome: 'mountain', latitude: 6, longitude: 10, elevation: 2500, resources: ['volcanic_soil', 'coffee', 'palm_oil'] },
  { name: 'Okavango Delta', layer: 'surface', biome: 'wetland', latitude: -20, longitude: 23, elevation: 950, resources: ['papyrus', 'tilapia', 'fresh_water'] },

  // ---- Additional Europe (4) ----
  { name: 'Danube Delta', layer: 'surface', biome: 'wetland', latitude: 45, longitude: 29, elevation: 2, resources: ['sturgeon', 'reed', 'pelican_feather'] },
  { name: 'Corsican Maquis', layer: 'surface', biome: 'coastal', latitude: 42, longitude: 9, elevation: 400, resources: ['chestnut', 'cork', 'wild_boar'] },
  { name: 'Azores Islands', layer: 'surface', biome: 'coastal', latitude: 38, longitude: -28, elevation: 500, resources: ['pineapple', 'whale_bone', 'basalt'] },
  { name: 'Baltic Coast', layer: 'surface', biome: 'coastal', latitude: 55, longitude: 18, elevation: 10, resources: ['amber', 'herring', 'pine_wood'] },

  // ---- Additional Asia (8) ----
  { name: 'Hokkaido', layer: 'surface', biome: 'boreal_forest', latitude: 43, longitude: 143, elevation: 400, resources: ['salmon', 'kelp', 'volcanic_ash'] },
  { name: 'Thar Desert', layer: 'surface', biome: 'desert', latitude: 27, longitude: 71, elevation: 200, resources: ['sandstone', 'guar_gum', 'marble'] },
  { name: 'Sichuan Basin', layer: 'surface', biome: 'temperate_forest', latitude: 30, longitude: 104, elevation: 500, resources: ['bamboo', 'tea', 'natural_gas'] },
  { name: 'Malay Peninsula', layer: 'surface', biome: 'tropical_rainforest', latitude: 4, longitude: 102, elevation: 100, resources: ['rubber', 'tin', 'palm_oil'] },
  { name: 'Lena River Basin', layer: 'surface', biome: 'boreal_forest', latitude: 65, longitude: 125, elevation: 200, resources: ['diamond', 'mammoth_ivory', 'fur'] },
  { name: 'Sumatra', layer: 'surface', biome: 'tropical_rainforest', latitude: -1, longitude: 102, elevation: 400, resources: ['coffee', 'palm_oil', 'sulfur'] },
  { name: 'Taiwan', layer: 'surface', biome: 'tropical_rainforest', latitude: 24, longitude: 121, elevation: 1000, resources: ['camphor', 'jade', 'tea'] },
  { name: 'Aral Sea Basin', layer: 'surface', biome: 'desert', latitude: 45, longitude: 59, elevation: 50, resources: ['salt', 'cotton', 'natural_gas'] },

  // ---- Additional North America (6) ----
  { name: 'Ozark Plateau', layer: 'surface', biome: 'temperate_forest', latitude: 36, longitude: -93, elevation: 500, resources: ['oak_wood', 'zinc', 'freshwater_mussel'] },
  { name: 'Mojave Desert', layer: 'surface', biome: 'desert', latitude: 35, longitude: -116, elevation: 700, resources: ['borax', 'joshua_tree', 'silver'] },
  { name: 'Newfoundland Coast', layer: 'surface', biome: 'coastal', latitude: 48, longitude: -54, elevation: 100, resources: ['cod', 'seal', 'peat'] },
  { name: 'Yucatan Peninsula', layer: 'surface', biome: 'tropical_rainforest', latitude: 20, longitude: -89, elevation: 50, resources: ['sisal', 'honey', 'limestone'] },
  { name: 'Sierra Madre', layer: 'surface', biome: 'mountain', latitude: 25, longitude: -105, elevation: 2800, resources: ['silver', 'pine_wood', 'agave'] },
  { name: 'Labrador', layer: 'surface', biome: 'boreal_forest', latitude: 54, longitude: -60, elevation: 500, resources: ['iron_ore', 'caribou', 'spruce_wood'] },

  // ---- Additional South America (5) ----
  { name: 'Pampas', layer: 'surface', biome: 'grassland', latitude: -35, longitude: -62, elevation: 100, resources: ['wheat', 'beef', 'sunflower'] },
  { name: 'Caatinga', layer: 'surface', biome: 'savanna', latitude: -10, longitude: -39, elevation: 400, resources: ['carnauba_wax', 'cactus_fruit', 'goat'] },
  { name: 'Tierra del Fuego', layer: 'surface', biome: 'tundra', latitude: -54, longitude: -69, elevation: 300, resources: ['beech_wood', 'king_crab', 'peat'] },
  { name: 'Llanos', layer: 'surface', biome: 'savanna', latitude: 7, longitude: -69, elevation: 150, resources: ['cattle', 'capybara', 'grass'] },
  { name: 'Altiplano', layer: 'surface', biome: 'grassland', latitude: -16, longitude: -68, elevation: 3700, resources: ['quinoa', 'tin', 'llama_wool'] },

  // ---- Additional Oceania (3) ----
  { name: 'Great Sandy Desert', layer: 'surface', biome: 'desert', latitude: -22, longitude: 124, elevation: 400, resources: ['spinifex', 'gold', 'lizard'] },
  { name: 'Solomon Islands', layer: 'surface', biome: 'tropical_rainforest', latitude: -9, longitude: 160, elevation: 200, resources: ['coconut', 'teak', 'tuna'] },
  { name: 'New Caledonia', layer: 'surface', biome: 'coastal', latitude: -22, longitude: 166, elevation: 300, resources: ['nickel', 'sandalwood', 'yam'] },

  // ---- Additional Polar/Island (4) ----
  { name: 'Franz Josef Land', layer: 'surface', biome: 'tundra', latitude: 80, longitude: 50, elevation: 100, resources: ['walrus_ivory', 'lichen', 'driftwood'] },
  { name: 'Kerguelen Islands', layer: 'surface', biome: 'tundra', latitude: -49, longitude: 69, elevation: 500, resources: ['elephant_seal', 'kelp', 'moss'] },
  { name: 'Falkland Islands', layer: 'surface', biome: 'grassland', latitude: -52, longitude: -59, elevation: 200, resources: ['wool', 'squid', 'peat'] },
  { name: 'Canary Islands', layer: 'surface', biome: 'coastal', latitude: 28, longitude: -16, elevation: 600, resources: ['banana', 'volcanic_rock', 'dragon_tree'] },

  // ---- Gap fillers (6) ----
  { name: 'Manchurian Plain', layer: 'surface', biome: 'grassland', latitude: 45, longitude: 125, elevation: 200, resources: ['soybean', 'corn', 'ginseng'] },
  { name: 'Ob River Basin', layer: 'surface', biome: 'wetland', latitude: 60, longitude: 70, elevation: 50, resources: ['peat', 'pike', 'birch_wood'] },
  { name: 'Drakensberg Mountains', layer: 'surface', biome: 'mountain', latitude: -29, longitude: 29, elevation: 3000, resources: ['basalt', 'fresh_water', 'eland'] },
  { name: 'Nullarbor Plain', layer: 'surface', biome: 'desert', latitude: -32, longitude: 127, elevation: 100, resources: ['limestone', 'wombat', 'saltbush'] },
  { name: 'Cuban Lowlands', layer: 'surface', biome: 'tropical_rainforest', latitude: 22, longitude: -80, elevation: 50, resources: ['sugarcane', 'tobacco', 'mahogany'] },
  { name: 'Anatolian Plateau', layer: 'surface', biome: 'grassland', latitude: 39, longitude: 33, elevation: 1000, resources: ['wheat', 'mohair', 'chromite'] },
];

// ============================================================
// UNDERWATER REGIONS (~45)
// ============================================================
const UNDERWATER_REGIONS: RegionSeed[] = [
  // ---- Original 10 ----
  { name: 'Great Barrier Reef', layer: 'underwater', biome: 'coral_reef', latitude: -18, longitude: 147, elevation: -30, resources: ['coral', 'tropical_fish', 'sea_cucumber'] },
  { name: 'Caribbean Reef', layer: 'underwater', biome: 'coral_reef', latitude: 18, longitude: -75, elevation: -20, resources: ['coral', 'lobster', 'conch'] },
  { name: 'North Atlantic', layer: 'underwater', biome: 'open_ocean', latitude: 45, longitude: -30, elevation: -200, resources: ['cod', 'herring', 'kelp'] },
  { name: 'South Pacific', layer: 'underwater', biome: 'open_ocean', latitude: -20, longitude: -150, elevation: -300, resources: ['tuna', 'squid', 'seaweed'] },
  { name: 'Indian Ocean Shelf', layer: 'underwater', biome: 'open_ocean', latitude: -10, longitude: 70, elevation: -150, resources: ['shrimp', 'pearl_oyster', 'seaweed'] },
  { name: 'Mariana Trench', layer: 'underwater', biome: 'deep_ocean', latitude: 11, longitude: 142, elevation: -10994, resources: ['deep_sea_minerals', 'bioluminescent_organisms'] },
  { name: 'Mid-Atlantic Ridge', layer: 'underwater', biome: 'hydrothermal_vent', latitude: 30, longitude: -30, elevation: -2500, resources: ['sulfur', 'iron', 'tube_worms'] },
  { name: 'Pacific Kelp Forest', layer: 'underwater', biome: 'kelp_forest', latitude: 35, longitude: -120, elevation: -30, resources: ['kelp', 'sea_urchin', 'abalone'] },
  { name: 'Arctic Ocean', layer: 'underwater', biome: 'open_ocean', latitude: 80, longitude: 0, elevation: -200, resources: ['krill', 'arctic_cod', 'plankton'] },
  { name: 'Mediterranean Sea', layer: 'underwater', biome: 'open_ocean', latitude: 37, longitude: 18, elevation: -100, resources: ['octopus', 'sardine', 'sponge'] },

  // ---- Coral Reefs (5) ----
  { name: 'Red Sea Coral', layer: 'underwater', biome: 'coral_reef', latitude: 22, longitude: 38, elevation: -25, resources: ['coral', 'clownfish', 'sea_fan'] },
  { name: 'Coral Triangle', layer: 'underwater', biome: 'coral_reef', latitude: -2, longitude: 125, elevation: -20, resources: ['giant_clam', 'reef_shark', 'sea_anemone'] },
  { name: 'Mesoamerican Reef', layer: 'underwater', biome: 'coral_reef', latitude: 17, longitude: -87, elevation: -15, resources: ['coral', 'manatee_grass', 'parrotfish'] },
  { name: 'Maldives Reef', layer: 'underwater', biome: 'coral_reef', latitude: 4, longitude: 73, elevation: -20, resources: ['coral', 'manta_ray', 'cowrie_shell'] },
  { name: 'Andaman Sea Reef', layer: 'underwater', biome: 'coral_reef', latitude: 8, longitude: 97, elevation: -25, resources: ['coral', 'sea_horse', 'nautilus'] },

  // ---- Deep Trenches (5) ----
  { name: 'Tonga Trench', layer: 'underwater', biome: 'deep_ocean', latitude: -23, longitude: -174, elevation: -10882, resources: ['manganese_nodules', 'deep_sea_amphipod'] },
  { name: 'Java Trench', layer: 'underwater', biome: 'deep_ocean', latitude: -10, longitude: 110, elevation: -7725, resources: ['deep_sea_minerals', 'giant_isopod'] },
  { name: 'Philippine Trench', layer: 'underwater', biome: 'deep_ocean', latitude: 8, longitude: 127, elevation: -10540, resources: ['manganese_nodules', 'abyssal_fish'] },
  { name: 'Puerto Rico Trench', layer: 'underwater', biome: 'deep_ocean', latitude: 19, longitude: -67, elevation: -8376, resources: ['deep_sea_minerals', 'bioluminescent_organisms'] },
  { name: 'Kermadec Trench', layer: 'underwater', biome: 'deep_ocean', latitude: -30, longitude: -177, elevation: -10047, resources: ['manganese_nodules', 'snailfish'] },

  // ---- Continental Shelves & Seas (10) ----
  { name: 'Bering Sea', layer: 'underwater', biome: 'open_ocean', latitude: 58, longitude: -175, elevation: -100, resources: ['king_crab', 'pollock', 'halibut'] },
  { name: 'South China Sea', layer: 'underwater', biome: 'open_ocean', latitude: 12, longitude: 114, elevation: -120, resources: ['tuna', 'shrimp', 'sea_cucumber'] },
  { name: 'Gulf of Mexico', layer: 'underwater', biome: 'open_ocean', latitude: 25, longitude: -90, elevation: -150, resources: ['shrimp', 'red_snapper', 'oil'] },
  { name: 'Yellow Sea Shelf', layer: 'underwater', biome: 'open_ocean', latitude: 35, longitude: 123, elevation: -50, resources: ['jellyfish', 'flounder', 'seaweed'] },
  { name: 'Persian Gulf Shelf', layer: 'underwater', biome: 'open_ocean', latitude: 27, longitude: 51, elevation: -40, resources: ['pearl', 'shrimp', 'oil'] },
  { name: 'Barents Sea', layer: 'underwater', biome: 'open_ocean', latitude: 73, longitude: 35, elevation: -200, resources: ['cod', 'haddock', 'krill'] },
  { name: 'Bay of Bengal Deep', layer: 'underwater', biome: 'open_ocean', latitude: 12, longitude: 87, elevation: -2500, resources: ['shrimp', 'tuna', 'squid'] },
  { name: 'Black Sea', layer: 'underwater', biome: 'open_ocean', latitude: 43, longitude: 34, elevation: -1200, resources: ['anchovy', 'sturgeon', 'hydrogen_sulfide'] },
  { name: 'Caspian Depression', layer: 'underwater', biome: 'open_ocean', latitude: 42, longitude: 51, elevation: -28, resources: ['sturgeon', 'caviar', 'seal'] },
  { name: 'Timor Sea', layer: 'underwater', biome: 'open_ocean', latitude: -11, longitude: 127, elevation: -100, resources: ['barramundi', 'pearl', 'natural_gas'] },

  // ---- Hydrothermal Vents (3) ----
  { name: 'East Pacific Rise', layer: 'underwater', biome: 'hydrothermal_vent', latitude: -10, longitude: -104, elevation: -2600, resources: ['sulfur', 'zinc', 'tube_worms'] },
  { name: 'Azores Seamounts', layer: 'underwater', biome: 'hydrothermal_vent', latitude: 38, longitude: -30, elevation: -1500, resources: ['copper', 'manganese', 'vent_shrimp'] },
  { name: 'Galápagos Rift', layer: 'underwater', biome: 'hydrothermal_vent', latitude: 0, longitude: -86, elevation: -2500, resources: ['sulfur', 'iron', 'giant_tube_worm'] },

  // ---- Kelp Forests (3) ----
  { name: 'Norwegian Fjords Deep', layer: 'underwater', biome: 'kelp_forest', latitude: 61, longitude: 6, elevation: -40, resources: ['kelp', 'king_crab', 'salmon'] },
  { name: 'Patagonian Kelp', layer: 'underwater', biome: 'kelp_forest', latitude: -50, longitude: -68, elevation: -25, resources: ['kelp', 'sea_urchin', 'king_crab'] },
  { name: 'South African Kelp', layer: 'underwater', biome: 'kelp_forest', latitude: -34, longitude: 18, elevation: -20, resources: ['kelp', 'abalone', 'rock_lobster'] },

  // ---- Current Zones & Other (9) ----
  { name: 'Sargasso Sea', layer: 'underwater', biome: 'open_ocean', latitude: 30, longitude: -60, elevation: -1500, resources: ['sargassum', 'eel', 'flying_fish'] },
  { name: 'Gulf Stream', layer: 'underwater', biome: 'open_ocean', latitude: 35, longitude: -75, elevation: -200, resources: ['bluefin_tuna', 'swordfish', 'plankton'] },
  { name: 'Humboldt Current Zone', layer: 'underwater', biome: 'open_ocean', latitude: -20, longitude: -75, elevation: -150, resources: ['anchovy', 'squid', 'plankton'] },
  { name: 'Agulhas Current', layer: 'underwater', biome: 'open_ocean', latitude: -35, longitude: 28, elevation: -200, resources: ['sardine', 'tuna', 'dolphin_fish'] },
  { name: 'Canary Current', layer: 'underwater', biome: 'open_ocean', latitude: 28, longitude: -17, elevation: -100, resources: ['sardine', 'octopus', 'plankton'] },
  { name: 'Mozambique Channel', layer: 'underwater', biome: 'open_ocean', latitude: -18, longitude: 42, elevation: -2500, resources: ['coelacanth', 'tuna', 'shrimp'] },
  { name: 'Weddell Sea', layer: 'underwater', biome: 'open_ocean', latitude: -72, longitude: -45, elevation: -3000, resources: ['krill', 'icefish', 'plankton'] },
  { name: 'Ross Sea', layer: 'underwater', biome: 'open_ocean', latitude: -75, longitude: 175, elevation: -500, resources: ['antarctic_toothfish', 'krill', 'plankton'] },
  { name: 'Scotia Sea', layer: 'underwater', biome: 'open_ocean', latitude: -57, longitude: -45, elevation: -3000, resources: ['krill', 'squid', 'lanternfish'] },
];

// ============================================================
// UNDERGROUND REGIONS (~25)
// ============================================================
const UNDERGROUND_REGIONS: RegionSeed[] = [
  // ---- Original 5 ----
  { name: 'Mammoth Cave System', layer: 'underground', biome: 'cave_system', latitude: 37, longitude: -86, elevation: -100, resources: ['limestone', 'bat_guano', 'crystal'] },
  { name: 'Carlsbad Caverns', layer: 'underground', biome: 'cave_system', latitude: 32, longitude: -104, elevation: -300, resources: ['gypsum', 'stalactite_minerals'] },
  { name: 'Underground Rivers of Yucatan', layer: 'underground', biome: 'underground_river', latitude: 20, longitude: -88, elevation: -50, resources: ['fresh_water', 'blind_fish', 'limestone'] },
  { name: 'African Mine Networks', layer: 'underground', biome: 'subterranean_ecosystem', latitude: -26, longitude: 28, elevation: -500, resources: ['gold', 'diamond', 'extremophile_bacteria'] },
  { name: 'European Deep Caves', layer: 'underground', biome: 'cave_system', latitude: 43, longitude: 5, elevation: -400, resources: ['calcite', 'cave_fish', 'fresh_water'] },

  // ---- New Zealand ----
  { name: 'Waitomo Caves', layer: 'underground', biome: 'cave_system', latitude: -38, longitude: 175, elevation: -60, resources: ['glowworm_silk', 'limestone', 'stalactite_minerals'] },

  // ---- North America ----
  { name: 'Lechuguilla Cave', layer: 'underground', biome: 'cave_system', latitude: 32, longitude: -105, elevation: -489, resources: ['gypsum', 'sulfur', 'selenite_crystal'] },
  { name: 'Wind Cave', layer: 'underground', biome: 'cave_system', latitude: 44, longitude: -103, elevation: -200, resources: ['boxwork_calcite', 'manganese', 'bat_guano'] },
  { name: 'Lava Tubes Hawaii', layer: 'underground', biome: 'subterranean_ecosystem', latitude: 20, longitude: -155, elevation: -30, resources: ['basalt', 'lava_stalactite', 'extremophile_bacteria'] },
  { name: 'Blue Holes Bahamas', layer: 'underground', biome: 'underground_river', latitude: 24, longitude: -77, elevation: -200, resources: ['fresh_water', 'blind_cave_fish', 'stalactite_minerals'] },

  // ---- Asia ----
  { name: 'Son Doong Cave', layer: 'underground', biome: 'cave_system', latitude: 18, longitude: 106, elevation: -150, resources: ['cave_pearl', 'stalagmite_minerals', 'fresh_water'] },
  { name: 'Mulu Caves', layer: 'underground', biome: 'cave_system', latitude: 4, longitude: 115, elevation: -100, resources: ['bat_guano', 'limestone', 'cave_swiftlet_nest'] },
  { name: 'Reed Flute Cave', layer: 'underground', biome: 'cave_system', latitude: 25, longitude: 110, elevation: -50, resources: ['stalactite_minerals', 'limestone', 'crystal'] },
  { name: 'Jeita Grotto', layer: 'underground', biome: 'underground_river', latitude: 34, longitude: 36, elevation: -80, resources: ['fresh_water', 'limestone', 'stalactite_minerals'] },

  // ---- Europe ----
  { name: 'Eisriesenwelt Ice Cave', layer: 'underground', biome: 'cave_system', latitude: 47, longitude: 13, elevation: -400, resources: ['ice', 'limestone', 'dolomite'] },
  { name: 'Movile Cave', layer: 'underground', biome: 'subterranean_ecosystem', latitude: 44, longitude: 28, elevation: -20, resources: ['extremophile_bacteria', 'cave_spider', 'hydrogen_sulfide'] },
  { name: 'Postojna Cave', layer: 'underground', biome: 'underground_river', latitude: 46, longitude: 14, elevation: -115, resources: ['olm', 'stalactite_minerals', 'fresh_water'] },
  { name: 'Ogof Ffynnon Ddu', layer: 'underground', biome: 'cave_system', latitude: 52, longitude: -4, elevation: -280, resources: ['limestone', 'calcite', 'fresh_water'] },
  { name: 'Veryovkina Cave', layer: 'underground', biome: 'cave_system', latitude: 43, longitude: 40, elevation: -2212, resources: ['limestone', 'crystal', 'cave_shrimp'] },
  { name: 'Krubera Cave', layer: 'underground', biome: 'cave_system', latitude: 43, longitude: 40, elevation: -2197, resources: ['limestone', 'cave_beetle', 'fresh_water'] },

  // ---- Central America / Mexico ----
  { name: 'Cueva de los Cristales', layer: 'underground', biome: 'subterranean_ecosystem', latitude: 28, longitude: -105, elevation: -300, resources: ['selenite_crystal', 'gypsum', 'lead'] },
  { name: 'Sistema Sac Actun', layer: 'underground', biome: 'underground_river', latitude: 20, longitude: -87, elevation: -25, resources: ['fresh_water', 'blind_fish', 'stalactite_minerals'] },
  { name: 'Actun Tunichil Muknal', layer: 'underground', biome: 'underground_river', latitude: 17, longitude: -89, elevation: -30, resources: ['crystal', 'limestone', 'fresh_water'] },

  // ---- Turkey ----
  { name: 'Derinkuyu Underground City', layer: 'underground', biome: 'subterranean_ecosystem', latitude: 38, longitude: 35, elevation: -85, resources: ['tuite', 'basalt', 'fresh_water'] },

  // ---- Philippines ----
  { name: 'Puerto Princesa Underground River', layer: 'underground', biome: 'underground_river', latitude: 10, longitude: 119, elevation: -10, resources: ['fresh_water', 'limestone', 'bat_guano'] },
];

// ============================================================
// Connection Algorithm
// ============================================================

/** Haversine-like degree distance accounting for longitude wrapping */
function degreeDist(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const dLat = lat1 - lat2;
  let dLon = Math.abs(lon1 - lon2);
  if (dLon > 180) dLon = 360 - dLon; // wrap around date line
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

const COASTAL_BIOMES: Set<Biome> = new Set(['coastal', 'wetland']);

function isContinentSame(a: RegionSeed, b: RegionSeed): boolean {
  // Rough continental grouping by longitude/latitude bands
  const continent = (r: RegionSeed): string => {
    const { latitude: lat, longitude: lon } = r;
    if (lat < -60) return 'antarctic';
    if (lat > 65 && lon > -30 && lon < 50) return 'arctic_europe';
    if (lat > 65) return 'arctic';
    // Africa
    if (lat > -40 && lat < 38 && lon > -20 && lon < 55) return 'africa';
    // Europe
    if (lat > 35 && lat < 72 && lon > -30 && lon < 45) return 'europe';
    // Asia
    if (lat > -12 && lat < 72 && lon > 45 && lon < 180) return 'asia';
    // Southeast Asian islands
    if (lat > -12 && lat < 20 && lon > 95 && lon < 145) return 'asia';
    // Oceania
    if (lat < -10 && lon > 110 && lon < 180) return 'oceania';
    // North America
    if (lat > 10 && lat < 72 && lon > -170 && lon < -50) return 'north_america';
    // Central America
    if (lat > 5 && lat < 25 && lon > -120 && lon < -60) return 'north_america';
    // South America
    if (lat > -60 && lat < 15 && lon > -85 && lon < -30) return 'south_america';
    return 'other';
  };
  return continent(a) === continent(b);
}

export function seedRegions(world: World): void {
  const allSeeds = [...SURFACE_REGIONS, ...UNDERWATER_REGIONS, ...UNDERGROUND_REGIONS];
  const regionMap = new Map<string, { id: string; seed: RegionSeed }>(); // name -> {id, seed}

  for (const seed of allSeeds) {
    const region = createRegion({
      name: seed.name,
      layer: seed.layer,
      biome: seed.biome,
      latitude: seed.latitude,
      longitude: seed.longitude,
      elevation: seed.elevation,
    });

    // Add resources
    for (const resourceType of seed.resources) {
      region.resources.push({
        type: resourceType,
        quantity: 1000,
        renewRate: 1,
        maxQuantity: 1000,
        properties: new Map(),
      });
    }

    // Seed plants per biome
    region.plantPopulations = getDefaultPlants(seed.biome);

    world.regions.set(region.id, region);
    regionMap.set(seed.name, { id: region.id, seed });
  }

  const regions = Array.from(world.regions.values());
  const surfaceRegions = regions.filter(r => r.layer === 'surface');
  const underwaterRegions = regions.filter(r => r.layer === 'underwater');
  const undergroundRegions = regions.filter(r => r.layer === 'underground');

  // Find the seed data for a region by name
  const seedFor = (r: Region): RegionSeed | undefined => {
    const entry = regionMap.get(r.name);
    return entry?.seed;
  };

  // --- Surface-to-Surface connections ---
  for (let i = 0; i < surfaceRegions.length; i++) {
    for (let j = i + 1; j < surfaceRegions.length; j++) {
      const a = surfaceRegions[i];
      const b = surfaceRegions[j];
      const dist = degreeDist(a.latitude, a.longitude, b.latitude, b.longitude);

      const seedA = seedFor(a);
      const seedB = seedFor(b);
      const sameCont = seedA && seedB ? isContinentSame(seedA, seedB) : false;
      const bothCoastal = COASTAL_BIOMES.has(a.biome) && COASTAL_BIOMES.has(b.biome);

      // Same continent: connect within 25 degrees
      // Coastal-to-coastal across water: connect within 40 degrees
      const threshold = sameCont ? 25 : (bothCoastal ? 40 : 20);
      if (dist < threshold) {
        addRegionConnection(world, a.id, b.id);
      }
    }
  }

  // --- Underwater-to-Underwater connections ---
  for (let i = 0; i < underwaterRegions.length; i++) {
    for (let j = i + 1; j < underwaterRegions.length; j++) {
      const a = underwaterRegions[i];
      const b = underwaterRegions[j];
      const dist = degreeDist(a.latitude, a.longitude, b.latitude, b.longitude);
      if (dist < 35) {
        addRegionConnection(world, a.id, b.id);
      }
    }
  }

  // --- Underground-to-Underground connections ---
  for (let i = 0; i < undergroundRegions.length; i++) {
    for (let j = i + 1; j < undergroundRegions.length; j++) {
      const a = undergroundRegions[i];
      const b = undergroundRegions[j];
      const dist = degreeDist(a.latitude, a.longitude, b.latitude, b.longitude);
      if (dist < 15) {
        addRegionConnection(world, a.id, b.id);
      }
    }
  }

  // --- Underground-to-Surface connections (nearest surface within 15 degrees) ---
  for (const underground of undergroundRegions) {
    let bestDist = Infinity;
    let bestSurface: Region | null = null;
    for (const surface of surfaceRegions) {
      const dist = degreeDist(
        surface.latitude, surface.longitude,
        underground.latitude, underground.longitude,
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestSurface = surface;
      }
    }
    if (bestSurface && bestDist < 15) {
      addRegionConnection(world, underground.id, bestSurface.id);
    }
    // Also connect to any other surface regions within 10 degrees
    for (const surface of surfaceRegions) {
      if (surface === bestSurface) continue;
      const dist = degreeDist(
        surface.latitude, surface.longitude,
        underground.latitude, underground.longitude,
      );
      if (dist < 10) {
        addRegionConnection(world, underground.id, surface.id);
      }
    }
  }

  // --- Coastal/Wetland Surface to Underwater connections ---
  for (const surface of surfaceRegions) {
    if (!COASTAL_BIOMES.has(surface.biome)) continue;
    for (const underwater of underwaterRegions) {
      const dist = degreeDist(
        surface.latitude, surface.longitude,
        underwater.latitude, underwater.longitude,
      );
      if (dist < 25) {
        addRegionConnection(world, surface.id, underwater.id);
      }
    }
  }
}
