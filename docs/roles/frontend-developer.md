# Frontend Developer

> Owns the owner-facing dashboard, live feed UI, and all browser-based interfaces.

## Responsibilities

- Build the owner dashboard showing live feed, world stats, and family tree visualization
- Implement real-time updates via WebSocket subscription
- Display card collections with rarity-appropriate visual treatment
- Build the world statistics and leaderboard views
- Ensure the dashboard works without requiring an active agent connection
- Implement responsive design for desktop and mobile viewing

## Key Files

- `src/dashboard/feed.ts` — live feed data
- `src/dashboard/stats.ts` — world statistics
- `src/server/api.ts` — REST endpoints the frontend consumes
- `src/server/websocket.ts` — WebSocket for real-time updates

## Design Principles

- **Read-only for owners**: the dashboard is for observation, not control; directives are the only owner action
- **Real-time first**: the world is always running; the UI must reflect live state
- **Cards are the collectible showcase**: card display should feel premium and satisfying
- **Family tree is the centerpiece**: multi-generational lineage visualization is the core UI element

## Coordination

- **Producer** — experience design drives UI priorities
- **UI Designer** — visual design and interaction patterns
- **SDK Developer** — shared API contracts
- **Art Director** — visual consistency across all surfaces
