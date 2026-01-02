import { Redis } from "ioredis";
import pg from "pg";
import { REDIS_URL, DATABASE_URL } from "./config.js";
import { logger } from "./logger.js";

const redis = new Redis(REDIS_URL);
const pool = new pg.Pool({ connectionString: DATABASE_URL });

export async function saveSnapshot(data: any) {
  try {
    await redis.set("market:prices", JSON.stringify(data));
    logger.info("Saved snapshot to Redis");
  } catch (err) {
    logger.error({ err }, "Failed to save snapshot to Redis");
  }
}

export async function appendHistory(data: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const categories = Object.keys(data);
    for (const cat of categories) {
      const symbols = Object.keys(data[cat]);
      for (const sym of symbols) {
        const item = data[cat][sym];
        if (item.error) continue;

        await client.query(
          `INSERT INTO market_prices (symbol, price, currency, source, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            item.symbol,
            item.price || 0,
            item.currency,
            item.source,
            JSON.stringify(item)
          ]
        );
      }
    }

    await client.query("COMMIT");
    logger.info("Appended history to Postgres");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ err }, "Failed to append history to Postgres");
  } finally {
    client.release();
  }
}

export async function cleanupHistory() {
  // Postgres handles retention via separate jobs or partitions usually.
  // For now, we can implement a simple delete query.
  // skipping for MVP as per plan focus on storage.
}

export async function loadSnapshot() {
  try {
    const raw = await redis.get("market:prices");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn({ err }, "Failed to load snapshot from Redis");
    return null;
  }
}