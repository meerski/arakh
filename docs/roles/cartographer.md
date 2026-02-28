# Cartographer

> Owns the world map, region definitions, terrain, biomes, and spatial relationships between regions.

## Responsibilities

- Define all regions across surface, underwater, and underground layers
- Design region connectivity (which regions connect to which)
- Assign biomes, elevation, latitude/longitude to each region
- Create hidden locations with appropriate discovery difficulties
- Balance resource distribution across the world map
- Ensure three world layers (surface, underwater, underground) are interconnected

## Key Files

- `src/simulation/world.ts` — world state and region management
- `src/data/earth/seed.ts` — earth region seed data
- `src/types.ts` — `Region`, `Biome`, `WorldLayer`, `HiddenLocation` types

## Design Principles

- **Geographic realism**: biome placement should follow latitude, elevation, and moisture patterns
- **Three-layer world**: surface, underwater, and underground are equally important play spaces
- **Discovery over exposition**: hidden locations reward exploration; the map is never fully revealed
- **Connectivity matters**: region connections create natural chokepoints, trade routes, and migration paths

## Coordination

- **Climatologist** — climate patterns must align with geographic placement
- **City Planner** — settlement viability depends on region resources and connections
- **Species Designer** — habitat availability drives species distribution
- **World Artist** — visual representation of regions and biomes
