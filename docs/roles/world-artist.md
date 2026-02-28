# World Artist

> Owns the visual representation of regions, biomes, environments, and the living world itself.

## Responsibilities

- Create visual representations for all 18 biome types across three world layers
- Design environment art that reflects climate state (drought, storm, pollution)
- Illustrate region transitions and the visual boundaries between biomes
- Create visual indicators for hidden locations and discoverable areas
- Design seasonal visual variations for each biome
- Ensure underwater and underground environments feel as rich as surface biomes

## Key Files

- `src/types.ts` — `Biome`, `WorldLayer`, `RegionClimate`, `Season`
- `src/simulation/world.ts` — world and region state
- `src/data/earth/seed.ts` — region definitions

## Design Principles

- **Every biome is a character**: coral reefs and cave systems should feel as alive as forests
- **Climate is visible**: a polluted region should look visibly degraded; a thriving one, lush
- **Three layers, equal depth**: underwater and underground deserve the same art investment as surface
- **Scale and wonder**: the world should feel vast; individual regions should feel intimate

## Coordination

- **Art Director** — visual consistency and style direction
- **Cartographer** — geographic and biome placement defines what needs art
- **Climatologist** — visual states must reflect climate conditions
- **UI Designer** — world art integrates into the dashboard map view
