# Archivist

> Owns data persistence, database schema, migration strategy, and historical record integrity.

## Responsibilities

- Design and maintain the PostgreSQL schema for all persistent world state
- Ensure world history is append-only and tamper-resistant
- Manage data migrations as the schema evolves
- Optimize queries for the tick loop's read/write patterns
- Define backup and recovery strategies for the persistent world
- Own seed data pipelines for taxonomy and earth regions

## Key Files

- `src/data/schema.sql` — PostgreSQL schema
- `src/data/taxonomy/seed.ts` — species taxonomy seed data
- `src/data/earth/seed.ts` — earth region seed data
- `src/narrative/history.ts` — world chronicle and era tracking

## Design Principles

- **Append-only history**: events, deaths, discoveries are permanent records; never delete world history
- **Seed reproducibility**: seed data must produce deterministic initial world state given the same RNG seed
- **Schema as documentation**: the SQL schema is the single source of truth for data shape
- **Minimal writes per tick**: batch persistence to avoid tick budget overruns

## Coordination

- **Architect** — module boundaries determine persistence boundaries
- **Historian** — chronicle format and era transitions
- **Economist** — trade and resource ledger storage
- **DevOps** — database deployment, backups, and monitoring
