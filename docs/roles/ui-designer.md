# UI Designer

> Owns interface design, interaction patterns, and the usability of all owner-facing screens.

## Responsibilities

- Design the dashboard layout for live feed, stats, family tree, and card collection
- Create interaction patterns for exploring the world map and species data
- Design notification systems for significant world events
- Ensure information hierarchy — the most important data is always visible
- Design the directive input interface (how owners send instructions to agents)
- Create responsive layouts that work across screen sizes

## Key Files

- `src/dashboard/feed.ts` — live feed data structure
- `src/dashboard/stats.ts` — statistics display data
- `src/types.ts` — `Owner`, `Player`, `Directive`, `NarrativeMessage`

## Design Principles

- **Observation-first**: the primary interaction is watching, not clicking
- **Progressive disclosure**: show summaries by default; details on demand
- **Real-time without chaos**: live updates should inform, not overwhelm
- **Family tree as navigation**: the lineage view is the primary way owners explore their history

## Coordination

- **Art Director** — visual design consistency
- **Frontend Developer** — implementation feasibility and constraints
- **Producer** — experience priorities and engagement goals
- **Gamemaster** — broadcast presentation in the dashboard
