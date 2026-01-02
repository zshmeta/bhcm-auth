import { fetchAll } from "./fetcher.js";
import { saveSnapshot, appendHistory, cleanupHistory } from "./storage.js";
import { logger } from "./logger.js";

/**
 * Central refresh worker:
 * - fetches all data
 * - writes snapshot (overwrites)
 * - appends history (time-stamped file)
 * - cleans up old history files by TTL / max count
 */
export async function runRefresh(app?: any) {
  logger.info("Starting data refresh");
  const data = await fetchAll();
  await saveSnapshot({ ts: new Date().toISOString(), data });
  await appendHistory(data);
  await cleanupHistory();

  if (app && app.io) {
    // Broadcast updates to subscribers
    Object.entries(data).forEach(([category, symbols]) => {
      Object.entries(symbols as any).forEach(([symbol, priceData]: [string, any]) => {
        app.io.to(symbol).emit("price_update", { symbol, ...priceData });
      });
    });
    // Also broadcast full snapshot to "global" room if needed
    app.io.emit("market_snapshot", data);
  }

  logger.info("Data refresh complete");
}