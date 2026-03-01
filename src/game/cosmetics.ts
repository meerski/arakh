// ============================================================
// Cosmetics Marketplace — PoE2 Model (Zero Pay-to-Win)
// ============================================================
// Purely cosmetic items that do not affect gameplay.
// Soulbound to owners. No trading.

import type { OwnerId, CardId, FamilyTreeId, ColonyId } from '../types.js';

// --- Cosmetic Types ---

export type CosmeticCategory =
  | 'card_frame'         // Decorative card borders
  | 'card_effect'        // Visual effects on cards (holographic, animated, glow)
  | 'profile_badge'      // Dynasty profile badges
  | 'dashboard_theme'    // Custom dashboard skins
  | 'title'              // Display titles for owners
  | 'card_back'          // Custom card back designs
  | 'dynasty_crest'      // Heraldic crest displayed on family tree
  | 'appearance_variant' // Heritable appearance overrides for characters
  | 'narrator_voice'     // Custom narrative voice/style
  | 'memorial_marker'    // Gravestone/memorial for dead characters
  | 'colony_skin';       // Visual theme for colony UI

export type CosmeticRarity = 'standard' | 'premium' | 'exclusive' | 'limited';

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  price: number;           // In credits (abstract currency)
  previewUrl?: string;     // For future frontend
  isAvailable: boolean;    // Currently purchasable
  maxOwners?: number;      // Limited edition cap (null = unlimited)
  purchaseCount: number;   // How many have been purchased
}

/** Targets a cosmetic can be applied to. */
export type CosmeticTarget =
  | CardId                // Applied to a specific card
  | FamilyTreeId          // Applied to a dynasty (crest, appearance)
  | ColonyId              // Applied to a colony (skin)
  | 'profile'             // Applied to owner profile
  | 'dashboard'           // Applied to dashboard
  | 'narrator';           // Applied as active narrator voice

export interface OwnedCosmetic {
  cosmeticId: string;
  ownerId: OwnerId;
  purchasedAt: Date;
  appliedTo?: CosmeticTarget;
}

// --- Catalog ---

export class CosmeticCatalog {
  private items: Map<string, CosmeticItem> = new Map();

  addItem(item: Omit<CosmeticItem, 'id' | 'purchaseCount'>): CosmeticItem {
    const full: CosmeticItem = {
      ...item,
      id: crypto.randomUUID(),
      purchaseCount: 0,
    };
    this.items.set(full.id, full);
    return full;
  }

  getItem(id: string): CosmeticItem | undefined {
    return this.items.get(id);
  }

  getAvailable(): CosmeticItem[] {
    return Array.from(this.items.values()).filter(i => {
      if (!i.isAvailable) return false;
      if (i.maxOwners && i.purchaseCount >= i.maxOwners) return false;
      return true;
    });
  }

  getByCategory(category: CosmeticCategory): CosmeticItem[] {
    return Array.from(this.items.values()).filter(i => i.category === category);
  }

  getAll(): CosmeticItem[] {
    return Array.from(this.items.values());
  }
}

export let cosmeticCatalog = new CosmeticCatalog();
export function _installCosmeticCatalog(instance: CosmeticCatalog): void { cosmeticCatalog = instance; }

// --- Owner Inventory ---

export class CosmeticInventory {
  private owned: OwnedCosmetic[] = [];

  purchase(ownerId: OwnerId, cosmeticId: string): OwnedCosmetic | null {
    const item = cosmeticCatalog.getItem(cosmeticId);
    if (!item || !item.isAvailable) return null;
    if (item.maxOwners && item.purchaseCount >= item.maxOwners) return null;

    // Check if already owned
    if (this.owned.some(o => o.ownerId === ownerId && o.cosmeticId === cosmeticId)) {
      return null;
    }

    item.purchaseCount++;
    const cosmetic: OwnedCosmetic = {
      cosmeticId,
      ownerId,
      purchasedAt: new Date(),
    };
    this.owned.push(cosmetic);
    return cosmetic;
  }

  getByOwner(ownerId: OwnerId): OwnedCosmetic[] {
    return this.owned.filter(o => o.ownerId === ownerId);
  }

  /** Apply a cosmetic to a target (card, profile, dashboard, dynasty, colony, narrator). */
  apply(ownerId: OwnerId, cosmeticId: string, target: CosmeticTarget): boolean {
    const cosmetic = this.owned.find(o => o.ownerId === ownerId && o.cosmeticId === cosmeticId);
    if (!cosmetic) return false;

    // Unapply from previous target if any
    cosmetic.appliedTo = target;
    return true;
  }

  /** Remove cosmetic application */
  unapply(ownerId: OwnerId, cosmeticId: string): boolean {
    const cosmetic = this.owned.find(o => o.ownerId === ownerId && o.cosmeticId === cosmeticId);
    if (!cosmetic) return false;
    cosmetic.appliedTo = undefined;
    return true;
  }

  /** Get cosmetics applied to a specific target. */
  getAppliedTo(ownerId: OwnerId, target: CosmeticTarget): OwnedCosmetic[] {
    return this.owned.filter(o => o.ownerId === ownerId && o.appliedTo === target);
  }

  getAll(): OwnedCosmetic[] {
    return [...this.owned];
  }

  clear(): void {
    this.owned.length = 0;
  }
}

