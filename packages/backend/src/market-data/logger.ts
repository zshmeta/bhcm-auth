import { LOG_LEVEL } from "./config.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[currentLevel];
}

function formatMessage(level: string, meta: Record<string, unknown> | string, msg?: string): string {
  const timestamp = new Date().toISOString();
  if (typeof meta === "string") {
    return `${timestamp} [${level.toUpperCase()}] ${meta}`;
  }
  const metaStr = JSON.stringify(meta);
  return `${timestamp} [${level.toUpperCase()}] ${msg || ""} ${metaStr}`;
}

// Pino-compatible logger interface: logger.info({ key: value }, "message") or logger.info("message")
export const logger = {
  debug: (metaOrMsg: Record<string, unknown> | string, msg?: string) => {
    if (shouldLog("debug")) console.debug(formatMessage("debug", metaOrMsg, msg));
  },
  info: (metaOrMsg: Record<string, unknown> | string, msg?: string) => {
    if (shouldLog("info")) console.info(formatMessage("info", metaOrMsg, msg));
  },
  warn: (metaOrMsg: Record<string, unknown> | string, msg?: string) => {
    if (shouldLog("warn")) console.warn(formatMessage("warn", metaOrMsg, msg));
  },
  error: (metaOrMsg: Record<string, unknown> | string, msg?: string) => {
    if (shouldLog("error")) console.error(formatMessage("error", metaOrMsg, msg));
  },
};
