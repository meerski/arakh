// ============================================================
// PostgreSQL Connection Pool & Query Helpers
// ============================================================

import pg from 'pg';

const { Pool } = pg;

export interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;            // Max pool connections (default 10)
  idleTimeoutMillis?: number;
}

let pool: pg.Pool | null = null;

/** Initialize the connection pool. Call once at startup. */
export function initDb(config?: DbConfig): pg.Pool {
  if (pool) return pool;

  const connectionString = config?.connectionString
    ?? process.env.DATABASE_URL
    ?? 'postgresql://localhost:5432/arakh';

  pool = new Pool({
    connectionString,
    host: config?.host,
    port: config?.port,
    database: config?.database,
    user: config?.user,
    password: config?.password,
    max: config?.max ?? 10,
    idleTimeoutMillis: config?.idleTimeoutMillis ?? 30000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });

  return pool;
}

/** Get the current pool (throws if not initialized). */
export function getPool(): pg.Pool {
  if (!pool) throw new Error('Database pool not initialized. Call initDb() first.');
  return pool;
}

/** Execute a parameterized query. */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  const p = getPool();
  return p.query<T>(text, params);
}

/** Execute a query within a transaction. */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Gracefully close the pool. Call on shutdown. */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** Check database connectivity. */
export async function pingDb(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/** Run schema migrations (idempotent). */
export async function ensureSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id SERIAL PRIMARY KEY,
      tick BIGINT NOT NULL,
      version INT NOT NULL DEFAULT 2,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_tick ON snapshots(tick DESC);

    -- Keep only the latest N snapshots (cleanup handled by persistence layer)
  `);
}
