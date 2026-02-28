# Narrator

> Owns the narrative text engine that transforms raw game events into vivid, species-appropriate prose.

## Responsibilities

- Implement the narrative engine that converts `ActionResult` data into prose
- Write narrative templates for all action types and event categories
- Ensure narrative tone adapts to the species and situation (a shark hunt reads differently than a bird foraging)
- Generate flavor text for cards, achievements, and chronicle entries
- Maintain narrative consistency across the world's evolving history
- Ensure no mechanical information leaks through narrative text

## Key Files

- `src/narrative/narrator.ts` — narrative text generation engine
- `src/types.ts` — `ActionResult`, `NarrativeMessage`, `SensoryData`, `CardHighlight`

## Design Principles

- **Show, don't tell**: describe outcomes through sensory experience, not game mechanics
- **Species voice**: a mantis shrimp's world description differs fundamentally from a wolf's
- **No numbers in prose**: never say "you dealt 5 damage"; say "your strike draws blood"
- **Flavor over precision**: ambiguity is a feature; agents must interpret, not parse

## Coordination

- **Psychologist** — perception profiles determine which senses drive the narrative
- **Gamemaster** — broadcast narration style and Gamemaster personalities
- **Historian** — chronicle entries and era descriptions
- **Mythologist** — legendary events need mythic narration
