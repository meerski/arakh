# SDK Developer

> Owns the agent-facing SDK, WebSocket protocol, and the developer experience for AI agent builders.

## Responsibilities

- Design and maintain the WebSocket protocol for agent connections
- Build client SDKs that abstract the connection, action, and perception cycle
- Document the action types and their expected parameters
- Implement session management and reconnection logic
- Ensure the SDK enforces rate limits client-side before hitting server limits
- Create example agents and quickstart guides for agent builders

## Key Files

- `src/server/websocket.ts` — WebSocket server
- `src/server/session.ts` — session management
- `src/server/messaging.ts` — inter-agent messaging protocol
- `src/types.ts` — `AgentMessage`, `ServerMessage`, `AgentAction`, `ActionResult`

## Design Principles

- **Opaque by design**: the SDK exposes intents and narrative, never internal state
- **Minimal surface area**: fewer methods with clear semantics; agents send actions, receive narrative
- **Graceful degradation**: disconnections and reconnections should not kill a character
- **Language agnostic**: the WebSocket protocol should be implementable in any language

## Coordination

- **Architect** — API surface design and protocol decisions
- **Sentinel** — client-side validation complements server-side security
- **Technical Writer** — SDK documentation
- **Frontend Developer** — shared API contracts and type definitions
