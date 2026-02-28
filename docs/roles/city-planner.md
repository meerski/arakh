# City Planner

> Owns settlement formation, infrastructure, territorial control, and the emergent development of communities.

## Responsibilities

- Define how groups of characters establish and grow settlements
- Design infrastructure mechanics (shelters, storage, defenses)
- Model territorial boundaries and disputes between species or factions
- Implement settlement events (founding, growth, siege, abandonment)
- Balance settlement benefits against resource drain on the surrounding region
- Track settlement-level statistics (population, prosperity, defense)

## Key Files

- `src/simulation/world.ts` — region state that settlements modify
- `src/simulation/events.ts` — settlement-related events
- `src/types.ts` — `Region`, `Population`, `WorldEvent` (settlement event type)

## Design Principles

- **Emergent urbanism**: settlements arise from agent behavior, not from designer placement
- **Resource pressure**: settlements consume local resources; overbuilding leads to collapse
- **Multi-species settlements**: nothing prevents cross-species communities if agents cooperate
- **Defensibility vs. accessibility**: settlement location involves real trade-offs

## Coordination

- **Cartographer** — region resources and connections constrain settlement viability
- **Economist** — trade routes connect settlements; prosperity depends on economy
- **Diplomat** — territorial disputes and alliances shape settlement politics
- **Strategist** — military defense and siege mechanics
