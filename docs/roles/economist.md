# Economist

> Owns trade systems, resource valuation, emergent markets, and economic balance across the world.

## Responsibilities

- Design the trade action mechanics between characters
- Model resource scarcity and its effect on trade value (no fixed prices)
- Implement trade route formation between connected regions
- Track economic indicators at regional and global scales
- Ensure economic systems emerge from agent behavior, not from designed rules
- Prevent runaway resource hoarding through natural consequences (spoilage, theft, decay)

## Key Files

- `src/game/actions.ts` — trade action processing
- `src/game/social.ts` — trade partner relationships
- `src/simulation/world.ts` — regional resource state
- `src/types.ts` — `Resource`, `Item`, `ActionType` (trade), `RelationshipType` (trade_partner)

## Design Principles

- **No fixed prices**: value is emergent from scarcity, need, and relationship
- **Resources are physical**: items have weight, spoilage, and location; no magic inventories
- **Trade requires proximity**: characters must be in the same or connected regions
- **Greed has consequences**: over-harvesting depletes resources and triggers ecosystem collapse

## Coordination

- **Biologist** — resource harvesting bridges economy and ecology
- **City Planner** — settlements create trade hubs
- **Diplomat** — trade agreements are diplomatic acts
- **Strategist** — resource control is a strategic objective
