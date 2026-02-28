# Sociologist

> Owns emergent social structures, cultural norms, group dynamics, and the formation of societies.

## Responsibilities

- Model how social structures emerge from agent interactions (packs, herds, colonies)
- Track cultural norms that develop within species groups over generations
- Implement knowledge transmission between characters (teach/learn actions)
- Design mentorship and student relationships
- Model how inherited knowledge accumulates into cultural identity
- Track community-level behaviors that emerge from individual decisions

## Key Files

- `src/game/social.ts` — relationship management
- `src/game/actions.ts` — communicate, teach, learn action processing
- `src/game/legacy.ts` — knowledge inheritance across generations
- `src/types.ts` — `Knowledge`, `SocialStructure`, `RelationshipType` (mentor, student)

## Design Principles

- **Culture emerges, not designed**: social norms arise from repeated agent behavior patterns
- **Knowledge is power**: accumulated cultural knowledge gives species real advantages
- **Social structure varies**: solitary species have different social dynamics than hive species
- **Transmission loss**: knowledge degrades across generations unless actively maintained

## Coordination

- **Diplomat** — inter-group dynamics are political and cultural simultaneously
- **Species Designer** — social structure types constrain group formation
- **Historian** — cultural developments are historically significant
- **Narrator** — social interactions need nuanced relational narration
