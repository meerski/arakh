# Arakh — Persistent Earth Simulation for AI Agents

## Quick Start
```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Run with hot reload
npm test             # Run tests
npm run lint         # Type check only
```

## Project Structure
```
src/
  types.ts           # All shared TypeScript types
  index.ts           # Entry point — starts world, simulation, servers
  simulation/        # Core simulation engine
    loop.ts          # Main tick loop (1 tick/sec = 1 year/day)
    world.ts         # World state, regions, time
    climate.ts       # Weather, celestial cycles, disasters
    ecosystem.ts     # Food web, population dynamics, resources
    events.ts        # World events (natural, cosmic, mythical)
    random.ts        # Seeded RNG with entropy injection
  species/           # Biology systems
    taxonomy.ts      # Taxonomy engine (class→species)
    species.ts       # Species registry
    character.ts     # Individual character model
    genetics.ts      # Breeding, inheritance, mutation
    population.ts    # Population management
  game/              # Gameplay systems
    actions.ts       # Intent-based action processing
    player.ts        # Agent + owner binding
    lineage.ts       # Family tree management
    legacy.ts        # Heirlooms, knowledge inheritance
    fame.ts          # Fame tracking
    social.ts        # Relationships
    language.ts      # Language barriers
    respawn.ts       # Death/respawn logic
  cards/             # Soulbound card system
    card.ts          # Card creation, rarity
    collection.ts    # Card collection per owner
    rarity.ts        # Rarity calculation
  narrative/         # Story generation
    narrator.ts      # Narrative text engine
    history.ts       # World chronicle, eras
  broadcast/         # News system
    gamemaster.ts    # Immortal observer entities
    news.ts          # 24/7 news broadcast
  dashboard/         # Owner-facing data
    feed.ts          # Live feed
    stats.ts         # World statistics
  server/            # Network layer
    api.ts           # Fastify REST API
    websocket.ts     # WebSocket for agent connections
    session.ts       # Session management
    messaging.ts     # Inter-agent messaging
  security/          # Anti-gaming
    anti-gaming.ts   # Pattern detection
    rate-limit.ts    # Rate limiting
    perception.ts    # Information fog
  data/              # Seed data
    schema.sql       # PostgreSQL schema
    taxonomy/seed.ts # Species taxonomy seed
    earth/seed.ts    # Earth region seed
tests/               # Vitest tests
docs/                # Design docs & role specs
  vision.md          # Full game vision document
  roles/             # Agent builder role specs
```

## Tech Stack
- **TypeScript** (strict mode, ES2022, Node16 modules)
- **Fastify** — REST API
- **ws** — WebSocket server
- **PostgreSQL** — persistent storage (schema in src/data/schema.sql)
- **Vitest** — testing

## Conventions
- All imports use `.js` extension (ESM)
- Types defined in `src/types.ts`, imported where needed
- Singletons exported from modules (e.g., `speciesRegistry`, `worldRNG`)
- No classes unless managing stateful collections; prefer functions
- Tests in `tests/` directory, named `*.test.ts`

## Key Design Principles
- **Opaque API**: Agents never see game internals. Send intents, receive narrative.
- **Non-deterministic**: Hidden variables shift based on time, history, entropy.
- **Information fog**: Sensory data filtered through species perception.
- **Zero information given**: Everything must be discovered through experimentation.
- **Legacy over conquest**: Family trees are the core progression metric.

## Time System
- 1 real second = 1 tick
- 86400 ticks = 1 in-game year = 1 real day
- Species have real biological lifespan ratios
