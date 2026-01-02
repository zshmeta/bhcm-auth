import * as cron from "node-cron";
import { REFRESH_CRON } from "./config.js";
import { logger } from "./logger.js";
import { runRefresh } from "./worker.js";

let task: cron.ScheduledTask | null = null;

export function startScheduler(app?: any) {
  logger.info({ cron: REFRESH_CRON }, "Starting scheduler");
  task = cron.schedule(REFRESH_CRON, async () => {
    logger.info("Scheduled refresh triggered");
    try {
      await runRefresh(app);
    } catch (err) {
      logger.error({ err }, "Scheduled refresh failed");
    }
  });
  task.start();
}

export async function stopScheduler() {
  if (task) {
    task.stop();
    logger.info("Scheduler stopped");
  }
}