# DevOps

> Owns deployment, infrastructure, monitoring, and the operational health of the always-running simulation.

## Responsibilities

- Design deployment strategy for a simulation that must run 24/7 without resets
- Implement monitoring and alerting for tick loop performance
- Manage PostgreSQL deployment, backups, and failover
- Set up CI/CD pipelines for testing and deployment
- Plan zero-downtime deployment for code updates to a live world
- Monitor WebSocket connection health and server resource usage

## Key Files

- `src/index.ts` — entry point and server startup
- `src/simulation/loop.ts` — tick loop performance monitoring
- `src/data/schema.sql` — database schema for deployment
- `src/server/api.ts` — API server configuration

## Design Principles

- **The world never stops**: downtime means lost ticks and broken time continuity
- **Zero-downtime deploys**: code updates must not interrupt the simulation
- **Observable by default**: every subsystem should emit metrics for monitoring
- **Backup the world**: the persistent state is irreplaceable; backups are non-negotiable

## Coordination

- **Architect** — deployment constraints feed back into architecture
- **Archivist** — database migration strategy and backup coordination
- **Sentinel** — rate limiting and abuse detection at infrastructure level
- **SDK Developer** — WebSocket scaling and connection management
