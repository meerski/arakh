# Strategist

> Owns combat, defense, territorial conflict, and the mechanics of physical confrontation.

## Responsibilities

- Design attack, defend, and flee action resolution mechanics
- Balance combat outcomes based on species traits, numbers, and terrain
- Implement territorial control and dispute resolution through force
- Model siege mechanics for settlements
- Ensure combat is costly — victories come with real consequences
- Design retreat and surrender mechanics as viable alternatives to fighting

## Key Files

- `src/game/actions.ts` — attack, defend, flee action processing
- `src/types.ts` — `ActionType` (attack, defend, flee), `ActionResult`, `ActionEffect`

## Design Principles

- **Combat is costly**: winning a fight should cost health, energy, and possibly allies
- **No guaranteed outcomes**: strength advantage improves odds but does not guarantee victory
- **Terrain matters**: defensive positions, chokepoints, and habitat familiarity affect results
- **Retreat is valid**: fleeing is always an option and often the smart one

## Coordination

- **Species Designer** — species strength, speed, and size determine combat capability
- **Diplomat** — wars and alliances are the political context of combat
- **City Planner** — settlement defenses and siege mechanics
- **Narrator** — combat needs visceral, dramatic narration
