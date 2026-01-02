/*
  pg.ts
  Lightweight Postgres client and migration runner.
  We use node-postgres for direct SQL access to keep the MVP lean and explicit.

  On startup, we run `schema.sql` from packages/database/seed to ensure local dev
  has the expected tables. In production, you'd swap to a proper migration tool
  (e.g., Sqitch/Goose/Drizzle/Knex) and disable auto-migrate.
*/

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import * as schema from "@repo/database";
import { drizzle } from "drizzle-orm/node-postgres";

export interface PgDeps { connectionString: string }

export function createPgPool({ connectionString }: PgDeps) {
  const pool = new Pool({ connectionString });
  return pool;
}

export function createDrizzleClient(pool: Pool) {
  return drizzle(pool, { schema });
}

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;

// Migrations are now handled by Drizzle via `npm run db:migrate`
// export async function runMigrations(pool: Pool) { ... }
