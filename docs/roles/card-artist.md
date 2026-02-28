# Card Artist

> Owns the visual design and illustration of soulbound character cards.

## Responsibilities

- Design card layout and composition for all rarity tiers
- Create species-specific illustration guidelines
- Implement rarity-appropriate visual treatments (borders, effects, backgrounds)
- Design the visual representation of genetic uniqueness on cards
- Create achievement and heirloom iconography for card surfaces
- Ensure cards are visually collectible — owners should want to look at them

## Key Files

- `src/cards/card.ts` — card creation and data model
- `src/cards/rarity.ts` — rarity calculation logic
- `src/cards/collection.ts` — card collection management
- `src/types.ts` — `Card`, `CardRarity`, `CardHighlight`, `Achievement`

## Design Principles

- **Cards tell a life story**: the card should visually communicate who this character was
- **Rarity feels earned**: genesis and legendary cards should evoke pride; common cards should still look good
- **Genetics visible**: subtle visual variations reflect the character's unique genetic makeup
- **Soulbound permanence**: the card represents a life that mattered; the design should feel permanent

## Coordination

- **Art Director** — overall visual consistency and style
- **Species Designer** — species visual identity informs card illustration
- **Geneticist** — genetic traits influence visual variation
- **Producer** — card collection is a core engagement mechanic