export let cosmeticInventory = new CosmeticInventory();
export function _installCosmeticInventory(instance: CosmeticInventory): void { cosmeticInventory = instance; }

// --- Seed default catalog ---

export function seedDefaultCatalog(): void {
  // Card Frames
  cosmeticCatalog.addItem({
    name: 'Holographic Frame', description: 'A shimmering holographic border',
    category: 'card_frame', rarity: 'premium', price: 500, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Obsidian Frame', description: 'Dark volcanic glass border',
    category: 'card_frame', rarity: 'standard', price: 200, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Genesis Frame', description: 'Golden frame for genesis cards',
    category: 'card_frame', rarity: 'exclusive', price: 1000, isAvailable: true, maxOwners: 100,
  });

  // Card Effects
  cosmeticCatalog.addItem({
    name: 'Ember Glow', description: 'Cards emit a warm ember glow',
    category: 'card_effect', rarity: 'premium', price: 400, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Frost Shimmer', description: 'Crystalline frost effect on card surface',
    category: 'card_effect', rarity: 'premium', price: 400, isAvailable: true,
  });

  // Profile Badges
  cosmeticCatalog.addItem({
    name: 'Pioneer Badge', description: 'Mark of an early adopter',
    category: 'profile_badge', rarity: 'limited', price: 0, isAvailable: true, maxOwners: 1000,
  });
  cosmeticCatalog.addItem({
    name: 'Legend Badge', description: 'For owners of legendary cards',
    category: 'profile_badge', rarity: 'exclusive', price: 750, isAvailable: true,
  });

  // Dashboard Themes
  cosmeticCatalog.addItem({
    name: 'Dark Forest', description: 'Deep woodland dashboard theme',
    category: 'dashboard_theme', rarity: 'standard', price: 300, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Deep Ocean', description: 'Abyssal blue dashboard theme',
    category: 'dashboard_theme', rarity: 'standard', price: 300, isAvailable: true,
  });

  // Titles
  cosmeticCatalog.addItem({
    name: 'The Eternal', description: 'Title: "The Eternal"',
    category: 'title', rarity: 'exclusive', price: 2000, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Worldkeeper', description: 'Title: "Worldkeeper"',
    category: 'title', rarity: 'premium', price: 800, isAvailable: true,
  });

  // Card Backs
  cosmeticCatalog.addItem({
    name: 'Starfield', description: 'A cosmic starfield card back',
    category: 'card_back', rarity: 'premium', price: 350, isAvailable: true,
  });

  // Dynasty Crests
  cosmeticCatalog.addItem({
    name: 'Iron Crown', description: 'A stern iron crown crest for your dynasty',
    category: 'dynasty_crest', rarity: 'standard', price: 250, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Twin Serpents', description: 'Entwined serpents forming a double helix',
    category: 'dynasty_crest', rarity: 'premium', price: 600, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Sunburst', description: 'A radiant solar crest, mark of the first dynasties',
    category: 'dynasty_crest', rarity: 'exclusive', price: 1500, isAvailable: true, maxOwners: 50,
  });

  // Appearance Variants (heritable — applied to dynasty, inherited by descendants)
  cosmeticCatalog.addItem({
    name: 'Albino', description: 'Pale white coloration inherited through the bloodline',
    category: 'appearance_variant', rarity: 'premium', price: 500, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Melanistic', description: 'Dark pigmentation passed down through generations',
    category: 'appearance_variant', rarity: 'premium', price: 500, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Scarred Elder', description: 'Battle scars marking a lineage of warriors',
    category: 'appearance_variant', rarity: 'exclusive', price: 800, isAvailable: true,
  });

  // Narrator Voices
  cosmeticCatalog.addItem({
    name: 'The Chronicler', description: 'A scholarly, measured tone in all narratives',
    category: 'narrator_voice', rarity: 'standard', price: 200, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'The Bard', description: 'Flowery, dramatic narration with poetic flair',
    category: 'narrator_voice', rarity: 'premium', price: 450, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'The Stoic', description: 'Terse, matter-of-fact narration. No embellishments.',
    category: 'narrator_voice', rarity: 'standard', price: 200, isAvailable: true,
  });

  // Memorial Markers
  cosmeticCatalog.addItem({
    name: 'Stone Cairn', description: 'A simple stone cairn marking the fallen',
    category: 'memorial_marker', rarity: 'standard', price: 150, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Eternal Flame', description: 'A never-extinguishing flame memorial',
    category: 'memorial_marker', rarity: 'premium', price: 500, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Ancestor Tree', description: 'A great tree planted in memory, growing with the lineage',
    category: 'memorial_marker', rarity: 'exclusive', price: 1200, isAvailable: true,
  });

  // Colony Skins
  cosmeticCatalog.addItem({
    name: 'Crystal Hive', description: 'Translucent crystalline colony appearance',
    category: 'colony_skin', rarity: 'premium', price: 600, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Fungal Network', description: 'Bioluminescent fungal colony aesthetic',
    category: 'colony_skin', rarity: 'premium', price: 600, isAvailable: true,
  });
  cosmeticCatalog.addItem({
    name: 'Ancient Mound', description: 'Weathered, mossy mound colony skin',
    category: 'colony_skin', rarity: 'standard', price: 300, isAvailable: true,
  });
}
