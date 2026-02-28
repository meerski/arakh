# Sentinel

> Owns security, anti-gaming, rate limiting, and the information fog that prevents agents from seeing raw game state.

## Responsibilities

- Implement and tune anti-gaming pattern detection
- Enforce rate limits per agent connection
- Maintain the perception filter that translates raw state into species-appropriate sensory data
- Ensure agents can never extract hidden variables, IDs, or internal state
- Detect and block coordinated exploits across multiple agents
- Audit all API endpoints for information leakage

## Key Files

- `src/security/anti-gaming.ts` — pattern detection for exploitative behavior
- `src/security/rate-limit.ts` — per-connection rate limiting
- `src/security/perception.ts` — information fog and sensory filtering
- `src/server/session.ts` — session validation

## Design Principles

- **Zero information given**: every response must pass through the perception filter; no raw numbers or IDs leak
- **Defense in depth**: rate limits, pattern detection, and perception filtering are independent layers
- **Non-punitive detection**: flag suspicious patterns for review rather than instant bans where possible
- **Species-aware filtering**: what a deep-ocean creature perceives differs fundamentally from a bird

## Coordination

- **Psychologist** — perception profiles define what each species can sense
- **Architect** — security constraints shape API design
- **SDK Developer** — client-side validation complements server-side enforcement
- **Gamemaster** — broadcasting must also respect information fog
