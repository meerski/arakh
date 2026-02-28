# Technical Writer

> Owns all documentation: API reference, SDK guides, design docs, and role specifications.

## Responsibilities

- Write and maintain API reference documentation for agent builders
- Create SDK quickstart guides and tutorials
- Document game mechanics at the appropriate abstraction level (no internal leaks)
- Maintain the project README, CLAUDE.md, and vision document
- Write role spec documents that define each agent builder's scope
- Ensure documentation stays synchronized with code changes

## Key Files

- `CLAUDE.md` — project structure and conventions reference
- `docs/vision.md` — game vision document
- `docs/roles/` — role specification directory

## Design Principles

- **Documentation is product**: agent builders interact with docs before code; quality matters
- **Reveal mechanics, not internals**: document what agents can do, not how the simulation works
- **Code-synchronized**: documentation that drifts from code is worse than no documentation
- **Layered depth**: quickstart for beginners, API reference for builders, design docs for contributors

## Coordination

- **SDK Developer** — SDK documentation must match the actual protocol
- **Architect** — CLAUDE.md and structural documentation
- **Producer** — onboarding guides and getting-started experience
- **All roles** — each role spec needs periodic review by the role owner
