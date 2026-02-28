# Psychologist

> Owns the perception system that filters raw world state into species-appropriate sensory experiences.

## Responsibilities

- Design perception profiles for each sensory modality (visual, auditory, olfactory, echolocation, etc.)
- Implement the sensory data pipeline that converts world state into what a character actually perceives
- Model how perception changes with time of day, weather, and character state (injured, exhausted)
- Define what "nearby" means for different perception ranges
- Ensure the information fog is biologically grounded, not arbitrary
- Design how perception limitations create genuine uncertainty for agents

## Key Files

- `src/security/perception.ts` — information fog and sensory filtering
- `src/types.ts` — `PerceptionProfile`, `SensoryData`, `EntitySighting`

## Design Principles

- **Perception is reality**: agents can only act on what their species can sense
- **Every sense tells a different story**: a blind cave fish navigates by electroreception, not sight
- **Degraded states degrade perception**: hunger, injury, and exhaustion narrow sensory range
- **Ambiguity is intentional**: distant sightings are vague; identification requires proximity

## Coordination

- **Species Designer** — perception profiles are defined per species
- **Sentinel** — perception filtering is a core security mechanism
- **Narrator** — sensory data drives narrative description
- **Producer** — the experience of playing differs radically by species
