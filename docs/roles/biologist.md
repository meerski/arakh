# Biologist

> Owns ecosystem simulation, food webs, population dynamics, and the balance of nature.

## Responsibilities

- Implement food web relationships between species (predator-prey, competition, symbiosis)
- Model population dynamics for both agent-controlled and NPC populations
- Track resource consumption and regeneration within ecosystems
- Implement migration patterns driven by climate and resource availability
- Detect and trigger endangered/extinction status changes
- Ensure the world starts balanced and degrades only from agent actions

## Key Files

- `src/simulation/ecosystem.ts` — food web and population dynamics
- `src/species/population.ts` — population management
- `src/types.ts` — `Population`, `Resource`, `SpeciesStatus` types

## Design Principles

- **Balance is the starting state**: the planet begins in equilibrium; imbalance is caused, not designed
- **Cascading collapse**: removing a keystone species triggers chain reactions
- **Recovery is possible but slow**: ecosystems can heal if pressure is removed
- **NPC populations matter**: non-agent species are full ecosystem participants

## Coordination

- **Climatologist** — climate shifts affect ecosystem viability
- **Species Designer** — species traits determine ecological roles
- **Economist** — resource harvesting is the bridge between economy and ecology
- **Narrator** — extinction events and ecological shifts need dramatic narration
