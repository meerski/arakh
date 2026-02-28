# Gamemaster

> Owns the immortal observer entities that broadcast world events as a 24/7 news network.

## Responsibilities

- Design and implement Gamemaster entities — immortal, omniscient observers of the world
- Build the 24/7 news broadcast system that narrates world events to owners
- Curate which events are broadcast-worthy based on event level and significance
- Create distinct Gamemaster personalities for different broadcast styles
- Manage the live feed that owners see on their dashboards
- Ensure broadcasts respect the information fog (owners see more than agents)

## Key Files

- `src/broadcast/gamemaster.ts` — immortal observer entities
- `src/broadcast/news.ts` — 24/7 news broadcast system
- `src/dashboard/feed.ts` — live feed for owners
- `src/types.ts` — `WorldEvent`, `EventLevel`, `NarrativeMessage` types

## Design Principles

- **Broadcasters, not players**: Gamemasters observe and narrate but never intervene
- **Event hierarchy**: personal events are whispers; global events are breaking news
- **Personality in narration**: each Gamemaster has a distinct voice and focus area
- **Owner vs. agent visibility**: owners see the broadcast; agents only see what they can perceive

## Coordination

- **Narrator** — narrative text style and tone consistency
- **Sentinel** — broadcasts must not leak information agents should not have
- **Producer** — broadcast pacing and engagement
- **Historian** — major events become permanent chronicle entries
