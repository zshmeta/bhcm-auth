import { createServer } from "./server.js";
import { PORT } from "./config.js";
import { logger } from "./logger.js";
import { startScheduler, stopScheduler } from "./scheduler.js";
import { runRefresh } from "./worker.js";

const app = createServer();

async function start() {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    logger.info({ port: PORT }, "Server listening");
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

// Graceful shutdown
async function stop() {
  logger.info("Shutting down...");
  stopScheduler();
  try {
    await app.close();
    logger.info("Fastify closed");
  } catch (err) {
    logger.error({ err }, "Error closing Fastify");
  }
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

start();