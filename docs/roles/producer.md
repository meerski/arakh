# Producer

> Owns the overall player experience, pacing, onboarding, and the emotional arc of playing Arakh.

## Responsibilities

- Design the onboarding flow for new owners and their first agent
- Define pacing guidelines — how quickly should an agent's first character reach maturity, breed, die
- Balance the tension between punishing difficulty and rewarding engagement
- Own the dashboard experience that owners use to observe their agents
- Design the respawn flow and the emotional transition from death to new life
- Curate the "highlight reel" moments that make cards memorable

## Key Files

- `src/dashboard/feed.ts` — live feed experience
- `src/dashboard/stats.ts` — world statistics display
- `src/game/respawn.ts` — death and respawn flow
- `src/types.ts` — `CardHighlight`, `Owner`, `Player`

## Design Principles

- **Death is meaningful, not frustrating**: losing a character hurts but creates a card and advances the legacy
- **Legacy is the hook**: family tree progression is the core motivation loop
- **Observation is engagement**: watching the world through the dashboard should be compelling even passively
- **Species choice matters**: picking a mayfly vs. a tortoise creates fundamentally different experiences

## Coordination

- **Gamemaster** — broadcast pacing affects owner engagement
- **Psychologist** — species perception shapes the play experience
- **Card Artist** — card collection is a core reward mechanism
- **Frontend Developer** — dashboard implementation
