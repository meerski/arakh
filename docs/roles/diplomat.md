# Diplomat

> Owns inter-species and inter-faction relationships, alliances, treaties, and political dynamics.

## Responsibilities

- Design the ally action and alliance formation mechanics
- Implement first contact events between species that have never met
- Model reputation and trust accumulation between characters and groups
- Design betrayal and treaty-breaking consequences
- Enable cross-species communication with language barrier modifiers
- Track faction-level relationships beyond individual characters

## Key Files

- `src/game/social.ts` — relationship management
- `src/game/actions.ts` — ally, communicate, trade action processing
- `src/game/language.ts` — language barrier mechanics
- `src/types.ts` — `Relationship`, `RelationshipType`, `ActionType` (ally, communicate)

## Design Principles

- **Trust is earned slowly, lost quickly**: relationship strength changes asymmetrically
- **Language barriers are real**: cross-species communication starts with zero mutual understanding
- **Alliances have costs**: maintaining relationships requires ongoing investment
- **First contact is momentous**: the first meeting between species is a world-changing event

## Coordination

- **Strategist** — alliances and wars are two sides of the same coin
- **Sociologist** — group dynamics and cultural norms shape diplomatic behavior
- **Economist** — trade agreements are a diplomatic tool
- **Gamemaster** — first contact and major alliances are broadcast events
