# Historian

> Owns the world chronicle, era tracking, and the permanent historical record of all significant events.

## Responsibilities

- Implement the chronicle system that records world-significant events
- Define era transitions and what triggers a new era
- Track dominant species per era and the rise and fall of civilizations
- Maintain a searchable history of discoveries, extinctions, and wars
- Generate historical summaries for different time scales (decade, century, era)
- Ensure history is append-only and tamper-proof

## Key Files

- `src/narrative/history.ts` — world chronicle and era management
- `src/types.ts` — `Era`, `WorldEvent`, `EventLevel`, `EventType`

## Design Principles

- **History is written by what happened**: no predetermined narrative arcs
- **Eras emerge naturally**: a new era begins when the world fundamentally changes
- **Multiple perspectives**: the same event looks different from different species' viewpoints
- **Permanence**: once recorded, history cannot be rewritten

## Coordination

- **Archivist** — historical data persistence and query patterns
- **Narrator** — chronicle entries need compelling prose
- **Mythologist** — legendary events blur the line between history and myth
- **Gamemaster** — era transitions are major broadcast events
