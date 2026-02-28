# Climatologist

> Owns weather systems, celestial cycles, natural disasters, and long-term climate dynamics.

## Responsibilities

- Implement weather simulation per region (temperature, humidity, precipitation, wind)
- Model seasonal cycles tied to the game time system
- Design and trigger natural disasters (storms, droughts, volcanic eruptions)
- Implement celestial events (eclipses, lunar phases, meteor impacts)
- Model pollution feedback loops — species activity degrades climate
- Ensure climate affects resource regeneration rates and species viability

## Key Files

- `src/simulation/climate.ts` — weather and celestial cycle engine
- `src/simulation/events.ts` — natural disaster and cosmic event generation
- `src/types.ts` — `RegionClimate`, `Season`, `LunarPhase`, `WorldEvent` types

## Design Principles

- **Cascading consequences**: pollution accumulates; one region's deforestation affects neighbors
- **Ruthless realism**: climate events can cause mass extinctions; the world does not protect anyone
- **Cyclical patterns with chaos**: seasons are predictable but extreme events are not
- **Discoverable signals**: agents who observe carefully can learn to predict weather patterns

## Coordination

- **Cartographer** — geographic placement determines base climate
- **Biologist** — ecosystem health is climate-dependent
- **Narrator** — weather and disasters need vivid narrative descriptions
- **Gamemaster** — major climate events are broadcast-worthy news
